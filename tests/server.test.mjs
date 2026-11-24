import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createAppServer} from '../server/server.mjs';

async function withServer(options,work){
  const server=createAppServer(options);server.listen(0,'127.0.0.1');await once(server,'listening');
  const url='http://127.0.0.1:'+server.address().port;
  try{await work(url)}finally{await new Promise(resolve=>server.close(resolve))}
}
test('default server exposes no AI connection and no credentials',async()=>{
  await withServer({config:{enabled:false,apiKey:'secret-test-value',model:'test',baseUrl:'https://example.com/v1'}},async url=>{
    const capabilities=await (await fetch(url+'/api/capabilities')).text();
    assert.equal(JSON.parse(capabilities).ai.available,false);
    assert.equal(capabilities.includes('secret-test-value'),false);
    const response=await fetch(url+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'INC-02'})});
    assert.equal(response.status,503);
    assert.equal((await fetch(url+'/.env')).status,404);
    assert.equal((await fetch(url+'/lab.html')).status,200);
  });
});
test('AI route accepts fixture IDs only; deterministic gate skips model for denied access',async()=>{
  let calls=0;
  const provider=async()=>{calls++;return {severity:'SEV2',reason:'S2 potvrđuje delimični prekid.',policy_clause:'S2'}};
  await withServer({config:{enabled:true,apiKey:'secret-test-value',model:'fake',baseUrl:'https://example.com/v1'},provider},async url=>{
    const post=id=>fetch(url+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    const allowed=await (await post('INC-02')).json();
    assert.equal(allowed.baseline.severity,'SEV2');
    assert.equal(allowed.advice.severity,'SEV2');
    assert.equal(allowed.agreement,true);
    assert.equal(allowed.humanReviewRequired,true);
    assert.equal(calls,1);
    const denied=await (await post('INC-12')).json();
    assert.equal(denied.advice,null);
    assert.equal(denied.baseline.severity,'POTREBNA_PROVERA');
    assert.equal(calls,1);
    assert.equal((await post('UNKNOWN')).status,404);
  });
});
test('adapter errors never reveal key or upstream content to client',async()=>{
  await withServer({config:{enabled:true,apiKey:'secret-test-value',model:'fake',baseUrl:'https://example.com/v1'},provider:async()=>{throw new Error('secret-test-value upstream detail')}},async url=>{
    const response=await fetch(url+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'INC-02'})});
    const text=await response.text();
    assert.equal(response.status,502);
    assert.equal(text.includes('secret-test-value'),false);
    assert.equal(JSON.parse(text).baseline.severity,'SEV2');
  });
});
