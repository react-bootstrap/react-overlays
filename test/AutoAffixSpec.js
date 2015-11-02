import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';

import AutoAffix from '../src/AutoAffix';

import { render } from './helpers';

describe('<AutoAffix>', () => {
  let mountPoint;

  // This makes the window very tall; hopefully enough to exhibit the affix
  // behavior. If this is insufficient, we should modify the Karma config to
  // fix the browser window size.
  class Container extends React.Component {
    render() {
      return (
        <div style={{
          position: 'absolute',
          top: 0,
          height: 20000
        }}>
          {this.props.children}
        </div>
      );
    }
  }

  class Content extends React.Component {
    render() {
      return <div {...this.props}>Content</div>;
    }
  }

  class Fixture extends React.Component {
    render() {
      return (
        <div style={{width: 200, height: 10000}}>
          <div style={{height: 100}} />

          <AutoAffix container={this} viewportOffsetTop={0}>
            <Content style={{height: 100}} />
          </AutoAffix>
        </div>
      );
    }
  }

  beforeEach(() => {
    mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(mountPoint);
    document.body.removeChild(mountPoint);
    window.scrollTo(0, 0);
  });

  describe('affix behavior', () => {
    let node;

    beforeEach(() => {
      const container = render((
        <Container>
          <Fixture />
        </Container>
      ), mountPoint);

      node = ReactDOM.findDOMNode(ReactTestUtils.findRenderedComponentWithType(
        container, Content
      ));
    });

    it('should render correctly at top', (done) => {
      window.scrollTo(0, 99);

      requestAnimationFrame(() => {
        expect(node.style.position).to.not.be.ok;
        expect(node.style.top).to.not.be.ok;
        expect(node.style.width).to.not.be.ok;
        done();
      });
    });

    it('should affix correctly', (done) => {
      window.scrollTo(0, 101);
      requestAnimationFrame(() => {
        expect(node.style.position).to.equal('fixed');
        expect(node.style.top).to.equal('0px');
        expect(node.style.width).to.equal('200px');
        done();
      });
    });

    it('should render correctly at bottom', (done) => {
      window.scrollTo(0, 9901);

      requestAnimationFrame(() => {
        expect(node.style.position).to.equal('absolute');
        expect(node.style.top).to.equal('9900px');
        expect(node.style.width).to.equal('200px');
        done();
      });
    });
  });
});
