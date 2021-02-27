const Sql = require('sql-extra');


function textSanitize(x) {
  return x.split(/\W+/g).join(' ').toLowerCase();
}

async function setup(db) {
  var ans = await db.query(Sql.tableExists('query'));
  var cmd = Sql.setupTable('query', {text: 'TEXT', score: 'INT'}, [
    {text: 'show food with high protein', score: 10},
    {text: 'show food with high vitamin d', score: 10}],
    {pk: 'text', index: true, tsvector: {text: 'A'}});
  if(ans.rows[0].exists) return console.log(`QUERY: already setup`);
  await db.query(cmd);
  console.log(`QUERY: setup done`);
}

async function save(db, text) {
  text = textSanitize(text);
  console.log(`QUERY: saving "${text}"`);
  var res = await db.query(`SELECT * FROM "query" WHERE text=$1`, [text]);
  var score = res.rows.length > 0? res.rows[0].score + 10 : 10;
  if (score == 10) await db.query(`INSERT INTO "query" (text, score) VALUES ($1, $2)`, [text, score]);
  else await db.query(`UPDATE "query" SET score=$2 WHERE text=$1`, [text, score]);
  return [{text, score}];
}

async function search(db, text) {
  text = textSanitize(text);
  console.log(`QUERY: searching "${text}"`);
  var exp = text.split(' ').map(w => `"text" SIMILAR TO '%(${w})%'`).join(' AND ');
  await db.query(`UPDATE "query" SET "score"="score"+1 WHERE ${exp}`);
  var exp = text.split(' ').join('|');
  var res = await db.query(`SELECT * FROM "query" WHERE "text" SIMILAR TO '%(${exp})%'`);
  return res.rows;
}


//async function search(db, text) {
//  text = textSanitize(text);
//  console.log(`QUERY: searching "${text}"`);
//  var exp = text.split(' ').map(w => `"text" SIMILAR TO '%(${w})%'`).join(' AND ');
//  await db.query(`UPDATE "query" SET "score"="score"+1 WHERE ${exp}`);
//  var exp = text.split(' ').join(' | ');
//  var cmd = Sql.selectTsquery('query_tsvector', exp, '"tsvector"', {order: true, limit: 25, normalization: 2});
//  cmd = cmd.replace(/plainto_tsquery/g, 'to_tsquery').replace(/( DESC LIMIT)/, ', "score"$1');
//  var res = await db.query(cmd);
//  console.log(cmd, res.rows);
//  return res.rows;
//}

module.exports = {setup, save, search};
