import PropTypes from 'prop-types'
import elementType from 'prop-types-extra/lib/elementType'
import React from 'react'
import ReactDOM from 'react-dom'

import Portal from './Portal'
import RootCloseWrapper from './RootCloseWrapper'
import { Popper, placements } from '@react-bootstrap/react-popper'
import mapContextToProps from 'react-context-toolbox/lib/mapContextToProps'

import WaitForContainer from './WaitForContainer'

/**
 * Built on top of `<Position/>` and `<Portal/>`, the overlay component is great for custom tooltip overlays.
 */
class Overlay extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = { exited: !props.show }
    this.onHiddenListener = this.handleHidden.bind(this)

    this._lastTarget = null
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.show) {
      return { exited: false }
    } else if (!nextProps.transition) {
      // Otherwise let handleHidden take care of marking exited.
      return { exited: true }
    }
    return null
  }

  componentDidMount() {
    this.setState({ target: this.getTarget() })
  }

  componentDidUpdate(prevProps) {
    if (this.props === prevProps) return

    const target = this.getTarget()

    if (target !== this.state.target) {
      this.setState({ target })
    }
  }

  getTarget() {
    let { target } = this.props
    target = typeof target === 'function' ? target() : target
    return (target && ReactDOM.findDOMNode(target)) || null
  }

  render() {
    let {
      target: _0,
      container,
      containerPadding,
      placement,
      rootClose,
      children,
      flip,
      modifiers = {},
      transition: Transition,
      ...props
    } = this.props

    // Don't un-render the overlay while it's transitioning out.
    const mountOverlay = props.show || (Transition && !this.state.exited)
    if (!mountOverlay) {
      // Don't bother showing anything if we don't have to.
      return null
    }

    let child = children
    const popperProps = {
      placement,
      referenceElement: this.state.target,
      enableEvents: props.show,
      modifiers: {
        ...modifiers,
        preventOverflow: {
          padding: containerPadding || 5,
          ...modifiers.preventOverflow,
        },
        flip: {
          enabled: !!flip,
          ...modifiers.preventOverflow,
        },
      },
    }

    child = (
      <Popper {...popperProps}>
        {popper => {
          this.popper = popper

          let innerChild = this.props.children({
            ...popper,
            // popper doesn't set the initial placement
            placement: popper.placement || placement,
          })
          if (Transition) {
            let { onExit, onExiting, onEnter, onEntering, onEntered } = props

            innerChild = (
              <Transition
                in={props.show}
                appear
                onExit={onExit}
                onExiting={onExiting}
                onExited={this.onHiddenListener}
                onEnter={onEnter}
                onEntering={onEntering}
                onEntered={onEntered}
              >
                {innerChild}
              </Transition>
            )
          }
          return innerChild
        }}
      </Popper>
    )

    if (rootClose) {
      child = (
        <RootCloseWrapper
          onRootClose={props.onHide}
          event={props.rootCloseEvent}
        >
          {child}
        </RootCloseWrapper>
      )
    }

    return <Portal container={container}>{child}</Portal>
  }

  handleHidden = (...args) => {
    this.setState({ exited: true })

    if (this.props.onExited) {
      this.props.onExited(...args)
    }
  }
}

Overlay.propTypes = {
  ...Portal.propTypes,

  /**
   * Set the visibility of the Overlay
   */
  show: PropTypes.bool,

  placement: PropTypes.oneOf(placements),

  /**
   * Specify whether the overlay should trigger `onHide` when the user clicks outside the overlay
   */
  rootClose: PropTypes.bool,

  /**
   * Specify event for toggling overlay
   */
  rootCloseEvent: RootCloseWrapper.propTypes.event,

  /**
   * A Callback fired by the Overlay when it wishes to be hidden.
   *
   * __required__ when `rootClose` is `true`.
   *
   * @type func
   */
  onHide(props, ...args) {
    let propType = PropTypes.func
    if (props.rootClose) {
      propType = propType.isRequired
    }

    return propType(props, ...args)
  },

  /**
   * A `react-transition-group@2.0.0` `<Transition/>` component
   * used to animate the overlay as it changes visibility.
   */
  transition: elementType,

  /**
   * Callback fired before the Overlay transitions in
   */
  onEnter: PropTypes.func,

  /**
   * Callback fired as the Overlay begins to transition in
   */
  onEntering: PropTypes.func,

  /**
   * Callback fired after the Overlay finishes transitioning in
   */
  onEntered: PropTypes.func,

  /**
   * Callback fired right before the Overlay transitions out
   */
  onExit: PropTypes.func,

  /**
   * Callback fired as the Overlay begins to transition out
   */
  onExiting: PropTypes.func,

  /**
   * Callback fired after the Overlay finishes transitioning out
   */
  onExited: PropTypes.func,
}

export default mapContextToProps(
  WaitForContainer,
  container => ({ container }),
  Overlay
)
