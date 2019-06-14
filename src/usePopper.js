import PopperJS from 'popper.js';

import { useCallback, useEffect, useState, useRef } from 'react';

const initialPopperStyles = {
  position: 'absolute',
  top: '0',
  left: '0',
  opacity: '0',
  pointerEvents: 'none',
};

const initialArrowStyles = {};

const getRefValue = refOrValue =>
  refOrValue !== null && 'current' in refOrValue
    ? refOrValue.current
    : refOrValue;

export default function usePopper(
  referenceElement,
  popperElement,
  {
    enabled = true,
    placement = 'bottom',
    positionFixed = false,
    eventsEnabled = true,
    modifiers = {},
  } = {},
) {
  const popperInstanceRef = useRef();

  const hasArrow = !!(modifiers.arrow && modifiers.arrow.element);

  const scheduleUpdate = useCallback(() => {
    if (popperInstanceRef.current) {
      popperInstanceRef.current.scheduleUpdate();
    }
  }, [popperInstanceRef]);

  const [state, setState] = useState({
    placement,
    scheduleUpdate,
    outOfBoundaries: false,
    styles: initialPopperStyles,
    arrowStyles: initialArrowStyles,
  });

  // A placement difference in state means popper determined a new placement
  // apart from the props value. By the time the popper element is rendered with
  // the new position Popper has already measured it, if the place change triggers
  // a size change it will result in a misaligned popper. So we schedule an update to be sure.
  useEffect(() => {
    scheduleUpdate();
  }, [state.placement, scheduleUpdate]);

  /** Toggle Events */
  useEffect(() => {
    if (popperInstanceRef.current) {
      // eslint-disable-next-line no-unused-expressions
      eventsEnabled
        ? popperInstanceRef.current.enableEventListeners()
        : popperInstanceRef.current.disableEventListeners();
    }
  }, [eventsEnabled, popperInstanceRef]);

  useEffect(() => {
    if (!enabled || referenceElement === null || popperElement === null) {
      return undefined;
    }

    const arrow = modifiers.arrow && {
      ...modifiers.arrow,
      element: getRefValue(modifiers.arrow.element),
    };

    popperInstanceRef.current = new PopperJS(referenceElement, popperElement, {
      placement,
      positionFixed,
      modifiers: {
        ...modifiers,
        arrow,
        applyStyle: { enabled: false },
        updateStateModifier: {
          enabled: true,
          order: 900,
          fn(data) {
            setState({
              scheduleUpdate,
              styles: {
                position: data.offsets.popper.position,
                ...data.styles,
              },
              arrowStyles: data.arrowStyles,
              outOfBoundaries: data.hide,
              placement: data.placement,
            });
          },
        },
      },
    });

    return () => {
      if (popperInstanceRef.current !== null) {
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = null;
      }
    };
    // intentionally NOT re-running on new modifiers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    placement,
    positionFixed,
    referenceElement,
    popperElement,
    hasArrow,
  ]);

  return state;
}
