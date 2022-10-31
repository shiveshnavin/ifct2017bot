const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const ifct2017 = require('ifct2017');
const data = require('./fn/data');
const inp = require('./fn/inp');
const query = require('./fn/query');

const E = process.env;
var app = express();
var server = http.createServer(app);
var db = new pg.Pool({
  connectionString: E.DATABASE_URL, keepAlive: true,
  connectionTimeoutMillis: 10000,
  max: 4,
  log: console.log,
  maxUses: 4
});
var dq = new pg.Pool({
  connectionString: E.DATABASE_QUERY_URL, keepAlive: true,
  connectionTimeoutMillis: 10000,
  max: 4,
  log: console.log,
  maxUses: 4
});

function enableCors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') res.send(200);
  else next();
};

app.use(enableCors);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('/fn/data/:txt', (req, res, next) => data(db, req.params.txt, req.query).then(ans => res.json(ans), next));
app.all('/fn/sql/:txt', (req, res, next) => inp.sql(db, req.params.txt).then(ans => res.json(ans), next));
app.all('/fn/slang/:txt', (req, res, next) => inp.slang(db, req.params.txt).then(ans => res.json(ans), next));
app.all('/fn/english/:txt', (req, res, next) => inp.english(db, req.params.txt).then(ans => res.json(ans), next));
app.all('/fn/query/search/', (req, res, next) => query.search(dq, '').then(ans => res.json(ans), next));
app.all('/fn/query/search/:txt', (req, res, next) => query.search(dq, req.params.txt).then(ans => res.json(ans), next));
app.all('/fn/query/save/:txt', (req, res, next) => query.save(dq, req.params.txt).then(ans => res.json(ans), next));
app.all('/', (req, res, next) => {
  res.send('Working')
});

app.use(express.static('assets', { extensions: ['html'] }));
app.use((err, req, res, next) => {
  var { message } = err;
  res.status(500).json(Object.assign({ message }, err));
  console.error(err);
});


server.listen(E.PORT || 80, () => {
  var { port } = server.address();
  console.log(`SERVER: ready at port ${port}`);
});
data.setup(db);
query.setup(dq);
