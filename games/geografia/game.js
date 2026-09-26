/**
 * Geografía.
 * Diez modos que comparten dos mecánicas: elegir entre opciones (banderas) o
 * tocar la zona correcta de un mapa (todo lo demás).
 *
 * Nivel 1: banderas muy conocidas, continentes y océanos, con menos opciones.
 * Nivel 2: además países del mundo y de Europa, provincias y comunidades de
 *          España, relieve, ríos por continente y mares.
 */

import { el, limpiar, boton, marcar, mostrarSello, vibrar } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { decir, vozActiva } from '../../core/speech.js';
import { baraja, muestra, elige, azar } from '../../core/rng.js';
import { bandera, CON_BANDERA } from './banderas.js';

const RONDAS = 8;

/* Ciudades autónomas: se dibujan en el mapa, pero no se preguntan como
   comunidad ni como provincia porque no lo son. */
const CIUDADES_AUTONOMAS = ['Ceuta', 'Melilla'];

/* Países que una niña puede reconocer pronto: se usan en el nivel de las peques. */
const CONOCIDOS = ['ESP', 'FRA', 'ITA', 'DEU', 'PRT', 'GBR', 'USA', 'BRA', 'ARG', 'MEX', 'JPN', 'CHN', 'MAR', 'CAN'];

const MODOS = [
  { id: 'banderas', nombre: 'Banderas', pista: '¿De qué país es esta bandera?', niveles: [1, 2], color: '#d9634a' },
  { id: 'continentes', nombre: 'Continentes', pista: 'Toca el continente', niveles: [1, 2], color: '#2e7d74' },
  { id: 'oceanos', nombre: 'Océanos', pista: 'Toca el océano', niveles: [1, 2], color: '#6fa8c7' },
  { id: 'ccaa', nombre: 'Comunidades de España', pista: 'Toca la comunidad', niveles: [1, 2], color: '#e9b23c' },
  { id: 'paisesMundo', nombre: 'Países del mundo', pista: 'Toca el país', niveles: [2], color: '#9b8bc4' },
  { id: 'paisesEuropa', nombre: 'Países de Europa', pista: 'Toca el país', niveles: [2], color: '#7fa650' },
  { id: 'provincias', nombre: 'Provincias de España', pista: 'Toca la provincia', niveles: [2], color: '#e79a94' },
  { id: 'banderaMapa', nombre: 'Bandera y lugar', pista: '¿Dónde está este país?', niveles: [2], color: '#d9634a' },
  { id: 'relieve', nombre: 'Montañas', pista: 'Toca la cordillera', niveles: [2], color: '#8a5a34' },
  { id: 'rios', nombre: 'Ríos', pista: 'Toca el río', niveles: [2], color: '#4d87a7' },
  { id: 'mares', nombre: 'Mares', pista: 'Toca el mar', niveles: [2], color: '#2e7d74' },
];

/* Los módulos de datos se cargan solo cuando hacen falta. */
const cache = new Map();
async function datos(cual) {
  if (!cache.has(cual)) cache.set(cual, await import(`./datos/${cual}.js`));
  return cache.get(cual);
}

