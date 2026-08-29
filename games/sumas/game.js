/**
 * Sumas, restas y tablas.
 * Nivel 1: operaciones hasta 10 con apoyo visual (objetos contables).
 * Nivel 2: sumas y restas hasta 100 con llevadas, más multiplicaciones por una
 *          cifra (tablas), todo sin apoyo visual.
 */

import { el, limpiar, marcar, mostrarSello, vibrar } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { decir, vozActiva } from '../../core/speech.js';
import { objetoSVG, PALETA } from '../../core/art.js';
import { azar, entre, elige, baraja } from '../../core/rng.js';

const RONDAS = 10;
const CONTABLES = ['estrella', 'flor', 'globo', 'mariposa', 'helado', 'nube'];
const COLORES = [PALETA.terracota, PALETA.mostaza, PALETA.teal, PALETA.azul, PALETA.lila, PALETA.verde];

export function iniciar(ctx) {
  const { area, nivel, marco } = ctx;

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

  const pizarra = el('div', { clase: 'sumas__pizarra' });
  const visual = el('div', { clase: 'sumas__visual' });
  const opciones = el('div', { clase: 'sumas__opciones' });
  area.append(visual, pizarra, opciones);

  /* --- generación de operaciones --- */

  function operacionNivel1() {
    if (azar(2) === 0) {
      const a = entre(1, 6);
      const b = entre(1, 10 - a);
      return { a, b, signo: '+', r: a + b };
    }
    const a = entre(2, 10);
    const b = entre(1, a);
    return { a, b, signo: '−', r: a - b };
  }

  /** Multiplicación con un factor de una cifra: las tablas del 2 al 9. */
  function multiplicacion() {
    const tabla = entre(2, 9);
    const otro = entre(2, 10);
    return azar(2) === 0
      ? { a: tabla, b: otro, signo: '×', r: tabla * otro }
      : { a: otro, b: tabla, signo: '×', r: tabla * otro };
  }

  function operacionNivel2() {
    // una de cada tres operaciones es una multiplicación
    if (azar(3) === 0) return multiplicacion();
    if (azar(2) === 0) {
      // suma: dos de cada tres veces forzamos que haya llevada en las unidades
      const a = entre(12, 68);
      let b = entre(11, Math.min(99 - a, 31));
      if (azar(3) > 0) {
        const ua = a % 10;
        const ub = b % 10;
        if (ua + ub < 10 && a + b - ub + (10 - ua) <= 99) b = b - ub + (10 - ua) + azar(Math.max(1, ua));
      }
      return { a, b, signo: '+', r: a + b };
    }
    // resta: dos de cada tres veces hay que "pedir prestado" a las decenas
    const a = entre(31, 99);
    let b = entre(11, a - 1);
    const ua = a % 10;
    if (azar(3) > 0 && ua < 9) {
      const candidato = b - (b % 10) + entre(ua + 1, 9);
      if (candidato >= 10 && candidato < a) b = candidato;
    }
    return { a, b, signo: '−', r: a - b };
  }

  /** Distractores plausibles: cerca del resultado, nunca negativos ni repetidos. */
  function alternativas(r, op) {
    const set = new Set([r]);
    // en las tablas el error típico es saltar una fila: r ± a y r ± b
    const salto =
      op.signo === '×'
        ? [op.a, op.b, 1, 2]
        : nivel === 1
        ? [1, 2, 3]
        : [1, 2, 10, 11, 9, 20];
    let guardia = 0;
    while (set.size < 4 && guardia++ < 60) {
      const d = elige(salto) * (azar(2) === 0 ? 1 : -1);
      const v = r + d;
      if (v >= 0 && v <= (nivel === 1 ? 12 : 130)) set.add(v);
    }
    while (set.size < 4) set.add(r + set.size);
    return baraja([...set]);
  }

  /* --- pintado --- */

  function fila(n, forma, color) {
    const f = el('div', { clase: 'sumas__grupo' });
    for (let i = 0; i < n; i++) {
      f.appendChild(
        el('span', {
          clase: 'sumas__ficha',
          html: objetoSVG(forma, color),
          estilo: { animationDelay: `${i * 45}ms` },
        })
      );
    }
    return f;
  }

  function siguiente() {
    if (ronda >= RONDAS) return terminar();
    ronda++;
    marco.setMarcador(`${ronda}/${RONDAS}`);
    bloqueado = false;

    const op = nivel === 1 ? operacionNivel1() : operacionNivel2();

    limpiar(pizarra);
    pizarra.append(
      el('span', { clase: 'sumas__num', texto: String(op.a) }),
      el('span', { clase: 'sumas__signo', texto: op.signo }),
      el('span', { clase: 'sumas__num', texto: String(op.b) }),
      el('span', { clase: 'sumas__signo', texto: '=' }),
      el('span', { clase: 'sumas__num sumas__num--hueco', texto: '?' })
    );

    limpiar(visual);
    if (nivel === 1) {
      const forma = elige(CONTABLES);
      const c1 = elige(COLORES);
      const c2 = elige(COLORES.filter((c) => c !== c1));
      if (op.signo === '+') {
        visual.append(fila(op.a, forma, c1), el('span', { clase: 'sumas__mas', texto: '+' }), fila(op.b, forma, c2));
      } else {
        const g = fila(op.a, forma, c1);
        // los que se quitan aparecen tachados: la resta se ve
        [...g.children].slice(op.a - op.b).forEach((n) => n.classList.add('sumas__ficha--fuera'));
        visual.appendChild(g);
      }
      visual.classList.remove('oculto');
    } else {
      visual.classList.add('oculto');
    }

    const palabra = { '+': 'más', '−': 'menos', '×': 'por' }[op.signo];
    const texto = `${op.a} ${palabra} ${op.b}`;
    marco.setInstruccion(`¿Cuánto es ${texto}?`);
    if (vozActiva()) decir(`¿Cuánto es ${texto}?`);

    limpiar(opciones);
    for (const v of alternativas(op.r, op)) {
      const b = el('button', { clase: 'sumas__opcion', type: 'button', texto: String(v) });
      b.addEventListener('click', () => responder(b, v === op.r));
      opciones.appendChild(b);
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
      luego(siguiente, 760);
    } else {
      sonido.fallo();
      marcar(nodo, false);
      vibrar(30);
      nodo.disabled = true;
      nodo.classList.add('sumas__opcion--descartada');
      luego(() => {
        bloqueado = false;
        if (nivel === 2) siguiente();
      }, 560);
    }
  }

  function terminar() {
    const ratio = aciertos / RONDAS;
    const estrellas = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
    ctx.terminar({ estrellas, texto: `Has resuelto ${aciertos} de ${RONDAS} operaciones.` });
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
