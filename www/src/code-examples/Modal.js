let rand = () => Math.floor(Math.random() * 20) - 10;

const Backdrop = styled('div')`
  position: fixed;
  z-index: 1040;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #000;
  opacity: 0.5;
`;

// we use some pseudo random coords so nested modals
// don't sit right on top of each other.
const RandomlyPositionedModal = styled(Modal)`
  position: fixed;
  width: 400px;
  z-index: 1040;
  top: ${() => 50 + rand()}%;
  left: ${() => 50 + rand()}%;
  border: 1px solid #e5e5e5;
  background-color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  padding: 20px;
`;

function ModalExample() {
  const [show, setShow] = useState(false);

  const renderBackdrop = (props) => <Backdrop {...props} />;

  return (
    <div className="modal-example">
      <button
        type="button"
        className="btn btn-primary mb-4"
        onClick={() => setShow(true)}
      >
        Open Modal
      </button>
      <p>Click to get the full Modal experience!</p>

      <RandomlyPositionedModal
        show={show}
        onHide={() => setShow(false)}
        renderBackdrop={renderBackdrop}
        aria-labelledby="modal-label"
      >
        <div>
          <h4 id="modal-label">Text in a modal</h4>
          <p>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </p>
          <ModalExample />
        </div>
      </RandomlyPositionedModal>
    </div>
  );
}

render(<ModalExample />);
