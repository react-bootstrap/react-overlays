import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import Editor from 'component-playground';

import ModalExample from '../webpack/example-loader!./Modal';
import OverlaySource from '../webpack/example-loader!./Overlay';
import PortalSource from '../webpack/example-loader!./Portal';


import * as ReactOverlays from 'react-overlays';

import './styles.less';

let scope = { React, Button, ...ReactOverlays };

const Example = React.createClass({

  render() {

    return (
      <div className='app'>
        <section >
          <h3>Portals</h3>
          <p>Render a set of child components into a diffent</p>
          <Editor
            className='overlay-example'
            lineNumbers={false}
            lang="js"
            theme="neo"
            scope={scope}
            codeText={PortalSource}
            collapsableCode
          />
        </section>
        <section >
          <h3>Modals</h3>
          <Editor
            className='overlay-example'
            lineNumbers={false}
            lang="js"
            theme="neo"
            scope={scope}
            codeText={ModalExample}
            collapsableCode
          />
        </section>

        <section>
          <h3>Overlays</h3>
          <p>Overlay components</p>
          <Editor
            className='overlay-example'
            lineNumbers={false}
            lang="js"
            theme="neo"
            scope={scope}
            codeText={OverlaySource}
            collapsableCode
          />
        </section>
      </div>
    );
  }
});

React.render(<Example/>, document.body);
