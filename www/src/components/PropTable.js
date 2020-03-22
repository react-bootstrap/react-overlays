import { graphql } from 'gatsby';
import capitalize from 'lodash/capitalize';
import PropTypes from 'prop-types';
import React from 'react';

function cleanDocletValue(str) {
  return str.trim().replace(/^\{/, '').replace(/\}$/, '');
}
function getDisplayTypeName(typeName) {
  if (typeName === 'func') return 'function';
  if (typeName === 'bool') return 'boolean';

  return typeName;
}
function getTypeName(prop) {
  const type = prop.type || {};
  let name = getDisplayTypeName(type.name);
  let doclets = prop.doclets || {};
  if (name === 'custom') return cleanDocletValue(doclets.type || type.raw);
  return name;
}

export default class PropTable extends React.Component {
  static propTypes = {
    metadata: PropTypes.object.isRequired,
  };

  getType(prop, depth = 0) {
    let type = prop.type || {};
    let name = getDisplayTypeName(type.name);
    let doclets = prop.doclets || {};

    switch (name) {
      case 'object':
        return name;
      case 'union':
        return type.value.reduce((current, val, i, list) => {
          let item = this.getType({ type: val }, depth + 1);
          if (React.isValidElement(item)) {
            item = React.cloneElement(item, { key: i });
          }
          current = current.concat(item);

          return i === list.length - 1 ? current : current.concat(' | ');
        }, []);
      case 'array': {
        let child = this.getType({ type: type.value }, depth + 1);

        return (
          <span>
            {'array<'}
            {child}
            {'>'}
          </span>
        );
      }
      case 'enum':
        return this.renderEnum(type);
      case 'custom':
        return cleanDocletValue(doclets.type || type.raw);
      default:
        return (
          <span
            className="text-monospace"
            style={!depth ? { whiteSpace: 'pre' } : undefined}
          >
            {name}
          </span>
        );
    }
  }

  renderRows(propsData) {
    return propsData
      .filter(
        (prop) => prop.type && !prop.doclets.private && !prop.doclets.ignore,
      )
      .map((propData) => {
        const { name, description, doclets } = propData;
        let descHtml = description && description.childMarkdownRemark.html;

        let defaultValue = propData.defaultValue && propData.defaultValue.value;

        if (defaultValue) {
          if (getTypeName(propData) === 'elementType')
            defaultValue = `<${defaultValue.replace(/('|")/g, '')}>`;

          defaultValue = <code>{defaultValue}</code>;
        }

        return (
          <div key={name} className="prop-table-row">
            <h4 className="mt-4 mb-3 border-bottom">
              <span className="text-monospace">{name}</span>{' '}
              {this.renderRequiredBadge(propData)}
            </h4>
            <div className="prop-table-row-details">
              <strong>type</strong>
              <div>{this.getType(propData)}</div>

              {defaultValue && (
                <>
                  <strong>default</strong>
                  <div>{defaultValue}</div>
                </>
              )}
              <strong>description</strong>
              <div>
                {doclets.deprecated && (
                  <div className="mb-1">
                    <strong className="text-danger">
                      {`Deprecated: ${doclets.deprecated} `}
                    </strong>
                  </div>
                )}
                {this.renderControllableNote(propData, name)}
                <p dangerouslySetInnerHTML={{ __html: descHtml }} />
              </div>
            </div>
          </div>
        );
      });
  }

  renderControllableNote(prop, propName) {
    let controllable = prop.doclets.controllable;
    let isHandler = getDisplayTypeName(prop.type.name) === 'function';

    if (!controllable) {
      return false;
    }

    let text = isHandler ? (
      <span>
        controls <code>{controllable}</code>
      </span>
    ) : (
      <span>
        controlled by: <code>{controllable}</code>, initial prop:{' '}
        <code>{`default${capitalize(propName)}`}</code>
      </span>
    );

    return (
      <div className="mb-2">
        <small>
          <em className="text-info">
            {/* <Glyphicon glyph="info-sign" /> */}
            &nbsp;{text}
          </em>
        </small>
      </div>
    );
  }

  renderEnum(enumType) {
    const enumValues = enumType.value || [];

    if (!Array.isArray(enumValues)) return enumValues;

    const renderedEnumValues = [];
    enumValues.forEach(({ value }, i) => {
      if (i > 0) {
        renderedEnumValues.push(<span key={`${i}c`}> | </span>);
      }

      renderedEnumValues.push(<code key={i}>{value}</code>);
    });

    return <span>{renderedEnumValues}</span>;
  }

  renderRequiredBadge(prop) {
    if (!prop.required) {
      return null;
    }

    return <span className="badge badge-dark">required</span>;
  }

  render() {
    let propsData = this.props.metadata.props || [];

    if (!propsData.length) {
      return (
        <div className="text-muted mb-5">
          <em>There are no public props for this component.</em>
        </div>
      );
    }

    return <div className="mb-5">{this.renderRows(propsData)}</div>;
  }
}

export const metadataFragment = graphql`
  fragment Description_markdown on ComponentDescription {
    childMarkdownRemark {
      html
    }
  }
  fragment PropTable_metadata on ComponentMetadata {
    composes
    displayName
    description {
      ...Description_markdown
    }
    props {
      name
      doclets
      defaultValue {
        value
        computed
      }
      description {
        ...Description_markdown
      }
      required
      type {
        name
        value
        raw
      }
    }
  }
`;
