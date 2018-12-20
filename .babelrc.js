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
    api.env() !== 'esm' && 'add-module-exports',
  ].filter(Boolean),

  env: {
    test: {
      plugins: ['istanbul'],
    },
  },
})
