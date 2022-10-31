/* global Map Set */
require('array-extra');
const Sql = require('sql-extra');
const natural = require('natural');
const ifct2017 = require('ifct2017');

const IGNORE = /^(\W|a|an|the|i|he|him|she|her|they|their|as|at|are|if|in|is|it|of|on|to|by|want|well|that|than|then|thus|however|ok|okay)$/;
const COLUMN_ALL = new Set(['everyth', 'complet', 'wholli', 'whole', 'total', 'entir', 'fulli', 'full', 'all', '*']);
const COLUMN_VAL = new Set(['code', 'name', 'scie', 'lang', 'grup', 'regn', 'enerc', '*']);
const TABLE_COD = new Map([
  ['compositions_tsvector', 'compositions_tsvector'],
  ['composit', 'compositions_tsvector'],
  ['compon', 'compositions_tsvector'],
  ['nutrient', 'compositions_tsvector'],
  ['food', 'compositions_tsvector'],
  ['columns_tsvector', 'columns_tsvector'],
  ['column', 'columns_tsvector'],
  ['abbreviations_tsvector', 'abbreviations_tsvector'],
  ['abbrevi', 'abbreviations_tsvector'],
  ['acronym', 'abbreviations_tsvector'],
  ['compositingcentres_tsvector', 'compositingcentres_tsvector'],
  ['compositingcentr', 'compositingcentres_tsvector'],
  ['centr composit', 'compositingcentres_tsvector'],
  ['area composit', 'compositingcentres_tsvector'],
  ['frequencydistribution_tsvector', 'frequencydistribution_tsvector'],
  ['frequencydistribut', 'frequencydistribution_tsvector'],
  ['distribut frequenc', 'frequencydistribution_tsvector'],
  ['frequenc', 'frequencydistribution_tsvector'],
  ['distribut', 'frequencydistribution_tsvector'],
  ['groups_tsvector', 'groups_tsvector'],
  ['group', 'groups_tsvector'],
  ['methods_tsvector', 'methods_tsvector'],
  ['method', 'methods_tsvector'],
  ['analyt method', 'methods_tsvector'],
  ['analysi', 'methods_tsvector'],
  ['measur method', 'methods_tsvector'],
  ['measur', 'methods_tsvector'],
  ['regions_tsvector', 'regions_tsvector'],
  ['region', 'regions_tsvector'],
  ['samplingunits_tsvector', 'samplingunits_tsvector'],
  ['samplingunit', 'samplingunits_tsvector'],
  ['sampl unit', 'samplingunits_tsvector'],
  ['primari sampl unit', 'samplingunits_tsvector'],
]);
const MATCH_TYP = ['table', 'column', 'row'];
const EXCLUDE_DEF = /tags|tsvector/;
const ORDER_DEF = ['code', 'name', 'scie', 'lang', 'grup', 'regn', 'enerc', 'tsvector'];
const COLUMNS = ifct2017.columns.corpus;




function replaceColumn(txt) {
  txt = txt.replace(/^(^|.*\W)his(\W.*|$)$/gi, '$1_his$2');
  return txt.replace(/(^|.*\W)vitamin[^\w]+a(\W.*|$)/gi, '$1vitamin-a$2');
}

function mapTable(txt) {
  var stm = txt.split(' ').filter(v => !IGNORE.test(v)).map(natural.PorterStemmer.stem).sort().join(' ');
  if (TABLE_COD.has(stm)) return [TABLE_COD.get(stm)];
  return [`"tsvector" @@ plainto_tsquery('${txt}')`, 'compositions_tsvector'];
}

function mapColumn(db, txt, typ, hnt, frm) {
  var txt = replaceColumn(txt), cols = [];
  if (COLUMN_ALL.has(natural.PorterStemmer.stem(txt))) return Promise.resolve(['*']);
  if (!frm.includes('compositions_tsvector')) return [txt.toLowerCase()];
  var sql = 'SELECT "code" FROM "columns_tsvector" WHERE "tsvector" @@ plainto_tsquery($1)';
  if (hnt == null) sql += ' ORDER BY ts_rank("tsvector", plainto_tsquery($1), 0) DESC LIMIT 1';
  return db.query(sql, [txt]).then(ans => {
    for (var r of ans.rows || []) {
      cols.push(r.code);
      if (typ !== 'columns') continue;
      if (hnt != null && hnt !== 'all') continue;
      if (!COLUMN_VAL.has(r.code)) cols.push(r.code + '_e');
    }
    return cols;
  });
}

function mapRow(db, txt, typ, hnt, frm) {
  var sql = 'SELECT "code" FROM "compositions_tsvector" WHERE "tsvector" @@ plainto_tsquery($1)';
  if (hnt == null) sql += ' ORDER BY ts_rank("tsvector", plainto_tsquery($1), 0) DESC LIMIT 1';
  return db.query(sql, [txt]).then(ans => (ans.rows || []).map(v => v.code));
}

function mapEntity(db, txt, typ, hnt, frm) {
  if (typ === 'from') return mapTable(txt);
  else return mapColumn(db, txt, typ, hnt, frm);
}


function matchTable(wrds) {
  wrds = wrds.map(natural.PorterStemmer.stem);
  for (var i = wrds.length; i > 0; i--) {
    var txt = wrds.filter(v => !IGNORE.test(v)).sort().join(' ');
    if (TABLE_COD.has(txt)) return { value: TABLE_COD.get(txt), hint: TABLE_COD.get(txt), length: i };
  }
  return null;
}

