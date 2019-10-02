import { graphql } from 'gatsby';
import React from 'react';
import Anchor from '../components/Anchor';
import Page from '../components/Page';
import Playground from '../components/Playground';
import PropTable from '../components/PropTable';
import DropdownSource from '../examples/Dropdown';

function DropdownPage({ location, data }) {
  const {
    DropdownMetadata,
    DropdownMenuMetadata,
    DropdownToggleMetadata,
  } = data;

  return (
    <Page location={location}>
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
    </Page>
  );
}

export default DropdownPage;

export const pageQuery = graphql`
  query DropdownQuery {
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
  }
`;
