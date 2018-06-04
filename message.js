const path = require('path');
const fs = require('fs');

function read(txt, z=new Map()) {
  var regex = /\[*([^\[\]]+)\]\]\r?\n([\w\W]*?)\[\[/g;
  while(true) {
    var m = regex.exec(txt);
    if(m==null) break;
    var k = m[1], v = m[2].trim();
    if(!k.includes(':')) z.set(k, [v]);
    else z.set(k.replace(/:.*/, ''), v.split(k.match(/:(.*)/)[1]+'\n'));
  }
  return z;
};

function toRich(txt) {
  return txt.replace(/<.*?>/g, '').replace(/\r?\n/g, '<br/>');
};

const MAP = new Map();
read(fs.readFileSync('message.txt', 'utf8'), MAP);

function message(typ, obj={}) {
  typ += '.speech';
  if(!MAP.has(typ)) return null;
  var fmts = MAP.get(typ), fmt = fmts[Math.floor(Math.random()*fmts.length)];
  var txt = fmt.replace(/\${(\w+)}/g, (m, p1) => obj[p1]);
  return txt.replace(/\s*(%|&)\s*/g, (m, p1) => ({'%': ' percent ', '&': ' and '}[p1]));
};
message.toRich = toRich;
module.exports = message;
