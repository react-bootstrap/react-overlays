import PropTypes from 'prop-types';
import React, { useContext, useCallback } from 'react';
import DropdownContext, { DropdownContextValue } from './DropdownContext';

export interface UseDropdownToggleProps {
  ref: DropdownContextValue['setToggle'];
  onClick: React.MouseEventHandler;
  'aria-haspopup': boolean;
  'aria-expanded': boolean;
}

export interface UseDropdownToggleMetadata {
  show: DropdownContextValue['show'];
  toggle: DropdownContextValue['toggle'];
}

const noop = () => {};

/**
 * Wires up Dropdown toggle functionality, returning a set a props to attach
 * to the element that functions as the dropdown toggle (generally a button).
 *
 * @memberOf Dropdown
 */
export function useDropdownToggle(): [
  UseDropdownToggleProps,
  UseDropdownToggleMetadata,
] {
  const { show = false, toggle = noop, setToggle } =
    useContext(DropdownContext) || {};
  const handleClick = useCallback(
    (e) => {
      toggle(!show, e);
    },
    [show, toggle],
  );

  return [
    {
      ref: setToggle || noop,
      onClick: handleClick,
      'aria-haspopup': true,
      'aria-expanded': !!show,
    },
    { show, toggle },
  ];
}

const propTypes = {
  /**
   * A render prop that returns a Toggle element. The `props`
   * argument should spread through to **a component that can accept a ref**. Use
   * the `onToggle` argument to toggle the menu open or closed
   *
   * @type {Function ({
   *   show: boolean,
   *   toggle: (show: boolean) => void,
   *   props: {
   *     ref: (?HTMLElement) => void,
   *     aria-haspopup: true
   *     aria-expanded: boolean
   *   },
   * }) => React.Element}
   */
  children: PropTypes.func.isRequired,
};

export interface DropdownToggleProps {
  children: (
    props: UseDropdownToggleProps,
    meta: UseDropdownToggleMetadata,
  ) => React.ReactNode;
}

/**
 * Also exported as `<Dropdown.Toggle>` from `Dropdown`.
 *
 * @displayName DropdownToggle
 * @memberOf Dropdown
 */
function DropdownToggle({ children }: DropdownToggleProps) {
  const [props, meta] = useDropdownToggle();

  return <>{children(props, meta)}</>;
}

DropdownToggle.displayName = 'ReactOverlaysDropdownToggle';
DropdownToggle.propTypes = propTypes;

/** @component */
export default DropdownToggle;
