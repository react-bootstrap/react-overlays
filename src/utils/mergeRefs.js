import { useMemo } from 'react';

const toFnRef = ref => {
  return !ref || typeof ref === 'function'
    ? ref
    : value => {
        ref.current = value;
      };
};

export default function mergeRefs(refA, refB) {
  const a = toFnRef(refA);
  const b = toFnRef(refB);
  return value => {
    a && a(value);
    b && b(value);
  };
}

export function useMergedRefs(refA, refB) {
  return useMemo(() => mergeRefs(refA, refB), [refA, refB]);
}
