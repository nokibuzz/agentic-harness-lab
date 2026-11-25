# Factory engineering: plan učenja po objavi Zacha Lloyda

**Cilj:** da umeš da projektuješ sistem koji meri rad coding agenata, predlaže poboljšanja, pošteno poredi konfiguracije i menja model routing na osnovu dokaza. Ovaj projekat je offline nastavni POC; ne gradi produkcionog agenta i ne povezuje tokene.

**Status:** ovo je opciona dublja factory specijalizacija nakon ili uz [glavni osmonedeljni kurs](PUT.md). Njen ritam je osam tema × četiri kraće sesije; za početnika je primarni redosled 40 dana iz „Tvoj put“. Svaka tema ovde završava fajlom koji možeš pregledati i konkretnim uslovom prolaza.

**Paralelna oblast:** [Second brain: četiri nedelje i 16 sesija](SECOND_BRAIN.md). Nije zamena za factory plan. U drugoj nedelji ovog plana možeš početi sa raw izvorima; pri trijaži i planiranju koristi proverljiv context pack. Posle verifikacije i mergea zapiši potvrđenu lekciju. Ticket, Git, CI i run log ostaju autoritativni za stanje rada.

**Ako želiš dnevni raspored za svoj incident use case:** prati [Tvoj put — 8 nedelja i 40 dana](PUT.md). Ovaj factory plan ostaje dublji referentni materijal za evals, benchmark, routing i A/B kada stigneš do odgovarajućih dana.

**Drugi portfolio cilj posle Dana 10:** [Repo Scout Kit](SKILL_KIT_PLAN.md) je plan za tvoj zaseban GitHub paket skillova; njegov eval koristi iste principe koje ovde učiš.

## Mapa

| Red | Tema sa slike | Pitanje | Artefakt |
| --- | --- | --- | --- |
| 0 | Factory-as-code | Koja konfiguracija je pokrenula run? | `factory/workflow.yaml` i trace schema |
| 1 | Online evals i scorers | Kako je run prošao, po kom kriterijumu? | Rubrika, ljudske oznake, scorer zapis |
| 2 | Self-improvement loop | Koja promena fabrike sprečava obrazac greške? | Hipoteza i reviewable config diff |
| 3 | Benchmark | Da li kandidat radi bolje na istim zadacima? | Replay manifest i paired izveštaj |
| 4 | Model routing | Koji model i effort za koju klasu rada? | Verzionisano pravilo i fallback |
| 5 | A/B test | Da li dobitak opstaje na novom prilivu? | Plan, randomizacija, decision log |

**Razlika:** online eval ocenjuje stvarne runove; benchmark ponavlja fiksne zadatke iz istog početnog stanja; A/B test poredi buduće zadatke. Ta tri merenja odgovaraju na različita pitanja.

## Priprema: jedna „igračka“ fabrika

Koristi isti jednostavan primer tokom osam nedelja: prijava buga web forme → trijaža → reprodukcija → draft PR → test → review. Za svaki izmišljeni run pripremi ulazni tiket, početni commit (izmišljeni SHA je dovoljan), verziju konfiguracije, trag radnji, diff, test rezultat, browser rezultat, trajanje, simulirani trošak i ljudsku oznaku ishoda. Nije potreban API.

Zadrži četiri klase zadataka: trijaža, jasna izmena, nejasan bug i PR review.

## Nedelja 1 — Factory-as-code i granice

**Cilj:** svaka odluka fabrike ima verziju pravila; bez nje ne znaš šta je poboljšanje promenilo.

1. **Sesija 1:** nacrtaj čvorove `intake → triage → reproduce → implement → verify → review → gate → observe`. Za svaki napiši ulaz, izlaz, broj pokušaja i uslov za čoveka.
2. **Sesija 2:** napravi kostur `factory/workflow.yaml`, `routing.yaml`, `scorers/`, `benchmarks/` i `experiments/`. Unesi samo ilustrativne vrednosti; bez tajni i stvarnih dozvola.
3. **Sesija 3:** definiši `run_id`, `task_id`, `initial_sha`, `factory_version`, `model`, `effort`, `status` i `artifact_refs`.
4. **Sesija 4:** ručno odigraj jedan bug; pokaži gde se tok zaustavlja ako reprodukcija ne uspe.

