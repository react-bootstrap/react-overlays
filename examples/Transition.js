import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-overlays/lib/Modal';
import Transition, { ENTERED, ENTERING } from 'react-transition-group/Transition';

import injectCss from './injectCss';

const FADE_DURATION = 200;

injectCss(`
  .fade {
    opacity: 0;
    transition: opacity ${FADE_DURATION}ms linear;
  }

  .in {
    opacity: 1;
  }

  .transition-example-modal {
    position: fixed;
    z-index: 1040;
    top: 0; bottom: 0; left: 0; right: 0;
  }

  .transition-example-backdrop {
    position: fixed;
    top: 0; bottom: 0; left: 0; right: 0;
    background-color: #000;
  }

  .transition-example-backdrop.fade.in {
    opacity: 0.5;
  }

  .transition-example-dialog {
    position: absolute;
    width: 400;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid #e5e5e5;
    background-color: white;
    box-shadow: 0 5px 15px rgba(0, 0, 0, .5);
    padding: 20px;
  }
`);

const fadeStyles = {
  [ENTERING]: 'in',
  [ENTERED]: 'in',
};

const Fade = ({ children, ...props }) => {
  return (
    <Transition {...props} timeout={FADE_DURATION}>
      {(status, innerProps) => React.cloneElement(children, {
        ...innerProps,
        className: `fade ${fadeStyles[status]} ${children.props.className}`,
      })}
    </Transition>
  );
}

class TransitionExample extends React.Component {
  state = { showModal: false };

  toggle = () => {
    return this.setState({ showModal: !this.state.showModal });
  }

  render() {
    return (
      <div className='transition-example'>
        <Button bsStyle='primary' onClick={this.toggle}>
          Show Animated Modal
        </Button>

        <Modal
          transition={Fade}
          backdropTransition={Fade}
          className='transition-example-modal'
          backdropClassName='transition-example-backdrop'
          show={this.state.showModal}
          onHide={this.toggle}
        >
          <div className="transition-example-dialog">
            <h4 id='modal-label'>I'm fading in!</h4>
            <p>
              Anim pariatur cliche reprehenderit, enim eiusmod high life
              accusamus terry richardson ad squid.
              Nihil anim keffiyeh helvetica, craft beer labore wes
              anderson cred nesciunt sapiente ea proident.
            </p>
          </div>
        </Modal>
      </div>
    );
  }
}

export default TransitionExample;
