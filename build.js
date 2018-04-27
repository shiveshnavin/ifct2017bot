const path = require('path');
const fs = require('fs');
const os = require('os');

function replace(txt) {
  var z = [], mat = txt.match(/{(\w+)}/);
  if(mat==null || !entities.has(mat[1])) return [txt];
  for(val of entities.get(mat[1])) {
    var rtxt = txt.replace(/{\w+}/, val);
    var atxt = replace(rtxt);
    z.push.apply(z, atxt);
  }
  return z;
};

var entities = new Map();
for(var fil of fs.readdirSync('entities')) {
  var nam = fil.replace('.txt', '');
  var data = fs.readFileSync(path.join('entities', fil), 'utf8');
  var values = data.trim().split(/\r?\n/g);
  entities.set(nam, values);
}

for(var fil of fs.readdirSync('intents')) {
  if(!fil.endsWith('.txt')) continue;
  var nam = fil.replace('.txt', '');
  var data = fs.readFileSync(path.join('intents', fil), 'utf8');
  var values = data.trim().split(/\r?\n/g), txts = [];
  for(val of values) {
    txts.push.apply(txts, replace(val));
  }
  fs.writeFileSync(path.join('intents', nam+'.json'), JSON.stringify(txts, null, 2));
}
