/**
 * Check-in de viaje: un panel de cosas que se pueden ver por la ventanilla
 * (coche, tren, barco o avión). Se marcan al verlas y el tablero se guarda,
 * así el viaje entero cabe en la misma partida.
 *
 * Nivel 1: panel visual de 12 elementos grandes.
 * Nivel 2: tablero de 10x10 con 100 elementos, con líneas que se completan.
 */

import { el, limpiar, boton, dialogo, confeti, vibrar } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { decir, vozActiva } from '../../core/speech.js';
import { objetoSVG, PALETA } from '../../core/art.js';
import { leer, escribir } from '../../core/storage.js';

/* Cosas de viaje, con su género para que el texto suene bien en español. */
const COSAS = [
  ['coche', 'coche', 'm'], ['camion', 'camión', 'm'], ['tren', 'tren', 'm'], ['barco', 'barco', 'm'],
  ['avion', 'avión', 'm'], ['bici', 'bici', 'f'], ['puente', 'puente', 'm'], ['montana', 'montaña', 'f'],
  ['vaca', 'vaca', 'f'], ['pajaro', 'pájaro', 'm'], ['arbol', 'árbol', 'm'], ['sol', 'sol', 'm'],
  ['nube', 'nube', 'f'], ['lluvia', 'lluvia', 'f'], ['casa', 'casa', 'f'], ['faro', 'faro', 'm'],
  ['semaforo', 'semáforo', 'm'], ['gasolinera', 'gasolinera', 'f'], ['senal', 'señal', 'f'],
  ['tunel', 'túnel', 'm'], ['perro', 'perro', 'm'], ['gato', 'gato', 'm'], ['flor', 'flor', 'f'],
  ['mariposa', 'mariposa', 'f'], ['helado', 'helado', 'm'], ['globo', 'globo', 'm'],
  ['luna', 'luna', 'f'], ['estrella', 'estrella', 'f'], ['puerto', 'puerto', 'm'],
  ['maleta', 'maleta', 'f'], ['reloj', 'reloj', 'm'], ['tren', 'tren de mercancías', 'm'],
];

const TONOS = [
  { hex: PALETA.terracota, m: 'rojo', f: 'roja' },
  { hex: PALETA.mostaza, m: 'amarillo', f: 'amarilla' },
  { hex: PALETA.azul, m: 'azul', f: 'azul' },
  { hex: PALETA.verde, m: 'verde', f: 'verde' },
  { hex: PALETA.lila, m: 'morado', f: 'morada' },
  { hex: PALETA.teal, m: 'verde oscuro', f: 'verde oscura' },
  { hex: '#8a5a34', m: 'marrón', f: 'marrón' },
  { hex: '#3a342f', m: 'negro', f: 'negra' },
];

/**
 * Tablero determinista: la misma lista siempre, para que las marcas guardadas
 * sigan correspondiendo a la misma casilla entre sesiones.
 */
function construirTablero(total) {
  const celdas = [];
  for (let i = 0; i < total; i++) {
    const cosa = COSAS[i % COSAS.length];
    const vuelta = Math.floor(i / COSAS.length);
    const [clave, nombre, genero] = cosa;
    if (vuelta === 0) {
      celdas.push({
        clave,
        color: TONOS[i % TONOS.length].hex,
        etiqueta: nombre,
        aria: `${genero === 'f' ? 'una' : 'un'} ${nombre}`,
      });
    } else {
      const tono = TONOS[(i + vuelta * 3) % TONOS.length];
      const adj = genero === 'f' ? tono.f : tono.m;
      celdas.push({
        clave,
        color: tono.hex,
        etiqueta: `${nombre} ${adj}`,
        aria: `${genero === 'f' ? 'una' : 'un'} ${nombre} ${adj}`,
      });
    }
  }
  return celdas;
}

