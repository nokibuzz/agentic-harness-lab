const factoryStages={
  evals:{
    label:"01 / ONLINE EVALS I SCORERS",
    title:"Oceni svaki stvarni run.",
    summary:"Trace opisuje kako je agent radio; artefakti i stanje aplikacije pokazuju šta je stvarno postigao. Scorer meri jednu dimenziju po rubrici, a ljudska ocena kalibriše scorer.",
    exercise:"Ručno označi 20 istorijskih ili sintetičkih runova: tačan ishod, nepotrebni testovi, propuštena verifikacija. Zatim napiši rubricu 0 / 0,5 / 1 i uporedi simuliranog sudiju sa ljudskim oznakama.",
    artifact:"scorers/verification.md + labels.csv + tabela neslaganja",
    gate:"Za svaku ocenu možeš pokazati dokaz; znaš precision/recall ili agreement na označenom uzorku.",
    trap:"Visok procesni score nikad ne poništava pokvaren stvarni ishod."
  },
  improve:{
    label:"02 / SELF-IMPROVEMENT LOOP",
    title:"Pretvori greške u bolju konfiguraciju.",
    summary:"Posmatrač traži ponavljajući uzrok neuspeha i predlaže promenu skill-a, alata, pravila ili dokumentacije kao mali reviewable diff.",
    exercise:"Uzmi bar pet sličnih loših runova. Napiši jednu hipotezu, predloži jednu izmenu u factory definiciji i navedi koje primere ona popravlja, a koje može pokvariti.",
    artifact:"improvements/001-hypothesis.md + patch konfiguracije",
    gate:"Promena prolazi replay na starim slučajevima i na odvojenom holdout skupu; čovek odobrava PR.",
    trap:"Ne optimizuj na jednom incidentu i ne dozvoli agentu da sam promeni sopstveni scorer."
  },
  benchmark:{
    label:"03 / REPLAY BENCHMARK",
    title:"Ponovi iste zadatke iz istog stanja.",
    summary:"Uporedi konfiguracije na fiksnim tiketima, istom početnom commitu, istim alatima i istom limitu. Menjaj jedan faktor po eksperimentu.",
    exercise:"Sastavi 12 zadataka iz 3 klase: trijaža, bug fix i PR review. Zabeleži početni SHA, očekivani ishod i zabrane. Pokreni bazu i kandidata po 3 puta po zadatku.",
    artifact:"benchmarks/tasks.jsonl + benchmark-report.md",
    gate:"Imaš paired rezultate po zadatku: uspeh, trošak po uspehu, vreme, broj pokušaja i regresije.",
    trap:"Ako kandidat vidi gotov diff iz istorije, replay je kontaminiran."
  },
  routing:{
    label:"04 / MODEL ROUTING",
    title:"Izaberi model po klasi posla.",
    summary:"Router koristi izmerene rezultate benchmarka za konkretne vrste zadataka. Verzija pravila se čuva uz svaki run; fallback i eskalacija su deo pravila.",
    exercise:"Za svaku klasu definiši minimalan kvalitet, maksimalan trošak i put eskalacije. Uporedi jeftiniji model sa jačim pri istom harnessu. Zapiši zašto je izabran.",
    artifact:"routing.yaml + tabela kvaliteta/troška po klasi",
    gate:"Nova ruta održava dogovoreni kvalitet na holdout skupu i smanjuje trošak ili vreme.",
    trap:"Ne biraj model samo po ceni tokena ili javnom leaderboardu."
  },
  ab:{
    label:"05 / KONTROLISANI A/B TEST",
    title:"Proveri pravilo na budućim zadacima.",
    summary:"Benchmark proverava poznate zadatke; A/B test poredi verzije fabrike na novom prilivu. Raspodela je stabilna, metrike i stop uslovi su zapisani pre početka.",
    exercise:"Napiši plan A/B testa: jedna promena, ciljna klasa, 50/50 dodela po task ID-u, primarna metrika, guardrail metrike, trajanje i rollback. Proveri balans i analiziraj sve dodeljene zadatke.",
    artifact:"experiments/001-ab-plan.md + decision-log.md",
    gate:"Možeš objasniti da li podaci podržavaju odluku, koje su granice uzorka i šta ćeš sledeće pratiti.",
    trap:"Ne proglašavaj pobedu na malom uzorku i ne menjaj rubriku usred testa."
  }
};
const factoryDetail=document.getElementById("factory-detail");
function showFactory(key){
  const stage=factoryStages[key];
  document.querySelectorAll("[data-factory]").forEach(button=>{
    const active=button.dataset.factory===key;
    button.classList.toggle("active",active);
    button.setAttribute("aria-selected",String(active));
  });
  factoryDetail.innerHTML='<div><span class="factory-stage-label">'+stage.label+'</span><h3>'+stage.title+'</h3><p>'+stage.summary+'</p></div><dl><dt>Vežba</dt><dd>'+stage.exercise+'</dd><dt>Artefakt</dt><dd><code>'+stage.artifact+'</code></dd><dt>Prolaz</dt><dd>'+stage.gate+'</dd><dt>Zamka</dt><dd>'+stage.trap+'</dd></dl>';
}
document.querySelectorAll("[data-factory]").forEach(button=>button.addEventListener("click",()=>showFactory(button.dataset.factory)));
showFactory("evals");

