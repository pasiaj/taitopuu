# Taitopuu

## [Peruskoulun opetussuunnitelma taitopuuna](https://pasiaj.github.io/taitopuu/)

- [Mitä peruskoulussa oikeastaan opitaan? Esittely](https://pasiaj.github.io/taitopuu/peruskoulu/esittely/)
- [Peruskoulu Path of Exile -taitopuuna](https://pasiaj.github.io/taitopuu/peruskoulu/)
- [Peruskoulu oppiaineittain](https://pasiaj.github.io/taitopuu/peruskoulu/?jarjestys=oppiaineet) ja [laaja-alaisen osaamisen mukaan](https://pasiaj.github.io/taitopuu/peruskoulu/?jarjestys=laaja-alaiset)
- [Peruskoulu Diablo II -versiona](https://pasiaj.github.io/taitopuu/peruskoulu/diablo/)
- [Peruskoulu Duolingon vinkkelistä](https://pasiaj.github.io/taitopuu/peruskoulu/duolingo/)
- [Peruskoulu Minecraft-näkymänä](https://pasiaj.github.io/taitopuu/peruskoulu/minecraft/)
- [Peruskoulu Skyrimin tähtikuvioina](https://pasiaj.github.io/taitopuu/peruskoulu/skyrim/)

Tekijä: [Pasi A Jokinen](https://pasiaj.com/). Sama sivusto on myös [pasiaj.comissa](https://pasiaj.com/taitopuu/).

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
| `peruskoulu/?jarjestys=oppiaineet`, `?jarjestys=laaja-alaiset` | Sama Path of Exile -puu oppiaineiden tai laaja-alaisten osaamisten (L1–L7) kautta järjestettynä. Taito näkyy jokaisessa haarassa, johon se kuuluu. Kotihaarassa ovat myös sen käsitteet, ja muut kopiot on merkitty katkoviivakehyksellä. Kotihaara on oppiaineissa se aine, jossa taitoa opetetaan sen ylimmällä tasolla, ja laaja-alaisissa harvinaisin merkityistä L:istä. |
| `peruskoulu/esittely/` | Animoitu kierros katsojalle, joka ei tunne puuta |
| `peruskoulu/duolingo/` | Duolingo-näkymä: kurssi = osaamisalue, osio = vaihe, yksikkö = luokka, pallo = osataito, ja sen oppitunti kysyy niitä käsitteitä, jotka opitaan sillä luokalla (monivalinnat datasta). Kertauspokaalit, huipputaso, XP, putki ja päivän tavoite tallentuvat selaimeen. |
| `peruskoulu/minecraft/` | Minecraft-näkymä: välilehti = osaamisalue, edistysaskelpuu kasvaa oikealle (alue → aihe → osataito saman aiheen edellytyksen perään), kokemuspalkin taso = luokka, "Edistysaskel saavutettu!" -ilmoitukset, työpöytä näyttää atomit raaka-aineina. Grafiikka on ohjelmallista pikseligrafiikkaa. |
| `peruskoulu/skyrim/` | Skyrim-näkymä: 18 osaamisaluetta = Skyrimin 18 taitoa tähtikuvioina. Tähdet ovat osataitoja, jotka nousevat ylös luokan mukaan. Perkin tasot ovat POPSin vaiheet ja huippu, taitotaso 15–100 on alueen edistyminen, ja taivas kääntyy alueesta toiseen. |
| `peruskoulu/nosto/` | Upotettavat käyttöliittymänostot artikkeleihin: `?nayta=solmu&id=…` (atomeista taito), `luokat` (puu luokka luokalta), `polku&id=…` (mitä taito vaatii), `oppiaine&tag=YO`, `kortti&id=…` (taso ja kriteerit), `alue&id=…`. Animaatio alkaa, kun nosto tulee näkyviin. |
| `peruskoulu/katso-myos.js` | Vähäeleinen "Katso myös" -rivi muihin näkymiin, yhteinen kaikille sivuille |
| `peruskoulu/diablo/` | Diablo II -näkymä: osaamisalue = hahmoluokka, aihe = taitovälilehti, rivi = luokka, jolla taito alkaa, taitotaso 0–20, synergiat = edellytykset muilta alueilta |
| `peruskoulu/puu.js` | Asettelu ja piirto, yhteinen molemmille |
| `peruskoulu/data.js` | Puun data (generoitu) |
| `tools/peruskoulu-data.py` | Rakentaa `data.js`:n taitopuun korteista |
| `tools/meta.py` | Kirjoittaa kaikkien sivujen metatagit (kuvaus, tekijä, kanoninen osoite, Open Graph, Twitter-kortti, favicon). Some-kuva `peruskoulu/kuvat/some.jpg` on otettu esittelyn aloitusruudusta (`esittely/?kuva`, 1200 × 630). |
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