**Artefakt:** verzionisana factory definicija i `examples/run-001.json`. **Prolaz:** neko ko vidi samo te fajlove može objasniti ko sme otvoriti PR, kada run staje i koja su pravila važila.

```yaml
version: 1
workflow: bug_to_draft_pr
stages: [intake, triage, reproduce, implement, verify, review]
retry: {implement: 2, verify: 2}
limits: {max_minutes: 45, max_model_calls: 80}
merge: {default: human, auto_allowed_classes: []}
artifacts_required: [initial_sha, reproduction_result, test_result, browser_result, diff]
```

Ovo je nastavni primer, ne specifikacija nekog proizvoda. U stvarnom sistemu parser proverava šemu pre pokretanja.

## Nedelja 2 — Trace, artefakti i baseline

**Cilj:** razlikuj radnje agenta, završnu tvrdnju i stvarni ishod.

1. **Sesija 1:** opiši svaki korak vremenom, čvorom, alatom, ulazom, izlazom, statusom, trajanjem i ID-em pokušaja.
2. **Sesija 2:** napiši 10 sintetičkih runova: tri dobra, dva sa zelenim unit testom i pokvarenim UI-jem, dva sa pogrešnom trijažom, jedan dupli tiket, jedan sa suvišnim testovima i jedan sa zastarelim CI dokazom.
3. **Sesija 3:** ručno označi `outcome_success`, `procedure_ok`, `needs_human` i razlog. Ne gledaj samo agentovu završnu poruku.
4. **Sesija 4:** izračunaj uspehe po klasi, vreme, trošak po uspehu, intervencije i najčešće uzroke neuspeha.

**Artefakt:** `examples/runs.jsonl`, `human-labels.csv`, `baseline.md`. **Prolaz:** svaka tvrdnja iz baselinea vodi do run ID-a i artefakta. Bez dokaza je oznaka `unknown`.

```json
{
  "run_id": "run-007",
  "task_id": "BUG-042",
  "task_class": "clear_bug",
  "initial_sha": "abc1234",
  "factory_version": "v1",
  "model": "candidate-A",
  "effort": "medium",
  "trace_ref": "traces/run-007.jsonl",
  "artifacts": ["diff.patch", "unit.txt", "playwright.png"],
  "agent_claim": "fixed",
  "human_outcome": "failed",
  "failure_mode": "browser-flow-not-checked",
  "cost_units": 4.2
}
```

`cost_units` su izmišljene jedinice za vežbu. Kasnije saberi i retry, verifikaciju i review.

## Nedelja 3 — Online evals i scorers

**Cilj:** pretvori „dobro je“ u usku, proverljivu rubricu.

1. **Sesija 1:** izaberi dve dimenzije: dokaz ispravnosti i suvišne testove. Odredi ulaze: trace, diff, test i browser artefakti.
2. **Sesija 2:** za svaku dimenziju napiši dva primera ocena 0, 0,5 i 1. Dodaj `unknown` kada nedostaje ključni dokaz.
3. **Sesija 3:** ručno označi 20 primera. Ako kasnije uključiš LLM sudiju, slepo uporedi njegove oznake sa ljudskim; u offline vežbi druga osoba može biti „sudija“.
4. **Sesija 4:** napravi tabelu neslaganja: loša rubrika, manjak dokaza, greška sudije ili stvarno dvosmislen slučaj. Verzioniši izmenjenu rubricu.

**Artefakt:** `factory/scorers/correctness.md`, `test-economy.md` i `scorecard.md`. **Prolaz:** scorer ne tvrdi da je bug popravljen zato što agent kaže „gotovo“; možeš pokazati matricu neslaganja i pet konkretnih spornih primera.

| Ocena za dokaz ispravnosti | Uslov |
| --- | --- |
| 0 | Nema reprodukcije ili je korisnički tok i dalje pokvaren. |
| 0,5 | Izmena i test postoje, ali nema E2E dokaza za pogođeni tok. |
| 1 | Reprodukcija pada na početnom stanju, prolazi na izmeni, a relevantni test i browser tok prolaze na poslednjem commitu. |
| unknown | Artefakti ili SHA nisu dostupni. |

LLM sudija može oceniti stil i relevantnost testa. Za stvarni binarni ishod preferiraj izvršne provere i ljudsku kalibraciju. Mali uzorak ne daje stabilnu produkcionu procenu.

