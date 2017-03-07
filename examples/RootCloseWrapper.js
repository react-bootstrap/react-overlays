import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

class RootCloseWrapperExample extends React.Component {
  constructor(...args){
    super(...args);

    this.state = { show: false };

    this.show = () => this.setState({ show: true });
    this.hide = () => this.setState({ show: false });
  }

  render() {
    return (
      <div className='root-close-wrapper-example'>
        <Button bsStyle='primary' onClick={this.show}>
          Render RootCloseWrapper
        </Button>

        {this.state.show && (
          <RootCloseWrapper onRootClose={this.hide}>
            <div className='panel panel-default'>
              <div className='panel-body'>
                <span>Click anywhere to dismiss me!</span>
              </div>
            </div>
          </RootCloseWrapper>
        )}
      </div>
    );
  }
}

export default RootCloseWrapperExample;
