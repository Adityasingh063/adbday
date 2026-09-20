(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const S = Object.assign({}, CONFIG, { songs: Object.assign({}, CONFIG.songs), photos: CONFIG.photos.slice(), cards: CONFIG.cards.slice() });
const fill = t => String(t).replace(/\{name\}/g, S.herName).replace(/\{from\}/g, S.fromName);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ICONS = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2L12 19.5l-2.2-6.3L3.5 11l6.3-2.2z"/><path d="M19 3v4M17 5h4"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>',
  flower: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.2"/>' + [0, 72, 144, 216, 288].map(a => `<ellipse cx="12" cy="6.4" rx="2.3" ry="3.5" transform="rotate(${a} 12 12)"/>`).join('') + '</svg>',
  infinity: '<svg viewBox="0 0 24 24"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.739-8z"/></svg>'
};

/* =====================================================
   MUSIC  (built-in synthesised tunes, or your own files)
   ===================================================== */
const Music = (() => {
  let ctx = null, master = null, delay = null, muted = false, started = false, curKey = null, cur = null;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp); comp.connect(ctx.destination);
    delay = ctx.createDelay(1); delay.delayTime.value = 0.33;
    const fb = ctx.createGain(); fb.gain.value = 0.34;
    const wet = ctx.createGain(); wet.gain.value = 0.3;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
  }

  // music-box voice
  function bell(out, f, t, d, v) {
    [[1, 1], [2.01, 0.3], [4.13, 0.1]].forEach(([r, g]) => {
      const o = ctx.createOscillator(), e = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * r;
      e.gain.setValueAtTime(0, t);
      e.gain.linearRampToValueAtTime(v * g, t + 0.006);
      e.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      o.connect(e); e.connect(out); o.start(t); o.stop(t + 1.6);
    });
  }
  // warm electric-piano voice
  function keys(out, f, t, d, v) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain(), e = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2; g2.gain.value = 0.22;
    lp.type = 'lowpass'; lp.frequency.value = 2000;
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(e); e.connect(out);
    e.gain.setValueAtTime(0, t);
    e.gain.linearRampToValueAtTime(v, t + 0.02);
    e.gain.exponentialRampToValueAtTime(0.0001, t + d + 1.1);
    o.start(t); o2.start(t); o.stop(t + d + 1.2); o2.stop(t + d + 1.2);
  }

  // ---- Track 1: a gentle music-box "Happy Birthday" waltz ----
  function buildBirthday() {
    const mel = [
      [67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
      [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
      [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
      [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 2]
    ];
    const ev = []; let b = 0;
    mel.forEach(([m, d]) => { ev.push([b, m, d, 0.5]); b += d; });
    // waltz accompaniment: root then two chord tones, per 3-beat bar
    const bars = [[48, 52, 55], [43, 50, 55], [48, 52, 55], [43, 50, 55], [48, 52, 55], [43, 50, 55], [41, 53, 57], [48, 52, 55]];
    bars.forEach((c, i) => { ev.push([i * 3, c[0], 1, 0.34]); ev.push([i * 3 + 1, c[1] + 12, 1, 0.16]); ev.push([i * 3 + 2, c[2] + 12, 1, 0.16]); });
    return { bpm: 88, len: 27, inst: bell, events: ev };
  }
  // ---- Track 2: a slow, nostalgic loop (Am - F - C - G ...) ----
  function buildNostalgia() {
    const chords = { Am: [57, 60, 64, 69], F: [53, 57, 60, 65], C: [48, 55, 60, 64], G: [55, 59, 62, 67] };
    const prog = ['Am', 'F', 'C', 'G', 'F', 'C', 'G', 'Am'];
    const pat = [0, 1, 2, 3, 2, 1, 2, 1];
    const mel = [
      [76, 1.5], [72, .5], [74, 1], [72, 1],
      [69, 1.5], [72, .5], [77, 2],
      [76, 1], [74, 1], [72, 1], [67, 1],
      [74, 1.5], [71, .5], [67, 2],
      [72, 1], [77, 1.5], [76, .5], [72, 1],
      [76, 2], [72, 1], [67, 1],
      [74, 1.5], [71, .5], [74, 1], [79, 1],
      [76, 3], [null, 1]
    ];
    const ev = [];
    prog.forEach((n, bar) => pat.forEach((p, k) => ev.push([bar * 4 + k * 0.5, chords[n][p], 0.5, 0.2, 'a'])));
    let b = 0; mel.forEach(([m, d]) => { if (m) ev.push([b, m, d, 0.3, 'm']); b += d; });
    return { bpm: 66, len: 32, inst: keys, events: ev, crackle: true };
  }
  const DEFS = {};

  function crackleNode(g) {
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() < 0.00022 ? (Math.random() * 2 - 1) * 0.9 : 0) + (Math.random() * 2 - 1) * 0.004;
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1400;
    const gg = ctx.createGain(); gg.gain.value = 0.9;
    s.connect(hp); hp.connect(gg); gg.connect(g); s.start();
    return s;
  }

  function startSynth(which) {
    const def = DEFS[which] || (DEFS[which] = which === 'wishes' ? buildBirthday() : buildNostalgia());
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 1.4);
    g.connect(master); g.connect(delay);
    const rec = { type: 'synth', g, timer: null, extra: [], stopped: false };
    const spb = 60 / def.bpm;
    let t0 = ctx.currentTime + 0.2;
    const loop = () => {
      if (rec.stopped) return;
      if (ctx.state !== 'running') { rec.timer = setTimeout(loop, 500); return; }
      def.events.forEach(ev => def.inst(g, mtof(ev[1]), t0 + ev[0] * spb, ev[2] * spb, ev[3]));
      t0 += def.len * spb;
      rec.timer = setTimeout(loop, Math.max(300, (t0 - ctx.currentTime - 1.5) * 1000));
    };
    loop();
    if (def.crackle) { const cg = ctx.createGain(); cg.gain.value = 0.05; cg.connect(g); rec.extra.push(crackleNode(cg)); }
    return rec;
  }

  function fadeAudio(a, to, ms, then) {
    const from = a.volume, t0 = performance.now();
    clearInterval(a._f);
    a._f = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) { clearInterval(a._f); if (then) then(); }
    }, 50);
  }
  function startFile(src, key) {
    const a = new Audio(src); a.loop = true; a.volume = 0; a.muted = muted;
    a.addEventListener('error', () => {      // song file missing/unplayable -> use the built-in melody
      if (cur && cur.a === a) { cur = ctx ? startSynth(key === 'wishes' ? 'wishes' : 'album') : null; }
    });
    const p = a.play(); if (p && p.catch) p.catch(() => {});
    fadeAudio(a, 0.8, 1400);
    return { type: 'file', a, timer: null };
  }

  function stopRec(rec) {
    if (!rec) return;
    rec.stopped = true; clearTimeout(rec.timer);
    if (rec.type === 'synth') {
      const now = ctx.currentTime;
      rec.g.gain.cancelScheduledValues(now);
      rec.g.gain.setValueAtTime(rec.g.gain.value, now);
      rec.g.gain.linearRampToValueAtTime(0, now + 1.0);
      setTimeout(() => { try { rec.extra.forEach(n => { try { n.stop(); } catch (e) {} }); rec.g.disconnect(); } catch (e) {} }, 1300);
    } else {
      fadeAudio(rec.a, 0, 900, () => rec.a.pause());
    }
  }

  function play(key) {
    if (!started || key === curKey) return;
    stopRec(cur); cur = null; curKey = key;
    const src = S.songs[key];
    if (src) cur = startFile(src, key);
    else if (ctx) cur = startSynth(key === 'wishes' ? 'wishes' : 'album');
  }
  function begin(key) { started = true; init(); play(key); }
  function reset(key) { stopRec(cur); cur = null; curKey = null; play(key); }
  function toggle() {
    muted = !muted;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.05);
    if (cur && cur.type === 'file') cur.a.muted = muted;
    $('#mus').classList.toggle('muted', muted);
  }
  document.addEventListener('visibilitychange', () => {
    if (!started) return;
    if (document.hidden) { if (ctx) ctx.suspend(); if (cur && cur.type === 'file') cur.a.pause(); }
    else { if (ctx) ctx.resume(); if (cur && cur.type === 'file' && !muted) { const p = cur.a.play(); if (p && p.catch) p.catch(() => {}); } }
  });
  return { begin, play, reset, toggle };
})();

