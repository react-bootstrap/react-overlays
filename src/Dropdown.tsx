import matches from 'dom-helpers/matches';
import qsa from 'dom-helpers/querySelectorAll';
import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useUncontrolledProp } from 'uncontrollable';
import usePrevious from '@restart/hooks/usePrevious';
import useForceUpdate from '@restart/hooks/useForceUpdate';
import useGlobalListener from '@restart/hooks/useGlobalListener';
import useEventCallback from '@restart/hooks/useEventCallback';

import DropdownContext, { DropDirection } from './DropdownContext';
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
  itemSelector: PropTypes.string,

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
   * ```ts static
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

export interface DropdownInjectedProps {
  onKeyDown: React.KeyboardEventHandler;
}

export interface DropdownProps {
  drop?: DropDirection;
  alignEnd?: boolean;
  defaultShow?: boolean;
  show?: boolean;
  onToggle: (nextShow: boolean, event?: React.SyntheticEvent | Event) => void;
  itemSelector?: string;
  focusFirstItemOnShow?: false | true | 'keyboard';
  children: React.ReactNode;
}

function useRefWithUpdate() {
  const forceUpdate = useForceUpdate();
  const ref = useRef<HTMLElement | null>(null);
  const attachRef = useCallback(
    (element: null | HTMLElement) => {
      ref.current = element;
      // ensure that a menu set triggers an update for consumers
      forceUpdate();
    },
    [forceUpdate],
  );
  return [ref, attachRef] as const;
}

/**
 * @displayName Dropdown
 */
function Dropdown({
  drop,
  alignEnd,
  defaultShow,
  show: rawShow,
  onToggle: rawOnToggle,
  itemSelector = '* > *',
  focusFirstItemOnShow,
  children,
}: DropdownProps) {
  const [show, onToggle] = useUncontrolledProp(
    rawShow,
    defaultShow!,
    rawOnToggle,
  );

  // We use normal refs instead of useCallbackRef in order to populate the
  // the value as quickly as possible, otherwise the effect to focus the element
  // may run before the state value is set
  const [menuRef, setMenu] = useRefWithUpdate();
  const menuElement = menuRef.current;

  const [toggleRef, setToggle] = useRefWithUpdate();
  const toggleElement = toggleRef.current;

  const lastShow = usePrevious(show);
  const lastSourceEvent = useRef<string | null>(null);
  const focusInDropdown = useRef(false);

  const toggle = useCallback(
    (nextShow: boolean, event?: Event | React.SyntheticEvent) => {
      onToggle(nextShow, event);
    },
    [onToggle],
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
    let focusType = focusFirstItemOnShow;

    if (focusType == null) {
      focusType =
        menuRef.current && matches(menuRef.current, '[role=menu]')
          ? 'keyboard'
          : false;
    }

    if (
      focusType === false ||
      (focusType === 'keyboard' && !/^key.+$/.test(type!))
    ) {
      return;
    }

    const first = qsa(menuRef.current!, itemSelector)[0];
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

  const getNextFocusedChild = (current: HTMLElement, offset: number) => {
    if (!menuRef.current) return null;

    const items = qsa(menuRef.current, itemSelector);

    let index = items.indexOf(current) + offset;
    index = Math.max(0, Math.min(index, items.length));

    return items[index];
  };

  useGlobalListener('keydown', (event: KeyboardEvent) => {
    const { key } = event;
    const target = event.target as HTMLElement;

    const fromMenu = menuRef.current?.contains(target);
    const fromToggle = toggleRef.current?.contains(target);

    // Second only to https://github.com/twbs/bootstrap/blob/8cfbf6933b8a0146ac3fbc369f19e520bd1ebdac/js/src/dropdown.js#L400
    // in inscrutability
    const isInput = /input|textarea/i.test(target.tagName);
    if (isInput && (key === ' ' || (key !== 'Escape' && fromMenu))) {
      return;
    }

    if (!fromMenu && !fromToggle) {
      return;
    }

    lastSourceEvent.current = event.type;

    switch (key) {
      case 'ArrowUp': {
        const next = getNextFocusedChild(target, -1);
        if (next && next.focus) next.focus();
        event.preventDefault();

        return;
      }
      case 'ArrowDown':
        event.preventDefault();
        if (!show) {
          onToggle(true, event);
        } else {
          const next = getNextFocusedChild(target, 1);
          if (next && next.focus) next.focus();
        }
        return;
      case 'Escape':
      case 'Tab':
        onToggle(false, event);
        break;
      default:
    }
  });

  return (
    <DropdownContext.Provider value={context}>
      {children}
    </DropdownContext.Provider>
  );
}

Dropdown.displayName = 'ReactOverlaysDropdown';

Dropdown.propTypes = propTypes;

Dropdown.Menu = DropdownMenu;
Dropdown.Toggle = DropdownToggle;

export default Dropdown;
