import '@babel/polyfill'

import chai from 'chai'
import sinonChai from 'sinon-chai'

import Enzyme, { ShallowWrapper, ReactWrapper } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

function assertLength(length) {
  return function $assertLength(selector) {
    let result = this.find(selector)
    expect(result).to.have.length(length)
    return result
  }
}

function print() {
  return this.tap(f => console.log(f.debug()))
}

ReactWrapper.prototype.assertSingle = assertLength(1)
ShallowWrapper.prototype.assertSingle = assertLength(1)

ReactWrapper.prototype.assertNone = assertLength(0)
ShallowWrapper.prototype.assertNone = assertLength(0)

ReactWrapper.prototype.print = print
ShallowWrapper.prototype.print = print

chai.should()
chai.use(sinonChai)

global.expect = chai.expect
global.assert = chai.assert

beforeEach(() => {
  sinon.stub(console, 'error').callsFake(msg => {
    let expected = false

    console.error.expected.forEach(about => {
      if (msg.indexOf(about) !== -1) {
        console.error.warned[about] = true
        expected = true
      }
    })

    if (expected) {
      return
    }

    console.error.threw = true
    throw new Error(msg)
  })

  console.error.expected = []
  console.error.warned = Object.create(null)
  console.error.threw = false
})

afterEach(() => {
  if (!console.error.threw && console.error.expected.length) {
    expect(console.error.warned).to.have.keys(console.error.expected)
  }

  console.error.restore()
})

describe('Process environment for tests', function() {
  it('Should be development for React console warnings', function() {
    assert.notEqual(process.env.NODE_ENV, 'production')
  })
})

// Ensure all files in src folder are loaded for proper code coverage analysis
const srcContext = require.context('../src', true, /.*\.js$/)
srcContext.keys().forEach(srcContext)

const testsContext = require.context('.', true, /Spec$/)
testsContext.keys().forEach(testsContext)
