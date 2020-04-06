const path = require('path');
const { resolver } = require('react-docgen');
const annotationResolver = require('react-docgen-annotation-resolver');

function combinedResolver(ast, recast) {
  const exportedComponents = resolver.findAllComponentDefinitions(ast, recast);
  const annotated = annotationResolver(ast, recast);
  return exportedComponents.concat(annotated);
}

module.exports = {
  pathPrefix: '/react-overlays',
  siteMetadata: {
    title: 'react-overlays Documentation',
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
        theming: 'none',
        sources: [path.resolve(__dirname, '../src')],

        ignore: (docNode) => {
          console.log(docNode.tags);
          return false;
        },

        getImportName(docNode, _) {
          return `import ${docNode.name} from '${docNode.packageName}/${docNode.name}'`;
        },

        exampleCodeScope: {
          Layout: require.resolve('@4c/layout'),
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