export function iniciar(ctx) {
  const { area, nivel, marco } = ctx;

  let ronda = 0;
  let aciertos = 0;
  let bloqueado = false;
  let modoActual = null;
  const timers = new Set();
  const luego = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };

  /* ----------------------------------------------------- menú de modos */

  function menu() {
    marco.setMarcador('');
    marco.setInstruccion('¿Qué quieres practicar?');
    limpiar(area);

    const rejilla = el('div', { clase: 'geo__modos' });
    for (const m of MODOS.filter((x) => x.niveles.includes(nivel))) {
      const b = el('button', { clase: 'geo__modo', type: 'button', 'aria-label': m.nombre });
      b.style.setProperty('--color', m.color);
      b.append(
        el('span', { clase: 'geo__modo-icono', html: iconoModo(m.id, m.color) }),
        el('span', { clase: 'geo__modo-nombre leible', texto: m.nombre })
      );
      b.addEventListener('click', () => {
        sonido.toque();
        empezar(m);
      });
      rejilla.appendChild(b);
    }
    area.appendChild(rejilla);
  }

  /* ------------------------------------------------- preparar un modo */

  async function empezar(modo) {
    modoActual = modo;
    ronda = 0;
    aciertos = 0;
    limpiar(area).appendChild(el('div', { clase: 'geo__cargando', texto: 'Abriendo el mapa…' }));

    try {
      modo.preguntas = await construir(modo.id);
    } catch (e) {
      console.error('[geografia] no se pudieron cargar los datos', e);
      limpiar(area).appendChild(el('div', { clase: 'geo__cargando', texto: 'No se pudo abrir el mapa.' }));
      return;
    }
    siguiente();
  }

  /** Devuelve la lista de rondas ya preparadas para el modo. */
  async function construir(id) {
    if (id === 'banderas') {
      const { PAISES } = await datos('mundo');
      const nombre = Object.fromEntries(PAISES.map((p) => [p.id, p.n]));
      const posibles = (nivel === 1 ? CONOCIDOS : CON_BANDERA).filter((c) => nombre[c]);
      const nOpciones = nivel === 1 ? 3 : 4;
      return muestra(posibles, RONDAS).map((id2) => ({
        tipo: 'opciones',
        pista: bandera(id2),
        enunciado: '¿De qué país es esta bandera?',
        opciones: baraja([id2, ...muestra(posibles.filter((x) => x !== id2), nOpciones - 1)]).map((c) => ({
          id: c,
          texto: nombre[c],
        })),
        correcta: id2,
        respuesta: nombre[id2],
      }));
    }

    if (id === 'continentes' || id === 'paisesMundo' || id === 'banderaMapa') {
      const { PAISES, VISTA } = await datos('mundo');
      if (id === 'continentes') {
        const conts = [...new Set(PAISES.map((p) => p.c))].filter((c) => c !== 'Antártida' || nivel === 2);
        return muestra(baraja([...conts, ...conts]), Math.min(RONDAS, conts.length * 2)).map((c) => ({
          tipo: 'mapa',
          vista: VISTA,
          capas: PAISES.map((p) => ({ d: p.d, id: p.c })),
          objetivo: c,
          enunciado: `Toca: ${c}`,
          respuesta: c,
        }));
      }
      // Se pregunta solo por países reconocibles: los que tienen bandera dibujada
      // y ocupan suficiente superficie como para tocarlos con el dedo.
      const elegibles = PAISES.filter((p) => p.a >= 6 && CON_BANDERA.includes(p.id));
      return muestra(elegibles, RONDAS).map((p) => ({
        tipo: 'mapa',
        vista: VISTA,
        capas: PAISES.map((q) => ({ d: q.d, id: q.id, n: q.n })),
        objetivo: p.id,
        pista: id === 'banderaMapa' ? bandera(p.id) : null,
        enunciado: id === 'banderaMapa' ? '¿Dónde está este país?' : `Toca ${p.n}`,
        respuesta: p.n,
      }));
    }

    if (id === 'paisesEuropa') {
      const { PAISES, VISTA } = await datos('europa');
      const europeos = PAISES.filter((p) => p.eu && p.a >= 8);
      return muestra(europeos, RONDAS).map((p) => ({
        tipo: 'mapa',
        vista: VISTA,
        capas: PAISES.map((q) => ({ d: q.d, id: q.eu ? q.id : null, n: q.n })),
        objetivo: p.id,
        enunciado: `Toca: ${p.n}`,
        respuesta: p.n,
      }));
    }

    if (id === 'provincias' || id === 'ccaa') {
      const { PROVINCIAS, VISTA, CAJA_CANARIAS } = await datos('espana');
      const porCcaa = id === 'ccaa';
      const preguntables = PROVINCIAS.filter((p) => !CIUDADES_AUTONOMAS.includes(p.n));
      const capas = PROVINCIAS.map((p) => ({
        d: p.d,
        id: CIUDADES_AUTONOMAS.includes(p.n) ? null : porCcaa ? p.ccaa : p.n,
      }));
      const lista = porCcaa ? [...new Set(preguntables.map((p) => p.ccaa))] : preguntables.map((p) => p.n);
      return muestra(lista, Math.min(RONDAS, lista.length)).map((n) => ({
        tipo: 'mapa',
        vista: VISTA,
        caja: CAJA_CANARIAS,
        capas,
        objetivo: n,
        enunciado: porCcaa ? `Toca: ${n}` : `Toca la provincia de ${n}`,
        respuesta: n,
      }));
    }

    if (id === 'oceanos' || id === 'mares') {
      const { PAISES, VISTA } = await datos('mundo');
      const { OCEANOS, MARES, zonaPath } = await datos('lugares');
      const agua = id === 'oceanos' ? OCEANOS : MARES;
      const zonas = agua.flatMap((a) => a.zonas.map((z) => ({ d: zonaPath(z), id: a.n, agua: true })));
      return muestra(agua, Math.min(RONDAS, agua.length)).map((a) => ({
        tipo: 'mapa',
        vista: VISTA,
        capas: PAISES.map((p) => ({ d: p.d, id: null })),
        zonas,
        objetivo: a.n,
        enunciado: `Toca: ${a.n}`,
        respuesta: a.n,
      }));
    }

    if (id === 'relieve') {
      const { PAISES, VISTA } = await datos('mundo');
      const { RELIEVE, proyectar } = await datos('lugares');
      const marcas = RELIEVE.map((r) => {
        const [x, y] = proyectar(r.lon, r.lat);
        return { x, y, id: r.n };
      });
      return muestra(RELIEVE, RONDAS).map((r) => ({
        tipo: 'mapa',
        vista: VISTA,
        capas: PAISES.map((p) => ({ d: p.d, id: null })),
        marcas,
        objetivo: r.n,
        enunciado: `¿Dónde está: ${r.n}?`,
        respuesta: `${r.n} · ${r.alt}`,
      }));
    }

    if (id === 'rios') {
      const { PAISES, RIOS, VISTA } = await datos('mundo');
      const preguntas = [];
      const continentes = baraja([...new Set(RIOS.map((r) => r.c))]);
      for (const c of continentes) {
        const delCont = RIOS.filter((r) => r.c === c);
        if (delCont.length < 2) continue;
        for (const r of muestra(delCont, Math.min(2, delCont.length))) {
          preguntas.push({
            tipo: 'mapa',
            vista: VISTA,
            capas: PAISES.map((p) => ({ d: p.d, id: null })),
            lineas: delCont.map((x) => ({ d: x.d, id: x.n })),
            objetivo: r.n,
            enunciado: `Toca el río ${r.n} (${c})`,
            respuesta: r.n,
          });
        }
        if (preguntas.length >= RONDAS) break;
      }
      return preguntas.slice(0, RONDAS);
    }

    return [];
  }

  /* ------------------------------------------------------ ronda a ronda */

  function siguiente() {
    const preguntas = modoActual.preguntas;
    if (ronda >= preguntas.length) return terminar();
    const p = preguntas[ronda];
    ronda++;
    bloqueado = false;
    marco.setMarcador(`${ronda}/${preguntas.length}`);
    marco.setInstruccion(p.enunciado);
    if (vozActiva()) decir(p.enunciado);
    limpiar(area);
    (p.tipo === 'opciones' ? pintarOpciones : pintarMapa)(p);
  }

  function responder(nodo, acierta, pregunta, nodoCorrecto) {
    if (bloqueado) return;
    bloqueado = true;
    if (acierta) {
      aciertos++;
      sonido.acierto();
      vibrar(15);
      nodo?.classList.add('geo__ok');
      mostrarSello('bien');
      luego(siguiente, 900);
    } else {
      sonido.fallo();
      vibrar(30);
      nodo?.classList.add('geo__mal');
      // se muestra dónde estaba la respuesta: fallar también enseña
      nodoCorrecto?.forEach?.((n) => n.classList.add('geo__solucion'));
      marco.setInstruccion(`Era: ${pregunta.respuesta}`);
      if (vozActiva()) decir(`Era ${pregunta.respuesta}`);
      luego(siguiente, 2000);
    }
  }

  /* --------------------------------------------------- reto de opciones */

  function pintarOpciones(p) {
    const caja = el('div', { clase: 'geo__opciones-caja' });
    caja.appendChild(el('div', { clase: 'geo__pista', html: p.pista }));

    const lista = el('div', { clase: 'geo__opciones' });
    for (const o of p.opciones) {
      const b = el('button', { clase: 'geo__opcion leible', type: 'button', texto: o.texto });
      b.addEventListener('click', () =>
        responder(b, o.id === p.correcta, p, [...lista.children].filter((n) => n.textContent === p.respuesta))
      );
      lista.appendChild(b);
    }
    caja.appendChild(lista);
    area.appendChild(caja);
  }

  /* ------------------------------------------------------ reto de mapa */

  function pintarMapa(p) {
    const envoltorio = el('div', { clase: 'geo__mapa-caja' });
    if (p.pista) envoltorio.appendChild(el('div', { clase: 'geo__pista geo__pista--flotante', html: p.pista }));

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${p.vista.w} ${p.vista.h}`);
    svg.setAttribute('class', 'geo__mapa');

    // Todo el dibujo se recorta al encuadre: sin esto, lo que cae fuera del
    // viewBox (Asia en el mapa de Europa) se pintaría sobre los márgenes.
    const idRecorte = `geo-recorte-${Math.floor(performance.now())}`;
    const defs = document.createElementNS(ns, 'defs');
    const clip = document.createElementNS(ns, 'clipPath');
    clip.setAttribute('id', idRecorte);
    const rClip = document.createElementNS(ns, 'rect');
    rClip.setAttribute('width', p.vista.w);
    rClip.setAttribute('height', p.vista.h);
    clip.appendChild(rClip);
    defs.appendChild(clip);
    svg.appendChild(defs);

    const lienzo = document.createElementNS(ns, 'g');
    lienzo.setAttribute('clip-path', `url(#${idRecorte})`);
    svg.appendChild(lienzo);

    const mar = document.createElementNS(ns, 'rect');
    mar.setAttribute('width', p.vista.w);
    mar.setAttribute('height', p.vista.h);
    mar.setAttribute('class', 'geo__mar');
    lienzo.appendChild(mar);

    if (p.caja) {
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', p.caja.x);
      r.setAttribute('y', p.caja.y);
      r.setAttribute('width', p.caja.w);
      r.setAttribute('height', p.caja.h);
      r.setAttribute('rx', 10);
      r.setAttribute('class', 'geo__caja');
      lienzo.appendChild(r);
    }

    const nodosCorrectos = [];
    // las zonas tocables se pueden recorrer con el tabulador y activar con
    // Enter o Espacio, igual que las regiones de Colorear
    const accesible = (nodo, nombre) => {
      nodo.setAttribute('tabindex', '0');
      nodo.setAttribute('role', 'button');
      nodo.setAttribute('aria-label', nombre);
    };
    const añadir = (d, id, clase, nombre = id) => {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', clase + (id ? ' geo__tocable' : ''));
      if (id) {
        path.dataset.id = id;
        accesible(path, nombre);
        if (id === p.objetivo) nodosCorrectos.push(path);
      }
      lienzo.appendChild(path);
      return path;
    };

    for (const capa of p.capas) añadir(capa.d, capa.id, 'geo__tierra', capa.n || capa.id);
    for (const z of p.zonas || []) añadir(z.d, z.id, 'geo__agua');
    for (const l of p.lineas || []) {
      añadir(l.d, null, 'geo__rio');
      añadir(l.d, l.id, 'geo__rio-toque'); // trazo ancho invisible: se puede tocar
    }
    for (const m of p.marcas || []) {
      const g = document.createElementNS(ns, 'path');
      // triángulo de montaña centrado en el punto
      g.setAttribute('d', `M${m.x} ${m.y - 12}L${m.x + 11} ${m.y + 7}L${m.x - 11} ${m.y + 7}Z`);
      g.setAttribute('class', 'geo__marca geo__tocable');
      g.dataset.id = m.id;
      accesible(g, m.id);
      if (m.id === p.objetivo) nodosCorrectos.push(g);
      lienzo.appendChild(g);
    }

    const tocar = (t) => {
      if (!t || bloqueado) return;
      responder(t, t.dataset.id === p.objetivo, p, nodosCorrectos);
    };
    svg.addEventListener('click', (e) => tocar(e.target.closest?.('[data-id]')));
    svg.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target.closest?.('[data-id]');
      if (!t) return;
      e.preventDefault();
      tocar(t);
    });

    envoltorio.appendChild(svg);
    area.appendChild(envoltorio);
  }

  /* ------------------------------------------------------------- fin */

  function terminar() {
    const total = modoActual.preguntas.length;
    const ratio = aciertos / total;
    const estrellas = ratio >= 0.9 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.35 ? 1 : 0;
    ctx.terminar({ estrellas, texto: `${modoActual.nombre}: ${aciertos} de ${total}.` });
  }

  menu();

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

