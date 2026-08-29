/**
 * Reacción.
 * Nivel 1: aparece una sola figura, a ritmo lento y sin penalización.
 * Nivel 2: aparecen distractores, la velocidad sube y fallar resta un punto.
 */

import { el, limpiar, marcar, vibrar } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { decir, vozActiva } from '../../core/speech.js';
import { formaSVG, icono, PALETA } from '../../core/art.js';
import { azar, entre, elige, muestra } from '../../core/rng.js';

const FORMAS = ['circulo', 'cuadrado', 'triangulo', 'estrella', 'corazon', 'hexagono', 'flor', 'gota'];
const NOMBRE = {
  circulo: 'el círculo',
  cuadrado: 'el cuadrado',
  triangulo: 'el triángulo',
  estrella: 'la estrella',
  corazon: 'el corazón',
  hexagono: 'el hexágono',
  flor: 'la flor',
  gota: 'la gota',
};
const COLORES = [PALETA.terracota, PALETA.mostaza, PALETA.teal, PALETA.azul, PALETA.lila, PALETA.verde];

export function iniciar(ctx) {
  const { area, nivel, marco } = ctx;

  const RONDAS = nivel === 1 ? 12 : 16;
  let ronda = 0;
  let puntos = 0;
  let enPausa = false;
  let pendiente = null; // temporizador de la ronda en curso

  const timers = new Set();
  const luego = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      if (!enPausa) fn();
      else pendiente = () => fn();
    }, ms);
    timers.add(t);
    return t;
  };

  const campo = el('div', { clase: 'reaccion__campo' });
  const objetivoCaja = el('div', { clase: 'reaccion__objetivo' });
  area.append(objetivoCaja, campo);

  function actualizarMarcador() {
    // la estrella va como SVG: las fuentes de la app no llevan emoji
    marco.setMarcador(
      `${ronda}/${RONDAS} · ${puntos}<span style="width:22px;height:22px;display:inline-block;vertical-align:-4px">${icono.estrella()}</span>`
    );
  }

  /** Tiempo visible: constante en nivel 1, progresivamente más corto en nivel 2. */
  function tiempoVisible() {
    if (nivel === 1) return 2000;
    return Math.max(700, 1600 - ronda * 55);
  }

  function colocar(nodo) {
    // posición aleatoria dejando margen para que la figura no se salga
    nodo.style.left = entre(4, 74) + '%';
    nodo.style.top = entre(6, 68) + '%';
  }

  function siguiente() {
    if (ronda >= RONDAS) return terminar();
    ronda++;
    actualizarMarcador();
    limpiar(campo);
    limpiar(objetivoCaja);

    const formaObjetivo = elige(FORMAS);
    const colorObjetivo = elige(COLORES);

    if (nivel === 2) {
      objetivoCaja.append(
        el('span', { clase: 'reaccion__objetivo-texto', texto: 'Toca' }),
        el('span', { clase: 'reaccion__objetivo-figura', html: formaSVG(formaObjetivo, colorObjetivo) })
      );
      marco.setInstruccion(`Toca ${NOMBRE[formaObjetivo]} de ese color`);
    } else {
      marco.setInstruccion('Toca la figura en cuanto aparezca');
    }

    let resuelta = false;

    const crear = (forma, color, esObjetivo) => {
      const n = el('button', {
        clase: 'reaccion__figura' + (esObjetivo ? ' reaccion__figura--objetivo' : ''),
        type: 'button',
        'aria-label': esObjetivo ? 'objetivo' : 'distractor',
        html: formaSVG(forma, color),
      });
      colocar(n);
      n.addEventListener('click', () => {
        if (resuelta || enPausa) return;
        if (esObjetivo) {
          resuelta = true;
          puntos++;
          sonido.acierto();
          marcar(n, true);
          vibrar(15);
          n.classList.add('reaccion__figura--pillada');
          actualizarMarcador();
          luego(siguiente, 420);
        } else {
          sonido.fallo();
          marcar(n, false);
          vibrar(30);
          puntos = Math.max(0, puntos - 1);
          actualizarMarcador();
        }
      });
      campo.appendChild(n);
      return n;
    };

    // en nivel 2 los distractores comparten forma o color con el objetivo
    if (nivel === 2) {
      const nDistractores = Math.min(6, 2 + Math.floor(ronda / 3));
      for (let i = 0; i < nDistractores; i++) {
        const mismaForma = azar(2) === 0;
        const f = mismaForma ? formaObjetivo : elige(FORMAS.filter((x) => x !== formaObjetivo));
        const c = mismaForma ? elige(COLORES.filter((x) => x !== colorObjetivo)) : elige(COLORES);
        crear(f, c, false);
      }
    }
    crear(formaObjetivo, colorObjetivo, true);

    // si se acaba el tiempo, pasamos de ronda sin dramatizar
    luego(() => {
      if (resuelta) return;
      resuelta = true;
      if (nivel === 2) sonido.tic();
      siguiente();
    }, tiempoVisible() + (nivel === 1 ? 600 : 0));
  }

  function terminar() {
    const ratio = puntos / RONDAS;
    const estrellas = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;
    ctx.terminar({ estrellas, texto: `Has pillado ${puntos} de ${RONDAS}.` });
  }

  // pequeña cuenta atrás de cortesía antes de empezar
  const aviso = el('div', { clase: 'reaccion__aviso', texto: '¿Preparada?' });
  area.appendChild(aviso);
  if (vozActiva()) decir('¿Preparada?');
  luego(() => {
    aviso.remove();
    siguiente();
  }, 1100);

  return {
    destruir() {
      timers.forEach(clearTimeout);
      timers.clear();
    },
    pausa(activa) {
      enPausa = activa;
      if (!activa && pendiente) {
        const fn = pendiente;
        pendiente = null;
        fn();
      }
    },
  };
}
