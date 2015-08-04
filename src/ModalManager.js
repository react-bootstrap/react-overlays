import css from 'dom-helpers/style';
import classes from 'dom-helpers/class';
import getScrollbarSize from 'dom-helpers/util/scrollbarSize';
import isWindow from 'dom-helpers/query/isWindow';

function containerClientHeight(container) {
  let win = isWindow(container);
  return win
      ? win.documentElement.clientHeight
      : container.clientHeight;
}

let findContainer = (data, modal)=> {
  let idx = -1;
  data.some((d, i)=> {
    if (d.modals.indexOf(modal) !== -1){
      idx = i;
      return true;
    }
  });
  return idx;
};

function remove(arr, item){
  let i = arr.indexOf(item);
  if (i !== -1 ){ arr.splice(i, 0); }
}

/**
 * Proper state managment for containers and the modals in those containers.
 *
 * @internal Used by the Modal to ensure proper styling of containers.
 */
class ModalManager {

  constructor(){
    this.modals = [];
    this.containers = [];
    this.data = [];

    this._listeners = [];
  }

  add(modal, container, className){
    let modalIdx = this.modals.indexOf(modal);
    let containerIdx = this.containers.indexOf(container);

    if (modalIdx !== -1) {
      return modalIdx;
    }

    modalIdx = this.modals.length;
    this.modals.push(modal);

    if ( containerIdx !== -1) {
      this.data[containerIdx].modals.push(modal);
      return modalIdx;
    }

    let data = {
      modals: [ modal ],
      //right now only the first modal of a container will have its classes applied
      classes: className ? className.split(/\s+/) : [],
      //we are only interested in the actual `style` here becasue we will override it
      style: {
        overflow: container.style.overflow,
        paddingRight: container.style.paddingRight
      }
    };


    let style = {
      overflow: 'hidden'
    };

    data.overflowing = container.scrollHeight > containerClientHeight(container);

    if (data.overflowing) {
      // use computed style, here to get the real padding
      // to add our scrollbar width
      style.paddingRight =
        parseInt(css(container, 'paddingRight') || 0, 10) + getScrollbarSize() + 'px';
    }

    css(container, style);

    data.classes.forEach(
      classes.addClass.bind(null, container));

    this.containers.push(container);
    this.data.push(data);

    return modalIdx;
  }

  remove(modal){
    let modalIdx = this.modals.indexOf(modal);

    if (modalIdx === -1) {
      return;
    }

    let containerIdx = findContainer(this.data, modal);
    let data = this.data[containerIdx];
    let container = this.containers[containerIdx];

    data.modals.splice(
      data.modals.indexOf(modal), 1);

    this.modals.splice(modalIdx, 1);

    //if that was the last modal in a container, clean it up.
    if (data.modals.length === 0){
      Object.keys(data.style).forEach(
        key => container.style[key] = data.style[key]);

      data.classes.forEach(
        classes.removeClass.bind(null, container));

      this.containers.splice(containerIdx, 1);
      this.data.splice(containerIdx, 1);
    }
  }

  listen(handler){
    this._listeners.push(handler);
    return ()=> remove(this.listeners, handler);
  }

  _emit(args){
    this._listeners.forEach(l => l.apply(this, args));
  }

  isTopModal(modal) {
    return !!this.modals.length
        && this.modals[this.modals.length - 1] === modal;
  }
}

export default ModalManager;
