/* eslint-disable react/display-name */
import jQuery from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Transition from 'react-transition-group/Transition';
import simulant from 'simulant';

import { mount } from 'enzyme';

import Modal from '../src/Modal';

const $ = componentOrNode => jQuery(ReactDOM.findDOMNode(componentOrNode));

describe('<Modal>', () => {
  let attachTo;
  let wrapper;

  const mountWithRef = (el, options) => {
    const ref = React.createRef();
    const Why = props => React.cloneElement(el, { ...props, ref });
    wrapper = mount(<Why />, options);
    return ref;
  };

  beforeEach(() => {
    attachTo = document.createElement('div');
    document.body.appendChild(attachTo);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    attachTo.remove();
  });

  it('should render the modal content', () => {
    const ref = mountWithRef(
      <Modal show>
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    expect(ref.current.dialog.querySelectorAll('strong')).to.have.lengthOf(1);
  });

  it('should disable scrolling on the modal container while open', done => {
    class Container extends React.Component {
      ref = React.createRef();

      state = {
        modalOpen: true,
      };

      handleCloseModal = () => {
        this.setState({ modalOpen: false });
      };

      render() {
        return (
          <div ref={this.ref}>
            <Modal
              show={this.state.modalOpen}
              onHide={this.handleCloseModal}
              container={this.ref}
            >
              <strong>Message</strong>
            </Modal>
          </div>
        );
      }
    }

    wrapper = mount(<Container />, { attachTo });

    setTimeout(() => {
      const container = wrapper.instance().ref.current;
      let modal = wrapper.find('Modal').instance();
      let backdrop = modal.backdrop;

      expect($(container).css('overflow')).to.equal('hidden');

      backdrop.click();

      expect($(container).css('overflow')).to.not.equal('hidden');

      done();
    });
  });

  it('should add and remove container classes', () => {
    class Container extends React.Component {
      state = { modalOpen: true };

      ref = React.createRef();

      handleCloseModal = () => {
        this.setState({ modalOpen: false });
      };

      render() {
        return (
          <div ref={this.ref}>
            <Modal
              show={this.state.modalOpen}
              onHide={this.handleCloseModal}
              containerClassName="test test2"
              container={this.ref}
            >
              <strong>Message</strong>
            </Modal>
          </div>
        );
      }
    }

    wrapper = mount(<Container />, { attachTo });

    const container = wrapper.instance().ref.current;
    let modal = wrapper.find('Modal').instance();
    let backdrop = modal.backdrop;

    expect($(container).hasClass('test test2')).to.be.true;

    backdrop.click();

    expect($(container).hasClass('test test2')).to.be.false;
  });

  it('should fire backdrop click callback', () => {
    let onClickSpy = sinon.spy();
    let ref = mountWithRef(
      <Modal show onBackdropClick={onClickSpy}>
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    let backdrop = ref.current.backdrop;

    backdrop.click();

    expect(onClickSpy).to.have.been.calledOnce;
  });

  it('should close the modal when the backdrop is clicked', done => {
    let doneOp = () => {
      done();
    };
    let ref = mountWithRef(
      <Modal show onHide={doneOp}>
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    let backdrop = ref.current.backdrop;

    backdrop.click();
  });

  it('should not close the modal when the "static" backdrop is clicked', () => {
    let onHideSpy = sinon.spy();

    let ref = mountWithRef(
      <Modal show onHide={onHideSpy} backdrop="static">
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    let { backdrop } = ref.current;

    backdrop.click();

    expect(onHideSpy).to.not.have.been.called;
  });

  it('should close the modal when the esc key is pressed', done => {
    let doneOp = () => {
      done();
    };

    let ref = mountWithRef(
      <Modal show onHide={doneOp}>
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    let { backdrop } = ref.current;

    simulant.fire(backdrop, 'keydown', { keyCode: 27 });
  });

  it('should add role to child', () => {
    let dialog;
    wrapper = mount(
      <Modal show>
        <strong
          ref={r => {
            dialog = r;
          }}
        >
          Message
        </strong>
      </Modal>,
      { attachTo },
    );

    expect(dialog.getAttribute('role')).to.equal('document');
  });

  it('should allow custom rendering', () => {
    let dialog;
    wrapper = mount(
      <Modal
        show
        renderDialog={props => (
          <strong
            {...props}
            role="group"
            ref={r => {
              dialog = r;
            }}
          >
            Message
          </strong>
        )}
      />,
      { attachTo },
    );

    expect(dialog.getAttribute('role')).to.equal('group');
  });

  it('should unbind listeners when unmounted', () => {
    wrapper = mount(
      <div>
        <Modal show containerClassName="modal-open">
          <strong>Foo bar</strong>
        </Modal>
      </div>,
      { attachTo },
    );

    assert.ok(document.body.classList.contains('modal-open'));

    mount(<div />, { attachTo });

    assert.ok(!document.body.classList.contains('modal-open'));
  });

  it('should pass transition callbacks to Transition', done => {
    let count = 0;
    let increment = () => count++;

    wrapper = mount(
      <Modal
        show
        transition={p => <Transition {...p} timeout={0} />}
        onExit={increment}
        onExiting={increment}
        onExited={() => {
          increment();
          expect(count).to.equal(6);
          done();
        }}
        onEnter={increment}
        onEntering={increment}
        onEntered={() => {
          increment();
          wrapper.setProps({ show: false });
        }}
      >
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );
  });

  it('should fire show callback on mount', () => {
    let onShowSpy = sinon.spy();

    mount(
      <Modal show onShow={onShowSpy}>
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    expect(onShowSpy).to.have.been.calledOnce;
  });

  it('should fire show callback on update', () => {
    let onShowSpy = sinon.spy();
    wrapper = mount(
      <Modal onShow={onShowSpy}>
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    wrapper.setProps({ show: true });

    expect(onShowSpy).to.have.been.calledOnce;
  });

  it('should fire onEscapeKeyDown callback on escape close', () => {
    let onEscapeSpy = sinon.spy();

    let ref = mountWithRef(
      <Modal onEscapeKeyDown={onEscapeSpy}>
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    wrapper.setProps({ show: true });

    act(() => {
      simulant.fire(ref.current.backdrop, 'keydown', { keyCode: 27 });
    });

    expect(onEscapeSpy).to.have.been.calledOnce;
  });

  it('should accept role on the Modal', () => {
    const ref = mountWithRef(
      <Modal role="alertdialog" show>
        <strong>Message</strong>
      </Modal>,
      { attachTo },
    );

    expect(ref.current.dialog.getAttribute('role')).to.equal('alertdialog');
  });

  it('should accept the `aria-describedby` property on the Modal', () => {
    const ref = mountWithRef(
      <Modal aria-describedby="modal-description" show>
        <strong id="modal-description">Message</strong>
      </Modal>,
      { attachTo },
    );

    expect(ref.current.dialog.getAttribute('aria-describedby')).to.equal(
      'modal-description',
    );
  });

  describe('Focused state', () => {
    let focusableContainer = null;

    beforeEach(() => {
      focusableContainer = document.createElement('div');
      focusableContainer.tabIndex = 0;
      focusableContainer.className = 'focus-container';
      document.body.appendChild(focusableContainer);
      focusableContainer.focus();
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(focusableContainer);
      document.body.removeChild(focusableContainer);
    });

    it('should focus on the Modal when it is opened', () => {
      expect(document.activeElement).to.equal(focusableContainer);

      wrapper = mount(
        <Modal show className="modal">
          <strong>Message</strong>
        </Modal>,
        { attachTo: focusableContainer },
      );

      document.activeElement.className.should.contain('modal');

      wrapper.setProps({ show: false });

      expect(document.activeElement).to.equal(focusableContainer);
    });

    it('should not focus on the Modal when autoFocus is false', () => {
      mount(
        <Modal show autoFocus={false}>
          <strong>Message</strong>
        </Modal>,
        { attachTo: focusableContainer },
      );

      expect(document.activeElement).to.equal(focusableContainer);
    });

    it('should not focus Modal when child has focus', () => {
      expect(document.activeElement).to.equal(focusableContainer);

      mount(
        <Modal show className="modal">
          <div>
            <input autoFocus />
          </div>
        </Modal>,
        { attachTo: focusableContainer },
      );

      let input = document.getElementsByTagName('input')[0];

      expect(document.activeElement).to.equal(input);
    });

    it('should return focus to the modal', done => {
      expect(document.activeElement).to.equal(focusableContainer);

      mount(
        <Modal show className="modal">
          <div>
            <input autoFocus />
          </div>
        </Modal>,
        { attachTo: focusableContainer },
      );

      focusableContainer.focus();
      // focus reset runs in a timeout
      setTimeout(() => {
        document.activeElement.className.should.contain('modal');
        done();
      }, 50);
    });

    it('should not attempt to focus nonexistent children', () => {
      // eslint-disable-next-line no-unused-vars
      const Dialog = React.forwardRef((_, __) => null);

      mount(
        <Modal show>
          <Dialog />
        </Modal>,
        { attachTo: focusableContainer },
      );
    });
  });
});
