/*eslint-disable react/prop-types */

import activeElement from 'dom-helpers/activeElement';
import contains from 'dom-helpers/query/contains';
import canUseDom from 'dom-helpers/util/inDOM';
import PropTypes from 'prop-types';
import componentOrElement from 'prop-types-extra/lib/componentOrElement';
import deprecated from 'prop-types-extra/lib/deprecated';
import elementType from 'prop-types-extra/lib/elementType';
import React, { cloneElement } from 'react';
import warning from 'warning';

import Portal from './Portal';
import ModalManager from './ModalManager';

import addEventListener from './utils/addEventListener';
import addFocusListener from './utils/addFocusListener';
import getContainer from './utils/getContainer';
import ownerDocument from './utils/ownerDocument';

let modalManager = new ModalManager();

/**
 * Love them or hate them, `<Modal/>` provides a solid foundation for creating dialogs, lightboxes, or whatever else.
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
    ...Portal.propTypes,

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
    container: PropTypes.oneOfType([
      componentOrElement,
      PropTypes.func
    ]),

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
      PropTypes.oneOf(['static'])
    ]),

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
     * Support for this function will be deprecated. Please use `onEscapeKeyDown` instead
     * A callback fired when the escape key, if specified in `keyboard`, is pressed.
     * @deprecated
     */
    onEscapeKeyUp: deprecated(
      PropTypes.func,
      'Please use onEscapeKeyDown instead for consistency'
    ),

    /**
     * A callback fired when the backdrop, if specified, is clicked.
     */
    onBackdropClick: PropTypes.func,

    /**
     * A style object for the backdrop component.
     */
    backdropStyle: PropTypes.object,

    /**
     * A css class or classes for the backdrop component.
     */
    backdropClassName: PropTypes.string,

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
  }

  static defaultProps = {
    show: false,
    backdrop: true,
    keyboard: true,
    autoFocus: true,
    enforceFocus: true,
    restoreFocus: true,
    onHide: ()=>{},
    manager: modalManager,
    renderBackdrop: (props) => <div {...props} />
  };

  omitProps(props, propTypes) {

    const keys = Object.keys(props);
    const newProps = {};
    keys.map((prop) => {
      if (!Object.prototype.hasOwnProperty.call(propTypes, prop)) {
        newProps[prop] = props[prop];
      }
    });

    return newProps;
  }

  state = {exited: !this.props.show};

  render() {
    const {
      show,
      container,
      children,
      transition: Transition,
      backdrop,
      className,
      style,
      onExit,
      onExiting,
      onEnter,
      onEntering,
      onEntered
    } = this.props;

    let dialog = React.Children.only(children);
    const filteredProps = this.omitProps(this.props, Modal.propTypes)

    const mountModal = show || (Transition && !this.state.exited);
    if (!mountModal) {
      return null;
    }

    const { role, tabIndex } = dialog.props;

    if (role === undefined || tabIndex === undefined) {
      dialog = cloneElement(dialog, {
        role: role === undefined ? 'document' : role,
        tabIndex: tabIndex == null ? '-1' : tabIndex
      });
    }

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
      <Portal
        ref={this.setMountNode}
        container={container}
      >
        <div
          ref={this.setModalNode}
          role={role || 'dialog'}
          {...filteredProps}
          style={style}
          className={className}
        >
          {backdrop && this.renderBackdrop()}
          {dialog}
        </div>
      </Portal>
    );
  }

  renderBackdrop = () => {
    let {
      backdropStyle,
      backdropClassName,
      renderBackdrop,
      backdropTransition: Transition } = this.props;

    const backdropRef = ref => this.backdrop = ref;

    let backdrop = renderBackdrop({
      ref: backdropRef,
      style: backdropStyle,
      className: backdropClassName,
      onClick: this.handleBackdropClick,
    });

    if (Transition) {
      backdrop = (
        <Transition
          appear
          in={this.props.show}
        >
          {backdrop}
        </Transition>
      );
    }

    return backdrop;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.show) {
      this.setState({exited: false});
    } else if (!nextProps.transition) {
      // Otherwise let handleHidden take care of marking exited.
      this.setState({exited: true});
    }
  }

  componentWillUpdate(nextProps){
    if (!this.props.show && nextProps.show) {
      this.checkForFocus();
    }
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.props.show) {
      this.onShow();
    }
  }

  componentDidUpdate(prevProps) {
    let { transition } = this.props;

    if ( prevProps.show && !this.props.show && !transition) {
      // Otherwise handleHidden will call this.
      this.onHide();
    }
    else if (!prevProps.show && this.props.show) {
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

  onShow = () => {
    let doc = ownerDocument(this);
    let container = getContainer(this.props.container, doc.body);

    this.props.manager.add(this, container, this.props.containerClassName);

    this._onDocumentKeydownListener =
      addEventListener(doc, 'keydown', this.handleDocumentKeyDown);

    this._onDocumentKeyupListener =
      addEventListener(doc, 'keyup', this.handleDocumentKeyUp);

    this._onFocusinListener =
      addFocusListener(this.enforceFocus);

   this.focus();

   if (this.props.onShow) {
     this.props.onShow();
   }
  }

  onHide = () => {
    this.props.manager.remove(this);

    this._onDocumentKeydownListener.remove();

    this._onDocumentKeyupListener.remove();

    this._onFocusinListener.remove();

    if (this.props.restoreFocus) {
      this.restoreLastFocus();
    }
  }

  setMountNode = (ref) => {
    this.mountNode = ref ? ref.getMountNode() : ref;
  }

  setModalNode = (ref) => {
    this.modalNode = ref;
  }

  handleHidden = (...args) => {
    this.setState({ exited: true });
    this.onHide();

    if (this.props.onExited) {
      this.props.onExited(...args);
    }
  }

  handleBackdropClick = (e) => {
    if (e.target !== e.currentTarget) {
      return;
    }

    if (this.props.onBackdropClick) {
      this.props.onBackdropClick(e);
    }

    if (this.props.backdrop === true){
      this.props.onHide();
    }
  }

  handleDocumentKeyDown = (e) => {
    if (this.props.keyboard && e.key === 'Escape' && this.isTopModal()) {
      if (this.props.onEscapeKeyDown) {
        this.props.onEscapeKeyDown(e);
      }

      this.props.onHide();
    }
  }

  handleDocumentKeyUp = (e) => {
    if (this.props.keyboard && e.key === 'Escape' && this.isTopModal()) {
      if (this.props.onEscapeKeyUp) {
        this.props.onEscapeKeyUp(e);
      }
    }
  }

  checkForFocus = () => {
    if (canUseDom) {
      this.lastFocus = activeElement();
    }
  }

  focus = () => {
    let autoFocus = this.props.autoFocus;
    let modalContent = this.getDialogElement();
    let current = activeElement(ownerDocument(this));
    let focusInModal = current && contains(modalContent, current);

    if (modalContent && autoFocus && !focusInModal) {
      this.lastFocus = current;

      if (!modalContent.hasAttribute('tabIndex')){
        modalContent.setAttribute('tabIndex', -1);
        warning(false,
          'The modal content node does not accept focus. ' +
          'For the benefit of assistive technologies, the tabIndex of the node is being set to "-1".');
      }

      modalContent.focus();
    }
  }

  restoreLastFocus = () => {
    // Support: <=IE11 doesn't support `focus()` on svg elements (RB: #917)
    if (this.lastFocus && this.lastFocus.focus) {
      this.lastFocus.focus();
      this.lastFocus = null;
    }
  }

  enforceFocus = () => {
    let { enforceFocus } = this.props;

    if (!enforceFocus || !this._isMounted || !this.isTopModal()) {
      return;
    }

    let active = activeElement(ownerDocument(this));
    let modal = this.getDialogElement();

    if (modal && modal !== active && !contains(modal, active)) {
      modal.focus();
    }
  };

  //instead of a ref, which might conflict with one the parent applied.
  getDialogElement = () => {
    let node = this.modalNode;
    return node && node.lastChild;
  }

  isTopModal = () => {
    return this.props.manager.isTopModal(this);
  }

}

Modal.Manager = ModalManager;

export default Modal;
