/**
 * Piezas de interfaz compartidas: creación de nodos, marco común de los juegos,
 * diálogos, feedback de acierto/fallo y pantalla de resultados.
 */

import { icono, sello, medalla as arteMedalla, PALETA } from './art.js';
import { sonido, despertar } from './audio.js';
import { decir, callar, vozActiva } from './speech.js';
import { confeti } from './confetti.js';

/* --------------------------------------------------------------- nodos */

export function el(tag, props = {}, hijos = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'clase') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'texto') n.textContent = v;
    else if (k === 'estilo') Object.assign(n.style, v);
    else if (k === 'datos') for (const [dk, dv] of Object.entries(v)) n.dataset[dk] = dv;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const h of [].concat(hijos)) {
    if (h == null) continue;
    n.appendChild(typeof h === 'string' ? document.createTextNode(h) : h);
  }
  return n;
}

export const limpiar = (n) => {
  while (n.firstChild) n.removeChild(n.firstChild);
  return n;
};

/** Botón táctil con sonido de toque incorporado. */
export function boton(texto, { clase = 'btn', icono: ic = null, onPulsar, aria } = {}) {
  const b = el('button', { clase, type: 'button', 'aria-label': aria || null });
  if (ic) b.appendChild(el('span', { clase: 'btn__icono', html: ic, estilo: { width: '26px', height: '26px' } }));
  if (texto) b.appendChild(document.createTextNode(texto));
  b.addEventListener('click', (e) => {
    despertar();
    sonido.toque();
    onPulsar?.(e);
  });
  return b;
}

export function botonIcono(svgIcono, { onPulsar, aria, clase = 'btn-icono' } = {}) {
  const b = el('button', { clase, type: 'button', 'aria-label': aria || 'botón', html: svgIcono });
  b.addEventListener('click', (e) => {
    despertar();
    sonido.toque();
    onPulsar?.(e);
  });
  return b;
}

/* ------------------------------------------------------- feedback visual */

let temporizadorSello = null;

export function mostrarSello(tipo = 'bien') {
  const previo = document.querySelector('.sello');
  if (previo) previo.remove();
  clearTimeout(temporizadorSello);
  const s = el('div', { clase: 'sello', html: (sello[tipo] || sello.bien)() });
  document.body.appendChild(s);
  temporizadorSello = setTimeout(() => s.remove(), 640);
}

export function marcar(nodo, ok) {
  if (!nodo) return;
  const clase = ok ? 'es-acierto' : 'es-fallo';
  nodo.classList.remove('es-acierto', 'es-fallo');
  void nodo.offsetWidth; // reinicia la animación
  nodo.classList.add(clase);
  setTimeout(() => nodo.classList.remove(clase), 700);
}

export function vibrar(ms = 18) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* no todos los dispositivos lo permiten */
  }
}

/* ------------------------------------------------------------- diálogos */

const FOCABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad de un diálogo modal: mueve el foco dentro al abrirlo, lo
 * retiene mientras esté abierto (Tab y Mayús+Tab dan la vuelta) y devuelve
 * una función que lo restituye al elemento que lo tenía antes.
 */
export function atraparFoco(velo) {
  const previo = document.activeElement;
  const focables = () => [...velo.querySelectorAll(FOCABLES)].filter((n) => !n.disabled);
  velo.setAttribute('tabindex', '-1');
  velo.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = focables();
    if (!f.length) return;
    const primero = f[0];
    const ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  });
  // el foco entra en cuanto el diálogo está en el DOM
  requestAnimationFrame(() => (focables()[0] || velo).focus());
  return () => {
    if (previo?.isConnected && typeof previo.focus === 'function') previo.focus();
  };
}

/**
 * Diálogo modal. Devuelve una función para cerrarlo.
 * botones: [{ texto, clase, onPulsar, cierra }]
 */
export function dialogo({ titulo, texto, html, botones = [], cerrable = false, leer = null }) {
  const velo = el('div', { clase: 'velo', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo || texto || 'Aviso' });
  const caja = el('div', { clase: 'dialogo' });

  if (titulo) caja.appendChild(el('h2', { texto: titulo }));
  if (texto) caja.appendChild(el('p', { texto }));
  if (html) caja.appendChild(el('div', { html }));

  const fila = el('div', { clase: 'dialogo__botones' });
  let devolverFoco = () => {};
  const cerrar = () => {
    callar();
    velo.remove();
    devolverFoco();
  };

  for (const b of botones) {
    fila.appendChild(
      boton(b.texto, {
        clase: b.clase || 'btn',
        onPulsar: () => {
          if (b.cierra !== false) cerrar();
          b.onPulsar?.();
        },
      })
    );
  }
  caja.appendChild(fila);
  velo.appendChild(caja);

  if (cerrable) {
    velo.addEventListener('click', (e) => {
      if (e.target === velo) cerrar();
    });
  }

  document.body.appendChild(velo);
  devolverFoco = atraparFoco(velo);
  if (leer && vozActiva()) decir(leer);
  return cerrar;
}

