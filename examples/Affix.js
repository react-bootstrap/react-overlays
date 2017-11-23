import React from 'react';
import AutoAffix from 'react-overlays/lib/AutoAffix';

const OFFSET = 100

class AffixExample extends React.Component {
  state = {
    offsetting: false
  };

  handleToggleOffset = () => {
    this.setState({offsetting: !this.state.offsetting});
  }

  render() {
    const { offsetting } = this.state
    const offsetBottom = offsetting ? OFFSET : null;
    return (
      <div className='affix-example'>
        <AutoAffix viewportOffsetTop={15} container={this} offsetBottom={offsetBottom}>
          <div className='panel panel-default'>
            <div className='panel-body'>
              I am an affixed element
            </div>

            <div className="panel-footer">
              <button className="btn btn-default" onClick={this.handleToggleOffset}>
                <code>offsetBottom: {offsetBottom || 'null'}</code> {offsetting ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>
        </AutoAffix>
      </div>
    );
  }
}

export default AffixExample;
