/**
 * Orquestador de la aplicación: pantallas de perfil, hub, progreso y arranque
 * de los minijuegos. Aquí no hay lógica de juego, solo el marco que los une.
 */

import { CATALOGO, cargarJuego, nombreJuego } from './router.js';
import { avatar, icono, medalla as arteMedalla, PALETA } from './art.js';
import { el, limpiar, boton, botonIcono, marcoJuego, dialogo, resultado, atraparFoco } from './ui.js';
import { sonido, despertar, estaSilenciado, alternarSilencio } from './audio.js';
import { decir, callar, vozActiva, alternarVoz, vozDisponible } from './speech.js';
import {
  perfiles,
  perfilActivo,
  activar,
  salirDePerfil,
  guardarPerfil,
  nivelDe,
  COLORES_PERFIL,
} from './profiles.js';
import { estadoOffline, prepararOffline, esAppInstalada } from './offline.js';
import {
  progreso,
  registrarVisita,
  registrarPartida,
  revisarMedallasDe,
  estrellasDeJuego,
  MEDALLAS,
} from './progress.js';

const app = document.getElementById('app');
let juegoActivo = null; // { destruir() }
let instalador = null; // evento de instalación de Android/Chrome

// Android permite ofrecer la instalación desde la propia app; en iOS se hace
// desde Compartir → "Añadir a pantalla de inicio" (ver README).
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  instalador = e;
  document.querySelector('[data-instalar]')?.classList.remove('oculto');
});

/* ------------------------------------------------------------- montaje */

function montar(nodo) {
  cerrarJuego();
  callar();
  // los diálogos abiertos no deben sobrevivir a un cambio de pantalla
  document.querySelectorAll('.velo').forEach((v) => v.remove());

  // se retiran TODAS las pantallas previas: si dos montajes se encadenan muy
  // rápido (por ejemplo "cargando" seguido del juego), no puede quedar ninguna
  // huérfana en el DOM.
  for (const previa of [...app.children]) {
    previa.classList.add('pantalla--saliendo');
    setTimeout(() => previa.remove(), 180);
  }
  app.appendChild(nodo);
}

/**
 * Modo de lectura. A los 5 años aún no se leen bien las minúsculas, así que
 * con el perfil de nivel 1 todo el texto que hay que leer pasa a MAYÚSCULAS.
 */
function aplicarLectura(perfil) {
  const modo = perfil && nivelDe(perfil) === 1 ? 'mayus' : 'normal';
  document.documentElement.dataset.lectura = modo;
}

function cerrarJuego() {
  try {
    juegoActivo?.destruir?.();
  } catch {
    /* que un juego falle al salir no puede bloquear la app */
  }
  juegoActivo = null;
}

/* ------------------------------------------------ pantalla de perfiles */

export function pantallaPerfiles() {
  aplicarLectura(null);
  const raiz = el('section', { clase: 'pantalla' });
  const caja = el('div', { clase: 'perfiles' });

  caja.appendChild(
    el('div', { clase: 'perfiles__cabecera' }, [
      el('h1', { texto: 'Juegos de viaje' }),
      el('p', { texto: '¿Quién va a jugar?' }),
    ])
  );

  const lista = el('div', { clase: 'perfiles__lista' });
  for (const p of perfiles()) {
    const tarjeta = el('button', {
      clase: 'tarjeta-perfil',
      type: 'button',
      'aria-label': `Entrar como ${p.nombre}`,
    });
    tarjeta.appendChild(el('div', { clase: 'tarjeta-perfil__avatar', html: avatar(p.avatar, p.color) }));
    tarjeta.appendChild(el('div', { clase: 'tarjeta-perfil__nombre', texto: p.nombre }));
    tarjeta.appendChild(el('div', { clase: 'tarjeta-perfil__edad', texto: `${p.edad} años` }));
    tarjeta.addEventListener('click', () => {
      despertar();
      sonido.acierto();
      entrarComo(p.id);
    });
    lista.appendChild(tarjeta);
  }
  caja.appendChild(lista);

  const pie = el('div', { clase: 'perfiles__pie' });
  pie.appendChild(boton('Editar perfiles', { clase: 'btn btn--fantasma', onPulsar: editarPerfiles }));

  const btnInstalar = boton('Instalar en la tablet', {
    clase: 'btn btn--teal' + (instalador ? '' : ' oculto'),
    onPulsar: async () => {
      if (!instalador) return;
      instalador.prompt();
      await instalador.userChoice;
      instalador = null;
      btnInstalar.classList.add('oculto');
    },
  });
  btnInstalar.dataset.instalar = '1';
  pie.appendChild(btnInstalar);
  caja.appendChild(pie);
  caja.appendChild(panelViaje());

  raiz.appendChild(caja);
  montar(raiz);
  if (vozActiva()) decir('¿Quién va a jugar?');
}

