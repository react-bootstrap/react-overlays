import { graphql } from 'gatsby';
import * as React from 'react';
import Anchor from '../components/Anchor';
import Page from '../components/Page';
import Playground from '../components/Playground';
import PropTable from '../components/PropTable';
import OverlaySource from '../examples/Overlay';

const propTypes = {};

function OverlayPage({ location, data: { OverlayMetadata } }) {
  return (
    <Page location={location}>
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
    </Page>
  );
}

OverlayPage.propTypes = propTypes;

export default OverlayPage;

export const pageQuery = graphql`
  query OverlayQuery {
    OverlayMetadata: componentMetadata(displayName: { eq: "Overlay" }) {
      ...PropTable_metadata
    }
  }
`;
