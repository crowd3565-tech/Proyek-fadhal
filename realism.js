/* Lapisan visual realistis: latar laboratorium, model atom DNA, dan helper gambar.
   Dimuat sebelum script.js. Tidak mengubah alur, kuis, kunci slide, atau penilaian. */
(function(){
'use strict';
const R = window.REAL = {};
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- atom (bola bercahaya, warna standar kimia/CPK) ---------- */
const AT = { P:'gAtP', O:'gAtO', C:'gAtC', N:'gAtN', H:'gAtH', Na:'gAtNa' };
R.atom = (x, y, r, e, op = 1) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#${AT[e]})"${op < 1 ? ` opacity="${op.toFixed(2)}"` : ''}/>`;

/* Model atom heliks ganda untuk slide 4 (viewBox 320x240). Kelas .hot dan data-h dipertahankan. */
R.helix = function(ph, o = {}){
  const cx = o.cx ?? 160, top = o.top ?? 18, n = o.n ?? 10, gap = o.gap ?? 21, RX = o.rx ?? 78, sc = o.sc ?? 1;
  const items = [];
  const push = (z, h, svg) => items.push({ z, h, svg });
  for (let i = 0; i < n; i++){
    const y = top + i * gap, a = i * .75 + ph;
    for (const side of [0, 1]){
      const ang = a + side * Math.PI, s = Math.sin(ang), c = Math.cos(ang);
      const d = (c + 1) / 2, op = .5 + .5 * d, k = (.82 + .28 * d) * sc;
      const sx = cx + s * RX, sy = y;
      // gula deoksiribosa: cincin karbon + satu oksigen
      push(c, 'gula', R.atom(sx - 6 * k * Math.cos(ang), sy - 3 * k, 8.4 * k, 'C', op) + R.atom(sx + 5 * k * Math.cos(ang), sy - 5 * k, 8 * k, 'C', op) + R.atom(sx, sy + 5 * k, 8.2 * k, 'C', op) + R.atom(sx + 2 * k, sy - 10 * k, 6.6 * k, 'O', op));
      // gugus fosfat di antara dua gula (tulang punggung)
      if (i < n - 1){
        const a2 = ang + .375, s2 = Math.sin(a2), c2 = Math.cos(a2), d2 = (c2 + 1) / 2, op2 = .5 + .5 * d2, k2 = (.82 + .28 * d2) * sc;
        const px = cx + s2 * (RX + 6), py = y + gap / 2;
        push(c2 + .02, 'fosfat', R.atom(px - 7 * k2, py - 5 * k2, 6.6 * k2, 'O', op2) + R.atom(px + 7 * k2, py - 4 * k2, 6.6 * k2, 'O', op2) + R.atom(px, py, 9.6 * k2, 'P', op2) + R.atom(px + 1 * k2, py + 7 * k2, 6.4 * k2, 'O', op2));
      }
      // basa nitrogen: deretan atom N dan C menuju sumbu heliks
      let b = '';
      [.8, .66, .52, .38, .24].forEach((f, j) => {
        const bx = cx + s * RX * f, bz = c * f, bd = (bz + 1) / 2, bk = (.82 + .28 * bd) * sc, bop = .5 + .5 * bd;
        if (j === 2) b += R.atom(bx, y - 8 * bk, 5.4 * bk, (i + side) % 2 ? 'O' : 'H', bop);
        b += R.atom(bx, y + (j % 2 ? 3 : -2) * bk, 7.6 * bk, j % 2 ? 'C' : 'N', bop);
      });
      push(c * .55, 'basa', b);
    }
    // ikatan hidrogen di tengah
    const s = Math.sin(a), x1 = cx + s * RX * .16, x2 = cx - s * RX * .16;
    push(-.01, 'hidrogen', `<line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y}" stroke="#bfe9ff" stroke-width="${2.2 * sc}" stroke-dasharray="${3 * sc} ${2.4 * sc}" stroke-linecap="round" opacity=".95"/>`);
  }
  items.sort((p, q) => p.z - q.z);
  const hot = o.hot !== false;
  return items.map(it => hot ? `<g class="hot" data-h="${it.h}">${it.svg}</g>` : it.svg).join('');
};

/* ---------- latar laboratorium fotorealistis (digambar sekali di kanvas) ---------- */
function lcg(s){ return () => (s = (s * 16807) % 2147483647) / 2147483647; }
R.labBG = function(w, h){
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const r = lcg(17);
  let g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#8f9ea9'); g.addColorStop(.35, '#b4c0c8'); g.addColorStop(.6, '#c6cfd5'); g.addColorStop(.605, '#7b8893'); g.addColorStop(.62, '#e9edf0'); g.addColorStop(.8, '#dfe4e7'); g.addColorStop(1, '#b9c2c8');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  // jendela bercahaya
  g = x.createRadialGradient(w * .2, h * .18, 0, w * .2, h * .18, w * .55); g.addColorStop(0, 'rgba(235,248,255,.75)'); g.addColorStop(1, 'rgba(235,248,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h * .6);
  x.filter = `blur(${Math.max(4, Math.round(w / 160))}px)`;
  // panel dinding & lemari
  x.fillStyle = 'rgba(70,88,104,.18)'; for (let i = 0; i < 6; i++) x.fillRect(w * (i / 6) - 2, 0, 4, h * .6);
  x.fillStyle = 'rgba(230,238,243,.55)'; x.fillRect(w * .05, h * .1, w * .2, h * .26);
  x.fillStyle = 'rgba(205,214,221,.85)'; x.fillRect(w * .76, h * .08, w * .18, h * .5);
  x.fillStyle = 'rgba(120,135,148,.5)'; x.fillRect(w * .76, h * .32, w * .18, 3);
  // rak dengan botol reagen
  [.22, .42].forEach(sy => { x.fillStyle = 'rgba(60,72,84,.55)'; x.fillRect(w * .3, h * sy, w * .42, h * .018);
    for (let i = 0; i < 14; i++){ const bx = w * (.31 + r() * .39), bw = w * (.012 + r() * .018), bh = h * (.05 + r() * .07);
      const hue = [[120, 170, 200], [190, 140, 90], [150, 190, 160], [210, 210, 220], [170, 120, 80]][i % 5];
      x.fillStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},.7)`; x.fillRect(bx, h * sy - bh, bw, bh); x.fillStyle = 'rgba(40,50,60,.6)'; x.fillRect(bx + bw * .25, h * sy - bh - h * .012, bw * .5, h * .012); } });
  // titik cahaya (bokeh)
  for (let i = 0; i < 26; i++){ const bx = r() * w, by = r() * h * .55, br = w * (.008 + r() * .028), a = .1 + r() * .2;
    g = x.createRadialGradient(bx, by, 0, bx, by, br); g.addColorStop(0, `rgba(255,250,235,${a})`); g.addColorStop(.7, `rgba(255,250,235,${a * .5})`); g.addColorStop(1, 'rgba(255,250,235,0)'); x.fillStyle = g; x.beginPath(); x.arc(bx, by, br, 0, 7); x.fill(); }
  x.filter = 'none';
  // tepi meja + pantulan
  x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(0, h * .618, w, Math.max(1, h * .003));
  g = x.createLinearGradient(0, h * .62, 0, h); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, h * .62, w, h * .38);
  // vinyet
  g = x.createRadialGradient(w / 2, h * .45, h * .25, w / 2, h * .5, Math.max(w, h) * .8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,20,30,.38)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  return c;
};
function paintBG(){
  const el = document.querySelector('.lab-bg'); if (!el) return;
  const d = Math.min(devicePixelRatio || 1, 1.5), w = Math.round(innerWidth * d), h = Math.round(innerHeight * d);
  try { el.style.backgroundImage = `url(${R.labBG(w, h).toDataURL('image/jpeg', .82)})`; el.classList.add('photo'); } catch (e) { /* biarkan latar CSS */ }
}
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(paintBG, 250); });

/* ---------- simbol heliks atom untuk sampul dan zoom ---------- */
function helixSymbol(){
  const sym = document.getElementById('helix'); if (!sym) return;
  sym.setAttribute('viewBox', '0 0 60 120');
  sym.innerHTML = R.helix(.6, { cx: 30, top: 6, n: 13, gap: 8.9, rx: 18, sc: .42, hot: false });
}

/* ---------- serabut DNA (dipakai di slide 17–18) ---------- */
R.strands = function(cx, y, width, height, count, seed = 5, t = 0){
  const r = lcg(seed); let s = '';
  for (let i = 0; i < count; i++){
    const x0 = cx + (r() - .5) * width, L = height * (.35 + r() * .65), amp = 1.5 + r() * 3.5, ph = r() * 7, sw = .5 + r() * 1.1;
    let d = `M${x0.toFixed(1)},${y.toFixed(1)}`;
    for (let k = 1; k <= 10; k++){ const f = k / 10; d += ` L${(x0 + Math.sin(f * 6 + ph + t) * amp * (.4 + f) + (r() - .5) * 1.2).toFixed(1)},${(y - f * L).toFixed(1)}`; }
    s += `<path d="${d}" fill="none" stroke="#ffffff" stroke-opacity="${(.55 + r() * .4).toFixed(2)}" stroke-width="${sw.toFixed(2)}" stroke-linecap="round"/>`;
  }
  return `<g filter="url(#fGlow)">${s}</g>`;
};

R.reducedMotion = RM;
document.addEventListener('DOMContentLoaded', () => { helixSymbol(); paintBG(); });
if (document.readyState !== 'loading'){ helixSymbol(); paintBG(); }
})();

/* ---------- jaringan sel buah tomat seperti di bawah mikroskop (SVG) ---------- */
(function(){
  const R = window.REAL;
  function lcg(s){ return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  R.cells = function(x, y, w, h, o = {}){
    const r = lcg(o.seed || 9), sp = o.size || 22, cols = Math.ceil(w / sp) + 2, rows = Math.ceil(h / (sp * .87)) + 2;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#8f6d45"/>`;
    for (let j = -1; j < rows; j++) for (let i = -1; i < cols; i++){
      const cx = x + i * sp + (j % 2 ? sp / 2 : 0) + (r() - .5) * sp * .25, cy = y + j * sp * .87 + (r() - .5) * sp * .25;
      const n = 7, pts = [];
      for (let k = 0; k < n; k++){ const a = k / n * Math.PI * 2 + r() * .3, rr = sp * (.47 + r() * .08); pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr * .95).toFixed(1)}`); }
      const tone = 228 + (r() * 22 | 0);
      s += `<polygon points="${pts.join(' ')}" fill="rgb(${tone + 10 > 255 ? 255 : tone + 10},${tone - 30},${tone - 70})" stroke="#b8935e" stroke-width="${(sp * .05).toFixed(1)}" stroke-linejoin="round"/>`;
      const m = 4 + (r() * 6 | 0);
      for (let q = 0; q < m; q++){ const a = r() * 7, d = r() * sp * .3; s += `<ellipse cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d).toFixed(1)}" rx="${(sp * .06).toFixed(1)}" ry="${(sp * .04).toFixed(1)}" fill="url(#gPlast)"/>`; }
      if (r() < .35) s += `<circle cx="${(cx + sp * .12).toFixed(1)}" cy="${(cy - sp * .1).toFixed(1)}" r="${(sp * .1).toFixed(1)}" fill="url(#gNuc)"/>`;
    }
    return s;
  };
  /* tampilan lensa mikroskop berbentuk lingkaran */
  R.scope = function(cx, cy, rad, id, o = {}){
    return `<defs><clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${rad}"/></clipPath><radialGradient id="${id}v" cx="50%" cy="50%" r="50%"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy + rad * .08}" r="${rad + 4}" fill="#000" opacity=".25" filter="url(#fBlur4)"/>
      <g clip-path="url(#${id})">${R.cells(cx - rad, cy - rad, rad * 2, rad * 2, o)}<circle cx="${cx}" cy="${cy}" r="${rad}" fill="url(#${id}v)"/></g>
      <circle cx="${cx}" cy="${cy}" r="${rad + 2}" fill="none" stroke="#1f272e" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${rad + 4.5}" fill="none" stroke="#56636e" stroke-width="1.2"/>`;
  };
})();

