const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const ifct2017 = require('ifct2017');
const http = require('http');
const data = require('./fn/data');
const inp = require('./fn/inp');

const E = process.env;
const X = express();
var server = http.createServer(X);
var db = new pg.Pool({connectionString: E.DATABASE_URL+'?ssl=true'});


X.use(bodyParser.json());
X.use(bodyParser.urlencoded({extended: true}));
X.all('/fn/data/:txt', (req, res, next) => data(db, req.params.txt, req.query).then(ans => res.json(ans), next));
X.all('/fn/sql/:txt', (req, res, next) => inp.sql(db, req.params.txt).then(ans => res.json(ans), next));
X.all('/fn/slang/:txt', (req, res, next) => inp.slang(db, req.params.txt).then(ans => res.json(ans), next));
X.all('/fn/english/:txt', (req, res, next) => inp.english(db, req.params.txt).then(ans => res.json(ans), next));
X.use(express.static('assets', {extensions: ['html']}));


server.listen(E.PORT||80, () => {
  var addr = server.address();
  console.log(`SERVER: ready at port ${addr.port}`);
});
data.setup(db);
