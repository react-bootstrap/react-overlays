const React = require('react');
require('./src/styles.css');

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents(
    <>
      <link
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"
        rel="stylesheet"
      />
    </>,
  );
};
