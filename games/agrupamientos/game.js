/**
 * Agrupamientos.
 * Nivel 1: clasificar por un único criterio (color o forma).
 * Nivel 2: clasificar por dos criterios combinados a la vez (forma + color).
 *
 * Interacción: se toca la pieza y después la caja. Más fiable en tablet que
 * arrastrar, y funciona igual con el dedo que con teclado.
 */

import { el, limpiar, marcar, mostrarSello, vibrar } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { decir, vozActiva } from '../../core/speech.js';
import { formaSVG, PALETA } from '../../core/art.js';
import { azar, elige, baraja, muestra } from '../../core/rng.js';

/* El género de cada forma se guarda para que el adjetivo de color concuerde:
   "estrellas moradas" y no "estrellas morados". */
const FORMAS = [
  { id: 'circulo', nombre: 'círculos', genero: 'm' },
  { id: 'cuadrado', nombre: 'cuadrados', genero: 'm' },
  { id: 'triangulo', nombre: 'triángulos', genero: 'm' },
  { id: 'estrella', nombre: 'estrellas', genero: 'f' },
  { id: 'corazon', nombre: 'corazones', genero: 'm' },
  { id: 'flor', nombre: 'flores', genero: 'f' },
];

const COLORES = [
  { hex: PALETA.terracota, m: 'rojos', f: 'rojas' },
  { hex: PALETA.mostaza, m: 'amarillos', f: 'amarillas' },
  { hex: PALETA.azul, m: 'azules', f: 'azules' },
  { hex: PALETA.verde, m: 'verdes', f: 'verdes' },
  { hex: PALETA.lila, m: 'morados', f: 'moradas' },
];

