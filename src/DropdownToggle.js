import PropTypes from 'prop-types';
import { useContext } from 'react';

import DropdownContext from './DropdownContext';

/**
 * Wires up Dropdown toggle functinality, returning a set a props to attach
 * to the element that functions as the dropdown toggle (generally a button).
 */
export function useDropdownToggle() {
  const { show, toggle, setToggle } = useContext(DropdownContext);
  return [
    {
      ref: setToggle,
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

function DropdownToggle({ children }) {
  const [props, { show, toggle }] = useDropdownToggle();

  return children({
    show,
    toggle,
    props,
  });
}

DropdownToggle.displayName = 'ReactOverlaysDropdownToggle';
DropdownToggle.propTypes = propTypes;

/** @component */
export default DropdownToggle;
