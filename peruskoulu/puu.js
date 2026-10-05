/* Peruskoulun taitopuu: asettelu ja piirto. Käyttävät index.html ja esittely/.
 * Data: window.TAITOPUU (data.js, generoi tools/peruskoulu-data.py).
 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const R_AREA = 700;          // alueiden keskusten säde
  const R_FIRST = 1060;         // ensimmäisen aiheryppään säde
  const STEP = 250;            // aiheryppäiden etäisyys toisistaan
  const SIZE = [4.2, 10, 19, 34]; // atomi, osataito, aihe, alue
  const GROUP_GAP = 0.07;

  function build(data) {
    const byId = new Map();
    const nodes = data.nodes.map(n => Object.assign({ kids: [], need: [], usedBy: [] }, n));
    nodes.forEach(n => byId.set(n.id, n));
    nodes.forEach(n => { if (n.p && byId.has(n.p)) byId.get(n.p).kids.push(n); });
    nodes.forEach(n => (n.e || []).forEach(id => {
      const m = byId.get(id);
      if (m) { n.need.push(m); m.usedBy.push(n); }
    }));
    const sortKids = n => n.kids.sort((a, b) => cmpId(a.id, b.id));
    nodes.forEach(sortKids);

    // alkaa-luokka periytyy ylös (pienin) ja alas (vanhemmalta)
    const startOf = n => {
      if (n._s != null) return n._s;
      let s = n.s;
      if (s == null && n.kids.length) s = Math.min(...n.kids.map(startOf));
      if (s == null) s = 9;
      return (n._s = s);
    };
    nodes.forEach(startOf);
    nodes.forEach(n => {
      if (n.t === 0 && n.s == null && n.p) n._s = byId.get(n.p)._s;
      // oppiaineet periytyvät atomeille
      if (!n.op && n.p) { const p = byId.get(n.p); if (p && p.op) n.op = p.op; }
    });
    nodes.forEach(n => { if (!n.op && n.t === 2) n.op = [...new Set(n.kids.flatMap(k => k.op || []))]; });

    const areaOrder = data.ryhmat.flatMap(g => g.a);
    const areas = areaOrder.map(id => byId.get(id)).filter(Boolean);
    areas.forEach((a, i) => {
      a.group = data.ryhmat.findIndex(g => g.a.includes(a.id));
      a.hue = (i / areas.length) * 360;
    });
    nodes.forEach(n => {
      const a = byId.get(n.a);
      n.area = a;
      n.color = hsl(a.hue, 72, 60);
      n.colorDim = hsl(a.hue, 30, 26);
    });

    const root = { id: 'ROOT', t: 4, n: 'Huippuoppilas', x: 0, y: 0, r: 58, kids: areas, need: [], usedBy: [], _s: 1,
                   color: '#f1d27a', colorDim: '#5b4a24', area: null };
    layout(root, areas, data.ryhmat, data.layout === 'rows');

    const edges = [];   // [a, b, kind] kind: 0 runko, 1 hierarkia, 2 edellytys
    areas.forEach(a => {
      edges.push([root, a, 0]);
      const sorted = a.kids.slice().sort((p, q) => p.rr - q.rr);
      if (data.layout === 'rows') {
        // haarautuva runko: rypäs liittyy lähimpään sisempään ryppääseen (tai alueen keskukseen)
        sorted.forEach((ai, i) => {
          const inner = sorted.slice(0, i).filter(b => b.rr < ai.rr - 120);
          const par = inner.length ? inner.reduce((m, b) => Math.hypot(b.x - ai.x, b.y - ai.y) < Math.hypot(m.x - ai.x, m.y - ai.y) ? b : m) : a;
          edges.push([par, ai, 0]);
        });
      } else {
        let prev = a;
        sorted.forEach(ai => { edges.push([prev, ai, 0]); prev = ai; });
      }
      a.kids.forEach(ai => ai.kids.forEach(o => {
        edges.push([ai, o, 1]);
        o.kids.forEach(t => edges.push([o, t, 1]));
      }));
    });
    const prereq = [];
    nodes.forEach(n => n.need.forEach(m => prereq.push([m, n, n.a !== m.a])));

    const all = [root, ...nodes];
    return { root, nodes, all, byId, areas, edges, prereq, groups: data.ryhmat };
  }

  function cmpId(a, b) {
    const x = a.split('.'), y = b.split('.');
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      if (x[i] === undefined) return -1;
      if (y[i] === undefined) return 1;
      const d = (isNaN(x[i]) || isNaN(y[i])) ? x[i].localeCompare(y[i]) : x[i] - y[i];
      if (d) return d;
    }
    return 0;
  }

  function hsl(h, s, l) { return `hsl(${h.toFixed(1)},${s}%,${l}%)`; }

  function layout(root, areas, groups, rows) {
    const weight = a => 6 + a.kids.reduce((s, ai) => s + ai.kids.length, 0);
    const W = areas.reduce((s, a) => s + weight(a), 0);
    const avail = TAU - GROUP_GAP * groups.length;
    let ang = -Math.PI / 2 - (weight(areas[0]) / W) * avail / 2;
    let lastGroup = areas[0].group;
    const clusters = [];
    areas.forEach(a => {
      if (a.group !== lastGroup) { ang += GROUP_GAP; lastGroup = a.group; }
      const span = (weight(a) / W) * avail;
      const th = ang + span / 2;
      a.th = th; a.span = span;
      a.x = Math.cos(th) * R_AREA; a.y = Math.sin(th) * R_AREA; a.r = SIZE[3];
      ang += span;
      const zig = Math.min(span * 0.24, 0.11);
      a.kids.forEach(ai => {
        const nOs = ai.kids.length;
        ai.ro = Math.max(58, 16 + nOs * 15);                 // osataitorenkaan säde
        ai.cr = ai.ro + 46;                                  // ryppään säde atomeineen
        ai.r = SIZE[2];
      });
      const put = (ai, r, t) => { ai.tx = Math.cos(t) * r; ai.ty = Math.sin(t) * r; ai.x = ai.tx; ai.y = ai.ty; clusters.push(ai); };
      if (!rows) {
        a.kids.forEach((ai, j) => {
          const r = R_FIRST + j * STEP + (j % 2 ? 40 : 0);
          put(ai, r, th + (a.kids.length > 1 ? (j % 2 ? zig : -zig) * Math.min(1, 1100 / r) : 0));
        });
      } else {
        // Rivit: haarassa voi olla kymmeniä ryppäitä, joten ne asetellaan
        // kaaririveihin niin monta rinnakkain kuin haaran leveyteen mahtuu.
        let r = R_FIRST, i = 0;
        while (i < a.kids.length) {
          const next = a.kids.slice(i, i + 12);
          const d = 2 * Math.max(...next.map(x => x.cr)) + 30;
          const cap = Math.max(1, Math.min(next.length, Math.floor(span * 0.9 * r / d)));
          const row = a.kids.slice(i, i + cap);
          row.forEach((ai, j) => put(ai, r + (j % 2) * 30, th + (cap > 1 ? (j - (cap - 1) / 2) * (span * 0.9 / cap) : 0)));
          r += Math.max(...row.map(x => x.cr)) * 2 + 40;
          i += cap;
        }
      }
    });
    // törmäysten purku: ryppäät eivät saa mennä päällekkäin
    for (let it = 0; it < 260; it++) {
      for (let i = 0; i < clusters.length; i++) {
        const c = clusters[i];
        for (let k = i + 1; k < clusters.length; k++) {
          const d = clusters[k];
          let dx = d.x - c.x, dy = d.y - c.y;
          const dist = Math.hypot(dx, dy) || 1, min = c.cr + d.cr + 18;
          if (dist < min) {
            const push = (min - dist) / 2 / dist;
            dx *= push; dy *= push;
            c.x -= dx; c.y -= dy; d.x += dx; d.y += dy;
          }
        }
        const rad = Math.hypot(c.x, c.y), minR = R_AREA + 120 + c.cr;
        if (rad < minR) { c.x *= minR / rad; c.y *= minR / rad; }
        c.x += (c.tx - c.x) * 0.02; c.y += (c.ty - c.y) * 0.02;
      }
    }
    clusters.forEach(ai => {
      ai.rr = Math.hypot(ai.x, ai.y);
      const out = Math.atan2(ai.y, ai.x);
      const n = ai.kids.length;
      ai.kids.forEach((o, i) => {
        const a = out + Math.PI + (i + 0.5) / n * TAU;   // aloitetaan keskustan puolelta
        o.x = ai.x + Math.cos(a) * ai.ro; o.y = ai.y + Math.sin(a) * ai.ro; o.r = SIZE[1];
        const m = o.kids.length;
        const fan = Math.min(1.5, 0.42 * m);
        o.kids.forEach((t, k) => {
          const b = a + (m > 1 ? (k / (m - 1) - 0.5) * fan : 0);
          const rr = 27 + (k % 2) * 7;
          t.x = o.x + Math.cos(b) * rr; t.y = o.y + Math.sin(b) * rr; t.r = SIZE[0];
        });
      });
    });
  }

  /* ------------------------------------------------------------------ piirto */

  class View {
    constructor(canvas, model, opts) {
      this.c = canvas; this.ctx = canvas.getContext('2d'); this.m = model;
      this.o = Object.assign({ labels: true, crossLinks: true }, opts || {});
      this.cam = { x: 0, y: 0, z: 0.16 };
      this.grade = 10;          // 1–9, 10 = huippu
      this.sel = null; this.hover = null;
      this.filter = null;       // oppiainetagi
      this.onlySet = null;      // Set: vain yhden luokan asiat näkyvissä (setOnly)
      this.focus = null;        // Set korostettavista solmuista (polku)
      this.dimOthers = false;
      this.dirty = true; this.anim = null; this.t0 = performance.now();
      this.pulse = true;
      this.resize();
      const loop = t => {
        if (this.anim) this.stepAnim(t);
        if (this.dirty || (this.pulse && (this.sel || this.hover || this.focus))) { this.draw(t); this.dirty = false; }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
    resize() {
      const dpr = window.devicePixelRatio || 1, r = this.c.getBoundingClientRect();
      this.w = r.width; this.h = r.height; this.dpr = dpr;
      this.c.width = Math.round(r.width * dpr); this.c.height = Math.round(r.height * dpr);
      this.dirty = true;
    }
    toWorld(px, py) { return [(px - this.w / 2) / this.cam.z + this.cam.x, (py - this.h / 2) / this.cam.z + this.cam.y]; }
    toScreen(x, y) { return [(x - this.cam.x) * this.cam.z + this.w / 2, (y - this.cam.y) * this.cam.z + this.h / 2]; }
    fitAll(pad) {
      let r = 0; this.m.all.forEach(n => { r = Math.max(r, Math.hypot(n.x, n.y) + (n.cr || 30)); });
      return { x: 0, y: 0, z: Math.min(this.w, this.h) / (2 * r) * (pad || 0.95) };
    }
    fitNodes(list, pad) {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      list.forEach(n => { const r = (n.cr || n.r || 10) + 30; x0 = Math.min(x0, n.x - r); y0 = Math.min(y0, n.y - r); x1 = Math.max(x1, n.x + r); y1 = Math.max(y1, n.y + r); });
      const z = Math.min(this.w / (x1 - x0), this.h / (y1 - y0)) * (pad || 0.9);
      return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, z: Math.min(z, 4) };
    }
    flyTo(target, ms) {
      this.anim = { from: Object.assign({}, this.cam), to: target, t0: performance.now(), ms: ms || 900 };
    }
    stepAnim(t) {
      const a = this.anim, k = Math.min(1, (t - a.t0) / a.ms);
      const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      // zoomataan logaritmisesti, jotta lento näyttää tasaiselta
      const lz = Math.log(a.from.z) + (Math.log(a.to.z) - Math.log(a.from.z)) * e;
      this.cam.z = Math.exp(lz);
      this.cam.x = a.from.x + (a.to.x - a.from.x) * e;
      this.cam.y = a.from.y + (a.to.y - a.from.y) * e;
      this.dirty = true;
      if (k >= 1) { this.anim = null; if (a.done) a.done(); }
    }
    // Näytä vain luokalla g opittavat: atomit, joiden luokka on g, ja osataidot,
    // jotka alkavat g:llä tai joilla on g:n atomi, sekä niiden aiheet ja alueet.
    setOnly(g) {
      if (g == null) { this.onlySet = null; this.dirty = true; return null; }
      const set = new Set();
      for (const n of this.m.nodes) {
        if ((n.t === 0 && n._s === g) || (n.t === 1 && (n._s === g || n.kids.some(k => k._s === g)))) {
          set.add(n);
          let c = n.p && this.m.byId.get(n.p);
          while (c) { set.add(c); c = c.p && this.m.byId.get(c.p); }
        }
      }
      this.onlySet = set; this.dirty = true;
      return set;
    }
    level(n) {           // 0 = lukittu, 0..1 = kehittyy, 1 = huipputaso
      if (n.t === 4) return 1;
      if (this.onlySet) return this.onlySet.has(n) ? 0.9 : 0;
      const s = n._s || 1, g = this.grade;
      if (g < s) return 0;
      if (g >= 10) return 1;
      return Math.max(0.25, Math.min(0.92, (g - s + 1) / (10 - s)));
    }
    passes(n) {
      if (this.focus) return this.focus.has(n);
      if (this.onlySet && n.t <= 2 && !this.onlySet.has(n)) return false;
      if (!this.filter) return true;
      if (n.t === 4) return true;
      if (n.t >= 2) return true;
      return (n.op || []).includes(this.filter);
    }
    pick(px, py) {
      const [x, y] = this.toWorld(px, py);
      let best = null, bd = 1e9;
      for (const n of this.m.all) {
        const r = Math.max(n.r, 7 / this.cam.z) + 4 / this.cam.z;
        const d = Math.hypot(n.x - x, n.y - y);
        if (d < r && d < bd) { bd = d; best = n; }
      }
      return best;
    }
    draw(t) {
      const ctx = this.ctx, z = this.cam.z, dpr = this.dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#07080b'; ctx.fillRect(0, 0, this.w, this.h);
      // taustan hehku
      const [cx, cy] = this.toScreen(0, 0);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 4200 * z);
      g.addColorStop(0, 'rgba(70,58,34,0.35)'); g.addColorStop(0.5, 'rgba(26,24,30,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, this.w, this.h);
      ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (this.w / 2 - this.cam.x * z), dpr * (this.h / 2 - this.cam.y * z));
      const time = (t - this.t0) / 1000;
      const view = this.viewRect();
      const vis = n => n.x + 200 > view[0] && n.x - 200 < view[2] && n.y + 200 > view[1] && n.y - 200 < view[3];

      // alueiden sektorit
      this.m.areas.forEach(a => {
        ctx.beginPath();
        ctx.moveTo(Math.cos(a.th - a.span / 2) * 120, Math.sin(a.th - a.span / 2) * 120);
        ctx.arc(0, 0, 4300, a.th - a.span / 2, a.th + a.span / 2);
        ctx.closePath();
        ctx.fillStyle = `hsla(${a.hue},40%,40%,${this.sel && this.sel.area === a ? 0.06 : 0.025})`;
        ctx.fill();
      });

      // edellytykset (verkko)
      const showCross = this.o.crossLinks && !this.focus;
      if (showCross) {
        ctx.lineWidth = 1 / z;
        for (const [m, n, cross] of this.m.prereq) {
          if (!cross) continue;
          if (this.onlySet && !(this.onlySet.has(m) && this.onlySet.has(n))) continue;
          ctx.strokeStyle = `hsla(${n.area.hue},60%,60%,0.05)`;
          curve(ctx, m, n);
        }
      }
      // runko ja hierarkia
      for (const [a, b, kind] of this.m.edges) {
        if (!vis(a) && !vis(b)) continue;
        const la = Math.min(this.level(a), this.level(b));
        const on = this.passes(a) && this.passes(b);
        if (!on && this.onlySet) continue;
        ctx.lineWidth = (kind === 0 ? 7 : b.t === 0 ? 1.6 : 3.2) * (z < 0.3 ? 0.3 / z * 0.6 + 0.4 : 1);
        if (la > 0 && on) {
          ctx.strokeStyle = kind === 0 ? `rgba(226,190,110,${0.35 + 0.5 * la})` : hslA(b.area || a.area, 65, 55, 0.25 + 0.55 * la);
        } else {
          ctx.strokeStyle = on ? 'rgba(90,82,70,0.35)' : 'rgba(60,56,50,0.12)';
        }
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // valitun/korostetun edellytykset
      const hl = this.sel || this.hover;
      if (hl || (this.focus && this.focus.size < 140)) {
        const list = this.focus ? this.m.prereq.filter(([m, n]) => this.focus.has(m) && this.focus.has(n))
                                : this.m.prereq.filter(([m, n]) => m === hl || n === hl);
        for (const [m, n] of list) {
          const into = n === hl || this.focus;
          ctx.lineWidth = 2.6 / Math.sqrt(z);
          ctx.strokeStyle = into ? 'rgba(255,214,120,0.9)' : 'rgba(140,200,255,0.8)';
          ctx.setLineDash([10 / z, 6 / z]); ctx.lineDashOffset = -time * 30 / z;
          curve(ctx, m, n, true);
          ctx.setLineDash([]);
        }
      }
      // solmut
      const order = this.m.all.slice().sort((a, b) => a.t - b.t);
      for (const n of order) {
        if (!vis(n)) continue;
        if (n.t === 0 && z < 0.12) continue;
        this.drawNode(ctx, n, z, time);
      }
      // nimet
      if (this.o.labels) this.drawLabels(ctx, z, vis);
    }
    viewRect() {
      const [x0, y0] = this.toWorld(0, 0), [x1, y1] = this.toWorld(this.w, this.h);
      return [x0, y0, x1, y1];
    }
    drawNode(ctx, n, z, time) {
      const lv = this.level(n), on = this.passes(n);
      if (!on && this.onlySet) return;   // luokkasuodatus: muut luokat piiloon
      const r = n.r;
      const sel = n === this.sel, hov = n === this.hover;
      const a = on ? 1 : 0.1;
      ctx.globalAlpha = a;
      if (lv > 0 && on && n.t >= 1) {
        const glow = (n.t === 4 ? 2.6 : n.t === 3 ? 2.4 : 2.1) * r * (0.7 + 0.5 * lv);
        const gr = ctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, glow);
        const col = n.t === 4 ? '255,214,120' : rgbOf(n);
        gr.addColorStop(0, `rgba(${col},${0.35 * lv + (sel ? .3 : 0)})`); gr.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(n.x, n.y, glow, 0, TAU); ctx.fill();
      }
      // kehys
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU);
      if (n.t === 4) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 1.6);
        ctx.fillStyle = '#1b160d'; ctx.fill();
        ctx.lineWidth = 6; ctx.strokeStyle = '#d9b45c'; ctx.stroke();
        ctx.beginPath(); ctx.arc(n.x, n.y, r + 12 + pulse * 4, 0, TAU);
        ctx.lineWidth = 2; ctx.strokeStyle = `rgba(217,180,92,${0.3 + 0.3 * pulse})`; ctx.stroke();
        star(ctx, n.x, n.y, r * 0.55, r * 0.25, 8, '#f1d27a');
      } else {
        const fill = lv > 0 ? mix(n, lv) : '#1a1a1d';
        ctx.fillStyle = fill; ctx.fill();
        ctx.lineWidth = n.t === 3 ? 5 : n.t === 2 ? 3.5 : n.t === 1 ? 2.4 : 1.1;
        ctx.strokeStyle = lv > 0 ? (n.t >= 2 ? '#d9b45c' : 'rgba(217,180,92,0.75)') : '#4a4337';
        ctx.stroke();
        if (n.t === 3) {
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 7, 0, TAU);
          ctx.lineWidth = 2; ctx.strokeStyle = lv > 0 ? 'rgba(217,180,92,0.6)' : '#3a352c'; ctx.stroke();
        }
        if (n.dup) {   // sama taito, kotipaikka toisessa haarassa
          ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(n.x, n.y, r + 4, 0, TAU);
          ctx.lineWidth = 1.4; ctx.strokeStyle = lv > 0 ? 'rgba(241,210,122,0.85)' : '#5a5245'; ctx.stroke(); ctx.setLineDash([]);
        }
        if (n.t === 2) {
          ctx.beginPath(); ctx.arc(n.x, n.y, r * 0.45, 0, TAU);
          ctx.fillStyle = lv > 0 ? 'rgba(255,240,200,0.65)' : '#2b2925'; ctx.fill();
        }
      }
      if (sel || hov) {
        ctx.beginPath(); ctx.arc(n.x, n.y, r + 6 / z * 0.6 + 3, 0, TAU);
        ctx.lineWidth = 2.5 / Math.sqrt(z); ctx.strokeStyle = sel ? '#fff4d0' : 'rgba(255,244,208,0.6)'; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    drawLabels(ctx, z, vis) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lab = (n, size, color, dy, bold) => {
        const s = size / z;
        ctx.font = `${bold ? '600 ' : ''}${s}px "Cinzel", "Georgia", serif`;
        ctx.lineWidth = s * 0.28; ctx.strokeStyle = 'rgba(5,5,8,0.9)';
        const y = n.y + dy;
        wrap(n.n, n.t <= 1 ? 22 : 26).forEach((line, i, arr) => {
          const yy = y + (i - (dy < 0 ? arr.length - 1 : 0)) * s * 1.15;
          ctx.strokeText(line, n.x, yy); ctx.fillStyle = color; ctx.fillText(line, n.x, yy);
        });
      };
      const root = this.m.root;
      if (z > 0.3) lab(root, Math.min(26, 30 * z), '#f1d27a', root.r + 22 / z, true);
      // alueiden nimet säteen suuntaisesti, ettei 18 nimeä mene päällekkäin
      for (const a of this.m.areas) {
        const on = this.passes(a);
        const s = Math.max(12, Math.min(20, 46 * z)) / z;
        const flip = Math.cos(a.th) < 0;
        ctx.save();
        ctx.translate(a.x, a.y); ctx.rotate(flip ? a.th + Math.PI : a.th);
        ctx.font = `600 ${s}px "Cinzel", "Georgia", serif`;
        ctx.textAlign = flip ? 'right' : 'left'; ctx.textBaseline = 'middle';
        const dx = (a.r + 14) * (flip ? -1 : 1);
        ctx.lineWidth = s * 0.3; ctx.strokeStyle = 'rgba(5,5,8,0.92)';
        ctx.strokeText(a.n, dx, 0);
        ctx.fillStyle = on ? hsl(a.hue, 80, 80) : '#6d6352'; ctx.fillText(a.n, dx, 0);
        ctx.restore();
      }
      ctx.textAlign = 'center';
      if (z > 0.22) for (const n of this.m.nodes) {
        if (n.t !== 2 || !vis(n) || ((this.onlySet || this.focus) && !this.passes(n))) continue;
        lab(n, Math.min(15, 34 * z), this.passes(n) ? '#e8d6a8' : '#5e5548', n.r + 14 / z * 0.6 + 10, true);
      }
      if (z > (this.onlySet ? 0.38 : 0.62)) for (const n of this.m.nodes) {
        if (n.t !== 1 || !vis(n) || ((this.onlySet || this.focus) && !this.passes(n))) continue;
        lab(n, Math.min(13, 15 * z), this.passes(n) ? '#d9ccb0' : '#5a5246', n.r + 9 / z + 4, false);
      }
      if (this.o.atomLabels !== false && z > (this.onlySet ? 0.9 : 1.7)) for (const n of this.m.nodes) {
        if (n.t !== 0 || !vis(n) || ((this.onlySet || this.focus) && !this.passes(n))) continue;
        lab(n, Math.min(11, 7.5 * z), this.passes(n) ? '#b9ad94' : '#4f493f', n.r + 7 / z + 3, false);
      }
    }
  }

  function wrap(s, max) {
    const words = s.split(' '), out = [];
    let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) out.push(cur);
    return out.slice(0, 3);
  }
  function curve(ctx, m, n, strong) {
    const mx = (m.x + n.x) / 2, my = (m.y + n.y) / 2;
    let cx, cy;
    if (m.area === n.area) {   // lyhyt sivuttainen kaari
      cx = mx - (n.y - m.y) * 0.18; cy = my + (n.x - m.x) * 0.18;
    } else {                   // alueiden välillä kaari taipuu keskustaa kohti
      cx = mx * 0.6; cy = my * 0.6;
    }
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.quadraticCurveTo(cx, cy, n.x, n.y); ctx.stroke();
  }
  function star(ctx, x, y, R, r, k, col) {
    ctx.beginPath();
    for (let i = 0; i < k * 2; i++) {
      const a = i / (k * 2) * TAU - Math.PI / 2, rr = i % 2 ? r : R;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  const rgbCache = new Map();
  function rgbOf(n) {
    const h = n.area ? n.area.hue : 45;
    if (rgbCache.has(h)) return rgbCache.get(h);
    const v = hslToRgb(h / 360, 0.72, 0.6).join(',');
    rgbCache.set(h, v); return v;
  }
  function mix(n, lv) {
    const h = n.area.hue;
    return `hsl(${h},${30 + 45 * lv}%,${22 + 34 * lv}%)`;
  }
  function hslA(a, s, l, al) { return `hsla(${a ? a.hue : 45},${s}%,${l}%,${al})`; }
  function hslToRgb(h, s, l) {
    const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
    return [f(0), f(8), f(4)];
  }

  /* --------------------------------------------------------- polut ja haku */

  // Kaikki, mitä solmu vaatii: edellytykset ja niiden lapset rekursiivisesti
  function closure(n) {
    const out = new Set(), st = [n];
    while (st.length) {
      const c = st.pop();
      if (out.has(c)) continue;
      out.add(c);
      c.need.forEach(m => st.push(m));
      c.kids.forEach(k => st.push(k));
    }
    return out;
  }

  function search(model, q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    const res = [];
    for (const n of model.nodes) {
      if (n.dup) continue;
      const name = n.n.toLowerCase();
      let s = name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : n.id.toLowerCase() === q ? 0
            : (n.k || '').toLowerCase().includes(q) ? 4 : -1;
      if (s >= 0) res.push([s + (3 - n.t) * 0.1, n]);
    }
    return res.sort((a, b) => a[0] - b[0]).slice(0, 30).map(x => x[1]);
  }

  /* ------------------------------------------------- uudelleenryhmittely */
  // Sama puu toisessa järjestyksessä: haarat ovat oppiaineita tai laaja-alaisia
  // osaamisia, ryppäät alkuperäisiä aiheita tai osaamisalueita. Jokainen taito
  // näkyy yhdessä paikassa (kotihaara); muut jäsenyydet ovat n.op / n.la -tageissa.
  const SUBJ_RANGE = { AI: [1, 9], EN: [3, 9], VKA1: [1, 2], RU: [6, 9], MA: [1, 9], YO: [1, 6], BI: [7, 9], GE: [7, 9], FY: [7, 9], KE: [7, 9],
    TT: [7, 9], HI: [3, 9], YH: [3, 9], ET: [1, 9], UE: [1, 9], MU: [1, 9], KU: [1, 9], KS: [1, 9], LI: [1, 9], KO: [7, 9], OP: [1, 9] };
  const SUBJ_GROUPS = [
    ['Kielet', ['AI', 'EN', 'RU', 'VKA1']],
    ['Matematiikka ja luonnontieteet', ['MA', 'YO', 'BI', 'GE', 'FY', 'KE']],
    ['Ihminen ja yhteiskunta', ['HI', 'YH', 'ET', 'UE', 'TT']],
    ['Taide, taito ja liikunta', ['MU', 'KU', 'KS', 'KO', 'LI']],
    ['Ohjaus ja laaja-alaiset', ['OP', 'NONE']]
  ];
  function lastGrade(n) {
    const tl = n.tl || {};
    return tl['7–9'] ? 9 : tl['3–6'] ? 6 : tl['1–2'] ? 2 : (n.s || 1);
  }
  function homeSubject(n, count) {
    const op = n.op || [];
    if (!op.length) return 'NONE';
    if (op.length === 1) return op[0];
    const last = lastGrade(n), first = n.s || 1;
    const cover = g => o => { const r = SUBJ_RANGE[o] || [1, 9]; return r[0] <= g && g <= r[1]; };
    let c = op.filter(cover(last));
    if (!c.length) c = op;
    const c2 = c.filter(cover(first)); if (c2.length) c = c2;
    return c.sort((a, b) => (count[b] || 0) - (count[a] || 0))[0];
  }
  function regroup(data, mode) {
    if (mode !== 'oppiaineet' && mode !== 'laaja') return data;
    const by = new Map(data.nodes.map(n => [n.id, n]));
    const os = data.nodes.filter(n => n.t === 1);
    const tags = n => (mode === 'laaja' ? n.la : n.op) || [];
    const count = {};
    os.forEach(n => tags(n).forEach(k => { count[k] = (count[k] || 0) + 1; }));
    // kotihaara: oppiaineissa se aine, jossa taitoa opetetaan sen ylimmällä tasolla;
    // laaja-alaisissa harvinaisin merkityistä (kertoo taidosta eniten)
    const home = n => mode === 'laaja'
      ? (tags(n).slice().sort((a, b) => (count[a] || 0) - (count[b] || 0) || a.localeCompare(b))[0] || 'NONE')
      : homeSubject(n, count);
    const name = k => k === 'NONE' ? (mode === 'laaja' ? 'Ei laaja-alaista merkintää' : 'Ei oppiainetta (laaja-alaiset alueet)')
      : mode === 'laaja' ? `${k} ${LAAJA[k]}` : OPPIAINEET[k] || k;
    const groups = mode === 'laaja' ? [['Laaja-alainen osaaminen', ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'NONE']]] : SUBJ_GROUPS;
    const branches = new Map(), clusters = new Map(), out = [];
    // Rypäs = alkuperäinen aihe molemmissa järjestyksissä. Aiheessa on enintään
    // kuusi taitoa ja aiheiden nimet ovat yksilöllisiä, joten ryppäitä ei pilkota
    // eikä numeroida. Aiheen nimi kertoo, mitä rypäs sisältää.
    const clusterFor = (k, n) => {
      const bid = 'B:' + k;
      if (!branches.has(bid)) branches.set(bid, { id: bid, t: 3, a: bid, n: name(k), key: k, mode });
      const base = by.get(n.p), key = bid + '|' + base.id;
      if (!clusters.has(key)) clusters.set(key, { node: { id: `C:${k}:${base.id}`, t: 2, a: bid, p: bid, n: base.n, k: base.k, orig: base.id } });
      return clusters.get(key).node;
    };
    const homeOf = new Map();
    os.forEach(n => {
      const h = home(n), all = tags(n).length ? tags(n) : ['NONE'];
      homeOf.set(n.id, 'B:' + h);
      // kotihaara ensin, jotta se saa käsitteet; muut jäsenyydet kopioina ilman käsitteitä
      [h, ...all.filter(k => k !== h)].forEach(k => {
        const c = clusterFor(k, n), dup = k !== h;
        out.push(Object.assign({}, n, { id: dup ? `${n.id}@${k}` : n.id, a: 'B:' + k, p: c.id, orig: [n.a, n.p], home: n.id, homeBranch: 'B:' + h, dup }));
      });
    });
    data.nodes.forEach(n => { if (n.t === 0 && homeOf.has(n.p)) out.push(Object.assign({}, n, { a: homeOf.get(n.p) })); });
    const ryhmat = groups.map(([g, ks]) => ({ n: g, a: ks.map(k => 'B:' + k).filter(id => branches.has(id)) })).filter(g => g.a.length);
    return { ryhmat, nodes: [...branches.values(), ...[...clusters.values()].map(c => c.node), ...out], layout: 'rows', mode };
  }

  const TYYPIT = ['Atomi', 'Osataito', 'Aihe', 'Osaamisalue', 'Juuri'];
  const OPPIAINEET = {
    AI: 'Äidinkieli', EN: 'Englanti', VKA1: 'Vieras kieli A1', RU: 'Ruotsi', MA: 'Matematiikka', YO: 'Ympäristöoppi',
    BI: 'Biologia', GE: 'Maantieto', FY: 'Fysiikka', KE: 'Kemia', TT: 'Terveystieto', HI: 'Historia',
    YH: 'Yhteiskuntaoppi', ET: 'Elämänkatsomustieto', UE: 'Uskonto', MU: 'Musiikki', KU: 'Kuvataide',
    KS: 'Käsityö', LI: 'Liikunta', KO: 'Kotitalous', OP: 'Oppilaanohjaus'
  };
  const LAAJA = {
    L1: 'Ajattelu ja oppimaan oppiminen', L2: 'Kulttuurinen osaaminen, vuorovaikutus ja ilmaisu',
    L3: 'Itsestä huolehtiminen ja arjen taidot', L4: 'Monilukutaito', L5: 'Tieto- ja viestintäteknologinen osaaminen',
    L6: 'Työelämätaidot ja yrittäjyys', L7: 'Osallistuminen, vaikuttaminen ja kestävä tulevaisuus'
  };

  window.Puu = { build, View, closure, search, regroup, TYYPIT, OPPIAINEET, LAAJA };
})();
