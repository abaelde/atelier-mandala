/* app.js — logique de l'Atelier Mandala */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const WHITE = '#FFFFFF';
  const INK = '#2E2A36';
  const KEY = 'atelier-mandala-v2';
  const $ = id => document.getElementById(id);

  const CRAYONS = [
    ['#E5322D', 'rouge'], ['#F26B1D', 'orange'], ['#F9A825', 'orange doré'], ['#FFE135', 'jaune'],
    ['#B5D92B', 'vert citron'], ['#3DB54A', 'vert'], ['#1E7A3E', 'vert sapin'], ['#18A79A', 'turquoise'],
    ['#4FC3F7', 'bleu ciel'], ['#2979FF', 'bleu'], ['#283593', 'bleu marine'], ['#7E57C2', 'violet'],
    ['#9C27B0', 'prune'], ['#E040FB', 'fuchsia'], ['#F06292', 'rose'], ['#F8BBD0', 'rose pâle'],
    ['#FFCCBC', 'pêche'], ['#8D5524', 'marron'], ['#D2A679', 'beige'], ['#9E9E9E', 'gris'],
    ['#424242', 'gris foncé'], ['#111111', 'noir'], [WHITE, 'blanc (gomme)'],
  ];
  const SKIN = ['#FFE7D1', '#FFD6B8', '#F5C29B', '#E0AC69', '#C68642', '#A0632F', '#8D5524', '#5C3A21', '#3B2314'];
  const BRUSHES = [0.012, 0.024, 0.045];

  const app = $('app'), palette = $('palette'), dot = $('dot'), stage = $('stage'), board = $('board');
  const mandalaSvg = $('mandala'), drawSvg = $('drawing'), canvas = $('paper'), ctx = canvas.getContext('2d');
  const undoBtn = $('undoBtn'), newBtn = $('newBtn'), pickBtn = $('pickBtn'), clearBtn = $('clearBtn'), saveBtn = $('saveBtn');
  const hint = $('hint'), brushBox = $('brushes');

  // ================= état =================
  let mode = 'mandala';
  let current = CRAYONS[0][0];
  let custom = [];           // couleurs choisies dans la grande grille
  let brushIdx = 1;
  let seed = Date.now() % 1e9;
  let fillHistory = [];      // annuler (mandala)
  let drawHistory = [];      // annuler (dessins)
  let strokes = [];          // dessin libre
  let live = null;
  let drawingId = null;
  let drawingFills = {};     // id du dessin -> couleurs de chaque zone

  // ================= palette =================
  function hsl(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const c = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [c(0), c(8), c(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  function swatch(hex, name, extraClass) {
    const b = document.createElement('button');
    b.className = 'swatch' + (hex === WHITE ? ' white' : '') + (extraClass ? ' ' + extraClass : '');
    b.style.setProperty('--c', hex);
    b.setAttribute('aria-label', name || hex);
    b.dataset.hex = hex;
    b.addEventListener('click', () => selectColor(hex));
    return b;
  }
  function buildPalette() {
    palette.innerHTML = '';
    const more = document.createElement('button');
    more.className = 'more'; more.id = 'moreBtn'; more.textContent = '+'; more.setAttribute('aria-label', 'Plus de couleurs');
    more.addEventListener('click', () => openModal('colorsModal'));
    palette.appendChild(more);
    custom.forEach(hex => palette.appendChild(swatch(hex, 'couleur choisie', 'custom')));
    CRAYONS.forEach(([hex, name]) => palette.appendChild(swatch(hex, name)));
    markSelected();
  }
  function markSelected() {
    palette.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s.dataset.hex === current));
  }
  function selectColor(hex) {
    current = hex.toUpperCase();
    dot.style.setProperty('--current', current);
    markSelected();
    save();
  }
  function buildColorGrid() {
    const grid = $('colorGrid');
    grid.innerHTML = '';
    const row = (colors, label) => {
      const r = document.createElement('div'); r.className = 'crow';
      const l = document.createElement('span'); l.className = 'clabel'; l.textContent = label; r.appendChild(l);
      colors.forEach(hex => {
        const b = document.createElement('button'); b.className = 'cell'; b.style.background = hex; b.setAttribute('aria-label', hex);
        b.addEventListener('click', () => {
          if (!CRAYONS.some(c => c[0] === hex)) { custom = [hex, ...custom.filter(c => c !== hex)].slice(0, 4); }
          selectColor(hex); buildPalette(); closeModal('colorsModal');
        });
        r.appendChild(b);
      });
      grid.appendChild(r);
    };
    const hues = [['rouges', 0], ['oranges', 25], ['jaunes', 50], ['verts', 95], ['verts d\'eau', 150], ['turquoises', 175], ['bleus', 205], ['bleus foncés', 230], ['violets', 265], ['roses', 300], ['fuchsias', 330]];
    hues.forEach(([label, h]) => row([94, 84, 72, 60, 48, 36, 24].map(l => hsl(h, 85, l)), label));
    row(SKIN, 'peaux');
    row([WHITE, '#F2F2F2', '#DADADA', '#BDBDBD', '#9E9E9E', '#757575', '#4F4F4F', '#2B2B2B', '#000000'], 'gris');
    row(['#FFF3C4', '#F8E1A1', '#E6B96A', '#C89B5A', '#A57A45', '#7C5A34', '#5B4025'], 'sables');
  }

  // ================= modales =================
  function openModal(id) { $(id).hidden = false; }
  function closeModal(id) { $(id).hidden = true; }
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(b.dataset.close)));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.hidden = true; }));

  // ================= plateau =================
  function fit() {
    const cs = getComputedStyle(stage);
    const w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const h = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const size = Math.max(200, Math.min(w, h));
    board.style.width = size + 'px'; board.style.height = size + 'px';
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr);
    redrawStrokes();
  }
  new ResizeObserver(fit).observe(stage);

  // ================= rendu SVG générique =================
  function renderElems(svg, elems) {
    svg.innerHTML = '';
    const build = (list, parent) => {
      for (const e of list) {
        const n = document.createElementNS(NS, e.t);
        for (const k in e.a) n.setAttribute(k, e.a[k]);
        if (e.t === 'g') { build(e.children, n); }
        else if (e.decor) { n.classList.add('decor'); if (e.dark) n.classList.add('dark'); if (e.text != null) n.textContent = e.text; }
        else n.classList.add('region');
        parent.appendChild(n);
      }
    };
    build(elems, svg);
  }
  const regionsOf = svg => Array.from(svg.querySelectorAll('.region'));
  const fillsOf = svg => regionsOf(svg).map(el => el.dataset.color || WHITE);
  function applyFills(svg, arr) {
    if (!arr) return;
    regionsOf(svg).forEach((el, i) => { const c = arr[i] || WHITE; el.dataset.color = c; el.style.fill = c; });
  }

  // ================= générateur de mandala =================
  function rng(s0) { let s = s0 >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const polar = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
  const f = n => +n.toFixed(2);
  function annularSector(r0, r1, a0, a1) {
    const [x0, y0] = polar(r0, a0), [x1, y1] = polar(r1, a0), [x2, y2] = polar(r1, a1), [x3, y3] = polar(r0, a1);
    const large = (a1 - a0) > Math.PI ? 1 : 0;
    return `M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)} A${f(r1)} ${f(r1)} 0 ${large} 1 ${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} A${f(r0)} ${f(r0)} 0 ${large} 0 ${f(x0)} ${f(y0)} Z`;
  }
  function petal(r0, r1, aMid, spread) {
    const pad = (r1 - r0) * 0.08, rm = (r0 + r1) / 2;
    const [xa, ya] = polar(r0 + pad, aMid), [xb, yb] = polar(r1 - pad, aMid);
    const [c1x, c1y] = polar(rm, aMid - spread), [c2x, c2y] = polar(rm, aMid + spread);
    return `M${f(xa)} ${f(ya)} Q${f(c1x)} ${f(c1y)} ${f(xb)} ${f(yb)} Q${f(c2x)} ${f(c2y)} ${f(xa)} ${f(ya)} Z`;
  }
  function makeMandala(seedValue) {
    const rand = rng(seedValue);
    const pick = arr => arr[Math.floor(rand() * arr.length)];
    const R = 97, n = pick([8, 10, 12, 12, 16]);
    const ringCount = 4 + Math.floor(rand() * 3);
    const centerR = 9 + rand() * 6;
    const weights = Array.from({ length: ringCount }, () => 0.6 + rand() * 1.2);
    const total = weights.reduce((a, b) => a + b, 0);
    const avail = R - centerR;
    const parts = [{ type: 'center', kind: pick(['circle', 'circle', 'star', 'heart', 'flower']), r: centerR }];
    let r = centerR;
    weights.forEach((w, i) => {
      const r0 = r, r1 = r + avail * w / total; r = r1;
      const type = i === 0 ? pick(['petals', 'sectors', 'dots', 'hearts'])
        : pick(['sectors', 'petals', 'dots', 'spikes', 'petals', 'split', 'stars', 'hearts', 'diamonds', 'scallops']);
      const count = n * pick([1, 1, 2]);
      const offset = (i % 2 ? 0.5 : 0) * (2 * Math.PI / count);
      parts.push({ type, r0, r1, count, offset });
    });
    return parts;
  }
  function mandalaElems(parts) {
    const E = [];
    const region = (t, a) => E.push({ t, a });
    for (const p of parts) {
      if (p.type === 'center') {
        region('circle', { cx: 0, cy: 0, r: f(p.r) });
        if (p.kind === 'star') E.push(Kit.star(0, 0, p.r * 0.8));
        if (p.kind === 'heart') E.push(Kit.heart(0, 1, p.r * 0.6));
        if (p.kind === 'flower') E.push(...Kit.flower(0, 0, p.r * 0.45));
        continue;
      }
      const step = 2 * Math.PI / p.count;
      for (let k = 0; k < p.count; k++) {
        const a0 = p.offset + k * step, a1 = a0 + step;
        if (p.type === 'split') {
          const rm = (p.r0 + p.r1) / 2;
          region('path', { d: annularSector(p.r0, rm, a0, a1) });
          region('path', { d: annularSector(rm, p.r1, a0 + step / 2, a1 + step / 2) });
        } else region('path', { d: annularSector(p.r0, p.r1, a0, a1) });
      }
      for (let k = 0; k < p.count; k++) {
        const a0 = p.offset + k * step, a1 = a0 + step, am = a0 + step / 2;
        const rm = (p.r0 + p.r1) / 2, [cx, cy] = polar(rm, am);
        const size = Math.min((p.r1 - p.r0) * 0.36, rm * Math.sin(step / 2) * 0.75);
        const deg = am * 180 / Math.PI + 90;
        if (p.type === 'petals') region('path', { d: petal(p.r0, p.r1, am, step * 0.85) });
        if (p.type === 'dots') region('circle', { cx: f(cx), cy: f(cy), r: f(size * 0.9) });
        if (p.type === 'spikes') {
          const [x0, y0] = polar(p.r0, a0), [x1, y1] = polar(p.r0, a1), [x2, y2] = polar(p.r1 - (p.r1 - p.r0) * 0.1, am);
          region('path', { d: `M${f(x0)} ${f(y0)} L${f(x2)} ${f(y2)} L${f(x1)} ${f(y1)} Z` });
        }
        if (p.type === 'stars') E.push(Kit.star(cx, cy, size, { transform: `rotate(${f(deg)} ${f(cx)} ${f(cy)})` }));
        if (p.type === 'hearts') E.push(Kit.heart(cx, cy, size * 0.85, { transform: `rotate(${f(deg + 180)} ${f(cx)} ${f(cy)})` }));
        if (p.type === 'diamonds') {
          const [x0, y0] = polar(p.r0 + (p.r1 - p.r0) * 0.1, am), [x2, y2] = polar(p.r1 - (p.r1 - p.r0) * 0.1, am);
          const [xl, yl] = polar(rm, am - step * 0.38), [xr, yr] = polar(rm, am + step * 0.38);
          region('polygon', { points: `${f(x0)},${f(y0)} ${f(xl)},${f(yl)} ${f(x2)},${f(y2)} ${f(xr)},${f(yr)}` });
        }
        if (p.type === 'scallops') {
          const [x0, y0] = polar(p.r0, a0), [x1, y1] = polar(p.r0, a1), [xc, yc] = polar(p.r1 - (p.r1 - p.r0) * 0.15, am);
          region('path', { d: `M${f(x0)} ${f(y0)} Q${f(xc * 1.25)} ${f(yc * 1.25)} ${f(x1)} ${f(y1)} Z` });
        }
      }
    }
    return E;
  }
  function newMandala() {
    seed = Math.floor(Math.random() * 1e9);
    renderElems(mandalaSvg, mandalaElems(makeMandala(seed)));
    fillHistory = []; updateUndo(); save();
  }

  // ================= dessins à colorier =================
  const ALL = Kit.CATALOG.flatMap(g => g.items);
  function loadDrawing(id, keepFills) {
    const item = ALL.find(d => d.id === id) || ALL[0];
    if (drawingId) drawingFills[drawingId] = fillsOf(drawSvg);
    drawingId = item.id;
    renderElems(drawSvg, item.make());
    const saved = drawingFills[item.id];
    if (keepFills !== false && saved && saved.length === regionsOf(drawSvg).length) applyFills(drawSvg, saved);
    $('drawingName').textContent = item.name;
    drawHistory = []; updateUndo(); save();
  }
  function buildGallery() {
    const box = $('gallery'); box.innerHTML = '';
    Kit.CATALOG.forEach(g => {
      const h = document.createElement('h3'); h.textContent = g.group; box.appendChild(h);
      const grid = document.createElement('div'); grid.className = 'ggrid';
      g.items.forEach(item => {
        const card = document.createElement('button'); card.className = 'gcard';
        const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 200 200');
        renderElems(svg, item.make());
        const lab = document.createElement('span'); lab.textContent = item.name;
        card.appendChild(svg); card.appendChild(lab);
        card.addEventListener('click', () => { loadDrawing(item.id); closeModal('galleryModal'); });
        grid.appendChild(card);
      });
      box.appendChild(grid);
    });
  }

  // ================= colorier : appuyer = colorier, rappuyer = enlever =================
  function paintRegion(el, history) {
    const prev = el.dataset.color || WHITE;
    const next = (prev === current || current === WHITE) ? WHITE : current;
    if (prev === next) return;
    history.push({ el, prev });
    el.dataset.color = next; el.style.fill = next;
    el.classList.remove('pop'); void el.getBBox(); el.classList.add('pop');
    updateUndo(); save();
  }
  function tapHandlers(svg, getHistory) {
    let tap = null;
    svg.addEventListener('pointerdown', e => { if (e.target.classList.contains('region')) tap = { x: e.clientX, y: e.clientY, t: e.target, id: e.pointerId }; });
    svg.addEventListener('pointerup', e => {
      if (!tap || e.pointerId !== tap.id) return;
      if (Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 14) paintRegion(tap.t, getHistory());
      tap = null;
    });
    svg.addEventListener('pointercancel', () => { tap = null; });
  }
  tapHandlers(mandalaSvg, () => fillHistory);
  tapHandlers(drawSvg, () => drawHistory);

  // ================= dessin libre =================
  const px = () => canvas.width;
  function setupCtx(color, w) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.lineWidth = w * px(); }
  function drawStroke(s) {
    setupCtx(s.color, s.w); const P = px();
    ctx.beginPath();
    if (s.points.length === 1) { ctx.arc(s.points[0][0] * P, s.points[0][1] * P, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fillStyle = s.color; ctx.fill(); return; }
    ctx.moveTo(s.points[0][0] * P, s.points[0][1] * P);
    for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i][0] * P, s.points[i][1] * P);
    ctx.stroke();
  }
  function redrawStrokes() { ctx.clearRect(0, 0, canvas.width, canvas.height); strokes.forEach(drawStroke); }
  function norm(e) { const r = canvas.getBoundingClientRect(); return [+((e.clientX - r.left) / r.width).toFixed(4), +((e.clientY - r.top) / r.height).toFixed(4)]; }
  canvas.addEventListener('pointerdown', e => {
    if (live) return;
    canvas.setPointerCapture(e.pointerId);
    live = { id: e.pointerId, color: current, w: BRUSHES[brushIdx], points: [norm(e)] };
    drawStroke(live);
  });
  canvas.addEventListener('pointermove', e => {
    if (!live || e.pointerId !== live.id) return;
    const evts = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    const P = px(); setupCtx(live.color, live.w);
    ctx.beginPath();
    const last = live.points[live.points.length - 1]; ctx.moveTo(last[0] * P, last[1] * P);
    for (const ev of evts) { const p = norm(ev); live.points.push(p); ctx.lineTo(p[0] * P, p[1] * P); }
    ctx.stroke();
  });
  function endStroke(e) { if (!live || e.pointerId !== live.id) return; strokes.push(live); live = null; updateUndo(); save(); }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  brushBox.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => setBrush(i)));
  function setBrush(i) { brushIdx = i; brushBox.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i)); save(); }

  // ================= modes, annuler, effacer =================
  const HINTS = {
    mandala: "Choisis une couleur à droite, puis appuie sur une case. Appuie encore une fois pour l'enlever.",
    drawing: "Appuie sur une zone du dessin pour la colorier. Appuie encore pour l'enlever.",
    draw: 'Dessine avec ton doigt. Le blanc sert de gomme.',
  };
  function setMode(m) {
    mode = m;
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x.dataset.mode === m));
    app.className = 'app mode-' + m;
    hint.textContent = HINTS[m];
    disarmClear(); updateUndo(); save();
  }
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));

  function updateUndo() {
    undoBtn.disabled = mode === 'mandala' ? !fillHistory.length : mode === 'drawing' ? !drawHistory.length : !strokes.length;
  }
  undoBtn.addEventListener('click', () => {
    if (mode === 'draw') { strokes.pop(); redrawStrokes(); }
    else { const h = (mode === 'mandala' ? fillHistory : drawHistory).pop(); if (h) { h.el.dataset.color = h.prev; h.el.style.fill = h.prev; } }
    updateUndo(); save();
  });
  newBtn.addEventListener('click', newMandala);
  pickBtn.addEventListener('click', () => openModal('galleryModal'));

  let clearTimer = null;
  const clearLabel = clearBtn.innerHTML;
  function disarmClear() { clearBtn.classList.remove('armed'); clearBtn.innerHTML = clearLabel; clearTimeout(clearTimer); }
  clearBtn.addEventListener('click', () => {
    if (!clearBtn.classList.contains('armed')) {
      clearBtn.classList.add('armed'); clearBtn.innerHTML = '<span class="lg">Sûr ? Appuie encore</span><span class="sm">Sûr ?</span>';
      clearTimer = setTimeout(disarmClear, 2500); return;
    }
    disarmClear();
    if (mode === 'draw') { strokes = []; redrawStrokes(); }
    else { const svg = mode === 'mandala' ? mandalaSvg : drawSvg; applyFills(svg, []); if (mode === 'mandala') fillHistory = []; else drawHistory = []; }
    updateUndo(); save();
  });

  // ================= enregistrer l'image =================
  async function exportPNG() {
    const size = 1600, c = document.createElement('canvas'); c.width = c.height = size;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, size, size);
    if (mode === 'draw') { x.drawImage(canvas, 0, 0, size, size); return c.toDataURL('image/png'); }
    const clone = (mode === 'mandala' ? mandalaSvg : drawSvg).cloneNode(true);
    clone.setAttribute('xmlns', NS); clone.setAttribute('width', size); clone.setAttribute('height', size);
    const st = document.createElementNS(NS, 'style');
    st.textContent = `.region{fill:#fff;stroke:${INK};stroke-width:.55;stroke-linejoin:round}.decor{fill:none;stroke:${INK};stroke-width:.55;stroke-linecap:round;stroke-linejoin:round}.decor.dark{fill:${INK};stroke:none}text.decor{font-family:sans-serif;font-weight:700}#drawing .region{stroke-width:.75}#drawing .decor{stroke-width:.4}`;
    clone.prepend(st);
    clone.querySelectorAll('.pop').forEach(n => n.classList.remove('pop'));
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' }));
    await new Promise((res, rej) => { const im = new Image(); im.onload = () => { x.drawImage(im, 0, 0, size, size); res(); }; im.onerror = rej; im.src = url; });
    URL.revokeObjectURL(url);
    return c.toDataURL('image/png');
  }
  saveBtn.addEventListener('click', async () => {
    try {
      const data = await exportPNG();
      $('exportImg').src = data;
      $('shareBtn').hidden = !(navigator.canShare && window.File);
      openModal('exportModal');
    } catch (e) { hint.textContent = "Impossible de créer l'image sur cet appareil."; }
  });
  $('shareBtn').addEventListener('click', async () => {
    try {
      const blob = await (await fetch($('exportImg').src)).blob();
      const file = new File([blob], 'mon-dessin.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'Mon dessin' });
    } catch (e) { /* partage annulé */ }
  });

  // ================= sauvegarde automatique =================
  let saveTimer = null;
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 400); }
  function saveNow() {
    if (drawingId) drawingFills[drawingId] = fillsOf(drawSvg);
    const data = { mode, current, custom, brushIdx, seed, mandalaFills: fillsOf(mandalaSvg), drawingId, drawingFills, strokes };
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* stockage indisponible */ }
  }
  function restore() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
    if (!d) return false;
    custom = Array.isArray(d.custom) ? d.custom : [];
    brushIdx = BRUSHES[d.brushIdx] ? d.brushIdx : 1;
    seed = typeof d.seed === 'number' ? d.seed : seed;
    renderElems(mandalaSvg, mandalaElems(makeMandala(seed)));
    applyFills(mandalaSvg, d.mandalaFills);
    drawingFills = d.drawingFills || {};
    loadDrawing(d.drawingId || ALL[0].id);
    strokes = Array.isArray(d.strokes) ? d.strokes : [];
    selectColor(d.current || current);
    setMode(['mandala', 'drawing', 'draw'].includes(d.mode) ? d.mode : 'mandala');
    return true;
  }

  window.addEventListener('pagehide', saveNow);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });

  // ================= démarrage =================
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchmove', e => { if (e.target.closest && e.target.closest('#stage')) e.preventDefault(); }, { passive: false });
  buildColorGrid();
  buildGallery();
  if (!restore()) {
    renderElems(mandalaSvg, mandalaElems(makeMandala(seed)));
    loadDrawing(ALL[0].id);
    selectColor(current);
    setMode('mandala');
  }
  buildPalette();
  setBrush(brushIdx);
  redrawStrokes();
  updateUndo();
})();
