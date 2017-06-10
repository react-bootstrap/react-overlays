const path = require('path');

const docsConfig = require('./docs.config');

module.exports = Object.assign(
  {},
  docsConfig,
  {
    plugins: [],

    devtool: 'module-source-map',

    devServer: {
      contentBase: path.resolve(__dirname, '../examples'),
      stats: { colors: true },
    },
  },
);
