/* eslint-disable no-use-before-define */
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import simulant from 'simulant';
import { mount } from 'enzyme';

import useRootClose from '../src/useRootClose';

const escapeKeyCode = 27;

describe('RootCloseWrapper', () => {
  let attachTo;

  beforeEach(() => {
    attachTo = document.createElement('div');
    document.body.appendChild(attachTo);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(attachTo);
    document.body.removeChild(attachTo);
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

      simulant.fire(document.getElementById('my-div'), eventName);

      expect(spy).to.not.have.been.called;

      simulant.fire(document.body, eventName);

      expect(spy).to.have.been.calledOnce;

      expect(spy.getCall(0).args[0].type).to.be.oneOf(['click', 'mousedown']);
    });

    it('should not close when right-clicked outside', () => {
      let spy = sinon.spy();
      mount(<Wrapper onRootClose={spy} />, { attachTo });

      simulant.fire(document.getElementById('my-div'), eventName, {
        button: 1,
      });

      expect(spy).to.not.have.been.called;

      simulant.fire(document.body, eventName, { button: 1 });

      expect(spy).to.not.have.been.called;
    });

    it('should not close when disabled', () => {
      let spy = sinon.spy();
      mount(<Wrapper onRootClose={spy} disabled />, { attachTo });

      simulant.fire(document.getElementById('my-div'), eventName);

      expect(spy).to.not.have.been.called;

      simulant.fire(document.body, eventName);

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

      simulant.fire(document.getElementById('my-div'), eventName);

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

      simulant.fire(document.body, 'keyup', { keyCode: escapeKeyCode });

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

      simulant.fire(document.body, 'keyup', { keyCode: escapeKeyCode });

      // TODO: Update to match expectations.
      // expect(outerSpy).to.have.not.been.called;
      expect(innerSpy).to.have.been.calledOnce;

      expect(innerSpy.getCall(0).args.length).to.be.equal(1);
      expect(innerSpy.getCall(0).args[0].keyCode).to.be.equal(escapeKeyCode);
      expect(innerSpy.getCall(0).args[0].type).to.be.equal('keyup');
    });
  });
});
