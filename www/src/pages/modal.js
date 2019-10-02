import { graphql } from 'gatsby';
import React from 'react';
import Anchor from '../components/Anchor';
import Page from '../components/Page';
import Playground from '../components/Playground';
import PropTable from '../components/PropTable';
import ModalSource from '../examples/Modal';

const propTypes = {};

function ModalPage({ location, data: { ModalMetadata } }) {
  return (
    <Page location={location}>
      <h2 className="page-header">
        <Anchor>Modal</Anchor>
      </h2>
      <p
        dangerouslySetInnerHTML={{
          __html: ModalMetadata.description.childMarkdownRemark.html,
        }}
      />
      <Playground codeText={ModalSource} />
      <h3>Props</h3>
      <PropTable component="Modal" metadata={ModalMetadata} />
    </Page>
  );
}

ModalPage.propTypes = propTypes;

export default ModalPage;

export const pageQuery = graphql`
  query ModalQuery {
    ModalMetadata: componentMetadata(displayName: { eq: "Modal" }) {
      ...PropTable_metadata
    }
  }
`;
