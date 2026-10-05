#!/usr/bin/env python3
"""Taitopuun kortit (Obsidian-muistiinpanot) -> peruskoulu/data.js.

Kortit ovat sisällön lähde, ja ne asuvat Pasin family-kb-repossa
(pasi/projects/sivustot/peruskoulu/taitopuu/). Aja, kun kortteja on muokattu:

    python3 tools/peruskoulu-data.py ~/family-kb/pasi/projects/sivustot/peruskoulu/taitopuu

Visualisointi (peruskoulu/) ja esittely (peruskoulu/esittely/) lukevat data.js:n.
"""
import glob, json, os, re

import sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUU = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/family-kb/pasi/projects/sivustot/peruskoulu/taitopuu')
OUT = os.path.join(ROOT, 'peruskoulu', 'data.js')

RYHMAT = [
    ('Ydin', ['AJ', 'DI', 'VU']),
    ('Kielet', ['KI', 'VK']),
    ('Matematiikka ja luonto', ['MA', 'LT', 'EL', 'MP']),
    ('Ihminen ja yhteiskunta', ['HI', 'YH', 'EK']),
    ('Keho ja hyvinvointi', ['HY', 'LI']),
    ('Taide ja tekeminen', ['MU', 'KU', 'TE', 'AR']),
]
TYYPPI = {'alue': 3, 'aihe': 2, 'osataito': 1, 'atomi': 0}


def frontmatter(txt):
    m = re.match(r'---\n(.*?)\n---\n', txt, re.S)
    fm = {}
    for line in m.group(1).splitlines():
        k, _, v = line.partition(':')
        v = v.strip()
        try:
            fm[k.strip()] = json.loads(v)
        except ValueError:
            fm[k.strip()] = v.strip('"')
    return fm, txt[m.end():]


def wikiid(s):
    """[[MA.1.2-slug|Nimi]] -> MA.1.2"""
    m = re.search(r'\[\[([A-Z]{2}(?:\.\d+)*)-', s) or re.search(r'\[\[([A-Z]{2}(?:\.\d+)*)', s)
    return m.group(1) if m else None


def sections(body):
    out, cur = {'': []}, ''
    for line in body.splitlines():
        if line.startswith('## '):
            cur = line[3:].strip()
            out[cur] = []
        else:
            out[cur].append(line)
    return out


def clean(s):
    s = re.sub(r'\[\[[^\]|]+\|([^\]]+)\]\]', r'\1', s)
    s = re.sub(r'\[\[([^\]]+)\]\]', r'\1', s)
    return s.strip()


def para(lines):
    """Ensimmäinen tavallinen kappale otsikon ja kursiivirivin jälkeen."""
    txt, buf = [], []
    for l in lines:
        if l.startswith('# ') or (l.startswith('*') and not l.startswith('**')):
            continue
        if not l.strip():
            if buf:
                txt.append(' '.join(buf)); buf = []
            continue
        buf.append(l.strip())
    if buf:
        txt.append(' '.join(buf))
    return txt


nodes, areas = [], {}
for f in sorted(glob.glob(os.path.join(PUU, '**', '*.md'), recursive=True)):
    txt = open(f).read()
    if not txt.startswith('---'):
        continue
    fm, body = frontmatter(txt)
    if fm.get('tyyppi') not in TYYPPI:
        continue
    sec = sections(body)
    paras = para(sec[''])
    n = {'id': fm['id'], 't': TYYPPI[fm['tyyppi']], 'a': fm['alue'], 'n': fm['nimi']}
    if fm.get('vanhempi'):
        n['p'] = wikiid(fm['vanhempi'])
    e = [wikiid(x) for x in fm.get('edellyttaa') or []]
    if e:
        n['e'] = [x for x in e if x]
    desc = [p for p in paras if not p.startswith('**')]
    if desc:
        n['k'] = clean(desc[0])
    for p in paras:
        if p.startswith('**Osaat, kun:**'):
            n['o'] = clean(p.split('**', 2)[2])
        elif p.startswith('**Esimerkki:**'):
            n['ex'] = clean(p.split('**', 2)[2])
        elif p.startswith('**Huippuoppilas'):
            n['h'] = clean(p.split('**', 2)[2])
    if fm.get('alkaa') not in (None, ''):
        n['s'] = fm['alkaa']
    if fm.get('luokka') not in (None, ''):
        n['s'] = fm['luokka']
    if fm.get('oppiaineet'):
        n['op'] = fm['oppiaineet']
    if fm.get('laaja_alainen'):
        n['la'] = fm['laaja_alainen']
    if 'Taso luokittain' in sec:
        tl = {}
        for l in sec['Taso luokittain']:
            m = re.match(r'\|\s*(\*\*Huippu\*\*[^|]*|\d–\d)\s*\|\s*(.*?)\s*\|$', l)
            if m:
                if m.group(1).startswith('**Huippu'):
                    n['h'] = clean(m.group(2))
                else:
                    tl[m.group(1)] = clean(m.group(2))
        if tl:
            n['tl'] = tl
    if 'Kriteerit (POPS)' in sec:
        c = []
        for l in sec['Kriteerit (POPS)']:
            m = re.match(r'- ([✓⚠~]) (.*?): ”(.*)” — `', l)
            if m:
                c.append([m.group(1), m.group(2).strip(), m.group(3)])
        if c:
            n['c'] = c
    nodes.append(n)
    if n['t'] == 3:
        areas[n['id']] = n

ryhma = [{'n': r, 'a': [a for a in ids if a in areas]} for r, ids in RYHMAT]
data = {'ryhmat': ryhma, 'nodes': nodes}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w') as fh:
    fh.write('// Generoitu: python3 tools/peruskoulu-data.py — älä muokkaa käsin.\n')
    fh.write('window.TAITOPUU = ')
    json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
    fh.write(';\n')
cnt = [sum(1 for n in nodes if n['t'] == t) for t in (3, 2, 1, 0)]
print(f"{OUT}: {cnt[0]} aluetta, {cnt[1]} aihetta, {cnt[2]} osataitoa, {cnt[3]} atomia, "
      f"{sum(len(n.get('e', [])) for n in nodes)} edellytystä, {os.path.getsize(OUT)//1024} kt")
