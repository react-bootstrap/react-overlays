import classNames from 'classnames';
import Popper from 'popper.js';
import PropTypes from 'prop-types';
import componentOrElement from 'prop-types-extra/lib/componentOrElement';
import React from 'react';
import ReactDOM from 'react-dom';

import getContainer from './utils/getContainer';
import ownerDocument from './utils/ownerDocument';

const displayName = 'Position';

const propTypes = {
  /**
   * A node, element, or function that returns either. The child will be
   * be positioned next to the `target` specified.
   */
  target: PropTypes.oneOfType([componentOrElement, PropTypes.func]),
  /**
   * How to position the component relative to the target
   */
  placement: PropTypes.oneOf([
    // These are inlined from Popper.placements for docgen.
    'auto-start', 'auto', 'auto-end',
    'top-start', 'top', 'top-end',
    'right-start', 'right', 'right-end',
    'bottom-end', 'bottom', 'bottom-start',
    'left-end', 'left', 'left-start',
  ]),
  /**
   * "offsetParent" of the component
   */
  container: PropTypes.oneOfType([componentOrElement, PropTypes.func]),
  /**
   * Minimum spacing in pixels between container border and component border
   */
  containerPadding: PropTypes.number,
  /**
   * Whether the position should be changed on each update
   */
  shouldUpdatePosition: PropTypes.bool,
  /**
   * @private
   */
  children: PropTypes.element.isRequired,
};

const defaultProps = {
  placement: 'right',
  containerPadding: 0,
  shouldUpdatePosition: false,
};

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

    this.state = this.getNullState();

    this._needsFlush = false;
    this._lastTarget = null;

    this.popper = null;
  }

  componentDidMount() {
    this.updatePosition(this.getTarget());
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.placement !== this.props.placement) {
      // Do our best to re-render with the intended next placement.
      this.setState({
        placement: nextProps.placement,
      });
    }

    this._needsFlush = true;
  }

  componentDidUpdate(prevProps) {
    if (!this._needsFlush) {
      return;
    }

    this._needsFlush = false;

    const target = this.getTarget();
    if (
      target !== this._lastTarget ||
      this.props.placement !== prevProps.placement ||
      this.props.container !== prevProps.container ||
      this.props.containerPadding !== prevProps.containerPadding ||
      this.props.shouldUpdatePosition !== prevProps.shouldUpdatePosition
    ) {
      this.updatePosition(target);
    } else if (
      this.popper &&
      this.props.shouldUpdatePosition &&
      this.props.children !== prevProps.children
    ) {
      this.popper.scheduleUpdate();
    }
  }

  componentWillUnmount() {
    if (this.popper) {
      this.popper.destroy();
    }
  }

  onUpdate = ({ placement, offsets }) => {
    const { popper, reference } = offsets;

    let arrowPositionDirection;
    let arrowPositionDimension;

    if (placement === 'left' || placement === 'right') {
      arrowPositionDirection = 'top';
      arrowPositionDimension = 'height';
    } else {
      arrowPositionDirection = 'left';
      arrowPositionDimension = 'width';
    }

    const popperPosition = popper[arrowPositionDirection];
    const popperSize = popper[arrowPositionDimension];
    const referencePosition = reference[arrowPositionDirection];
    const referenceSize = reference[arrowPositionDimension];

    const popperPositionMin = referencePosition - popperSize;
    const popperPositionMax = referencePosition + referenceSize;
    const arrowPositionRelReverse =
      (popperPosition - popperPositionMin) /
      (popperPositionMax - popperPositionMin);
    const arrowPosition = (1 - arrowPositionRelReverse) * popperSize;

    // A change in placement might cause the positioned element to rerender, so
    // schedule a recalculation of the position.
    if (placement !== this.state.placement) {
      this.popper.scheduleUpdate();
    }

    this.setState({
      placement,
      position: {
        left: popper.left,
        top: popper.top,
      },
      arrowPosition: {
        [arrowPositionDirection]: arrowPosition,
      },
    });
  };

  getNullState() {
    return {
      placement: this.props.placement,
      position: { visibility: 'hidden' },
      arrowPosition: null,
    };
  }

  getTarget() {
    let { target } = this.props;
    target = typeof target === 'function' ? target() : target;
    return target && ReactDOM.findDOMNode(target) || null;
  }

  updatePosition(target) {
    if (this.popper) {
      this.popper.destroy();
    }

    this._lastTarget = target;

    if (!target) {
      this.setState(this.getNullState());

      return;
    }

    const {
      placement, shouldUpdatePosition, container, containerPadding,
    } = this.props;
    const containerNode = getContainer(container, ownerDocument(this).body);

    this.popper = new Popper(
      target,
      ReactDOM.findDOMNode(this),
      {
        placement,
        eventsEnabled: shouldUpdatePosition,
        modifiers: {
          preventOverflow: {
            boundariesElement: containerNode,
            padding: containerPadding,
          },
          flip: {
            enabled: placement.indexOf('auto') === 0,
          },
          applyStyle: {
            enabled: false,
          },
        },
        onCreate: this.onUpdate,
        onUpdate: this.onUpdate,
      },
    );
  }

  render() {
    const { className, children, ...props } = this.props;
    const child = React.Children.only(children);

    delete props.target;
    delete props.placement;
    delete props.container;
    delete props.containerPadding;
    delete props.shouldUpdatePosition;

    return React.cloneElement(child, {
      ...props,
      ...this.state,
      className: classNames(child.props.className, className),
    });
  }
}

Position.displayName = displayName;
Position.propTypes = propTypes;
Position.defaultProps = defaultProps;

export default Position;
