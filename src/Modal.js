/*eslint-disable react/prop-types */
import React, { cloneElement } from 'react';
import elementType from 'react-prop-types/lib/elementType';
import requiredIf from './utils/requiredIf';

import ownerDocument from './utils/ownerDocument';
import ownerWindow from './utils/ownerWindow';
import addEventListener from './utils/addEventListener';
import Portal from './Portal';
import ModalManager from './ModalManager';

import canUseDom from 'dom-helpers/util/inDOM';
import isWindow from 'dom-helpers/query/isWindow';
import activeElement from 'dom-helpers/activeElement';
import contains from 'dom-helpers/query/contains';

/**
 * Gets the correct clientHeight of the modal container
 * when the body/window/document you need to use the docElement clientHeight
 * @param  {HTMLElement} container
 * @param  {ReactElement|HTMLElement} context
 * @return {Number}
 */
function containerClientHeight(container, context) {
  let doc = ownerDocument(container);

  return isWindow(container)
      ? doc.documentElement.clientHeight
      : container.clientHeight;
}

function getContainer(context){
  return (context.props.container && React.findDOMNode(context.props.container)) ||
    ownerDocument(context).body;
}

let modalManager = new ModalManager();

/**
 * Firefox doesn't have a focusin event so using capture is easiest way to get bubbling
 * IE8 can't do addEventListener, but does have onfocusin, so we use that in ie8
 *
 * We only allow one Listener at a time to avoid stack overflows
 */
function onFocus(context, handler) {
  let doc = ownerDocument(context);
  let useFocusin = !doc.addEventListener;
  let remove;

  if (useFocusin) {
    document.attachEvent('onfocusin', handler);
    remove = () => document.detachEvent('onfocusin', handler);
  } else {
    document.addEventListener('focus', handler, true);
    remove = () => document.removeEventListener('focus', handler, true);
  }

  return { remove };
}

let usingTransition = props => !!props.transition;

/**
 * Love them or hate them, `<Modal/>` provides a solid foundation for creating dialogs, lightboxs, or whatever else.
 * The Modal component renders its `children` node in front of a backdrop component.
 *
 * The Modal offers a few help features over using just a`<Portal/>` and some styles:
 *
 * - Manages the backdrop for you.
 * - It moves focuses to the modal content, keeps it there until the modal is closed.
 * - It Disables scrolling from the page content while open.
 * - Appropraite ARIA roles are automatically added.
 * - Easily plugable animations via a `<Transition/>` component.
 *
 */
