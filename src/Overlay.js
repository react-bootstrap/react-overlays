import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import RootCloseWrapper from './RootCloseWrapper';
import { Popper, placements } from 'react-popper';
import useWaitForDOMRef from './utils/useWaitForDOMRef';

/**
 * Built on top of `Popper.js`, the overlay component is
 * great for custom tooltip overlays.
 */
const Overlay = React.forwardRef((props, ref) => {
  const container = useWaitForDOMRef(props.container);
  const target = useWaitForDOMRef(props.target);

  const [exited, setExited] = useState(!props.show);

  if (props.show) {
    if (exited) setExited(false);
  } else if (!props.transition && !exited) {
    setExited(true);
  }

  const handleHidden = (...args) => {
    setExited(true);

    if (props.onExited) {
      props.onExited(...args);
    }
  };
  const {
    children,
    flip,
    placement,
    containerPadding,
    popperConfig = {},
    transition: Transition,
  } = props;

  // Don't un-render the overlay while it's transitioning out.
  const mountOverlay = props.show || (Transition && !exited);

  if (!mountOverlay) {
    // Don't bother showing anything if we don't have to.
    return null;
  }

  let child = children;

  const { modifiers = {} } = popperConfig;
  const popperProps = {
    ...popperConfig,
    placement,
    innerRef: ref,
    referenceElement: target,
    enableEvents: props.show,
    modifiers: {
      ...modifiers,
      preventOverflow: {
        padding: containerPadding || 5,
        ...modifiers.preventOverflow,
      },
      flip: {
        enabled: !!flip,
        ...modifiers.preventOverflow,
      },
    },
  };

  child = (
    <Popper {...popperProps}>
      {({ arrowProps, style, ref, ...popper }) => {
        let innerChild = props.children({
          ...popper,
          // popper doesn't set the initial placement
          placement: popper.placement || placement,
          show: props.show,

          arrowProps,
          props: { ref, style },
        });

        if (Transition) {
          let { onExit, onExiting, onEnter, onEntering, onEntered } = props;

          innerChild = (
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
              {innerChild}
            </Transition>
          );
        }
        return innerChild;
      }}
    </Popper>
  );

  if (props.rootClose) {
    child = (
      <RootCloseWrapper
        onRootClose={props.onHide}
        event={props.rootCloseEvent}
        disabled={props.rootCloseDisabled}
      >
        {child}
      </RootCloseWrapper>
    );
  }

  return container ? ReactDOM.createPortal(child, container) : null;
});

Overlay.displayName = 'Overlay';
Overlay.propTypes = {
  /**
   * Set the visibility of the Overlay
   */
  show: PropTypes.bool,

  /** Specify where the overlay element is positioned in relation to the target element */
  placement: PropTypes.oneOf(placements),

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
   *   outOfBoundaries: ?boolean,
   *   scheduleUpdate: () => void,
   *   props: {
   *     ref: (?HTMLElement) => void,
   *     style: { [string]: string | number },
   *     aria-labelledby: ?string
   *   },
   *   arrowProps: {
   *     ref: (?HTMLElement) => void,
   *     style: { [string]: string | number },
   *   },
   * }) => React.Element}
   */
  children: PropTypes.func.isRequired,

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
  rootCloseEvent: RootCloseWrapper.propTypes.event,

  /**
   * Specify disabled for disable RootCloseWrapper
   */
  rootCloseDisabled: RootCloseWrapper.propTypes.disabled,
  /**
   * A Callback fired by the Overlay when it wishes to be hidden.
   *
   * __required__ when `rootClose` is `true`.
   *
   * @type func
   */
  onHide(props, ...args) {
    let propType = PropTypes.func;
    if (props.rootClose) {
      propType = propType.isRequired;
    }

    return propType(props, ...args);
  },

  /**
   * A `react-transition-group@2.0.0` `<Transition/>` component
   * used to animate the overlay as it changes visibility.
   */
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
