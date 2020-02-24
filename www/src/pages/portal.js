import { graphql } from 'gatsby';
import * as React from 'react';
import Anchor from '../components/Anchor';
import Page from '../components/Page';
import Playground from '../components/Playground';
import PropTable from '../components/PropTable';
import PortalSource from '../examples/Portal';

const propTypes = {};

function PortalPage({ location, data: { PortalMetadata } }) {
  return (
    <Page location={location}>
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
    </Page>
  );
}

PortalPage.propTypes = propTypes;

export default PortalPage;

export const pageQuery = graphql`
  query PortalQuery {
    PortalMetadata: componentMetadata(displayName: { eq: "Portal" }) {
      ...PropTable_metadata
    }
  }
`;
