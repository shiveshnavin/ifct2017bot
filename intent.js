const about = require('@ifct2017/about');
const message = require('./message');
const nlp = require('./nlp');


function query(int, par) {
  if(int==='query_about') return about(par.about);
};
module.exports = query;