function editarPerfiles() {
  const cuerpo = el('div');
  const editores = [];

  for (const p of perfiles()) {
    const nombre = el('input', { type: 'text', value: p.nombre, maxlength: '14', 'aria-label': 'Nombre' });
    const edad = el('input', { type: 'number', value: String(p.edad), min: '3', max: '12', 'aria-label': 'Edad' });

    const colores = el('div', { clase: 'selector-color' });
    let colorSel = p.color;
    COLORES_PERFIL.forEach((c) => {
      const b = el('button', {
        type: 'button',
        estilo: { background: c },
        'aria-label': 'Color',
        'aria-pressed': String(c === colorSel),
      });
      b.addEventListener('click', () => {
        colorSel = c;
        colores.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        vista.innerHTML = avatar(avatarSel, colorSel);
        sonido.toque();
      });
      colores.appendChild(b);
    });

    let avatarSel = p.avatar;
    const vista = el('div', { estilo: { width: '110px', height: '110px', margin: '0 auto' }, html: avatar(avatarSel, colorSel) });
    const cambiarCara = boton('Otra cara', {
      clase: 'btn btn--fantasma',
      onPulsar: () => {
        avatarSel = (avatarSel + 1) % 4;
        vista.innerHTML = avatar(avatarSel, colorSel);
      },
    });

    cuerpo.appendChild(
      el('div', { estilo: { marginBottom: '22px', paddingBottom: '18px', borderBottom: '2px solid var(--crema-2)' } }, [
        vista,
        el('div', { estilo: { textAlign: 'center', margin: '10px 0' } }, [cambiarCara]),
        el('div', { clase: 'campo' }, [el('label', { texto: 'Nombre' }), nombre]),
        el('div', { clase: 'campo' }, [el('label', { texto: 'Edad (decide la dificultad)' }), edad]),
        el('div', { clase: 'campo' }, [el('label', { texto: 'Color' }), colores]),
      ])
    );

    editores.push(() =>
      guardarPerfil(p.id, {
        nombre: nombre.value.trim().slice(0, 14) || p.nombre,
        edad: Math.min(12, Math.max(3, parseInt(edad.value, 10) || p.edad)),
        avatar: avatarSel,
        color: colorSel,
      })
    );
  }

  const velo = el('div', { clase: 'velo' });
  const caja = el('div', { clase: 'dialogo' });
  caja.appendChild(el('h2', { texto: 'Editar perfiles' }));
  caja.appendChild(cuerpo);
  caja.appendChild(
    el('div', { clase: 'dialogo__botones' }, [
      boton('Guardar', {
        clase: 'btn btn--principal',
        onPulsar: () => {
          editores.forEach((g) => g());
          velo.remove();
          pantallaPerfiles();
        },
      }),
      boton('Cancelar', { clase: 'btn btn--fantasma', onPulsar: () => velo.remove() }),
    ])
  );
  velo.appendChild(caja);
  document.body.appendChild(velo);
}

/* ------------------------------------------- preparación para el viaje */

/**
 * Indicador honesto del modo sin conexión. En una tablet no hay forma de
 * comprobarlo por dentro, así que la app lo dice ella misma y permite forzar
 * la descarga completa antes de salir de casa.
 */
