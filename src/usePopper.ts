import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSafeState from '@restart/hooks/useSafeState';
import * as Popper from '@popperjs/core';
import { createPopper } from './popper';

const initialPopperStyles: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  top: '0',
  left: '0',
  opacity: '0',
  pointerEvents: 'none',
};

const initialArrowStyles = {};

// until docjs supports type exports...
export type Modifier<Name, Options> = Popper.Modifier<Name, Options>;
export type Options = Popper.Options;
export type Instance = Popper.Instance;
export type Placement = Popper.Placement;
export type VirtualElement = Popper.VirtualElement;
export type State = Popper.State;

export type ModifierMap = Record<string, Partial<Modifier<any, any>>>;
export type Modifiers =
  | Popper.Options['modifiers']
  | Record<string, Partial<Modifier<any, any>>>;

export function toModifierMap(modifiers: Modifiers | undefined) {
  const result: Modifiers = {};

  if (!Array.isArray(modifiers)) {
    return modifiers || result;
  }

  // eslint-disable-next-line no-unused-expressions
  modifiers?.forEach((m) => {
    result[m.name!] = m;
  });
  return result;
}

export function toModifierArray(map: Modifiers | undefined = {}) {
  if (Array.isArray(map)) return map;
  return Object.keys(map).map((k) => {
    map[k].name = k;
    return map[k];
  });
}

export type UsePopperOptions = Omit<
  Options,
  'modifiers' | 'placement' | 'strategy'
> & {
  placement?: Options['placement'];
  strategy?: Options['strategy'];
  modifiers?: Modifiers;
  eventsEnabled?: boolean;
  enabled?: boolean;
};

export interface UsePopperState {
  placement: Placement;
  outOfBoundaries: boolean;
  scheduleUpdate: () => void;
  styles: Partial<CSSStyleDeclaration>;
  arrowStyles: Partial<CSSStyleDeclaration>;
  state?: State;
}

/**
 * Position an element relative some reference element using Popper.js
 *
 * @param referenceElement
 * @param popperElement
 * @param {object}      options
 * @param {object=}     options.modifiers Popper.js modifiers
 * @param {boolean=}    options.enabled toggle the popper functionality on/off
 * @param {string=}     options.placement The popper element placement relative to the reference element
 * @param {string=}     options.strategy the positioning strategy
 * @param {boolean=}    options.eventsEnabled have Popper listen on window resize events to reposition the element
 * @param {function=}   options.onCreate called when the popper is created
 * @param {function=}   options.onUpdate called when the popper is updated
 *
 * @returns {UsePopperState} The popper state
 */
function usePopper(
  referenceElement: VirtualElement | null | undefined,
  popperElement: HTMLElement | null | undefined,
  {
    enabled = true,
    placement = 'bottom',
    strategy = 'absolute',
    eventsEnabled = true,
    modifiers: userModifiers,
    ...popperOptions
  }: UsePopperOptions = {},
): UsePopperState {
  const popperInstanceRef = useRef<Instance>();

  const scheduleUpdate = useCallback(() => {
    if (popperInstanceRef.current) {
      popperInstanceRef.current.update();
    }
  }, []);

  const [state, setState] = useSafeState(
    useState<UsePopperState>({
      placement,
      scheduleUpdate,
      outOfBoundaries: false,
      styles: initialPopperStyles,
      arrowStyles: initialArrowStyles,
    }),
  );

  const updateModifier = useMemo<Modifier<'updateStateModifier', any>>(
    () => ({
      name: 'updateStateModifier',
      enabled: true,
      phase: 'afterWrite',
      requires: ['computeStyles'],
      fn: (data) => {
        setState({
          scheduleUpdate,
          outOfBoundaries: !!data.state.modifiersData.hide?.isReferenceHidden,
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

  let eventsModifier = modifiers.find((m) => m.name === 'eventListeners');

  if (!eventsModifier && eventsEnabled) {
    eventsModifier = {
      name: 'eventListeners',
      enabled: true,
    };
    modifiers = [...modifiers, eventsModifier!];
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
  }, [strategy, placement, eventsModifier!.enabled, updateModifier, enabled]);

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
      if (popperInstanceRef.current != null) {
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = undefined;

        setState((s) => ({
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

export default usePopper;
