const fs = require('fs');
const { Server } = require('net');

const Request = require('./request');
const Response = require('./response');

const CONTENT_TYPES = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif'
};

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

const getContentAndType = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return ['text/html', getNoFoundResponse()];
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];
  const content = fs.readFileSync(path);
  return [contentType, content];
};

const serveHomePage = function(req) {
  const path = getPath(req.url);
  const [contentType, content] = getContentAndType(path);
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const loadTemplate = (templateFileName, comments) => {
  const content = fs.readFileSync(`./template/${templateFileName}`, 'utf8');
  const html = content.replace('__comments__', JSON.stringify(comments));
  return html;
};

const addComments = function(comments, body) {
  const newComments = {
    data: new Date(),
    name: body.name,
    comment: body.comment
  };
  comments.unshift(newComments);
  fs.writeFileSync('./comments.json', JSON.stringify(comments));
  return comments;
};

const updateGuestPage = function(req) {
  let comments = JSON.parse(fs.readFileSync('./comments.json', 'utf8'));
  comments = addComments(comments, req.body);
  const content = loadTemplate(req.url, comments);
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/guestBook.html')
    return serveGuestPage;
  if (req.method === 'GET') return serveHomePage;
  if (req.method === 'POST' && req.url === '/guestBook.html')
    return updateGuestPage;

  return () => new Response();
};

const handleRequest = function(socket) {
  const remote = { addr: socket.remoteAddress, port: socket.remotePort };
  console.log('connected with', remote);
  socket.setEncoding('utf8');
  socket.on('data', text => {
    console.log(text);
    const req = Request.parse(text);
    const handler = findHandler(req);
    const res = handler(req);
    res.writeTo(socket);
  });
};

const main = (port = 3000) => {
  const server = new Server();
  server.on('listening', () => console.log('server started', server.address()));
  server.on('connection', socket => handleRequest(socket));
  server.listen(port);
};

main();
