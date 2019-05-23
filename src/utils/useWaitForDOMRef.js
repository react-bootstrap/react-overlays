import ownerDocument from 'dom-helpers/ownerDocument';
import { useState, useEffect } from 'react';

const resolveRef = ref => {
  if (ref == null) return ownerDocument().body;
  if (typeof ref === 'function') ref = ref();

  if (ref && ref.current) ref = ref.current;
  if (ref && ref.nodeType) return ref;

  return null;
};

export default function useWaitForDOMRef(ref, onResolved) {
  const [resolvedRef, setRef] = useState(() => resolveRef(ref));

  if (!resolvedRef) {
    const earlyRef = resolveRef(ref);
    if (earlyRef) setRef(earlyRef);
  }

  useEffect(() => {
    if (onResolved && resolvedRef) {
      onResolved(resolvedRef);
    }
  }, [onResolved, resolvedRef]);

  useEffect(() => {
    const nextRef = resolveRef(ref);
    if (nextRef !== resolvedRef) {
      setRef(nextRef);
    }
  }, [ref, resolvedRef]);

  return resolvedRef;
}
