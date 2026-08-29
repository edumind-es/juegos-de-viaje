/**
 * Ilustración vectorial de la app: avatares, iconos, arte de las tarjetas y medallas.
 * Todo es SVG generado en el propio código — nada de clipart ni emoji como recurso principal.
 */

export const PALETA = {
  terracota: '#d9634a',
  teal: '#2e7d74',
  mostaza: '#e9b23c',
  azul: '#6fa8c7',
  lila: '#9b8bc4',
  verde: '#7fa650',
  rosa: '#e79a94',
  crema: '#fdf6ec',
  papel: '#fffdf9',
  tinta: '#3a342f',
};

const svg = (contenido, extra = '') =>
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ${extra}>${contenido}</svg>`;

/* ----------------------------------------------------------------- avatares */

const PIEL = ['#f2c9a0', '#d9a173', '#a9714a', '#f7dcc2'];
const PELO = ['#3a342f', '#7a4a2b', '#c98b3a', '#5a3d59'];

/**
 * Avatar ilustrado. `n` (0-3) elige peinado y tono; `color` es el fondo del perfil.
 */
export function avatar(n = 0, color = PALETA.mostaza) {
  const i = ((n % 4) + 4) % 4;
  const piel = PIEL[i];
  const pelo = PELO[i];

  const peinados = [
    // coletas
    `<path d="M27 44c0-15 10-24 23-24s23 9 23 24c0 4-2 6-4 4-3-3-8-9-19-9s-16 6-19 9c-2 2-4 0-4-4z" fill="${pelo}"/>
     <circle cx="24" cy="50" r="9" fill="${pelo}"/><circle cx="76" cy="50" r="9" fill="${pelo}"/>`,
    // melena
    `<path d="M25 46c0-16 11-26 25-26s25 10 25 26v18c0 5-6 7-8 3-2-5-3-16-3-16s-6 5-14 5-14-5-14-5-1 11-3 16c-2 4-8 2-8-3z" fill="${pelo}"/>`,
    // rizos
    `<path d="M28 43c0-14 10-23 22-23s22 9 22 23c0 5-3 6-5 4-4-4-9-8-17-8s-13 4-17 8c-2 2-5 1-5-4z" fill="${pelo}"/>
     <circle cx="30" cy="33" r="8" fill="${pelo}"/><circle cx="50" cy="26" r="9" fill="${pelo}"/>
     <circle cx="70" cy="33" r="8" fill="${pelo}"/>`,
    // flequillo con lazo
    `<path d="M26 45c0-15 11-25 24-25s24 10 24 25c0 4-3 5-5 3-5-5-8-10-8-10s-9 6-20 6c-7 0-11-2-11-2s-1 4-1 6c0 3-3 2-3-3z" fill="${pelo}"/>
     <path d="M70 26c5-5 12-4 12 2s-8 8-12 4z" fill="${PALETA.terracota}"/>`,
  ];

  return svg(`
    <circle cx="50" cy="50" r="48" fill="${color}"/>
    <circle cx="50" cy="50" r="40" fill="${PALETA.papel}" opacity=".28"/>
    <path d="M50 88c-14 0-24-6-24-13 0-8 11-13 24-13s24 5 24 13c0 7-10 13-24 13z" fill="${PALETA.papel}"/>
    <ellipse cx="50" cy="52" rx="21" ry="23" fill="${piel}"/>
    ${peinados[i]}
    <circle cx="42" cy="52" r="3.1" fill="${PALETA.tinta}"/>
    <circle cx="58" cy="52" r="3.1" fill="${PALETA.tinta}"/>
    <circle cx="35" cy="60" r="4.2" fill="${PALETA.rosa}" opacity=".55"/>
    <circle cx="65" cy="60" r="4.2" fill="${PALETA.rosa}" opacity=".55"/>
    <path d="M44 62c2 3 10 3 12 0" stroke="${PALETA.tinta}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  `);
}

/* ------------------------------------------------------------------ iconos */

const trazo = (d, color = 'currentColor', w = 7) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

