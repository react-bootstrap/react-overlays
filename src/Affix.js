import classNames from 'classnames';
import getHeight from 'dom-helpers/query/height';
import getOffset from 'dom-helpers/query/offset';
import getOffsetParent from 'dom-helpers/query/offsetParent';
import getScrollTop from 'dom-helpers/query/scrollTop';
import requestAnimationFrame from 'dom-helpers/util/requestAnimationFrame';
import React from 'react';
import ReactDOM from 'react-dom';

import addEventListener from './utils/addEventListener';
import getDocumentHeight from './utils/getDocumentHeight';
import ownerDocument from './utils/ownerDocument';
import ownerWindow from './utils/ownerWindow';

/**
 * The `<Affix/>` component toggles `position: fixed;` on and off, emulating
 * the effect found with `position: sticky;`.
 */
class Affix extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      affixed: 'top',
      position: null,
      top: null
    };

    this._needPositionUpdate = false;
  }

  componentDidMount() {
    this._isMounted = true;

    this._windowScrollListener = addEventListener(
      ownerWindow(this), 'scroll', () => this.onWindowScroll()
    );
    this._documentClickListener = addEventListener(
      ownerDocument(this), 'click', () => this.onDocumentClick()
    );

    this.onUpdate();
  }

  componentWillReceiveProps() {
    this._needPositionUpdate = true;
  }

  componentDidUpdate() {
    if (this._needPositionUpdate) {
      this._needPositionUpdate = false;
      this.onUpdate();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;

    if (this._windowScrollListener) {
      this._windowScrollListener.remove();
    }
    if (this._documentClickListener) {
      this._documentClickListener.remove();
    }
  }

  onWindowScroll() {
    this.onUpdate();
  }

  onDocumentClick() {
    requestAnimationFrame(() => this.onUpdate());
  }

  onUpdate() {
    if (!this._isMounted) {
      return;
    }

    const {offsetTop, viewportOffsetTop} = this.props;
    const scrollTop = getScrollTop(ownerWindow(this));
    const positionTopMin = scrollTop + (viewportOffsetTop || 0);

    if (positionTopMin <= offsetTop) {
      this.updateState('top', null, null);
      return;
    }

    if (positionTopMin > this.getPositionTopMax()) {
      if (this.state.affixed === 'bottom') {
        this.updateStateAtBottom();
      } else {
        // Setting position away from `fixed` can change the offset parent of
        // the affix, so we can't calculate the correct position until after
        // we've updated its position.
        this.setState({
          affixed: 'bottom',
          position: 'absolute',
          top: null
        }, () => {
          if (!this._isMounted) {
            return;
          }

          this.updateStateAtBottom();
        });
      }
      return;
    }

    this.updateState('affix', 'fixed', viewportOffsetTop);
  }

  getPositionTopMax() {
    const documentHeight = getDocumentHeight(ownerDocument(this));
    const height = getHeight(ReactDOM.findDOMNode(this));

    return documentHeight - height - this.props.offsetBottom;
  }

  updateState(affixed, position, top) {
    if (
      affixed === this.state.affixed &&
      position === this.state.position &&
      top === this.state.top
    ) {
      return;
    }

    let upperName = affixed === 'affix'
      ? '' : affixed.charAt(0).toUpperCase() + affixed.substr(1);

    if (this.props['onAffix' + upperName]) {
      this.props['onAffix' + upperName]();
    }

    this.setState({affixed, position, top}, ()=>{
      if (this.props['onAffixed' + upperName]) {
        this.props['onAffixed' + upperName]();
      }
    });
  }

  updateStateAtBottom() {
    const positionTopMax = this.getPositionTopMax();
    const offsetParent = getOffsetParent(ReactDOM.findDOMNode(this));
    const parentTop = getOffset(offsetParent).top;

    this.updateState('bottom', 'absolute', positionTopMax - parentTop);
  }

  render() {
    const child = React.Children.only(this.props.children);
    const {className, style} = child.props;

    const {affixed, position, top} = this.state;
    const positionStyle = {position, top};

    let affixClassName;
    let affixStyle;
    if (affixed === 'top') {
      affixClassName = this.props.topClassName;
      affixStyle = this.props.topStyle;
    } else if (affixed === 'bottom') {
      affixClassName = this.props.bottomClassName;
      affixStyle = this.props.bottomStyle;
    } else {
      affixClassName = this.props.affixClassName;
      affixStyle = this.props.affixStyle;
    }

    return React.cloneElement(child, {
      className: classNames(affixClassName, className),
      style: {...positionStyle, ...affixStyle, ...style}
    });
  }
}

Affix.propTypes = {
  /**
   * Pixels to offset from top of screen when calculating position
   */
  offsetTop: React.PropTypes.number,

  /**
   * When affixed, pixels to offset from top of viewport
   */
  viewportOffsetTop: React.PropTypes.number,

  /**
   * Pixels to offset from bottom of screen when calculating position
   */
  offsetBottom: React.PropTypes.number,

  /**
   * CSS class or classes to apply when at top
   */
  topClassName: React.PropTypes.string,

  /**
   * Style to apply when at top
   */
  topStyle: React.PropTypes.object,

  /**
   * CSS class or classes to apply when affixed
   */
  affixClassName: React.PropTypes.string,
  /**
   * Style to apply when affixed
   */
  affixStyle: React.PropTypes.object,

  /**
   * CSS class or classes to apply when at bottom
   */
  bottomClassName: React.PropTypes.string,

  /**
   * Style to apply when at bottom
   */
  bottomStyle: React.PropTypes.object,

  /**
   * Callback fired when the right before the `affixStyle` and `affixStyle` props are rendered
   */
  onAffix: React.PropTypes.func,
  /**
   * Callback fired after the component `affixStyle` and `affixClassName` props have been rendered.
   */
  onAffixed: React.PropTypes.func,

  /**
   * Callback fired when the right before the `topStyle` and `topClassName` props are rendered
   */
  onAffixTop: React.PropTypes.func,

  /**
   * Callback fired after the component `topStyle` and `topClassName` props have been rendered.
   */
  onAffixedTop: React.PropTypes.func,

  /**
   * Callback fired when the right before the `bottomStyle` and `bottomClassName` props are rendered
   */
  onAffixBottom: React.PropTypes.func,

  /**
   * Callback fired after the component `bottomStyle` and `bottomClassName` props have been rendered.
   */
  onAffixedBottom: React.PropTypes.func
};

Affix.defaultProps = {
  offsetTop: 0,
  viewportOffsetTop: null,
  offsetBottom: 0
};

export default Affix;
