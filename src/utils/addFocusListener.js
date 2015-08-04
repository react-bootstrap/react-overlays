/**
 * Firefox doesn't have a focusin event so using capture is easiest way to get bubbling
 * IE8 can't do addEventListener, but does have onfocusin, so we use that in ie8
 *
 * We only allow one Listener at a time to avoid stack overflows
 */
export default function addFocusListener(handler) {
  let useFocusin = !document.addEventListener;
  let remove;

  if (useFocusin) {
    document.attachEvent('onfocusin', handler);
    remove = () => document.detachEvent('onfocusin', handler);
  } else {
    document.addEventListener('focus', handler, true);
    remove = () => document.removeEventListener('focus', handler, true);
  }

  return { remove };
}
