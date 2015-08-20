import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import ReactDOM from 'react-dom';

import Transition from '../src/Transition';
import OverlayTrigger from '../src/OverlayTrigger';

describe('OverlayTrigger', function() {
  it('Should create OverlayTrigger element', function() {
    const instance = ReactTestUtils.renderIntoDocument(
      <OverlayTrigger overlay={<div>test</div>}>
        <button>button</button>
      </OverlayTrigger>
    );
    const overlayTrigger = ReactDOM.findDOMNode(instance);
    assert.equal(overlayTrigger.nodeName, 'BUTTON');
  });

  it('Should pass OverlayTrigger onClick prop to child', function() {
    const callback = sinon.spy();
    const instance = ReactTestUtils.renderIntoDocument(
      <OverlayTrigger overlay={<div>test</div>} onClick={callback}>
        <button>button</button>
      </OverlayTrigger>
    );
    const overlayTrigger = ReactDOM.findDOMNode(instance);
    ReactTestUtils.Simulate.click(overlayTrigger);
    callback.called.should.be.true;
  });

  it('Should show after click trigger', function() {
    const instance = ReactTestUtils.renderIntoDocument(
      <OverlayTrigger trigger='click' overlay={<div>test</div>}>
        <button>button</button>
      </OverlayTrigger>
    );
    const overlayTrigger = ReactDOM.findDOMNode(instance);
    ReactTestUtils.Simulate.click(overlayTrigger);

    instance.state.isOverlayShown.should.be.true;
  });

  it('Should maintain overlay classname', function() {
    const instance = ReactTestUtils.renderIntoDocument(
      <OverlayTrigger trigger='click' overlay={<div className='test-overlay'>test</div>}>
        <button>button</button>
      </OverlayTrigger>
    );

    const overlayTrigger = ReactDOM.findDOMNode(instance);
    ReactTestUtils.Simulate.click(overlayTrigger);

    expect(document.getElementsByClassName('test-overlay').length).to.equal(1);
  });

  it('Should pass transition callbacks to Transition', function (done) {
    this.timeout(5000);

    let count = 0;
    let increment = ()=> count++;

    let overlayTrigger;

    let instance = ReactTestUtils.renderIntoDocument(
      <OverlayTrigger
        transition={Transition}
        trigger='click'
        overlay={<div>test</div>}
        onHide={()=>{}}
        onExit={increment}
        onExiting={increment}
        onExited={()=> {
          increment();
          expect(count).to.equal(6);
          done();
        }}
        onEnter={increment}
        onEntering={increment}
        onEntered={()=> {
          increment();
          ReactTestUtils.Simulate.click(overlayTrigger);
        }}
      >
        <button>button</button>
      </OverlayTrigger>
    );

    overlayTrigger = ReactDOM.findDOMNode(instance);

    ReactTestUtils.Simulate.click(overlayTrigger);
  });


  it('Should forward requested context', function() {
    const contextTypes = {
      key: React.PropTypes.string
    };

    const contextSpy = sinon.spy();
    class ContextReader extends React.Component {
      render() {
        contextSpy(this.context.key);
        return <div />;
      }
    }
    ContextReader.contextTypes = contextTypes;

    class ContextHolder extends React.Component {
      getChildContext() {
        return {key: 'value'};
      }

      render() {
        return (
          <OverlayTrigger
            trigger="click"
            overlay={<ContextReader />}
          >
            <button>button</button>
          </OverlayTrigger>
        );
      }
    }
    ContextHolder.childContextTypes = contextTypes;

    const instance = ReactTestUtils.renderIntoDocument(<ContextHolder />);
    const overlayTrigger = ReactDOM.findDOMNode(instance);
    ReactTestUtils.Simulate.click(overlayTrigger);

    contextSpy.calledWith('value').should.be.true;
  });

  describe('rootClose', function() {
    [
      {
        label: 'true',
        rootClose: true,
        shownAfterClick: false
      },
      {
        label: 'default (false)',
        rootClose: null,
        shownAfterClick: true
      }
    ].forEach(function(testCase) {
      describe(testCase.label, function() {
        let instance;

        beforeEach(function () {
          instance = ReactTestUtils.renderIntoDocument(
            <OverlayTrigger
              overlay={<div>test</div>}
              trigger='click' rootClose={testCase.rootClose}
            >
            <button>button</button>
            </OverlayTrigger>
          );
          const overlayTrigger = ReactDOM.findDOMNode(instance);
          ReactTestUtils.Simulate.click(overlayTrigger);
        });

        it('Should have correct isOverlayShown state', function () {
          document.documentElement.click();

          // Need to click this way for it to propagate to document element.
          instance.state.isOverlayShown.should.equal(testCase.shownAfterClick);
        });
      });
    });

    describe('replaced overlay', function () {
      let instance;

      beforeEach(function () {
        class ReplacedOverlay extends React.Component {
          constructor(props) {
            super(props);

            this.handleClick = this.handleClick.bind(this);
            this.state = {replaced: false};
          }

          handleClick() {
            this.setState({replaced: true});
          }

          render() {
            if (this.state.replaced) {
              return (
                <div>replaced</div>
              );
            } else {
              return (
                <div>
                  <a id="replace-overlay" onClick={this.handleClick}>
                    original
                  </a>
                </div>
              );
            }
          }
        }

        instance = ReactTestUtils.renderIntoDocument(
          <OverlayTrigger
            overlay={<ReplacedOverlay />}
            trigger='click' rootClose
          >
            <button>button</button>
          </OverlayTrigger>
        );
        const overlayTrigger = ReactDOM.findDOMNode(instance);
        ReactTestUtils.Simulate.click(overlayTrigger);
      });

      it('Should still be shown', function () {
        // Need to click this way for it to propagate to document element.
        const replaceOverlay = document.getElementById('replace-overlay');
        replaceOverlay.click();

        instance.state.isOverlayShown.should.be.true;
      });
    });
  });
});
