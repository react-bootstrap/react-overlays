import React from 'react';
import ownerWindow from 'dom-helpers/ownerWindow';

export default function (componentOrElement) {
  return ownerWindow(React.findDOMNode(componentOrElement));
}
