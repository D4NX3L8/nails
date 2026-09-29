# Valery Nails

Agenda de citas para el estudio de manicura. Está hecha con HTML, CSS y JavaScript nativo, sin dependencias, sin compilación y sin servicios de pago: todo funciona en el navegador.

![Valery Nails](assets/logo-mark.svg)

## Qué hace

- Agenda citas con clienta, servicio, fecha, hora y descripción.
- Adjunta hasta 5 imágenes de referencia por cita; se optimizan antes de guardarse.
- Marca cada cita como **completada** (o la reabre) y consulta el historial con los filtros Próximas, Hoy, Todas, Pasadas y Completadas.
- Filtra por texto, muestra el resumen del día y evita horarios duplicados.
- **Personaliza el nombre y el logo** del estudio desde *Mi estudio*: es un único registro guardado en este dispositivo que cambia lo que se ve arriba, en el pie y en la pestaña del navegador.
- Guarda todo en este dispositivo y descarga respaldos en **CSV** (Excel, Google Sheets) o **JSON** (incluye las fotos), además de poder restaurarlos.
- Detecta el tema claro u oscuro del sistema y se adapta a móvil y escritorio.

## Ejecutar

Abre `index.html` en un navegador moderno. Para desarrollo, sirve la carpeta con cualquier servidor estático, por ejemplo:

```sh
npx serve .
```

> Algunos navegadores bloquean los módulos de JavaScript al abrir el HTML directamente como archivo. Usa un servidor estático si notas que la página no carga.

## Datos y fotos

Las citas se guardan en `localStorage` en el navegador y el dispositivo actuales; no se envían a un servidor ni se sincronizan entre dispositivos. Las fotos se reducen y se guardan junto con cada cita. **Si se borra el almacenamiento del navegador, las citas locales también se borran**: descarga un respaldo con regularidad desde el botón *Respaldo* de la barra superior.

El menú *Mi estudio* reúne cuatro cosas:

| Opción | Qué hace |
| --- | --- |
| Nombre y logo | Escribe el nombre del estudio y sube tu logo. Se guarda en un único registro (`localStorage` → `valery-nails-settings-v1`) y se aplica en la barra superior, el pie y el título de la pestaña. Sin logo propio se usa el de Valery Nails. |
| Descargar citas | Archivo `.csv` con fecha, hora, clienta, servicio, descripción y estado. No incluye las fotos. |
| Respaldo completo | `.json` con todo, incluidas las imágenes de referencia. |
| Restaurar archivo | Vuelve a cargar un `.csv` o `.json`. Las citas que ya tengas no se borran. |

El logo se reduce a 240 px (con fondo transparente, formato PNG) antes de guardarse, así que no ocupa casi espacio.

El proyecto se puede publicar como sitio estático en GitHub Pages, Cloudflare Pages o Netlify con sus planes gratuitos. Cada publicación será solo la interfaz: los datos seguirán siendo locales a cada navegador.

## Estructura

- `index.html`: estructura de la agenda, diálogos y sprites de iconos.
- `styles.css`: tokens de color, tema claro/oscuro y diseño adaptable.
- `site.webmanifest`, `assets/`: favicon, logo e identidad de la app.
- `js/app.js`: punto de entrada y coordinación de la interfaz.
- `js/config.js`: nombre de la marca, claves de almacenamiento, servicios ofrecidos y límites.
- `js/data/appointment-storage.js`: lectura, validación, migración y operaciones CRUD en `localStorage`, más el registro único de ajustes (nombre, logo y vista).
- `js/services/image-processing.js`: optimización de imágenes de referencia y del logo.
- `js/services/import-backup.js`: lectura de respaldos `.csv` y `.json`.
- `js/ui/`: lista, formulario de citas, formulario del nombre y logo, marca, confirmación, visor de fotos, avisos y respaldos.
- `js/utils/`: funciones compartidas para fechas y texto HTML.
