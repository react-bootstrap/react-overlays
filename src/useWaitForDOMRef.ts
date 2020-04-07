import ownerDocument from 'dom-helpers/ownerDocument';
import { useState, useEffect } from 'react';

export type DOMContainer<T extends HTMLElement = HTMLElement> =
  | T
  | React.RefObject<T>
  | null
  | (() => T | React.RefObject<T> | null);

export const resolveContainerRef = <T extends HTMLElement>(
  ref: DOMContainer<T> | undefined,
): T | HTMLBodyElement | null => {
  if (typeof document === 'undefined') return null;
  if (ref == null) return ownerDocument().body as HTMLBodyElement;
  if (typeof ref === 'function') ref = ref();

  if (ref && 'current' in ref) ref = ref.current;
  if (ref?.nodeType) return ref || null;

  return null;
};

export default function useWaitForDOMRef<T extends HTMLElement = HTMLElement>(
  ref: DOMContainer<T> | undefined,
  onResolved?: (element: T | HTMLBodyElement) => void,
) {
  const [resolvedRef, setRef] = useState(() => resolveContainerRef(ref));

  if (!resolvedRef) {
    const earlyRef = resolveContainerRef(ref);
    if (earlyRef) setRef(earlyRef);
  }

  useEffect(() => {
    if (onResolved && resolvedRef) {
      onResolved(resolvedRef);
    }
  }, [onResolved, resolvedRef]);

  useEffect(() => {
    const nextRef = resolveContainerRef(ref);
    if (nextRef !== resolvedRef) {
      setRef(nextRef);
    }
  }, [ref, resolvedRef]);

  return resolvedRef;
}
