const http = require('http');

const {
  serveGuestPage,
  servePage,
  updateGuestPage,
  defaultResponse
} = require('./handlers');

const findHandler = req => {
  const handlers = {
    GET: {
      '/guestBook.html': serveGuestPage,
      other: servePage
    },
    POST: { '/updateComment': updateGuestPage }
  };
  const methodHandler = handlers[req.method];
  return methodHandler[req.url] || methodHandler.other || defaultResponse;
};

const requestListener = function(req, res) {
  console.log('Request: ', req.url, req.method);
  handler = findHandler(req);
  handler(req, res);
};

const main = (port = 3000) => {
  const server = new http.Server(requestListener);
  server.listen(port, () => console.log(`listening at :${port}`));
};

main(process.argv[2]);
