/**
 * Ahorcado.
 * Dos modos:
 *  - Yo sola/o: tres palabras seguidas. Nivel 1 con dibujo de pista y 10 fallos
 *    (el dibujo empieza vacío); nivel 2 por categorías y 7 fallos (la horca ya
 *    está montada).
 *  - Uno contra uno: con los dos perfiles. Por turnos, una persona escribe una
 *    palabra secreta (o pide una sorpresa) y la otra la adivina. Dos palabras
 *    para cada una. Los fallos permitidos dependen de la edad de quien adivina.
 */

import { el, limpiar, vibrar, boton, marcar, mostrarSello } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { objetoSVG, avatar, PALETA } from '../../core/art.js';
import { perfiles, nivelDe } from '../../core/profiles.js';
import { decir, vozActiva } from '../../core/speech.js';
import { elige, muestra } from '../../core/rng.js';

/* ---------------------------------------------------------------- palabras */

// Nivel 1: palabras cortas con dibujo (el nombre del objeto en core/art.js).
const PALABRAS_1 = [
  ['SOL', 'sol'], ['LUNA', 'luna'], ['GATO', 'gato'], ['PERRO', 'perro'],
  ['CASA', 'casa'], ['VACA', 'vaca'], ['TREN', 'tren'], ['FLOR', 'flor'],
  ['NUBE', 'nube'], ['COCHE', 'coche'], ['BARCO', 'barco'], ['ÁRBOL', 'arbol'],
  ['FARO', 'faro'], ['GLOBO', 'globo'], ['BICI', 'bici'], ['AVIÓN', 'avion'],
  ['HELADO', 'helado'], ['MALETA', 'maleta'], ['RELOJ', 'reloj'], ['PÁJARO', 'pajaro'],
  ['TÚNEL', 'tunel'], ['CAMIÓN', 'camion'], ['PUENTE', 'puente'], ['LLUVIA', 'lluvia'],
];

// Nivel 2: palabras por categoría; la categoría es la pista.
const PALABRAS_2 = {
  'Animales': [
    'ELEFANTE', 'JIRAFA', 'COCODRILO', 'MARIPOSA', 'PINGÜINO',
    'TORTUGA', 'DELFÍN', 'CANGURO', 'ARDILLA', 'MURCIÉLAGO',
  ],
  'De viaje': [
    'PASAPORTE', 'AEROPUERTO', 'AUTOPISTA', 'GASOLINERA', 'BILLETE',
    'MOCHILA', 'BRÚJULA', 'CARAVANA', 'ESTACIÓN', 'EQUIPAJE',
  ],
  'Países': [
    'ESPAÑA', 'PORTUGAL', 'FRANCIA', 'ITALIA', 'ALEMANIA',
    'MARRUECOS', 'JAPÓN', 'MÉXICO', 'ARGENTINA', 'CANADÁ',
  ],
  'Naturaleza': [
    'MONTAÑA', 'VOLCÁN', 'CASCADA', 'ARCOÍRIS', 'BOSQUE',
    'DESIERTO', 'PLAYA', 'GLACIAR', 'TORMENTA', 'ACANTILADO',
  ],
  'Comida': [
    'BOCADILLO', 'TORTILLA', 'CROQUETA', 'MANZANA', 'SANDÍA',
    'CHOCOLATE', 'MACARRONES', 'PAELLA', 'EMPANADA', 'MELOCOTÓN',
  ],
};

const LETRAS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const PALABRAS_SOLO = 3;
const TURNOS_1V1 = 4; // dos palabras para cada jugadora
const MAX_LETRAS = 12;

/** Quita tildes y diéresis pero respeta la Ñ: así la A destapa también la Á. */
const SIN_TILDE = { Á: 'A', À: 'A', É: 'E', È: 'E', Í: 'I', Ï: 'I', Ó: 'O', Ò: 'O', Ú: 'U', Ü: 'U' };
const base = (letra) => SIN_TILDE[letra] || letra;

