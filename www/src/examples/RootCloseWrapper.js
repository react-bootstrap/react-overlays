class RootCloseWrapperExample extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { show: false };

    this.show = () => this.setState({ show: true });
    this.hide = () => this.setState({ show: false });
  }

  render() {
    return (
      <div className="root-close-wrapper-example">
        <button className="btn btn-primary" onClick={this.show}>
          Render RootCloseWrapper
        </button>

        {this.state.show && (
          <RootCloseWrapper onRootClose={this.hide}>
            <div className="panel panel-default">
              <div className="panel-body">
                <span>Click anywhere to dismiss me!</span>
              </div>
            </div>
          </RootCloseWrapper>
        )}
      </div>
    );
  }
}
render(<RootCloseWrapperExample />);
