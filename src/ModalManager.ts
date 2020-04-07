import addClass from 'dom-helpers/addClass';
import removeClass from 'dom-helpers/removeClass';
import css from 'dom-helpers/css';
import getScrollbarSize from 'dom-helpers/scrollbarSize';

import isOverflowing from './isOverflowing';
import { ariaHidden, hideSiblings, showSiblings } from './manageAriaHidden';

function findIndexOf<T>(arr: T[], cb: (item: T, idx: number) => boolean) {
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

export interface ModalInstance {
  dialog: Element;
  backdrop: Element;
}

export type ContainerState = Record<string, any> & {
  isOverflowing?: boolean;
  style?: Partial<CSSStyleDeclaration>;
  modals: ModalInstance[];
};
/**
 * Proper state management for containers and the modals in those containers.
 *
 * @internal Used by the Modal to ensure proper styling of containers.
 */
class ModalManager {
  readonly hideSiblingNodes: boolean;

  readonly handleContainerOverflow: boolean;

  readonly modals: ModalInstance[];

  readonly containers: HTMLElement[];

  readonly data: ContainerState[];

  readonly scrollbarSize: number;

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

  isContainerOverflowing(modal: ModalInstance) {
    const data = this.data[this.containerIndexFromModal(modal)];
    return data && data.overflowing;
  }

  containerIndexFromModal(modal: ModalInstance) {
    return findIndexOf(this.data, (d) => d.modals.indexOf(modal) !== -1);
  }

  setContainerStyle(containerState: ContainerState, container: HTMLElement) {
    const style: Partial<CSSStyleDeclaration> = { overflow: 'hidden' };

    // we are only interested in the actual `style` here
    // because we will override it
    containerState.style = {
      overflow: container.style.overflow,
      paddingRight: container.style.paddingRight,
    };

    if (containerState.overflowing) {
      // use computed style, here to get the real padding
      // to add our scrollbar width
      style.paddingRight = `${
        parseInt(css(container, 'paddingRight') || '0', 10) + this.scrollbarSize
      }px`;
    }

    css(container, style as any);
  }

  removeContainerStyle(containerState: ContainerState, container: HTMLElement) {
    const { style } = containerState;

    Object.keys(style!).forEach((key: string) => {
      container.style[key as any] = style![key as keyof CSSStyleDeclaration];
    });
  }

  add(modal: ModalInstance, container: HTMLElement, className?: string) {
    let modalIdx = this.modals.indexOf(modal);
    const containerIdx = this.containers.indexOf(container);

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

    const data = {
      modals: [modal],
      // right now only the first modal of a container will have its classes applied
      classes: className ? className.split(/\s+/) : [],
      overflowing: isOverflowing(container),
    };

    if (this.handleContainerOverflow) {
      this.setContainerStyle(data, container);
    }

    data.classes.forEach(addClass.bind(null, container));

    this.containers.push(container);
    this.data.push(data);

    return modalIdx;
  }

  remove(modal: ModalInstance) {
    const modalIdx = this.modals.indexOf(modal);

    if (modalIdx === -1) {
      return;
    }

    const containerIdx = this.containerIndexFromModal(modal);
    const data = this.data[containerIdx];
    const container = this.containers[containerIdx];

    data.modals.splice(data.modals.indexOf(modal), 1);

    this.modals.splice(modalIdx, 1);

    // if that was the last modal in a container,
    // clean up the container
    if (data.modals.length === 0) {
      data.classes.forEach(removeClass.bind(null, container));

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

  isTopModal(modal: ModalInstance) {
    return (
      !!this.modals.length && this.modals[this.modals.length - 1] === modal
    );
  }
}

export default ModalManager;