/** Una palabra al azar adecuada para un nivel: { palabra, pista, dibujo }. */
function palabraAlAzar(nivel, evitar = []) {
  if (nivel === 1) {
    const libres = PALABRAS_1.filter(([p]) => !evitar.includes(p));
    const [palabra, dibujo] = elige(libres.length ? libres : PALABRAS_1);
    return { palabra, pista: 'Mira el dibujo', dibujo };
  }
  const categoria = elige(Object.keys(PALABRAS_2));
  const libres = PALABRAS_2[categoria].filter((p) => !evitar.includes(p));
  return { palabra: elige(libres.length ? libres : PALABRAS_2[categoria]), pista: categoria, dibujo: null };
}

/* ----------------------------------------------------------------- dibujo */

// Diez trazos, en el orden en que aparecen. Los tres primeros son la horca.
const TRAZOS = [
  'M12 132h62',
  'M30 132V12',
  'M30 12h54M30 34l22-22',
  'M84 12v16',
  'M84 28a12 12 0 1 1 0 24a12 12 0 1 1 0-24',
  'M84 52v36',
  'M84 62l-15 15',
  'M84 62l15 15',
  'M84 88l-13 22',
  'M84 88l13 22',
];
const PARTES_HORCA = 3;

function dibujoSVG() {
  const trazos = TRAZOS.map(
    (d, i) =>
      `<path class="ahorcado__trazo${i < PARTES_HORCA ? ' ahorcado__trazo--horca' : ''}" d="${d}" pathLength="1"/>`
  ).join('');
  // la cara aparece con la cabeza: ojos y boca (sonríe; se sorprende si se completa)
  const cara = `<g class="ahorcado__cara">
      <circle cx="80" cy="38" r="1.8"/><circle cx="88" cy="38" r="1.8"/>
      <path class="ahorcado__boca ahorcado__boca--sonrisa" d="M79 44q5 4 10 0"/>
      <circle class="ahorcado__boca ahorcado__boca--oh" cx="84" cy="45" r="2.4"/>
    </g>`;
  return `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${trazos}${cara}</svg>`;
}

/* ------------------------------------------------------------------ juego */

