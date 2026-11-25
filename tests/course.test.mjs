import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const data=await readFile(new URL('../dist/put-data.js',import.meta.url),'utf8');
const guide=await readFile(new URL('../dist/put-steps.js',import.meta.url),'utf8');
const {pathWeeks,pathDays,pathSteps}=runInNewContext(data+'\n'+guide+'\n({pathWeeks,pathDays,pathSteps})');

test('beginner course has eight complete five-day weeks with executable instructions',()=>{
  assert.equal(pathWeeks.length,8);
  assert.equal(pathDays.length,40);
  assert.equal(pathSteps.length,40);
  pathDays.forEach((day,index)=>{
    assert.equal(day.length,9,'Day '+(index+1));
    assert.ok(day[7].startsWith('https://')||day[7].startsWith('./')||day[7].startsWith('#'));
    assert.equal(pathSteps[index].steps.length,3,'Day '+(index+1));
    assert.ok(pathSteps[index].try.length>30);
    assert.ok(pathSteps[index].see.length>30);
  });
});
test('Markdown course includes all daily lessons and source provenance',async()=>{
  const markdown=await readFile(new URL('../PUT.md',import.meta.url),'utf8');
  assert.equal((markdown.match(/^### Nedelja \d+:/gm)||[]).length,8);
  assert.equal((markdown.match(/^#### Dan \d+:/gm)||[]).length,40);
  assert.match(markdown,/## Šta sam proverio u izvorima/);
  assert.match(markdown,/\.cursor\/agents\/evidence-finder\.md/);
});
