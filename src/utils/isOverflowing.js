import isWindow from 'dom-helpers/isWindow';
import ownerDocument from 'dom-helpers/ownerDocument';

function isBody(node) {
  return node && node.tagName.toLowerCase() === 'body';
}

function bodyIsOverflowing(node) {
  let doc = ownerDocument(node);
  let win = isWindow(doc);

  return doc.body.clientWidth < win.innerWidth;
}

export default function isOverflowing(container) {
  let win = isWindow(container);

  return win || isBody(container)
    ? bodyIsOverflowing(container)
    : container.scrollHeight > container.clientHeight;
}
