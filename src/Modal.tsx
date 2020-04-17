/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/prop-types */

import activeElement from 'dom-helpers/activeElement';
import contains from 'dom-helpers/contains';
import canUseDOM from 'dom-helpers/canUseDOM';
import listen from 'dom-helpers/listen';
import PropTypes from 'prop-types';
import React, {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import ReactDOM from 'react-dom';
import useMounted from '@restart/hooks/useMounted';
import useWillUnmount from '@restart/hooks/useWillUnmount';

import usePrevious from '@restart/hooks/esm/usePrevious';
import useEventCallback from '@restart/hooks/esm/useEventCallback';
import ModalManager from './ModalManager';
import useWaitForDOMRef, { DOMContainer } from './useWaitForDOMRef';
import { TransitionCallbacks } from './types';

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

  return Object.assign(modal.current, {
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
  });
}

export interface ModalHandle {
  dialog: HTMLElement | null;
  backdrop: HTMLElement | null;
}

const Modal = forwardRef<ModalHandle, ModalProps>(
  (
    {
      show = false,
      role = 'dialog',
      className,
      style,
      children,
      backdrop = true,
      keyboard = true,
      onBackdropClick,
      onEscapeKeyDown,
      transition,
      backdropTransition,
      autoFocus = true,
      enforceFocus = true,
      restoreFocus = true,
      restoreFocusOptions,
      renderDialog,
      renderBackdrop = (props: RenderModalBackdropProps) => <div {...props} />,
      manager: providedManager,
      container: containerRef,
      containerClassName,
      onShow,
      onHide = () => {},

      onExit,
      onExited,
      onExiting,
      onEnter,
      onEntering,
      onEntered,

      ...rest
    }: ModalProps,
    ref,
  ) => {
    const container = useWaitForDOMRef(containerRef);
    const modal = useModalManager(providedManager);

    const isMounted = useMounted();
    const prevShow = usePrevious(show);
    const [exited, setExited] = useState(!show);
    const lastFocusRef = useRef<HTMLElement | null>(null);

    useImperativeHandle(ref, () => modal, [modal]);

    if (canUseDOM && !prevShow && show) {
      lastFocusRef.current = activeElement() as HTMLElement;
    }

    if (!transition && !show && !exited) {
      setExited(true);
    } else if (show && exited) {
      setExited(false);
    }

    const handleShow = useEventCallback(() => {
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

      // autofocus after onShow to not trigger a focus event for previous
      // modals before this one is shown.
      if (autoFocus) {
        const currentActiveElement = activeElement(document) as HTMLElement;

        if (
          modal.dialog &&
          currentActiveElement &&
          !contains(modal.dialog, currentActiveElement)
        ) {
          lastFocusRef.current = currentActiveElement;
          modal.dialog.focus();
        }
      }
    });

    const handleHide = useEventCallback(() => {
      modal.remove();

      removeKeydownListenerRef.current?.();
      removeFocusListenerRef.current?.();

      if (restoreFocus) {
        // Support: <=IE11 doesn't support `focus()` on svg elements (RB: #917)
        lastFocusRef.current?.focus?.(restoreFocusOptions);
        lastFocusRef.current = null;
      }
    });

    // TODO: try and combine these effects: https://github.com/react-bootstrap/react-overlays/pull/794#discussion_r409954120

    // Show logic when:
    //  - show is `true` _and_ `container` has resolved
    useEffect(() => {
      if (!show || !container) return;

      handleShow();
    }, [show, container, /* should never change: */ handleShow]);

    // Hide cleanup logic when:
    //  - `exited` switches to true
    //  - component unmounts;
    useEffect(() => {
      if (!exited) return;

      handleHide();
    }, [exited, handleHide]);

    useWillUnmount(() => {
      handleHide();
    });

    // --------------------------------

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

    const handleHidden: TransitionCallbacks['onExited'] = (...args) => {
      setExited(true);
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
            {backdropElement}
          </BackdropTransition>
        );
      }
    }

    return (
      <>
        {ReactDOM.createPortal(
          <>
            {backdropElement}
            {dialog}
          </>,
          container,
        )}
      </>
    );
  },
);

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
   * ```js static
   * renderDialog={props => <MyDialog {...props} />}
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

Modal.displayName = 'Modal';
Modal.propTypes = propTypes;

export default Object.assign(Modal, {
  Manager: ModalManager,
});
