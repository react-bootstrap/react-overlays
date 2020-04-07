import ownerDocument from 'dom-helpers/ownerDocument';
import safeFindDOMNode from './safeFindDOMNode';

export default (
  componentOrElement: React.ComponentClass | Element | null | undefined,
) => ownerDocument(safeFindDOMNode(componentOrElement) as any);
