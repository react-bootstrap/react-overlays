import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import Portal from '../src/LegacyPortal';

describe('LegacyPortal', () => {
  it('should render overlay into container (document)', () => {
    ReactTestUtils.renderIntoDocument(
      <Portal>
        <div id="test2" />
      </Portal>
    );

    expect(document.querySelectorAll('#test2')).to.have.lengthOf(1);
  });

  it('should render overlay into container (DOMNode)', () => {
    const container = document.createElement('div');

    ReactTestUtils.renderIntoDocument(
      <Portal container={container}>
        <div id="test2" />
      </Portal>
    );

    expect(container.querySelectorAll('#test2')).to.have.lengthOf(1);
  });

  it('should render overlay into container (ReactComponent)', () => {
    class Container extends React.Component {
      render() {
        return (
          <div>
            <Portal container={this}>
              <div id="test2" />
            </Portal>
          </div>
        );
      }
    }

    const instance = ReactTestUtils.renderIntoDocument(
      <Container />
    );

    expect(
      ReactDOM.findDOMNode(instance).querySelectorAll('#test2')
    ).to.have.lengthOf(1)
  });

  it('should not render a null overlay', () => {
    class Container extends React.Component {
      render() {
        return (
          <div>
            <Portal container={this} />
          </div>
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
      <ContainerTest overlay={<div id="test2" />} />,
    );

    expect(
      overlayInstance.portal._portalContainerNode.nodeName,
    ).to.equal('BODY');
    overlayInstance.setState({container: overlayInstance.container});
    expect(
      overlayInstance.portal._portalContainerNode.nodeName,
    ).to.equal('DIV');

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
              <div id="test2" />
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
