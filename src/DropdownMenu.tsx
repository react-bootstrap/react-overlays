import PropTypes from 'prop-types';
import React, { useContext, useRef } from 'react';
import useCallbackRef from '@restart/hooks/useCallbackRef';
import DropdownContext from './DropdownContext';
import usePopper, { UsePopperOptions, Placement, Offset } from './usePopper';
import useRootClose, { RootCloseOptions } from './useRootClose';
import mergeOptionsWithPopperConfig from './mergeOptionsWithPopperConfig';

export interface UseDropdownMenuOptions {
  flip?: boolean;
  show?: boolean;
  alignEnd?: boolean;
  usePopper?: boolean;
  offset?: Offset;
  rootCloseEvent?: RootCloseOptions['clickTrigger'];
  popperConfig?: Omit<UsePopperOptions, 'enabled' | 'placement'>;
}

export interface UseDropdownMenuValue {
  show: boolean;
  alignEnd?: boolean;
  hasShown: boolean;
  close: (e: Event) => void;
  update: () => void;
  forceUpdate: () => void;
  props: Record<string, any> & {
    ref: React.RefCallback<HTMLElement>;
    style?: React.CSSProperties;
    'aria-labelledby'?: string;
  };
  arrowProps: Record<string, any> & {
    ref: React.RefCallback<HTMLElement>;
    style: React.CSSProperties;
  };
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
    popperConfig = {},
    usePopper: shouldUsePopper = !!context,
  } = options;

  const show = context?.show == null ? options.show : context.show;
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

  const { styles, attributes, ...popper } = usePopper(
    toggleElement,
    menuElement,
    mergeOptionsWithPopperConfig({
      placement,
      enabled: !!(shouldUsePopper && show),
      enableEvents: show,
      offset,
      flip,
      arrowElement,
      popperConfig,
    }),
  );

  let menu: Partial<UseDropdownMenuValue>;

  const menuProps = {
    ref: setMenu || noop,
    'aria-labelledby': toggleElement?.id,
  };

  const childArgs = {
    show,
    alignEnd,
    hasShown: hasShownRef.current,
    close: handleClose,
  };

  if (!shouldUsePopper) {
    menu = { ...childArgs, props: menuProps };
  } else {
    menu = {
      ...popper,
      ...childArgs,
      props: {
        ...menuProps,
        ...attributes.popper,
        style: styles.popper as any,
      },
      arrowProps: {
        ref: attachArrowRef,
        ...attributes.arrow,
        style: styles.arrow as any,
      },
    };
  }

  useRootClose(menuElement, handleClose, {
    clickTrigger: rootCloseEvent,
    disabled: !(menu && show),
  });

  return menu as UseDropdownMenuValue;
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
  children: (args: UseDropdownMenuValue) => React.ReactNode;
}

/**
 * Also exported as `<Dropdown.Menu>` from `Dropdown`.
 *
 * @displayName DropdownMenu
 * @memberOf Dropdown
 */
function DropdownMenu({ children, ...options }: DropdownMenuProps) {
  const args = useDropdownMenu(options);

  return <>{args.hasShown ? children(args) : null}</>;
}

DropdownMenu.displayName = 'ReactOverlaysDropdownMenu';

DropdownMenu.propTypes = propTypes;
DropdownMenu.defaultProps = defaultProps;

/** @component */
export default DropdownMenu;