## Nedelja 4 — Self-improvement loop

**Cilj:** iz ponovljenih neuspeha napravi promenu fabrike koja se može pregledati i povući.

1. **Sesija 1:** grupiši bar pet runova sa istim uzrokom, recimo propuštenom UI proverom.
2. **Sesija 2:** napiši jednu hipotezu: „Ako verification skill zahteva Playwright za formu, smanjiće se lažni završeci.“ Dodaj mogući trošak.
3. **Sesija 3:** izmeni jednu stvar u skill-u, gateu, alatu ili kontekstu; pripremi PR opis sa run ID-evima.
4. **Sesija 4:** replayuj stare primere i odvojene slučajeve koje nisi koristio za pisanje izmene.

**Artefakt:** `factory/improvements/001.md` i mali config patch. **Prolaz:** vidi se izvor hipoteze, pre/posle dokaz, regresije i ljudska odluka. Ne menjaj scorer koji ocenjuje kandidata u istom eksperimentu.

```text
Obrazac greške:
Dokazi (run ID-evi):
Pretpostavljeni uzrok:
Jedna predložena promena:
Očekivani dobitak:
Moguća regresija:
Replay skup:
Holdout skup:
Odluka i razlog:
```

## Nedelja 5 — Replay benchmark

**Cilj:** pošteno uporedi staru i novu fabriku na istim zadacima.

1. **Sesija 1:** izaberi 12 zadataka, po četiri iz trijaže, bugova i reviewa. Zapiši početni SHA/snapshot, očekivani ishod, zabrane i proveru.
2. **Sesija 2:** A je baseline, B menja samo jedan faktor: model, effort ili skill. Zamrzni ostale uslove, uključujući alate, timeout i scorer.
3. **Sesija 3:** napravi matricu zadatak × konfiguracija × tri ponavljanja. Menjaj redosled A/B da redosled ne stvori prednost.
4. **Sesija 4:** prikaži paired rezultat po task ID-u: ishod, trošak po uspehu, vreme, retry, review nalaze i regresije.

**Artefakt:** `factory/benchmarks/task-set.jsonl` i `benchmark-report.md`. **Prolaz:** A i B polaze iz istog stanja; kandidat ne vidi gotov istorijski diff.

```text
completion_rate = stvarno uspešni zadaci / svi dodeljeni zadaci
cost_per_success = ukupni trošak svih pokušaja / uspešni zadaci
review_precision = dokazani korisni nalazi / svi review nalazi
regression_rate = promene sa regresijom / spojene promene
```

Ako nema uspeha, cost per success je `n/a`, ne nula. Mali nastavni skup ne daje univerzalnu rang-listu modela.

## Nedelja 6 — Model routing i reasoning effort

**Cilj:** iz benchmarka napravi pravilo po klasi, sa fallbackom.

1. **Sesija 1:** opiši četiri klase kroz ulaz, rizik, dostupnost provere i cenu neuspeha. Klasu odredi pre izbora modela.
2. **Sesija 2:** za svaku klasu uporedi najmanje dve konfiguracije pri istom harnessu. Effort je poseban parametar.
3. **Sesija 3:** napiši `routing.yaml`: primarni model, limit, razlog, fallback i uslov za čoveka. Verziju rute čuvaj uz run.
4. **Sesija 4:** proveri rutu na odvojenim zadacima. Prikaži gde je jeftiniji model dobar i gde retry poništava uštedu.

**Artefakt:** `factory/routing.yaml` i `route-decision.md`. **Prolaz:** svaka ruta ima dokaz kvaliteta i ukupnog troška. „Najjeftiniji token“ nije kriterijum.

```yaml
routes:
  triage:
    primary: economical-model
    effort: low
    fallback: work-model
    escalate_if: [invalid_schema, low_confidence, security_signal]
  clear_bug:
    primary: work-model
    effort: medium
    fallback: frontier-model
    escalate_if: [two_failed_attempts, no_reproduction]
  sensitive_review:
    primary: frontier-model
    effort: high
    human_gate: true
```

Nazivi su uloge, ne tvrdnja da je jedan provajder uvek najbolji. Router na HTML stranici je početna hipoteza; kasnije ga zameni rezultatima svog benchmarka.

## Nedelja 7 — A/B test na novom prilivu

