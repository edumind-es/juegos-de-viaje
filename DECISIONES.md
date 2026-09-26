# Decisiones de diseño y funcionamiento

> Registro redactado a posteriori el 2026-09-26, a partir del código y de los comentarios
> que ya había en él, para dejar por escrito cómo funciona el recurso y por qué. Las
> decisiones nuevas se añaden al final con su fecha.

## Qué es y cómo funciona

- PWA en HTML, CSS y JavaScript (módulos ES) **sin compilación, sin npm y sin frameworks**.
  Se sirve como carpeta estática sobre HTTPS y no hay nada que construir.
- Nueve minijuegos para dos perfiles (por defecto «Sol», 5 años, y «Luna», 8 años). El
  nivel no se elige: lo fija la edad del perfil (hasta 6 años nivel 1; 7 o más nivel 2).
- **Local-first y sin conexión**: un service worker cache-first guarda los ~55 ficheros de
  la app en la primera visita y desde entonces funciona entera en modo avión. Para publicar
  una versión nueva se sube `VERSION` en `service-worker.js`.

## Datos y privacidad

- **Sin cuentas, sin servidor, sin analítica.** No hay backend ni base de datos. La app
  no hace ninguna petición de red en ejecución salvo descargar sus propios ficheros; la
  CSP de producción (`connect-src 'self'`) y el service worker lo impiden técnicamente.
- Lo único que se guarda es `localStorage` del dispositivo, con prefijo `etg.`: los dos
  perfiles (nombre de hasta 14 caracteres, edad, avatar, color), el perfil activo, el
  progreso de cada perfil (estrellas, partidas, racha, medallas), el panel de check-in y
  la preferencia de voz. Nada de eso sale del aparato ni se puede exportar. Se borra
  desde «Editar perfiles» o limpiando los datos del sitio en el navegador.
- Las tipografías van autoalojadas (nada de Google Fonts en ejecución) y los sonidos se
  sintetizan con Web Audio, para que no haya ninguna carga externa.
- El sitio público está detrás de Cloudflare como capa de entrega; eso desaparece si se
  sirve la carpeta desde cualquier otro servidor.

## Decisiones pedagógicas (ver también README, «Decisiones de diseño para peques»)

- Lectura en MAYÚSCULAS para el perfil de nivel 1, porque a los 5 años se leen mejor.
- Sin «game over» duro: siempre se ofrece repetir; en nivel 1 un fallo permite reintentar.
- Progreso propio de cada perfil, sin comparar perfiles entre sí.
- Objetivo táctil mínimo de 56 px, nada que dependa de `hover`, sonido silenciable y
  lectura en voz alta opcional.
- Tocar-y-soltar en lugar de arrastrar (Agrupamientos), porque arrastrar falla en tablets
  con manos pequeñas.

## Contenido geográfico

- Mapas derivados de Natural Earth y guardados como paths SVG en el repo: no se descargan
  en ejecución. Se regeneran con `deploy/generar_mapas.py` solo si cambia el encuadre.
- Provincias con su **denominación oficial** (A Coruña, Ourense, Girona, Lleida, Gipuzkoa,
  Bizkaia, Illes Balears). El generador aplica el mismo diccionario.
- **Ceuta y Melilla** se dibujan en el mapa pero no se preguntan en «Comunidades» ni en
  «Provincias»: son ciudades autónomas, no comunidades ni provincias (2026-09-26).
- **Kosovo** sigue apareciendo como país preguntable en «Países de Europa», tal y como lo
  trae Natural Earth. España no lo reconoce como Estado; se deja así de momento y queda
  anotado para que el docente decida (2026-09-26).
- Las banderas se dibujan por código y están simplificadas a propósito: buscan ser
  reconocibles en una tablet, no heráldicamente exactas.

## Accesibilidad (2026-09-26)

- Los mapas de Geografía se juegan también con teclado: cada zona tocable es un
  `role="button"` con `tabindex` y `aria-label`, activable con Enter o Espacio, con la
  misma lógica que ya tenían las regiones de Colorear.
- Los diálogos modales mueven el foco dentro al abrirse, lo retienen y lo devuelven al
  cerrarse (`atraparFoco` en `core/ui.js`).
- No se bloquea el zoom del navegador.

## Licencia y autoría

- Doble licencia **AGPL-3.0-or-later / EUPL-1.2** a elección de quien reutilice. Autoría
  única: Luis Vilela Acuña · EDUmind®. La marca EDUmind® no se cede con el código.
- La autoría, la licencia y el enlace al repositorio se muestran dentro de la app en el
  diálogo «Acerca de» de la pantalla de perfiles (2026-09-26).
- El repositorio público es una *release saneada*: no incluye la configuración de nginx
  de producción (ver OPEN_SOURCE_RELEASE.md).
