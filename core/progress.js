/**
 * Progreso y recompensas por perfil: estrellas, partidas, racha de días y medallas.
 * Diseño deliberado: nada de rankings ni comparación entre hermanas. Solo logros propios.
 */

import { leer, escribir, hoy, diasEntre } from './storage.js';

const clave = (id) => `progreso.${id}`;

const VACIO = {
  estrellas: 0,
  partidas: 0,
  porJuego: {}, // { idJuego: { estrellas, partidas, mejor } }
  racha: 0,
  mejorRacha: 0,
  ultimoDia: null,
  medallas: [], // claves de medallas ya conseguidas
};

export function progreso(perfilId) {
  return { ...VACIO, ...leer(clave(perfilId), {}) };
}

function guardar(perfilId, datos) {
  return escribir(clave(perfilId), datos);
}

/** Se llama al entrar con un perfil: mantiene viva la racha de días jugados. */
export function registrarVisita(perfilId) {
  const p = progreso(perfilId);
  const dia = hoy();
  if (p.ultimoDia === dia) return p;

  if (!p.ultimoDia) p.racha = 1;
  else {
    const d = diasEntre(p.ultimoDia, dia);
    p.racha = d === 1 ? p.racha + 1 : 1;
  }
  p.ultimoDia = dia;
  p.mejorRacha = Math.max(p.mejorRacha || 0, p.racha);
  return guardar(perfilId, p);
}

/**
 * Cierra una partida.
 * @returns {{progreso: object, nuevasMedallas: object[]}}
 */
export function registrarPartida(perfilId, idJuego, estrellas) {
  const p = progreso(perfilId);
  const e = Math.max(0, Math.min(3, estrellas | 0));

  p.estrellas += e;
  p.partidas += 1;

  const j = p.porJuego[idJuego] || { estrellas: 0, partidas: 0, mejor: 0 };
  j.estrellas += e;
  j.partidas += 1;
  j.mejor = Math.max(j.mejor, e);
  p.porJuego[idJuego] = j;

  const nuevas = revisarMedallas(p);
  guardar(perfilId, p);
  return { progreso: p, nuevasMedallas: nuevas };
}

export function estrellasDeJuego(perfilId, idJuego) {
  return progreso(perfilId).porJuego[idJuego]?.estrellas || 0;
}

/* ------------------------------------------------------------- medallas */

/** Cada medalla: hito alcanzable, redactado en positivo. */
export const MEDALLAS = [
  { id: 'primera', emblema: 'estrella', color: '#e9b23c', nombre: 'La primera', desc: 'Tu primera partida', test: (p) => p.partidas >= 1 },
  { id: 'diez', emblema: 'estrella', color: '#6fa8c7', nombre: 'Diez partidas', desc: 'Has jugado 10 veces', test: (p) => p.partidas >= 10 },
  { id: 'cincuenta', emblema: 'corazon', color: '#e79a94', nombre: 'Cincuenta', desc: '50 partidas jugadas', test: (p) => p.partidas >= 50 },
  { id: 'estrellas25', emblema: 'estrella', color: '#d9634a', nombre: '25 estrellas', desc: 'Has reunido 25 estrellas', test: (p) => p.estrellas >= 25 },
  { id: 'estrellas100', emblema: 'estrella', color: '#2e7d74', nombre: '100 estrellas', desc: 'Has reunido 100 estrellas', test: (p) => p.estrellas >= 100 },
  { id: 'racha3', emblema: 'fuego', color: '#d9634a', nombre: 'Racha de 3', desc: 'Tres días seguidos', test: (p) => (p.mejorRacha || 0) >= 3 },
  { id: 'racha7', emblema: 'fuego', color: '#e9b23c', nombre: 'Racha de 7', desc: 'Una semana entera', test: (p) => (p.mejorRacha || 0) >= 7 },
  { id: 'sumas10', emblema: 'suma', color: '#7fa650', nombre: 'Calculadora', desc: '10 partidas de sumas', test: (p) => (p.porJuego.sumas?.partidas || 0) >= 10 },
  { id: 'memoria10', emblema: 'cerebro', color: '#9b8bc4', nombre: 'Memorión', desc: '10 partidas de memoria', test: (p) => (p.porJuego.memoria?.partidas || 0) >= 10 },
  { id: 'reaccion10', emblema: 'rayo', color: '#e9b23c', nombre: 'Rayo', desc: '10 partidas de reacción', test: (p) => (p.porJuego.reaccion?.partidas || 0) >= 10 },
  { id: 'artista', emblema: 'pincel', color: '#d9634a', nombre: 'Artista', desc: '5 dibujos terminados', test: (p) => (p.porJuego.colorear?.partidas || 0) >= 5 },
  { id: 'exploradora', emblema: 'ojo', color: '#2e7d74', nombre: 'Exploradora', desc: '5 rondas de check-in', test: (p) => (p.porJuego.checkin?.partidas || 0) >= 5 },
  { id: 'geografa', emblema: 'ojo', color: '#6fa8c7', nombre: 'Viajera', desc: '10 rondas de geografía', test: (p) => (p.porJuego.geografia?.partidas || 0) >= 10 },
  { id: 'todos', emblema: 'corazon', color: '#9b8bc4', nombre: 'Curiosa', desc: 'Has probado todos los juegos', test: (p) => Object.keys(p.porJuego).length >= 9 },
];

function revisarMedallas(p) {
  const nuevas = [];
  for (const m of MEDALLAS) {
    if (!p.medallas.includes(m.id) && m.test(p)) {
      p.medallas.push(m.id);
      nuevas.push(m);
    }
  }
  return nuevas;
}

/** Comprueba medallas fuera de partida (por ejemplo, al conseguir racha al entrar). */
export function revisarMedallasDe(perfilId) {
  const p = progreso(perfilId);
  const nuevas = revisarMedallas(p);
  if (nuevas.length) guardar(perfilId, p);
  return nuevas;
}
