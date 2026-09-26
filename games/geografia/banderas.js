/**
 * Banderas dibujadas por código con primitivas geométricas: nada de imágenes ni
 * de emoji. Proporción 3:2 (viewBox 90x60), estilo plano coherente con la app.
 *
 * No pretenden ser heráldicamente exactas (los escudos se simplifican), sino
 * reconocibles de un vistazo en una tablet.
 */

const R = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const C = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
const P = (puntos, c) => `<polygon points="${puntos}" fill="${c}"/>`;

/** Estrella de cinco puntas. */
function E(cx, cy, r, c, giro = -90) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.42 : r;
    const a = ((giro + i * 36) * Math.PI) / 180;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return P(pts.join(' '), c);
}

/* ------------------------------------------------------- patrones comunes */

/** Franjas horizontales de igual altura. */
const hor = (...colores) =>
  colores.map((c, i) => R(0, (60 / colores.length) * i, 90, 60 / colores.length + 0.5, c)).join('');

/** Franjas verticales de igual anchura. */
const ver = (...colores) =>
  colores.map((c, i) => R((90 / colores.length) * i, 0, 90 / colores.length + 0.5, 60, c)).join('');

/** Franjas horizontales con la central el doble de ancha (España, Canadá…). */
const horAncha = (a, b) => R(0, 0, 90, 60, a) + R(0, 15, 90, 30, b);

/** Cruz nórdica. */
const nordica = (fondo, cruz, borde = null) =>
  R(0, 0, 90, 60, fondo) +
  (borde
    ? R(24, 0, 14, 60, borde) + R(0, 23, 90, 14, borde)
    : '') +
  R(borde ? 27 : 26, 0, borde ? 8 : 10, 60, cruz) +
  R(0, borde ? 26 : 25, 90, borde ? 8 : 10, cruz);

/* --------------------------------------------------------- las banderas */

const media = (c) => C(45, 30, 0, c); // marcador vacío, evita huecos raros

