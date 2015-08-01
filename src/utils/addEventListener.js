import addEventListener from 'dom-helpers/events/on';
import removeEventListener from 'dom-helpers/events/off';

export default function (node, event, handler) {
  addEventListener(node, event, handler);
  return {
    remove(){
      removeEventListener(node, event, handler);
    }
  };
}
