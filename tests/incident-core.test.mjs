import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {analyzeIncident,POLICY} from '../dist/incident-core.mjs';

const fixtures=JSON.parse(await readFile(new URL('../dist/data/incidenti.json',import.meta.url),'utf8'));
const source=JSON.parse(await readFile(new URL('../vezbe/incidenti/incidenti.json',import.meta.url),'utf8'));
const expected=JSON.parse(await readFile(new URL('../dist/data/expected.json',import.meta.url),'utf8'));

test('public demo fixtures match the documented exercise',()=>assert.deepEqual(fixtures,source));
test('all twelve synthetic cases match reviewed reference labels and have a policy citation',()=>{
  assert.equal(fixtures.length,12);
  for(const incident of fixtures){
    const result=analyzeIncident(incident);
    assert.equal(result.severity,expected[incident.id],incident.id);
    assert.equal(result.policy.id,POLICY.id);
    assert.ok(result.policy.clause);
    assert.equal(result.evidence[0].source,incident.id);
    assert.match(result.humanGate,/Čovek/);
  }
});
test('policy says longer than five, ten, and thirty minutes',()=>{
  const base={id:'BOUNDARY',access:'allowed',signal_age_minutes:1,workaround:false,data_loss:false,security_or_privacy:false};
  for(const [impact,duration] of [
    ['potpuni prekid za sve korisnike',5],
    ['nedostupno za deo korisnika',10],
    ['široka degradacija ključne funkcije',30]
  ])assert.equal(analyzeIncident({...base,impact,duration_minutes:duration}).severity,'POTREBNA_PROVERA');
});
test('denied access blocks reading incident contents and returns only access evidence',()=>{
  const result=analyzeIncident({id:'SECRET',access:'denied',service:'do-not-include',impact:'potvrđen gubitak podataka',data_loss:true});
  assert.equal(result.severity,'POTREBNA_PROVERA');
  assert.equal(result.trace.length,2);
  assert.equal(JSON.stringify(result).includes('do-not-include'),false);
  assert.deepEqual(result.evidence[0].fields,['access']);
});
test('stale and conflicting signals stop before severity rules',()=>{
  const sample={id:'X',access:'allowed',signal_age_minutes:31,conflicting_sources:false,data_loss:true,duration_minutes:20};
  assert.equal(analyzeIncident(sample).severity,'POTREBNA_PROVERA');
  assert.equal(analyzeIncident({...sample,signal_age_minutes:1,conflicting_sources:true}).severity,'POTREBNA_PROVERA');
});
test('null timing values do not silently become zero',()=>{
  const sample={id:'X',access:'allowed',signal_age_minutes:null,duration_minutes:20,impact:'nedostupno za deo korisnika'};
  assert.equal(analyzeIncident(sample).severity,'POTREBNA_PROVERA');
  assert.equal(analyzeIncident({...sample,signal_age_minutes:1,duration_minutes:null}).severity,'POTREBNA_PROVERA');
});
test('confirmed data loss does not require duration under S1',()=>{
  const result=analyzeIncident({id:'LOSS',access:'allowed',signal_age_minutes:1,data_loss:true,duration_minutes:null});
  assert.equal(result.severity,'SEV1');
  assert.equal(result.policy.clause,'S1');
});
