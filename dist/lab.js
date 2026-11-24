import {analyzeIncident} from './incident-core.mjs';

const $=selector=>document.querySelector(selector);
const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node};
let incidents=[],expected={},activeRun=null,visibleSteps=0,adapterAvailable=false;
const select=$('#incident-select'),mode=$('#lab-mode'),trace=$('#lab-trace'),resultBox=$('#lab-result');

function renderFixture(){
  const incident=incidents.find(item=>item.id===select.value);
  const detail=$('#fixture-detail');detail.replaceChildren();
  if(!incident)return;
  const allowed=incident.access==='allowed';
  const fields=allowed?[
    ['ID',incident.id],['Servis',incident.service],['Uticaj',incident.impact],
    ['Trajanje',incident.duration_minutes+' min'],['Starost signala',incident.signal_age_minutes+' min'],
    ['Gubitak podataka',incident.data_loss?'da':'ne'],['Workaround',incident.workaround?'da':'ne'],
    ['Konflikt',incident.conflicting_sources?'da':'ne']
  ]:[['ID',incident.id],['Pristup','uskraćen — sadržaj se ne prikazuje']];
  for(const [label,value] of fields){detail.append(make('dt','',label),make('dd','',value))}
  resetRun();
}
function resetRun(){
  activeRun=null;visibleSteps=0;trace.replaceChildren(make('p','','Izaberi incident i pokreni analizu.'));
  resultBox.replaceChildren();resultBox.className='lab-result';$('#run-count').textContent='0 / 0';$('#next-run').disabled=true;
}
function renderTrace(){
  trace.replaceChildren();
  const steps=activeRun?.baseline.trace||[];
  for(const step of steps.slice(0,visibleSteps)){
    const line=make('div',step.status);
    line.append(make('b','',step.step),make('span','',step.detail));
    trace.append(line);
  }
  $('#run-count').textContent=visibleSteps+' / '+steps.length;
  $('#next-run').disabled=visibleSteps>=steps.length;
  if(visibleSteps>=steps.length)renderResult();
}
function renderResult(){
  const {baseline,advice,agreement,skipped,error}=activeRun;
  resultBox.replaceChildren();resultBox.className='lab-result visible'+(baseline.status==='needs_review'?' needs-review':'');
  resultBox.append(make('small','','PREDLOG · ČOVEK POTVRĐUJE'),make('h3','',baseline.severity),make('p','',baseline.reason));
  resultBox.append(make('code','',baseline.id+' · '+baseline.policy.id+' v'+baseline.policy.version+' §'+baseline.policy.clause));
  const evidence=baseline.evidence.map(item=>item.source+(item.fields?' ['+item.fields.join(', ')+']':' §'+item.clause)).join(' + ');
  resultBox.append(make('p','','Dokazi: '+evidence),make('p','',baseline.humanGate));
  if(skipped)resultBox.append(make('p','advice','AI preskočen: '+skipped));
  if(error)resultBox.append(make('p','advice','AI adapter nije dostupan: '+error));
  if(advice){
    const text='AI savet: '+advice.severity+' · '+advice.reason+' · policy §'+(advice.policy_clause||'?')+'. '+(agreement?'Poklapa se sa pravilom.':'Ne slaže se sa pravilom; potrebna je provera.');
    resultBox.append(make('p','advice',text));
    if(advice.usage?.input!==null&&advice.usage?.input!==undefined)resultBox.append(make('p','','Tokeni adaptera: ulaz '+advice.usage.input+', izlaz '+(advice.usage.output??'?')+'.'));
  }
}
async function startRun(){
  const incident=incidents.find(item=>item.id===select.value);if(!incident)return;
  const baseline=analyzeIncident(incident);
  activeRun={baseline};visibleSteps=1;
  $('#start-run').disabled=true;
  if(mode.value==='ai'&&adapterAvailable){
    try{
      const response=await fetch('/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:incident.id})});
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||'Neuspeo poziv.');
      activeRun={baseline:payload.baseline||baseline,advice:payload.advice,agreement:payload.agreement,skipped:payload.skipped};
    }catch{activeRun={baseline,error:'Poziv nije uspeo. Offline predlog je i dalje prikazan.'}}
  }
  $('#start-run').disabled=false;
  renderTrace();
}
async function checkAdapter(){
  if(!['localhost','127.0.0.1'].includes(location.hostname)){
    $('#adapter-status').textContent='Javna statična verzija: AI adapter je isključen. Nijedan model se ne poziva.';return;
  }
  try{
    const response=await fetch('/api/capabilities');
    if(!response.ok)throw new Error('Nema lokalnog adaptera.');
    const info=await response.json();adapterAvailable=Boolean(info.ai?.available);
    $('#adapter-status').textContent=info.ai?.detail||'AI adapter nije konfigurisan.';
    mode.querySelector('[value="ai"]').disabled=!adapterAvailable;
    if(adapterAvailable)mode.querySelector('[value="ai"]').textContent='AI savet · lokalni serverski adapter';
  }catch{$('#adapter-status').textContent='Statički preview: AI adapter nije povezan; offline pravila rade.'}
}
function runEval(){
  const rows=incidents.map(incident=>{
    const actual=analyzeIncident(incident),reference=expected[incident.id];
    return {id:incident.id,reference,actual:actual.severity,pass:actual.severity===reference,clause:actual.policy.clause};
  });
  const matched=rows.filter(row=>row.pass).length,criticalMiss=rows.filter(row=>row.reference==='SEV1'&&row.actual!=='SEV1').length;
  const summary=$('#eval-summary');summary.replaceChildren(make('strong','',matched+' / '+rows.length+' pogodaka'),make('span','','Kritični potcenjeni: '+criticalMiss+' · read-only: da'));
  const wrap=$('#eval-table');wrap.replaceChildren();const table=make('table'),thead=make('thead'),head=make('tr');
  for(const label of ['Incident','Referenca','Predlog','Pasus','Provera'])head.append(make('th','',label));
  thead.append(head);table.append(thead);const tbody=make('tbody');
  for(const row of rows){
    const line=make('tr');
    for(const value of [row.id,row.reference,row.actual,row.clause,row.pass?'Poklapa se':'Razlika'])line.append(make('td',value==='Poklapa se'?'pass':value==='Razlika'?'fail':'',value));
    tbody.append(line);
  }
  table.append(tbody);wrap.append(table);
}
async function boot(){
  try{
    const [incidentsResponse,expectedResponse]=await Promise.all([fetch('./data/incidenti.json'),fetch('./data/expected.json')]);
    if(!incidentsResponse.ok||!expectedResponse.ok)throw new Error('Fixturei nisu dostupni.');
    incidents=await incidentsResponse.json();expected=await expectedResponse.json();
    for(const incident of incidents){const option=make('option','',incident.id+' · '+incident.service);option.value=incident.id;select.append(option)}
    select.value='INC-02';renderFixture();$('#run-eval').disabled=false;
  }catch{trace.replaceChildren(make('p','','Fixturei se učitavaju preko lokalnog servera. Pokreni npm run dev, pa otvori /lab.html.'));$('#start-run').disabled=true}
  await checkAdapter();
}
select.addEventListener('change',renderFixture);
mode.addEventListener('change',resetRun);
$('#start-run').addEventListener('click',startRun);
$('#next-run').addEventListener('click',()=>{if(activeRun&&visibleSteps<activeRun.baseline.trace.length){visibleSteps++;renderTrace()}});
$('#run-eval').disabled=true;
$('#run-eval').addEventListener('click',runEval);
const sections=[...document.querySelectorAll('main section[id]')],links=[...document.querySelectorAll('.side-nav a')];
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)links.forEach(link=>link.classList.toggle('active',link.hash==='#'+visible.target.id))},{rootMargin:'-20% 0px -60% 0px',threshold:[0,.2,.5]});sections.forEach(section=>observer.observe(section));
boot();
