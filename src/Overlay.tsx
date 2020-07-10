import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import useCallbackRef from '@restart/hooks/useCallbackRef';
import useMergedRefs from '@restart/hooks/useMergedRefs';
import { placements } from './popper';
import usePopper, {
  Placement,
  UsePopperOptions,
  Offset,
  State,
} from './usePopper';
import useRootClose, { RootCloseOptions } from './useRootClose';
import useWaitForDOMRef, { DOMContainer } from './useWaitForDOMRef';
import { TransitionCallbacks } from './types';
import mergeOptionsWithPopperConfig from './mergeOptionsWithPopperConfig';

export interface OverlayProps extends TransitionCallbacks {
  flip?: boolean;
  placement?: Placement;
  offset?: Offset;
  containerPadding?: number;
  popperConfig?: Omit<UsePopperOptions, 'placement'>;
  container?: DOMContainer;
  target: DOMContainer;
  show?: boolean;
  transition?: React.ComponentType<
    { in?: boolean; appear?: boolean } & TransitionCallbacks
  >;
  onHide?: (e: Event) => void;
  rootClose?: boolean;
  rootCloseDisabled?: boolean;
  rootCloseEvent?: RootCloseOptions['clickTrigger'];
  children: (value: {
    show: boolean;
    placement: Placement;
    update: () => void;
    forceUpdate: () => void;
    state?: State;
    props: Record<string, any> & {
      ref: React.RefCallback<HTMLElement>;
      style: React.CSSProperties;
      'aria-labelledby'?: string;
    };
    arrowProps: Record<string, any> & {
      ref: React.RefCallback<HTMLElement>;
      style: React.CSSProperties;
    };
  }) => React.ReactNode;
}

/**
 * Built on top of `Popper.js`, the overlay component is
 * great for custom tooltip overlays.
 */
const Overlay = React.forwardRef<HTMLElement, OverlayProps>(
  (props, outerRef) => {
    const {
      flip,
      offset,
      placement,
      containerPadding = 5,
      popperConfig = {},
      transition: Transition,
    } = props;

    const [rootElement, attachRef] = useCallbackRef<HTMLElement>();
    const [arrowElement, attachArrowRef] = useCallbackRef<Element>();
    const mergedRef = useMergedRefs<HTMLElement | null>(attachRef, outerRef);

    const container = useWaitForDOMRef(props.container);
    const target = useWaitForDOMRef(props.target);

    const [exited, setExited] = useState(!props.show);

    const { styles, attributes, ...popper } = usePopper(
      target,
      rootElement,
      mergeOptionsWithPopperConfig({
        placement,
        enableEvents: !!props.show,
        containerPadding: containerPadding || 5,
        flip,
        offset,
        arrowElement,
        popperConfig,
      }),
    );

    if (props.show) {
      if (exited) setExited(false);
    } else if (!props.transition && !exited) {
      setExited(true);
    }

    const handleHidden: TransitionCallbacks['onExited'] = (...args) => {
      setExited(true);

      if (props.onExited) {
        props.onExited(...args);
      }
    };

    // Don't un-render the overlay while it's transitioning out.
    const mountOverlay = props.show || (Transition && !exited);

    useRootClose(rootElement, props.onHide!, {
      disabled: !props.rootClose || props.rootCloseDisabled,
      clickTrigger: props.rootCloseEvent,
    });

    if (!mountOverlay) {
      // Don't bother showing anything if we don't have to.
      return null;
    }

    let child = props.children({
      ...popper,
      show: !!props.show,
      props: {
        ...attributes.popper,
        style: styles.popper as any,
        ref: mergedRef,
      },
      arrowProps: {
        ...attributes.arrow,
        style: styles.arrow as any,
        ref: attachArrowRef,
      },
    });

    if (Transition) {
      const { onExit, onExiting, onEnter, onEntering, onEntered } = props;

      child = (
        <Transition
          in={props.show}
          appear
          onExit={onExit}
          onExiting={onExiting}
          onExited={handleHidden}
          onEnter={onEnter}
          onEntering={onEntering}
          onEntered={onEntered}
        >
          {child}
        </Transition>
      );
    }

    return container ? ReactDOM.createPortal(child, container) : null;
  },
);

