import React from 'react';
import { findDOMNode } from 'react-dom';
import Button from 'react-bootstrap/lib/Button';
import Position from 'react-overlays/lib/Position';


const OverlayStyle = {
  position: 'absolute',
  width: 100
};

const OverlayInnerStyle = {
  margin: 5,
  backgroundColor: '#555',
  borderRadius: 3,
  color: 'white',
  padding: '2px 5px'
};

const CalloutStyle = {
  position: 'absolute',
  backgroundColor: '#555',
  borderRadius: '50%',
  width: 5,
  height: 5
};

const PlacementStyles = {
  left: { right: 0, marginTop: -3 },
  right: { left: 0, marginTop: -3 },
  top: { bottom: 0, marginLeft: -3 },
  bottom: { top: 0, marginLeft: -3 }
};



const ToolTip = props => {
  let placementStyle = PlacementStyles[props.placement.split(' ')[0]];

  let {
    style,
    arrowOffsetLeft: left = placementStyle.left,
    arrowOffsetTop: top = placementStyle.top,
    children
  } = props;

  return (
    <div style={{...OverlayStyle, ...style}}>
      <div style={{...CalloutStyle, ...placementStyle, left, top }}/>
      <div style={{...OverlayInnerStyle}}>
        {children}
      </div>
    </div>
  );
};

class PositionExample extends React.Component {

  state = { placement: 'left' };

  toggle = () => {
    let placements = [
      'left', 'left top', 'left bottom',
      'top', 'top left', 'top right',
      'right', 'right top', 'right bottom',
      'bottom', 'bottom left', 'bottom right'
    ];

    let placement = this.state.placement;
    placement = placements[placements.indexOf(placement) + 1] || placements[0];

    return this.setState({ placement });
  }

  render(){

    return (
      <div className='overlay-example'>
        <Button bsStyle='primary' ref='target' onClick={this.toggle}>
          I am an Position target
        </Button>
        <p>
          keep clicking to see the placement change
        </p>

        <Position
          container={this}
          placement={this.state.placement}
          target={props => findDOMNode(this.refs.target)}
        >
          <ToolTip>
            I'm placed to the: <strong>{this.state.placement}</strong>
          </ToolTip>
        </Position>
      </div>
    );
  }
}

export default PositionExample;
