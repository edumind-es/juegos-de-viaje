/** Utilidades de azar y pequeñas ayudas compartidas por los juegos. */

export const azar = (n) => Math.floor(Math.random() * n);

export const entre = (min, max) => min + azar(max - min + 1);

export function elige(lista) {
  return lista[azar(lista.length)];
}

/** Baraja una copia (Fisher-Yates). */
export function baraja(lista) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = azar(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** N elementos distintos al azar. */
export function muestra(lista, n) {
  return baraja(lista).slice(0, n);
}

export const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export const limita = (v, min, max) => Math.max(min, Math.min(max, v));
