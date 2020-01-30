const http = require('http');

const { requestListener } = require('./handlers');

const main = (port = 3000) => {
  const server = new http.Server(requestListener);
  server.listen(port, () => console.log(`listening at :${port}`));
};

main(process.argv[2]);
