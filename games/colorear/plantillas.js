/**
 * Plantillas de dibujo para colorear. Cada región es una figura independiente
 * que se rellena al tocarla; los "detalles" (ojos, antenas, líneas) no se pintan.
 * Trazo geométrico y plano, coherente con el resto de la ilustración de la app.
 */

const R = (d, extra = '') => `<path class="colorear__region" d="${d}" ${extra}/>`;
const C = (cx, cy, r) => `<circle class="colorear__region" cx="${cx}" cy="${cy}" r="${r}"/>`;
const E = (cx, cy, rx, ry, extra = '') =>
  `<ellipse class="colorear__region" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${extra}/>`;
const Q = (x, y, w, h, rx = 0) =>
  `<rect class="colorear__region" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;

const linea = (d, w = 3) =>
  `<path class="colorear__detalle" d="${d}" fill="none" stroke="#3a342f" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const punto = (cx, cy, r) => `<circle class="colorear__detalle" cx="${cx}" cy="${cy}" r="${r}" fill="#3a342f"/>`;

/* ------------------------------------------------------------ nivel 1 --- */

const casa = {
  id: 'casa',
  nombre: 'La casa del campo',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 132), // cielo
    Q(0, 132, 200, 68), // prado
    C(163, 36, 24), // sol
    R('M40 96 L100 48 L160 96 Z'), // tejado
    Q(56, 96, 88, 62), // fachada
    Q(88, 120, 26, 38, 4), // puerta
    Q(66, 106, 22, 20, 3), // ventana
    C(30, 112, 24), // copa del árbol
    Q(25, 132, 10, 26, 3), // tronco
    R('M150 130 q10 -18 24 -8 q12 -12 20 6 q6 14 -10 14 h-30 q-10 0 -4 -12 Z'), // arbusto
  ].join(''),
  detalles: [linea('M100 48 L100 96'), linea('M56 158 L144 158'), punto(108, 140, 3)].join(''),
};

const flor = {
  id: 'flor',
  nombre: 'La flor gigante',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 200), // fondo
    C(100, 46, 26), // pétalo superior
    C(64, 70, 26), // pétalo izq. superior
    C(136, 70, 26), // pétalo dcho. superior
    C(78, 108, 26), // pétalo izq. inferior
    C(122, 108, 26), // pétalo dcho. inferior
    C(100, 84, 22), // centro
    Q(94, 104, 12, 78, 6), // tallo
    E(64, 140, 26, 14, 'transform="rotate(-20 64 140)"'), // hoja izquierda
    E(136, 158, 26, 14, 'transform="rotate(20 136 158)"'), // hoja derecha
  ].join(''),
  detalles: [linea('M100 120 L100 176'), linea('M52 140 L76 146'), linea('M148 158 L124 162')].join(''),
};

const barco = {
  id: 'barco',
  nombre: 'El barco del viaje',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 128), // cielo
    Q(0, 128, 200, 72), // mar
    C(40, 40, 20), // sol
    R('M40 128 L160 128 L140 168 L60 168 Z'), // casco
    R('M100 30 L100 122 L152 122 Z'), // vela grande
    R('M96 46 L60 122 L96 122 Z'), // vela pequeña
    Q(96, 24, 8, 100, 4), // mástil
  ].join(''),
  detalles: [
    linea('M12 150 q14 -8 28 0 q14 8 28 0'),
    linea('M132 150 q14 -8 28 0'),
    linea('M150 42 q10 -10 20 0'),
    linea('M162 34 q10 -10 20 0'),
  ].join(''),
};

/* ------------------------------------------------------------ nivel 2 --- */

const mariposa = {
  id: 'mariposa',
  nombre: 'La mariposa del prado',
  nivel: 2,
  svg: [
    Q(0, 0, 200, 200),
    R('M96 96 C60 40 20 44 22 82 C24 112 60 116 96 100 Z'), // ala sup. izq.
    R('M104 96 C140 40 180 44 178 82 C176 112 140 116 104 100 Z'), // ala sup. dcha.
    R('M96 104 C66 128 40 148 58 168 C76 186 94 152 98 122 Z'), // ala inf. izq.
    R('M104 104 C134 128 160 148 142 168 C124 186 106 152 102 122 Z'), // ala inf. dcha.
    C(52, 76, 12), // lunar izq. grande
    C(148, 76, 12), // lunar dcho. grande
    C(74, 148, 8), // lunar izq. pequeño
    C(126, 148, 8), // lunar dcho. pequeño
    E(100, 108, 9, 34), // cuerpo
    C(100, 66, 12), // cabeza
    C(28, 176, 12), // flor del suelo izq.
    C(172, 176, 12), // flor del suelo dcha.
    Q(0, 188, 200, 12), // hierba
  ].join(''),
  detalles: [
    linea('M94 58 C86 40 72 34 62 34', 3),
    linea('M106 58 C114 40 128 34 138 34', 3),
    punto(94, 64, 2.6),
    punto(106, 64, 2.6),
    linea('M100 84 L100 138', 2),
    linea('M28 176 L28 194', 3),
    linea('M172 176 L172 194', 3),
  ].join(''),
};

