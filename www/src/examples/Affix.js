class AffixExample extends React.Component {
  render() {
    return (
      <div className="affix-example">
        <AutoAffix viewportOffsetTop={15} container={this}>
          <div className="panel panel-default">
            <div className="panel-body">I am an affixed element</div>
          </div>
        </AutoAffix>
      </div>
    );
  }
}

render(AffixExample);