export function iniciar(ctx) {
  const { area, nivel, marco, perfil } = ctx;

  const timers = new Set();
  const luego = (fn, ms) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };

  // en 1 contra 1 la lectura en mayúsculas sigue a quien tiene la tablet
  const raizHtml = document.documentElement;
  const lecturaOriginal = raizHtml.dataset.lectura;
  const lecturaPara = (p) => (raizHtml.dataset.lectura = nivelDe(p) === 1 ? 'mayus' : 'normal');

  let bloqueado = false;
  let alTeclado = null; // receptor de las teclas físicas en la pantalla actual

  /* -------------------------------------------------------- teclado */

  function teclado(onLetra) {
    const caja = el('div', { clase: 'ahorcado__teclado', role: 'group', 'aria-label': 'Letras' });
    const teclas = new Map();
    for (const l of LETRAS) {
      const t = el('button', { clase: 'ahorcado__tecla', type: 'button', texto: l, 'aria-label': `Letra ${l}` });
      t.addEventListener('click', () => {
        if (bloqueado || t.disabled) return;
        onLetra(l, t);
      });
      teclas.set(l, t);
      caja.appendChild(t);
    }
    alTeclado = (l) => teclas.get(l)?.click();
    return { caja, teclas };
  }

  function onTeclaFisica(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || !alTeclado) return;
    const k = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    if (LETRAS.includes(k) || k === 'Backspace' || k === 'Enter') {
      // Enter sobre un botón con el foco ya lo pulsa el navegador
      if (k === 'Enter' && document.activeElement?.tagName === 'BUTTON') return;
      e.preventDefault();
      alTeclado(k);
    }
  }
  document.addEventListener('keydown', onTeclaFisica);

  /* ----------------------------------------------- una palabra a adivinar */

  /**
   * Monta la pantalla de adivinar. Llama a `alAcabar(acertada)` cuando se
   * resuelve la palabra o se completa el dibujo.
   */
  function adivinar({ palabra, pista, dibujo, maxFallos, marcador, alAcabar }) {
    limpiar(area);
    bloqueado = false;
    const letras = [...palabra];
    const usadas = new Set();
    let fallos = 0;
    let acabada = false;
    const previas = maxFallos < TRAZOS.length ? TRAZOS.length - maxFallos : 0;

    const lamina = el('div', { clase: 'ahorcado__dibujo', html: dibujoSVG() });
    const trazos = [...lamina.querySelectorAll('.ahorcado__trazo')];
    trazos.slice(0, previas).forEach((t) => t.classList.add('ahorcado__trazo--fijo'));

    const pistaNodo = el('div', { clase: 'ahorcado__pista' }, [
      dibujo ? el('span', { clase: 'ahorcado__pista-dibujo', html: objetoSVG(dibujo, PALETA.terracota) }) : null,
      el('span', { clase: 'ahorcado__pista-texto leible', texto: pista }),
    ]);

    const fila = el('div', { clase: 'ahorcado__palabra', 'aria-live': 'polite' });
    fila.style.setProperty('--n', String(letras.length));
    const huecos = letras.map((l) => {
      const h = el('span', { clase: 'ahorcado__hueco', 'aria-label': 'hueco' });
      fila.appendChild(h);
      return h;
    });

    const restantes = el('div', { clase: 'ahorcado__vidas leible' });
    const pintarVidas = () => {
      const quedan = maxFallos - fallos;
      restantes.textContent = quedan === 1 ? 'Te queda 1 fallo' : `Te quedan ${quedan} fallos`;
    };

    const { caja: tec } = teclado((l, tecla) => {
      if (acabada || usadas.has(l)) return;
      usadas.add(l);
      tecla.disabled = true;
      const posiciones = letras.map((x, i) => (base(x) === l ? i : -1)).filter((i) => i >= 0);

      if (posiciones.length) {
        tecla.classList.add('ahorcado__tecla--si');
        sonido.acierto();
        vibrar(12);
        posiciones.forEach((i) => {
          huecos[i].textContent = letras[i];
          huecos[i].classList.add('ahorcado__hueco--abierto');
          huecos[i].removeAttribute('aria-label');
        });
        if (nivel === 1 && vozActiva()) decir(l);
        if (letras.every((x) => usadas.has(base(x)))) fin(true);
      } else {
        tecla.classList.add('ahorcado__tecla--no');
        sonido.fallo();
        marcar(tecla, false);
        trazos[previas + fallos]?.classList.add('ahorcado__trazo--visible');
        fallos++;
        if (previas + fallos > 4) lamina.classList.add('ahorcado__dibujo--cara');
        pintarVidas();
        if (fallos >= maxFallos) fin(false);
      }
    });

    function fin(acertada) {
      acabada = true;
      alTeclado = null;
      if (acertada) {
        mostrarSello('bien');
        lamina.classList.add('ahorcado__dibujo--salvado');
      } else {
        lamina.classList.add('ahorcado__dibujo--completo');
        // se destapan las que faltaban, en otro color
        letras.forEach((x, i) => {
          if (!usadas.has(base(x))) {
            huecos[i].textContent = x;
            huecos[i].classList.add('ahorcado__hueco--desvelado');
          }
        });
      }
      if (vozActiva()) decir(palabra.toLowerCase());
      luego(() => alAcabar(acertada), acertada ? 1100 : 1700);
    }

    pintarVidas();
    marcador();
    area.append(
      el('div', { clase: 'ahorcado__mesa' }, [
        lamina,
        el('div', { clase: 'ahorcado__lado' }, [pistaNodo, fila, restantes]),
      ]),
      tec
    );
  }

  /* -------------------------------------------------------- modo solo */

  function solo() {
    let ronda = 0;
    let aciertos = 0;
    const vistas = [];
    marco.setInstruccion(
      nivel === 1 ? 'Toca letras para descubrir la palabra del dibujo.' : 'Descubre la palabra antes de que se complete el dibujo.'
    );

    function siguiente() {
      ronda++;
      const reto = palabraAlAzar(nivel, vistas);
      vistas.push(reto.palabra);
      adivinar({
        ...reto,
        maxFallos: nivel === 1 ? 10 : 7,
        marcador: () => marco.setMarcador(`Palabra ${ronda}/${PALABRAS_SOLO} · ${aciertos} ✓`),
        alAcabar: (ok) => {
          if (ok) aciertos++;
          if (ronda < PALABRAS_SOLO) siguiente();
          else
            ctx.terminar({
              estrellas: aciertos,
              texto: `Has descubierto ${aciertos} de ${PALABRAS_SOLO} palabras.`,
            });
        },
      });
    }
    siguiente();
  }

  /* ------------------------------------------------- modo uno contra uno */

  function unoContraUno() {
    const todos = perfiles();
    // quien ha abierto el juego empieza poniendo la palabra
    const jugadoras = [todos.find((p) => p.id === perfil.id) || todos[0], todos.find((p) => p.id !== perfil.id) || todos[1]];
    const puntos = [0, 0];
    const usadas = [];
    let turno = 0;

    const marcadorPartida = () =>
      marco.setMarcador(
        `${jugadoras[0].nombre} ${puntos[0]} · ${puntos[1]} ${jugadoras[1].nombre}`
      );

    function siguienteTurno() {
      if (turno >= TURNOS_1V1) return final();
      const pone = turno % 2;
      escribirSecreta(jugadoras[pone], jugadoras[1 - pone], (reto) => {
        pasarTablet(jugadoras[1 - pone], () => jugarTurno(pone, reto));
      });
    }

    function jugarTurno(pone, reto) {
      const adivina = jugadoras[1 - pone];
      lecturaPara(adivina);
      marco.setInstruccion(`${adivina.nombre}, adivina la palabra de ${jugadoras[pone].nombre}.`);
      adivinar({
        ...reto,
        maxFallos: nivelDe(adivina) === 1 ? 10 : 7,
        marcador: marcadorPartida,
        alAcabar: (ok) => {
          if (ok) puntos[1 - pone]++;
          marcadorPartida();
          turno++;
          siguienteTurno();
        },
      });
    }

    function final() {
      lecturaPara(perfil);
      const [a, b] = jugadoras;
      const linea = `${a.nombre}: ${puntos[0]} · ${b.nombre}: ${puntos[1]}.`;
      const quien =
        puntos[0] === puntos[1] ? '¡Empate!' : `¡Gana ${puntos[0] > puntos[1] ? a.nombre : b.nombre}!`;
      ctx.terminar({
        // las estrellas son del perfil activo: una por jugar y una por palabra adivinada
        estrellas: Math.min(3, 1 + puntos[0]),
        texto: `${quien} ${linea}`,
      });
    }

    /** Pantalla para escribir la palabra secreta (o pedir una sorpresa). */
    function escribirSecreta(pone, adivina, listo) {
      limpiar(area);
      bloqueado = false;
      lecturaPara(pone);
      marcadorPartida();
      marco.setInstruccion(`${pone.nombre}, escribe una palabra secreta para ${adivina.nombre}. ¡Que no mire!`);

      let texto = '';
      let sorpresa = null;
      let visible = false;

      const fila = el('div', { clase: 'ahorcado__palabra ahorcado__palabra--escribir' });
      const btnVer = boton('Ver', { clase: 'btn btn--fantasma', onPulsar: () => ((visible = !visible), pintar()) });
      const btnBorrar = boton('Borrar', { clase: 'btn btn--fantasma', onPulsar: () => borrar() });
      const btnSorpresa = boton('Palabra sorpresa', {
        clase: 'btn btn--mostaza',
        onPulsar: () => {
          sorpresa = palabraAlAzar(nivelDe(adivina), usadas);
          texto = sorpresa.palabra;
          pintar();
        },
      });
      const btnListo = boton('¡Lista!', {
        clase: 'btn btn--principal',
        onPulsar: () => {
          if (texto.length < 2) return;
          usadas.push(texto);
          listo(
            sorpresa && sorpresa.palabra === texto
              ? sorpresa
              : { palabra: texto, pista: `Palabra de ${pone.nombre}`, dibujo: null }
          );
        },
      });

      function pintar() {
        limpiar(fila);
        const n = Math.max(texto.length, 1);
        fila.style.setProperty('--n', String(Math.max(n, 4)));
        if (!texto) fila.appendChild(el('span', { clase: 'ahorcado__hueco ahorcado__hueco--cursor' }));
        for (const l of texto) {
          fila.appendChild(
            el('span', { clase: 'ahorcado__hueco ahorcado__hueco--abierto', texto: visible ? l : '●' })
          );
        }
        btnVer.lastChild.textContent = visible ? 'Ocultar' : 'Ver';
        btnListo.disabled = texto.length < 2;
        btnBorrar.disabled = !texto.length;
      }

      function borrar() {
        texto = texto.slice(0, -1);
        if (sorpresa && texto !== sorpresa.palabra) sorpresa = null;
        pintar();
      }

      const { caja: tec } = teclado((l) => {
        if (texto.length >= MAX_LETRAS) return;
        sonido.toque();
        texto += l;
        sorpresa = null;
        pintar();
      });
      const recibir = alTeclado;
      alTeclado = (k) => {
        if (k === 'Backspace') borrar();
        else if (k === 'Enter') btnListo.click();
        else recibir(k);
      };

      pintar();
      area.append(
        el('div', { clase: 'ahorcado__secreta' }, [
          fila,
          el('div', { clase: 'ahorcado__acciones' }, [btnVer, btnBorrar, btnSorpresa, btnListo]),
        ]),
        tec
      );
    }

    /** Pausa entre turnos para que la otra persona coja la tablet sin ver nada. */
    function pasarTablet(a, seguir) {
      limpiar(area);
      alTeclado = null;
      lecturaPara(a);
      marco.setInstruccion(`Pasa la tablet a ${a.nombre}.`, true);
      area.appendChild(
        el('div', { clase: 'ahorcado__pase' }, [
          el('div', { clase: 'ahorcado__pase-avatar', html: avatar(a.avatar, a.color) }),
          el('p', { clase: 'ahorcado__pase-texto leible', texto: `Turno de ${a.nombre}` }),
          boton(`Soy ${a.nombre}, ¡a jugar!`, { clase: 'btn btn--principal btn--grande', onPulsar: seguir }),
        ])
      );
    }

    siguienteTurno();
  }

  /* ------------------------------------------------------------ menú */

  function menu() {
    marco.setMarcador('');
    marco.setInstruccion('¿Cómo quieres jugar?');
    limpiar(area);
    alTeclado = null;
    const otra = perfiles().find((p) => p.id !== perfil.id);
    const opciones = [
      { nombre: 'Yo solo', desc: `${PALABRAS_SOLO} palabras`, html: avatar(perfil.avatar, perfil.color), ir: solo },
      {
        nombre: 'Uno contra uno',
        desc: otra ? `con ${otra.nombre}` : 'por turnos',
        html: `<svg viewBox="0 0 100 100" aria-hidden="true">${avatar(perfil.avatar, perfil.color)
          .replace('<svg', '<svg x="-2" y="14" width="66" height="66"')}${otra ? avatar(otra.avatar, otra.color).replace('<svg', '<svg x="36" y="20" width="66" height="66"') : ''}</svg>`,
        ir: unoContraUno,
      },
    ];
    const rejilla = el('div', { clase: 'ahorcado__modos' });
    for (const o of opciones) {
      const b = el('button', { clase: 'ahorcado__modo', type: 'button', 'aria-label': `${o.nombre}, ${o.desc}` }, [
        el('span', { clase: 'ahorcado__modo-icono', html: o.html }),
        el('span', { clase: 'ahorcado__modo-nombre leible', texto: o.nombre }),
        el('span', { clase: 'ahorcado__modo-desc leible', texto: o.desc }),
      ]);
      b.addEventListener('click', () => {
        sonido.toque();
        o.ir();
      });
      rejilla.appendChild(b);
    }
    area.appendChild(rejilla);
  }

  menu();

  return {
    destruir() {
      timers.forEach(clearTimeout);
      timers.clear();
      document.removeEventListener('keydown', onTeclaFisica);
      if (lecturaOriginal) raizHtml.dataset.lectura = lecturaOriginal;
    },
    pausa(activa) {
      bloqueado = activa;
    },
  };
}
