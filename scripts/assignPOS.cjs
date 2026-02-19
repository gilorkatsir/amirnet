// Script to assign proper POS tags to vocabulary words
// Run: node scripts/assignPOS.js

const fs = require('fs');
const path = require('path');

const vocabPath = path.join(__dirname, '..', 'src', 'data', 'vocabulary.js');
const content = fs.readFileSync(vocabPath, 'utf-8');

// Extract the array
const match = content.match(/export const VOCABULARY = (\[[\s\S]*\]);?\s*$/);
if (!match) { console.error('Could not parse vocabulary.js'); process.exit(1); }
const vocab = JSON.parse(match[1]);

// POS assignment rules
// Priority: explicit overrides > multi-word detection > suffix heuristics > Hebrew hints

const explicitPOS = {
  // Abbreviations
  'e.g.': 'abbr', 'i.e.': 'abbr', 'etc.': 'abbr',

  // Conjunctions
  'albeit': 'conj', 'hence': 'conj', 'nevertheless': 'conj', 'nonetheless': 'conj',
  'notwithstanding': 'conj', 'whereas': 'conj', 'whereby': 'conj',
  'furthermore': 'conj', 'moreover': 'conj', 'otherwise': 'conj',
  'thus': 'conj', 'therefore': 'conj', 'henceforth': 'conj',

  // Prepositions
  'amid': 'prep', 'despite': 'prep', 'throughout': 'prep',
  'via': 'prep', 'versus': 'prep', 'per': 'prep',

  // Adverbs
  'chiefly': 'adv', 'conversely': 'adv', 'correspondingly': 'adv',
  'farther': 'adv', 'formerly': 'adv', 'furthermore': 'adv',
  'hitherto': 'adv', 'increasingly': 'adv', 'likewise': 'adv',
  'merely': 'adv', 'namely': 'adv', 'notably': 'adv',
  'predominantly': 'adv', 'presumably': 'adv', 'subsequently': 'adv',
  'thereby': 'adv', 'altogether': 'adv', 'commendably': 'adv',
  'precisely': 'adv', 'solely': 'adv', 'virtually': 'adv',
  'explicitly': 'adv', 'implicitly': 'adv', 'inadvertently': 'adv',
  'inevitably': 'adv', 'inherently': 'adv', 'predominantly': 'adv',
  'scarcely': 'adv', 'seemingly': 'adv', 'seldom': 'adv',
  'simultaneously': 'adv', 'specifically': 'adv', 'tentatively': 'adv',
  'thoroughly': 'adv', 'unanimously': 'adv', 'undoubtedly': 'adv',
  'utterly': 'adv', 'vehemently': 'adv', 'wholeheartedly': 'adv',

  // Adjectives that don't follow suffix rules
  'abrupt': 'adj', 'adequate': 'adj', 'affluent': 'adj', 'ambiguous': 'adj',
  'ample': 'adj', 'candid': 'adj', 'colossal': 'adj', 'contradictory': 'adj',
  'contrary': 'adj', 'apathetic': 'adj', 'benign': 'adj', 'bleak': 'adj',
  'chronic': 'adj', 'clandestine': 'adj', 'coherent': 'adj', 'compatible': 'adj',
  'competent': 'adj', 'comprehensive': 'adj', 'compulsory': 'adj',
  'conspicuous': 'adj', 'contemporary': 'adj', 'contentious': 'adj',
  'crucial': 'adj', 'detrimental': 'adj', 'diligent': 'adj',
  'dubious': 'adj', 'eloquent': 'adj', 'eminent': 'adj',
  'empirical': 'adj', 'erratic': 'adj', 'explicit': 'adj',
  'exquisite': 'adj', 'feasible': 'adj', 'formidable': 'adj',
  'frugal': 'adj', 'futile': 'adj', 'genuine': 'adj',
  'grave': 'adj', 'gregarious': 'adj', 'gullible': 'adj',
  'harsh': 'adj', 'hostile': 'adj', 'imminent': 'adj',
  'immune': 'adj', 'implicit': 'adj', 'impulsive': 'adj',
  'incessant': 'adj', 'indigenous': 'adj', 'indispensable': 'adj',
  'infamous': 'adj', 'inherent': 'adj', 'innate': 'adj',
  'intact': 'adj', 'intricate': 'adj', 'keen': 'adj',
  'lenient': 'adj', 'lethal': 'adj', 'liable': 'adj',
  'lucrative': 'adj', 'malignant': 'adj', 'meticulous': 'adj',
  'mundane': 'adj', 'negligent': 'adj', 'nominal': 'adj',
  'obsolete': 'adj', 'ominous': 'adj', 'optimal': 'adj',
  'peculiar': 'adj', 'perpetual': 'adj', 'pertinent': 'adj',
  'plausible': 'adj', 'potent': 'adj', 'prevalent': 'adj',
  'pristine': 'adj', 'profound': 'adj', 'profuse': 'adj',
  'prominent': 'adj', 'prone': 'adj', 'prudent': 'adj',
  'redundant': 'adj', 'resilient': 'adj', 'robust': 'adj',
  'scarce': 'adj', 'sceptical': 'adj', 'serene': 'adj',
  'sheer': 'adj', 'solemn': 'adj', 'sparse': 'adj',
  'stagnant': 'adj', 'stern': 'adj', 'stringent': 'adj',
  'subsequent': 'adj', 'subtle': 'adj', 'superb': 'adj',
  'supreme': 'adj', 'surplus': 'adj', 'tangible': 'adj',
  'tedious': 'adj', 'tenacious': 'adj', 'tentative': 'adj',
  'thorough': 'adj', 'trivial': 'adj', 'unanimous': 'adj',
  'unprecedented': 'adj', 'versatile': 'adj', 'vivid': 'adj',
  'volatile': 'adj', 'vulnerable': 'adj', 'zealous': 'adj',
  'avid': 'adj', 'acute': 'adj', 'chronic': 'adj', 'concise': 'adj',
  'discreet': 'adj', 'diverse': 'adj', 'elaborate': 'adj',
  'exempt': 'adj', 'fervent': 'adj', 'fierce': 'adj',
  'illicit': 'adj', 'lavish': 'adj', 'legitimate': 'adj',
  'lucid': 'adj', 'marginal': 'adj', 'menial': 'adj',
  'negligible': 'adj', 'notorious': 'adj', 'obscure': 'adj',
  'overt': 'adj', 'paramount': 'adj', 'precarious': 'adj',
  'preliminary': 'adj', 'proportional': 'adj', 'radical': 'adj',
  'rampant': 'adj', 'reluctant': 'adj', 'rigid': 'adj',
  'rigorous': 'adj', 'secluded': 'adj', 'sedentary': 'adj',
  'skeptical': 'adj', 'steadfast': 'adj', 'subordinate': 'adj',
  'supplementary': 'adj', 'susceptible': 'adj', 'tranquil': 'adj',
  'viable': 'adj', 'wary': 'adj', 'akin': 'adj', 'barren': 'adj',
  'benevolent': 'adj', 'conducive': 'adj', 'defunct': 'adj',
  'dire': 'adj', 'dormant': 'adj', 'elusive': 'adj',
  'exorbitant': 'adj', 'extravagant': 'adj', 'inclined': 'adj',
  'indifferent': 'adj', 'intact': 'adj', 'mediocre': 'adj',
  'penal': 'adj', 'perennial': 'adj', 'plausible': 'adj',
  'poignant': 'adj', 'prolific': 'adj', 'reckless': 'adj',
  'spontaneous': 'adj', 'strenuous': 'adj', 'synthetic': 'adj',
  'vague': 'adj', 'wholesome': 'adj',

  // Nouns that don't follow suffix rules
  'aristocrat': 'noun', 'apparatus': 'noun', 'audit': 'noun',
  'bead': 'noun', 'beak': 'noun', 'census': 'noun',
  'clause': 'noun', 'clue': 'noun', 'consensus': 'noun',
  'curriculum': 'noun', 'decree': 'noun', 'deficit': 'noun',
  'dilemma': 'noun', 'discourse': 'noun', 'dwelling': 'noun',
  'endeavor': 'noun', 'endeavour': 'noun', 'excerpt': 'noun',
  'facade': 'noun', 'famine': 'noun', 'flaw': 'noun',
  'folklore': 'noun', 'fraud': 'noun', 'gist': 'noun',
  'grievance': 'noun', 'habitat': 'noun', 'hazard': 'noun',
  'hierarchy': 'noun', 'incentive': 'noun', 'infrastructure': 'noun',
  'integrity': 'noun', 'jargon': 'noun', 'jurisdiction': 'noun',
  'mandate': 'noun', 'monopoly': 'noun', 'morale': 'noun',
  'niche': 'noun', 'nuance': 'noun', 'paradigm': 'noun',
  'paradox': 'noun', 'peer': 'noun', 'phenomenon': 'noun',
  'plight': 'noun', 'ploy': 'noun', 'precedent': 'noun',
  'premise': 'noun', 'pretext': 'noun', 'protocol': 'noun',
  'quota': 'noun', 'realm': 'noun', 'rebuke': 'noun',
  'repercussion': 'noun', 'repertoire': 'noun', 'residue': 'noun',
  'rhetoric': 'noun', 'rift': 'noun', 'rubble': 'noun',
  'sanction': 'noun', 'scrutiny': 'noun', 'setback': 'noun',
  'skeptic': 'noun', 'spectrum': 'noun', 'stake': 'noun',
  'stance': 'noun', 'stigma': 'noun', 'stimulus': 'noun',
  'strife': 'noun', 'tenure': 'noun', 'threshold': 'noun',
  'toll': 'noun', 'turmoil': 'noun', 'upheaval': 'noun',
  'uproar': 'noun', 'utensil': 'noun', 'venture': 'noun',
  'verdict': 'noun', 'verge': 'noun', 'trait': 'noun',
  'outskirts': 'noun', 'offspring': 'noun', 'livelihood': 'noun',
  'layman': 'noun', 'loophole': 'noun', 'hallmark': 'noun',
  'fiasco': 'noun', 'feat': 'noun', 'endeavor': 'noun',
  'drawback': 'noun', 'crux': 'noun', 'brink': 'noun',
  'breach': 'noun', 'backlash': 'noun', 'aftermath': 'noun',
  'asylum': 'noun', 'allegiance': 'noun', 'accomplices': 'noun',
  'abacus': 'noun', 'algae': 'noun', 'predator': 'noun',
  'prey': 'noun', 'species': 'noun', 'ecosystem': 'noun',
  'debris': 'noun', 'drought': 'noun', 'epidemic': 'noun',
  'fossil': 'noun', 'larva': 'noun', 'ore': 'noun',
  'sediment': 'noun', 'terrain': 'noun', 'vegetation': 'noun',
  'welfare': 'noun', 'yield': 'noun', 'benefactors': 'noun',
  'committee': 'noun', 'delegate': 'noun', 'enterprise': 'noun',
  'militia': 'noun', 'morale': 'noun', 'pact': 'noun',
  'propaganda': 'noun', 'regime': 'noun', 'subsidy': 'noun',
  'tycoon': 'noun', 'adolescence': 'noun', 'charisma': 'noun',
  'demeanor': 'noun', 'empathy': 'noun', 'fortitude': 'noun',
  'grudge': 'noun', 'hubris': 'noun', 'morale': 'noun',
  'nostalgia': 'noun', 'remorse': 'noun', 'resilience': 'noun',
  'solace': 'noun', 'temperament': 'noun', 'zeal': 'noun',

  // Verbs that don't follow suffix rules
  'abhor': 'verb', 'abstain': 'verb', 'accentuate': 'verb',
  'administer': 'verb', 'allocate': 'verb', 'amass': 'verb',
  'amend': 'verb', 'appease': 'verb', 'applaud': 'verb',
  'appraise': 'verb', 'avert': 'verb', 'broaden': 'verb',
  'coincide': 'verb', 'compel': 'verb', 'comply': 'verb',
  'concede': 'verb', 'condone': 'verb', 'confiscate': 'verb',
  'constrain': 'verb', 'contend': 'verb', 'convene': 'verb',
  'curtail': 'verb', 'deem': 'verb', 'defer': 'verb',
  'defy': 'verb', 'depict': 'verb', 'deplete': 'verb',
  'designate': 'verb', 'deter': 'verb', 'diminish': 'verb',
  'disclose': 'verb', 'dispel': 'verb', 'disseminate': 'verb',
  'divert': 'verb', 'dwell': 'verb', 'elicit': 'verb',
  'embark': 'verb', 'embrace': 'verb', 'emit': 'verb',
  'endorse': 'verb', 'ensue': 'verb', 'entail': 'verb',
  'erode': 'verb', 'evict': 'verb', 'exert': 'verb',
  'expel': 'verb', 'exploit': 'verb', 'extort': 'verb',
  'fabricate': 'verb', 'fluctuate': 'verb', 'forge': 'verb',
  'foster': 'verb', 'hamper': 'verb', 'hinder': 'verb',
  'hoard': 'verb', 'impose': 'verb', 'impede': 'verb',
  'incur': 'verb', 'induce': 'verb', 'infer': 'verb',
  'inhibit': 'verb', 'instigate': 'verb', 'invoke': 'verb',
  'jeopardize': 'verb', 'linger': 'verb', 'mediate': 'verb',
  'mitigate': 'verb', 'nurture': 'verb', 'obstruct': 'verb',
  'omit': 'verb', 'opt': 'verb', 'oust': 'verb',
  'perceive': 'verb', 'perpetuate': 'verb', 'persevere': 'verb',
  'ponder': 'verb', 'preclude': 'verb', 'proclaim': 'verb',
  'proliferate': 'verb', 'propel': 'verb', 'prosecute': 'verb',
  'provoke': 'verb', 'ratify': 'verb', 'rebuke': 'verb',
  'reckon': 'verb', 'reconcile': 'verb', 'refrain': 'verb',
  'refute': 'verb', 'relinquish': 'verb', 'repeal': 'verb',
  'replenish': 'verb', 'retain': 'verb', 'retaliate': 'verb',
  'revoke': 'verb', 'scrutinize': 'verb', 'seize': 'verb',
  'simulate': 'verb', 'solicit': 'verb', 'stifle': 'verb',
  'stipulate': 'verb', 'subside': 'verb', 'subsidize': 'verb',
  'suffice': 'verb', 'supersede': 'verb', 'suppress': 'verb',
  'sustain': 'verb', 'thrive': 'verb', 'transcend': 'verb',
  'undermine': 'verb', 'undertake': 'verb', 'usurp': 'verb',
  'validate': 'verb', 'vindicate': 'verb', 'waive': 'verb',
  'wield': 'verb', 'withhold': 'verb', 'adorn': 'verb',
  'augment': 'verb', 'bewilder': 'verb', 'bolster': 'verb',
  'coerce': 'verb', 'commemorate': 'verb', 'compensate': 'verb',
  'contemplate': 'verb', 'contrive': 'verb', 'corroborate': 'verb',
  'culminate': 'verb', 'deceive': 'verb', 'denounce': 'verb',
  'deteriorate': 'verb', 'deviate': 'verb', 'elucidate': 'verb',
  'emancipate': 'verb', 'encompass': 'verb', 'endure': 'verb',
  'engender': 'verb', 'evade': 'verb', 'exacerbate': 'verb',
  'exemplify': 'verb', 'expound': 'verb', 'extinguish': 'verb',
  'fathom': 'verb', 'feign': 'verb', 'fend': 'verb',
  'foreclose': 'verb', 'forsake': 'verb', 'galvanize': 'verb',
  'glean': 'verb', 'grapple': 'verb', 'harness': 'verb',
  'herald': 'verb', 'immerse': 'verb', 'impair': 'verb',
  'infringe': 'verb', 'instigate': 'verb', 'integrate': 'verb',
  'interrogate': 'verb', 'intimidate': 'verb', 'lament': 'verb',
  'languish': 'verb', 'levy': 'verb', 'loom': 'verb',
  'mar': 'verb', 'mollify': 'verb', 'negate': 'verb',
  'obliterate': 'verb', 'ostracize': 'verb', 'overhaul': 'verb',
  'permeate': 'verb', 'persecute': 'verb', 'placate': 'verb',
  'plagiarize': 'verb', 'plead': 'verb', 'pledge': 'verb',
  'plummet': 'verb', 'plunder': 'verb', 'precipitate': 'verb',
  'preempt': 'verb', 'propagate': 'verb', 'quell': 'verb',
  'reap': 'verb', 'recede': 'verb', 'rectify': 'verb',
  'redeem': 'verb', 'rejuvenate': 'verb', 'relegate': 'verb',
  'reprimand': 'verb', 'resent': 'verb', 'revert': 'verb',
  'salvage': 'verb', 'sever': 'verb', 'shun': 'verb',
  'squander': 'verb', 'stagger': 'verb', 'stem': 'verb',
  'succumb': 'verb', 'surmount': 'verb', 'sway': 'verb',
  'tamper': 'verb', 'tarnish': 'verb', 'traverse': 'verb',
  'trigger': 'verb', 'unravel': 'verb', 'usher': 'verb',
  'veer': 'verb', 'wane': 'verb', 'warrant': 'verb',
  'wreak': 'verb', 'conclude': 'verb', 'acquitted': 'verb',
};

