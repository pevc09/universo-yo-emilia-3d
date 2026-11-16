// Contenido del universo (tomado de la web original y del documento del proyecto).
export const WEEKS = [
  { n: 0, eje: 'Estreno', q: '¿Cambiarías tu historia para que te la produzcan?', rel: [['Evento', 'Estreno del corto', 'Proyección, conversatorio y brindis'], ['Web', 'Se abre el universo', 'El cuarto de Emilia y el mural'], ['Mural físico', 'Notas del brindis', 'Digitalizadas con permiso']], obj: null },
  { n: 1, eje: 'Empezar', q: '¿Cuándo fue la primera vez que alguien creyó en tu idea?', rel: [['TikTok', 'Modo Directora · cap. 1', '«Casting de Lucía»'], ['YouTube Shorts', 'El otro lado de Ricardo · cap. 1', '«Un sueño por cumplir»'], ['Spotify', 'Miradas distintas · ep. 1', 'Melina León: «De una idea a una película»']], obj: 'casting' },
  { n: 2, eje: 'Ceder', q: '¿Hasta dónde cederías sin dejar de contar tu historia?', rel: [['TikTok', 'Modo Directora · cap. 2', '«El elenco y sus problemas»'], ['YouTube Shorts', 'El otro lado de Ricardo · cap. 2', '«El precio de avanzar»'], ['Spotify', 'Miradas distintas · ep. 2', 'Marco Moscoso: «Detrás de la producción»']], obj: 'pared' },
  { n: 3, eje: 'Volver a intentarlo', q: '¿En quién confiaste para sacar adelante un proyecto?', rel: [['TikTok', 'Modo Directora · cap. 3', '«Detrás de cámara»'], ['YouTube Shorts', 'El otro lado de Ricardo · cap. 3', '«Una puerta entreabierta»'], ['Spotify', 'Miradas distintas · ep. 3', 'Omar Callegari: «La historia a través de la imagen»']], obj: 'chat' },
  { n: 4, eje: 'Lo que cuesta', q: '¿Qué dejaste en el camino por un proyecto?', rel: [['TikTok', 'Modo Directora · cap. 4', '«Que se escuche»'], ['YouTube Shorts', 'El otro lado de Ricardo · cap. 4', '«Lo que cuesta»'], ['Spotify', 'Miradas distintas · ep. 4', 'Augusto Cabada: «Construir una historia y sus personajes»']], obj: 'cuaderno' },
  { n: 5, eje: 'Lo que queda', q: '¿Cuál fue la oportunidad que cambió tu camino?', rel: [['TikTok', 'Modo Directora · cap. 5', '«Lo que no viste»'], ['YouTube Shorts', 'El otro lado de Ricardo · cap. 5', '«Lo que queda»'], ['Spotify', 'Miradas distintas · ep. 5', 'Susana Torres: «El mundo detrás de cada escena»']], obj: 'pagina' }
];
export const EPISODES = [['Melina León', 'De una idea a una película'], ['Marco Moscoso', 'Detrás de la producción'], ['Omar Callegari', 'La historia a través de la imagen'], ['Augusto Cabada', 'Construir una historia y sus personajes'], ['Susana Torres', 'El mundo detrás de cada escena']];
export const OBJECTS = [
  { id: 'mural', name: 'El mural', week: 0, x: 44, y: 24, type: 'Expansión y participación' },
  { id: 'carpeta', name: 'La carpeta', week: 0, x: 33.5, y: 61, type: 'Expansión' },
  { id: 'dias', name: 'Los 14 días', week: 0, x: 69.5, y: 38, type: 'Expansión' },
  { id: 'escucha', name: 'Lo que Emilia escucha', week: 0, x: 88, y: 73, type: 'Persona y conexión' },
  { id: 'casting', name: 'La lista del casting', week: 1, x: 61.6, y: 20, type: 'Conexión' },
  { id: 'pared', name: 'Su pared de películas', week: 2, x: 12.5, y: 42, type: 'Persona' },
  { id: 'chat', name: 'El chat en visto', week: 3, x: 61.5, y: 59, type: 'Conexión' },
  { id: 'cuaderno', name: 'El cuaderno de mesas ajenas', week: 4, x: 17.6, y: 80, type: 'Persona' },
  { id: 'pagina', name: 'La primera página del piloto', week: 5, x: 69, y: 58, type: 'Expansión' }
];
export const CHAPTERS = ['El primer encargo', 'Firmas ajenas', 'La carta que no era mía', 'Clientes fijos', 'Lo que sabía la abuela', 'Plagio', 'Un sueño por encargo', 'Borrador', 'Mi nombre', 'Ladrona de sueños'];
export const NOTE_COLORS = ['n-y', 'n-p', 'n-g', 'n-b', 'n-y', 'n-l', 'n-p', 'n-g', 'n-b', 'n-y'];
export const NIGHTS = [
  ['Decisión', 'Se registra en la convocatoria y decide que el piloto será el capítulo 1 de su escaleta, no su escena favorita.', 2, 9, 0, 'Registrada. Ya no hay vuelta atrás.'],
  ['Dificultad', 'La primera escena de Lucía no funciona; la reescribe tres veces y se queda con la versión más corta.', 5, 8, 1, 'Lucía no quiere hablar todavía. La entiendo.'],
  ['Avance', 'Divide el piloto en tres actos y pega la estructura junto al mural.', 9, 6, 3, 'Tres actos en la pared. Parecen pocos.'],
  ['Dificultad', 'Turno largo en su trabajo; llega tarde y solo escribe una página.', 10, 7, 2, 'Una página también es una página.'],
  ['Avance', 'Termina el primer acto; usa por primera vez el temporizador para no mirar el celular.', 14, 4, 6, 'El celular boca abajo funciona.'],
  ['Decisión', 'Llega un episodio nuevo de Miradas distintas y, por primera vez, no lo pone: lo guarda para después de escribir.', 17, 2, 9, 'El episodio puede esperar. Lucía no.'],
  ['Dificultad', 'Se traba a mitad del segundo acto; Romina le manda un audio y ella solo responde con un emoji.', 18, 3, 8, 'Le debo una llamada a Romina.'],
  ['Avance', 'Sale a una cafetería a observar mesas ajenas y resuelve el diálogo que la tenía trabada.', 22, 1, 11, 'La señora de la mesa 3 me resolvió el diálogo sin saberlo.'],
  ['Decisión', 'Decide que Lucía diga que no al final del piloto, aunque eso complique el capítulo 2.', 25, 1, 12, 'Hoy Lucía por fin dijo que no. Yo también.'],
  ['Avance', 'Termina el primer borrador completo.', 31, 0, 14, '31 páginas. Sobran algunas, pero existen.'],
  ['Dificultad', 'Lo lee en voz alta frente al espejo, como ensaya sus discursos, y corta los diálogos que suenan falsos.', 27, 0, 13, 'En voz alta se nota lo que es mentira.'],
  ['Decisión', 'En la ficha de equipo escribe «Dirección y producción: Emilia», sin socio.', 28, 0, 15, 'Se ve bien escrito así.'],
  ['Avance', 'Arma la carpeta: logline, sinopsis, escaleta y propuesta visual.', 28, 0, 16, 'La carpeta pesa más de lo que parece.'],
  ['Avance', 'Última revisión y envío antes del cierre.', 28, 0, 18, 'Enviado. Sin pedirle permiso a nadie.']
];
export const SEED_NOTES = [
  { id: 's1', t: 'Le dije que no a una marca. Perdí el auspicio, gané el corto.', a: 'Ana · Lima', c: 'n-y', r: [24, 6] },
  { id: 's2', t: 'Postulé siete veces. La octava fue un sí.', a: 'Anónimo', c: 'n-b', r: [31, 12] },
  { id: 'e1', t: 'Lo que no cedes es lo que después te sostiene. — E.', a: 'Emilia contesta', c: 'reply', r: [0, 0], reply: true },
  { id: 's3', t: 'Cambié el final por un fondo. Nunca lo volví a sentir mío.', a: 'Diego', c: 'n-g', r: [17, 3] },
  { id: 's4', t: 'Mi primer corto lo grabé con el celular de mi tía. Sigue siendo el que más quiero.', a: 'Mafe · Trujillo', c: 'n-p', r: [12, 9] }
];

