const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const E = process.env;
const X = express();
var server = http.createServer(X);


X.use(bodyParser.json());
X.use(express.static('assets', {extensions: ['html']}));


server.listen(E.PORT||80, () => {
  var addr = server.address();
  console.log(`SERVER: ready at port ${addr.port}`);
});