/* =====================================================
   PARTICLES : floating hearts, petals, confetti
   ===================================================== */
const cvs = $('#fx'), g2d = cvs.getContext('2d');
let W = 0, H = 0, DPR = 1, parts = [], spawnAcc = 0;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  cvs.width = W * DPR; cvs.height = H * DPR;
  g2d.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize); resize();
const PINKS = ['#ff7da3', '#ff9fbb', '#ffc2d4', '#ffffff', '#ffd9a8', '#f7b2e8'];
const CONF = ['#ff6b95', '#ffd166', '#ffffff', '#9ad0ff', '#c79bff', '#7ee0b0'];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
function addPart(p) { if (parts.length < 240) parts.push(p); }
function burst(x, y, n, kind) {
  if (RM) n = Math.ceil(n / 4);
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), sp = rnd(120, kind === 'heart' ? 340 : 560);
    addPart({ shape: kind === 'heart' ? 'heart' : (Math.random() < .5 ? 'rect' : 'petal'), x, y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === 'heart' ? 160 : 260), g: kind === 'heart' ? 240 : 640, drag: 1.4,
      rot: rnd(0, 6.28), vr: rnd(-7, 7), s: kind === 'heart' ? rnd(9, 20) : rnd(6, 12), color: kind === 'heart' ? pick(PINKS) : pick(CONF), life: 0, max: rnd(1.8, 3), sway: 0, ph: 0 });
  }
}
function floatStep(dt) {
  spawnAcc += dt;
  if (spawnAcc < 0.5) return; spawnAcc = 0;
  if (Math.random() < 0.6) addPart({ shape: 'heart', x: rnd(0, W), y: H + 20, vx: 0, vy: -rnd(40, 90), g: 0, drag: 0, rot: 0, vr: 0, s: rnd(8, 18), color: pick(PINKS), life: 0, max: H / 55, sway: rnd(14, 34), ph: rnd(0, 6.28), a: rnd(.45, .85) });
  else addPart({ shape: 'petal', x: rnd(0, W), y: -20, vx: 0, vy: rnd(35, 75), g: 0, drag: 0, rot: rnd(0, 6.28), vr: rnd(-2, 2), s: rnd(8, 14), color: pick(['#ffc2d4', '#ffb0c8', '#ffe3ea']), life: 0, max: H / 45, sway: rnd(20, 44), ph: rnd(0, 6.28), a: .8 });
}
function drawPart(p) {
  const fade = Math.min(1, (p.max - p.life) / 0.7) * (p.a || 1);
  g2d.save(); g2d.globalAlpha = Math.max(0, fade); g2d.translate(p.x, p.y); g2d.rotate(p.rot); g2d.fillStyle = p.color;
  const s = p.s;
  if (p.shape === 'heart') {
    g2d.beginPath(); g2d.moveTo(0, s * .35);
    g2d.bezierCurveTo(s * .95, -s * .3, s * .5, -s * .95, 0, -s * .4);
    g2d.bezierCurveTo(-s * .5, -s * .95, -s * .95, -s * .3, 0, s * .35); g2d.fill();
  } else if (p.shape === 'petal') {
    g2d.beginPath(); g2d.ellipse(0, 0, s * .45, s * .9, 0, 0, 6.283); g2d.fill();
  } else { g2d.fillRect(-s / 2, -s / 4, s, s / 2); }
  g2d.restore();
}
function fxStep(dt, page, started) {
  if (started && page === 0 && !RM) floatStep(dt);
  if (!parts.length) return;
  g2d.clearRect(0, 0, W, H);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life += dt;
    if (p.life > p.max || p.y > H + 40 || p.y < -60) { parts.splice(i, 1); continue; }
    p.vx *= (1 - p.drag * dt); p.vy += p.g * dt;
    p.x += p.vx * dt + (p.sway ? Math.cos(p.life * 1.4 + p.ph) * p.sway * dt : 0);
    p.y += p.vy * dt; p.rot += p.vr * dt;
    drawPart(p);
  }
  if (!parts.length) g2d.clearRect(0, 0, W, H);
}

