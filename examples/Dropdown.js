import React from 'react'
import Button from 'react-bootstrap/lib/Button'
import Dropdown, {
  dropdownMenu,
  dropdownToggle,
} from 'react-overlays/lib/Dropdown'
import RootCloseWrapper from '../src/RootCloseWrapper'

const menuStyle = {
  minWidth: 150,
  position: 'absolute',
  flexDirection: 'column',
  border: '1px solid #e5e5e5',
  backgroundColor: 'white',
  boxShadow: '0 5px 15px rgba(0,0,0,.5)',
  padding: 20,
}

const DropdownMenu = dropdownMenu(
  React.forwardRef(
    ({ show, onClose, popper, alignRight: _, ...props }, ref) => (
      <RootCloseWrapper disabled={!show} onRootClose={onClose}>
        <div
          ref={ref}
          {...props}
          style={{
            ...menuStyle,
            ...popper.styles,
            display: show ? 'flex' : 'none',
          }}
        >
          <button onClick={onClose} style={{ textAlign: 'left' }}>
            Item 1
          </button>
          <button onClick={onClose} style={{ textAlign: 'left' }}>
            Item 2
          </button>
        </div>
      </RootCloseWrapper>
    )
  )
)

const DropdownToggle = dropdownToggle(
  React.forwardRef(({ onToggle, show, children, ...props }, ref) => (
    <Button ref={ref} {...props} onClick={onToggle}>
      {children}
    </Button>
  ))
)

const DropdownButton = ({ show, onToggle, drop, alignRight, title, role }) => (
  <Dropdown
    show={show}
    onToggle={onToggle}
    drop={drop}
    alignRight={alignRight}
    itemSelector="button:not(:disabled)"
  >
    {innerProps => (
      <span {...innerProps}>
        <DropdownToggle id="example-toggle">{title}</DropdownToggle>
        <DropdownMenu role={role} />
      </span>
    )}
  </Dropdown>
)

class DropdownExample extends React.Component {
  state = { show: false }

  handleToggle = show => {
    this.setState({ show })
  }

  render() {
    const { show } = this.state
    return (
      <div className="dropdown-example">
        <DropdownButton
          show={show}
          onToggle={this.handleToggle}
          title={`${show ? 'Close' : 'Open'} Dropdown`}
        />
        <DropdownButton alignRight title="Align right" />

        <DropdownButton drop="up" title="Drop up" />
        <DropdownButton role="menu" title="Role 'menu'" />

        <br />
      </div>
    )
  }
}

export default DropdownExample
