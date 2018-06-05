/* global Map Set */
require('number-extra');
const Sql = require('sql-extra');
const ifct2017 = require('ifct2017');

const COLUMNS = ifct2017.columns.corpus;
const EXCLUDE_DEF = ['lang', 'tags', 'tsvector'];
const ORDER_DEF = ['code', 'name', 'scie', 'lang', 'grup', 'regn', 'enerc', 'tsvector'];
const TYPE_DEF = new Map([
  ['code', 'TEXT'],
  ['name', 'TEXT'],
  ['scie', 'TEXT'],
  ['lang', 'TEXT'],
  ['grup', 'TEXT'],
  ['regn', 'INT'],
  ['tsvector', 'TSVECTOR'],
]);
const UNIT_DEF = new Map([
  ['enerc', 'kcal'],
]);
const UNIT_MAP = new Map([
  [0, 'g'],
  [3, 'mg'],
  [6, 'ug'],
  [9, 'ng'],
]);


function colFactor(col) {
  var max = Math.max.apply(null, col);
  return Math.min(-Math.floor(Math.log10(max+1e-10)/3)*3, 9);
};

function ansMeta(rs) {
  var z = {};
  if(rs.length===0) return z;
  for(var k in rs[0]) {
    if(k.endsWith('_e')) continue;
    z[k] = {name: COLUMNS.get(k), type: TYPE_DEF.get(k)||'REAL'};
  }
  return z;
};

function ansColumns(rs) {
  var z = {};
  if(rs.length===0) return z;
  for(var k in rs[0])
    z[k] = rs.map(r => r[k]);
  return z;
};

async function setup(db) {
  var o = ifct2017;
  var ans = await db.query(Sql.tableExists('compositions'));
  if(ans.rows[0].exists) return console.log(`DATA: already setup`);
  await Promise.all([
    db.query(o.abbreviations.sql()),
    db.query(o.carbohydrates.sql()),
    db.query(o.columns.sql()),
    db.query(o.compositingCentres.sql()),
    db.query(o.contents.sql()),
    db.query(o.energies.sql()),
    db.query(o.frequencyDistribution.sql()),
    db.query(o.groups.sql()),
    db.query(o.jonesFactors.sql()),
    db.query(o.languages.sql()),
    db.query(o.methods.sql()),
    db.query(o.regions.sql()),
    db.query(o.samplingUnits.sql()),
    o.codes.sql().then(ans => db.query(ans)),
    o.compositions.sql().then(ans => db.query(ans)),
    o.descriptions.sql().then(ans => db.query(ans)),
  ]);
  console.log(`DATA: setup done`);
};

function data(db, txt) {
  var tab = txt.replace(/[\'\"]/g, '$1$1');
  return db.query(`SELECT * FROM "${tab}";`).then(ans => ans.rows||[]);
};
data.setup = setup;
module.exports = data;