/* ---------------------------------------------------- iconos del menú */

function iconoModo(id, color) {
  const svg = (c) => `<svg viewBox="0 0 100 100" aria-hidden="true">${c}</svg>`;
  const globo = `<circle cx="50" cy="50" r="34" fill="${color}"/>
    <path d="M50 16v68M16 50h68" stroke="#fffdf9" stroke-width="4" fill="none"/>
    <ellipse cx="50" cy="50" rx="16" ry="34" fill="none" stroke="#fffdf9" stroke-width="4"/>`;
  const iconos = {
    banderas: `<rect x="26" y="20" width="48" height="32" rx="4" fill="${color}"/><rect x="22" y="20" width="6" height="60" rx="3" fill="#3a342f"/>`,
    continentes: globo,
    oceanos: `<path d="M12 44q12-10 24 0t24 0 24 0v14q-12 10-24 0t-24 0-24 0z" fill="${color}"/>
              <path d="M12 66q12-10 24 0t24 0 24 0v10H12z" fill="${color}" opacity=".55"/>`,
    ccaa: `<path d="M18 34l16-10 22 6 18-4 8 14-6 20-20 10-24-4-14-14z" fill="${color}"/>`,
    paisesMundo: globo,
    paisesEuropa: `<circle cx="50" cy="50" r="30" fill="${color}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => {
        const a = (i * 45 * Math.PI) / 180;
        return `<circle cx="${50 + 20 * Math.cos(a)}" cy="${50 + 20 * Math.sin(a)}" r="4" fill="#ffdf00"/>`;
      })
      .join('')}`,
    provincias: `<path d="M18 30h28v22H18zM50 26h30v26H50zM22 56h26v20H22zM52 56h26v22H52z" fill="${color}"/>`,
    banderaMapa: `<rect x="18" y="18" width="34" height="24" rx="3" fill="${color}"/>
                  <path d="M62 78c10-12 16-19 16-26a16 16 0 1 0-32 0c0 7 6 14 16 26z" fill="#3a342f"/>
                  <circle cx="62" cy="52" r="6" fill="#fffdf9"/>`,
    relieve: `<path d="M8 78l26-44 16 24 12-16 30 36z" fill="${color}"/><path d="M34 34l10 16H24z" fill="#fffdf9"/>`,
    rios: `<path d="M20 16c14 12-10 22 4 34s-2 22 6 34" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round"/>
           <path d="M56 20c14 12-10 22 4 34s-2 18 6 26" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".6"/>`,
    mares: `<circle cx="50" cy="50" r="32" fill="${color}"/><path d="M22 46q10-8 20 0t20 0 18-2" stroke="#fffdf9" stroke-width="5" fill="none"/>
            <path d="M22 60q10-8 20 0t20 0 18-2" stroke="#fffdf9" stroke-width="5" fill="none"/>`,
  };
  return svg(iconos[id] || globo);
}
