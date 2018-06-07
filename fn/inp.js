const slang = require('pg-slang');
const english = require('pg-english');
const data = require('./data');


exports.sql = function (db, txt, opt={}) {
  console.log(`SQL: ${txt}`);
  return db.query(txt).then((ans) => data.transform(ans.rows||[], opt));
};
exports.slang = async function(db, txt, opt={}) {
  console.log(`SLANG: ${txt}`);
  var sopt = {from: 'compositions_tsvector', limits: {compositions: 20, compositions_tsvector: 20}};
  var sql = await slang(txt, (txt, typ, hnt, frm) => data.mapEntity(db, txt, typ, hnt, frm), null, sopt);
  var ans = await exports.sql(db, sql, opt);
  return Object.assign({sql}, ans);
};
exports.english = async function(db, txt, opt={}) {
  console.log(`ENGLISH: ${txt}`);
  var eopt = {table: 'compositions', columns: ['"name"']};
  var slang = await english(txt, (wrds) => data.matchEntity(db, wrds), null, eopt);
  var ans = await exports.slang(db, slang, opt);
  return Object.assign({slang}, ans);
};
