import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

import Portal from '../src/Portal';

describe('Portal', () => {
  it('should render overlay into container (document)', () => {
    class Container extends React.Component {
      componentDidMount() {
        expect(this.div).to.exist;
      }

      render() {
        return (
          <Portal>
            <div
              ref={c => {
                this.div = c;
              }}
              id="test1"
            />
          </Portal>
        );
      }
    }

    mount(<Container />);

    expect(document.querySelectorAll('#test1')).to.have.lengthOf(1);
  });

  it('should render overlay into container (DOMNode)', () => {
    const container = document.createElement('div');

    class Container extends React.Component {
      componentDidMount() {
        expect(this.div).to.exist;
      }

      render() {
        return (
          <Portal container={container}>
            <div
              ref={c => {
                this.div = c;
              }}
              id="test1"
            />
          </Portal>
        );
      }
    }

    mount(<Container />);

    expect(container.querySelectorAll('#test1')).to.have.lengthOf(1);
  });

  it('should render overlay into container (ReactComponent)', () => {
    class Container extends React.Component {
      container = React.createRef();

      componentDidMount() {
        expect(this.div).to.not.exist;
      }

      render() {
        return (
          <div ref={this.container}>
            <Portal container={this.container}>
              <div
                ref={c => {
                  this.div = c;
                }}
                id="test1"
              />
            </Portal>
          </div>
        );
      }
    }

    let instance;
    act(() => {
      instance = mount(<Container />).instance();
    });

    expect(instance.div).to.exist;
    expect(
      ReactDOM.findDOMNode(instance).querySelectorAll('#test1'),
    ).to.have.lengthOf(1);
  });

  it('should not fail to render a null overlay', () => {
    class Container extends React.Component {
      container = React.createRef();

      render() {
        return (
          <div ref={this.container}>
            <Portal container={this.container} />
          </div>
        );
      }
    }

    const nodes = mount(<Container />).getDOMNode().childNodes;

    expect(nodes).to.be.empty;
  });

  it('should unmount when parent unmounts', () => {
    class Parent extends React.Component {
      state = { show: true };

      render() {
        return <div>{(this.state.show && <Child />) || null}</div>;
      }
    }

    class Child extends React.Component {
      render() {
        return (
          <div>
            <div
              ref={c => {
                this.container = c;
              }}
            />
            <Portal container={() => this.container}>
              <div id="test1" />
            </Portal>
          </div>
        );
      }
    }

    const instance = mount(<Parent />);

    instance.setState({ show: false });
  });
});
