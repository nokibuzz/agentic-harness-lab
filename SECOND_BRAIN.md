# Second brain za agentic developera

Ovaj vodič dopunjuje [osmonedeljni factory plan](UCENJE.md). Factory upravlja događajem, tiketom, radom, proverom i merge politikom. Second brain upravlja poreklom izvora, izvedenim znanjem, upitima i ispravkama. Povezuju se preko **context packa pre trijaže/planiranja** i **potvrđene lekcije posle provere**. [Vizuelni drugi tab](https://nokibuzz.github.io/agentic-harness-lab/dist/second-brain.html).

## Provera X objave

[Ryvenova objava](https://x.com/imryven/status/2124497418397855804) navodi sedam repozitorijuma kao delove „second brain“ priče. Oni nisu delovi jednog zvaničnog proizvoda. Njegov [duži članak](https://x.com/imryven/status/2115046979659055476) predlaže Claude Code + Markdown/Obsidian tok; autor navodi da uputstvo nije provereno od početka do kraja. Zato počni od malog proverljivog postupka.

| Izvor | Stvarna uloga | Kada ga koristiti |
| --- | --- | --- |
| [Karpathy / LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) | Originalni obrazac: nepromenljivi raw, održavani wiki, pravila rada | Odmah, kao arhitektura |
| [gbrain](https://github.com/garrytan/gbrain) | Opcionalan memorijski sloj za više agenata; README navodi lokalnu pretragu bez API ključa i dodatno hostovanje | Kad Markdown postupak postane usko grlo |
| [gstack](https://github.com/garrytan/gstack) | Specijalizovane procedure za coding agenta | U factory delu, ne kao raw/wiki baza |
| [Claude Code](https://github.com/anthropics/claude-code) | Jedan mogući izvršilac nad fajlovima i kodom | Kada počneš pravi agent |
| [Anthropic Skills](https://github.com/anthropics/skills) | Primeri ponovljivih procedura | Kad ručni ingest/query/lint postane pouzdan |
| [Knowledge Work Plugins](https://github.com/anthropics/knowledge-work-plugins) | Uloge, komande, skills i konektori za poslovni rad | Kad znaš konkretan poslovni workflow |
| [Defuddle](https://github.com/kepano/defuddle) | Čisti tekst web stranice u Markdown | Pri unosu web izvora, uz proveru izlaza |
| [OpenAI Cookbook](https://github.com/openai/openai-cookbook) | API primeri i recepti | Kasnije; nije gotov second brain |

Obsidian je koristan prikaz Markdown fajlova i veza, ali nije potreban za prvi eksperiment. Nauči obrazac pre izbora aplikacije.

## Minimalni ugovor podataka

    brain/
      raw/             # original, bez prepisivanja
      wiki/
        index.md       # mapa tema
        log.md         # zapis izmena
      output/          # odgovori na upite
      RULES.md         # šema, dozvole, citati

Svaki raw izvor ima `source_id`, naslov, URL ili lokalnu putanju, autora, datum objave ako postoji, datum pristupa, dozvolu pristupa, hash sadržaja i označene pasuse. Original je samo za čitanje; promena dobija novu verziju.

Svaka wiki tvrdnja ima tekst, `source_id` i pasus, datum poslednje provere, status (`potvrđeno`, `izvedeno`, `sporno`, `zastarelo`) i veze. Odgovor iz `output/` vodi nazad do raw pasusa; wiki sama nije dovoljan dokaz.

`RULES.md` ili `CLAUDE.md` opisuje konvencije, ali **nije mehanizam dozvole**. Čitanje, pisanje, mrežu i komande ograničavaju stvarne dozvole i alati. Vidi [Claude Code memory](https://code.claude.com/docs/en/memory) i [settings/permissions](https://code.claude.com/docs/en/settings).

## Plan: 4 nedelje × 4 sesije

Za svaku sesiju izdvoji 60–90 minuta. Prvo uradi ručno, zatim automatizuj jasno definisanu proceduru.

| Sesija | Konkretan posao | Artefakt i uslov prolaza |
| --- | --- | --- |
| 1.1 | Nacrtaj second brain i factory tok sa dve tačke predaje. | Diagram s context packom i potvrđenom lekcijom |
| 1.2 | Izaberi pet javnih izvora za jedan projekat; zapiši metapodatke i pravo pristupa. | Pet raw kartica sa potpunim poreklom |
| 1.3 | Sačuvaj original i označi stabilne pasuse. | Pet od pet kartica ima proverljiv citat |
| 1.4 | Napiši šemu i pravila imenovanja u `RULES.md`. | Druga osoba može pratiti pravila |
| 2.1 | Napiši `wiki/index.md` i dve tematske stranice. | Svaka važna tvrdnja ima raw referencu |
| 2.2 | Napiši projektnu i stranicu odluke. | Razdvojene činjenice, zaključci i pitanja |
| 2.3 | Dodaj izvor koji menja staru tvrdnju. | Ažuriran wiki i objašnjenje u logu |
| 2.4 | Otvori isti folder u Obsidianu ili editoru. | Svaka stranica se nalazi iz indexa |
| 3.1 | Sastavi 10 upita: 3 laka, 3 višedokumentna, 2 kontradiktorna, 2 bez odgovora. | Zamrznut eval skup s očekivanim dokazima |
| 3.2 | Odgovori redom index → wiki → raw. | Nema izmišljenog citata; praznina je eksplicitna |
| 3.3 | Uradi lint: link, sukob, duplikat, stranica bez veze, tvrdnja bez izvora. | Izveštaj sa pet vrsta nalaza |
| 3.4 | Oceni odgovor i citat odvojeno. | Rubrika i ručno kalibrisan uzorak |
| 4.1 | Za istorijski bug izdvoji mali context pack. | Najviše jedna stranica, svaka tvrdnja sa poreklom |
| 4.2 | Prođi trijažu sa i bez packa. | Dva uporediva traga |
| 4.3 | Posle testova, browser provere i reviewa zapiši lekciju. | Link na ticket, commit/PR i proveru |
| 4.4 | Uporedi tačnost, vreme i cenu; napiši pravilo routinga. | Zaključak sa primerom neuspeha |

Počni od [ručne vežbe](vezbe/second-brain/README.md). Napiši wiki karticu za sintetički incident i odgovori na tri pitanja samo uz citate.

## Tri workflowa budućeg sistema

**Ingest:** odobren izvor → extractor/ručni unos → metadata i hash → raw → ekstrakcija tvrdnji → predlog wiki izmene → provera citata → index/log. Tekst sa weba je podatak, ne instrukcija agentu.

**Query:** pitanje → index → relevantne wiki stranice → citirani raw pasusi → odgovor sa citatima, datumom i neizvesnošću → proveri da svaki citat stvarno podržava tvrdnju. Bez dokaza, vrati „ne znam“.

**Lint:** raspored ili ručni poziv → provera šeme/linkova → kandidat za zastarelu ili spornu tvrdnju → raw provera → predlog izmene → ljudska potvrda za važnu odluku → log i eval slučaj.

Prvi zakazani posao neka samo napiše izveštaj. Automatsko menjanje wiki stranica uvedi tek posle replay benchmarka. Lokalni raspored zavisi od dostupnosti računara; cloud posao ne vidi lokalni folder bez eksplicitne sinhronizacije.

## Model i reasoning effort

Ovo su **rute za testiranje**, ne univerzalna rang lista. Imena, cene i mogućnosti proveri pre stvarnog povezivanja.

| Posao | Početna ruta | Kada eskalirati |
| --- | --- | --- |
| URL, hash, duplikat, format, ACL | Kod, bez LLM-a | Parser ne uspeva |
| Tagovi i lokalna ekstrakcija | Jeftiniji model (npr. Luna/DeepSeek) + low, stroga šema | Loš JSON, nedostaje citat |
| Jedan izvor → sažetak | Jeftiniji/radni model + low/medium | Dvosmislen ili važan izvor |
| Više izvora → wiki sinteza | Sol/Sonnet ili uporediv model + medium | Kontradikcija, važna odluka |
| Pitanje sa citatima | Radni model + medium, raw verifikacija | Citat ne podržava tvrdnju |
| Spor visokog uticaja | Jači model (Astra/Opus ili drugi) + high, zatim čovek | Bez dokaza: stani |
| Integracioni kod/skill | Koderski radni model, testovi | Ponavljanje neuspeha ili veliki blast radius |

Grok može biti kandidat u radnom sloju. Uporedi ga sa drugim rutama na istih 10 pitanja i pet ingest zadataka, uz iste izvore i šemu. Meri `citation_precision`, `answer_correctness`, `unsupported_claim_rate`, `stale_claim_detection`, vreme i cenu po tačnom odgovoru. LLM judge je pomoćna mera; ručno kalibriši uzorak i koristi determinističke provere kada možeš.

    citation_precision = podržane materijalne tvrdnje / sve citirane materijalne tvrdnje
    answer_correctness = 0 netačno, 1 delimično, 2 tačno uz granice
    abstention = priznaje odsustvo dokaza (da/ne)
    freshness = označava zastarelu tvrdnju (da/ne)

Zamrzni eval skup pre promene modela/prompta. Promeni jednu stvar, replay-uj primere, pa odluči o routingu. A/B test u produkciji dolazi posle offline benchmarka.

## Spoj sa factory planom

| Factory korak | Šta second brain daje | Šta factory vraća |
| --- | --- | --- |
| Intake/trijaža | Raniji incidenti, vlasništvo modula, poznati duplikati s citatima | Ticket ID i potvrđena klasifikacija |
| Planiranje | Arhitekturne odluke, ograničenja, datum i izvor | Plan i korišćeni context pack |
| Verifikacija/review | Raniji failure pattern i test procedure | Testovi, screenshot/log, reviewer nalaz |
| Posle mergea | Nema ovlašćenja da menja status posla | Potvrđena lekcija vezana za commit/PR i rezultat |
| Outer loop | Kandidati za zastarele tvrdnje i loše citate | Eval slučajevi i proverene ispravke |

Ticket board, Git, CI i run log ostaju autoritativni za stanje rada. Wiki je sloj za razumevanje. Nijedna wiki tvrdnja sama ne otvara PR, ne daje dozvolu za merge i ne zamenjuje test. U pravom sistemu dodaj klasifikaciju podataka, uskraćivanje tajni, izolaciju neproverenog teksta i revizijski trag.

**Spreman si za pravi agent** kada na pet izvora i deset pitanja možeš ručno da pokažeš poreklo, ažuriranje stranice uz novi dokaz, tačne citate, iskreno „nema dokaza“, lint izveštaj i jedan factory ticket kojem je context pack pomogao. Tada automatizuj jednu operaciju uz eval i mogućnost vraćanja promene.
