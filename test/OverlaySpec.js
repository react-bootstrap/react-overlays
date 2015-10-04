import React from 'react';
import ReactTestUtils from 'react/lib/ReactTestUtils';
import Overlay from '../src/Overlay';

describe('Overlay', function () {
  let instance;

  afterEach(function() {
    if (instance && ReactTestUtils.isCompositeComponent(instance) && instance.isMounted()) {
      React.unmountComponentAtNode(React.findDOMNode(instance));
    }
  });

  it('Should add a class on an Overlay\'s container with "portalClassName" prop', function() {
    let Container = React.createClass({
      render() {
        return (
            <div id="wrapper">
              <Overlay container={this} show portalClassName="myPortalTestClass">
                <div id="overlayChild" />
              </Overlay>
            </div>
        );
      }
    });

    instance = ReactTestUtils.renderIntoDocument(
        <Container />
    );

    assert.equal(React.findDOMNode(instance).querySelectorAll('#wrapper > .myPortalTestClass > #overlayChild').length, 1);
  });
});
