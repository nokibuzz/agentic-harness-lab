# Kako iz vizuelnog POC-a napraviti pravi agentni sistem

Ovaj dokument opisuje buduću implementaciju. Projekat u `dist/` ništa od toga ne izvršava i ne traži tokene. Za redosled vežbanja scorera, self-improvement loopova, benchmarka, routinga i A/B testova vidi [UCENJE.md](UCENJE.md).

## 1. Mentalni model

- **Model** predlaže sledeću akciju i koristi dozvoljene alate.
- **Harness** vodi izvršavanje: kontekst, alati, dozvole, sandbox, stanje, log, retry, budžet i prekid.
- **Inner loop** radi na jednom zadatku: reprodukcija → plan → izmena → test → pregled → korekcija.
- **Outer loop** bira zadatke i unapređuje sistem: signali → tiket → prioritet → rad → merge → posmatranje → eval/guardrail.
- **Workflow graph** eksplicitno opisuje čvorove, prelaze i stop uslove. Ne moraš odmah instalirati graph framework. Za jedan tok obična state machine i queue su dovoljni.

Prva verzija treba da bude **jedan agent, jedan repozitorijum, jedan tip tiketa i jedan proverljiv korisnički tok**. Više agenata uvodi tek kada izmeriš gde je usko grlo.

## 2. Kontrakti podataka

Svaki ulaz postaje događaj sa `event_id`, `source`, `occurred_at`, `idempotency_key`, `payload` i `trace_id`. Chat, CLI i schedule razlikuju se samo po adapteru koji napravi događaj. Obrada istog `idempotency_key` drugi put ne sme stvoriti dupli tiket ili PR.

Minimalni tiket:

```json
{
  "ticket_id": "BUG-042",
  "source_event_ids": ["evt-123"],
  "status": "ready",
  "title": "Save dugme ne čuva profil",
  "affected_area": "profile/form",
  "impact": 3,
  "urgency": 2,
  "confidence": 4,
  "risk": 2,
  "reproduction": "otvori profil, promeni ime, klikni Save",
  "expected": "prikazuje se nova vrednost posle refresh-a",
  "observed": "vrednost se vraća na staru",
  "acceptance": ["Playwright pada na main", "prolazi na grani", "CI je zelen"],
  "owner": null
}
```

Stanja: `new → needs-info | ready → claimed → investigating → implementing → verifying → review → merge-ready → merged → observing → done`. Svako stanje može preći u `blocked` ili `escalated`; `verifying` i `review` mogu vratiti zadatak na `implementing`. `merged` nije isto što i `done`: prvo proveri proizvodni ishod.

Prioritet prvo definiši jednostavnim pravilom, ne slobodnim tekstom modela. Na primer: P1 je aktivan širok prekid ili sigurnosni problem; P2 je potvrđena regresija; P3 je mali, lokalni problem. Model predlaže `impact`, `urgency`, `confidence` i dokaze. Politika konačno klasifikuje. Nesiguran signal ide u `needs-info`.

## 3. Čvorovi workflow grafa

| Čvor | Ulaz | Izlaz | Stop ili povratak |
| --- | --- | --- | --- |
| Intake | chat/CLI/cron/webhook event | normalizovan signal | nevalidan izvor → odbij |
| Dedupe | signal + postojeći tiketi | novi tiket ili link na stari | nejasno → needs-info |
| Triage | tiket + pravila | prioritet, rizik, vlasnik | visok rizik → čovek |
| Claim | ready tiket | lease + worktree | istekao lease → queue |
| Reproduce | acceptance + aplikacija | failing test / dokaz | nema reprodukcije → needs-info |
| Implement | worktree + plan | commit | budžet/timeout → blocked |
| Verify | commit + checklista | test i browser artefakti | fail → implement, najviše N puta |
| Review | diff + dokaz | nalazi ili approve | nalaz → implement |
| Merge gate | poslednji SHA + CI + rizik | merge ili ljudski zahtev | stale SHA → ponovi provere |
| Observe | merge + telemetrija | done, rollback ili novi tiket | regresija → rollback |

Ne dozvoli da model preskoči čvor. Prelazi treba da se vide u event logu sa razlogom, vremenom, verzijom pravila i korišćenim modelom.

## 4. Jedan tok od buga do PR-a

1. Ulazni adapter zapisuje događaj i vraća ID. Za webhook proverava potpis. Za schedule koristi vreme prozora i idempotency ključ.
2. Intake pretražuje slične tikete i dodaje linkove do prijava. Niska sigurnost deduplikacije znači pregled, ne automatsko spajanje.
3. Triage formira strukturiran tiket s reprodukcijom i acceptance kriterijumima. Nedostajući kriterijum blokira implementaciju.
4. Queue daje lease samo jednom radniku. Worker pravi izolovan worktree ili kontejner s najmanjim potrebnim dozvolama.
5. Agent prvo pokušava da reprodukuje bug na osnovnoj grani. Čuva komandu, izlaz, screenshot/video ili trace. Bez reprodukcije označava pretpostavke.
6. Agent pravi plan, menja kod i dodaje odgovarajući regresioni test. Svaki pokušaj čuva commit i sažetak stanja da naredna sesija može da nastavi.
7. Verifier pokreće lint, tipove, unit/integration testove i korisnički tok kroz Playwright ili computer-use alat. Tačni dokazi idu u PR opis.
8. Reviewer čita poslednji commit i pita: šta se još moglo pokvariti, da li test pokriva stvarni uzrok, da li se promenila bezbednosna granica? Nalaz bez lokalizovanog dokaza je hipoteza.
9. Merge gate ponovo čita poslednji SHA, status CI-ja, review nalaze, risk tier i rollback plan. Ako se SHA promenio, stari dokazi ne važe.
10. Posle mergea agent posmatra odabrane metrike i osnovni smoke test. Regresija pokreće rollback i novi tiket.