/* =====================================================
   RENDER : page 1
   ===================================================== */
function renderHero() {
  const bg = $('#heroBg');
  bg.classList.add('nophoto'); bg.style.backgroundImage = '';
  if (S.heroPhoto) {                       // only use the photo if the file really loads
    const im = new Image();
    im.onload = () => { bg.classList.remove('nophoto'); bg.style.backgroundImage = `url("${S.heroPhoto}")`; };
    im.src = S.heroPhoto;
  }
  $('#herName').textContent = S.herName;
  $('#gateName').textContent = S.herName;
  $('#wishLine').textContent = fill(S.wishLine);
  document.title = 'Happy Birthday, ' + S.herName;
}
function makeBokeh() {
  const box = $('#bokeh');
  for (let i = 0; i < 14; i++) {
    const d = document.createElement('i'), s = rnd(40, 140);
    d.style.cssText = `left:${rnd(0, 100)}%;top:${rnd(0, 100)}%;width:${s}px;height:${s}px;animation-duration:${rnd(9, 19)}s;animation-delay:${-rnd(0, 12)}s;opacity:${rnd(.1, .32)}`;
    box.appendChild(d);
  }
}
const opened = new Set();
function renderCards() {
  const box = $('#cards'); box.innerHTML = ''; opened.clear(); $('#done').hidden = true;
  S.cards.forEach((c, i) => {
    const w = document.createElement('div'); w.className = 'float'; w.style.setProperty('--i', i);
    w.innerHTML = `<button class="card" type="button" data-i="${i}" aria-label="Open the card: ${esc(c.title)}"><span class="ico">${ICONS[c.icon] || ICONS.heart}</span><span class="ct">${esc(c.title)}</span><span class="tap">tap to open</span><span class="dot" aria-hidden="true">${ICONS.heart}</span></button>`;
    box.appendChild(w);
  });
}
/* letter typing */
let typeTimer = null, typeState = null;
function typeText(el, text) {
  clearInterval(typeTimer);
  const a = document.createElement('span'), b = document.createElement('span');
  b.style.opacity = '0'; b.textContent = text; el.textContent = ''; el.append(a, b);
  typeState = { a, b, text, i: 0 };
  $('#letterSign').classList.remove('show'); $('#letterSkip').hidden = false;
  typeTimer = setInterval(() => {
    typeState.i += 2;
    if (typeState.i >= text.length) return finishTyping();
    a.textContent = text.slice(0, typeState.i); b.textContent = text.slice(typeState.i);
  }, 30);
}
function finishTyping() {
  clearInterval(typeTimer); typeTimer = null;
  if (typeState) { typeState.a.textContent = typeState.text; typeState.b.textContent = ''; typeState = null; }
  $('#letterSign').classList.add('show'); $('#letterSkip').hidden = true;
}
let lastCard = null;
function openLetter(i, btn) {
  const c = S.cards[i], m = $('#letter');
  $('#letterTitle').textContent = c.title;
  $('#letterSign').textContent = '\u2014 ' + S.fromName;
  m.hidden = false; requestAnimationFrame(() => m.classList.add('show'));
  typeText($('#letterText'), fill(c.text));
  const r = btn.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 26, 'heart');
  opened.add(i); btn.classList.add('opened'); lastCard = btn;
}
function closeLetter() {
  const m = $('#letter'); if (m.hidden) return;
  finishTyping(); m.classList.remove('show'); setTimeout(() => { if (!m.classList.contains('show')) m.hidden = true; }, 350);
  if (lastCard) lastCard.focus({ preventScroll: true });
  if (opened.size === S.cards.length && $('#done').hidden) {
    setTimeout(() => {
      $('#done').hidden = false;
      $('#done').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
      burst(W / 2, H * .45, 90, 'confetti');
    }, 450);
  }
}

