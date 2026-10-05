# Taitopuu

Opetussuunnitelmat taitopuina, Path of Exile -pelin tyyliin.

**Peruskoulu:** <https://pasiaj.com/taitopuu/peruskoulu/>, esittely
<https://pasiaj.com/taitopuu/peruskoulu/esittely/>

Kaikki, mitä huippuoppilas osaa peruskoulun päättyessä, taitoina eikä
oppiaineina. Puussa on 18 osaamisaluetta, 134 aihetta, 617 osataitoa ja
1 874 atomia, ja niiden välillä on 2 070 edellytyslinkkiä. Rakenne on johdettu
Opetushallituksen *Perusopetuksen opetussuunnitelman perusteista 2014*:
tavoitteista, sisältöalueista ja arviointikriteereistä vuosiluokilla 1–2,
3–6 ja 7–9 sekä laaja-alaisesta osaamisesta.

- **Rakenne:** osaamisalue → aihe → osataito → atomi. Oppiaine on vain tagi:
  sama taito asuu yhdessä paikassa, ja muut linkittävät siihen edellytyksenä.
- **Taso luokittain:** jokaisella osataidolla on luokka, jolla se alkaa,
  taso vaiheissa 1–2, 3–6 ja 7–9 sekä huipputaso (9. luokan arvosana 9).
- **Kriteerit:** POPSin arviointikriteerit sanatarkasti. Kaikki 1 334
  lainausta on tarkistettu koneellisesti lähdettä vasten.
- **Luokkasuodatus:** näyttää vain yhdellä luokalla opittavat asiat.

## Rakenne

| Polku | Mitä |
|---|---|
| `peruskoulu/index.html` | Interaktiivinen taitopuu (canvas, ei riippuvuuksia) |
| `peruskoulu/esittely/` | Animoitu kierros katsojalle, joka ei tunne puuta |
| `peruskoulu/puu.js` | Asettelu ja piirto, yhteinen molemmille |
| `peruskoulu/data.js` | Puun data (generoitu) |
| `tools/peruskoulu-data.py` | Rakentaa `data.js`:n taitopuun korteista |
| `tools/julkaise.sh` | Kopioi sivun xpostiin (pasiaj.com) |

Sivu toimii suoraan tiedostona: avaa `peruskoulu/index.html` selaimessa.

## Sisällön lähde

Puun sisältö on Obsidian-kortteina Pasin yksityisessä tietopankissa, ja
`data.js` generoidaan niistä. Korttien lähde on OPH:n ePerusteet-rajapinta
(peruste 419550, muokattu 2026-09-15).

**Mikä on tarkistettu:** kriteerilainaukset on tarkistettu sanatarkasti.
Tasokuvaukset, huipputasot, esimerkit ja atomien luokat ovat LLM:n johtamia
lähteestä, eikä niitä ole tarkistettu käsin.

Lähde: Opetushallitus, Perusopetuksen opetussuunnitelman perusteet 2014
(ePerusteet, eperusteet.opintopolku.fi).

## Julkaisu

```sh
python3 tools/peruskoulu-data.py ~/family-kb/pasi/projects/sivustot/peruskoulu/taitopuu
tools/julkaise.sh          # kopioi xpostin nginx/www/pasiaj.com/taitopuu/peruskoulu/
```

Sen jälkeen commit ja push xpostiin julkaisee sivun.
