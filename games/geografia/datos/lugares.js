/**
 * Océanos, mares y relieve, descritos en coordenadas geográficas (longitud y
 * latitud) para poder leerlos y corregirlos a mano. Se proyectan al mapa del
 * mundo con la misma fórmula equirectangular que usó el conversor.
 */

import { VISTA } from './mundo.js';

/** Convierte longitud/latitud a coordenadas del mapa del mundo. */
export function proyectar(lon, lat) {
  const x = ((lon - VISTA.lon0) / (VISTA.lon1 - VISTA.lon0)) * VISTA.w;
  const y = ((VISTA.lat0 - lat) / (VISTA.lat0 - VISTA.lat1)) * VISTA.h;
  return [x, y];
}

/** Rectángulo geográfico → path SVG. */
export function zonaPath(z) {
  const [x0, y0] = proyectar(z[0], z[3]);
  const [x1, y1] = proyectar(z[2], z[1]);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}H${x1.toFixed(1)}V${y1.toFixed(1)}H${x0.toFixed(1)}Z`;
}

/* Cada masa de agua se describe con una o varias zonas [lonMin, latMin, lonMax, latMax] */

export const OCEANOS = [
  {
    n: 'Océano Pacífico',
    zonas: [[-180, -50, -100, 55], [130, -45, 180, 55]],
  },
  {
    n: 'Océano Atlántico',
    zonas: [[-65, -45, -12, 12], [-55, 15, -20, 55]],
  },
  { n: 'Océano Índico', zonas: [[52, -40, 100, 12]] },
  { n: 'Océano Ártico', zonas: [[-160, 76, 160, 84]] },
  { n: 'Océano Antártico', zonas: [[-170, -70, 170, -58]] },
];

export const MARES = [
  { n: 'Mar Mediterráneo', zonas: [[-2, 33, 33, 43]] },
  { n: 'Mar Caribe', zonas: [[-84, 10, -62, 20]] },
  { n: 'Mar Rojo', zonas: [[33, 14, 43, 27]] },
  { n: 'Mar Negro', zonas: [[28, 41, 41, 46.5]] },
  { n: 'Mar del Norte', zonas: [[-2, 52, 8, 60]] },
  { n: 'Mar Báltico', zonas: [[13, 54, 27, 65]] },
  { n: 'Mar Cantábrico', zonas: [[-9, 43.5, -1.8, 47]] },
  { n: 'Mar Caspio', zonas: [[47, 37, 54, 46]] },
  { n: 'Mar Arábigo', zonas: [[55, 5, 74, 24]] },
  { n: 'Golfo de Bengala', zonas: [[80, 5, 94, 21]] },
];

/**
 * Relieve: sistemas montañosos principales, con el punto donde se marcan en el
 * mapa y el continente al que pertenecen.
 */
export const RELIEVE = [
  { n: 'Himalaya', c: 'Asia', lon: 86, lat: 29, alt: 'Everest, 8.849 m' },
  { n: 'Cordillera de los Andes', c: 'América del Sur', lon: -70, lat: -22, alt: 'Aconcagua, 6.961 m' },
  { n: 'Montañas Rocosas', c: 'América del Norte', lon: -112, lat: 44, alt: 'Elbert, 4.401 m' },
  { n: 'Alpes', c: 'Europa', lon: 10.5, lat: 46.5, alt: 'Mont Blanc, 4.808 m' },
  { n: 'Pirineos', c: 'Europa', lon: 0.5, lat: 42.7, alt: 'Aneto, 3.404 m' },
  { n: 'Cordillera del Atlas', c: 'África', lon: -5, lat: 32, alt: 'Toubkal, 4.167 m' },
  { n: 'Montes Urales', c: 'Europa', lon: 59, lat: 60, alt: 'Narodnaya, 1.895 m' },
  { n: 'Cáucaso', c: 'Asia', lon: 44, lat: 43, alt: 'Elbrús, 5.642 m' },
  { n: 'Montes Apalaches', c: 'América del Norte', lon: -80, lat: 37, alt: 'Mitchell, 2.037 m' },
  { n: 'Gran Cordillera Divisoria', c: 'Oceanía', lon: 148, lat: -30, alt: 'Kosciuszko, 2.228 m' },
  { n: 'Kilimanjaro', c: 'África', lon: 37.4, lat: -3.1, alt: '5.895 m' },
  { n: 'Montes Escandinavos', c: 'Europa', lon: 13, lat: 62, alt: 'Galdhøpiggen, 2.469 m' },
  { n: 'Sierra Nevada', c: 'Europa', lon: -3.3, lat: 37.1, alt: 'Mulhacén, 3.479 m' },
  { n: 'Sistema Central', c: 'Europa', lon: -5, lat: 40.5, alt: 'Almanzor, 2.592 m' },
];
