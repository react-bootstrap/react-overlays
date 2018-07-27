const React = require('react')

exports.onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents(
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/prism-themes@1.0.1/themes/prism-ghcolors.css"
      />
    </>
  )
}
