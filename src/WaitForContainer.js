import PropTypes from 'prop-types'
import componentOrElement from 'prop-types-extra/lib/componentOrElement'
import canUseDom from 'dom-helpers/util/inDOM'
import ownerDocument from 'dom-helpers/ownerDocument'
import React from 'react'
import ReactDOM from 'react-dom'
import getContainer from './utils/getContainer'

const propTypes = {
  /**
   * A Node, Component instance, or function that returns either. The `container` will have the Portal children
   * appended to it.
   */
  container: PropTypes.oneOfType([componentOrElement, PropTypes.func]),

  onContainerResolved: PropTypes.func,
}

class WaitForContainer extends React.Component {
  constructor(...args) {
    super(...args)

    if (!canUseDom) return

    let { container } = this.props

    if (typeof container === 'function') container = container()
    if (container && !ReactDOM.findDOMNode(container)) {
      // The container is a React component that has not yet been rendered.
      // Don't set the container node yet.
      return
    }

    this.setContainer(container)
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.container !== this.props.container) {
      this.setContainer(nextProps.container)
    }
  }

  componentDidMount() {
    if (!this._container) {
      this.setContainer(this.props.container)
      this.forceUpdate(this.props.onContainerResolved)
    } else if (this.props.onContainerResolved) {
      this.props.onContainerResolved()
    }
  }
  componentWillUnmount() {
    this._container = null
  }

  setContainer(container) {
    this._container = getContainer(container, ownerDocument().body)
  }

  render() {
    return this._container ? this.props.children(this._container) : null
  }
}

WaitForContainer.propTypes = propTypes

export default WaitForContainer