/* =====================================================
   RENDER : page 2 (album)
   ===================================================== */
function placeholder(i) {
  const pal = [['#f6c1c9', '#e9967a'], ['#f3d6a4', '#d98f6b'], ['#cfb8d9', '#e79ab0'], ['#b9d3c8', '#e6c79c'], ['#f0b7a4', '#c98fa6'], ['#d9c3a5', '#a97b7b'], ['#f4c9d8', '#b79bd0'], ['#e8cfa6', '#c98b7b']][i % 8];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${pal[0]}'/><stop offset='1' stop-color='${pal[1]}'/></linearGradient></defs><rect width='400' height='500' fill='url(#g)'/><g transform='translate(140 130) scale(5)'><path d='M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z' fill='rgba(255,255,255,.8)'/></g><text x='200' y='400' text-anchor='middle' font-family='Georgia,serif' font-style='italic' font-size='26' fill='rgba(255,255,255,.92)'>your photo here</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
const album = $('#album'), track = $('#track');
let albumItems = [];
const ROT = [-3.2, 2.4, -1.6, 3.1, -2.4, 1.4, -2.8, 2];
const OFS = [-7, 6, -3, 8, -8, 4, -5, 7];
function renderAlbum() {
  const list = S.photos.map((p, i) => ({ src: p.src || placeholder(i), caption: p.caption || '', date: p.date || '' }));
  let base = []; while (base.length < 6) base = base.concat(list);
  albumItems = base;
  const copy = dup => {
    let h = '<div class="gap"></div>';
    base.forEach((p, i) => {
      h += `<figure class="pol" data-i="${i}" style="--r:${ROT[i % ROT.length]}deg;--x:${OFS[i % OFS.length]}%"${dup ? ' aria-hidden="true"' : ''}><span class="tape"></span><div class="frame"><img src="${esc(p.src)}" alt="${esc(p.caption)}" draggable="false"></div><figcaption><span class="cap">${esc(p.caption)}</span><span class="date">${esc(p.date)}</span></figcaption></figure>`;
      if (i % 3 === 2) h += `<div class="note" style="--r:${ROT[(i + 3) % ROT.length] / 1.6}deg"${dup ? ' aria-hidden="true"' : ''}>${esc(S.notes[Math.floor(i / 3) % S.notes.length])}</div>`;
    });
    return h;
  };
  track.innerHTML = copy(false) + copy(true);
  $$('img', track).forEach(img => img.addEventListener('error', () => {   // missing file -> placeholder polaroid
    const idx = +img.closest('.pol').dataset.i, ph = placeholder(idx);
    if (albumItems[idx]) albumItems[idx].src = ph;
    img.src = ph;
  }, { once: true }));
  album.scrollTop = 2; lastAssigned = album.scrollTop; pos = lastAssigned;
}
let pos = 0, lastAssigned = 0, pausedUntil = 0, holding = false, hoverPol = false, lbOpen = false;
const SPEED = 38;
function pauseFor(ms) { pausedUntil = performance.now() + ms; }
album.addEventListener('pointerdown', () => { holding = true; });
['pointerup', 'pointercancel'].forEach(ev => album.addEventListener(ev, () => { holding = false; pauseFor(2500); }));
album.addEventListener('wheel', () => pauseFor(2500), { passive: true });
album.addEventListener('pointerover', e => { if (e.pointerType === 'mouse') hoverPol = !!e.target.closest('.pol'); });
album.addEventListener('pointerleave', () => { hoverPol = false; });
album.addEventListener('scroll', () => {
  const half = track.scrollHeight / 2;
  if (album.scrollTop >= half) { album.scrollTop -= half; pos = lastAssigned = album.scrollTop; }
  else if (album.scrollTop <= 0) { album.scrollTop += half; pos = lastAssigned = album.scrollTop; }
}, { passive: true });
function albumStep(dt, now) {
  if (lbOpen) return;
  if (holding || hoverPol || now < pausedUntil) { pos = album.scrollTop; lastAssigned = pos; return; }
  if (Math.abs(album.scrollTop - lastAssigned) > 1.5) { pauseFor(1600); pos = album.scrollTop; lastAssigned = pos; return; }
  const half = track.scrollHeight / 2;
  pos += SPEED * dt; if (half > 0 && pos >= half) pos -= half;
  album.scrollTop = pos; lastAssigned = album.scrollTop;
}
track.addEventListener('click', e => {
  const f = e.target.closest('.pol'); if (!f) return;
  const p = albumItems[+f.dataset.i]; if (!p) return;
  $('#lbImg').src = p.src; $('#lbImg').alt = p.caption; $('#lbCap').textContent = p.caption; $('#lbDate').textContent = p.date;
  const m = $('#lb'); m.hidden = false; lbOpen = true; requestAnimationFrame(() => m.classList.add('show'));
});
function closeLightbox() {
  const m = $('#lb'); if (m.hidden) return;
  m.classList.remove('show'); lbOpen = false; pauseFor(1200); setTimeout(() => { if (!m.classList.contains('show')) m.hidden = true; }, 350);
}
$('#lb').addEventListener('click', closeLightbox);

/* =====================================================
   RENDER : page 3 (time together)
   ===================================================== */
const NUMS = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
function buildClock() {
  let h = '<circle class="face" r="194"/><circle class="ring" r="186"/><circle class="ring" r="112"/>';
  for (let i = 0; i < 60; i++) {
    const big = i % 5 === 0;
    h += `<line class="${big ? 'tkl' : 'tk'}" x1="0" y1="-178" x2="0" y2="${big ? -160 : -169}" transform="rotate(${i * 6})"/>`;
  }
  NUMS.forEach((n, i) => { const a = i * Math.PI / 6; h += `<text x="${(Math.sin(a) * 138).toFixed(1)}" y="${(-Math.cos(a) * 138).toFixed(1)}">${n}</text>`; });
  h += '<g class="h" id="hHour"><line x1="0" y1="14" x2="0" y2="-88"/></g>';
  h += '<g class="h" id="hMin"><line x1="0" y1="18" x2="0" y2="-128"/></g>';
  h += '<g class="h" id="hSec"><line x1="0" y1="26" x2="0" y2="-150"/></g>';
  h += '<circle class="hub" r="7"/><g transform="translate(-12 34)"><path class="heart" d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></g>';
  $('#bigclock').innerHTML = h;
}
function makeSky() {
  const sky = $('#sky');
  for (let i = 0; i < 70; i++) {
    const d = document.createElement('i'), s = rnd(1, 3);
    d.style.cssText = `left:${rnd(0, 100)}%;top:${rnd(0, 100)}%;width:${s}px;height:${s}px;animation-duration:${rnd(2, 6)}s;animation-delay:${-rnd(0, 6)}s`;
    sky.appendChild(d);
  }
}
const UNITS = [['years', 'years'], ['months', 'months'], ['days', 'days'], ['hours', 'hours'], ['minutes', 'minutes'], ['seconds', 'seconds']];
let unitEls = {}, totEls = {};
function renderTogether() {
  const u = $('#units'); u.innerHTML = ''; unitEls = {};
  UNITS.forEach(([k, label]) => {
    const d = document.createElement('div'); d.className = 'unit' + (k === 'seconds' ? ' sec' : '');
    d.innerHTML = `<b>0</b><span>${label}</span>`; u.appendChild(d); unitEls[k] = d;
  });
  const t = $('#totals'); t.innerHTML = ''; totEls = {};
  [['days', 'days'], ['hours', 'hours'], ['minutes', 'minutes'], ['seconds', 'seconds']].forEach(([k, label]) => {
    const s = document.createElement('span'); s.innerHTML = `<b>0</b> ${label}`; t.appendChild(s); totEls[k] = s.firstChild;
  });
  const st = new Date(S.startDate);
  $('#since').textContent = isFinite(st) ? 'since ' + st.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ', and still counting' : 'and still counting';
  $('#closing').textContent = fill(S.closing);
  lastSec = -1;
}
function calDiff(a, b) {
  let Y = b.getFullYear() - a.getFullYear(), M = b.getMonth() - a.getMonth(), D = b.getDate() - a.getDate(),
      h = b.getHours() - a.getHours(), m = b.getMinutes() - a.getMinutes(), s = b.getSeconds() - a.getSeconds();
  if (s < 0) { s += 60; m--; }
  if (m < 0) { m += 60; h--; }
  if (h < 0) { h += 24; D--; }
  if (D < 0) { D += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); M--; }
  if (M < 0) { M += 12; Y--; }
  return { years: Y, months: M, days: D, hours: h, minutes: m, seconds: s };
}
let lastSec = -1;
const pad = n => String(n).padStart(2, '0');
function clockStep() {
  const start = new Date(S.startDate), ok = isFinite(start), nowMs = Date.now();
  const diff = ok ? Math.max(0, nowMs - start.getTime()) : 0;
  const sF = (diff / 1000) % 60, mF = (diff / 60000) % 60, hF = (diff / 3600000) % 12;
  $('#hSec').setAttribute('transform', `rotate(${sF * 6})`);
  $('#hMin').setAttribute('transform', `rotate(${mF * 6})`);
  $('#hHour').setAttribute('transform', `rotate(${hF * 30})`);
  const sec = Math.floor(diff / 1000);
  if (sec === lastSec) return; lastSec = sec;
  const d = ok && diff > 0 ? calDiff(start, new Date(nowMs)) : { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  UNITS.forEach(([k]) => {
    const txt = (k === 'hours' || k === 'minutes' || k === 'seconds') ? pad(d[k]) : String(d[k]);
    const b = unitEls[k].firstChild;
    if (b.textContent !== txt) { b.textContent = txt; unitEls[k].classList.remove('pulse'); void unitEls[k].offsetWidth; if (k === 'seconds') unitEls[k].classList.add('pulse'); }
  });
  totEls.days.textContent = Math.floor(diff / 86400000).toLocaleString();
  totEls.hours.textContent = Math.floor(diff / 3600000).toLocaleString();
  totEls.minutes.textContent = Math.floor(diff / 60000).toLocaleString();
  totEls.seconds.textContent = sec.toLocaleString();
}

/* =====================================================
   NAVIGATION
   ===================================================== */
const pages = $$('.page');
let cur = -1, started = false;
const trackFor = i => i === 0 ? 'wishes' : (i === 2 && S.songs.together ? 'together' : 'album');
function go(i) {
  i = Math.max(0, Math.min(pages.length - 1, i));
  if (i === cur) return;
  pages.forEach((p, k) => { p.classList.toggle('active', k === i); p.classList.toggle('before', k < i); });
  $$('#dock [data-go]').forEach(b => { const on = +b.dataset.go === i; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  document.body.dataset.page = i; cur = i;
  Music.play(trackFor(i));
  if (i === 1) { $('#tip').classList.remove('off'); setTimeout(() => $('#tip').classList.add('off'), 6500); }
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go]'); if (t) { go(+t.dataset.go); return; }
  const c = e.target.closest('.card'); if (c) { openLetter(+c.dataset.i, c); return; }
});
$('#mus').addEventListener('click', () => Music.toggle());
$('#replay').addEventListener('click', () => { go(0); burst(W / 2, H * .4, 110, 'confetti'); });
$('#letterX').addEventListener('click', closeLetter);
$('#letter').addEventListener('click', e => { if (e.target.id === 'letter') closeLetter(); else if (typeState) finishTyping(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLetter(); closeLightbox(); return; }
  if (!started || !$('#letter').hidden || !$('#lb').hidden) return;
  if (e.key === 'ArrowRight') go(cur + 1); else if (e.key === 'ArrowLeft') go(cur - 1);
});
let tx = 0, ty = 0;
$('#app').addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
$('#app').addEventListener('touchend', e => {
  if (!started || !$('#letter').hidden || !$('#lb').hidden) return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.6) go(cur + (dx < 0 ? 1 : -1));
}, { passive: true });

/* ---------- opening the envelope ---------- */
function openGate() {
  if (started) return; started = true;
  const gate = $('#gate');
  gate.classList.add('opening');
  Music.begin(trackFor(cur < 0 ? 0 : cur));
  setTimeout(() => burst(W / 2, H * .5, 120, 'confetti'), 650);
  setTimeout(() => burst(W / 2, H * .5, 40, 'heart'), 900);
  setTimeout(() => gate.classList.add('gone'), 1100);
}
$('#openBtn').addEventListener('click', openGate);
$('#openBtn').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGate(); } });

/* ---------- boot ---------- */
function renderAll() { renderHero(); renderCards(); renderAlbum(); renderTogether(); }
makeBokeh(); makeSky(); buildClock(); renderAll(); go(0);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  fxStep(dt, cur, started);
  if (cur === 1) albumStep(dt, now);
  if (cur === 2) clockStep();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
