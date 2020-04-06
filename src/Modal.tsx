/* eslint-disable react/prop-types */

import activeElement from 'dom-helpers/activeElement';
import contains from 'dom-helpers/contains';
import canUseDOM from 'dom-helpers/canUseDOM';
import listen from 'dom-helpers/listen';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import useMounted from '@restart/hooks/useMounted';
import useMountEffect from '@restart/hooks/useMountEffect';
import useImmediateUpdateEffect from '@restart/hooks/useImmediateUpdateEffect';

import ModalManager from './ModalManager';
import ownerDocument from './utils/ownerDocument';
import useWaitForDOMRef, {
  DOMContainer,
  resolveContainerRef,
} from './utils/useWaitForDOMRef';
import { TransitionCallbacks } from './types';
import safeFindDOMNode from './utils/safeFindDOMNode';
import usePrevious from '@restart/hooks/esm/usePrevious';
import useEventCallback from '@restart/hooks/esm/useEventCallback';

let manager: ModalManager;

export type ModalTransitionComponent = React.ComponentType<
  {
    in: boolean;
    appear?: boolean;
    unmountOnExit?: boolean;
  } & TransitionCallbacks
>;

export interface RenderModalDialogProps {
  style: React.CSSProperties | undefined;
  className: string | undefined;
  tabIndex: number;
  role: string;
  ref: React.RefCallback<Element>;
  'aria-modal': boolean | undefined;
}

export interface RenderModalBackdropProps {
  ref: React.RefCallback<Element>;
  onClick: (event: React.SyntheticEvent) => void;
}
export interface ModalProps extends TransitionCallbacks {
  children?: React.ReactElement;
  role?: string;
  style?: React.CSSProperties;
  className?: string;

  show?: boolean;
  container?: DOMContainer;
  onShow?: () => void;
  onHide: () => void;
  manager?: ModalManager;
  backdrop?: true | false | 'static';

  renderDialog?: (props: RenderModalDialogProps) => React.ReactNode;
  renderBackdrop?: (props: RenderModalBackdropProps) => React.ReactNode;

  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onBackdropClick?: (e: React.SyntheticEvent) => void;
  containerClassName?: string;
  keyboard?: boolean;
  transition?: ModalTransitionComponent;
  backdropTransition?: ModalTransitionComponent;
  autoFocus?: boolean;
  enforceFocus?: boolean;
  restoreFocus?: boolean;
  restoreFocusOptions?: {
    preventScroll: boolean;
  };

  [other: string]: any;
}

function getManager() {
  if (!manager) manager = new ModalManager();
  return manager;
}