export const CAST = [
  { n: 'Emilia', age: 25, sub: 'cineasta', q: '«Quiero contar la historia de Lucía.»', bg: 'linear-gradient(170deg,#b79a7f,#5f4a3b)', who: 'Cineasta recién egresada, guionista y directora. Creativa, observadora y perseverante.', rel: 'Protagonista del universo.', tags: ['Corto', 'Modo Directora', 'Archivo'], ep: 'Ep. 1 · Melina León' },
  { n: 'Ricardo Valdés', age: 35, sub: 'productor', q: '«Hay mucho dinero de por medio.»', bg: 'linear-gradient(170deg,#8792a1,#3c4350)', who: 'Productor firme, directo y práctico. Prioriza que la historia sea comercial para conseguir financiamiento.', rel: 'Socio y productor de Emilia desde la universidad.', tags: ['Corto', 'El otro lado de Ricardo'], ep: 'Ep. 2 · Marco Moscoso' },
  { n: 'Romina', age: 30, sub: 'prima', q: 'Su apoyo fuera de la industria.', bg: 'linear-gradient(170deg,#a9b8a2,#56644f)', who: 'Prima cercana de Emilia, cariñosa y centrada. Trabaja en una escuela para niños con necesidades especiales.', rel: 'Su confidente: con ella Emilia piensa en voz alta.', tags: ['Corto'], ep: null },
  { n: 'Lucía', age: null, sub: 'personaje de Emilia', q: '«En su barrio le dicen la ladrona de sueños.»', bg: 'linear-gradient(170deg,#c99a8d,#7a4b45)', who: 'Protagonista de Ladrona de sueños, la serie que escribe Emilia.', rel: 'Su personaje: la razón por la que Emilia no cede.', tags: ['Archivo', 'Modo Directora'], ep: 'Ep. 4 · Augusto Cabada' }
];
export const MARKERS = [['02:10', 'El mural', 'mural'], ['06:05', 'El chat en visto', 'chat'], ['09:20', 'Los 14 días', 'dias'], ['11:40', 'La carpeta', 'carpeta']];
export const STEPS = [['Redes sociales', 'Anuncian el evento'], ['Evento', 'Corto, conversatorio y brindis'], ['Cortometraje', 'La historia central'], ['Universo Yo, Emilia', 'Estás aquí'], ['Modo Directora', 'TikTok · 5 caps.'], ['Miradas distintas', 'Spotify · 5 episodios'], ['El otro lado de Ricardo', 'YouTube Shorts · 5 caps.']];
export const CROSS = [
  ['El mensaje en visto', 'Corto ↔ El otro lado de Ricardo, cap. 3', 'En el corto, Emilia envía a Ricardo la foto del folleto y él nunca responde. En el capítulo 3 de la miniserie, Ricardo recibe esa convocatoria y, enseguida, un mensaje inesperado. Es el mismo instante visto desde los dos lados.'],
  ['La reunión con el inversionista', 'Corto ↔ El otro lado de Ricardo, cap. 4', 'En el corto, Emilia rechaza cambiar el conflicto de su historia y se va. En el capítulo 4, Ricardo sigue adelante con el trato y recibe el mensaje que confirma la ruptura.'],
  ['La publicación que Ricardo comparte', 'El otro lado de Ricardo, cap. 5 ↔ Modo Directora', 'En el capítulo 5, Ricardo ve que el nuevo proyecto de Emilia suma reproducciones y lo comparte. Esa publicación es un capítulo de Modo Directora: el final de una pieza abre la otra.']
];
