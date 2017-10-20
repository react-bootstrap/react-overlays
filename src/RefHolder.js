import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  children: PropTypes.node,
};

/**
 * Internal helper component to allow attaching a non-conflicting ref to a
 * child element that may not accept refs.
 */
class RefHolder extends React.Component {
  render() {
    return this.props.children;
  }
}

RefHolder.propTypes = propTypes;

export default RefHolder;
