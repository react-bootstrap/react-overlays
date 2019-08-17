import styled from 'astroturf';
import { graphql } from 'gatsby';
/* eslint-disable react/no-danger */
import PropTypes from 'prop-types';
import React from 'react';
import HookDocumentation from '../components/HookDocumentation';
import Playground from '../components/Playground';
import PropTable from '../components/PropTable';
import DropdownSource from '../examples/Dropdown';
import ModalExample from '../examples/Modal';
import OverlaySource from '../examples/Overlay';
import PortalSource from '../examples/Portal';
import TransitionSource from '../examples/Transition';
import useRootCloseSource from '../examples/useRootClose';

const NavList = styled('ul')`
  composes: nav d-flex flex-column from global;

  position: sticky;
  top: 40px;
`;

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
      useRootCloseDocs,
      usePopperDocs,
    } = this.props.data;

    return (
      <div className="app d-flex">
        <article className="col-md-3">
          <NavList>
            <li className="nav-item">
              <a className="nav-link" href="#portals">
                Portals
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#modals">
                Modals
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#dropdown">
                Dropdown
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#overlay">
                Overlay
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#root-close-wrapper">
                useRootClose
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#use-popper">
                usePopper
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#transitions">
                Transitions
              </a>
            </li>
          </NavList>
        </article>
        <main className="col-md-9">
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
              <Anchor id="root-close-wrapper">useRootClose</Anchor>
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: useRootCloseDocs.description.childMarkdownRemark.html,
              }}
            />
            <Playground codeText={useRootCloseSource} />
            <HookDocumentation docs={useRootCloseDocs} />
          </section>
          <section>
            <h2 className="page-header">
              <Anchor id="use-popper">usePopper</Anchor>
            </h2>
            <p
              dangerouslySetInnerHTML={{
                __html: usePopperDocs.description.childMarkdownRemark.html,
              }}
            />

            <HookDocumentation docs={usePopperDocs} />
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
    useRootCloseDocs: documentationJs(name: { eq: "useRootClose" }) {
      ...HookDocumentation_docs
    }
    usePopperDocs: documentationJs(name: { eq: "usePopper" }) {
      ...HookDocumentation_docs
    }
  }
`;
