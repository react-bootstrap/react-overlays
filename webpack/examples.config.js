const path = require('path');

const docsConfig = require('./docs.config');

module.exports = {
  ...docsConfig,

  devtool: 'module-source-map',

  devServer: {
    contentBase: path.resolve(__dirname, '../examples'),
    stats: { colors: true },
  },
}

