import React from 'react'
import ReactDOM from 'react-dom'
import forwardRef from 'react-context-toolbox/lib/forwardRef'

import * as Popper from 'react-popper'
import DropdownContext from './DropdownContext'

const DropdownToggle = forwardRef(
  ({ children, ...props }, ref) => (
    <DropdownContext.Consumer>
      {({ show, onToggle }) => (
        <Popper.Reference {...props}>
          {({ ref }) => {
            return children({
              show,
              onToggle,
              ref:
                ref._ref ||
                (ref._ref = function $ref(current) {
                  return ref(ReactDOM.findDOMNode(current))
                }),
            })
          }}
        </Popper.Reference>
      )}
    </DropdownContext.Consumer>
  ),
  { displayName: 'DropdownToggle' }
)

export default DropdownToggle