export function iniciar(ctx) {
  const { area, nivel, marco, perfil } = ctx;

  const lado = nivel === 1 ? 4 : 10;
  const total = nivel === 1 ? 12 : 100;
  const celdas = construirTablero(total);

  const clave = `checkin.${perfil.id}.n${nivel}`;
  let marcadas = leer(clave, []);
  if (!Array.isArray(marcadas) || marcadas.length !== total) marcadas = new Array(total).fill(false);

  let nuevas = 0; // cosas marcadas en esta ronda, no en todo el viaje
  const lineasCantadas = new Set();

  const tablero = el('div', { clase: 'checkin__tablero' });
  tablero.style.setProperty('--columnas', String(lado));
  tablero.dataset.nivel = String(nivel);

  function actualizarMarcador() {
    const n = marcadas.filter(Boolean).length;
    marco.setMarcador(`${n}/${total} vistos`);
  }

  const nodos = celdas.map((c, i) => {
    const b = el('button', {
      clase: 'checkin__celda' + (marcadas[i] ? ' checkin__celda--vista' : ''),
      type: 'button',
      'aria-pressed': String(!!marcadas[i]),
      'aria-label': c.aria,
    });
    b.append(
      el('span', { clase: 'checkin__icono', html: objetoSVG(c.clave, c.color) }),
      el('span', { clase: 'checkin__etiqueta leible', texto: c.etiqueta }),
      el('span', { clase: 'checkin__tick', html: '<svg viewBox="0 0 100 100"><path d="M22 52l20 20 36-42" fill="none" stroke="#fffdf9" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>' })
    );
    b.addEventListener('click', () => alternar(i, b, c));
    tablero.appendChild(b);
    return b;
  });

  function alternar(i, nodo, celda) {
    marcadas[i] = !marcadas[i];
    nodo.classList.toggle('checkin__celda--vista', marcadas[i]);
    nodo.setAttribute('aria-pressed', String(marcadas[i]));
    escribir(clave, marcadas);

    if (marcadas[i]) {
      nuevas++;
      sonido.acierto();
      vibrar(14);
      nodo.classList.add('checkin__celda--nueva');
      setTimeout(() => nodo.classList.remove('checkin__celda--nueva'), 500);
      if (vozActiva()) decir(celda.aria);
      if (nivel === 2) revisarLineas(i);
    } else {
      nuevas = Math.max(0, nuevas - 1);
      sonido.tic();
    }
    actualizarMarcador();
  }

  /** En el tablero grande, completar una fila o una columna se celebra. */
  function revisarLineas(i) {
    const fila = Math.floor(i / lado);
    const col = i % lado;

    const filaCompleta = Array.from({ length: lado }, (_, k) => marcadas[fila * lado + k]).every(Boolean);
    const colCompleta = Array.from({ length: lado }, (_, k) => marcadas[k * lado + col]).every(Boolean);

    if (filaCompleta && !lineasCantadas.has('f' + fila)) {
      lineasCantadas.add('f' + fila);
      celebrarLinea('fila', fila);
    }
    if (colCompleta && !lineasCantadas.has('c' + col)) {
      lineasCantadas.add('c' + col);
      celebrarLinea('columna', col);
    }
  }

  function celebrarLinea(tipo, indice) {
    confeti(90);
    sonido.premio();
    const marcarNodo = (n) => {
      n.classList.add('checkin__celda--linea');
      setTimeout(() => n.classList.remove('checkin__celda--linea'), 1200);
    };
    for (let k = 0; k < lado; k++) {
      marcarNodo(nodos[tipo === 'fila' ? indice * lado + k : k * lado + indice]);
    }
    if (vozActiva()) decir('¡Línea completa!');
  }

  /* ------------------------------------------------------------ acciones */

  const acciones = el('div', { clase: 'checkin__acciones' }, [
    boton('Terminar ronda', {
      clase: 'btn btn--principal',
      onPulsar: terminar,
    }),
    boton('Empezar de nuevo', {
      clase: 'btn btn--fantasma',
      onPulsar: () =>
        dialogo({
          titulo: '¿Vaciamos el panel?',
          texto: 'Se desmarcarán todas las cosas que ya has visto.',
          cerrable: true,
          botones: [
            {
              texto: 'Sí, empezar',
              clase: 'btn btn--principal',
              onPulsar: () => {
                marcadas = new Array(total).fill(false);
                escribir(clave, marcadas);
                lineasCantadas.clear();
                nodos.forEach((n) => {
                  n.classList.remove('checkin__celda--vista');
                  n.setAttribute('aria-pressed', 'false');
                });
                actualizarMarcador();
              },
            },
            { texto: 'No', clase: 'btn btn--fantasma' },
          ],
        }),
    }),
  ]);

  function terminar() {
    const umbrales = nivel === 1 ? [6, 3, 1] : [10, 5, 1];
    const estrellas = nuevas >= umbrales[0] ? 3 : nuevas >= umbrales[1] ? 2 : nuevas >= umbrales[2] ? 1 : 0;
    const vistas = marcadas.filter(Boolean).length;
    ctx.terminar({
      estrellas,
      texto:
        nuevas === 0
          ? 'Sigue mirando por la ventanilla, ¡seguro que aparece algo!'
          : `Has visto ${nuevas} cosa${nuevas === 1 ? '' : 's'} nueva${nuevas === 1 ? '' : 's'} (${vistas} de ${total} en total).`,
    });
  }

  const envoltorio = el('div', { clase: 'checkin__scroll' }, [tablero]);
  area.append(envoltorio, acciones);

  marco.setInstruccion(
    nivel === 1
      ? 'Toca lo que vayas viendo por la ventanilla'
      : 'Marca lo que veas. Completa filas o columnas enteras.'
  );
  actualizarMarcador();

  return {
    destruir() {
      escribir(clave, marcadas);
    },
  };
}
