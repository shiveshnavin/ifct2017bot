function sql(db, txt) {
  return db.query(txt).then((ans) => ans.rows||[]);
};
module.exports = sql;
