/* global Highcharts */
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
var highcharts = null;
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
function drawTable(rows, meta) {
  if(rows.length===0) return;
  var keys = Object.keys(rows[0]);
  var cols = tableColumns(rows, meta);
  var data = tableRows(rows, meta);
  datatable = atable.DataTable({
    columns: cols, data: data, aaSorting: [], scrollX: true, autoWidth: true,
    retrieve: true, fixedHeader: {header: true, footer: true}
  });
  $('#atable_wrapper thead').on('click', 'th', function () {
    var i = datatable.column(this).index();
    if(i>0) drawChart(rows, meta, keys[0], cols[i].data.sort);
  });
  setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 0);
};

function chartValue(rows, x, y) {
  var data = [];
  for(var row of rows)
    data.push([row[x], row[y]]);
  return data;
};
function chartRange(rows, x, y) {
  var data = [], ye = y+'_e';
  if(rows[0][ye]==null) return null;
  for(var row of rows)
    data.push([row[x], round(row[y]-row[ye]), round(row[y]+row[ye])]);
  return data;
};
function drawChart(rows, meta, x, y) {
  var metay = meta[y];
  var label = '{value}'+(metay.unit||'');
  var value = chartValue(rows, x, y);
  var range = chartRange(rows, x, y);
  highcharts = Highcharts.chart('achart', {
    title: {text: metay.name},
    xAxis: {labels: {enabled: true, formatter: function() { return value[Math.round(this.value)][0]; }}},
    yAxis: {title: {text: null}, labels: {format: label}},
    tooltip: {crosshairs: true, shared: true, valueSuffix: metay.unit},
    legend: {},
    series: [{
      name: metay.name, data: value, zIndex: 1,
      marker: {fillColor: 'white', lineWidth: 2, lineColor: Highcharts.getOptions().colors[0]}
    }, {
      name: 'Range', data: range, type: 'arearange', lineWidth: 0, linkedTo: ':previous',
      color: Highcharts.getOptions().colors[0], fillOpacity: 0.3, zIndex: 0, marker: {enabled: false}
    }]
  });
};

form.submit(function() {
  var txt = query.val();
  console.log(txt);
  $.getJSON('/fn/english/'+txt, function(data) {
    var rows = data.rows, meta = data.meta;
    if(datatable!=null) { datatable.destroy(); $('#atable').empty(); datatable = null; }
    if(highcharts!=null) { highcharts.destroy(); $('#achart').empty(); highcharts = null; }
    if(rows.length===0) return;
    var keys = Object.keys(rows[0]||{});
    applyMeta(rows, meta);
    drawTable(rows, meta);
    if(keys.length>=2) drawChart(rows, meta, keys[0], keys[1]);
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
