/* eslint-disable react/no-danger */
import PropTypes from 'prop-types';
import React from 'react';
import { graphql } from 'gatsby';
import PropTable from '../components/PropTable';
import Playground from '../components/Playground';

import ModalExample from '../examples/Modal';
import OverlaySource from '../examples/Overlay';
import DropdownSource from '../examples/Dropdown';
import PortalSource from '../examples/Portal';
import RootCloseWrapperSource from '../examples/RootCloseWrapper';
import TransitionSource from '../examples/Transition';

class Anchor extends React.Component {
  static propTypes = {
    id: PropTypes.string,
  };

  render() {
    let id =
      this.props.id || this.props.children.toLowerCase().replace(/\s+/gi, '_');

    return (
      <a id={id} href={`#${id}`} className="anchor">
        <span className="anchor-icon">#</span>
        {this.props.children}
      </a>
    );
  }
}

class Example extends React.Component {
  static propTypes = {
    data: PropTypes.object,
  };

  render() {
    const {
      ModalMetadata,
      PortalMetadata,
      OverlayMetadata,
      DropdownMetadata,
      DropdownMenuMetadata,
      DropdownToggleMetadata,
      RootCloseWrapperMetadata,
    } = this.props.data;

    return (
      <div className="app d-flex">
        <article className="side-panel">
          <ul className="list-unstyled">
            <li>
              <a href="#portals">Portals</a>
            </li>
            <li>
              <a href="#modals">Modals</a>
            </li>
            <li>
              <a href="#position">Position</a>
            </li>
            <li>
              <a href="#dropdown">Dropdown</a>
            </li>
            <li>
              <a href="#overlay">Overlay</a>
            </li>
            <li>
              <a href="#root-close-wrapper">RootCloseWrapper</a>
            </li>
            <li>
              <a href="#transitions">Transitions</a>
            </li>
          </ul>
        </article>
        <main className="col-md-10">
          <section>
            <h2 className="page-header">
              <Anchor>Portals</Anchor>
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: PortalMetadata.description.childMarkdownRemark.html,
              }}
            />
            <Playground codeText={PortalSource} />
            <PropTable component="Portal" metadata={PortalMetadata} />
          </section>
          <section>
            <h2 className="page-header">
              <Anchor>Modals</Anchor>
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: ModalMetadata.description.childMarkdownRemark.html,
              }}
            />
            <Playground codeText={ModalExample} />
            <PropTable component="Modal" metadata={ModalMetadata} />
          </section>
          <section>
            <h2 className="page-header">
              <Anchor>Overlay</Anchor>
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: OverlayMetadata.description.childMarkdownRemark.html,
              }}
            />
            <Playground codeText={OverlaySource} />
            <PropTable component="Overlay" metadata={OverlayMetadata} />
          </section>

          <section>
            <h2 className="page-header">
              <Anchor>Dropdown</Anchor>
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: DropdownMetadata.description.childMarkdownRemark.html,
              }}
            />
            <Playground codeText={DropdownSource} />
            <PropTable component="Dropdown" metadata={DropdownMetadata} />
            <PropTable
              title="Dropdown.Menu"
              component="ReactOverlaysDropdownMenu"
              metadata={DropdownMenuMetadata}
            />
            <PropTable
              title="Dropdown.Toggle"
              component="ReactOverlaysDropdownToggle"
              metadata={DropdownToggleMetadata}
            />
          </section>
          <section>
            <h2 className="page-header">
              <Anchor id="root-close-wrapper">RootCloseWrapper</Anchor>
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html:
                  RootCloseWrapperMetadata.description.childMarkdownRemark.html,
              }}
            />
            <Playground codeText={RootCloseWrapperSource} />
            <PropTable
              component="RootCloseWrapper"
              metadata={RootCloseWrapperMetadata}
            />
          </section>
          <section>
            <h2 className="page-header">
              <Anchor>Transitions</Anchor>
            </h2>
            <p>
              Animation of components is handled by <code>transition</code>{' '}
              props. If a component accepts a <code>transition</code> prop you
              can provide a{' '}
              <a href="https://github.com/reactjs/react-transition-group">
                react-transition-group@2.0.0
              </a>{' '}
              compatible
              <code>Transition</code> component and it will work.
            </p>

            <p>
              Feel free to use <code>CSSTransition</code> specifically, or roll
              your own like the below example.
            </p>

            <Playground codeText={TransitionSource} />
          </section>
        </main>
      </div>
    );
  }
}

export default Example;

export const pageQuery = graphql`
  query SiteQuery {
    ModalMetadata: componentMetadata(displayName: { eq: "Modal" }) {
      ...PropTable_metadata
    }
    OverlayMetadata: componentMetadata(displayName: { eq: "Overlay" }) {
      ...PropTable_metadata
    }
    DropdownMetadata: componentMetadata(
      displayName: { eq: "ReactOverlaysDropdown" }
    ) {
      ...PropTable_metadata
    }
    DropdownToggleMetadata: componentMetadata(
      displayName: { eq: "ReactOverlaysDropdownToggle" }
    ) {
      ...PropTable_metadata
    }
    DropdownMenuMetadata: componentMetadata(
      displayName: { eq: "ReactOverlaysDropdownMenu" }
    ) {
      ...PropTable_metadata
    }
    PortalMetadata: componentMetadata(displayName: { eq: "Portal" }) {
      ...PropTable_metadata
    }
    RootCloseWrapperMetadata: componentMetadata(
      displayName: { eq: "RootCloseWrapper" }
    ) {
      ...PropTable_metadata
    }
  }
`;
