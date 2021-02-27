const slang = require('pg-slang');
const english = require('pg-english');
const data = require('./data');

const COLUMN_DEF = ['"code"', '"name"', '"scie"', '"lang"', '"grup"'];




exports.sql = function (db, txt) {
  console.log(`SQL: ${txt}`);
  return db.query(txt).then(ans => data.describe(ans.rows));
};

exports.slang = async function(db, txt) {
  console.log(`SLANG: ${txt}`);
  var sopt = {from: 'compositions_tsvector', limits: {compositions: 50, compositions_tsvector: 50}};
  var sql = await slang(txt, (txt, typ, hnt, frm) => data.mapEntity(db, txt, typ, hnt, frm), null, sopt);
  try {
    var ans = await exports.sql(db, sql);
    return Object.assign({sql}, ans);
  }
  catch(e) { throw Object.assign(e, {sql}); }
};

exports.english = async function(db, txt) {
  console.log(`ENGLISH: ${txt}`);
  var eopt = {table: 'compositions', columns: {compositions_tsvector: COLUMN_DEF}};
  var slang = await english(txt, (wrds) => data.matchEntity(db, wrds), null, eopt);
  try {
    var ans = await exports.slang(db, slang);
    return Object.assign({slang}, ans);
  }
  catch(e) { throw Object.assign(e, {slang}); }
};
