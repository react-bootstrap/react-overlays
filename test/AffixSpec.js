import React from 'react'
import ReactDOM from 'react-dom'
import ReactTestUtils from 'react-dom/test-utils'

import Affix from '../src/Affix'

import { render, injectCss } from './helpers'

describe('<Affix>', () => {
  let mountPoint
  let handlers

  before(() => {
    injectCss(`
      html, body { margin: 0; padding: 0; }
    `)
  })

  after(() => {
    injectCss.reset()
  })
  // This makes the window very tall; hopefully enough to exhibit the affix
  // behavior. If this is insufficient, we should modify the Karma config to
  // fix the browser window size.
  class Container extends React.Component {
    render() {
      return (
        <div
          style={{
            height: 20000,
          }}
        >
          Placeholder
          {this.props.children}
        </div>
      )
    }
  }

  class Content extends React.Component {
    render() {
      ++Content.renderCount
      return <div {...this.props}>Content</div>
    }
  }

  beforeEach(() => {
    Content.renderCount = 0

    mountPoint = document.createElement('div')
    document.body.appendChild(mountPoint)
    handlers = {
      onAffix: sinon.spy(),
      onAffixed: sinon.spy(),
      onAffixTop: sinon.spy(),
      onAffixedTop: sinon.spy(),
      onAffixBottom: sinon.spy(),
      onAffixedBottom: sinon.spy(),
    }
  })

  afterEach(() => {
    Object.keys(handlers).forEach(key => handlers[key].resetHistory())
    ReactDOM.unmountComponentAtNode(mountPoint)
    document.body.removeChild(mountPoint)
    window.scrollTo(0, 0)
  })

  it('should render the affix content', () => {
    let instance = render(
      <Affix>
        <Content />
      </Affix>,
      mountPoint
    )

    const content = ReactTestUtils.findRenderedComponentWithType(
      instance,
      Content
    )

    expect(content).to.exist
  })

  describe('no viewportOffsetTop', () => {
    let node

    beforeEach(() => {
      const container = render(
        <Container>
          <Affix
            offsetTop={100}
            offsetBottom={10000}
            topClassName="affix-top"
            topStyle={{ color: 'red' }}
            affixClassName="affix"
            affixStyle={{ color: 'white' }}
            bottomClassName="affix-bottom"
            bottomStyle={{ color: 'blue' }}
            {...handlers}
          >
            <Content style={{ height: 100 }} />
          </Affix>
        </Container>,
        mountPoint
      )

      node = ReactDOM.findDOMNode(
        ReactTestUtils.findRenderedComponentWithType(container, Content)
      )
    })

    it('should render correctly at top', done => {
      window.scrollTo(0, 101)

      requestAnimationFrame(() => {
        window.scrollTo(0, 99)
        requestAnimationFrame(() => {
          expect(node.className).to.equal('affix-top')
          expect(node.style.position).to.not.be.ok
          expect(node.style.top).to.not.be.ok
          expect(node.style.color).to.equal('red')
          expect(handlers.onAffixTop).to.been.calledOnce
          expect(handlers.onAffixedTop).to.been.calledOnce
          done()
        })
      })
    })

    it('should affix correctly', done => {
      window.scrollTo(0, 101)
      requestAnimationFrame(() => {
        expect(node.className).to.equal('affix')
        expect(node.style.position).to.equal('fixed')
        expect(node.style.top).to.not.be.ok
        expect(node.style.color).to.equal('white')

        expect(handlers.onAffix).to.been.calledOnce
        expect(handlers.onAffixed).to.been.calledOnce
        done()
      })
    })

    it('should render correctly at bottom', done => {
      window.scrollTo(0, 20000)
      requestAnimationFrame(() => {
        expect(node.className).to.equal('affix-bottom')
        expect(node.style.position).to.equal('absolute')
        expect(node.style.top).to.equal('9900px')
        expect(node.style.color).to.equal('blue')

        expect(handlers.onAffixBottom).to.been.calledOnce
        expect(handlers.onAffixedBottom).to.been.calledOnce
        done()
      })
    })
  })

  describe('with viewportOffsetTop', () => {
    let node

    beforeEach(() => {
      const container = render(
        <Container>
          <Affix offsetTop={100} viewportOffsetTop={50} {...handlers}>
            <Content />
          </Affix>
        </Container>,
        mountPoint
      )

      node = ReactDOM.findDOMNode(
        ReactTestUtils.findRenderedComponentWithType(container, Content)
      )
    })

    it('should render correctly at top', done => {
      window.scrollTo(0, 49)

      requestAnimationFrame(() => {
        expect(node.style.position).to.not.be.ok
        expect(node.style.top).to.not.be.ok
        done()
      })
    })

    it('should affix correctly', done => {
      window.scrollTo(0, 51)
      requestAnimationFrame(() => {
        expect(node.style.position).to.equal('fixed')
        expect(node.style.top).to.equal('50px')
        done()
      })
    })
  })

  describe('re-rendering optimizations', () => {
    beforeEach(() => {
      render(
        <Container>
          <Affix offsetTop={100} offsetBottom={10000}>
            <Content />
          </Affix>
        </Container>,
        mountPoint
      )
    })

    it('should avoid re-rendering at top', done => {
      expect(Content.renderCount).to.equal(1)

      window.scrollTo(0, 50)
      requestAnimationFrame(() => {
        expect(Content.renderCount).to.equal(1)
        done()
      })
    })

    it('should avoid re-rendering when affixed', done => {
      expect(Content.renderCount).to.equal(1)

      window.scrollTo(0, 1000)
      requestAnimationFrame(() => {
        expect(Content.renderCount).to.equal(2)

        window.scrollTo(0, 2000)
        requestAnimationFrame(() => {
          expect(Content.renderCount).to.equal(2)
          done()
        })
      })
    })

    it('should avoid re-rendering at bottom', done => {
      expect(Content.renderCount).to.equal(1)

      window.scrollTo(0, 15000)
      requestAnimationFrame(() => {
        expect(Content.renderCount).to.equal(3)

        window.scrollTo(0, 16000)
        requestAnimationFrame(() => {
          expect(Content.renderCount).to.equal(3)
          done()
        })
      })
    })
  })
})
