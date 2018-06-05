const Sql = require('sql-extra');
const ifct2017 = require('ifct2017');

const COLUMNS = ifct2017.columns.corpus;


function ansColumns(row) {
  var z = {};
  for(var k in row)
    z[k] = COLUMNS.get();
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
