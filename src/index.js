const http = require('http');

const message = process.env.SECRET_MESSAGE || 'World';

const requestHandler = (request, response) => {
  console.log('New request to: ' + request.url);
  response.end('Hello, ' + message + '!');
};

const server = http.createServer(requestHandler);

const port = process.env.PORT || 3000;
server.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err);
  }
  console.log(`Server is listening on ${port}`);
});