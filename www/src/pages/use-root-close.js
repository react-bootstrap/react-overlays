import { graphql } from 'gatsby';
import React from 'react';
import Anchor from '../components/Anchor';
import HookDocumentation from '../components/HookDocumentation';
import Page from '../components/Page';
import Playground from '../components/Playground';
import useRootCloseSource from '../examples/useRootClose';

const propTypes = {};

function UseRootClosePage({ location, data: { useRootCloseDocs } }) {
  return (
    <Page location={location}>
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
    </Page>
  );
}

UseRootClosePage.propTypes = propTypes;

export default UseRootClosePage;

export const pageQuery = graphql`
  query useRootCloseQuery {
    useRootCloseDocs: documentationJs(name: { eq: "useRootClose" }) {
      ...HookDocumentation_docs
    }
  }
`;
