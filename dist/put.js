const storageKey='harness-lab-put-v1';
function loadProgress(){try{const value=JSON.parse(localStorage.getItem(storageKey)||'{}');return value&&typeof value==='object'?value:{}}catch{return {}}}
const requestedWeek=Number(new URLSearchParams(location.search).get('week'));
let progress=loadProgress(),selectedWeek=Number.isInteger(requestedWeek)&&requestedWeek>=1&&requestedWeek<=pathWeeks.length?requestedWeek-1:0,openDay=selectedWeek*5+1;
const idSet=new Set(pathDays.map((_,index)=>index+1));
const safe=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function saveProgress(){try{localStorage.setItem(storageKey,JSON.stringify(progress))}catch{}}
function renderCounter(){
  const count=pathDays.filter((_,index)=>progress[index+1]?.done).length;
  document.getElementById('progress-number').textContent=count+' / '+pathDays.length;
  document.getElementById('progress-fill').style.width=(count/pathDays.length*100)+'%';
  const next=pathDays.findIndex((_,index)=>!progress[index+1]?.done)+1;
  document.getElementById('progress-note').textContent=count===pathDays.length?'Sve lekcije su označene. Ponovi završni demo.':count===0?'Prva lekcija čeka.':'Sledeća: Dan '+next+'.';
}
function renderWeek(){
  document.querySelector('.week-tabs').innerHTML=pathWeeks.map((week,index)=>`<button type="button" role="tab" aria-selected="${index===selectedWeek}" class="${index===selectedWeek?'active':''}" data-week="${index}">Nedelja ${index+1}<br>${safe(week[2])}</button>`).join('');
  document.querySelectorAll('[data-week]').forEach(button=>button.addEventListener('click',()=>{selectedWeek=Number(button.dataset.week);openDay=selectedWeek*5+1;renderWeek()}));
  const week=pathWeeks[selectedWeek];
  document.getElementById('week-intro').innerHTML=`<div><small>NEDELJA ${selectedWeek+1} / 5 DANA</small><h3>${safe(week[0])}</h3><p>${safe(week[1])}</p></div><b>Dnevno: 30 min razumevanje · 90 min praksa · 30 min dokaz. Sa pauzama: 2–3 sata.</b>`;
  document.getElementById('day-list').innerHTML=pathDays.slice(selectedWeek*5,selectedWeek*5+5).map((day,index)=>{
    const n=selectedWeek*5+index+1,done=Boolean(progress[n]?.done),open=n===openDay;
    return `<article class="day-card ${done?'done':''} ${open?'open':''}" data-day="${n}"><button type="button" class="day-open" aria-expanded="${open}"><span class="day-number">DAN ${String(n).padStart(2,'0')}</span><b>${safe(day[0])}</b><span class="day-duration">2–3 h</span><span class="day-status">${done?'Završeno':'Čeka'}</span></button><div class="day-detail"><p class="day-goal"><strong>Ishod:</strong> ${safe(day[1])}</p><div class="day-blocks"><div><small>30 MIN · NAUČI</small><p>${safe(day[2])}</p></div><div><small>90 MIN · URADI</small><p>${safe(day[3])}</p></div><div><small>30 MIN · PROVERI</small><p>${safe(day[4])}</p></div></div><div class="day-gate"><div><b>ARTEFAKT</b><p>${safe(day[5])}</p></div><div><b>USLOV PROLAZA</b><p>${safe(day[6])}</p></div></div><p class="day-reference">Materijal: <a href="${safe(day[7])}" ${day[7].startsWith('http')?'target="_blank" rel="noopener noreferrer"':''}>${safe(day[8])}</a></p><div class="day-evidence"><label>Gde je dokaz? Upiši putanju, link ili kratak opis.<input type="text" maxlength="300" data-evidence="${n}" placeholder="npr. notes/day-${n}.md ili commit SHA"></label><button type="button" data-complete="${n}">${done?'Vrati na čekanje':'Označi završeno'}</button></div><p class="day-feedback">${done?'Označeno na osnovu tvog dokaza.':'Za čekiranje upiši dokaz i proveri uslov prolaza.'}</p></div></article>`;
  }).join('');
  document.querySelectorAll('.day-card').forEach(card=>{
    const n=Number(card.dataset.day),guide=pathSteps[n-1],block=document.createElement('div');
    block.className='day-walkthrough';
    block.innerHTML=`<h4>Uradi tačno ovim redom</h4><ol>`+guide.steps.map(step=>`<li>`+safe(step)+`</li>`).join('')+`</ol><div class="day-example"><b>Kopiraj primer ili komandu</b><p>`+safe(guide.try)+`</p></div><p class="day-expect"><b>Šta treba da vidiš:</b> `+safe(guide.see)+`</p>`;
    card.querySelector('.day-gate').before(block);
  });
  document.querySelectorAll('.day-card').forEach(card=>{
    const n=Number(card.dataset.day),input=card.querySelector('[data-evidence]'),button=card.querySelector('[data-complete]');
    input.value=progress[n]?.evidence||'';
    button.disabled=!progress[n]?.done&&input.value.trim().length<8;
    card.querySelector('.day-open').addEventListener('click',()=>{openDay=openDay===n?0:n;renderWeek()});
    input.addEventListener('input',()=>{progress[n]={...(progress[n]||{}),evidence:input.value.slice(0,300)};saveProgress();button.disabled=!progress[n]?.done&&input.value.trim().length<8});
    button.addEventListener('click',()=>{if(progress[n]?.done){progress[n].done=false}else if(input.value.trim().length>=8){progress[n]={evidence:input.value.trim(),done:true}}saveProgress();renderWeek()});
  });
  renderCounter();
}
renderWeek();
const value=id=>Math.max(0,Number(document.getElementById(id).value)||0);
function renderTokens(){
  const main=(value('main-in')*value('input-rate')+value('main-out')*value('output-rate'))/1e6;
  const child=(value('child-in')*value('input-rate')+value('child-out')*value('output-rate'))/1e6;
  const money=n=>'$'+n.toFixed(4);
  document.getElementById('cost-zero').textContent=money(main);
  document.getElementById('cost-one').textContent=money(main+child);
  document.getElementById('cost-two').textContent=money(main+child*2);
  document.getElementById('token-explain').textContent='U ovom pojednostavljenom računu svaki dodatni delegat košta '+money(child)+'. Ako izolacija smanji parent kontekst, smanji ulazne tokene glavnog agenta i uporedi ponovo. Cache, alati i popusti nisu uključeni.';
}
document.querySelectorAll('.token-controls input').forEach(input=>input.addEventListener('input',renderTokens));renderTokens();
document.getElementById('export-progress').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),progress},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='harness-lab-napredak.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
document.getElementById('import-progress').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
    const data=JSON.parse(await file.text());
    if(data.version!==1||!data.progress||typeof data.progress!=='object')throw new Error('Format');
    const clean={};
    for(const [id,item] of Object.entries(data.progress)){if(idSet.has(Number(id))&&item&&typeof item.evidence==='string'){clean[id]={evidence:item.evidence.slice(0,300),done:Boolean(item.done)&&item.evidence.trim().length>=8}}}
    progress=clean;saveProgress();renderWeek();alert('Napredak je uvezen.');
  }catch{alert('Fajl nije ispravan izvoz ovog plana.')}
  event.target.value='';
});
const sections=[...document.querySelectorAll('main section[id]')],links=[...document.querySelectorAll('.side-nav a')];
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)links.forEach(link=>link.classList.toggle('active',link.hash==='#'+visible.target.id))},{rootMargin:'-20% 0px -60% 0px',threshold:[0,.2,.5]});sections.forEach(section=>observer.observe(section));