export const BANDERAS = {
  /* ---------------- Europa ---------------- */
  ESP: () =>
    horAncha('#c60b1e', '#ffc400') +
    // escudo simplificado, solo como mancha reconocible
    `<g transform="translate(26,30)"><rect x="-5" y="-7" width="10" height="14" rx="2" fill="#ad1519"/>
     <rect x="-5" y="-7" width="5" height="7" fill="#fabd00"/><rect x="0" y="0" width="5" height="7" fill="#fabd00"/></g>`,
  PRT: () =>
    R(0, 0, 90, 60, '#da291c') + R(0, 0, 36, 60, '#046a38') + C(36, 30, 11, '#ffe900') + C(36, 30, 7.5, '#da291c'),
  FRA: () => ver('#002395', '#ffffff', '#ed2939'),
  ITA: () => ver('#008c45', '#f4f5f0', '#cd212a'),
  DEU: () => hor('#000000', '#dd0000', '#ffce00'),
  GBR: () =>
    R(0, 0, 90, 60, '#012169') +
    `<path d="M0 0L90 60M90 0L0 60" stroke="#fff" stroke-width="12"/>
     <path d="M0 0L90 60M90 0L0 60" stroke="#c8102e" stroke-width="6"/>
     <path d="M45 0V60M0 30H90" stroke="#fff" stroke-width="20"/>
     <path d="M45 0V60M0 30H90" stroke="#c8102e" stroke-width="12"/>`,
  IRL: () => ver('#169b62', '#ffffff', '#ff883e'),
  NLD: () => hor('#ae1c28', '#ffffff', '#21468b'),
  BEL: () => ver('#000000', '#fdda24', '#ef3340'),
  LUX: () => hor('#ed2939', '#ffffff', '#00a1de'),
  CHE: () => R(0, 0, 90, 60, '#ff0000') + R(38, 12, 14, 36, '#fff') + R(27, 23, 36, 14, '#fff'),
  AUT: () => hor('#ed2939', '#ffffff', '#ed2939'),
  POL: () => hor('#ffffff', '#dc143c'),
  CZE: () => hor('#ffffff', '#d7141a') + P('0,0 34,30 0,60', '#11457e'),
  SVK: () => hor('#ffffff', '#0b4ea2', '#ee1c25') + C(28, 30, 12, '#ee1c25') + C(28, 30, 9, '#fff'),
  HUN: () => hor('#cd2a3e', '#ffffff', '#436f4d'),
  ROU: () => ver('#002b7f', '#fcd116', '#ce1126'),
  BGR: () => hor('#ffffff', '#00966e', '#d62612'),
  GRC: () =>
    hor('#0d5eaf', '#fff', '#0d5eaf', '#fff', '#0d5eaf', '#fff', '#0d5eaf', '#fff', '#0d5eaf') +
    R(0, 0, 33, 33, '#0d5eaf') + R(13, 0, 7, 33, '#fff') + R(0, 13, 33, 7, '#fff'),
  HRV: () =>
    hor('#ff0000', '#ffffff', '#171796') +
    // damero rojiblanco simplificado
    `<g>${[0, 1, 2, 3].map((c) => [0, 1, 2].map((f) => R(36 + c * 5, 21 + f * 5, 5, 5, (c + f) % 2 ? '#ff0000' : '#fff')).join('')).join('')}</g>` +
    `<rect x="36" y="21" width="20" height="15" fill="none" stroke="#171796" stroke-width="1.4"/>`,
  SVN: () =>
    hor('#ffffff', '#0000ff', '#ff0000') +
    // escudo: monte Triglav con dos estrellas
    `<path d="M14 14h20v14q0 6-10 9-10-3-10-9z" fill="#fff" stroke="#c00" stroke-width="1.6"/>
     <path d="M18 28l6-9 6 9-4-1-2 2-2-2z" fill="#0000c8"/>` +
    E(21, 17, 2, '#ffdf00') + E(27, 17, 2, '#ffdf00'),
  SRB: () => hor('#c6363c', '#0c4076', '#ffffff'),
  UKR: () => hor('#005bbb', '#ffd500'),
  RUS: () => hor('#ffffff', '#0039a6', '#d52b1e'),
  SWE: () => nordica('#006aa7', '#fecc00'),
  NOR: () => nordica('#ba0c2f', '#00205b', '#ffffff'),
  FIN: () => nordica('#ffffff', '#003580'),
  DNK: () => nordica('#c8102e', '#ffffff'),
  ISL: () => nordica('#02529c', '#dc1e35', '#ffffff'),
  EST: () => hor('#0072ce', '#000000', '#ffffff'),
  LVA: () => R(0, 0, 90, 60, '#9e3039') + R(0, 24, 90, 12, '#fff'),
  LTU: () => hor('#fdb913', '#006a44', '#c1272d'),
  BLR: () => hor('#c8313e', '#4aa657') + R(0, 0, 14, 60, '#fff'),
  TUR: () =>
    R(0, 0, 90, 60, '#e30a17') + C(34, 30, 12, '#fff') + C(38, 30, 9.5, '#e30a17') + E(52, 30, 6, '#fff'),
  ALB: () =>
    R(0, 0, 90, 60, '#e41e20') +
    // águila bicéfala muy simplificada
    `<path d="M45 22q-3-5-8-5 2 4 5 6-8-2-14 2 6 1 9 4-7 1-10 6 8-1 12 2-4 3-4 8 6-3 10-3 4 0 10 3 0-5-4-8 4-3 12-2-3-5-10-6 3-3 9-4-6-4-14-2 3-2 5-6-5 0-8 5z" fill="#000"/>`,
  MLT: () =>
    ver('#ffffff', '#cf142b') +
    `<path d="M8 10h10v4h4v10h-4v4H8v-4H4V14h4z" fill="#c0c0c0" stroke="#8a8a8a" stroke-width="0.8"/>`,
  CYP: () =>
    R(0, 0, 90, 60, '#fff') +
    // silueta muy simplificada de la isla + dos ramas de olivo
    `<path d="M30 22q10-3 20-1t14 5q-4 4-12 4-6 4-14 2t-8-10z" fill="#d57800"/>
     <path d="M36 38q4 5 9 5t9-5" stroke="#4e9b3f" stroke-width="2" fill="none"/>
     <ellipse cx="38" cy="40" rx="3" ry="1.6" fill="#4e9b3f"/><ellipse cx="52" cy="40" rx="3" ry="1.6" fill="#4e9b3f"/>`,
  MNE: () => R(0, 0, 90, 60, '#c40308') + R(4, 4, 82, 52, '#c40308') + C(45, 30, 12, '#d4af37'),
  MKD: () => R(0, 0, 90, 60, '#d20000') + C(45, 30, 13, '#f8e92e'),
  MDA: () => ver('#0046ae', '#ffd200', '#cc092f'),
  BIH: () => R(0, 0, 90, 60, '#002395') + P('26,0 74,0 74,60', '#fecb00'),

  /* ---------------- América ---------------- */
  USA: () =>
    hor('#b31942', '#fff', '#b31942', '#fff', '#b31942', '#fff', '#b31942', '#fff', '#b31942', '#fff', '#b31942', '#fff', '#b31942') +
    R(0, 0, 38, 32, '#0a3161') +
    [0, 1, 2].map((f) => [0, 1, 2, 3].map((c) => E(6 + c * 9, 7 + f * 9, 3, '#fff')).join('')).join(''),
  CAN: () =>
    R(0, 0, 90, 60, '#fff') + R(0, 0, 22, 60, '#d80621') + R(68, 0, 22, 60, '#d80621') +
    `<path d="M45 14l3 7 6-3-2 8 6-1-6 6 8 3-8 3 2 5-7-1 1 8h-6l1-8-7 1 2-5-8-3 8-3-6-6 6 1-2-8 6 3z" fill="#d80621"/>`,
  MEX: () =>
    ver('#006847', '#ffffff', '#ce1126') + C(45, 30, 9, '#8f6a3a') + C(45, 30, 6, '#c8a165'),
  BRA: () =>
    R(0, 0, 90, 60, '#009c3b') + P('45,6 84,30 45,54 6,30', '#ffdf00') + C(45, 30, 12, '#002776') +
    `<path d="M33 26q12 6 24 0" stroke="#fff" stroke-width="3" fill="none"/>` + E(45, 26, 2.5, '#fff'),
  ARG: () => hor('#75aadb', '#ffffff', '#75aadb') + C(45, 30, 7, '#f6b40e') + C(45, 30, 4.5, '#fff'),
  CHL: () =>
    hor('#ffffff', '#d52b1e') + R(0, 0, 32, 30, '#0039a6') + E(16, 15, 8, '#fff'),
  COL: () => R(0, 0, 90, 60, '#ffcd00') + R(0, 30, 90, 15, '#003893') + R(0, 45, 90, 15, '#c8102e'),
  PER: () => ver('#d91023', '#ffffff', '#d91023'),
  VEN: () => hor('#ffcc00', '#00247d', '#cf0821'),
  URY: () =>
    hor('#fff', '#0038a8', '#fff', '#0038a8', '#fff', '#0038a8', '#fff', '#0038a8', '#fff') +
    R(0, 0, 34, 27, '#fff') + C(17, 13, 8, '#fcd116'),
  ECU: () => R(0, 0, 90, 60, '#ffdd00') + R(0, 30, 90, 15, '#034ea2') + R(0, 45, 90, 15, '#ed1c24'),
  BOL: () => hor('#d52b1e', '#f9e300', '#007a33'),
  PRY: () => hor('#d52b1e', '#ffffff', '#0038a8') + C(45, 30, 7, '#fff') + C(45, 30, 5, '#0038a8'),
  CUB: () =>
    hor('#002a8f', '#fff', '#002a8f', '#fff', '#002a8f') + P('0,0 40,30 0,60', '#cf142b') + E(14, 30, 8, '#fff'),
  DOM: () =>
    R(0, 0, 90, 60, '#002d62') + R(45, 0, 45, 30, '#ce1126') + R(0, 30, 45, 30, '#ce1126') +
    R(38, 0, 14, 60, '#fff') + R(0, 23, 90, 14, '#fff'),
  CRI: () => hor('#002b7f', '#fff', '#ce1126', '#ce1126', '#fff', '#002b7f'),
  PAN: () =>
    R(0, 0, 90, 60, '#fff') + R(45, 0, 45, 30, '#da121a') + R(0, 30, 45, 30, '#072357') +
    E(22, 15, 8, '#072357') + E(68, 45, 8, '#da121a'),
  GTM: () => ver('#4997d0', '#ffffff', '#4997d0'),
  JAM: () =>
    R(0, 0, 90, 60, '#009b3a') + `<path d="M0 0L90 60M90 0L0 60" stroke="#fed100" stroke-width="12"/>` +
    P('0,6 0,54 33,30', '#000') + P('90,6 90,54 57,30', '#000'),

  /* ---------------- Asia ---------------- */
  CHN: () =>
    R(0, 0, 90, 60, '#de2910') + E(16, 15, 9, '#ffde00') +
    E(31, 7, 3.5, '#ffde00') + E(37, 14, 3.5, '#ffde00') + E(37, 23, 3.5, '#ffde00') + E(31, 30, 3.5, '#ffde00'),
  JPN: () => R(0, 0, 90, 60, '#fff') + C(45, 30, 17, '#bc002d'),
  KOR: () =>
    R(0, 0, 90, 60, '#fff') + C(45, 30, 13, '#cd2e3a') +
    `<path d="M32 30a13 13 0 0 1 26 0a6.5 6.5 0 0 0-13 0a6.5 6.5 0 0 1-13 0z" fill="#0047a0"/>` +
    R(10, 16, 10, 3, '#000') + R(10, 41, 10, 3, '#000') + R(70, 16, 10, 3, '#000') + R(70, 41, 10, 3, '#000'),
  IND: () =>
    hor('#ff9933', '#ffffff', '#138808') + C(45, 30, 8, '#fff') + C(45, 30, 7, '#000080') + C(45, 30, 5.5, '#fff') + C(45, 30, 2, '#000080'),
  VNM: () => R(0, 0, 90, 60, '#da251d') + E(45, 30, 14, '#ffff00'),
  THA: () => hor('#a51931', '#f4f5f8', '#2d2a4a', '#2d2a4a', '#f4f5f8', '#a51931'),
  IDN: () => hor('#ff0000', '#ffffff'),
  PHL: () =>
    hor('#0038a8', '#ce1126') + P('0,0 42,30 0,60', '#fff') + C(12, 30, 5, '#fcd116'),
  MYS: () =>
    hor('#cc0001', '#fff', '#cc0001', '#fff', '#cc0001', '#fff', '#cc0001', '#fff', '#cc0001', '#fff', '#cc0001', '#fff', '#cc0001', '#fff') +
    R(0, 0, 45, 34, '#010066') + C(16, 17, 9, '#ffcc00') + C(20, 17, 7.5, '#010066') + E(31, 17, 5, '#ffcc00'),
  SGP: () =>
    hor('#ed2939', '#ffffff') + C(20, 15, 9, '#fff') + C(25, 15, 7.5, '#ed2939') +
    E(33, 10, 3, '#fff') + E(38, 16, 3, '#fff') + E(30, 20, 3, '#fff'),
  PAK: () =>
    R(0, 0, 90, 60, '#01411c') + R(0, 0, 22, 60, '#fff') + C(52, 28, 12, '#fff') + C(57, 26, 10, '#01411c') + E(66, 20, 4.5, '#fff'),
  BGD: () => R(0, 0, 90, 60, '#006a4e') + C(40, 30, 16, '#f42a41'),
  IRN: () => hor('#239f40', '#ffffff', '#da0000'),
  IRQ: () => hor('#ce1126', '#ffffff', '#000000'),
  SAU: () => R(0, 0, 90, 60, '#006c35') + R(16, 24, 58, 4, '#fff') + R(20, 36, 50, 4, '#fff'),
  ISR: () =>
    R(0, 0, 90, 60, '#fff') + R(0, 8, 90, 6, '#0038b8') + R(0, 46, 90, 6, '#0038b8') +
    `<path d="M45 18l10 17H35zM45 42l10-17H35z" fill="none" stroke="#0038b8" stroke-width="3"/>`,
  ARE: () => hor('#00732f', '#ffffff', '#000000') + R(0, 0, 24, 60, '#ff0000'),
  LKA: () => R(0, 0, 90, 60, '#ffbe29') + R(6, 6, 20, 48, '#00534e') + R(26, 6, 12, 48, '#eb7400') + R(42, 6, 42, 48, '#8d153a'),

  /* ---------------- África ---------------- */
  MAR: () => R(0, 0, 90, 60, '#c1272d') + E(45, 30, 14, '#006233'),
  DZA: () =>
    ver('#006233', '#ffffff') + C(42, 30, 12, '#d21034') + C(46, 30, 9.5, '#fff') + E(56, 30, 5, '#d21034'),
  TUN: () => R(0, 0, 90, 60, '#e70013') + C(45, 30, 15, '#fff') + C(48, 30, 11, '#e70013') + E(53, 30, 5.5, '#e70013'),
  EGY: () => hor('#ce1126', '#ffffff', '#000000') + C(45, 30, 6, '#c09300'),
  LBY: () => hor('#e70013', '#000000', '#239e46') + C(45, 30, 6, '#fff') + C(47, 30, 5, '#000') + E(52, 30, 3.5, '#fff'),
  SEN: () => ver('#00853f', '#fdef42', '#e31b23') + E(45, 30, 8, '#00853f'),
  NGA: () => ver('#008751', '#ffffff', '#008751'),
  GHA: () => hor('#ce1126', '#fcd116', '#006b3f') + E(45, 30, 7, '#000'),
  CIV: () => ver('#f77f00', '#ffffff', '#009e60'),
  CMR: () => ver('#007a5e', '#ce1126', '#fcd116') + E(45, 30, 8, '#fcd116'),
  KEN: () =>
    R(0, 0, 90, 60, '#000') + R(0, 18, 90, 3, '#fff') + R(0, 21, 90, 18, '#bb0000') +
    R(0, 39, 90, 3, '#fff') + R(0, 42, 90, 18, '#006600') +
    // escudo masai con dos lanzas cruzadas
    `<path d="M39 14l12 32M51 14L39 46" stroke="#fff" stroke-width="2.4"/>
     <ellipse cx="45" cy="30" rx="7" ry="13" fill="#bb0000" stroke="#000" stroke-width="1.6"/>
     <path d="M45 17v26" stroke="#fff" stroke-width="2.4"/>`,
  ETH: () => hor('#078930', '#fcdd09', '#da121a') + C(45, 30, 11, '#0f47af') + E(45, 30, 8, '#fcdd09'),
  TZA: () =>
    R(0, 0, 90, 60, '#1eb53a') + P('90,0 90,60 0,60', '#00a3dd') +
    // la banda negra sube del asta (abajo) al batiente (arriba), con orla amarilla
    `<path d="M0 60L90 0" stroke="#fcd116" stroke-width="22"/><path d="M0 60L90 0" stroke="#000" stroke-width="14"/>`,
  ZAF: () =>
    R(0, 0, 90, 60, '#002395') + P('0,0 90,0 90,26 0,26', '#de3831') +
    P('0,34 90,34 90,60 0,60', '#002395') + R(0, 24, 90, 12, '#fff') +
    P('0,0 34,30 0,60', '#007a4d'),
  MOZ: () => hor('#009a44', '#ffffff', '#000000', '#ffffff', '#ffce00') + P('0,0 34,30 0,60', '#d21034') + E(11, 30, 6, '#ffce00'),
  AGO: () => hor('#ce1126', '#000000') + C(45, 30, 9, '#f9d616'),
  COD: () => R(0, 0, 90, 60, '#007fff') + P('0,44 66,0 90,0 90,16 24,60 0,60', '#f7d618') + E(14, 12, 7, '#fff'),
  SDN: () => hor('#d21034', '#ffffff', '#000000') + P('0,0 30,30 0,60', '#007229'),

  /* ---------------- Oceanía ---------------- */
  AUS: () =>
    R(0, 0, 90, 60, '#00008b') +
    `<g transform="scale(0.5)"><rect width="90" height="60" fill="#00008b"/>
     <path d="M0 0L90 60M90 0L0 60" stroke="#fff" stroke-width="12"/>
     <path d="M45 0V60M0 30H90" stroke="#fff" stroke-width="20"/>
     <path d="M45 0V60M0 30H90" stroke="#c8102e" stroke-width="12"/></g>` +
    E(22, 46, 6, '#fff') + E(66, 14, 4, '#fff') + E(74, 30, 4, '#fff') + E(66, 46, 4, '#fff') + E(58, 38, 3, '#fff'),
  NZL: () =>
    R(0, 0, 90, 60, '#00247d') +
    `<g transform="scale(0.5)"><rect width="90" height="60" fill="#00247d"/>
     <path d="M0 0L90 60M90 0L0 60" stroke="#fff" stroke-width="12"/>
     <path d="M45 0V60M0 30H90" stroke="#fff" stroke-width="20"/>
     <path d="M45 0V60M0 30H90" stroke="#c8102e" stroke-width="12"/></g>` +
    E(64, 16, 4, '#cc142b') + E(72, 30, 4, '#cc142b') + E(64, 44, 4, '#cc142b') + E(56, 30, 3.5, '#cc142b'),
  FJI: () =>
    R(0, 0, 90, 60, '#68bfe5') +
    `<g transform="scale(0.5)"><rect width="90" height="60" fill="#68bfe5"/>
     <path d="M0 0L90 60M90 0L0 60" stroke="#fff" stroke-width="12"/>
     <path d="M45 0V60M0 30H90" stroke="#fff" stroke-width="20"/>
     <path d="M45 0V60M0 30H90" stroke="#c8102e" stroke-width="12"/></g>` +
    R(62, 18, 16, 24, '#fff'),
};

/** SVG completo de una bandera; null si no está dibujada. */
export function bandera(id) {
  const f = BANDERAS[id];
  if (!f) return null;
  return `<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" class="bandera" aria-hidden="true">
      ${f()}<rect x="0.5" y="0.5" width="89" height="59" fill="none" stroke="rgba(58,52,47,.28)" stroke-width="1"/>
    </svg>`;
}

export const CON_BANDERA = Object.keys(BANDERAS);
