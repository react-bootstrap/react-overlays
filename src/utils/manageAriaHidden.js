const BLACKLIST = ['template', 'script', 'style'];

let isHidable = ({ nodeType, tagName }) =>
  nodeType === 1 && BLACKLIST.indexOf(tagName.toLowerCase()) === -1;

let siblings = (container, exclude, cb) => {
  exclude = [].concat(exclude);
  [].forEach.call(container.children, node => {
    if (exclude.indexOf(node) === -1 && isHidable(node)) {
      cb(node);
    }
  });
};

export function ariaHidden(show, node) {
  if (!node) return;
  if (show) {
    node.setAttribute('aria-hidden', 'true');
  } else {
    node.removeAttribute('aria-hidden');
  }
}

export function hideSiblings(container, { root, backdrop }) {
  siblings(container, [root, backdrop], node => ariaHidden(true, node));
}

export function showSiblings(container, { root, backdrop }) {
  siblings(container, [root, backdrop], node => ariaHidden(false, node));
}
