# INC-01 — Checkout timeout, izmišljeni primer

Source ID: INC-01
Vrsta: sintetički primer za učenje
Autor: Harness Lab
Datum: 2026-11-23
Pristup: javni primer, bez privatnih podataka

**P1.** U 09:10 povećan je broj checkout zahteva sa HTTP 504. Stopa je porasla sa 0,2% na 8,1% tokom 15 minuta. Prvi alarm stigao je u 09:18.

**P2.** U 09:05 puštena je konfiguraciona promena koja je skratila timeout upstream poziva sa 5 s na 1 s. Logovi pogođenih zahteva pokazuju prekid na približno 1 s.

**P3.** U 09:32 konfiguracija je vraćena na 5 s. Do 09:45 stopa HTTP 504 vratila se na 0,3%. Nije bilo promene aplikacionog koda tokom rollbacka.

**P4.** Staging provera reprodukovala je 504 sa timeoutom od 1 s i testnim upstreamom koji odgovara posle 1,4 s. Sa 5 s isti test prolazi. Ovo potvrđuje neposredni uzrok.

**P5.** Tim planira konfiguracioni test, CI prag i monitoring latencije. Ti koraci još nisu pušteni niti verifikovani. Nema dokaza o gubitku podataka.
