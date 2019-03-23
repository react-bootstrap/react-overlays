/* eslint-disable react/prop-types */

import activeElement from 'dom-helpers/activeElement';
import contains from 'dom-helpers/query/contains';
import canUseDom from 'dom-helpers/util/inDOM';
import listen from 'dom-helpers/events/listen';
import PropTypes from 'prop-types';
import componentOrElement from 'prop-types-extra/lib/componentOrElement';
import elementType from 'prop-types-extra/lib/elementType';
import React from 'react';
import ReactDOM from 'react-dom';

import ModalManager from './ModalManager';
import Portal from './Portal';
import getContainer from './utils/getContainer';
import ownerDocument from './utils/ownerDocument';

let modalManager = new ModalManager();

function omitProps(props, propTypes) {
  const keys = Object.keys(props);
  const newProps = {};
  keys.map(prop => {
    if (!Object.prototype.hasOwnProperty.call(propTypes, prop)) {
      newProps[prop] = props[prop];
    }
  });

  return newProps;
}

/**
 * Love them or hate them, `<Modal />` provides a solid foundation for creating dialogs, lightboxes, or whatever else.
 * The Modal component renders its `children` node in front of a backdrop component.
 *
 * The Modal offers a few helpful features over using just a `<Portal/>` component and some styles:
 *
 * - Manages dialog stacking when one-at-a-time just isn't enough.
 * - Creates a backdrop, for disabling interaction below the modal.
 * - It properly manages focus; moving to the modal content, and keeping it there until the modal is closed.
 * - It disables scrolling of the page content while open.
 * - Adds the appropriate ARIA roles are automatically.
 * - Easily pluggable animations via a `<Transition/>` component.
 *
 * Note that, in the same way the backdrop element prevents users from clicking or interacting
 * with the page content underneath the Modal, Screen readers also need to be signaled to not to
 * interact with page content while the Modal is open. To do this, we use a common technique of applying
 * the `aria-hidden='true'` attribute to the non-Modal elements in the Modal `container`. This means that for
 * a Modal to be truly modal, it should have a `container` that is _outside_ your app's
 * React hierarchy (such as the default: document.body).
 */
