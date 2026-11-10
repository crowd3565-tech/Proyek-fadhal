/* Laboratorium Virtual Isolasi DNA Tomat — 20 slide */
(() => {
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
let reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
const store = { get(k,d){ try{ const v = localStorage.getItem('dnatomat-'+k); return v===null?d:JSON.parse(v); }catch(e){ return d; } },
                set(k,v){ try{ localStorage.setItem('dnatomat-'+k, JSON.stringify(v)); }catch(e){} } };
const TOTAL = 20;

/* ---------------- suara ---------------- */
let soundOn = store.get('sound', true), actx = null;
function tone(f, d=.12, type='sine', when=0, vol=.14){
  if (!soundOn) return;
  try{ actx = actx || new (window.AudioContext||window.webkitAudioContext)();
    const t = actx.currentTime+when, o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+d);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t+d+.02); }catch(e){}
}
const sfx = { click(){ tone(660,.05,'square',0,.04); }, ok(){ tone(660,.1,'triangle'); tone(990,.15,'triangle',.1); }, bad(){ tone(200,.2,'sawtooth',0,.07); },
  pop(){ tone(880,.05,'sine',0,.07); }, pour(){ tone(260+Math.random()*90,.05,'sine',0,.035); }, chop(){ tone(150,.06,'square',0,.08); }, win(){ [523,659,784,1046].forEach((f,i)=>tone(f,.18,'triangle',i*.12)); } };
document.addEventListener('click', e => { if (e.target.closest('button')) sfx.click(); }, true);

/* ---------------- umum ---------------- */
let toastT = null;
function toast(msg, kind='ok'){ const t = $('#toast'); t.textContent = msg; t.className = 'toast '+kind; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(()=>t.hidden = true, 3400);
  if (kind==='bad') sfx.bad(); else if (kind==='ok') sfx.ok(); }
function dialog(title, body, btns){ $('#dlgTitle').textContent = title; $('#dlgBody').innerHTML = body; const bb = $('#dlgBtns'); bb.innerHTML = '';
  btns.forEach(([l, fn, cls]) => { const b = document.createElement('button'); b.className = 'btn-y '+(cls||''); b.textContent = l; b.onclick = fn; bb.appendChild(b); }); $('#dlg').hidden = false; }
const closeDlg = () => $('#dlg').hidden = true;
$('#dlg').addEventListener('click', e => { if (e.target.id==='dlg') closeDlg(); });
document.addEventListener('keydown', e => { if (e.key==='Escape') closeDlg(); });
document.addEventListener('dragstart', e => e.preventDefault());

/* ---------------- ikon alat & bahan ---------------- */
const S_ = (w,h,inner) => `<svg viewBox="0 0 ${w} ${h}">${inner}</svg>`;
const SH = (cx=24,cy=45,rx=16) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="2.2" fill="#000" opacity=".28" filter="url(#fBlur2)"/>`;
const GL = 'fill="url(#gGlass)" stroke="#8fa2b1" stroke-width="1"';
const HL = (x,y1,y2) => `<path d="M${x},${y1} L${x},${y2}" stroke="#fff" stroke-opacity=".85" stroke-width="1.6" stroke-linecap="round"/>`;
const TICK = (x,ys) => ys.map(y=>`<path d="M${x},${y} l-4,0" stroke="#5f7383" stroke-width=".8"/>`).join('');
const BEAKER = (fill,lvl) => `${SH()}${fill?`<path d="M11.5,${lvl} L36.5,${lvl} L36.5,40 C36.5,42 35,43 33,43 L15,43 C13,43 11.5,42 11.5,40 Z" fill="${fill}"/><ellipse cx="24" cy="${lvl}" rx="12.5" ry="1.4" fill="#fff" opacity=".55"/>`:''}<path d="M9,6 L9,40 C9,43 11,44.5 15,44.5 L33,44.5 C37,44.5 39,43 39,40 L39,6 L41,4.5" ${GL}/>${TICK(39,[14,22,30])}${HL(12.5,9,40)}`;
const IC = {
  mortar: S_(48,48,`${SH(24,44,18)}<path d="M5,20 L43,20 C43,34 35,42.5 24,42.5 C13,42.5 5,34 5,20 Z" fill="url(#gCeramic)" stroke="#a49c8f" stroke-width=".8"/><ellipse cx="24" cy="20" rx="19" ry="3.5" fill="#cfc8bc" stroke="#a49c8f" stroke-width=".8"/><ellipse cx="24" cy="20.5" rx="15" ry="2.3" fill="#8f877b" opacity=".5"/><path d="M31,4 L23,22" stroke="url(#gCeramic)" stroke-width="6.5" stroke-linecap="round"/><path d="M30,5 L23.5,20" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" stroke-linecap="round"/>`),
  alu: S_(48,48,`${SH(20,44,12)}<path d="M37,5 L19,34" stroke="url(#gCeramic)" stroke-width="7.5" stroke-linecap="round"/><path d="M36,6.5 L20,32" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="17" cy="37" rx="7" ry="6" fill="url(#gCeramic)" stroke="#a49c8f" stroke-width=".8"/>`),
  beker: S_(48,48,BEAKER('url(#gWater)',30)),
  ukur: S_(48,48,`${SH(24,45,12)}<path d="M19,32 L29,32 L29,40 L19,40 Z" fill="url(#gWater)"/><path d="M18,3 L30,3 L30,40 L34,43.5 L14,43.5 L18,40 Z" ${GL}/>${TICK(30,[10,16,22,28,34])}${HL(20.5,5,39)}<path d="M13,44 L35,44" stroke="#8fa2b1" stroke-width="1.2"/>`),
  tabung: S_(48,48,`${SH(24,45,8)}<path d="M18,3 L30,3 L30,38 C30,46 18,46 18,38 Z" ${GL}/>${HL(20.5,5,38)}<ellipse cx="24" cy="3.2" rx="6.5" ry="1.4" fill="none" stroke="#8fa2b1" stroke-width=".9"/>`),
  rak: S_(48,48,`${SH(24,45,20)}<rect x="4" y="17" width="40" height="8" rx="1.5" fill="url(#gWood)"/><rect x="7" y="25" width="5" height="18" fill="url(#gWood)"/><rect x="36" y="25" width="5" height="18" fill="url(#gWood)"/><g fill="#5a3818"><ellipse cx="16" cy="19.5" rx="3" ry="1.4"/><ellipse cx="24" cy="19.5" rx="3" ry="1.4"/><ellipse cx="32" cy="19.5" rx="3" ry="1.4"/></g><path d="M4,17.6 L44,17.6" stroke="#f0c48f" stroke-width=".8"/>`),
  corong: S_(48,48,`${SH(24,45,8)}<path d="M5,7 L43,7 L28,25 L28,43 L20,43 L20,25 Z" ${GL} stroke-linejoin="round"/><ellipse cx="24" cy="7" rx="19" ry="2.4" fill="none" stroke="#8fa2b1" stroke-width=".9"/><path d="M9,9 L21,23" stroke="#fff" stroke-opacity=".85" stroke-width="1.5" stroke-linecap="round"/>`),
  saring: S_(48,48,`${SH(24,44,16)}<path d="M8,10 C16,6 32,6 40,10 L42,36 C32,42 16,42 6,36 Z" fill="#f4f1ea" stroke="#cfc8bc" stroke-width=".8"/><g stroke="#d9d3c7" stroke-width=".6">${Array.from({length:9},(_,i)=>`<path d="M${9+i*4},9 L${7+i*4.3},38"/>`).join('')}${Array.from({length:7},(_,i)=>`<path d="M7,${12+i*4} L41,${12+i*4}"/>`).join('')}</g><path d="M8,10 C16,14 32,14 40,10" fill="none" stroke="#bdb5a7" stroke-width=".8"/>`),
  pipet: S_(48,48,`${SH(24,46,6)}<path d="M22.5,16 L25.5,16 L25.5,40 L24.6,46 L23.4,46 L22.5,40 Z" ${GL}/><path d="M23.4,18 L23.4,40" stroke="#fff" stroke-opacity=".8" stroke-width=".8"/><ellipse cx="24" cy="10" rx="6.5" ry="8" fill="url(#gTomS)"/><ellipse cx="21.5" cy="7" rx="2" ry="3" fill="#fff" opacity=".45"/>`),
  pengaduk: S_(48,48,`${SH(24,44,14)}<path d="M9,42 L39,6" stroke="#cfdbe3" stroke-width="4.5" stroke-linecap="round" opacity=".85"/><path d="M9.5,40.5 L38,7" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/><path d="M10,42 L39,7.5" stroke="#8fa2b1" stroke-width=".7" stroke-linecap="round"/>`),
  pisau: S_(48,48,`${SH(24,44,20)}<path d="M3,31 L22,31 L22,40 L5,40 C3.5,40 3,39 3,37.5 Z" fill="url(#gWood)"/><g fill="#c9c1b4"><circle cx="9" cy="35.5" r="1.1"/><circle cx="16" cy="35.5" r="1.1"/></g><path d="M22,31 L45,31 C45,35 40,40 32,40 L22,40 Z" fill="url(#gSteel)" stroke="#7d8a93" stroke-width=".6"/><path d="M23,32.2 L44,32.2" stroke="#fff" stroke-width=".9" opacity=".9"/>`),
  sendok: S_(48,48,`${SH(24,44,18)}<path d="M18,16 L43,31" stroke="url(#gSteel)" stroke-width="3.6" stroke-linecap="round"/><ellipse cx="12" cy="13" rx="9" ry="6.5" fill="url(#gSteel)" stroke="#7d8a93" stroke-width=".6"/><ellipse cx="12" cy="13" rx="6.5" ry="4.2" fill="#8d989f" opacity=".45"/><ellipse cx="9.5" cy="11" rx="2.6" ry="1.4" fill="#fff" opacity=".8"/>`),
  penjepit: S_(48,48,`${SH(24,45,16)}<path d="M6,41 L29,15 M10,44.5 L33,19" stroke="url(#gWood)" stroke-width="4.5" stroke-linecap="round"/><path d="M29,15 L40,6 M33,19 L43,12" stroke="url(#gSteel)" stroke-width="3" stroke-linecap="round"/><circle cx="19" cy="30" r="2.6" fill="url(#gSteel)"/>`),
  tomat: '<svg viewBox="0 0 120 120"><use href="#tomato"/></svg>',
  air: S_(48,48,BEAKER('url(#gWater)',16)),
  garam: S_(48,48,`${SH(24,45,12)}<path d="M13,15 L35,15 L33,44 L15,44 Z" fill="url(#gCoat)" stroke="#b9c3cc" stroke-width=".8"/><path d="M13,15 C13,7 35,7 35,15 Z" fill="url(#gSteel)"/><g fill="#7d8a93"><circle cx="20" cy="11" r=".9"/><circle cx="24" cy="10" r=".9"/><circle cx="28" cy="11" r=".9"/></g><rect x="16" y="24" width="16" height="10" rx="1" fill="#2f6fb8"/><text x="24" y="31.5" text-anchor="middle" font-size="6.5" font-weight="700" fill="#fff" font-family="Barlow, sans-serif">NaCl</text><path d="M15.5,17 L17,42" stroke="#fff" stroke-width="1.2" opacity=".8"/>`),
  deterjen: S_(48,48,`${SH(24,45,12)}<path d="M14,16 C14,13 16,12 18,12 L30,12 C32,12 34,13 34,16 L34,41 C34,43 32,44 30,44 L18,44 C16,44 14,43 14,41 Z" fill="url(#gLeaf)"/><rect x="19" y="6" width="10" height="6" rx="1" fill="#e9eef2" stroke="#b9c3cc" stroke-width=".6"/><path d="M29,8 L36,6" stroke="#e9eef2" stroke-width="2" stroke-linecap="round"/><rect x="17" y="22" width="14" height="12" rx="1.5" fill="#fff" opacity=".9"/><path d="M19,26 h10 M19,29 h7" stroke="#4f8a2c" stroke-width="1.2"/><path d="M16,15 L16,41" stroke="#fff" stroke-width="1.4" opacity=".55"/>`),
  etanol: S_(48,48,`${SH(24,45,13)}<path d="M12,14 C12,12 14,11 16,11 L32,11 C34,11 36,12 36,14 L36,41 C36,43 34,44 32,44 L16,44 C14,44 12,43 12,41 Z" fill="url(#gEth)" stroke="#8fa2b1" stroke-width=".9"/><rect x="18" y="4" width="12" height="7" rx="1" fill="#2a3540"/><rect x="15" y="20" width="18" height="15" rx="1" fill="#fff" stroke="#c9d3db" stroke-width=".5"/><text x="24" y="27" text-anchor="middle" font-size="5.4" font-weight="700" fill="#22303c" font-family="Barlow, sans-serif">ETANOL</text><text x="24" y="33" text-anchor="middle" font-size="5" font-weight="700" fill="#c0392b" font-family="Barlow, sans-serif">96%</text><g fill="#fff" opacity=".8"><circle cx="15" cy="16" r=".8"/><circle cx="33" cy="38" r=".9"/><circle cx="31" cy="15" r=".6"/><circle cx="16" cy="39" r=".7"/></g><path d="M14.5,13 L14.5,41" stroke="#fff" stroke-width="1.4" opacity=".8"/>`),
  es: S_(48,48,`${SH(24,45,20)}<path d="M3,22 L45,22 L41,43 L7,43 Z" fill="url(#gCoat)" stroke="#b9c3cc" stroke-width=".8"/><g fill="#f4fbff" stroke="#bfe0f2" stroke-width=".7" opacity=".95"><rect x="9" y="15" width="9" height="9" rx="2" transform="rotate(-12 13 19)"/><rect x="20" y="12" width="9" height="9" rx="2" transform="rotate(8 24 16)"/><rect x="31" y="16" width="8" height="8" rx="2" transform="rotate(-6 35 20)"/></g><path d="M3,22 L45,22" stroke="#fff" stroke-width="1.2"/>`),
  timer: S_(48,48,`${SH(24,45,15)}<circle cx="24" cy="26" r="17" fill="url(#gSteel)"/><circle cx="24" cy="26" r="14" fill="#fbfcfd" stroke="#b9c3cc" stroke-width=".6"/><g stroke="#5f7383" stroke-width=".8">${Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return `<path d="M${(24+Math.cos(a)*12).toFixed(1)},${(26+Math.sin(a)*12).toFixed(1)} L${(24+Math.cos(a)*13.5).toFixed(1)},${(26+Math.sin(a)*13.5).toFixed(1)}"/>`}).join('')}</g><path d="M24,16 L24,26 L31,30" stroke="#22303c" stroke-width="1.6" fill="none" stroke-linecap="round"/><rect x="20" y="4" width="8" height="5" rx="1" fill="url(#gSteel)"/><ellipse cx="19" cy="19" rx="5" ry="2.5" fill="#fff" opacity=".7" transform="rotate(-30 19 19)"/>`),
  campuran: S_(48,48,BEAKER('url(#gPulp)',22)),
  larutan: S_(48,48,BEAKER('url(#gSol)',16)),
  spiritus: S_(48,48,`${SH(24,45,13)}<path d="M13,26 L35,26 L37,44 L11,44 Z" fill="url(#gEth)" stroke="#8fa2b1" stroke-width=".9"/><path d="M13.5,34 L34.6,34 L36,43.5 L12,43.5 Z" fill="#bcd8ff" opacity=".55"/><rect x="20.5" y="20" width="7" height="6" fill="url(#gSteel)"/><path d="M24,3 C30,9 29.5,15 24,19.5 C18.5,15 18,9 24,3 Z" fill="#ffb347" opacity=".9" filter="url(#fGlow)"/><path d="M24,9 C26.5,12 26,15 24,17.5 C22,15 21.5,12 24,9 Z" fill="#4da3ff" opacity=".8"/>`),
  kocok: S_(48,48,`<g transform="rotate(20 24 24)">${SH(24,45,8)}<path d="M18,5 L30,5 L30,36 C30,44 18,44 18,36 Z" ${GL}/><path d="M18.5,26 L29.5,26 L29.5,36 C29.5,43 18.5,43 18.5,36 Z" fill="url(#gFilt)"/></g><path d="M6,14 L10,18 M4,26 L9,26 M40,10 L36,16 M44,24 L38,24" stroke="#e5484d" stroke-width="2.4" stroke-linecap="round"/>`),
};

/* ---------------- state lab ---------------- */
function freshLab(){ return {
  sample:{picked:false, washN:0, cut:0},
  grind:{inMortar:false, v:0, done:false},
  sol:{beaker:false, water:0, waterDone:false, salt:null, det:null, stir:0, foam:false},
  ext:{vol:0, poured:false, stir:0, foam:false, waited:false, waiting:false},
  filt:{beaker2:false, funnel:false, paper:false, vol:0, done:false},
  ppt:{rack:false, tube:false, filtrate:0, filtDone:false, iced:false, clamp:false, eth:0, cold:null, mixed:false, shaken:false, poured:false},
  obs:{waited:false, waiting:false, zoomed:false, table:{}},
  wrong:[], k3bad:[] }; }
let L = store.get('lab', null) || freshLab();
let K3 = new Set(store.get('k3', []));
const saveLab = () => store.set('lab', L);

function calc(){
  const s = L.sol, e = L.ext, p = L.ppt;
  const det = s.det==='ok'?1 : s.det==='lebih'?.85 : s.det==='kurang'?.5 : .05;
  const salt = s.salt==='ok'?1 : s.salt==='lebih'?.8 : s.salt==='kurang'?.6 : .5;
  const tissue = Math.round(L.grind.v);
  const mem = e.poured ? Math.round(det * (e.waited?100: e.stir>=100?65:35)) : 0;
  const rel = Math.round(mem * tissue/100 * salt * (s.foam?.85:1) * (e.foam?.8:1) * (Math.abs(s.water-100)<=10?1:.85) * (e.vol>=40&&e.vol<=60?1:.85));
  const ratio = p.filtrate ? p.eth/p.filtrate : 0;
  const rf = ratio===0 ? 0 : ratio<.8 ? ratio/.8 : ratio>1.6 ? .9 : 1;
  const prec = L.obs.waited ? Math.round(rel * (L.filt.done?1:.8) * (p.filtrate>=4&&p.filtrate<=6?1:.85) * (p.cold?1:.65) * (p.mixed?.4:1) * (p.shaken?.3:1) * rf) : 0;
  const purity = clamp(25 + (L.filt.done?10:0) + (p.cold?5:0) + (s.salt==='ok'?10:0) + (p.mixed||p.shaken?-10:0), 5, 60);
  return { tissue, mem, rel, prec, purity, ratio };
}
function statusHTML(){
  const c = calc(), rows = [['Jaringan hancur',c.tissue,'#2fb344'],['Membran larut',c.mem,'#ff922b'],['DNA terlepas',c.rel,'#7c5cff'],['DNA mengendap',c.prec,'#2f7be6']];
  return `<div class="status"><div class="t"><b>Status isolasi</b><span>angka ilustrasi, dihitung dari tindakanmu</span></div>${rows.map(r=>`<div class="st">${r[0]}<span class="v">${r[1]}%</span><div class="bar2"><i style="width:${r[1]}%;background:${r[2]}"></i></div></div>`).join('')}</div>`;
}
function refreshStatus(){ const s = $('#stage .status'); if (s) s.outerHTML = statusHTML(); }

