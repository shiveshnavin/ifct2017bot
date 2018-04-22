const HELP = [
`Food additives are used to preserve flavor, or enhance taste and appearance. Look at ingredients on the packaging and you can find things like "E202", or "100(ii)" mentioned. These are called the E number, or I.N.S. code of the additive.

You can ask me about the "name", "code", "type", or "approval" of any such additive. You can ask like:
- What is INS 203?
- What is the E number of Potassium Sorbate?
- Tell me the name of INS 160.3.
- Give me the type of E 100.
- I want to know about approval of INS 203.

Say "done / got it" when you are done talking to me.`,
];
const WELCOME = [
  'Hi! You can ask me about the "name", "code", "type", or "approval" of any food additive. Say "help", to know more, or "done / got it" when you are done talking to me.',
  'Hello! You can ask me about the "name", "code", "type", or "approval" of any food additive. Say "help", to know more, or "done / got it" when you are done talking to me.',
  'Good day! You can ask me about the "name", "code", "type", or "approval" of any food additive. Say "help", to know more, or "done / got it" when you are done talking to me.',
  'Greetings! You can ask me about the "name", "code", "type", or "approval" of any food additive. Say "help", to know more, or "done / got it" when you are done talking to me.',
];
const STOP = [
  'Goodbye!',
  'Bye!',
  'Tata!',
  'Alvida!',
];
const NONE = [
  "I don't know about that.",
  "It's not a food additive.",
  "I don't know about ingredients.",
  "I don't think it's a food additive.",
];
const EVENT_1937 =
`Nutritional disorders were prominent public health concern in India during the early 20th century (Barry, 1900; Annual report of Government of India, 1905; Scott, 1916; Ernest, 1917). A general inclination was to pursue research that would elucidate the facts responsible for the prevalence of malnutrition in order to issue guidelines and deliver solutions for its prevention and control. In the year 1918, an enquiry headed by Sir Robert McCarrison was launched to investigate the prevalence of beriberi under the auspices of Indian Research Fund Association (IRFA), now Indian Council of Medical Research (ICMR). Subsequently, the research broadened to a ‘deficiency disease enquiry’ and ultimately transformed into a fully functional research organization named Nutrition Research Laboratories (NRL) housed at the Pasteur Institute, Coonor, Nilgiri, India (Narasinga Rao, 2005a).\n
One of the major public health concerns that NRL, Coonor started looking into was the protein energy malnutrition (PEM). Incipient reports on nutrient evaluations in India, suggested an emphasis on protein content and quality of Indian foods and diets (Lewis, 1880; McNamara, 1906; McCay, 1910; McCay, 1911; McCay, 1912; Passmore, 1948). Prevalence of iron deficiency anemia (IDA) among infants and children of India was also widely recognized. However, comprehensive and conclusive epidemiological studies on nutritional deficiencies in India were scarce. Aykroyd and Rajagopal (1936) reported that the weight for height of Indian children was below that of American children and almost 14% of them showed signs of deficiency diseases. Nutrient deficiency diseases such as beriberi, keratomalacia, night blindness, rickets, osteomalacia, dental caries, pellagra, pregnancy anaemia and lathyrism were of the major concern (McCarrison, 1932). In addition, incidence of goiter due to iodine deficiency was also an issue of concern affecting the Indian population in many regions of the country.\n
Insufficient consumption of milk, eggs and meat was found to be the cause of inadequate supply of protein, minerals such as calcium and fat soluble vitamin A among certain sections of Indian populations (McCarrison, 1925). Prevalence of malnutrition due to inadequate nutrient intake was observed throughout the country.The cause of beriberi in India was found to be low dietary supply of vitamin B either from rice or other food grains (McCarrison & Norris, 1924). Aykroyd (1932) found that milled parboiled rice contained considerably higher amount of vitamin B1 as compared to raw milled rice. Meanwhile, McCarrison (1936) established that populations who preferred consuming raw milled rice over parboiled milled rice were more prone to beriberi.
`;


const CODE = [
  "${names} is ${code}.",
  "${names} is coded as ${code}.",
  "${names} is numbered as ${code}.",
  "${names} is written as ${code}.",
];
const NAME = [
  "${code} is ${names}.",
  "${code} is called as ${names}.",
  "${code} is known as ${names}.",
  "${code} is assigned to ${names}.",
];
const STATUS_NO = [
  "${code}, called as ${names}, is not approved.",
  "${code}, or ${names}, does not pass any compliance.",
  "No country has consented to the use of ${names}, a.k.a. ${code}.",
  "No one accepts use of ${names}, assigned ${code}.",
];
const STATUS_YES = [
  "${code}, called as ${names}, is approved by ${status}.",
  "${code}, or ${names}, passes compliance of ${status}.",
  "${status} have consented to the use of ${names}, a.k.a. ${code}.",
  "${status} accept use of ${names}, assigned ${code}.",
];
const TYPE = [
  "${code}, called as ${names}, is a ${type}.",
  "${code}, or ${names}, is a type of ${type}.",
  "${names}, a.k.a. ${code}, is used as a ${type}.",
  "${names}, assigned ${code}, works as a ${type}.",
];
const ANY_NO = [
  "${code}, called as ${names}, is a ${type}. It is not approved.",
  "${code}, or ${names}, is a type of ${type}. It does not pass any compliance.",
  "No country has consented to the use of ${names}, a.k.a. ${code}. It is used as a ${type}",
  "No one accepts use of ${names}, assigned ${code}. It works as a ${type}.",
];
const ANY_YES = [
  "${code}, called as ${names}, is a ${type}. It is approved by ${status}.",
  "${code}, or ${names}, is a type of ${type}. It passes compliance of ${status}.",
  "${status} have consented to the use of ${names}, a.k.a. ${code}. It is used as a ${type}.",
  "${status} accept use of ${names}, assigned ${code}. It works as a ${type}.",
];
const ERROR = [
  "I didn't get that. Can you say it again?",
  "I missed what you said. Say it again?",
  "Sorry, could you say that again?",
  "Sorry, can you say that again?",
  "Can you say that again?",
  "Sorry, I didn't get that.",
  "Sorry, what was that?",
  "One more time?",
  "What was that?",
  "Say that again?",
  "I didn't get that.",
  "I missed that.",
];

const FORMAT = new Map([
  ['help', HELP],
  ['welcome', WELCOME],
  ['stop', STOP],
  ['none', NONE],
  ['code', CODE],
  ['name', NAME],
  ['status_no', STATUS_NO],
  ['status_yes', STATUS_YES],
  ['type', TYPE],
  ['any_no', ANY_NO],
  ['any_yes', ANY_YES],
  ['error', ERROR],
]);

function message(typ, obj={}) {
  var fmts = FORMAT.get(typ), fmt = fmts[Math.floor(Math.random()*fmts.length)];
  return fmt.replace(/\${(\w+)}/g, (m, p1) => obj[p1]);
};
module.exports = message;
