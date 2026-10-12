/* Hand-drawn diagram kit on top of rough.js.
   A diagram is registered with  diagram(id, {title, sub, section}, s => { ... })
   and drawn on a 1920x1080 sheet. tools/render.py screenshots each one to PNG. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1920, H = 1080;
  const INK = { ink: '#1e1e1e', blue: '#1971c2', orange: '#e8590c', red: '#e03131', green: '#2b8a3e',
    violet: '#6741d9', gray: '#6b7280', amber: '#f08c00', teal: '#0c8599', pink: '#c2255c', white: '#ffffff' };
  const FILL = { ink: '#343a40', blue: '#d0ebff', orange: '#ffe8cc', red: '#ffe3e3', green: '#d3f9d8',
    violet: '#e5dbff', gray: '#eceef1', amber: '#fff3bf', teal: '#c5f6fa', pink: '#ffdeeb', white: '#ffffff', paper: '#fffdf7' };
  const FONT = {
    hand: "'Kalam','Segoe Print','Comic Sans MS',cursive",
    mono: "'Comic Mono','Cascadia Code','Fira Code',Consolas,monospace",
  };
  const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const rr = (x, y, w, h, r) => { r = Math.max(0, Math.min(r, w / 2, h / 2));
    return `M${x + r} ${y} L${x + w - r} ${y} Q${x + w} ${y} ${x + w} ${y + r} L${x + w} ${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} L${x + r} ${y + h} Q${x} ${y + h} ${x} ${y + h - r} L${x} ${y + r} Q${x} ${y} ${x + r} ${y} Z`; };

  class Sketch {
    constructor(svg, seed) { this.svg = svg; this.parent = svg; this.rc = rough.svg(svg); this.seed = seed; this.n = 0; this.texts = []; }
    _s() { return this.seed * 977 + (++this.n) * 13; }
    _add(node) { this.parent.appendChild(node); return node; }
    col(c) { return INK[c] || c; }
    fil(c) { return FILL[c] || c; }

    /* Draw into a rotated group: s.group(-2, cx, cy, () => { ... }) */
    group(rot, cx, cy, fn) { const g = el('g', { transform: `rotate(${rot} ${cx} ${cy})` }, this.parent); const prev = this.parent; this.parent = g; fn(); this.parent = prev; }

    /* Core: a stroked shape with an optional slightly misregistered marker fill. */
    _shape(make, o) {
      const stroke = this.col(o.c || 'ink');
      if (o.fill && !o.hatch) {
        const off = o.off === undefined ? 4 : o.off;
        const f = make({ seed: this._s(), fill: this.fil(o.fill), fillStyle: 'solid', stroke: 'none', roughness: 1.3 });
        if (off) f.setAttribute('transform', `translate(${off} ${off + 1})`);
        this._add(f);
      }
      if (o.hatch) this._add(make({ seed: this._s(), fill: this.col(o.hatch), fillStyle: o.hatchStyle || 'hachure', hachureGap: o.gap || 11,
        fillWeight: o.fw || 2, hachureAngle: o.angle === undefined ? -41 : o.angle, stroke: 'none', roughness: 1.2 }));
      if (!o.noStroke) this._add(make({ seed: this._s(), stroke, strokeWidth: o.sw || 3, roughness: o.rough === undefined ? 1.25 : o.rough,
        bowing: o.bow === undefined ? 1.3 : o.bow, strokeLineDash: o.dash ? [13, 11] : undefined }));
    }

    box(x, y, w, h, o = {}) {
      const d = rr(x, y, w, h, o.r === undefined ? 14 : o.r);
      this._shape(opt => this.rc.path(d, opt), o);
      if (o.label !== undefined) {
        const labels = [].concat(o.label), subs = o.sub ? [].concat(o.sub) : [];
        const fs = o.fs || 34, sfs = o.sfs || 23, lh = Math.round(fs * 1.16), slh = Math.round(sfs * 1.34);
        const total = labels.length * lh + (subs.length ? subs.length * slh + 4 : 0);
        const ty = y + (h - total) / 2 + fs * 0.9;
        const dark = o.fill === 'ink';
        this.text(x + w / 2, ty, labels, { fs, lh, a: 'middle', c: o.tc || (dark ? 'white' : 'ink'), font: o.font || 'hand', w: o.w || 700, _box: [x, y, w, h] });
        if (subs.length) this.text(x + w / 2, ty + (labels.length - 1) * lh + sfs * 1.36, subs, { fs: sfs, lh: slh, a: 'middle',
          c: o.sc || (dark ? '#ced4da' : 'gray'), font: o.sfont || 'mono', _box: [x, y, w, h] });
      }
    }
    circle(cx, cy, d, o = {}) { this._shape(opt => this.rc.circle(cx, cy, d, opt), o); }
    ellipse(cx, cy, w, h, o = {}) { this._shape(opt => this.rc.ellipse(cx, cy, w, h, opt), o); }
    path(d, o = {}) { this._shape(opt => this.rc.path(d, opt), o); }
    poly(pts, o = {}) { this._shape(opt => this.rc.polygon(pts, opt), o); }
    line(x1, y1, x2, y2, o = {}) {
      this._add(this.rc.line(x1, y1, x2, y2, { seed: this._s(), stroke: this.col(o.c || 'ink'), strokeWidth: o.sw || 3,
        roughness: o.rough === undefined ? 1.1 : o.rough, bowing: o.bow === undefined ? 1 : o.bow, strokeLineDash: o.dash ? [11, 10] : undefined }));
    }
    dot(x, y, r, c = 'ink') { el('circle', { cx: x, cy: y, r, fill: this.col(c) }, this.parent); }

    text(x, y, s, o = {}) {
      const lines = Array.isArray(s) ? s : String(s).split('\n');
      const fs = o.fs || 30, lh = o.lh || Math.round(fs * 1.3), font = o.font || 'hand';
      const t = el('text', { x, y, 'font-size': fs, 'font-family': FONT[font], 'font-weight': o.w || (font === 'mono' ? 400 : 400),
        fill: this.col(o.c || 'ink'), 'text-anchor': o.a || 'start', 'xml:space': 'preserve' });
      t.style.whiteSpace = 'pre';
      if (font === 'mono') t.setAttribute('filter', 'url(#wob)');
      if (o.rot) t.setAttribute('transform', `rotate(${o.rot} ${x} ${y})`);
      lines.forEach((ln, i) => { const ts = el('tspan', { x, dy: i ? lh : 0 }, t); ts.textContent = ln; });
      this._add(t); this.texts.push({ t, box: o._box, rot: !!o.rot, free: !!o.free });
      return t;
    }
    /* Shorthands: m = monospace annotation, h = bold hand heading */
    m(x, y, s, o = {}) { return this.text(x, y, s, { font: 'mono', fs: 25, ...o }); }
    h(x, y, s, o = {}) { return this.text(x, y, s, { w: 700, fs: 40, ...o }); }
    measure(str, fs, font = 'hand', w = 400) { const t = el('text', { 'font-size': fs, 'font-family': FONT[font], 'font-weight': w }, this.svg); t.textContent = str; const L = t.getComputedTextLength(); t.remove(); return L; }

    arrow(x1, y1, x2, y2, o = {}) {
      const c = o.c || 'ink', sw = o.sw || 3;
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, b = o.bend || 0;
      const cx = (x1 + x2) / 2 - dy / len * b, cy = (y1 + y2) / 2 + dx / len * b;
      this._add(this.rc.path(`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, { seed: this._s(), stroke: this.col(c), strokeWidth: sw,
        roughness: o.rough === undefined ? 0.9 : o.rough, bowing: 0.5, strokeLineDash: o.dash ? [11, 10] : undefined }));
      const head = (tx, ty, fx, fy) => { const ang = Math.atan2(ty - fy, tx - fx), hl = o.head || 20;
        for (const sgn of [-1, 1]) { const a = ang + Math.PI + sgn * 0.44;
          this._add(this.rc.line(tx, ty, tx + Math.cos(a) * hl, ty + Math.sin(a) * hl, { seed: this._s(), stroke: this.col(c), strokeWidth: sw, roughness: 0.5 })); } };
      head(x2, y2, b ? cx : x1, b ? cy : y1);
      if (o.both) head(x1, y1, b ? cx : x2, b ? cy : y2);
      if (o.label) { const mx = (x1 + 2 * cx + x2) / 4, my = (y1 + 2 * cy + y2) / 4;
        this.text(mx + (o.ldx || 0), my + (o.ldy === undefined ? -14 : o.ldy), o.label, { c: o.lc || c, fs: o.lfs || 23, font: o.lfont || 'mono', a: o.la || 'middle' }); }
    }

    underline(x1, x2, y, o = {}) { const L = x2 - x1;
      this._add(this.rc.path(`M${x1} ${y} q${L / 4} ${o.wave === undefined ? 10 : o.wave} ${L / 2} 0 t${L / 2} 0`, { seed: this._s(), stroke: this.col(o.c || 'amber'), strokeWidth: o.sw || 6, roughness: 1.6, bowing: 1 })); }
    /* A highlighter swipe. Draw it BEFORE the text it sits behind. */
    marker(x, y, w, h, c = 'amber') { this._add(this.rc.rectangle(x, y, w, h, { seed: this._s(), fill: this.fil(c), fillStyle: 'solid', stroke: 'none', roughness: 2.2 })); }
    bracket(x1, x2, y, o = {}) { const k = o.up ? -14 : 14;
      this.path(`M${x1} ${y - k} L${x1} ${y} L${x2} ${y} L${x2} ${y - k}`, { c: o.c || 'green', sw: o.sw || 3, rough: 1 });
      if (o.label) this.text((x1 + x2) / 2, y + (o.up ? -16 : 36), o.label, { c: o.c || 'green', fs: o.fs || 24, font: o.font || 'mono', a: 'middle' }); }
    vbracket(x, y1, y2, o = {}) { const k = o.left ? 14 : -14;
      this.path(`M${x + k} ${y1} L${x} ${y1} L${x} ${y2} L${x + k} ${y2}`, { c: o.c || 'green', sw: o.sw || 3, rough: 1 }); }
    num(x, y, n, c = 'ink', o = {}) { const d = o.d || 50; this.circle(x, y, d, { c, fill: o.fill || 'white', off: 0, sw: 3 });
      this.text(x, y + d * 0.22, String(n), { fs: d * 0.58, w: 700, a: 'middle', c, free: true }); }
    pill(x, y, label, o = {}) { const fs = o.fs || 24, font = o.font || 'mono', w = this.measure(label, fs, font, o.w || 400) + 34, h = fs + 20;
      this.box(x, y, w, h, { c: o.c || 'ink', fill: o.fill, r: h / 2, sw: 2.6, off: 3, rough: 1 });
      this.text(x + w / 2, y + h / 2 + fs * 0.34, label, { fs, font, a: 'middle', c: o.tc || o.c || 'ink', w: o.w, _box: [x, y, w, h] }); return w; }
    sticky(x, y, w, h, lines, o = {}) { this.group(o.rot === undefined ? -2 : o.rot, x + w / 2, y + h / 2, () => {
      this.box(x, y, w, h, { c: o.c || 'amber', fill: o.fill || 'amber', r: 4, sw: 2.4, off: 5 });
      const fs = o.fs || 27, arr = [].concat(lines), lh = Math.round(fs * 1.3);
      this.text(x + w / 2, y + (h - arr.length * lh) / 2 + fs, arr, { fs, lh, a: 'middle', c: o.tc || 'ink', font: o.font || 'hand', w: o.w || 400, _box: [x, y, w, h], free: true }); }); }
    callout(lines, o = {}) { const arr = [].concat(lines), fs = o.fs || 36, lh = Math.round(fs * 1.25), w = o.w || 1040, h = o.h || (arr.length * lh + 44);
      const x = o.x === undefined ? (W - w) / 2 : o.x, y = o.y === undefined ? 1004 - h : o.y;
      this.box(x, y, w, h, { c: o.c || 'ink', dash: true, r: 16, sw: 2.8, fill: o.fill, off: 0 });
      this.text(x + w / 2, y + (h - arr.length * lh) / 2 + fs * 0.92, arr, { fs, lh, a: 'middle', c: o.tc || 'ink', w: o.wt || 400, _box: [x, y, w, h] }); }
    bar(x, y, w, h, frac, o = {}) { if (frac > 0) this.box(x, y, w * frac, h, { noStroke: true, fill: o.fill || 'teal', r: 6, off: 0 });
      if (o.hatch) this.box(x, y, w * frac, h, { noStroke: true, hatch: o.hatch, r: 6, gap: 9 });
      this.box(x, y, w, h, { c: o.c || 'ink', r: 8, sw: 2.6, rough: 1 }); }

    /* ---- doodles ---- */
    man(x, y, k = 1, o = {}) { const c = o.c || 'ink', L = { c, sw: o.sw || 3.2 };
      this.line(x, y + 22 * k, x, y + 92 * k, L); this.line(x, y + 46 * k, x - 34 * k, y + 74 * k, L); this.line(x, y + 46 * k, x + 36 * k, y + 68 * k, L);
      this.line(x, y + 92 * k, x - 26 * k, y + 150 * k, L); this.line(x, y + 92 * k, x + 26 * k, y + 150 * k, L);
      this.circle(x, y, 46 * k, { c, fill: o.fill || 'white', off: 0 });
      this.dot(x - 8 * k, y - 4 * k, 3 * k, c); this.dot(x + 8 * k, y - 4 * k, 3 * k, c);
      this.path(o.sad ? `M${x - 9 * k} ${y + 13 * k} Q${x} ${y + 5 * k} ${x + 9 * k} ${y + 13 * k}` : `M${x - 9 * k} ${y + 8 * k} Q${x} ${y + 16 * k} ${x + 9 * k} ${y + 8 * k}`, { c, sw: 2.4, rough: 0.5 }); }
    robot(x, y, k = 1, o = {}) { const c = o.c || 'ink', f = o.fill || 'gray';
      this.line(x, y - 30 * k, x, y - 48 * k, { c }); this.circle(x, y - 55 * k, 15 * k, { c, fill: o.led || 'amber', off: 0, sw: 2.6 });
      if (!o.headOnly) { this.box(x - 28 * k, y + 34 * k, 56 * k, 46 * k, { c, fill: f, r: 8 * k, off: 3 });
        this.line(x - 28 * k, y + 46 * k, x - 48 * k, y + 68 * k, { c }); this.line(x + 28 * k, y + 46 * k, x + 48 * k, y + 68 * k, { c }); }
      this.box(x - 38 * k, y - 30 * k, 76 * k, 60 * k, { c, fill: f, r: 10 * k, off: 3 });
      this.circle(x - 15 * k, y - 5 * k, 14 * k, { c, fill: 'white', off: 0, sw: 2.6 }); this.circle(x + 15 * k, y - 5 * k, 14 * k, { c, fill: 'white', off: 0, sw: 2.6 });
      this.line(x - 12 * k, y + 16 * k, x + 12 * k, y + 16 * k, { c, sw: 2.6 }); }
    file(x, y, w, h, o = {}) { const c = o.c || 'ink', k = Math.min(w, h) * 0.28;
      this.path(`M${x} ${y} L${x + w - k} ${y} L${x + w} ${y + k} L${x + w} ${y + h} L${x} ${y + h} Z`, { c, fill: o.fill === undefined ? 'white' : o.fill, sw: o.sw || 2.8, off: 3 });
      this.path(`M${x + w - k} ${y} L${x + w - k} ${y + k} L${x + w} ${y + k}`, { c, sw: 2.2, rough: 0.8 });
      const n = o.lines === undefined ? 3 : o.lines;
      for (let i = 0; i < n; i++) { const ly = y + k + 12 + i * ((h - k - 22) / Math.max(n, 1)); this.line(x + w * 0.16, ly, x + w * (0.84 - (i % 2) * 0.24), ly, { c: o.lc || 'gray', sw: 2, rough: 0.8 }); }
      if (o.label) this.text(x + w / 2, y + h + 30, o.label, { fs: o.fs || 22, font: 'mono', a: 'middle', c: o.tc || c }); }
    terminal(x, y, w, h, o = {}) { this.box(x, y, w, h, { c: 'ink', fill: 'ink', r: 10, off: 3 });
      this.text(x + 16, y + h / 2 + 10, o.text || '>_', { font: 'mono', fs: o.fs || 28, c: '#8ce99a', free: true }); }
    cylinder(x, y, w, h, o = {}) { const c = o.c || 'ink', e = h * 0.24;
      this.path(`M${x} ${y + e / 2} L${x} ${y + h - e / 2} Q${x + w / 2} ${y + h + e / 2} ${x + w} ${y + h - e / 2} L${x + w} ${y + e / 2} Q${x + w / 2} ${y + e * 1.4} ${x} ${y + e / 2} Z`, { c, fill: o.fill || 'white', sw: 3, off: 3 });
      this.ellipse(x + w / 2, y + e / 2, w, e, { c, fill: o.fill || 'white', off: 0, sw: 3 });
      if (o.label) this.text(x + w / 2, y + h * 0.66, o.label, { fs: o.fs || 24, font: 'mono', a: 'middle', c: o.tc || c, free: true }); }
    cloud(x, y, w, h, o = {}) {
      this.path(`M${x + w * 0.2} ${y + h * 0.88} Q${x - w * 0.02} ${y + h * 0.88} ${x + w * 0.04} ${y + h * 0.56} Q${x + w * 0.02} ${y + h * 0.26} ${x + w * 0.26} ${y + h * 0.3} Q${x + w * 0.36} ${y - h * 0.02} ${x + w * 0.58} ${y + h * 0.16} Q${x + w * 0.88} ${y + h * 0.04} ${x + w * 0.86} ${y + h * 0.4} Q${x + w * 1.04} ${y + h * 0.5} ${x + w * 0.95} ${y + h * 0.74} Q${x + w * 0.9} ${y + h * 0.9} ${x + w * 0.74} ${y + h * 0.88} Z`, { c: o.c || 'ink', fill: o.fill || 'white', sw: 3 });
      if (o.label) this.text(x + w / 2, y + h * 0.62, o.label, { fs: o.fs || 28, a: 'middle', w: 700, c: o.tc || o.c || 'ink', free: true }); }
    lock(x, y, k = 1, o = {}) { const c = o.c || 'ink';
      this.path(`M${x - 14 * k} ${y} L${x - 14 * k} ${y - 16 * k} Q${x - 14 * k} ${y - 36 * k} ${x} ${y - 36 * k} Q${x + 14 * k} ${y - 36 * k} ${x + 14 * k} ${y - 16 * k} L${x + 14 * k} ${y}`, { c, sw: 3.4 });
      this.box(x - 24 * k, y, 48 * k, 38 * k, { c, fill: o.fill || 'amber', r: 6, off: 2 }); this.dot(x, y + 17 * k, 4.5 * k, c); }
    bolt(x, y, k = 1, o = {}) { this.poly([[x, y], [x - 20 * k, y + 38 * k], [x - 3 * k, y + 38 * k], [x - 14 * k, y + 78 * k], [x + 24 * k, y + 26 * k], [x + 5 * k, y + 26 * k], [x + 16 * k, y]],
      { c: o.c || 'red', fill: o.fill || 'amber', sw: 2.8, off: 2, rough: 0.9 }); }
    clock(x, y, r, o = {}) { const c = o.c || 'ink'; this.circle(x, y, r * 2, { c, fill: o.fill || 'white', off: 0 });
      this.line(x, y, x, y - r * 0.62, { c, sw: 3, rough: 0.5 }); this.line(x, y, x + r * 0.45, y + r * 0.2, { c, sw: 3, rough: 0.5 }); }
    check(x, y, k = 1, c = 'green') { this.path(`M${x} ${y} L${x + 12 * k} ${y + 14 * k} L${x + 36 * k} ${y - 18 * k}`, { c, sw: 5, rough: 0.9 }); }
    cross(x, y, k = 1, c = 'red') { this.line(x - 15 * k, y - 15 * k, x + 15 * k, y + 15 * k, { c, sw: 5 }); this.line(x + 15 * k, y - 15 * k, x - 15 * k, y + 15 * k, { c, sw: 5 }); }
    chip(x, y, w, h, o = {}) { const n = o.pins === undefined ? 4 : o.pins;
      for (let i = 0; i < n; i++) { const py = y + h * (i + 1) / (n + 1);
        this.line(x - 18, py, x, py, { sw: 3, rough: 0.6 }); this.line(x + w, py, x + w + 18, py, { sw: 3, rough: 0.6 }); }
      this.box(x, y, w, h, { c: 'ink', fill: 'ink', r: 12, off: 4, label: o.label || 'MODEL', sub: o.sub, fs: o.fs || 36, sfs: o.sfs || 22 }); }
    magnifier(x, y, r, o = {}) { const c = o.c || 'ink'; this.circle(x, y, r * 2, { c, fill: o.fill || 'white', off: 0, sw: 3.4 });
      this.line(x + r * 0.7, y + r * 0.7, x + r * 1.7, y + r * 1.7, { c, sw: 6, rough: 0.7 }); }
    flag(x, y, k = 1, o = {}) { const c = o.c || 'green'; this.line(x, y, x, y - 70 * k, { c: 'ink', sw: 3.4 });
      this.poly([[x, y - 70 * k], [x + 46 * k, y - 56 * k], [x, y - 40 * k]], { c, fill: o.fill || 'green', sw: 2.8, off: 2 }); }
    folder(x, y, w, h, o = {}) { const c = o.c || 'ink';
      this.path(`M${x} ${y + h} L${x} ${y} L${x + w * 0.38} ${y} L${x + w * 0.46} ${y + h * 0.16} L${x + w} ${y + h * 0.16} L${x + w} ${y + h} Z`, { c, fill: o.fill || 'amber', sw: 2.8, off: 3 });
      if (o.label) this.text(x + w / 2, y + h * 0.7, o.label, { fs: o.fs || 22, font: 'mono', a: 'middle', c: o.tc || 'ink', free: true }); }
    wheel(x, y, r) { this.circle(x, y, r * 2, { sw: 3.4 }); this.circle(x, y, r * 0.42, { sw: 3 });
      this.line(x, y - r * 0.21, x, y - r, { sw: 3 }); this.line(x - r * 0.18, y + r * 0.1, x - r * 0.84, y + r * 0.5, { sw: 3 }); this.line(x + r * 0.18, y + r * 0.1, x + r * 0.84, y + r * 0.5, { sw: 3 }); }
  }

  const REG = [];
  window.diagram = (id, meta, fn) => REG.push({ id, meta, fn });
  window.DIAGRAM_IDS = () => REG.map(r => r.id);

  function draw(svg, rec, index) {
    while (svg.firstChild) svg.firstChild.remove();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const defs = el('defs', {}, svg);
    defs.innerHTML = `<filter id="wob" x="-5%" y="-25%" width="110%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${index * 5 + 3}" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
      <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.5" fill="#e9e3d2"/></pattern>`;
    el('rect', { width: W, height: H, fill: FILL.paper }, svg);
    el('rect', { width: W, height: H, fill: 'url(#dots)' }, svg);
    const s = new Sketch(svg, index + 1);
    const m = rec.meta;
    const tfs = m.tfs || 66;
    const L = Math.min(s.measure(m.title, tfs, 'hand', 700), 1760);
    s.text(W / 2, 104, m.title, { fs: tfs, w: 700, a: 'middle' });
    s.underline(W / 2 - L / 2 - 6, W / 2 + L / 2 + 6, 128, { c: m.accent || 'amber', sw: 7 });
    if (m.sub) s.text(W / 2, 182, m.sub, { fs: 31, a: 'middle', c: '#495057' });
    s.text(64, 1052, `HARNESS ENGINEERING  ·  ${m.section || ''}`, { font: 'mono', fs: 19, c: '#868e96' });
    s.text(1856, 1052, String(index + 1).padStart(2, '0'), { font: 'mono', fs: 19, c: '#868e96', a: 'end' });
    rec.fn(s);
    return s;
  }

  function audit(s) {
    const out = [], items = s.texts.map(x => ({ ...x, b: x.t.getBBox(), s: x.t.textContent.slice(0, 34) }));
    for (const it of items) { const b = it.b;
      if (!it.rot && (b.x < 16 || b.x + b.width > W - 16 || b.y < 4 || b.y + b.height > H - 4)) out.push(`OFF-SHEET  "${it.s}"  x ${b.x | 0}..${(b.x + b.width) | 0}  y ${b.y | 0}..${(b.y + b.height) | 0}`);
      if (it.box && !it.rot) { const [x, y, w, h] = it.box;
        if (b.x < x + 4 || b.x + b.width > x + w - 4) out.push(`TOO WIDE   "${it.s}"  text ${b.width | 0} in box ${w | 0}`);
        if (b.y < y - 2 || b.y + b.height > y + h + 4) out.push(`TOO TALL   "${it.s}"  text ${b.height | 0} in box ${h | 0}`); } }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], c = items[j];
      if (a.rot || c.rot || a.free || c.free) continue;
      const ox = Math.min(a.b.x + a.b.width, c.b.x + c.b.width) - Math.max(a.b.x, c.b.x), oy = Math.min(a.b.y + a.b.height, c.b.y + c.b.height) - Math.max(a.b.y, c.b.y);
      if (ox > 8 && oy > 10) out.push(`OVERLAP    "${a.s}"  ×  "${c.s}"`); }
    return out;
  }

  window.boot = async function () {
    const q = new URLSearchParams(location.search), id = q.get('d'), svg = document.getElementById('c'), rep = document.getElementById('report');
    try {
      await Promise.all(['700 60px Kalam', '400 30px Kalam', '400 24px "Comic Mono"'].map(f => document.fonts.load(f).catch(() => 0)));
      await document.fonts.ready;
      if (q.get('audit')) { const lines = [];
        REG.forEach((rec, i) => { const issues = audit(draw(svg, rec, i)); issues.forEach(t => lines.push(`${rec.id}: ${t}`)); });
        rep.textContent = `AUDIT ${REG.length} diagrams, ${lines.length} issues\n` + lines.join('\n') + `\nFONTS kalam=${document.fonts.check('30px Kalam')} comicmono=${document.fonts.check('24px "Comic Mono"')}`;
      } else { const i = REG.findIndex(r => r.id === id); if (i < 0) throw new Error('unknown diagram ' + id); draw(svg, REG[i], i); rep.textContent = 'OK ' + id; }
    } catch (e) { rep.textContent = 'ERROR ' + (e.stack || e); }
    document.title = 'ready';
  };
  window.addEventListener('error', e => { const r = document.getElementById('report'); if (r) r.textContent = 'ERROR ' + e.message + ' @' + e.filename.split('/').pop() + ':' + e.lineno; });
})();
