function RootCloseWrapperExample() {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const handleRootClose = () => setShow(false);

  useRootClose(ref, handleRootClose, {
    disabled: !show
  });

  return (
    <div className="root-close-wrapper-example">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setShow(true)}
      >
        Render RootCloseWrapper
      </button>

      {show && (
        <div ref={ref} className="panel panel-default">
          <div className="panel-body">
            <span>Click anywhere to dismiss me!</span>
          </div>
        </div>
      )}
    </div>
  );
}

render(<RootCloseWrapperExample />);
