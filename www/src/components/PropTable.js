import PropTypes from 'prop-types'
import React from 'react'
import { graphql } from 'gatsby'
import Label from 'react-bootstrap/lib/Label'
import Table from 'react-bootstrap/lib/Table'

let cleanDocletValue = str =>
  str
    .trim()
    .replace(/^\{/, '')
    .replace(/\}$/, '')

class PropTable extends React.Component {
  static contextTypes = {
    metadata: PropTypes.object,
  }

  render() {
    let { component, metadata } = this.props
    let propsData = metadata.props || []

    if (!propsData.length) {
      return (
        <div className="text-muted">
          <em>There are no public props for this component.</em>
        </div>
      )
    }

    let composes = metadata.composes || []

    return (
      <div>
        <h3>
          {this.props.title || component} Props
          {!!composes.length && [
            <br key="1" />,
            <small key="2">
              {'Also accepts the same props as: '}
              <em>
                {composes.reduce(
                  (arr, name) =>
                    arr.concat(<code>{`<${name.slice(2)}/>`}</code>, ' '),
                  []
                )}
              </em>
            </small>,
          ]}
        </h3>

        <Table bordered striped className="prop-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>{this._renderRows(propsData)}</tbody>
        </Table>
      </div>
    )
  }

  _renderRows = propsData => {
    return propsData
      .filter(prop => prop.type && !prop.doclets.private)
      .map(propData => {
        const { name, description, doclets, defaultValue } = propData
        let descHtml = description && description.childMarkdownRemark.html

        return (
          <tr key={name} className="prop-table-row">
            <td>
              {name} {this.renderRequiredLabel(propData)}
            </td>
            <td>
              <div>{this.getType(propData)}</div>
            </td>
            <td>{defaultValue && defaultValue.value}</td>

            <td>
              {doclets.deprecated && (
                <div>
                  <strong className="text-danger">
                    {'Deprecated: ' + propData.doclets.deprecated + ' '}
                  </strong>
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: descHtml }} />
            </td>
          </tr>
        )
      })
  }

  renderRequiredLabel(prop) {
    if (!prop.required) return null
    return <Label>required</Label>
  }

  getType(prop) {
    let type = prop.type || {}
    let name = this.getDisplayTypeName(type.name)
    let doclets = prop.doclets || {}

    switch (name) {
      case 'object':
        return name
      case 'union':
        return type.value.reduce((current, val, i, list) => {
          let item = this.getType({ type: val })
          if (React.isValidElement(item)) {
            item = React.cloneElement(item, { key: i })
          }
          current = current.concat(item)

          return i === list.length - 1 ? current : current.concat(' | ')
        }, [])
      case 'array': {
        let child = this.getType({ type: type.value })

        return (
          <span>
            {'array<'}
            {child}
            {'>'}
          </span>
        )
      }
      case 'enum':
        return this.renderEnum(type)
      case 'custom':
        return cleanDocletValue(doclets.type || type.raw)
      default:
        return name
    }
  }

  getDisplayTypeName(typeName) {
    if (typeName === 'func') {
      return 'function'
    } else if (typeName === 'bool') {
      return 'boolean'
    } else {
      return typeName
    }
  }

  renderEnum(enumType) {
    const enumValues = enumType.value || []
    if (!Array.isArray(enumValues)) {
      return <span>one of: {enumValues}</span>
    }
    const renderedEnumValues = []
    enumValues.forEach(function renderEnumValue(enumValue, i) {
      if (i > 0) {
        renderedEnumValues.push(<span key={`${i}c`}>, </span>)
      }

      renderedEnumValues.push(<code key={i}>{enumValue.value}</code>)
    })

    return <span>one of: {renderedEnumValues}</span>
  }
}

export default PropTable

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
`