function useModalManager(provided?: ModalManager) {
  const modalManager = provided || getManager();

  const modal = useRef({
    dialog: (null as any) as HTMLElement,
    backdrop: (null as any) as HTMLElement,
  });

  return {
    ...modal.current,
    add: (container: HTMLElement, className?: string) =>
      modalManager.add(modal.current, container, className),

    remove: () => modalManager.remove(modal.current),

    isTopModal: () => modalManager.isTopModal(modal.current),

    setDialogRef: useCallback((ref: HTMLElement | null) => {
      modal.current.dialog = ref!;
    }, []),

    setBackdropRef: useCallback((ref: HTMLElement | null) => {
      modal.current.backdrop = ref!;
    }, []),
  };
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
function Modal({
  show,
  role = 'dialog',
  className,
  style,
  children,
  backdrop,
  keyboard,
  onBackdropClick,
  onEscapeKeyDown,
  transition,
  backdropTransition,
  autoFocus,
  enforceFocus,
  restoreFocus,
  restoreFocusOptions,
  renderDialog,
  renderBackdrop = (props: RenderModalBackdropProps) => <div {...props} />,
  manager: providedManager,
  container: containerRef,
  containerClassName,
  onShow,
  onHide,

  onExit,
  onExited,
  onExiting,
  onEnter,
  onEntering,
  onEntered,

  ...rest
}: ModalProps) {
  // const [manager] = useModalManager(providedManager);
  const container = useWaitForDOMRef(containerRef);
  const modal = useModalManager(providedManager);

  const isMounted = useMounted();
  const prevShow = usePrevious(show);
  const [exited, setExited] = useState(!show);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  if (canUseDOM && !prevShow && show) {
    lastFocusRef.current = activeElement() as HTMLElement;
  }

  useImmediateUpdateEffect(() => {
    if (show && exited) return setExited(false);
    if (!transition && !exited) return setExited(true);
  }, [show, transition]);

  // TODO: can we turn these into a more idiomatic effect?
  useMountEffect(() => {
    if (show) handleShow();

    return () => {
      if (show || (transition && !exited)) {
        handleHide();
      }
    };
  });

  useEffect(() => {
    if (prevShow && !show && !transition) {
      handleHide();
    } else if (!prevShow && show) {
      handleShow();
    }
  });

  const handleEnforceFocus = useEventCallback(() => {
    if (!enforceFocus || !isMounted() || !modal.isTopModal()) {
      return;
    }

    const currentActiveElement = activeElement();

    if (
      modal.dialog &&
      currentActiveElement &&
      !contains(modal.dialog, currentActiveElement)
    ) {
      modal.dialog.focus();
    }
  });

  const restoreLastFocus = () => {
    // Support: <=IE11 doesn't support `focus()` on svg elements (RB: #917)
    lastFocusRef.current?.focus?.(restoreFocusOptions);
    lastFocusRef.current = null;
  };

  const autoFocusModal = () => {
    if (!autoFocus) return;

    const currentActiveElement = activeElement(document) as HTMLElement;

    if (
      modal.dialog &&
      currentActiveElement &&
      !contains(modal.dialog, currentActiveElement)
    ) {
      lastFocusRef.current = currentActiveElement;
      modal.dialog.focus();
    }
  };

  const handleBackdropClick = useEventCallback((e: React.SyntheticEvent) => {
    if (e.target !== e.currentTarget) {
      return;
    }

    onBackdropClick?.(e);

    if (backdrop === true) {
      onHide();
    }
  });

  const handleDocumentKeyDown = (e: KeyboardEvent) => {
    if (keyboard && e.keyCode === 27 && modal.isTopModal()) {
      onEscapeKeyDown?.(e);
      onHide();
    }
  };

  const removeFocusListenerRef = useRef<ReturnType<typeof listen> | null>();
  const removeKeydownListenerRef = useRef<ReturnType<typeof listen> | null>();

  const handleShow = () => {
    modal.add(container!, containerClassName);

    removeKeydownListenerRef.current = listen(
      document as any,
      'keydown',
      handleDocumentKeyDown,
    );

    removeFocusListenerRef.current = listen(
      document as any,
      'focus',
      // the timeout is necessary b/c this will run before the new modal is mounted
      // and so steals focus from it
      () => setTimeout(handleEnforceFocus),
      true,
    );

    if (onShow) {
      onShow();
    }

    // autofocus after onShow, to not trigger a focus event for previous
    // modals before this one is shown.
    autoFocusModal();
  };

  const handleHide = () => {
    modal.remove();

    removeKeydownListenerRef.current!();
    removeFocusListenerRef.current!();

    if (restoreFocus) {
      restoreLastFocus();
    }
  };

  const handleHidden: TransitionCallbacks['onExited'] = (...args) => {
    setExited(true);
    handleHide();

    onExited?.(...args);
  };

  const Transition = transition;
  if (!container || !(show || (Transition && !exited))) {
    return null;
  }

  const dialogProps = {
    role,
    ref: modal.setDialogRef,
    // apparently only works on the dialog role element
    'aria-modal': role === 'dialog' ? true : undefined,
    ...rest,
    style,
    className,
    tabIndex: -1,
  };

  let dialog = renderDialog ? (
    renderDialog(dialogProps)
  ) : (
    <div {...dialogProps}>
      {React.cloneElement(children!, { role: 'document' })}
    </div>
  );

  if (Transition) {
    dialog = (
      <Transition
        appear
        unmountOnExit
        in={!!show}
        onExit={onExit}
        onExiting={onExiting}
        onExited={handleHidden}
        onEnter={onEnter}
        onEntering={onEntering}
        onEntered={onEntered}
      >
        {dialog}
      </Transition>
    );
  }

  let backdropElement = null;
  if (backdrop) {
    const BackdropTransition = backdropTransition;

    backdropElement = renderBackdrop({
      ref: modal.setBackdropRef,
      onClick: handleBackdropClick,
    });

    if (BackdropTransition) {
      backdropElement = (
        <BackdropTransition appear in={!!show}>
          {backdrop}
        </BackdropTransition>
      );
    }
  }

  return ReactDOM.createPortal(
    <>
      {backdropElement}
      {dialog}
    </>,
    container,
  );
}

const propTypes = {
  /**
   * Set the visibility of the Modal
   */
  show: PropTypes.bool,

  /**
   * A DOM element, a `ref` to an element, or function that returns either. The Modal is appended to it's `container` element.
   *
   * For the sake of assistive technologies, the container should usually be the document body, so that the rest of the
   * page content can be placed behind a virtual backdrop as well as a visual one.
   */
  container: PropTypes.any,

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
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['static'])]),

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
  transition: PropTypes.elementType,

  /**
   * A `react-transition-group@2.0.0` `<Transition/>` component used
   * to control animations for the backdrop components.
   */
  backdropTransition: PropTypes.elementType,

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
  manager: PropTypes.object,
};
// class Modal extends React.Component<ModalProps> {