const tren = {
  id: 'tren',
  nombre: 'El tren de montaña',
  nivel: 2,
  svg: [
    Q(0, 0, 200, 118), // cielo
    C(168, 32, 18), // sol
    R('M0 118 L46 56 L92 118 Z'), // montaña izquierda
    R('M62 118 L114 44 L166 118 Z'), // montaña central
    R('M132 118 L176 62 L200 118 Z'), // montaña derecha
    R('M96 66 L114 44 L132 66 Z'), // nieve de la cima
    Q(0, 118, 200, 26), // prado
    Q(0, 144, 200, 56), // vía
    Q(18, 108, 62, 36, 6), // vagón
    Q(88, 96, 70, 48, 8), // locomotora
    Q(140, 74, 22, 24, 4), // chimenea
    Q(100, 106, 18, 18, 3), // ventana locomotora
    Q(28, 116, 16, 16, 3), // ventana vagón 1
    Q(52, 116, 16, 16, 3), // ventana vagón 2
    C(40, 150, 13), // rueda vagón
    C(106, 152, 15), // rueda locomotora grande
    C(146, 152, 11), // rueda locomotora pequeña
    C(158, 58, 12), // humo 1
    C(178, 42, 9), // humo 2
    C(192, 28, 6), // humo 3
  ].join(''),
  detalles: [
    linea('M0 170 L200 170', 4),
    linea('M20 162 L20 178 M60 162 L60 178 M100 162 L100 178 M140 162 L140 178 M180 162 L180 178', 3),
    punto(40, 150, 3),
    punto(106, 152, 3),
  ].join(''),
};

const gato = {
  id: 'gato',
  nombre: 'El gato viajero',
  nivel: 2,
  svg: [
    Q(0, 0, 200, 200), // fondo
    E(100, 132, 52, 44), // cuerpo
    C(100, 74, 36), // cabeza
    R('M70 50 L64 16 L94 40 Z'), // oreja izquierda
    R('M130 50 L136 16 L106 40 Z'), // oreja derecha
    R('M150 140 C186 132 188 96 168 92 C182 108 168 124 146 122 Z'), // cola
    E(72, 172, 16, 10), // pata izquierda
    E(128, 172, 16, 10), // pata derecha
    E(100, 86, 12, 9), // hocico
    C(56, 40, 10), // sol pequeño
    Q(0, 184, 200, 16), // suelo
    C(28, 168, 12), // ovillo
  ].join(''),
  detalles: [
    punto(86, 68, 4),
    punto(114, 68, 4),
    linea('M100 82 L100 90', 3),
    linea('M92 92 q8 8 16 0', 3),
    linea('M62 78 L34 72 M62 86 L34 90 M138 78 L166 72 M138 86 L166 90', 2.5),
    linea('M20 162 q10 6 16 12 M22 174 q12 -4 14 -10', 2.5),
  ].join(''),
};

/* ------------------------------------ nivel 1: más dibujos para las peques --- */

const pez = {
  id: 'pez',
  nombre: 'El pez del mar',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 200), // agua
    E(96, 100, 62, 42), // cuerpo
    R('M158 100 L192 68 L192 132 Z'), // cola
    R('M84 58 L110 58 L96 30 Z'), // aleta de arriba
    R('M84 142 L112 142 L98 172 Z'), // aleta de abajo
    C(56, 92, 9), // ojo
    C(34, 60, 10), // burbuja grande
    C(20, 40, 6), // burbuja pequeña
    R('M0 176 q24 -16 48 0 q24 16 48 0 q24 -16 48 0 q24 16 56 0 v24 H0 Z'), // fondo marino
  ].join(''),
  detalles: [punto(56, 92, 4), linea('M120 78 q16 22 0 44', 3), linea('M138 84 q12 16 0 32', 3)].join(''),
};

const cohete = {
  id: 'cohete',
  nombre: 'El cohete',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 200), // cielo
    R('M100 16 C128 44 134 84 134 122 H66 C66 84 72 44 100 16 Z'), // cuerpo
    C(100, 74, 18), // ventana
    R('M66 100 L34 148 L66 138 Z'), // ala izquierda
    R('M134 100 L166 148 L134 138 Z'), // ala derecha
    R('M78 122 h44 l-8 26 H86 Z'), // base
    R('M86 148 q14 34 28 0 q-6 26 -14 34 q-8 -8 -14 -34 Z'), // llama
    C(30, 40, 9), // estrella / planeta
    C(170, 54, 12),
  ].join(''),
  detalles: [linea('M100 56 L100 92', 2.5), punto(30, 40, 3)].join(''),
};

