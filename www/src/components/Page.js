import styled from 'astroturf';
import { Link } from 'gatsby';
import React from 'react';

const NavList = styled('ul')`
  composes: nav d-flex flex-column from global;

  position: sticky;
  top: 40px;
`;

function Page({ children }) {
  return (
    <div className="app d-flex">
      <article className="col-md-3">
        <NavList>
          <li className="nav-item">
            <Link className="nav-link" to="/modal" activeClassName="active">
              Modal
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/dropdown" activeClassName="active">
              Dropdown
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/overlay" activeClassName="active">
              Overlay
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              to="/use-root-close"
              activeClassName="active"
            >
              useRootClose
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              to="/use-popper"
              activeClassName="active"
            >
              usePopper
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/portal" activeClassName="active">
              Portal
            </Link>
          </li>
          <li className="nav-item">
            <Link
              className="nav-link"
              to="/transitions"
              activeClassName="active"
            >
              Transitions
            </Link>
          </li>
        </NavList>
      </article>
      <main className="col-md-9 pt-5">{children}</main>
    </div>
  );
}

export default Page;
