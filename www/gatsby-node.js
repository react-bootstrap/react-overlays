const path = require('path');

exports.onCreateWebpackConfig = ({ actions, plugins, loaders, getConfig }) => {
  actions.setWebpackConfig({
    // devtool: 'source-map',
    module: {
      rules: [
        {
          test: /src\/examples\//,
          use: loaders.raw(),
        },
      ],
    },
    resolve: {
      alias: {
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react-overlays$': path.resolve(__dirname, '../src/index.js'),
        'react-overlays/lib': path.resolve(__dirname, '../src'),
      },
    },
    plugins: [
      // See https://github.com/FormidableLabs/react-live/issues/5
      plugins.ignore(/^(xor|props)$/),
    ],
    node: {
      // Mock Node.js modules that Babel require()s but that we don't
      // particularly care about.
      fs: 'empty',
      module: 'empty',
      net: 'empty',
    },
  });

  getConfig().resolve.modules = ['node_modules'];
};

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelOptions({
    options: {
      babelrc: true,
      envName: 'docs',
      root: path.resolve(__dirname, '../'),
    },
  });
};
