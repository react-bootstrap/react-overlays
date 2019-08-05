import matches from 'dom-helpers/query/matches';
import qsa from 'dom-helpers/query/querySelectorAll';
import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useUncontrolled } from 'uncontrollable';
import usePrevious from '@restart/hooks/usePrevious';
import useCallbackRef from '@restart/hooks/useCallbackRef';
import useEventCallback from '@restart/hooks/useEventCallback';

import DropdownContext from './DropdownContext';
import DropdownMenu from './DropdownMenu';
import DropdownToggle from './DropdownToggle';

function useForceUpdate() {
  const [, setState] = useState(false);
  return useCallback(() => setState(value => !value), []);
}

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
   * Sets the initial show position of the Dropdown.
   */
  defaultShow: PropTypes.bool,

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
function Dropdown({
  drop,
  alignEnd,
  defaultShow,
  show: rawShow,
  onToggle: rawOnToggle,
  itemSelector,
  focusFirstItemOnShow,
  children,
}) {
  const forceUpdate = useForceUpdate();
  const { show, onToggle } = useUncontrolled(
    { defaultShow, show: rawShow, onToggle: rawOnToggle },
    { show: 'onToggle' },
  );

  const [toggleElement, setToggle] = useCallbackRef();

  // We use normal refs instead of useCallbackRef in order to populate the
  // the value as quickly as possible, otherwise the effect to focus the element
  // may run before the state value is set
  const menuRef = useRef();
  const menuElement = menuRef.current;

  const setMenu = useCallback(
    ref => {
      menuRef.current = ref;
      // ensure that a menu set triggers an update for consumers
      forceUpdate();
    },
    [forceUpdate],
  );

  const lastShow = usePrevious(show);
  const lastSourceEvent = useRef(null);
  const focusInDropdown = useRef(false);

  const toggle = useCallback(
    event => {
      onToggle(!show, event);
    },
    [onToggle, show],
  );

  const context = useMemo(
    () => ({
      toggle,
      drop,
      show,
      alignEnd,
      menuElement,
      toggleElement,
      setMenu,
      setToggle,
    }),
    [
      toggle,
      drop,
      show,
      alignEnd,
      menuElement,
      toggleElement,
      setMenu,
      setToggle,
    ],
  );

  if (menuElement && lastShow && !show) {
    focusInDropdown.current = menuElement.contains(document.activeElement);
  }

  const focusToggle = useEventCallback(() => {
    if (toggleElement && toggleElement.focus) {
      toggleElement.focus();
    }
  });

  const maybeFocusFirst = useEventCallback(() => {
    const type = lastSourceEvent.current;
    let focusStype = focusFirstItemOnShow;

    if (focusStype == null) {
      focusStype =
        menuRef.current && matches(menuRef.current, '[role=menu]')
          ? 'keyboard'
          : false;
    }

    if (
      focusStype === false ||
      (focusStype === 'keyboard' && !/^key.+$/.test(type))
    ) {
      return;
    }

    let first = qsa(menuRef.current, itemSelector)[0];
    if (first && first.focus) first.focus();
  });

  useEffect(() => {
    if (show) maybeFocusFirst();
    else if (focusInDropdown.current) {
      focusInDropdown.current = false;
      focusToggle();
    }
    // only `show` should be changing
  }, [show, focusInDropdown, focusToggle, maybeFocusFirst]);

  useEffect(() => {
    lastSourceEvent.current = null;
  });

  const getNextFocusedChild = (current, offset) => {
    if (!menuRef.current) return null;

    let items = qsa(menuRef.current, itemSelector);

    let index = items.indexOf(current) + offset;
    index = Math.max(0, Math.min(index, items.length));

    return items[index];
  };

  const handleKeyDown = event => {
    const { key, target } = event;

    // Second only to https://github.com/twbs/bootstrap/blob/8cfbf6933b8a0146ac3fbc369f19e520bd1ebdac/js/src/dropdown.js#L400
    // in inscrutability
    const isInput = /input|textarea/i.test(target.tagName);
    if (
      isInput &&
      (key === ' ' ||
        (key !== 'Escape' &&
          menuRef.current &&
          menuRef.current.contains(target)))
    ) {
      return;
    }

    lastSourceEvent.current = event.type;

    switch (key) {
      case 'ArrowUp': {
        let next = getNextFocusedChild(target, -1);
        if (next && next.focus) next.focus();
        event.preventDefault();

        return;
      }
      case 'ArrowDown':
        event.preventDefault();
        if (!show) {
          toggle(event);
        } else {
          let next = getNextFocusedChild(target, 1);
          if (next && next.focus) next.focus();
        }
        return;
      case 'Escape':
      case 'Tab':
        onToggle(false, event);
        break;
      default:
    }
  };

  return (
    <DropdownContext.Provider value={context}>
      {children({ props: { onKeyDown: handleKeyDown } })}
    </DropdownContext.Provider>
  );
}

Dropdown.displayName = 'ReactOverlaysDropdown';

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;

Dropdown.Menu = DropdownMenu;
Dropdown.Toggle = DropdownToggle;

export default Dropdown;
