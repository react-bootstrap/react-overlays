import classes from 'dom-helpers/class';
import css from 'dom-helpers/style';
import getScrollbarSize from 'dom-helpers/util/scrollbarSize';

import isOverflowing from './utils/isOverflowing';
import {
  ariaHidden,
  hideSiblings,
  showSiblings,
} from './utils/manageAriaHidden';

function findIndexOf(arr, cb) {
  let idx = -1;
  arr.some((d, i) => {
    if (cb(d, i)) {
      idx = i;
      return true;
    }
    return false;
  });
  return idx;
}

/**
 * Proper state managment for containers and the modals in those containers.
 *
 * @internal Used by the Modal to ensure proper styling of containers.
 */
class ModalManager {
  constructor({
    hideSiblingNodes = true,
    handleContainerOverflow = true,
  } = {}) {
    this.hideSiblingNodes = hideSiblingNodes;
    this.handleContainerOverflow = handleContainerOverflow;
    this.modals = [];
    this.containers = [];
    this.data = [];
    this.scrollbarSize = getScrollbarSize();
  }

  isContainerOverflowing(modal) {
    const data = this.data[this.containerIndexFromModal(modal)];
    return data && data.overflowing;
  }

  containerIndexFromModal(modal) {
    return findIndexOf(this.data, d => d.modals.indexOf(modal) !== -1);
  }

  setContainerStyle(containerState, container) {
    let style = { overflow: 'hidden' };

    // we are only interested in the actual `style` here
    // because we will override it
    containerState.style = {
      overflow: container.style.overflow,
      paddingRight: container.style.paddingRight,
    };

    if (containerState.overflowing) {
      // use computed style, here to get the real padding
      // to add our scrollbar width
      style.paddingRight = `${parseInt(
        css(container, 'paddingRight') || 0,
        10,
      ) + this.scrollbarSize}px`;
    }

    css(container, style);
  }

  removeContainerStyle(containerState, container) {
    const { style } = containerState;

    Object.keys(style).forEach(key => {
      container.style[key] = style[key];
    });
  }

  add(modal, container, className) {
    let modalIdx = this.modals.indexOf(modal);
    let containerIdx = this.containers.indexOf(container);

    if (modalIdx !== -1) {
      return modalIdx;
    }

    modalIdx = this.modals.length;
    this.modals.push(modal);

    if (this.hideSiblingNodes) {
      hideSiblings(container, modal);
    }

    if (containerIdx !== -1) {
      this.data[containerIdx].modals.push(modal);
      return modalIdx;
    }

    let data = {
      modals: [modal],
      // right now only the first modal of a container will have its classes applied
      classes: className ? className.split(/\s+/) : [],
      overflowing: isOverflowing(container),
    };

    if (this.handleContainerOverflow) {
      this.setContainerStyle(data, container);
    }

    data.classes.forEach(classes.addClass.bind(null, container));

    this.containers.push(container);
    this.data.push(data);

    return modalIdx;
  }

  remove(modal) {
    let modalIdx = this.modals.indexOf(modal);

    if (modalIdx === -1) {
      return;
    }

    let containerIdx = this.containerIndexFromModal(modal);
    let data = this.data[containerIdx];
    let container = this.containers[containerIdx];

    data.modals.splice(data.modals.indexOf(modal), 1);

    this.modals.splice(modalIdx, 1);

    // if that was the last modal in a container,
    // clean up the container
    if (data.modals.length === 0) {
      data.classes.forEach(classes.removeClass.bind(null, container));

      if (this.handleContainerOverflow) {
        this.removeContainerStyle(data, container);
      }

      if (this.hideSiblingNodes) {
        showSiblings(container, modal);
      }
      this.containers.splice(containerIdx, 1);
      this.data.splice(containerIdx, 1);
    } else if (this.hideSiblingNodes) {
      // otherwise make sure the next top modal is visible to a SR
      const { backdrop, dialog } = data.modals[data.modals.length - 1];
      ariaHidden(false, dialog);
      ariaHidden(false, backdrop);
    }
  }

  isTopModal(modal) {
    return (
      !!this.modals.length && this.modals[this.modals.length - 1] === modal
    );
  }
}

export default ModalManager;
