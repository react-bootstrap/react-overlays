import SideNavigation from '@docpocalypse/gatsby-theme/src/components/SideNavigation';
import { useStaticQuery, graphql } from 'gatsby';
import sortBy from 'lodash/sortBy';
import React from 'react';
import groupBy from 'lodash/groupBy';

export default function DocSideNavigation({ className }) {
  const { api } = useStaticQuery(graphql`
    query {
      api: allDocpocalypse {
        nodes {
          name
          tags {
            name
            value
          }
        }
      }
    }
  `);

  const members = groupBy(
    api.nodes,
    (doc) => doc.tags.find((t) => t.name === 'memberOf')?.value || 'none',
  );

  return (
    <SideNavigation.Panel className={className}>
      <nav>
        <ul>
          <SideNavigation.Item>
            <SideNavigation.Link to="/">Getting Started</SideNavigation.Link>
            <SideNavigation.Link to="/transitions">
              Animation
            </SideNavigation.Link>
          </SideNavigation.Item>

          <SideNavigation.Item>
            <SideNavigation.Header>API</SideNavigation.Header>
            <ul className="mb-4">
              {sortBy(api.nodes, 'name')
                .filter((n) => !n.tags.find((t) => t.name === 'memberOf'))
                .map((doc) => (
                  <SideNavigation.Item key={doc.name}>
                    <SideNavigation.Link to={`/api/${doc.name}`}>
                      {doc.name}
                    </SideNavigation.Link>

                    {members[doc.name] && (
                      <ul>
                        {sortBy(members[doc.name], 'name').map((sub) => (
                          <SideNavigation.Item key={sub.name}>
                            <SideNavigation.Link to={`/api/${sub.name}`}>
                              {sub.name}
                            </SideNavigation.Link>
                          </SideNavigation.Item>
                        ))}
                      </ul>
                    )}
                  </SideNavigation.Item>
                ))}
            </ul>
          </SideNavigation.Item>
        </ul>
      </nav>
    </SideNavigation.Panel>
  );
}
