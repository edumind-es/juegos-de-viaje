/**
 * Lectura en voz alta de las instrucciones (Web Speech API).
 * Es opcional: si el dispositivo no la soporta, falla en silencio sin romper nada.
 */

import { leer, escribir } from './storage.js';

const soportada = typeof window !== 'undefined' && 'speechSynthesis' in window;
let activa = leer('voz.activa', false);
let vozEs = null;

function buscarVoz() {
  if (!soportada) return null;
  if (vozEs) return vozEs;
  const voces = speechSynthesis.getVoices() || [];
  vozEs =
    voces.find((v) => /^es[-_]ES/i.test(v.lang)) ||
    voces.find((v) => /^es/i.test(v.lang)) ||
    null;
  return vozEs;
}

if (soportada) {
  // el catálogo de voces llega de forma asíncrona en algunos navegadores
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    vozEs = null;
    buscarVoz();
  });
  buscarVoz();
}

export const vozDisponible = () => soportada;
export const vozActiva = () => activa && soportada;

export function alternarVoz() {
  activa = !activa;
  escribir('voz.activa', activa);
  if (!activa) callar();
  return activa;
}

/** Lee un texto. `forzar` la usa el botón del altavoz aunque la voz esté apagada. */
export function decir(texto, forzar = false) {
  if (!soportada || !texto) return;
  if (!activa && !forzar) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES';
    u.rate = 0.92;
    u.pitch = 1.05;
    const v = buscarVoz();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch {
    /* fallback silencioso */
  }
}

export function callar() {
  if (soportada) {
    try {
      speechSynthesis.cancel();
    } catch {
      /* nada */
    }
  }
}
