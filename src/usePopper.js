import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import arrow from '@popperjs/core/lib/modifiers/arrow';
import computeStyles from '@popperjs/core/lib/modifiers/computeStyles';
import eventListeners from '@popperjs/core/lib/modifiers/eventListeners';
import flip from '@popperjs/core/lib/modifiers/flip';
import hide from '@popperjs/core/lib/modifiers/hide';
import popperOffsets from '@popperjs/core/lib/modifiers/popperOffsets';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { popperGenerator } from '@popperjs/core/lib/popper-base';
import useSafeState from '@restart/hooks/useSafeState';

const createPopper = popperGenerator({
  defaultModifiers: [
    hide,
    popperOffsets,
    computeStyles,
    eventListeners,
    flip,
    preventOverflow,
    arrow,
  ],
});

const initialPopperStyles = {
  position: 'absolute',
  top: '0',
  left: '0',
  opacity: '0',
  pointerEvents: 'none',
};

const initialArrowStyles = {};

export function toModifierMap(modifiers) {
  const result = {};

  if (!Array.isArray(modifiers)) {
    return modifiers || result;
  }

  // eslint-disable-next-line no-unused-expressions
  modifiers?.forEach(m => {
    result[m.name] = m;
  });
  return result;
}

export function toModifierArray(map) {
  if (Array.isArray(map)) return map;
  return Object.keys(map || {}).map(k => {
    map[k].name = k;
    return map[k];
  });
}

/**
 * Position an element relative some reference element using Popper.js
 *
 * @param {HTMLElement} referenceElement The element
 * @param {HTMLElement} popperElement
 * @param {Object}      options
 * @param {Object}      options.modifiers Popper.js modifiers
 * @param {Boolean}     options.enabled toggle the popper functionality on/off
 * @param {String}      options.placement The popper element placement relative to the reference element
 * @param {Boolean}     options.positionFixed use fixed positioning
 * @param {Boolean}     options.eventsEnabled have Popper listen on window resize events to reposition the element
 * @param {Function}    options.onCreate called when the popper is created
 * @param {Function}    options.onUpdate called when the popper is updated
 */
export default function usePopper(
  referenceElement,
  popperElement,
  {
    enabled = true,
    placement = 'bottom',
    strategy = 'absolute',
    eventsEnabled = true,
    modifiers: userModifiers,
    ...popperOptions
  } = {},
) {
  const popperInstanceRef = useRef();

  const scheduleUpdate = useCallback(() => {
    if (popperInstanceRef.current) {
      popperInstanceRef.current.update();
    }
  }, []);

  const [state, setState] = useSafeState(
    useState({
      placement,
      scheduleUpdate,
      outOfBoundaries: false,
      styles: initialPopperStyles,
      arrowStyles: initialArrowStyles,
    }),
  );

  const updateModifier = useMemo(
    () => ({
      name: 'updateStateModifier',
      enabled: true,
      phase: 'afterWrite',
      requires: ['computeStyles'],
      fn: data => {
        setState({
          scheduleUpdate,
          outOfBoundaries: data.state.modifiersData.hide?.isReferenceHidden,
          placement: data.state.placement,
          styles: { ...data.state.styles?.popper },
          arrowStyles: { ...data.state.styles?.arrow },
          state: data.state,
        });
      },
    }),
    [scheduleUpdate, setState],
  );

  let modifiers = toModifierArray(userModifiers);

  let eventsModifier = modifiers.find(m => m.name === 'eventListeners');

  if (!eventsModifier && eventsEnabled) {
    eventsModifier = {
      name: 'eventListeners',
      enabled: true,
    };
    modifiers = [...modifiers, eventsModifier];
  }

  // A placement difference in state means popper determined a new placement
  // apart from the props value. By the time the popper element is rendered with
  // the new position Popper has already measured it, if the place change triggers
  // a size change it will result in a misaligned popper. So we schedule an update to be sure.
  useEffect(() => {
    scheduleUpdate();
  }, [state.placement, scheduleUpdate]);

  useEffect(() => {
    if (!popperInstanceRef.current || !enabled) return;

    popperInstanceRef.current.setOptions({
      placement,
      strategy,
      modifiers: [...modifiers, updateModifier],
    });
    // intentionally NOT re-running on new modifiers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy, placement, eventsModifier.enabled, updateModifier, enabled]);

  useEffect(() => {
    if (!enabled || referenceElement == null || popperElement == null) {
      return undefined;
    }

    popperInstanceRef.current = createPopper(referenceElement, popperElement, {
      ...popperOptions,
      placement,
      strategy,
      modifiers: [...modifiers, updateModifier],
    });

    return () => {
      if (popperInstanceRef.current !== null) {
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = null;
        setState(s => ({
          ...s,
          styles: initialPopperStyles,
          arrowStyles: initialArrowStyles,
        }));
      }
    };
    // This is only run once to _create_ the popper
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, referenceElement, popperElement]);

  return state;
}
