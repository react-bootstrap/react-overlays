import matches from 'dom-helpers/query/matches';
import qsa from 'dom-helpers/query/querySelectorAll';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { uncontrollable } from 'uncontrollable';

import * as Popper from 'react-popper';
import DropdownContext from './DropdownContext';
import DropdownMenu from './DropdownMenu';
import DropdownToggle from './DropdownToggle';

const propTypes = {
  /**
   * A render prop that returns the root dropdown element. The `props`
   * argument should spread through to an element containing _both_ the
   * menu and toggle in order to handle keyboard events for focus management.
   *
   * @type {Function ({
   *   props: {
   *     onKeyDown: (SyntheticEvent) => void,
   *   },
   * }) => React.Element}
   */
  children: PropTypes.func.isRequired,

  /**
   * Determines the direction and location of the Menu in relation to it's Toggle.
   */
  drop: PropTypes.oneOf(['up', 'left', 'right', 'down']),

  /**
   * Controls the focus behavior for when the Dropdown is opened. Set to
   * `true` to always focus the first menu item, `keyboard` to focus only when
   * navigating via the keyboard, or `false` to disable completely
   *
   * The Default behavior is `false` **unless** the Menu has a `role="menu"`
   * where it will default to `keyboard` to match the recommended [ARIA Authoring practices](https://www.w3.org/TR/wai-aria-practices-1.1/#menubutton).
   */
  focusFirstItemOnShow: PropTypes.oneOf([false, true, 'keyboard']),

  /**
   * A css slector string that will return __focusable__ menu items.
   * Selectors should be relative to the menu component:
   * e.g. ` > li:not('.disabled')`
   */
  itemSelector: PropTypes.string.isRequired,

  /**
   * Align the menu to the 'end' side of the placement side of the Dropdown toggle. The default placement is `top-start` or `bottom-start`.
   */
  alignEnd: PropTypes.bool,

  /**
   * Whether or not the Dropdown is visible.
   *
   * @controllable onToggle
   */
  show: PropTypes.bool,

  /**
   * A callback fired when the Dropdown wishes to change visibility. Called with the requested
   * `show` value, the DOM event, and the source that fired it: `'click'`,`'keydown'`,`'rootClose'`, or `'select'`.
   *
   * ```js
   * function(
   *   isOpen: boolean,
   *   event: SyntheticEvent,
   * ): void
   * ```
   *
   * @controllable show
   */
  onToggle: PropTypes.func,
};

const defaultProps = {
  itemSelector: '* > *',
};

/**
 * `Dropdown` is set of structural components for building, accessible dropdown menus with close-on-click,
 * keyboard navigation, and correct focus handling. As with all the react-overlay's
 * components its BYOS (bring your own styles). Dropdown is primarily
 * built from three base components, you should compose to build your Dropdowns.
 *
 * - `Dropdown`, which wraps the menu and toggle, and handles keyboard navigation
 * - `Dropdown.Toggle` generally a button that triggers the menu opening
 * - `Dropdown.Menu` The overlaid, menu, positioned to the toggle with PopperJs
 */
class Dropdown extends React.Component {
  static displayName = 'ReactOverlaysDropdown';

  static getDerivedStateFromProps({ drop, alignEnd, show }, prevState) {
    const lastShow = prevState.context.show;
    return {
      lastShow,
      context: {
        ...prevState.context,
        drop,
        show,
        alignEnd,
      },
    };
  }

  constructor(props, context) {
    super(props, context);

    this._focusInDropdown = false;

    this.menu = null;

    this.state = {
      context: {
        close: this.handleClose,
        toggle: this.handleClick,
        menuRef: r => {
          this.menu = r;
        },
        toggleRef: r => {
          const toggleNode = r && ReactDOM.findDOMNode(r);
          this.setState(({ context }) => ({
            context: { ...context, toggleNode },
          }));
        },
      },
    };
  }

  componentDidUpdate(prevProps) {
    const { show } = this.props;
    const prevOpen = prevProps.show;

    if (show && !prevOpen) {
      this.maybeFocusFirst();
    }
    this._lastSourceEvent = null;

    if (!show && prevOpen) {
      // if focus hasn't already moved from the menu let's return it
      // to the toggle
      if (this._focusInDropdown) {
        this._focusInDropdown = false;
        this.focus();
      }
    }
  }

  getNextFocusedChild(current, offset) {
    if (!this.menu) return null;

    const { itemSelector } = this.props;
    let items = qsa(this.menu, itemSelector);

    let index = items.indexOf(current) + offset;
    index = Math.max(0, Math.min(index, items.length));

    return items[index];
  }

  hasMenuRole() {
    return this.menu && matches(this.menu, '[role=menu]');
  }

  focus() {
    const { toggleNode } = this.state.context;
    if (toggleNode && toggleNode.focus) {
      toggleNode.focus();
    }
  }

  maybeFocusFirst() {
    const type = this._lastSourceEvent;
    let { focusFirstItemOnShow } = this.props;
    if (focusFirstItemOnShow == null) {
      focusFirstItemOnShow = this.hasMenuRole() ? 'keyboard' : false;
    }

    if (
      focusFirstItemOnShow === false ||
      (focusFirstItemOnShow === 'keyboard' && !/^key.+$/.test(type))
    ) {
      return;
    }

    const { itemSelector } = this.props;
    let first = qsa(this.menu, itemSelector)[0];
    if (first && first.focus) first.focus();
  }

  handleClick = event => {
    this.toggleOpen(event);
  };

  handleKeyDown = event => {
    const { key, target } = event;

    // Second only to https://github.com/twbs/bootstrap/blob/8cfbf6933b8a0146ac3fbc369f19e520bd1ebdac/js/src/dropdown.js#L400
    // in inscrutability
    const isInput = /input|textarea/i.test(target.tagName);
    if (
      isInput &&
      (key === ' ' || (key !== 'Escape' && this.menu.contains(target)))
    ) {
      return;
    }

    this._lastSourceEvent = event.type;

    switch (key) {
      case 'ArrowUp': {
        let next = this.getNextFocusedChild(target, -1);
        if (next && next.focus) next.focus();
        event.preventDefault();

        return;
      }
      case 'ArrowDown':
        event.preventDefault();
        if (!this.props.show) {
          this.toggleOpen(event);
        } else {
          let next = this.getNextFocusedChild(target, 1);
          if (next && next.focus) next.focus();
        }
        return;
      case 'Escape':
      case 'Tab':
        this.props.onToggle(false, event);
        break;
      default:
    }
  };

  toggleOpen(event) {
    let show = !this.props.show;

    this.props.onToggle(show, event);
  }

  render() {
    const { children, ...props } = this.props;

    delete props.onToggle;

    if (this.menu && this.state.lastShow && !this.props.show) {
      this._focusInDropdown = this.menu.contains(document.activeElement);
    }

    return (
      <DropdownContext.Provider value={this.state.context}>
        <Popper.Manager>
          {children({ props: { onKeyDown: this.handleKeyDown } })}
        </Popper.Manager>
      </DropdownContext.Provider>
    );
  }
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;

const UncontrolledDropdown = uncontrollable(Dropdown, { show: 'onToggle' });

UncontrolledDropdown.Menu = DropdownMenu;
UncontrolledDropdown.Toggle = DropdownToggle;

export default UncontrolledDropdown;
