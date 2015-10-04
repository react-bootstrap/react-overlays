'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _domHelpersOwnerWindow = require('dom-helpers/ownerWindow');

var _domHelpersOwnerWindow2 = _interopRequireDefault(_domHelpersOwnerWindow);

exports['default'] = function (componentOrElement) {
  return _domHelpersOwnerWindow2['default'](_react2['default'].findDOMNode(componentOrElement));
};

module.exports = exports['default'];