const runCases={
  green:{title:"Prolazni testovi kriju neuspeh",trace:"Unit test i build su zeleni; browser tok nije pokrenut.",scorer:"0,5 / 1 · procedura delimična",outcome:"Korisnik i dalje ne može da sačuva profil.",human:"Neuspeh",decision:"Dodaj E2E dokaz u acceptance i novi eval slučaj."},
  noisy:{title:"Ishod je dobar, proces je rasipan",trace:"Bug je reprodukovan i popravljen; agent je dodao četiri testa koji proveravaju istu granu.",scorer:"0,5 / 1 · efikasnost",outcome:"Funkcionalnost radi, CI i browser tok prolaze.",human:"Uspeh uz dug",decision:"Promeni skill za izbor testova i meri da li se dupliranje smanjuje."},
  clean:{title:"Proces i ishod se slažu",trace:"Reprodukcija na main, uska ispravka, jedan regresioni test, Playwright artefakt.",scorer:"1 / 1 · procedura",outcome:"Korisnički tok prolazi; nema nove regresije na proverama.",human:"Uspeh",decision:"Zadrži kao pozitivan benchmark primer; prati posle mergea."}
};
const runSelect=document.getElementById("run-case");
const runResult=document.getElementById("run-result");
function renderRun(){
  const item=runCases[runSelect.value];
  runResult.innerHTML='<h4>'+item.title+'</h4><div class="run-facts"><div><small>TRACE</small><strong>'+item.trace+'</strong></div><div><small>SIMULIRANI SCORER</small><strong>'+item.scorer+'</strong></div><div><small>STVARNI ISHOD</small><strong>'+item.outcome+'</strong></div><div><small>LJUDSKA OZNAKA</small><strong>'+item.human+'</strong></div></div><p class="run-decision">'+item.decision+'</p>';
}
runSelect.addEventListener("change",renderRun);
renderRun();

