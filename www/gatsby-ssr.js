const React = require('react');
require('./src/styles.less');

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents(
    <>
      <link
        rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossOrigin="anonymous"
      />
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
