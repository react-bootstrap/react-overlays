import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import Portal from '../src/Portal';

describe('Portal', function () {
  let instance;

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

    getOverlayDOMNode = () => {
      return this.portal.getOverlayDOMNode();
    }
  }

  afterEach(function() {
    if (instance && ReactTestUtils.isCompositeComponent(instance) && instance._isMounted) {
      ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(instance).parentNode);
    }
  });

  it('Should render overlay into container (DOMNode)', function() {
    let container = document.createElement('div');

    instance = ReactTestUtils.renderIntoDocument(
      <Overlay container={container} overlay={<div id="test1" />} />
    );

    assert.equal(container.querySelectorAll('#test1').length, 1);
  });

  it('Should render overlay into container (ReactComponent)', function() {
    class Container extends React.Component {
      render() {
        return <Overlay container={this} overlay={<div id="test1" />} />;
      }
    }

    instance = ReactTestUtils.renderIntoDocument(
      <Container />
    );

    assert.equal(ReactDOM.findDOMNode(instance).querySelectorAll('#test1').length, 1);
  });

  it('Should not render a null overlay', function() {
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

    instance = ReactTestUtils.renderIntoDocument(
      <Container />
    );

    assert.equal(instance.overlay.getOverlayDOMNode(), null);
  });

  it('Should render only an overlay', function() {
    class OnlyOverlay extends React.Component {
      render() {
        return (
          <Portal
            ref={(c) => { this.portal = c; }}
            {...this.props}
          >
            {this.props.overlay}
          </Portal>
        );
      }
    }

    let overlayInstance = ReactTestUtils.renderIntoDocument(
      <OnlyOverlay overlay={<div id="test1" />} />
    );

    assert.equal(overlayInstance.portal.getOverlayDOMNode().nodeName, 'DIV');
  });

  it('Should change container on prop change', function() {

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

    let overlayInstance = ReactTestUtils.renderIntoDocument(
      <ContainerTest overlay={<div id="test1" />} />
    );

    assert.equal(overlayInstance.portal._portalContainerNode.nodeName, 'BODY');
    overlayInstance.setState({container: overlayInstance.container})
    assert.equal(overlayInstance.portal._portalContainerNode.nodeName, 'DIV');

    ReactDOM.unmountComponentAtNode(
      ReactDOM.findDOMNode(overlayInstance).parentNode,
    );
  });

  it('Should unmount when parent unmounts', function() {
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

    instance = ReactTestUtils.renderIntoDocument(
      <Parent />
    );

    instance.setState({show: false});
  });

});
