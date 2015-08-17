import ReactDOM from 'react-dom';

export default function getContainer(container, defaultContainer){
  container = typeof container === 'function' ? container() : container;
  return ReactDOM.findDOMNode(container) || defaultContainer;
}
