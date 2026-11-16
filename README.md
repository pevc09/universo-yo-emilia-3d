# Universo Yo, Emilia — recorrido 3D

Versión inmersiva del sitio: el scroll mueve una cámara por los espacios del corto
(calle de Lima, cafetería, restaurante, cineclub, cuarto de Emilia con su mural, sala de Casa Melón, amanecer).

## Carpetas
- `site/` — el sitio listo para publicar (GitHub Pages: subir el contenido de esta carpeta).
  - `index.html`, `css/`, `js/` — página, estilos y código.
  - `js/spaces-a.js`, `js/spaces-b.js` — los espacios modelados por código (Three.js). Ahí se cambian muebles, luces (`rigs`) y recorridos de cámara (`cams`).
  - `js/data.js` — textos y datos (semanas, objetos, personajes, notas).
  - `videos/` — un clip MP4 + una imagen por escena, y `montaje.mp4` (se proyecta en el cineclub).
  - `render.html` — herramienta para volver a generar los videos.
- `tools/server.py` — servidor local (sirve `site/` y recibe los videos renderizados).
- `original/` — copia de la primera versión del sitio y del documento del proyecto.

## Verlo en local
    python tools/server.py 8377
y abrir http://localhost:8377

- `?lite` al final de la dirección fuerza la versión sin 3D (la misma que ven los equipos sin WebGL).

## Regenerar los videos
Con el servidor local abierto, visitar `http://localhost:8377/render.html?rec=all`.
Graba cada escena (8 s, 1280×720, H.264) y el montaje, y los guarda en `site/videos/`.
`render.html?sheet=1` genera una hoja de contactos para revisar luz y encuadres.
