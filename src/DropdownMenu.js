import PropTypes from 'prop-types'
import React from 'react'

import { Popper } from '@react-bootstrap/react-popper'
import DropdownContext from './DropdownContext'
import RootCloseWrapper from './RootCloseWrapper'
import mapContextToProps from 'react-context-toolbox/lib/mapContextToProps'

class DropdownMenu extends React.Component {
  static displayName = 'ReactOverlaysDropdownMenu'

  static propTypes = {
    /**
     * Controls the visible state of the menu, generally this is
     * provided by the parent `Dropdown` component,
     * but may also be specified as a prop directly.
     */
    show: PropTypes.bool,

    /**
     * Aligns the dropdown menu to the 'end' of it's placement position.
     * Generally this is provided by the parent `Dropdown` component,
     * but may also be specified as a prop directly.
     */
    alignEnd: PropTypes.bool,

    /**
     * Enables the Popper.js `flip` modifier, allowing the Dropdown to
     * automatically adjust it's placement in case of overlap with the viewport or toggle.
     * Refer to the [flip docs](https://popper.js.org/popper-documentation.html#modifiers..flip.enabled) for more info
     */
    flip: PropTypes.bool,

    /**
     * A set of popper options and props passed directly to react-popper's Popper component.
     */
    popperConfig: PropTypes.object,

    /**
     * Override the default event used by RootCloseWrapper.
     */
    rootCloseEvent: PropTypes.string,

    /** @private */
    onToggle: PropTypes.func,
    /** @private */
    menuRef: PropTypes.func,
    /** @private */
    drop: PropTypes.string,
    /** @private */
    toggleNode: PropTypes.any,
  }

  state = { toggleId: null }

  hasInitialized = false

  getSnapshotBeforeUpdate(prevProps) {
    // If, to the best we can tell, this update won't reinitialize popper,
    // manually schedule an update
    const shouldUpdatePopper =
      !prevProps.show &&
      this.props.show &&
      this.hasInitialized &&
      // a new reference node will already trigger this internally
      prevProps.toggleNode === this.props.toggleNode

    return !!shouldUpdatePopper
  }

  componentDidUpdate(_, __, shouldUpdatePopper) {
    if (shouldUpdatePopper) {
      this.scheduleUpdate()
    }
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
      alignEnd,
      drop,
      toggleNode,
      rootCloseEvent,
      popperConfig = {},
    } = this.props

    let placement = alignEnd ? 'bottom-end' : 'bottom-start'
    if (drop === 'up') placement = alignEnd ? 'top-end' : 'top-start'
    if (drop === 'right') placement = alignEnd ? 'right-end' : 'right-start'
    if (drop === 'left') placement = alignEnd ? 'left-end' : 'left-start'

    if (show && !this.hasInitialized) this.hasInitialized = show

    const modifiers = {
      flip: {
        enabled: !!flip,
      },
      ...popperConfig.modifiers,
    }

    // Add it this way, so it doesn't override someones usage
    // with react-poppers <Reference>
    if (toggleNode) {
      popperConfig.referenceElement = toggleNode
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
          init={this.hasInitialized}
        >
          {({ ref, ...popper }) => {
            this.scheduleUpdate = popper.scheduleUpdate

            return this.props.children({
              ref,
              show,
              popper,
              alignEnd,
              onClose: this.handleClose,
              props: {
                'aria-labelledby': toggleNode && toggleNode.id,
              },
            })
          }}
        </Popper>
      </RootCloseWrapper>
    )
  }
}

const DecoratedDropdownMenu = mapContextToProps(
  DropdownContext,
  ({ show, alignEnd, onToggle, drop, menuRef, toggleNode }, props) => ({
    drop,
    menuRef,
    onToggle,
    toggleNode,
    show: show == null ? props.show : show,
    alignEnd: alignEnd == null ? props.alignEnd : alignEnd,
  }),
  DropdownMenu
)

export default DecoratedDropdownMenu
