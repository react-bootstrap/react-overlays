import { graphql } from 'gatsby';
import * as React from 'react';
import Anchor from '../components/Anchor';
import HookDocumentation from '../components/HookDocumentation';
import Page from '../components/Page';

const propTypes = {};

function UsePopperPage({ location, data: { usePopperDocs } }) {
  return (
    <Page location={location}>
      <h2 className="page-header">
        <Anchor id="use-popper">usePopper</Anchor>
      </h2>
      <p
        dangerouslySetInnerHTML={{
          __html: usePopperDocs.description.childMarkdownRemark.html,
        }}
      />

      <HookDocumentation docs={usePopperDocs} />
    </Page>
  );
}

UsePopperPage.propTypes = propTypes;

export default UsePopperPage;

export const pageQuery = graphql`
  query usePopperQuery {
    usePopperDocs: documentationJs(name: { eq: "usePopper" }) {
      ...HookDocumentation_docs
    }
  }
`;
