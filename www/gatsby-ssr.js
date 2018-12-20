const React = require('react');

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents(
    <>
      <link
        key="1"
        href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        key="2"
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"
        rel="stylesheet"
      />
      <link
        key="3"
        rel="stylesheet"
        href="https://unpkg.com/prism-themes@1.0.1/themes/prism-ghcolors.css"
      />
    </>,
  );
};
