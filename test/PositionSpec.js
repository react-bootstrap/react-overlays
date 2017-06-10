import Popper from 'popper.js';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import ReactTestUtils from 'react-dom/test-utils';

import Position from '../src/Position';

import { render, shouldWarn } from './helpers';

// Swallow extra props.
function Span() {
  return <span />;
}

function wait() {
  return new Promise((resolve) => { setTimeout(resolve, 10); });
}

describe('<Position>', () => {
  it('should output a child', () => {
    let instance = ReactTestUtils.renderIntoDocument(
      <Position>
        <Span />
      </Position>
    );

    expect(ReactDOM.findDOMNode(instance).nodeName).to.equal('SPAN');
  });

  it('should fail on multiple children', () => {
    shouldWarn('expected a single ReactElement');

    expect(() => {
      ReactDOMServer.renderToString(
        <Position>
          <Span />
          <Span />
        </Position>
      );
    }).to.throw(
      /React.Children.only expected to receive a single React element child./
    );
  });

  describe('position calculation', () => {
    let mountPoint;

    beforeEach(() => {
      mountPoint = document.createElement('div');
      document.body.appendChild(mountPoint);
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(mountPoint);
      document.body.removeChild(mountPoint);
    });

    function checkPosition(placement, targetPosition, expected) {
      class FakeOverlay extends React.Component {
        render() {
          return (
            <div
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
              }}
            />
          );
        }
      }

      class FakeContainer extends React.Component {
        render() {
          return (
            <div
              style={{
                position: 'relative',
                width: 600,
                height: 600,
              }}
            >
              <div
                ref={(c) => { this.target = c; }}
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  ...targetPosition,
                }}
              />

              <Position
                target={() => this.target}
                placement={placement}
                container={this}
                containerPadding={50}
              >
                <FakeOverlay ref={(c) => { this.overlay1 = c; }} />
              </Position>

              <Position
                target={() => this.target}
                placement={placement}
                container={() => this}
                containerPadding={50}
              >
                <FakeOverlay ref={(c) => { this.overlay2 = c; }} />
              </Position>
            </div>
          );
        }
      }

      it('should calculate the correct position', async () => {
        const instance = render(<FakeContainer />, mountPoint);
        await wait();

        [instance.overlay1, instance.overlay2].forEach(({ props }) => {
          expect(props.position).to.eql(expected.position);
          expect(props.arrowPosition).to.eql(expected.arrowPosition);
        });
      });
    }

    [
      {
        placement: 'top',
        noOffset: {
          position: { left: 200, top: 50 },
          arrowPosition: { left: 100 },
        },
        offsetBefore: {
          position: { left: 0, top: 50 },
          arrowPosition: { left: 0 },
        },
        offsetAfter: {
          position: { left: 400, top: 350 },
          arrowPosition: { left: 200 },
        },
      },
      {
        placement: 'right',
        noOffset: {
          position: { left: 350, top: 200 },
          arrowPosition: { top: 100 },
        },
        offsetBefore: {
          position: { left: 50, top: 0 },
          arrowPosition: { top: 0 },
        },
        offsetAfter: {
          position: { left: 350, top: 400 },
          arrowPosition: { top: 200 },
        },
      },
      {
        placement: 'bottom',
        noOffset: {
          position: { left: 200, top: 350 },
          arrowPosition: { left: 100 },
        },
        offsetBefore: {
          position: { left: 0, top: 50 },
          arrowPosition: { left: 0 },
        },
        offsetAfter: {
          position: { left: 400, top: 350 },
          arrowPosition: { left: 200 },
        },
      },
      {
        placement: 'left',
        noOffset: {
          position: { left: 50, top: 200 },
          arrowPosition: { top: 100 },
        },
        offsetBefore: {
          position: { left: 50, top: 0 },
          arrowPosition: { top: 0 },
        },
        offsetAfter: {
          position: { left: 350, top: 400 },
          arrowPosition: { top: 200 },
        },
      },
    ].forEach((testCase) => {
      const { placement } = testCase;

      describe(`placement = ${placement}`, () => {
        describe('no viewport offset', () => {
          checkPosition(
            placement,
            { left: 250, top: 250 },
            testCase.noOffset,
          );
        });

        describe('viewport offset before', () => {
          checkPosition(
            placement,
            { left: -100, top: -100 },
            testCase.offsetBefore,
          );
        });

        describe('viewport offset after', () => {
          checkPosition(
            placement,
            { left: 600, top: 600 },
            testCase.offsetAfter,
          );
        });
      });
    });
  });

  describe('position updating', () => {
    beforeEach(function () {
      sinon.spy(Position.prototype, 'componentWillReceiveProps');
      sinon.spy(Popper.prototype, 'update');
    });

    afterEach(function () {
      Position.prototype.componentWillReceiveProps.restore();
      Popper.prototype.update.restore();
    });

    it('should update position only when target changes', async () => {
      class TargetChanger extends React.Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            target: 'foo',
            fakeProp: 0,
          };
        }

        render() {
          return (
            <div>
              <div ref={(c) => { this.foo = c; }} />
              <div ref={(c) => { this.bar = c; }} />

              <Position target={() => this[this.state.target]}>
                <Span fakeProp={this.state.fakeProp} />
              </Position>
            </div>
          );
        }
      }

      const instance = ReactTestUtils.renderIntoDocument(<TargetChanger />);

      // Position calculates initial position.
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.not.been.called;
      await wait();
      expect(Popper.prototype.update)
        .to.have.been.calledOnce;

      instance.setState({target: 'bar'});

      // Position receives new props and recalculates position.
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.been.calledOnce;
      await wait();
      expect(Popper.prototype.update)
        .to.have.been.calledTwice;

      instance.setState({fakeProp: 1});

      // Position receives new props but should not recalculate position.
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.been.calledTwice;
      await wait();
      expect(Popper.prototype.update)
        .to.have.been.calledTwice;
    });

    it('should update position if shouldUpdatePosition is set', async () => {
      class Target extends React.Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            fakeProp: 0,
          };
        }

        render() {
          return (
            <div>
              <div ref={(c) => { this.target = c; }} />

              <Position
                target={() => this.target}
                shouldUpdatePosition
              >
                <Span fakeProp={this.state.fakeProp} />
              </Position>
            </div>
          );
        }
      }

      const instance = ReactTestUtils.renderIntoDocument(<Target />);

      // Position calculates initial position.
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.not.been.called;
      await wait();
      expect(Popper.prototype.update)
        .to.have.been.calledOnce;

      instance.setState({fakeProp: 1});

      // Position receives new props and position should be recalculated
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.been.calledOnce;
      await wait();
      expect(Popper.prototype.update)
        .to.have.been.calledTwice;
    });
  });

  it('should not forward own props to child', () => {
    let childProps;
    const Child = (props) => {
      childProps = props;
      return <div />;
    };

    ReactTestUtils.renderIntoDocument(
      <Position
        target={() => null}
        otherProp="foo"
        className="bar"
      >
        <Child className="foo" />
      </Position>
    );

    expect(childProps.target).to.not.exist;
    expect(childProps.otherProp).to.equal('foo');
    expect(childProps.className).to.equal('foo bar');
  });
});
