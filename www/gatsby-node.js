const path = require('path');

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    devtool: 'source-map',
    resolve: {
      symlinks: false,
      alias: {
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react-overlays': path.resolve(__dirname, '../src'),
      },
    },
  });
};

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelOptions({
    options: {
      babelrc: true,
      envName: 'docs',
    },
  });
};
