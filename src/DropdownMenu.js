import PropTypes from 'prop-types';
import { useContext, useRef } from 'react';
import useCallbackRef from '@restart/hooks/useCallbackRef';
import DropdownContext from './DropdownContext';
import usePopper from './usePopper';
import useRootClose from './useRootClose';

export function useDropdownMenu(options = {}) {
  const context = useContext(DropdownContext);

  const [arrowElement, attachArrowRef] = useCallbackRef();

  const hasShownRef = useRef(false);

  const {
    flip,
    rootCloseEvent,
    popperConfig = {},
    usePopper: shouldUsePopper = true,
  } = options;

  const show = context.show == null ? options.show : context.show;
  const align = context.align == null ? options.align : context.align;

  if (show && !hasShownRef.current) {
    hasShownRef.current = true;
  }

  const handleClose = e => {
    if (!context.toggle) return;
    context.toggle(false, e);
  };

  const { drop, setMenu, menuElement, toggleElement } = context;

  let placement = 'bottom';
  if (drop === 'up') placement = 'top';
  else if (drop === 'right' || drop === 'left') placement = drop;
  if (align === 'right') placement += `-end`;
  else placement += `-${align || 'start'}`;

  const popper = usePopper(toggleElement, menuElement, {
    placement,
    enabled: !!(shouldUsePopper && show),
    eventsEnabled: !!show,
    modifiers: {
      flip: { enabled: !!flip },
      arrow: {
        ...(popperConfig.modifiers && popperConfig.modifiers.arrow),
        enabled: !!arrowElement,
        element: arrowElement,
      },
      ...popperConfig.modifiers,
    },
  });

  let menu = null;

  const menuProps = {
    ref: setMenu,
    'aria-labelledby': toggleElement && toggleElement.id,
  };
  const childArgs = {
    show,
    align,
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
        style: popper.styles,
      },
      arrowProps: {
        ref: attachArrowRef,
        style: popper.arrowStyles,
      },
    };
  }

  useRootClose(menuElement, handleClose, {
    clickTrigger: rootCloseEvent,
    disabled: !(menu && show),
  });

  return menu;
}

const propTypes = {
  /**
   * A render prop that returns a Menu element. The `props`
   * argument should spread through to **a component that can accept a ref**.
   *
   * @type {Function ({
   *   show: boolean,
   *   align: string,
   *   close: (?SyntheticEvent) => void,
   *   placement: Placement,
   *   outOfBoundaries: ?boolean,
   *   scheduleUpdate: () => void,
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
  align: PropTypes.string,

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

function DropdownMenu({ children, ...options }) {
  const args = useDropdownMenu(options);

  return args.hasShown ? children(args) : null;
}

DropdownMenu.displayName = 'ReactOverlaysDropdownMenu';

DropdownMenu.propTypes = propTypes;
DropdownMenu.defaultProps = defaultProps;

/** @component */
export default DropdownMenu;
