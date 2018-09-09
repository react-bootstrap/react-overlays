import PropTypes from 'prop-types';
import elementType from 'prop-types-extra/lib/elementType';
import React from 'react';
import ReactDOM from 'react-dom';

import Portal from './Portal';
import RootCloseWrapper from './RootCloseWrapper';
import { Popper, placements } from 'react-popper';
import forwardRef from 'react-context-toolbox/lib/forwardRef';
import WaitForContainer from './WaitForContainer';

/**
 * Built on top of `<Position/>` and `<Portal/>`, the overlay component is
 * great for custom tooltip overlays.
 */
class Overlay extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = { exited: !props.show };
    this.onHiddenListener = this.handleHidden.bind(this);

    this._lastTarget = null;
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.show) {
      return { exited: false };
    } else if (!nextProps.transition) {
      // Otherwise let handleHidden take care of marking exited.
      return { exited: true };
    }
    return null;
  }

  componentDidMount() {
    this.setState({ target: this.getTarget() });
  }

  componentDidUpdate(prevProps) {
    if (this.props === prevProps) return;

    const target = this.getTarget();

    if (target !== this.state.target) {
      this.setState({ target });
    }
  }

  getTarget() {
    let { target } = this.props;
    target = typeof target === 'function' ? target() : target;
    return (target && ReactDOM.findDOMNode(target)) || null;
  }

  render() {
    let {
      target: _0,
      container,
      containerPadding,
      placement,
      rootClose,
      children,
      flip,
      popperConfig = {},
      transition: Transition,
      ...props
    } = this.props;
    const { target } = this.state;

    // Don't un-render the overlay while it's transitioning out.
    const mountOverlay = props.show || (Transition && !this.state.exited);
    if (!mountOverlay) {
      // Don't bother showing anything if we don't have to.
      return null;
    }

    let child = children;

    const { modifiers = {} } = popperConfig;
    const popperProps = {
      ...popperConfig,
      placement,
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
          this.popper = popper;

          let innerChild = this.props.children({
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
                onExited={this.onHiddenListener}
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

    if (rootClose) {
      child = (
        <RootCloseWrapper
          onRootClose={props.onHide}
          event={props.rootCloseEvent}
        >
          {child}
        </RootCloseWrapper>
      );
    }

    return <Portal container={container}>{child}</Portal>;
  }

  handleHidden = (...args) => {
    this.setState({ exited: true });

    if (this.props.onExited) {
      this.props.onExited(...args);
    }
  };
}

Overlay.propTypes = {
  ...Portal.propTypes,

  /**
   * Set the visibility of the Overlay
   */
  show: PropTypes.bool,

  /** Specify where the overlay element is positioned in relation to the target element */
  placement: PropTypes.oneOf(placements),

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
  transition: elementType,

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

export default forwardRef(
  (props, ref) => (
    <WaitForContainer container={props.container}>
      {container => <Overlay {...props} ref={ref} container={container} />}
    </WaitForContainer>
  ),
  { displayName: 'withContainer(Overlay)' },
);
