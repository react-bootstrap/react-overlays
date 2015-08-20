var metadata = require('react-component-metadata');
var marked = require('marked');
var fs = require('fs');

marked.setOptions({
  xhtml: true
});


// removes doclet syntax from comments
var cleanDoclets = function (desc) {
  var idx = desc.indexOf('@');
  return (idx === -1 ? desc : desc.substr(0, idx )).trim();
};
var cleanDocletValue = function (str) {
  return str.trim().replace(/^\{/, '').replace(/\}$/, '');
};
var isLiteral = function (str) {
  return (/^('|")/).test(str.trim());
};

/**
 * parse out description doclets to an object and remove the comment
 *
 * @param  {ComponentMetadata|PropMetadata} obj
 */
function parseDoclets(obj){
  obj.doclets = metadata.parseDoclets(obj.desc || '') || {};
  obj.desc = cleanDoclets(obj.desc || '');
  obj.descHtml = marked(obj.desc || '');
}

/**
 * Reads the JSDoc "doclets" and applies certain ones to the prop type data
 * This allows us to "fix" parsing errors, or unparsable data with JSDoc style comments
 *
 * @param  {Object} props     Object Hash of the prop metadata
 * @param  {String} propName
 */
function applyPropDoclets(props, propName){
  var prop = props[propName];
  var doclets = prop.doclets;
  var value;

  // the @type doclet to provide a prop type
  // Also allows enums (oneOf) if string literals are provided
  // ex: @type {("optionA"|"optionB")}
  if (doclets.type) {
    value = cleanDocletValue(doclets.type);
    prop.type.name = value;

    if ( value[0] === '(' ) {
      value = value.substring(1, value.length - 1).split('|');

      prop.type.value = value;
      prop.type.name = value.every(isLiteral) ? 'enum' : 'union';
    }
  }

  // Use @required to mark a prop as required
  // useful for custom propTypes where there isn't a `.isRequired` addon
  if ( doclets.required) {
    prop.required = true;
  }
}

var metaDataLoader = function(){};

metaDataLoader.pitch = function (remainingRequest) {
  var callback = this.async();

  fs.readFile(this.resourcePath, 'utf-8', function (err, content) {
    if (err) { return callback(err); }

    var components = metadata(content, { mixins: true });

    Object.keys(components).forEach(function (key) {
      var component = components[key];

      parseDoclets(component);

      Object.keys(component.props).forEach(function (propName) {
        var prop = component.props[propName];

        parseDoclets(prop);
        applyPropDoclets(component.props, propName);
      });
    });

    callback(null, 'module.exports = ' + JSON.stringify(components));
  });
};

module.exports = metaDataLoader;
