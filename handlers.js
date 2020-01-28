const fs = require('fs');
const Response = require('./lib/response');
const querystring = require('querystring');

const CONTENT_TYPES = require('./lib/mimeTypes');

const getPath = function(url) {
  if (url === '/') return `${__dirname}/public/index.html`;
  return `${__dirname}/public/${url}`;
};

const getNoFoundResponse = function() {
  return `<html>
  <head><title>Not Found</title></head>
  <body>
    <h1>404 FILE NOT FOUND</h1>
  </body>
</html>`;
};

const getContentAndCode = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return [getNoFoundResponse(), 404];
  const content = fs.readFileSync(path);
  return [content, 200];
};

const getContentType = function(path) {
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  return CONTENT_TYPES[extension];
};

const servePage = function(req, res) {
  const path = getPath(req.url);
  const [content, code] = getContentAndCode(path);
  const contentType = getContentType(path);
  res.writeHead(code, { 'Content-Type': contentType || '*/*' });
  res.end(content);
  return res;
};

const loadTemplate = (templateFileName, replacer) => {
  const content = fs.readFileSync(`./template/${templateFileName}`, 'utf8');
  const html = content.replace('__comments__', replacer);
  return html;
};

const parseDate = comments => {
  comments.map(comment => {
    comment.date = new Date(comment.date).toLocaleString();
    return comment;
  });
  return comments;
};

const replaceSpecialChar = function(text) {
  text = text.replace(/%0D%0A/g, '\r\n');
  text = text.replace(/\+/g, ' ');
  text = text.replace(/%3F/g, '?');
  text = text.replace(/%2C/g, ',');
  return text;
};

const addComments = function(comments, reqBody) {
  const newComments = {
    date: new Date(),
    name: replaceSpecialChar(reqBody.name),
    comment: replaceSpecialChar(reqBody.comment)
  };
  comments.unshift(newComments);
  fs.writeFileSync('./comments.json', JSON.stringify(comments, null, 2));
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

const serveGuestPage = function(req, res) {
  let comments = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
  comments = parseDate(comments);
  let replacer = formatComments(comments);
  const content = loadTemplate(req.url, replacer);
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.end(content);
};

const updateGuestPage = function(req, res) {
  let data = '';
  const comments = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    addComments(comments, querystring.parse(data));
    res.writeHead(303, { location: 'guestBook.html' });
    res.end();
  });
};

const defaultResponse = (res, req) => {
  req.writeHead(400);
  req.end('unhandled method');
};
module.exports = {
  serveGuestPage,
  servePage,
  updateGuestPage,
  defaultResponse
};
