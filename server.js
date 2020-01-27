const { Server } = require('net');

const Request = require('./lib/request');
const {
  serveGuestPage,
  servePage,
  updateGuestPage,
  defaultResponse
} = require('./handlers');

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/guestBook.html')
    return serveGuestPage;
  if (req.method === 'GET') return servePage;
  if (req.method === 'POST' && req.url === '/guestBook.html')
    return updateGuestPage;
  return defaultResponse;
};

const handleRequest = function(socket) {
  const remote = { addr: socket.remoteAddress, port: socket.remotePort };
  console.log('connected with', remote);
  socket.setEncoding('utf8');
  socket.on('data', text => {
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
