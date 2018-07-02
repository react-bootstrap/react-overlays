import React from 'react'
import mapContextToProps from 'react-context-toolbox/lib/mapContextToProps'

const DropdownContext = React.createContext({
  setMenuElement() {},
  setToggleElement() {},
  onToggle() {},
  popper: {},
  toggleId: undefined,
  show: null,
  alignRight: null,
})

export const dropdownToggle = Component =>
  mapContextToProps(
    DropdownContext,
    ({ toggleId, setToggleElement, onToggle, show }, props) => ({
      ref: setToggleElement,
      id: toggleId,
      onToggle,
      show,
    }),
    Component
  )

export const dropdownMenu = Component =>
  mapContextToProps(
    DropdownContext,
    (
      { toggleId, show, alignRight, setMenuElement, onToggle, popper },
      props
    ) => ({
      popper,
      ref: setMenuElement,
      'aria-labelledby': toggleId,
      show: show == null ? props.show : show,
      onClose: e => onToggle(false, e),
      alignRight: alignRight == null ? props.alignRight : alignRight,
    }),
    Component
  )

export default DropdownContext
