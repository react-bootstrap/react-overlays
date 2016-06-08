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

  it('should close when clicked outside', () => {
    let spy = sinon.spy();
    render(
      <RootCloseWrapper onRootClose={spy}>
        <div id='my-div'>hello there</div>
      </RootCloseWrapper>
    , mountPoint);

    simulant.fire(document.getElementById('my-div'), 'mousedown');

    expect(spy).to.not.have.been.called;

    simulant.fire(document.body, 'mousedown');

    expect(spy).to.have.been.calledOnce;
  });

  it('should not close when right-clicked outside', () => {
    let spy = sinon.spy();
    render(
      <RootCloseWrapper onRootClose={spy}>
        <div id='my-div'>hello there</div>
      </RootCloseWrapper>
    , mountPoint);

    simulant.fire(document.getElementById('my-div'), 'mousedown', {button: 1});

    expect(spy).to.not.have.been.called;

    simulant.fire(document.body, 'mousedown', {button: 1});

    expect(spy).to.not.have.been.called;
  });

  it('should not close when disabled', () => {
    let spy = sinon.spy();
    render(
      <RootCloseWrapper onRootClose={spy} disabled>
        <div id='my-div'>hello there</div>
      </RootCloseWrapper>
    , mountPoint);

    simulant.fire(document.getElementById('my-div'), 'mousedown');

    expect(spy).to.not.have.been.called;

    simulant.fire(document.body, 'mousedown');

    expect(spy).to.not.have.been.called;
  });

  it('should close when inside another RootCloseWrapper', () => {
    let outerSpy = sinon.spy();
    let innerSpy = sinon.spy();

    render(
      <RootCloseWrapper onRootClose={outerSpy}>
        <div>
          <div id='my-div'>hello there</div>
          <RootCloseWrapper onRootClose={innerSpy}>
            <div id='my-other-div'>hello there</div>
          </RootCloseWrapper>
        </div>
      </RootCloseWrapper>
    , mountPoint);

    simulant.fire(document.getElementById('my-div'), 'mousedown');

    expect(outerSpy).to.have.not.been.called;
    expect(innerSpy).to.have.been.calledOnce;
  });

});
