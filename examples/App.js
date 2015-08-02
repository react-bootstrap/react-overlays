import React from 'react';

import Button from 'react-bootstrap/lib/Button';
import Editor from 'component-playground';
import PropTable from './PropTable';

import ModalExample from '../webpack/example-loader!./Modal';
import OverlaySource from '../webpack/example-loader!./Overlay';
import PortalSource from '../webpack/example-loader!./Portal';
import PositionSource from '../webpack/example-loader!./Position';

import PortalMetadata from '../webpack/metadata-loader!react-overlays/Portal';
import PositionMetadata from '../webpack/metadata-loader!react-overlays/Position';
import OverlayMetadata from '../webpack/metadata-loader!react-overlays/Overlay';
import ModalMetadata from '../webpack/metadata-loader!react-overlays/Modal';

import * as ReactOverlays from 'react-overlays';

import './styles.less';

let scope = { React, Button, ...ReactOverlays };

const Example = React.createClass({

  render() {

    return (
      <div className='app'>
        <section >
          <h2 className='page-header'>Portals</h2>
          <p dangerouslySetInnerHTML={{__html: PortalMetadata.Portal.descHtml }}/>
          <Editor
            className='overlay-example'
            lineNumbers={false}
            lang="js"
            theme="neo"
            scope={scope}
            codeText={PortalSource}
            collapsableCode
          />
          <PropTable
            component='Portal'
            metadata={PortalMetadata}
          />
        </section>
        <section >
          <h2 className='page-header'>Modals</h2>
          <p dangerouslySetInnerHTML={{__html: ModalMetadata.Modal.descHtml }}/>
          <Editor
            className='overlay-example'
            lineNumbers={false}
            lang="js"
            theme="neo"
            scope={scope}
            codeText={ModalExample}
            collapsableCode
          />

          <PropTable
            component='Modal'
            metadata={ModalMetadata}
          />
        </section>

        <section >
          <h2 className='page-header'>Position</h2>
          <p dangerouslySetInnerHTML={{__html: PositionMetadata.Position.descHtml }}/>
          <Editor
            className='overlay-example'
            lineNumbers={false}
            lang="js"
            theme="neo"
            scope={scope}
            codeText={PositionSource}
            collapsableCode
          />
          <PropTable
            component='Position'
            metadata={PositionMetadata}
          />
        </section>
        <section>
          <h2 className='page-header'>Overlays</h2>
          <p dangerouslySetInnerHTML={{__html: OverlayMetadata.Overlay.descHtml }}/>
          <Editor
            className='overlay-example'
            lineNumbers={false}
            lang="js"
            theme="neo"
            scope={scope}
            codeText={OverlaySource}
            collapsableCode
          />

          <PropTable
            component='Overlay'
            metadata={OverlayMetadata}
          />
        </section>
      </div>
    );
  }
});

React.render(<Example/>, document.body);
