# Incident policy v3 — sintetička Confluence stranica

Source ID: POLICY-3
Verzija: 3
Poslednja provera: 2026-11-24
Vlasnik: izmišljeni Incident Management tim
Pristup: javni nastavni primer

**S1 / SEV1.** Predloži SEV1 ako je potvrđen gubitak podataka, incident privatnosti ili bezbednosti, ili potpuni prekid ključne korisničke funkcije za sve korisnike duži od 5 minuta. Čovek potvrđuje konačnu oznaku i pokreće response.

**S2 / SEV2.** Predloži SEV2 ako je ključna funkcija nedostupna delu korisnika duže od 10 minuta ili široko rasprostranjeno sporija duže od 30 minuta, bez potvrđenog gubitka podataka. Čovek potvrđuje konačnu oznaku.

**S3 / SEV3.** Predloži SEV3 za ograničenu degradaciju sa funkcionalnim workaroundom, ako kriterijumi S1 i S2 nisu ispunjeni. Oznaka i dalje traži proveru izvora.

**S4 / Nedovoljno dokaza.** Ako obim, trajanje, prava pristupa ili vreme osvežavanja signala nisu pouzdani, vrati „potrebna provera“, navedi šta nedostaje i nemoj zaključivati severity. Signal stariji od 30 minuta za aktivni incident smatra se zastarelim.

**S5 / Granica sistema.** Read-only analitičar sme da čita odobrene stranice i incident zapise i napiše predlog. Ne menja status, severity, on-call raspored, tiket, produkciju ili Confluence sadržaj.
