const { rules, plugins } = require('webpack-atoms');

module.exports = (config) => {
  const { env } = process;

  config.set({
    frameworks: ['mocha', 'webpack', 'sinon-chai'],

    files: ['test/index.js'],

    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap'],
    },

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            ...rules.js(),
            test: /\.[jt]sx?$/,
          },
        ],
      },
      resolve: {
        symlinks: false,
        extensions: ['.mjs', '.js', '.ts', '.tsx', '.json'],
        fallback: {
          util: require.resolve('util/'),
          // for Enzyme/Cheerio
          stream: require.resolve('stream-browserify'),
        },
      },
      plugins: [
        plugins.define({
          'process.env.NODE_ENV': JSON.stringify('test'),
          __DEV__: true,
        }),
      ],
      devtool: 'inline-cheap-module-source-map',
    },

    reporters: ['mocha', 'coverage'],

    mochaReporter: {
      output: 'autowatch',
    },

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage',
    },

    customLaunchers: {
      ChromeCi: {
        base: 'Chrome',
        flags: ['--no-sandbox'],
      },
    },

    browsers: env.BROWSER ? env.BROWSER.split(',') : ['Chrome'],
  });
};
