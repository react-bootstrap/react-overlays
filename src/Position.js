import classNames from 'classnames';
import React, { cloneElement } from 'react';
import ReactDOM from 'react-dom';
import componentOrElement from 'react-prop-types/lib/componentOrElement';

import calculatePosition from './utils/calculatePosition';
import getContainer from './utils/getContainer';
import ownerDocument from './utils/ownerDocument';

/**
 * The Position component calculates the coordinates for its child, to position
 * it relative to a `target` component or node. Useful for creating callouts
 * and tooltips, the Position component injects a `style` props with `left` and
 * `top` values for positioning your component.
 *
 * It also injects "arrow" `left`, and `top` values for styling callout arrows
 * for giving your components a sense of directionality.
 */
class Position extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      positionLeft: 0,
      positionTop: 0,
      arrowOffsetLeft: null,
      arrowOffsetTop: null
    };

    this._needsFlush = false;
    this._lastTarget = null;
  }

  componentDidMount() {
    this.updatePosition(this.getTarget());
  }

  componentWillReceiveProps() {
    this._needsFlush = true;
  }

  componentDidUpdate(prevProps) {
    if (this._needsFlush) {
      this._needsFlush = false;
      this.maybeUpdatePosition(this.props.placement !== prevProps.placement);
    }
  }

  render() {
    const {children, className, ...props} = this.props;
    const {positionLeft, positionTop, ...arrowPosition} = this.state;

    // These should not be forwarded to the child.
    delete props.target;
    delete props.container;
    delete props.containerPadding;
    delete props.shouldUpdatePosition;

    const child = React.Children.only(children);
    return cloneElement(
      child,
      {
        ...props,
        ...arrowPosition,
        // FIXME: Don't forward `positionLeft` and `positionTop` via both props
        // and `props.style`.
        positionLeft,
        positionTop,
        className: classNames(className, child.props.className),
        style: {
          ...child.props.style,
          left: positionLeft,
          top: positionTop
        }
      }
    );
  }

  getTarget() {
    const { target } = this.props;
    const targetElement = typeof target === 'function' ? target() : target;
    return targetElement && ReactDOM.findDOMNode(targetElement) || null;
  }

  maybeUpdatePosition(placementChanged) {
    const target = this.getTarget();

    if (
      !this.props.shouldUpdatePosition &&
      target === this._lastTarget &&
      !placementChanged
    ) {
      return;
    }

    this.updatePosition(target);
  }

  updatePosition(target) {
    this._lastTarget = target;

    if (!target) {
      this.setState({
        positionLeft: 0,
        positionTop: 0,
        arrowOffsetLeft: null,
        arrowOffsetTop: null
      });

      return;
    }

    const overlay = ReactDOM.findDOMNode(this);
    const container = getContainer(
      this.props.container, ownerDocument(this).body
    );

    this.setState(calculatePosition(
      this.props.placement,
      overlay,
      target,
      container,
      this.props.containerPadding
    ));
  }
}

Position.propTypes = {
  /**
   * A node, element, or function that returns either. The child will be
   * be positioned next to the `target` specified.
   */
  target: React.PropTypes.oneOfType([
    componentOrElement, React.PropTypes.func
  ]),

  /**
   * "offsetParent" of the component
   */
  container: React.PropTypes.oneOfType([
    componentOrElement, React.PropTypes.func
  ]),
  /**
   * Minimum spacing in pixels between container border and component border
   */
  containerPadding: React.PropTypes.number,
  /**
   * How to position the component relative to the target
   */
  placement: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  /**
   * Whether the position should be changed on each update
   */
  shouldUpdatePosition: React.PropTypes.bool
};

Position.displayName = 'Position';

Position.defaultProps = {
  containerPadding: 0,
  placement: 'right',
  shouldUpdatePosition: false
};

export default Position;
