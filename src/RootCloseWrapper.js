import React from 'react';
import ownerDocument from './utils/ownerDocument';
import addEventListener from './utils/addEventListener';


// TODO: Merge this logic with dropdown logic once #526 is done.

// TODO: Consider using an ES6 symbol here, once we use babel-runtime.
const CLICK_WAS_INSIDE = '__click_was_inside';

function suppressRootClose(event) {
  // Tag the native event to prevent the root close logic on document click.
  // This seems safer than using event.nativeEvent.stopImmediatePropagation(),
  // which is only supported in IE >= 9.
  event.nativeEvent[CLICK_WAS_INSIDE] = true;
}

export default class RootCloseWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleDocumentKeyUp = this.handleDocumentKeyUp.bind(this);
  }

  bindRootCloseHandlers() {
    const doc = ownerDocument(this);

    this._onDocumentClickListener =
      addEventListener(doc, 'click', this.handleDocumentClick);

    this._onDocumentKeyupListener =
      addEventListener(doc, 'keyup', this.handleDocumentKeyUp);
  }

  handleDocumentClick(e) {
    // This is now the native event.
    if (e[CLICK_WAS_INSIDE]) {
      return;
    }

    this.props.onRootClose();
  }

  handleDocumentKeyUp(e) {
    if (e.keyCode === 27) {
      this.props.onRootClose();
    }
  }

  unbindRootCloseHandlers() {
    if (this._onDocumentClickListener) {
      this._onDocumentClickListener.remove();
    }

    if (this._onDocumentKeyupListener) {
      this._onDocumentKeyupListener.remove();
    }
  }

  componentDidMount() {
    this.bindRootCloseHandlers();
  }

  render() {
    // Wrap the child in a new element, so the child won't have to handle
    // potentially combining multiple onClick listeners.
    return (
      <div onClick={suppressRootClose}>
        {React.Children.only(this.props.children)}
      </div>
    );
  }

  getWrappedDOMNode() {
    // We can't use a ref to identify the wrapped child, since we might be
    // stealing the ref from the owner, but we know exactly the DOM structure
    // that will be rendered, so we can just do this to get the child's DOM
    // node for doing size calculations in OverlayMixin.
    return React.findDOMNode(this).firstChild;
  }

  componentWillUnmount() {
    this.unbindRootCloseHandlers();
  }
}

RootCloseWrapper.displayName = 'RootCloseWrapper';

RootCloseWrapper.propTypes = {
  onRootClose: React.PropTypes.func.isRequired
};
