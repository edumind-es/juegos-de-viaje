# Alcance de la release pública

Este repositorio es una *release saneada* de la aplicación que corre en
[games.edumind.es](https://games.edumind.es), publicada para revisión de código,
reutilización educativa y auditoría de la comunidad.

## Qué incluye

Todo el código de la aplicación: el arranque, el núcleo, los minijuegos, los estilos,
las fuentes autoalojadas, los iconos, el manifiesto PWA, el service worker y el script
que genera los mapas.

Es una aplicación completa y funcional: basta con servir la carpeta como sitio estático
sobre HTTPS. No hay nada que compilar.

## Qué excluye

- La configuración de nginx del servidor de producción, porque describe la
  infraestructura interna (rutas de certificados, cabeceras de origen, reglas de caché).
  Las instrucciones de despliegue genéricas están en el [README](README.md).
- Los GeoJSON de origen de Natural Earth, que pesan decenas de megabytes y se descargan
  bajo demanda al regenerar los mapas.

## Qué no existe, ni aquí ni en producción

No hay secretos que excluir, porque la aplicación no tiene ninguno: **no hay backend,
ni base de datos, ni cuentas, ni analítica, ni llamadas a terceros**. Todo lo que
genera quien juega —perfiles, estrellas, medallas, panel de check-in— vive en el
`localStorage` de su propio dispositivo y nunca sale de él.
