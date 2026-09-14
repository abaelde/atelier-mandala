/* people.js — personnages détaillés (version 8 ans et plus).
   Utilise les aides de kit.js (Kit.h). Chaque personnage = décor + silhouette + accessoires. */
(function () {
  const { f, circle, ellipse, rect, path, poly, line, D, K, T, place, star, heart, flower } = Kit.h;
  const rad = d => d * Math.PI / 180;
  const P = (x, y) => `${f(x)} ${f(y)}`;
  const ANIMAL_ORIG = Object.fromEntries(Kit.CATALOG.find(g => g.group === 'Animaux').items.map(i => [i.id, i.make]));
  const animal = id => ANIMAL_ORIG[id]();

  /* ---------- petites briques ---------- */
  const eye = (cx, cy, o) => {
    const E = [D(ellipse(cx, cy, 4.6, 5)), circle(cx, cy + 0.6, 3), K(circle(cx + 0.3, cy + 0.9, 1.6))];
    if (o.lashes) E.push(D(path(`M${P(cx - 4.2, cy - 2.4)} l-2.4 -2 M${P(cx - 2.6, cy - 4.2)} l-1.6 -2.6 M${P(cx + 4.2, cy - 2.4)} l2.4 -2 M${P(cx + 2.6, cy - 4.2)} l1.6 -2.6`)));
    return E;
  };
  const wink = (cx, cy) => [D(path(`M${P(cx - 4, cy)} q4 5 8 0`))];
  function face(o) {
    const E = [];
    if (o.wink) { E.push(...eye(91, 50, o)); E.push(...wink(109, 50)); }
    else { E.push(...eye(91, 50, o)); E.push(...eye(109, 50, o)); }
    // sourcils
    E.push(D(path('M85 41 q6 -4 12 -1'))); E.push(D(path('M103 40 q6 -3 12 1')));
    // nez
    E.push(D(path('M100 52 q-3 5 1 7')));
    // bouche
    if (o.mouth === 'open') { E.push(path('M91 61 q9 12 18 0 z')); E.push(D(path('M95 65 q5 3 10 0'))); }
    else if (o.mouth === 'oh') E.push(ellipse(100, 63, 3.5, 4.5));
    else E.push(D(path('M91 60 q9 10 18 0')));
    // joues
    E.push(circle(83, 58, 3.5)); E.push(circle(117, 58, 3.5));
    if (o.freckles) [[86, 55], [89, 58], [111, 55], [114, 58], [84, 60], [116, 60]].forEach(p => E.push(K(circle(p[0], p[1], 0.9))));
    return E;
  }

  /* ---------- cheveux ---------- */
  const bangs = () => path('M78 45 Q79 23 100 23 Q121 23 122 45 Q113 33 105 40 Q98 32 90 40 Q84 33 78 45 Z');
  const HAIR_BACK = {
    long: () => [path('M77 46 Q77 20 100 20 Q123 20 123 46 L129 112 Q121 120 113 110 Q106 122 100 110 Q94 122 87 110 Q79 120 71 112 Z'), D(path('M84 70 Q82 90 80 108 M116 70 Q118 90 120 108'))],
    braids: () => { const E = []; [74, 126].forEach(x => { for (let y = 60; y <= 104; y += 11) E.push(ellipse(x, y, 6.5, 7)); E.push(circle(x, 112, 3.5)); E.push(D(path(`M${P(x - 2, 115)} l-2 8 M${P(x, 115)} v9 M${P(x + 2, 115)} l2 8`))); }); return E; },
    ponytail: () => [circle(123, 40, 4.5), path('M126 38 Q150 42 146 92 Q142 104 134 100 Q140 72 124 48 Z'), D(path('M130 46 Q142 62 138 92'))],
    afro: () => [circle(100, 42, 33), D(path('M78 22 q6 -3 8 4 M110 14 q6 2 4 8 M128 40 q4 6 -2 8 M74 52 q-4 4 0 8'))],
    bun: () => [circle(100, 22, 9), rect(91, 27, 18, 5, 2)],
    bob: () => [path('M76 46 Q76 20 100 20 Q124 20 124 46 L125 70 Q118 76 112 68 L112 46 Q100 40 88 46 L88 68 Q82 76 75 70 Z')],
    short: () => [], curly: () => [], none: () => [],
    pigtails: () => { const E = []; [[74, 62, -18], [126, 62, 18]].forEach(([x, y, r]) => { E.push(ellipse(x, y + 22, 8, 22, { transform: `rotate(${r} ${x} ${y})` })); E.push(D(path(`M${P(x, y + 6)} v28`))); E.push(circle(x + (r < 0 ? 4 : -4), y - 6, 3.5)); }); return E; },
  };
  const HAIR_FRONT = {
    long: () => [bangs()], braids: () => [bangs()], ponytail: () => [bangs()], bob: () => [bangs()], pigtails: () => [bangs()],
    bun: () => [path('M78 45 Q79 23 100 23 Q121 23 122 45 Q100 34 78 45 Z'), D(path('M84 30 Q100 22 116 30'))],
    afro: () => [],
    short: () => [path('M78 45 Q79 23 100 23 Q121 23 122 45 Q114 38 108 40 Q104 31 96 39 Q88 33 78 45 Z'), path('M96 30 Q100 16 108 26 Q102 26 100 32 Z')],
    curly: () => { const E = []; for (let a = 190; a <= 350; a += 20) E.push(circle(100 + 22 * Math.cos(rad(a)), 46 + 22 * Math.sin(rad(a)), 7)); for (let a = 215; a <= 325; a += 22) E.push(circle(100 + 13 * Math.cos(rad(a)), 44 + 13 * Math.sin(rad(a)), 6)); return E; },
    none: () => [],
  };

  /* ---------- hauts ---------- */
  const torso = () => path('M74 78 Q74 72 80 72 H120 Q126 72 126 78 V130 H74 Z');
  const collarRound = () => D(path('M92 72 q8 7 16 0'));
  const collarV = () => D(path('M91 72 L100 86 L109 72'));
  const collarShirt = () => [poly([[91, 72], [100, 82], [84, 80]]), poly([[109, 72], [100, 82], [116, 80]])];
  const buttons = (ys, x) => ys.map(y => K(circle(x || 100, y, 1.8)));
  const pocket = (x, y, w, h) => [rect(x, y, w, h, 2), D(path(`M${P(x, y + 3)} h${w}`))];
  const TOPS = {
    tee: () => [torso(), collarRound()],
    stripes: () => [torso(), rect(74, 88, 52, 7), rect(74, 102, 52, 7), rect(74, 116, 52, 7), collarRound()],
    shirt: () => [torso(), ...collarShirt(), line(100, 82, 100, 130), ...buttons([92, 104, 116])],
    blouse: () => [torso(), ...collarShirt(), line(100, 82, 100, 130), ...buttons([92, 104, 116]), ...pocket(78, 92, 14, 12)],
    dress: () => [path('M78 72 H122 Q126 72 126 78 L124 102 Q100 108 76 102 L74 78 Q74 72 78 72 Z'), path('M76 102 Q100 108 124 102 L140 170 Q100 178 60 170 Z'),
      D(path('M86 110 L82 168 M100 110 V172 M114 110 L118 168')), rect(75, 98, 50, 8, 4), collarRound()],
    gown: () => [path('M78 72 H122 Q126 72 126 78 L124 100 Q100 106 76 100 L74 78 Q74 72 78 72 Z'),
      path('M76 100 Q100 106 124 100 L150 176 Q100 186 50 176 Z'),
      path('M80 128 Q100 134 120 128 L128 150 Q100 156 72 150 Z'),
      D(path('M70 176 Q80 168 90 176 T110 176 T130 176 T150 176')), rect(74, 96, 52, 8, 4), heart(100, 88, 5), collarRound()],
    tunic: () => [path('M78 72 H122 Q126 72 126 78 L130 138 L122 146 L114 138 L106 146 L98 138 L90 146 L82 138 L74 146 L70 138 Z'), rect(74, 104, 52, 7, 3), collarV()],
    jacket: () => [torso(), rect(74, 94, 52, 6), rect(74, 118, 52, 6), ...pocket(78, 104, 14, 10), ...pocket(108, 104, 14, 10), line(100, 72, 100, 130), collarV()],
    coat: () => [path('M70 80 Q70 72 78 72 H122 Q130 72 130 80 V144 H70 Z'), poly([[88, 72], [112, 72], [100, 92]]), poly([[88, 72], [100, 92], [82, 88]]), poly([[112, 72], [100, 92], [118, 88]]),
      ...buttons([104, 116, 128]), ...pocket(76, 120, 14, 12), ...pocket(110, 120, 14, 12), rect(108, 88, 14, 8, 1), D(path('M111 92 h8'))],
    overalls: () => [torso(), collarRound(), rect(84, 84, 32, 46, 4), rect(84, 72, 6, 16, 2), rect(110, 72, 6, 16, 2), K(circle(87, 88, 2.2)), K(circle(113, 88, 2.2)), ...pocket(92, 96, 16, 12)],
    apron: () => [torso(), ...collarShirt(), path('M84 88 H116 V134 H84 Z'), D(path('M84 88 L78 72 M116 88 L122 72')), ...pocket(90, 112, 20, 12), rect(74, 100, 10, 6, 3), rect(116, 100, 10, 6, 3)],
    chef: () => [torso(), D(path('M90 72 L100 84 L110 72')), ...buttons([92, 104, 116], 93), ...buttons([92, 104, 116], 107), line(100, 84, 100, 130)],
    police: () => [torso(), ...collarShirt(), poly([[97, 82], [103, 82], [104, 104], [100, 110], [96, 104]]), rect(74, 72, 14, 5, 2), rect(112, 72, 14, 5, 2), star(86, 96, 6), ...pocket(106, 90, 14, 10), rect(74, 122, 52, 8, 2), rect(96, 122, 8, 8, 1)],
    scrubs: () => [torso(), collarV(), ...pocket(104, 94, 16, 14), rect(108, 90, 3, 10, 1)],
    jersey: () => [torso(), collarV(), T(100, 116, '10', 22), rect(74, 82, 52, 4)],
    armor: () => [path('M74 78 Q74 72 80 72 H120 Q126 72 126 78 V118 Q100 134 74 118 Z'), D(path('M80 84 Q100 94 120 84 M100 92 V128')), ellipse(76, 78, 12, 8), ellipse(124, 78, 12, 8),
      rect(74, 120, 52, 8, 2), rect(95, 119, 10, 10, 2), circle(100, 100, 9), star(100, 100, 6)],
    suit: () => [torso(), rect(86, 86, 28, 20, 3), K(circle(92, 92, 2)), K(circle(100, 92, 2)), K(circle(108, 92, 2)), rect(90, 98, 20, 4, 1), D(path('M74 80 q-8 20 0 40 M126 80 q8 20 0 40')), rect(74, 122, 52, 8, 2)],
    hoodie: () => [torso(), path('M82 108 H118 V128 H82 Z'), D(path('M94 74 v14 M106 74 v14')), K(circle(94, 90, 1.5)), K(circle(106, 90, 1.5)), path('M84 74 Q100 84 116 74 Q100 70 84 74 Z')],
    vest: () => [torso(), rect(74, 90, 52, 7), rect(74, 108, 52, 7), path('M74 72 H86 V130 H74 Z'), path('M114 72 H126 V130 H114 Z'), rect(74, 122, 52, 8, 2), rect(96, 122, 8, 8, 1)],
    hero: () => [torso(), circle(100, 98, 12), star(100, 98, 8), rect(74, 122, 52, 8, 2), rect(95, 121, 10, 10, 2), collarRound()],
    swim: () => [torso(), collarRound(), path('M80 72 Q100 78 120 72 Q100 74 80 72 Z')],
  };

  /* ---------- bas et chaussures ---------- */
  const legs = () => [rect(81, 126, 17, 52, 6), rect(102, 126, 17, 52, 6)];
  const BOTTOMS = {
    pants: () => [...legs(), D(path('M81 170 h17 M102 170 h17'))],
    jeans: () => [...legs(), D(path('M84 132 q5 4 10 0 M106 132 q5 4 10 0 M81 170 h17 M102 170 h17')), rect(78, 124, 44, 7, 2), rect(97, 124, 6, 7, 1)],
    skirt: () => [...legs(), path('M76 126 H124 L133 160 Q100 168 67 160 Z'), D(path('M86 130 L82 160 M100 130 V164 M114 130 L118 160'))],
    shorts: () => [...legs(), rect(78, 126, 44, 26, 5), line(100, 138, 100, 152), D(path('M78 132 h44'))],
    tutu: () => [...legs(), path('M78 126 H122 Q128 138 134 152 Q124 146 116 156 Q108 148 100 158 Q92 148 84 156 Q76 146 66 152 Q72 138 78 126 Z'), D(path('M84 134 Q100 140 116 134'))],
    none: () => legs(),
  };
  const SHOES = {
    shoes: () => [ellipse(89, 179, 14, 7), ellipse(111, 179, 14, 7), rect(75, 181, 28, 5, 2), rect(97, 181, 28, 5, 2), D(path('M84 175 l4 3 l4 -3 M106 175 l4 3 l4 -3'))],
    boots: () => [rect(79, 158, 21, 24, 4), rect(100, 158, 21, 24, 4), rect(75, 180, 28, 6, 2), rect(97, 180, 28, 6, 2), D(path('M79 164 h21 M100 164 h21'))],
    ballet: () => [ellipse(89, 179, 13, 6), ellipse(111, 179, 13, 6), D(path('M82 176 l-4 -14 M96 176 l4 -14 M104 176 l-4 -14 M118 176 l4 -14'))],
    sandals: () => [rect(75, 180, 28, 5, 2), rect(97, 180, 28, 5, 2), D(path('M82 180 l7 -6 l7 6 M104 180 l7 -6 l7 6'))],
    bare: () => [ellipse(89, 180, 13, 6), ellipse(111, 180, 13, 6)],
    none: () => [],
  };

  /* ---------- chapeaux ---------- */
  const HATS = {
    helmet: () => [path('M70 44 A30 30 0 0 1 130 44 Z'), rect(64, 42, 72, 7, 3), rect(96, 22, 8, 22, 3), rect(92, 30, 16, 8, 2), D(path('M96 36 h8'))],
    hardhat: () => [path('M72 44 A28 28 0 0 1 128 44 Z'), rect(66, 42, 68, 6, 3), rect(96, 18, 8, 26, 3)],
    toque: () => [rect(78, 34, 44, 12, 3), path('M78 36 Q60 12 84 16 Q92 0 100 12 Q108 0 116 16 Q140 12 122 36 Z'), D(path('M84 34 v6 M92 34 v6 M100 34 v6 M108 34 v6 M116 34 v6'))],
    cap: () => [path('M74 44 A26 24 0 0 1 126 44 Z'), rect(72, 42, 56, 7, 3), path('M68 46 Q100 54 132 46 Q100 49 68 46 Z'), circle(100, 22, 4), D(path('M100 26 V44 M78 44 Q90 26 100 26 M122 44 Q110 26 100 26'))],
    sunhat: () => [ellipse(100, 44, 42, 8), path('M76 44 A24 24 0 0 1 124 44 Z'), rect(76, 38, 48, 6, 2), ...flower(122, 40, 4)],
    beret: () => [path('M70 42 Q96 8 132 36 Q124 46 100 44 Q82 48 70 42 Z'), circle(104, 16, 3)],
    crown: () => [poly([[78, 44], [78, 22], [89, 32], [100, 16], [111, 32], [122, 22], [122, 44]]), rect(78, 40, 44, 6, 1), circle(100, 34, 3.5), circle(87, 36, 2.5), circle(113, 36, 2.5)],
    tiara: () => [path('M80 42 Q90 30 100 34 Q110 30 120 42 Z'), poly([[96, 34], [100, 18], [104, 34]]), circle(100, 22, 3), circle(90, 34, 2.5), circle(110, 34, 2.5)],
    astronaut: () => [D(circle(100, 46, 33)), D(rect(78, 30, 44, 32, 14)), D(path('M84 40 q4 -8 12 -8')), rect(66, 40, 8, 14, 3), rect(126, 40, 8, 14, 3)],
    headphones: () => [D(path('M76 46 A24 24 0 0 1 124 46')), rect(72, 44, 9, 16, 4), rect(119, 44, 9, 16, 4)],
    knight: () => [path('M74 44 A26 26 0 0 1 126 44 Z'), rect(74, 26, 52, 14, 3), D(path('M82 33 h8 M92 33 h8 M102 33 h8 M112 33 h8')), rect(72, 42, 9, 28, 3), rect(119, 42, 9, 28, 3), D(path('M74 44 H126')), path('M96 20 Q100 8 104 20 Q100 26 96 20 Z'), path('M102 18 Q124 4 134 22 Q120 22 104 26 Z')],
    pirate: () => [path('M62 46 Q70 20 100 22 Q130 20 138 46 Q118 40 100 42 Q82 40 62 46 Z'), rect(70, 42, 60, 6, 2), circle(100, 34, 6), K(circle(98, 33, 1.2)), K(circle(102, 33, 1.2)), D(path('M97 37 h6'))],
    bandana: () => [path('M76 44 Q80 24 100 24 Q120 24 124 44 Q100 38 76 44 Z'), poly([[122, 36], [140, 30], [136, 44]]), ...[[86, 33], [96, 30], [106, 30], [116, 33]].map(p => K(circle(p[0], p[1], 1.2)))],
    witch: () => [ellipse(100, 44, 44, 8), path('M78 44 Q90 20 94 8 Q120 -4 120 16 Q112 30 122 44 Z'), rect(80, 34, 40, 8, 1), rect(96, 33, 8, 10, 1), star(110, 20, 3)],
    wizard: () => [ellipse(100, 44, 42, 8), poly([[78, 44], [100, -2], [122, 44]]), star(100, 26, 4), star(92, 36, 3), star(110, 34, 3)],
    cowboy: () => [ellipse(100, 44, 44, 8), path('M78 44 Q76 18 100 20 Q124 18 122 44 Z'), rect(78, 38, 44, 6, 2), D(path('M92 24 q8 -4 16 0'))],
    party: () => [poly([[82, 44], [100, 4], [118, 44]]), circle(100, 4, 4), D(path('M88 30 h24 M92 20 h16')), ...[[90, 38], [100, 34], [110, 38]].map(p => K(circle(p[0], p[1], 1.5)))],
    bow: () => [ellipse(116, 26, 8, 5, { transform: 'rotate(-20 116 26)' }), ellipse(128, 32, 8, 5, { transform: 'rotate(40 128 32)' }), circle(121, 30, 3)],
    headband: () => [D(path('M78 40 Q100 22 122 40')), heart(100, 26, 4)],
    flowers: () => [D(path('M78 42 Q100 26 122 42')), ...flower(84, 36, 3), ...flower(100, 30, 3), ...flower(116, 36, 3)],
    catears: () => [poly([[80, 40], [84, 18], [96, 34]]), poly([[120, 40], [116, 18], [104, 34]]), poly([[84, 37], [86, 24], [93, 34]]), poly([[116, 37], [114, 24], [107, 34]])],
    beanie: () => [path('M78 46 Q78 18 100 18 Q122 18 122 46 Z'), rect(76, 40, 48, 8, 3), circle(100, 16, 5), D(path('M86 24 v16 M94 20 v20 M106 20 v20 M114 24 v16'))],
    nurse: () => [rect(84, 24, 32, 14, 2), path('M86 24 L100 14 L114 24 Z'), rect(98, 26, 4, 10, 1), rect(95, 29, 10, 4, 1)],
    halo: () => [D(ellipse(100, 20, 14, 4))],
  };

  /* ---------- objets tenus ---------- */
  const HELD = {
    sword: (hx, hy) => [poly([[hx - 4, hy - 8], [hx + 4, hy - 8], [hx + 4, hy - 46], [hx, hy - 56], [hx - 4, hy - 46]]), D(path(`M${P(hx, hy - 10)} V${f(hy - 44)}`)), rect(hx - 10, hy - 9, 20, 4, 2), rect(hx - 3, hy - 5, 6, 12, 2), circle(hx, hy + 9, 3.5)],
    cutlass: (hx, hy) => [path(`M${P(hx - 3, hy - 8)} Q${P(hx + 14, hy - 30)} ${P(hx + 6, hy - 56)} Q${P(hx + 2, hy - 30)} ${P(hx + 3, hy - 8)} Z`), path(`M${P(hx - 8, hy - 8)} Q${P(hx - 12, hy + 4)} ${P(hx, hy + 8)} Q${P(hx + 12, hy + 4)} ${P(hx + 8, hy - 8)} Z`)],
    wand: (hx, hy) => [rect(hx - 1.5, hy - 30, 3, 32, 1), star(hx, hy - 36, 8), ...[[hx - 12, hy - 40], [hx + 12, hy - 42], [hx + 8, hy - 50]].map(p => K(circle(p[0], p[1], 1.3)))],
    staff: (hx, hy) => [rect(hx - 2, hy - 60, 4, 70, 2), poly([[hx - 7, hy - 58], [hx, hy - 76], [hx + 7, hy - 58], [hx, hy - 52]]), D(path(`M${P(hx, hy - 72)} v14`))],
    broom: (hx, hy) => [rect(hx - 2, hy - 62, 4, 68, 2), poly([[hx - 9, hy + 6], [hx + 9, hy + 6], [hx + 14, hy + 34], [hx - 14, hy + 34]]), rect(hx - 10, hy + 4, 20, 5, 2), D(path(`M${P(hx - 6, hy + 12)} v20 M${P(hx, hy + 12)} v22 M${P(hx + 6, hy + 12)} v20`))],
    book: (hx, hy) => [path(`M${P(hx - 15, hy - 10)} H${f(hx + 15)} V${f(hy + 10)} H${f(hx - 15)} Z`), line(hx, hy - 10, hx, hy + 10), D(path(`M${P(hx - 11, hy - 4)} h7 M${P(hx - 11, hy)} h7 M${P(hx - 11, hy + 4)} h5 M${P(hx + 4, hy - 4)} h7 M${P(hx + 4, hy)} h7`))],
    guitar: () => [place([ellipse(0, 10, 17, 20), circle(0, -12, 12), K(circle(0, 8, 5)), rect(-3, -58, 6, 48, 2), rect(-4, -62, 8, 6, 1), D(path('M-1.5 -54 V24 M1.5 -54 V24 M-6 -40 h12 M-6 -32 h12')), rect(-8, 18, 16, 3, 1)], 100, 112, 1, -35)],
    hose: (hx, hy) => [rect(hx - 4, hy - 5, 30, 10, 4), rect(hx + 22, hy - 7, 8, 14, 2), D(path(`M${P(hx + 30, hy)} Q${P(hx + 46, hy - 12)} ${P(hx + 52, hy + 26)}`)), D(path(`M${P(hx + 30, hy)} Q${P(hx + 50, hy - 4)} ${P(hx + 58, hy + 18)}`)), ...[[hx + 44, hy - 16], [hx + 56, hy - 6], [hx + 62, hy + 10], [hx + 48, hy + 34]].map(p => D(circle(p[0], p[1], 2.2)))],
    flask: (hx, hy) => [path(`M${P(hx - 4, hy - 8)} h8 v8 l10 20 h-28 l10 -20 z`), rect(hx - 6, hy - 11, 12, 4, 1), D(path(`M${P(hx - 10, hy + 12)} h20`)), D(circle(hx + 2, hy + 16, 1.6)), D(circle(hx - 3, hy + 14, 1.2)), D(path(`M${P(hx + 1, hy - 20)} q2 -4 0 -8 M${P(hx - 3, hy - 22)} q-2 -4 0 -8`))],
    whisk: (hx, hy) => [rect(hx - 3, hy - 28, 6, 30, 3), ellipse(hx, hy - 40, 9, 14), D(path(`M${P(hx - 4, hy - 28)} Q${P(hx - 4, hy - 56)} ${P(hx + 4, hy - 28)} M${P(hx, hy - 54)} V${f(hy - 28)}`))],
    trowel: (hx, hy) => [rect(hx - 3, hy - 24, 6, 26, 3), poly([[hx - 12, hy - 24], [hx + 12, hy - 24], [hx, hy - 48]])],
    wrench: (hx, hy) => [rect(hx - 3, hy - 28, 6, 30, 3), path(`M${P(hx - 9, hy - 30)} A9 9 0 1 1 ${P(hx + 9, hy - 30)} L${P(hx + 4, hy - 42)} H${f(hx - 4)} Z`)],
    hammer: (hx, hy) => [rect(hx - 3, hy - 30, 6, 32, 3), rect(hx - 14, hy - 40, 28, 12, 3)],
    brush: (hx, hy, hl) => [rect(hx - 2.5, hy - 30, 5, 32, 2), rect(hx - 4, hy - 36, 8, 7, 1), path(`M${P(hx - 5, hy - 36)} h10 l-2 -12 h-6 z`),
      ellipse(hl[0], hl[1] + 4, 16, 11), ...[[-9, 2], [-3, -4], [4, -1], [9, 5], [2, 6]].map(p => circle(hl[0] + p[0], hl[1] + 4 + p[1], 2.8))],
    bread: (hx, hy) => [ellipse(hx, hy - 14, 7, 27, { transform: `rotate(20 ${P(hx, hy - 14)})` }), D(path(`M${P(hx - 3, hy - 32)} l6 3 M${P(hx - 1, hy - 22)} l6 3 M${P(hx + 1, hy - 12)} l6 3`))],
    can: (hx, hy) => [rect(hx - 14, hy + 2, 28, 22, 4), rect(hx - 10, hy - 4, 20, 6, 3), path(`M${P(hx + 14, hy + 8)} L${P(hx + 32, hy - 8)} L${P(hx + 36, hy - 4)} L${P(hx + 14, hy + 16)} Z`), circle(hx + 36, hy - 8, 4), D(path(`M${P(hx - 8, hy + 2)} Q${P(hx, hy - 12)} ${P(hx + 8, hy + 2)}`)), D(path(`M${P(hx + 40, hy - 4)} l3 6 M${P(hx + 42, hy - 10)} l6 4`))],
    balloon: (hx, hy) => [D(path(`M${P(hx, hy)} Q${P(hx + 8, hy - 20)} ${P(hx + 4, hy - 36)}`)), ellipse(hx + 4, hy - 54, 15, 18), poly([[hx + 1, hy - 37], [hx + 7, hy - 37], [hx + 4, hy - 33]])],
    mic: (hx, hy) => [rect(hx - 3, hy - 26, 6, 28, 3), circle(hx, hy - 32, 8), D(path(`M${P(hx - 6, hy - 36)} h12 M${P(hx - 7, hy - 32)} h14 M${P(hx - 6, hy - 28)} h12`))],
    flowers: (hx, hy) => [D(path(`M${P(hx, hy)} l-8 -30 M${P(hx, hy)} v-32 M${P(hx, hy)} l8 -30`)), rect(hx - 4, hy - 6, 8, 5, 2), ...flower(hx - 9, hy - 36, 4), ...flower(hx + 1, hy - 40, 4), ...flower(hx + 10, hy - 34, 4)],
    telescope: (hx, hy) => [rect(hx - 4, hy - 30, 8, 30, 2), rect(hx - 7, hy - 44, 14, 16, 2), circle(hx, hy - 46, 6)],
    lantern: (hx, hy) => [D(path(`M${P(hx, hy)} v8`)), rect(hx - 8, hy + 8, 16, 22, 3), rect(hx - 5, hy + 12, 10, 14, 1), poly([[hx - 4, hy + 24], [hx + 4, hy + 24], [hx, hy + 14]])],
    net: (hx, hy) => [rect(hx - 2, hy - 44, 4, 46, 2), ellipse(hx, hy - 58, 16, 14), D(path(`M${P(hx - 10, hy - 66)} l20 16 M${P(hx - 10, hy - 50)} l20 -16 M${P(hx, hy - 72)} v28 M${P(hx - 16, hy - 58)} h32`))],
    camera: (hx, hy) => [rect(hx - 14, hy - 10, 28, 20, 3), circle(hx, hy, 7), circle(hx, hy, 3), rect(hx - 6, hy - 14, 10, 5, 1), K(circle(hx + 10, hy - 6, 1.5))],
    magnifier: (hx, hy) => [rect(hx - 2.5, hy - 10, 5, 14, 2), circle(hx, hy - 24, 13), circle(hx, hy - 24, 9), D(path(`M${P(hx - 6, hy - 28)} q2 -4 6 -4`))],
    icecream: (hx, hy) => [poly([[hx - 8, hy - 8], [hx + 8, hy - 8], [hx, hy + 14]]), D(path(`M${P(hx - 5, hy - 2)} l5 8 M${P(hx + 5, hy - 2)} l-5 8 M${P(hx - 7, hy - 5)} h14`)), circle(hx, hy - 14, 9), circle(hx - 6, hy - 26, 8), circle(hx + 6, hy - 26, 8), K(circle(hx + 2, hy - 34, 1.5))],
    kite: (hx, hy) => { const cx = hx + 8, cy = hy - 70; return [D(path(`M${P(hx, hy)} Q${P(hx + 14, hy - 30)} ${P(cx, cy + 24)}`)), poly([[cx, cy - 24], [cx + 18, cy], [cx, cy + 24], [cx - 18, cy]]), line(cx, cy - 24, cx, cy + 24), line(cx - 18, cy, cx + 18, cy),
      D(path(`M${P(cx, cy + 24)} q-8 8 -4 16 q4 8 -2 16`)), ...[[cx - 5, cy + 34], [cx - 4, cy + 50]].map(p => D(path(`M${P(p[0] - 4, p[1] - 2)} l8 4 M${P(p[0] - 4, p[1] + 2)} l8 -4`)))]; },
    umbrella: (hx, hy) => [rect(hx - 1.5, hy - 46, 3, 48, 1), D(path(`M${P(hx, hy + 2)} q0 8 -6 6`)), path(`M${P(hx - 34, hy - 46)} Q${P(hx, hy - 90)} ${P(hx + 34, hy - 46)} Q${P(hx + 22, hy - 52)} ${P(hx + 12, hy - 46)} Q${P(hx, hy - 52)} ${P(hx - 12, hy - 46)} Q${P(hx - 22, hy - 52)} ${P(hx - 34, hy - 46)} Z`), D(path(`M${P(hx, hy - 88)} L${P(hx - 12, hy - 46)} M${P(hx, hy - 88)} L${P(hx + 12, hy - 46)}`))],
    torch: (hx, hy) => [rect(hx - 4, hy - 30, 8, 32, 3), path(`M${P(hx - 8, hy - 30)} q8 -34 16 0 z`), path(`M${P(hx - 4, hy - 30)} q4 -18 8 0 z`)],
    racket: (hx, hy) => [rect(hx - 2.5, hy - 26, 5, 28, 2), ellipse(hx, hy - 42, 12, 16), D(path(`M${P(hx - 8, hy - 42)} h16 M${P(hx, hy - 56)} v28 M${P(hx - 6, hy - 50)} v16 M${P(hx + 6, hy - 50)} v16 M${P(hx - 10, hy - 48)} h20 M${P(hx - 10, hy - 36)} h20`))],
    trophy: (hx, hy) => [rect(hx - 8, hy - 4, 16, 4, 1), rect(hx - 3, hy - 12, 6, 8, 1), path(`M${P(hx - 12, hy - 36)} h24 q0 26 -12 26 q-12 0 -12 -26 z`), D(path(`M${P(hx - 12, hy - 30)} q-10 0 -6 10 q3 6 8 4 M${P(hx + 12, hy - 30)} q10 0 6 10 q-3 6 -8 4`)), star(hx, hy - 22, 5)],
  };
  const SHIELD = (x, y) => place([path('M-18 -24 H18 V4 Q18 22 0 28 Q-18 22 -18 4 Z'), path('M-12 -18 H12 V2 Q12 14 0 20 Q-12 14 -12 2 Z'), star(0, 0, 8)], x, y);

  /* ---------- assemblage d'un personnage ---------- */
  function figure(opt) {
    const o = Object.assign({ hair: 'short', hat: null, top: 'tee', bottom: 'pants', shoes: 'shoes', sleeve: 'short', armL: 14, armR: 14, held: null, heldL: null, acc: [], face: {} }, opt);
    const E = [];
    const hL = [78 - 46 * Math.sin(rad(o.armL)), 78 + 46 * Math.cos(rad(o.armL))];
    const hR = [122 + 46 * Math.sin(rad(o.armR)), 78 + 46 * Math.cos(rad(o.armR))];
    const has = a => o.acc.includes(a);

    // arrière-plan du corps
    if (has('cape')) { E.push(path('M76 76 H124 L148 172 Q100 160 52 172 Z')); E.push(D(path('M92 90 L84 160 M108 90 L116 160'))); }
    if (has('wings')) { E.push(path('M76 84 Q30 40 40 104 Q44 132 78 112 Z')); E.push(path('M124 84 Q170 40 160 104 Q156 132 122 112 Z')); E.push(D(path('M72 96 Q52 76 50 94 M128 96 Q148 76 150 94'))); }
    if (has('bfwings')) { E.push(path('M76 86 Q20 40 30 96 Q34 120 76 108 Z')); E.push(path('M124 86 Q180 40 170 96 Q166 120 124 108 Z')); E.push(path('M76 110 Q36 120 44 154 Q60 166 78 128 Z')); E.push(path('M124 110 Q164 120 156 154 Q140 166 122 128 Z')); E.push(circle(48, 82, 8)); E.push(circle(152, 82, 8)); E.push(circle(56, 138, 5)); E.push(circle(144, 138, 5)); }
    if (o.top === 'hoodie') E.push(path('M74 46 Q74 20 100 20 Q126 20 126 46 L126 80 H74 Z'));
    if (o.hat !== 'astronaut' && o.hat !== 'knight') E.push(...HAIR_BACK[o.hair]());
    if (o.hat === 'astronaut') E.push(circle(100, 46, 34));
    if (o.hat === 'knight') E.push(path('M74 46 A26 28 0 0 1 126 46 V72 H74 Z'));

    // corps
    E.push(circle(79, 48, 4.5)); E.push(circle(121, 48, 4.5));
    E.push(rect(94, 64, 12, 10, 3));
    E.push(...BOTTOMS[o.bottom]());
    E.push(...SHOES[o.shoes]());
    E.push(...TOPS[o.top]());
    if (o.hat === 'astronaut') E.push(rect(82, 66, 36, 8, 3));

    // bras
    const arm = (side, a, hand, held) => {
      const sx = side < 0 ? 78 : 122, ang = side < 0 ? a : -a, tr = `rotate(${f(ang)} ${sx} 78)`;
      E.push(rect(sx - 6.5, 74, 13, 46, 6.5, { transform: tr }));
      if (o.sleeve === 'short') E.push(rect(sx - 7, 73, 14, 18, 6, { transform: tr }));
      if (o.sleeve === 'long') E.push(rect(sx - 7, 110, 14, 6, 2, { transform: tr }));
      if (o.sleeve === 'puff') E.push(ellipse(sx, 80, 11, 9));
      if (o.top === 'armor' || o.top === 'suit') E.push(rect(sx - 7, 92, 14, 5, 2, { transform: tr }));
      E.push(circle(hand[0], hand[1], 7));
      E.push(circle(hand[0] - side * 6, hand[1] - 3, 2.6));
    };
    if (o.held === 'guitar') E.push(...HELD.guitar());
    arm(-1, o.armL, hL);
    arm(1, o.armR, hR);
    if (o.heldL === 'shield') E.push(SHIELD(hL[0], hL[1]));
    if (o.held && o.held !== 'guitar') E.push(...HELD[o.held](hR[0], hR[1], hL));
    if (has('stethoscope')) { E.push(D(path('M90 76 Q92 100 100 102 Q108 100 110 76'))); E.push(circle(100, 108, 5)); E.push(circle(100, 108, 2)); }
    if (has('necklace')) { E.push(D(path('M90 74 Q100 84 110 74'))); E.push(heart(100, 84, 3)); }
    if (has('scarf')) { E.push(path('M86 70 Q100 80 114 70 Q114 78 100 84 Q86 78 86 70 Z')); E.push(rect(106, 78, 10, 26, 3)); E.push(D(path('M108 96 h6'))); }
    if (has('bag')) { E.push(D(path('M120 76 L140 118'))); E.push(rect(126, 114, 26, 20, 3)); E.push(path('M126 114 h26 v-4 q-13 -6 -26 0 z')); }

    // tête
    E.push(circle(100, 46, 21));
    E.push(...face(o.face));
    if (has('glasses')) { E.push(D(circle(91, 50, 7))); E.push(D(circle(109, 50, 7))); E.push(line(98, 50, 102, 50)); E.push(line(84, 49, 80, 47)); E.push(line(116, 49, 120, 47)); }
    if (has('goggles')) { E.push(D(ellipse(91, 50, 7.5, 6))); E.push(D(ellipse(109, 50, 7.5, 6))); E.push(rect(98, 48.5, 4, 3, 1)); E.push(D(path('M83.5 50 Q76 46 79 40 M116.5 50 Q124 46 121 40'))); }
    if (has('eyepatch')) { E.push(K(ellipse(109, 50, 6, 5.5))); E.push(D(path('M103 47 L84 36 M115 47 L122 40'))); }
    if (has('beard')) E.push(path('M82 52 Q84 78 100 80 Q116 78 118 52 Q112 66 100 66 Q88 66 82 52 Z'));
    if (has('mustache')) E.push(path('M90 58 Q95 54 100 58 Q105 54 110 58 Q105 62 100 60 Q95 62 90 58 Z'));
    if (has('mask')) { E.push(path('M80 44 Q90 38 100 44 Q110 38 120 44 Q118 56 108 56 Q104 50 100 52 Q96 50 92 56 Q82 56 80 44 Z')); }
    if (has('earrings')) { E.push(circle(78, 54, 2)); E.push(circle(122, 54, 2)); }
    if (o.hat !== 'astronaut' && o.hat !== 'knight') E.push(...HAIR_FRONT[o.hair]());
    if (o.hat) E.push(...HATS[o.hat]());
    return E;
  }

  /* ---------- décors derrière les personnages ---------- */
  const sun = (x, y, r) => [circle(x, y, r), D(path([0, 45, 90, 135, 180, 225, 270, 315].map(a => `M${P(x + (r + 4) * Math.cos(rad(a)), y + (r + 4) * Math.sin(rad(a)))} l${f(7 * Math.cos(rad(a)))} ${f(7 * Math.sin(rad(a)))}`).join(' ')))];
  const cloud = (x, y, s) => place([path('M-24 8 Q-30 -4 -16 -6 Q-12 -20 4 -14 Q14 -22 20 -8 Q34 -8 28 8 Z')], x, y, s);
  const tree = (x, y, s) => place([rect(-5, -10, 10, 30, 2), circle(0, -30, 20), circle(-14, -18, 13), circle(14, -18, 13), circle(0, -46, 12)], x, y, s);
  const bush = (x, y, s) => place([circle(-10, 0, 9), circle(10, 0, 9), circle(0, -6, 10)], x, y, s);
  const ground = (y, o) => [rect(0, y || 182, 200, 200 - (y || 182)), ...(o && o.grass ? [D(path('M10 182 l3 -6 l3 6 M40 182 l3 -6 l3 6 M150 182 l3 -6 l3 6 M180 182 l3 -6 l3 6'))] : [])];
  const outdoor = () => [rect(0, 0, 200, 182), ...sun(28, 28, 13), cloud(150, 28, 0.9), cloud(60, 20, 0.6), ...ground(182, { grass: true })];
  const indoor = (wallY) => [rect(0, 0, 200, wallY || 150), rect(0, wallY || 150, 200, 200 - (wallY || 150)), D(path(`M0 ${wallY || 150} H200`))];
  const stars = (pts) => pts.map(p => star(p[0], p[1], p[2] || 4));
  const flowerRow = (y) => [line(20, y + 14, 20, y + 4), line(36, y + 16, 36, y + 6), line(176, y + 14, 176, y + 4), ...flower(20, y, 4), ...flower(36, y + 2, 4), ...flower(176, y, 4)];

  /* ---------- catalogue ---------- */
  const F = (id, name, o, bg, fg) => ({ id, name, make: () => [...(bg ? bg() : []), ...figure(o), ...(fg ? fg() : [])] });
  const G = { lashes: true }, GF = { lashes: true, freckles: true }, OPEN = { mouth: 'open' }, GOPEN = { lashes: true, mouth: 'open' };

  const METIERS = [
    F('pompiere', 'Pompière', { hair: 'ponytail', hat: 'helmet', top: 'jacket', sleeve: 'long', shoes: 'boots', armR: 44, held: 'hose', face: G },
      () => [...outdoor(), place([rect(-40, -60, 80, 60, 3), rect(-30, -50, 22, 20, 2), rect(8, -50, 22, 20, 2), rect(-10, -24, 20, 24, 2), poly([[-46, -60], [0, -92], [46, -60]]), path('M14 -80 q6 -20 12 0 q-2 -10 -6 -14 q-4 4 -6 14 z')], 40, 182, 1)]),
    F('pompier', 'Pompier', { hair: 'short', hat: 'helmet', top: 'jacket', sleeve: 'long', shoes: 'boots', armR: 44, held: 'hose', acc: ['mustache'] },
      () => [...outdoor(), place([rect(-40, -60, 80, 60, 3), rect(-30, -50, 22, 20, 2), rect(8, -50, 22, 20, 2), rect(-10, -24, 20, 24, 2), poly([[-46, -60], [0, -92], [46, -60]]), path('M14 -80 q6 -20 12 0 q-2 -10 -6 -14 q-4 4 -6 14 z')], 40, 182, 1)]),
    F('docteure', 'Docteure', { hair: 'bun', top: 'coat', sleeve: 'long', armL: 8, acc: ['stethoscope', 'glasses'], face: G },
      () => [...indoor(150), rect(14, 40, 40, 30, 3), D(path('M22 50 h24 M22 58 h24 M22 66 h16')), rect(150, 60, 34, 60, 3), rect(156, 66, 22, 12, 2), rect(156, 84, 22, 12, 2), rect(156, 102, 22, 12, 2), heart(167, 72, 3), rect(158, 88, 18, 4, 1), circle(167, 108, 3)]),
    F('infirmier', 'Infirmier', { hair: 'curly', hat: 'nurse', top: 'scrubs', sleeve: 'short', armR: 40, held: 'flask', acc: ['stethoscope'], face: OPEN },
      () => [...indoor(150), rect(20, 30, 36, 24, 3), circle(38, 42, 8), D(path('M38 36 v6 h4')), rect(150, 100, 40, 50, 3), rect(156, 106, 28, 10, 2), rect(156, 122, 28, 10, 2), rect(156, 138, 28, 8, 2)]),
    F('astronaute', 'Astronaute', { hair: 'bun', hat: 'astronaut', top: 'suit', sleeve: 'long', shoes: 'boots', armL: 30, armR: 30, face: G },
      () => [rect(0, 0, 200, 200), circle(160, 40, 18), circle(152, 34, 4), circle(166, 46, 6), circle(158, 50, 2.5), ...stars([[30, 30, 6], [60, 70, 4], [180, 100, 5], [24, 120, 4], [150, 150, 3], [40, 170, 5]]), path('M0 200 Q40 150 100 170 Q160 190 200 160 V200 Z'), circle(40, 184, 8), circle(140, 182, 6), circle(90, 190, 4)],
      () => [poly([[150, 190], [150, 140], [176, 140]]), rect(148, 140, 4, 52), ...stars([[163, 158, 6]])]),
    F('astronaute2', 'Astronaute', { hair: 'short', hat: 'astronaut', top: 'suit', sleeve: 'long', shoes: 'boots', armL: 30, armR: 30, face: OPEN },
      () => [rect(0, 0, 200, 200), circle(40, 44, 16), circle(34, 40, 3), circle(46, 50, 5), ...stars([[170, 30, 6], [140, 60, 4], [20, 100, 5], [176, 110, 4], [50, 150, 3], [160, 170, 5]]), path('M0 200 Q40 150 100 170 Q160 190 200 160 V200 Z'), circle(60, 184, 8), circle(150, 182, 6)],
      () => [place([path('M0 -50 Q-14 -30 -14 0 V16 H14 V0 Q14 -30 0 -50 Z'), poly([[-14, 0], [-24, 16], [-14, 16]]), poly([[14, 0], [24, 16], [14, 16]]), circle(0, -14, 6), path('M-8 16 q8 20 16 0 z')], 172, 176, 1)]),
    F('cheffe', 'Cheffe cuisinière', { hair: 'ponytail', hat: 'toque', top: 'chef', sleeve: 'long', armR: 40, held: 'whisk', acc: ['scarf'], face: G },
      () => [...indoor(150), rect(10, 90, 50, 60, 3), rect(14, 96, 42, 6, 2), rect(20, 106, 30, 22, 2), D(path('M20 112 h30 M20 118 h30')), ellipse(160, 74, 24, 10), rect(136, 74, 48, 30, 4), D(path('M136 88 h48')), path('M172 60 q6 -14 0 -22 M160 58 q-6 -14 0 -22'), rect(20, 40, 20, 30, 2), circle(30, 36, 8)]),
    F('boulanger', 'Boulanger', { hair: 'short', hat: 'toque', top: 'apron', sleeve: 'long', armR: 40, held: 'bread', face: OPEN, acc: ['beard'] },
      () => [...indoor(150), rect(8, 44, 50, 100, 3), rect(12, 50, 42, 40, 2), rect(12, 96, 42, 40, 2), ellipse(22, 70, 6, 12), ellipse(34, 68, 6, 12), ellipse(46, 70, 6, 12), circle(24, 116, 8), circle(44, 116, 8), rect(144, 60, 46, 90, 3), rect(150, 70, 34, 60, 2), D(path('M150 90 h34 M150 110 h34')), circle(167, 80, 4), circle(167, 100, 4), circle(167, 120, 4)]),
    F('policiere', 'Policière', { hair: 'bun', hat: 'cap', top: 'police', sleeve: 'long', armL: 30, face: G },
      () => [...outdoor(), rect(20, 100, 60, 82, 4), rect(26, 108, 20, 20, 2), rect(54, 108, 20, 20, 2), rect(26, 136, 20, 20, 2), rect(54, 136, 20, 20, 2), rect(40, 160, 20, 22, 2), rect(150, 150, 8, 32, 2), circle(154, 138, 12), circle(154, 138, 5), K(circle(154, 138, 5))]),
    F('pilote', 'Pilote', { hair: 'short', hat: 'cap', top: 'shirt', sleeve: 'long', acc: ['glasses'], face: OPEN },
      () => [...outdoor(), place([ellipse(0, 0, 44, 10), poly([[-16, -8], [-40, -34], [-28, -34], [6, -8]]), poly([[-16, 8], [-40, 30], [-28, 30], [6, 8]]), poly([[-44, -2], [-54, -22], [-46, -22], [-38, -6]]), rect(-2, -6, 18, 6, 3), circle(48, 0, 3)], 150, 100, 1)]),
    F('scientifique', 'Scientifique', { hair: 'curly', top: 'coat', sleeve: 'long', armR: 40, held: 'flask', acc: ['goggles'], face: G },
      () => [...indoor(150), rect(10, 60, 50, 90, 3), rect(16, 66, 38, 20, 2), rect(16, 92, 38, 20, 2), D(path('M20 76 h30 M20 102 h30')), rect(144, 110, 46, 40, 3), rect(150, 116, 34, 24, 2), D(path('M156 122 h22 M156 128 h22 M156 134 h14')), path('M160 74 q-4 -30 8 -30 q12 0 8 30 z'), rect(162, 40, 12, 6, 2), path('M150 110 l6 -30 h8 l6 30 z')]),
    F('macon', 'Maçon', { hair: 'short', hat: 'hardhat', top: 'overalls', sleeve: 'short', shoes: 'boots', armR: 40, held: 'trowel', face: OPEN },
      () => { const E = [...outdoor()]; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) E.push(rect(8 + c * 22 + (r % 2) * 11, 182 - (r + 1) * 12, 20, 10, 1)); E.push(rect(150, 100, 8, 82)); E.push(rect(140, 96, 50, 6, 2)); E.push(D(path('M190 102 v40'))); E.push(rect(180, 142, 20, 14, 2)); return E; }),
    F('mecanicienne', 'Mécanicienne', { hair: 'braids', top: 'overalls', sleeve: 'short', shoes: 'boots', armR: 40, held: 'wrench', face: GF },
      () => [...indoor(150), rect(10, 70, 46, 80, 3), rect(14, 76, 38, 14, 2), rect(14, 96, 38, 14, 2), rect(14, 116, 38, 14, 2), K(circle(30, 83, 1.5)), K(circle(30, 103, 1.5)), K(circle(30, 123, 1.5)), rect(144, 120, 50, 30, 6), path('M154 120 L162 100 H184 L190 120 Z'), circle(156, 152, 10), circle(184, 152, 10), circle(156, 152, 4), circle(184, 152, 4)]),
    F('veterinaire', 'Vétérinaire', { hair: 'long', top: 'coat', sleeve: 'long', armL: 6, acc: ['stethoscope'], face: G },
      () => [...indoor(150), rect(14, 40, 40, 30, 3), heart(34, 55, 8), rect(150, 110, 44, 40, 4), D(path('M150 120 h44'))],
      () => [place(animal('chat'), 4, 112, 0.36), place(animal('chien'), 148, 116, 0.34)]),
    F('musicien', 'Musicien', { hair: 'afro', top: 'stripes', sleeve: 'short', armL: 30, armR: 34, held: 'guitar', face: OPEN },
      () => [...indoor(150), D(path('M20 30 q8 -6 16 0 M150 40 q8 -6 16 0')), place([ellipse(-4, 8, 5, 4), rect(0, -18, 2, 26), path('M2 -18 q10 4 6 12 q-2 -6 -6 -6 z')], 30, 60, 1), place([ellipse(-4, 8, 5, 4), rect(0, -18, 2, 26), path('M2 -18 q10 4 6 12 q-2 -6 -6 -6 z')], 170, 90, 1), place([ellipse(-4, 8, 5, 4), ellipse(12, 6, 5, 4), rect(0, -18, 2, 26), rect(16, -20, 2, 26), rect(0, -20, 18, 4)], 150, 50, 1)]),
    F('footballeuse', 'Footballeuse', { hair: 'ponytail', top: 'jersey', bottom: 'shorts', sleeve: 'short', armL: 30, armR: 40, held: 'trophy', face: GOPEN },
      () => [...outdoor(), rect(120, 110, 70, 50), D(path('M124 114 v42 M132 114 v42 M140 114 v42 M148 114 v42 M156 114 v42 M164 114 v42 M172 114 v42 M180 114 v42 M188 114 v42 M124 122 h64 M124 132 h64 M124 142 h64 M124 152 h64')), rect(118, 106, 4, 56), rect(188, 106, 4, 56), rect(118, 106, 74, 4)],
      () => [circle(40, 174, 12), D(poly([[40, 166], [47, 171], [44, 180], [36, 180], [33, 171]])), D(path('M40 166 v-4 M47 171 l4 -2 M44 180 l2 4 M36 180 l-2 4 M33 171 l-4 -2'))]),
    F('peintre', 'Peintre', { hair: 'bob', hat: 'beret', top: 'overalls', sleeve: 'long', armR: 40, armL: 30, held: 'brush', face: G },
      () => [...indoor(150), rect(130, 30, 60, 70, 2), rect(136, 36, 48, 58), rect(130, 100, 4, 82), rect(186, 100, 4, 82), ...sun(150, 52, 8), path('M136 94 L156 70 L170 84 L180 74 L184 94 Z'), rect(10, 120, 40, 62, 3), rect(16, 126, 28, 14, 2), rect(16, 144, 28, 14, 2), circle(30, 170, 7)]),
    F('jardiniere', 'Jardinière', { hair: 'long', hat: 'sunhat', top: 'overalls', sleeve: 'short', shoes: 'boots', armR: 36, held: 'can', face: GF },
      () => [...outdoor(), tree(40, 182, 1), ...flowerRow(160), bush(170, 178, 1)],
      () => [ellipse(34, 178, 14, 5), rect(22, 156, 24, 22, 2), rect(20, 152, 28, 6, 2), line(34, 152, 34, 134), ...flower(34, 128, 5)]),
    F('maitresse', "Maîtresse d'école", { hair: 'bun', top: 'blouse', bottom: 'skirt', sleeve: 'long', armR: 40, held: 'book', acc: ['glasses', 'necklace'], face: G },
      () => [...indoor(150), rect(8, 30, 70, 50, 2), rect(12, 34, 62, 42), D(path('M20 46 h30 M20 56 h40 M20 66 h20')), rect(134, 120, 58, 30, 3), rect(138, 150, 6, 32), rect(182, 150, 6, 32), rect(150, 40, 30, 40, 2), circle(165, 60, 12), circle(165, 60, 3), D(path('M165 60 l0 -8 M165 60 l6 3'))]),
    F('danseuse', 'Danseuse', { hair: 'bun', hat: 'tiara', top: 'dress', bottom: 'tutu', shoes: 'ballet', sleeve: 'puff', armL: 150, armR: 150, face: G },
      () => [...indoor(150), rect(0, 0, 200, 40), D(path('M0 40 Q30 60 60 40 T120 40 T180 40 T240 40')), rect(0, 0, 40, 200), rect(160, 0, 40, 200), ...stars([[100, 20, 8], [60, 24, 5], [140, 24, 5]])]),
    F('reine', 'Reine', { hair: 'long', hat: 'crown', top: 'gown', bottom: 'none', shoes: 'none', sleeve: 'puff', acc: ['necklace', 'earrings'], face: G },
      () => [...indoor(150), rect(0, 0, 40, 200), rect(160, 0, 40, 200), rect(40, 0, 20, 150), rect(140, 0, 20, 150), path('M60 0 H140 V60 Q100 90 60 60 Z'), rect(60, 150, 80, 32), heart(100, 26, 8)]),
    F('roi', 'Roi', { hair: 'short', hat: 'crown', top: 'shirt', sleeve: 'long', acc: ['cape', 'beard'], armR: 40, held: 'staff' },
      () => [...indoor(150), rect(0, 0, 40, 200), rect(160, 0, 40, 200), rect(40, 0, 20, 150), rect(140, 0, 20, 150), path('M60 0 H140 V60 Q100 90 60 60 Z'), rect(60, 150, 80, 32), star(100, 28, 10)]),
    F('dj', 'DJ', { hair: 'curly', hat: 'headphones', top: 'hoodie', sleeve: 'long', armR: 60, held: 'mic', face: OPEN },
      () => [rect(0, 0, 200, 200), ...stars([[20, 24, 6], [180, 30, 8], [40, 100, 4], [170, 120, 5]]), rect(0, 150, 200, 50), D(path('M0 160 h200 M0 170 h200')), rect(10, 110, 50, 40, 3), circle(24, 130, 10), circle(46, 130, 10), circle(24, 130, 3), circle(46, 130, 3), rect(140, 110, 50, 40, 3), circle(154, 130, 10), circle(176, 130, 10)]),
  ];

  /* ---------- héros et légendes ---------- */
  function mermaid() {
    const E = [rect(0, 0, 200, 200), path('M0 110 Q30 96 60 110 T120 110 T180 110 T240 110 V200 H0 Z'), D(path('M0 130 Q20 122 40 130 T80 130 M120 150 Q140 142 160 150 T200 150')),
      circle(30, 40, 4), circle(38, 26, 3), circle(26, 14, 2), circle(170, 60, 4), circle(178, 46, 3),
      path('M150 200 q-4 -30 8 -40 q8 20 0 40 z'), path('M158 200 q4 -34 14 -40 q4 22 -4 40 z'), path('M140 200 q-2 -24 6 -30 q6 16 0 30 z'),
      place([ellipse(0, 0, 14, 10), ellipse(-4, -4, 4, 3), ellipse(4, -2, 3, 2), circle(2, 4, 2)], 30, 160, 1), star(60, 184, 8), star(170, 176, 6),
      path('M50 176 q-12 -20 4 -34 q8 -16 24 -8 q14 -12 22 6 q12 6 4 20 q-6 12 -20 14 z'),
      D(path('M60 168 q6 -10 16 -6 M76 168 q6 -10 16 -6 M64 156 q6 -10 16 -6')),
    ];
    // queue
    E.push(path('M74 128 Q60 150 68 176 Q76 192 96 188 Q118 190 128 176 Q134 150 126 128 Z'));
    E.push(poly([[64, 176], [30, 168], [44, 190], [30, 200], [72, 194]])); E.push(D(path('M40 174 L62 184 M40 196 L64 190')));
    for (let y = 136; y <= 172; y += 10) for (let x = 74; x <= 126; x += 10) E.push(D(path(`M${P(x - 4 + ((y / 10) % 2) * 5, y)} a5 5 0 0 0 10 0`)));
    E.push(...HAIR_BACK.long());
    E.push(circle(79, 48, 4.5)); E.push(circle(121, 48, 4.5)); E.push(rect(94, 64, 12, 10, 3));
    E.push(path('M76 78 Q76 72 82 72 H118 Q124 72 124 78 V128 H76 Z'));
    E.push(path('M78 84 Q100 74 122 84 Q122 94 100 100 Q78 94 78 84 Z')); E.push(path('M78 84 Q90 78 100 90 Z')); E.push(path('M122 84 Q110 78 100 90 Z'));
    E.push(rect(76, 122, 48, 8, 3)); E.push(...stars([[86, 126, 3.5], [100, 126, 3.5], [114, 126, 3.5]]));
    const hL = [78 - 46 * Math.sin(rad(70)), 78 + 46 * Math.cos(rad(70))], hR = [122 + 46 * Math.sin(rad(120)), 78 + 46 * Math.cos(rad(120))];
    E.push(rect(71.5, 74, 13, 46, 6.5, { transform: 'rotate(70 78 78)' })); E.push(circle(hL[0], hL[1], 7)); E.push(circle(hL[0] + 6, hL[1] - 3, 2.6));
    E.push(rect(115.5, 74, 13, 46, 6.5, { transform: 'rotate(-120 122 78)' })); E.push(circle(hR[0], hR[1], 7)); E.push(circle(hR[0] - 6, hR[1] - 3, 2.6));
    E.push(place([path('M0 -12 Q-14 -18 -16 -4 Q-14 8 0 14 Q14 8 16 -4 Q14 -18 0 -12 Z'), circle(0, 0, 4)], hR[0] - 2, hR[1] - 8, 1));
    E.push(circle(100, 46, 21)); E.push(...face({ lashes: true })); E.push(...HAIR_FRONT.long());
    E.push(star(80, 34, 5)); E.push(...flower(118, 30, 4));
    return E;
  }
  function dragon() {
    const E = [rect(0, 0, 200, 200), cloud(40, 36, 0.8), cloud(164, 50, 0.7), rect(0, 150, 200, 50),
      path('M0 150 L34 96 L68 150 Z'), path('M130 150 L166 90 L200 150 Z'), D(path('M26 110 l8 -14 l8 14 M158 104 l8 -14 l8 14')),
      place([rect(-14, -60, 28, 60, 2), poly([[-14, -60], [-14, -68], [-8, -60]]), poly([[-4, -60], [-4, -68], [2, -60]]), poly([[6, -60], [6, -68], [12, -60]]), rect(-4, -40, 8, 12, 4), path('M-6 0 a6 8 0 0 1 12 0 z')], 20, 150, 1)];
    // queue
    E.push(path('M60 140 Q20 150 18 120 Q20 100 40 106 Q30 122 62 124 Z')); E.push(poly([[26, 106], [14, 88], [36, 96]])); E.push(D(path('M44 112 q8 4 14 0')));
    // aile arrière
    E.push(path('M90 100 Q104 24 168 36 Q136 52 132 82 Q158 76 154 104 Q124 98 92 112 Z')); E.push(D(path('M94 104 Q116 60 146 44 M94 104 Q124 84 144 84')));
    // pattes arrière
    E.push(ellipse(70, 156, 15, 17)); E.push(ellipse(70, 172, 15, 8)); E.push(D(path('M60 178 l-3 5 M70 180 v5 M80 178 l3 5')));
    // corps
    E.push(path('M56 128 Q54 96 90 92 Q136 90 136 132 Q132 166 96 168 Q60 166 56 128 Z'));
    E.push(path('M66 140 Q70 120 96 120 Q124 122 126 146 Q120 164 96 164 Q72 162 66 140 Z'));
    E.push(D(path('M70 134 h50 M70 146 h52 M76 156 h40')));
    // pattes avant
    E.push(ellipse(118, 158, 14, 16)); E.push(ellipse(120, 174, 15, 8)); E.push(D(path('M110 180 l-3 5 M120 182 v5 M130 180 l3 5')));
    // pics du dos
    [[70, 100], [86, 92], [104, 90], [122, 96]].forEach(p => E.push(poly([[p[0] - 7, p[1] + 6], [p[0], p[1] - 10], [p[0] + 7, p[1] + 6]])));
    // aile avant
    // cou et tête
    E.push(path('M116 110 Q140 100 142 70 L164 74 Q160 100 134 118 Z')); E.push(D(path('M126 108 q6 2 10 -2 M132 100 q6 2 10 -2')));
    E.push(ellipse(150, 58, 24, 20)); E.push(ellipse(170, 66, 16, 11));
    E.push(poly([[136, 44], [140, 24], [150, 42]])); E.push(poly([[150, 40], [160, 24], [164, 44]]));
    E.push(circle(148, 56, 6.5)); E.push(K(circle(149, 57, 3))); E.push(D(path('M140 48 q6 -4 12 0')));
    E.push(D(path('M158 72 q10 4 22 -2'))); E.push(poly([[166, 72], [170, 78], [174, 72]])); E.push(K(circle(180, 63, 1.6)));
    E.push(path('M186 64 q14 -12 10 -30 q8 12 2 26 q10 -4 14 -12 q0 14 -14 22 z'));
    E.push(D(path('M152 74 q2 4 0 8'))); E.push(heart(96, 142, 6));
    return E;
  }
  function robot() {
    const E = [rect(0, 0, 200, 200), rect(0, 160, 200, 40), D(path('M0 170 h200 M0 180 h200 M0 190 h200')), rect(10, 40, 60, 40, 4), rect(16, 46, 48, 28, 2), D(path('M22 54 h36 M22 60 h36 M22 66 h20')),
      rect(150, 30, 40, 60, 4), circle(170, 46, 8), circle(170, 46, 3), rect(158, 62, 24, 6, 2), rect(158, 74, 24, 6, 2), K(circle(160, 44, 2))];
    E.push(rect(96, 12, 8, 14, 2)); E.push(circle(100, 10, 5)); E.push(D(path('M92 18 q-8 4 -8 12 M108 18 q8 4 8 12')));
    E.push(rect(72, 24, 56, 44, 8)); E.push(rect(80, 30, 40, 30, 4)); E.push(rect(64, 36, 8, 18, 3)); E.push(rect(128, 36, 8, 18, 3));
    E.push(circle(90, 42, 7)); E.push(circle(110, 42, 7)); E.push(K(circle(90, 42, 3))); E.push(K(circle(110, 42, 3)));
    E.push(rect(86, 50, 28, 6, 3)); E.push(D(path('M90 53 h4 M96 53 h4 M102 53 h4 M108 53 h4')));
    E.push(rect(92, 68, 16, 8, 2)); E.push(D(path('M92 72 h16')));
    E.push(rect(66, 76, 68, 60, 8)); E.push(rect(74, 84, 52, 22, 4)); E.push(D(path('M78 90 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6')));
    E.push(circle(84, 120, 6)); E.push(circle(100, 120, 6)); E.push(circle(116, 120, 6)); E.push(K(circle(84, 120, 2))); E.push(K(circle(100, 120, 2))); E.push(K(circle(116, 120, 2)));
    E.push(rect(74, 128, 52, 6, 2));
    // bras
    E.push(rect(44, 80, 20, 40, 6)); E.push(rect(136, 80, 20, 40, 6)); E.push(D(path('M44 90 h20 M44 100 h20 M44 110 h20 M136 90 h20 M136 100 h20 M136 110 h20')));
    E.push(circle(54, 78, 8)); E.push(circle(146, 78, 8));
    E.push(path('M44 120 h20 l4 16 h-8 l-6 -8 l-6 8 h-8 z')); E.push(path('M136 120 h20 l4 16 h-8 l-6 -8 l-6 8 h-8 z'));
    // jambes
    E.push(rect(74, 136, 20, 30, 4)); E.push(rect(106, 136, 20, 30, 4)); E.push(D(path('M74 146 h20 M74 156 h20 M106 146 h20 M106 156 h20')));
    E.push(rect(66, 164, 32, 12, 4)); E.push(rect(102, 164, 32, 12, 4)); E.push(D(path('M72 170 h4 M78 170 h4 M108 170 h4 M114 170 h4')));
    return E;
  }
  function knightHorse() {
    const E = [...outdoor(), place([rect(-40, -60, 80, 60, 2), rect(-50, -90, 22, 92, 2), rect(28, -90, 22, 92, 2), poly([[-50, -90], [-50, -100], [-42, -90]]), poly([[-34, -90], [-34, -100], [-28, -90]]), poly([[28, -90], [28, -100], [36, -90]]), poly([[44, -90], [44, -100], [50, -90]]), path('M-12 0 a12 14 0 0 1 24 0 z'), rect(-30, -48, 12, 16, 2), rect(18, -48, 12, 16, 2), rect(-4, -120, 2, 40), poly([[-2, -120], [22, -112], [-2, -104]])], 46, 182, 0.8)];
    // cheval
    E.push(path('M92 178 Q84 150 100 128 Q120 120 140 130 Q160 120 168 100 Q176 96 178 108 Q172 130 160 150 Q160 178 156 180 H148 L150 150 Q130 152 112 152 L108 180 Z'));
    E.push(path('M166 100 Q186 92 190 108 Q184 116 172 114 Z')); E.push(K(circle(178, 104, 2))); E.push(D(path('M186 108 q-2 4 -6 2')));
    E.push(path('M160 96 Q150 82 158 76 Q166 84 168 98 Z')); E.push(path('M162 100 L166 126 L172 100 Z'));
    E.push(path('M84 150 Q60 156 68 176 Q76 184 84 172 Z')); E.push(D(path('M66 168 q8 -8 16 -8')));
    E.push(rect(96, 150, 10, 30, 4)); E.push(rect(140, 150, 10, 30, 4)); E.push(rect(92, 178, 18, 6, 2)); E.push(rect(136, 178, 18, 6, 2));
    E.push(path('M104 130 Q124 118 144 128 L146 140 Q124 136 102 142 Z')); E.push(D(path('M124 130 v10')));
    // chevalier assis (petit)
    E.push(place(figure({ hair: 'short', hat: 'knight', top: 'armor', sleeve: 'long', shoes: 'boots', bottom: 'pants', armL: 40, armR: 30, held: 'sword', heldL: 'shield' }), 66, 42, 0.62));
    return E;
  }

  const HEROS = [
    F('chevaliere', 'Chevalière', { hair: 'braids', hat: 'knight', top: 'armor', sleeve: 'long', shoes: 'boots', armL: 40, armR: 40, held: 'sword', heldL: 'shield', face: G },
      () => [...outdoor(), place([rect(-40, -60, 80, 60, 2), rect(-52, -92, 24, 94, 2), rect(28, -92, 24, 94, 2), poly([[-52, -92], [-52, -102], [-44, -92]]), poly([[-36, -92], [-36, -102], [-28, -92]]), poly([[28, -92], [28, -102], [36, -92]]), poly([[44, -92], [44, -102], [52, -92]]), path('M-12 0 a12 14 0 0 1 24 0 z'), rect(-30, -46, 12, 16, 2), rect(18, -46, 12, 16, 2), rect(-2, -124, 2, 42), poly([[0, -124], [24, -116], [0, -108]])], 40, 182, 0.9)]),
    F('chevalier', 'Chevalier', { hair: 'short', hat: 'knight', top: 'armor', sleeve: 'long', shoes: 'boots', armL: 40, armR: 40, held: 'sword', heldL: 'shield' },
      () => [...outdoor(), place([rect(-40, -60, 80, 60, 2), rect(-52, -92, 24, 94, 2), rect(28, -92, 24, 94, 2), poly([[-52, -92], [-52, -102], [-44, -92]]), poly([[-36, -92], [-36, -102], [-28, -92]]), poly([[28, -92], [28, -102], [36, -92]]), poly([[44, -92], [44, -102], [52, -92]]), path('M-12 0 a12 14 0 0 1 24 0 z'), rect(-30, -46, 12, 16, 2), rect(18, -46, 12, 16, 2), rect(-2, -124, 2, 42), poly([[0, -124], [24, -116], [0, -108]])], 160, 182, 0.9)]),
    { id: 'chevalier-cheval', name: 'Chevalier à cheval', make: knightHorse },
    F('princesse', 'Princesse', { hair: 'long', hat: 'tiara', top: 'gown', bottom: 'none', shoes: 'none', sleeve: 'puff', acc: ['necklace', 'earrings'], armR: 40, held: 'flowers', face: G },
      () => [...outdoor(), place([rect(-30, -60, 60, 60, 2), rect(-44, -90, 20, 90, 2), rect(24, -90, 20, 90, 2), poly([[-46, -90], [-34, -116], [-22, -90]]), poly([[22, -90], [34, -116], [46, -90]]), rect(-8, -80, 16, 22, 8), rect(-38, -70, 8, 12, 4), rect(30, -70, 8, 12, 4), path('M-10 0 a10 14 0 0 1 20 0 z'), rect(-2, -136, 2, 20), poly([[0, -136], [14, -130], [0, -124]])], 40, 182, 0.9), ...flowerRow(164)]),
    F('prince', 'Prince', { hair: 'short', hat: 'crown', top: 'vest', sleeve: 'long', shoes: 'boots', acc: ['cape'], armR: 40, held: 'sword' },
      () => [...outdoor(), place([rect(-30, -60, 60, 60, 2), rect(-44, -90, 20, 90, 2), rect(24, -90, 20, 90, 2), poly([[-46, -90], [-34, -116], [-22, -90]]), poly([[22, -90], [34, -116], [46, -90]]), rect(-8, -80, 16, 22, 8), path('M-10 0 a10 14 0 0 1 20 0 z'), rect(-2, -136, 2, 20), poly([[0, -136], [14, -130], [0, -124]])], 160, 182, 0.9), tree(30, 182, 1)]),
    F('fee', 'Fée', { hair: 'bun', hat: 'flowers', top: 'tunic', bottom: 'none', shoes: 'ballet', sleeve: 'none', acc: ['wings'], armR: 60, held: 'wand', face: G },
      () => [...outdoor(), tree(30, 182, 1.1), tree(176, 182, 0.9), ...flowerRow(164), ...stars([[60, 60, 5], [140, 50, 4], [40, 110, 3], [160, 110, 4]]), place([circle(0, 0, 8), circle(-8, 8, 6), circle(8, 8, 6), rect(-3, 8, 6, 12, 2), K(circle(-3, -2, 1.5)), K(circle(3, -2, 1.5))], 120, 172, 1)]),
    F('pirate', 'Pirate', { hair: 'long', hat: 'pirate', top: 'vest', sleeve: 'long', shoes: 'boots', acc: ['eyepatch', 'earrings'], armR: 50, held: 'cutlass', face: OPEN },
      () => [rect(0, 0, 200, 200), ...sun(170, 30, 12), path('M0 120 Q30 108 60 120 T120 120 T180 120 T240 120 V200 H0 Z'), D(path('M20 140 q10 -6 20 0 M140 160 q10 -6 20 0')), rect(0, 176, 200, 24), D(path('M40 186 q6 -4 12 0 M140 190 q6 -4 12 0')),
        place([path('M-40 0 L40 0 L28 16 H-28 Z'), rect(-2, -60, 4, 60), path('M2 -58 Q30 -44 2 -20 Z'), path('M-2 -58 Q-30 -44 -2 -20 Z'), poly([[-2, -64], [8, -60], [-2, -56]])], 46, 120, 0.9),
        rect(150, 150, 30, 26, 3), D(path('M150 158 h30 M150 168 h30')), ellipse(165, 150, 15, 5), star(165, 140, 5), circle(176, 146, 3), circle(156, 144, 3)]),
    F('sorciere', 'Sorcière', { hair: 'long', hat: 'witch', top: 'dress', bottom: 'none', sleeve: 'long', shoes: 'boots', armR: 46, held: 'broom', face: G },
      () => [rect(0, 0, 200, 200), circle(160, 40, 24), circle(152, 32, 5), circle(168, 48, 7), ...stars([[30, 30, 6], [70, 20, 4], [40, 80, 5], [180, 100, 4], [20, 130, 3]]), rect(0, 176, 200, 24),
        place([ellipse(0, 10, 20, 14), ellipse(0, -4, 14, 4), D(path('M-8 -12 q4 -8 8 -4 q4 -8 8 -2')), rect(-16, -4, 32, 4, 2)], 36, 160, 1), bush(170, 178, 1), place([path('M-4 0 L4 0 L2 -20 H-2 Z'), path('M-14 -20 H14 L0 -34 Z'), K(ellipse(0, -8, 2, 3))], 168, 168, 1)]),
    F('magicien', 'Magicien', { hair: 'long', hat: 'wizard', top: 'coat', sleeve: 'long', acc: ['beard'], armR: 46, held: 'staff' },
      () => [rect(0, 0, 200, 200), circle(40, 40, 18), circle(34, 34, 4), circle(46, 46, 6), ...stars([[170, 30, 7], [130, 24, 4], [180, 80, 5], [20, 120, 4], [180, 140, 4]]), rect(0, 176, 200, 24),
        place([rect(-14, 0, 28, 36, 2), rect(-10, 4, 20, 8, 1), rect(-10, 16, 20, 8, 1), D(path('M-6 8 h12 M-6 20 h12'))], 36, 140, 1), place([path('M-16 0 q-6 -30 16 -30 q22 0 16 30 z'), rect(-8, -34, 16, 6, 2), D(path('M-6 -10 q6 -10 12 0'))], 160, 176, 1)]),
    F('superheroine', 'Super-héroïne', { hair: 'ponytail', top: 'hero', sleeve: 'long', shoes: 'boots', acc: ['cape', 'mask'], armL: 170, armR: 40, face: GOPEN },
      () => [rect(0, 0, 200, 200), cloud(40, 40, 0.8), cloud(160, 30, 0.9), rect(0, 176, 200, 24), rect(10, 90, 30, 86), rect(50, 110, 40, 66), rect(150, 100, 40, 76), D(path('M16 100 h6 M28 100 h6 M16 116 h6 M28 116 h6 M16 132 h6 M28 132 h6 M58 120 h8 M74 120 h8 M58 138 h8 M74 138 h8 M156 110 h8 M172 110 h8 M156 126 h8 M172 126 h8 M156 142 h8 M172 142 h8'))]),
    F('superheros', 'Super-héros', { hair: 'short', top: 'hero', sleeve: 'long', shoes: 'boots', acc: ['cape', 'mask'], armL: 170, armR: 40, face: OPEN },
      () => [rect(0, 0, 200, 200), cloud(50, 30, 0.9), cloud(170, 50, 0.7), rect(0, 176, 200, 24), rect(10, 90, 30, 86), rect(50, 110, 40, 66), rect(150, 100, 40, 76), D(path('M16 100 h6 M28 100 h6 M16 116 h6 M28 116 h6 M16 132 h6 M28 132 h6 M58 120 h8 M74 120 h8 M58 138 h8 M74 138 h8 M156 110 h8 M172 110 h8 M156 126 h8 M172 126 h8 M156 142 h8 M172 142 h8'))]),
    { id: 'sirene', name: 'Sirène', make: mermaid },
    { id: 'dragon', name: 'Dragon', make: dragon },
    { id: 'robot', name: 'Robot', make: robot },
    F('elfe', 'Elfe des bois', { hair: 'bob', hat: 'flowers', top: 'tunic', bottom: 'pants', sleeve: 'long', shoes: 'boots', armR: 40, held: 'lantern', face: GF },
      () => [...outdoor(), tree(24, 182, 1.2), tree(176, 182, 1.1), bush(60, 178, 0.8), bush(140, 178, 0.8), place([circle(0, 0, 8), circle(-8, 8, 6), circle(8, 8, 6), rect(-3, 8, 6, 12, 2), K(circle(-3, -2, 1.5)), K(circle(3, -2, 1.5))], 156, 172, 0.8)]),
    F('cowgirl', 'Cow-girl', { hair: 'braids', hat: 'cowboy', top: 'shirt', bottom: 'jeans', sleeve: 'long', shoes: 'boots', acc: ['scarf'], armR: 40, held: 'trophy', face: GF },
      () => [...outdoor(), rect(0, 150, 200, 32), D(path('M0 160 h200 M0 170 h200')), place([rect(-20, -40, 6, 40), rect(14, -40, 6, 40), rect(-20, -30, 40, 4), rect(-20, -16, 40, 4)], 30, 182, 1), place([rect(-4, -40, 8, 44, 3), rect(-18, -26, 14, 6, 3), rect(4, -32, 14, 6, 3), rect(-18, -40, 6, 16, 3), rect(12, -46, 6, 16, 3)], 168, 182, 1)]),
    F('detective', 'Détective', { hair: 'short', hat: 'cap', top: 'coat', sleeve: 'long', acc: ['glasses', 'mustache'], armR: 44, held: 'magnifier' },
      () => [...indoor(150), rect(16, 30, 50, 40, 2), D(path('M22 40 h38 M22 48 h30 M22 56 h38')), rect(130, 40, 60, 40, 2), rect(136, 46, 48, 28), circle(160, 60, 10), D(path('M160 60 v-6 M160 60 l4 3')), rect(150, 110, 44, 40, 3), rect(156, 116, 32, 8, 2), rect(156, 128, 32, 8, 2), ...[[120, 168], [130, 176], [112, 176]].map(p => K(circle(p[0], p[1], 1.2))), ellipse(60, 172, 6, 8), ellipse(70, 174, 6, 8), ellipse(80, 170, 6, 8)]),
  ];

  /* ---------- sports et loisirs ---------- */
  const bike = (x, y) => place([circle(-30, 0, 18), circle(30, 0, 18), circle(-30, 0, 4), circle(30, 0, 4), D(path('M-30 0 l0 -14 M-30 0 l12 7 M-30 0 l-12 7 M30 0 l0 -14 M30 0 l12 7 M30 0 l-12 7')),
    D(path('M-30 0 L-8 -30 H14 L30 0 M-8 -30 L2 0 L30 0 M2 0 L-30 0')), rect(-14, -34, 12, 4, 2), rect(10, -40, 12, 4, 2), D(path('M16 -36 L14 -30')), circle(2, 0, 5)], x, y);
  const SPORTS = [
    F('cycliste', 'Cycliste', { hair: 'ponytail', hat: 'helmet', top: 'stripes', bottom: 'shorts', sleeve: 'short', armL: 40, armR: 40, face: GOPEN },
      () => [...outdoor(), tree(30, 182, 0.9), tree(176, 182, 0.8)], () => [bike(100, 164)]),
    F('skateur', 'Skateur', { hair: 'short', hat: 'cap', top: 'hoodie', bottom: 'jeans', sleeve: 'long', armL: 60, armR: 40, face: OPEN },
      () => [rect(0, 0, 200, 200), ...sun(30, 30, 12), rect(0, 100, 200, 82), path('M0 182 Q40 120 100 182 Z'), path('M100 182 Q160 120 200 182 Z'), rect(0, 176, 200, 24), D(path('M0 186 h200'))],
      () => [path('M60 186 Q100 196 140 186 L136 180 H64 Z'), circle(76, 190, 5), circle(124, 190, 5), circle(76, 190, 2), circle(124, 190, 2)]),
    F('tenniswoman', 'Joueuse de tennis', { hair: 'ponytail', hat: 'headband', top: 'tee', bottom: 'skirt', sleeve: 'short', armR: 60, held: 'racket', face: G },
      () => [...outdoor(), rect(0, 130, 200, 52), D(path('M0 140 h200 M0 172 h200 M20 130 v52 M180 130 v52')), rect(150, 100, 4, 40), rect(154, 110, 46, 20), D(path('M158 114 h38 M158 118 h38 M158 122 h38 M158 126 h38 M162 110 v20 M170 110 v20 M178 110 v20 M186 110 v20 M194 110 v20'))],
      () => [circle(36, 172, 7), D(path('M31 168 q5 4 10 0 M31 176 q5 -4 10 0'))]),
    F('skieuse', 'Skieuse', { hair: 'braids', hat: 'beanie', top: 'jacket', bottom: 'pants', sleeve: 'long', shoes: 'boots', acc: ['goggles', 'scarf'], armL: 40, armR: 40, face: GF },
      () => [rect(0, 0, 200, 200), ...sun(170, 30, 12), path('M0 140 L60 60 L120 140 Z'), path('M100 150 L160 80 L200 150 Z'), path('M50 76 L60 60 L70 76 Q60 84 50 76 Z'), path('M150 92 L160 80 L170 92 Q160 100 150 92 Z'), rect(0, 140, 200, 60), D(path('M0 160 Q40 150 80 160 T160 160 T240 160')),
        tree(30, 150, 0.7), ...stars([[40, 30, 4], [110, 40, 4], [140, 20, 4]]).map(s => Object.assign(s, { decor: true }))],
      () => [rect(60, 184, 50, 5, 3), rect(94, 184, 50, 5, 3), rect(28, 120, 3, 62, 1), rect(169, 120, 3, 62, 1), circle(29, 180, 6), circle(170, 180, 6)]),
    F('gymnaste', 'Gymnaste', { hair: 'bun', top: 'dress', bottom: 'none', shoes: 'ballet', sleeve: 'long', armL: 160, armR: 100, face: G },
      () => [...indoor(150), rect(0, 20, 200, 40), ...stars([[30, 40, 8], [100, 40, 8], [170, 40, 8]]), rect(40, 150, 120, 12, 3), rect(50, 162, 8, 20), rect(142, 162, 8, 20)],
      () => [D(path('M146 68 Q170 50 190 70 Q170 60 150 90 Q166 110 150 128 Q140 100 160 80')), path('M186 66 q8 -8 10 2 q-6 -2 -10 -2 z')]),
    F('nageur', 'Nageur', { hair: 'short', top: 'swim', bottom: 'shorts', shoes: 'bare', sleeve: 'none', acc: ['goggles'], armL: 40, armR: 170, face: OPEN },
      () => [rect(0, 0, 200, 200), ...sun(30, 30, 14), cloud(150, 30, 0.8), path('M0 120 Q30 108 60 120 T120 120 T180 120 T240 120 V200 H0 Z'), D(path('M20 140 q10 -6 20 0 M60 160 q10 -6 20 0 M140 150 q10 -6 20 0 M170 176 q10 -6 20 0')),
        place([rect(-30, -60, 60, 60, 3), rect(-24, -54, 20, 20, 2), rect(4, -54, 20, 20, 2), rect(-10, -26, 20, 26, 2), path('M-36 -60 H36 L0 -80 Z')], 40, 120, 0.8), place([circle(-14, 0, 8), circle(0, -4, 10), circle(14, 0, 8), rect(-16, 0, 32, 6)], 160, 106, 0.8)],
      () => [circle(40, 176, 12), circle(40, 176, 6), D(path('M28 176 h24 M40 164 v24'))]),
    F('rockeuse', 'Rockeuse', { hair: 'long', hat: 'headphones', top: 'stripes', bottom: 'jeans', sleeve: 'short', shoes: 'boots', armL: 30, armR: 34, held: 'guitar', face: GOPEN },
      () => [rect(0, 0, 200, 200), ...stars([[20, 24, 7], [180, 30, 8], [40, 90, 5], [170, 110, 5], [100, 16, 5]]), rect(0, 150, 200, 50), D(path('M0 160 h200')), rect(10, 110, 44, 40, 3), circle(24, 130, 9), circle(42, 130, 9), rect(146, 110, 44, 40, 3), circle(160, 130, 9), circle(178, 130, 9)]),
    F('photographe', 'Photographe', { hair: 'bob', hat: 'beret', top: 'shirt', bottom: 'jeans', sleeve: 'long', acc: ['bag'], armR: 60, armL: 20, held: 'camera', face: G },
      () => [...outdoor(), tree(24, 182, 1), bush(60, 178, 0.8), place([ellipse(0, 0, 14, 10), ellipse(-12, -8, 6, 4), ellipse(12, -8, 6, 4), circle(0, -14, 8), K(circle(-3, -15, 1.5)), K(circle(3, -15, 1.5)), poly([[-2, -12], [2, -12], [0, -9]]), ellipse(-8, 8, 6, 3), ellipse(8, 8, 6, 3)], 170, 168, 1), ...flowerRow(160)]),
    F('cerfvolant', 'Le cerf-volant', { hair: 'curly', top: 'tee', bottom: 'shorts', sleeve: 'short', shoes: 'sandals', armR: 70, armL: 20, held: 'kite', face: OPEN },
      () => [...outdoor(), cloud(100, 40, 0.7), tree(30, 182, 1), bush(170, 178, 0.9)]),
    F('glace', 'La glace', { hair: 'pigtails', hat: 'bow', top: 'dress', bottom: 'none', sleeve: 'puff', shoes: 'sandals', armR: 50, armL: 20, held: 'icecream', face: GOPEN },
      () => [...outdoor(), place([rect(-40, -50, 80, 50, 3), path('M-46 -50 H46 L40 -66 H-40 Z'), D(path('M-32 -50 v-14 M-16 -50 v-14 M0 -50 v-14 M16 -50 v-14 M32 -50 v-14')), rect(-36, -42, 72, 8, 2), circle(-24, -22, 10), circle(0, -22, 10), circle(24, -22, 10), poly([[-30, -14], [-18, -14], [-24, 0]]), poly([[-6, -14], [6, -14], [0, 0]]), poly([[18, -14], [30, -14], [24, 0]])], 40, 182, 1)]),
    F('lecture', 'La lecture', { hair: 'braids', hat: 'headband', top: 'hoodie', bottom: 'jeans', sleeve: 'long', acc: ['glasses'], armR: 40, armL: 40, held: 'book', face: GF },
      () => [...indoor(150), rect(10, 30, 70, 90, 3), rect(16, 36, 58, 22, 2), rect(16, 64, 58, 22, 2), rect(16, 92, 58, 22, 2), ...[20, 30, 42, 52, 62].map(x => rect(x, 38, 8, 18, 1)), ...[20, 32, 42, 54, 64].map(x => rect(x, 66, 8, 18, 1)), ...[22, 34, 46, 58].map(x => rect(x, 94, 8, 18, 1)),
        rect(150, 110, 44, 40, 4), rect(154, 100, 36, 14, 4), ...[[176, 86], [168, 92]].map(p => heart(p[0], p[1], 3)), place(animal('chat'), 148, 116, 0.3)]),
  ];

  const ANIMAL_BG = {
    chat: () => [...indoor(150), rect(20, 30, 60, 50, 3), rect(26, 36, 48, 38), line(50, 36, 50, 74), line(26, 55, 74, 55), circle(38, 46, 6), rect(14, 26, 8, 58, 2), rect(78, 26, 8, 58, 2), ellipse(100, 180, 70, 14), D(ellipse(100, 180, 58, 9)), place([ellipse(0, 0, 12, 8), circle(0, 0, 3)], 170, 160, 1), D(path('M150 120 q6 -10 12 0 q6 10 12 0'))],
    chien: () => [...outdoor(), tree(30, 182, 1), bush(170, 178, 0.9), place([rect(-10, -3, 20, 6, 3), circle(-12, -4, 4), circle(-12, 4, 4), circle(12, -4, 4), circle(12, 4, 4)], 40, 176, 1), place([circle(0, 0, 8), D(path('M-5 -4 q5 4 10 0 M-5 4 q5 -4 10 0'))], 170, 150, 1)],
    lapin: () => [...outdoor(), ...flowerRow(160), bush(30, 176, 0.8), place([poly([[-5, -16], [5, -16], [0, 14]]), path('M-4 -16 q-6 -12 0 -16 q2 8 4 12 q2 -10 8 -12 q-2 10 -4 16 z'), D(path('M-2 -8 h4 M-1 0 h2'))], 168, 176, 1), place([poly([[-5, -16], [5, -16], [0, 14]]), path('M-4 -16 q-6 -12 0 -16 q2 8 4 12 q2 -10 8 -12 q-2 10 -4 16 z')], 184, 172, 0.8)],
    papillon: () => [rect(0, 0, 200, 200), ...sun(170, 30, 12), rect(0, 176, 200, 24), line(30, 176, 30, 150), line(170, 176, 170, 146), line(100, 176, 100, 160), ...flower(30, 144, 7), ...flower(170, 140, 7), ...flower(100, 154, 6), D(path('M30 166 q-8 -2 -8 -8 M170 160 q8 -2 8 -8'))],
    poisson: () => [rect(0, 0, 200, 200), path('M0 30 Q30 20 60 30 T120 30 T180 30 T240 30 V200 H0 Z'), rect(0, 176, 200, 24), path('M20 176 q-6 -30 6 -46 q6 20 0 46 z'), path('M32 176 q4 -36 14 -40 q4 22 -4 40 z'), path('M170 176 q-4 -30 8 -40 q8 20 0 40 z'), place([ellipse(0, 0, 12, 8), ellipse(-3, -3, 3, 2), circle(3, 2, 2)], 60, 180, 1), star(150, 180, 7), circle(40, 60, 5), circle(50, 46, 3), circle(160, 100, 4)],
    hibou: () => [rect(0, 0, 200, 200), circle(40, 40, 20), circle(32, 34, 4), circle(46, 48, 6), ...stars([[120, 24, 6], [170, 40, 5], [150, 70, 3], [20, 100, 4], [180, 120, 4]]), rect(0, 190, 200, 10), rect(150, 100, 14, 90, 3), path('M164 150 Q186 140 190 120 Q176 130 164 140 Z'), circle(184, 116, 10), circle(174, 128, 8), circle(192, 130, 8)],
    ours: () => [...indoor(150), rect(20, 30, 50, 44, 3), rect(26, 36, 38, 32), circle(45, 52, 8), ...stars([[34, 44, 3], [56, 60, 3]]), rect(140, 100, 50, 50, 4), rect(146, 106, 38, 8, 2), rect(146, 118, 38, 8, 2), rect(146, 130, 38, 8, 2), rect(130, 150, 70, 32, 3), ellipse(100, 182, 60, 12), D(ellipse(100, 182, 48, 8)), heart(160, 40, 8)],
    licorne: () => [rect(0, 0, 200, 200), path('M0 90 Q100 -20 200 90 L200 110 Q100 10 0 110 Z'), path('M0 110 Q100 10 200 110 L200 130 Q100 30 0 130 Z'), path('M0 130 Q100 30 200 130 L200 150 Q100 50 0 150 Z'), cloud(24, 60, 0.7), cloud(176, 60, 0.7), rect(0, 176, 200, 24), ...stars([[30, 24, 6], [100, 16, 5], [170, 24, 6]]), ...flowerRow(160)],
  };
  Kit.CATALOG.find(g => g.group === 'Animaux').items.forEach(it => { const m = it.make, bg = ANIMAL_BG[it.id]; if (bg) it.make = () => [...bg(), ...m()]; });

  Kit.CATALOG.unshift(
    { group: 'Métiers', items: METIERS },
    { group: 'Héros et légendes', items: HEROS },
    { group: 'Sports et loisirs', items: SPORTS },
  );
})();
