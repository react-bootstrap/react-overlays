import isWindow from 'dom-helpers/query/isWindow';
import ownerDocument from 'dom-helpers/ownerDocument';

function isBody(node){
  return node && node.tagName.toLowerCase() === 'body';
}

function bodyIsOverflowing(node){
  let doc = ownerDocument(node);
  let win = isWindow(doc);
  let fullWidth = win.innerWidth;

  // Support: ie8, no innerWidth
  if (!fullWidth) {
    let documentElementRect = doc.documentElement.getBoundingClientRect();
    fullWidth = documentElementRect.right - Math.abs(documentElementRect.left);
  }

  return doc.body.clientWidth < fullWidth;
}

export default function isOverflowing(container) {
  let win = isWindow(container);

  return win || isBody(container)
      ? bodyIsOverflowing(container)
      : container.scrollHeight > container.clientHeight;
}
