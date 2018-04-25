const message = require('./message');
const intent = require('./intent');

const LAUNCHED = new Set();

function tell(out, req) {
  console.log(req.session);
  var richResponse = {items: [{simpleResponse: {displayText: out.substring(0, 640), textToSpeech: out.substring(0, 640)}}]};
  var payload = {google: {expectUserResponse: LAUNCHED.has(req.session)}};
  return {fulfillmentText: out, source: 'dialogflow', payload};
};

function DefaultWelcomeIntent(req) {
  LAUNCHED.add(req.session);
  console.log(req.session);
  return Promise.resolve(null);
};

function ActionsStop(req) {
  LAUNCHED.delete(req.session);
  return Promise.resolve(null);
};

function about_help(req) {
  var out = message('help');
  return Promise.resolve(tell(out, req));
};

function dialogflow(req) {
  var res = req.queryResult, inp = res.queryText;
  var int = res.intent.displayName, ps = res.parameters;
  console.log(`DIALOGFLOW.${int}>> "${inp}"`, ps);
  if(int==='Default Welcome Intent') return DefaultWelcomeIntent(req);
  if(int==='about_help') return about_help(req);
  if(int==='action_stop') return ActionsStop(req);
  var out = intent(int, ps);
  console.log(`DIALOGFLOW.${int}<< "${out}"`);
  return Promise.resolve(tell(out, req));
};
module.exports = dialogflow;