/* ---------------- gerakan ---------------- */
let artT = 0; const throttleArt = f => { const n = performance.now(); if (n-artT>70){ artT = n; f(); } };
const FX = { pour:null };
function circlePad(host, html, onAngle, onEnd, cls=''){
  const g = document.createElement('div'); g.className = 'gest '+cls; g.innerHTML = html; host.appendChild(g);
  const pad = g.querySelector('.pad'), dot = g.querySelector('.dot'); let prev = null, lastT = 0, closed = false;
  const pos = e => { const r = pad.getBoundingClientRect(); return {x:e.clientX-r.left-r.width/2, y:e.clientY-r.top-r.height/2, R:r.width/2}; };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); pad.setPointerCapture?.(e.pointerId); prev = pos(e); lastT = performance.now(); });
  pad.addEventListener('pointermove', e => { if (!prev) return; const p = pos(e), now = performance.now(), dt = Math.max(1, now-lastT);
    let da = Math.atan2(p.y,p.x) - Math.atan2(prev.y,prev.x); if (da>Math.PI) da -= 2*Math.PI; if (da<-Math.PI) da += 2*Math.PI;
    const sp = Math.hypot(p.x-prev.x, p.y-prev.y)/dt; dot.style.left = (p.R+p.x-13)+'px'; dot.style.top = (p.R+p.y-13)+'px'; prev = p; lastT = now; onAngle(Math.abs(da), sp, dt); });
  ['pointerup','pointercancel'].forEach(ev => pad.addEventListener(ev, () => prev = null));
  return { el:g, close(){ if (closed) return; closed = true; g.remove(); onEnd && onEnd(); } };
}
function stirPanel(host, title, obj, key, foamKey, rate, done, art){
  let fast = 0, sm = 0;
  const pad = circlePad(host, `<h3>${title}</h3><p>Gerakkan jari melingkar di dalam lingkaran. <b>Perlahan</b> agar tidak berbusa.</p><div class="pad"><span class="dot" style="left:calc(50% - 13px);top:8px"></span></div>
    <div class="speed"><i style="left:0%"></i></div><p class="sp">Kecepatan: –</p><div class="prog"><i style="width:${obj[key]}%"></i></div><button class="mini" data-k>Aduk (tombol)</button>`,
    (da, sp, dt) => { sm = sm*.8 + sp*.2; pad.el.querySelector('.speed i').style.left = clamp(sm/2.2*100,0,100)+'%';
      pad.el.querySelector('.sp').textContent = 'Kecepatan: ' + (sm<1.2?'pelan ✓':sm<1.6?'sedang':'TERLALU CEPAT!');
      if (sm>=1.6){ fast += dt; if (fast>350 && !obj[foamKey]){ obj[foamKey] = true; toast('Terlalu cepat! Larutan berbusa dan DNA dapat patah.', 'bad'); } }
      obj[key] = Math.min(100, obj[key] + da*rate); pad.el.querySelector('.prog i').style.width = obj[key]+'%'; if (art) throttleArt(art); if (obj[key]>=100) pad.close(); },
    () => { saveLab(); done(); }, 'side');
  pad.el.querySelector('[data-k]').onclick = () => { obj[key] = Math.min(100, obj[key]+25); pad.el.querySelector('.prog i').style.width = obj[key]+'%'; if (obj[key]>=100) pad.close(); };
}
function pourPanel(host, {title, note, unit, target, lo, hi, max, tilt=false, mixKey=null, mixObj=null, mixAt=55, rate=1, start=0, onDone, onProgress, side=''}){
  const g = document.createElement('div'); g.className = 'gest compact ' + side; let v = start, timer = null, fastMs = 0;
  g.innerHTML = `<h3>${title}</h3><p>${note}</p>${tilt?`<label for="tiltR" style="font-weight:800;font-size:.85rem">Kemiringan: <b id="tiltV">35°</b></label><input type="range" id="tiltR" min="10" max="80" value="35">`:''}
    <button class="holdbtn" id="holdB">Tahan untuk menuang</button><div class="vol"><i style="width:0%"></i><span class="tgt" style="left:${target/max*100}%"></span></div>
    <p class="vt">0 ${unit} (target ± ${target} ${unit})</p><button class="mini y" id="doneB">Selesai</button>`;
  host.appendChild(g);
  const tr = g.querySelector('#tiltR'); if (tr) tr.oninput = () => g.querySelector('#tiltV').textContent = tr.value+'°';
  const upd = () => { g.querySelector('.vol i').style.width = clamp(v/max*100,0,100)+'%'; g.querySelector('.vt').textContent = `${Math.round(v*10)/10} ${unit} (target ± ${target} ${unit})`; };
  const step = add => { v = Math.min(max, v + add); if (tilt && mixObj && +tr.value>mixAt){ fastMs += 60; if (fastMs>250 && !mixObj[mixKey]){ mixObj[mixKey] = true; toast('Terlalu miring! Cairan mengalir deras dan lapisan tercampur.', 'bad'); } } if (Math.random()<.35) sfx.pour(); upd(); if (onProgress) onProgress(v, true); };
  const go = e => { e.preventDefault(); if (timer) return; g.querySelector('#holdB').classList.add('held'); timer = setInterval(() => step(rate * (tilt ? +tr.value/35 : 1) * max/100), 60); };
  const stop = () => { clearInterval(timer); timer = null; g.querySelector('#holdB').classList.remove('held'); if (onProgress) onProgress(v, false); };
  const hb = g.querySelector('#holdB'); hb.addEventListener('pointerdown', go); ['pointerup','pointerleave','pointercancel'].forEach(ev => hb.addEventListener(ev, stop));
  hb.addEventListener('contextmenu', e => e.preventDefault());
  hb.addEventListener('keydown', e => { if (e.key===' '||e.key==='Enter'){ e.preventDefault(); step(max/10 * (tilt ? +tr.value/35 : 1)); } });
  g.querySelector('#doneB').onclick = () => { stop(); if (v<=0) return toast('Belum ada yang dituang.', 'warn'); g.remove();
    const ok = v>=lo && v<=hi; if (!ok) toast(`Volume ${Math.round(v*10)/10} ${unit} kurang tepat (anjuran ${lo}–${hi} ${unit}).`, 'warn'); onDone(v, ok); };
}

/* ---------------- mesin langkah praktikum ---------------- */
function labSlide(cfg){
  // cfg: {tray:[ids], names:{}, steps:[{t, items, done(), act(item, ctx)}], wrong:{id:msg}, draw(), zoom?(), sci}
  return { render(el){
      el.innerHTML = `<h2 class="ribbon">${cfg.ribbon}</h2>
        <div class="sim"><div>
          <div class="tray"><span class="tl">Alat &amp; bahan (ketuk untuk memakai)</span>${cfg.tray.map(id=>`<button class="tool" data-t="${id}">${IC[cfg.icon?.[id]||id]}<span>${cfg.names[id]}</span></button>`).join('')}</div>
          <div class="workbench" id="wb"></div></div>
          <div class="stack"><div class="task" id="task"></div><div class="ctlbar" id="ctl"></div><ol class="substeps" id="subs"></ol>${cfg.zoom?'<div class="zoomcard"><span class="kicker">Zoom molekul</span><svg viewBox="0 0 300 110" id="zsvg"></svg><p class="cap" id="zcap"></p></div>':''}<div class="sci">${cfg.sci}</div></div></div>
        ${statusHTML()}`;
      el.querySelectorAll('.tool').forEach(b => b.onclick = () => useTool(b.dataset.t));
      paint();
    }, locked: () => !cfg.steps.every(s => s.done()), lockMsg: 'Selesaikan semua langkah di slide ini dulu.' };
  function cur(){ return cfg.steps.find(s => !s.done()); }
  function paint(){
    const wb = $('#wb'); if (!wb) return;
    wb.innerHTML = cfg.draw();
    const c = cur();
    $('#task').className = 'task' + (c ? '' : ' ok'); $('#task').textContent = c ? '👉 ' + c.t : '✓ Langkah di slide ini selesai. Tekan Lanjut.'; hudTask(c ? c.t : 'Langkah selesai. Tekan Lanjut.');
    $('#subs').innerHTML = cfg.steps.map(s => `<li class="${s.done()?'ok':s===c?'now':''}">${s.t}</li>`).join('');
    $$('#stage .tool').forEach(b => { const s = cfg.steps.find(x => x.items.includes(b.dataset.t)); b.classList.toggle('done', !!s && s.done() && !(c && c.items.includes(b.dataset.t))); b.classList.toggle('pulse', !!(c && c.items.includes(b.dataset.t)) && guided()); });
    if (cfg.zoom){ const z = cfg.zoom(); $('#zsvg').innerHTML = z[0]; $('#zcap').textContent = z[1]; }
    refreshStatus(); updateNext();
  }
  function useTool(id){
    if ($('#ctl .gest')) return toast('Selesaikan dulu kegiatan yang sedang berjalan.', 'warn');
    const c = cur();
    if (cfg.wrong && cfg.wrong[id] && !(c && c.items.includes(id))){ const w = cfg.wrong[id]; if (id==='kocok' && L.ppt.poured && !L.ppt.shaken){ L.ppt.shaken = true; } if (w.k3) L.k3bad.push(id); else L.wrong.push(id); saveLab(); return toast(w.msg || w, 'bad'); }
    if (!c){ return toast('Langkah di slide ini sudah selesai.', 'warn'); }
    // izinkan langkah yang urutannya bebas
    const target = cfg.steps.find(s => !s.done() && s.items.includes(id) && (s===c || s.free));
    if (!target){ const later = cfg.steps.find(s => s.items.includes(id));
      if (later && later.done()) return toast('Sudah dilakukan.', 'warn');
      L.wrong.push(id); saveLab(); return toast(later ? `Belum saatnya. Lakukan dulu: ${c.t}` : 'Alat/bahan ini tidak dipakai pada langkah ini.', 'bad'); }
    target.act(id, { paint, wb: $('#ctl'), art: () => { const w = $('#wb'); const o = w && w.querySelector(':scope > svg'); if (o) o.outerHTML = cfg.draw(); } });
    saveLab(); paint();
  }
}
const guided = () => store.get('guided', true);

