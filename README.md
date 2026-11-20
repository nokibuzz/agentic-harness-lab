# Harness Lab

Lokalni, interaktivni POC za učenje harness i factory engineeringa, loopova i workflow grafova. Namenjen je kao vizuelna priprema za budući sistem koji prima zadatke iz chata, terminala i rasporeda, trijažira tikete, priprema PR, proverava rezultat i primenjuje merge politiku.

**Vizuelni prikaz:** [otvori Harness Lab na GitHub Pages](https://nokibuzz.github.io/agentic-harness-lab/).

## Pokretanje

Otvori `dist/index.html` direktno u browseru. Za lokalni server:

```sh
cd dist
python3 -m http.server 4173
```

Zatim otvori `http://localhost:4173`.

Nema zavisnosti, naloga, tokena, API poziva, perzistencije ni veze s repozitorijumima. Interakcije su demonstracija; simulacija i model router koriste ugrađene ilustrativne podatke i heuristike.

## Šta sadrži

- Klikabilnu arhitekturu sistema: adapteri, trijaža, red, izolovani radnik, verifikacija, review, merge gate i outer loop.
- Tri simulirana workflowa: prijavljeni bug, PR za autentifikaciju i jutarnji zakazani scan.
- Interaktivni početni izbor modela i reasoning efforta. To nije tvrdnja o relativnoj kvaliteti modela; odluku treba proveriti na sopstvenom eval skupu.
- Agentic best practices, anti-patterns, sedam etapa implementacije i linkove na primarne izvore.
- Detaljan budući implementacioni nacrt u `VODIC.md`: kontrakti, stanja, čvorovi grafa, dozvole, pozivanje, model routing i metrike.
- Novi interaktivni factory loop: online evals, self-improvement, replay benchmark, model routing i A/B test, sa kratkim primerom razlike između tracea i stvarnog ishoda.
- [UCENJE.md](UCENJE.md): osam nedelja, 32 sesije, konkretni artefakti, prolazni kriterijumi, šabloni za scorer, benchmark, routing i A/B plan.
- [vezbe/](vezbe/README.md): osam izmišljenih runova za prvo samostalno ocenjivanje i ključ za poređenje.

## Kako koristiti kao temelj za budući pravi sistem

1. Izaberi jedan repozitorijum i jedan tip posla. Napiši ticket schema, acceptance kriterijume i stanje workflowa.
2. Napravi verifikacioni skill koji pokreće aplikaciju, vozi ključni tok i čuva log, screenshot ili video.
3. Tek onda poveži chat/CLI/scheduler adaptere sa trajnim event storeom i redom.
4. Dodaj izolovane workere, nezavisni review i merge politiku u fazama. Počni read-only i draft PR izlazom.
5. Meri uspeh po stvarnom ishodu i trošku po uspešnom tiketu; vraćaj regresije u eval skup.

Istraživanje je ažurirano 20. novembra 2026. Linkovi i napomene o atribuciji nalaze se u sekciji „Izvori“ unutar aplikacije. Pet koraka sa korisničke slike potvrđeno je i u [Zachovom tekstu o software factory sistemima](https://www.warp.dev/blog/build-production-software-factory).
