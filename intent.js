const message = require('./message');
const nlp = require('./nlp');

const ABOUT = {
  challenge: /challeng|difficult|inconsistent|fragment|exhaust/gi,
  data: /data|info/gi,
  source: /source|from|origin|take|derive|borrow|obtain/gi,
  column: /column|component|part|piece|bit|constituent|element|ingredient|unit|module|item|section|portion/gi,
  form: /form|shape|appear|configur|structure|dispos/gi,
  type: /type|group|category|class|set|lot|batch|bracket|sort|kind|variety|collection|cluster/gi,
  learn: /learn|underst|more/gi,
  limitation: /limitation|exact/gi,
  publish: /(publish|issu|creat|wr(i|o)t|ma(k|de)|develop|produc|print|announc|report|declar|distribut|spread|disseminat|circulat)(e|ed|ing|ten)?(\W|$)/gi,
  publisher: /(publish|issu|creat|wr(i|o)t|ma(k|de)|develop|produc|print|announc|report|declar|distribut|spread|disseminat|circulat)(er|or)(\W|$)/gi,
  support: /(support|back|help)(ed|ing)?(\W|$)/gi,
  supporter: /(support|back|help)(er)(\W|$)/gi,
  fund: /(fund|financ|money|contribut|donat|pay|paid)(e|ed|ing|ion)?(\W|$)/gi,
  funder: /(fund|financ|money|contribut|donat|pay|paid)(er|or)(\W|$)/gi,
  credit: /(credit|acknowledg)(e|ed|ing|ement)?(\W|$)/gi,
  use: /(use|used|using|utiliz|employ|apply|useful)(e|ed|ing)?(\W|$)/gi,
  user: /(us|utiliz|employ|appl|useful)(er|ier)(\W|$)/gi,
  interest: /(interest|bioactive|first)|(ed|ing)?(\W|$)/gi,
  composition: /(composition|nutrient)/gi,
  food: /(food)/gi,
  father: /(father)/gi,
  who: /who|whom|person|people|members/gi,
  when: /when|date|day|month|year|last/gi,
  why: /why|cause|reason/gi,
  what: /what|about/gi,
};

function query(key, tags) {
  if(!tags || !tags.length) return message('none');
  var inp = nlp(tags.join(' '));
  var i = null, e = null;
  if(i==null && e==null) return message('none');
  var obj = Object.assign({}, e, i);
  obj.code = `${i? 'I.N.S. '+i.code:''}${i && e? ' or ':''}${e? e.code:''}`;
  obj.status = status(obj.status);
  var sta = obj.status? 'yes':'no';
  if(key.endsWith('code')) return message('code', obj);
  if(key.endsWith('name')) return message('name', obj);
  if(key.endsWith('type')) return message('type', obj);
  if(key.endsWith('status')) return message('status_'+sta, obj);
  return message('any_'+sta, obj);
};
module.exports = query;
