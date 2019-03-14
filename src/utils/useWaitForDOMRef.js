import ownerDocument from 'dom-helpers/ownerDocument';
import { useState, useLayoutEffect, useEffect } from 'react';

const resolveRef = ref => {
  if (ref == null) return ownerDocument().body;
  if (typeof ref === 'function') ref = ref();

  if (ref) {
    if (ref.current) ref = ref.current;
    if (ref.nodeType) return ref;
  }
  return null;
};

export default function useWaitForDOMRef(ref, onResolved) {
  const [resolvedRef, setRef] = useState(() => resolveRef(ref));

  if (!resolvedRef) {
    const earlyRef = resolveRef(ref);
    if (earlyRef) setRef(earlyRef);
  }

  useLayoutEffect(() => {
    if (onResolved && resolvedRef) {
      onResolved();
    }
  }, [!!resolvedRef, !!onResolved]);

  useEffect(() => {
    const nextRef = resolveRef(ref);
    if (nextRef !== resolvedRef) {
      setRef(nextRef);
    }
  });

  return resolvedRef;
}
