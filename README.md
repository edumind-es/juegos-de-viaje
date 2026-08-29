# Juegos de viaje · EDUmind

PWA educativa para dos jugadoras (5 y 8 años), pensada para usarse **sin conexión**
durante un viaje, instalada en una tablet Android o iPad.

- HTML + CSS + JavaScript vanilla (módulos ES). **Sin build, sin npm, sin frameworks.**
- Funciona al 100 % offline tras la primera carga, incluida la recarga de página.
- Sin backend, sin analítica, sin CDNs. Las fuentes están autoalojadas y los
  sonidos se sintetizan con la Web Audio API (no hay ni un fichero de audio).
- Todos los datos (perfiles, estrellas, medallas, panel de check-in) se guardan
  **solo en el dispositivo**, con `localStorage`. Nunca sale nada del aparato.

---

## Desplegar

Basta con servir la carpeta como sitio estático. No hay nada que compilar.

Requisitos del servidor: **solo HTTPS y ficheros estáticos**. El service worker y la
instalación como PWA no funcionan por HTTP salvo en `localhost`. Los ficheros deben ser
legibles por el usuario del servidor web (`chmod -R a+rX` sobre la carpeta).

Con nginx, un bloque `server` que apunte su `root` a esta carpeta y sirva `index.html`
es suficiente. Conviene además: no cachear `service-worker.js` (`Cache-Control: no-cache`),
cachear con holgura `assets/`, y servir `manifest.json` como `application/manifest+json`.

La configuración concreta de producción no se publica; ver [OPEN_SOURCE_RELEASE.md](OPEN_SOURCE_RELEASE.md).

### Probar en local sin servidor web

```bash
cd juegos-de-viaje
python3 -m http.server 8080
# abrir http://localhost:8080
```

Abrir `index.html` con doble clic **no** funciona: los módulos ES y el service
worker necesitan un origen `http(s)://`.

---

## Instalar en la tablet

**Android (Chrome):** abrir `https://games.edumind.es` → aparece el botón
"Instalar en la tablet" en la pantalla de perfiles, o menú ⋮ → *Instalar aplicación*.

**iPad / iPhone: instalar desde Safari**, no desde Chrome. Abrir la web en Safari →
botón *Compartir* → *Añadir a pantalla de inicio*. En iOS todos los navegadores usan
WebKit, pero el soporte de service workers en apps instaladas está garantizado por la
vía de Safari; con otros navegadores puede quedarse en un simple acceso directo.

### El paso que no se puede saltar

En iOS, **la app instalada tiene su propio almacenamiento, separado del navegador**.
Todo lo que se descargó navegando por la web *no* está dentro de la app del icono.
Por eso hay que:

1. Abrir la app **desde su icono** (no desde el navegador), **con wifi**.
2. Mirar el recuadro inferior de la pantalla de perfiles:
   - `✓ Lista para el modo avión` → ya se puede desconectar.
   - Si dice que faltan archivos, pulsar **Preparar para el viaje** y esperar la barra.
3. Entonces sí, activar el modo avión.

Ese mismo recuadro está siempre disponible dentro de la app en el botón de la nube
(barra superior del hub). Es la forma de comprobar en la propia tablet, sin cables ni
consola, si el modo sin conexión está realmente listo.

---

## Actualizar la app

1. Editar los ficheros que haga falta.
2. Subir la versión en `service-worker.js`:

```js
const VERSION = 'v1.0.1';   // ← cambiar SIEMPRE al desplegar cambios
```

Sin ese cambio, las tablets seguirán usando la caché antigua indefinidamente.
Al actualizar, el service worker instala la caché nueva, borra las viejas y la
app queda lista al siguiente arranque.

3. Si se añade un fichero nuevo (un juego, una plantilla, un icono), **añadirlo
   también a la lista `ARCHIVOS`** del service worker, o no estará disponible sin red.

---

## Estructura

```
edumind_travel_games/
├── index.html              punto de entrada
├── manifest.json           manifiesto PWA (iconos 192/512 + maskable)
├── service-worker.js       caché offline versionada (cache-first)
├── assets/
│   ├── css/base.css        sistema de diseño (color, tipografía, botones)
│   ├── css/hub.css         perfiles, hub y pantalla de progreso
│   ├── fonts/              Fraunces + Outfit autoalojadas (woff2, subset latino)
│   └── icons/              iconos de la app generados a medida
├── core/
│   ├── app.js              pantallas de perfil, hub, progreso y arranque de juegos
│   ├── router.js           catálogo de juegos y carga dinámica de módulos
│   ├── profiles.js         los dos perfiles y el nivel según la edad
│   ├── progress.js         estrellas, partidas, racha y medallas
│   ├── storage.js          localStorage con degradación elegante
│   ├── ui.js               marco de juego, diálogos, resultados, feedback
│   ├── art.js              toda la ilustración SVG (avatares, iconos, objetos)
│   ├── audio.js            sonidos sintetizados + silenciador
│   ├── speech.js           lectura en voz alta opcional (Web Speech API)
│   ├── confetti.js         celebraciones
│   └── rng.js              utilidades de azar
├── games/<juego>/game.js   un módulo por minijuego (+ su style.css)
└── deploy/generar_mapas.py  genera los mapas SVG desde Natural Earth
```

---

## Los juegos y su dificultad

El nivel **no se elige a mano**: lo determina la edad del perfil activo
(hasta 6 años → nivel 1; 7 en adelante → nivel 2).

