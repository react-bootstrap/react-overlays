import React from 'react'
import Button from 'react-bootstrap/lib/Button'
import Dropdown from 'react-overlays/src/Dropdown'

const dropdownStyle = {
  position: 'relative',
  display: 'inline-block',
}
const menuStyle = {
  minWidth: 150,
  position: 'absolute',
  flexDirection: 'column',
  border: '1px solid #e5e5e5',
  backgroundColor: 'white',
  boxShadow: '0 5px 15px rgba(0,0,0,.5)',
  padding: 20,
}

const Menu = props => (
  <Dropdown.Menu flip>
    {({ popper, show, onClose, ref, labelledBy }) => (
      <div
        {...props}
        ref={ref}
        style={{
          ...menuStyle,
          ...popper.style,
          display: show ? 'flex' : 'none',
        }}
        aria-labelledby={labelledBy}
      >
        <button onClick={onClose} style={{ textAlign: 'left' }}>
          Item 1
        </button>
        <button onClick={onClose} style={{ textAlign: 'left' }}>
          Item 2
        </button>
      </div>
    )}
  </Dropdown.Menu>
)

const Toggle = props => (
  <Dropdown.Toggle>
    {({ onToggle, show, ref }) => (
      <Button {...props} onClick={onToggle} ref={ref} />
    )}
  </Dropdown.Toggle>
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
      <div {...innerProps} style={dropdownStyle}>
        <Toggle id="example-toggle">{title}</Toggle>
        <Menu role={role} />
      </div>
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
          drop="up"
          onToggle={this.handleToggle}
          title={`${show ? 'Close' : 'Open'} Dropdown`}
        />
        {/* <DropdownButton alignRight title="Align right" />

        <DropdownButton drop="up" title="Drop up" />
        <DropdownButton role="menu" title="Role 'menu'" /> */}
      </div>
    )
  }
}

export default DropdownExample
