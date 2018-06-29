const path = require('path')
const { rules } = require('webpack-atoms')

module.exports = {
  entry: path.resolve(__dirname, '../examples/App.js'),

  output: {
    path: path.resolve(__dirname, '../examples/static'),
    filename: 'bundle.js',
    publicPath: '/static/',
  },

  module: {
    rules: [
      rules.js(),
      rules.less(),
      rules.css()
    ],
  },

  resolve: {
    alias: {
      'react-overlays': path.resolve(__dirname, '../src'),
    },
  },
}
