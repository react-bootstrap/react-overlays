import React from 'react';
import ReactDOM from 'react-dom';

import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-overlays/lib/Overlay';

// Styles mostly from Bootstrap.
const styles = {
  tooltip: {
    position: 'absolute',
    padding: '0 5px'
  },

  inner: {
    padding: '3px 8px',
    color: '#fff',
    textAlign: 'center',
    borderRadius: 3,
    backgroundColor: '#000',
    opacity: .75
  },

  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderStyle: 'solid',
    opacity: .75
  },
};

const placementStyles = {
  left: {
    tooltip: {
      marginLeft: -3,
      padding: '0 5px',
    },

    arrow: {
      right: 0,
      marginTop: -5,
      borderWidth: '5px 0 5px 5px',
      borderLeftColor: '#000',
    },
  },

  right: {
    tooltip: {
      marginRight: 3,
      padding: '0 5px',
    },

    arrow: {
      left: 0,
      marginTop: -5,
      borderWidth: '5px 5px 5px 0',
      borderRightColor: '#000',
    },
  },

  top: {
    tooltip: {
      marginTop: -3,
      padding: '5px 0',
    },

    arrow: {
      bottom: 0,
      marginLeft: -5,
      borderWidth: '5px 5px 0',
      borderTopColor: '#000',
    },
  },

  bottom: {
    tooltip: {
      marginBottom: 3,
      padding: '5px 0',
    },

    arrow: {
      top: 0,
      marginLeft: -5,
      borderWidth: '0 5px 5px',
      borderBottomColor: '#000',
    },
  },
};

const PLACEMENTS = ['left', 'top', 'right', 'bottom'];

function Tooltip({ placement, position, arrowPosition, children }) {
  return (
    <div
      style={{
        ...styles.tooltip,
        ...placementStyles[placement].tooltip,
        ...position
      }}
    >
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

class OverlayExample extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      show: false,
      placement: null,
    };
  }


  onClick = () => {
    const { placement } = this.state;
    const nextPlacement = PLACEMENTS[PLACEMENTS.indexOf(placement) + 1];

    return this.setState({
      show: !!nextPlacement,
      placement: nextPlacement,
    });
  };

  render() {
    const { show, placement } = this.state;

    return (
      <div className="overlay-example">
        <Button
          bsStyle="primary"
          ref={(c) => { this.target = c; }}
          onClick={this.onClick}
        >
          I am an Overlay target
        </Button>
        <p>
          Keep clicking to see the placement change.
        </p>

        <Overlay
          show={show}
          onHide={() => this.setState({ show: false })}
          placement={placement}
          container={this}
          target={() => ReactDOM.findDOMNode(this.target)}
        >
          <Tooltip>
            I&rsquo;m placed to the <strong>{placement}</strong>.
          </Tooltip>
        </Overlay>
      </div>
    );
  }
}

export default OverlayExample;