function matchColumn(db, wrds) {
  var sql = '', par = [];
  for (var i = wrds.length, p = 1; i > 0; i--, p++) {
    sql += `SELECT "code", '${i}'::INT AS i FROM "columns_tsvector" WHERE "tsvector" @@ plainto_tsquery($${p}) UNION ALL `;
    par.push(replaceColumn(wrds.slice(0, i).join(' ')));
  }
  sql = sql.substring(0, sql.length - 11);
  return db.query(sql, par).then((ans) => {
    var col = COLUMN_ALL.has(natural.PorterStemmer.stem(wrds[0])) ? '*' : null, ncol = col ? 1 : 0;
    if (ans.rowCount > 0 && ans.rows[0].i > ncol) return { value: ans.rows[0].code, hint: 'compositions_tsvector', length: ans.rows[0].i };
    return col ? { value: col, length: 1 } : null;
  });
}

function matchRow(db, wrds) {
  var sql = '', par = [];
  for (var i = wrds.length, p = 1; i > 0; i--, p++) {
    sql += `SELECT "code", '${i}'::INT AS i FROM "compositions_tsvector" WHERE "tsvector" @@ plainto_tsquery($${p}) UNION ALL `;
    par.push(wrds.slice(0, i).join(' '));
  }
  sql = sql.substring(0, sql.length - 11);
  return db.query(sql, par).then(ans => ans.rowCount > 0 ? { value: ans.rows[0].code, hint: 'compositions_tsvector', length: ans.rows[0].i } : null);
}

function matchEntity(db, wrds) {
  var rdy = [matchTable(wrds), matchColumn(db, wrds), matchRow(db, wrds)];
  return Promise.all(rdy).then(ans => {
    var l = ans.map(v => v ? v.length : 0);
    console.log(wrds, ans);
    var mi = l[1] > l[0] ? 1 : 0;
    mi = l[2] > l[mi] ? 2 : mi;
    console.log(wrds, l, mi);
    if (l[mi] === 0) return null;
    var value = wrds.slice(0, l[mi]).join(' '), hint = ans[mi].hint;
    return { type: MATCH_TYP[mi], value, hint, length: l[mi] };
  });
}


function exclude(rows, re = EXCLUDE_DEF) {
  for (var row of rows) {
    for (var k in row)
      if (re.test(k)) row[k] = 0;
  }
}

function orderBy(cols, by, pre = ORDER_DEF) {
  var tcols = {}, cmp = {}, ks = [], tks = null;
  for (var k in cols)
    if (!k.endsWith('_e') && !pre.includes(k)) ks.push(k);
  if (by === 'max') { for (var k of ks) cmp[k] = Math.max.apply(null, cols[k]); }
  else if (by === 'min') { for (var k of ks) cmp[k] = Math.min.apply(null, cols[k]); }
  else if (by === 'sum') { for (var k of ks) cmp[k] = Array.sum(cols[k]); }
  else if (by === 'range') { for (var k of ks) cmp[k] = Math.max.apply(null, cols[k]) - Math.min.apply(null, cols[k]); }
  else if (by === 'relrange') { for (var k of ks) { var max = Math.max.apply(null, cols[k]), min = Math.min.apply(null, cols); cmp[k] = max - min / max || 1; } }
  else if (by === 'error') { for (var k of ks) cmp[k] = Array.sum(cols[k + '_e']); }
  else if (by === 'name') tks = ks.sort();
  else tks = ks;
  tks = tks || ks.sort((a, b) => cmp[b] - cmp[a]);
  for (var k of pre)
    if (k in cols) tcols[k] = cols[k];
  for (var k of tks)
    tcols[k] = cols[k];
  for (var k in cols)
    tcols[k] = cols[k];
  return tcols;
}

function describe(rows) {
  var rows = rows || [];
  exclude(rows);
  return { rows };
}


async function setup(db) {
  var o = ifct2017;
  o.columns.load();
  var ans = await db.query(Sql.tableExists('compositions'));
  if (ans.rows[0].exists) return console.log(`DATA: already setup`);
  await db.query(o.abbreviations.sql()),
    await db.query(o.carbohydrates.sql()),
    await db.query(o.columns.sql()),
    await db.query(o.compositingCentres.sql()),
    await db.query(o.contents.sql()),
    await db.query(o.energies.sql()),
    await db.query(o.frequencyDistribution.sql()),
    await db.query(o.groups.sql()),
    await db.query(o.jonesFactors.sql()),
    await db.query(o.languages.sql()),
    await db.query(o.methods.sql()),
    await db.query(o.regions.sql()),
    await db.query(o.samplingUnits.sql()),
    o.codes.sql().then(ans => db.query(ans)),
    o.compositions.sql().then(ans => db.query(ans)),
    o.descriptions.sql().then(ans => db.query(ans)),
    console.log(`DATA: setup done`);
}

function data(db, txt, o = {}) {
  var tab = txt.replace(/[\'\"]/g, '$1$1');
  var qry = `SELECT * FROM "${tab}" WHERE TRUE`, par = [], i = 0;
  for (var k in o) {
    if (k.includes('"')) continue;
    qry += ` AND "${k}"=$${i + 1}`;
    par[i++] = o[k];
  }
  console.log('DATA:', qry, par);
  return db.query(qry, par).then(ans => ans.rows || []);
}

data.setup = setup;
data.describe = describe;
data.mapTable = mapTable;
data.mapColumn = mapColumn;
data.mapRow = mapRow;
data.mapEntity = mapEntity;
data.matchTable = matchTable;
data.matchColumn = matchColumn;
data.matchRow = matchRow;
data.matchEntity = matchEntity;
module.exports = data;
