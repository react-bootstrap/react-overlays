import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import Portal from '../src/Portal';

describe('Portal', () => {
  class Overlay extends React.Component {
    render() {
      return (
        <div>
          <Portal
            ref={(c) => { this.portal = c; }}
            {...this.props}
          >
            {this.props.overlay}
          </Portal>
        </div>
      );
    }
  }

  it('should render overlay into container (DOMNode)', () => {
    const container = document.createElement('div');

    ReactTestUtils.renderIntoDocument(
      <Overlay container={container} overlay={<div id="test1" />} />
    );

    assert.equal(container.querySelectorAll('#test1').length, 1);
  });

  it('should render overlay into container (ReactComponent)', () => {
    class Container extends React.Component {
      render() {
        return <Overlay container={this} overlay={<div id="test1" />} />;
      }
    }

    const instance = ReactTestUtils.renderIntoDocument(
      <Container />
    );

    expect(
      ReactDOM.findDOMNode(instance).querySelectorAll('#test1')
    ).to.have.lengthOf(1)
  });

  it('should not fail to render a null overlay', () => {
    class Container extends React.Component {
      render() {
        return (
          <Overlay
            ref={(c) => { this.overlay = c; }}
            container={this}
            overlay={null}
          />
        );
      }
    }

    const instance = ReactTestUtils.renderIntoDocument(
      <Container />
    );

    expect(ReactDOM.findDOMNode(instance).childNodes).to.be.empty;
  });

  it('should change container on prop change', () => {
    class ContainerTest extends React.Component {
      state = {};
      render() {
        return (
          <div>
            <div ref={(c) => { this.container = c; }} />
            <Portal
              ref={(c) => { this.portal = c; }}
              {...this.props}
              container={this.state.container}
            >
              {this.props.overlay}
            </Portal>
          </div>
        );
      }
    }

    const overlayInstance = ReactTestUtils.renderIntoDocument(
      <ContainerTest overlay={<div id="test1" />} />,
    );

    assert.equal(overlayInstance.portal._portalContainerNode.nodeName, 'BODY');
    overlayInstance.setState({container: overlayInstance.container});
    assert.equal(overlayInstance.portal._portalContainerNode.nodeName, 'DIV');

    ReactDOM.unmountComponentAtNode(
      ReactDOM.findDOMNode(overlayInstance).parentNode,
    );
  });

  it('should unmount when parent unmounts', () => {
    class Parent extends React.Component {
      state = {show: true};
      render() {
        return (
          <div>
            {this.state.show && <Child /> || null}
          </div>
        )
      }
    }

    class Child extends React.Component {
      render() {
        return (
          <div>
            <div ref={(c) => { this.container = c; }} />
            <Portal container={() => this.container}>
              <div id="test1" />
            </Portal>
          </div>
        );
      }
    }

    const instance = ReactTestUtils.renderIntoDocument(
      <Parent />
    );

    instance.setState({show: false});
  });

});
