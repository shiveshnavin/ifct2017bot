/* global Map Set */
require('number-extra');
const Sql = require('sql-extra');
const ifct2017 = require('ifct2017');

const COLUMNS = ifct2017.columns.corpus;
const COLUMN_NAM = new Map([
  ['abbr', 'Abbreviation'],
  ['desc', 'Description'],
  ['kj', 'kJ'],
  ['kcal', 'kcal'],
]);
const EXCLUDE_DEF = /lang|tags|tsvector/;
const ORDER_DEF = ['code', 'name', 'scie', 'lang', 'grup', 'regn', 'enerc', 'tsvector'];
const TYPE_DEF = new Map([
  ['code', 'TEXT'],
  ['name', 'TEXT'],
  ['scie', 'TEXT'],
  ['lang', 'TEXT'],
  ['grup', 'TEXT'],
  ['regn', 'INT'],
  ['tsvector', 'TSVECTOR'],
  ['hydrolysis', 'INT'],
  ['states', 'INT'],
  ['districts', 'INT'],
  ['selected', 'INT'],
  ['sampled', 'INT'],
  ['samples', 'INT'],
  ['entries', 'INT'],
  ['kj', 'INT'],
  ['kcal', 'INT'],
]);
const UNIT_DEF = new Map([
  ['enerc', 'kcal'],
]);
const UNIT_SYM = new Map([
  [0, 'g'],
  [3, 'mg'],
  [6, 'ug'],
  [9, 'ng'],
]);


function toBase(rows) {
  var cols = {};
  for(var k in rows[0])
    cols[k] = rows.map(row => row[k]);
  return cols;
};

function getFactor(col) {
  var max = Math.max.apply(null, col);
  return Math.min(-Math.floor(Math.log10(max+1e-10)/3)*3, 9);
};
function applyFactor(col, fac) {
  for(var i=0, I=col.length; i<I; i++)
    col[i] = Number.round(col[i]*fac);
};

function getMeta(cols) {
  var meta = {};
  for(var k in cols) {
    if(k.endsWith('_e')) continue;
    var name = COLUMNS.get(k)||COLUMN_NAM.get(k)||k[0].toUpperCase()+k.substring(1);
    var type = typeof cols[k][0]==='string'? 'TEXT':TYPE_DEF.get(k)||'REAL';
    var factor = type==='REAL' && k+'_e' in cols? getFactor(cols[k]):0;
    var unit = type==='REAL' && k+'_e' in cols? UNIT_SYM.get(factor):UNIT_DEF.get(k)||null;
    meta[k] = {name, type, factor, unit};
  }
  return meta;
};
function applyMeta(cols, meta) {
  for(var k in cols) {
    if(k.endsWith('_e')) continue;
    if(meta[k].factor===0) continue;
    if(typeof cols[k][0]==='string') continue;
    if(typeof cols[k][0]==='number') applyFactor(cols[k], meta.factor);
    else { for(var vals of cols[k]) applyFactor(vals, meta.factor); }
  }
};

function exclude(cols, re=EXCLUDE_DEF) {
  var tcols = {};
  for(var k in cols)
    if(!re.test(k)) tcols[k] = cols[k];
  return tcols;
};

function orderBy(cols, by, pre=ORDER_DEF) {
  var tcols = {}, ks = [];
  for(var k in cols)
    if(!pre.includes(k)) ks.push(k);
  ks = ks.sort();
  for(var k of pre)
    tcols[k] = cols[k];
  for(var k of ks)
    tcols[k] = cols[k];
  return tcols;
};


function toValueMode(cols) {
  var tcols = {};
  for(var k in cols) {
    var tk = k.replace(/_e$/, '');
    var i = k.endsWith('_e')? 1:0;
    tcols[tk] = tcols[tk]||[];
    tcols[tk][i] = cols[k];
  }
  return tcols;
};
function toRangeMode(cols) {
  var tcols = {};
  for(var k in cols) {
    if(k.endsWith('_e')) continue;
    if(!(k+'_e' in cols)) { tcols[k] = [cols[k]]; continue; }
    var val = cols[k], err = cols[k+'_e'], bgn = val, end = err;
    for(var i=0, I=val.length; i<I; i++) {
      var v = val[i], e = err[i];
      bgn[i] = v-e; end[i] = v+e;
    }
    tcols[k] = [bgn, end];
  }
  return tcols;
};
function toTextMode(cols, meta) {
  var tcols = {};
  for(var k in cols) {
    if(k.endsWith('_e')) continue;
    var col = cols[k], cole = cols[k+'_e']||null, unit = meta[k].unit;
    for(var i=0, I=col.length, txt=new Array(I); i<I; i++) {
      var t = col[i].toString();
      if(cole!=null && cole[i]>0) t += `±${cole[i]}`;
      if(unit!=null) t += ` ${unit}`
      txt[i] = t;
    }
    tcols[k] = txt;
  }
  return tcols;
};

function transform(rows, opt={}) {
  if(opt.mode==='raw') return {data: rows};
  var cols = exclude(toBase(rows));
  var meta = getMeta(cols);
  if(opt.mode==='value') {
    var data = toValueMode(cols);
    applyMeta(data, meta);
    return {meta, data};
  }
  else if(opt.mode==='range') {
    var data = toRangeMode(cols);
    applyMeta(data, meta);
    return {meta, data};
  }
  else {
    var data = toTextMode(cols, meta);
    return {meta, data};
  }
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

function data(db, txt, opt={}) {
  var tab = txt.replace(/[\'\"]/g, '$1$1');
  return db.query(`SELECT * FROM "${tab}";`).then(ans => transform(ans.rows||[], opt));
};
data.setup = setup;
data.transform = transform;
module.exports = data;
