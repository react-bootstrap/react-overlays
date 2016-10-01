import contains from 'dom-helpers/query/contains';
import React from 'react';
import ReactDOM from 'react-dom';

import addEventListener from './utils/addEventListener';
import ownerDocument from './utils/ownerDocument';

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default class RootCloseWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.handleDocumentMouse = this.handleDocumentMouse.bind(this);
    this.handleDocumentKeyUp = this.handleDocumentKeyUp.bind(this);
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this.bindRootCloseHandlers();
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.disabled && prevProps.disabled) {
      this.bindRootCloseHandlers();
    } else if (this.props.disabled && !prevProps.disabled) {
      this.unbindRootCloseHandlers();
    }
  }

  componentWillUnmount() {
    if (!this.props.disabled) {
      this.unbindRootCloseHandlers();
    }
  }

  bindRootCloseHandlers() {
    const doc = ownerDocument(this);

    // Use capture for this listener so it fires before React's listener, to
    // avoid false positives in the contains() check below if the target DOM
    // element is removed in the React mouse callback.
    this._onDocumentMouseListener =
      addEventListener(doc, this.props.event, this.handleDocumentMouse, true);

    this._onDocumentKeyupListener =
      addEventListener(doc, 'keyup', this.handleDocumentKeyUp);
  }

  unbindRootCloseHandlers() {
    if (this._onDocumentMouseListener) {
      this._onDocumentMouseListener.remove();
    }

    if (this._onDocumentKeyupListener) {
      this._onDocumentKeyupListener.remove();
    }
  }

  handleDocumentMouse(e) {
    if (
      this.props.disabled ||
      isModifiedEvent(e) ||
      !isLeftClickEvent(e) ||
      contains(ReactDOM.findDOMNode(this), e.target)
    ) {
      return;
    }

    if (this.props.onRootClose) {
      this.props.onRootClose();
    }
  }

  handleDocumentKeyUp(e) {
    if (e.keyCode === 27 && this.props.onRootClose) {
      this.props.onRootClose();
    }
  }

  render() {
    return this.props.children;
  }
}

RootCloseWrapper.displayName = 'RootCloseWrapper';

RootCloseWrapper.propTypes = {
  onRootClose: React.PropTypes.func,
  children: React.PropTypes.element,

  /**
   * Disable the the RootCloseWrapper, preventing it from triggering
   * `onRootClose`.
   */
  disabled: React.PropTypes.bool,
  /**
   * Choose which document mouse event to bind to
   */
  event: React.PropTypes.oneOf(['click', 'mousedown'])
};

RootCloseWrapper.defaultProps = {
  event: 'click'
};
