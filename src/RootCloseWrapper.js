import contains from 'dom-helpers/query/contains';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import addEventListener from './utils/addEventListener';
import ownerDocument from './utils/ownerDocument';

const escapeKeyCode = 27;

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * The `<RootCloseWrapper/>` component registers your callback on the document
 * when rendered. Powers the `<Overlay/>` component. This is used achieve modal
 * style behavior where your callback is triggered when the user tries to
 * interact with the rest of the document or hits the `esc` key.
 */
class RootCloseWrapper extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.preventMouseRootClose = false;
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this.addEventListeners();
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.disabled && prevProps.disabled) {
      this.addEventListeners();
    } else if (this.props.disabled && !prevProps.disabled) {
      this.removeEventListeners();
    }
  }

  componentWillUnmount() {
    if (!this.props.disabled) {
      this.removeEventListeners();
    }
  }

  addEventListeners = () => {
    const { event } = this.props;
    const doc = ownerDocument(this);

    // Use capture for this listener so it fires before React's listener, to
    // avoid false positives in the contains() check below if the target DOM
    // element is removed in the React mouse callback.
    this.documentMouseCaptureListener =
      addEventListener(doc, event, this.handleMouseCapture, true);

    this.documentMouseListener =
      addEventListener(doc, event, this.handleMouse);

    this.documentKeyupListener =
      addEventListener(doc, 'keyup', this.handleKeyUp);
  }

  removeEventListeners = () => {
    if (this.documentMouseCaptureListener) {
      this.documentMouseCaptureListener.remove();
    }

    if (this.documentMouseListener) {
      this.documentMouseListener.remove();
    }

    if (this.documentKeyupListener) {
      this.documentKeyupListener.remove();
    }
  }

  handleMouseCapture = (e) => {
    this.preventMouseRootClose = (
      isModifiedEvent(e) ||
      !isLeftClickEvent(e) ||
      contains(ReactDOM.findDOMNode(this), e.target)
    );
  };

  handleMouse = (e) => {
    if (!this.preventMouseRootClose && this.props.onRootClose) {
      this.props.onRootClose(e);
    }
  };

  handleKeyUp = (e) => {
    if (e.keyCode === escapeKeyCode && this.props.onRootClose) {
      this.props.onRootClose(e);
    }
  };

  render() {
    return this.props.children;
  }
}

RootCloseWrapper.displayName = 'RootCloseWrapper';

RootCloseWrapper.propTypes = {
  /**
   * Callback fired after click or mousedown. Also triggers when user hits `esc`.
   */
  onRootClose: PropTypes.func,
  /**
   * Children to render.
   */
  children: PropTypes.element,
  /**
   * Disable the the RootCloseWrapper, preventing it from triggering `onRootClose`.
   */
  disabled: PropTypes.bool,
  /**
   * Choose which document mouse event to bind to.
   */
  event: PropTypes.oneOf(['click', 'mousedown'])
};

RootCloseWrapper.defaultProps = {
  event: 'click'
};

export default RootCloseWrapper;
