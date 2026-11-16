// Стили ремонта. Каждый стиль: отделка стен, пола, потолка, палитра мебели и декор.
// decor: тонкие накладки на стены [x1, z1, x2, z2, y0, y1, цвет] (акцентные стены, рейки, молдинги, плитка).
(function () {
  const T = 0.014; // толщина накладки

  // Стены, на которые вешается декор. dir: в какую сторону от грани находится комната.
  const W = {
    tv:      { axis: 'x', c: 2.15, a: 3.85, b: 6.30, dir: 1 },   // гостиная, стена с ТВ
    bed:     { axis: 'z', c: 0.25, a: 1.94, b: 5.05, dir: 1 },   // спальня, стена за изголовьем
    splash:  { axis: 'z', c: 10.75, a: 2.74, b: 5.15, dir: -1 }, // кухня, фартук
    bathR:   { axis: 'z', c: 10.75, a: 0.26, b: 2.15, dir: -1 },
    bathT:   { axis: 'x', c: 0.26, a: 8.59, b: 10.75, dir: 1 },
    bathB:   { axis: 'x', c: 2.15, a: 8.59, b: 10.75, dir: -1 },
    hallT:   { axis: 'x', c: 0.26, a: 5.45, b: 8.48, dir: 1 },   // прихожая, стена справа от входа
    dining:  { axis: 'x', c: 2.74, a: 8.48, b: 10.13, dir: 1 }   // кухня, короб у стола
  };
  function strip(w, a, b, y0, y1, color, depth) {
    const d = (depth || T) * w.dir, c1 = Math.min(w.c, w.c + d), c2 = Math.max(w.c, w.c + d);
    return w.axis === 'x' ? [a, c1, b, c2, y0, y1, color] : [c1, a, c2, b, y0, y1, color];
  }
  function panel(w, y0, y1, color) { return [strip(w, w.a, w.b, y0, y1, color)]; }
  // вертикальные рейки
  function slats(w, y0, y1, back, color) {
    const out = [strip(w, w.a, w.b, y0, y1, back)];
    for (let p = w.a + 0.03; p + 0.035 < w.b; p += 0.075) out.push(strip(w, p, p + 0.035, y0, y1, color, 0.04));
    return out;
  }
  // молдинги: n рамок по ширине, нижний и верхний ярус
  function molding(w, n, color, yTop) {
    const out = [], m = 0.18, g = 0.14, s = 0.035, len = (w.b - w.a - 2 * m - (n - 1) * g) / n;
    for (let i = 0; i < n; i++) {
      const a = w.a + m + i * (len + g), b = a + len;
      [[0.28, 0.92], [1.08, yTop || 2.62]].forEach(function (y) {
        out.push(strip(w, a, b, y[0], y[0] + s, color, 0.03), strip(w, a, b, y[1] - s, y[1], color, 0.03),
                 strip(w, a, a + s, y[0], y[1], color, 0.03), strip(w, b - s, b, y[0], y[1], color, 0.03));
      });
    }
    return out;
  }
  // настенная плитка: размер плитки [ширина, высота] в восьмом элементе накладки
  function tiled(arr, tw, th) { arr.forEach(function (b) { b[7] = [tw, th]; }); return arr; }
  function bath(color) { return tiled([].concat(panel(W.bathR, 0, 3, color), panel(W.bathT, 0, 3, color), panel(W.bathB, 0, 3, color)), 0.6, 0.3); }

  // ----- варианты по референсам пользователя (кухня, плитка у входа, перегородка) -----
  const OCT = { pattern: 'octagon', color: '#f4f2ed', line: '#cfcbc3', dot: '#1b1b1d', size: 0.25 };
  const FLO = { pattern: 'floral', color: '#f1eee6', line: '#4a4a4c', dot: '#1e1e20', size: 0.30 };
  const ENTRY = [3.85, 0.26, 6.30, 2.05], HALL = [3.85, 0.26, 8.48, 2.05], KITCH = [7.38, 2.15, 10.75, 6.30];
  const MARENGO = 0x4a5a70, WALNUT = 0x7b5437, PX = 7.38;
  function ref(o) {
    const t = {
      wall: 0xebe6de, ceiling: 0xffffff, base: 0x6f563f,
      floor: { style: 'herring', rgb: [168, 126, 88], vary: 0.10 },
      tile: { color: '#efebe4', line: '#d3cdc2', size: 0.6 },
      frame: 0xfbfaf7, door: 0xf5f1e8,
      baseboard: { h: 0.12, color: 0xffffff }, cornice: { h: 0.10, d: 0.07, color: 0xffffff },
      light: { bg: 0xd9e6f0, hemi: 0.48, amb: 0.14, sun: 0xffecd0, sunI: 0.8, point: 0xffe6c0, pointI: 0.38 }
    };
    const pal = {
      sofa: 0xd2c9bb, sofaBack: 0xc6bcad, accent: 0x6e2a33, rug: 0xe6dfd2, coffee: 0x4a3324, wood: WALNUT, woodDark: 0x6a4830,
      tv: 0x111111, bedBase: 0xc9b79c, mattress: 0xfaf7f0, headboard: 0xbfae95, pillow: 0xf3efe7, textile: MARENGO,
      shelf: 0xe9e1d0, cabinet: 0x9a7653, cabinetUp: 0xeeeae3, counter: 0xe6e1d8, steel: 0x9a9da1, stove: 0x111111,
      fridge: 0x8a6645, oven: 0x141414, white: 0xffffff, water: 0xcfe3ea, vanity: WALNUT, chair: 0x5a6b85, curtain: 0xeeeae2
    };
    for (const k in o.pal || {}) pal[k] = o.pal[k];
    for (const k in o) t[k] = o[k];
    t.pal = pal;
    return t;
  }

  // ----- французский стиль по отзыву: тёмное дерево везде, плитка на кухне, стекло, голубой или бордовый акцент -----
  const CHK = { pattern: 'checker', color: '#f1ece2', line: '#d8d2c6', dot: '#2b2a2c', size: 0.42 };
  const DARKWOOD = { style: 'herring', rgb: [112, 76, 50], vary: 0.12 };
  const FR_BLUE = 0x7f9bb5, BORDO = 0x3d0f1a, DARK = 0x4a3324, BRASS = 0xb08d57;
  function french(o) {
    const base = {
      wall: 0xf0ebe1, floor: DARKWOOD, base: 0x4f3826,
      baseboard: { h: 0.14, color: 0xffffff }, cornice: { h: 0.12, d: 0.08, color: 0xffffff },
      pal: Object.assign({ wood: DARK, woodDark: 0x3d2a1d, coffee: BRASS, steel: BRASS, vanity: DARK, sofa: 0xd8d0c2, sofaBack: 0xccc3b4,
                           shelf: 0xe9e1d0, bedBase: 0xd3c7b3, headboard: 0xc9bca6, rug: 0xe8e1d3, counter: 0xefeae0 }, o.pal)
    };
    for (const k in o) if (k !== 'pal') base[k] = o[k];
    return ref(base);
  }

  window.THEMES = [
    french({
      id: 'frBlue', name: 'Французский, голубой',
      note: 'тёмный паркет ёлочкой везде, молдинги, голубая кухня и акценты. Плитка с четырёхлистником у входа и на кухне. Стеклянная перегородка с раздвижной створкой',
      zones: [{ r: ENTRY, tile: FLO }, { r: KITCH, tile: FLO }],
      partition: { kind: 'glass', x: PX, z1: 3.35, z2: 5.43, color: 0x4f6a85, slide: [3.30, 4.50], track: [2.15, 5.43] },
      pal: { cabinet: FR_BLUE, cabinetUp: 0xf2eee6, fridge: 0xf2eee6, chair: FR_BLUE, accent: FR_BLUE, textile: FR_BLUE },
      decor: [].concat(
        tiled(panel(W.splash, 0.9, 1.5, 0xf6f3ee), 0.2, 0.1),
        molding(W.tv, 3, 0xffffff), molding(W.hallT, 3, 0xffffff), molding(W.dining, 2, 0xffffff),
        panel(W.bed, 0, 3, 0xa9bccd), molding(W.bed, 3, 0xffffff),
        bath(0xece8e1)
      )
    }),
    french({
      id: 'frBordo', name: 'Французский, бордо',
      note: 'тёмный паркет ёлочкой везде, молдинги, кремовая кухня с тёмной столешницей, бордовые акценты. Плитка шахматкой у входа и на кухне. Стеклянная перегородка в чёрной раме',
      zones: [{ r: ENTRY, tile: CHK }, { r: KITCH, tile: CHK }],
      partition: { kind: 'glass', x: PX, z1: 3.35, z2: 5.43, color: 0x1e1f21, slide: [3.30, 4.50], track: [2.15, 5.43] },
      pal: { cabinet: 0xece5d6, cabinetUp: 0xece5d6, fridge: 0xece5d6, counter: 0x3a2a20, chair: BORDO, accent: BORDO, textile: BORDO },
      decor: [].concat(
        tiled(panel(W.splash, 0.9, 1.5, BORDO), 0.2, 0.1),
        molding(W.tv, 3, 0xffffff), molding(W.hallT, 3, 0xffffff), molding(W.dining, 2, 0xffffff),
        panel(W.bed, 0, 3, BORDO), molding(W.bed, 3, 0x55222c),
        bath(0xece8e1)
      )
    }),
    ref({
      id: 'refA', name: 'Орех и белый',
      note: 'кухня: ореховый низ, белый верх, сине-серый фартук. Плитка с чёрными вставками у входа и на кухне. Стеклянная перегородка маренго, неподвижная',
      zones: [{ r: ENTRY, tile: OCT }, { r: KITCH, tile: OCT }],
      partition: { kind: 'glass', x: PX, z1: 3.35, z2: 5.43, color: MARENGO },
      decor: [].concat(
        tiled(panel(W.splash, 0.9, 1.5, 0x5f6f86), 0.2, 0.1),
        molding(W.tv, 3, 0xffffff), molding(W.hallT, 3, 0xffffff), molding(W.dining, 2, 0xffffff),
        panel(W.bed, 0, 3, 0xd9d2c6), molding(W.bed, 3, 0xffffff),
        bath(0xece8e1)
      )
    }),
    ref({
      id: 'refB', name: 'Маренго',
      note: 'кухня целиком маренго со светлой столешницей. Плитка с четырёхлистником по всей прихожей, на кухне паркет. Стеклянная перегородка с раздвижной створкой',
      zones: [{ r: HALL, tile: FLO }],
      partition: { kind: 'glass', x: PX, z1: 3.35, z2: 5.43, color: MARENGO, slide: [3.30, 4.50], track: [2.15, 5.43] },
      pal: { cabinet: MARENGO, cabinetUp: MARENGO, fridge: MARENGO, counter: 0xdcd5c8, wood: 0x33271f, chair: 0x5f8f7a, accent: 0xc08a3e,
             textile: 0x5f8f7a, vanity: MARENGO, coffee: 0x33271f },
      decor: [].concat(
        tiled(panel(W.splash, 0.9, 1.5, 0xf4f1ec), 0.2, 0.1),
        panel(W.tv, 0, 3, MARENGO), molding(W.tv, 3, 0x5e6e84),
        panel(W.bed, 0, 3, 0x8d9bb0), molding(W.bed, 3, 0xffffff),
        bath(0xece8e1)
      )
    }),
    ref({
      id: 'refC', name: 'Маренго и орех',
      note: 'кухня: низ маренго, белый верх, ореховая колонна. Плитка с четырёхлистником у входа и на кухне. Перегородка из ореховых реек, короткая',
      zones: [{ r: ENTRY, tile: FLO }, { r: KITCH, tile: FLO }],
      partition: { kind: 'slats', x: PX, z1: 3.95, z2: 5.43, color: WALNUT },
      pal: { cabinet: MARENGO, cabinetUp: 0xf0ece5, fridge: WALNUT, counter: 0xe6e1d8, chair: 0x6e2a33, accent: MARENGO, sofa: 0xcac3b8, sofaBack: 0xbdb5a8 },
      decor: [].concat(
        tiled(panel(W.splash, 0.9, 1.5, 0x8d9bb0), 0.2, 0.1),
        slats(W.tv, 0, 3, 0x5a3e2b, WALNUT),
        panel(W.bed, 0, 3, MARENGO), molding(W.bed, 3, 0x5e6e84),
        molding(W.hallT, 3, 0xffffff),
        bath(0xece8e1)
      )
    }),
    // ----- общие стили -----
    {
      id: 'scandi', name: 'Скандинавский',
      note: 'белые стены, светлый дуб, пастельные акценты',
      wall: 0xf6f5f1, ceiling: 0xffffff, base: 0xcfc8ba,
      floor: { style: 'plank', rgb: [224, 200, 166], vary: 0.10 },
      tile: { color: '#e6e4df', line: '#c4c1bb', size: 0.6 },
      frame: 0xf2f2f0, door: 0xf2efe8,
      baseboard: { h: 0.08, color: 0xffffff }, cornice: null,
      light: { bg: 0xd6e8f5, hemi: 0.52, amb: 0.16, sun: 0xfff3e0, sunI: 0.85, point: 0xfff6e8, pointI: 0.30 },
      pal: {
        sofa: 0xb7bcc2, sofaBack: 0xa9aeb5, rug: 0xe3ddd0, coffee: 0xd8b98c, wood: 0xd8b98c, woodDark: 0xcfae80,
        tv: 0x16171a, bedBase: 0xd8b98c, mattress: 0xf7f5f0, headboard: 0xc9cfc4, pillow: 0xffffff, textile: 0xa9b8a4,
        shelf: 0xe2cfae, cabinet: 0xf4f4f1, cabinetUp: 0xf4f4f1, counter: 0xcfae80, steel: 0xb8bcc0, stove: 0x151515,
        fridge: 0xf0f0ee, white: 0xffffff, water: 0xcfe3ea, vanity: 0xd8b98c, chair: 0x9fb0a0
      },
      decor: [].concat(
        panel(W.bed, 0, 3, 0xb9c6b3),
        tiled(panel(W.splash, 0.9, 1.5, 0xffffff), 0.2, 0.1),
        slats({ axis: 'x', c: 0.26, a: 5.45, b: 6.60, dir: 1 }, 0, 2.2, 0xf6f5f1, 0xd8b98c),
        bath(0xf1f0ec)
      )
    },
    {
      id: 'modern', name: 'Современный минимализм',
      note: 'тёплый серо-бежевый, графит, орех, рейки',
      wall: 0xe2ddd3, ceiling: 0xf7f5f1, base: 0x8f887c,
      floor: { style: 'plank', rgb: [168, 138, 106], vary: 0.07 },
      tile: { color: '#a5a29c', line: '#8d8a84', size: 1.2 },
      frame: 0x1e1f21, door: 0x3a3b3d,
      baseboard: { h: 0.06, color: 0x2a2b2d }, cornice: null,
      light: { bg: 0xcfdfec, hemi: 0.46, amb: 0.13, sun: 0xfff0dc, sunI: 0.8, point: 0xffe9cc, pointI: 0.36 },
      pal: {
        sofa: 0x55595f, sofaBack: 0x4a4e54, rug: 0xbdb6aa, coffee: 0x1f2022, wood: 0x7a5a3e, woodDark: 0x5e4530,
        tv: 0x0c0c0d, bedBase: 0x5e4530, mattress: 0xf1eee8, headboard: 0x6a6e73, pillow: 0xe9e5dd, textile: 0x8a7b68,
        shelf: 0x7a5a3e, cabinet: 0x3b3d40, cabinetUp: 0xd9d4ca, counter: 0xd9d6d0, steel: 0x9a9da1, stove: 0x0c0c0d,
        fridge: 0x2b2c2e, white: 0xfafafa, water: 0xcfe3ea, vanity: 0x5e4530, chair: 0x2b2c2e
      },
      decor: [].concat(
        slats(W.tv, 0, 3, 0x4a3626, 0x7a5a3e),
        panel(W.bed, 0, 3, 0x55595e),
        tiled(panel(W.splash, 0.9, 1.5, 0x2c2d2f), 0.2, 0.1),
        panel(W.dining, 0, 3, 0x55595e),
        bath(0xa9a6a0)
      )
    },
    {
      id: 'neo', name: 'Неоклассика',
      note: 'молочные стены, молдинги и карнизы, паркет ёлочкой, латунь',
      wall: 0xefe8da, ceiling: 0xffffff, base: 0x6f563f,
      floor: { style: 'herring', rgb: [150, 108, 72], vary: 0.12 },
      tile: { color: '#efebe4', line: '#d3cdc2', size: 0.6 },
      frame: 0xfbfaf7, door: 0xf5f1e8,
      baseboard: { h: 0.13, color: 0xffffff }, cornice: { h: 0.11, d: 0.08, color: 0xffffff },
      light: { bg: 0xd9e6f0, hemi: 0.48, amb: 0.14, sun: 0xffecd0, sunI: 0.8, point: 0xffe6c0, pointI: 0.38 },
      pal: {
        sofa: 0x7d8fa0, sofaBack: 0x70818f, rug: 0xd9cdb8, coffee: 0xb08d57, wood: 0x5a3e2b, woodDark: 0x4a3324,
        tv: 0x111111, bedBase: 0xc9b79c, mattress: 0xfaf7f0, headboard: 0xbfae95, pillow: 0xffffff, textile: 0x7d8fa0,
        shelf: 0xe9e1d0, cabinet: 0xece5d6, cabinetUp: 0xece5d6, counter: 0x3a332d, steel: 0xb08d57, stove: 0x151515,
        fridge: 0xe6dfd0, white: 0xffffff, water: 0xcfe3ea, vanity: 0xece5d6, chair: 0xc9b79c
      },
      decor: [].concat(
        molding(W.tv, 3, 0xffffff),
        panel(W.bed, 0, 3, 0xa9b6c0), molding(W.bed, 3, 0xffffff),
        molding(W.hallT, 3, 0xffffff),
        molding(W.dining, 2, 0xffffff),
        tiled(panel(W.splash, 0.9, 1.5, 0xf4f1ec), 0.2, 0.1),
        bath(0xece8e1)
      )
    }
  ];
})();