function panelViaje() {
  const caja = el('div', { clase: 'viaje' });
  const texto = el('span', { clase: 'viaje__texto', texto: 'Comprobando…' });
  const barra = el('div', { clase: 'viaje__barra oculto' }, [el('i')]);
  const relleno = barra.firstElementChild;

  const accion = boton('Preparar para el viaje', {
    clase: 'btn btn--teal oculto',
    onPulsar: async () => {
      accion.classList.add('oculto');
      barra.classList.remove('oculto');
      texto.textContent = 'Guardando los juegos en la tablet…';
      caja.dataset.estado = 'trabajando';

      const r = await prepararOffline(({ hechos, total }) => {
        relleno.style.width = `${Math.round((hechos / Math.max(1, total)) * 100)}%`;
      });

      barra.classList.add('oculto');
      pintar(r.soportado === false ? { soportado: false } : r);
    },
  });

  function pintar(e) {
    if (e.soportado === false) {
      caja.dataset.estado = 'no';
      texto.textContent =
        'Este navegador no puede guardar la app para usarla sin conexión. En iPad, ábrela con Safari e instálala desde Compartir → Añadir a pantalla de inicio.';
      accion.classList.add('oculto');
      return;
    }
    if (e.listo) {
      caja.dataset.estado = 'si';
      texto.textContent = esAppInstalada()
        ? '✓ Lista para el modo avión. Ya funciona sin conexión.'
        : '✓ Guardada. Instálala en la pantalla de inicio y ábrela una vez desde el icono.';
      accion.classList.add('oculto');
      return;
    }
    caja.dataset.estado = 'pendiente';
    texto.textContent =
      e.faltan == null
        ? 'Todavía no está guardada para usar sin conexión.'
        : `Faltan ${e.faltan} de ${e.total} archivos por guardar.`;
    accion.textContent = 'Preparar para el viaje';
    accion.classList.remove('oculto');
  }

  caja.append(texto, barra, accion);
  estadoOffline().then(pintar);
  return caja;
}

function entrarComo(id) {
  const p = activar(id);
  registrarVisita(id);
  const nuevas = revisarMedallasDe(id);
  pantallaHub();
  if (nuevas.length) setTimeout(() => avisoMedallas(nuevas), 700);
}

function avisoMedallas(medallas) {
  sonido.medalla();
  dialogo({
    titulo: medallas.length > 1 ? '¡Medallas nuevas!' : '¡Medalla nueva!',
    html: medallas
      .map(
        (m) =>
          `<div class="medalla" style="background:var(--crema-2);margin-bottom:10px">${arteMedalla(
            m.emblema,
            m.color
          )}<b>${m.nombre}</b><small>${m.desc}</small></div>`
      )
      .join(''),
    botones: [{ texto: '¡Genial!', clase: 'btn btn--principal' }],
    leer: '¡Has conseguido una medalla nueva!',
  });
}

/* ------------------------------------------------------------- hub */

