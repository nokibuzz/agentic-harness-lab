import {readFile,writeFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const root=new URL('../',import.meta.url);
const source=await readFile(new URL('dist/put-data.js',root),'utf8');
const stepsSource=await readFile(new URL('dist/put-steps.js',root),'utf8');
const {pathWeeks,pathDays,pathSteps}=runInNewContext(source+'\n'+stepsSource+'\n({pathWeeks,pathDays,pathSteps})');
if(pathWeeks.length!==8||pathDays.length!==40||pathSteps.length!==40)throw new Error('Kurs mora imati 8 nedelja i 40 lekcija.');
const link=(label,href)=>`[${label}](${href.startsWith('http')?href:href.startsWith('#')?'dist/put.html'+href:'dist/'+href.replace(/^\.\//,'')})`;
const lines=[
'# Tvoj put — osam nedelja do agentic developera','',
'**Ritam:** 8 nedelja × 5 radnih dana × 2–3 sata. Ovo je kurs za početnika koji želi da razume i proveri read-only incident analitičara, pa zatim projektuje AI Factory. Vežbe koriste samo sintetičke podatke. Sve dnevne lekcije možeš čekirati u [interaktivnom planu](dist/put.html); postojeći lokalni napredak za prvih 30 dana ostaje sačuvan.','',
'## Prvi sat: pripremi okruženje','',
'1. Otvori [javni Incident Lab](https://nokibuzz.github.io/agentic-harness-lab/dist/lab.html). Prođi INC-02 i INC-12, zatim klikni „Pokreni replay“.','2. Ako želiš lokalno da radiš, instaliraj Node.js 20+ i Git, preuzmi repozitorijum ili otvori već postojeći folder. U njemu pokreni `npm test` i `npm run dev`; otvori `http://127.0.0.1:4173/lab.html`.','3. U svojoj kopiji napravi folder `notes/` za dokaze. Za svaki dan sačuvaj `notes/day-XX.md`, putanju commita, screenshot ili test izlaz. Ne upisuj tokene u repozitorijum.','4. Ako ti je terminal potpuno nov, prvo prođi [MDN početničko okruženje](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started) i [GitHub Git uvod](https://docs.github.com/en/get-started/using-git/about-git).','',
'## Rečnik pre prvog dana','',
'| Pojam | Jednostavno značenje | Primer u ovom projektu |','| --- | --- | --- |',
'| Agent | Model koji odlučuje šta će sledeće uraditi pomoću dozvoljenih alata | Budući incident analitičar, ovde još nije povezan |',
'| Harness | Kod i pravila oko agenta: ulaz, dozvole, state, stop, test, log | `incident-core.mjs`, server, fixturei i replay |',
'| Loop | Ponovljen ciklus pokušaj → provera → ispravka | Menjaš jedno pravilo, pokreneš replay, odlučiš da li ostaje |',
'| Graph | Čvorovi i uslovi prelaska između koraka | pristup → svežina → pravilo → predlog → čovek |',
'| Skill | Ponovljivo uputstvo za zadatak | gstack `/review` ili pstack `/create-verification-skill` |',
'| Delegat | Drugi agent sa zasebnim kontekstom i uskom ulogom | evidence-finder koji vrati samo pasus i izvor |',
'| Eval | Skup primera i metrika za poređenje | 12 sintetičkih slučajeva sa referentnim oznakama |',
'| Gate | Uslov koji mora proći pre narednog koraka | Uskraćen pristup zaustavlja klasifikaciju i AI poziv |','',
'## Kako izgleda jedan dan','',
'Prvih 30 minuta pročitaj primarni izvor i napiši svoja dva pitanja. Sledećih 90 minuta uradi tri koraka iz lekcije u svojoj kopiji projekta. Poslednjih 30 minuta pokreni proveru, zapiši rezultat i tek onda čekiraj. Ako ne uspe, sledeći termin počinje ispravkom istog koraka. AI može objasniti sintaksu i napisati nacrt, ali ti moraš umeti da pokažeš ulaz, izlaz, grešku i dokaz.','',
'## Lični brzi prolaz i drugi portfolio cilj','',
'Pošto već poznaješ veći deo prve nedelje, sutra za 90 minuta uradi brzu proveru: `npm test`, `git status`, `git diff`, `rg "analyzeIncident" dist tests`, pa u Lab-u INC-02 i INC-12. Objasni zašto drugi staje. Ako bilo koji deo ne umeš da ponoviš, odradi baš taj dan iz Nedelje 1 punim tempom.','',
'Posle Dana 10 počinje drugi portfolio projekat: [Repo Scout Kit — kompletan plan](SKILL_KIT_PLAN.md). Napravi zaseban GitHub repozitorijum sa tri uska skilla za mapiranje relevantnih fajlova, verifikaciju promene i PR nalaze. Prvo izmeri baseline, zatim v0.1 sa instalacijom i paired evalom. Lokalni read-only MCP je v0.2 samo ako donese dokazivu korist. Radi dva dodatna bloka po 90 minuta nedeljno tokom Nedelja 3–6; glavni kurs ostaje primarni.','',
'## Gstack: koju komandu i kada','',
'Komande ispod su **slash komande u podržanom agent chatu**, a ne shell komande. Zvanični [gstack README](https://github.com/garrytan/gstack) opisuje redosled Think → Plan → Build → Review → Test → Ship → Reflect. Instalacija je opciona; prvo ručno nauči postupak. Za Codex host, koji gstack označava kao eksperimentalni, zvanični setup navodi `./setup --host codex`, a [host dokumentacija](https://github.com/garrytan/gstack/blob/main/docs/hosts.md) objašnjava podršku i ograničenja. Proveri aktuelni README pre instalacije.','',
'| Trenutak | Komanda | Šta tražiš | Dokaz |','| --- | --- | --- | --- |',
'| Ideja je nejasna | `/office-hours` | Jedno pitanje o problemu i korisniku | Kratak problem statement |',
'| Pre implementacije | `/plan-eng-review` | Data flow, stanja, edge cases, plan testa | Plan sa stop uslovima |',
'| Posle diffa | `/review` | Greške u promeni, reprodukcija i rizik | Nalaz sa ulazom i očekivanim rezultatom |',
'| Želiš samo proveru | `/qa-only` | Browser/API/CLI nalaze bez izmene koda | Reprodukcioni koraci |',
'| Hoćeš i popravku | `/qa` | Reprodukciju, popravku i ponovnu proveru | Pre/posle dokaz |',
'| Spremno za PR | `/ship` | Test, pregled, PR i predaju | Zeleni testovi i PR link |','',
'**Vežba:** u posebnoj probnoj grani zatraži `/plan-eng-review` za novi zastareli signal. Uradi jednu malu promenu, pokreni `npm test`, pozovi `/review`, pa `/qa-only` za INC-02 i INC-12. Svaki nalaz potvrdi ručno. `/ship` koristi tek na probnom PR-u kada znaš šta će komanda uraditi.','',
'**Ako želiš instalaciju u Codex:** zvanični README navodi Git, Bun i podržan host. U terminalu, tek pošto pročitaš aktuelno uputstvo, uradi:','',
'```sh','git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/gstack','cd ~/gstack','./setup --host codex','./setup --status','```','',
'Ako koristiš Claude Code, zvanični README navodi podrazumevani `./setup` za taj host. Ove komande samo instaliraju alat; vežbe u kursu možeš završiti i ručno.','',
'## Pstack: kako početi bez rasipanja tokena','',
'U Cursor chatu zvanični [pstack setup guide](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/01-setup.md) navodi `/add-plugin pstack`, zatim `/setup-pstack`. Setup nudi reasoning budžet po ulozi; za početnu vežbu odaberi small ili medium i zabeleži izbor. `/poteto-help` služi kada ne znaš koji postupak odgovara zadatku; `/poteto-mode` je ulaz za ozbiljniji posao i bira playbook. U Claude Code-u se, prema istom vodiču, pstack komande prefiksiraju sa `pstack:`.','',
'Primer za ovaj projekat: `/poteto-mode INC-05 je zastareo signal. Reprodukuj, proveri da model nije pozvan, dodaj najmanji test ako nedostaje i pokaži rezultat.` Kada se greška stalno vraća, `/create-verification-skill` gradi ponovljivu proveru aplikacije, a `/correct` traži zaštitu u arhitekturi, tipovima, testu ili CI-u pre dodatnog prompt pravila. [Zvanični pstack vodič](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/README.md) čitaj redom. Ne pokreći skupe panele i swarm za trivijalan zadatak.','',
'## Delegat: kako ga napraviš i kada ga pozoveš','',
'[Cursor dokumentacija](https://cursor.com/docs/subagents) navodi projektni folder `.cursor/agents/`; roditelj šalje zadatak, delegat radi u svom kontekstu i vraća kratak rezultat. Na vežbi koristi najviše jednog delegata za dokaz i opciono drugog za nezavisnu proveru. To je nastavna granica, ne univerzalno pravilo.','',
'1. U svojoj **probnoj kopiji** napravi `.cursor/agents/evidence-finder.md`.','2. Upiši YAML frontmatter i uske instrukcije, na primer:','',
'```md','---','name: evidence-finder','description: Pronađi pasus u sintetičkoj incident politici. Samo čitaj fajlove.','---','Čitaj samo policy-v3.md i traženi incident.','Vrati: incident ID, policy ID/verziju/pasus, polja, neizvesnost.','Ne menjaj fajlove, ne zaključuj severity i ne pokreći druge agente.','```','',
'3. U glavnom Cursor chatu reci: „Za INC-02 delegiraj pronalaženje dokaza evidence-finderu. Ti proveri da li pasus stvarno podržava predlog. Vrati i trošak ako je dostupan.“','4. Ponovi isti zadatak bez delegata. Uporedi kvalitet, tokene i vreme. Ako delegat samo ponavlja rad glavnog agenta, ne koristi ga za taj tip posla.','',
'## Model i reasoning: početna routing politika','',
'Ne postoji trajno najjeftiniji ili najbolji model. Cene, dostupnost i kvalitet se menjaju; unesi aktuelne cene u [Token Lab](dist/put.html#tokeni) i meri na istom skupu. [OpenAI eval uputstvo](https://developers.openai.com/api/docs/guides/evaluation-best-practices) preporučuje da odluku o više agenata vodi evaluacija; [Anthropic obrazac](https://www.anthropic.com/research/building-effective-agents) razlikuje jednostavne tokove, routing i evaluator loop.','',
'| Posao | Početna ruta | Zašto | Gate |','| --- | --- | --- | --- |',
'| JSON parser, hash, pristup, deduplikacija | Kod bez modela | Tačno i jeftino | Unit test |',
'| Tag i jednostavna ekstrakcija | Mali/jeftiniji model, low effort | Ograničen izlaz | Šema + citat |',
'| Sinteza nekoliko pasusa | Radni model, medium | Više izvora | Istorijski eval |',
'| Sporni incident ili PR sa velikim uticajem | Jači model, high + čovek | Veći rizik | Nezavisna provera |','',
'Poredi `cost_per_correct_decision`, kritične promašaje, lažne citate, latency i abstention. Nazivi poput Sol, Opus, Grok ili DeepSeek su kandidati za sopstveni benchmark, ne preporuka da jedan trenutno pobeđuje. AI adapter u ovom POC-u je isključen dok ga ti lokalno ne uključiš; nijedna lekcija ne zahteva ključ.','',
'## Playwright: prvi stvarni browser test','',
'Kada stigneš do Dana 22, proveri da imaš Node.js 22+ za aktuelni Playwright (osnovni Lab radi na Node.js 20+). Uz [zvanični Playwright uvod](https://playwright.dev/docs/intro) u svojoj probnoj kopiji pokreni `npm init playwright@latest` i izaberi JavaScript, folder `e2e` i Chromium. U jednom terminalu drži `npm run dev`; u drugom napravi `e2e/incident.spec.js`:','',
'```js',
"import { test, expect } from '@playwright/test';",
"test('uskraćen incident ne prikazuje sadržaj', async ({ page }) => {",
"  await page.goto('http://127.0.0.1:4173/lab.html');",
"  await page.getByRole('combobox', { name: 'Incident' }).selectOption('INC-12');",
"  await expect(page.getByText('uskraćen — sadržaj se ne prikazuje')).toBeVisible();",
"  await page.getByRole('button', { name: 'Pokreni analizu' }).click();",
"  while (await page.getByRole('button', { name: 'Sledeći korak' }).isEnabled())",
"    await page.getByRole('button', { name: 'Sledeći korak' }).click();",
"  await expect(page.getByRole('heading', { name: 'POTREBNA_PROVERA' })).toBeVisible();",
"});",
'```','',
'Pokreni `npx playwright test e2e/incident.spec.js`; za vidljiv browser koristi `--headed`. Test proverava korisnički tok. Posebno pokreni `npm test` za pravila i server. Za PR zapiši commit SHA, oba rezultata i screenshot ili Playwright trace pri padu. Računarsko upravljanje browserom bez skripte može proći isti tok, ali ostavi reprodukcione korake.','',
'## Šta sam proverio u izvorima','',
'Gstackov [zvanični README](https://github.com/garrytan/gstack) potvrđuje redosled komandi za plan, review, QA i ship. [pstack README](https://github.com/cursor/plugins/blob/main/pstack/README.md) i njegov [setup vodič](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/01-setup.md) potvrđuju `/setup-pstack`, `/poteto-mode` i verification skill. [Cursor Subagents](https://cursor.com/docs/subagents) potvrđuje zaseban kontekst, konfiguraciju preko `.cursor/agents/` i dodatni trošak. [Laurenina Maven radionica](https://maven.com/p/e23d9c/how-cursor-turned-ai-agents-into-better-engineers) je izvor za verifikaciju, feature map, eval i cenu; [Karpathy LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) je izvor za second brain deo. [Zach Lloyd o software factory](https://www.warp.dev/blog/build-production-software-factory) je polazna tačka za factory loop.','',
'Korisnikovi X linkovi ([second brain post](https://x.com/imryven/status/2124497418397855804), [AI Duck/Lauren post](https://x.com/AIDuckLabs/status/2123919819930042737)) služe kao trag ka temama, ali viralne brojke i citate ne tretiram kao proverene činjenice bez primarnog izvora. Pravila „najviše dva delegata“ i raspored od osam nedelja su moj nastavni dizajn za ovaj POC.',''
,'## Osam nedelja, dan po dan',''
];
const weeklySearch=[
 'MDN JavaScript first steps; GitHub Git branches; JSON basics',
 'gstack README plan-eng-review; pstack guide setup; Cursor subagents',
 'Karpathy LLM Wiki; Atlassian Confluence GET pages; prompt injection documents',
 'Atlassian incident response severity; incident evidence freshness',
 'Playwright locators assertions; OpenAI agent evals trace grading',
 'Anthropic building effective agents routing; Zach Lloyd software factory',
 'GitHub Actions schedule cron timezone; idempotency retry 429',
 'Cursor verification skill; paired benchmark cost per correct decision'
];
for(let w=0;w<8;w++){
 const week=pathWeeks[w];lines.push(`### Nedelja ${w+1}: ${week[0]}`,'',week[1],'',`**Za dalje pretraži:** ${weeklySearch[w]}.`,'');
 for(let d=w*5;d<w*5+5;d++){
  const day=pathDays[d],guide=pathSteps[d];lines.push(`#### Dan ${d+1}: ${day[0]}`,'',`**Cilj:** ${day[1]}`,'',`**Prvo pročitaj:** ${link(day[8],day[7])}.`,'',`**30 min razumevanja:** ${day[2]}`,'',`**Zatim uradi redom:**`,'');
  guide.steps.forEach((s,i)=>lines.push(`${i+1}. ${s}`));
  lines.push('',`**Primer za kopiranje:** ${guide.try}`,'',`**Provera:** ${guide.see} ${day[4]}`,'',`**Sačuvaj:** ${day[5]} **Čekiraj tek kada:** ${day[6]}`,'');
 }
}
lines.push('## Završni dokaz','',
'Pokaži javni Lab, objasni INC-02 i INC-12, pokreni replay, pokaži testove i arhitekturu. Zatim napiši jedan [pilot RFC](docs/ARCHITECTURE.md): odobren read-only pristup, interni policy owner, istorijski eval skup, budžet, audit, stop uslovi i ljudski gate. Ovaj kurs dokazuje razumevanje i izvršivi sintetički POC; ne dokazuje bezbednost za stvarne incidente.','',
'**Primarni izvori:** [gstack](https://github.com/garrytan/gstack), [pstack vodič](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/README.md), [Cursor subagents](https://cursor.com/docs/subagents), [Anthropic Building Effective Agents](https://www.anthropic.com/research/building-effective-agents), [OpenAI Agent Evals](https://developers.openai.com/api/docs/guides/agent-evals), [Playwright uvod](https://playwright.dev/docs/intro), [GitHub Actions schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [Atlassian Confluence API](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page).','');
await writeFile(new URL('PUT.md',root),lines.join('\n'));
console.log('PUT.md: 8 nedelja, 40 dana');
