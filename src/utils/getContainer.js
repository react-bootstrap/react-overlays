import React from 'react';

export default function getContainer(container, defaultContainer){
  container = typeof container === 'function' ? container() : container;
  return React.findDOMNode(container) || defaultContainer;
}
