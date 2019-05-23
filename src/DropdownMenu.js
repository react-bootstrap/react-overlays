import PropTypes from 'prop-types';
import React, { useContext, useRef, useEffect } from 'react';
import { Popper } from 'react-popper';
import usePrevious from '@restart/hooks/usePrevious';

import useRootClose from './useRootClose';
import { useMergedRefs } from './utils/mergeRefs';
import DropdownContext from './DropdownContext';

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

function DropdownMenu(props) {
  const prevProps = usePrevious(props);
  const context = useContext(DropdownContext);

  const ref = useRef(null);
  const popperIsInitialized = useRef(false);
  const scheduleUpdateRef = useRef(null);

  const {
    flip,
    usePopper,
    rootCloseEvent,
    children,
    popperConfig = {},
  } = props;

  const show = context.show == null ? props.show : context.show;
  const alignEnd = context.alignEnd == null ? props.alignEnd : context.alignEnd;

  // If, to the best we can tell, this update won't reinitialize popper,
  // manually schedule an update
  const shouldUpdatePopper =
    popperIsInitialized.current && !prevProps.show && show;

  if (show && usePopper && !popperIsInitialized.current) {
    popperIsInitialized.current = true;
  }

  const handleClose = e => {
    if (!context.toggle) return;

    context.toggle(false, e);
  };

  useEffect(() => {
    if (shouldUpdatePopper && scheduleUpdateRef.current) {
      scheduleUpdateRef.current();
    }
  });

  const { drop, menuRef, toggleNode } = context;
  const mergedRef = useMergedRefs(menuRef, ref);

  let placement = alignEnd ? 'bottom-end' : 'bottom-start';
  if (drop === 'up') placement = alignEnd ? 'top-end' : 'top-start';
  if (drop === 'right') placement = alignEnd ? 'right-end' : 'right-start';
  if (drop === 'left') placement = alignEnd ? 'left-end' : 'left-start';

  let menu = null;

  const menuProps = {
    ref: mergedRef,
    'aria-labelledby': toggleNode && toggleNode.id,
  };
  const childArgs = {
    show,
    alignEnd,
    close: handleClose,
  };

  if (!usePopper) {
    menu = children({ ...childArgs, props: menuProps });
  } else if (popperIsInitialized.current || show) {
    // Add it this way, so it doesn't override someones usage
    // with react-poppers <Reference>
    if (toggleNode) popperConfig.referenceElement = toggleNode;

    menu = (
      <Popper
        {...popperConfig}
        innerRef={mergedRef}
        placement={placement}
        eventsEnabled={!!show}
        modifiers={{
          flip: { enabled: !!flip },
          ...popperConfig.modifiers,
        }}
      >
        {/* eslint-disable-next-line no-shadow */}
        {({ ref, style, ...popper }) => {
          scheduleUpdateRef.current = popper.scheduleUpdate;

          return children({
            ...popper,
            ...childArgs,
            props: { ...menuProps, ref, style },
          });
        }}
      </Popper>
    );
  }

  useRootClose(ref, handleClose, {
    clickTrigger: rootCloseEvent,
    disabled: !(menu && show),
  });

  return menu;
}

DropdownMenu.displayName = 'ReactOverlaysDropdownMenu';

DropdownMenu.propTypes = propTypes;
DropdownMenu.defaultProps = defaultProps;

/** @component */
export default DropdownMenu;
