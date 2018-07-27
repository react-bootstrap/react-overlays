import React from 'react'

import DropdownContext from './DropdownContext'

function DropdownToggle({ children }) {
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

export default DropdownToggle
