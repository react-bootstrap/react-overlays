import ReactDOM from 'react-dom';
import ownerWindow from 'dom-helpers/ownerWindow';

export default function (componentOrElement) {
  return ownerWindow(ReactDOM.findDOMNode(componentOrElement));
}