export function pantallaHub() {
  const perfil = perfilActivo();
  if (!perfil) return pantallaPerfiles();

  aplicarLectura(perfil);
  const datos = progreso(perfil.id);
  const raiz = el('section', { clase: 'pantalla' });

  /* --- barra superior --- */
  const barra = el('header', { clase: 'hub__barra' });
  const btnPerfil = el('button', { clase: 'hub__perfil', type: 'button', 'aria-label': 'Cambiar de perfil' });
  btnPerfil.appendChild(el('span', { html: avatar(perfil.avatar, perfil.color) }));
  btnPerfil.appendChild(el('span', { clase: 'hub__perfil-nombre', texto: perfil.nombre }));
  btnPerfil.addEventListener('click', () => {
    sonido.toque();
    salirDePerfil();
    pantallaPerfiles();
  });

  const stats = el('div', { clase: 'hub__stats' });
  stats.appendChild(
    el('div', { clase: 'marcador', 'aria-label': `${datos.estrellas} estrellas` }, [
      el('span', { html: icono.estrella(), estilo: { width: '26px', height: '26px' } }),
      el('span', { texto: String(datos.estrellas) }),
    ])
  );
  stats.appendChild(
    el('div', { clase: 'marcador', 'aria-label': `Racha de ${datos.racha} días` }, [
      el('span', { html: icono.racha(), estilo: { width: '26px', height: '26px' } }),
      el('span', { texto: String(datos.racha) }),
    ])
  );

  const btnSonido = botonIcono(estaSilenciado() ? icono.sonidoOff() : icono.sonidoOn(), {
    aria: 'Activar o silenciar el sonido',
    onPulsar: () => {
      const mudo = alternarSilencio();
      btnSonido.innerHTML = mudo ? icono.sonidoOff() : icono.sonidoOn();
    },
  });

  const btnVoz = botonIcono(icono.voz(), {
    aria: 'Leer las instrucciones en voz alta',
    onPulsar: () => {
      const activa = alternarVoz();
      btnVoz.style.opacity = activa ? '1' : '0.45';
      if (activa) decir('Voz activada');
    },
  });
  btnVoz.style.opacity = vozActiva() ? '1' : '0.45';
  if (!vozDisponible()) btnVoz.classList.add('oculto');

  const btnProgreso = botonIcono(icono.medalla(), { aria: 'Mi progreso', onPulsar: pantallaProgreso });

  const btnViaje = botonIcono(icono.nube(), {
    aria: 'Modo sin conexión',
    onPulsar: () => {
      const velo = el('div', { clase: 'velo', role: 'dialog', 'aria-modal': 'true' });
      let devolverFoco = () => {};
      const cerrar = () => {
        velo.remove();
        devolverFoco();
      };
      const caja = el('div', { clase: 'dialogo' }, [
        el('h2', { texto: 'Modo sin conexión' }),
        panelViaje(),
        el('div', { clase: 'dialogo__botones', estilo: { marginTop: '18px' } }, [
          boton('Cerrar', { clase: 'btn btn--fantasma', onPulsar: cerrar }),
        ]),
      ]);
      velo.appendChild(caja);
      velo.addEventListener('click', (e) => e.target === velo && cerrar());
      document.body.appendChild(velo);
      devolverFoco = atraparFoco(velo);
    },
  });

  barra.append(btnPerfil, stats, btnViaje, btnVoz, btnSonido, btnProgreso);

  /* --- saludo --- */
  const saludo = el('div', { clase: 'hub__saludo' }, [
    el('h1', { texto: `¡Hola, ${perfil.nombre}!` }),
    el('p', {
      texto:
        datos.racha > 1
          ? `Llevas ${datos.racha} días de viaje jugando. ¿A qué jugamos?`
          : '¿A qué te apetece jugar?',
    }),
  ]);

  /* --- rejilla de juegos --- */
  const scroll = el('div', { clase: 'scroll' });
  const grid = el('div', { clase: 'hub__grid' });

  const nivel = nivelDe(perfil);
  CATALOGO.forEach((j, i) => {
    const estrellas = estrellasDeJuego(perfil.id, j.id);
    const titulo = nombreJuego(j, nivel);
    const tarjeta = el('button', {
      clase: 'tarjeta-juego',
      type: 'button',
      'aria-label': `Jugar a ${titulo}`,
      estilo: { animationDelay: `${i * 45}ms` },
    });
    tarjeta.appendChild(el('div', { clase: 'tarjeta-juego__arte', html: j.arte() }));
    tarjeta.appendChild(el('div', { clase: 'tarjeta-juego__nombre', texto: titulo }));
    tarjeta.appendChild(
      el('div', { clase: 'tarjeta-juego__estrellas' }, [
        el('span', { html: icono.estrella() }),
        el('span', { texto: String(estrellas) }),
      ])
    );
    tarjeta.addEventListener('click', () => {
      despertar();
      sonido.toque();
      abrirJuego(j.id);
    });
    grid.appendChild(tarjeta);
  });

  scroll.appendChild(grid);
  raiz.append(barra, saludo, scroll);
  montar(raiz);
}

/* --------------------------------------------------------- mi progreso */

export function pantallaProgreso() {
  const perfil = perfilActivo();
  if (!perfil) return pantallaPerfiles();
  const datos = progreso(perfil.id);

  const raiz = el('section', { clase: 'pantalla' });

  const barra = el('header', { clase: 'barra-juego' });
  barra.append(
    botonIcono(icono.atras(), { aria: 'Volver', onPulsar: pantallaHub }),
    el('h1', { clase: 'barra-juego__titulo', texto: 'Mi progreso' })
  );

  const resumen = el('div', { clase: 'progreso__resumen' }, [
    el('div', { clase: 'avatar', html: avatar(perfil.avatar, perfil.color), estilo: { width: '92px', height: '92px' } }),
    el('div', { clase: 'progreso__cifras' }, [
      el('div', { clase: 'cifra' }, [el('b', { texto: String(datos.estrellas) }), el('span', { texto: 'estrellas' })]),
      el('div', { clase: 'cifra' }, [el('b', { texto: String(datos.partidas) }), el('span', { texto: 'partidas' })]),
      el('div', { clase: 'cifra' }, [el('b', { texto: String(datos.racha) }), el('span', { texto: 'días seguidos' })]),
      el('div', { clase: 'cifra' }, [
        el('b', { texto: `${datos.medallas.length}/${MEDALLAS.length}` }),
        el('span', { texto: 'medallas' }),
      ]),
    ]),
  ]);

  const scroll = el('div', { clase: 'scroll' });
  const rejilla = el('div', { clase: 'medallas' });
  for (const m of MEDALLAS) {
    const tiene = datos.medallas.includes(m.id);
    rejilla.appendChild(
      el('div', { clase: 'medalla' + (tiene ? '' : ' medalla--bloqueada') }, [
        el('div', { html: arteMedalla(m.emblema, tiene ? m.color : '#b9b0a4') }),
        el('b', { texto: m.nombre }),
        el('small', { texto: m.desc }),
      ])
    );
  }
  scroll.append(el('h3', { texto: 'Mis medallas', estilo: { marginBottom: '12px' } }), rejilla);

  raiz.append(barra, resumen, scroll);
  montar(raiz);
}

