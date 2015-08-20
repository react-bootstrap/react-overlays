import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import OverlayTrigger from 'react-overlays/OverlayTrigger';

// Styles Mostly from Bootstrap
const TooltipStyle = {
  position: 'absolute',
  padding: '0 5px'
};

const TooltipInnerStyle = {
  padding: '3px 8px',
  color: '#fff',
  textAlign: 'center',
  borderRadius: 3,
  backgroundColor: '#000',
  opacity: .75
};

const TooltipArrowStyle = {
  position: 'absolute',
  width: 0, height: 0,
  borderRightColor: 'transparent',
  borderLeftColor: 'transparent',
  borderTopColor: 'transparent',
  borderBottomColor: 'transparent',
  borderStyle: 'solid',
  opacity: .75
};

const PlacementStyles = {
  left: {
    tooltip: { marginLeft: -3, padding: '0 5px' },
    arrow: {
      right: 0, marginTop: -5, borderWidth: '5px 0 5px 5px', borderLeftColor: '#000'
    }
  },
  right: {
    tooltip: { marginRight: 3, padding: '0 5px' },
    arrow: { left: 0, marginTop: -5, borderWidth: '5px 5px 5px 0', borderRightColor: '#000' }
  },
  top: {
    tooltip: { marginTop: -3, padding: '5px 0' },
    arrow: { bottom: 0, marginLeft: -5, borderWidth: '5px 5px 0', borderTopColor: '#000' }
  },
  bottom: {
    tooltip: { marginBottom: 3, padding: '5px 0' },
    arrow: { top: 0, marginLeft: -5, borderWidth: '0 5px 5px', borderBottomColor: '#000' }
  }
};

class ToolTip {
  render(){
    let placementStyle = PlacementStyles[this.props.placement];

    let {
      style,
      arrowOffsetLeft: left = placementStyle.arrow.left,
      arrowOffsetTop: top = placementStyle.arrow.top,
      ...props } = this.props;

    return (
      <div style={{...TooltipStyle, ...placementStyle.tooltip, ...style}}>
        <div style={{...TooltipArrowStyle, ...placementStyle.arrow, left, top }}/>
        <div style={TooltipInnerStyle}>
          { props.children }
        </div>
      </div>
    );
  }
}

const OverlayTriggerExample = React.createClass({
  render(){

    const tooltip = (
      <ToolTip><strong>Holy guacamole!</strong> Check this info.</ToolTip>
    )

    return (
      <div className='overlay-trigger-example'>
        <OverlayTrigger placement='left' overlay={tooltip}>
          <Button bsStyle='default'>Holy guacamole!</Button>
        </OverlayTrigger>

        <OverlayTrigger placement='top' overlay={tooltip}>
          <Button bsStyle='default'>Holy guacamole!</Button>
        </OverlayTrigger>

        <OverlayTrigger placement='bottom' overlay={tooltip}>
          <Button bsStyle='default'>Holy guacamole!</Button>
        </OverlayTrigger>

        <OverlayTrigger placement='right' overlay={tooltip}>
          <Button bsStyle='default'>Holy guacamole!</Button>
        </OverlayTrigger>
      </div>
    )
  }
});

export default OverlayTriggerExample;
