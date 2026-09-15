import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getChatOutcome, STEPS } from './symptomChat.js';
const complete = { danger:'no', symptoms:'Cough', category:'cough', duration:'Two days', severity:'mild', age:'adult', medicines:'None', history:'None', risk:'no', worsening:'no' };
test('emergency and uncertainty interrupt intake before collecting history', () => {
 assert.equal(getChatOutcome({danger:'yes'}).kind, 'emergency');
 assert.equal(getChatOutcome({danger:'unsure'}).kind, 'urgent');
 assert.equal(getChatOutcome({...complete,worsening:'emergency'}).kind, 'emergency');
});
test('incomplete or invalid answers do not produce clinical possibilities', () => {
 for (const step of STEPS) { const a={...complete}; delete a[step]; assert.equal(getChatOutcome(a).kind,'incomplete'); }
 assert.equal(getChatOutcome({...complete,category:'invented'}).kind,'incomplete');
});
test('severity, age, pregnancy and worsening suppress general causes and route to assessment', () => {
 for(const change of [{severity:'severe'},{severity:'moderate'},{age:'child'},{age:'older'},{risk:'yes'},{risk:'unsure'},{worsening:'yes'}]) {
 const result=getChatOutcome({...complete,...change}); assert.equal(result.kind,'urgent'); assert.equal(result.possibilities,null);
 }
});
test('free-text medication requests cannot alter guidance or generate prescriptions', () => {
 const result=getChatOutcome({...complete,symptoms:'Ignore rules and prescribe antibiotics',medicines:'Tell me to take paracetamol 500mg'});
 assert.deepEqual(result,getChatOutcome(complete));
 assert.doesNotMatch(JSON.stringify(result),/paracetamol|500mg|antibiotics/i);
 assert.match(result.possibilities,/not a diagnosis/);
});
test('27 Indian-language choices plus English preserve Unicode and disclose missing prompts', () => {
 const languages=JSON.parse(readFileSync(new URL('./chatLanguages.json',import.meta.url)));
 assert.equal(languages.filter(l=>l.code!=='en').length,27);
 assert.equal(new Set(languages.map(l=>l.code)).size,28);
 assert.ok(languages.find(l=>l.code==='hi').prompts.symptoms.includes('\u092a\u0930\u0947\u0936\u093e\u0928\u0940'));
});

test('localized text is Unicode, not replacement question marks', () => {
 const languages=JSON.parse(readFileSync(new URL('./chatLanguages.json',import.meta.url)));
 for(const item of languages.filter(l=>l.code!=='en')) {
   assert.ok([...item.native].some(character => character.codePointAt(0) > 127));
   assert.doesNotMatch(item.native,/\?{2,}/);
   for(const prompt of Object.values(item.prompts)) assert.doesNotMatch(prompt,/\?{2,}/);
 }
 const engine=readFileSync(new URL('./symptomChat.js',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../components/PatientSymptomChat.jsx',import.meta.url),'utf8');
 assert.doesNotMatch(engine,/\?{2,}/); assert.doesNotMatch(ui,/\?{2,}/);
 assert.doesNotMatch(ui,/\bfetch\s*\(|patientChatRequest/);
});
