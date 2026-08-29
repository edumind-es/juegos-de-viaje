/**
 * Persistencia local. Todo se queda en el dispositivo: nunca sale un dato de aquí.
 * Si localStorage no está disponible (modo privado antiguo), se degrada a memoria
 * para que la app siga funcionando durante la sesión.
 */

const PREFIJO = 'etg.'; // edumind travel games
const memoria = new Map();

let disponible = (() => {
  try {
    const k = PREFIJO + '__test';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

export function leer(clave, porDefecto = null) {
  try {
    const bruto = disponible ? localStorage.getItem(PREFIJO + clave) : memoria.get(clave);
    if (bruto == null) return porDefecto;
    return JSON.parse(bruto);
  } catch {
    return porDefecto;
  }
}

export function escribir(clave, valor) {
  const bruto = JSON.stringify(valor);
  try {
    if (disponible) localStorage.setItem(PREFIJO + clave, bruto);
    else memoria.set(clave, bruto);
  } catch {
    // cuota llena: pasamos a memoria para no romper la partida en curso
    disponible = false;
    memoria.set(clave, bruto);
  }
  return valor;
}

export function borrar(clave) {
  try {
    if (disponible) localStorage.removeItem(PREFIJO + clave);
  } catch {
    /* sin efecto */
  }
  memoria.delete(clave);
}

/** Fecha local en formato AAAA-MM-DD, para rachas diarias. */
export function hoy() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Días de diferencia entre dos claves AAAA-MM-DD. */
export function diasEntre(a, b) {
  const ms = new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00');
  return Math.round(ms / 86400000);
}
