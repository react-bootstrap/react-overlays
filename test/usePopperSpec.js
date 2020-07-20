import { mount } from 'enzyme';
import React from 'react';
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

  it('should return state', (done) => {
    const result = renderHook(() =>
      usePopper(elements.reference, elements.popper, {
        eventsEnabled: true,
      }),
    );

    setTimeout(() => {
      expect(result.current.update).to.be.a('function');
      expect(result.current.forceUpdate).to.be.a('function');
      expect(result.current.styles).to.have.any.key('popper');
      expect(result.current.attributes).to.have.any.key('popper');
      done();
    });
  });

  it('should add aria-describedBy for tooltips', (done) => {
    elements.popper.setAttribute('role', 'tooltip');
    elements.popper.setAttribute('id', 'example123');

    renderHook(() => usePopper(elements.reference, elements.popper));

    setTimeout(() => {
      expect(
        document.querySelector('[aria-describedby="example123"]'),
      ).to.equal(elements.reference);

      done();
    });
  });

  it('should not aria-describedBy any other role', (done) => {
    renderHook(() => usePopper(elements.reference, elements.popper));

    setTimeout(() => {
      expect(
        document.querySelector('[aria-describedby="example123"]'),
      ).to.equal(null);

      done();
    });
  });
});
