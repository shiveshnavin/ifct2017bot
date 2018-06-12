var ACCESS_TOKEN = 'a81e31683f1b41e39df0a3a23dbe9e58';

var form = $('form');
var query = $('#query');
var card = $('card');
var ahead = $('#ahead');
var aslang = $('#aslang');
var asql = $('#asql');
var abody = $('#abody');
var atable = $('#atable');
var datatable = null;
// var client = new ApiAi.ApiAiClient({accessToken: ACCESS_TOKEN});


function round(num) {
  return Math.round(num*1e+12)/1e+12;
};
function applyFactor(rows, k, fac) {
  var mul = 10**fac;
  for(var row of rows)
    row[k] = round(row[k]*mul);
};
function applyMeta(rows, meta) {
  var row = rows[0];
  if(row==null) return;
  for(var k in row) {
    var tk = k.replace(/_e$/, '');
    // if(meta[tk].factor===0) continue;
    if(typeof row[k]==='string') continue;
    applyFactor(rows, k, meta[tk].factor);
  }
};

function tableColumns(rows, meta) {
  var cols = [];
  for(var k in rows[0]) {
    if(k.endsWith('_e')) continue;
    cols.push({title: meta[k].name, data: {_: k+'_t', sort: k}});
  }
  return cols;
};
function tableRows(rows, meta) {
  for(var row of rows) {
    for(var k in row) {
      if(k.endsWith('_e')) continue;
      var v = row[k].toString(), ke = k+'_e';
      if(row[ke]) v += '±'+row[ke];
      if(meta[k].unit) v += ' '+meta[k].unit;
      row[k+'_t'] = v;
    }
  }
  return rows;
};
function drawTable(data) {
  if(datatable!=null) { datatable.destroy(); atable.empty(); }
  if(data.rows.length===0) return;
  datatable = atable.DataTable({
    columns: tableColumns(data.rows, data.meta),
    data: tableRows(data.rows, data.meta),
    aaSorting: [], retrieve: true
  });
};

form.submit(function() {
  var txt = query.val();
  console.log(txt);
  $.getJSON('/fn/english/'+txt, function(data) {
    applyMeta(data.rows, data.meta);
    console.log(data);
    drawTable(data);
    ahead.text(txt);
    aslang.text(data.slang);
    asql.text(data.sql);
    card.removeAttr('style');
  });
  return false;
});

form.onnothing = function() {
  var txt = query.value;
  client.textRequest(txt).then(function(res) {
    query.value = '';
    var qry = res.result.resolvedQuery;
    var ans = res.result.fulfillment.speech;
    var sph = new SpeechSynthesisUtterance(ans);
    card.removeAttribute('style');
    ahead.textContent = qry;
    abody.innerHTML = ans.replace(/\n/g, '<br>');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(sph);
    window.speechSynthesis.resume();
  }).catch(function() {
    card.removeAttribute('style');
    ahead.textContent = 'ERROR!';
    abody.innerHTML = 'Failed to connect to service.';
  });
  return false;
};
//if(window.location.search==='?install_success=1') {
//  var section = document.getElementById('install_success');
//  section.removeAttribute('style');
//}
