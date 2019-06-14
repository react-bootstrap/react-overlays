import styled from 'astroturf';
import { graphql } from 'gatsby';
import React from 'react';

const Wrapper = styled('span')`
  &.block {
    display: block;
    margin-top: 20px;
  }

  &:before,
  &:after {
    color: #969584;
  }
  &:before {
    content: '{ ';
  }
  &:after {
    content: ' }';
  }
`;

const TypeComponent = ({ children }) => (
  <span className="token builtin">{children}</span>
);

const Punctuation = ({ children }) => (
  <span className="token punctuation">{children}</span>
);

const Operator = ({ children }) => (
  <span className="token operator">{children}</span>
);

const join = (arrayOfElements, joiner) =>
  arrayOfElements.reduce((acc, current, index) => {
    if (index > 0) {
      acc.push(
        React.cloneElement(joiner, {
          key: `joiner ${index}`,
        }),
      );
    }
    acc.push(current);

    return acc;
  }, []);

const TypeExpression = ({ type }) => {
  if (type.type === `NameExpression`) {
    return <TypeComponent>{type.name}</TypeComponent>;
  }
  if (type.type === `NullLiteral`) {
    return <TypeComponent>null</TypeComponent>;
  }
  if (type.type === `UndefinedLiteral`) {
    return <TypeComponent>undefined</TypeComponent>;
  }
  if (type.type === `UnionType`) {
    return (
      <>
        {join(
          type.elements.map((element, index) => (
            <TypeExpression key={`union element ${index}`} type={element} />
          )),
          <Operator> | </Operator>,
        )}
      </>
    );
  }
  if (type.type === `TypeApplication` && type.expression) {
    if (type.expression.name === `Array`) {
      return (
        <>
          <TypeExpression type={type.applications[0]} />
          <Operator>[]</Operator>
        </>
      );
    }
    return (
      <>
        <TypeExpression type={type.expression} />
        {`<`}
        <TypeExpression type={type.applications[0]} />
        {`>`}
      </>
    );
  }
  return null;
};

const FunctionSignature = ({ definition, block, ignoreParams }) => {
  const params = definition.params
    ? definition.params
        .filter(param => !ignoreParams.includes(param.name))
        .map((param, index) => (
          <React.Fragment key={param.name}>
            {index > 0 && <Punctuation>, </Punctuation>}
            {param.name}
            {param.type && (
              <>
                <Punctuation>{param.optional && '?'}:</Punctuation>{' '}
                <TypeExpression type={param.type} />
              </>
            )}
          </React.Fragment>
        ))
    : null;

  return (
    <Wrapper block={block}>
      <Punctuation>(</Punctuation>
      {params}
      <Punctuation>)</Punctuation> <Operator>=&gt;</Operator>{' '}
      {definition.returns && definition.returns.length ? (
        <TypeExpression type={definition.returns[0].type} />
      ) : (
        <TypeComponent>undefined</TypeComponent>
      )}
    </Wrapper>
  );
};

const isFunctionDef = (definition, recursive = true) =>
  (definition.params && definition.params.length > 0) ||
  (definition.returns && definition.returns.length > 0) ||
  (recursive &&
    definition.type &&
    definition.type.typeDef &&
    isFunctionDef(definition.type.typeDef, false));

const SignatureElement = ({
  definition,
  fallbackToName = false,
  block = false,
}) => {
  if (isFunctionDef(definition, false)) {
    return <FunctionSignature definition={definition} block={block} />;
  }

  if (definition.type && definition.type.typeDef) {
    return (
      <SignatureElement
        definition={definition.type.typeDef}
        fallbackToName
        block={block}
      />
    );
  }

  if (definition.type) {
    return (
      <Wrapper block={block}>
        <TypeExpression type={definition.type} />
      </Wrapper>
    );
  }

  if (fallbackToName && definition.name) {
    return (
      <Wrapper block={block}>
        <TypeComponent>{definition.name}</TypeComponent>
      </Wrapper>
    );
  }

  return null;
};

function renderParam(definition) {
  let titleElement = definition.name;

  if (titleElement) {
    titleElement = <code>{titleElement}</code>;
  }

  return (
    <li>
      <div className="prism-code">
        {titleElement}{' '}
        <SignatureElement
          definition={definition}
          block={isFunctionDef(definition)}
        />
      </div>
      {!!definition.childrenDocumentationJs.length && (
        <ul>{definition.childrenDocumentationJs.map(renderParam)}</ul>
      )}
    </li>
  );
}

function HookDocumentation({ docs }) {
  const { params } = docs;
  return (
    <section>
      <h3>Parameters</h3>
      <ul>{params.map(renderParam)}</ul>
    </section>
  );
}

export default HookDocumentation;

export const fragment = graphql`
  fragment description on DocumentationJSComponentDescription {
    childMarkdownRemark {
      html
    }
  }

  fragment paramsBase on DocumentationJs {
    id
    name
    type {
      type
      name
      elements
      params
      applications
    }
    description {
      ...description
    }
  }

  fragment params on DocumentationJs {
    ...paramsBase
    childrenDocumentationJs {
      ...paramsBase
      childrenDocumentationJs {
        ...paramsBase
      }
    }
  }

  fragment HookDocumentation_docs on DocumentationJs {
    id
    name
    kind
    description {
      ...description
    }
    params {
      ...params
    }
    returns {
      ...params
    }
  }
`;
