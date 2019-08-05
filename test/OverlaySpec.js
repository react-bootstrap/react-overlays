import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import Overlay from '../src/Overlay';

function renderTooltip({ props }) {
  const { ref, style } = props;
  return (
    <div ref={ref} style={style}>
      hello there
    </div>
  );
}

describe('Overlay', () => {
  let mountPoint;
  let trigger;

  beforeEach(() => {
    mountPoint = document.createElement('div');
    trigger = document.createElement('div');

    document.body.appendChild(mountPoint);
    document.body.appendChild(trigger);
  });

  afterEach(() => {
    document.body.removeChild(mountPoint);
    document.body.removeChild(trigger);
  });
  // these don't test a lot over rootCloseWrapper
  describe('is wrapped with RootCloseWrapper if rootClose prop passed', () => {
    const props = {
      rootClose: true,
      show: true,
      target: trigger,
    };

    let instance;

    beforeEach(() => {
      props.onHide = sinon.spy();

      instance = mount(<Overlay {...props}>{renderTooltip}</Overlay>, {
        attachTo: mountPoint,
      });
    });
    afterEach(() => {
      instance.unmount();
    });

    it('renders RootCloseWrapper', () => {
      act(() => {
        mountPoint.click();
      });

      expect(props.onHide).to.have.been.calledOnce();
    });

    it('passes down the rootCloseEvent', done => {
      instance.setProps({ rootCloseEvent: 'mousedown' });

      act(() => {
        mountPoint.click();
      });
      setTimeout(() => {
        expect(props.onHide).to.have.been.calledOnce();
        done();
      }, 0);
    });

    it('passes down the rootCloseDisabled', () => {
      instance.setProps({ rootCloseDisabled: true });

      const wrapper = instance.find('RootCloseWrapper');

      expect(wrapper.props().disabled).to.equal(true);
    });
  });
});