export const icono = {
  jugar: () => svg(`<path d="M32 22l44 28-44 28z" fill="currentColor"/>`),
  pausa: () =>
    svg(`<rect x="28" y="22" width="15" height="56" rx="7" fill="currentColor"/>
         <rect x="57" y="22" width="15" height="56" rx="7" fill="currentColor"/>`),
  atras: () => svg(trazo('M62 22L34 50l28 28')),
  casa: () =>
    svg(`${trazo('M18 48L50 20l32 28')}<path d="M28 48v30h44V48" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>`),
  sonidoOn: () =>
    svg(`<path d="M22 40h14l16-14v48L36 60H22z" fill="currentColor"/>${trazo('M66 36c5 8 5 20 0 28', 'currentColor', 6)}`),
  sonidoOff: () =>
    svg(`<path d="M22 40h14l16-14v48L36 60H22z" fill="currentColor"/>${trazo('M64 40l20 20M84 40L64 60', 'currentColor', 6)}`),
  voz: () =>
    svg(`<rect x="41" y="16" width="18" height="38" rx="9" fill="currentColor"/>${trazo('M28 48c0 12 10 20 22 20s22-8 22-20M50 68v14', 'currentColor', 6)}`),
  estrella: (color = PALETA.mostaza) =>
    svg(
      `<path d="M50 10l11.8 24.6 26.9 3.6-19.6 18.8 4.9 26.8L50 71.2 25.9 83.8l4.9-26.8L11.3 38.2l26.9-3.6z" fill="${color}"/>`
    ),
  racha: () =>
    svg(`<path d="M52 8c14 16 6 24 14 32 4-4 4-10 4-10 8 10 12 20 12 30 0 18-14 32-32 32S18 78 18 60c0-16 12-26 18-38 4 8 10 8 10 0 0-6-2-10 6-14z" fill="${PALETA.terracota}"/>
         <path d="M50 44c6 8 14 14 14 26 0 9-6 16-14 16s-14-7-14-16c0-8 8-12 14-26z" fill="${PALETA.mostaza}"/>`),
  medalla: () =>
    svg(`<path d="M32 6h14l8 30H38z" fill="${PALETA.azul}"/><path d="M54 6h14l-8 30H46z" fill="${PALETA.teal}"/>
         <circle cx="50" cy="62" r="30" fill="${PALETA.mostaza}"/><circle cx="50" cy="62" r="22" fill="${PALETA.papel}" opacity=".35"/>`),
  progreso: () =>
    svg(`<rect x="16" y="52" width="16" height="32" rx="7" fill="${PALETA.azul}"/>
         <rect x="42" y="34" width="16" height="50" rx="7" fill="${PALETA.teal}"/>
         <rect x="68" y="18" width="16" height="66" rx="7" fill="${PALETA.terracota}"/>`),
  cambiar: () => svg(trazo('M22 38h48l-12-12M78 62H30l12 12')),
  reiniciar: () =>
    svg(`${trazo('M78 50a28 28 0 1 1-9-20')}<path d="M76 12v22H54z" fill="currentColor"/>`),
  lapiz: () =>
    svg(`<path d="M20 80l4-16 40-40 12 12-40 40z" fill="currentColor"/><path d="M68 16l8-8 12 12-8 8z" fill="${PALETA.terracota}"/>`),
  bote: () =>
    svg(`<path d="M30 30h40v46a10 10 0 0 1-10 10H40a10 10 0 0 1-10-10z" fill="currentColor"/>
         <rect x="26" y="16" width="48" height="14" rx="7" fill="${PALETA.terracota}"/>`),
  goma: () =>
    svg(`<rect x="18" y="46" width="64" height="30" rx="10" fill="currentColor"/><rect x="18" y="46" width="30" height="30" rx="10" fill="${PALETA.rosa}"/>`),
  ok: () => svg(trazo('M22 52l20 20 36-42', PALETA.acierto || '#4a9a5e', 10)),
  nube: () =>
    svg(`<path d="M30 74a20 20 0 0 1 2-40 26 26 0 0 1 50 6 17 17 0 0 1 4 34z" fill="currentColor"/>
         <path d="M50 46v24" stroke="${PALETA.papel}" stroke-width="7" stroke-linecap="round" fill="none"/>
         <path d="M40 60l10 10 10-10" stroke="${PALETA.papel}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`),
  info: () =>
    svg(`<circle cx="50" cy="50" r="38" fill="currentColor"/><circle cx="50" cy="32" r="6" fill="${PALETA.papel}"/><rect x="44" y="44" width="12" height="28" rx="6" fill="${PALETA.papel}"/>`),
};

/* ---------------------------------------------------- sellos de feedback */

