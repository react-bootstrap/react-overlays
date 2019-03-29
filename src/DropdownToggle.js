import PropTypes from 'prop-types';
import { useContext } from 'react';

import DropdownContext from './DropdownContext';

export function useDropdownToggle() {
  const { show, toggle, toggleRef } = useContext(DropdownContext);
  return [
    {
      ref: toggleRef,
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
  const [props, { show, toggle }] = useDropdownToggle(DropdownContext);

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
