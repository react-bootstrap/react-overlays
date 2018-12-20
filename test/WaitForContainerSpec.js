import React from 'react'
import { mount } from 'enzyme'

import WaitForContainer from '../src/WaitForContainer'

describe('WaitForContainer', function() {
  it('should resolve on first render if possible (element)', () => {
    const container = document.createElement('div')
    const renderSpy = sinon.spy(WaitForContainer.prototype, 'render')

    mount(
      <WaitForContainer container={container}>
        {resolved => {
          expect(resolved).to.equal(container)
          return null
        }}
      </WaitForContainer>
    )

    renderSpy.should.have.been.calledOnce
    renderSpy.restore()
  })

  it('should resolve on first render if possible (function)', () => {
    const div = document.createElement('div')
    const container = () => div
    const renderSpy = sinon.spy(WaitForContainer.prototype, 'render')

    mount(
      <WaitForContainer container={container}>
        {resolved => {
          expect(resolved).to.equal(div)
          return null
        }}
      </WaitForContainer>
    )

    renderSpy.should.have.been.calledOnce

    renderSpy.restore()
  })

  it('should not throw if an unmounted component instance is provided', () => {
    const renderSpy = sinon.spy(WaitForContainer.prototype, 'render')
    class Wrapper extends React.Component {
      div = React.createRef()
      render() {
        return (
          <div ref={this.div}>
            <WaitForContainer container={this}>
              {resolved => {
                expect(resolved).to.equal(this.div.current)
                return null
              }}
            </WaitForContainer>
          </div>
        )
      }
    }

    mount(<Wrapper />)

    renderSpy.should.have.been.calledTwice
  })
})
