/**
 * Perfiles de las dos jugadoras. Sin login ni contraseñas: se elige tocando una cara.
 * La edad del perfil activo decide el nivel de dificultad de TODOS los juegos.
 */

import { leer, escribir } from './storage.js';
import { PALETA } from './art.js';

const CLAVE = 'perfiles';
const CLAVE_ACTIVO = 'perfil.activo';

/** Nombres y edades son editables desde la propia app (botón "Editar"). */
const POR_DEFECTO = [
  { id: 'p1', nombre: 'Sol', edad: 5, avatar: 0, color: PALETA.mostaza },
  { id: 'p2', nombre: 'Luna', edad: 8, avatar: 1, color: PALETA.azul },
];

export const COLORES_PERFIL = [
  PALETA.mostaza,
  PALETA.azul,
  PALETA.terracota,
  PALETA.teal,
  PALETA.lila,
  PALETA.rosa,
];

export function perfiles() {
  const guardados = leer(CLAVE, null);
  if (!Array.isArray(guardados) || guardados.length !== 2) {
    return escribir(CLAVE, POR_DEFECTO.map((p) => ({ ...p })));
  }
  return guardados;
}

export function guardarPerfil(id, cambios) {
  const lista = perfiles().map((p) => (p.id === id ? { ...p, ...cambios } : p));
  return escribir(CLAVE, lista);
}

export function perfilActivoId() {
  return leer(CLAVE_ACTIVO, null);
}

export function activar(id) {
  escribir(CLAVE_ACTIVO, id);
  return perfilActivo();
}

export function perfilActivo() {
  const id = perfilActivoId();
  return perfiles().find((p) => p.id === id) || null;
}

export function salirDePerfil() {
  escribir(CLAVE_ACTIVO, null);
}

/**
 * Nivel de dificultad derivado de la edad. 1 = peques (hasta 6), 2 = mayores (7+).
 * No hay selector manual de nivel en ninguna pantalla: es automático.
 */
export function nivelDe(perfil) {
  return perfil && perfil.edad >= 7 ? 2 : 1;
}