export function iniciar(ctx) {
  const { area, nivel, marco } = ctx;

  let errores = 0;
  let colocadas = 0;
  let seleccion = null;
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

  const bandeja = el('div', { clase: 'agrupa__bandeja' });
  const cajas = el('div', { clase: 'agrupa__cajas' });
  area.append(bandeja, cajas);

  /* ------------------------------------------------ construcción del reto */

  function retoNivel1() {
    const porColor = azar(2) === 0;
    if (porColor) {
      const [c1, c2] = muestra(COLORES, 2);
      const forma = elige(FORMAS).id;
      const grupos = [
        { etiqueta: c1.m, prueba: (p) => p.color === c1.hex, muestra: { forma, color: c1.hex } },
        { etiqueta: c2.m, prueba: (p) => p.color === c2.hex, muestra: { forma, color: c2.hex } },
      ];
      const piezas = Array.from({ length: 8 }, () => ({
        forma,
        color: azar(2) === 0 ? c1.hex : c2.hex,
      }));
      return { grupos, piezas, instruccion: 'Lleva cada pieza a la caja de su color' };
    }
    const [f1, f2] = muestra(FORMAS, 2);
    const color = elige(COLORES).hex;
    const grupos = [
      { etiqueta: f1.nombre, prueba: (p) => p.forma === f1.id, muestra: { forma: f1.id, color } },
      { etiqueta: f2.nombre, prueba: (p) => p.forma === f2.id, muestra: { forma: f2.id, color } },
    ];
    const piezas = Array.from({ length: 8 }, () => ({
      forma: azar(2) === 0 ? f1.id : f2.id,
      color,
    }));
    return { grupos, piezas, instruccion: 'Lleva cada pieza a la caja de su forma' };
  }

  function retoNivel2() {
    const [f1, f2] = muestra(FORMAS, 2);
    const [c1, c2] = muestra(COLORES, 2);
    const combinaciones = [
      { forma: f1, color: c1 },
      { forma: f1, color: c2 },
      { forma: f2, color: c1 },
      { forma: f2, color: c2 },
    ];
    const grupos = combinaciones.map((k) => ({
      etiqueta: `${k.forma.nombre} ${k.color[k.forma.genero]}`,
      prueba: (p) => p.forma === k.forma.id && p.color === k.color.hex,
      muestra: { forma: k.forma.id, color: k.color.hex },
    }));
    const piezas = baraja(
      combinaciones.flatMap((k) => [
        { forma: k.forma.id, color: k.color.hex },
        { forma: k.forma.id, color: k.color.hex },
        { forma: k.forma.id, color: k.color.hex },
      ])
    );
    return { grupos, piezas, instruccion: 'Fíjate en la forma Y en el color de cada caja' };
  }

  const reto = nivel === 1 ? retoNivel1() : retoNivel2();
  const total = reto.piezas.length;

  marco.setInstruccion(reto.instruccion);
  if (vozActiva()) decir(reto.instruccion);

  function marcador() {
    marco.setMarcador(`${colocadas}/${total}`);
  }

  /* ------------------------------------------------------------- pintado */

  reto.grupos.forEach((g, i) => {
    const caja = el('button', {
      clase: 'agrupa__caja',
      type: 'button',
      'aria-label': `Caja de ${g.etiqueta}`,
      estilo: { animationDelay: `${i * 60}ms` },
    });
    caja.append(
      el('span', { clase: 'agrupa__caja-muestra', html: formaSVG(g.muestra.forma, g.muestra.color) }),
      el('span', { clase: 'agrupa__caja-etiqueta leible', texto: g.etiqueta }),
      el('span', { clase: 'agrupa__caja-cuenta', texto: '0' })
    );
    caja.addEventListener('click', () => soltar(caja, g));
    cajas.appendChild(caja);
  });
  cajas.dataset.n = String(reto.grupos.length);

  baraja(reto.piezas).forEach((p, i) => {
    const b = el('button', {
      clase: 'agrupa__pieza',
      type: 'button',
      'aria-label': 'pieza',
      html: formaSVG(p.forma, p.color),
      estilo: { animationDelay: `${i * 35}ms` },
    });
    b._pieza = p;
    b.addEventListener('click', () => seleccionar(b));
    bandeja.appendChild(b);
  });

  /* ---------------------------------------------------------- interacción */

  function seleccionar(nodo) {
    if (bloqueado) return;
    if (seleccion === nodo) {
      nodo.classList.remove('agrupa__pieza--elegida');
      seleccion = null;
      return;
    }
    bandeja.querySelectorAll('.agrupa__pieza--elegida').forEach((n) => n.classList.remove('agrupa__pieza--elegida'));
    nodo.classList.add('agrupa__pieza--elegida');
    seleccion = nodo;
    sonido.tic();
  }

  function soltar(caja, grupo) {
    if (bloqueado) return;
    if (!seleccion) {
      caja.classList.add('agrupa__caja--pista');
      luego(() => caja.classList.remove('agrupa__caja--pista'), 420);
      return;
    }

    const pieza = seleccion._pieza;
    if (grupo.prueba(pieza)) {
      colocadas++;
      sonido.acierto();
      vibrar(12);
      marcar(caja, true);
      const cuenta = caja.querySelector('.agrupa__caja-cuenta');
      cuenta.textContent = String(parseInt(cuenta.textContent, 10) + 1);

      const nodo = seleccion;
      nodo.classList.add('agrupa__pieza--colocada');
      seleccion = null;
      luego(() => nodo.remove(), 320);
      marcador();

      if (colocadas === total) {
        bloqueado = true;
        mostrarSello('bien');
        luego(terminar, 700);
      }
    } else {
      errores++;
      sonido.fallo();
      vibrar(30);
      marcar(caja, false);
      marcar(seleccion, false);
    }
  }

  function terminar() {
    const estrellas = errores <= 1 ? 3 : errores <= 4 ? 2 : 1;
    ctx.terminar({
      estrellas,
      texto: errores === 0 ? '¡Sin ningún error!' : `Has clasificado todo con ${errores} error${errores === 1 ? '' : 'es'}.`,
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
