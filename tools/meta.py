#!/usr/bin/env python3
"""Kirjoittaa jokaisen sivun <head>-osaan metatagit somea ja hakukoneita varten.

Tagit ovat merkkien <!-- meta:alku --> ja <!-- meta:loppu --> välissä, ja
ajo korvaa ne aina kokonaan. Muokkaa sivujen tekstejä tässä tiedostossa ja aja:

    python3 tools/meta.py

Kanoninen osoite ja kuvat osoittavat GitHub Pagesiin (BASE). Sama sivusto on
myös osoitteessa pasiaj.com/taitopuu/, ja se kanonisoidaan Pagesiin.
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://pasiaj.github.io/taitopuu/'
IMAGE = BASE + 'peruskoulu/kuvat/some.jpg'
IMAGE_ALT = 'Otsikko "Mitä peruskoulussa oikeastaan opitaan?" peruskoulun taitopuun päällä: 18 osaamisaluetta säteittäisinä haaroina.'
AUTHOR = 'Pasi A Jokinen'
AUTHOR_URL = 'https://pasiaj.com/'
SITE = 'Taitopuu'

# polku: (otsikko, kuvaus, indeksoidaanko)
PAGES = {
    'index.html': (
        'Taitopuu: peruskoulun opetussuunnitelma taitopuuna',
        'Kaikki, mitä huippuoppilas osaa peruskoulun päättyessä: 617 taitoa ja 1 874 käsitettä '
        'Opetushallituksen opetussuunnitelmasta jaoteltuna 18 osaamisalueeseen ja piirrettynä pelien taitopuina.', True),
    'peruskoulu/esittely/index.html': (
        'Peruskoulu taitopuuna',
        'Kymmenen vaiheen kierros peruskoulun taitopuuhun: käsitteistä taidoiksi, taidoista osaamisalueiksi '
        'ja luokka luokalta huipputasolle. Opetussuunnitelma satojen sivujen sijaan yhtenä karttana.', True),
    'peruskoulu/index.html': (
        'Peruskoulun taitopuu',
        'Koko peruskoulun opetussuunnitelma yhtenä Path of Exile -tyylisenä taitopuuna. Järjestä osaamisalueittain, '
        'oppiaineittain tai laaja-alaisittain, katso taso luokittain ja kaikki, mitä taito vaatii.', True),
    'peruskoulu/diablo/index.html': (
        'Peruskoulun taitopuu: Diablo II',
        'Peruskoulun osaamisalueet hahmoluokkina ja aiheet taitovälilehtinä. Taitotaso 0–20 kasvaa luokka luokalta, '
        'ja synergiat tulevat muilta alueilta.', True),
    'peruskoulu/duolingo/index.html': (
        'Taitopolku: peruskoulu oppimispolkuna',
        'Peruskoulu luokasta 1 luokkaan 9 Duolingon tapaan: oppitunnit taitopuun käsitteistä, kertaus, '
        'XP ja päivän tavoite.', True),
    'peruskoulu/minecraft/index.html': (
        'Peruskoulun edistysaskeleet: Minecraft',
        'Peruskoulun taidot Minecraftin edistysaskeleina. Kokemuspalkin taso on luokka, ja työpöytä näyttää, '
        'mistä käsitteistä taito rakentuu.', True),
    'peruskoulu/skyrim/index.html': (
        'Peruskoulun tähtikuviot: Skyrim',
        'Peruskoulun 18 osaamisaluetta tähtikuvioina yötaivaalla, kuten Skyrimin 18 taitoa. '
        'Tähdet ovat taitoja, jotka syttyvät luokka luokalta.', True),
    'peruskoulu/nosto/index.html': (
        'Taitopuu: nosto',
        'Upotettava pala peruskoulun taitopuusta.', False),
}

ICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
        "%3Crect width='64' height='64' rx='14' fill='%2307080b'/%3E"
        "%3Cg stroke='%23d9b45c' stroke-width='3' stroke-linecap='round'%3E"
        "%3Cpath d='M32 32 14 16M32 32 50 16M32 32 12 40M32 32 52 40M32 32 32 54'/%3E%3C/g%3E"
        "%3Ccircle cx='32' cy='32' r='7' fill='%23f1d27a'/%3E"
        "%3Cg fill='%2358cc02'%3E%3Ccircle cx='14' cy='16' r='4'/%3E%3Ccircle cx='50' cy='16' r='4'/%3E"
        "%3Ccircle cx='12' cy='40' r='4'/%3E%3Ccircle cx='52' cy='40' r='4'/%3E%3Ccircle cx='32' cy='54' r='4'/%3E%3C/g%3E%3C/svg%3E")


def block(path, title, desc, index):
    url = BASE + re.sub(r'index\.html$', '', path)
    e = lambda s: html.escape(s, quote=True)
    t = [
        '<!-- meta:alku (tools/meta.py) -->',
        f'<meta name="description" content="{e(desc)}">',
        f'<meta name="author" content="{e(AUTHOR)}">',
        f'<link rel="author" href="{AUTHOR_URL}">',
        f'<link rel="canonical" href="{url}">',
        f'<meta name="robots" content="{"index, follow" if index else "noindex"}">',
        '<meta name="theme-color" content="#07080b">',
        f'<link rel="icon" href="{ICON}">',
        f'<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{SITE}">',
        '<meta property="og:locale" content="fi_FI">',
        f'<meta property="og:title" content="{e(title)}">',
        f'<meta property="og:description" content="{e(desc)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{IMAGE}">',
        '<meta property="og:image:type" content="image/jpeg">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{e(IMAGE_ALT)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{e(title)}">',
        f'<meta name="twitter:description" content="{e(desc)}">',
        f'<meta name="twitter:image" content="{IMAGE}">',
        f'<meta name="twitter:image:alt" content="{e(IMAGE_ALT)}">',
        '<!-- meta:loppu -->',
    ]
    return '\n'.join(t)


for path, (title, desc, index) in PAGES.items():
    f = os.path.join(ROOT, path)
    s = open(f, encoding='utf-8').read()
    s = re.sub(r'\n?<!-- meta:alku.*?<!-- meta:loppu -->', '', s, flags=re.S)
    s = re.sub(r'<title>.*?</title>', f'<title>{html.escape(title)}</title>', s, count=1, flags=re.S)
    s = s.replace(f'<title>{html.escape(title)}</title>', f'<title>{html.escape(title)}</title>\n' + block(path, title, desc, index), 1)
    open(f, 'w', encoding='utf-8').write(s)
    print(f'{path}: {title}')
