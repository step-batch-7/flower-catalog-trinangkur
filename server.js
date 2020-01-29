const http = require('http');

const { app } = require('./handlers');

const requestListener = function(req, res) {
  app.serve(req, res);
};

const main = (port = 3000) => {
  const server = new http.Server(requestListener);
  server.listen(port, () => console.log(`listening at :${port}`));
};

main(process.argv[2]);
