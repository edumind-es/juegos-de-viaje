# Créditos y material ajeno

«Juegos de viaje» es obra de **Luis Vilela Acuña · EDUmind®** y se publica con doble
licencia AGPL-3.0-or-later / EUPL-1.2 (ver [LICENSE](LICENSE)). Este fichero recoge
todo el material de terceros que va dentro de la aplicación y en qué condiciones.

## Tipografías

| Fuente | Autoría | Origen | Licencia |
|---|---|---|---|
| Fraunces (600 y 700, subconjunto latino) | The Fraunces Project Authors, 2020 | [Google Fonts](https://fonts.google.com/specimen/Fraunces) · [GitHub](https://github.com/undercasetype/Fraunces) | SIL Open Font License 1.1 |
| Outfit (400, 600 y 700, subconjunto latino) | The Outfit Project Authors, 2021 | [Google Fonts](https://fonts.google.com/specimen/Outfit) · [GitHub](https://github.com/Outfitio/Outfit-Fonts) | SIL Open Font License 1.1 |

Los ficheros `.woff2` están en `assets/fonts/` y se sirven desde el propio sitio (no se
carga nada de Google Fonts en ejecución). El texto de la licencia acompaña a las fuentes
en [assets/fonts/OFL.txt](assets/fonts/OFL.txt).

## Datos geográficos

- **Natural Earth** (naturalearthdata.com), dominio público. Los mapas de
  `games/geografia/datos/mundo.js`, `europa.js` y `espana.js` son paths SVG derivados de
  los GeoJSON de Natural Earth con el script [deploy/generar_mapas.py](deploy/generar_mapas.py)
  (proyección, simplificación y adscripción de continentes y comunidades son propias).
- Océanos, mares y relieve (`games/geografia/datos/lugares.js`): coordenadas y altitudes
  escritas a mano por el autor a partir de fuentes de referencia generales.
- Banderas (`games/geografia/banderas.js`): dibujadas por código con primitivas geométricas.
  Los diseños de las banderas de Estado no están sujetos a derechos de autor; las versiones
  aquí incluidas están simplificadas y no pretenden ser heráldicamente exactas.

## Todo lo demás es propio

- Iconos de la app, avatares, objetos, formas, medallas y láminas para colorear: SVG
  generados por código en `core/art.js` y `games/colorear/plantillas.js`.
- Sonidos: sintetizados en el dispositivo con la Web Audio API (`core/audio.js`); no hay
  ningún fichero de audio.
- Lectura en voz alta: Web Speech API del propio dispositivo; no se usa ningún servicio externo.
- No se usan librerías ni frameworks de terceros: HTML, CSS y JavaScript sin dependencias.

## Marca

EDUmind® es marca registrada en España (OEPM). La marca y los logotipos no se ceden con
la licencia del código; ver [TRADEMARKS.md](TRADEMARKS.md).
