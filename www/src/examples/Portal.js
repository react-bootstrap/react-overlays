function PortalExample() {
  const [show, setShow] = useState(false);
  const containerRef = useRef(null);

  let child = <span>But I actually render here!</span>;

  return (
    <div className="portal-example">
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setShow(true)}
      >
        Render Child
      </button>
      <div className="card card-body mb-4">
        <span>It looks like I will render in here.</span>

        <Portal container={containerRef}>{show && child}</Portal>
      </div>

      <div className="card card-body" ref={containerRef} />
    </div>
  );
}

render(<PortalExample />);
