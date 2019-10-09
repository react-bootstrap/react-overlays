import merge from 'lodash/merge';
import PropTypes from 'prop-types';
import React from 'react';
import Label from 'react-bootstrap/lib/Label';
import Table from 'react-bootstrap/lib/Table';

let cleanDocletValue = str => str.trim().replace(/^\{/, '').replace(/\}$/, '');

function getPropsData(componentData, metadata){
  let props = componentData.props || {};

  if (componentData.composes) {
    componentData.composes.forEach( other => {
      props = merge({}, getPropsData(metadata[other] || {}, metadata), props);

    });
  }

  if (componentData.mixins) {
    componentData.mixins.forEach( other => {
      if ( componentData.composes.indexOf(other) === -1) {
        props = merge({}, getPropsData(metadata[other] || {}, metadata), props);
      }
    });
  }

  return props;
}

class PropTable extends React.Component {
  static contextTypes = {
    metadata: PropTypes.object
  }

  UNSAFE_componentWillMount(){
    let componentData = this.props.metadata[this.props.component] || {};
    this.propsData = getPropsData(componentData, this.props.metadata);
  }

  render(){
    let propsData = this.propsData;
    if ( !Object.keys(propsData).length ){
      return <span/>;
    }

    let {component, metadata} = this.props;
    let composes = metadata[component].composes || [];

    return (
      <div>
        <h3>
          {component} Props
          { !!composes.length && [<br key='1'/>,
            <small key='2'>
              {'Also accepts the same props as: '}
              <em>
              { composes.reduce(
                  (arr, name) => arr.concat(<code>{`<${name}/>`}</code>, ' '), [])
              }
              </em>
            </small>
            ]
        }
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
          <tbody>
            { this._renderRows(propsData) }
          </tbody>
        </Table>
      </div>
    );
  }

  _renderRows = (propsData) => {

    return Object.keys(propsData)
      .sort()
      .filter(propName => propsData[propName].type && !propsData[propName].doclets.private )
      .map(propName => {
        let propData = propsData[propName];

        return (
          <tr key={propName} className='prop-table-row'>
            <td>
              {propName} {this.renderRequiredLabel(propData)}
            </td>
            <td>
              <div>{this.getType(propData)}</div>
            </td>
            <td>{propData.defaultValue}</td>

            <td>
              { propData.doclets.deprecated
                && <div><strong className='text-danger'>{'Deprecated: ' + propData.doclets.deprecated + ' '}</strong></div>
              }
              <div dangerouslySetInnerHTML={{__html: propData.descHtml }} />
            </td>
          </tr>
        );
      });
  }

  renderRequiredLabel(prop) {
    if (!prop.required) {
      return null;
    }

    return (
      <Label>required</Label>
    );
  }

  getType = (prop) => {
    const type = prop.type || {};
    const name = this.getDisplayTypeName(type.name);
    const doclets = prop.doclets || {};

    switch (name) {
      case 'object':
        return name;
      case 'union':
        return type.value.reduce((current, val, i, list) => {
          let item = this.getType({ type: val });
          if (React.isValidElement(item)) {
            item = React.cloneElement(item, {key: i});
          }
          current = current.concat(item);

          return i === (list.length - 1) ? current : current.concat(' | ');
        }, []);
      case 'array':
        return (
          <span>{'array<'}{this.getType({ type: type.value })}{'>'}</span>
        );
      case 'enum':
        return this.renderEnum(type);
      case 'custom':
        return cleanDocletValue(doclets.type || name);
      default:
        return name;
    }
  }

  getDisplayTypeName(typeName) {
    if (typeName === 'func') {
      return 'function';
    } else if (typeName === 'bool') {
      return 'boolean';
    } else {
      return typeName;
    }
  }

  renderEnum(enumType) {
    const enumValues = enumType.value || [];

    const renderedEnumValues = [];
    enumValues.forEach(function renderEnumValue(enumValue, i) {
      if (i > 0) {
        renderedEnumValues.push(
          <span key={`${i}c`}>, </span>
        );
      }

      renderedEnumValues.push(
        <code key={i}>{enumValue}</code>
      );
    });

    return (
      <span>one of: {renderedEnumValues}</span>
    );
  }
}



export default PropTable;
