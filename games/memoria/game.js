/**
 * Memoria (parejas).
 * Nivel 1: 8 cartas (4 parejas) en 4x2.
 * Nivel 2: 16 cartas (8 parejas) en 4x4.
 */

import { el, limpiar, vibrar } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { objetoSVG, PALETA } from '../../core/art.js';
import { baraja, muestra } from '../../core/rng.js';

const OBJETOS = [
  'coche', 'tren', 'barco', 'avion', 'montana', 'vaca', 'pajaro', 'arbol',
  'sol', 'nube', 'casa', 'faro', 'bici', 'gato', 'perro', 'flor',
  'mariposa', 'helado', 'globo', 'luna', 'maleta', 'reloj',
];
const COLORES = [
  PALETA.terracota, PALETA.mostaza, PALETA.teal, PALETA.azul,
  PALETA.lila, PALETA.verde, PALETA.rosa, '#8a5a34',
];

export function iniciar(ctx) {
  const { area, nivel, marco } = ctx;

  const parejas = nivel === 1 ? 4 : 8;
  let volteadas = [];
  let encontradas = 0;
  let intentos = 0;
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

  const tablero = el('div', { clase: 'memoria__tablero' });
  tablero.dataset.parejas = String(parejas);
  // el envoltorio da al tablero una altura de referencia para mantener su proporción
  area.appendChild(el('div', { clase: 'memoria__caja' }, [tablero]));

  const elegidos = muestra(OBJETOS, parejas);
  const coloresElegidos = muestra(COLORES, parejas);

  const cartas = baraja(
    elegidos.flatMap((nombre, i) => {
      const carta = { nombre, color: coloresElegidos[i] };
      return [{ ...carta }, { ...carta }];
    })
  );

  function marcador() {
    marco.setMarcador(`${encontradas}/${parejas} · ${intentos} intentos`);
  }

  cartas.forEach((c, i) => {
    const boton = el('button', {
      clase: 'memoria__carta',
      type: 'button',
      'aria-label': 'Carta boca abajo',
      estilo: { animationDelay: `${i * 40}ms` },
    });
    const interior = el('span', { clase: 'memoria__interior' });
    interior.append(
      el('span', { clase: 'memoria__cara memoria__cara--dorso' }),
      el('span', { clase: 'memoria__cara memoria__cara--frente', html: objetoSVG(c.nombre, c.color) })
    );
    boton.appendChild(interior);
    boton.dataset.nombre = c.nombre;

    boton.addEventListener('click', () => {
      if (bloqueado || boton.classList.contains('memoria__carta--abierta')) return;
      if (volteadas.length >= 2) return;

      boton.classList.add('memoria__carta--abierta');
      boton.setAttribute('aria-label', c.nombre);
      sonido.voltear();
      volteadas.push({ boton, carta: c });

      if (volteadas.length === 2) comprobar();
    });

    tablero.appendChild(boton);
  });

  function comprobar() {
    intentos++;
    marcador();
    const [a, b] = volteadas;
    bloqueado = true;

    if (a.carta.nombre === b.carta.nombre) {
      encontradas++;
      sonido.acierto();
      vibrar(15);
      luego(() => {
        a.boton.classList.add('memoria__carta--hecha');
        b.boton.classList.add('memoria__carta--hecha');
        volteadas = [];
        bloqueado = false;
        marcador();
        if (encontradas === parejas) luego(terminar, 520);
      }, 340);
    } else {
      sonido.fallo();
      luego(() => {
        a.boton.classList.remove('memoria__carta--abierta');
        b.boton.classList.remove('memoria__carta--abierta');
        a.boton.setAttribute('aria-label', 'Carta boca abajo');
        b.boton.setAttribute('aria-label', 'Carta boca abajo');
        volteadas = [];
        bloqueado = false;
      }, 950);
    }
  }

  function terminar() {
    const perfecto = parejas;
    const bueno = Math.round(parejas * 1.6);
    const estrellas = intentos <= perfecto + 1 ? 3 : intentos <= bueno ? 2 : 1;
    ctx.terminar({
      estrellas,
      texto: `Has encontrado las ${parejas} parejas en ${intentos} intentos.`,
    });
  }

  marcador();

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