//   static defaultProps = {
//     show: false,
//     role: 'dialog',
//     backdrop: true,
//     keyboard: true,
//     autoFocus: true,
//     enforceFocus: true,
//     restoreFocus: true,
//     onHide: () => {},
//     renderBackdrop: (props: RenderModalBackdropProps) => <div {...props} />,
//   };

//   state = { exited: !this.props.show };

//   private _isMounted: boolean = false;
//   private lastFocus: Element | null = null;
//   private removeKeydownListener?: () => void;
//   private removeFocusListener?: () => void;

//   dialog!: HTMLElement;
//   backdrop!: HTMLElement;

//   static getDerivedStateFromProps(nextProps: ModalProps) {
//     if (nextProps.show) {
//       return { exited: false };
//     }
//     if (!nextProps.transition) {
//       // Otherwise let handleHidden take care of marking exited.
//       return { exited: true };
//     }
//     return null;
//   }

//   componentDidMount() {
//     this._isMounted = true;
//     if (this.props.show) {
//       this.onShow();
//     }
//   }

//   componentDidUpdate(prevProps: ModalProps) {
//     let { transition } = this.props;

//     if (prevProps.show && !this.props.show && !transition) {
//       // Otherwise handleHidden will call this.
//       this.onHide();
//     } else if (!prevProps.show && this.props.show) {
//       this.onShow();
//     }
//   }

//   componentWillUnmount() {
//     let { show, transition } = this.props;

//     this._isMounted = false;

//     if (show || (transition && !this.state.exited)) {
//       this.onHide();
//     }
//   }

//   getSnapshotBeforeUpdate(prevProps: ModalProps) {
//     if (canUseDOM && !prevProps.show && this.props.show) {
//       this.lastFocus = activeElement();
//     }
//     return null;
//   }

//   onShow = () => {
//     let { container, containerClassName, onShow } = this.props;
//     let resolvedContainer = resolveContainerRef(container);

//     this.getModalManager().add(this, resolvedContainer!, containerClassName);

//     this.removeKeydownListener = listen(
//       document as any,
//       'keydown',
//       this.handleDocumentKeyDown,
//     );

//     this.removeFocusListener = listen(
//       document as any,
//       'focus',
//       // the timeout is necessary b/c this will run before the new modal is mounted
//       // and so steals focus from it
//       () => setTimeout(this.enforceFocus),
//       true,
//     );

//     if (onShow) {
//       onShow();
//     }

//     // autofocus after onShow, to not trigger a focus event for previous
//     // modals before this one is shown.
//     this.autoFocus();
//   };

//   onHide = () => {
//     this.getModalManager().remove(this);

//     this.removeKeydownListener!();
//     this.removeFocusListener!();

//     if (this.props.restoreFocus) {
//       this.restoreLastFocus();
//     }
//   };

//   setDialogRef = (ref: HTMLElement | null) => {
//     this.dialog = ref!;
//   };

//   setBackdropRef = (ref: HTMLElement | null) => {
//     // FIXME: Why is this inconsistent with setDialogRef
//     this.backdrop = safeFindDOMNode(ref) as HTMLElement;
//   };

