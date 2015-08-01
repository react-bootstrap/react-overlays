import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-overlays/Modal';

const ModalStyle = {
  position: 'fixed',
  zIndex: 1040,
  top: 0, bottom: 0, left: 0, right: 0
};

const BackdropStyle = {
  ...ModalStyle,
  zIndex: 'auto',
  backgroundColor: '#000',
  opacity: 0.5
};

const DialogStyle = {
  position: 'absolute',
  width: 400,
  top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  border: '1px solid #e5e5e5',
  backgroundColor: 'white',
  boxShadow: '0 5px 15px rgba(0,0,0,.5)',
  padding: 20
};


const ModalExample = React.createClass({

  getInitialState(){
    return { showModal: false };
  },

  close(){
    this.setState({ showModal: false });
  },

  open(){
    this.setState({ showModal: true });
  },

  render() {

    return (
      <div className='modal-example'>
        <Button onClick={this.open}>
          Open Modal
        </Button>
        <p>Click to get the full Modal experience!</p>

        <Modal
          style={ModalStyle}
          backdropStyle={BackdropStyle}
          show={this.state.showModal}
          onHide={this.close}
        >
          <div style={DialogStyle}>
            <h4>Text in a modal</h4>
            <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
          </div>
        </Modal>
      </div>
    );
  }
});

export default ModalExample;
