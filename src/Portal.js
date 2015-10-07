import React from 'react';
import ReactDOM from 'react-dom';
import mountable from 'react-prop-types/lib/mountable';
import ownerDocument from './utils/ownerDocument';
import getContainer from './utils/getContainer';

/**
 * The `<Portal/>` component renders its children into a new "subtree" outside of current component hierarchy.
 * You can think of it as a declarative `appendChild()`, or jQuery's `$.fn.appendTo()`.
 * The children of `<Portal/>` component will be appended to the `container` specified.
 */
let Portal = React.createClass({

  displayName: 'Portal',

  propTypes: {
    /**
     * A Node, Component instance, or function that returns either. The `container` will have the Portal children
     * appended to it.
     */
    container: React.PropTypes.oneOfType([
      mountable,
      React.PropTypes.func
    ])
  },

  componentDidMount() {
    this._renderOverlay();
  },

  componentDidUpdate() {
    this._renderOverlay();
  },

  componentWillUnmount() {
    this._unrenderOverlay();
    this._unmountOverlayTarget();
  },


  _mountOverlayTarget() {
    if (!this._overlayTarget) {
      this._overlayTarget = document.createElement('div');
      this.getContainerDOMNode()
        .appendChild(this._overlayTarget);
    }
  },

  _unmountOverlayTarget() {
    if (this._overlayTarget) {
      this.getContainerDOMNode()
        .removeChild(this._overlayTarget);
      this._overlayTarget = null;
    }
  },

  _renderOverlay() {

    let overlay = !this.props.children
      ? null
      : React.Children.only(this.props.children);

    // Save reference for future access.
    if (overlay !== null) {
      this._mountOverlayTarget();
      this._overlayInstance = ReactDOM.unstable_renderSubtreeIntoContainer(
        this, overlay, this._overlayTarget
      );
    } else {
      // Unrender if the component is null for transitions to null
      this._unrenderOverlay();
      this._unmountOverlayTarget();
    }
  },

  _unrenderOverlay() {
    if (this._overlayTarget) {
      ReactDOM.unmountComponentAtNode(this._overlayTarget);
      this._overlayInstance = null;
    }
  },

  render() {
    return null;
  },

  getMountNode(){
    return this._overlayTarget;
  },

  getOverlayDOMNode() {
    if (!this.isMounted()) {
      throw new Error('getOverlayDOMNode(): A component must be mounted to have a DOM node.');
    }

    if (this._overlayInstance) {
      if (this._overlayInstance.getWrappedDOMNode) {
        return this._overlayInstance.getWrappedDOMNode();
      } else {
        return ReactDOM.findDOMNode(this._overlayInstance);
      }
    }

    return null;
  },

  getContainerDOMNode() {
    return getContainer(this.props.container, ownerDocument(this).body);
  }
});

export default Portal;
