/**
 * Catálogo de minijuegos y carga dinámica de módulos.
 * Cada juego es un módulo ES independiente con su propia hoja de estilos: solo se
 * descarga y ejecuta cuando la niña entra en él (aunque el service worker ya lo
 * tiene precacheado para funcionar sin conexión).
 */

import { arteJuego } from './art.js';

export const CATALOGO = [
  {
    id: 'colorear',
    nombre: 'Colorear',
    arte: arteJuego.colorear,
    instrucciones: {
      1: 'Toca un color y luego toca el dibujo para pintarlo.',
      2: 'Elige color y herramienta: relleno para zonas y pincel para dibujar encima.',
    },
  },
  {
    id: 'colores',
    nombre: 'Colores',
    arte: arteJuego.colores,
    instrucciones: {
      1: 'Busca el color que te pedimos y tócalo.',
      2: 'Mira la mezcla o el tono y elige el color correcto.',
    },
  },
  {
    id: 'reaccion',
    nombre: 'Reacción',
    arte: arteJuego.reaccion,
    instrucciones: {
      1: 'Toca la figura en cuanto aparezca. Sin prisa.',
      2: 'Toca solo la figura correcta. Cuidado con las intrusas.',
    },
  },
  {
    id: 'sumas',
    nombre: 'Sumas y restas',
    // el nombre puede cambiar según el nivel del perfil activo
    nombres: { 2: 'Sumas, restas y tablas' },
    arte: arteJuego.sumas,
    instrucciones: {
      1: 'Cuenta los objetos y toca el número correcto.',
      2: 'Resuelve la operación y elige el resultado. También hay tablas de multiplicar.',
    },
  },
  {
    id: 'secuencias',
    nombre: 'Secuencias',
    arte: arteJuego.secuencias,
    instrucciones: {
      1: 'Mira el patrón y elige la pieza que sigue.',
      2: 'Descubre la regla de la serie y elige lo que continúa.',
    },
  },
  {
    id: 'agrupamientos',
    nombre: 'Agrupamientos',
    arte: arteJuego.agrupamientos,
    instrucciones: {
      1: 'Lleva cada pieza a su caja.',
      2: 'Fíjate en las dos pistas de cada caja antes de soltar la pieza.',
    },
  },
  {
    id: 'memoria',
    nombre: 'Memoria',
    arte: arteJuego.memoria,
    instrucciones: {
      1: 'Levanta dos cartas y busca la pareja.',
      2: 'Encuentra todas las parejas con los menos intentos posibles.',
    },
  },
  {
    id: 'geografia',
    nombre: 'Geografía',
    arte: arteJuego.geografia,
    instrucciones: {
      1: 'Elige un juego: banderas, continentes, océanos o comunidades.',
      2: 'Elige qué practicar: banderas, países, provincias, ríos, montañas o mares.',
    },
  },
  {
    id: 'checkin',
    nombre: 'Check-in de viaje',
    arte: arteJuego.checkin,
    instrucciones: {
      1: 'Cuando veas algo por la ventanilla, tócalo en el panel.',
      2: 'Marca todo lo que veas durante el viaje y completa líneas.',
    },
  },
];

export const juegoPorId = (id) => CATALOGO.find((j) => j.id === id) || null;

/** Nombre visible del juego, que puede depender del nivel del perfil. */
export const nombreJuego = (juego, nivel) => juego.nombres?.[nivel] || juego.nombre;

const cssCargado = new Set();

function cargarCSS(id) {
  if (cssCargado.has(id)) return Promise.resolve();
  cssCargado.add(id);
  return new Promise((resolve) => {
    const href = new URL(`../games/${id}/style.css`, import.meta.url).href;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

const modulos = new Map();

/** Carga (una sola vez) el módulo y el CSS de un juego. */
export async function cargarJuego(id) {
  await cargarCSS(id);
  if (modulos.has(id)) return modulos.get(id);
  const mod = await import(`../games/${id}/game.js`);
  modulos.set(id, mod);
  return mod;
}
