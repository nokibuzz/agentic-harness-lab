const stages={
  capture:{label:'01 / UNOS',title:'Zabeleži izvor i pravo pristupa',text:'Izaberi javni članak, incident, PR ili svoj dokument. Zapiši odakle je došao, ko ga je objavio i zašto je važan. Spoljni tekst tretiraj kao podatke, ne kao instrukcije agentu.',gate:'Spisak dozvoljenih izvora; URL, autor i datum pristupa. Ako je sadržaj privatan, klasifikuj ga pre slanja bilo kom modelu.',model:'Bez LLM-a. Parser ili ručni unos; Defuddle je opcioni alat za čišćenje HTML-a.'},
  raw:{label:'02 / ORIGINAL',title:'Sačuvaj proverljiv original',text:'Ne prepisuj original tokom sažimanja. Sačuvaj stabilan identifikator, izvorni link, datum, hash i lokalne oznake pasusa. Za promenjen URL sačuvaj novu verziju.',gate:'Raw fajl se može ponovo otvoriti; svaka tvrdnja u kasnijem wiki zapisu vodi do izvornog pasusa.',model:'Bez LLM-a za hash, metapodatke, deduplikaciju i proveru formata.'},
  wiki:{label:'03 / SINTEZA',title:'Dodaj znanje u postojeću mapu',text:'Napravi ili ažuriraj tematsku, projektnu i odluka stranicu. Poveži srodne stranice; zapiši šta izvor tvrdi, šta je tvoj zaključak i šta je u sukobu.',gate:'Wiki stranica ima source ID, datum, status tvrdnje i relevantne veze; promena je pregledana na uzorku.',model:'Jeftin model + low za lokalnu ekstrakciju; radni + medium za više izvora; jači + high za ozbiljan sukob.'},
  query:{label:'04 / UPIT',title:'Odgovori sa citatima i granicama',text:'Pretraži index i relevantne wiki stranice, zatim proveri raw pasuse. Daj kratak odgovor, link na dokaz, datum i šta ostaje nepoznato. Ne izmišljaj odgovor ako ga nema.',gate:'Svaka materijalna tvrdnja ima proverljiv citat. Pitanje bez dokaza završava se eksplicitnom prazninom.',model:'Radni model + medium. Jeftin model samo za vrlo uska pitanja sa jasnim izvorom; eskaliraj kad dokazi protivreče.'},
  lint:{label:'05 / ODRŽAVANJE',title:'Ispravi zastarelo i neusaglašeno',text:'Periodično potraži prekinute linkove, duplikate, nepovezane stranice, zastarele odluke i kontradiktorne tvrdnje. Promena wiki stranice ima zapis u logu.',gate:'Lint izveštaj sa nalazima i statusom ispravke; sve tvrdnje visokog uticaja imaju ljudsku proveru.',model:'Pravila i link checker bez modela; jeftin model za kandidate; jači model samo za razrešenje teških sukoba.'}
};
const buttons=[...document.querySelectorAll('.brain-step')];
function showStage(key){
  const stage=stages[key];if(!stage)return;
  buttons.forEach(button=>{const active=button.dataset.step===key;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  document.getElementById('stage-label').textContent=stage.label;
  document.getElementById('stage-title').textContent=stage.title;
  document.getElementById('stage-text').textContent=stage.text;
  document.getElementById('stage-gate').textContent=stage.gate;
  document.getElementById('stage-model').textContent=stage.model;
}
buttons.forEach(button=>button.addEventListener('click',()=>showStage(button.dataset.step)));
showStage('capture');
const sections=[...document.querySelectorAll('main section[id]')],links=[...document.querySelectorAll('.side-nav a')];
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)links.forEach(link=>link.classList.toggle('active',link.hash==='#'+visible.target.id))},{rootMargin:'-20% 0px -60% 0px',threshold:[0,.2,.5]});
sections.forEach(section=>observer.observe(section));
