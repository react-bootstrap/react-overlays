import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import config from '../webpack/examples.config';

const server = new WebpackDevServer(webpack(config), {
  contentBase: 'examples',
  publicPath: '/static/',
  hot: true,
  quiet: false,
  progress: true,
  stats: {
    colors: true
  }
});

server.listen(3000, 'localhost', err => {
  /* eslint-disable no-console */
  if (err) {
    console.error(err);
  }

  console.log('Listening at localhost:3000');
  /* eslint-enable no-console */
});
