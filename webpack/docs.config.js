const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, '../examples/App.js'),

  output: {
    path: path.resolve(__dirname, '../examples/static'),
    filename: 'bundle.js',
    publicPath: '/static/',
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        loader: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },

  resolve: {
    alias: {
      'react-overlays': path.resolve(__dirname, '../src')
    },
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
  ],
};
