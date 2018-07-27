const path = require('path')

exports.onCreateWebpackConfig = ({ actions, plugins, loaders }) => {
  actions.setWebpackConfig({
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
        'react-overlays$': path.resolve(__dirname, '../src/index.js'),
        'react-overlays/lib': path.resolve(__dirname, '../src'),
      },
    },
    plugins: [
      // See https://github.com/FormidableLabs/react-live/issues/5
      plugins.ignore(/^(xor|props)$/),
    ],
  })
}
