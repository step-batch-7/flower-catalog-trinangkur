const fs = require('fs');
const querystring = require('querystring');

const CONTENT_TYPES = require('./lib/mimeTypes');
const App = require('./lib/app');
const {
  getNoFoundResponse,
  replaceSpecialChar,
  formatComments
} = require('./lib/utils');

const getPath = function(url) {
  if (url === '/') {
    return `${__dirname}/public/index.html`;
  }
  return `${__dirname}/public/${url}`;
};

const doesFileExist = function(path) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
};

const getContentType = function(path) {
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  return CONTENT_TYPES[extension];
};

const servePage = function(req, res, next) {
  const path = getPath(req.url);
  if (!doesFileExist(path)) {
    next();
    return;
  }
  const content = fs.readFileSync(path);
  const contentType = getContentType(path);
  res.setHeader('Content-Type', contentType);
  res.end(content);
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

const addComments = function(comments, reqBody) {
  const newComments = {
    date: new Date(),
    name: replaceSpecialChar(reqBody.name),
    comment: replaceSpecialChar(reqBody.comment)
  };
  comments.unshift(newComments);
  fs.writeFileSync('./comments.json', JSON.stringify(comments, null, 2));
};

const serveGuestPage = function(req, res) {
  let comments = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
  comments = parseDate(comments);
  const replacer = formatComments(comments);
  const content = loadTemplate(req.url, replacer);
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.end(content);
};

const updateGuestPage = function(req, res) {
  const comments = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
  addComments(comments, querystring.parse(req.body));
  res.writeHead(303, { location: 'guestBook.html' });
  res.end();
};

const serveNotFound = (req, res) => {
  res.writeHead(404);
  res.end(getNoFoundResponse());
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const methodNotAllowed = function(req, res) {
  res.writeHead(400);
  res.end();
};

const app = new App();

app.use(readBody);
app.get('/guestBook.html', serveGuestPage);
app.get('', servePage);
app.post('/updateComment', updateGuestPage);
app.get('', serveNotFound);
app.post('', serveNotFound);
app.use(methodNotAllowed);

const requestListener = function(req, res) {
  app.serve(req, res);
};

module.exports = { requestListener };
