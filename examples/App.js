import React from 'react';
import { findDOMNode } from 'react-dom';
import Button from 'react-bootstrap/lib/Button';
import Editor from '@jquense/component-playground';

import PropTable from './PropTable';

import ModalExample from '../webpack/example-loader!./Modal';
import OverlaySource from '../webpack/example-loader!./Overlay';
import PortalSource from '../webpack/example-loader!./Portal';
import PositionSource from '../webpack/example-loader!./Position';
import TransitionSource from '../webpack/example-loader!./Transition';

import PortalMetadata from '../webpack/metadata-loader!react-overlays/Portal';
import PositionMetadata from '../webpack/metadata-loader!react-overlays/Position';
import OverlayMetadata from '../webpack/metadata-loader!react-overlays/Overlay';
import ModalMetadata from '../webpack/metadata-loader!react-overlays/Modal';
import TransitionMetadata from '../webpack/metadata-loader!react-overlays/Transition';

import * as ReactOverlays from 'react-overlays';

import './styles.less';
import injectCss from './injectCss';

let scope = { React, findDOMNode, Button, injectCss, ...ReactOverlays };

const Anchor = React.createClass({
  propTypes: {
    id: React.PropTypes.string
  },
  render() {
    let id = this.props.id || this.props.children.toLowerCase().replace(/\s+/gi, '_');

    return (
      <a id={id} href={'#' + id} className='anchor'>
        <span className='anchor-icon'>#</span>
        {this.props.children}
      </a>
    );
  }
});

const ExampleEditor = React.createClass({
  propTypes: {
    codeText: React.PropTypes.string
  },
  render() {
    return (
      <Editor
        className='overlay-example'
        lineNumbers={false}
        lang="js"
        theme="neo"
        scope={scope}
        codeText={this.props.codeText}
        collapsableCode
      />
    );
  }
});

const Example = React.createClass({

  render() {

    return (
      <div className='app row'>
        <article className='side-panel col-md-2'>
          <ul className='list-unstyled'>
            <li><a href='#transition'>Transition</a></li>
            <li><a href='#portals'>Portals</a></li>
            <li><a href='#modals'>Modals</a></li>
            <li><a href='#position'>Position</a></li>
            <li><a href='#overlay'>Overlay</a></li>
          </ul>
        </article>
        <main className='col-md-10'>
          <section >
            <h2 className='page-header'>
              <Anchor>Transition</Anchor>
            </h2>
            <p dangerouslySetInnerHTML={{__html: TransitionMetadata.Transition.descHtml }}/>
            <ExampleEditor codeText={TransitionSource} />
            <PropTable
              component='Transition'
              metadata={TransitionMetadata}
            />
          </section>
          <section >
            <h2 className='page-header'>
              <Anchor>Portals</Anchor>
            </h2>
            <p dangerouslySetInnerHTML={{__html: PortalMetadata.Portal.descHtml }}/>
            <ExampleEditor codeText={PortalSource} />
            <PropTable
              component='Portal'
              metadata={PortalMetadata}
            />
          </section>
          <section >
            <h2 className='page-header'>
              <Anchor>Modals</Anchor>
            </h2>
            <p dangerouslySetInnerHTML={{__html: ModalMetadata.Modal.descHtml }}/>
            <ExampleEditor codeText={ModalExample} />
            <PropTable
              component='Modal'
              metadata={ModalMetadata}
            />
          </section>
          <section >
            <h2 className='page-header'>
              <Anchor>Position</Anchor>
            </h2>
            <p dangerouslySetInnerHTML={{__html: PositionMetadata.Position.descHtml }}/>
            <ExampleEditor codeText={PositionSource} />
            <PropTable
              component='Position'
              metadata={PositionMetadata}
            />
          </section>
          <section>
            <h2 className='page-header'>
              <Anchor>Overlay</Anchor>
            </h2>
            <p dangerouslySetInnerHTML={{__html: OverlayMetadata.Overlay.descHtml }}/>
            <ExampleEditor codeText={OverlaySource} />
            <PropTable
              component='Overlay'
              metadata={OverlayMetadata}
            />
          </section>
        </main>
      </div>
    );
  }
});

React.render(<Example/>, document.getElementById('app-container'));
