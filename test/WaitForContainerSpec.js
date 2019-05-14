/* eslint-disable no-shadow */
import React, { useRef } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import useWaitForDOMRef from '../src/utils/useWaitForDOMRef';

describe('useWaitForDOMRef', () => {
  it('should resolve on first render if possible (element)', () => {
    let renderCount = 0;
    const container = document.createElement('div');

    function Test({ container, onResolved }) {
      useWaitForDOMRef(container, onResolved);
      renderCount++;
      return null;
    }

    const onResolved = sinon.spy(resolved => {
      expect(resolved).to.equal(container);
    });

    act(() => {
      mount(<Test container={container} onResolved={onResolved} />);
    });

    renderCount.should.equal(1);
    onResolved.should.have.been.calledOnce;
  });

  it('should resolve on first render if possible (ref)', () => {
    let renderCount = 0;
    const container = React.createRef();
    container.current = document.createElement('div');

    function Test({ container, onResolved }) {
      useWaitForDOMRef(container, onResolved);
      renderCount++;
      return null;
    }

    const onResolved = sinon.spy(resolved => {
      expect(resolved).to.equal(container.current);
    });

    act(() => {
      mount(<Test container={container} onResolved={onResolved} />);
    });

    renderCount.should.equal(1);
    onResolved.should.have.been.calledOnce;
  });

  it('should resolve on first render if possible (function)', () => {
    const div = document.createElement('div');
    const container = () => div;
    let renderCount = 0;

    function Test({ container, onResolved }) {
      useWaitForDOMRef(container, onResolved);
      renderCount++;
      return null;
    }

    const onResolved = sinon.spy(resolved => {
      expect(resolved).to.equal(div);
    });

    act(() => {
      mount(<Test container={container} onResolved={onResolved} />);
    });
    renderCount.should.equal(1);
    onResolved.should.have.been.calledOnce;
  });

  it('should resolve after if required', () => {
    let renderCount = 0;

    function Test({ container, onResolved }) {
      useWaitForDOMRef(container, onResolved);
      renderCount++;
      return null;
    }

    const onResolved = sinon.spy(resolved => {
      expect(resolved.tagName).to.equal('DIV');
    });

    function Wrapper() {
      const container = useRef(null);

      return (
        <>
          <Test container={container} onResolved={onResolved} />
          <div ref={container} />
        </>
      );
    }
    act(() => {
      mount(<Wrapper onResolved={onResolved} />).update();
    });
    renderCount.should.equal(2);
    onResolved.should.have.been.calledOnce;
  });
});
