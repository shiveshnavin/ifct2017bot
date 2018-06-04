const Alexa = require('alexa-sdk');
const message = require('./message');
const intent = require('./intent');

const E = process.env;
const LAUNCHED = new Set();
const makeImage = Alexa.utils.ImageUtils.makeImage;
const makeRichText = (txt) => Alexa.utils.TextUtils.makeRichText(message.toRich(txt));
const TITLE = 'Indian Food Composition';
const BACKGROUND = 'https://i.imgur.com/7mldp3G.jpg';

function launch(txt) {
  var bldr = new Alexa.templateBuilders.BodyTemplate1Builder();
  var tmpl = bldr.setTitle(TITLE).setBackgroundImage(makeImage(BACKGROUND)).setTextContent(makeRichText(txt)).build(); 
  this.response.speak(txt).renderTemplate(tmpl).shouldEndSession(false);
  LAUNCHED.add(this.event.session.sessionId);
  this.emit(':responseReady');
};
function stop(txt) {
  LAUNCHED.delete(this.event.session.sessionId);
  this.emit(txt!=null? ':tell':':ask', txt||'');
};
function tell(txt) {
  var e = LAUNCHED.has(this.event.session.sessionId)? ':ask':':tell';
  this.emit(e, txt!=null && e===':ask'? `${txt} <break time="2s"/> ${message('more')}`:txt||message('fallback'));
};

function name(p) {
  if(!p.resolutions || !p.resolutions.resolutionsPerAuthority[0].values) return p.value||'';
  return p.resolutions.resolutionsPerAuthority[0].values[0].value.name;
};
function parameters(slt) {
  var z = {};
  for(var k in slt)
    z[k] = name(slt[k]);
  return z;
};

function LaunchRequest() {
  console.log(`ALEXA.LaunchRequest`);
  launch.call(this, message('welcome'));
};

function DefaultFallbackIntent() {
  console.log(`ALEXA.DefaultFallbackIntent`);
  tell.call(this, message('error'));
};

function HelpIntent() {
  console.log(`ALEXA.HelpIntent`);
  tell.call(this, message('help'));
};

function CancelIntent() {
  console.log(`ALEXA.CancelIntent`);
  stop.call(this, message('stop'));
};

function StopIntent() {
  console.log(`ALEXA.StopIntent`);
  stop.call(this, message('stop'));
};

function SessionEndedRequest() {
  console.log(`ALEXA.SessionEndedRequest`);
  stop.call(this, null);
};

function MoreIntent() {
  console.log(`ALEXA.MoreIntent`);
  tell.call(this, null);
};

async function Unhandled() {
  var int = this.event.request.intent;
  if(!int || !int.slots) return this.emit(':tell', message('stop'));
  var nam = int.name, ps = parameters(int.slots);
  console.log(`ALEXA.${nam}>>`, ps);
  var out = await intent(nam, ps);
  console.log(`ALEXA.${nam}<< "${out}"`);
  tell.call(this, out);
};


var handlers = {
  LaunchRequest, DefaultFallbackIntent, SessionEndedRequest,
  'AMAZON.HelpIntent': HelpIntent, 'AMAZON.CancelIntent': CancelIntent, 'AMAZON.StopIntent': StopIntent,
  'AMAZON.MoreIntent': MoreIntent,
  Unhandled
};
exports.handler = function(e, ctx, fn) {
  const alexa = Alexa.handler(e, ctx, fn);
  alexa.appId = E.ALEXA_APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
