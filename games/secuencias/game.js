/**
 * Secuencias.
 * Nivel 1: patrones simples A-B-A-B o A-A-B con formas y colores.
 * Nivel 2: series numéricas y patrones A-B-C combinados, más largos.
 */

import { el, limpiar, marcar, mostrarSello, vibrar } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { decir, vozActiva } from '../../core/speech.js';
import { formaSVG, PALETA } from '../../core/art.js';
import { azar, entre, elige, baraja, muestra } from '../../core/rng.js';

const RONDAS = 8;
const FORMAS = ['circulo', 'cuadrado', 'triangulo', 'estrella', 'corazon', 'hexagono', 'gota', 'flor'];
const COLORES = [PALETA.terracota, PALETA.mostaza, PALETA.teal, PALETA.azul, PALETA.lila, PALETA.verde, PALETA.rosa];

export function iniciar(ctx) {
  const { area, nivel, marco } = ctx;
  const nOpciones = nivel === 1 ? 3 : 4;

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

  const serie = el('div', { clase: 'secuencias__serie' });
  const opciones = el('div', { clase: 'secuencias__opciones' });
  area.append(serie, opciones);

  const pieza = (p) =>
    p.tipo === 'numero'
      ? el('span', { clase: 'secuencias__numero', texto: String(p.valor) })
      : el('span', { clase: 'secuencias__figura', html: formaSVG(p.forma, p.color) });

  /* --- generadores de patrón --- */

  function patronFormas(longitudPatron) {
    const formas = muestra(FORMAS, longitudPatron);
    const colores = muestra(COLORES, longitudPatron);
    const base = formas.map((f, i) => ({ tipo: 'forma', forma: f, color: colores[i] }));

    const visibles = nivel === 1 ? 6 : 8;
    const secuencia = Array.from({ length: visibles + 1 }, (_, i) => base[i % base.length]);
    const solucion = secuencia[visibles];

    const distractores = [];
    while (distractores.length < nOpciones - 1) {
      const cand = {
        tipo: 'forma',
        forma: azar(2) ? elige(FORMAS) : solucion.forma,
        color: azar(2) ? elige(COLORES) : solucion.color,
      };
      const igual = cand.forma === solucion.forma && cand.color === solucion.color;
      const repetido = distractores.some((d) => d.forma === cand.forma && d.color === cand.color);
      if (!igual && !repetido) distractores.push(cand);
    }

    return { secuencia: secuencia.slice(0, visibles), solucion, distractores };
  }

  function patronNumerico() {
    const paso = elige([2, 3, 4, 5, 10, -2, -3, -5]);
    const doble = azar(4) === 0;
    const inicio = doble ? entre(1, 4) : paso > 0 ? entre(1, 20) : entre(40, 60);

    const largo = 6;
    const valores = [inicio];
    for (let i = 1; i <= largo; i++) {
      valores.push(doble ? valores[i - 1] * 2 : valores[i - 1] + paso);
    }
    const solucionValor = valores[largo];

    const set = new Set([solucionValor]);
    while (set.size < nOpciones) {
      const d = solucionValor + elige([1, -1, 2, -2, paso, -paso]) * entre(1, 2);
      if (d >= 0) set.add(d);
    }

    const distractores = [...set]
      .filter((v) => v !== solucionValor)
      .slice(0, nOpciones - 1)
      .map((v) => ({ tipo: 'numero', valor: v }));

    return {
      secuencia: valores.slice(0, largo).map((v) => ({ tipo: 'numero', valor: v })),
      solucion: { tipo: 'numero', valor: solucionValor },
      distractores,
    };
  }

  function siguiente() {
    if (ronda >= RONDAS) return terminar();
    ronda++;
    marco.setMarcador(`${ronda}/${RONDAS}`);
    bloqueado = false;

    const reto =
      nivel === 1
        ? patronFormas(azar(3) === 0 ? 3 : 2)
        : azar(2) === 0
        ? patronNumerico()
        : patronFormas(3);

    const texto =
      reto.solucion.tipo === 'numero' ? '¿Qué número sigue?' : '¿Qué figura sigue?';
    marco.setInstruccion(texto);
    if (vozActiva()) decir(texto);

    limpiar(serie);
    reto.secuencia.forEach((p, i) => {
      const celda = el('div', { clase: 'secuencias__celda', estilo: { animationDelay: `${i * 60}ms` } }, [pieza(p)]);
      serie.appendChild(celda);
    });
    serie.appendChild(el('div', { clase: 'secuencias__celda secuencias__celda--hueco', texto: '?' }));

    limpiar(opciones);
    for (const p of baraja([reto.solucion, ...reto.distractores])) {
      const esCorrecta = p === reto.solucion;
      const b = el('button', { clase: 'secuencias__opcion', type: 'button' }, [pieza(p)]);
      b.addEventListener('click', () => responder(b, esCorrecta, reto.solucion));
      opciones.appendChild(b);
    }
  }

  function responder(nodo, correcta, solucion) {
    if (bloqueado) return;
    bloqueado = true;
    if (correcta) {
      aciertos++;
      sonido.acierto();
      marcar(nodo, true);
      mostrarSello('bien');
      vibrar(15);
      // la solución ocupa su hueco antes de pasar a la siguiente
      const hueco = serie.querySelector('.secuencias__celda--hueco');
      if (hueco) {
        limpiar(hueco).appendChild(pieza(solucion));
        hueco.classList.add('secuencias__celda--resuelto');
      }
      luego(siguiente, 860);
    } else {
      sonido.fallo();
      marcar(nodo, false);
      vibrar(30);
      luego(() => {
        bloqueado = false;
        if (nivel === 2) siguiente();
      }, 600);
    }
  }

  function terminar() {
    const ratio = aciertos / RONDAS;
    const estrellas = ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.35 ? 1 : 0;
    ctx.terminar({ estrellas, texto: `Has completado ${aciertos} de ${RONDAS} series.` });
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
