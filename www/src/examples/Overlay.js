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
    opacity: 0.75
  },

  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    opacity: 0.75
  }
};

const placementStyles = {
  left: {
    tooltip: {
      marginLeft: -3,
      padding: '0 5px'
    },

    arrow: {
      right: 0,
      borderWidth: '5px 0 5px 5px',
      borderColor: 'transparent transparent transparent #000'
    }
  },

  right: {
    tooltip: {
      marginLeft: 3,
      padding: '0 5px'
    },

    arrow: {
      left: '0',
      borderWidth: '5px 5px 5px 0',
      borderColor: 'transparent #232323 transparent transparent'
    }
  },

  top: {
    tooltip: {
      marginTop: -3,
      padding: '5px 0'
    },

    arrow: {
      bottom: 0,
      borderWidth: '5px 5px 0',
      borderColor: '#232323 transparent transparent transparent'
    }
  },

  bottom: {
    tooltip: {
      marginBottom: 3,
      padding: '5px 0'
    },

    arrow: {
      top: 0,
      borderWidth: '0 5px 5px',
      borderColor: 'transparent transparent #232323 transparent'
    }
  }
};

const PLACEMENTS = ['left', 'top', 'right', 'bottom'];

const initialSstate = {
  show: false,
  placement: null
};

function reducer(state, [type, payload]) {
  switch (type) {
    case 'placement':
      return { show: !!payload, placement: payload };
    case 'hide':
      return { ...state, show: false, placement: null };
    default:
      return state;
  }
}

function OverlayExample() {
  const [{ show, placement }, dispatch] = useReducer(reducer, initialSstate);
  const triggerRef = useRef(null);
  const containerRef = useRef(null);

  const handleClick = () => {
    const nextPlacement = PLACEMENTS[PLACEMENTS.indexOf(placement) + 1];

    dispatch(['placement', nextPlacement]);
  };

  return (
    <div className="overlay-example" ref={containerRef}>
      <button
        type="button"
        className="btn btn-primary"
        id="overlay-toggle"
        ref={triggerRef}
        onClick={handleClick}
      >
        I am an Overlay target
      </button>
      <p>Keep clicking to see the placement change.</p>

      <Overlay
        show={show}
        rootClose
        onHide={() => dispatch('hide')}
        placement={placement}
        container={containerRef}
        target={triggerRef}
      >
        {({ props, arrowProps, placement }) => {
          const placementStyle = placementStyles[placement];
          return (
            <div
              {...props}
              style={{
                ...styles.tooltip,
                ...props.style,
                ...placementStyle.tooltip
              }}
            >
              <div
                {...arrowProps}
                style={{
                  ...styles.arrow,
                  ...arrowProps.style,
                  ...placementStyle.arrow
                }}
              />
              <div style={{ ...styles.inner }}>
                I&rsquo;m placed to the <strong>{placement}</strong>
              </div>
            </div>
          );
        }}
      </Overlay>
    </div>
  );
}

render(<OverlayExample />);