export const sello = {
  bien: () =>
    svg(`<circle cx="50" cy="50" r="40" fill="#4a9a5e" opacity=".92"/>
         <path d="M30 52l14 14 26-30" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`),
  casi: () =>
    svg(`<circle cx="50" cy="50" r="40" fill="${PALETA.azul}" opacity=".92"/>
         <path d="M32 50h36" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`),
};

/* --------------------------------------------------------------- medallas */

export function medalla(clave, color = PALETA.mostaza) {
  const emblemas = {
    estrella: `<path d="M50 30l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="${PALETA.papel}"/>`,
    fuego: `<path d="M50 26c8 10 16 16 16 28 0 10-7 18-16 18s-16-8-16-18c0-12 8-18 16-28z" fill="${PALETA.papel}"/>`,
    suma: `<path d="M44 30h12v14h14v12H56v14H44V56H30V44h14z" fill="${PALETA.papel}"/>`,
    ojo: `<path d="M22 54c8-12 18-18 28-18s20 6 28 18c-8 12-18 18-28 18s-20-6-28-18z" fill="${PALETA.papel}"/><circle cx="50" cy="54" r="8" fill="${color}"/>`,
    pincel: `<path d="M34 70l6-22 20-20 10 10-20 20z" fill="${PALETA.papel}"/>`,
    cerebro: `<circle cx="40" cy="46" r="12" fill="${PALETA.papel}"/><circle cx="58" cy="42" r="10" fill="${PALETA.papel}"/><circle cx="52" cy="62" r="11" fill="${PALETA.papel}"/>`,
    rayo: `<path d="M56 24L34 56h14l-6 22 24-34H52z" fill="${PALETA.papel}"/>`,
    corazon: `<path d="M50 74S28 60 28 46c0-8 6-13 12-13 5 0 8 3 10 6 2-3 5-6 10-6 6 0 12 5 12 13 0 14-22 28-22 28z" fill="${PALETA.papel}"/>`,
  };
  return svg(`
    <path d="M50 6l12 7 14-1 4 13 11 9-6 13 2 14-13 5-8 11-14-3-14 3-8-11-13-5 2-14-6-13 11-9 4-13 14 1z" fill="${color}"/>
    ${emblemas[clave] || emblemas.estrella}
  `);
}

/* ------------------------------------------- arte de las tarjetas del hub */

const fondo = (c) => `<rect width="100" height="100" fill="${c}"/>`;

