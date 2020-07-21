const path = require('path');

module.exports = {
  pathPrefix: '/react-overlays',
  siteMetadata: {
    title: 'React Overlays',
    author: 'Jason Quense',
    browsers: [
      'last 4 Chrome versions',
      'last 4 Firefox versions',
      'last 2 Edge versions',
      'last 2 Safari versions',
    ],
  },
  plugins: [
    {
      resolve: '@docpocalypse/gatsby-theme',
      options: {
        sources: [path.resolve(__dirname, '../src')],

        getImportName(docNode, _) {
          return `import ${docNode.name} from '${docNode.packageName}/${docNode.fileName}'`;
        },

        propsLayout: 'list',
        tailwindConfig: require.resolve('./tailwind.config'),
        exampleCodeScope: {
          css: require.resolve('./src/css'),
          styled: '@emotion/styled',
          injectCss: require.resolve('./src/injectCss'),
          ReactDOM: 'react-dom',
        },
      },
    },
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-astroturf',
      options: { extension: '.module.scss' },
    },
  ],
};
