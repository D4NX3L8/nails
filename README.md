# Valery Nails

Agenda de citas para el estudio de manicura. Está hecha con HTML, CSS y JavaScript nativo, sin dependencias, sin compilación y sin servicios de pago: todo funciona en el navegador.

![Valery Nails](assets/logo-mark.svg)

## Qué hace

- Agenda citas con clienta, servicio, fecha, hora y descripción.
- Adjunta hasta 5 imágenes de referencia por cita; se optimizan antes de guardarse.
- Marca cada cita como **completada** (o la reabre) y consulta el historial con los filtros Próximas, Hoy, Todas, Pasadas y Completadas.
- Filtra por texto, muestra el resumen del día y evita horarios duplicados.
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

El menú *Respaldo* ofrece tres acciones:

| Acción | Formato | Para qué sirve |
| --- | --- | --- |
| Descargar citas | `.csv` | Planilla para Excel, Numbers o Google Sheets. No incluye las fotos. |
| Respaldo completo | `.json` | Copia de todo, incluidas las imágenes de referencia. |
| Restaurar archivo | `.csv` o `.json` | Vuelve a cargar un respaldo. Las citas que ya tengas no se borran. |

El proyecto se puede publicar como sitio estático en GitHub Pages, Cloudflare Pages o Netlify con sus planes gratuitos. Cada publicación será solo la interfaz: los datos seguirán siendo locales a cada navegador.

## Estructura

- `index.html`: estructura de la agenda, diálogos y sprites de iconos.
- `styles.css`: tokens de color, tema claro/oscuro y diseño adaptable.
- `site.webmanifest`, `assets/`: favicon, logo e identidad de la app.
- `js/app.js`: punto de entrada y coordinación de la interfaz.
- `js/config.js`: nombre de la marca, claves de almacenamiento y servicios ofrecidos.
- `js/data/appointment-storage.js`: lectura, validación, migración y operaciones CRUD en `localStorage`.
- `js/services/image-processing.js`: optimización de imágenes.
- `js/services/import-backup.js`: lectura de respaldos `.csv` y `.json`.
- `js/ui/`: lista, formulario, confirmación, visor de fotos, avisos y respaldos.
- `js/utils/`: funciones compartidas para fechas y texto HTML.
