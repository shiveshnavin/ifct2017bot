const data = require('./data');
const slang = require('pg-slang');


exports.sql = function (db, txt, opt={}) {
  return db.query(txt).then((ans) => data.transform(ans.rows||[], opt));
};
exports.slang = async function(db, txt, opt={}) {
  var sopt = {from: 'compositions_tsvector', limits: {compositions: 20, compositions_tsvector: 20}};
  var sql = await slang(txt, (txt, typ, hnt) => data.mapEntity(db, txt, typ, hnt), null, sopt);
  var ans = await exports.sql(db, sql, opt);
  return Object.assign({sql}, ans);
};
