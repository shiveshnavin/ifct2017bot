const Sql = require('sql-extra');
const awsContext = require('aws-lambda-mock-context');
const alexaVerifier = require('alexa-verifier');
const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const pgconfig = require('pg-connection-string');
const https = require('https');
const http = require('http');
const query = require('./intent');
const alexa = require('./alexa');
const dialogflow = require('./dialogflow');
const ifct2017 = require('ifct2017');

const E = process.env;
const X = express();
var dburl = E.DATABASE_URL;
var server = http.createServer(X);
var db = new pg.Pool(pgconfig(dburl+(dburl.includes('localhost:')? '':'?ssl=true')));


async function setupData() {
  console.log(`DATA: becoming a fast reader`);
  var ans = await db.query(Sql.tableExists('compositions'));
  if(ans.rows[0].exists) return;
  console.log(`DATA: starting from scratch`);
  return Promise.all([
    db.query(ifct2017.abbreviations.sql()),
    db.query(ifct2017.carbohydrates.sql()),
    db.query(ifct2017.columns.sql()),
    db.query(ifct2017.compositingCentres.sql()),
    db.query(ifct2017.contents.sql()),
    db.query(ifct2017.energies.sql()),
    db.query(ifct2017.frequencyDistribution.sql()),
    db.query(ifct2017.groups.sql()),
    db.query(ifct2017.jonesFactors.sql()),
    db.query(ifct2017.languages.sql()),
    db.query(ifct2017.methods.sql()),
    db.query(ifct2017.regions.sql()),
    db.query(ifct2017.samplingUnits.sql()),
    ifct2017.codes.sql().then(ans => db.query(ans)),
    ifct2017.compositions.sql().then(ans => db.query(ans)),
    ifct2017.descriptions.sql().then(ans => db.query(ans)),
  ]);
};


X.use(bodyParser.json());
X.use(bodyParser.urlencoded({extended: true}));
X.all('/dialogflow', (req, res) => {
  dialogflow(req.body).then((ans) => res.json(ans));
});
X.all('/alexa', (req, res) => {
  var h = req.headers;
  alexaVerifier(h.signaturecertchainurl, h.signature, JSON.stringify(req.body), (err) => {
    if(err) return res.status(400).send();
    var ctx = awsContext();
    alexa.handler(req.body, ctx);
    ctx.Promise.then((ans) => res.json(ans));
  });
});
X.all('/slack/install', (req, res) => {
  res.redirect(`https://slack.com/oauth/authorize?client_id=${E.SLACK_CLIENT_ID}&scope=${E.SLACK_SCOPE}`);
});
X.use(express.static('assets', {extensions:['html']}));


server.listen(E.PORT||80, () => {
  var addr = server.address();
  console.log(`SERVER: listening on channel ${addr.port}`);
});
setupData().then(() => console.log(`DATA: over construction`));