class Modal extends React.Component {
  static propTypes = {
    /**
     * Set the visibility of the Modal
     */
    show: PropTypes.bool,

    /**
     * A Node, Component instance, or function that returns either. The Modal is appended to it's container element.
     *
     * For the sake of assistive technologies, the container should usually be the document body, so that the rest of the
     * page content can be placed behind a virtual backdrop as well as a visual one.
     */
    container: PropTypes.oneOfType([componentOrElement, PropTypes.func]),

    /**
     * A callback fired when the Modal is opening.
     */
    onShow: PropTypes.func,

    /**
     * A callback fired when either the backdrop is clicked, or the escape key is pressed.
     *
     * The `onHide` callback only signals intent from the Modal,
     * you must actually set the `show` prop to `false` for the Modal to close.
     */
    onHide: PropTypes.func,

    /**
     * Include a backdrop component.
     */
    backdrop: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(['static']),
    ]),

    /**
     * A function that returns the dialog component. Useful for custom
     * rendering. **Note:** the component should make sure to apply the provided ref.
     *
     * ```js
     *  renderDialog={props => <MyDialog {...props} />}
     * ```
     */
    renderDialog: PropTypes.func,

    /**
     * A function that returns a backdrop component. Useful for custom
     * backdrop rendering.
     *
     * ```js
     *  renderBackdrop={props => <MyBackdrop {...props} />}
     * ```
     */
    renderBackdrop: PropTypes.func,

    /**
     * A callback fired when the escape key, if specified in `keyboard`, is pressed.
     */
    onEscapeKeyDown: PropTypes.func,

    /**
     * A callback fired when the backdrop, if specified, is clicked.
     */
    onBackdropClick: PropTypes.func,

    /**
     * A css class or set of classes applied to the modal container when the modal is open,
     * and removed when it is closed.
     */
    containerClassName: PropTypes.string,

    /**
     * Close the modal when escape key is pressed
     */
    keyboard: PropTypes.bool,

    /**
     * A `react-transition-group@2.0.0` `<Transition/>` component used
     * to control animations for the dialog component.
     */
    transition: elementType,

    /**
     * A `react-transition-group@2.0.0` `<Transition/>` component used
     * to control animations for the backdrop components.
     */
    backdropTransition: elementType,

    /**
     * When `true` The modal will automatically shift focus to itself when it opens, and
     * replace it to the last focused element when it closes. This also
     * works correctly with any Modal children that have the `autoFocus` prop.
     *
     * Generally this should never be set to `false` as it makes the Modal less
     * accessible to assistive technologies, like screen readers.
     */
    autoFocus: PropTypes.bool,

    /**
     * When `true` The modal will prevent focus from leaving the Modal while open.
     *
     * Generally this should never be set to `false` as it makes the Modal less
     * accessible to assistive technologies, like screen readers.
     */
    enforceFocus: PropTypes.bool,

    /**
     * When `true` The modal will restore focus to previously focused element once
     * modal is hidden
     */
    restoreFocus: PropTypes.bool,

    /**
     * Options passed to focus function when `restoreFocus` is set to `true`
     *
     * @link  https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#Parameters
     */
    restoreFocusOptions: PropTypes.shape({
      preventScroll: PropTypes.bool,
    }),

    /**
     * Callback fired before the Modal transitions in
     */
    onEnter: PropTypes.func,

    /**
     * Callback fired as the Modal begins to transition in
     */
    onEntering: PropTypes.func,

    /**
     * Callback fired after the Modal finishes transitioning in
     */
    onEntered: PropTypes.func,

    /**
     * Callback fired right before the Modal transitions out
     */
    onExit: PropTypes.func,

    /**
     * Callback fired as the Modal begins to transition out
     */
    onExiting: PropTypes.func,

    /**
     * Callback fired after the Modal finishes transitioning out
     */
    onExited: PropTypes.func,

    /**
     * A ModalManager instance used to track and manage the state of open
     * Modals. Useful when customizing how modals interact within a container
     */
    manager: PropTypes.object.isRequired,
  };

  static defaultProps = {
    show: false,
    role: 'dialog',
    backdrop: true,
    keyboard: true,
    autoFocus: true,
    enforceFocus: true,
    restoreFocus: true,
    restoreFocusOptions: {},
    onHide: () => {},
    manager: modalManager,
    renderBackdrop: props => <div {...props} />,
  };

  state = { exited: !this.props.show };

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.show) {
      return { exited: false };
    } else if (!nextProps.transition) {
      // Otherwise let handleHidden take care of marking exited.
      return { exited: true };
    }
    return null;
  }

  getSnapshotBeforeUpdate(prevProps) {
    if (canUseDom && !prevProps.show && this.props.show) {
      this.lastFocus = activeElement();
    }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.show) {
      this.onShow();
    }
  }

  componentDidUpdate(prevProps) {
    let { transition } = this.props;

    if (prevProps.show && !this.props.show && !transition) {
      // Otherwise handleHidden will call this.
      this.onHide();
    } else if (!prevProps.show && this.props.show) {
      this.onShow();
    }
  }

  componentWillUnmount() {
    let { show, transition } = this.props;

    this._isMounted = false;

    if (show || (transition && !this.state.exited)) {
      this.onHide();
    }
  }

  onPortalRendered = () => {
    if (this.props.onShow) {
      this.props.onShow();
    }
    // autofocus after onShow, to not trigger a focus event for previous
    // modals before this one is shown.
    this.autoFocus();
  };

  onShow = () => {
    let doc = ownerDocument(this);
    let container = getContainer(this.props.container, doc.body);

    this.props.manager.add(this, container, this.props.containerClassName);

    this.removeKeydownListener = listen(
      doc,
      'keydown',
      this.handleDocumentKeyDown,
    );

    this.removeFocusListener = listen(
      doc,
      'focus',
      // the timeout is necessary b/c this will run before the new modal is mounted
      // and so steals focus from it
      () => setTimeout(this.enforceFocus),
      true,
    );
  };

  onHide = () => {
    this.props.manager.remove(this);

    this.removeKeydownListener();
    this.removeFocusListener();

    if (this.props.restoreFocus) {
      this.restoreLastFocus(this.props.restoreFocusOption);
    }
  };

  setDialogRef = ref => {
    this.dialog = ref;
  };

  setBackdropRef = ref => {
    this.backdrop = ref && ReactDOM.findDOMNode(ref);
  };

  handleHidden = (...args) => {
    this.setState({ exited: true });
    this.onHide();

    if (this.props.onExited) {
      this.props.onExited(...args);
    }
  };

  handleBackdropClick = e => {
    if (e.target !== e.currentTarget) {
      return;
    }

    if (this.props.onBackdropClick) {
      this.props.onBackdropClick(e);
    }

    if (this.props.backdrop === true) {
      this.props.onHide();
    }
  };

  handleDocumentKeyDown = e => {
    if (this.props.keyboard && e.keyCode === 27 && this.isTopModal()) {
      if (this.props.onEscapeKeyDown) {
        this.props.onEscapeKeyDown(e);
      }

      this.props.onHide();
    }
  };

  autoFocus() {
    if (!this.props.autoFocus) return;

    const currentActiveElement = activeElement(ownerDocument(this));

    if (this.dialog && !contains(this.dialog, currentActiveElement)) {
      this.lastFocus = currentActiveElement;
      this.dialog.focus();
    }
  }

  restoreLastFocus(focusOptions) {
    // Support: <=IE11 doesn't support `focus()` on svg elements (RB: #917)
    if (this.lastFocus && this.lastFocus.focus) {
      this.lastFocus.focus(focusOptions);
      this.lastFocus = null;
    }
  }

  enforceFocus = () => {
    if (!this.props.enforceFocus || !this._isMounted || !this.isTopModal()) {
      return;
    }

    const currentActiveElement = activeElement(ownerDocument(this));

    if (this.dialog && !contains(this.dialog, currentActiveElement)) {
      this.dialog.focus();
    }
  };

  isTopModal() {
    return this.props.manager.isTopModal(this);
  }

  renderBackdrop = () => {
    let { renderBackdrop, backdropTransition: Transition } = this.props;

    let backdrop = renderBackdrop({
      ref: this.setBackdropRef,
      onClick: this.handleBackdropClick,
    });

    if (Transition) {
      backdrop = (
        <Transition appear in={this.props.show}>
          {backdrop}
        </Transition>
      );
    }

    return backdrop;
  };

  render() {
    const {
      show,
      container,
      children,
      renderDialog,
      role = 'dialog',
      transition: Transition,
      backdrop,
      className,
      style,
      onExit,
      onExiting,
      onEnter,
      onEntering,
      onEntered,
      ...props
    } = this.props;

    if (!(show || (Transition && !this.state.exited))) {
      return null;
    }

    const dialogProps = {
      role,
      ref: this.setDialogRef,
      // apparently only works on the dialog role element
      'aria-modal': role === 'dialog' ? true : undefined,
      ...omitProps(props, Modal.propTypes),
      style,
      className,
      tabIndex: '-1',
    };

    let dialog = renderDialog ? (
      renderDialog(dialogProps)
    ) : (
      <div {...dialogProps}>
        {React.cloneElement(children, { role: 'document' })}
      </div>
    );

    if (Transition) {
      dialog = (
        <Transition
          appear
          unmountOnExit
          in={show}
          onExit={onExit}
          onExiting={onExiting}
          onExited={this.handleHidden}
          onEnter={onEnter}
          onEntering={onEntering}
          onEntered={onEntered}
        >
          {dialog}
        </Transition>
      );
    }

    return (
      <Portal container={container} onRendered={this.onPortalRendered}>
        <>
          {backdrop && this.renderBackdrop()}
          {dialog}
        </>
      </Portal>
    );
  }
}

Modal.Manager = ModalManager;

export default Modal;
