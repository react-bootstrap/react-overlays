/* eslint-disable no-use-before-define */
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import simulant from 'simulant';
import { mount } from 'enzyme';

import useRootClose from '../src/useRootClose';

const escapeKeyCode = 27;
const configs = [
  {
    description: '',
    useShadowRoot: false
  },
  {
    description: 'with shadow root',
    useShadowRoot: true
  },
]
// Wrap simulant's created event to add composed: true, which is the default
// for most events.
const fire = (node, event, params) => {
  const simulatedEvent = simulant(event, params);
  const fixedEvent = new simulatedEvent.constructor(
    simulatedEvent.type,
    {
      bubbles: simulatedEvent.bubbles,
      button: simulatedEvent.button,
      cancelable: simulatedEvent.cancelable,
      composed: true,
    },
  );
  fixedEvent.keyCode = simulatedEvent.keyCode;
  node.dispatchEvent(fixedEvent);
  return fixedEvent;
}

// eslint-disable-next-line mocha/no-setup-in-describe
configs.map((config) => describe(`useRootClose ${config.description}`, () => {
  let attachTo, renderRoot, myDiv;

  beforeEach(() => {
    renderRoot = document.createElement('div');
    if (config.useShadowRoot) {
      renderRoot.attachShadow({ mode: 'open' })
    }
    document.body.appendChild(renderRoot);
    attachTo = config.useShadowRoot ? renderRoot.shadowRoot : renderRoot;
    myDiv = () => attachTo.querySelector('#my-div');
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(renderRoot);
    document.body.removeChild(renderRoot);
  });

  describe('using default event', () => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    shouldCloseOn(undefined, 'click');
  });

  describe('using click event', () => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    shouldCloseOn('click', 'click');
  });

  describe('using mousedown event', () => {
    // eslint-disable-next-line mocha/no-setup-in-describe
    shouldCloseOn('mousedown', 'mousedown');
  });

  function shouldCloseOn(clickTrigger, eventName) {
    function Wrapper({ onRootClose, disabled }) {
      const ref = useRef();
      useRootClose(ref, onRootClose, {
        disabled,
        clickTrigger,
      });

      return (
        <div ref={ref} id="my-div">
          hello there
        </div>
      );
    }

    it('should close when clicked outside', () => {
      let spy = sinon.spy();

      mount(<Wrapper onRootClose={spy} />, { attachTo });

      fire(myDiv(), eventName);

      expect(spy).to.not.have.been.called;

      fire(document.body, eventName);

      expect(spy).to.have.been.calledOnce;

      expect(spy.getCall(0).args[0].type).to.be.oneOf(['click', 'mousedown']);
    });

    it('should not close when right-clicked outside', () => {
      let spy = sinon.spy();
      mount(<Wrapper onRootClose={spy} />, { attachTo });

      fire(myDiv(), eventName, { button: 1, });

      expect(spy).to.not.have.been.called;

      fire(document.body, eventName, { button: 1 });

      expect(spy).to.not.have.been.called;
    });

    it('should not close when disabled', () => {
      let spy = sinon.spy();
      mount(<Wrapper onRootClose={spy} disabled />, { attachTo });

      fire(myDiv(), eventName);

      expect(spy).to.not.have.been.called;

      fire(document.body, eventName);

      expect(spy).to.not.have.been.called;
    });

    it('should close when inside another RootCloseWrapper', () => {
      let outerSpy = sinon.spy();
      let innerSpy = sinon.spy();

      function Inner() {
        const ref = useRef();
        useRootClose(ref, innerSpy, { clickTrigger });

        return (
          <div ref={ref} id="my-other-div">
            hello there
          </div>
        );
      }

      function Outer() {
        const ref = useRef();
        useRootClose(ref, outerSpy, { clickTrigger });

        return (
          <div ref={ref}>
            <div id="my-div">hello there</div>
            <Inner />
          </div>
        );
      }

      mount(<Outer />, { attachTo });

      fire(myDiv(), eventName);

      expect(outerSpy).to.have.not.been.called;
      expect(innerSpy).to.have.been.calledOnce;

      expect(innerSpy.getCall(0).args[0].type).to.be.oneOf([
        'click',
        'mousedown',
      ]);
    });
  }

  describe('using keyup event', () => {
    function Wrapper({ children, onRootClose, event: clickTrigger }) {
      const ref = useRef();
      useRootClose(ref, onRootClose, { clickTrigger });

      return (
        <div ref={ref} id="my-div">
          {children}
        </div>
      );
    }

    it('should close when escape keyup', () => {
      let spy = sinon.spy();
      mount(
        <Wrapper onRootClose={spy}>
          <div id="my-div">hello there</div>
        </Wrapper>,
      );

      expect(spy).to.not.have.been.called;

      fire(document.body, 'keyup', { keyCode: escapeKeyCode });

      expect(spy).to.have.been.calledOnce;

      expect(spy.getCall(0).args.length).to.be.equal(1);
      expect(spy.getCall(0).args[0].keyCode).to.be.equal(escapeKeyCode);
      expect(spy.getCall(0).args[0].type).to.be.equal('keyup');
    });

    it('should close when inside another RootCloseWrapper', () => {
      let outerSpy = sinon.spy();
      let innerSpy = sinon.spy();

      mount(
        <Wrapper onRootClose={outerSpy}>
          <div>
            <div id="my-div">hello there</div>
            <Wrapper onRootClose={innerSpy}>
              <div id="my-other-div">hello there</div>
            </Wrapper>
          </div>
        </Wrapper>,
      );

      fire(document.body, 'keyup', { keyCode: escapeKeyCode });

      // TODO: Update to match expectations.
      // expect(outerSpy).to.have.not.been.called;
      expect(innerSpy).to.have.been.calledOnce;

      expect(innerSpy.getCall(0).args.length).to.be.equal(1);
      expect(innerSpy.getCall(0).args[0].keyCode).to.be.equal(escapeKeyCode);
      expect(innerSpy.getCall(0).args[0].type).to.be.equal('keyup');
    });
  });
}));
