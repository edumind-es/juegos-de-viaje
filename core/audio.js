/**
 * Sonido sintetizado con la Web Audio API: cero ficheros de audio, cero red.
 * Timbres suaves tipo marimba/campana — nada estridente ni infantiloide.
 */

import { leer, escribir } from './storage.js';

let ctx = null;
let master = null;
let silencio = leer('sonido.silencio', false);

function motor() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  return ctx;
}

/** iOS/Android exigen un gesto del usuario para arrancar el audio. */
export function despertar() {
  const c = motor();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

/**
 * Una nota con envolvente suave.
 * @param {number} freq  frecuencia en Hz
 * @param {object} opts  {t: retardo, dur, vol, tipo, corte}
 */
function nota(freq, { t = 0, dur = 0.34, vol = 0.3, tipo = 'triangle', corte = 2600 } = {}) {
  const c = motor();
  if (!c || silencio) return;
  const t0 = c.currentTime + t;

  const osc = c.createOscillator();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t0);

  // segundo oscilador una octava arriba, muy bajo: da cuerpo de marimba
  const arm = c.createOscillator();
  arm.type = 'sine';
  arm.frequency.setValueAtTime(freq * 2, t0);
  const gArm = c.createGain();
  gArm.gain.value = 0.16;

  const filtro = c.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.setValueAtTime(corte, t0);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.014);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  osc.connect(filtro);
  arm.connect(gArm).connect(filtro);
  filtro.connect(g).connect(master);

  osc.start(t0);
  arm.start(t0);
  osc.stop(t0 + dur + 0.05);
  arm.stop(t0 + dur + 0.05);
}

// Escala pentatónica mayor: cualquier combinación suena bien junta.
const NOTAS = { do: 523.25, re: 587.33, mi: 659.25, sol: 783.99, la: 880, do2: 1046.5, mi2: 1318.5 };

export const sonido = {
  toque() {
    nota(NOTAS.sol, { dur: 0.12, vol: 0.14, tipo: 'sine', corte: 1800 });
  },
  acierto() {
    nota(NOTAS.do, { dur: 0.3, vol: 0.26 });
    nota(NOTAS.mi, { t: 0.07, dur: 0.32, vol: 0.24 });
    nota(NOTAS.sol, { t: 0.14, dur: 0.42, vol: 0.22 });
  },
  fallo() {
    // dos notas descendentes y apagadas: informa sin castigar
    nota(392, { dur: 0.2, vol: 0.16, tipo: 'sine', corte: 900 });
    nota(329.63, { t: 0.1, dur: 0.3, vol: 0.14, tipo: 'sine', corte: 800 });
  },
  premio() {
    [NOTAS.do, NOTAS.mi, NOTAS.sol, NOTAS.do2, NOTAS.mi2].forEach((f, i) =>
      nota(f, { t: i * 0.1, dur: 0.6, vol: 0.24 })
    );
  },
  medalla() {
    [NOTAS.sol, NOTAS.do2, NOTAS.mi2, NOTAS.sol * 2].forEach((f, i) =>
      nota(f, { t: i * 0.13, dur: 0.9, vol: 0.2, corte: 4200 })
    );
  },
  voltear() {
    nota(NOTAS.la, { dur: 0.1, vol: 0.12, tipo: 'sine', corte: 2200 });
  },
  tic() {
    nota(NOTAS.re, { dur: 0.07, vol: 0.1, tipo: 'sine', corte: 1400 });
  },
};

export const estaSilenciado = () => silencio;

export function alternarSilencio() {
  silencio = !silencio;
  escribir('sonido.silencio', silencio);
  if (!silencio) {
    despertar();
    sonido.toque();
  }
  return silencio;
}
