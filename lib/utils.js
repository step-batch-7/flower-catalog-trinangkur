const getNoFoundResponse = function() {
  return `<html>
  <head><title>Not Found</title></head>
  <body>
    <h1>404 FILE NOT FOUND</h1>
  </body>
</html>`;
};

const replaceSpecialChar = function(text) {
  text = text.replace(/%0D%0A/g, '\r\n');
  text = text.replace(/\+/g, ' ');
  text = text.replace(/%3F/g, '?');
  text = text.replace(/%2C/g, ',');
  return text;
};

const replaceHTMLChar = text => {
  return text.replace(/\r\n/g, '<br/>');
};

const formatComments = function(comments) {
  return comments.reduce(
    (text, comment) =>
      text +
      `<h3>${replaceHTMLChar(comment.name)}</h3>
      <p>commented on: ${comment.date.toLocaleString()}</p>
      <p class="comment">${replaceHTMLChar(comment.comment)}</p>`,
    ''
  );
};

module.exports = {
  getNoFoundResponse,
  replaceSpecialChar,
  formatComments
};
