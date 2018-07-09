export const imports = {
  'docs/Dropdown.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-dropdown" */ 'docs/Dropdown.mdx'),
}
