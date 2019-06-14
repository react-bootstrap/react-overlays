const React = require('react');
require('./src/styles.scss');

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents(
    <>
      <link
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/prism-themes@1.0.1/themes/prism-ghcolors.css"
      />
    </>,
  );
};
