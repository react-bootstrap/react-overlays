import React from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import Playground from '@monastic.panic/component-playground/Playground';

import PropTable from './PropTable';

import AffixSource from '../webpack/example-loader!./Affix';
import ModalExample from '../webpack/example-loader!./Modal';
import OverlaySource from '../webpack/example-loader!./Overlay';
import PortalSource from '../webpack/example-loader!./Portal';
import PositionSource from '../webpack/example-loader!./Position';
import RootCloseWrapperSource from '../webpack/example-loader!./RootCloseWrapper';
import TransitionSource from '../webpack/example-loader!./Transition';

import AffixMetadata from 'component-metadata-loader?pitch!react-overlays/Affix';
import AutoAffixMetadata from 'component-metadata-loader?pitch!react-overlays/AutoAffix';
import ModalMetadata from 'component-metadata-loader?pitch!react-overlays/Modal';
import OverlayMetadata from 'component-metadata-loader?pitch!react-overlays/Overlay';
import PortalMetadata from 'component-metadata-loader?pitch!react-overlays/Portal';
import PositionMetadata from 'component-metadata-loader?pitch!react-overlays/Position';
import RootCloseWrapperMetadata from 'component-metadata-loader?pitch!react-overlays/RootCloseWrapper';
import TransitionMetadata from 'component-metadata-loader?pitch!react-overlays/Transition';

import * as ReactOverlays from 'react-overlays';
import getOffset from 'dom-helpers/query/offset';

import './styles.less';
import injectCss from './injectCss';

const scope = {
  React, ReactDOM, findDOMNode, Button, injectCss, ...ReactOverlays, getOffset
};

const Anchor = React.createClass({
  propTypes: {
    id: PropTypes.string
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
    codeText: PropTypes.string
  },
  render() {
    return (
      <Playground
        className='overlay-example'
        lineNumbers={false}
        lang="js"
        theme="neo"
        scope={scope}
        codeText={this.props.codeText}
        collapsableCode
        babelConfig={{
          presets: ['es2015-loose', 'react', 'stage-0']
        }}
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
            <li><a href='#affixes'>Affixes</a></li>
            <li><a href='#root-close-wrapper'>RootCloseWrapper</a></li>
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
          <section>
            <h2 className='page-header'>
              <Anchor>Affixes</Anchor>
            </h2>
            <p dangerouslySetInnerHTML={{__html: AffixMetadata.Affix.descHtml }}/>
            <p dangerouslySetInnerHTML={{__html: AutoAffixMetadata.AutoAffix.descHtml }}/>
            <ExampleEditor codeText={AffixSource} />
            <PropTable
              component='Affix'
              metadata={AffixMetadata}
            />
            <PropTable
              component='AutoAffix'
              metadata={AutoAffixMetadata}
            />
          </section>
          <section>
            <h2 className='page-header'>
              <Anchor id='root-close-wrapper'>RootCloseWrapper</Anchor>
            </h2>
            <p dangerouslySetInnerHTML={{__html: RootCloseWrapperMetadata.RootCloseWrapper.descHtml }}/>
            <ExampleEditor codeText={RootCloseWrapperSource} />
            <PropTable
              component='RootCloseWrapper'
              metadata={RootCloseWrapperMetadata}
            />
          </section>
        </main>
      </div>
    );
  }
});

ReactDOM.render(<Example/>, document.getElementById('app-container'));
