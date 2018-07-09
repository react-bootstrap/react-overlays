import React from 'react'
import forwardRef from 'react-context-toolbox/lib/forwardRef'

import DropdownContext from './DropdownContext'

function DropdownToggle({ children, ...props }, ref) {
  return (
    <DropdownContext.Consumer>
      {({ show, onToggle, toggleRef }) =>
        children({
          show,
          onToggle,
          props: {
            'aria-haspopup': true,
            'aria-expanded': !!show,
          },
          ref: toggleRef,
        })
      }
    </DropdownContext.Consumer>
  )
}

DropdownToggle.displayName = 'ReactOverlaysDropdownToggle'

export default forwardRef(DropdownToggle, {})