**Cilj:** proveri da li kandidat radi bolje na budućim zadacima.

1. **Sesija 1:** pre početka zapiši jednu hipotezu, klasu, primarnu metriku, guardrail metrike, trajanje, potreban uzorak i rollback signal.
2. **Sesija 2:** simuliraj stabilnu 50/50 dodelu po `hash(task_id + experiment_salt)`, ne po svakom retry pozivu. Isti task uvek ostaje u istoj grupi. Proveri balans.
3. **Sesija 3:** u rezultat uključi i neuspešne, blokirane i prekinute runove. Sačuvaj verzije definicije A i B.
4. **Sesija 4:** napiši odluku „usvoji“, „odbaci“ ili „treba još podataka“ sa razlikom u metrici, guardrailima i granicama uzorka.

**Artefakt:** `factory/experiments/001-plan.md`, `assignment.csv` i `decision-log.md`. **Prolaz:** možeš ponovo izračunati dodelu i metrike; usred testa nisu menjani rubrika ili uslov uspeha.

```text
Hipoteza: B smanjuje cost_per_success za jasne bugove.
Jedina promena: verification skill v2 umesto v1.
Populacija: novi jasni bug tiketi, isti repozitorijum.
Jedinica dodele: task_id; stabilno 50/50.
Primarna metrika: cost_per_success.
Guardrails: completion_rate, regression_rate, review_precision.
Stop: regresija u osetljivom toku ili neočekivan rast neuspeha.
Odluka: pregled nakon unapred definisanog perioda i dovoljnog uzorka.
```

A/B test nije dozvola za automatski merge osetljivog koda. Kandidat ostaje u istim sigurnosnim granicama kao baseline.

## Nedelja 8 — Završni rad

1. **Sesija 1:** prikaži kako prijava buga postaje tiket i koje se dve ocene računaju.
2. **Sesija 2:** odaberi skup neuspeha, napiši hipotezu i mali diff konfiguracije.
3. **Sesija 3:** prikaži replay benchmark i plan za budući kontrolisani rollout.
4. **Sesija 4:** u 10 minuta predstavi problem, metodu, dokaz, neizvesnost, guardrail i sledeći korak.

**Artefakt:** `CASE_STUDY.md` sa grafom, scorecardom, benchmark tabelom i A/B planom. **Prolaz:** bez oslanjanja na autoritet modela odgovaraš: koji je zadatak, koja verzija fabrike, kakav je stvarni ishod, zašto scorer veruje tome, da li je kandidat bolji na istim i da li je potvrđen na novim zadacima?

## Pravila koja treba zapamtiti

1. Definiši kvalitet pre optimizacije. Broj PR-ova sam po sebi nije kvalitet.
2. Ocena procesa i ocena ishoda su odvojene.
3. LLM sudija zahteva ljudsku kalibraciju i konkretne dokaze.
4. Self-improvement predlaže reviewable diff, sa replay proverom i mogućnošću povratka.
5. Benchmark zahteva isto početno stanje i isti budžet.
6. Routing je empirijska politika po klasi zadatka.
7. A/B predefiniše cilj, raspodelu, guardrails i stop.
8. Autonomija raste tek kad se pokaže pouzdanost; visokorizične promene ostaju uz ljudski gate.

## Čitaj ovim redom

1. [Zach Lloyd, *Don’t vibe code your software factory*](https://www.warp.dev/blog/build-production-software-factory) — temelj i svih pet alata sa slike.
2. [Warp, *Factory-as-code*](https://www.warp.dev/blog/software-factory-as-code) — verzionisanje workflowa i scorera.
3. [Warp, *Closing the loop*](https://www.warp.dev/blog/agent-self-improving-software-factories) — scorer i improvement PR.
4. [Warp, *Factory Benchmarks*](https://www.warp.dev/blog/warp-factory-benchmarks) — zadaci × konfiguracije × ponavljanja.
5. [OpenAI, *Evaluation best practices*](https://developers.openai.com/api/docs/guides/evaluation-best-practices) — rubrike, ljudska kalibracija i LLM sudija.
6. [Anthropic, *Demystifying evals for AI agents*](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) — trace i stvarni ishod.

Redosled i nastavni pragovi su moj predlog izveden iz izvora. Nisu prepisana interna procedura Warp-a niti dokaz da će jedna konfiguracija biti najbolja za svaki tim.
