# Opciono povezivanje AI modela

**Podrazumevano stanje:** `AI_ENABLED=0`. [Javni Incident Lab](https://nokibuzz.github.io/agentic-harness-lab/dist/lab.html) koristi samo pravila u browseru. Nikada ne traži API ključ i ne poziva model.

## Lokalno uključivanje

Server u `server/server.mjs` ima jedan adapter za Chat Completions format. Radi sa endpointom koji prihvata isti oblik zahteva; kompatibilnost drugih provajdera proveri zasebno. Nema instalacije SDK-a.

1. Pokreni `npm test` i `npm run dev`. Potvrdi da je AI status „isključen“.
2. U svom lokalnom shellu ili secret manageru postavi `AI_API_KEY`. Ne upisuj pravi ključ u `.env.example`, frontend, URL ili Git.
3. Postavi `AI_ENABLED=1`, `AI_MODEL` na model koji podržava Chat Completions/JSON mode i opciono `AI_BASE_URL` (podrazumevano `https://api.openai.com/v1`). Server prihvata HTTPS endpoint, odnosno HTTP samo za lokalni host.
4. Ponovo pokreni `npm run dev`. Na `http://127.0.0.1:4173/lab.html` odaberi „AI savet“. Vrati `AI_ENABLED=0` i restartuj server da ga isključiš.

Primer promenljivih bez tajne je u [`.env.example`](../.env.example). Ovaj projekat sam ne učitava `.env`; promenljive moraju već biti u okruženju procesa. `.env` i `.env.*` su ignorisani u Gitu, osim praznog primera.

## Ugovor poziva

Frontend šalje samo poznati fixture ID:

```json
{"id":"INC-02"}
```

Server pre poziva modela pronalazi isključivo sintetički zapis iz svog skupa i izvršava `analyzeIncident`. Ako je pristup uskraćen, signal star ili izvori u sukobu, vraća `POTREBNA_PROVERA` bez poziva modela. Za dozvoljen slučaj šalje sintetički incident i sintetička pravila, traži JSON sa `severity`, `reason` i `policy_clause`, zatim proverava tipove i dozvoljene vrednosti. API ključ postoji samo u serverskom `Authorization` headeru; nije deo browser odgovora.

Modelov savet se prikazuje pored determinističkog rezultata. Čak i kad se oznake poklope, `humanReviewRequired` ostaje `true`. Ako se razlikuju, UI prikazuje neslaganje. Adapter ne piše u Confluence, incident sistem, tiket board ili Git.

## Trošak i granice

Provajder može vratiti `usage.prompt_tokens` i `usage.completion_tokens`; UI ih prikaže za taj lokalni poziv. To nisu cene. Za stvarni routing koristi [token laboratoriju](../dist/put.html#tokeni) i meri cenu po tačnoj odluci na istim slučajevima.

Adapter koristi JSON mode zbog šire Chat Completions kompatibilnosti, a zatim validira izlaz na serveru. [OpenAI dokumentacija](https://developers.openai.com/api/docs/guides/structured-outputs) razlikuje JSON mode od strožeg JSON Schema izlaza; ako se odlučiš za konkretan model koji podržava schema format, prilagodi ovaj adapter i zadrži server-side validaciju. Ne upotrebljavaj ovaj sintetički demo kao osnovu za slanje internih podataka eksternom provajderu.

## Kako dodati drugi model

Zameni funkciju `openAiCompatibleAdvice(incident, config)` ili prosledi drugu implementaciju `provider` pri kreiranju servera. Nova implementacija vraća:

```json
{"severity":"SEV2","reason":"Kratak razlog sa izvorom.","policy_clause":"S2","usage":{"input":100,"output":50}}
```

Dodaj test koji proverava: nepoznati fixture se odbija, uskraćeni/zastareli slučaj ne zove provajdera, loš odgovor se odbija i nijedan odgovor ne sadrži ključ. Testovi trenutno koriste lažnog provajdera; nijedan test ne troši tokene.
