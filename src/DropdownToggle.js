import React from 'react'
import ReactDOM from 'react-dom'
import forwardRef from 'react-context-toolbox/lib/forwardRef'

import { Reference } from '@react-bootstrap/react-popper'
import DropdownContext from './DropdownContext'

function DropdownToggle({ children, ...props }, ref) {
  return (
    <DropdownContext.Consumer>
      {({ show, onToggle }) => (
        <Reference {...props}>
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
        </Reference>
      )}
    </DropdownContext.Consumer>
  )
}

DropdownToggle.displayName = 'ReactOverlaysDropdownToggle'

export default forwardRef(DropdownToggle, {})