const Modal = React.createClass({

  propTypes: {
    ...Portal.propTypes,

    /**
     * A callback fired when the Modal is opening.
     */
    onShow: React.PropTypes.func,

    /**
     * A callback fired when either the backdrop is clicked, or the escape key is pressed.
     */
    onHide: React.PropTypes.func,

    /**
     * Include a backdrop component.
     */
    backdrop: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.oneOf(['static'])
    ]),

    /**
     * A callback fired when the escape key, if specified in `keyboard`, is pressed.
     */
    onEscapeKeyUp: React.PropTypes.func,

    /**
     * A callback fired when the backdrop, if specified, is clicked.
     */
    onBackdropClick: React.PropTypes.func,

    /**
     * A style object for the backdrop component.
     */
    backdropStyle: React.PropTypes.object,

    /**
     * A css class or classes for the backdrop component.
     */
    backdropClassName: React.PropTypes.string,

    /**
     * A css class or set of classes applied to the modal container when the modal is open,
     * and removed when it is closed.
     */
    containerClassName: React.PropTypes.string,

    /**
     * Close the modal when escape key is pressed
     */
    keyboard: React.PropTypes.bool,

    /**
     * A `<Transition/>` component to use for the dialog and backdrop components.
     */
    transition: elementType,

    /**
     * The `timeout` of the dialog transition if specified. This number is used to ensure that transition callbacks are always
     * fired, even if browser transition events are canceled.
     *
     * See the Transition `timeout` prop for more infomation.
     *
     * @type {number}
     */
    dialogTransitionTimeout: requiredIf(React.PropTypes.number, usingTransition),

    /**
     * The `timeou` of the backdrop transition if specified. This number is used to ensure that transition callbacks are always
     * fired, even if browser transition events are canceled.
     *
     * See the Transition `timeout` prop for more infomation.
     *
     * @type {number}
     */
    backdropTransitionTimeout: requiredIf(React.PropTypes.number, usingTransition),

    /**
     * When `true` The modal will automatically shift focus to itself when it opens, and replace it to the last focused element when it closes.
     * Generally this should never be set to false as it makes the Modal less accessible to assistive technologies, like screen readers.
     */
    autoFocus: React.PropTypes.bool,

    /**
     * When `true` The modal will prevent focus from leaving the Modal while open.
     * Generally this should never be set to false as it makes the Modal less accessible to assistive technologies, like screen readers.
     */
    enforceFocus: React.PropTypes.bool

  },

  getDefaultProps() {
    let noop = ()=>{};

    return {
      show: false,
      backdrop: true,
      keyboard: true,
      autoFocus: true,
      enforceFocus: true,
      onHide: noop
    };
  },

  getInitialState(){
    return {exited: !this.props.show};
  },

  render() {
    let {
      children,
      transition: Transition,
      backdrop,
      dialogTransitionTimeout,
      ...props } = this.props;

    let { onExit, onExiting, onEnter, onEntering, onEntered } = props;

    let show = !!props.show;
    let dialog = React.Children.only(this.props.children);

    const mountModal = show || (Transition && !this.state.exited);

    if (!mountModal) {
      return null;
    }

    let modal = cloneElement(dialog, {
      role: dialog.props.role || 'document',
      modalIsOverflowing: this.state.modalIsOverflowing,
      containerIsOverflowing: this._containerIsOverflowing
    });

    if ( Transition ) {
      modal = (
        <Transition
          transitionAppear
          unmountOnExit
          in={show}
          timeout={dialogTransitionTimeout}
          onExit={onExit}
          onExiting={onExiting}
          onExited={this.handleHidden}
          onEnter={onEnter}
          onEntering={onEntering}
          onEntered={onEntered}
        >
          { modal }
        </Transition>
      );
    }

    return (
      <Portal container={props.container}>
        <div
          tabIndex='-1'
          ref={'modal'}
          role={props.role || 'dialog'}
          style={props.style}
          className={props.className}
        >
          { backdrop && this.renderBackdrop() }
          { modal }
        </div>
      </Portal>
    );
  },

  renderBackdrop() {
    let {
      transition: Transition,
      backdropTransitionTimeout } = this.props;

    let backdrop = (
      <div ref="backdrop"
        style={this.props.backdropStyle}
        className={this.props.backdropClassName}
        onClick={this.handleBackdropClick}
      />
    );

    if (Transition) {
      backdrop = (
        <Transition transitionAppear
          in={this.props.show}
          timeout={backdropTransitionTimeout}
        >
          {backdrop}
        </Transition>
      );
    }

    return backdrop;
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.show) {
      this.setState({exited: false});
    } else if (!nextProps.transition) {
      // Otherwise let handleHidden take care of marking exited.
      this.setState({exited: true});
    }
  },

  componentWillUpdate(nextProps){
    if (nextProps.show) {
      this.checkForFocus();
    }
  },

  componentDidMount() {
    if ( this.props.show ){
      this.onShow();
    }
  },

  componentDidUpdate(prevProps) {
    let { transition } = this.props;

    if ( prevProps.show && !this.props.show && !transition) {
      // Otherwise handleHidden will call this.
      this.onHide();
    }
    else if ( !prevProps.show && this.props.show ) {
      this.onShow();
    }
  },

  componentWillUnmount() {
    if (this.props.show) {
      this.onHide();
    }
  },

  onShow() {
    let doc = ownerDocument(this);
    let win = ownerWindow(this);
    let container = getContainer(this);
    let containerClassName = this.props.containerClassName;

    modalManager.add(this, container, containerClassName);

    this._containerIsOverflowing = modalManager.isContainerOverflowing(container);

    this.iosClickHack();

    this._onDocumentKeyupListener =
      addEventListener(doc, 'keyup', this.handleDocumentKeyUp);

    this._onWindowResizeListener =
      addEventListener(win, 'resize', this.handleWindowResize);

    if (this.props.enforceFocus) {
      this._onFocusinListener = onFocus(this, this.enforceFocus);
    }

    this.setState({ //eslint-disable-line react/no-did-mount-set-state
      modalIsOverflowing: this.isModalOverflowing()
    }, () => this.focusModalContent());
  },

  onHide() {

    modalManager.remove(this);

    this._onDocumentKeyupListener.remove();
    this._onWindowResizeListener.remove();

    if (this._onFocusinListener) {
      this._onFocusinListener.remove();
    }

    this.restoreLastFocus();
  },

  handleHidden(...args) {
    this.setState({ exited: true });
    this.onHide();

    if (this.props.onExited) {
      this.props.onExited(...args);
    }
  },

  handleBackdropClick(e) {
    if (e.target !== e.currentTarget) {
      return;
    }

    if (this.props.onBackdropClick) {
      this.props.onBackdropClick(e);
    }

    if (this.props.backdrop === true){
      this.props.onHide();
    }
  },

  handleDocumentKeyUp(e) {
    if (this.props.keyboard && e.keyCode === 27 && this.isTopModal()) {
      if (this.props.onEscapeKeyUp) {
        this.props.onEscapeKeyUp(e);
      }
      this.props.onHide();
    }
  },

  handleWindowResize() {
    this.setState({
      modalIsOverflowing: this.isModalOverflowing()
    });
  },

  checkForFocus(){
    if ( canUseDom ) {
      this.lastFocus = activeElement();
    }
  },

  focusModalContent () {
    let autoFocus = this.props.autoFocus;
    let modalContent = React.findDOMNode(this.refs.modal);
    let current = activeElement(ownerDocument(this));
    let focusInModal = current && contains(modalContent, current);

    if (modalContent && autoFocus && !focusInModal) {
      this.lastFocus = current;
      modalContent.focus();
    }
  },

  restoreLastFocus () {
    if (this.lastFocus && this.lastFocus.focus) {
      this.lastFocus.focus();
      this.lastFocus = null;
    }
  },

  enforceFocus() {
    if (!this.isMounted() || !this.isTopModal()) {
      return;
    }

    let active = activeElement(ownerDocument(this));
    let modal = React.findDOMNode(this.refs.modal);

    if ( modal && modal !== active && !contains(modal, active)){
      modal.focus();
    }
  },

  iosClickHack() {
    // Support: <= 0.13: https://github.com/facebook/react/issues/1169
    React.findDOMNode(this.refs.backdrop).onclick = function () {};
  },

  //instead of a ref, which might conflict with one the parent applied.
  getDialogElement(){
    let node = React.findDOMNode(this.refs.modal);
    return node && node.lastChild;
  },

  isTopModal(){
    return modalManager.isTopModal(this);
  },

  isModalOverflowing() {
    if ( !canUseDom ) {
      return false;
    }

    let node = this.getDialogElement();
    let scrollHt = node.scrollHeight;
    let container = getContainer(this);

    return scrollHt > containerClientHeight(container, this);
  }

});


Modal.manager = modalManager;

export default Modal;