const helado = {
  id: 'helado',
  nombre: 'El helado',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 200),
    C(100, 60, 34), // bola de arriba
    C(72, 96, 26), // bola izquierda
    C(128, 96, 26), // bola derecha
    R('M66 116 H134 L100 184 Z'), // cucurucho
    C(100, 24, 10), // guinda
  ].join(''),
  detalles: [
    linea('M78 130 L112 168 M96 122 L128 152', 2.5),
    linea('M100 34 L100 26', 3),
  ].join(''),
};

const globoAerostatico = {
  id: 'globo-aerostatico',
  nombre: 'El globo del cielo',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 200), // cielo
    R('M100 16 C142 16 168 48 168 82 C168 112 140 130 100 148 C60 130 32 112 32 82 C32 48 58 16 100 16 Z'), // globo
    R('M100 16 C118 30 126 54 126 82 C126 108 116 130 100 148 C84 130 74 108 74 82 C74 54 82 30 100 16 Z'), // franja central
    Q(84, 156, 32, 26, 5), // cesta
    C(36, 44, 12), // nube
    C(164, 150, 14),
  ].join(''),
  detalles: [linea('M86 148 L88 156 M114 148 L112 156', 3), linea('M84 168 h32', 2.5)].join(''),
};

const tortuga = {
  id: 'tortuga',
  nombre: 'La tortuga',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 200),
    E(100, 104, 60, 42), // caparazón
    C(158, 118, 18), // cabeza
    E(52, 142, 18, 11), // pata trasera
    E(140, 150, 18, 11), // pata delantera
    C(100, 96, 20), // placa central
    C(66, 96, 14), // placa izquierda
    C(134, 96, 14), // placa derecha
    Q(0, 176, 200, 24), // suelo
  ].join(''),
  detalles: [punto(166, 112, 4), linea('M100 76 L100 62', 2.5)].join(''),
};

const camion = {
  id: 'camion',
  nombre: 'El camión',
  nivel: 1,
  svg: [
    Q(0, 0, 200, 130), // cielo
    Q(0, 130, 200, 70), // carretera
    Q(16, 62, 92, 62, 6), // caja
    R('M112 82 h34 l24 26 v20 h-58 Z'), // cabina
    Q(120, 90, 22, 18, 3), // ventanilla
    C(52, 150, 16), // rueda trasera
    C(146, 150, 16), // rueda delantera
    C(168, 30, 16), // sol
  ].join(''),
  detalles: [
    punto(52, 150, 5),
    punto(146, 150, 5),
    linea('M16 92 h92', 2.5),
    linea('M0 170 h40 M70 170 h40 M140 170 h60', 4),
  ].join(''),
};

/* ---------------------------- nivel 2: mandalas generados por geometría --- */

const grados = (g) => (g * Math.PI) / 180;
const punto2 = (cx, cy, r, ang) => [
  (cx + r * Math.cos(grados(ang))).toFixed(2),
  (cy + r * Math.sin(grados(ang))).toFixed(2),
];

/** Sector de corona circular: la pieza básica de un mandala. */
function sector(cx, cy, rInt, rExt, a1, a2) {
  const [x1, y1] = punto2(cx, cy, rExt, a1);
  const [x2, y2] = punto2(cx, cy, rExt, a2);
  const [x3, y3] = punto2(cx, cy, rInt, a2);
  const [x4, y4] = punto2(cx, cy, rInt, a1);
  const grande = a2 - a1 > 180 ? 1 : 0;
  return R(
    `M${x1} ${y1} A${rExt} ${rExt} 0 ${grande} 1 ${x2} ${y2} L${x3} ${y3} A${rInt} ${rInt} 0 ${grande} 0 ${x4} ${y4} Z`
  );
}

/** Pétalo alargado que sale del centro, repetido en cada sector. */
function petalo(cx, cy, rInt, rExt, ang, ancho) {
  const [px, py] = punto2(cx, cy, rExt, ang);
  const [ax, ay] = punto2(cx, cy, (rInt + rExt) / 2, ang - ancho);
  const [bx, by] = punto2(cx, cy, (rInt + rExt) / 2, ang + ancho);
  const [ix, iy] = punto2(cx, cy, rInt, ang);
  return R(`M${ix} ${iy} Q${ax} ${ay} ${px} ${py} Q${bx} ${by} ${ix} ${iy} Z`);
}

/** Rombo apuntando hacia fuera. */
function rombo(cx, cy, rInt, rExt, ang, ancho) {
  const [ex, ey] = punto2(cx, cy, rExt, ang);
  const [ix, iy] = punto2(cx, cy, rInt, ang);
  const [ax, ay] = punto2(cx, cy, (rInt + rExt) / 2, ang - ancho);
  const [bx, by] = punto2(cx, cy, (rInt + rExt) / 2, ang + ancho);
  return R(`M${ix} ${iy} L${ax} ${ay} L${ex} ${ey} L${bx} ${by} Z`);
}

