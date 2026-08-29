/**
 * Service worker de "Juegos de viaje".
 * Estrategia: cache-first absoluto. Tras la primera visita, la app funciona
 * entera sin red (incluida la recarga de página y la navegación entre juegos).
 *
 * Para publicar una versión nueva basta con subir VERSION: el SW instalará la
 * caché nueva, borrará las antiguas y el modo sin conexión seguirá intacto.
 */

const VERSION = 'v1.4.0';
const CACHE = `etg-${VERSION}`;

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',

  './assets/css/base.css',
  './assets/css/hub.css',

  './assets/fonts/fonts.css',
  './assets/fonts/fraunces-600-latin.woff2',
  './assets/fonts/fraunces-700-latin.woff2',
  './assets/fonts/outfit-400-latin.woff2',
  './assets/fonts/outfit-600-latin.woff2',
  './assets/fonts/outfit-700-latin.woff2',

  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon-180.png',
  './assets/icons/favicon-32.png',

  './boot.js',
  './core/app.js',
  './core/art.js',
  './core/audio.js',
  './core/confetti.js',
  './core/offline.js',
  './core/profiles.js',
  './core/progress.js',
  './core/rng.js',
  './core/router.js',
  './core/speech.js',
  './core/storage.js',
  './core/ui.js',

  './games/agrupamientos/game.js',
  './games/agrupamientos/style.css',
  './games/checkin/game.js',
  './games/checkin/style.css',
  './games/colorear/game.js',
  './games/colorear/plantillas.js',
  './games/colorear/style.css',
  './games/colores/game.js',
  './games/colores/style.css',
  './games/geografia/game.js',
  './games/geografia/style.css',
  './games/geografia/banderas.js',
  './games/geografia/datos/mundo.js',
  './games/geografia/datos/europa.js',
  './games/geografia/datos/espana.js',
  './games/geografia/datos/lugares.js',
  './games/memoria/game.js',
  './games/memoria/style.css',
  './games/reaccion/game.js',
  './games/reaccion/style.css',
  './games/secuencias/game.js',
  './games/secuencias/style.css',
  './games/sumas/game.js',
  './games/sumas/style.css',
];

/**
 * Las respuestas del servidor llevan `Vary: Accept-Encoding`. Sin ignoreVary,
 * un cambio mínimo de cabeceras entre la petición que guardó el fichero y la que
 * lo pide después haría fallar el match — y el juego intentaría ir a la red.
 */
const OPCIONES_MATCH = { ignoreSearch: true, ignoreVary: true };

async function avisar(mensaje) {
  const clientes = await self.clients.matchAll({ includeUncontrolled: true });
  for (const c of clientes) c.postMessage(mensaje);
}

/** Descarga y guarda un fichero. Devuelve true si quedó en la caché. */
async function guardar(cache, url) {
  try {
    const respuesta = await fetch(new Request(url, { cache: 'reload' }));
    if (!respuesta || !respuesta.ok) return false;
    await cache.put(url, respuesta.clone());
    return true;
  } catch {
    return false;
  }
}

/** Lista de archivos que todavía NO están guardados. */
async function loQueFalta(cache) {
  const faltan = [];
  for (const url of ARCHIVOS) {
    const hay = await cache.match(url, OPCIONES_MATCH);
    if (!hay) faltan.push(url);
  }
  return faltan;
}

/**
 * Precachea en tandas pequeñas (iOS se atraganta con 47 peticiones a la vez),
 * reintenta lo que falle y va informando del progreso a la app.
 */
async function precachear({ avisando = false } = {}) {
  const cache = await caches.open(CACHE);
  let pendientes = await loQueFalta(cache);
  const total = pendientes.length;
  let hechos = 0;

  for (let intento = 0; intento < 3 && pendientes.length; intento++) {
    const fallidos = [];
    for (let i = 0; i < pendientes.length; i += 5) {
      const tanda = pendientes.slice(i, i + 5);
      const resultados = await Promise.all(tanda.map((url) => guardar(cache, url)));
      resultados.forEach((ok, j) => (ok ? hechos++ : fallidos.push(tanda[j])));
      if (avisando) await avisar({ tipo: 'precache-progreso', hechos, total });
    }
    pendientes = fallidos;
  }

  if (pendientes.length) console.warn('[sw] sin guardar:', pendientes);
  return pendientes;
}

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      await precachear();
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const nombres = await caches.keys();
      await Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
      // segunda pasada: si la instalación quedó a medias (red mala, app cerrada
      // demasiado pronto), aquí se completa lo que falte.
      const pendientes = await precachear();
      await avisar({ tipo: 'precache-fin', faltan: pendientes.length });
    })()
  );
});

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // no hay recursos externos, pero por si acaso

  evento.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);

      const enCache = await cache.match(req, OPCIONES_MATCH);
      if (enCache) return enCache;

      try {
        const respuesta = await fetch(req);
        if (respuesta && respuesta.ok && respuesta.type === 'basic') {
          cache.put(req, respuesta.clone());
        }
        return respuesta;
      } catch {
        // sin red: cualquier navegación cae en la portada ya cacheada
        if (req.mode === 'navigate') {
          const portada = (await cache.match('./index.html', OPCIONES_MATCH)) || (await cache.match('./', OPCIONES_MATCH));
          if (portada) return portada;
        }
        return new Response('Sin conexión', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    })()
  );
});

/**
 * Canal con la app: permite consultar si todo está guardado y forzar la
 * preparación para el viaje desde la propia pantalla, en el dispositivo.
 */
self.addEventListener('message', async (evento) => {
  const datos = evento.data;
  const responder = (respuesta) => evento.ports?.[0]?.postMessage(respuesta);

  if (datos === 'saltar-espera') return self.skipWaiting();

  if (datos?.tipo === 'estado') {
    const cache = await caches.open(CACHE);
    const faltan = await loQueFalta(cache);
    return responder({ version: VERSION, total: ARCHIVOS.length, faltan, listo: faltan.length === 0 });
  }

  if (datos?.tipo === 'preparar') {
    const faltan = await precachear({ avisando: true });
    return responder({ version: VERSION, total: ARCHIVOS.length, faltan, listo: faltan.length === 0 });
  }
});
