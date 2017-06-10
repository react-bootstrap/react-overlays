import pick from 'lodash/pick';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import Position from '../src/Position';

import { render } from './helpers';

describe('Position', function () {
  // Swallow extra props.
  const Span = () => <span />;

  it('Should output a child', function () {
    let instance = ReactTestUtils.renderIntoDocument(
      <Position>
        <Span>Text</Span>
      </Position>
    );
    assert.equal(ReactDOM.findDOMNode(instance).nodeName, 'SPAN');
  });

  it('Should warn about several children', function () {
    expect(() => {
      ReactTestUtils.renderIntoDocument(
        <Position>
          <Span>Text</Span>
          <Span>Another Text</Span>
        </Position>
      );
    }).to.throw(/React.Children.only expected to receive a single React element child./);
  });

  describe('position recalculation', function () {
    beforeEach(function () {
      sinon.spy(Position.prototype, 'componentWillReceiveProps');
      sinon.spy(Position.prototype, 'updatePosition');
    });

    afterEach(function () {
      Position.prototype.componentWillReceiveProps.restore();
      Position.prototype.updatePosition.restore();
    });

    it('Should only recalculate when target changes', function () {
      class TargetChanger extends React.Component {
        constructor(props) {
          super(props);

          this.state = {
            target: 'foo',
            fakeProp: 0
          };
        }

        render() {
          return (
            <div>
              <div ref={(c) => { this.foo = c; }} />
              <div ref={(c) => { this.bar = c; }} />

              <Position
                target={() => this[this.state.target]}
                fakeProp={this.state.fakeProp}
              >
                <Span />
              </Position>
            </div>
          );
        }
      }

      const instance = ReactTestUtils.renderIntoDocument(<TargetChanger />);

      // Position calculates initial position.
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.not.been.called;
      expect(Position.prototype.updatePosition)
        .to.have.been.calledOnce;

      instance.setState({target: 'bar'});

      // Position receives new props and recalculates position.
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.been.calledOnce;
      expect(Position.prototype.updatePosition)
        .to.have.been.calledTwice;

      instance.setState({fakeProp: 1});

      // Position receives new props but should not recalculate position.
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.been.calledTwice;
      expect(Position.prototype.updatePosition)
        .to.have.been.calledTwice;
    });

    it('Should recalculate position if shouldUpdatePosition prop is true', function () {
      class Target extends React.Component {
        constructor(props) {
          super(props);

          this.state = {
            target: 'bar',
            fakeProp: 0
          };
        }

        render() {
          return (
            <div>
              <div ref={(c) => { this.bar = c; }} />

              <Position
                target={() => this[this.state.target]}
                shouldUpdatePosition
                fakeProp={this.state.fakeProp}
              >
                <Span />
              </Position>
            </div>
          );
        }
      }

      const instance = ReactTestUtils.renderIntoDocument(<Target />);

      // Position calculates initial position.
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.not.been.called;
      expect(Position.prototype.updatePosition)
        .to.have.been.calledOnce;

      instance.setState({fakeProp: 1});

      // Position receives new props and position should be recalculated
      expect(Position.prototype.componentWillReceiveProps)
        .to.have.been.calledOnce;
      expect(Position.prototype.updatePosition)
        .to.have.been.calledTwice;
    });
  });

  describe('position calculation', function () {
    let mountPoint;

    beforeEach(function () {
      mountPoint = document.createElement('div');
      document.body.appendChild(mountPoint);
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(mountPoint);
      document.body.removeChild(mountPoint);
    });

    function checkPosition(placement, targetPosition, expected) {
      class FakeOverlay extends React.Component {
        render() {
          return (
            <div style={{
              position: 'absolute',
              width: 200,
              height: 200
            }} />
          );
        }
      }

      class FakeContainer extends React.Component {
        render() {
          return (
            <div style={{
              position: 'relative',
              width: 600,
              height: 600
            }}>
              <div
                ref={(c) => { this.target = c; }}
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  ...targetPosition
                }}
              />

              <Position
                target={() => this.target}
                container={this}
                containerPadding={50}
                placement={placement}
              >
                <FakeOverlay ref={(c) => { this.overlay = c; }} />
              </Position>
              <Position
                target={() => this.target}
                container={() => this}
                containerPadding={50}
                placement={placement}
              >
                <FakeOverlay ref={(c) => { this.fakeOverlay = c; }} />
              </Position>
            </div>
          );
        }
      }

      const expectedPosition = {
        positionLeft: expected[0],
        positionTop: expected[1],
        arrowOffsetLeft: expected[2],
        arrowOffsetTop: expected[3]
      };

      it('Should calculate the correct position', function() {
        const instance = render(<FakeContainer />, mountPoint);

        ['overlay', 'fakeOverlay'].forEach(function(overlayRefName) {
          const calculatedPosition = pick(
            instance[overlayRefName].props, Object.keys(expectedPosition)
          );
          expect(calculatedPosition).to.eql(expectedPosition);

        });
      });
    }

    [
      {
        placement: 'left',
        noOffset: [50, 200, undefined, '50%'],
        offsetBefore: [-200, 50, undefined, '0%'],
        offsetAfter: [300, 350, undefined, '100%']
      },
      {
        placement: 'top',
        noOffset: [200, 50, '50%', undefined],
        offsetBefore: [50, -200, '0%', undefined],
        offsetAfter: [350, 300, '100%', undefined]
      },
      {
        placement: 'bottom',
        noOffset: [200, 350, '50%', undefined],
        offsetBefore: [50, 100, '0%', undefined],
        offsetAfter: [350, 600, '100%', undefined]
      },
      {
        placement: 'right',
        noOffset: [350, 200, undefined, '50%'],
        offsetBefore: [100, 50, undefined, '0%'],
        offsetAfter: [600, 350, undefined, '100%']
      }
    ].forEach(function(testCase) {
      const placement = testCase.placement;

      describe(`placement = ${placement}`, function() {
        describe('no viewport offset', function() {
          checkPosition(
            placement, {left: 250, top: 250}, testCase.noOffset
          );
        });

        describe('viewport offset before', function() {
          checkPosition(
            placement, {left: 0, top: 0}, testCase.offsetBefore
          );
        });

        describe('viewport offset after', function() {
          checkPosition(
            placement, {left: 500, top: 500}, testCase.offsetAfter
          );
        });
      });
    });

    describe('calculate using container callback function', function () {

    });
  });

  it('should not forward own props to child', function () {
    let spiedProps;
    const Child = (props) => {
      spiedProps = props;
      return <div />;
    };

    ReactTestUtils.renderIntoDocument(
      <Position target={() => null} childProp="foo">
        <Child />
      </Position>
    );

    expect(spiedProps.target).to.not.exist;
    expect(spiedProps.childProp).to.equal('foo');
  });

  // ToDo: add remaining tests
});