/* ---------- untai DNA mendatar (model atom) dan molekul pendukung untuk kartu zoom ---------- */
(function(){
  const R = window.REAL;
  R.dnaStrip = function(x, y, len, o = {}){
    const amp = o.amp ?? 9, sc = o.sc ?? .6, ph = o.ph ?? 0, per = o.per ?? 46, items = [];
    for (let t = 0; t <= len; t += 5.2 * sc / .6){
      const a = (t / per) * Math.PI * 2 + ph;
      for (const side of [0, 1]){
        const aa = a + side * Math.PI, yy = y + Math.sin(aa) * amp, z = Math.cos(aa), k = (.8 + .3 * (z + 1) / 2) * sc, op = .55 + .45 * (z + 1) / 2;
        const e = (Math.round(t / 5.2) % 3 === 0) ? 'P' : (Math.round(t / 5.2) % 3 === 1 ? 'O' : 'C');
        items.push({ z, s: R.atom(x + t, yy, (e === 'P' ? 6.4 : 5.4) * k, e, op) });
      }
      if (Math.round(t / 5.2) % 2 === 0){
        const y1 = y + Math.sin(a) * amp, y2 = y - Math.sin(a) * amp;
        [.3, .7].forEach((f, j) => items.push({ z: -.1, s: R.atom(x + t, y1 + (y2 - y1) * f, 4.6 * sc, j ? 'N' : 'C', .9) }));
      }
    }
    items.sort((p, q) => p.z - q.z);
    return items.map(i => i.s).join('');
  };
  R.water = (x, y, s = 1, rot = 0) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">${R.atom(-3.6, 2.6, 2.4, 'H')}${R.atom(3.6, 2.6, 2.4, 'H')}${R.atom(0, 0, 3.6, 'O')}</g>`;
  R.lipid = (x, y, flip, det) => `<g transform="translate(${x},${y})${flip ? ' rotate(180)' : ''}"><path d="M-1.6,3 C-2.6,7 -.6,10 -1.6,14 M1.6,3 C2.6,7 .6,10 1.6,14" stroke="#b9a58c" stroke-width="1.3" fill="none" stroke-linecap="round"/><circle r="4.4" fill="url(#${det ? 'gDet' : 'gHead'})"/></g>`;
  R.micelle = (x, y, r = 13) => `<g transform="translate(${x},${y})">${Array.from({ length: 11 }, (_, k) => { const a = k / 11 * Math.PI * 2; return `<g transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)}) translate(0,${-r})"><path d="M-1,3 C-1.8,6 -.4,8 -1,10 M1,3 C1.8,6 .4,8 1,10" stroke="#b9a58c" stroke-width="1.1" fill="none"/><circle r="3.4" fill="url(#${k % 2 ? 'gDet' : 'gHead'})"/></g>`; }).join('')}</g>`;
  R.na = (x, y) => `<g transform="translate(${x},${y})">${R.atom(0, 0, 6.2, 'Na')}<text y="2.8" text-anchor="middle" font-size="6.5" font-weight="700" fill="#fff" font-family="Barlow, sans-serif">Na⁺</text></g>`;
})();
