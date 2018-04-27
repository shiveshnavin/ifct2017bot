const csv = require('csv');
const fs = require('fs');

function addAll(set, txt) {
  for(var wrd of txt.toLowerCase().split(/\W+/g))
    if(wrd) set.add(wrd);
};

var set = new Set();
var stream = fs.createReadStream('index.csv').pipe(csv.parse({columns: true, comment: '#'}));
stream.on('data', (r) => {
  addAll(set, r.code);
  addAll(set, r.name);
  addAll(set, r.scie);
  addAll(set, r.desc);
});
stream.on('end', () => {
  var z = '';
  for(var wrd of set)
    z += `"${wrd}","${wrd}"\n`;
  fs.writeFileSync('tags.txt', z);
});
