const BLACKLIST = ['template', 'script', 'style'];

const isHidable = ({ nodeType, tagName }: Element) =>
  nodeType === 1 && BLACKLIST.indexOf(tagName.toLowerCase()) === -1;

const siblings = (
  container: Element,
  exclude: Element[],
  cb: (el: Element) => any,
) => {
  [].forEach.call(container.children, (node) => {
    if (exclude.indexOf(node) === -1 && isHidable(node)) {
      cb(node);
    }
  });
};

export function ariaHidden(hide: boolean, node: Element | null | undefined) {
  if (!node) return;
  if (hide) {
    node.setAttribute('aria-hidden', 'true');
  } else {
    node.removeAttribute('aria-hidden');
  }
}

interface SiblingExclusions {
  dialog: Element;
  backdrop: Element;
}
export function hideSiblings(
  container: Element,
  { dialog, backdrop }: SiblingExclusions,
) {
  siblings(container, [dialog, backdrop], (node) => ariaHidden(true, node));
}

export function showSiblings(
  container: Element,
  { dialog, backdrop }: SiblingExclusions,
) {
  siblings(container, [dialog, backdrop], (node) => ariaHidden(false, node));
}
