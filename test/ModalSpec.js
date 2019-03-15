/* eslint-disable react/display-name */
import jQuery from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import Transition from 'react-transition-group/Transition';
import simulant from 'simulant';

import Modal from '../src/Modal';

import { render } from './helpers';

const $ = componentOrNode => jQuery(ReactDOM.findDOMNode(componentOrNode));

describe('<Modal>', () => {
  let mountPoint;

  beforeEach(() => {
    mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
  });

  afterEach(() => {
    const unmounted = ReactDOM.unmountComponentAtNode(mountPoint);
    if (unmounted) {
      document.body.removeChild(mountPoint);
    }
    mountPoint.remove();
  });

  it('should render the modal content', () => {
    let instance = render(
      <Modal show>
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    expect(instance.dialog.querySelectorAll('strong')).to.have.lengthOf(1);
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

    let instance = render(<Container />, mountPoint);

    setTimeout(() => {
      let modal = ReactTestUtils.findRenderedComponentWithType(instance, Modal);
      let backdrop = modal.backdrop;

      expect($(instance).css('overflow')).to.equal('hidden');

      ReactTestUtils.Simulate.click(backdrop);

      expect($(instance).css('overflow')).to.not.equal('hidden');

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

    let instance = render(<Container />, mountPoint);
    let modal = ReactTestUtils.findRenderedComponentWithType(instance, Modal);
    let backdrop = modal.backdrop;

    expect($(instance).hasClass('test test2')).to.be.true;

    ReactTestUtils.Simulate.click(backdrop);

    expect($(instance).hasClass('test test2')).to.be.false;
  });

  it('should fire backdrop click callback', () => {
    let onClickSpy = sinon.spy();
    let instance = render(
      <Modal show onBackdropClick={onClickSpy}>
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    let backdrop = instance.backdrop;

    ReactTestUtils.Simulate.click(backdrop);

    expect(onClickSpy).to.have.been.calledOnce;
  });

  it('should close the modal when the backdrop is clicked', done => {
    let doneOp = () => {
      done();
    };
    let instance = render(
      <Modal show onHide={doneOp}>
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    let backdrop = instance.backdrop;

    ReactTestUtils.Simulate.click(backdrop);
  });

  it('should not close the modal when the "static" backdrop is clicked', () => {
    let onHideSpy = sinon.spy();
    let instance = render(
      <Modal show onHide={onHideSpy} backdrop="static">
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    let backdrop = instance.backdrop;

    ReactTestUtils.Simulate.click(backdrop);

    expect(onHideSpy).to.not.have.been.called;
  });

  it('should close the modal when the esc key is pressed', done => {
    let doneOp = () => {
      done();
    };
    let instance = render(
      <Modal show onHide={doneOp}>
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    let backdrop = instance.backdrop;

    simulant.fire(backdrop, 'keydown', { keyCode: 27 });
  });

  it('should add role to child', () => {
    let dialog;
    render(
      <Modal show>
        <strong
          ref={r => {
            dialog = r;
          }}
        >
          Message
        </strong>
      </Modal>,
      mountPoint,
    );

    expect(dialog.getAttribute('role')).to.equal('document');
  });

  it('should allow custom rendering', () => {
    let dialog;
    render(
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
      mountPoint,
    );

    expect(dialog.getAttribute('role')).to.equal('group');
  });

  it('should unbind listeners when unmounted', () => {
    render(
      <div>
        <Modal show containerClassName="modal-open">
          <strong>Foo bar</strong>
        </Modal>
      </div>,
      mountPoint,
    );

    assert.ok(document.body.classList.contains('modal-open'));

    render(<div />, mountPoint);

    assert.ok(!document.body.classList.contains('modal-open'));
  });

  it('should pass transition callbacks to Transition', done => {
    let count = 0;
    let increment = () => count++;

    let instance = render(
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
          instance.renderWithProps({ show: false });
        }}
      >
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );
  });

  it('should fire show callback on mount', () => {
    let onShowSpy = sinon.spy();
    render(
      <Modal show onShow={onShowSpy}>
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    expect(onShowSpy).to.have.been.calledOnce;
  });

  it('should fire show callback on update', () => {
    let onShowSpy = sinon.spy();
    let instance = render(
      <Modal onShow={onShowSpy}>
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    instance.renderWithProps({ show: true });

    expect(onShowSpy).to.have.been.calledOnce;
  });

  it('should fire onEscapeKeyDown callback on escape close', () => {
    let onEscapeSpy = sinon.spy();
    let instance = render(
      <Modal onEscapeKeyDown={onEscapeSpy}>
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    instance.renderWithProps({ show: true });

    simulant.fire(instance.backdrop, 'keydown', { keyCode: 27 });

    expect(onEscapeSpy).to.have.been.calledOnce;
  });

  it('should accept role on the Modal', () => {
    let instance = render(
      <Modal role="alertdialog" show>
        <strong>Message</strong>
      </Modal>,
      mountPoint,
    );

    expect(instance.dialog.getAttribute('role')).to.equal('alertdialog');
  });

  it('should accept the `aria-describedby` property on the Modal', () => {
    let instance = render(
      <Modal aria-describedby="modal-description" show>
        <strong id="modal-description">Message</strong>
      </Modal>,
      mountPoint,
    );

    expect(instance.dialog.getAttribute('aria-describedby')).to.equal(
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

      let instance = render(
        <Modal show className="modal">
          <strong>Message</strong>
        </Modal>,
        focusableContainer,
      );

      document.activeElement.className.should.contain('modal');

      instance.renderWithProps({ show: false });

      expect(document.activeElement).to.equal(focusableContainer);
    });

    it('should not focus on the Modal when autoFocus is false', () => {
      render(
        <Modal show autoFocus={false}>
          <strong>Message</strong>
        </Modal>,
        focusableContainer,
      );

      expect(document.activeElement).to.equal(focusableContainer);
    });

    it('should not focus Modal when child has focus', () => {
      expect(document.activeElement).to.equal(focusableContainer);

      render(
        <Modal show className="modal">
          <div>
            <input autoFocus />
          </div>
        </Modal>,
        focusableContainer,
      );

      let input = document.getElementsByTagName('input')[0];

      expect(document.activeElement).to.equal(input);
    });

    it('should return focus to the modal', done => {
      expect(document.activeElement).to.equal(focusableContainer);

      render(
        <Modal show className="modal">
          <div>
            <input autoFocus />
          </div>
        </Modal>,
        focusableContainer,
      );

      focusableContainer.focus();
      // focus reset runs in a timeout
      setTimeout(() => {
        document.activeElement.className.should.contain('modal');
        done();
      }, 50);
    });

    it('should not attempt to focus nonexistent children', () => {
      const Dialog = React.forwardRef((_, __) => null);

      render(
        <Modal show>
          <Dialog />
        </Modal>,
        focusableContainer,
      );
    });
  });
});
