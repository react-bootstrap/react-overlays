import React from 'react'

import { Popper } from 'react-popper'
import DropdownContext from './DropdownContext'
import RootCloseWrapper from './RootCloseWrapper'
import mapContextToProps from 'react-context-toolbox/lib/mapContextToProps'

class DropdownMenu extends React.Component {
  static displayName = 'ReactOverlaysDropdownMenu'

  state = { toggleId: null }

  componentDidUpdate(prevProps) {
    if (this.props.show && !prevProps.show && this.scheduleUpdate) {
      this.scheduleUpdate()
    }
  }

  getReferenceId = data => {
    const {
      instance: { reference },
    } = data

    const { toggleId } = this.state
    if (toggleId !== reference.id) this.setState({ toggleId: reference.id })
    return data
  }

  handleClose = e => {
    if (!this.props.onToggle) return

    this.props.onToggle(false, e)
  }

  render() {
    const {
      show,
      flip,
      menuRef,
      alignRight,
      drop,
      children,
      rootCloseEvent,
      popperConfig = {},
    } = this.props
    const { toggleId } = this.state

    let placement = alignRight ? 'bottom-end' : 'bottom-start'
    if (drop === 'up') placement = alignRight ? 'top-end' : 'top-start'
    if (drop === 'right') placement = 'right-start'
    if (drop === 'left') placement = 'left-start'

    const modifiers = {
      flip: {
        enabled: !!flip,
      },
      ...popperConfig.modifiers,
      reactOverlaysDropdown: {
        enabled: true,
        order: 901,
        fn: this.getReferenceId,
      },
    }

    return (
      <RootCloseWrapper
        disabled={!show}
        event={rootCloseEvent}
        onRootClose={this.handleClose}
      >
        <Popper
          {...popperConfig}
          innerRef={menuRef}
          placement={placement}
          modifiers={modifiers}
        >
          {({ ref, ...popper }) => {
            this.scheduleUpdate = popper.scheduleUpdate

            return this.props.children({
              ref,
              show,
              popper,
              alignRight,
              onClose: this.handleClose,
              labelledBy: toggleId,
            })
          }}
        </Popper>
      </RootCloseWrapper>
    )
  }
}

const DecoratedDropdownMenu = mapContextToProps(
  DropdownContext,
  ({ show, alignRight, onToggle, drop, menuRef }, props) => ({
    drop,
    menuRef,
    onToggle,
    show: show == null ? props.show : show,
    alignRight: alignRight == null ? props.alignRight : alignRight,
  }),
  DropdownMenu
)

export default DecoratedDropdownMenu
