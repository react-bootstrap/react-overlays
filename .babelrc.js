module.exports = api => ({
  presets: [
    [
      '@babel/env',
      {
        loose: true,
        modules: api.env() === 'esm' ? false : 'commonjs',
        targets: {
          browsers: ['last 4 versions', 'not ie <= 8'],
        },
      },
    ],
    '@babel/react',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    'add-module-exports',
  ],

  env: {
    test: {
      plugins: ['istanbul'],
    },
  },
})