/* ------------------------------------------------- estrellas del premio */

function filaEstrellas(n) {
  const f = el('div', { clase: 'estrellas-premio' });
  for (let i = 0; i < 3; i++) {
    const activa = i < n;
    f.appendChild(
      el('span', {
        clase: activa ? 'estrella-on' : 'estrella-off',
        html: icono.estrella(activa ? PALETA.mostaza : '#e4dbcd'),
        estilo: { display: 'block' },
      })
    );
  }
  return f;
}

const FRASES = {
  3: ['¡Perfecto!', '¡Increíble!', '¡Lo has bordado!'],
  2: ['¡Muy bien!', '¡Casi perfecto!', '¡Buen trabajo!'],
  1: ['¡Bien hecho!', '¡Lo has conseguido!', '¡Sigue así!'],
  0: ['¡Buen intento!', '¡Ya casi!', '¡Otra vez y sale!'],
};

/**
 * Pantalla de fin de partida. Nunca dice "has perdido": siempre invita a repetir.
 */
export function resultado({ estrellas = 0, texto = '', medallas = [], onRepetir, onSalir }) {
  const lista = FRASES[estrellas] || FRASES[0];
  const titulo = lista[(Math.random() * lista.length) | 0];

  const velo = el('div', { clase: 'velo', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo });
  const caja = el('div', { clase: 'dialogo' });
  caja.appendChild(el('h2', { texto: titulo }));
  caja.appendChild(filaEstrellas(estrellas));
  if (texto) caja.appendChild(el('p', { texto }));

  for (const m of medallas) {
    caja.appendChild(
      el('div', { clase: 'medalla', estilo: { marginBottom: '12px', background: 'var(--crema-2)' } }, [
        el('div', { html: arteMedalla(m.emblema, m.color) }),
        el('b', { texto: '¡Medalla nueva! ' + m.nombre }),
        el('small', { texto: m.desc }),
      ])
    );
  }

  const fila = el('div', { clase: 'dialogo__botones' });
  fila.appendChild(
    boton('Otra vez', {
      clase: 'btn btn--principal',
      onPulsar: () => {
        velo.remove();
        onRepetir?.();
      },
    })
  );
  fila.appendChild(
    boton('Al menú', {
      clase: 'btn btn--fantasma',
      onPulsar: () => {
        velo.remove();
        onSalir?.();
      },
    })
  );
  caja.appendChild(fila);
  velo.appendChild(caja);
  document.body.appendChild(velo);
  atraparFoco(velo);

  if (estrellas >= 2 || medallas.length) confeti(medallas.length ? 90 : 60);
  if (medallas.length) sonido.medalla();
  else sonido.premio();
  if (vozActiva()) decir(titulo);
}

/* --------------------------------------------------- marco común de juego */

/**
 * Crea la pantalla estándar de un minijuego: barra con salida y pausa siempre
 * visibles, instrucción con lectura en voz alta y área de juego.
 */
export function marcoJuego({ titulo, instruccion = '', onSalir, onPausaExtra = null }) {
  const raiz = el('section', { clase: 'pantalla pantalla-juego' });

  const barra = el('header', { clase: 'barra-juego' });
  const btnAtras = botonIcono(icono.atras(), { aria: 'Volver al menú', onPulsar: () => onSalir?.() });
  // cada pantalla de juego lleva su propio h1 (el título del juego)
  const tit = el('h1', { clase: 'barra-juego__titulo', texto: titulo });
  const marcador = el('div', { clase: 'marcador', 'aria-live': 'polite' });
  const btnPausa = botonIcono(icono.pausa(), {
    aria: 'Pausa',
    onPulsar: () => {
      onPausaExtra?.(true);
      dialogo({
        titulo: 'Pausa',
        texto: 'Cuando quieras seguimos.',
        botones: [
          { texto: 'Seguir jugando', clase: 'btn btn--principal', onPulsar: () => onPausaExtra?.(false) },
          { texto: 'Al menú', clase: 'btn btn--fantasma', onPulsar: () => onSalir?.() },
        ],
      });
    },
  });
  barra.append(btnAtras, tit, marcador, btnPausa);

  const cajaInstr = el('div', { clase: 'instruccion' });
  const txtInstr = el('span', { clase: 'instruccion__texto', texto: instruccion });
  const btnVoz = botonIcono(icono.voz(), {
    aria: 'Escuchar la instrucción',
    onPulsar: () => decir(txtInstr.textContent, true),
  });
  btnVoz.style.width = '48px';
  btnVoz.style.height = '48px';
  cajaInstr.append(txtInstr, btnVoz);

  const area = el('div', { clase: 'area-juego' });
  raiz.append(barra, cajaInstr, area);

  return {
    raiz,
    area,
    barra,
    setInstruccion(t, leerla = false) {
      txtInstr.textContent = t;
      if (leerla) decir(t);
    },
    setMarcador(html) {
      marcador.innerHTML = html;
      marcador.classList.toggle('oculto', !html);
    },
  };
}

export { confeti };
