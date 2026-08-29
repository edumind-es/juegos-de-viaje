/**
 * Estado del modo sin conexión: saber si TODO está guardado en el dispositivo y
 * poder forzar la descarga antes de salir de viaje.
 *
 * Existe porque en una tablet no hay consola donde mirar: la app tiene que poder
 * decir por sí misma si está lista para el modo avión.
 */

const HAY_SW = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

/** Espera a tener un service worker activo con el que hablar. */
async function trabajador(esperaMax = 6000) {
  if (!HAY_SW) return null;
  if (navigator.serviceWorker.controller) return navigator.serviceWorker.controller;
  try {
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((r) => setTimeout(() => r(null), esperaMax)),
    ]);
    return reg?.active || navigator.serviceWorker.controller || null;
  } catch {
    return null;
  }
}

/** Pregunta al service worker y espera su respuesta por un canal privado. */
async function preguntar(mensaje, esperaMax = 25000) {
  const sw = await trabajador();
  if (!sw) return null;
  return new Promise((resolver) => {
    const canal = new MessageChannel();
    const reloj = setTimeout(() => resolver(null), esperaMax);
    canal.port1.onmessage = (e) => {
      clearTimeout(reloj);
      resolver(e.data);
    };
    try {
      sw.postMessage(mensaje, [canal.port2]);
    } catch {
      clearTimeout(reloj);
      resolver(null);
    }
  });
}

/**
 * @returns {Promise<{soportado:boolean, listo:boolean, faltan:number, total:number}>}
 */
export async function estadoOffline() {
  if (!HAY_SW) return { soportado: false, listo: false, faltan: 0, total: 0 };
  const r = await preguntar({ tipo: 'estado' }, 8000);
  if (!r) return { soportado: true, listo: false, faltan: null, total: 0, sinRespuesta: true };
  return { soportado: true, listo: r.listo, faltan: r.faltan.length, total: r.total };
}

/**
 * Descarga todo lo que falte. `alProgresar({hechos, total})` se llama mientras avanza.
 */
export async function prepararOffline(alProgresar) {
  if (!HAY_SW) return { soportado: false, listo: false };

  const escucha = (e) => {
    if (e.data?.tipo === 'precache-progreso') alProgresar?.(e.data);
  };
  navigator.serviceWorker.addEventListener('message', escucha);
  try {
    const r = await preguntar({ tipo: 'preparar' }, 120000);
    if (!r) return { soportado: true, listo: false, faltan: null };
    return { soportado: true, listo: r.listo, faltan: r.faltan.length, total: r.total };
  } finally {
    navigator.serviceWorker.removeEventListener('message', escucha);
  }
}

/** ¿La app se está ejecutando instalada (no dentro del navegador)? */
export function esAppInstalada() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}
