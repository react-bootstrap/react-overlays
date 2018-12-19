const path = require('path');

module.exports = {
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
      resolve: 'gatsby-source-filesystem',
      options: {
        path: path.resolve(__dirname, '../src'),
        name: 'source',
      },
    },
    'gatsby-plugin-emotion',
    'gatsby-plugin-less',
    'gatsby-transformer-react-docgen',
    'gatsby-transformer-remark',
  ],
};
