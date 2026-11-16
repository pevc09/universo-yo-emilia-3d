# Universo Yo, Emilia — recorrido 3D

Versión inmersiva del sitio: el scroll mueve una cámara por los espacios del corto.
Las siete secciones del sitio original se recorren en orden, cada una en el espacio que le corresponde:

| Sección | Espacio | Luz |
|---|---|---|
| Inicio | teaser (imagen de Gemini en movimiento) que se disuelve en la calle de Lima | atardecer que cae a noche |
| La historia | cafetería, y luego el cineclub que proyecta el corto | día frío / sala oscura |
| Personajes | restaurante con los cuatro retratos | hora dorada por los arcos |
| El archivo de Emilia | su cuarto y el mural | atardecer que se vuelve noche |
| Universo transmedia | la calle de noche con pantallas de TikTok, YouTube Shorts y Spotify | neón |
| El estreno | sala de la noche de estreno | guirnaldas cálidas |
| Equipo y contacto | Lima al amanecer | amanecer |

Cada escena tiene su propio sonido ambiente, sintetizado en el navegador (`js/audio.js`). Se activa con «Entrar con sonido» o con el botón «Sonido».

## Carpetas
- `site/` — el sitio listo para publicar (GitHub Pages: subir el contenido de esta carpeta).
  - `index.html`, `css/`, `js/` — página, estilos y código.
  - `js/spaces-a.js`, `js/spaces-b.js` — los espacios modelados por código (Three.js).
  - `js/spaces-c.js` — capa cinematográfica: rayos de luz, polvo, cambios de luz con el scroll, pantallas del universo y la sala del estreno.
  - `js/stage.js` — orden de escenas (`SCENES`) y corrección de color.
  - `js/data.js` — textos y datos (semanas, objetos, personajes, notas).
  - `img/teaser.jpg` — imagen generada con Gemini para el teaser; `img/portada.webp` — afiche del corto.
  - `videos/` — `teaser.mp4`, un clip MP4 + una imagen por escena, y `montaje.mp4` (se proyecta en el cineclub).
  - `render.html` y `teaser.html` — herramientas para volver a generar los videos.
- `tools/server.py` — servidor local (sirve `site/` y recibe los videos renderizados).
- `original/` — copia de la primera versión del sitio.

## Verlo en local
    python tools/server.py 8377
y abrir http://localhost:8377

- `?lite` al final de la dirección fuerza la versión sin 3D (la misma que ven los equipos sin WebGL).

## Regenerar los videos
Con el servidor local abierto:
- `http://localhost:8377/teaser.html?rec=1` — graba el teaser (12 s) a partir de `img/teaser.jpg`.
- `http://localhost:8377/render.html?rec=all` — graba cada escena (8 s, 1280×720, H.264) y el montaje.
- `render.html?sheet=1` genera una hoja de contactos para revisar luz y encuadres.
