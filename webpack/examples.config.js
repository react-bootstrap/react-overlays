var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    path.join(__dirname, '../examples/App.js')
  ],
  output: {
    path: path.join(__dirname, '../examples/'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    alias: {
      'react-overlays': path.join(__dirname, '..', 'src')
    },
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      { test: /\.less/, loader: 'style-loader!css-loader!less-loader', exclude: /node_modules/ },
      { test: /\.js$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ }
    ]
  }
};
