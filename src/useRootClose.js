import contains from 'dom-helpers/query/contains';
import listen from 'dom-helpers/events/listen';
import { useCallback, useEffect, useRef } from 'react';

import useEventCallback from '@restart/hooks/useEventCallback';
import warning from 'warning';

const escapeKeyCode = 27;
const noop = () => {};

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * The `useRootClose` hook registers your callback on the document
 * when rendered. Powers the `<Overlay/>` component. This is used achieve modal
 * style behavior where your callback is triggered when the user tries to
 * interact with the rest of the document or hits the `esc` key.
 *
 * @param {Ref<HTMLElement>|HTMLElement} ref  The element boundary
 * @param {function} onRootClose
 * @param {object}  options
 * @param {boolean} options.disabled
 * @param {string}  options.clickTrigger The DOM event name (click, mousedown, etc) to attach listeners on
 */
function useRootClose(
  ref,
  onRootClose,
  { disabled, clickTrigger = 'click' } = {},
) {
  const preventMouseRootCloseRef = useRef(false);
  const onClose = onRootClose || noop;

  const handleMouseCapture = useCallback(
    e => {
      const currentTarget = ref && ('current' in ref ? ref.current : ref);
      warning(
        !!currentTarget,
        'RootClose captured a close event but does not have a ref to compare it to. ' +
          'useRootClose(), should be passed a ref that resolves to a DOM node',
      );

      preventMouseRootCloseRef.current =
        !currentTarget ||
        isModifiedEvent(e) ||
        !isLeftClickEvent(e) ||
        contains(currentTarget, e.target);
    },
    [ref],
  );

  const handleMouse = useEventCallback(e => {
    if (!preventMouseRootCloseRef.current) {
      onClose(e);
    }
  });

  const handleKeyUp = useEventCallback(e => {
    if (e.keyCode === escapeKeyCode) {
      onClose(e);
    }
  });

  useEffect(() => {
    if (disabled || ref == null) return undefined;

    // Use capture for this listener so it fires before React's listener, to
    // avoid false positives in the contains() check below if the target DOM
    // element is removed in the React mouse callback.
    const removeMouseCaptureListener = listen(
      document,
      clickTrigger,
      handleMouseCapture,
      true,
    );

    const removeMouseListener = listen(document, clickTrigger, handleMouse);
    const removeKeyupListener = listen(document, 'keyup', handleKeyUp);

    let mobileSafariHackListeners = [];
    if ('ontouchstart' in document.documentElement) {
      mobileSafariHackListeners = [].slice
        .call(document.body.children)
        .map(el => listen(el, 'mousemove', noop));
    }

    return () => {
      removeMouseCaptureListener();
      removeMouseListener();
      removeKeyupListener();
      mobileSafariHackListeners.forEach(remove => remove());
    };
  }, [
    ref,
    disabled,
    clickTrigger,
    handleMouseCapture,
    handleMouse,
    handleKeyUp,
  ]);
}

export default useRootClose;
