// Styles mostly from Bootstrap.

const Tooltip = styled('div')`
  position: absolute;
  padding: 0 5px;

  ${p => {
    switch (p.placement) {
      case 'left':
        return css`
          margin-left: -3px;
          padding: 0 5px;
        `;
      case 'right':
        return css`
          margin-left: 3px;
          padding: 0 5px;
        `;
      case 'top':
        return css`
          margin-top: -3px;
          padding: 5px 0;
        `;
      case 'bottom':
        return css`
          margin-bottom: 3px;
          padding: 5px 0;
        `;
      default:
        return '';
    }
  }}
`;

const Arrow = styled('div')`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  opacity: 0.75;

  ${p => {
    switch (p.placement) {
      case 'left':
        return css`
          right: 0;
          border-width: 5px 0 5px 5px;
          border-color: transparent transparent transparent #000;
        `;
      case 'right':
        return css`
          left: 0;
          border-width: 5px 5px 5px 0;
          border-color: transparent #232323 transparent transparent;
        `;
      case 'top':
        return css`
          bottom: 0;
          border-width: 5px 5px 0;
          border-color: #232323 transparent transparent transparent;
        `;
      case 'bottom':
        return css`
          top: 0;
          border-width: 0 5px 5px;
          border-color: transparent transparent #232323 transparent;
        `;
      default:
        return '';
    }
  }}
`;

const Body = styled('div')`
  padding: 3px 8px;
  color: #fff;
  text-align: center;
  border-radius: 3px;
  background-color: #000;
  opacity: 0.75;
`;

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
        {({ props, arrowProps, placement }) => (
          <Tooltip {...props} placement={placement}>
            <Arrow
              {...arrowProps}
              placement={placement}
              style={arrowProps.style}
            />
            <Body>
              I&rsquo;m placed to the <strong>{placement}</strong>
            </Body>
          </Tooltip>
        )}
      </Overlay>
    </div>
  );
}

render(<OverlayExample />);