const learningWeeks=[
  {title:"Temelj u kodu",sessions:["Nacrtaj jedan bug → tiket → PR tok i odgovorne čvorove.","Napiši verzionisani factory/workflow.yaml bez tajni.","Definiši run_id, početni SHA, config verziju i stop uslove.","Prođi jedan ručni dry-run i zabeleži sve artefakte."],artifact:"factory/ definicija i mapa toka",gate:"Druga osoba može iz fajlova objasniti šta se pokreće i kada staje."},
  {title:"Trace i baseline",sessions:["Napravi šemu run zapisa: zadatak, model, alati, status, trošak.","Prikupi ili sintetički napiši 10 raznovrsnih runova.","Razdvoji trace, diff, testove, screenshot i krajnji ishod.","Ručno označi uspeh i tri najčešće greške."],artifact:"runs.jsonl i baseline.md",gate:"Svaki run ima vezu ka početnom stanju i dokazivom ishodu."},
  {title:"Online evals",sessions:["Odaberi dve dimenzije: ispravnost i suvišni testovi.","Napiši rubrike sa primerima ocena 0, 0,5 i 1.","Ručno označi još 20 runova, zatim simuliraj ili uporedi judge.","Izračunaj neslaganja; popravi rubriku, ne istorijske oznake."],artifact:"dve rubrike i labels.csv",gate:"Možeš pokazati najmanje pet neslaganja i razlog svakog."},
  {title:"Self-improvement",sessions:["Grupiši najmanje pet ponovljenih neuspeha po uzroku.","Napiši jednu hipotezu o skill-u, alatu ili pravilu.","Predloži mali config diff i review kriterijume.","Replayuj stare i odvojene slučajeve; zabeleži regresije."],artifact:"jedan reviewable improvement PR nacrt",gate:"Predlog ima pre/posle dokaz i ne menja scorer koji ga ocenjuje."},
  {title:"Benchmark",sessions:["Izaberi 12 zadataka iz tri klase i sačuvaj početni SHA.","Definiši dve konfiguracije koje se razlikuju u jednoj stvari.","Nacrtaj matricu zadatak × konfiguracija × 3 ponavljanja.","Izračunaj uspeh, vreme, trošak po uspehu i greške."],artifact:"benchmark manifest i izveštaj",gate:"Svaki zadatak je vraćen na isto početno stanje."},
  {title:"Model routing",sessions:["Napravi taksonomiju: trijaža, jasna izmena, nejasan bug, review.","Poredi modele po benchmark rezultatima za svaku klasu.","Napiši pravila za izbor, fallback, budžet i eskalaciju.","Proveri routing na holdout zadacima."],artifact:"routing.yaml i odluke po klasama",gate:"Svaka ruta ima dokaz kvaliteta i troška, ne samo intuiciju."},
  {title:"A/B eksperiment",sessions:["Zapiši hipotezu i jednu primarnu metriku pre početka.","Dodeli nove task ID-eve stabilno 50/50 A ili B.","Prati balans, kvalitet, cenu i regresije bez ranog zaključka.","Napiši odluku: usvoji, odbaci ili prikupi više podataka."],artifact:"A/B plan i decision log",gate:"Možeš odbraniti dodelu, metriku, trajanje i stop uslove."},
  {title:"Capstone",sessions:["Poveži pet koraka u jedan graf merenja i poboljšanja.","Prođi izmišljeni incident od signala do evaluacije.","Predloži novu factory verziju i odradi replay poređenje.","Predstavi rezultate, granice i sledeći eksperiment."],artifact:"jedan pregledan case study",gate:"Razlikuješ dokazani ishod od scorer mišljenja i znaš kada zoveš čoveka."}
];
const weeksContainer=document.getElementById("learning-weeks");
weeksContainer.innerHTML=learningWeeks.map((week,index)=>'<article class="learning-week '+(index===0?"open":"")+'"><button aria-expanded="'+(index===0?"true":"false")+'"><span>NEDELJA '+(index+1)+'</span><strong>'+week.title+'</strong><i>+</i></button><div class="week-body"><ol>'+week.sessions.map(session=>'<li>'+session+'</li>').join("")+'</ol><p><b>Artefakt:</b> '+week.artifact+'</p><p><b>Prolaz:</b> '+week.gate+'</p></div></article>').join("");
weeksContainer.querySelectorAll(".learning-week button").forEach(button=>button.addEventListener("click",()=>{
  const item=button.closest(".learning-week");
  const open=item.classList.toggle("open");
  button.setAttribute("aria-expanded",String(open));
}));
