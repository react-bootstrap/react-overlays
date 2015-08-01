import React from 'react';
import ownerDocument from 'dom-helpers/ownerDocument';

export default function (componentOrElement) {
  return ownerDocument(React.findDOMNode(componentOrElement));
}
