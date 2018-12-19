import PropTypes from 'prop-types';
import React from 'react';

import DropdownContext from './DropdownContext';

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
  return (
    <DropdownContext.Consumer>
      {({ show, toggle, toggleRef }) =>
        children({
          show,
          toggle,
          props: {
            ref: toggleRef,
            'aria-haspopup': true,
            'aria-expanded': !!show,
          },
        })
      }
    </DropdownContext.Consumer>
  );
}

DropdownToggle.displayName = 'ReactOverlaysDropdownToggle';
DropdownToggle.propTypes = propTypes;

export default DropdownToggle;
