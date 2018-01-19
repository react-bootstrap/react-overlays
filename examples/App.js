import Playground from '@monastic.panic/component-playground/Playground';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import Button from 'react-bootstrap/lib/Button';
import Transition, { ENTERED, ENTERING }
  from 'react-transition-group/Transition';
  import {TransitionMotion, spring, presets } from 'react-motion';

import PropTable from './PropTable';

import AffixSource from '../webpack/example-loader!./Affix';
import ModalExample from '../webpack/example-loader!./Modal';
import OverlaySource from '../webpack/example-loader!./Overlay';
import PortalSource from '../webpack/example-loader!./Portal';
import PositionSource from '../webpack/example-loader!./Position';
import RootCloseWrapperSource from '../webpack/example-loader!./RootCloseWrapper';
import TransitionSource from '../webpack/example-loader!./Transition';
import TransitionModelSource from '../webpack/example-loader!./TransitionModel';

import AffixMetadata from 'component-metadata-loader?pitch!react-overlays/Affix';
import AutoAffixMetadata from 'component-metadata-loader?pitch!react-overlays/AutoAffix';
import ModalMetadata from 'component-metadata-loader?pitch!react-overlays/Modal';
import OverlayMetadata from 'component-metadata-loader?pitch!react-overlays/Overlay';
import PortalMetadata from 'component-metadata-loader?pitch!react-overlays/Portal';
import PositionMetadata from 'component-metadata-loader?pitch!react-overlays/Position';
import RootCloseWrapperMetadata from 'component-metadata-loader?pitch!react-overlays/RootCloseWrapper';

import * as ReactOverlays from 'react-overlays';
import getOffset from 'dom-helpers/query/offset';

import './styles.less';
import injectCss from './injectCss';

const scope = {
  React, ReactDOM, findDOMNode, Button, injectCss, ...ReactOverlays, getOffset,
  Transition, ENTERED, ENTERING, TransitionMotion, spring, presets,
};

class Anchor extends React.Component {
  static propTypes = {
    id: PropTypes.string
  };

  render() {
    let id = this.props.id || this.props.children.toLowerCase().replace(/\s+/gi, '_');

    return (
      <a id={id} href={'#' + id} className='anchor'>
        <span className='anchor-icon'>#</span>
        {this.props.children}
      </a>
    );
  }
}

class ExampleEditor extends React.Component {
  static propTypes = {
    codeText: PropTypes.string
  };

  render() {
    return (
      <Playground
        className='overlay-example'
        lineNumbers={false}
        lang="js"
        theme="neo"
        scope={scope}
        code={this.props.codeText}
        collapsable
        babelConfig={{
          presets: ['es2015-loose', 'react', 'stage-0']
        }}
      />
    );
  }
}

class Example extends React.Component {

  render() {

    return (
      <div className='app row'>
        <article className='side-panel col-md-2'>
          <ul className='list-unstyled'>
            <li><a href='#portals'>Portals</a></li>
            <li><a href='#modals'>Modals</a></li>
            <li><a href='#position'>Position</a></li>
            <li><a href='#overlay'>Overlay</a></li>
            <li><a href='#affixes'>Affixes</a></li>
            <li><a href='#root-close-wrapper'>RootCloseWrapper</a></li>
            <li><a href='#transitions'>Transitions</a></li>
            <li><a href='#transitions-motion'>Transitions Using Motion</a></li>
          </ul>
        </article>
        <main className='col-md-10'>
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
          <section >
            <h2 className='page-header'>
              <Anchor>Transitions</Anchor>
            </h2>
            <p>
              Animation of components is handled by <code>transition</code> props.
              If a component accepts a <code>transition</code> prop you can provide
              a <a href="https://github.com/reactjs/react-transition-group">react-transition-group@2.0.0</a> compatible
              <code>Transition</code> component and it will work.
            </p>

            <p>
              Feel free to use <code>CSSTransition</code> specifically, or roll your own like the below example.
            </p>

            <ExampleEditor codeText={TransitionSource} />
          </section>
          <section >
            <h2 className='page-header'>
              <Anchor id='transitions-motion'>Transition Model using React Motion</Anchor>
            </h2>
            <p>
              Animation of components is handled by <code>transition</code> props.
              If a component accepts a <code>transition</code> prop you can provide
              a <a href="https://github.com/reactjs/react-transition-group">react-transition-group@2.0.0</a> compatible
              <code>Transition Motion</code> component and it will work.
            </p>

            <p>
              Feel free to use <code>CSSTransition</code> specifically, or roll your own like the below example.
            </p>

            <ExampleEditor codeText={TransitionModelSource} />
          </section>
        </main>
      </div>
    );
  }
}

ReactDOM.render(<Example/>, document.getElementById('app-container'));
