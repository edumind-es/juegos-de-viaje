/**
 * Colorear libre.
 * Nivel 1: plantillas grandes con pocas zonas y paleta reducida de colores vivos.
 * Nivel 2: plantillas con más detalle, paleta ampliada y herramientas de relleno,
 *          pincel y goma.
 *
 * No hay forma de "hacerlo mal": es una actividad de creación, no de acierto.
 */

import { el, limpiar, boton, botonIcono, confeti, dialogo } from '../../core/ui.js';
import { sonido } from '../../core/audio.js';
import { icono } from '../../core/art.js';
import { plantillasDeNivel } from './plantillas.js';
import { elige } from '../../core/rng.js';

const PALETA_PEQUES = [
  '#d9634a', '#e9b23c', '#7fa650', '#6fa8c7',
  '#9b8bc4', '#e79a94', '#3a342f', '#fffdf9',
];

const PALETA_AMPLIA = [
  '#d9634a', '#b64c36', '#e08a3c', '#e9b23c', '#f2d17a', '#7fa650',
  '#2e7d74', '#a9c97e', '#6fa8c7', '#4d87a7', '#a8d0e6', '#9b8bc4',
  '#e79a94', '#8a5a34', '#3a342f', '#fffdf9',
];

export function iniciar(ctx) {
  const { area, nivel, marco } = ctx;

  const paleta = nivel === 1 ? PALETA_PEQUES : PALETA_AMPLIA;
  const disponibles = plantillasDeNivel(nivel);

  let plantilla = elige(disponibles);
  let color = paleta[0];
  let herramienta = 'relleno'; // relleno | pincel | goma
  let zonasPintadas = 0;

  marco.setMarcador('');

  /* ------------------------------------------------------------- lienzo */

  const lienzo = el('div', { clase: 'colorear__lienzo' });
  const svgCaja = el('div', { clase: 'colorear__svg' });
  const canvas = el('canvas', { clase: 'colorear__canvas' });
  lienzo.append(svgCaja, canvas);

  const ctx2d = canvas.getContext('2d');

  function ajustarCanvas() {
    const r = Math.min(window.devicePixelRatio || 1, 2);
    const ancho = lienzo.clientWidth;
    const alto = lienzo.clientHeight;
    if (!ancho || !alto) return;
    const previo = ctx2d.canvas.width ? document.createElement('canvas') : null;
    if (previo && canvas.width) {
      previo.width = canvas.width;
      previo.height = canvas.height;
      previo.getContext('2d').drawImage(canvas, 0, 0);
    }
    canvas.width = ancho * r;
    canvas.height = alto * r;
    canvas.style.width = ancho + 'px';
    canvas.style.height = alto + 'px';
    ctx2d.setTransform(r, 0, 0, r, 0, 0);
    ctx2d.lineCap = 'round';
    ctx2d.lineJoin = 'round';
    if (previo && previo.width) ctx2d.drawImage(previo, 0, 0, ancho, alto);
  }

  function pintarPlantilla() {
    // los mandalas llevan trazo más fino: sus piezas son pequeñas
    const clase = 'colorear__dibujo' + (plantilla.mandala ? ' colorear__dibujo--mandala' : '');
    svgCaja.innerHTML = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="${clase}">
        <g>${plantilla.svg}</g>
        <g class="colorear__detalles">${plantilla.detalles || ''}</g>
      </svg>`;
    zonasPintadas = 0;
    svgCaja.querySelectorAll('.colorear__region').forEach((region) => {
      region.setAttribute('tabindex', '0');
      region.addEventListener('pointerdown', (e) => {
        if (herramienta !== 'relleno') return;
        e.preventDefault();
        rellenar(region);
      });
      region.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') rellenar(region);
      });
    });
    marco.setInstruccion(`${plantilla.nombre} · elige un color y toca el dibujo`);
  }

  function rellenar(region) {
    region.style.fill = color;
    region.classList.add('colorear__region--pintada');
    setTimeout(() => region.classList.remove('colorear__region--pintada'), 320);
    sonido.toque();
    zonasPintadas++;
  }

  /* ------------------------------------------------------------- pincel */

  let pintando = false;
  let ultimo = null;

  function posicion(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function trazo(a, b) {
    ctx2d.globalCompositeOperation = herramienta === 'goma' ? 'destination-out' : 'source-over';
    ctx2d.strokeStyle = color;
    // trazo más grueso para las peques: el pulso es menos fino a los 5 años
    ctx2d.lineWidth = herramienta === 'goma' ? 30 : nivel === 1 ? 16 : 10;
    ctx2d.beginPath();
    ctx2d.moveTo(a.x, a.y);
    ctx2d.lineTo(b.x, b.y);
    ctx2d.stroke();
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (herramienta === 'relleno') return;
    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);
    pintando = true;
    ultimo = posicion(e);
    trazo(ultimo, { x: ultimo.x + 0.1, y: ultimo.y });
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!pintando) return;
    const p = posicion(e);
    trazo(ultimo, p);
    ultimo = p;
  });

  const soltar = () => {
    pintando = false;
    ultimo = null;
  };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('pointerleave', soltar);

  /* ------------------------------------------------------------- paleta */

  const barraColores = el('div', { clase: 'colorear__paleta' });
  const botonesColor = [];
  paleta.forEach((c) => {
    const b = el('button', {
      clase: 'colorear__color',
      type: 'button',
      'aria-label': 'color',
      'aria-pressed': String(c === color),
      estilo: { background: c },
    });
    b.addEventListener('click', () => {
      color = c;
      botonesColor.forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      sonido.tic();
    });
    botonesColor.push(b);
    barraColores.appendChild(b);
  });

  /* -------------------------------------------------------- herramientas */

  const barraHerramientas = el('div', { clase: 'colorear__herramientas' });

  function botonHerramienta(id, svgIcono, etiqueta) {
    const b = el('button', {
      clase: 'colorear__util',
      type: 'button',
      'aria-label': etiqueta,
      'aria-pressed': String(herramienta === id),
      html: svgIcono,
    });
    b.addEventListener('click', () => {
      herramienta = id;
      barraHerramientas.querySelectorAll('.colorear__util').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      canvas.classList.toggle('colorear__canvas--activo', id !== 'relleno');
      sonido.tic();
    });
    return b;
  }

  // relleno, pincel y goma están disponibles en los dos niveles
  barraHerramientas.append(
    botonHerramienta('relleno', icono.bote(), 'Relleno'),
    botonHerramienta('pincel', icono.lapiz(), 'Pincel'),
    botonHerramienta('goma', icono.goma(), 'Goma')
  );

  function cambiarPlantilla(nueva) {
    plantilla = nueva;
    pintarPlantilla();
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  }

  /** Galería con todos los dibujos del nivel, para que elija ella. */
  function abrirGaleria() {
    const rejilla = el('div', { clase: 'colorear__galeria' });
    const cerrar = () => velo.remove();

    for (const p of disponibles) {
      const b = el('button', {
        clase: 'colorear__miniatura' + (p.id === plantilla.id ? ' colorear__miniatura--actual' : ''),
        type: 'button',
        'aria-label': p.nombre,
      });
      b.appendChild(
        el('span', {
          clase: 'colorear__miniatura-arte',
          html: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g>${p.svg}</g><g class="colorear__detalles">${p.detalles || ''}</g></svg>`,
        })
      );
      b.appendChild(el('span', { clase: 'colorear__miniatura-nombre leible', texto: p.nombre }));
      b.addEventListener('click', () => {
        sonido.toque();
        cerrar();
        cambiarPlantilla(p);
      });
      rejilla.appendChild(b);
    }

    const velo = el('div', { clase: 'velo' });
    const caja = el('div', { clase: 'dialogo dialogo--ancho' });
    caja.appendChild(el('h2', { texto: 'Elige un dibujo' }));
    caja.appendChild(rejilla);
    caja.appendChild(
      el('div', { clase: 'dialogo__botones' }, [
        boton('Seguir con este', { clase: 'btn btn--fantasma', onPulsar: cerrar }),
      ])
    );
    velo.appendChild(caja);
    velo.addEventListener('click', (e) => e.target === velo && cerrar());
    document.body.appendChild(velo);
  }

  barraHerramientas.append(
    botonIcono(icono.reiniciar(), {
      aria: 'Empezar el dibujo de nuevo',
      onPulsar: () => {
        pintarPlantilla();
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      },
    }),
    botonIcono(icono.cambiar(), { aria: 'Elegir otro dibujo', onPulsar: abrirGaleria })
  );

  const btnListo = boton('¡Listo!', {
    clase: 'btn btn--principal colorear__listo',
    onPulsar: () => {
      confeti(90);
      ctx.terminar({ estrellas: 3, texto: '¡Qué dibujo tan bonito!' });
    },
  });

  const panel = el('div', { clase: 'colorear__panel' }, [barraColores, barraHerramientas, btnListo]);
  const disposicion = el('div', { clase: 'colorear__disposicion' }, [lienzo, panel]);
  area.appendChild(disposicion);

  pintarPlantilla();
  requestAnimationFrame(ajustarCanvas);

  const alRedimensionar = () => ajustarCanvas();
  window.addEventListener('resize', alRedimensionar);
  window.addEventListener('orientationchange', alRedimensionar);

  return {
    destruir() {
      window.removeEventListener('resize', alRedimensionar);
      window.removeEventListener('orientationchange', alRedimensionar);
    },
  };
}
