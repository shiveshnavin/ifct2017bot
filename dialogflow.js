const query = require('./query');

const LAUNCHED = new Set();

function tell(out, req) {
  var data = {google: {expectUserResponse: LAUNCHED.has(req.sessionId)}};
  return {speech: out, source: 'dialogflow', data};
};

function DefaultWelcomeIntent(req) {
  LAUNCHED.add(req.sessionId);
  return null;
};

function ActionsStop(req) {
  LAUNCHED.delete(req.sessionId);
  return null;
};

function dialogflow(req, res) {
  var rst  = req.body.result, inp = rst.resolvedQuery;
  var int = rst.metadata.intentName, ps = rst.parameters;
  console.log(`DIALOGFLOW.${int}>> "${inp}"`, ps);
  if(int==='Default Welcome Intent') return res.json(DefaultWelcomeIntent(req.body));
  if(int==='action_stop') return res.json(ActionsStop(req.body));
  var out = query(ps.key||'', ps.tags||[]);
  res.json(tell(out, req.body));
  console.log(`DIALOGFLOW.${int}<< "${out}"`);
};
module.exports = dialogflow;
