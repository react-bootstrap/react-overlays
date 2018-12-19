import PropTypes from 'prop-types';
import React from 'react';

import { Popper } from 'react-popper';
import DropdownContext from './DropdownContext';
import RootCloseWrapper from './RootCloseWrapper';
import mapContextToProps from 'react-context-toolbox/mapContextToProps';

class DropdownMenu extends React.Component {
  static displayName = 'ReactOverlaysDropdownMenu';

  static propTypes = {
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

    /** @private */
    onToggle: PropTypes.func,
    /** @private */
    menuRef: PropTypes.func,
    /** @private */
    drop: PropTypes.string,
    /** @private */
    toggleNode: PropTypes.any,
  };

  static defaultProps = {
    usePopper: true,
  };

  state = { toggleId: null };

  popperIsInitialized = false;

  getSnapshotBeforeUpdate(prevProps) {
    // If, to the best we can tell, this update won't reinitialize popper,
    // manually schedule an update
    const shouldUpdatePopper =
      !prevProps.show &&
      this.props.show &&
      this.popperIsInitialized &&
      // a new reference node will already trigger this internally
      prevProps.toggleNode === this.props.toggleNode;

    if (this.props.show && this.props.usePopper && !this.popperIsInitialized) {
      this.popperIsInitialized = true;
    }

    return !!shouldUpdatePopper;
  }

  componentDidUpdate(_, __, shouldUpdatePopper) {
    if (shouldUpdatePopper && this.scheduleUpdate) {
      this.scheduleUpdate();
    }
  }

  handleClose = e => {
    if (!this.props.onToggle) return;

    this.props.onToggle(false, e);
  };

  render() {
    const {
      show,
      flip,
      menuRef,
      alignEnd,
      drop,
      usePopper,
      toggleNode,
      rootCloseEvent,
      popperConfig = {},
    } = this.props;

    let placement = alignEnd ? 'bottom-end' : 'bottom-start';
    if (drop === 'up') placement = alignEnd ? 'top-end' : 'top-start';
    if (drop === 'right') placement = alignEnd ? 'right-end' : 'right-start';
    if (drop === 'left') placement = alignEnd ? 'left-end' : 'left-start';

    let menu = null;
    const menuProps = {
      ref: menuRef,
      'aria-labelledby': toggleNode && toggleNode.id,
    };
    const childArgs = {
      show,
      alignEnd,
      close: this.handleClose,
    };

    if (!usePopper) {
      menu = this.props.children({ ...childArgs, props: menuProps });
    } else if (this.popperIsInitialized || show) {
      // Add it this way, so it doesn't override someones usage
      // with react-poppers <Reference>
      if (toggleNode) popperConfig.referenceElement = toggleNode;

      menu = (
        <Popper
          {...popperConfig}
          innerRef={menuRef}
          placement={placement}
          eventsEnabled={!!show}
          modifiers={{
            flip: { enabled: !!flip },
            ...popperConfig.modifiers,
          }}
        >
          {({ ref, style, ...popper }) => {
            this.scheduleUpdate = popper.scheduleUpdate;

            return this.props.children({
              ...popper,
              ...childArgs,
              props: { ...menuProps, ref, style },
            });
          }}
        </Popper>
      );
    }

    return (
      menu && (
        <RootCloseWrapper
          disabled={!show}
          event={rootCloseEvent}
          onRootClose={this.handleClose}
        >
          {menu}
        </RootCloseWrapper>
      )
    );
  }
}

const DecoratedDropdownMenu = mapContextToProps(
  DropdownContext,
  ({ show, alignEnd, toggle, drop, menuRef, toggleNode }, props) => ({
    drop,
    menuRef,
    toggleNode,
    onToggle: toggle,
    show: show == null ? props.show : show,
    alignEnd: alignEnd == null ? props.alignEnd : alignEnd,
  }),
  DropdownMenu,
);

export default DecoratedDropdownMenu;