export const arteJuego = {
  colorear: () =>
    svg(
      fondo('#fbe9d2') +
        `<path d="M18 74l8-26 26-26 16 16-26 26z" fill="${PALETA.terracota}"/>
         <path d="M64 32l8-8 16 16-8 8z" fill="${PALETA.teal}"/>
         <circle cx="26" cy="74" r="7" fill="${PALETA.mostaza}"/>
         <path d="M6 88c10 6 24 6 34 0" stroke="${PALETA.azul}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
  colores: () =>
    svg(
      fondo('#e6f0f2') +
        `<circle cx="36" cy="40" r="26" fill="${PALETA.terracota}" opacity=".92"/>
         <circle cx="64" cy="40" r="26" fill="${PALETA.mostaza}" opacity=".85"/>
         <circle cx="50" cy="66" r="26" fill="${PALETA.azul}" opacity=".85"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
  reaccion: () =>
    svg(
      fondo('#fdeede') +
        `<circle cx="52" cy="50" r="24" fill="${PALETA.terracota}"/>
         <circle cx="52" cy="50" r="11" fill="${PALETA.papel}"/>
         <path d="M14 24l10 8M86 24l-10 8M14 78l10-8M86 78l-10-8" stroke="${PALETA.teal}" stroke-width="6" stroke-linecap="round"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
  sumas: () =>
    svg(
      fondo('#e9f1e4') +
        `<rect x="10" y="30" width="34" height="34" rx="10" fill="${PALETA.verde}"/>
         <rect x="56" y="30" width="34" height="34" rx="10" fill="${PALETA.mostaza}"/>
         <path d="M44 47h12M50 41v12" stroke="${PALETA.tinta}" stroke-width="5" stroke-linecap="round"/>
         <path d="M20 78h60" stroke="${PALETA.terracota}" stroke-width="6" stroke-linecap="round"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
  secuencias: () =>
    svg(
      fondo('#eeeaf6') +
        `<circle cx="20" cy="50" r="12" fill="${PALETA.lila}"/>
         <rect x="36" y="38" width="24" height="24" rx="6" fill="${PALETA.mostaza}"/>
         <circle cx="76" cy="50" r="12" fill="${PALETA.lila}"/>
         <path d="M92 50h4" stroke="${PALETA.tinta}" stroke-width="5" stroke-linecap="round"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
  agrupamientos: () =>
    svg(
      fondo('#fdf0e0') +
        // composición contenida en la banda central: la tarjeta del hub recorta arriba y abajo
        `<rect x="6" y="56" width="40" height="28" rx="7" fill="${PALETA.teal}" opacity=".2"/>
         <rect x="54" y="56" width="40" height="28" rx="7" fill="${PALETA.terracota}" opacity=".2"/>
         <circle cx="26" cy="70" r="10" fill="${PALETA.teal}"/>
         <rect x="64" y="60" width="20" height="20" rx="6" fill="${PALETA.terracota}"/>
         <circle cx="34" cy="32" r="11" fill="${PALETA.mostaza}"/>
         <rect x="56" y="22" width="20" height="20" rx="6" fill="${PALETA.azul}"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
  memoria: () =>
    svg(
      fondo('#e7eef5') +
        `<rect x="10" y="18" width="34" height="46" rx="8" fill="${PALETA.azul}" transform="rotate(-8 27 41)"/>
         <rect x="52" y="30" width="34" height="46" rx="8" fill="${PALETA.teal}" transform="rotate(9 69 53)"/>
         <circle cx="69" cy="53" r="9" fill="${PALETA.mostaza}"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
  geografia: () =>
    svg(
      fondo('#dfeef2') +
        `<circle cx="50" cy="50" r="34" fill="${PALETA.azul}"/>
         <path d="M22 34q14 6 26 0t28 2v10q-16-4-28 2t-26-2z" fill="${PALETA.verde}"/>
         <path d="M26 60q12 8 24 2t26 4v8q-14-4-26 2t-24-4z" fill="${PALETA.verde}" opacity=".85"/>
         <ellipse cx="50" cy="50" rx="16" ry="34" fill="none" stroke="#fffdf9" stroke-width="2.4" opacity=".8"/>
         <path d="M16 50h68" stroke="#fffdf9" stroke-width="2.4" opacity=".8"/>
         <path d="M78 20l6 12 12 2-9 8 2 12-11-6-11 6 2-12-9-8 12-2z" fill="${PALETA.mostaza}"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
  checkin: () =>
    svg(
      fondo('#e8f2ee') +
        `<path d="M6 70h88" stroke="${PALETA.teal}" stroke-width="5" stroke-linecap="round"/>
         <path d="M18 70V44l14-10 14 10v26z" fill="${PALETA.terracota}"/>
         <circle cx="68" cy="34" r="11" fill="${PALETA.mostaza}"/>
         <path d="M56 70V56h26v14z" fill="${PALETA.azul}"/>`,
      'preserveAspectRatio="xMidYMid slice"'
    ),
};

/* -------------------------------- objetos ilustrados reutilizables (juegos) */

/** Formas geométricas planas para clasificar, contar y emparejar. */
export const forma = {
  circulo: (c) => `<circle cx="50" cy="50" r="34" fill="${c}"/>`,
  cuadrado: (c) => `<rect x="18" y="18" width="64" height="64" rx="12" fill="${c}"/>`,
  triangulo: (c) => `<path d="M50 14l36 66H14z" fill="${c}" stroke-linejoin="round"/>`,
  estrella: (c) => `<path d="M50 12l11 23 25 3-18 18 4 25-22-12-22 12 4-25-18-18 25-3z" fill="${c}"/>`,
  corazon: (c) => `<path d="M50 84S14 62 14 40c0-12 9-20 19-20 8 0 14 5 17 10 3-5 9-10 17-10 10 0 19 8 19 20 0 22-36 44-36 44z" fill="${c}"/>`,
  gota: (c) => `<path d="M50 12c16 20 26 30 26 44a26 26 0 1 1-52 0c0-14 10-24 26-44z" fill="${c}"/>`,
  hexagono: (c) => `<path d="M50 12l33 19v38L50 88 17 69V31z" fill="${c}"/>`,
  flor: (c) =>
    `<g fill="${c}"><circle cx="50" cy="26" r="16"/><circle cx="50" cy="74" r="16"/><circle cx="26" cy="50" r="16"/><circle cx="74" cy="50" r="16"/><circle cx="50" cy="50" r="16"/></g>`,
};

export function formaSVG(nombre, color, extra = '') {
  return svg((forma[nombre] || forma.circulo)(color), extra);
}

/* --------------------------------- iconos de objetos para memoria/check-in */

export const objeto = {
  coche: (c) =>
    `<path d="M12 62c0-6 6-8 6-8l8-16h48l8 16s6 2 6 8v12H12z" fill="${c}"/><circle cx="30" cy="76" r="8" fill="#3a342f"/><circle cx="70" cy="76" r="8" fill="#3a342f"/>`,
  tren: (c) =>
    `<rect x="18" y="20" width="64" height="48" rx="10" fill="${c}"/><rect x="30" y="30" width="40" height="20" rx="5" fill="#fffdf9" opacity=".75"/><circle cx="34" cy="76" r="7" fill="#3a342f"/><circle cx="66" cy="76" r="7" fill="#3a342f"/>`,
  barco: (c) =>
    `<path d="M14 62h72l-12 20H26z" fill="${c}"/><path d="M50 12l22 42H50z" fill="#fffdf9"/><path d="M46 20L28 54h18z" fill="${c}" opacity=".7"/>`,
  avion: (c) => `<path d="M8 54l84-30-22 34-14 2-8 20-8-18-16-2z" fill="${c}"/>`,
  puente: (c) =>
    `<path d="M8 70h84" stroke="${c}" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M18 70V30M82 70V30" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M18 34c22 16 42 16 64 0" stroke="${c}" stroke-width="6" fill="none"/>`,
  montana: (c) =>
    `<path d="M6 80l28-46 18 26 12-16 30 36z" fill="${c}"/><path d="M34 34l10 16H24z" fill="#fffdf9"/>`,
  vaca: (c) =>
    `<ellipse cx="50" cy="56" rx="32" ry="22" fill="${c}"/><circle cx="30" cy="44" r="10" fill="#fffdf9"/><circle cx="64" cy="62" r="9" fill="#fffdf9"/><path d="M22 76v10M42 76v10M58 76v10M78 76v10" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  pajaro: (c) =>
    `<path d="M20 54c14-16 34-16 46-6l16-6-8 14c0 14-14 24-28 24S16 70 20 54z" fill="${c}"/><circle cx="62" cy="46" r="3" fill="#3a342f"/>`,
  arbol: (c) =>
    `<circle cx="50" cy="40" r="26" fill="${c}"/><rect x="44" y="58" width="12" height="30" rx="5" fill="#8a5a34"/>`,
  sol: (c) =>
    `<circle cx="50" cy="50" r="22" fill="${c}"/><g stroke="${c}" stroke-width="7" stroke-linecap="round"><path d="M50 10v10M50 80v10M10 50h10M80 50h10M22 22l7 7M71 71l7 7M78 22l-7 7M29 71l-7 7"/></g>`,
  nube: (c) =>
    `<path d="M26 68a16 16 0 0 1 2-32 22 22 0 0 1 42 4 14 14 0 0 1 4 28z" fill="${c}"/>`,
  lluvia: (c) =>
    `<path d="M26 56a15 15 0 0 1 2-30 21 21 0 0 1 40 4 13 13 0 0 1 4 26z" fill="${c}"/><path d="M34 68l-4 12M50 68l-4 12M66 68l-4 12" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
  casa: (c) =>
    `<path d="M14 50L50 20l36 30v34H14z" fill="${c}"/><rect x="42" y="60" width="16" height="24" rx="3" fill="#fffdf9"/>`,
  faro: (c) =>
    `<path d="M38 84l6-46h12l6 46z" fill="${c}"/><rect x="40" y="24" width="20" height="14" rx="4" fill="${c}"/><path d="M60 30l24-8M60 34l24 8" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
  semaforo: (c) =>
    `<rect x="34" y="12" width="32" height="62" rx="10" fill="${c}"/><circle cx="50" cy="28" r="8" fill="#d9634a"/><circle cx="50" cy="46" r="8" fill="#e9b23c"/><circle cx="50" cy="64" r="8" fill="#7fa650"/><path d="M50 74v14" stroke="${c}" stroke-width="7"/>`,
  bici: (c) =>
    `<circle cx="26" cy="64" r="16" fill="none" stroke="${c}" stroke-width="7"/><circle cx="74" cy="64" r="16" fill="none" stroke="${c}" stroke-width="7"/><path d="M26 64l18-28h16l14 28M44 36h16" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  camion: (c) =>
    `<path d="M8 34h46v34H8z" fill="${c}"/><path d="M56 44h20l12 16v8H56z" fill="${c}" opacity=".7"/><circle cx="26" cy="74" r="8" fill="#3a342f"/><circle cx="72" cy="74" r="8" fill="#3a342f"/>`,
  gasolinera: (c) =>
    `<path d="M20 84V24a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v60z" fill="${c}"/><rect x="28" y="28" width="20" height="14" rx="3" fill="#fffdf9"/><path d="M64 40h8v30a6 6 0 0 0 12 0V44" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  senal: (c) =>
    `<path d="M50 10l30 30-30 30-30-30z" fill="${c}"/><rect x="46" y="66" width="8" height="24" fill="${c}"/>`,
  tunel: (c) =>
    `<path d="M14 84V52a36 36 0 0 1 72 0v32z" fill="${c}"/><path d="M36 84V56a14 14 0 0 1 28 0v28z" fill="#fdf6ec"/>`,
  perro: (c) =>
    `<ellipse cx="46" cy="58" rx="28" ry="18" fill="${c}"/><circle cx="76" cy="44" r="14" fill="${c}"/><path d="M68 30l-6 12 12-2z" fill="${c}"/><path d="M24 72v12M42 72v12M60 70v14" stroke="${c}" stroke-width="7" stroke-linecap="round"/><circle cx="82" cy="42" r="3" fill="#3a342f"/>`,
  gato: (c) =>
    `<circle cx="50" cy="56" r="26" fill="${c}"/><path d="M30 36l-4-18 18 10zM70 36l4-18-18 10z" fill="${c}"/><circle cx="41" cy="54" r="3.5" fill="#3a342f"/><circle cx="59" cy="54" r="3.5" fill="#3a342f"/><path d="M44 66c3 4 9 4 12 0" stroke="#3a342f" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  flor: (c) =>
    `<circle cx="50" cy="34" r="12" fill="${c}"/><circle cx="32" cy="46" r="12" fill="${c}"/><circle cx="68" cy="46" r="12" fill="${c}"/><circle cx="50" cy="58" r="12" fill="${c}"/><circle cx="50" cy="46" r="9" fill="#e9b23c"/><path d="M50 60v28" stroke="#7fa650" stroke-width="6" stroke-linecap="round"/>`,
  mariposa: (c) =>
    `<path d="M48 50L22 26c-10 10-8 34 8 38 8 2 14-6 18-14z" fill="${c}"/><path d="M52 50l26-24c10 10 8 34-8 38-8 2-14-6-18-14z" fill="${c}" opacity=".75"/><rect x="46" y="30" width="8" height="46" rx="4" fill="#3a342f"/>`,
  helado: (c) =>
    `<path d="M34 44h32L50 90z" fill="#e9b23c"/><circle cx="50" cy="34" r="20" fill="${c}"/>`,
  globo: (c) =>
    `<ellipse cx="50" cy="40" rx="24" ry="28" fill="${c}"/><path d="M50 68v22" stroke="#3a342f" stroke-width="4" fill="none"/><path d="M44 68h12l-6 8z" fill="${c}"/>`,
  luna: (c) => `<path d="M64 14a38 38 0 1 0 22 60A34 34 0 0 1 64 14z" fill="${c}"/>`,
  estrella: (c) => forma.estrella(c),
  puerto: (c) =>
    `<path d="M50 18a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM50 34v46" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M22 60c0 18 12 26 28 26s28-8 28-26" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M34 42h32" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  maleta: (c) =>
    `<rect x="16" y="34" width="68" height="46" rx="10" fill="${c}"/><path d="M38 34V24h24v10" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M16 52h68" stroke="#fffdf9" stroke-width="6" opacity=".6"/>`,
  reloj: (c) =>
    `<circle cx="50" cy="52" r="32" fill="none" stroke="${c}" stroke-width="7"/><path d="M50 32v22l14 10" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
};

export function objetoSVG(nombre, color) {
  const f = objeto[nombre] || objeto.estrella;
  return svg(f(color));
}

export const nombresObjeto = Object.keys(objeto);