Ograniči retry petlju. Npr. najviše dva pokušaja iste strategije, zatim novi plan ili eskalacija. Ograniči i vreme, tokene, broj poziva i paralelne workere.

## 5. Pozivanje sa više mesta

- **Chat:** komanda ili poruka → adapter → `create_event`. Odgovor je link na run/tiket, ne skrivena duga sesija.
- **Terminal:** `agent run BUG-042` ili `agent status RUN-123` → isti API i ista politika.
- **Schedule:** `daily-triage` u 09:00 i `nightly-verification` u 02:00 → isti event store. Job pamti `last_successful_cursor` da ne preskoči signale i da ne obrađuje iste stalno.
- **PR webhook:** na `opened` i `synchronize` proveri poslednji SHA i okini review. Novi commit poništava ranije odobrenje.

Za POC stvarnog sistema koristi SQLite ili Postgres za događaje/stanje, jednostavan queue i GitHub Actions ili platform scheduler za okidače. Konkretnu biblioteku biraj tek posle prvog uspešnog ručnog toka. Redosled je važniji od frameworka.

## 6. Dozvole i autonomija

Predlog lestvice poverenja:

1. Read-only analiza i predlog tiketa.
2. Automatsko kreiranje tiketa uz audit i mogućnost ispravke.
3. Izolovan radnik otvara **draft** PR s dokazom.
4. Automatski review i popravka ograničenog broja pokušaja.
5. Auto-merge samo unapred dozvoljenih niskorizičnih klasa nakon svežih CI i E2E dokaza.
6. Širenje klase promena tek nakon merenja regresija, false positive nalaza i rollback uspeha.

Promene auth, plaćanja, migracija, pristupa podacima i infrastrukture zahtevaju dodatni domenski gate. Pravilo treba da bude mašinski izvršivo, a pristup tajnama odvojen od modelskog konteksta. Bez izolacije i bez rollbacka nema autonomnog mergea.

## 7. Model router

Ne dodeljuj jedan model celom sistemu. Izbor radi po **fazi**, kvalitetu dokaza, riziku i ceni neuspeha.

| Faza | Početna ruta | Effort | Meri |
| --- | --- | --- | --- |
| Ekstrakcija / klasifikacija | Luna ili DeepSeek Flash | low ili bez thinkinga, ako dostupno | validnost šeme, precision/recall |
| Jasna implementacija | Sol, Sonnet ili Grok 4.6 | medium | uspešan PR, vreme, ukupni trošak |
| Nejasan bug / arhitektura | Astra ili Opus | high | tačan uzrok, regresije |
| PR review | odvojen prolaz, po potrebi drugi model | medium/high | dokazani nalazi, false positive |
| Rutinsko održavanje | jeftiniji model uz proveru | low/medium | cost per successful task |

`xhigh`/`max` koristi samo ako eval na tvojim zadacima pokaže stvarnu dobit nad `high`. Često je problem manjak konteksta, dozvole ili testa; veći effort to ne rešava. Upoređuj provajdere u istom harnessu, na istim tiketima, s istim budžetom i proverom.

## 8. Eval skup i metrike

Sačuvaj 20–50 istorijskih zadataka: laki, nejasni, visokorizični, lažne prijave, duplikati, regressije i PR-ovi s poznatim bugom. Za svaki zabeleži očekivani ishod, zabranjene radnje i dokaz. Pokreni ponovljive probe posle svake izmene prompta, modela ili harnessa.

Meri **stvarni ishod**, ne tvrdnju modela:

- uspešno reprodukovan bug i ispravan PR,
- procenat testova i browser tokova koji prolaze,
- false positive review nalaze,
- regresije posle mergea,
- vreme od signala do tiketa i od tiketa do mergea,
- broj ljudskih intervencija,
- ukupni trošak po uspešno završenom tiketu, uključujući retry i review.

Svaki incident i loš obrazac pretvori u test, lint pravilo, bolju dokumentaciju ili promenu granica alata. Ponavljanje iste greške znači da treba popraviti sistem, ne samo naredni prompt.

## 9. Literatura

Primarni izvori i datumi provere su u interaktivnoj stranici, u odeljku „Izvori“. Posebno važni: Lauren Tan/pstack, OpenAI Harness Engineering i Symphony, Anthropic Long-running Agents i Evals, Meta Forum i Thin Orchestrator, Cursor Bugbot i Automations. Iz toga su izvedeni gornji implementacioni predlozi; oni nisu doslovan opis jedne tuđe interne arhitekture.
