import PropTypes from 'prop-types'
import componentOrElement from 'prop-types-extra/lib/componentOrElement'
import React from 'react'
import ReactDOM from 'react-dom'

import WaitForContainer from './WaitForContainer'

/**
 * The `<Portal/>` component renders its children into a new "subtree" outside of current component hierarchy.
 * You can think of it as a declarative `appendChild()`, or jQuery's `$.fn.appendTo()`.
 * The children of `<Portal/>` component will be appended to the `container` specified.
 */
class Portal extends React.Component {
  static displayName = 'Portal'

  static propTypes = {
    /**
     * A Node, Component instance, or function that returns either. The `container` will have the Portal children
     * appended to it.
     */
    container: PropTypes.oneOfType([componentOrElement, PropTypes.func]),

    onRendered: PropTypes.func,
  }

  render() {
    return this.props.children ? (
      <WaitForContainer
        container={this.props.container}
        onContainerResolved={this.onRendered}
      >
        {container => ReactDOM.createPortal(this.props.children, container)}
      </WaitForContainer>
    ) : null
  }
}

export default Portal
