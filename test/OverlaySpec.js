import React from 'react'
import { mount } from 'enzyme'

import Overlay from '../src/Overlay'

function renderTooltip({ ref, style }) {
  return (
    <div ref={ref} style={style}>
      hello there
    </div>
  )
}

describe('Overlay', () => {
  let mountPoint
  let trigger

  beforeEach(() => {
    mountPoint = document.createElement('div')
    trigger = document.createElement('div')

    document.body.appendChild(mountPoint)
    document.body.appendChild(trigger)
  })

  afterEach(() => {
    document.body.removeChild(mountPoint)
    document.body.removeChild(trigger)
  })

  describe('is wrapped with RootCloseWrapper if rootClose prop passed', () => {
    const props = {
      rootClose: true,
      show: true,
      target: trigger,
      onHide: () => {},
    }

    let instance

    beforeEach(() => {
      instance = mount(<Overlay {...props}>{renderTooltip}</Overlay>, {
        attachTo: mountPoint,
      })
    })
    afterEach(() => {
      instance.unmount()
    })

    it('renders RootCloseWrapper', () => {
      const wrapper = instance.find('RootCloseWrapper')

      expect(wrapper).to.have.length(1)
      expect(wrapper.props().onRootClose).to.equal(props.onHide)
    })

    it('passes down the rootCloseEvent', () => {
      instance.setProps({ rootCloseEvent: 'mousedown' })

      const wrapper = instance.find('RootCloseWrapper')

      expect(wrapper.props().event).to.equal('mousedown')
    })
    
    it('passes down the rootCloseDisabled', () => {
      instance.setProps({ rootCloseDisabled: true });

      const wrapper = instance.find('RootCloseWrapper');

      expect(wrapper.props().disabled).to.equal(true);
    });
  });
});
