# Ključ za sintetički PR review

Pre čitanja, sam napiši nalaze i za svaki navedi red ili uslov iz [diffa](pr-review.diff) i kontraprimer.

1. **Pogrešan redosled provere:** gubitak podataka, globalni prekid i delimičan prekid vraćaju severity pre provere starosti, konflikta i prava pristupa. Primer: INC-05 bi pogrešno dobio SEV2, a INC-12 SEV1 iako je pristup uskraćen. Potrebno je prvo proveriti pouzdanost i dozvole.
2. **Granični uslovi:** policy v3 kaže *duže od* 5, 10 i 30 minuta. Diff koristi `>=`, što pogrešno uključuje tačno 5, 10 i 30 minuta. Dodaj po jedan granični test.
3. **Neobrazložen fallback:** poslednji `return 'SEV3'` daje samouverenu oznaku za nepoznat obim bez workarounda. Primer INC-04. Treba `POTREBNA_PROVERA`.
4. **Nedostaje proverljiv izlaz:** funkcija vraća samo labelu, bez incident ID-a, policy verzije/pasusa, signala i razloga za abstention. Za planirani read-only izveštaj to nije dovoljno; promeni ugovor izlaza i napiši contract test.

Nijedan nalaz nije samo stil. Svaki ima kontraprimer iz pravila i test koji bi ga otkrio. Zeleni CI bez tih testova ne bi dokazao ispravno ponašanje.
