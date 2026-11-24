# Tvoj put do agentic developera

**Ritam:** 30 radnih dana × 2–3 sata (oko 75 sati). [Interaktivni dnevni plan](https://nokibuzz.github.io/agentic-harness-lab/dist/put.html) sadrži za svaki dan tačno 30 minuta razumevanja, 90 minuta rada, 30 minuta dokazivanja, artefakt i uslov prolaza. Čekiranje zahteva da uneseš gde se dokaz nalazi. Napredak je samo u browseru i možeš ga izvesti kao JSON.

**Tvoj use case:** kasniji read-only analitičar čita odobrene Confluence stranice o internom incident procesu, zatim odobrene incident zapise i signale. Na pitanje „Proveri incidente i stanje sistema“ vraća pregled, predlog ozbiljnosti, citat pravila i izvora, šta nedostaje i kome treba eskalirati. U ovoj fazi ne povezujemo Confluence, ne uzimamo tokene i ne pravimo operativnog agenta. Koristi [sintetičke vežbe](vezbe/incidenti/README.md).

## Zašto tri niti

| Nit | Šta već postoji u projektu | Kako se koristi u tvom cilju |
| --- | --- | --- |
| [Harness i factory](UCENJE.md) | Workflow graf, evaluacije, benchmark, routing, PR provera | Kontroliše tok incident analize i buduće izmene koda |
| [Second brain](SECOND_BRAIN.md) | Raw/wiki/output, poreklo, citati, održavanje | Pretvara Confluence pravila u proverljiv context pack |
| [Tvoj dnevni plan](dist/put.html) | 30 merljivih lekcija, token lab, capstone | Sastavlja prethodna dva u jedan read-only proizvodni scenario |

## Kako prolaziš svaki dan

1. **30 min nauči:** pročitaj označen original i svojim rečima zapiši pravilo. Za jezik izaberi *jedan* mali radni jezik (Python je najkraći put za čitanje JSON-a; TypeScript je takođe dobar ako ti je već poznat). Ne čekaj da „naučiš ceo jezik“.
2. **90 min uradi:** proizvedi artefakt. AI sme da ti pomogne da napišeš nacrt, ali moraš znati šta ulazi, šta izlazi, gde nastaje greška i kako se pokreće provera.
3. **30 min proveri:** prođi uslov prolaza iz taba. Zapiši putanju fajla, commit SHA, screenshot ili kratko obrazloženje. Obeleži lekciju završenom tek kad taj dokaz postoji.
4. Ako uslov padne, ispravi isti artefakt sledećeg dana pre novog gradiva. Ne preskači negativne slučajeve.

## Šest petodnevnih blokova

| Dani | Fokus | Kraj bloka znaš kada… |
| --- | --- | --- |
| 1–5 | Terminal, Git, HTTP/JSON, mali skript, state machine | Možeš objasniti i ručno simulirati read-only workflow bez agenta |
| 6–10 | Brief, tokeni, gstack, pstack, 0/1/2 delegata | Svaki agentni zadatak ima gate, trošak i razlog za delegiranje |
| 11–15 | Confluence raw, wiki, upit, prava, context pack | Svaka tvrdnja vodi na verziju i pasus pravila; „ne znam“ radi |
| 16–20 | Incident lifecycle, severity, signali, izveštaj, negativni slučajevi | Kritičan incident nije potcenjen; loši podaci zaustavljaju odluku |
| 21–25 | PR review, API/UI dokaz, eval skup, replay, guardrails | Možeš braniti odluku testom, citatom i uporedivim merenjem |
| 26–30 | Tri ulaza, raspored, routing, faze fabrike, završni demo | Možeš objasniti put od read-only do factory sistema bez preskakanja gateova |

## Šabloni koje ćeš popuniti

### Task brief za agenta

    CILJ: Proveri sintetički incident INC-02 i predloži severity.
    DOZVOLJENI IZVORI: policy.md v3, incidenti.json / INC-02.
    DOZVOLE: samo čitanje; bez mreže, bez izmene tiketa ili statusa.
    IZLAZ: ID, predlog, dokaz iz incidenta, pasus politike, neizvesnost.
    STOP: nedostaje uticaj, izvor je star, pristup je uskraćen ili dokazi protivreče.
    BUDŽET: 1 glavni agent, najviše 1 pokušaj popravke, bez delegata za jasan slučaj.
    PROLAZ: odgovor odgovara referentnom zapisu i svaki citat zaista podržava tvrdnju.

### Context pack iz second braina

    PITANJE: Koje pravilo važi za nedostupan checkout?
    PRAVILO: Policy v3 `S1, datum 2026-11-24; poslednja provera danas.
    RELEVANTAN IZVOR: raw/policy-v3.md#S1
    IZVEDENI ZAKLJUČAK: Mogući SEV1 ako je globalni prekid potvrđen >5 min.
    GRANICA: Ne znamo da li je prekid globalan dok signal to ne potvrdi.

### Predlog incident izveštaja

    Incident: INC-02
    Stanje izvora: aktivan zapis, osvežen u 09:40
    Predlog: SEV2
    Dokaz: checkout nedostupan za deo korisnika 18 min, INC-02.
    Politika: policy-v3 `S2.
    Neizvesnost: obim regiona treba potvrditi.
    Akcija: čovek potvrđuje; ovaj sistem ne menja incident.

### PR review zapis

    HEAD SHA:
    Šta se promenilo:
    Koji korisnički tok bi mogao biti pogođen:
    Test/Playwright/API dokaz:
    Nalaz sa reprodukcijom:
    Hipoteza za čoveka:
    Rezultat CI:
    Odluka i vlasnik odluke:

## Tokeni: računaj posao, ne samo model

Token lab u [trećem tabu](dist/put.html#tokeni) koristi tvoje unete cene po milion ulaznih i izlaznih tokena:

    cost = (input_tokens × input_rate + output_tokens × output_rate) / 1_000_000
    total_run = parent + sum(child_agents) + retries + tool/model overhead
    cost_per_correct_decision = total_cost / broj tačnih odluka

Unesi stvarne cene tek kada budeš birao provajdera. Keširanje, batch i platformske naknade mogu promeniti račun. Razdvoji **model tier** od **reasoning efforta**: jasan JSON extraction koristi jeftinu/low rutu; sinteza više pravila radnu/medium; kontradikcija ili visok uticaj jaču/high rutu uz čoveka. Parser, hash, deduplikacija i allow/deny politika su kod bez modela. Vidi [Cursor dokumentaciju o trošku podagenata](https://cursor.com/docs/subagents) i [pstack izbor budžeta](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/01-setup.md).

| Vrsta odluke | Početna hipoteza | Dokaz da ruta valja |
| --- | --- | --- |
| Parser, hash, prava, duplikati | Bez modela | Deterministički testovi i audit log |
| Tagovi i JSON ekstrakcija | Jeftiniji model poput DeepSeek/Luna + low | Ispravna šema i citat na eval uzorku |
| Sinteza pravila i rutinska trijaža | Sol/Sonnet/Grok ili uporediv radni model + medium | Tačnost na istorijskim slučajevima i cena po tačnoj odluci |
| Kontradiktorna pravila ili visok uticaj | Opus/Astra ili uporediv jači model + high, zatim čovek | Nema nepotkrepljenih tvrdnji; jasna eskalacija |

Ne pretpostavljaj pobednika među provajderima. Uporedi ih pod istim izvorima, promptom, budžetom i referentnim odgovorima. Povećaj effort samo kada donosi merljiv dobitak. Ako imaš fiksni dnevni budžet, prvo ograniči broj pokušaja, veličinu context packa i broj delegata; tek zatim smanjuj kvalitet modela.

Za prvi eksperiment izaberi **jednog agenta**. Delegat A samo pronalazi dokaze kada bi široka pretraga zatrpala glavni kontekst. Delegat B nezavisno proverava zaključak samo kod spornog ili visokorizičnog slučaja. U nastavnoj vežbi ne dozvoli njima da pokreću novu decu. Ovo je namerno ograničenje za učenje, **nije Laurenino univerzalno pravilo**. Cursor opisuje izolaciju konteksta, ali i dodatni token i startup trošak svakog podagenta. pstack ima [dve vrste podagenata](https://github.com/cursor/plugins/blob/main/pstack/README.md), što samo po sebi ne govori koliko izvršavanja treba pokrenuti.

### Kada koristiti gstack

[gstack](https://github.com/garrytan/gstack) koristi kao sekvencu artefakata: `/plan-eng-review` za arhitekturu i test plan, `/review` za nalaze na diffu, `/qa-only` za read-only QA API/CLI/UI ponašanja, `/ship` tek kad su dozvole i gateovi jasni. Ne uključuj sve komande u svaki zadatak. Zvanični README sam navodi da na jednom benchmarku instaliranje skill paketa nije povećalo stopu rešenih zadataka; vrednost koju treba proveriti kod sebe su **kvalitet postupka, review i dokaz na PR-u**.

### Kada koristiti pstack

[pstack](https://github.com/cursor/plugins/blob/main/pstack/README.md) posmatraj kao biblioteku uskih procedura koje su nastale iz grešaka: verification skill, feature map, arhitekturni pregled i čuvanje konteksta. Prvo proveri jedan tok i jedan skill na istorijskim zadacima. Podesi model i reasoning budžet po ulozi, pa meri rezultat. Laurenin [Maven workshop](https://maven.com/p/e23d9c/how-cursor-turned-ai-agents-into-better-engineers) prolazi kroz verifikaciju, feature maps, evals i trošak; [Y Combinator razgovor](https://www.ycombinator.com/library/n0-the-rise-of-ai-coworkers) govori o bot ulogama, pristupu i pouzdanosti.

Za usmereno gledanje Maven radionice: oko **03:58** pogledaj trust curve (Dani 6–7), **08:35** verification skill i feature map (Dan 9 i 22), **20:04** evals za skills (Dan 23), **32:34** granice u repozitorijumu (Dan 25) i **50:38** tokene i ROI (Dan 7/24). Vremenske oznake su iz [originalne Maven stranice](https://maven.com/p/e23d9c/how-cursor-turned-ai-agents-into-better-engineers).

Za gstack probu na izolovanoj vežbi: napiši precizan task brief, pokreni `/plan-eng-review` i sačuvaj test plan; zatim napravi malu izmenu, pokreni njene testove, upotrebi `/review` i prihvati samo dokazive nalaze; `/qa-only` neka pročita API/CLI/UI ponašanje bez menjanja proizvoda. Za `/ship` prvo ručno prođi njegove preconditions i dozvole na probnom repozitorijumu. Ako nemaš alat instaliran, iste korake odradi ručno; cilj lekcije je postupak koji umeš da objasniš.

## Merila za završni demo

Na [12 sintetičkih incidenata](vezbe/incidenti/incidenti.json) prijavi:

- **Coverage:** 12/12 obrađeno sa ID-em i izvorom.
- **Citation precision:** 100% materijalnih tvrdnji ima proverljiv pasus pravila ili incident zapis.
- **Critical false negative:** 0 slučajeva gde se referentni SEV1 pogrešno označi kao nizak.
- **Abstention:** svi slučajevi bez pouzdanog dokaza imaju „potrebna provera“.
- **Read-only:** 0 write operacija, 0 promenjenih incident statusa.
- **Review:** za jedan sintetički PR razlikuj dokazani nalaz, hipotezu i irelevantan komentar.
- **Trošak:** prikaži token budžet za jasan i sporan slučaj i objasni zašto si dodao ili izostavio delegata.

Ove brojke su **nastavni pragovi** na izmišljenom skupu, ne tvrdnja da je pravi incident sistem bezbedan za automatske odluke. Pre rada sa stvarnim Confluence stranicama potrebni su odobren read-only pristup, klasifikacija podataka, potvrđena interna severity matrica, revizijski trag i zasebna evaluacija na istorijskim incidentima.

Za PR review u Danu 21 koristi [namerno problematičan diff](vezbe/incidenti/pr-review.diff) i tek zatim [ključ nalaza](vezbe/incidenti/pr-review-odgovori.md). Za svaki nalaz traži kontraprimer i test; „ovo izgleda loše“ nije dovoljan dokaz.

## Nalaz o viralnom videu

[AI Duck post](https://x.com/AIDuckLabs/status/2123919819930042737) tvrdi da je Lauren prešla sa 100 na 12 botova i pripisuje joj doslovan citat. Taj broj i citat **nisam potvrdio** u [Laureninoj radionici na Maven-u](https://maven.com/p/e23d9c/how-cursor-turned-ai-agents-into-better-engineers), [YC razgovoru](https://www.ycombinator.com/library/n0-the-rise-of-ai-coworkers) ili zvaničnom [pstack README-u](https://github.com/cursor/plugins/blob/main/pstack/README.md). Plan zato prenosi proverljive principe: jedna jasna uloga, verifikacija, ograničen kontekst, merljiv trošak i oprez pri povećanju paralelizma. „Najviše dva delegata“ je moja nastavna granica da vežba ostane razumljiva.

## Izvori koje vredi čitati po redosledu

1. [Harness Lab graf](dist/index.html#arhitektura) i [factory učenje](UCENJE.md).
2. [Karpathy LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) i [second brain učenje](SECOND_BRAIN.md).
3. [Atlassian Confluence read API](https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page) i [incident response primer](https://www.atlassian.com/incident-management/handbook/incident-response).
4. [Cursor subagents](https://cursor.com/docs/subagents), [pstack](https://github.com/cursor/plugins/blob/main/pstack/README.md), [gstack](https://github.com/garrytan/gstack).
5. [Lauren Maven workshop](https://maven.com/p/e23d9c/how-cursor-turned-ai-agents-into-better-engineers) i [YC razgovor](https://www.ycombinator.com/library/n0-the-rise-of-ai-coworkers).
