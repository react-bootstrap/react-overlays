import PropTypes from 'prop-types';
import componentOrElement from 'prop-types-extra/lib/componentOrElement';
import ReactDOM from 'react-dom';

import useWaitForContainer from './utils/useWaitForContainer';

const propTypes = {
  /**
   * A Node, Component instance, or function that returns either. The `container` will have the Portal children
   * appended to it.
   */
  container: PropTypes.oneOfType([componentOrElement, PropTypes.func]),

  onRendered: PropTypes.func,
};

/**
 * The `<Portal/>` component renders its children into a new "subtree" outside of current component hierarchy.
 * You can think of it as a declarative `appendChild()`, or jQuery's `$.fn.appendTo()`.
 * The children of `<Portal/>` component will be appended to the `container` specified.
 */
const Portal = ({ container, children, onRendered }) => {
  const resolvedContainer = useWaitForContainer(container, onRendered);

  return resolvedContainer
    ? ReactDOM.createPortal(children, resolvedContainer)
    : null;
};

Portal.displayName = 'Portal';
Portal.propTypes = propTypes;

export default Portal;