//   getModalManager() {
//     if (this.props.manager) {
//       return this.props.manager;
//     }

//     if (!manager) {
//       manager = new ModalManager();
//     }

//     return manager;
//   }

//   handleHidden: TransitionCallbacks['onExited'] = (...args) => {
//     this.setState({ exited: true });
//     this.onHide();

//     if (this.props.onExited) {
//       this.props.onExited(...args);
//     }
//   };

//   handleBackdropClick = (e: React.SyntheticEvent) => {
//     if (e.target !== e.currentTarget) {
//       return;
//     }

//     if (this.props.onBackdropClick) {
//       this.props.onBackdropClick(e);
//     }

//     if (this.props.backdrop === true) {
//       this.props.onHide();
//     }
//   };

//   handleDocumentKeyDown = (e: KeyboardEvent) => {
//     if (this.props.keyboard && e.keyCode === 27 && this.isTopModal()) {
//       this.props.onEscapeKeyDown?.(e);
//       this.props.onHide();
//     }
//   };

//   enforceFocus = () => {
//     if (!this.props.enforceFocus || !this._isMounted || !this.isTopModal()) {
//       return;
//     }

//     const currentActiveElement = activeElement();

//     if (
//       this.dialog &&
//       currentActiveElement &&
//       !contains(this.dialog, currentActiveElement)
//     ) {
//       this.dialog.focus();
//     }
//   };

//   restoreLastFocus() {
//     // Support: <=IE11 doesn't support `focus()` on svg elements (RB: #917)
//     if (this.lastFocus) {
//       // @ts-ignore
//       this.lastFocus.focus?.(this.props.restoreFocusOptions);
//       this.lastFocus = null;
//     }
//   }

//   autoFocus() {
//     if (!this.props.autoFocus) return;

//     const currentActiveElement = activeElement(document);

//     if (
//       this.dialog &&
//       currentActiveElement &&
//       !contains(this.dialog, currentActiveElement)
//     ) {
//       this.lastFocus = currentActiveElement;
//       this.dialog.focus();
//     }
//   }

//   isTopModal() {
//     return this.getModalManager().isTopModal(this);
//   }

//   renderBackdrop = () => {
//     let { renderBackdrop, backdropTransition: Transition } = this.props;

//     let backdrop = renderBackdrop!({
//       ref: this.setBackdropRef,
//       onClick: this.handleBackdropClick,
//     });

//     if (Transition) {
//       backdrop = (
//         <Transition appear in={!!this.props.show}>
//           {backdrop}
//         </Transition>
//       );
//     }

//     return backdrop;
//   };

//   render() {
//     const {
//       show,
//       container,
//       children,
//       renderDialog,
//       role = 'dialog',
//       transition: Transition,
//       backdrop,
//       className,
//       style,
//       onExit,
//       onExiting,
//       onEnter,
//       onEntering,
//       onEntered,
//       ...props
//     } = this.props;

//     if (!(show || (Transition && !this.state.exited))) {
//       return null;
//     }

//     const dialogProps = {
//       role,
//       ref: this.setDialogRef,
//       // apparently only works on the dialog role element
//       'aria-modal': role === 'dialog' ? true : undefined,
//       ...omitProps(props, Modal.propTypes),
//       style,
//       className,
//       tabIndex: '-1',
//     };

//     let dialog = renderDialog ? (
//       renderDialog(dialogProps)
//     ) : (
//       <div {...dialogProps}>
//         {React.cloneElement(children, { role: 'document' })}
//       </div>
//     );

//     if (Transition) {
//       dialog = (
//         <Transition
//           appear
//           unmountOnExit
//           in={show}
//           onExit={onExit}
//           onExiting={onExiting}
//           onExited={this.handleHidden}
//           onEnter={onEnter}
//           onEntering={onEntering}
//           onEntered={onEntered}
//         >
//           {dialog}
//         </Transition>
//       );
//     }

//     return ReactDOM.createPortal(
//       <>
//         {backdrop && this.renderBackdrop()}
//         {dialog}
//       </>,
//       container,
//     );
//   }
// }

Modal.propTypes = propTypes;
Modal.Manager = ModalManager;

export default Modal;
