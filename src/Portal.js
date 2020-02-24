import PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';

import useWaitForDOMRef from './utils/useWaitForDOMRef';

const propTypes = {
  /**
   * A DOM element, Ref to an element, or function that returns either. The `container` will have the Portal children
   * appended to it.
   */
  container: PropTypes.any,

  onRendered: PropTypes.func,
};

/**
 * The `<Portal/>` component renders its children into a new "subtree" outside of current component hierarchy.
 * You can think of it as a declarative `appendChild()`, or jQuery's `$.fn.appendTo()`.
 * The children of `<Portal/>` component will be appended to the `container` specified.
 *
 */
const Portal = ({ container, children, onRendered }) => {
  const resolvedContainer = useWaitForDOMRef(container, onRendered);

  return resolvedContainer
    ? ReactDOM.createPortal(children, resolvedContainer)
    : null;
};

Portal.displayName = 'Portal';
Portal.propTypes = propTypes;

/**
 * @component
 */
export default Portal;