/* ---------------- gambar meja ---------------- */
const tomatoBig = (x,y,s=1,wet=false) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,-30 C26,-31 40,-12 39,8 C37,28 20,38 0,38 C-20,38 -37,28 -39,8 C-40,-12 -26,-31 0,-30 Z" fill="url(#gTomS)" stroke="#a3241a" stroke-width="4"/><path d="M0,-29 L-10,-38 L-2,-34 L0,-44 L3,-34 L12,-38 L4,-29 Z" fill="#2f9e44" stroke="#1e6b2d" stroke-width="2"/><path d="M-20,-14 C-25,-6 -26,2 -25,10" stroke="#ff8a7a" stroke-width="5" fill="none" stroke-linecap="round"/>${wet?'<circle cx="18" cy="-10" r="3" fill="#a5d8ff"/><circle cx="-8" cy="20" r="2.5" fill="#a5d8ff"/><circle cx="24" cy="14" r="2" fill="#a5d8ff"/>':''}</g>`;
function drawS12(){
  const s = L.sample, washed = s.washN>=3;
  let h = `<svg viewBox="0 0 320 220"><rect x="14" y="150" width="120" height="40" rx="8" fill="url(#gSteel)" stroke="#6f808d" stroke-width="1.5"/><path d="M20,150 L128,150 L120,186 L28,186 Z" fill="#a5d8ff" opacity=".6"/>
    <text x="74" y="208" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="800" font-size="11" fill="#1b2f6b">bak cuci</text>
    <rect x="160" y="160" width="150" height="26" rx="6" fill="url(#gWood)" stroke="#6e4520" stroke-width="3"/><text x="235" y="208" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="800" font-size="11" fill="#1b2f6b">talenan</text>`;
  if (s.picked && !washed) h += tomatoBig(74, 130, 1, s.washN>0) + (s.washN>0?`<rect x="40" y="10" width="40" height="14" rx="4" fill="#adb5bd" stroke="#1b2f6b" stroke-width="2"/><path d="M60,24 C62,60 66,84 70,100" stroke="#74c0fc" stroke-width="7" stroke-linecap="round" fill="none" stroke-dasharray="8 6"><animate attributeName="stroke-dashoffset" from="28" to="0" dur=".5s" repeatCount="indefinite"/></path>`:'');
  if (washed && s.cut===0) h += tomatoBig(235, 128, 1, true);
  if (s.cut>0){ const n = s.cut*2; for (let i=0;i<n;i++){ const x = 176+(i%6)*22, y = 138+((i/6)|0)*14; h += `<path d="M${x},${y} a9,9 0 0 1 18,0 Z" fill="url(#gTomS)" stroke="#a3241a" stroke-width="2"/><circle cx="${x+9}" cy="${y-3}" r="1.5" fill="#ffe066"/>`; }
    h += `<g transform="translate(${250-s.cut*6},${80+(s.cut%2)*10}) rotate(-30)"><g class="chop"><path d="M0,0 L50,-6 L52,4 L2,10 Z" fill="url(#gSteel)" stroke="#6f808d" stroke-width="1.3"/><rect x="50" y="-7" width="26" height="12" rx="4" fill="#1b2f6b"/></g></g>`; }
  if (s.cut>=6) h += `<text x="235" y="120" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="800" font-size="12" fill="#1b2f6b">± 50 g potongan tomat</text>`;
  return h + '</svg>';
}
function mortarSVG(fill, chunks, color='url(#gPulp)', extra=''){
  let h = `<svg viewBox="0 0 320 220"><ellipse cx="160" cy="192" rx="100" ry="10" fill="#495057" opacity=".2"/><path d="M70,90 L250,90 C250,150 210,190 160,190 C110,190 70,150 70,90 Z" fill="url(#gCeramic)" stroke="#6f808d" stroke-width="2"/>
    <ellipse cx="160" cy="90" rx="90" ry="14" fill="#f8f9fa" stroke="#6f808d" stroke-width="1.8"/>`;
  if (fill>0) h += `<ellipse cx="160" cy="${150-fill*0.5}" rx="${60+fill*0.25}" ry="12" fill="${color}" stroke="#a3241a" stroke-width="2"/><path d="M${100-fill*.2},${150-fill*.5} C110,180 210,180 ${220+fill*.2},${150-fill*.5}" fill="${color}"/>`;
  for (let i=0;i<chunks;i++){ const x = 120+(i%5)*18, y = 128-((i/5)|0)*12; h += `<path d="M${x},${y} a9,9 0 0 1 18,0 Z" fill="url(#gTomS)" stroke="#a3241a" stroke-width="2"/>`; }
  return h + extra + '</svg>';
}
function drawS13(){ const g = L.grind; if (!g.inMortar) return mortarSVG(0,0) ; const k = g.v/100;
  const a = g.v/100*Math.PI*10, px = 160+Math.cos(a)*45, py = 132-k*20+Math.sin(a)*12;
  return mortarSVG(10+k*50, Math.round(12*(1-k)), 'url(#gPulp)', `<path d="M${px+60},14 L${px},${py}" stroke="#cfc8bd" stroke-width="15" stroke-linecap="round"/><circle cx="${px}" cy="${py}" r="12" fill="url(#gCeramic)" stroke="#8a8478" stroke-width="1.5"/>`); }
function beakerSVG(x, y, level, color, opts={}){
  let h = `<g transform="translate(${x},${y})"><ellipse cx="50" cy="134" rx="56" ry="6" fill="#000" opacity=".14"/><path d="M0,0 L0,120 C0,128 6,132 14,132 L86,132 C94,132 100,128 100,120 L100,0" fill="url(#gGlass)" stroke="#6f808d" stroke-width="1.8"/><path d="M-4,0 L104,0" stroke="#8796a2" stroke-width="3" stroke-linecap="round"/>
    ${[0,1,2,3].map(i=>`<line x1="100" y1="${20+i*26}" x2="90" y2="${20+i*26}" stroke="#1b2f6b" stroke-width="2"/>`).join('')}`;
  if (level>0) h += `<path d="M3,${130-level} L97,${130-level} L97,120 C97,126 92,129 86,129 L14,129 C8,129 3,126 3,120 Z" fill="${color}"/>`;
  if (opts.salt) h += [0,1,2].map(i=>`<rect x="${26+i*20}" y="${126-level/2+(i%2)*8}" width="5" height="5" fill="#fff" stroke="#868e96" transform="rotate(45 ${28+i*20} ${128-level/2+(i%2)*8})"/>`).join('');
  if (opts.foam) h += Array.from({length:12},(_,i)=>`<circle cx="${10+(i*17)%80}" cy="${126-level-(i%3)*8}" r="7" fill="#fff" stroke="#adb5bd" stroke-width="2"/>`).join('');
  else if (opts.bubbles) h += Array.from({length:4},(_,i)=>`<circle cx="${18+i*20}" cy="${127-level}" r="4" fill="#fff" stroke="#adb5bd" stroke-width="1.5"/>`).join('');
  h += `<path d="M9,8 L9,118" stroke="#fff" stroke-opacity=".75" stroke-width="4" stroke-linecap="round"/><path d="M18,10 L18,60" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-linecap="round"/>`;
  if (opts.label) h += `<text x="50" y="152" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="800" font-size="11" fill="#1b2f6b">${opts.label}</text>`;
  return h + '</g>';
}
function drawS14(){
  const s = L.sol; let h = `<svg viewBox="0 0 320 220">`;
  if (s.beaker){ const lvl = (s.waterDone ? s.water : 0)*0.75 + (s.det?6:0); h += beakerSVG(150, 50, lvl, s.det ? 'url(#gSol)' : 'url(#gEth)', {salt:!!s.salt, foam:s.foam, bubbles:!!s.det, label:'gelas beker'}); }
  if (!s.waterDone && s.beaker) h += `<g transform="translate(40,40)"><path d="M18,0 L50,0 L50,130 L60,140 L8,140 L18,130 Z" fill="url(#gGlass)" stroke="#6f808d" stroke-width="1.5"/>${s.water>0?`<rect x="21" y="${130-s.water*1.1}" width="26" height="${s.water*1.1}" fill="url(#gWater)"/>`:''}${[0,1,2,3,4].map(i=>`<line x1="50" y1="${20+i*22}" x2="42" y2="${20+i*22}" stroke="#1b2f6b" stroke-width="2"/>`).join('')}<text x="34" y="158" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="800" font-size="11" fill="#1b2f6b">gelas ukur</text>${FX.pour==='water'?`<path d="M34,-30 L34,${128-s.water*1.1}" stroke="#74c0fc" stroke-width="5" stroke-dasharray="8 5"><animate attributeName="stroke-dashoffset" from="26" to="0" dur=".4s" repeatCount="indefinite"/></path>`:''}</g>`;
  if (s.stir>0 && s.stir<100){ const a = s.stir/100*Math.PI*8, bx = 200+Math.cos(a)*30; h += `<path d="M${bx+34},24 L${bx},168" stroke="#adb5bd" stroke-width="6" stroke-linecap="round"/>`; }
  return h + '</svg>';
}
function drawS15(){ const e = L.ext; const fill = 50 + Math.min(e.vol,60)*0.6;
  let extra = '';
  if (FX.pour==='ext') extra += `<g transform="translate(236,6) rotate(-55 30 40)"><path d="M0,0 L0,60 C0,66 4,70 10,70 L50,70 C56,70 60,66 60,60 L60,0" fill="#f8f9fa" stroke="#6f808d" stroke-width="1.5"/><rect x="2" y="30" width="56" height="38" fill="url(#gSol)"/></g><path d="M226,52 C206,64 192,84 186,110" stroke="#96f2d7" stroke-width="6" fill="none" stroke-dasharray="8 5"><animate attributeName="stroke-dashoffset" from="26" to="0" dur=".4s" repeatCount="indefinite"/></path>`;
  if (e.stir>0 && e.stir<100){ const a = e.stir/100*Math.PI*8, bx = 160+Math.cos(a)*40; extra += `<path d="M${bx+44},22 L${bx},150" stroke="#adb5bd" stroke-width="6" stroke-linecap="round"/>`; }
  if (e.foam) extra += Array.from({length:8},(_,i)=>`<circle cx="${110+i*14}" cy="100" r="6" fill="#fff" stroke="#adb5bd"/>`).join('');
  if (e.waiting||e.waited) extra += `<g transform="translate(276,46)"><circle r="24" fill="#fff" stroke="#6f808d" stroke-width="1.8"/><path d="M0,-14 L0,0 L9,7" stroke="#6f808d" stroke-width="1.8" fill="none" stroke-linecap="round">${e.waiting?'<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1s" repeatCount="indefinite"/>':''}</path></g>`;
  return mortarSVG((e.poured||e.vol>0) ? fill : 60, 0, (e.poured||e.vol>0) ? 'url(#gPulp)' : 'url(#gPulp)', extra); }
function drawS16(){
  const f = L.filt; let h = `<svg viewBox="0 0 320 220">`;
  if (f.beaker2) h += beakerSVG(170, 80, f.vol*0.9, 'url(#gFilt)', {label:'filtrat'});
  if (f.funnel) h += `<path d="M150,40 L290,40 L232,96 L232,120 L208,120 L208,96 Z" fill="url(#gGlass)" stroke="#6f808d" stroke-width="1.8" stroke-linejoin="round"/>`;
  if (f.paper) h += `<path d="M158,44 L282,44 L220,100 Z" fill="#fff" stroke="#adb5bd" stroke-width="3"/>`;
  if (f.done || f.vol>0) h += `<ellipse cx="220" cy="54" rx="44" ry="8" fill="#d9480f" opacity=".75"/><text x="300" y="56" text-anchor="end" font-family="Barlow, sans-serif" font-weight="800" font-size="11" fill="#1b2f6b">ampas</text>`;
  if (f.vol>0 && !f.done) h += [0,1,2].map(i=>`<circle cx="220" cy="124" r="4" fill="url(#gFilt)" stroke="#e8590c"><animate attributeName="cy" from="124" to="${205-f.vol*.9}" dur=".6s" begin="${i*.2}s" repeatCount="indefinite"/></circle>`).join('') + `<path d="M112,82 C150,40 180,38 214,46" stroke="#ff9e80" stroke-width="7" fill="none" stroke-dasharray="9 5"><animate attributeName="stroke-dashoffset" from="28" to="0" dur=".4s" repeatCount="indefinite"/></path>`;
  if (!f.done) h += f.vol>0 ? `<g transform="rotate(-40 70 150)">${beakerSVG(20, 80, 70-f.vol, 'url(#gPulp)', {})}</g>` : beakerSVG(20, 80, 70, 'url(#gPulp)', {label:'campuran'});
  return h + '</svg>';
}
function drawS17(){
  const p = L.ppt; let h = `<svg viewBox="0 0 320 220">`;
  h += `<g transform="translate(14,120)"><path d="M0,20 L90,20 L82,80 L8,80 Z" fill="#e7f5ff" stroke="#6f808d" stroke-width="1.5"/>${[10,30,52,68].map((x,i)=>`<rect x="${x}" y="${10+i%2*6}" width="14" height="14" rx="3" fill="#fff" stroke="#74c0fc" stroke-width="2"/>`).join('')}
    <g transform="translate(${p.iced?30:110},${p.iced?-30:-40})"><rect width="30" height="48" rx="6" fill="url(#gEth)" stroke="#6f808d" stroke-width="1.5"/><rect x="8" y="-10" width="14" height="10" fill="#1b2f6b"/><text x="15" y="30" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="800" font-size="7" fill="#1b2f6b">ETANOL</text></g>
    <text x="45" y="98" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="800" font-size="11" fill="#1b2f6b">wadah es</text></g>`;
  if (p.rack) h += `<rect x="170" y="170" width="130" height="12" rx="3" fill="url(#gWood)" stroke="#6e4520" stroke-width="3"/><rect x="180" y="182" width="8" height="24" fill="url(#gWood)" stroke="#6e4520" stroke-width="2"/><rect x="282" y="182" width="8" height="24" fill="url(#gWood)" stroke="#6e4520" stroke-width="2"/>`;
  if (p.tube){
    const fh = p.filtrate*12, eh = Math.min(p.eth,10)*12, bottom = 200, fy = bottom-fh, ey = fy-eh;
    h += `<g transform="rotate(${p.clamp && !p.poured ? -25 : 0} 235 200)"><path d="M222,40 L222,192 C222,210 248,210 248,192 L248,40" fill="url(#gGlass)" stroke="#6f808d" stroke-width="1.8"/>
      ${fh?`<path d="M225,${fy} L245,${fy} L245,192 C245,205 225,205 225,192 Z" fill="${p.mixed||p.shaken?'#ffe8d6':'url(#gFilt)'}"/>`:''}
      ${eh?`<rect x="225" y="${ey}" width="20" height="${eh}" fill="${p.mixed||p.shaken?'#ffe8d6':'url(#gEth)'}"/>`:''}
      ${p.clamp?`<path d="M200,70 L222,80 M200,86 L222,92" stroke="#c98b53" stroke-width="5" stroke-linecap="round"/>`:''}
      ${FX.pour==='eth'?`<path d="M226,-20 L226,${ey||fy}" stroke="#74c0fc" stroke-width="3" stroke-dasharray="6 4"><animate attributeName="stroke-dashoffset" from="20" to="0" dur=".35s" repeatCount="indefinite"/></path>`:''}</g>`;
    if (fh) h += `<text x="256" y="${Math.min(196,fy+18)}" font-family="Barlow, sans-serif" font-weight="800" font-size="11" fill="#1b2f6b">filtrat ${p.filtrate} mL</text>`;
    if (eh && !p.mixed && !p.shaken) h += `<text x="256" y="${ey+12}" font-family="Barlow, sans-serif" font-weight="800" font-size="11" fill="#1b2f6b">etanol</text>`;
  }
  if (p.tube && !p.filtDone && p.filtrate>0) h += `<g transform="translate(228,${20})"><path d="M7,10 L7,30" stroke="#6f808d" stroke-width="1.5"/><ellipse cx="7" cy="6" rx="6" ry="7" fill="#ff8787" stroke="#6f808d" stroke-width="1.3"/></g>`;
  return h + '</svg>';
}
function zoomCells(){ const br = Math.round(L.grind.v/100*6);
  const bg = `<rect width="300" height="110" fill="#efe3d2"/>`;
  return [bg + Array.from({length:6},(_,i)=>{ const x = 6+i*48, b = i<br;
    const leak = b ? `<ellipse cx="${x+21}" cy="96" rx="20" ry="7" fill="#f3b48a" opacity=".55" filter="url(#fBlur2)"/>${Array.from({length:4},(_,k)=>`<ellipse cx="${x+8+k*9}" cy="${92+(k%2)*5}" rx="2.6" ry="1.8" fill="url(#gPlast)"/>`).join('')}` : '';
    return `${leak}<rect x="${x+1}" y="20" width="42" height="68" rx="7" fill="#000" opacity=".15" filter="url(#fBlur2)"/><rect x="${x}" y="18" width="42" height="68" rx="7" fill="url(#gCyto)" stroke="url(#gWallS)" stroke-width="5" ${b?'stroke-dasharray="16 9 6 12"':''}/>${b?'':`<rect x="${x+3.5}" y="21.5" width="35" height="61" rx="5" fill="none" stroke="#d7a27a" stroke-width="1"/>`}<circle cx="${x+21}" cy="52" r="9" fill="url(#gNuc)" stroke="#6d5296" stroke-width=".8"/><circle cx="${x+23}" cy="50" r="3" fill="#5b3f8a" opacity=".8"/>${[[10,30],[30,34],[14,72],[32,74],[24,28]].map(([dx,dy])=>`<ellipse cx="${x+dx}" cy="${dy}" rx="3.6" ry="2.3" fill="url(#gPlast)"/>`).join('')}`; }).join(''),
    `${br} dari 6 dinding sel robek. Butir jingga-merah = kromoplas (plastida berpigmen likopen).`]; }
function zoomMembrane(){
  const e = L.ext, s = L.sol, bg = `<rect width="300" height="110" fill="#f6efe6"/>`;
  const bil = gap => Array.from({length:22},(_,i)=> gap && gap(i) ? '' : REAL.lipid(10+i*13.4,22,false)+REAL.lipid(10+i*13.4,50,true)).join('');
  if (!e.poured) return [bg + bil() + `<g opacity=".35">${REAL.dnaStrip(30,90,240,{amp:7,sc:.5})}</g>`, 'Membran sel dan membran inti (lapisan ganda lipid, kepala jingga) masih utuh. DNA terkurung di dalam inti.'];
  if (!e.waited) return [bg + bil(i=>i%4===1||i%4===2) + [70,170,240].map(x=>REAL.micelle(x,36)).join(''), 'Detergen (kepala hijau) mulai membongkar membran menjadi misel. Diamkan agar prosesnya tuntas.'];
  return [bg + [40,120,200,270].map(x=>REAL.micelle(x,26,11)).join('') + REAL.dnaStrip(18,80,268,{amp:9,sc:.55}) +
    (s.salt ? [45,95,140,188,232,272].map((x,i)=>REAL.na(x,i%2?58:102)).join('') : ''),
    s.salt ? 'Membran larut menjadi misel. DNA keluar ke larutan, dan ion Na⁺ (ungu) mengurangi tolakan antar-gugus fosfat yang bermuatan negatif.' : 'DNA keluar, tetapi tanpa garam muatan negatifnya saling tolak sehingga sulit beragregasi.'];
}
function zoomPpt(){ const p = L.ppt;
  const W = Array.from({length:16},(_,i)=>REAL.water(10+i*18.5, 10+(i*37)%92, .9, i*47)).join('');
  if (!p.eth) return [`<rect width="300" height="110" fill="url(#gFilt)"/>${W}${[[20,32],[120,60],[200,86]].map(([x,y],i)=>REAL.dnaStrip(x,y,84,{amp:6,sc:.42,ph:i})).join('')}`, 'DNA larut dalam filtrat, dikelilingi molekul air (oksigen merah, hidrogen putih).'];
  const m = p.mixed||p.shaken;
  if (m) return [`<rect width="300" height="110" fill="#f6d2bb"/>${W}${REAL.dnaStrip(40,40,80,{amp:6,sc:.42})}${REAL.dnaStrip(170,74,80,{amp:6,sc:.42,ph:2})}`, 'Lapisan tercampur: batas lapisan tidak terbentuk, jadi hanya sedikit DNA yang beragregasi.'];
  return [`<rect width="300" height="55" fill="#eef5fa"/><rect y="55" width="300" height="55" fill="url(#gFilt)"/><rect y="52" width="300" height="6" fill="#fff" opacity=".6" filter="url(#fBlur2)"/>${REAL.strands(150,58,250,46,26,7)}${REAL.dnaStrip(70,46,70,{amp:5,sc:.38})}${REAL.dnaStrip(150,40,70,{amp:5,sc:.38,ph:1.5})}${REAL.dnaStrip(110,52,80,{amp:5,sc:.38,ph:3})}`,
    'Di batas lapisan, DNA yang sukar larut dalam etanol beragregasi menjadi serabut putih dan mulai mengendap.'];
}

/* ---------------- konten slide ---------------- */
const SL = [];
const helixAnim = `<svg viewBox="0 0 320 240" class="illus" id="dnaSvg">${Array.from({length:10},(_,i)=>{ const y = 20+i*21, a = i*.75, x1 = 160+Math.sin(a)*80, x2 = 160-Math.sin(a)*80, pr = [['A','T'],['G','C'],['T','A'],['C','G']][i%4];
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#adb5bd" stroke-width="5"/><g class="hot" data-h="basa"><circle cx="${(x1*2+x2)/3}" cy="${y}" r="7" fill="${['#ff6b6b','#fcc419','#51cf66','#339af0'][i%4]}"/><circle cx="${(x1+x2*2)/3}" cy="${y}" r="7" fill="${['#51cf66','#339af0','#ff6b6b','#fcc419'][i%4]}"/></g>
  <line class="hot" data-h="hidrogen" x1="${(x1*2+x2)/3+8}" y1="${y}" x2="${(x1+x2*2)/3-8}" y2="${y}" stroke="#1b2f6b" stroke-width="2" stroke-dasharray="3 3"/>
  <g class="hot" data-h="fosfat"><circle cx="${x1}" cy="${y}" r="10" fill="#2f7be6" stroke="#1b2f6b" stroke-width="2"/><text x="${x1}" y="${y+4}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="Barlow, sans-serif">−</text></g>
  <g class="hot" data-h="gula"><rect x="${x2-9}" y="${y-9}" width="18" height="18" rx="4" fill="#7c5cff" stroke="#1b2f6b" stroke-width="2"/></g>`; }).join('')}</svg>`;
const HX = { fosfat:['Gugus fosfat','Bagian tulang punggung DNA yang bermuatan negatif (−). Muatan ini membuat DNA larut dalam air dan menjadi alasan garam dipakai saat isolasi.'],
  gula:['Gula deoksiribosa','Gula berkarbon lima yang bersama fosfat membentuk tulang punggung DNA.'],
  basa:['Basa nitrogen','Adenin (A), timin (T), guanin (G), dan sitosin (C). Urutan basa inilah yang menyimpan informasi genetik.'],
  hidrogen:['Ikatan hidrogen','Menghubungkan pasangan basa A–T (2 ikatan) dan G–C (3 ikatan) sehingga kedua untai membentuk heliks ganda.'] };
const CELL = { dinding:['Dinding sel','Lapisan kaku dari selulosa (dan pektin pada tomat). Harus dirusak secara mekanik.', false],
  membran:['Membran sel','Lapisan ganda lipid yang membungkus sitoplasma. Dilarutkan oleh detergen.', false],
  inti:['Inti sel (nukleus)','Lokasi utama DNA, tersimpan sebagai kromatin bersama protein histon. Dibungkus membran inti.', true],
  mito:['Mitokondria','Memiliki DNA sendiri (DNA mitokondria) dalam jumlah kecil.', 'sec'],
  plastida:['Plastida (kloroplas/kromoplas)','Pada buah tomat matang, kloroplas berubah menjadi kromoplas berpigmen likopen. Plastida juga memiliki DNA sendiri.', 'sec'],
  vakuola:['Vakuola','Kantong berisi cairan sel. Tidak menyimpan DNA.', false] };
const TOOLS = [['mortar','Mortar dan alu','1 set','Menghaluskan tomat'],['beker','Gelas beker','2 buah','Wadah larutan dan filtrat'],['ukur','Gelas ukur','1 buah','Mengukur volume larutan'],['tabung','Tabung reaksi','1–2 buah','Wadah pengamatan DNA'],['rak','Rak tabung reaksi','1 buah','Menempatkan tabung'],['corong','Corong','1 buah','Membantu penyaringan'],['saring','Kertas saring/kain kasa','Secukupnya','Menyaring ampas'],['pipet','Pipet tetes','1 buah','Memindahkan cairan'],['pengaduk','Batang pengaduk','1 buah','Mengaduk larutan'],['pisau','Pisau dan talenan','1 set','Memotong tomat'],['sendok','Sendok ukur','1 buah','Menakar bahan'],['penjepit','Penjepit tabung','1 buah','Membantu memegang tabung']];
const MATS = [['tomat','Tomat matang','± 50 gram','Sumber DNA'],['air','Air/akuades','100 mL','Pelarut larutan ekstraksi'],['garam','Garam dapur (NaCl)','½ sendok teh','Ion Na⁺ mengurangi tolakan muatan negatif antarmolekul DNA sehingga DNA dapat beragregasi'],['deterjen','Detergen cair','1 sendok makan','Melarutkan membran sel dan membran inti (lipid) sehingga DNA keluar'],['etanol','Etanol 90–96% dingin','± 5 mL per 5 mL filtrat','DNA sukar larut dalam etanol sehingga mengendap (presipitasi)'],['es','Es batu','Secukupnya','Mendinginkan etanol agar pengendapan lebih banyak']];
const K3L = ['Saya memakai jas laboratorium dan sarung tangan.','Saya berhati-hati saat memakai pisau dan peralatan kaca.','Saya tidak akan mencicipi bahan praktikum.','Saya menjauhkan alkohol dari api dan sumber panas.','Saya memakai alkohol secukupnya di tempat berventilasi baik.','Saya bekerja di bawah pengawasan guru.'];

// 1
SL.push({ title:'Halaman Pembuka', nonav:true, render(el){ el.innerHTML = `<div class="cover"><div class="cover-art"><svg class="hero" viewBox="0 0 400 300" aria-hidden="true"><ellipse cx="200" cy="278" rx="170" ry="14" fill="#000" opacity=".12"/><use href="#tomato" x="10" y="80" width="200" height="200"/><use href="#tomhalf" x="165" y="140" width="140" height="140"/><g id="heroDNA">${REAL.helix(0,{cx:332,top:28,n:12,gap:19,rx:36,sc:.6,hot:false})}</g></svg></div>
  <div class="cover-text">
  <h1 class="logo"><span class="small-l">Mengungkap Materi Genetik</span><span>Isolasi DNA</span><span>Buah Tomat</span></h1>
  <p class="tag">Praktikum Laboratorium Virtual</p><p class="sub">Biologi Kelas XII SMA/MA · Genetika &amp; Bioteknologi<br><i>Solanum lycopersicum</i></p>
  <button class="btn-y big" id="startB">Mulai belajar ▶</button></div></div>`; $('#startB').onclick = () => show(2);
  { const g = $('#heroDNA'); let ph = 0; const spin = () => { if (!g.isConnected || REAL.reducedMotion) return; ph += .02; g.innerHTML = REAL.helix(ph,{cx:332,top:28,n:12,gap:19,rx:36,sc:.6,hot:false}); requestAnimationFrame(spin); }; requestAnimationFrame(spin); } } });
// 2
SL.push({ title:'Apersepsi', render(el){ const a = store.get('ap', {});
  el.innerHTML = `<h2 class="ribbon">Apersepsi</h2><div class="split"><svg viewBox="0 0 320 200" class="illus">
    <use href="#tomato" x="10" y="50" width="90" height="90"/><path d="M104,96 L128,96" stroke="#7d8b97" stroke-width="2"/><path d="M123,91 L130,96 L123,101" fill="none" stroke="#7d8b97" stroke-width="2"/>
    ${REAL.scope(180,96,42,"apScope",{size:18,seed:4})}
    <path d="M228,96 L250,96" stroke="#7d8b97" stroke-width="2"/><path d="M245,91 L252,96 L245,101" fill="none" stroke="#7d8b97" stroke-width="2"/><use href="#helix" x="256" y="40" width="56" height="112"/>
    <g font-family="Barlow, sans-serif" font-weight="800" font-size="12" fill="#1b2f6b" text-anchor="middle"><text x="55" y="160">buah tomat</text><text x="180" y="160">sel</text><text x="284" y="160">DNA</text></g></svg>
    <div class="stack"><div class="bubble">Pernahkah kamu berpikir bahwa buah tomat memiliki DNA? Bagaimana cara memperoleh dan mengamatinya?</div>
    <p class="kicker">1. Apakah buah tomat memiliki DNA?</p><div class="chips" id="q1">${[['ya','Ya, setiap sel hidup tomat memiliki DNA'],['biji','Hanya bijinya'],['tidak','Tidak, hanya hewan yang punya DNA']].map(o=>`<button class="chip ${a.q1===o[0]?(o[0]==='ya'?'good':'bad'):''}" data-v="${o[0]}">${o[1]}</button>`).join('')}</div><p class="reply" id="r1" ${a.q1?'':'hidden'}></p>
    <p class="kicker">2. Prediksi: seperti apa DNA tomat jika berhasil diisolasi?</p><div class="chips" id="q2">${[['heliks','Heliks ganda kecil terlihat jelas'],['endapan','Endapan putih keruh/serabut halus'],['merah','Cairan merah pekat']].map(o=>`<button class="chip ${a.q2===o[0]?'sel':''}" data-v="${o[0]}">${o[1]}</button>`).join('')}</div><p class="reply" id="r2" ${a.q2?'':'hidden'}>Prediksimu disimpan. Kita buktikan di slide 18.</p></div></div>`;
  const R1 = {ya:'Tepat. Setiap sel hidup tomat menyimpan DNA, terutama di inti sel.', biji:'Kurang tepat. Bukan hanya biji: setiap sel hidup daging buah juga memiliki DNA.', tidak:'Keliru. Tumbuhan, hewan, jamur, dan bakteri semuanya memiliki DNA.'};
  if (a.q1) $('#r1').textContent = R1[a.q1];
  $$('#q1 .chip').forEach(c => c.onclick = () => { a.q1 = c.dataset.v; store.set('ap', a); $$('#q1 .chip').forEach(x => x.className = 'chip' + (x===c ? (c.dataset.v==='ya'?' good':' bad') : '')); $('#r1').hidden = false; $('#r1').textContent = R1[a.q1]; c.dataset.v==='ya'?sfx.ok():sfx.bad(); });
  $$('#q2 .chip').forEach(c => c.onclick = () => { a.q2 = c.dataset.v; store.set('ap', a); $$('#q2 .chip').forEach(x => x.classList.toggle('sel', x===c)); $('#r2').hidden = false; });
} });
// 3
let goalN = 0;
SL.push({ title:'Tujuan Pembelajaran', render(el){ const G = ['Memahami konsep dasar DNA.','Menjelaskan prinsip isolasi DNA.','Mengidentifikasi alat dan bahan beserta fungsinya.','Memahami dan melakukan tahapan praktikum.','Menerapkan keselamatan kerja di laboratorium.','Menganalisis hasil pengamatan isolasi DNA tumbuhan.'];
  el.innerHTML = `<h2 class="ribbon">Tujuan Pembelajaran</h2><div class="split"><div class="panel paper"><p class="lead-b">Setelah praktikum ini, kamu diharapkan mampu:</p><ul class="checks" id="goals">${G.map(g=>`<li>${g}</li>`).join('')}</ul>
    <div class="center"><button class="btn-y" id="goalB">Tampilkan tujuan berikutnya ▶</button></div></div>
    <svg viewBox="0 0 200 200" class="av"><ellipse cx="100" cy="186" rx="70" ry="7" fill="#000" opacity=".25" filter="url(#fBlur4)"/><use href="#tomato" x="6" y="80" width="110" height="110"/><use href="#tubeic" x="112" y="40" width="60" height="148"/><use href="#helix" x="132" y="0" width="54" height="64"/></svg></div>`;
  const li = $$('#goals li'); li.forEach((l,i) => l.classList.toggle('on', i<goalN));
  const b = $('#goalB'); const upd = () => { b.disabled = goalN>=G.length; b.textContent = goalN>=G.length ? 'Semua tujuan ditampilkan ✓' : 'Tampilkan tujuan berikutnya ▶'; };
  upd(); b.onclick = () => { if (goalN<G.length){ li[goalN].classList.add('on'); goalN++; sfx.pop(); upd(); } };
} });
// 4
SL.push({ title:'Mengenal DNA', render(el){ el.innerHTML = `<h2 class="ribbon">Mengenal DNA</h2><div class="split"><div class="art"><svg viewBox="0 0 320 240" class="illus" id="dnaSvg">${helixSVG(0)}</svg><div class="center row"><button class="btn-y" id="spinB">▶ Putar heliks</button></div><p class="note" style="text-align:center;margin-top:6px">Model atom: setiap bola satu atom (jingga = fosfor, merah = oksigen, abu-abu = karbon, biru = nitrogen). Hentikan putaran, lalu ketuk gugus fosfat, gula, basa, atau ikatan hidrogen (garis putus-putus).</p></div>
  <div class="stack"><div class="bubble"><b>DNA (asam deoksiribonukleat)</b> adalah molekul yang menyimpan informasi genetik makhluk hidup dan berperan dalam pewarisan sifat. Bentuknya <b>heliks ganda</b>: dua untai yang saling berpilin.</div>
  <div class="infobox" id="hxInfo"><h3>Ketuk salah satu bagian</h3><p style="margin:0">Setiap bagian heliks punya peran berbeda.</p></div>
  <div id="pg"></div></div></div>`;
  let ph = 0, spin = false, sel = null; const svg = $('#dnaSvg');
  svg.addEventListener('click', e => { const h = e.target.closest('.hot'); if (!h || spin) return; sel = h.dataset.h; $$('#dnaSvg .hot').forEach(x => x.classList.toggle('on', x.dataset.h===sel)); $('#hxInfo').innerHTML = `<h3>${HX[sel][0]}</h3><p style="margin:0">${HX[sel][1]}</p>`; sfx.pop(); });
  const loop = () => { if (!spin || !svg.isConnected) return; ph += .035; svg.innerHTML = helixSVG(ph); requestAnimationFrame(loop); };
  $('#spinB').onclick = () => { spin = !spin; $('#spinB').textContent = spin ? '❚❚ Hentikan putaran' : '▶ Putar heliks'; if (spin) loop(); else if (sel) $$('#dnaSvg .hot').forEach(x => x.classList.toggle('on', x.dataset.h===sel)); };
  pairGame($('#pg'));
} });
// 5
SL.push({ title:'Struktur Sel Tumbuhan', render(el){ el.innerHTML = `<h2 class="ribbon">Struktur Sel Tumbuhan</h2><div class="split"><svg viewBox="0 0 320 240" class="illus" id="cellSvg">
    <g class="hot" data-c="dinding"><rect x="20" y="18" width="280" height="208" rx="22" fill="#000" opacity=".22" filter="url(#fBlur4)"/><rect x="20" y="16" width="280" height="208" rx="20" fill="#e6ecd0" stroke="url(#gWallS)" stroke-width="12" filter="url(#fMatte)"/></g>
    <g class="hot" data-c="membran"><rect x="34" y="30" width="252" height="180" rx="12" fill="url(#gCyto)" stroke="#d7a27a" stroke-width="3.5"/><rect x="36.5" y="32.5" width="247" height="175" rx="10" fill="none" stroke="#f6e3cf" stroke-width="1"/><g fill="#c99a72" opacity=".45">${Array.from({length:60},(_,i)=>`<circle cx="${44+((i*53)%232)}" cy="${40+((i*37)%160)}" r="${.8+(i%3)*.5}"/>`).join("")}</g></g>
    <g class="hot" data-c="vakuola"><ellipse cx="200" cy="124" rx="70" ry="58" fill="url(#gVac)" stroke="#9fbdd2" stroke-width="1.5"/><ellipse cx="180" cy="100" rx="26" ry="12" fill="#fff" opacity=".5" filter="url(#fBlur2)"/></g>
    <g class="hot" data-c="inti"><circle cx="90" cy="82" r="31" fill="#000" opacity=".18" filter="url(#fBlur2)"/><circle cx="90" cy="80" r="30" fill="url(#gNuc)" stroke="#6d5296" stroke-width="2"/><g fill="none" stroke="#6a4f97" stroke-width="1.1" opacity=".75"><path d="M70,86 C76,70 84,96 92,82 C98,72 104,92 110,80"/><path d="M72,74 C80,66 86,82 96,70"/><path d="M78,96 C86,90 92,102 104,94"/></g><circle cx="96" cy="76" r="8" fill="#5b3f8a" opacity=".85"/><g fill="#f4ecfb">${Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return `<circle cx="${(90+Math.cos(a)*29).toFixed(1)}" cy="${(80+Math.sin(a)*29).toFixed(1)}" r="1.6"/>`}).join("")}</g><ellipse cx="80" cy="68" rx="9" ry="5" fill="#fff" opacity=".45" filter="url(#fBlur2)"/></g>
    <g class="hot" data-c="mito"><ellipse cx="80" cy="160" rx="22" ry="11" fill="url(#gMito)" stroke="#a84a36" stroke-width="1.2"/><path d="M62,160 C66,152 70,168 75,156 C79,150 84,168 88,156 C92,150 95,164 98,160" stroke="#a84a36" stroke-width="1.2" fill="none" opacity=".8"/></g>
    <g class="hot" data-c="plastida"><ellipse cx="128" cy="186" rx="18" ry="10" fill="url(#gPlast)" stroke="#8f2a10" stroke-width="1"/><path d="M116,184 L124,190 M126,182 L134,190 M132,184 L139,188" stroke="#ffd0a8" stroke-width="1" opacity=".7"/><ellipse cx="260" cy="56" rx="16" ry="9" fill="url(#gPlast)" stroke="#8f2a10" stroke-width="1"/><path d="M250,54 L257,60 M259,52 L266,59" stroke="#ffd0a8" stroke-width="1" opacity=".7"/></g>
    <g font-family="Barlow, sans-serif" font-weight="700" font-size="11" fill="#22303c" stroke="rgba(255,255,255,.85)" stroke-width="3" paint-order="stroke" pointer-events="none"><text x="200" y="128" text-anchor="middle">vakuola</text><text x="90" y="124" text-anchor="middle">inti</text><text x="80" y="185" text-anchor="middle">mitokondria</text><text x="236" y="40">plastida</text></g></svg>
    <div class="stack"><div class="bubble">DNA pada sel tumbuhan <b>terutama terdapat di dalam inti sel</b>. DNA juga ditemukan pada <b>mitokondria</b> dan <b>plastida</b> (kloroplas; pada buah tomat matang berupa kromoplas).</div>
    <div class="task" id="cellTask">👉 Tantangan: ketuk bagian sel tempat sebagian besar DNA disimpan.</div>
    <div class="infobox" id="cellInfo"><h3>Ketuk bagian sel</h3><p style="margin:0">Setiap bagian akan menampilkan keterangan.</p></div></div></div>`;
  $$('#cellSvg .hot').forEach(h => h.onclick = ev => { ev.stopPropagation(); const k = h.dataset.c, c = CELL[k]; $$('#cellSvg .hot').forEach(x => x.classList.toggle('on', x===h));
    $('#cellInfo').innerHTML = `<h3>${c[0]} ${c[2]===true?'🧬 DNA utama':c[2]==='sec'?'🧬 ada DNA':''}</h3><p style="margin:0">${c[1]}</p>`;
    if (c[2]===true){ $('#cellTask').className = 'task ok'; $('#cellTask').innerHTML = '✓ Tepat! Inti sel adalah lokasi utama DNA. <button class="mini y" id="zoomB">🔍 Perbesar inti sel</button>'; $('#zoomB').onclick = zoomJourney; sfx.ok(); } else sfx.pop(); });
} });
// 6
let flowN = 0;
SL.push({ title:'Pengertian Isolasi DNA', render(el){ const F = [['Jaringan tomat','<use href="#tomato" x="2" y="2" width="60" height="60"/>'],['Bubur tomat','<ellipse cx="32" cy="60" rx="24" ry="2.5" fill="#000" opacity=".25" filter="url(#fBlur2)"/><path d="M5,24 L59,24 C59,44 47,58 32,58 C17,58 5,44 5,24 Z" fill="url(#gCeramic)"/><ellipse cx="32" cy="24" rx="27" ry="4.5" fill="#d6d0c5"/><ellipse cx="32" cy="27" rx="22" ry="5" fill="url(#gPulp)"/><g fill="#f6e2b4"><ellipse cx="25" cy="27" rx="1.4" ry="1"/><ellipse cx="37" cy="26" rx="1.4" ry="1"/><ellipse cx="31" cy="29" rx="1.4" ry="1"/></g>'],['Ekstrak (lisis sel)','<ellipse cx="32" cy="61" rx="20" ry="2.2" fill="#000" opacity=".25" filter="url(#fBlur2)"/><path d="M16,26 L48,26 L48,54 C48,57 46,59 43,59 L21,59 C18,59 16,57 16,54 Z" fill="url(#gPulp)" opacity=".85"/><ellipse cx="32" cy="26" rx="16" ry="1.6" fill="#ffd0b8" opacity=".9"/><path d="M14,5 L14,54 C14,58 17,61 22,61 L42,61 C47,61 50,58 50,54 L50,5" fill="url(#gGlass)" stroke="#8fa2b1" stroke-width="1"/><path d="M17.5,8 L17.5,55" stroke="#fff" stroke-opacity=".85" stroke-width="1.8"/>'],['Filtrat','<ellipse cx="32" cy="61" rx="20" ry="2.2" fill="#000" opacity=".25" filter="url(#fBlur2)"/><path d="M16,30 L48,30 L48,54 C48,57 46,59 43,59 L21,59 C18,59 16,57 16,54 Z" fill="url(#gFilt)"/><ellipse cx="32" cy="30" rx="16" ry="1.6" fill="#fff" opacity=".6"/><path d="M14,5 L14,54 C14,58 17,61 22,61 L42,61 C47,61 50,58 50,54 L50,5" fill="url(#gGlass)" stroke="#8fa2b1" stroke-width="1"/><path d="M17.5,8 L17.5,55" stroke="#fff" stroke-opacity=".85" stroke-width="1.8"/>'],['Endapan DNA','<use href="#tubeic" x="12" y="1" width="40" height="62"/>']];
  el.innerHTML = `<h2 class="ribbon">Pengertian Isolasi DNA</h2><div class="bubble" style="margin-bottom:14px"><b>Isolasi DNA</b> adalah proses memisahkan DNA dari komponen sel lainnya (protein, lipid, karbohidrat, sisa jaringan) agar dapat diamati atau dianalisis.</div>
    <div class="flow3" id="flow">${F.map((f,i)=>`<div class="fstep ${i<flowN?'on':''}"><svg viewBox="0 0 64 64">${f[1]}</svg>${i+1}. ${f[0]}</div>`).join('')}</div>
    <div class="center"><button class="btn-y" id="flowB"></button></div>`;
  const b = $('#flowB'), steps = $$('#flow .fstep'); const upd = () => { b.textContent = flowN>=F.length ? 'Ulangi diagram ⟲' : 'Tampilkan tahap berikutnya ▶'; };
  upd(); b.onclick = () => { if (flowN>=F.length){ flowN = 0; steps.forEach(s => s.classList.remove('on')); } else { steps[flowN].classList.add('on'); flowN++; sfx.pop(); } upd(); };
} });
// 7
SL.push({ title:'Prinsip Dasar Isolasi DNA', render(el){ const P = [['1. Lisis sel','<svg viewBox="0 0 160 100"><circle cx="50" cy="50" r="34" fill="none" stroke="#e8590c" stroke-width="5" stroke-dasharray="8 6"/><circle cx="50" cy="50" r="14" fill="#d0bfff" stroke="#5f3dc4" stroke-width="3"/><path d="M96,50 L120,50" stroke="#1b2f6b" stroke-width="4"/><path d="M114,42 L124,50 L114,58" fill="none" stroke="#1b2f6b" stroke-width="4"/><path d="M128,40 c6,-8 12,8 18,0 c6,-8 12,8 12,0" stroke="#2f7be6" stroke-width="4" fill="none"/></svg>','<b>Detergen</b> melarutkan lipid pada membran sel dan membran inti sehingga isi sel, termasuk DNA, keluar. <b>Garam</b> membantu: ion Na⁺ mengurangi tolakan muatan negatif antarmolekul DNA. Sebelumnya, jaringan dihancurkan agar dinding sel robek.'],
    ['2. Penyaringan','<svg viewBox="0 0 160 100"><path d="M30,10 L130,10 L92,56 L92,80 L68,80 L68,56 Z" fill="#f8f9fa" stroke="#1b2f6b" stroke-width="4" stroke-linejoin="round"/><path d="M38,14 L122,14 L80,62 Z" fill="#fff" stroke="#adb5bd" stroke-width="3"/><ellipse cx="80" cy="22" rx="30" ry="6" fill="#d9480f" opacity=".7"/><circle cx="80" cy="90" r="5" fill="#ffd8a8" stroke="#e8590c"/></svg>','Kertas saring atau kain kasa menahan <b>ampas</b> (sisa jaringan dan dinding sel). Cairan yang lolos disebut <b>filtrat</b> dan mengandung DNA terlarut.'],
    ['3. Pengendapan','<svg viewBox="0 0 160 100"><path d="M66,6 L94,6 L94,80 C94,98 66,98 66,80 Z" fill="#f8f9fa" stroke="#1b2f6b" stroke-width="4"/><rect x="69" y="54" width="22" height="34" fill="#ffd8a8"/><rect x="69" y="24" width="22" height="30" fill="#d0ebff"/><path d="M71,52 c4,-6 6,3 10,-3 c3,-4 5,1 7,-1" stroke="#fff" stroke-width="3" fill="none"/></svg>','<b>Etanol dingin</b> ditambahkan perlahan. DNA sukar larut dalam etanol sehingga beragregasi dan mengendap di batas lapisan sebagai endapan putih.']];
  el.innerHTML = `<h2 class="ribbon">Prinsip Dasar Isolasi DNA</h2><div id="player"></div><p class="hint">Ketuk setiap tahapan untuk melihat penjelasannya.</p><div class="cards3">${P.map(p=>`<button class="pcard" aria-expanded="false">${p[1]}<h3>${p[0]}</h3><span class="more">${p[2]}</span></button>`).join('')}</div>`;
  $$('.pcard').forEach(c => c.onclick = () => { c.setAttribute('aria-expanded', c.getAttribute('aria-expanded')!=='true'); sfx.pop(); });
  isoPlayer($('#player'));
} });
// 8
SL.push({ title:'Mengenal Objek Praktikum', render(el){ const I = { nama:['Nama ilmiah','<i>Solanum lycopersicum</i> L., famili Solanaceae.'], krom:['Kromosom','Diploid dengan 2n = 24 kromosom.'], isi:['Kandungan buah','Sebagian besar air (± 94–95%), gula, asam organik, likopen (pigmen merah), dan pektin.'], cocok:['Mengapa cocok?','Lunak dan mudah dihaluskan, murah, mudah didapat, dan tidak memerlukan alat khusus.'], kendala:['Hal yang perlu diperhatikan','Pektin dan polisakarida lain dapat ikut mengendap bersama DNA, sehingga endapan tampak keruh atau berlendir. Endapan ini <b>bukan DNA murni</b>.'] };
  el.innerHTML = `<h2 class="ribbon">Mengenal Objek Praktikum</h2><div class="split"><svg viewBox="0 0 320 220" class="illus"><use href="#tomato" x="14" y="40" width="130" height="130"/>
    <use href="#tomhalf" x="152" y="28" width="156" height="156"/>
    <g font-family="Barlow, sans-serif" font-weight="800" font-size="12" fill="#1b2f6b"><text x="80" y="200" text-anchor="middle">tomat utuh</text><text x="230" y="200" text-anchor="middle">penampang buah</text></g></svg>
    <div class="stack"><div class="bubble">Tomat (<i>Solanum lycopersicum</i>) adalah bahan tumbuhan yang dapat dipakai sebagai sumber DNA dalam praktikum isolasi DNA sederhana.</div>
    <div class="chips" id="infoB">${Object.keys(I).map(k=>`<button class="chip" data-k="${k}">${I[k][0]}</button>`).join('')}</div><div class="infobox" id="tInfo"><h3>Karakteristik sampel</h3><p style="margin:0">Ketuk tombol di atas.</p></div></div></div>`;
  $$('#infoB .chip').forEach(c => c.onclick = () => { $$('#infoB .chip').forEach(x => x.classList.toggle('sel', x===c)); const i = I[c.dataset.k]; $('#tInfo').innerHTML = `<h3>${i[0]}</h3><p style="margin:0">${i[1]}</p>`; sfx.pop(); });
} });
// 9 & 10
function catalog(list, kind){ return { title: kind==='alat'?'Alat Praktikum':'Bahan Praktikum', render(el){ const seen = new Set(store.get('seen-'+kind, []));
  el.innerHTML = `<h2 class="ribbon">${kind==='alat'?'Alat Praktikum':'Bahan Praktikum'}</h2><div class="split wide"><div><p class="hint">Ketuk ${kind==='alat'?'gambar alat':'setiap bahan'} untuk melihat ${kind==='alat'?'nama, jumlah, dan fungsinya':'takaran dan fungsinya'}. <span class="counter" id="cnt"></span></p>
    <div class="grid-tools">${list.map((t,i)=>`<button class="tcard ${seen.has(i)?'seen':''}" data-i="${i}">${IC[t[0]]}${t[1]}</button>`).join('')}</div></div>
    <div class="stack"><div class="infobox" id="catInfo"><h3>${kind==='alat'?'Pilih alat':'Pilih bahan'}</h3><p style="margin:0">${kind==='alat'?'Setiap alat membantu proses penghancuran, pencampuran, penyaringan, atau pengamatan DNA.':'Detergen melisiskan membran, garam mendukung agregasi DNA, dan etanol dingin membantu presipitasi.'}</p></div>
    ${kind==='bahan'?'<p class="note">Takaran ini adalah rancangan awal dan perlu diuji lewat praktikum pendahuluan sebelum dijadikan protokol tetap.</p>':''}</div></div>`;
  const cnt = () => $('#cnt').textContent = `(${seen.size}/${list.length} dikenali)`; cnt();
  $$('.tcard').forEach(c => c.onclick = () => { const i = +c.dataset.i, t = list[i]; seen.add(i); store.set('seen-'+kind, [...seen]); c.classList.add('seen'); cnt(); sfx.pop();
    $('#catInfo').innerHTML = `<div style="display:flex;gap:10px;align-items:center"><span style="width:64px;flex:none">${IC[t[0]]}</span><h3>${t[1]}</h3></div><dl><dt>${kind==='alat'?'Jumlah':'Takaran'}</dt><dd>${t[2]}</dd><dt>Fungsi</dt><dd>${t[3]}</dd></dl>`; });
} }; }
SL.push(catalog(TOOLS,'alat')); SL.push(catalog(MATS,'bahan'));

function praktikanSVG(){
  const k = i => K3.has(i);
  const coat = k(0), glove = k(0), gog = k(1);
  const badge = (on, x, y, icon, label) => `<g transform="translate(${x},${y})" opacity="${on?1:.28}"><circle r="19" fill="${on?'#2fbf71':'#c3ccd4'}" stroke="#fff" stroke-width="2.5"/>${icon}<text y="34" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="600" font-size="10" fill="#33414d">${label}</text></g>`;
  return `
  <ellipse cx="110" cy="292" rx="70" ry="7" fill="#000" opacity=".15"/>
  <path d="M74,288 L78,214 L104,214 L104,288 Z M116,288 L116,214 L142,214 L146,288 Z" fill="url(#gPants)"/>
  <path d="M70,290 C70,282 80,280 92,282 L106,284 L106,292 L70,292 Z M114,284 L128,282 C140,280 150,282 150,290 L150,292 L114,292 Z" fill="#2b2f33"/>
  <path d="M60,150 C60,122 78,108 110,108 C142,108 160,122 160,150 L156,222 L64,222 Z" fill="url(#gShirt)"/>
  <path d="M100,108 L110,124 L120,108" fill="#3d6a99"/>
  ${coat ? `<path d="M56,150 C56,120 76,106 110,106 C144,106 164,120 164,150 L166,250 L54,250 Z" fill="url(#gCoat)" stroke="#c9d3db" stroke-width="1"/>
    <path d="M98,106 L110,140 L122,106" fill="url(#gShirt)"/><path d="M98,106 L106,150 L110,140 M122,106 L114,150 L110,140" fill="none" stroke="#b8c4ce" stroke-width="1.5"/>
    <path d="M110,140 L110,250" stroke="#c5cfd8" stroke-width="1.5"/><circle cx="113" cy="170" r="2.2" fill="#aab6c0"/><circle cx="113" cy="196" r="2.2" fill="#aab6c0"/>
    <rect x="126" y="176" width="22" height="16" rx="2" fill="none" stroke="#bcc7d0" stroke-width="1.4"/><path d="M134,172 L134,182" stroke="#2b7fd4" stroke-width="2.5" stroke-linecap="round"/>` : ''}
  <path d="M62,146 C50,170 48,196 54,222" fill="none" stroke="${coat?'#e9eef2':'#4c7fb3'}" stroke-width="20" stroke-linecap="round"/>
  <path d="M158,146 C170,170 172,196 166,222" fill="none" stroke="${coat?'#e9eef2':'#4c7fb3'}" stroke-width="20" stroke-linecap="round"/>
  <ellipse cx="55" cy="230" rx="11" ry="13" fill="${glove?'url(#gGlove)':'url(#gSkin)'}"/><ellipse cx="165" cy="230" rx="11" ry="13" fill="${glove?'url(#gGlove)':'url(#gSkin)'}"/>
  ${glove ? '<path d="M45,222 C50,216 60,216 65,222 M155,222 C160,216 170,216 175,222" stroke="#2f7fc4" stroke-width="2" fill="none"/>' : ''}
  <path d="M100,92 L100,112 C104,116 116,116 120,112 L120,92 Z" fill="url(#gSkin)"/>
  <ellipse cx="110" cy="66" rx="30" ry="35" fill="url(#gSkin)"/>
  <ellipse cx="80" cy="70" rx="5" ry="8" fill="#d9a07f"/><ellipse cx="140" cy="70" rx="5" ry="8" fill="#d9a07f"/>
  <path d="M79,62 C76,30 96,22 112,24 C132,25 145,38 141,64 C137,50 128,42 112,42 C98,42 86,48 81,64 Z" fill="url(#gHair)"/>
  <path d="M95,60 C99,57 104,57 107,60 M113,60 C116,57 121,57 125,60" stroke="#3a2a22" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="101" cy="68" rx="3.2" ry="3.8" fill="#2a1f1a"/><ellipse cx="119" cy="68" rx="3.2" ry="3.8" fill="#2a1f1a"/><circle cx="102" cy="67" r="1" fill="#fff"/><circle cx="120" cy="67" r="1" fill="#fff"/>
  <path d="M110,70 C109,76 108,79 111,80" stroke="#c78e6d" stroke-width="1.6" fill="none"/>
  <path d="M102,88 C107,91 113,91 118,88" stroke="#a5604a" stroke-width="2" fill="none" stroke-linecap="round"/>
  ${gog ? `<path d="M80,64 C80,58 140,58 140,64" stroke="#2b3036" stroke-width="3" fill="none"/><rect x="88" y="58" width="44" height="20" rx="9" fill="#bfe6ff" fill-opacity=".45" stroke="#33414d" stroke-width="2.5"/><path d="M110,60 L110,76" stroke="#33414d" stroke-width="2"/><path d="M93,62 L100,62" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>` : ''}
  ${badge(k(1), 6, 70, '<path d="M-8,6 L6,-8 M-4,8 L8,-4" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M4,-10 L10,-4" stroke="#fff" stroke-width="3"/>', 'Alat tajam')}
  ${badge(k(2), 214, 70, '<path d="M-9,2 C-4,8 4,8 9,2" stroke="#fff" stroke-width="2.5" fill="none"/><path d="M-10,-10 L10,10" stroke="#fff" stroke-width="2.5"/>', 'Tidak mencicipi')}
  ${badge(k(3), 6, 140, '<path d="M0,-11 C6,-4 7,2 4,8 C2,11 -2,11 -4,8 C-7,2 -4,-4 0,-11 Z" fill="#fff"/><path d="M-11,-11 L11,11" stroke="#e5484d" stroke-width="3"/>', 'Jauh dari api')}
  ${badge(k(4), 214, 140, '<circle r="3" fill="#fff"/><path d="M0,-3 C-6,-12 6,-12 0,-3 M3,0 C12,-6 12,6 3,0 M0,3 C6,12 -6,12 0,3 M-3,0 C-12,6 -12,-6 -3,0" fill="#fff"/>', 'Ventilasi')}
  ${badge(k(5), 214, 210, '<path d="M-8,0 L-2,6 L9,-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>', 'Diawasi guru')}
  ${badge(k(0), 6, 210, '<path d="M-7,-9 L-3,-10 L0,-5 L3,-10 L7,-9 L10,-3 L7,10 L-7,10 L-10,-3 Z" fill="#fff"/>', 'Jas & sarung')}`;
}
// 11
SL.push({ title:'Keselamatan Kerja', locked: () => K3.size<K3L.length, lockMsg:'Centang semua poin keselamatan kerja sebelum memulai praktikum.', render(el){
  el.innerHTML = `<h2 class="ribbon">Keselamatan Kerja</h2><div class="split rev"><div class="stack"><p class="hint">Centang setiap poin sebagai komitmenmu sebelum memulai praktikum.</p><ul class="k3list">${K3L.map((k,i)=>`<li><label><input type="checkbox" data-i="${i}" ${K3.has(i)?'checked':''}> ${k}</label></li>`).join('')}</ul><p class="reply" id="k3msg"></p></div>
    <div class="prak"><p class="kicker" style="text-align:center">Praktikan</p><svg viewBox="-34 0 288 300" class="av" id="k3av" role="img" aria-label="Sosok praktikan dengan perlengkapan keselamatan"></svg><p class="prak-cap" id="k3cap"></p></div></div>`;
  const draw = () => { $('#k3av').innerHTML = praktikanSVG(); $('#k3cap').textContent = K3.size===K3L.length ? 'Siap praktikum ✓' : `${K3.size}/${K3L.length} perlengkapan & aturan dipenuhi`;
    $('#k3msg').textContent = K3.size===K3L.length ? '✓ Semua poin keselamatan sudah kamu sepakati. Praktikum siap dimulai!' : `${K3.size}/${K3L.length} poin dicentang.`; };
  draw(); $$('.k3list input').forEach(i => i.onchange = () => { i.checked ? K3.add(+i.dataset.i) : K3.delete(+i.dataset.i); store.set('k3', [...K3]); if (K3.size===K3L.length) sfx.ok(); draw(); updateNext(); });
} });
// 12
SL.push(Object.assign({ title:'Persiapan Sampel Tomat' }, labSlide({ ribbon:'Persiapan Sampel Tomat', tray:['tomat','air','pisau','mortar'], names:{tomat:'Tomat matang ±50 g', air:'Air bersih (cuci)', pisau:'Pisau & talenan', mortar:'Mortar & alu'},
  wrong:{ mortar:'Belum saatnya menghaluskan. Cuci dan potong tomat dulu.' },
  sci:'<b>Mengapa dicuci dan dipotong?</b> Mencuci menghilangkan kotoran dan sisa pestisida. Potongan kecil memudahkan penghancuran jaringan pada langkah berikutnya.',
  steps:[
    { t:'Ambil ± 50 gram tomat matang.', items:['tomat'], done:()=>L.sample.picked, act(){ L.sample.picked = true; toast('Tomat diletakkan di bak cuci.'); } },
    { t:'Cuci tomat dengan air bersih (ketuk 3×).', items:['air'], done:()=>L.sample.washN>=3, act(){ L.sample.washN++; sfx.pour(); if (L.sample.washN>=3) toast('Tomat sudah bersih.'); } },
    { t:'Potong tomat kecil-kecil dengan pisau di atas talenan (ketuk 6×). Arahkan pisau menjauhi jari!', items:['pisau'], done:()=>L.sample.cut>=6, act(){ if (L.sample.cut===0) toast('Hati-hati! Arahkan mata pisau menjauhi jari.', 'warn'); L.sample.cut++; sfx.chop(); if (L.sample.cut>=6) toast('Tomat terpotong kecil-kecil (± 50 g).'); } },
  ], draw: drawS12 })));
// 13
SL.push(Object.assign({ title:'Penghancuran Jaringan Tomat' }, labSlide({ ribbon:'Penghancuran Jaringan Tomat', tray:['mortar','alu','pengaduk','beker'], names:{mortar:'Mortar', alu:'Alu', pengaduk:'Batang pengaduk', beker:'Gelas beker'},
  wrong:{ pengaduk:'Batang pengaduk tidak cukup kuat untuk menghancurkan jaringan. Gunakan mortar dan alu.', beker:'Gelas beker bukan alat penghancur. Gunakan mortar dan alu.' },
  sci:'<b>Mengapa dihaluskan?</b> Penghancuran mekanik merobek dinding sel (selulosa dan pektin) dan memperluas permukaan jaringan sehingga larutan ekstraksi mudah menjangkau sel.',
  zoom: zoomCells,
  steps:[
    { t:'Masukkan potongan tomat ke mortar.', items:['mortar'], done:()=>L.grind.inMortar, act(){ L.grind.inMortar = true; toast('Potongan tomat masuk ke mortar.'); } },
    { t:'Haluskan dengan alu (gerakan melingkar) hingga menjadi bubur.', items:['alu'], done:()=>L.grind.done, act(id, ctx){
      const pad = circlePad(ctx.wb, `<h3>Menghaluskan dengan alu</h3><p>Gerakkan jari melingkar untuk menggerus tomat.</p><div class="pad"><span class="dot" style="left:calc(50% - 13px);top:8px"></span></div><div class="prog"><i style="width:${L.grind.v}%"></i></div><p class="gv">Kehalusan ${Math.round(L.grind.v)}%</p><div class="choice"><button class="mini" data-k>Gerus (tombol)</button><button class="mini y" data-s>Selesai menghaluskan</button></div>`,
        da => { L.grind.v = Math.min(100, L.grind.v + da*3.2); pad.el.querySelector('.prog i').style.width = L.grind.v+'%'; pad.el.querySelector('.gv').textContent = `Kehalusan ${Math.round(L.grind.v)}%`; throttleArt(ctx.art); if (L.grind.v>=100) pad.close(); },
        () => { L.grind.done = true; saveLab(); toast(L.grind.v>=90 ? 'Tomat menjadi bubur halus.' : `Kehalusan baru ${Math.round(L.grind.v)}%. Banyak sel belum pecah.`, L.grind.v>=90?'ok':'warn'); ctx.paint(); }, 'side');
      pad.el.querySelector('[data-k]').onclick = () => { L.grind.v = Math.min(100, L.grind.v+20); pad.el.querySelector('.prog i').style.width = L.grind.v+'%'; pad.el.querySelector('.gv').textContent = `Kehalusan ${Math.round(L.grind.v)}%`; if (L.grind.v>=100) pad.close(); };
      pad.el.querySelector('[data-s]').onclick = () => pad.close(); } },
  ], draw: drawS13 })));
// 14
function spoonChoice(what, right, cb){
  dialog(`Takar ${what}`, `<p>Pilih takaran sendok ukur untuk ${what}:</p>`, [['¼ sdt', () => { closeDlg(); cb('¼ sdt'); }], ['½ sdt', () => { closeDlg(); cb('½ sdt'); }], ['1 sdt', () => { closeDlg(); cb('1 sdt'); }], ['1 sdm', () => { closeDlg(); cb('1 sdm'); }]]);
}
const SP = {'¼ sdt':1.25,'½ sdt':2.5,'1 sdt':5,'1 sdm':15};
SL.push(Object.assign({ title:'Pembuatan Larutan Ekstraksi' }, labSlide({ ribbon:'Pembuatan Larutan Ekstraksi', tray:['beker','ukur','garam','deterjen','pengaduk','etanol'], names:{beker:'Gelas beker', ukur:'Gelas ukur + air', garam:'Garam (sendok ukur)', deterjen:'Detergen cair (sendok ukur)', pengaduk:'Batang pengaduk', etanol:'Etanol'},
  wrong:{ etanol:'Etanol baru dipakai pada tahap pengendapan, bukan untuk larutan ekstraksi.' },
  sci:'<b>Komposisi larutan ekstraksi:</b> 100 mL air, ½ sdt garam, dan 1 sdm detergen cair. Aduk <b>perlahan</b> agar tidak berbusa berlebihan.',
  steps:[
    { t:'Siapkan gelas beker.', items:['beker'], done:()=>L.sol.beaker, act(){ L.sol.beaker = true; toast('Gelas beker siap.'); } },
    { t:'Ukur 100 mL air dengan gelas ukur, lalu tuang ke gelas beker.', items:['ukur'], done:()=>L.sol.waterDone, act(id, ctx){
      pourPanel(ctx.wb, { title:'Mengukur air dengan gelas ukur', note:'Tahan tombol untuk mengisi gelas ukur. Lepaskan tepat di garis 100 mL (baca meniskus sejajar mata).', unit:'mL', target:100, lo:95, hi:105, max:130, rate:1.1, onProgress:(v,h) => { L.sol.water = Math.round(v); FX.pour = h ? 'water' : null; ctx.art(); },
        onDone:(v, ok) => { L.sol.water = Math.round(v); L.sol.waterDone = true; if (ok) toast(`${Math.round(v)} mL air dituang ke gelas beker.`); saveLab(); ctx.paint(); } }); } },
    { t:'Tambahkan ½ sendok teh garam.', items:['garam'], free:true, done:()=>!!L.sol.salt, act(id, ctx){ if (!L.sol.waterDone) return toast('Masukkan air dulu.', 'warn');
      spoonChoice('garam', '½ sdt', ch => { L.sol.salt = ch==='½ sdt' ? 'ok' : SP[ch]<2.5 ? 'kurang' : 'lebih'; toast(ch==='½ sdt' ? 'Garam ½ sdt ditambahkan.' : `Kamu menakar ${ch}. Takaran anjuran ½ sdt.`, ch==='½ sdt'?'ok':'warn'); saveLab(); ctx.paint(); }); } },
    { t:'Tambahkan 1 sendok makan detergen cair.', items:['deterjen'], free:true, done:()=>!!L.sol.det, act(id, ctx){ if (!L.sol.waterDone) return toast('Masukkan air dulu.', 'warn');
      spoonChoice('detergen', '1 sdm', ch => { L.sol.det = ch==='1 sdm' ? 'ok' : SP[ch]<15 ? 'kurang' : 'lebih'; toast(ch==='1 sdm' ? 'Detergen 1 sdm ditambahkan.' : `Kamu menakar ${ch}. Takaran anjuran 1 sdm.`, ch==='1 sdm'?'ok':'warn'); saveLab(); ctx.paint(); }); } },
    { t:'Aduk perlahan hingga merata (hindari busa).', items:['pengaduk'], done:()=>L.sol.stir>=100, act(id, ctx){ stirPanel(ctx.wb, 'Mengaduk larutan ekstraksi', L.sol, 'stir', 'foam', 5, () => { if (!L.sol.foam) toast('Larutan ekstraksi tercampur rata tanpa busa.'); ctx.paint(); }, ctx.art); } },
  ], draw: drawS14 })));
// 15
SL.push(Object.assign({ title:'Proses Ekstraksi Sel' }, labSlide({ ribbon:'Proses Ekstraksi Sel', tray:['larutan','pengaduk','timer','etanol'], names:{larutan:'Larutan ekstraksi', pengaduk:'Batang pengaduk', timer:'Pengatur waktu', etanol:'Etanol'}, 
  wrong:{ etanol:'Etanol belum diperlukan. Sel harus dilisiskan dulu.' },
  sci:'<b>Penjelasan ilmiah:</b> detergen melarutkan membran sel dan membran inti sehingga DNA dilepaskan ke campuran. Campuran cukup diaduk perlahan sebentar lalu <b>didiamkan</b> 5–10 menit, karena pengadukan lama dapat mematahkan DNA.',
  zoom: zoomMembrane,
  steps:[
    { t:'Tuang ± 50 mL larutan ekstraksi ke bubur tomat.', items:['larutan'], done:()=>L.ext.poured, act(id, ctx){
      pourPanel(ctx.wb, { title:'Menuang larutan ekstraksi', note:'Tahan tombol untuk menuang. Berhenti di sekitar 50 mL.', unit:'mL', target:50, lo:40, hi:60, max:100, rate:1, onProgress:(v,h) => { L.ext.vol = Math.round(v); FX.pour = h ? 'ext' : null; ctx.art(); },
        onDone:(v, ok) => { L.ext.vol = Math.round(v); L.ext.poured = true; if (ok) toast(`${Math.round(v)} mL larutan ekstraksi ditambahkan.`); saveLab(); ctx.paint(); } }); } },
    { t:'Aduk perlahan sebentar.', items:['pengaduk'], done:()=>L.ext.stir>=100, act(id, ctx){ stirPanel(ctx.wb, 'Mengaduk campuran', L.ext, 'stir', 'foam', 6, () => { if (!L.ext.foam) toast('Campuran teraduk perlahan.'); ctx.paint(); }, ctx.art); } },
    { t:'Diamkan 10 menit agar lisis sel berlangsung.', items:['timer'], done:()=>L.ext.waited, async act(id, ctx){ if (L.ext.waiting) return; L.ext.waiting = true; ctx.paint();
      for (let m=2;m<=10;m+=2){ toast(`⏱ ${m} menit…`, 'warn'); await sleep(320); } L.ext.waiting = false; L.ext.waited = true; saveLab(); toast('Lisis selesai: DNA terlepas ke campuran.'); ctx.paint(); } },
  ], draw: drawS15 })));
// 16
SL.push(Object.assign({ title:'Penyaringan Ekstrak' }, labSlide({ ribbon:'Penyaringan Ekstrak', tray:['beker','corong','saring','campuran'], names:{beker:'Gelas beker kosong', corong:'Corong', saring:'Kertas saring', campuran:'Campuran ekstrak'}, icon:{},
  sci:'<b>Penjelasan ilmiah:</b> penyaringan memisahkan sisa jaringan tumbuhan (ampas) dari cairan ekstrak. Cairan yang tertampung disebut <b>filtrat</b>.',
  steps:[
    { t:'Siapkan gelas beker kosong sebagai penampung.', items:['beker'], done:()=>L.filt.beaker2, act(){ L.filt.beaker2 = true; toast('Gelas beker penampung siap.'); } },
    { t:'Pasang corong di atas gelas beker.', items:['corong'], done:()=>L.filt.funnel, act(){ L.filt.funnel = true; toast('Corong terpasang.'); } },
    { t:'Lipat dan letakkan kertas saring di dalam corong.', items:['saring'], done:()=>L.filt.paper, act(){ L.filt.paper = true; toast('Kertas saring terpasang.'); } },
    { t:'Tuang campuran ke corong, tampung filtratnya.', items:['campuran'], done:()=>L.filt.done, async act(id, ctx){ if (L.filt.vol>0) return;
      for (let i=1;i<=10;i++){ L.filt.vol = i*4; sfx.pour(); ctx.paint(); await sleep(140); } L.filt.done = true; saveLab(); toast('Filtrat tertampung (± 40 mL). Ampas tertahan di kertas saring.'); ctx.paint(); } },
  ], draw: drawS16 })));
// 17
SL.push(Object.assign({ title:'Penambahan Alkohol Dingin' }, labSlide({ ribbon:'Penambahan Alkohol Dingin', tray:['rak','tabung','pipet','es','penjepit','etanol','kocok','spiritus'], names:{rak:'Rak tabung', tabung:'Tabung reaksi', pipet:'Pipet tetes', es:'Wadah es (dinginkan etanol)', penjepit:'Penjepit tabung', etanol:'Etanol 96%', kocok:'Kocok tabung', spiritus:'Pembakar spiritus'},
  wrong:{ kocok:'Jangan mengocok tabung! Lapisan akan tercampur dan DNA tidak terkumpul di batas lapisan.', spiritus:{k3:true, msg:'⚠ Pelanggaran K3: etanol mudah terbakar. Jauhkan dari api dan sumber panas!'} },
  sci:'<b>Penjelasan ilmiah:</b> etanol mengurangi kelarutan DNA sehingga DNA beragregasi dan mengendap. Etanol dituang <b>perlahan melalui dinding tabung</b> agar membentuk lapisan terpisah di atas filtrat. Jangan mengocok tabung.',
  zoom: zoomPpt,
  steps:[
    { t:'Letakkan rak tabung reaksi.', items:['rak'], done:()=>L.ppt.rack, act(){ L.ppt.rack = true; toast('Rak tabung siap.'); } },
    { t:'Pasang tabung reaksi di rak.', items:['tabung'], done:()=>L.ppt.tube, act(){ L.ppt.tube = true; toast('Tabung reaksi terpasang.'); } },
    { t:'Masukkan ± 5 mL filtrat ke tabung dengan pipet tetes (1 tekan = 1 mL).', items:['pipet'], done:()=>L.ppt.filtDone, act(id, ctx){
      const g = document.createElement('div'); g.className = 'gest'; g.innerHTML = `<h3>Memindahkan filtrat dengan pipet</h3><p>Setiap tekanan memindahkan 1 mL filtrat. Targetnya ± 5 mL.</p><div class="vol"><i style="width:${L.ppt.filtrate*10}%"></i><span class="tgt" style="left:50%"></span></div><p class="pv">${L.ppt.filtrate} mL</p><div class="choice"><button class="holdbtn" data-p>Tekan pipet (+1 mL)</button><button class="mini y" data-d>Selesai</button></div>`;
      ctx.wb.appendChild(g);
      g.querySelector('[data-p]').onclick = () => { if (L.ppt.filtrate>=10) return; L.ppt.filtrate++; sfx.pour(); g.querySelector('.vol i').style.width = L.ppt.filtrate*10+'%'; g.querySelector('.pv').textContent = L.ppt.filtrate+' mL'; };
      g.querySelector('[data-d]').onclick = () => { if (!L.ppt.filtrate) return toast('Belum ada filtrat yang dipindahkan.', 'warn'); g.remove(); L.ppt.filtDone = true; saveLab();
        toast(L.ppt.filtrate>=4 && L.ppt.filtrate<=6 ? `${L.ppt.filtrate} mL filtrat di tabung.` : `${L.ppt.filtrate} mL filtrat (anjuran ± 5 mL).`, L.ppt.filtrate>=4 && L.ppt.filtrate<=6 ? 'ok':'warn'); ctx.paint(); }; } },
    { t:'Dinginkan etanol di wadah es (sebelum dituang).', items:['es'], free:true, done:()=>L.ppt.iced || L.ppt.poured, act(){ L.ppt.iced = true; toast('Etanol didinginkan di wadah es.'); } },
    { t:'Pegang dan miringkan tabung dengan penjepit tabung.', items:['penjepit'], free:true, done:()=>L.ppt.clamp || L.ppt.poured, act(){ L.ppt.clamp = true; toast('Tabung dimiringkan dengan penjepit.'); } },
    { t:'Tuang ± 5 mL etanol perlahan melalui dinding tabung.', items:['etanol'], done:()=>L.ppt.poured, act(id, ctx){
      if (!L.ppt.filtDone) return toast('Masukkan filtrat ke tabung dulu.', 'warn');
      if (!L.ppt.iced) toast('Etanol belum didinginkan! Pengendapan akan lebih sedikit.', 'warn');
      L.ppt.cold = L.ppt.iced;
      pourPanel(ctx.wb, { title:'Menuang etanol', note:`Atur kemiringan botol lalu tahan tombol. ${L.ppt.clamp?'Tabung sudah dimiringkan, jadi etanol mudah mengalir di dinding tabung.':'Tabung tegak: etanol lebih mudah jatuh langsung dan tercampur.'}`, unit:'mL', target: L.ppt.filtrate, lo: L.ppt.filtrate*.8, hi: L.ppt.filtrate*1.5, max: L.ppt.filtrate*2, tilt:true, mixObj:L.ppt, mixKey:'mixed', mixAt: L.ppt.clamp?55:40, rate:.9, side:'left', onProgress:(v,h) => { L.ppt.eth = Math.round(v*10)/10; FX.pour = h ? 'eth' : null; ctx.art(); },
        onDone:(v) => { L.ppt.eth = Math.round(v*10)/10; L.ppt.poured = true; saveLab(); if (!L.ppt.mixed) toast('Terbentuk dua lapisan: etanol di atas, filtrat di bawah.'); ctx.paint(); } }); } },
  ], draw: drawS17 })));
// 18
SL.push({ title:'Pengamatan Hasil Isolasi DNA', locked: () => !L.obs.waited || ['warna','bentuk','letak','jumlah'].some(k => !L.obs.table[k]), lockMsg:'Diamkan tabung, amati dengan lup, lalu lengkapi tabel pengamatan.', render(el){
  if (!L.ppt.poured){ el.innerHTML = `<h2 class="ribbon">Pengamatan Hasil Isolasi DNA</h2><div class="panel paper"><p><b>Belum ada sampel untuk diamati.</b> Selesaikan langkah praktikum di slide 12–17 dulu.</p><button class="btn-y" id="toLab">Ke slide 12 ▶</button></div>`; $('#toLab').onclick = () => show(12); return; }
  const c = calc(), p = L.ppt, n = L.obs.waited ? Math.round(c.prec/8) : 0, m = p.mixed||p.shaken;
  const inner = `<rect x="0" y="0" width="200" height="260" fill="url(#gBench)"/><ellipse cx="100" cy="250" rx="30" ry="4" fill="#000" opacity=".25" filter="url(#fBlur2)"/>
    <path d="M82,140 L118,140 L118,220 C118,247 82,247 82,220 Z" fill="${m?'#f6c9ad':'url(#gFilt)'}"/><rect x="82" y="58" width="36" height="82" fill="${m?'#f6c9ad':'url(#gEth)'}"/>
    <ellipse cx="100" cy="58" rx="18" ry="2.2" fill="#fff" opacity=".7"/>${m?'':'<rect x="82" y="137" width="36" height="5" fill="#fff" opacity=".55" filter="url(#fBlur2)"/>'}
    ${n>0?`<g class="fibers">${REAL.strands(100,140,30,Math.min(70,18+n*3),Math.min(60,n*3),11)}</g>`:''}
    ${n>2?`<ellipse cx="100" cy="138" rx="14" ry="4" fill="#fff" opacity=".85" filter="url(#fGlow)"/>`:''}
    <path d="M80,10 L80,220 C80,252 120,252 120,220 L120,10" fill="url(#gGlass)" stroke="#8fa2b1" stroke-width="1.2"/><path d="M84,14 L84,222" stroke="#fff" stroke-opacity=".85" stroke-width="2.2" stroke-linecap="round"/><path d="M116,14 L116,220" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/><ellipse cx="100" cy="10" rx="20" ry="2.6" fill="none" stroke="#8fa2b1" stroke-width="1.2"/>
    <g font-size="9" font-weight="700" fill="#2a3a4a" font-family="Barlow, sans-serif"><text x="126" y="64">etanol</text><text x="126" y="200">filtrat</text></g>`;
  const tube = `<svg viewBox="50 0 110 260" id="obsTube" style="display:block;width:100%;max-height:320px">${inner}</svg>`;
  const T = L.obs.table, ap = store.get('ap', {});
  const opts = { warna:['','Putih keruh','Merah','Kuning bening','Tidak ada endapan'], bentuk:['','Serabut halus/gumpalan lendir','Kristal padat','Heliks ganda terlihat','Tidak ada endapan'], letak:['','Di batas lapisan etanol dan filtrat','Di dasar tabung','Tersebar merata','Tidak ada endapan'], jumlah:['','Banyak','Sedikit','Tidak ada'] };
  el.innerHTML = `<h2 class="ribbon">Pengamatan Hasil Isolasi DNA</h2><div class="sim"><div>
    <div class="workbench loupe-wrap" id="lw">${tube}<div class="loupe" id="lp"><svg id="lensSvg" width="150" height="150" viewBox="80 120 40 40">${inner}</svg></div></div>
    <div class="center row"><button class="btn-y" id="waitO" ${L.obs.waited?'disabled':''}>${L.obs.waited?'✓ Sudah didiamkan':'⏱ Diamkan 3 menit'}</button><span class="note" style="align-self:center">Geser jari/kursor di atas tabung untuk memakai lup.</span></div></div>
    <div class="stack"><table class="obs"><thead><tr><th>Parameter</th><th>Hasil pengamatan</th></tr></thead><tbody>
      ${Object.keys(opts).map(k=>`<tr><td><b>${{warna:'Warna endapan',bentuk:'Bentuk',letak:'Letak',jumlah:'Jumlah'}[k]}</b></td><td><select data-k="${k}" ${L.obs.waited?'':'disabled'}>${opts[k].map(o=>`<option ${T[k]===o?'selected':''} value="${o}">${o||'— pilih —'}</option>`).join('')}</select></td></tr>`).join('')}
    </tbody></table>
    <div class="sci"><b>Penjelasan ilmiah:</b> endapan putih keruh atau serabut halus adalah <b>fraksi yang mengandung DNA</b>, bercampur RNA, protein, dan pektin. Endapan ini belum tentu DNA murni.</div>
    ${ap.q2?`<p class="reply">Prediksimu di slide 2: <b>${{heliks:'heliks ganda terlihat',endapan:'endapan putih keruh/serabut',merah:'cairan merah pekat'}[ap.q2]}</b>. ${ap.q2==='endapan'?'Prediksimu sesuai!':'Hasilnya berbeda: DNA terlihat sebagai endapan, bukan heliks atau cairan merah.'}</p>`:''}
    <button class="btn-y blue" id="repB">Lihat rapor praktikum</button></div></div>${statusHTML()}`;
  $('#waitO').onclick = async () => { $('#waitO').disabled = true; for (let i=1;i<=3;i++){ $('#waitO').textContent = `⏱ ${i} menit…`; await sleep(450); } L.obs.waited = true; saveLab(); toast(calc().prec>=15 ? 'Endapan putih muncul di batas lapisan!' : 'Hampir tidak ada endapan yang terbentuk.', calc().prec>=15?'ok':'warn'); show(18); };
  $$('.obs select').forEach(s => s.onchange = () => { L.obs.table[s.dataset.k] = s.value; saveLab(); updateNext(); });
  $('#repB').onclick = report;
  const lw = $('#lw'), lp = $('#lp'), svg = $('#obsTube'), lens = $('#lensSvg');
  const move = e => { const r = lw.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; if (x<0||y<0||x>r.width||y>r.height){ lp.classList.remove('on'); return; }
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
    lp.classList.add('on'); lp.style.left = (x-75)+'px'; lp.style.top = (y-75)+'px'; lens.setAttribute('viewBox', `${sp.x-18} ${sp.y-18} 36 36`); if (!L.obs.zoomed){ L.obs.zoomed = true; saveLab(); } };
  lw.addEventListener('pointermove', move); lw.addEventListener('pointerdown', e => { lw.setPointerCapture?.(e.pointerId); move(e); }); lw.addEventListener('pointerleave', () => lp.classList.remove('on')); lw.addEventListener('pointerup', () => setTimeout(()=>lp.classList.remove('on'), 900));
} });
// 19
const DQ = [
  ['Mengapa buah tomat harus dihancurkan sebelum proses isolasi DNA?','Penghancuran merobek dinding sel dan memperluas permukaan jaringan sehingga larutan ekstraksi dapat menjangkau membran sel.'],
  ['Apa fungsi detergen dalam proses isolasi DNA?','Detergen melarutkan lipid penyusun membran sel dan membran inti sehingga DNA keluar ke larutan.'],
  ['Mengapa garam ditambahkan ke dalam larutan ekstraksi?','Ion Na⁺ dari garam menetralkan sebagian muatan negatif gugus fosfat DNA sehingga tolakan antarmolekul berkurang dan DNA dapat beragregasi saat etanol ditambahkan.'],
  ['Mengapa alkohol harus dalam keadaan dingin?','Pada suhu rendah kelarutan DNA dalam campuran makin kecil sehingga lebih banyak DNA mengendap. Suhu rendah juga memperlambat enzim pemotong DNA (DNase).'],
  ['Mengapa terbentuk endapan putih setelah penambahan alkohol?','DNA sukar larut dalam etanol. Di batas lapisan, jutaan molekul DNA beragregasi sehingga terlihat sebagai endapan atau serabut putih.'],
  ['Apakah endapan putih tersebut merupakan DNA murni?','Bukan. Endapan masih bercampur RNA, protein, dan polisakarida seperti pektin. Kemurnian perlu diuji, misalnya dengan spektrofotometer (rasio A260/A280) atau elektroforesis.'],
];
SL.push({ title:'Diskusi dan Refleksi', render(el){ const A = store.get('disc', {});
  el.innerHTML = `<h2 class="ribbon">Diskusi dan Refleksi</h2><p class="hint">Tulis jawabanmu atau hasil diskusi kelompok, lalu bandingkan dengan jawaban acuan.</p><div class="disc">${DQ.map((q,i)=>`<div class="dq" id="dq${i}"><label for="ta${i}">${i+1}. ${q[0]}</label><textarea id="ta${i}" rows="2" placeholder="Tulis jawabanmu…">${A[i]||''}</textarea><div class="row2"><button class="mini" data-i="${i}">Bandingkan dengan jawaban acuan</button></div><div class="ref"><b>Jawaban acuan:</b> ${q[1]}</div></div>`).join('')}</div>
    <div class="center row"><button class="btn-y" id="copyD">Salin semua jawaban</button></div><p class="note" style="text-align:center">Jawaban tersimpan otomatis di perangkat ini.</p>`;
  DQ.forEach((q,i) => { $('#ta'+i).oninput = e => { A[i] = e.target.value; store.set('disc', A); }; });
  $$('.dq .mini').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (!(A[i]||'').trim()) return toast('Tulis jawabanmu dulu sebelum melihat jawaban acuan.', 'warn'); $('#dq'+i).classList.add('show'); });
  $('#copyD').onclick = () => { const txt = DQ.map((q,i)=>`${i+1}. ${q[0]}\nJawaban: ${A[i]||'-'}`).join('\n\n');
    const ok = () => toast('Jawaban disalin. Tempelkan ke catatan atau kirim ke guru.');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(ok).catch(() => fallback(txt)); else fallback(txt); };
  function fallback(t){ dialog('Salin jawaban', `<textarea style="width:100%;min-height:200px">${t.replace(/</g,'&lt;')}</textarea><p class="note">Pilih semua teks di atas lalu salin.</p>`, [['Tutup', closeDlg]]); }
} });
// 20
const QUIZ = [
  ['DNA adalah molekul yang berfungsi …',['Menyimpan informasi genetik','Menghasilkan energi sel','Membentuk dinding sel','Mengangkut oksigen'],0,'DNA menyimpan informasi genetik dan berperan dalam pewarisan sifat.'],
  ['Pada sel tumbuhan, sebagian besar DNA terdapat di …',['Vakuola','Inti sel','Dinding sel','Membran sel'],1,'Inti sel adalah lokasi utama DNA; mitokondria dan plastida memiliki DNA dalam jumlah kecil.'],
  ['Fungsi detergen dalam isolasi DNA adalah …',['Mengendapkan DNA','Melarutkan membran sel dan membran inti','Memberi warna pada DNA','Menghancurkan dinding sel selulosa'],1,'Detergen melarutkan lipid penyusun membran.'],
  ['Garam (NaCl) ditambahkan karena ion Na⁺ …',['Mengurangi tolakan muatan negatif antarmolekul DNA','Melarutkan pektin','Memotong DNA','Menaikkan suhu larutan'],0,'Na⁺ menetralkan sebagian muatan negatif gugus fosfat sehingga DNA dapat beragregasi.'],
  ['Etanol dingin digunakan karena …',['DNA mudah larut dalam etanol dingin','DNA sukar larut dalam etanol sehingga mengendap','Etanol membunuh bakteri pada tomat','Etanol memecah membran inti'],1,'DNA sukar larut dalam etanol; suhu dingin memperbanyak endapan.'],
  ['Urutan prosedur isolasi DNA tomat yang benar adalah …',['Penyaringan → penghancuran → lisis → etanol','Penghancuran → lisis dengan larutan ekstraksi → penyaringan → etanol dingin','Etanol → penghancuran → penyaringan → lisis','Lisis → etanol → penghancuran → penyaringan'],1,'Jaringan dihancurkan, sel dilisiskan, campuran disaring, lalu DNA diendapkan dengan etanol.'],
  ['Etanol dituang perlahan melalui dinding tabung agar …',['Etanol cepat menguap','Terbentuk lapisan etanol di atas filtrat','Filtrat menjadi hangat','DNA larut kembali'],1,'Lapisan terpisah memungkinkan DNA beragregasi di batas lapisan.'],
  ['Endapan putih yang terbentuk paling tepat disebut …',['DNA murni','Fraksi endapan yang mengandung DNA','Kristal garam','Protein murni'],1,'Endapan masih bercampur RNA, protein, dan pektin.'],
  ['Jika langkah penambahan detergen dilewati, hasilnya …',['DNA tetap banyak mengendap','DNA hampir tidak keluar dari sel','Endapan berwarna merah','Etanol tidak membentuk lapisan'],1,'Tanpa detergen, membran tidak larut sehingga DNA tetap terkurung.'],
  ['Mengapa DNA hasil isolasi dapat terlihat dengan mata telanjang?',['Satu molekul DNA berukuran sangat besar','Jutaan molekul DNA beragregasi menjadi endapan','DNA tomat berwarna putih terang','Etanol memperbesar molekul DNA'],1,'Satu molekul DNA (± 2 nm) tidak terlihat; agregatnya yang tampak.'],
];
let qi = 0, qres = [];
SL.push({ title:'Kuis dan Penutup', nonext:true, render(el){ el.innerHTML = `<h2 class="ribbon">Kuis dan Penutup</h2><div class="split rev quizwrap"><div class="panel paper" id="quiz"></div><svg class="av" id="buddy" viewBox="0 0 120 120"><use href="#tomato"/></svg></div>`; renderQuiz(); } });
function renderQuiz(){
  const box = $('#quiz'), buddy = $('#buddy'); if (!box) return; buddy.classList.remove('happy','sad');
  if (qi>=QUIZ.length){ const s = Math.round(qres.filter(Boolean).length/QUIZ.length*100), miss = qres.map((r,i)=>r?null:i+1).filter(Boolean); store.set('score', s);
    box.innerHTML = `<p class="kicker">Skor kuis</p><p style="font:800 3rem var(--f-display);color:var(--navy);margin:0">${s}<span style="font-size:1.2rem">/100</span></p>
      <p><b>${s>=80?'Hebat! Kamu memahami isolasi DNA tumbuhan.':s>=60?'Bagus, sedikit lagi!':'Ayo pelajari lagi materinya.'}</b> ${miss.length?`Pelajari lagi soal nomor ${miss.join(', ')}.`:''}</p>
      <div class="center row"><button class="btn-y" id="rq">⟲ Ulang kuis</button><button class="btn-y" id="rm">Ulang materi (slide 4)</button><button class="btn-y" id="rl">Ulang praktikum</button><button class="btn-y blue" id="rr">Rapor praktikum</button></div>
      <p class="reply" style="margin-top:12px">Terima kasih telah belajar! Ingat: hasil isolasi DNA sederhana adalah <b>endapan yang mengandung DNA</b>, bukan heliks ganda yang terlihat.</p>`;
    $('#rq').onclick = () => { qi = 0; qres = []; renderQuiz(); }; $('#rm').onclick = () => show(4); $('#rr').onclick = report;
    $('#rl').onclick = () => dialog('Ulang praktikum?', '<p>Semua langkah praktikum (slide 12–18) akan diulang dari awal.</p>', [['Batal', closeDlg, 'blue'], ['Ulang', () => { closeDlg(); L = freshLab(); saveLab(); show(12); }]]);
    if (s>=80) sfx.win(); return; }
  const q = QUIZ[qi];
  box.innerHTML = `<div class="qhead"><span class="qbadge">Soal ${qi+1} dari ${QUIZ.length}</span><span class="qdots">${QUIZ.map((_,i)=>`<i class="${i<qi?(qres[i]?'ok':'bad'):i===qi?'cur':''}"></i>`).join('')}</span></div>
    <p class="qtext">${q[0]}</p><div class="qopts">${q[1].map((o,j)=>`<button class="qopt" data-j="${j}"><span class="k">${'ABCD'[j]}</span>${o}</button>`).join('')}</div><div id="qfb"></div>`;
  box.querySelectorAll('.qopt').forEach(b => b.onclick = () => { const j = +b.dataset.j, ok = j===q[2]; qres[qi] = ok;
    box.querySelectorAll('.qopt').forEach((x,xi) => { x.disabled = true; if (xi===q[2]) x.classList.add('right'); }); if (!ok) b.classList.add('wrong');
    ok ? sfx.ok() : sfx.bad(); buddy.classList.add(ok?'happy':'sad');
    $('#qfb').innerHTML = `<div class="qexp ${ok?'ok':'bad'}"><b>${ok?'✓ Benar!':'✗ Belum tepat'}</b>${ok?'':`Jawaban yang benar: <b style="display:inline">${q[1][q[2]]}</b>. `}${q[3]}</div><div class="qnav"><button class="btn-y" id="qn">${qi===QUIZ.length-1?'Lihat skor':'Soal berikutnya'} ▶</button></div>`;
    $('#qn').onclick = () => { qi++; renderQuiz(); }; });
}

/* ---------------- rapor praktikum ---------------- */
function report(){
  const c = calc(), s = L.sol, p = L.ppt, fb = [];
  let k3 = K3.size===K3L.length ? 100 : 60; if (K3.size===K3L.length) fb.push(['good','Komitmen keselamatan kerja lengkap.']);
  if (L.k3bad.length){ k3 -= 50*L.k3bad.length; fb.push(['bad','Mendekatkan api ke etanol (pelanggaran K3).']); } k3 = clamp(k3,0,100);
  const pro = clamp(100 - L.wrong.length*10, 0, 100); fb.push(L.wrong.length ? ['bad',`${L.wrong.length} kali memilih alat/bahan yang salah atau tidak berurutan.`] : ['good','Memilih alat dan bahan sesuai urutan prosedur.']);
  let tak = 100;
  if (Math.abs(s.water-100)>5){ tak -= 15; fb.push(['bad',`Air ${s.water} mL (anjuran 100 mL).`]); }
  if (s.salt!=='ok'){ tak -= 15; fb.push(['bad','Takaran garam tidak tepat (anjuran ½ sdt).']); }
  if (s.det!=='ok'){ tak -= 20; fb.push(['bad','Takaran detergen tidak tepat (anjuran 1 sdm).']); }
  if (L.ext.vol<40 || L.ext.vol>60){ tak -= 10; fb.push(['bad',`Larutan ekstraksi ${L.ext.vol} mL (anjuran ± 50 mL).`]); }
  if (p.filtrate<4 || p.filtrate>6){ tak -= 10; fb.push(['bad',`Filtrat ${p.filtrate} mL (anjuran ± 5 mL).`]); }
  if (c.ratio && (c.ratio<.8 || c.ratio>1.5)){ tak -= 15; fb.push(['bad',`Perbandingan etanol : filtrat ${c.ratio.toFixed(1)} : 1 (anjuran ± 1 : 1).`]); }
  if (tak===100) fb.push(['good','Semua takaran tepat.']); tak = clamp(tak,0,100);
  let tek = 100;
  if (L.grind.v<90){ tek -= Math.round((90-L.grind.v)/2); fb.push(['bad',`Tomat hanya ${Math.round(L.grind.v)}% halus.`]); }
  if (s.foam || L.ext.foam){ tek -= 20; fb.push(['bad','Mengaduk terlalu cepat sehingga berbusa.']); }
  if (!p.iced){ tek -= 15; fb.push(['bad','Etanol tidak didinginkan.']); }
  if (!p.clamp){ tek -= 5; fb.push(['bad','Tabung tidak dimiringkan dengan penjepit.']); }
  if (p.mixed){ tek -= 25; fb.push(['bad','Etanol dituang terlalu deras sehingga lapisan tercampur.']); }
  if (L.wrong.includes('kocok')){ tek -= 15; }
  if (tek===100) fb.push(['good','Teknik kerja rapi dan hati-hati.']); tek = clamp(tek,0,100);
  const has = c.prec>=15, key = has ? {warna:'Putih keruh', bentuk:'Serabut halus/gumpalan lendir', letak:'Di batas lapisan etanol dan filtrat', jumlah: c.prec>=55?'Banyak':'Sedikit'} : {warna:'Tidak ada endapan', bentuk:'Tidak ada endapan', letak:'Tidak ada endapan', jumlah:'Tidak ada'};
  const right = Object.keys(key).filter(k => L.obs.table[k]===key[k]).length, obs = right*25;
  fb.push(right===4 ? ['good','Tabel pengamatan sesuai dengan hasil.'] : ['bad',`Tabel pengamatan: ${right} dari 4 sesuai dengan hasil yang terbentuk.`]);
  const total = Math.round((k3+pro+tak+tek+c.prec+obs)/6), grade = total>=85?'A':total>=70?'B':total>=55?'C':'D';
  const rows = [['Keselamatan (K3)',k3,'#ef4b4b'],['Prosedur',pro,'#ff922b'],['Ketepatan takaran',tak,'#fab005'],['Teknik kerja',tek,'#7c5cff'],['Hasil DNA',c.prec,'#2f7be6'],['Pengamatan',obs,'#2fb344']];
  dialog('Rapor Praktikum', `<p style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 10px"><span style="font:800 3rem var(--f-display);color:var(--navy);line-height:1">${total}</span><span class="qbadge" style="font-size:1.4rem">${grade}</span><span>Perkiraan kemurnian: <strong>${c.purity}</strong>/100</span></p>
    ${rows.map(r=>`<div class="rep"><span>${r[0]}</span><div class="bar3"><i style="width:${r[1]}%;background:${r[2]}"></i></div><b>${r[1]}</b></div>`).join('')}
    <ul class="fb">${fb.map(f=>`<li class="${f[0]}">${f[1]}</li>`).join('')}</ul><p class="note">Endapan dari isolasi sederhana masih bercampur RNA, protein, dan pektin, sehingga kemurniannya rendah. Semua angka bersifat ilustratif.</p>`,
    [['Tutup', closeDlg, 'blue'], ['⟲ Ulang praktikum', () => { closeDlg(); L = freshLab(); saveLab(); show(12); }]]);
}

const STORY = [
  ['Selamat datang di Laboratorium Bioteknologi. Saya Dokter Nadia, dan hari ini kamu bertugas sebagai asisten peneliti saya.', 'Misi kita sederhana, tetapi menakjubkan: mengungkap materi genetik yang tersembunyi di dalam sebuah buah tomat.', 'Tekan tombol Mulai belajar ketika kamu siap.'],
  ['Coba perhatikan tomat ini. Merah, segar, dan tampak biasa saja.', 'Namun di dalam setiap selnya tersimpan petunjuk kehidupan yang diwariskan dari generasi ke generasi.', 'Menurutmu, apakah tomat memiliki DNA? Dan seperti apa wujudnya jika kita berhasil mengeluarkannya?'],
  ['Sebelum masuk ke meja kerja, mari kita tetapkan target hari ini.', 'Di akhir praktikum, kamu akan memahami prinsip isolasi DNA, mengenal alat dan bahannya, melakukan prosedurnya sendiri, dan menganalisis hasilnya.'],
  ['Bayangkan sebuah tangga yang dipilin. Itulah bentuk DNA: heliks ganda.', 'Kedua sisinya tersusun dari gula dan fosfat, sedangkan anak tangganya adalah pasangan basa: adenin dengan timin, guanin dengan sitosin.', 'Urutan basa inilah yang menyimpan informasi genetik. Putar heliksnya, lalu coba lengkapi pasangan basanya.'],
  ['Sekarang kita masuk lebih dalam, ke dalam sebuah sel tumbuhan.', 'Dinding sel yang kaku melindungi bagian luar, membran sel membungkus isinya, dan di tengahnya ada inti sel: tempat sebagian besar DNA disimpan.', 'Mitokondria dan plastida juga menyimpan sedikit DNA. Temukan inti sel, lalu perbesar untuk melihat isinya.'],
  ['Lalu, bagaimana caranya mengeluarkan DNA dari dalam sel?', 'Inilah yang disebut isolasi DNA: memisahkan DNA dari protein, lipid, dan sisa jaringan, agar dapat diamati atau dianalisis.', 'Ikuti tahapannya satu per satu.'],
  ['Ada tiga kunci utama dalam isolasi DNA.', 'Pertama, lisis: detergen membongkar membran sel. Kedua, penyaringan: memisahkan ampas dari cairan. Ketiga, pengendapan: alkohol dingin membuat DNA menggumpal.', 'Putar animasinya, dan perhatikan apa yang terjadi pada tingkat molekul.'],
  ['Inilah sampel kita: tomat, Solanum lycopersicum.', 'Daging buahnya lunak dan mudah dihaluskan, sehingga cocok untuk praktikum sederhana.', 'Tetapi ingat, tomat kaya akan pektin yang bisa ikut mengendap bersama DNA. Simpan petunjuk ini untuk saat pengamatan nanti.'],
  ['Seorang peneliti harus mengenal setiap alatnya.', 'Mortar dan alu untuk menghaluskan, gelas ukur untuk menakar, corong dan kertas saring untuk memisahkan, dan tabung reaksi untuk mengamati.', 'Sentuh setiap alat untuk mempelajari fungsinya.'],
  ['Sekarang, bahan-bahannya.', 'Detergen akan membongkar membran, garam membantu DNA berkumpul, dan etanol dingin akan memunculkan DNA di depan matamu.', 'Perhatikan takarannya baik-baik. Di laboratorium, ketepatan adalah segalanya.'],
  ['Tunggu sebentar. Sebelum menyentuh apa pun, keselamatan adalah prioritas utama.', 'Kenakan jas laboratorium dan sarung tangan, berhati-hatilah dengan pisau dan kaca, dan jauhkan etanol dari api.', 'Centang setiap poin sebagai janjimu. Setelah itu, meja kerja siap untukmu.'],
  ['Baik, asisten. Praktikum dimulai.', 'Ambil sekitar lima puluh gram tomat matang, cuci hingga bersih, lalu potong kecil-kecil. Arahkan pisau menjauhi jarimu.'],
  ['Potongan tomat sudah siap.', 'Masukkan ke dalam mortar, lalu gerus dengan alu dalam gerakan melingkar. Semakin halus, semakin banyak dinding sel yang robek.'],
  ['Saatnya meracik larutan ekstraksi.', 'Takar seratus mililiter air dengan gelas ukur, lalu tambahkan setengah sendok teh garam dan satu sendok makan detergen cair.', 'Aduk perlahan. Busa yang berlebihan bukan pertanda baik.'],
  ['Inilah bagian yang paling menentukan.', 'Tuangkan sekitar lima puluh mililiter larutan ekstraksi ke bubur tomat, aduk perlahan, lalu biarkan detergen bekerja.', 'Di balik cairan yang tampak tenang ini, membran sel sedang terbongkar, dan DNA mulai terlepas.'],
  ['Campuran kita masih penuh ampas.', 'Susun gelas beker, corong, dan kertas saring, lalu tuangkan campurannya. Cairan yang menetes adalah filtrat, dan di dalamnya DNA sedang menunggu.'],
  ['Kita hampir sampai.', 'Pindahkan sekitar lima mililiter filtrat ke tabung reaksi. Dinginkan etanol, miringkan tabung, lalu tuangkan etanol perlahan melalui dindingnya.', 'Pelan saja, dan jangan mengocok tabungnya.'],
  ['Sekarang, diam dan perhatikan baik-baik.', 'Di batas antara etanol dan filtrat, serabut putih mulai muncul. Itulah endapan yang mengandung jutaan molekul DNA tomat.', 'Gunakan lup untuk mengamatinya, lalu catat hasilnya. Ingat, endapan ini belum DNA murni.'],
  ['Kerja bagus, asisten. Seorang ilmuwan tidak berhenti pada hasil, tetapi selalu bertanya mengapa.', 'Diskusikan pertanyaan-pertanyaan ini bersama kelompokmu, lalu bandingkan dengan jawaban acuan.'],
  ['Petualangan kita hampir selesai. Saatnya menguji pemahamanmu.', 'Jawab setiap soal dengan teliti. Terima kasih telah menjadi asisten peneliti yang hebat hari ini.'],
];
const tts = 'speechSynthesis' in window;
let narrOn = store.get('narr', true);

/* ---------------- narasi storytelling (rekaman MP3 bila ada, jika tidak suara sintetis) ---------------- */
let muted = store.get('muted', false);
let hasAudio = null; try{ fetch('audio/s01-1.mp3', {method:'HEAD'}).then(r => hasAudio = r.ok).catch(() => hasAudio = false); }catch(e){ hasAudio = false; }
let storyRun = 0, lineIdx = 0, storyPlaying = false, storyDone = false, audioEl = null;
const readMs = t => Math.max(2200, t.split(/\s+/).length * 380);
function idVoice(){ try{ return speechSynthesis.getVoices().find(v => /^id/i.test(v.lang)); }catch(e){ return null; } }
function sayTTS(text, done){
  if (!tts || muted){ setTimeout(done, readMs(text)); return; }
  try{ const u = new SpeechSynthesisUtterance(text); u.lang = 'id-ID'; u.rate = .93; u.pitch = 1.03; const v = idVoice(); if (v) u.voice = v;
    let fin = false; const end = () => { if (!fin){ fin = true; done(); } }; u.onend = end; u.onerror = end; speechSynthesis.speak(u);
    setTimeout(end, readMs(text) + 6000); }catch(e){ setTimeout(done, readMs(text)); }
}
function sayLine(n, i, done){
  const text = STORY[n-1][i];
  if (hasAudio && !muted){
    try{ audioEl = new Audio(`audio/s${String(n).padStart(2,'0')}-${i+1}.mp3`); let fin = false; const end = () => { if (!fin){ fin = true; done(); } };
      audioEl.onended = end; audioEl.onerror = () => { if (!fin){ fin = true; sayTTS(text, done); } };
      audioEl.play().catch(() => { if (!fin){ fin = true; sayTTS(text, done); } }); return; }catch(e){}
  }
  sayTTS(text, done);
}
function stopSpeak(){ storyRun++; storyPlaying = false; try{ if (tts) speechSynthesis.cancel(); }catch(e){} if (audioEl){ try{ audioEl.pause(); }catch(e){} audioEl = null; } setPlayIcon(); }
function setPlayIcon(){ const b = $('#hnPlay'); if (!b) return; b.textContent = storyPlaying ? '❚❚' : '▶'; b.classList.toggle('on', storyPlaying); b.setAttribute('aria-label', storyPlaying ? 'Jeda narasi' : 'Putar narasi'); }
function showLine(n, i){ const t = $('#hnText'); t.textContent = STORY[n-1][i] || ''; t.animate?.([{opacity:0, transform:'translateY(4px)'},{opacity:1, transform:'none'}], {duration:300}); }
function playStory(n, from){
  stopSpeak(); const run = ++storyRun; storyPlaying = true; storyDone = false; lineIdx = from ?? lineIdx; setPlayIcon();
  const step = () => { if (run!==storyRun || cur!==n) return;
    if (lineIdx >= STORY[n-1].length){ storyPlaying = false; storyDone = true; lineIdx = STORY[n-1].length-1; setPlayIcon(); return; }
    showLine(n, lineIdx); sayLine(n, lineIdx, () => { if (run!==storyRun) return; lineIdx++; setTimeout(step, 420); }); };
  step();
}
function speak(text){ stopSpeak(); if (muted) return; sayTTS(text, () => {}); }
$('#hnPlay').onclick = () => { if (storyPlaying){ stopSpeak(); return; } playStory(cur, storyDone ? 0 : lineIdx); };
$('#hnNext').onclick = () => { const was = storyPlaying; stopSpeak(); lineIdx = (lineIdx+1) % STORY[cur-1].length; showLine(cur, lineIdx); if (was) playStory(cur, lineIdx); };
function setMuted(m){ muted = m; store.set('muted', m); soundOn = !m; store.set('sound', soundOn); const b = $('#btnNarr'); b.setAttribute('aria-pressed', m); b.setAttribute('aria-label', m ? 'Nyalakan suara' : 'Matikan suara'); if (m){ try{ speechSynthesis.cancel(); }catch(e){} if (audioEl) audioEl.pause(); } }
setMuted(muted);
$('#btnNarr').onclick = () => { setMuted(!muted); if (!muted && storyPlaying) playStory(cur, lineIdx); };
function hudTask(t){ const el = $('#hnTask'); if (!el) return; el.hidden = !t; el.textContent = t || ''; }
const visited = new Set(store.get('visited', []));
const t0 = Date.now();
setInterval(() => { const sec = Math.floor((Date.now()-t0)/1000), c = $('#hnClock'); if (c) c.textContent = `⏱ ${String(sec/60|0).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`; }, 1000);

/* ---------------- pemutar animasi proses isolasi (slide 7) ---------------- */
const CH = [
  ['Penghancuran', 'Alu menggerus jaringan tomat. Dinding sel yang tersusun dari selulosa dan pektin robek, sehingga larutan ekstraksi dapat menjangkau membran sel.'],
  ['Lisis sel', 'Molekul detergen (hijau) menyusup ke membran lipid (jingga). Membran pecah menjadi misel, DNA keluar, lalu ion Na⁺ menetralkan muatan negatif DNA.'],
  ['Penyaringan', 'Campuran dituang ke corong berlapis kertas saring. Ampas tertahan, sedangkan DNA dan molekul kecil lolos menjadi filtrat.'],
  ['Presipitasi', 'Etanol dingin dituang perlahan lewat dinding tabung. DNA sukar larut dalam etanol, sehingga beragregasi menjadi endapan putih di batas lapisan, lalu digulung.'],
];
const ease = t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
const seg = (t,a,b) => clamp((t-a)/(b-a), 0, 1);
const lerp = (a,b,k) => a+(b-a)*k;
function isoPlayer(host){
  host.innerHTML = `<div class="player"><p class="kicker">Animasi pembelajaran · Proses isolasi DNA</p><canvas id="pc" aria-label="Animasi proses isolasi DNA"></canvas><p class="pcap" id="pcap"></p>
    <div class="pctl"><button class="rnd blue" id="pp" aria-label="Putar animasi">▶</button><input type="range" id="pr" min="0" max="400" step="0.5" value="0" aria-label="Posisi animasi"><span class="ptime" id="pt"></span></div>
    <div class="chips" id="pch">${CH.map((c,i)=>`<button class="chip" data-c="${i}">${i+1}. ${c[0]}</button>`).join('')}</div></div>`;
  const cv = host.querySelector('#pc'), x = cv.getContext('2d'), W = 640, H = 300, DUR = 9000;
  const fit = () => { const d = devicePixelRatio||1, w = cv.clientWidth||W; cv.width = Math.round(w*d); cv.height = Math.round(w*H/W*d); x.setTransform(cv.width/W,0,0,cv.height/H,0,0); };
  fit(); new ResizeObserver(fit).observe(cv);
  let pos = 0, playing = false, last = performance.now(), lastCh = -1;
  const pp = host.querySelector('#pp'), pr = host.querySelector('#pr');
  pp.onclick = () => { if (pos>=400) pos = 0; playing = !playing; last = performance.now(); if (playing && narrOn) speak(CH[Math.min(3,Math.floor(pos/100))][1]); };
  pr.oninput = () => { pos = +pr.value; playing = false; };
  host.querySelectorAll('#pch .chip').forEach(c => c.onclick = () => { pos = +c.dataset.c*100; playing = true; last = performance.now(); if (narrOn) speak(CH[+c.dataset.c][1]); });
  const rr = (X,Y,w,h,r) => { x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); };
  const label = (t,X,Y,c='#2a3a4a') => { x.font = '700 13px Barlow, sans-serif'; x.textAlign = 'center'; x.lineWidth = 4; x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineJoin = 'round'; x.strokeText(t,X,Y); x.fillStyle = c; x.fillText(t,X,Y); };
  const circ = (X,Y,r,f,s,lw=2) => { x.beginPath(); x.arc(X,Y,r,0,7); if (f){ x.fillStyle = f; x.fill(); const g = x.createRadialGradient(X-r*.35,Y-r*.4,0,X,Y,r*1.05); g.addColorStop(0,'rgba(255,255,255,.8)'); g.addColorStop(.32,'rgba(255,255,255,0)'); g.addColorStop(.78,'rgba(0,0,0,.06)'); g.addColorStop(1,'rgba(0,0,0,.42)'); x.fillStyle = g; x.fill(); } if (s && !f){ x.strokeStyle = s; x.lineWidth = lw; x.stroke(); } };
  const bg = c => { const g = x.createRadialGradient(W*.5,H*.42,20,W*.5,H*.5,W*.62); g.addColorStop(0,'#ffffff'); g.addColorStop(.6,c); g.addColorStop(1,'#cdd5db'); x.fillStyle = g; x.fillRect(0,0,W,H); };
  const wave = (x1,x2,y,amp,col,lw=4,ph=0) => { if (col==='#2f7be6'){ const back = [], mid = [], front = [], ar = Math.max(2.2, lw*.62); let k = 0;
      for (let X=x1; X<=x2; X+=ar*1.35, k++){ const Y = y+Math.sin((X+ph)/9)*amp, q = X/(ar*3.2)+ph*.05, o = Math.sin(q)*ar*1.9, z = Math.cos(q), e = k%3===0?'#ff9a33':k%3===1?'#ee3b30':'#a9b1b7';
        (z>0?front:back).push([X,Y+o,ar,e]); (z>0?back:front).push([X,Y-o,ar,k%3===0?'#ff9a33':'#a9b1b7']); if (k%2===0) mid.push([X,Y,ar*.8,'#4a72ee']); }
      const sa = x.globalAlpha; for (const L2 of [back,mid,front]) for (const [X,Y,r,c] of L2){ x.globalAlpha = sa*(L2===back?.7:1); circ(X,Y,r,c); } x.globalAlpha = sa; return; }
    x.beginPath(); for (let X=x1; X<=x2; X+=3){ const Y = y+Math.sin((X+ph)/9)*amp; X===x1?x.moveTo(X,Y):x.lineTo(X,Y); } x.strokeStyle = col; x.lineWidth = lw; x.stroke(); };
  function ch0(t){
    bg('#f4e9dc');
    for (let i=0;i<6;i++){ const cx = 140+(i%3)*180, cy = 95+Math.floor(i/3)*115, b = seg(t,.1+i*.12,.22+i*.12);
      x.save(); x.translate(cx,cy);
      rr(-75,-45,150,90,14); { const g = x.createRadialGradient(-20,-15,10,0,0,90); g.addColorStop(0,'#fff6ea'); g.addColorStop(1,'#f0d6bb'); x.fillStyle = g; } x.fill();
      x.setLineDash(b>0 ? [30-b*14, 6+b*18] : []); x.strokeStyle = '#a1aa6a'; x.lineWidth = 9; x.stroke(); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 2; x.stroke(); x.setLineDash([]);
      circ(-20,-4,16,'#b9a2d9'); circ(-17,-7,5,'#5b3f8a'); for (const [ex,ey] of [[30,-18],[42,10],[8,26],[-50,18]]) circ(ex,ey,5.5,'#e8501f');
      for (let k=0;k<5;k++){ const a = k*1.3+i; circ(Math.cos(a)*(80+b*26), Math.sin(a)*(48+b*20), 3, `rgba(255,146,43,${b})`); }
      x.restore(); }
    const a = t*Math.PI*4, px = 320+Math.cos(a)*220, py = 150+Math.sin(a)*75;
    { const g = x.createLinearGradient(px-9,0,px+9,0); g.addColorStop(0,'#b9b2a6'); g.addColorStop(.45,'#fdfcfa'); g.addColorStop(1,'#a8a094'); x.strokeStyle = g; } x.lineWidth = 18; x.lineCap = 'round'; x.beginPath(); x.moveTo(px+50,py-110); x.lineTo(px,py); x.stroke();
    circ(px,py,26,'#e9e5de');
    label('dinding sel', 140, 30); label('inti', 120, 106); label('alu', px+60, py-112);
  }
  function ch1(t){
    bg('#eef2f5');
    const C = [320,150], R = 112, n = 36, mic = [[80,55],[560,55],[70,250],[570,250],[200,280],[440,280]];
    const m = ease(seg(t,.25,.6)), mn = ease(seg(t,.42,.7)), d = ease(seg(t,0,.3));
    if (m<.3){ x.fillStyle = 'rgba(255,249,240,.9)'; circ(C[0],C[1],R-6,'#fff9f0'); }
    for (let i=0;i<n;i++){ const ang = i/n*Math.PI*2, rx = C[0]+Math.cos(ang)*R, ry = C[1]+Math.sin(ang)*R*.9, mc = mic[i%6], ma = (Math.floor(i/6))/6*Math.PI*2;
      const X = lerp(rx, mc[0]+Math.cos(ma)*14, m), Y = lerp(ry, mc[1]+Math.sin(ma)*14, m);
      circ(X,Y,5,'#f0b27a'); }
    for (let i=0;i<12;i++){ const ang = i/12*Math.PI*2+.2, sx = C[0]+Math.cos(ang)*330, sy = C[1]+Math.sin(ang)*230, tx = C[0]+Math.cos(ang)*(R+12), ty = C[1]+Math.sin(ang)*(R+12)*.9, mc = mic[i%6];
      const X0 = lerp(sx,tx,d), Y0 = lerp(sy,ty,d), X = lerp(X0, mc[0]+Math.cos(i)*16, m), Y = lerp(Y0, mc[1]+Math.sin(i)*16, m);
      circ(X,Y,5,'#3fb877'); x.strokeStyle = '#b9a58c'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(X-1,Y+5); x.quadraticCurveTo(X-3,Y+9,X-1,Y+13); x.moveTo(X+1,Y+5); x.quadraticCurveTo(X+3,Y+9,X+1,Y+13); x.stroke(); }
    for (let i=0;i<20;i++){ const ang = i/20*Math.PI*2, rx = C[0]+Math.cos(ang)*48, ry = C[1]+Math.sin(ang)*48, tx = C[0]+Math.cos(ang)*150, ty = C[1]+Math.sin(ang)*120;
      circ(lerp(rx,tx,mn), lerp(ry,ty,mn), 4, '#b9a2d9'); }
    const u = ease(seg(t,.5,.82));
    if (u<1){ x.globalAlpha = 1-u; x.beginPath(); for (let k=0;k<60;k++){ const a = k*.45, r = 4+k*.6; x.lineTo(C[0]+Math.cos(a)*r, C[1]+Math.sin(a)*r); } x.strokeStyle = '#2f7be6'; x.lineWidth = 3; x.stroke(); x.globalAlpha = 1; }
    if (u>0){ const w = u*240; wave(C[0]-w, C[0]+w, C[1], 14, '#2f7be6', 5, t*200);
      for (let X = C[0]-w+12; X < C[0]+w; X += 40){ label('−', X, C[1]+Math.sin((X+t*200)/9)*14-12, '#e03131'); } }
    const na = ease(seg(t,.78,1));
    if (na>0) for (let i=0;i<10;i++){ const tx = C[0]-200+i*44, ty = C[1]+(i%2?-30:30), sx = i*70, sy = i%2?0:H;
      const X = lerp(sx,tx,na), Y = lerp(sy,ty,na); circ(X,Y,10,'#a45be8'); x.font = '700 10px Barlow'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText('Na⁺', X, Y+4); }
    label(m<.2?'membran (lipid)':'misel', m<.2?C[0]:80, m<.2?28:28); if (d>0 && m<.5) label('detergen', 560, 150, '#0ca678'); if (u>.3) label('DNA', C[0]+u*240-20, C[1]-28, '#1c55b0');
  }
  function ch2(t){
    bg('#eef2f5');
    x.beginPath(); x.moveTo(200,40); x.lineTo(440,40); x.lineTo(338,150); x.lineTo(338,195); x.lineTo(302,195); x.lineTo(302,150); x.closePath(); x.fillStyle = 'rgba(241,243,245,.8)'; x.fill(); x.strokeStyle = 'rgba(120,145,165,.9)'; x.lineWidth = 2; x.stroke();
    x.beginPath(); x.moveTo(214,46); x.lineTo(426,46); x.lineTo(320,140); x.closePath(); x.fillStyle = '#fff'; x.fill(); x.strokeStyle = '#adb5bd'; x.lineWidth = 3; x.stroke();
    rr(250,205,140,88,8); x.fillStyle = 'rgba(241,243,245,.7)'; x.fill(); x.strokeStyle = 'rgba(120,145,165,.9)'; x.lineWidth = 2; x.stroke();
    const lvl = ease(t)*62; { const g = x.createLinearGradient(0,289-lvl,0,289); g.addColorStop(0,'rgba(255,200,160,.9)'); g.addColorStop(1,'rgba(214,110,62,.95)'); x.fillStyle = g; } x.fillRect(254, 289-lvl, 132, lvl);
    for (let i=0;i<18;i++){ const s = i/18*.7, p = seg(t,s,s+.28), big = i%3===0, sx = 230+(i*53)%180;
      if (p<=0) continue;
      if (big){ const y = lerp(-10, 58+(i%4)*12, ease(p)); { const g = x.createLinearGradient(0,y-7,0,y+7); g.addColorStop(0,'#e8603a'); g.addColorStop(1,'#9c2f12'); x.fillStyle = g; } rr(sx-9, y-7, 18, 14, 5); x.fill(); }
      else { let X, Y; if (p<.5){ X = lerp(sx,320,p*2); Y = lerp(-10,135,p*2); } else { X = 320+Math.sin(i)*20*(p-.5); Y = lerp(135,280-lvl*.5,(p-.5)*2); }
        x.globalAlpha = p>.9 ? (1-p)*10 : 1;
        if (i%3===1) wave(X-10, X+10, Y, 4, '#2f7be6', 3, i*10); else circ(X,Y,4,'#f29a6c');
        x.globalAlpha = 1; } }
    label('ampas tertahan', 520, 70, '#d9480f'); label('kertas saring', 520, 100); label('filtrat (DNA terlarut)', 500, 270, '#e8590c');
  }
  function ch3(t){
    bg('#eef2f5');
    const top = 20, bot = 285, iy = 175, e = ease(seg(t,0,.3)), et = iy - e*110;
    x.fillStyle = '#ef9a6c'; x.fillRect(293, iy, 54, bot-iy-12); x.beginPath(); x.arc(320, bot-12, 27, 0, Math.PI); x.fill();
    if (e>0){ x.fillStyle = 'rgba(214,232,244,.85)'; x.fillRect(293, et, 54, iy-et); }
    if (e>0 && e<1){ x.strokeStyle = '#74c0fc'; x.lineWidth = 4; x.beginPath(); x.moveTo(250,0); x.quadraticCurveTo(292,10,295,et); x.stroke(); label('etanol dingin', 210, 30, '#1c7ed6'); }
    x.strokeStyle = 'rgba(120,145,165,.95)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(290,top); x.lineTo(290,bot-12); x.arc(320,bot-12,30,Math.PI,0,true); x.lineTo(350,top); x.stroke();
    const a = ease(seg(t,.3,.68)), bl = seg(t,.55,.8), s = seg(t,.75,1);
    for (let i=0;i<7;i++){ const sx = 300+(i*13)%40, sy = 200+(i*17)%70, X = lerp(sx, 312+(i%3)*6, a), Y = lerp(sy, iy-2, a); if (bl<.9) { x.globalAlpha = 1-bl; wave(X-8, X+8, Y, 3, '#2f7be6', 3, i*20+t*100); x.globalAlpha = 1; } }
    if (bl>0){ const r = bl*16, by = iy - 4 - (s>.5 ? (s-.5)*2*90 : 0);
      x.save(); x.translate(320, by); x.rotate(s*8);
      for (let k=0;k<10;k++){ x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 3; x.beginPath(); x.ellipse(0,0,r*(.5+k*.05),r*.35+k*.4,k*.3,0,7); x.stroke(); }
      x.strokeStyle = '#ced4da'; x.lineWidth = 1; x.beginPath(); x.ellipse(0,0,r,r*.5,0,0,7); x.stroke(); x.restore(); }
    if (s>0){ const sy = lerp(-10, iy-4, Math.min(1,s*2)) - (s>.5?(s-.5)*2*90:0); x.strokeStyle = 'rgba(205,222,232,.95)'; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(320, sy-150); x.lineTo(320, sy); x.stroke(); }
    label('filtrat', 400, 240, '#e8590c'); if (e>.5) label('etanol', 395, 130, '#1c7ed6'); if (bl>.3) label('← endapan DNA', 420, iy+4, '#e03131');
  }
  function frame(now){
    if (!cv.isConnected) return;
    if (playing){ pos = clamp(pos + Math.max(0, now-last)/DUR*100, 0, 400); if (pos>=400) playing = false; }
    last = now;
    const ch = clamp(Math.floor(pos/100), 0, 3), t = pos>=400 ? 1 : (pos%100)/100;
    [ch0,ch1,ch2,ch3][ch](t);
    if (ch!==lastCh){ lastCh = ch; host.querySelector('#pcap').textContent = `${ch+1}. ${CH[ch][0]}: ${CH[ch][1]}`; host.querySelectorAll('#pch .chip').forEach((c,i) => c.classList.toggle('sel', i===ch)); if (playing && narrOn && pos%100>1) speak(CH[ch][1]); }
    pr.value = pos; pp.textContent = playing ? '❚❚' : pos>=400 ? '⟲' : '▶';
    host.querySelector('#pt').textContent = `Bab ${ch+1}/4`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------------- heliks berputar & mini-game (slide 4) ---------------- */
function helixSVG(ph){ return REAL.helix(ph); }
const PAIR = {A:'T', T:'A', G:'C', C:'G'}, SEQ = ['A','T','G','C','G','T','A'];
function pairGame(host){
  let k = 0;
  host.innerHTML = `<div class="pairgame"><p class="kicker">Mini-game: lengkapi untai pasangannya</p><div class="strand">${SEQ.map(b=>`<div class="base ${b}">${b}</div>`).join('')}</div><div class="bonds" id="pgB"></div><div class="strand" id="pgS"></div>
    <div class="chips" style="margin-top:8px;justify-content:center" id="pgK">${['A','T','G','C'].map(b=>`<button class="chip" data-b="${b}">${b}</button>`).join('')}</div><p class="note" id="pgM" style="text-align:center;margin-top:6px">Ketuk basa yang berpasangan dengan kotak bergaris.</p></div>`;
  const draw = () => { host.querySelector('#pgS').innerHTML = SEQ.map((b,i)=> i<k ? `<div class="base ${PAIR[b]} ${i===k-1?'pop':''}">${PAIR[b]}</div>` : `<div class="base empty ${i===k?'cur':''}">?</div>`).join('');
    host.querySelector('#pgB').innerHTML = SEQ.map((b,i)=>`<div class="bond">${i<k ? '<i></i>'.repeat(b==='G'||b==='C'?3:2) : ''}</div>`).join(''); };
  draw();
  host.querySelectorAll('#pgK .chip').forEach(c => c.onclick = () => {
    if (k>=SEQ.length){ k = 0; draw(); host.querySelector('#pgM').textContent = 'Ketuk basa yang berpasangan dengan kotak bergaris.'; return; }
    if (c.dataset.b===PAIR[SEQ[k]]){ k++; sfx.pop(); draw();
      if (k===SEQ.length){ sfx.win(); host.querySelector('#pgM').innerHTML = '✓ Lengkap! A berpasangan dengan T (2 ikatan hidrogen), G dengan C (3 ikatan hidrogen). Ketuk huruf apa saja untuk main lagi.'; } }
    else { sfx.bad(); const cur = host.querySelector('.base.cur'); cur.classList.remove('shake'); void cur.offsetWidth; cur.classList.add('shake');
      host.querySelector('#pgM').textContent = `Belum tepat. ${SEQ[k]} berpasangan dengan ${PAIR[SEQ[k]]}.`; } });
}

/* ---------------- zoom inti sel (slide 5) ---------------- */
const ZST = [
  ['Inti sel','DNA disimpan di dalam inti sel yang dibungkus membran inti berpori.', `<svg viewBox="0 0 300 180"><rect width="300" height="180" fill="url(#gCyto)"/><circle cx="150" cy="96" r="80" fill="#000" opacity=".2" filter="url(#fBlur4)"/><circle cx="150" cy="90" r="78" fill="url(#gNuc)" stroke="#6d5296" stroke-width="2.5"/>${Array.from({length:22},(_,i)=>{const a=i/22*Math.PI*2;return `<circle cx="${(150+Math.cos(a)*77).toFixed(1)}" cy="${(90+Math.sin(a)*77).toFixed(1)}" r="2.6" fill="#f4ecfb" stroke="#6d5296" stroke-width=".6"/>`}).join('')}<g fill="none" stroke="#5b3f8a" stroke-width="1.4" opacity=".7"><path d="M95,90 C110,60 125,120 140,85 C155,50 165,130 180,105 C195,80 205,120 212,95"/><path d="M100,60 C120,50 130,75 150,60 C170,45 185,70 200,58"/><path d="M98,120 C118,110 132,135 150,122 C170,108 186,132 204,118"/></g><circle cx="176" cy="74" r="16" fill="#5b3f8a" opacity=".85"/><ellipse cx="122" cy="58" rx="26" ry="12" fill="#fff" opacity=".35" filter="url(#fBlur4)"/></svg>`],
  ['Kromatin','DNA melilit protein histon seperti benang pada gulungan, membentuk kromatin.', `<svg viewBox="0 0 300 180"><rect width="300" height="180" fill="#f2ecf7"/>${[50,130,210].map(x=>`<circle cx="${x}" cy="92" r="24" fill="url(#gHead)"/><circle cx="${x}" cy="88" r="20" fill="#000" opacity="0"/>`).join('')}${REAL.dnaStrip(6,90,288,{amp:20,sc:.5,per:80})}<text x="150" y="160" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="700" font-size="13" fill="#2a3a4a">histon (bola krem) + untai DNA (model atom)</text></svg>`],
  ['Heliks ganda','Diperbesar lagi, DNA tampak sebagai dua untai yang berpilin dengan pasangan basa di tengahnya.', `<svg viewBox="0 0 300 180"><rect width="300" height="180" fill="#132029"/><use href="#helix" x="105" y="6" width="90" height="148"/><text x="150" y="170" text-anchor="middle" font-family="Barlow, sans-serif" font-weight="700" font-size="13" fill="#d6e4ee">lebar ± 2 nm, tidak terlihat oleh mata</text></svg>`],
];
function zoomJourney(){
  let i = 0, timer = null;
  const render = () => { $('#dlgBody').innerHTML = `<div class="zoomstage">${ZST[i][2]}</div><p style="margin:8px 0 0"><b>${i+1}. ${ZST[i][0]}.</b> ${ZST[i][1]}</p><div class="zsteps">${ZST.map((_,k)=>`<i class="${k<=i?'on':''}"></i>`).join('')}</div>`; if (narrOn) speak(ZST[i][1]); };
  dialog('Perbesar inti sel', '', [['⟲ Ulangi', () => { clearTimeout(timer); i = 0; render(); auto(); }, 'blue'], ['Tutup', () => { clearTimeout(timer); closeDlg(); }]]);
  const auto = () => { timer = setTimeout(() => { if ($('#dlg').hidden) return; if (i<ZST.length-1){ i++; render(); sfx.pop(); auto(); } }, 2800); };
  render(); auto();
}

/* ---------------- navigasi ---------------- */
let cur = 1;
const prog = $('#progress'); prog.innerHTML = Array.from({length:TOTAL}, () => '<i></i>').join('');
function updateNext(){ const s = SL[cur-1], nx = $('#next'), locked = s.locked && s.locked();
  nx.classList.toggle('locked', !!locked); nx.innerHTML = locked ? 'Selesaikan dulu 🔒' : cur===11 ? 'Mulai praktikum ▶' : cur===19 ? 'Kuis ▶' : 'Lanjut ▶'; }
function show(n, fromHash){
  n = clamp(n|0, 1, TOTAL); stopSpeak(); hudTask(''); cur = n; lineIdx = 0; const s = SL[n-1], el = $('#stage');
  el.innerHTML = '<section class="scene"></section>'; const sec = el.firstChild; s.render(sec);
  const r = sec.querySelector('.ribbon'); if (r && n>1) r.insertAdjacentHTML('afterbegin', `<span class="n">${n}.</span>`);
  $('#foot').hidden = !!s.nonav; $('#next').hidden = !!s.nonext;
  $('#sceneNo').innerHTML = `Slide ${n}/${TOTAL}<span class="t"> · ${s.title}</span>`; showLine(n, 0); visited.add(n); store.set('visited', [...visited]); $('#hnProg').textContent = Math.round(visited.size/TOTAL*100)+'%';
  [...prog.children].forEach((d,i) => d.className = i+1<n ? 'on' : i+1===n ? 'now' : '');
  if (!fromHash){ try{ history.replaceState(null,'','#s'+n); }catch(e){} }
  store.set('last', n); window.scrollTo({top:0}); updateNext();
  if (narrOn) setTimeout(() => { if (cur===n && !storyPlaying) playStory(n, 0); }, 450);
}
$('#prev').onclick = () => show(cur-1);
$('#next').onclick = () => { const s = SL[cur-1]; if (s.locked && s.locked()){ toast(s.lockMsg, 'bad'); return; } show(cur+1); };
$('#btnHome').onclick = () => show(1);
addEventListener('hashchange', () => { const m = location.hash.match(/^#s(\d+)$/); if (m && +m[1]!==cur) show(+m[1], true); });
document.addEventListener('keydown', e => { if (!$('#dlg').hidden || e.target.matches('input,textarea,select')) return; if (e.key==='ArrowRight' && !$('#foot').hidden) $('#next').click(); if (e.key==='ArrowLeft' && !$('#foot').hidden) $('#prev').click(); });
$('#btnInfo').onclick = () => {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  dialog('Tentang & Pengaturan', `<p><b>Laboratorium Virtual Isolasi DNA Tumbuhan</b>: praktikum isolasi DNA dari buah tomat (<i>Solanum lycopersicum</i>) untuk kelas XII SMA/MA.</p>
    <p>Dikembangkan oleh: <b>Muhammad Fadhal Faiq</b> · Universitas Negeri Medan · 2026</p>
    <div class="setrow"><span>Suara efek</span><button class="chip" id="tS" aria-pressed="${soundOn}">${soundOn?'Aktif':'Mati'}</button></div>
    <div class="setrow"><span>Narasi Dr. Nadia otomatis tiap slide</span><button class="chip" id="tN" aria-pressed="${narrOn}">${narrOn?'Aktif':'Mati'}</button></div>
    <div class="setrow"><span>Penanda langkah (mode terpandu)</span><button class="chip" id="tG" aria-pressed="${guided()}">${guided()?'Aktif':'Mati'}</button></div>
    <div class="setrow"><span>Hapus semua kemajuan</span><button class="chip" id="tR">Hapus</button></div>
    <div class="install" style="margin-top:12px">${standalone?'✓ Kamu sedang memakai versi aplikasi.':'<b>Pasang sebagai aplikasi (iPad/iPhone):</b> buka di Safari → ketuk tombol Bagikan → <b>Tambah ke Layar Utama</b>. Di Android/Chrome: menu ⋮ → <b>Instal aplikasi</b>. Fitur ini berfungsi bila web dibuka dari alamat hostingnya sendiri.'}</div>
    <p class="note" style="margin-top:8px">Takaran mengikuti rancangan storyboard dan perlu diuji lewat praktikum pendahuluan. Angka hasil di lab virtual bersifat ilustratif.</p>`, [['Tutup', closeDlg]]);
  $('#tS').onclick = e => { soundOn = !soundOn; store.set('sound', soundOn); e.target.setAttribute('aria-pressed', soundOn); e.target.textContent = soundOn?'Aktif':'Mati'; };
  $('#tN').onclick = e => { narrOn = !narrOn; store.set('narr', narrOn); e.target.setAttribute('aria-pressed', narrOn); e.target.textContent = narrOn?'Aktif':'Mati'; if (narrOn) playStory(cur, 0); else stopSpeak(); };
  $('#tG').onclick = e => { const g = !guided(); store.set('guided', g); e.target.setAttribute('aria-pressed', g); e.target.textContent = g?'Aktif':'Mati'; show(cur); };
  $('#tR').onclick = () => { try{ Object.keys(localStorage).filter(k=>k.startsWith('dnatomat-')).forEach(k=>localStorage.removeItem(k)); }catch(e){} L = freshLab(); K3 = new Set(); goalN = 0; flowN = 0; qi = 0; qres = []; closeDlg(); show(1); toast('Semua kemajuan dihapus.'); };
};

/* ---------------- PWA ---------------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')){ try{ navigator.serviceWorker.register('sw.js').catch(()=>{}); }catch(e){} }

document.body.classList.toggle('noanim', reduce);
const m = location.hash.match(/^#s(\d+)$/);
show(m ? +m[1] : 1, true);
})();