function guessPOS(word, hebrew) {
  const w = word.toLowerCase().trim();

  // Check explicit overrides
  if (explicitPOS[w]) return explicitPOS[w];

  // Handle "(adj)" or "(v)" annotations in the word
  if (w.includes('(adj)')) return 'adj';
  if (w.includes('(v)')) return 'verb';
  if (w.includes('(n)')) return 'noun';

  // Multi-word phrases
  if (w.includes(' ') && !w.includes('(')) return 'phrase';

  // Abbreviations
  if (/^[a-z]\.([a-z]\.)+$/.test(w)) return 'abbr';

  // Suffix-based heuristics
  if (/(?:tion|sion|ment|ness|ity|ance|ence|ism|ist|dom|ship|hood|ure|age|ry)$/.test(w)) return 'noun';
  if (/(?:ful|ous|ive|ible|able|ent|ant|al|ial|ical|less|like|ish|ory|ary|ic)$/.test(w)) return 'adj';
  if (/(?:ly)$/.test(w)) return 'adv';
  if (/(?:ize|ise|ify|ate|en)$/.test(w) && w.length > 4) return 'verb';
  if (/(?:ing)$/.test(w) && w.length > 5) return 'adj'; // arousing, outstanding
  if (/(?:ed)$/.test(w) && w.length > 4) return 'adj'; // unprecedented

  // Hebrew hints
  const h = hebrew || '';
  if (h.includes('פועל') || h.includes('לבצע') || h.startsWith('ל')) return 'verb';

  // Default
  return 'noun';
}

let changed = 0;
for (const word of vocab) {
  const newPOS = guessPOS(word.english, word.hebrew);
  if (word.pos !== newPOS) {
    word.pos = newPOS;
    changed++;
  }
}

// Write back
const output = 'export const VOCABULARY = ' + JSON.stringify(vocab, null, 2) + ';\n';
fs.writeFileSync(vocabPath, output, 'utf-8');

// Summary
const posCounts = {};
for (const w of vocab) {
  posCounts[w.pos] = (posCounts[w.pos] || 0) + 1;
}
console.log(`Updated ${changed}/${vocab.length} words`);
console.log('POS distribution:');
for (const [pos, count] of Object.entries(posCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`  ${pos}: ${count}`);
}
