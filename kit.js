/* kit.js — bibliothèque de dessins à colorier.
   Chaque dessin est une liste d'éléments dans un repère 0..200 × 0..200.
   - élément normal  : une zone coloriable (contour noir, fond blanc)
   - decor           : un trait décoratif non coloriable (bouche, moustaches…)
   - decor + dark    : rempli en noir (yeux, pupilles)                           */
window.Kit = (function () {
  const f = n => Math.round(n * 100) / 100;
  const el = (t, a, o) => {
    const e = { t, a };
    if (o) { if (o.transform) { a.transform = o.transform; delete o.transform; } Object.assign(e, o); }
    return e;
  };
  const circle  = (cx, cy, r, o)      => el('circle',  { cx: f(cx), cy: f(cy), r: f(r) }, o);
  const ellipse = (cx, cy, rx, ry, o) => el('ellipse', { cx: f(cx), cy: f(cy), rx: f(rx), ry: f(ry) }, o);
  const rect    = (x, y, w, h, rx, o) => el('rect',    { x: f(x), y: f(y), width: f(w), height: f(h), rx: f(rx || 0) }, o);
  const path    = (d, o)              => el('path',    { d }, o);
  const poly    = (pts, o)            => el('polygon', { points: pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ') }, o);
  const line    = (x1, y1, x2, y2)    => el('line',    { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2) }, { decor: true });
  const D = e => Object.assign(e, { decor: true });
  const K = e => Object.assign(e, { decor: true, dark: true });
  const T = (x, y, text, size) => el('text', { x, y, 'font-size': size || 10, 'text-anchor': 'middle' }, { decor: true, dark: true, text });
  const place = (children, x, y, s, rot) =>
    el('g', { transform: `translate(${f(x)} ${f(y)})` + (s && s !== 1 ? ` scale(${s})` : '') + (rot ? ` rotate(${rot})` : '') }, { children });
  const star = (cx, cy, r, o) => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * 0.45 : r; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    return poly(pts, o);
  };
  const heart = (cx, cy, s, o) =>
    path(`M${f(cx)} ${f(cy + s)} C${f(cx - s * 1.3)} ${f(cy)} ${f(cx - s * 0.9)} ${f(cy - s * 0.9)} ${f(cx)} ${f(cy - s * 0.3)} C${f(cx + s * 0.9)} ${f(cy - s * 0.9)} ${f(cx + s * 1.3)} ${f(cy)} ${f(cx)} ${f(cy + s)} Z`, o);
  const flower = (cx, cy, r) => {
    const E = [];
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; E.push(circle(cx + r * Math.cos(a), cy + r * Math.sin(a), r * 0.75)); }
    E.push(circle(cx, cy, r * 0.55));
    return E;
  };

  /* ======================= ANIMAUX ======================= */
  function cat() {
    return [
      path('M140 150 Q188 150 182 106 Q176 86 160 96 Q172 118 158 132 Q150 140 140 138 Z'),
      ellipse(100, 138, 46, 40), ellipse(72, 172, 14, 8), ellipse(128, 172, 14, 8),
      poly([[68, 62], [78, 20], [98, 50]]), poly([[132, 62], [122, 20], [102, 50]]),
      poly([[75, 57], [80, 33], [92, 51]]), poly([[125, 57], [120, 33], [108, 51]]),
      circle(100, 76, 36),
      K(ellipse(87, 72, 4, 6)), K(ellipse(113, 72, 4, 6)),
      poly([[95, 84], [105, 84], [100, 90]]),
      D(path('M100 90 Q94 98 88 94')), D(path('M100 90 Q106 98 112 94')),
      line(58, 80, 84, 86), line(58, 92, 84, 90), line(142, 80, 116, 86), line(142, 92, 116, 90),
      circle(100, 134, 20),
    ];
  }
  function dog() {
    return [
      path('M136 128 Q170 120 176 96 Q180 84 170 84 Q166 106 138 116 Z'),
      ellipse(100, 140, 44, 38), ellipse(72, 176, 15, 8), ellipse(128, 176, 15, 8),
      ellipse(66, 78, 12, 27, { transform: 'rotate(14 66 78)' }), ellipse(134, 78, 12, 27, { transform: 'rotate(-14 134 78)' }),
      circle(100, 78, 34), ellipse(100, 94, 18, 13),
      K(ellipse(100, 88, 6, 4)), K(circle(88, 70, 3.5)), K(circle(112, 70, 3.5)),
      D(path('M100 92 Q100 100 92 101')), D(path('M100 92 Q100 100 108 101')),
      ellipse(104, 106, 5, 7),
      rect(78, 110, 44, 8, 4), circle(100, 121, 5),
      ellipse(122, 138, 11, 9), circle(100, 150, 14),
    ];
  }
  function rabbit() {
    return [
      ellipse(84, 42, 11, 34, { transform: 'rotate(-8 84 42)' }), ellipse(116, 42, 11, 34, { transform: 'rotate(8 116 42)' }),
      ellipse(84, 42, 5, 24, { transform: 'rotate(-8 84 42)' }), ellipse(116, 42, 5, 24, { transform: 'rotate(8 116 42)' }),
      circle(140, 160, 11), ellipse(100, 145, 40, 36), ellipse(78, 180, 16, 8), ellipse(122, 180, 16, 8),
      circle(100, 90, 30),
      K(circle(88, 84, 3.5)), K(circle(112, 84, 3.5)), poly([[96, 94], [104, 94], [100, 99]]),
      rect(96, 100, 8, 7, 1), line(100, 100, 100, 107),
      line(62, 92, 84, 96), line(62, 102, 84, 100), line(138, 92, 116, 96), line(138, 102, 116, 100),
      circle(100, 150, 18),
      poly([[56, 124], [74, 118], [58, 168]]), ellipse(66, 114, 4, 9, { transform: 'rotate(-30 66 114)' }), ellipse(72, 114, 4, 9, { transform: 'rotate(20 72 114)' }),
    ];
  }
  function butterfly() {
    return [
      path('M100 92 Q40 26 30 70 Q28 104 100 102 Z'), path('M100 92 Q160 26 170 70 Q172 104 100 102 Z'),
      path('M100 102 Q36 112 44 154 Q62 176 100 122 Z'), path('M100 102 Q164 112 156 154 Q138 176 100 122 Z'),
      circle(60, 74, 11), circle(140, 74, 11), circle(66, 138, 7), circle(134, 138, 7),
      ellipse(100, 106, 9, 40), circle(100, 62, 11),
      D(path('M96 54 Q86 36 78 30')), D(path('M104 54 Q114 36 122 30')), K(circle(78, 30, 2.5)), K(circle(122, 30, 2.5)),
      K(circle(96, 60, 2)), K(circle(104, 60, 2)),
    ];
  }
  function fish() {
    const E = [
      poly([[148, 100], [190, 66], [184, 100], [190, 134]]),
      ellipse(100, 100, 58, 38),
      path('M80 66 Q100 36 130 68 Z'), path('M88 134 Q110 158 128 132 Z'),
      ellipse(94, 110, 16, 9, { transform: 'rotate(-20 94 110)' }),
      circle(132, 90, 8), K(circle(134, 90, 4),),
      D(path('M150 108 Q146 114 140 112')),
      circle(174, 42, 6), circle(186, 28, 4), circle(178, 58, 3),
    ];
    [[60, 90], [72, 104], [60, 110], [72, 84], [84, 96], [84, 116]].forEach(p => E.push(D(path(`M${p[0] - 6} ${p[1]} a6 6 0 0 0 12 0`))));
    return E;
  }
  function owl() {
    return [
      rect(16, 178, 168, 10, 5), D(path('M40 178 Q44 166 56 170 M150 178 Q154 166 166 170')),
      poly([[64, 74], [58, 44], [86, 64]]), poly([[136, 74], [142, 44], [114, 64]]),
      ellipse(100, 116, 44, 58),
      ellipse(60, 124, 14, 36, { transform: 'rotate(10 60 124)' }), ellipse(140, 124, 14, 36, { transform: 'rotate(-10 140 124)' }),
      ellipse(100, 140, 28, 26), D(path('M84 132 q8 8 16 0 q8 8 16 0 M84 148 q8 8 16 0 q8 8 16 0')),
      circle(84, 86, 17), circle(116, 86, 17), circle(84, 86, 10), circle(116, 86, 10), K(circle(84, 86, 5)), K(circle(116, 86, 5)),
      poly([[94, 98], [106, 98], [100, 110]]),
      ellipse(88, 176, 8, 4), ellipse(112, 176, 8, 4),
    ];
  }
  function bear() {
    return [
      circle(70, 58, 14), circle(130, 58, 14), circle(70, 58, 7), circle(130, 58, 7),
      ellipse(100, 146, 40, 36),
      ellipse(60, 132, 14, 24, { transform: 'rotate(20 60 132)' }), ellipse(140, 132, 14, 24, { transform: 'rotate(-20 140 132)' }),
      ellipse(78, 180, 16, 10), ellipse(122, 180, 16, 10), ellipse(100, 152, 22, 20),
      circle(100, 80, 36), ellipse(100, 94, 16, 12), K(ellipse(100, 89, 6, 4)),
      D(path('M100 93 Q100 100 92 100')), D(path('M100 93 Q100 100 108 100')),
      K(circle(88, 74, 3.5)), K(circle(112, 74, 3.5)),
      poly([[86, 112], [100, 118], [86, 124]]), poly([[114, 112], [100, 118], [114, 124]]), circle(100, 118, 3.5),
    ];
  }
  function unicorn() {
    return [
      path('M44 110 Q8 98 14 132 Q20 152 36 142 Q26 128 42 122 Z'),
      rect(56, 148, 14, 38, 6), rect(76, 150, 14, 36, 6), rect(100, 150, 14, 36, 6), rect(120, 148, 14, 38, 6),
      ellipse(90, 125, 50, 34),
      poly([[118, 106], [138, 60], [162, 68], [142, 124]]),
      circle(136, 66, 7), circle(130, 78, 7), circle(124, 90, 7), circle(118, 102, 7),
      poly([[154, 46], [166, 8], [170, 46]]),
      poly([[146, 52], [150, 32], [161, 48]]),
      ellipse(156, 60, 24, 18), ellipse(176, 70, 12, 9), circle(146, 44, 6),
      K(circle(160, 58, 3.5)), K(circle(180, 70, 1.5)), D(path('M170 78 Q176 82 182 78')),
      ...flower(84, 122, 6),
    ];
  }
  /* ======================= SCÈNES ======================= */
  function bedroom() {
    return [
      rect(0, 0, 200, 135), rect(0, 135, 200, 65),
      rect(24, 22, 64, 54, 3), circle(48, 46, 10),
      D(path('M48 30 V26 M48 66 V62 M32 46 H28 M68 46 H64 M37 35 L34 32 M59 35 L62 32 M37 57 L34 60 M59 57 L62 60')),
      path('M60 56 Q60 46 70 48 Q74 40 82 44 Q88 44 86 54 Z'),
      line(56, 22, 56, 76), line(24, 49, 88, 49),
      rect(16, 18, 10, 62, 3), rect(86, 18, 10, 62, 3), line(12, 18, 100, 18),
      rect(108, 72, 84, 44, 8), rect(104, 110, 92, 28, 6), ellipse(126, 112, 16, 8),
      path('M140 116 Q150 110 160 116 T180 116 T196 116 V138 H140 Z'),
      rect(108, 138, 8, 12), rect(184, 138, 8, 12),
      rect(20, 104, 44, 44, 3), line(20, 126, 64, 126), K(circle(42, 115, 2)), K(circle(42, 137, 2)),
      rect(36, 92, 12, 12, 2), path('M28 92 H56 L50 70 H34 Z'),
      ellipse(84, 178, 52, 13), D(ellipse(84, 178, 40, 8)),
      place(bear(), 52, 138, 0.2),
    ];
  }
  function kitchen() {
    return [
      rect(0, 0, 200, 135), rect(0, 135, 200, 65),
      rect(120, 20, 60, 44, 3), line(150, 20, 150, 64), line(120, 42, 180, 42), circle(136, 34, 7),
      rect(14, 40, 44, 110, 4), line(14, 80, 58, 80), K(rect(50, 52, 3, 20, 1.5)), K(rect(50, 90, 3, 30, 1.5)),
      rect(70, 116, 110, 8, 3), rect(78, 124, 6, 40), rect(166, 124, 6, 40),
      rect(184, 88, 6, 60, 2), rect(176, 124, 22, 6, 2), rect(178, 130, 4, 30), rect(192, 130, 4, 30),
      ellipse(100, 102, 16, 14), path('M114 98 Q128 92 126 80 Q122 94 112 94 Z'), circle(100, 86, 4),
      D(path('M84 96 Q70 100 84 108')),
      rect(134, 100, 32, 16, 3), rect(138, 90, 24, 10, 3), rect(146, 80, 3, 10), rect(152, 80, 3, 10),
      ellipse(147.5, 77, 2.5, 4), ellipse(153.5, 77, 2.5, 4), D(path('M134 104 Q138 108 142 104 T150 104 T158 104 T166 104')),
      place(cat(), 88, 128, 0.2),
    ];
  }
  function garden() {
    return [
      rect(0, 0, 200, 140), rect(0, 140, 200, 60),
      circle(30, 30, 14), D(path('M30 8 V12 M30 48 V52 M8 30 H12 M48 30 H52 M14 14 L17 17 M43 43 L46 46 M46 14 L43 17 M17 43 L14 46')),
      path('M112 36 Q112 22 126 24 Q132 10 148 18 Q164 14 166 30 Q176 36 168 42 H116 Q106 40 112 36 Z'),
      rect(132, 50, 12, 28), rect(56, 90, 88, 60), poly([[50, 92], [100, 50], [150, 92]]),
      rect(90, 114, 20, 36, 3), K(circle(106, 132, 1.8)),
      rect(64, 100, 18, 18, 2), rect(118, 100, 18, 18, 2), line(73, 100, 73, 118), line(64, 109, 82, 109), line(127, 100, 127, 118), line(118, 109, 136, 109),
      path('M96 150 Q100 175 122 200 H78 Q92 175 96 150 Z'),
      rect(166, 110, 12, 42, 3), circle(172, 96, 22),
      rect(6, 128, 6, 26, 2), rect(18, 128, 6, 26, 2), rect(30, 128, 6, 26, 2), line(4, 136, 38, 136), line(4, 148, 38, 148),
      line(40, 176, 40, 158), line(58, 182, 58, 164), ...flower(40, 154, 5), ...flower(58, 160, 5),
      place(dog(), 132, 150, 0.22),
    ];
  }
  function livingroom() {
    return [
      rect(0, 0, 200, 135), rect(0, 135, 200, 65),
      rect(30, 30, 44, 34, 2), rect(36, 36, 32, 22), circle(46, 46, 4), path('M36 58 L48 48 L56 54 L62 50 L68 58 Z'),
      rect(84, 100, 14, 44, 7), rect(182, 100, 14, 44, 7), rect(92, 84, 92, 30, 8), rect(100, 90, 36, 24, 5), rect(140, 90, 36, 24, 5), rect(88, 112, 100, 32, 6),
      rect(56, 100, 4, 60), ellipse(58, 162, 14, 5), path('M40 100 H76 L70 78 H46 Z'),
      ellipse(30, 132, 8, 20), ellipse(18, 138, 7, 16, { transform: 'rotate(-30 18 138)' }), ellipse(42, 138, 7, 16, { transform: 'rotate(30 42 138)' }),
      path('M14 150 H46 L42 176 H18 Z'),
      ellipse(140, 178, 50, 12), place(cat(), 118, 150, 0.2),
    ];
  }
  function firetruck() {
    const E = [
      rect(14, 96, 124, 44, 5), rect(134, 66, 52, 74, 6), rect(144, 76, 32, 26, 3), line(160, 76, 160, 102),
      rect(20, 82, 110, 4, 2), rect(20, 92, 110, 4, 2),
      rect(150, 58, 14, 8, 3), rect(14, 110, 124, 8), circle(72, 124, 9), D(path('M72 124 m-5 0 a5 5 0 1 1 10 0 a2 2 0 1 1 -4 0')),
      rect(186, 124, 10, 12, 2), rect(4, 118, 10, 12, 2),
      circle(46, 142, 16), circle(120, 142, 16), circle(160, 142, 16), circle(46, 142, 6), circle(120, 142, 6), circle(160, 142, 6),
    ];
    for (let x = 32; x < 130; x += 12) E.push(line(x, 86, x, 92));
    return E;
  }
  function rocket() {
    return [
      circle(40, 40, 14), D(ellipse(40, 40, 24, 6, { transform: 'rotate(-20 40 40)' })),
      star(160, 40, 8), star(176, 80, 5), star(30, 120, 6), star(170, 150, 7),
      path('M84 160 Q100 202 116 160 Z'), path('M92 160 Q100 186 108 160 Z'),
      poly([[72, 150], [72, 108], [84, 128], [84, 160]]), poly([[128, 150], [128, 108], [116, 128], [116, 160]]),
      path('M100 20 Q72 60 72 120 V160 H128 V120 Q128 60 100 20 Z'),
      path('M100 20 Q84 40 78 60 H122 Q116 40 100 20 Z'),
      rect(72, 130, 56, 8), circle(100, 92, 14), circle(100, 92, 9),
    ];
  }
  function car() {
    return [
      rect(20, 100, 160, 44, 10), path('M56 100 L72 68 H136 L152 100 Z'),
      path('M76 74 H98 V100 H64 Z'), path('M104 74 H132 L144 100 H104 Z'),
      circle(56, 144, 18), circle(144, 144, 18), circle(56, 144, 7), circle(144, 144, 7),
      circle(176, 118, 6), circle(24, 118, 6), line(100, 100, 100, 144), K(rect(104, 112, 10, 3, 1.5)),
    ];
  }
  function cake() {
    return [
      ellipse(100, 168, 70, 14), rect(40, 124, 120, 40, 8), rect(56, 92, 88, 36, 8),
      path('M40 124 H160 V132 Q152 144 144 132 Q136 144 128 132 Q120 144 112 132 Q104 144 96 132 Q88 144 80 132 Q72 144 64 132 Q56 144 48 132 Q44 136 40 132 Z'),
      path('M56 92 H144 V98 Q138 108 132 98 Q126 108 120 98 Q114 108 108 98 Q102 108 96 98 Q90 108 84 98 Q78 108 72 98 Q66 108 60 98 Q58 100 56 98 Z'),
      rect(76, 68, 6, 24, 2), rect(97, 64, 6, 28, 2), rect(118, 68, 6, 24, 2),
      ellipse(79, 62, 4, 7), ellipse(100, 58, 4, 7), ellipse(121, 62, 4, 7),
      circle(62, 150, 6), circle(100, 150, 6), circle(138, 150, 6),
    ];
  }

  /* ======================= CATALOGUE ======================= */
  const CATALOG = [
    { group: 'Animaux', items: [
      { id: 'chat', name: 'Chat', make: cat }, { id: 'chien', name: 'Chien', make: dog }, { id: 'lapin', name: 'Lapin', make: rabbit },
      { id: 'papillon', name: 'Papillon', make: butterfly }, { id: 'poisson', name: 'Poisson', make: fish }, { id: 'hibou', name: 'Hibou', make: owl },
      { id: 'ours', name: 'Ours en peluche', make: bear }, { id: 'licorne', name: 'Licorne', make: unicorn },
    ] },
    { group: 'Scènes', items: [
      { id: 'chambre', name: 'La chambre', make: bedroom }, { id: 'cuisine', name: 'La cuisine', make: kitchen },
      { id: 'jardin', name: 'La maison et le jardin', make: garden }, { id: 'salon', name: 'Le salon', make: livingroom },
    ] },
    { group: 'Véhicules et objets', items: [
      { id: 'camion', name: 'Camion de pompiers', make: firetruck }, { id: 'fusee', name: 'Fusée', make: rocket },
      { id: 'voiture', name: 'Voiture', make: car }, { id: 'gateau', name: "Gâteau d'anniversaire", make: cake },
    ] },
  ];

  return { CATALOG, star, heart, flower, place, h: { f, el, circle, ellipse, rect, path, poly, line, D, K, T, place, star, heart, flower } };
})();
