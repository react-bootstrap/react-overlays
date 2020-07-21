import PropTypes from 'prop-types';
import React, { useContext, useRef } from 'react';
import useCallbackRef from '@restart/hooks/useCallbackRef';
import DropdownContext, { DropdownContextValue } from './DropdownContext';
import usePopper, {
  UsePopperOptions,
  Placement,
  Offset,
  UsePopperState,
} from './usePopper';
import useRootClose, { RootCloseOptions } from './useRootClose';
import mergeOptionsWithPopperConfig from './mergeOptionsWithPopperConfig';

export interface UseDropdownMenuOptions {
  flip?: boolean;
  show?: boolean;
  fixed?: boolean;
  alignEnd?: boolean;
  usePopper?: boolean;
  offset?: Offset;
  rootCloseEvent?: RootCloseOptions['clickTrigger'];
  popperConfig?: Omit<UsePopperOptions, 'enabled' | 'placement'>;
}

export type UserDropdownMenuProps = Record<string, any> & {
  ref: React.RefCallback<HTMLElement>;
  style?: React.CSSProperties;
  'aria-labelledby'?: string;
};

export type UserDropdownMenuArrowProps = Record<string, any> & {
  ref: React.RefCallback<HTMLElement>;
  style: React.CSSProperties;
};

export interface UseDropdownMenuMetadata {
  show: boolean;
  alignEnd?: boolean;
  hasShown: boolean;
  toggle?: DropdownContextValue['toggle'];
  popper: UsePopperState | null;
  arrowProps: Partial<UserDropdownMenuArrowProps>;
}

const noop: any = () => {};

/**
 * @memberOf Dropdown
 * @param {object}  options
 * @param {boolean} options.flip Automatically adjust the menu `drop` position based on viewport edge detection
 * @param {[number, number]} options.offset Define an offset distance between the Menu and the Toggle
 * @param {boolean} options.show Display the menu manually, ignored in the context of a `Dropdown`
 * @param {boolean} options.usePopper opt in/out of using PopperJS to position menus. When disabled you must position it yourself.
 * @param {string}  options.rootCloseEvent The pointer event to listen for when determining "clicks outside" the menu for triggering a close.
 * @param {object}  options.popperConfig Options passed to the [`usePopper`](/api/usePopper) hook.
 */
export function useDropdownMenu(options: UseDropdownMenuOptions = {}) {
  const context = useContext(DropdownContext);

  const [arrowElement, attachArrowRef] = useCallbackRef<Element>();

  const hasShownRef = useRef(false);

  const {
    flip,
    offset,
    rootCloseEvent,
    fixed = false,
    popperConfig = {},
    usePopper: shouldUsePopper = !!context,
  } = options;

  const show = context?.show == null ? !!options.show : context.show;
  const alignEnd =
    context?.alignEnd == null ? options.alignEnd : context.alignEnd;

  if (show && !hasShownRef.current) {
    hasShownRef.current = true;
  }

  const handleClose = (e: React.SyntheticEvent | Event) => {
    context?.toggle(false, e);
  };

  const { drop, setMenu, menuElement, toggleElement } = context || {};

  let placement: Placement = alignEnd ? 'bottom-end' : 'bottom-start';
  if (drop === 'up') placement = alignEnd ? 'top-end' : 'top-start';
  else if (drop === 'right') placement = alignEnd ? 'right-end' : 'right-start';
  else if (drop === 'left') placement = alignEnd ? 'left-end' : 'left-start';

  const popper = usePopper(
    toggleElement,
    menuElement,
    mergeOptionsWithPopperConfig({
      placement,
      enabled: !!(shouldUsePopper && show),
      enableEvents: show,
      offset,
      flip,
      fixed,
      arrowElement,
      popperConfig,
    }),
  );

  const menuProps: UserDropdownMenuProps = {
    ref: setMenu || noop,
    'aria-labelledby': toggleElement?.id,
    ...popper.attributes.popper,
    style: popper.styles.popper as any,
  };

  const metadata: UseDropdownMenuMetadata = {
    show,
    alignEnd,
    hasShown: hasShownRef.current,
    toggle: context?.toggle,
    popper: shouldUsePopper ? popper : null,
    arrowProps: shouldUsePopper
      ? {
          ref: attachArrowRef,
          ...popper.attributes.arrow,
          style: popper.styles.arrow as any,
        }
      : {},
  };

  useRootClose(menuElement, handleClose, {
    clickTrigger: rootCloseEvent,
    disabled: !show,
  });

  return [menuProps, metadata] as const;
}

const propTypes = {
  /**
   * A render prop that returns a Menu element. The `props`
   * argument should spread through to **a component that can accept a ref**.
   *
   * @type {Function ({
   *   show: boolean,
   *   alignEnd: boolean,
   *   close: (?SyntheticEvent) => void,
   *   placement: Placement,
   *   update: () => void,
   *   forceUpdate: () => void,
   *   props: {
   *     ref: (?HTMLElement) => void,
   *     style: { [string]: string | number },
   *     aria-labelledby: ?string
   *   },
   *   arrowProps: {
   *     ref: (?HTMLElement) => void,
   *     style: { [string]: string | number },
   *   },
   * }) => React.Element}
   */
  children: PropTypes.func.isRequired,

  /**
   * Controls the visible state of the menu, generally this is
   * provided by the parent `Dropdown` component,
   * but may also be specified as a prop directly.
   */
  show: PropTypes.bool,

  /**
   * Aligns the dropdown menu to the 'end' of it's placement position.
   * Generally this is provided by the parent `Dropdown` component,
   * but may also be specified as a prop directly.
   */
  alignEnd: PropTypes.bool,

  /**
   * Enables the Popper.js `flip` modifier, allowing the Dropdown to
   * automatically adjust it's placement in case of overlap with the viewport or toggle.
   * Refer to the [flip docs](https://popper.js.org/popper-documentation.html#modifiers..flip.enabled) for more info
   */
  flip: PropTypes.bool,

  usePopper: PropTypes.oneOf([true, false]),

  /**
   * A set of popper options and props passed directly to react-popper's Popper component.
   */
  popperConfig: PropTypes.object,

  /**
   * Override the default event used by RootCloseWrapper.
   */
  rootCloseEvent: PropTypes.string,
};

const defaultProps = {
  usePopper: true,
};

export interface DropdownMenuProps extends UseDropdownMenuOptions {
  children: (
    props: UserDropdownMenuProps,
    meta: UseDropdownMenuMetadata,
  ) => React.ReactNode;
}

/**
 * Also exported as `<Dropdown.Menu>` from `Dropdown`.
 *
 * @displayName DropdownMenu
 * @memberOf Dropdown
 */
function DropdownMenu({ children, ...options }: DropdownMenuProps) {
  const [props, meta] = useDropdownMenu(options);

  return <>{meta.hasShown ? children(props, meta) : null}</>;
}

DropdownMenu.displayName = 'ReactOverlaysDropdownMenu';

DropdownMenu.propTypes = propTypes;
DropdownMenu.defaultProps = defaultProps;

/** @component */
export default DropdownMenu;
