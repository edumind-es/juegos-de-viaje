/**
 * Colores.
 * Nivel 1: identificar un color entre 4 opciones.
 * Nivel 2: mezclas de color, tonos y matices, con 6 opciones simultáneas.
 */

import { el, limpiar, marcar, mostrarSello, vibrar } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { decir, vozActiva } from '../../core/speech.js';
import { baraja, muestra, elige, azar } from '../../core/rng.js';

const RONDAS = 10;

/* Colores básicos con nombre, para el nivel de las peques. */
const BASICOS = [
  { nombre: 'rojo', hex: '#d9634a' },
  { nombre: 'amarillo', hex: '#e9b23c' },
  { nombre: 'azul', hex: '#6fa8c7' },
  { nombre: 'verde', hex: '#7fa650' },
  { nombre: 'morado', hex: '#9b8bc4' },
  { nombre: 'rosa', hex: '#e79a94' },
  { nombre: 'naranja', hex: '#e08a3c' },
  { nombre: 'marrón', hex: '#8a5a34' },
];

/* Mezclas clásicas para el nivel mayor. */
const MEZCLAS = [
  { a: 'amarillo', b: 'azul', resultado: 'verde' },
  { a: 'rojo', b: 'amarillo', resultado: 'naranja' },
  { a: 'rojo', b: 'azul', resultado: 'morado' },
  { a: 'rojo', b: 'blanco', resultado: 'rosa' },
  { a: 'azul', b: 'blanco', resultado: 'celeste' },
  { a: 'amarillo', b: 'rojo', resultado: 'naranja' },
  { a: 'verde', b: 'blanco', resultado: 'verde claro' },
  { a: 'negro', b: 'blanco', resultado: 'gris' },
];

const HEX = {
  ...Object.fromEntries(BASICOS.map((c) => [c.nombre, c.hex])),
  blanco: '#fffdf9',
  negro: '#3a342f',
  celeste: '#a8d0e6',
  gris: '#9a938c',
  'verde claro': '#a9c97e',
};

/** Aclara u oscurece un color hexadecimal (para tonos y matices). */
function tono(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const mezcla = (c) =>
    Math.round(factor > 0 ? c + (255 - c) * factor : c * (1 + factor))
      .toString(16)
      .padStart(2, '0');
  return '#' + mezcla((n >> 16) & 255) + mezcla((n >> 8) & 255) + mezcla(n & 255);
}

export function iniciar(ctx) {
  const { area, nivel, marco } = ctx;
  const opciones = nivel === 1 ? 4 : 6;

  let ronda = 0;
  let aciertos = 0;
  let bloqueado = false;
  const timers = new Set();
  const luego = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };

  const muestrario = el('div', { clase: 'colores__muestra' });
  const rejilla = el('div', { clase: 'colores__opciones' });
  area.append(muestrario, rejilla);

  function marcador() {
    marco.setMarcador(`${ronda}/${RONDAS}`);
  }

  /* --- generación de rondas --- */

  function rondaNivel1() {
    const elegidos = muestra(BASICOS, opciones);
    const bueno = elige(elegidos);
    return {
      pregunta: `Toca el color ${bueno.nombre}`,
      // "leible": con el perfil de 5 años la palabra se muestra en mayúsculas
      muestra: el('div', { clase: 'colores__pista' }, [
        el('span', { clase: 'colores__palabra leible', texto: bueno.nombre }),
      ]),
      opciones: elegidos.map((c) => ({ hex: c.hex, correcta: c.nombre === bueno.nombre, etiqueta: c.nombre })),
    };
  }

  function rondaMezcla() {
    const m = elige(MEZCLAS);
    const distractores = muestra(
      Object.keys(HEX).filter((n) => n !== m.resultado),
      opciones - 1
    );
    const lista = baraja([m.resultado, ...distractores]).map((n) => ({
      hex: HEX[n],
      correcta: n === m.resultado,
      etiqueta: n,
    }));
    return {
      pregunta: `¿Qué color sale al mezclar ${m.a} y ${m.b}?`,
      muestra: el('div', { clase: 'colores__pista' }, [
        el('span', { clase: 'colores__gota', estilo: { background: HEX[m.a] } }),
        el('span', { clase: 'colores__mas', texto: '+' }),
        el('span', { clase: 'colores__gota', estilo: { background: HEX[m.b] } }),
        el('span', { clase: 'colores__mas', texto: '=' }),
        el('span', { clase: 'colores__gota colores__gota--incognita', texto: '?' }),
      ]),
      opciones: lista,
    };
  }

  function rondaTono() {
    const base = elige(BASICOS);
    const masClaro = azar(2) === 0;
    const factores = [0.55, 0.3, 0, -0.25, -0.45, 0.75].slice(0, opciones);
    const variantes = baraja(factores).map((f) => ({ hex: tono(base.hex, f), f }));
    const objetivo = masClaro
      ? variantes.reduce((a, b) => (b.f > a.f ? b : a))
      : variantes.reduce((a, b) => (b.f < a.f ? b : a));
    return {
      pregunta: `Toca el ${base.nombre} más ${masClaro ? 'claro' : 'oscuro'}`,
      muestra: el('div', { clase: 'colores__pista' }, [
        el('span', { clase: 'colores__gota', estilo: { background: base.hex } }),
        el('span', { clase: 'colores__palabra', texto: masClaro ? 'más claro' : 'más oscuro' }),
      ]),
      opciones: variantes.map((v) => ({ hex: v.hex, correcta: v === objetivo, etiqueta: base.nombre })),
    };
  }

  function siguiente() {
    if (ronda >= RONDAS) return terminar();
    ronda++;
    marcador();
    bloqueado = false;

    const r = nivel === 1 ? rondaNivel1() : azar(2) === 0 ? rondaMezcla() : rondaTono();
    marco.setInstruccion(r.pregunta);
    if (vozActiva()) decir(r.pregunta);

    limpiar(muestrario).appendChild(r.muestra);
    limpiar(rejilla);
    rejilla.dataset.n = String(opciones);

    for (const o of baraja(r.opciones)) {
      const b = el('button', {
        clase: 'colores__opcion',
        type: 'button',
        'aria-label': o.etiqueta,
        estilo: { background: o.hex },
      });
      b.addEventListener('click', () => responder(b, o.correcta));
      rejilla.appendChild(b);
    }
  }

  function responder(nodo, correcta) {
    if (bloqueado) return;
    bloqueado = true;

    if (correcta) {
      aciertos++;
      sonido.acierto();
      marcar(nodo, true);
      mostrarSello('bien');
      vibrar(15);
      luego(siguiente, 720);
    } else {
      sonido.fallo();
      marcar(nodo, false);
      vibrar(30);
      // en nivel 1 no se pierde la ronda: se puede volver a intentar
      luego(() => {
        bloqueado = false;
        if (nivel === 2) siguiente();
      }, 620);
    }
  }

  function terminar() {
    const ratio = aciertos / RONDAS;
    const estrellas = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    ctx.terminar({ estrellas, texto: `Has acertado ${aciertos} de ${RONDAS}.` });
  }

  siguiente();

  return {
    destruir() {
      timers.forEach(clearTimeout);
      timers.clear();
    },
    pausa(activa) {
      bloqueado = activa;
    },
  };
}
