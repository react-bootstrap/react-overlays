import React from 'react';
import ReactDOM from 'react-dom';
import RootCloseWrapper from '../src/RootCloseWrapper';
import { render } from './helpers';
import simulant from 'simulant';

describe('RootCloseWrapper', function () {
  let mountPoint;

  beforeEach(()=>{
    mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(mountPoint);
    document.body.removeChild(mountPoint);
  });

  describe('using default event', () => {
    shouldCloseOn(undefined, 'click');
  });

  describe('using click event', () => {
    shouldCloseOn('click', 'click');
  });

  describe('using mousedown event', () => {
    shouldCloseOn('mousedown', 'mousedown');
  });

  function shouldCloseOn(eventProp, eventName) {
    it('should close when clicked outside', () => {
      let spy = sinon.spy();
      render(
        <RootCloseWrapper onRootClose={spy} event={eventProp}>
          <div id='my-div'>hello there</div>
        </RootCloseWrapper>
      , mountPoint);

      simulant.fire(document.getElementById('my-div'), eventName);

      expect(spy).to.not.have.been.called;

      simulant.fire(document.body, eventName);

      expect(spy).to.have.been.calledOnce;
      expect(spy.getCall(0).args.length).to.be.eql(1);
      expect(spy.getCall(0).args[0]).to.not.be.undefined;
      expect(spy.getCall(0).args[0]).to.not.be.null;
    });

    it('should not close when right-clicked outside', () => {
      let spy = sinon.spy();
      render(
        <RootCloseWrapper onRootClose={spy} event={eventProp}>
          <div id='my-div'>hello there</div>
        </RootCloseWrapper>
      , mountPoint);

      simulant.fire(document.getElementById('my-div'), eventName, {button: 1});

      expect(spy).to.not.have.been.called;

      simulant.fire(document.body, eventName, {button: 1});

      expect(spy).to.not.have.been.called;
    });

    it('should not close when disabled', () => {
      let spy = sinon.spy();
      render(
        <RootCloseWrapper onRootClose={spy} event={eventProp} disabled>
          <div id='my-div'>hello there</div>
        </RootCloseWrapper>
      , mountPoint);

      simulant.fire(document.getElementById('my-div'), eventName);

      expect(spy).to.not.have.been.called;

      simulant.fire(document.body, eventName);

      expect(spy).to.not.have.been.called;
    });

    it('should close when inside another RootCloseWrapper', () => {
      let outerSpy = sinon.spy();
      let innerSpy = sinon.spy();

      render(
        <RootCloseWrapper onRootClose={outerSpy} event={eventProp}>
          <div>
            <div id='my-div'>hello there</div>
            <RootCloseWrapper onRootClose={innerSpy} event={eventProp}>
              <div id='my-other-div'>hello there</div>
            </RootCloseWrapper>
          </div>
        </RootCloseWrapper>
      , mountPoint);

      simulant.fire(document.getElementById('my-div'), eventName);

      expect(outerSpy).to.have.not.been.called;
      expect(innerSpy).to.have.been.calledOnce;
    });
  }
});
