import isWindow from 'dom-helpers/isWindow';
import ownerDocument from 'dom-helpers/ownerDocument';

function isBody(node: Element): node is HTMLBodyElement {
  return node && node.tagName.toLowerCase() === 'body';
}

function bodyIsOverflowing(node: Element | Document | Window) {
  let doc = isWindow(node) ? ownerDocument() : ownerDocument(node as Element);
  let win = isWindow(node) || doc.defaultView!;

  return doc.body.clientWidth < win.innerWidth;
}

export default function isOverflowing(container: Element) {
  let win = isWindow(container);
  return win || isBody(container)
    ? bodyIsOverflowing(container)
    : container.scrollHeight > container.clientHeight;
}
