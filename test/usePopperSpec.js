import { mount } from 'enzyme';
import * as React from 'react';
import usePopper from '../src/usePopper';

describe('usePopper', () => {
  function renderHook(fn) {
    let result = { current: null };

    function Wrapper() {
      result.current = fn();
      return null;
    }

    result.mount = mount(<Wrapper />);

    return result;
  }

  const elements = {};
  beforeEach(() => {
    elements.mount = document.createElement('div');
    elements.reference = document.createElement('div');
    elements.popper = document.createElement('div');

    elements.mount.appendChild(elements.reference);
    elements.mount.appendChild(elements.popper);
    document.body.appendChild(elements.mount);
  });

  afterEach(() => {
    elements.mount.parentNode.removeChild(elements.mount);
  });

  it('allows enabledEvents shortcut', done => {
    const result = renderHook(() =>
      usePopper(elements.reference, elements.popper, {
        eventsEnabled: true,
      }),
    );

    setTimeout(() => {
      expect(result.current.state.modifiersData.eventListeners).to.be.ok;
      done();
    });
  });

  it('accepts a modifiers object', done => {
    const spy = sinon.spy();
    renderHook(() =>
      usePopper(elements.reference, elements.popper, {
        modifiers: {
          test: {
            enabled: true,
            phase: 'write',
            fn: spy,
          },
        },
      }),
    );

    setTimeout(() => {
      expect(spy).to.have.been.calledOnce;
      done();
    });
  });
});
