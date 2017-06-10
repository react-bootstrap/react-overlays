import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/lib/Button';
import Position from 'react-overlays/lib/Position';

const styles = {
  tooltip: {
    position: 'absolute',
  },

  inner: {
    margin: 5,
    backgroundColor: '#555',
    borderRadius: 3,
    color: 'white',
    padding: '2px 5px',
  },

  arrow: {
    position: 'absolute',
    backgroundColor: '#555',
    borderRadius: '50%',
    width: 5,
    height: 5,
  },
};

const placementStyles = {
  left: {
    arrow: { right: 0, marginTop: -3 },
  },
  right: {
    arrow: { left: 0, marginTop: -3 },
  },
  top: {
    arrow: { bottom: 0, marginLeft: -3 },
  },
  bottom: {
    arrow: { top: 0, marginLeft: -3 },
  },
};

const PLACEMENTS = ['left', 'top', 'right', 'bottom'];

function Tooltip({ placement, position, arrowPosition, children }) {
  return (
    <div style={{...styles.tooltip, ...position}}>
      <div
        style={{
          ...styles.arrow,
          ...placementStyles[placement].arrow,
          ...arrowPosition,
        }}
      />
      <div style={{...styles.inner}}>
        {children}
      </div>
    </div>
  );
}

class PositionExample extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      placement: PLACEMENTS[0],
    };
  }

  onClick = () => {
    const { placement } = this.state;
    const nextPlacement = PLACEMENTS[PLACEMENTS.indexOf(placement) + 1];

    this.setState({
      placement: nextPlacement || PLACEMENTS[0],
    });
  };

  render() {
    const { placement } = this.state;

    return (
      <div className="overlay-example">
        <Button
          bsStyle="primary"
          ref={(c) => { this.target = c; }}
          onClick={this.onClick}
        >
          I am a Position target
        </Button>
        <p>
          Keep clicking to see the placement change.
        </p>

        <Position
          container={this}
          placement={placement}
          target={() => ReactDOM.findDOMNode(this.target)}
        >
          <Tooltip>
            I&rsquo;m placed to the <strong>{placement}</strong>.
          </Tooltip>
        </Position>
      </div>
    );
  }
}

export default PositionExample;
