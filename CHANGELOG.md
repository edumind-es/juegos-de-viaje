# Registro de cambios

Formato libre, una entrada por versión publicada. La versión es la de `VERSION` en
`service-worker.js`, que es lo que hace que las tablets recojan la actualización.

## v1.5.0 — 2026-09-26

Corrección tras la evaluación VCER del 2026-09-25.

### Contenido
- Bandera de Tanzania: la banda negra va del asta (abajo) al batiente (arriba) y la orla
  amarilla ya no está oculta.
- Provincias con su denominación oficial: A Coruña, Ourense, Girona, Lleida, Gipuzkoa,
  Bizkaia e Illes Balears (también en el generador de mapas).
- Ceuta y Melilla se siguen dibujando pero no se preguntan como comunidad ni provincia.
- Kosovo se deja como está; decisión anotada en DECISIONES.md.

### Accesibilidad
- Los mapas de Geografía se juegan con teclado (tabulador + Enter/Espacio) y cada zona
  tiene nombre accesible.
- Los diálogos reciben el foco al abrirse, lo retienen y lo devuelven al cerrar.
- Nombre accesible en las opciones de Secuencias.
- Contraste ≥ 4,5:1 en las medallas bloqueadas y en el estado del panel de viaje.
- La barra del hub ya no desborda a 375 px; se permite el zoom del navegador.
- Un `h1` por pantalla de juego.

### Documentación y licencia
- Diálogo «Acerca de» en la pantalla de perfiles con autoría, doble licencia y repositorio.
- Nuevos: CREDITS.md, DECISIONES.md, CHANGELOG.md y assets/fonts/OFL.txt.
- README: secciones «Hecho con IA» y «Cómo modificarlo».

## v1.4.0 — 2026-09-06

Release pública inicial en github.com/edumind-es/juegos-de-viaje (versión que ya corría
en games.edumind.es). No hay registro detallado de las versiones anteriores.
