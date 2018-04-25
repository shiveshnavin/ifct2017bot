const path = require('path');
const fs = require('fs');

function read(txt, z=new Map()) {
  var regex = /\[\[([\w:]+)\]\]\r?\n([\w\W]*?)\r?\n\r?\n\r?\n/g;
  while(true) {
    var m = regex.exec(txt);
    if(m==null) break;
    var k = m[1], v = m[2].trim();
    if(!k.endsWith(':')) z.set(k, [v]);
    else z.set(k.replace(/:.*/, ''), v.split(/\r?\n/g));
  }
  return z;
};

const MAP = new Map();
for(var f of fs.readdirSync('message'))
  read(fs.readFileSync(path.join('message', f), 'utf8'), MAP);

function message(typ, obj={}) {
  var fmts = MAP.get(typ), fmt = fmts[Math.floor(Math.random()*fmts.length)];
  var txt = fmt.replace(/\${(\w+)}/g, (m, p1) => obj[p1]);
  return txt.replace(/\s*(%|&)\s*/g, (m, p1) => ({'%': ' percent ', '&': ' and '}[p1]));
};
module.exports = message;
