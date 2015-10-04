import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Portal from 'react-overlays/Portal';

class PortalExample extends React.Component {

  constructor(...args){
    super(...args);
    this.state = { show: false };

    this.show = ()=> this.setState({ show: true });
  }

  render() {

    let child = (
      <span>But I actually render here!</span>
    );

    return (
      <div className='portal-example'>
        <Button bsStyle='primary' onClick={this.show}>
          Render Child
        </Button>
        <div className='panel panel-default'>
          <div className='panel-body'>
            <span>It looks like I will render here.</span>

            <Portal className="test-portal-class" container={()=> this.refs.container}>
              { this.state.show && child }
            </Portal>
          </div>
        </div>

        <div className='panel panel-default'>
          <div ref='container' className='panel-body'/>
        </div>
      </div>
    );
  }
}

export default PortalExample;
