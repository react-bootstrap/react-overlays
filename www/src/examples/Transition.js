const FADE_DURATION = 200;

injectCss(`
  .fade {
    opacity: 0;
    transition: opacity ${FADE_DURATION}ms linear;
  }

  .show {
    opacity: 1;
  }

  .transition-example-modal {
    position: fixed;
    z-index: 1040;
    top: 0; bottom: 0; left: 0; right: 0;
  }

  .transition-example-backdrop {
    position: fixed;
    top: 0; bottom: 0; left: 0; right: 0;
    background-color: #000;
  }

  .transition-example-backdrop.fade.in {
    opacity: 0.5;
  }

  .transition-example-dialog {
    position: absolute;
    width: 400;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #e5e5e5;
    background-color: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
    padding: 20px;
  }
`);

const fadeStyles = {
  entering: 'show',
  entered: 'show'
};

const Fade = ({ children, ...props }) => (
  <Transition {...props} timeout={FADE_DURATION}>
    {(status, innerProps) =>
      React.cloneElement(children, {
        ...innerProps,
        className: `fade ${fadeStyles[status]} ${children.props.className}`
      })
    }
  </Transition>
);

class TransitionExample extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { showModal: false };
    this.toggleModal = () => {
      this.setState(state => ({ showModal: !state.showModal }));
    };

    this.toggleTooltip = () => {
      this.setState(state => ({ showTooltip: !state.showTooltip }));
    };

    this.tooltipRef = React.createRef();
  }

  render() {
    return (
      <div className="transition-example">
        <button
          type="button"
          className="btn btn-primary"
          onClick={this.toggleModal}
        >
          Show Animated Modal
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={this.toggleTooltip}
          ref={this.tooltipRef}
        >
          Show Tooltip
        </button>

        <Overlay
          placement="top"
          transition={Fade}
          show={this.state.showTooltip}
          modifiers={{ offset: { enabled: true, offset: '0 5px' } }}
          target={() => this.tooltipRef.current}
        >
          {({ props: { ref, style } }) => (
            <div ref={ref} className="tooltip tooltip-inner" style={style}>
              Hello there
            </div>
          )}
        </Overlay>

        <Modal
          transition={Fade}
          backdropTransition={Fade}
          className="transition-example-modal"
          backdropClassName="transition-example-backdrop"
          show={this.state.showModal}
          onHide={this.toggleModal}
        >
          <div className="transition-example-dialog">
            <h4 id="modal-label">I&apos;m fading in!</h4>
            <p>
              Anim pariatur cliche reprehenderit, enim eiusmod high life
              accusamus terry richardson ad squid. Nihil anim keffiyeh
              helvetica, craft beer labore wes anderson cred nesciunt sapiente
              ea proident.
            </p>
          </div>
        </Modal>
      </div>
    );
  }
}

render(<TransitionExample />);
