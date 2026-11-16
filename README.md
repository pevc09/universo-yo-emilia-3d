# Universo Yo, Emilia — recorrido 3D

Versión inmersiva del sitio: el scroll mueve una cámara por los espacios del corto.
Casi todo el recorrido pasa en el cuarto de Emilia, en un solo plano secuencia; al final se sale a la ciudad:

| Sección | Espacio | Luz |
|---|---|---|
| Inicio | teaser (imagen de Gemini en movimiento) que se disuelve en el cuarto; termina en las notas del público | atardecer |
| La historia | su escritorio; la laptop proyecta el corto | atardecer |
| Personajes | cuatro polaroids en la pared, sobre el estante | atardecer que se apaga |
| El archivo de Emilia y el mural | sus objetos y el corcho | del atardecer a la noche |
| Universo transmedia | Lima de noche: pantallas verticales que se deslizan como un feed (TikTok, YouTube Shorts), un ecualizador gigante (podcast), la línea de tiempo pintada en las ventanas de un edificio y las notas del mural volando | neón |
| El estreno | función al aire libre proyectada sobre la fachada del café | guirnaldas cálidas |
| Equipo y contacto | Lima al amanecer | amanecer |

Cada escena tiene su propio sonido ambiente, sintetizado en el navegador (`js/audio.js`). Se activa con «Entrar con sonido» o con el botón «Sonido».

## Carpetas
- `site/` — el sitio listo para publicar (GitHub Pages: subir el contenido de esta carpeta).
  - `index.html`, `css/`, `js/` — página, estilos y código.
  - `js/spaces-a.js` (calle) y `js/spaces-b.js` (cuarto) — los espacios modelados por código (Three.js). Los demás espacios de esos archivos (cafetería, restaurante, cineclub, sala) ya no se usan.
  - `js/spaces-c.js` — el recorrido actual: cámaras y luces del cuarto, polaroids de personajes, y la ciudad del universo transmedia y del estreno.
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

## Publicación
En línea: https://pevc09.github.io/universo-yo-emilia-3d/ (GitHub Pages, rama `gh-pages`, que contiene solo la carpeta `site/`).
Para publicar cambios después de hacer commit:

    git subtree split --prefix site -b gh-pages
    git push -f origin gh-pages

## Regenerar los videos
Con el servidor local abierto:
- `http://localhost:8377/teaser.html?rec=1` — graba el teaser (12 s) a partir de `img/teaser.jpg`.
- `http://localhost:8377/render.html?rec=all` — graba cada escena (8 s, 1280×720, H.264) y el montaje.
- `render.html?sheet=1` genera una hoja de contactos para revisar luz y encuadres.