/**
 * Construye un mandala completo a partir de anillos descritos por geometría.
 * Cada pieza es una región coloreable independiente.
 */
function mandala({ id, nombre, sectores, anillos, centro = 16 }) {
  const cx = 100;
  const cy = 100;
  const paso = 360 / sectores;
  const piezas = [Q(0, 0, 200, 200), C(cx, cy, centro)];
  const guias = [];

  for (const anillo of anillos) {
    const { tipo, rInt, rExt, desfase = 0, densidad = 1, ancho = paso / 2.6 } = anillo;
    const n = sectores * densidad;
    const p = 360 / n;
    for (let i = 0; i < n; i++) {
      const a = i * p + desfase;
      if (tipo === 'sector') piezas.push(sector(cx, cy, rInt, rExt, a, a + p));
      else if (tipo === 'petalo') piezas.push(petalo(cx, cy, rInt, rExt, a, ancho));
      else if (tipo === 'rombo') piezas.push(rombo(cx, cy, rInt, rExt, a, ancho));
      else if (tipo === 'circulo') {
        const [x, y] = punto2(cx, cy, (rInt + rExt) / 2, a);
        piezas.push(C(x, y, (rExt - rInt) / 2));
      }
    }
    // La circunferencia de guía solo se traza donde coincide con un borde real
    // (anillos de sector); sobre pétalos o círculos los cortaría por la mitad.
    if (tipo === 'sector' && anillo.guia !== false) {
      guias.push(
        `<circle class="colorear__detalle" cx="${cx}" cy="${cy}" r="${rExt}" fill="none" stroke="#3a342f" stroke-width="1.4" opacity=".55"/>`
      );
    }
  }

  return { id, nombre, nivel: 2, mandala: true, svg: piezas.join(''), detalles: guias.join('') };
}

const mandalaFlor = mandala({
  id: 'mandala-flor',
  nombre: 'Mandala de flores',
  sectores: 8,
  // los círculos van encerrados entre dos anillos de sectores: si no, flotan
  anillos: [
    { tipo: 'petalo', rInt: 14, rExt: 40, ancho: 14 },
    { tipo: 'sector', rInt: 40, rExt: 54 },
    { tipo: 'circulo', rInt: 54, rExt: 70, densidad: 2 },
    { tipo: 'sector', rInt: 70, rExt: 84 },
    { tipo: 'petalo', rInt: 84, rExt: 100, desfase: 22.5, ancho: 10 },
  ],
});

const mandalaEstrella = mandala({
  id: 'mandala-estrella',
  nombre: 'Mandala de estrellas',
  sectores: 12,
  centro: 14,
  anillos: [
    { tipo: 'rombo', rInt: 12, rExt: 44 },
    { tipo: 'sector', rInt: 44, rExt: 56, guia: false },
    { tipo: 'rombo', rInt: 56, rExt: 84, desfase: 15 },
    { tipo: 'sector', rInt: 84, rExt: 96 },
  ],
});

const mandalaGeometrico = mandala({
  id: 'mandala-geometrico',
  nombre: 'Mandala geométrico',
  sectores: 6,
  centro: 20,
  anillos: [
    { tipo: 'sector', rInt: 20, rExt: 40, guia: false },
    { tipo: 'rombo', rInt: 40, rExt: 66, ancho: 26 },
    { tipo: 'sector', rInt: 66, rExt: 80, densidad: 2 },
    { tipo: 'petalo', rInt: 80, rExt: 98, densidad: 2, ancho: 12 },
  ],
});

const mandalaOndas = mandala({
  id: 'mandala-ondas',
  nombre: 'Mandala de ondas',
  sectores: 16,
  centro: 12,
  anillos: [
    { tipo: 'sector', rInt: 12, rExt: 34, guia: false },
    { tipo: 'circulo', rInt: 34, rExt: 54 },
    { tipo: 'sector', rInt: 54, rExt: 74, desfase: 11.25, guia: false },
    { tipo: 'petalo', rInt: 74, rExt: 98, ancho: 9 },
  ],
});

export const PLANTILLAS = [
  // nivel 1
  casa,
  flor,
  barco,
  pez,
  cohete,
  helado,
  globoAerostatico,
  tortuga,
  camion,
  // nivel 2
  mariposa,
  tren,
  gato,
  mandalaFlor,
  mandalaEstrella,
  mandalaGeometrico,
  mandalaOndas,
];

/** Cada nivel tiene sus propias láminas: las peques no reciben mandalas. */
export const plantillasDeNivel = (nivel) => PLANTILLAS.filter((p) => p.nivel === nivel);