/* --------------------------------------------------------- minijuegos */

export async function abrirJuego(id) {
  const perfil = perfilActivo();
  if (!perfil) return pantallaPerfiles();

  const ficha = CATALOGO.find((j) => j.id === id);
  const nivel = nivelDe(perfil);
  aplicarLectura(perfil);

  // solo se muestra el aviso de espera si la carga tarda de verdad
  const espera = setTimeout(() => {
    montar(
      el('section', { clase: 'pantalla' }, [
        el('div', { clase: 'area-juego' }, [el('h2', { texto: 'Preparando…' })]),
      ])
    );
  }, 250);

  let mod;
  try {
    mod = await cargarJuego(id);
  } catch (e) {
    clearTimeout(espera);
    console.error('[juego] no se pudo cargar', id, e);
    // Caso típico: sin conexión y este juego todavía no estaba guardado.
    const hayRed = navigator.onLine !== false;
    dialogo({
      titulo: 'Este juego aún no está guardado',
      texto: hayRed
        ? 'No se ha podido abrir. Inténtalo otra vez.'
        : 'Necesita conexión una primera vez para guardarse en la tablet. Conéctate un momento y pulsa "Guardar todo".',
      botones: [
        { texto: 'Reintentar', clase: 'btn btn--principal', onPulsar: () => abrirJuego(id) },
        {
          texto: 'Guardar todo',
          clase: 'btn btn--teal',
          onPulsar: async () => {
            const cerrar = dialogo({
              titulo: 'Guardando…',
              texto: 'Descargando los juegos para poder usarlos sin conexión.',
              botones: [],
            });
            const r = await prepararOffline();
            cerrar();
            dialogo({
              titulo: r.listo ? '¡Ya está!' : 'No se ha podido guardar',
              texto: r.listo
                ? 'Todos los juegos están en la tablet. Ya funciona en modo avión.'
                : 'Comprueba la conexión e inténtalo de nuevo.',
              botones: [{ texto: 'Vale', clase: 'btn btn--principal', onPulsar: pantallaHub }],
            });
          },
        },
        { texto: 'Al menú', clase: 'btn btn--fantasma', onPulsar: pantallaHub },
      ],
    });
    return;
  }
  clearTimeout(espera);

  const arrancar = () => {
    cerrarJuego();
    const marco = marcoJuego({
      titulo: nombreJuego(ficha, nivel),
      instruccion: ficha.instrucciones[nivel],
      onSalir: () => pantallaHub(),
      onPausaExtra: (enPausa) => juegoActivo?.pausa?.(enPausa),
    });
    montar(marco.raiz);

    const ctx = {
      perfil,
      nivel,
      marco,
      area: marco.area,
      /** Cierra la partida, guarda el progreso y muestra el resultado. */
      terminar({ estrellas = 0, texto = '' } = {}) {
        const { nuevasMedallas } = registrarPartida(perfil.id, id, estrellas);
        resultado({
          estrellas,
          texto,
          medallas: nuevasMedallas,
          onRepetir: arrancar,
          onSalir: pantallaHub,
        });
      },
      salir: () => pantallaHub(),
      reiniciar: arrancar,
    };

    try {
      juegoActivo = mod.iniciar(ctx) || null;
    } catch (e) {
      console.error('[juego] error al iniciar', id, e);
      dialogo({
        titulo: 'Vaya',
        texto: 'Algo se ha atascado. Volvemos al menú.',
        botones: [{ texto: 'Vale', clase: 'btn btn--principal', onPulsar: pantallaHub }],
      });
    }

    if (vozActiva()) setTimeout(() => decir(ficha.instrucciones[nivel]), 350);
  };

  arrancar();
}

/* ------------------------------------------------------------ arranque */

export function iniciarApp() {
  // primer gesto: desbloquea el audio en iOS/Android
  const desbloquear = () => despertar();
  window.addEventListener('pointerdown', desbloquear, { once: true });

  if (perfilActivo()) pantallaHub();
  else pantallaPerfiles();
}
