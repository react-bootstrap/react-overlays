import React from 'react';
import Anchor from '../components/Anchor';
import Page from '../components/Page';
import Playground from '../components/Playground';
import TransitionSource from '../examples/Transition';

const propTypes = {};

function ModalPage({ location }) {
  return (
    <Page location={location}>
      <h2 className="page-header">
        <Anchor>Transitions</Anchor>
      </h2>
      <p>
        Animation of components is handled by <code>transition</code> props. If
        a component accepts a <code>transition</code> prop you can provide a{' '}
        <a href="https://github.com/reactjs/react-transition-group">
          react-transition-group@2.0.0
        </a>{' '}
        compatible
        <code>Transition</code> component and it will work.
      </p>

      <p>
        Feel free to use <code>CSSTransition</code> specifically, or roll your
        own like the below example.
      </p>

      <Playground codeText={TransitionSource} />
    </Page>
  );
}

ModalPage.propTypes = propTypes;

export default ModalPage;
