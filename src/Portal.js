import PropTypes from 'prop-types';
import componentOrElement from 'prop-types-extra/lib/componentOrElement';
import React from 'react';
import ReactDOM from 'react-dom';

import getContainer from './utils/getContainer';
import ownerDocument from './utils/ownerDocument';
import LegacyPortal from './LegacyPortal'


/**
 * The `<Portal/>` component renders its children into a new "subtree" outside of current component hierarchy.
 * You can think of it as a declarative `appendChild()`, or jQuery's `$.fn.appendTo()`.
 * The children of `<Portal/>` component will be appended to the `container` specified.
 */
class Portal extends React.Component {
  static displayName = 'Portal';

  static propTypes = {
    /**
     * A Node, Component instance, or function that returns either. The `container` will have the Portal children
     * appended to it.
     */
    container: PropTypes.oneOfType([
      componentOrElement,
      PropTypes.func
    ]),

    onRendered: PropTypes.func,
  };

  componentDidMount() {
    this.setContainer();
    this.forceUpdate(this.props.onRendered)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.container !== this.props.container) {
      this.setContainer(nextProps)
    }
  }

  componentWillUnmount() {
    this._portalContainerNode = null;
  }

  setContainer = (props = this.props) => {
    this._portalContainerNode = getContainer(
      props.container, ownerDocument(this).body,
    );
  };

  render() {
    return this.props.children && this._portalContainerNode ?
      ReactDOM.createPortal(this.props.children, this._portalContainerNode) :
      null;
  }

  getMountNode = () => {
    return this._portalContainerNode;
  };
}

export default ReactDOM.createPortal ? Portal : LegacyPortal;
