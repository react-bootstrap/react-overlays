import classnames from 'classnames';
import addEventListener from 'dom-helpers/events/on';
import transitionInfo from 'dom-helpers/transition/properties';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

const transitionEndEvent = transitionInfo.end;

export const UNMOUNTED = 0;
export const EXITED = 1;
export const ENTERING = 2;
export const ENTERED = 3;
export const EXITING = 4;

/**
 * The Transition component lets you define and run css transitions with a simple declarative api.
 * It works similar to React's own [CSSTransitionGroup](http://facebook.github.io/react/docs/animation.html#high-level-api-reactcsstransitiongroup)
 * but is specifically optimized for transitioning a single child "in" or "out".
 *
 * You don't even need to use class based css transitions if you don't want to (but it is easiest).
 * The extensive set of lifecycle callbacks means you have control over
 * the transitioning now at each step of the way.
 */
class Transition extends React.Component {
  constructor(props, context) {
    super(props, context);

    let initialStatus;
    this.nextStatus = null;

    if (props.in) {
      if (props.transitionAppear) {
        initialStatus = EXITED;
        this.nextStatus = ENTERING;
      } else {
        initialStatus = ENTERED;
      }
    } else {
      if (props.unmountOnExit || props.mountOnEnter) {
        initialStatus = UNMOUNTED;
      } else {
        initialStatus = EXITED;
      }
    }

    this.state = { status: initialStatus };

    this.nextCallback = null;
  }

  componentDidMount() {
    this.updateStatus();
  }

  componentWillReceiveProps(nextProps) {
    const { status } = this.state;

    if (nextProps.in) {
      if (status === UNMOUNTED) {
        this.setState({ status: EXITED });
      }
      if (status !== ENTERING && status !== ENTERED) {
        this.nextStatus = ENTERING;
      }
    } else {
      if (status === ENTERING || status === ENTERED) {
        this.nextStatus = EXITING;
      }
    }
  }

  componentDidUpdate() {
    this.updateStatus();
  }

  componentWillUnmount() {
    this.cancelNextCallback();
  }

  updateStatus = () => {
    if (this.nextStatus !== null) {
      // nextStatus will always be ENTERING or EXITING.
      this.cancelNextCallback();
      const node = ReactDOM.findDOMNode(this);

      if (this.nextStatus === ENTERING) {
        this.props.onEnter(node);

        this.safeSetState({status: ENTERING}, () => {
          this.props.onEntering(node);

          this.onTransitionEnd(node, () => {
            this.safeSetState({status: ENTERED}, () => {
              this.props.onEntered(node);
            });
          });
        });
      } else {
        this.props.onExit(node);

        this.safeSetState({status: EXITING}, () => {
          this.props.onExiting(node);

          this.onTransitionEnd(node, () => {
            this.safeSetState({status: EXITED}, () => {
              this.props.onExited(node);
            });
          });
        });
      }

      this.nextStatus = null;
    } else if (this.props.unmountOnExit && this.state.status === EXITED) {
      this.setState({ status: UNMOUNTED });
    }
  }

  cancelNextCallback = () => {
    if (this.nextCallback !== null) {
      this.nextCallback.cancel();
      this.nextCallback = null;
    }
  }

  safeSetState = (nextState, callback) => {
    // This shouldn't be necessary, but there are weird race conditions with
    // setState callbacks and unmounting in testing, so always make sure that
    // we can cancel any pending setState callbacks after we unmount.
    this.setState(nextState, this.setNextCallback(callback));
  }

  setNextCallback = (callback) => {
    let active = true;

    this.nextCallback = (event) => {
      if (active) {
        active = false;
        this.nextCallback = null;

        callback(event);
      }
    };

    this.nextCallback.cancel = () => {
      active = false;
    };

    return this.nextCallback;
  }

  onTransitionEnd = (node, handler) => {
    this.setNextCallback(handler);

    if (node) {
      addEventListener(node, transitionEndEvent, this.nextCallback);
      setTimeout(this.nextCallback, this.props.timeout);
    } else {
      setTimeout(this.nextCallback, 0);
    }
  }

  render() {
    const status = this.state.status;
    if (status === UNMOUNTED) {
      return null;
    }

    const {children, className, ...childProps} = this.props;
    Object.keys(Transition.propTypes).forEach(key => delete childProps[key]);

    let transitionClassName;
    if (status === EXITED) {
      transitionClassName = this.props.exitedClassName;
    } else if (status === ENTERING) {
      transitionClassName = this.props.enteringClassName;
    } else if (status === ENTERED) {
      transitionClassName = this.props.enteredClassName;
    } else if (status === EXITING) {
      transitionClassName = this.props.exitingClassName;
    }

    const child = React.Children.only(children);
    return React.cloneElement(
      child,
      {
        ...childProps,
        className: classnames(
          child.props.className,
          className,
          transitionClassName
        )
      }
    );
  }
}

Transition.propTypes = {
  /**
   * Show the component; triggers the enter or exit animation
   */
  in: PropTypes.bool,

  /**
   * Wait until the first "enter" transition to mount the component (add it to the DOM)
   */
  mountOnEnter: PropTypes.bool,

  /**
   * Unmount the component (remove it from the DOM) when it is not shown
   */
  unmountOnExit: PropTypes.bool,

  /**
   * Run the enter animation when the component mounts, if it is initially
   * shown
   */
  transitionAppear: PropTypes.bool,

  /**
   * A Timeout for the animation, in milliseconds, to ensure that a node doesn't
   * transition indefinately if the browser transitionEnd events are
   * canceled or interrupted.
   *
   * By default this is set to a high number (5 seconds) as a failsafe. You should consider
   * setting this to the duration of your animation (or a bit above it).
   */
  timeout: PropTypes.number,

  /**
   * CSS class or classes applied when the component is exited
   */
  exitedClassName: PropTypes.string,
  /**
   * CSS class or classes applied while the component is exiting
   */
  exitingClassName: PropTypes.string,
  /**
   * CSS class or classes applied when the component is entered
   */
  enteredClassName: PropTypes.string,
  /**
   * CSS class or classes applied while the component is entering
   */
  enteringClassName: PropTypes.string,

  /**
   * Callback fired before the "entering" classes are applied
   */
  onEnter: PropTypes.func,
  /**
   * Callback fired after the "entering" classes are applied
   */
  onEntering: PropTypes.func,
  /**
   * Callback fired after the "enter" classes are applied
   */
  onEntered: PropTypes.func,
  /**
   * Callback fired before the "exiting" classes are applied
   */
  onExit: PropTypes.func,
  /**
   * Callback fired after the "exiting" classes are applied
   */
  onExiting: PropTypes.func,
  /**
   * Callback fired after the "exited" classes are applied
   */
  onExited: PropTypes.func
};

// Name the function so it is clearer in the documentation
function noop() {}

Transition.displayName = 'Transition';

Transition.defaultProps = {
  in: false,
  unmountOnExit: false,
  transitionAppear: false,

  timeout: 5000,

  onEnter: noop,
  onEntering: noop,
  onEntered: noop,

  onExit: noop,
  onExiting: noop,
  onExited: noop
};

export default Transition;
