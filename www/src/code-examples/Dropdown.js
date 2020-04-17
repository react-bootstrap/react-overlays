const MenuContainer = styled('ButtonToolbar')`
  display: ${(p) => (p.show ? 'flex' : 'none')};
  min-width: 150px;
  position: absolute;
  flex-direction: column;
  border: 1px solid #e5e5e5;
  background-color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  padding: 20px;
`;

const Menu = ({ role }) => {
  const { show, onClose, props } = useDropdownMenu({ flip: true });
  return (
    <MenuContainer {...props} role={role} show={show}>
      <button type="button" onClick={onClose} style={{ textAlign: 'left' }}>
        Item 1
      </button>
      <button type="button" onClick={onClose} style={{ textAlign: 'left' }}>
        Item 2
      </button>
    </MenuContainer>
  );
};

const Toggle = ({ id, children }) => {
  const [props, { show, toggle }] = useDropdownToggle();
  return (
    <button
      type="button"
      className="btn btn-primary"
      id={id}
      {...props}
      onClick={toggle}
    >
      {children}
    </button>
  );
};

const DropdownButton = ({ show, onToggle, drop, alignEnd, title, role }) => (
  <Dropdown
    show={show}
    onToggle={onToggle}
    drop={drop}
    alignEnd={alignEnd}
    itemSelector="button:not(:disabled)"
  >
    {({ props }) => (
      <div {...props} className="position-relative d-inline-block">
        <Toggle id="example-toggle">{title}</Toggle>
        <Menu role={role} />
      </div>
    )}
  </Dropdown>
);

const ButtonToolbar = styled('div')`
  & > * + * {
    margin-left: 12px;
  }
`;

function DropdownExample() {
  const [show, setShow] = useState(false);

  return (
    <ButtonToolbar className="dropdown-example">
      <DropdownButton
        show={show}
        onToggle={(nextShow) => setShow(nextShow)}
        title={`${show ? 'Close' : 'Open'} Dropdown`}
      />
      <DropdownButton alignEnd title="Align right" />

      <DropdownButton drop="up" title="Drop up" />
      <DropdownButton role="menu" title="Role 'menu'" />
    </ButtonToolbar>
  );
}

render(<DropdownExample />);
