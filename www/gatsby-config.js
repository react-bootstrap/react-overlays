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
    'gatsby-transformer-documentationjs',
    'gatsby-plugin-sorted-assets',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: path.resolve(__dirname, '../src'),
        name: 'source',
      },
    },
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-astroturf',
      options: { extension: '.module.scss' },
    },
    {
      resolve: 'gatsby-transformer-react-docgen',
      options: {
        resolver: combinedResolver,
      },
    },
    'gatsby-transformer-remark',
  ],
};
