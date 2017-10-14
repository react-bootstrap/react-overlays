/* eslint-disable react/no-string-refs */

import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';

import Transition, { UNMOUNTED, EXITED, ENTERING, ENTERED, EXITING }
  from '../src/Transition';

import { render } from './helpers';

describe('Transition', () => {
  it('should not transition on mount', () => {
    let wrapper = mount(
      <Transition
        in
        timeout={0}
        onEnter={()=> { throw new Error('should not Enter'); }}
      >
        <div />
      </Transition>
    )

    expect(wrapper.state('status')).to.equal(ENTERED);
  });

  it('should transition on mount with transitionAppear', done => {
    let wrapper = mount(
      <Transition in
        transitionAppear
        timeout={0}
        onEnter={()=> done()}
      >
        <div />
      </Transition>
    );

    expect(wrapper.state('status')).to.equal(EXITED);
  });

  it('should flush new props to the DOM before initiating a transition', function(done) {
    mount(
      <Transition
        in={false}
        timeout={0}
        enteringClassName='test-entering'
        onEnter={node => {
          expect(node.classList.contains('test-class')).to.equal(true)
          expect(node.classList.contains('test-entering')).to.equal(false)
          done()
        }}
      >
        <div />
      </Transition>
    )
    .tap(inst => {
      expect(inst.hasClass('test-class')).to.equal(false)
    })
    .setProps({
      in: true,
      className: 'test-class'
    })
  });

  describe('entering', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <Transition
          timeout={10}
          enteredClassName='test-enter'
          enteringClassName='test-entering'
        >
          <div/>
        </Transition>
      );
    });

    it('should fire callbacks', done => {
      let onEnter = sinon.spy();
      let onEntering = sinon.spy();

      expect(wrapper.state('status')).to.equal(EXITED);

      wrapper.setProps({
        in: true,

        onEnter,

        onEntering,

        onEntered(){
          expect(onEnter.calledOnce).to.be.ok;
          expect(onEntering.calledOnce).to.be.ok;
          expect(onEnter.calledBefore(onEntering)).to.be.ok;
          done();
        }
      });
    });

    it('should move to each transition state', done => {
      let count = 0;

      expect(wrapper.state('status')).to.equal(EXITED);

      wrapper.setProps({
        in: true,

        onEnter(){
          count++;
          expect(wrapper.state('status')).to.equal(EXITED);
        },

        onEntering(){
          count++;
          expect(wrapper.state('status')).to.equal(ENTERING);
        },

        onEntered(){
          expect(wrapper.state('status')).to.equal(ENTERED);
          expect(count).to.equal(2);
          done();
        }
      });
    });

    it('should apply classes at each transition state', done => {
      let count = 0;

      expect(wrapper.state('status')).to.equal(EXITED);

      wrapper.setProps({
        in: true,

        onEnter(node){
          count++;
          expect(node.className).to.equal('');
        },

        onEntering(node){
          count++;
          expect(node.className).to.equal('test-entering');
        },

        onEntered(node){
          expect(node.className).to.equal('test-enter');
          expect(count).to.equal(2);
          done();
        }
      });
    });
  });

  describe('exiting', ()=> {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <Transition
          in
          timeout={10}
          exitedClassName='test-exit'
          exitingClassName='test-exiting'
        >
          <div/>
        </Transition>
      );
    });

    it('should fire callbacks', done => {
      let onExit = sinon.spy();
      let onExiting = sinon.spy();

      expect(wrapper.state('status')).to.equal(ENTERED);

      wrapper.setProps({
        in: false,

        onExit,

        onExiting,

        onExited(){
          expect(onExit.calledOnce).to.be.ok;
          expect(onExiting.calledOnce).to.be.ok;
          expect(onExit.calledBefore(onExiting)).to.be.ok;
          done();
        }
      });
    });

    it('should move to each transition state', done => {
      let count = 0;

      expect(wrapper.state('status')).to.equal(ENTERED);

      wrapper.setProps({
        in: false,

        onExit(){
          count++;
          expect(wrapper.state('status')).to.equal(ENTERED);
        },

        onExiting(){
          count++;
          expect(wrapper.state('status')).to.equal(EXITING);
        },

        onExited(){
          expect(wrapper.state('status')).to.equal(EXITED);
          expect(count).to.equal(2);
          done();
        }
      });
    });

    it('should apply classes at each transition state', done => {
      let count = 0;

      expect(wrapper.state('status')).to.equal(ENTERED);

      wrapper.setProps({
        in: false,

        onExit(node){
          count++;
          expect(node.className).to.equal('');
        },

        onExiting(node){
          count++;
          expect(node.className).to.equal('test-exiting');
        },

        onExited(node){
          expect(node.className).to.equal('test-exit');
          expect(count).to.equal(2);
          done();
        }
      });
    });
  });

  describe('mountOnEnter', () => {
    class MountTransition extends React.Component {
      constructor(props) {
        super(props);
        this.state = {in: props.initialIn};
      }

      render() {
        const { ...props } = this.props;
        delete props.initialIn;

        return (
          <Transition
            ref="transition"
            mountOnEnter
            in={this.state.in}
            timeout={10}
            {...props}
          >
            <div />
          </Transition>
        );
      }

      getStatus = () => {
        // FIXME: This test breaks when using a functional ref.
        return this.refs.transition.state.status;
      }
    }

    it('should mount when entering', done => {
      const wrapper = mount(
        <MountTransition
          initialIn={false}
          onEnter={() => {
            expect(wrapper.instance().getStatus()).to.equal(EXITED);
            expect(wrapper.getDOMNode()).to.exist;
            done();
          }}
        />
      );

      expect(wrapper.instance().getStatus()).to.equal(UNMOUNTED);

      expect(wrapper.getDOMNode()).to.not.exist;

      wrapper.setProps({ in: true });
    });

    it('should stay mounted after exiting', done => {
      const wrapper = mount(
        <MountTransition
          initialIn={false}
          onEntered={() => {
            expect(wrapper.instance().getStatus()).to.equal(ENTERED);
            expect(wrapper.getDOMNode()).to.exist;

            wrapper.setState({ in: false });
          }}
          onExited={() => {
            expect(wrapper.instance().getStatus()).to.equal(EXITED);
            expect(wrapper.getDOMNode()).to.exist;

            done();
          }}
        />
      );

      expect(wrapper.getDOMNode()).to.not.exist;
      wrapper.setState({ in: true });
    });
  })

  describe('unmountOnExit', () => {
    class UnmountTransition extends React.Component {
      constructor(props) {
        super(props);

        this.state = {in: props.initialIn};
      }

      render() {
        const { ...props } = this.props;
        delete props.initialIn;

        return (
          <Transition
            ref="transition"
            unmountOnExit
            in={this.state.in}
            timeout={10}
            {...props}
          >
            <div />
          </Transition>
        );
      }

      getStatus = () => {
        // FIXME: This test breaks when using a functional ref.
        return this.refs.transition.state.status;
      }
    }

    it('should mount when entering', done => {
      const wrapper = render(
        <UnmountTransition
          initialIn={false}
          onEnter={() => {
            expect(wrapper.getStatus()).to.equal(EXITED);
            expect(ReactDOM.findDOMNode(wrapper)).to.exist;

            done();
          }}
        />
      );

      expect(wrapper.getStatus()).to.equal(UNMOUNTED);
      expect(ReactDOM.findDOMNode(wrapper)).to.not.exist;

      wrapper.setState({in: true});
    });

    it('should unmount after exiting', done => {
      const wrapper = render(
        <UnmountTransition
          initialIn
          onExited={() => {
            setTimeout(() => {
              expect(wrapper.getStatus()).to.equal(UNMOUNTED);
              expect(ReactDOM.findDOMNode(wrapper)).to.not.exist;

              done();
            })
          }}
        />
      );

      expect(wrapper.getStatus()).to.equal(ENTERED);
      expect(ReactDOM.findDOMNode(wrapper)).to.exist;

      wrapper.setState({in: false});
    });
  });
});