| Juego | Nivel 1 (peques) | Nivel 2 (mayores) |
|---|---|---|
| Colorear | 9 láminas grandes, paleta de 8 colores, relleno + pincel grueso + goma | 7 láminas: 3 ilustradas con detalle y 4 mandalas de 38 a 66 zonas, 16 colores |
| Colores | identificar un color entre 4, con la palabra EN MAYÚSCULAS | mezclas y tonos, 6 opciones |
| Reacción | una figura, ritmo lento, sin penalización | distractores, velocidad progresiva, fallar resta |
| Sumas y restas → "Sumas, restas y tablas" en nivel 2 | hasta 10 con objetos contables | hasta 100 con llevadas **y multiplicaciones de una cifra** (tablas del 2 al 9) |
| Secuencias | patrones A-B-A-B de formas y colores | series numéricas y patrones A-B-C más largos |
| Agrupamientos | clasificar por un criterio | dos criterios combinados (forma + color) |
| Memoria | 8 cartas (4 parejas) | 16 cartas (8 parejas) |
| Geografía | 4 modos: banderas conocidas (3 opciones), continentes, océanos y comunidades | 11 modos: + países del mundo y de Europa, provincias, bandera→lugar, montañas, ríos por continente y mares |
| Check-in de viaje | panel de 12 cosas que ver | tablero 10×10 con 100 cosas y líneas completas |

El panel de check-in **se guarda entre sesiones**: dura todo el viaje hasta que
se pulse "Empezar de nuevo".

---

## Decisiones de diseño para peques

- **Lectura en mayúsculas para el perfil de 5 años.** A esa edad aún no se leen bien
  las minúsculas, así que con el perfil de nivel 1 todo el texto que hay que *leer*
  (instrucciones, botones, nombres de juego, etiquetas) se muestra en MAYÚSCULAS.
  Se activa solo con el atributo `data-lectura="mayus"` en `<html>` desde
  [core/app.js](core/app.js); los estilos están al final de `assets/css/base.css`.
  Para que una etiqueta nueva de un juego lo respete, basta con añadirle la clase
  `leible`. Los números no se ven afectados.
- Los mandalas de nivel 2 no son dibujos fijos: se generan por geometría en
  `games/colorear/plantillas.js` con la función `mandala({sectores, anillos})`.
  Añadir uno nuevo es describir sus anillos (sector, pétalo, rombo o círculo).
- Sin anuncios, sin compras, sin cuentas, sin nada que salga del dispositivo.
- Sin "game over" duro: al terminar siempre se ofrece repetir, y en nivel 1 un
  fallo permite reintentar la misma pregunta en lugar de perder el turno.
- La pantalla de progreso muestra logros propios, sin comparar unos perfiles con otros.
- Sonido silenciable desde el hub con un solo botón; lectura en voz alta
  opcional (si el dispositivo no tiene voz en español, no pasa nada: calla).
- Objetivo táctil mínimo de 56 px y nada que dependa de `hover`.
- Sin modo oscuro: la paleta clara es parte de la identidad.

---

## Editar los perfiles

En la pantalla inicial, botón **Editar perfiles**: nombre, edad (que decide la
dificultad), cara y color. Vienen configurados como *Sol* (5 años) y *Luna*
(8 años); cámbialos por los nombres de quienes vayan a jugar.

---

## Los mapas de Geografía

Los mapas **no se descargan en ejecución**: son paths SVG ya proyectados y
simplificados, guardados como módulos JS en `games/geografia/datos/`.

| Fichero | Contenido | Proyección |
|---|---|---|
| `mundo.js` | 176 países con su continente, y 33 ríos principales | equirectangular |
| `europa.js` | 137 países, marcando cuáles son europeos | Mercator |
| `espana.js` | 52 provincias con su comunidad; Canarias en recuadro | Mercator |
| `lugares.js` | océanos, mares y relieve, en longitud/latitud editables a mano | — |

Se generaron con [deploy/generar_mapas.py](deploy/generar_mapas.py) a partir de
**Natural Earth** (dominio público). Ese script solo hay que volver a ejecutarlo
si se cambia el encuadre o el nivel de detalle; lleva las instrucciones dentro.

Las banderas (99) están **dibujadas por código** en `games/geografia/banderas.js`
con primitivas geométricas (franjas, cruces nórdicas, estrellas): ni imágenes ni
emoji. Añadir una es escribir una línea en ese diccionario.

## Créditos

EDUmind — Luis Vilela Acuña.
Tipografías: [Fraunces](https://fonts.google.com/specimen/Fraunces) y
[Outfit](https://fonts.google.com/specimen/Outfit), ambas bajo SIL Open Font License 1.1.
Datos geográficos: [Natural Earth](https://www.naturalearthdata.com/), dominio público.

---

## Colaborar

Se puede colaborar **sin programar**: contar cómo ha ido con tus peques o en tu aula, reportar un fallo, revisar los textos o traducir. Todo el proyecto está en español. Empieza por [CONTRIBUTING.md](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

¿Un fallo de seguridad? No abras un issue público: ver [SECURITY.md](SECURITY.md).

Este repositorio es una *release saneada*: no incluye la configuración de despliegue de producción. Ver [OPEN_SOURCE_RELEASE.md](OPEN_SOURCE_RELEASE.md).

## Licencia

Licencia doble **AGPL-3.0-or-later** *o* **EUPL-1.2**, a elección de quien la reutilice. Ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

Las tipografías Fraunces y Outfit se distribuyen bajo SIL Open Font License 1.1. Los mapas derivan de [Natural Earth](https://www.naturalearthdata.com) (dominio público).

EDUmind® es marca registrada en España (OEPM). El código es libre; la marca y los logotipos no se ceden con él — ver [TRADEMARKS.md](TRADEMARKS.md).

Por **Luis Vilela Acuña** — maestro de Educación Física.
