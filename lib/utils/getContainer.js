'use strict';

exports.__esModule = true;
exports['default'] = getContainer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function getContainer(container, defaultContainer) {
  container = typeof container === 'function' ? container() : container;
  return _react2['default'].findDOMNode(container) || defaultContainer;
}

module.exports = exports['default'];