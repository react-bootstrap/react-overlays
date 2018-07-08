import React from 'react'

const DropdownContext = React.createContext({
  setMenuElement() {},
  setToggleElement() {},
  onToggle() {},
  popper: {},
  toggleId: undefined,
  show: null,
  alignRight: null,
})

export default DropdownContext
