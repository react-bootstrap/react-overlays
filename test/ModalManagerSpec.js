import Modal from '../src/Modal';
import ModalManager from '../src/ModalManager';
import { injectCss } from './helpers';
import getScrollbarSize from 'dom-helpers/util/scrollbarSize';
import css from 'dom-helpers/style';

describe('ModalManager', ()=> {
  let container, manager;

  beforeEach(()=>{
    manager = new ModalManager();
    container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
  });

  afterEach(()=>{
    document.body.removeChild(container);
    container = null;
    manager = null;
  });

  it('should add Modal', ()=>{
    let modal = new Modal({});

    manager.add(modal, container);

    expect(manager.modals.length).to.equal(1);
    expect(manager.modals[0]).to.equal(modal);

    expect(manager.containers[0]).to.equal(container);
    expect(manager.data[0]).to.eql({
      modals: [modal],
      classes: [],
      overflowing: false,
      style: {
        overflow: '',
        paddingRight: ''
      }
    });
  });

  it('should not add a modal twice', ()=>{
    let modal = new Modal({});
    manager.add(modal, container);
    manager.add(modal, container);

    expect(manager.modals.length).to.equal(1);
    expect(manager.containers.length).to.equal(1);
    expect(manager.data[0].modals.length).to.equal(1);
  });

  it('should not add a container twice', ()=>{
    let modalA = new Modal({});
    let modalB = new Modal({});

    manager.add(modalA, container);
    manager.add(modalB, container);

    expect(manager.modals.length).to.equal(2);
    expect(manager.containers.length).to.equal(1);
    expect(manager.data[0].modals.length).to.equal(2);
  });

  it('should remove modal', ()=>{
    let modalA = new Modal({});
    let modalB = new Modal({});

    manager.add(modalA, container);
    manager.add(modalB, container);

    manager.remove(modalA);

    expect(manager.modals.length).to.equal(1);
    expect(manager.containers.length).to.equal(1);
    expect(manager.data[0].modals.length).to.equal(1);
  });

  it('should remove container when there are no more modals associated with it', ()=>{
    let modalA = new Modal({});
    let modalB = new Modal({});

    manager.add(modalA, container);
    manager.add(modalB, container);

    expect(manager.data[0].modals.length).to.equal(2);

    manager.remove(modalA);
    manager.remove(modalB);

    expect(manager.modals.length).to.equal(0);
    expect(manager.containers.length).to.equal(0);
    expect(manager.data.length).to.equal(0);
  });

  describe('container aria-hidden', ()=>{
    let app;

    beforeEach(()=> {
      app = document.createElement('div');
      app.setAttribute('id', 'app-root');
      container.appendChild(app);
    });

    it('should add aria-hidden to container siblings', ()=>{
      manager.add(new Modal({}), container);

      expect(app.getAttribute('aria-hidden')).to.equal('true');
    });

    it('should add aria-hidden to previous modals', ()=>{
      let modalA = new Modal({});
      let mount = document.createElement('div');

      modalA.mountNode = mount;
      container.appendChild(mount);

      manager.add(modalA, container);
      manager.add(new Modal({}), container);

      expect(app.getAttribute('aria-hidden')).to.equal('true');
      expect(mount.getAttribute('aria-hidden')).to.equal('true');
    });

    it('should remove aria-hidden on americas next top modal', ()=>{
      let modalA = new Modal({});
      let modalB = new Modal({});
      let mount = document.createElement('div');

      modalA.mountNode = mount;
      container.appendChild(mount);

      manager.add(modalA, container);
      manager.add(modalB, container);

      expect(mount.getAttribute('aria-hidden')).to.equal('true');

      manager.remove(modalB, container);

      expect(mount.getAttribute('aria-hidden')).to.equal(null);
    });

    it('should remove aria-hidden on siblings', ()=>{
      let modal = new Modal({});

      manager.add(modal, container);

      expect(app.getAttribute('aria-hidden')).to.equal('true');

      manager.remove(modal, container);

      expect(app.getAttribute('aria-hidden')).to.equal(null);
    });
  });

  describe('container styles', ()=>{

    beforeEach(()=> {
      container.appendChild(
        document.createElement('div'));
      injectCss(`
        #container {
          padding-right: 20px;
          overflow: scroll;
          height: 300px;
        }

        #container > div {
          height: 1000px;
        }
      `);
    });

    afterEach(()=> injectCss.reset());

    it('should set container overflow to hidden ', ()=>{
      let modal = new Modal({});

      expect(container.style.overflow).to.equal('');

      manager.add(modal, container);

      expect(container.style.overflow).to.equal('hidden');
    });

    it('should set add to existing container padding', ()=>{
      let modal = new Modal({});
      manager.add(modal, container);
      expect(container.style.paddingRight).to.equal((getScrollbarSize() + 20) + 'px');
    });

    it('should add container classes ', ()=>{
      let modal = new Modal({});

      expect(container.className).to.equal('');

      manager.add(modal, container, 'test test-other');

       expect(container.className).to.equal('test test-other');
    });

    it('should restore container overflow style', ()=> {
      let modal = new Modal({});

      container.style.overflow = 'scroll';

      expect(container.style.overflow).to.equal('scroll');

      manager.add(modal, container);
      manager.remove(modal);

      expect(container.style.overflow).to.equal('scroll');
    });

    it('should reset overflow style to the computed one', ()=> {
      let modal = new Modal({});

      expect(css(container, 'overflow')).to.equal('scroll');

      manager.add(modal, container);
      manager.remove(modal);

      expect(container.style.overflow).to.equal('');
      expect(css(container, 'overflow')).to.equal('scroll');
    });

    it('should only remove styles when there are no associated modals', ()=>{
      let modalA = new Modal({});
      let modalB = new Modal({});

      expect(container.style.overflow).to.equal('');

      manager.add(modalA, container);
      manager.add(modalB, container);

      manager.remove(modalB);

      expect(container.style.overflow).to.equal('hidden');

      manager.remove(modalA);

      expect(container.style.overflow).to.equal('');
      expect(container.style.paddingRight).to.equal('');
    });
  });

});
