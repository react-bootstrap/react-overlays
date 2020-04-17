import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import DropdownContext, { DropdownContextValue } from './DropdownContext';

export interface UseDropdownToggleProps {
  ref: DropdownContextValue['setToggle'];
  'aria-haspopup': boolean;
  'aria-expanded': boolean;
}

export interface UseDropdownToggleHelpers {
  show: DropdownContextValue['show'];
  toggle: DropdownContextValue['toggle'];
}

const noop: any = () => {};

/**
 * Wires up Dropdown toggle functionality, returning a set a props to attach
 * to the element that functions as the dropdown toggle (generally a button).
 *
 * @memberOf Dropdown
 */
export function useDropdownToggle(): [
  UseDropdownToggleProps,
  UseDropdownToggleHelpers,
] {
  const { show = false, toggle = noop, setToggle } =
    useContext(DropdownContext) || {};
  return [
    {
      ref: setToggle || noop,
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
    args: UseDropdownToggleHelpers & { props: UseDropdownToggleProps },
  ) => React.ReactNode;
}

/**
 * Also exported as `<Dropdown.Toggle>` from `Dropdown`.
 *
 * @displayName DropdownToggle
 * @memberOf Dropdown
 */
function DropdownToggle({ children }: DropdownToggleProps) {
  const [props, { show, toggle }] = useDropdownToggle();

  return (
    <>
      {children({
        show,
        toggle,
        props,
      })}
    </>
  );
}

DropdownToggle.displayName = 'ReactOverlaysDropdownToggle';
DropdownToggle.propTypes = propTypes;

/** @component */
export default DropdownToggle;