Overlay.displayName = 'Overlay';

Overlay.propTypes = {
  /**
   * Set the visibility of the Overlay
   */
  show: PropTypes.bool,

  /** Specify where the overlay element is positioned in relation to the target element */
  placement: PropTypes.oneOf(placements),

  /**
   * A DOM Element, Ref to an element, or function that returns either. The `target` element is where
   * the overlay is positioned relative to.
   */
  target: PropTypes.any,

  /**
   * A DOM Element, Ref to an element, or function that returns either. The `container` will have the Portal children
   * appended to it.
   */
  container: PropTypes.any,

  /**
   * Enables the Popper.js `flip` modifier, allowing the Overlay to
   * automatically adjust it's placement in case of overlap with the viewport or toggle.
   * Refer to the [flip docs](https://popper.js.org/popper-documentation.html#modifiers..flip.enabled) for more info
   */
  flip: PropTypes.bool,

  /**
   * A render prop that returns an element to overlay and position. See
   * the [react-popper documentation](https://github.com/FezVrasta/react-popper#children) for more info.
   *
   * @type {Function ({
   *   show: boolean,
   *   placement: Placement,
   *   update: () => void,
   *   forceUpdate: () => void,
   *   props: {
   *     ref: (?HTMLElement) => void,
   *     style: { [string]: string | number },
   *     aria-labelledby: ?string
   *     [string]: string | number,
   *   },
   *   arrowProps: {
   *     ref: (?HTMLElement) => void,
   *     style: { [string]: string | number },
   *     [string]: string | number,
   *   },
   * }) => React.Element}
   */
  children: PropTypes.func.isRequired,

  /**
   * Control how much space there is between the edge of the boundary element and overlay.
   * A convenience shortcut to setting `popperConfig.modfiers.preventOverflow.padding`
   */
  containerPadding: PropTypes.number,

  /**
   * A set of popper options and props passed directly to react-popper's Popper component.
   */
  popperConfig: PropTypes.object,

  /**
   * Specify whether the overlay should trigger `onHide` when the user clicks outside the overlay
   */
  rootClose: PropTypes.bool,

  /**
   * Specify event for toggling overlay
   */
  rootCloseEvent: PropTypes.oneOf(['click', 'mousedown']),

  /**
   * Specify disabled for disable RootCloseWrapper
   */
  rootCloseDisabled: PropTypes.bool,
  /**
   * A Callback fired by the Overlay when it wishes to be hidden.
   *
   * __required__ when `rootClose` is `true`.
   *
   * @type func
   */
  onHide(props, ...args) {
    if (props.rootClose) {
      return PropTypes.func.isRequired(props, ...args);
    }

    return PropTypes.func(props, ...args);
  },

  /**
   * A `react-transition-group@2.0.0` `<Transition/>` component
   * used to animate the overlay as it changes visibility.
   */
  // @ts-ignore
  transition: PropTypes.elementType,

  /**
   * Callback fired before the Overlay transitions in
   */
  onEnter: PropTypes.func,

  /**
   * Callback fired as the Overlay begins to transition in
   */
  onEntering: PropTypes.func,

  /**
   * Callback fired after the Overlay finishes transitioning in
   */
  onEntered: PropTypes.func,

  /**
   * Callback fired right before the Overlay transitions out
   */
  onExit: PropTypes.func,

  /**
   * Callback fired as the Overlay begins to transition out
   */
  onExiting: PropTypes.func,

  /**
   * Callback fired after the Overlay finishes transitioning out
   */
  onExited: PropTypes.func,
};

export default Overlay;
