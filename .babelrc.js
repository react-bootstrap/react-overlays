module.exports = (api) => ({
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
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-runtime', { useESModules: api.env() === 'esm' }],
    api.env() !== 'esm' && 'add-module-exports',
  ].filter(Boolean),

  env: {
    test: {
      plugins: ['istanbul'],
    },
  },
});
