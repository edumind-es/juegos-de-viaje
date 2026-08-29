/**
 * Arranque de la aplicación.
 *
 * Vive en un fichero propio, y no como <script> inline en index.html, para que
 * la Content-Security-Policy pueda ser `script-src 'self'` sin hashes: un hash
 * habría que recalcularlo a mano cada vez que se tocase el arranque.
 */

import { iniciarApp } from './core/app.js';

iniciarApp();

// Registro del service worker: sin él no hay modo sin conexión.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js', { scope: './' })
      .catch((e) => console.warn('[sw] no registrado', e));
  });
}
