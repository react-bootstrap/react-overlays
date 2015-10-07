import React from 'react';
import ReactDOM from 'react-dom';

import addEventListener from './utils/addEventListener';
import createChainedFunction from './utils/createChainedFunction';
import ownerDocument from './utils/ownerDocument';

// TODO: Consider using an ES6 symbol here, once we use babel-runtime.
const CLICK_WAS_INSIDE = '__click_was_inside';

let counter = 0;

function getSuppressRootClose() {
  let id = CLICK_WAS_INSIDE + '_' + counter++;
  return {
    id,
    suppressRootClose(event) {
      // Tag the native event to prevent the root close logic on document click.
      // This seems safer than using event.nativeEvent.stopImmediatePropagation(),
      // which is only supported in IE >= 9.
      event.nativeEvent[id] = true;
    }
  };
}

export default class RootCloseWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleDocumentKeyUp = this.handleDocumentKeyUp.bind(this);

    let { id, suppressRootClose } = getSuppressRootClose();

    this._suppressRootId = id;

    this._suppressRootCloseHandler = suppressRootClose;
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
    if (e[this._suppressRootId]) {
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
    const {noWrap, children} = this.props;
    const child = React.Children.only(children);

    if (noWrap) {
      return React.cloneElement(child, {
        onClick: createChainedFunction(this._suppressRootCloseHandler, child.props.onClick)
      });
    }

    // Wrap the child in a new element, so the child won't have to handle
    // potentially combining multiple onClick listeners.
    return (
      <div onClick={this._suppressRootCloseHandler}>
        {child}
      </div>
    );
  }

  getWrappedDOMNode() {
    // We can't use a ref to identify the wrapped child, since we might be
    // stealing the ref from the owner, but we know exactly the DOM structure
    // that will be rendered, so we can just do this to get the child's DOM
    // node for doing size calculations in OverlayMixin.
    const node = ReactDOM.findDOMNode(this);
    return this.props.noWrap ? node : node.firstChild;
  }

  componentWillUnmount() {
    this.unbindRootCloseHandlers();
  }
}

RootCloseWrapper.displayName = 'RootCloseWrapper';

RootCloseWrapper.propTypes = {
  onRootClose: React.PropTypes.func.isRequired,

  /**
   * Passes the suppress click handler directly to the child component instead
   * of placing it on a wrapping div. Only use when you can be sure the child
   * properly handle the click event.
   */
  noWrap: React.PropTypes.bool
};
