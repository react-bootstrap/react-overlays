import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import React from 'react';
import useWaitForDOMRef, { DOMContainer } from './useWaitForDOMRef';

const propTypes = {
  /**
   * A DOM element, Ref to an element, or function that returns either. The `container` will have the Portal children
   * appended to it.
   */
  container: PropTypes.any,

  onRendered: PropTypes.func,
};

export interface PortalProps {
  children: React.ReactElement;
  container: DOMContainer;
  onRendered?: (element: any) => void;
}

/**
 * @public
 */
const Portal = ({ container, children, onRendered }: PortalProps) => {
  const resolvedContainer = useWaitForDOMRef(container, onRendered);

  return resolvedContainer ? (
    <>{ReactDOM.createPortal(children, resolvedContainer)}</>
  ) : null;
};

Portal.displayName = 'Portal';
Portal.propTypes = propTypes;

export default Portal;
