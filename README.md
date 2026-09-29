# Valentina Nails

Agenda sencilla para registrar las citas de la manicurista. Está hecha con HTML, CSS y JavaScript sin dependencias ni servicios de pago.

## Ejecutar

Abre `index.html` en un navegador moderno. Para desarrollo, también puedes servir la carpeta con cualquier servidor estático, por ejemplo:

```sh
npx serve .
```

## Datos y fotos

Las citas se guardan en `localStorage` en el navegador y dispositivo actuales; no se envían a un servidor ni se sincronizan entre dispositivos. Las fotos se reducen y se guardan junto con cada cita. Descarga un respaldo desde la agenda con regularidad. Si se borra el almacenamiento del navegador, las citas locales también se borran.

El proyecto se puede publicar como sitio estático en GitHub Pages, Cloudflare Pages o Netlify con sus planes gratuitos. Cada publicación será solo la interfaz: los datos seguirán siendo locales a cada navegador.

## Estructura

- `index.html`: estructura y formulario de la agenda.
- `styles.css`: diseño adaptable para móvil y escritorio.
- `app.js`: operaciones de citas y persistencia local.