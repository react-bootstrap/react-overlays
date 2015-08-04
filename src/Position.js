import React, { cloneElement } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import ownerDocument from './utils/ownerDocument';
import getContainer from './utils/getContainer';

import { calcOverlayPosition } from './utils/overlayPositionUtils';

import mountable from 'react-prop-types/lib/mountable';

/**
 * The Position component calulates the corrdinates for its child, to
 * position it relative to a `target` component or node. Useful for creating callouts and tooltips,
 * the Position component injects a `style` props with `left` and `top` values for positioning your component.
 *
 * It also injects "arrow" `left`, and `top` values for styling callout arrows for giving your components
 * a sense of directionality.
 */
class Position extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      positionLeft: null,
      positionTop: null,
      arrowOffsetLeft: null,
      arrowOffsetTop: null
    };

    this._needsFlush = false;
    this._lastTarget = null;
  }

  componentDidMount() {
    this.updatePosition();
  }

  componentWillReceiveProps() {
    this._needsFlush = true;
  }

  componentDidUpdate(prevProps) {
    if (this._needsFlush) {
      this._needsFlush = false;
      this.updatePosition(prevProps.placement !== this.props.placement);
    }
  }

  componentWillUnmount() {
    // Probably not necessary, but just in case holding a reference to the
    // target causes problems somewhere.
    this._lastTarget = null;
  }

  render() {
    const {children, className, ...props} = this.props;
    const {positionLeft, positionTop, ...arrowPosition} = this.state;

    const child = React.Children.only(children);
    return cloneElement(
      child,
      {
        ...props,
        ...arrowPosition,
        //do we need to also forward positionLeft and positionTop if they are set to style?
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

  getTargetSafe() {
    if (!this.props.target) {
      return null;
    }

    const target = this.props.target(this.props);
    if (!target) {
      // This is so we can just use === check below on all falsy targets.
      return null;
    }

    return target;
  }

  updatePosition(placementChanged) {
    const target = this.getTargetSafe();

    if (target === this._lastTarget && !placementChanged) {
      return;
    }

    this._lastTarget = target;

    if (!target) {
      this.setState({
        positionLeft: null,
        positionTop: null,
        arrowOffsetLeft: null,
        arrowOffsetTop: null
      });

      return;
    }

    const overlay = ReactDOM.findDOMNode(this);
    const container = getContainer(this.props.container, ownerDocument(this).body);

    this.setState(calcOverlayPosition(
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
   * Function mapping props to a DOM node the component is positioned next to
   */
  target: React.PropTypes.func,
  /**
   * "offsetParent" of the component
   */
  container: mountable,
  /**
   * Minimum spacing in pixels between container border and component border
   */
  containerPadding: React.PropTypes.number,
  /**
   * How to position the component relative to the target
   */
  placement: React.PropTypes.oneOf(['top', 'right', 'bottom', 'left'])
};

Position.displayName = 'Position';

Position.defaultProps = {
  containerPadding: 0,
  placement: 'right'
};

export default Position;
