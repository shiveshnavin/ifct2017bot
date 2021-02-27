async function setup(db) {
  console.log(`QUERY: setting up ...`);
  await db.query(`CREATE TABLE IF NOT EXISTS "query" ("text" TEXT, "score" INT)`);
}

async function save(db, text) {
  console.log(`QUERY: saving "${text}"`);
  var res = await db.query(`SELECT * FROM "query" WHERE text=$1`, [text]);
  var score = res.rows.length > 0? res.rows[0].score + 10 : 10;
  if (score == 10) await db.query(`INSERT INTO "query" (text, score) VALUES ($1, $2)`, [text, score]);
  else await db.query(`UPDATE "query" SET score=$2 WHERE text=$1`, [text, score]);
  return [{text, score}];
}

async function search(db, text) {
  console.log(`QUERY: searching "${text}"`);
  var exp = text.split(/\W+/g).join('|');
  await db.query(`UPDATE "query" SET "score"="score"+1 WHERE text SIMILAR TO '%(${exp})%'`);
  var res = await db.query(`SELECT * FROM "query" WHERE text SIMILAR TO '%(${exp})%' ORDER BY "score" DESC LIMIT 25`);
  return res.rows;
}

module.exports = {setup, save, search};
