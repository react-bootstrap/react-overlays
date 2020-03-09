import PropTypes from 'prop-types';
import * as React from 'react';

export default class Anchor extends React.Component {
  static propTypes = {
    id: PropTypes.string,
  };

  render() {
    let id =
      this.props.id || this.props.children.toLowerCase().replace(/\s+/gi, '_');

    return (
      <a id={id} href={`#${id}`} className="anchor">
        <span className="anchor-icon">#</span>
        {this.props.children}
      </a>
    );
  }
}
