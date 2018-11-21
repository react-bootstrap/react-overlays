import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import Overlay from '../src/Overlay';
import RootCloseWrapper from '../src/RootCloseWrapper';

import { render } from './helpers';

function Tooltip(props) {
  return <div>{props.children}</div>;
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
    ReactDOM.unmountComponentAtNode(mountPoint);
    document.body.removeChild(mountPoint);
    document.body.removeChild(trigger);
  });

  describe('is wrapped with RootCloseWrapper if rootClose prop passed', () => {
    const props = {
      rootClose: true,
      show: true,
      target: trigger,
      onHide: () => {}
    };

    let instance;

    beforeEach(() => {
      instance = render(
        <Overlay { ...props }>
          <Tooltip>hello there</Tooltip>
        </Overlay>
      , mountPoint);
    });

    it('renders RootCloseWrapper', () => {
      const wrapper = ReactTestUtils.findRenderedComponentWithType(
        instance, RootCloseWrapper
      );

      expect(wrapper).to.exist;
      expect(wrapper.props.onRootClose).to.equal(props.onHide);
    });

    it('passes down the rootCloseEvent', () => {
      instance = instance.renderWithProps({ ...props, rootCloseEvent: 'mousedown' });

      const wrapper = ReactTestUtils.findRenderedComponentWithType(
        instance, RootCloseWrapper
      );

      expect(wrapper.props.event).to.equal('mousedown');
    });
    
    it('passes down the rootCloseDisabled', () => {
      instance = instance.renderWithProps({ ...props, rootCloseDisabled: true });

      const wrapper = ReactTestUtils.findRenderedComponentWithType(
        instance, RootCloseWrapper
      );

      expect(wrapper.props.disabled).to.equal(true);
    });
  });
});
