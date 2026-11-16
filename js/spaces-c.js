// Espacios III: el recorrido nuevo.
// · El cuarto de Emilia aloja casi toda la página: inicio, historia, personajes, archivo y mural.
// · Al final, la ciudad se vuelve el universo transmedia: pantallas verticales que se deslizan como un feed,
//   un ecualizador gigante para el podcast, un edificio cuyas ventanas son la línea de tiempo,
//   las notas del mural volando sobre Lima, y una función al aire libre para el estreno.
import * as THREE from 'three';
import { mat, glow, box, sph, quad, chair, canvasTex, noteTex, signTex, wrap, rnd, seed } from './kit.js';
import { CAST, WEEKS } from './data.js';

const smooth = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
const hook = (sp, name, fn) => { const old = sp[name]; sp[name] = (...a) => { old && old(...a); fn(...a); }; };
let shaftTex;
/* Rayo de luz: dos láminas cruzadas que van de la ventana al piso */
function shaft(g, from, to, w, h, color, op) {
  shaftTex = shaftTex || canvasTex(256, 64, (x, W, H) => {
    const a = x.createLinearGradient(0, 0, W, 0); a.addColorStop(0, 'rgba(255,255,255,1)'); a.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = a; x.fillRect(0, 0, W, H);
    const b = x.createLinearGradient(0, 0, 0, H); b.addColorStop(0, 'rgba(0,0,0,1)'); b.addColorStop(0.35, 'rgba(0,0,0,0)'); b.addColorStop(0.65, 'rgba(0,0,0,0)'); b.addColorStop(1, 'rgba(0,0,0,1)');
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = b; x.fillRect(0, 0, W, H);
  });
  const A = new THREE.Vector3(...from), B = new THREE.Vector3(...to), L = A.distanceTo(B);
  const grp = new THREE.Group(); grp.position.copy(A).lerp(B, 0.5); grp.lookAt(A); g.add(grp);
  const m = new THREE.MeshBasicMaterial({ map: shaftTex, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const p1 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m); p1.rotation.y = Math.PI / 2; p1.scale.set(L, h, 1); grp.add(p1);
  const g2 = new THREE.PlaneGeometry(1, 1); g2.rotateZ(Math.PI / 2); const p2 = new THREE.Mesh(g2, m); p2.rotation.x = Math.PI / 2; p2.rotation.z = Math.PI; p2.scale.set(w, L, 1); grp.add(p2);
  return m;
}
function dust(g, c, s, n, size = 0.012, op = 0.5) {
  const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = c[0] + rnd(-s[0], s[0]); p[i * 3 + 1] = c[1] + rnd(-s[1], s[1]); p[i * 3 + 2] = c[2] + rnd(-s[2], s[2]); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffe6c2', size, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(pts);
  return (time) => { pts.position.y = Math.sin(time * 0.12) * 0.06; pts.position.x = Math.sin(time * 0.07) * 0.08; };
}

/* ============================== EL CUARTO ============================== */
function dressRoom(sp) {
  seed(909);
  const g = sp.group, W = 5.2, dy = 0.76, dz = -1.92, BZ = -2.3;
  /* la ventana da al atardecer de la portada */
  const blk = mat('#000');
  box(g, 0.04, 0.9, 6, blk, W / 2 + 0.07, 2.65, 0); box(g, 0.04, 1.05, 6, blk, W / 2 + 0.07, 0.52, 0); box(g, 0.04, 1.2, 3.0, blk, W / 2 + 0.07, 1.62, -1.43); box(g, 0.04, 1.2, 1.7, blk, W / 2 + 0.07, 1.62, 2.18);
  const duskT = canvasTex(512, 512, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6a6478'); gr.addColorStop(0.45, '#e2a36c'); gr.addColorStop(0.62, '#ffc67a'); gr.addColorStop(1, '#e8884a'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(110,96,112,.55)'; for (let i = 0; i < 7; i++) { x.beginPath(); x.ellipse(rnd(w), rnd(40, 230), rnd(90, 220), rnd(10, 26), 0, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(120,84,84,.8)'; x.beginPath(); x.moveTo(0, 330); x.quadraticCurveTo(150, 250, 290, 320); x.quadraticCurveTo(400, 262, w, 318); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    for (let i = 0; i < 34; i++) { const bw = rnd(18, 46), bh = rnd(40, 150), bx = rnd(-10, w); x.fillStyle = `rgba(${70 + rnd(40)},${50 + rnd(30)},${50 + rnd(30)},.95)`; x.fillRect(bx, h - bh, bw, bh); }
  });
  const sky = quad(g, 1.25, 1.15, glow(duskT, 1.7, { transparent: true }), W / 2 - 0.012, 1.62, 0.7, 'x-');
  const ray = shaft(g, [2.5, 1.62, 0.7], [-0.9, 0.35, -1.5], 1.2, 1.1, '#ffab5c', 0.2);
  const d = dust(g, [0.4, 1.3, 0], [2.0, 1.0, 1.9], 360, 0.011, 0.6);
  /* utilería de la portada */
  ['CINE', 'DIRECCIÓN', 'GUION', 'AUDIOVISUAL'].forEach((t, i) => { const c = ['#3a3f45', '#4b4f55', '#30343a', '#55524c'][i]; box(g, 0.26, 0.04, 0.18, mat(c, { rough: 0.7 }), -0.5, dy + 0.02 + i * 0.041, dz + 0.2, 0.08 * (i % 2)); quad(g, 0.24, 0.032, mat(signTex([t], { w: 512, h: 64, bg: c, fg: '#e9e2d2', font: '"Instrument Sans", sans-serif', size: 40 }), { rough: 0.7 }), -0.5, dy + 0.02 + i * 0.041, dz + 0.292, 'z+'); });
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.032, 0.11, 18), mat('#2a2622', { rough: 0.6 })); c1.position.set(0.5, dy + 0.055, dz + 0.02); g.add(c1);
  box(g, 0.13, 0.085, 0.07, mat('#111214', { rough: 0.4 }), 0.98, dy + 0.045, dz + 0.22, -0.4);
  quad(g, 0.2, 0.2, mat(noteTex('Guion\nRodaje\nFestivales\nDistribución\nSueños', '#f4d873', { size: 54 }), { rough: 0.9 }), 0.78, 1.4, BZ + 0.04, 'z+', -0.05);
  quad(g, 0.3, 0.3, mat(noteTex('La historia también es una forma de existir.', '#f2e2b0', { size: 58 }), { rough: 0.9 }), 1.8, 1.17, BZ + 0.006, 'z+', 0.04);

  /* PERSONAJES: cuatro polaroids sobre el estante, en la pared izquierda */
  const hot = [];
  CAST.forEach((c, i) => {
    const cols = c.bg.match(/#[0-9a-f]{6}/gi), z = 0.62 + (3 - i) * 0.42, rz = [-0.05, 0.04, -0.02, 0.06][i];
    const tex = canvasTex(384, 470, (x, w) => {
      x.fillStyle = '#f4efe4'; x.fillRect(0, 0, w, 470);
      const gr = x.createLinearGradient(0, 24, w * 0.3, 360); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]); x.fillStyle = gr; x.fillRect(24, 24, w - 48, 330);
      x.fillStyle = 'rgba(20,14,10,.45)'; x.beginPath(); x.arc(w / 2, 150, 62, 0, 7); x.fill(); x.beginPath(); x.ellipse(w / 2, 352, 130, 120, 0, Math.PI, 0); x.fill();
      x.fillStyle = '#2a241f'; x.textAlign = 'center'; x.font = '700 50px "Caveat", cursive'; x.fillText(c.n, w / 2, 410);
      x.font = '500 30px "Caveat", cursive'; x.fillText((c.age ? c.age + ' · ' : '') + c.sub, w / 2, 448);
    });
    quad(g, 0.32, 0.39, mat(tex, { rough: 0.8 }), -W / 2 + 0.008 + i * 0.0005, 1.62, z, 'x+', rz);
    quad(g, 0.05, 0.08, mat('#e9dcc0', { rough: 1, transparent: true, opacity: 0.85 }), -W / 2 + 0.012, 1.82, z, 'x+', 0.6);
    hot.push({ id: 'cast:' + i, p: [-W / 2 + 0.06, 1.62, z], label: c.n, range: [0.45, 1] });
  });
  sp.hotspots.personajes = hot;
  sp.hotspots.historia = [{ id: 'trailer', p: [0.22, 0.9, -2.02], label: 'Reproducir el corto', range: [0.6, 1] }];
  sp.hotspots.inicio = [{ id: 'mural', p: [-1.78, 1.52, BZ + 0.06], label: 'Pega tu nota en el mural', range: [0.4, 0.68] }];

  /* luces: atardecer (inicio → personajes), atardecer → noche (archivo), noche (mural) */
  const nightPts = [[-0.3, 1.1, -1.7, '#ffb463', 1.5, 3.8], [2.2, 1.6, 0.7, '#7a98e0', 1.1, 4.5], [0.2, 2.3, -1.7, '#ffcc88', 1.5, 5], [2.4, 0.9, -0.75, '#ff9a5c', 0.3, 3]];
  const base = { fog: ['#140d08', 7, 18], exposure: 1.0, env: 0.2 };
  const dusk = { ...base, bg: '#1a0f08', grade: { temp: 0.17, sat: 1.12, vig: 1.1 }, bloom: 0.46, hemi: ['#ffc890', '#2a1a12', 0.3], key: { p: [6.2, 2.4, 1.7], t: [-0.6, 0.9, -1.4], c: '#ffa24a', i: 520, angle: 0.42, pen: 0.4 },
    pts: [[-0.3, 1.1, -1.7, '#ffb463', 0.12, 3.8], [2.2, 1.6, 0.7, '#ffb070', 1.4, 4.5], [0.2, 2.3, -1.7, '#ffcc88', 0.08, 5], [2.4, 0.9, -0.75, '#ff9a5c', 0.08, 3]] };
  const night = { ...base, bg: '#0b0806', grade: { temp: 0.12, sat: 1.1, vig: 1.1 }, bloom: 0.36, hemi: ['#ffd3a2', '#241610', 0.34], key: { p: [6.2, 2.9, 1.7], t: [-0.6, 0.6, -1.2], c: '#7f96d8', i: 110, angle: 0.42, pen: 0.4 }, pts: nightPts };
  const late = { ...dusk, key: { ...dusk.key, i: 380, c: '#ff8f40' }, grade: { ...dusk.grade, temp: 0.2 } };
  sp.rigs = {
    inicio: dusk, historia: dusk,
    personajes: { ...dusk, from: 0.2, until: 1, to: { key: { i: 380, c: '#ff8f40' }, grade: { temp: 0.2 } } },
    archivo: { ...late, from: 0.42, until: 0.92, to: { bg: night.bg, hemi: night.hemi, key: night.key, grade: night.grade, bloom: night.bloom, pts: nightPts } },
    mural: night
  };
  /* Un solo plano secuencia. Cada punto es una parada: la cámara llega (`at`) y se queda quieta (`hold`)
     mientras se lee el texto que habla de lo que se ve. Los tiempos coinciden con data-a/data-b de index.html. */
  const P = (o, at, hold = 0) => ({ ...o, at, hold });
  const K = {
    puerta: { p: [-1.7, 1.62, 2.0], t: [2.3, 1.45, 0.3], fov: 60 },
    notas: { p: [-1.15, 1.72, -0.35], t: [-1.75, 1.85, -2.3], fov: 50 },
    escritorio: { p: [0.9, 1.6, 0.9], t: [0.1, 1.3, -2.2], fov: 56 },
    frase: { p: [1.25, 1.45, -0.55], t: [1.3, 1.3, -2.3], fov: 50 },
    laptop: { p: [0.25, 1.32, -0.8], t: [0.22, 0.95, -2.0], fov: 46 },
    fotos: { p: [-0.9, 1.6, 1.15], t: [-2.6, 1.68, 1.2], fov: 52 },
    /* vistas generales del archivo: desde aquí la persona elige qué objeto ver */
    izquierda: { p: [0.7, 1.6, 1.3], t: [-2.6, 1.35, 0.1], fov: 60 },
    escritorioG: { p: [0.55, 1.6, 0.6], t: [0.55, 1.25, -2.3], fov: 58 },
    veladorG: { p: [0.35, 1.55, -1.05], t: [2.4, 0.95, -0.5], fov: 60 },
    mural: { p: [0.2, 1.55, -0.15], t: [0.25, 1.62, -2.3] },
    notasCerca: { p: [-1.35, 1.8, -0.45], t: [-1.75, 1.82, -2.3], fov: 52 },
    corcho: { p: [-0.2, 1.78, -0.7], t: [-0.25, 1.8, -2.3], fov: 48 },
    corchoDer: { p: [0.65, 1.75, -0.7], t: [0.75, 1.74, -2.3], fov: 48 },
    muralLejos: { p: [0.2, 1.62, -0.5], t: [0.2, 1.7, -2.3] }
  };
  /* Acercamientos al tocar un objeto: la cámara vuela aquí y vuelve al cerrar la ficha. Distancia cómoda, no pegada. */
  sp.focus = {
    pared: { p: [-1.2, 1.62, -0.55], t: [-2.6, 1.6, -0.88], fov: 56 },
    cuaderno: { p: [-1.45, 1.65, 0.75], t: [-2.42, 0.98, 0.85], fov: 52 },
    carpeta: { p: [0.2, 1.5, -0.75], t: [0.15, 0.8, -1.95], fov: 52 },
    chat: { p: [0.45, 1.5, -0.75], t: [0.5, 0.8, -1.95], fov: 52 },
    pagina: { p: [0.45, 1.5, -0.75], t: [0.5, 0.8, -1.95], fov: 52 },
    dias: { p: [1.35, 1.6, -0.9], t: [1.75, 1.55, -2.3], fov: 52 },
    escucha: { p: [1.1, 1.35, -1.6], t: [2.3, 0.62, -0.95], fov: 54 },
    casting: { p: [0.85, 1.8, -0.9], t: [0.94, 1.88, -2.3], fov: 50 },
    mural: { p: [-1.3, 1.8, -0.5], t: [-1.75, 1.82, -2.3], fov: 54 },
    'cast:0': { p: [-1.5, 1.62, 1.88], t: [-2.6, 1.62, 1.88], fov: 46 },
    'cast:1': { p: [-1.5, 1.62, 1.46], t: [-2.6, 1.62, 1.46], fov: 46 },
    'cast:2': { p: [-1.5, 1.62, 1.04], t: [-2.6, 1.62, 1.04], fov: 46 },
    'cast:3': { p: [-1.5, 1.62, 0.62], t: [-2.6, 1.62, 0.62], fov: 46 },
    trailer: { p: [0.25, 1.25, -0.95], t: [0.22, 0.95, -2.0], fov: 48 }
  };
  sp.cams = {
    /* teaser → el cuarto desde la puerta → las notas del público → el escritorio (la semana) */
    inicio: [P(K.puerta, 0, 0.72), P(K.notas, 0.58, 0.22), P(K.escritorio, 0.89, 0.22)],
    /* sinopsis frente al escritorio → el tema en la nota de la pared → el corto en la laptop */
    historia: [P(K.escritorio, 0, 0.64), P(K.frase, 0.51, 0.22), P(K.laptop, 0.85, 0.3)],
    /* de la laptop a las polaroids, y ahí se queda */
    personajes: [P(K.laptop, 0, 0), P({ p: [0.1, 1.45, -0.4], t: [-2.6, 1.4, -0.2] }, 0.12), P(K.fotos, 0.6, 0.8)],
    /* tres vistas generales (películas y estante → escritorio y calendario → velador y ventana) → mural */
    archivo: [P(K.fotos, 0, 0), P(K.izquierda, 0.18, 0.16), P(K.escritorioG, 0.45, 0.18), P(K.veladorG, 0.72, 0.16), P(K.mural, 0.96, 0.08)],
    /* las notas del público (la pregunta) → la escaleta en el corcho */
    mural: [P(K.mural, 0, 0.08), P(K.notasCerca, 0.21, 0.26), P(K.corcho, 0.5, 0.14), P(K.corchoDer, 0.74, 0.16), P(K.muralLejos, 1, 0.16)]
  };
  const BZ2 = BZ + 0.06, MX = 0.2, MY = 1.74;
  sp.hotspots.inicio = [{ id: 'mural', p: [-1.78, 1.52, BZ2], label: 'Pega tu nota en el mural', range: [0.47, 0.69] }];
  sp.hotspots.historia = [{ id: 'trailer', p: [0.22, 0.9, -2.02], label: 'Reproducir el corto', range: [0.7, 1] }];
  sp.hotspots.personajes.forEach(h => { h.range = [0.2, 1]; });
  sp.hotspots.archivo = [
    { id: 'pared', p: [-W / 2 + 0.05, 1.6, -0.88], range: [0.1, 0.27] },
    { id: 'cuaderno', p: [-W / 2 + 0.19, 1.0, 0.82], range: [0.1, 0.27] },
    { id: 'carpeta', p: [-0.14, dy + 0.06, dz + 0.13], range: [0.35, 0.55] },
    { id: 'chat', p: [0.56, dy + 0.05, dz + 0.17], range: [0.35, 0.55] },
    { id: 'pagina', p: [0.52, dy + 0.05, dz - 0.2], range: [0.35, 0.55] },
    { id: 'dias', p: [1.78, 1.72, BZ + 0.05], range: [0.35, 0.55] },
    { id: 'escucha', p: [2.26, 0.6, -0.9], range: [0.63, 0.81] },
    { id: 'casting', p: [MX + 0.74, MY + 0.16, BZ2], range: [0.91, 1] },
    { id: 'mural', p: [MX - 0.2, MY + 0.02, BZ2], range: [0.91, 1] }
  ];
  sp.hotspots.mural = [
    { id: 'mural', p: [-1.78, 1.52, BZ2], label: 'Pega tu nota en el mural', range: [0.08, 0.36] },
    { id: 'casting', p: [MX + 0.74, MY + 0.16, BZ2], range: [0.64, 0.86] },
    { id: 'dias', p: [1.78, 1.72, BZ + 0.05], range: [0.9, 1] }
  ];
  hook(sp, 'update', (time, l, t, id) => {
    const k = id === 'mural' ? 1 : id === 'archivo' ? smooth((t - 0.42) / 0.5) : 0;
    sky.material.opacity = 1 - k; ray.opacity = 0.2 * (1 - k); d(time);
  });
}

/* ============================== LA CIUDAD ============================== */
/* Pantalla vertical 9:16: el feed se desliza solo, como en el teléfono */
function feedTex(platform, color, items, icon) {
  const CW = 360, CH = 640;
  return canvasTex(CW, CH * items.length, (x) => {
    items.forEach((it, i) => {
      const y0 = i * CH, gr = x.createLinearGradient(0, y0, CW, y0 + CH);
      gr.addColorStop(0, ['#1d1530', '#2a1418', '#10202a', '#24180e', '#1a2414'][i % 5]); gr.addColorStop(1, '#07070b'); x.fillStyle = gr; x.fillRect(0, y0, CW, CH);
      x.fillStyle = color; x.globalAlpha = 0.18; x.beginPath(); x.arc(CW * 0.7, y0 + 220, 150, 0, 7); x.fill(); x.globalAlpha = 1;
      x.fillStyle = '#fff'; x.font = '700 22px "Instrument Sans", sans-serif'; x.textAlign = 'left'; x.fillText(platform, 22, y0 + 44); icon(x, CW - 52, y0 + 36);
      x.font = '62px "Permanent Marker", cursive'; x.fillStyle = '#fff'; wrap(x, it[2].replace(/[«»]/g, ''), 22, y0 + 330, CW - 70, 64);
      x.fillStyle = color; x.font = '700 22px "Courier Prime", monospace'; x.fillText(it[1].toUpperCase(), 22, y0 + 560);
      for (let k = 0; k < 3; k++) { x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(CW - 34, y0 + 360 + k * 62, 14, 0, 7); x.fill(); }
      x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(22, y0 + 600, CW - 44, 4); x.fillStyle = color; x.fillRect(22, y0 + 600, (CW - 44) * (0.25 + 0.15 * i), 4);
    });
  });
}
/* La línea de tiempo como fachada: cada piso es una pieza, cada ventana encendida es un momento */
function timelineTex() {
  return canvasTex(1200, 560, (x, w, h) => {
    x.fillStyle = '#121219'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(255,255,255,${rnd(0.01, 0.04)})`; x.fillRect(rnd(w), rnd(h), 2, 2); }
    const cols = ['AÑOS ANTES', 'DURANTE EL CORTO', 'DESPUÉS DEL CORTO'], lanes = [['Cortometraje', [0, 1, 0], '#fff3d6'], ['El otro lado de Ricardo', [1, 1, 1], '#ff7a6a'], ['Modo Directora', [0, 0, 1], '#7ff5f0'], ['Fuera de la ficción', [0, 1, 1], '#6be38f']];
    const cross = { 1: { 1: [2, 4], 2: [3] } };
    x.font = '700 22px "Courier Prime", monospace'; x.fillStyle = '#d9cfbf'; x.textAlign = 'center';
    cols.forEach((c, j) => x.fillText(c, 330 + j * 300 + 130, 44));
    lanes.forEach(([name, on, color], r) => {
      const y = 76 + r * 118; x.textAlign = 'right'; x.fillStyle = '#efe6d6'; x.font = '24px "Courier Prime", monospace'; x.fillText(name, 300, y + 58);
      for (let j = 0; j < 3; j++) for (let k = 0; k < 6; k++) {
        const wx = 330 + j * 300 + k * 44, lit = on[j], cr = cross[r] && cross[r][j] && cross[r][j].includes(k);
        x.fillStyle = cr ? '#ff9a3c' : lit ? color : '#23232e'; x.fillRect(wx, y + 14, 32, 72);
        if (lit) { x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(wx, y + 52, 32, 34); x.fillRect(wx + 15, y + 14, 2, 72); }
      }
    });
    x.textAlign = 'left'; x.fillStyle = '#ff9a3c'; x.font = '22px "Courier Prime", monospace'; x.fillText('■ ventanas naranjas: cruces entre piezas', 330, h - 14);
  });
}

function dressCity(sp) {
  seed(77);
  const g = sp.group;
  const uni = new THREE.Group(), screening = new THREE.Group(), line = new THREE.Group(), eq = new THREE.Group(); g.add(uni, screening, line, eq);
  const frame = mat('#0c0c10', { rough: 0.5, metal: 0.4 });

  /* el afiche real del corto en el panel de la vereda */
  if (g.userData.mupi) { const poster = new THREE.TextureLoader().load('img/portada.webp'); poster.colorSpace = THREE.SRGBColorSpace; poster.repeat.set(0.745, 1); poster.offset.set(0.13, 0); quad(g.userData.mupi, 1.24, 1.86, glow(poster, 1.0), 0, 1.38, 0.09); }

  /* TikTok y YouTube Shorts: pantallas verticales gigantes colgadas de las fachadas */
  const feeds = [];
  const mkFeed = (x, y, z, face, tex) => {
    tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, 1 / 5); tex.offset.y = 4 / 5;
    box(uni, 0.12, 6.0, 3.45, frame, x + (face === 'x+' ? 0.02 : -0.02), y, z);
    quad(uni, 3.2, 5.69, glow(tex, 1.15), x + (face === 'x+' ? 0.09 : -0.09), y, z, face);
    feeds.push(tex);
  };
  const tk = (x, cx, cy) => { x.strokeStyle = '#25f4ee'; x.lineWidth = 6; x.beginPath(); x.arc(cx - 6, cy + 6, 10, 0.2, 5); x.stroke(); x.strokeStyle = '#fe2c55'; x.beginPath(); x.arc(cx, cy, 10, 0.2, 5); x.stroke(); };
  const yt = (x, cx, cy) => { x.fillStyle = '#ff0033'; x.beginPath(); x.roundRect(cx - 18, cy - 12, 36, 24, 6); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx - 5, cy - 7); x.lineTo(cx + 8, cy); x.lineTo(cx - 5, cy + 7); x.fill(); };
  mkFeed(-8.5, 6.6, 1.0, 'x+', feedTex('Modo Directora', '#25f4ee', WEEKS.slice(1).map(w => w.rel[0]), tk));
  mkFeed(8.5, 5.8, 2.0, 'x-', feedTex('El otro lado de Ricardo', '#ff4b5c', WEEKS.slice(1).map(w => w.rel[1]), yt));

  /* Miradas distintas: un ecualizador que cruza la calle, como si la ciudad escuchara el podcast */
  const bars = [], barM = glow('#1ed760', 1.3);
  for (let i = 0; i < 30; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1, 0.24), barM); b.position.set(-5.2 + i * 0.36, 0.5, -5.2); eq.add(b); bars.push(b); }
  quad(eq, 4.2, 0.7, glow(signTex(['Miradas distintas'], { w: 1024, h: 170, bg: null, fg: '#1ed760', size: 110 }), 1.4, { transparent: true, depthWrite: false }), 0, 0.45, -3.9);

  /* La línea de tiempo en la fachada del café */
  const tl = quad(line, 11.5, 5.37, glow(timelineTex(), 1.0), 0, 7.25, -7.96);

  /* Las notas del mural de Emilia vuelan sobre la ciudad */
  const NN = 90, palette = ['#f4d873', '#f1b4a3', '#bdd8b4', '#b8d0e8', '#d9c9ec'];
  const notes = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.24, 0.24), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), NN);
  const ND = Array.from({ length: NN }, () => ({ x: rnd(-6.5, 6.5), y: rnd(0, 15), z: rnd(-9, 15), s: rnd(0.15, 0.45), r: rnd(6.28), w: rnd(0.4, 1.4) }));
  const col = new THREE.Color(); ND.forEach((n, i) => notes.setColorAt(i, col.set(palette[i % 5]).multiplyScalar(0.85)));
  uni.add(notes); const dm = new THREE.Object3D();

  /* EL ESTRENO: función al aire libre, proyectada sobre la fachada del café */
  const projMat = new THREE.MeshBasicMaterial({ map: signTex(['Así fue la noche'], { w: 1024, h: 576, bg: '#15121c', fg: '#f6efe2', size: 120, sub: 'ESTRENO DE YO, EMILIA · LIMA 2026', subSize: 30 }) });
  quad(screening, 9.2, 5.18, projMat, 0, 7.25, -7.95);
  const seat = mat('#2a2230', { rough: 1 }), leg = mat('#17181c', { rough: 0.4, metal: 0.7 });
  for (const z of [-1.2, 0.1, 1.4]) for (const x of [-2.8, -1.9, -1.0, 1.0, 1.9, 2.8]) chair(screening, x + rnd(-0.08, 0.08), z, Math.PI + rnd(-0.12, 0.12), seat, leg);
  const bulb = glow('#ffcf8f', 3);
  for (const z of [-4, -1, 2]) { const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, x = -6 + u * 12, y = 4.6 - 0.7 * Math.sin(Math.PI * u); pts.push(new THREE.Vector3(x, y, z)); if (i % 2 === 0) sph(screening, 0.05, bulb, x, y - 0.05, z, 8).castShadow = false; } screening.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#1a1410' }))); }

  /* luces y cámaras */
  const nightBase = { bg: '#060914', fog: ['#0e1430', 14, 90], exposure: 1.05, env: 0.25, hemi: ['#3a4a86', '#141018', 0.4] };
  sp.rigs.universo = { ...nightBase, grade: { temp: -0.06, sat: 1.2, vig: 1.15 }, bloom: 0.6, key: { p: [0, 14, 10], t: [0, 0, -4], c: '#9fb2ff', i: 260, angle: 0.8, pen: 0.8 },
    pts: [[-7.4, 6.6, 1, '#25f4ee', 40, 12], [7.4, 5.8, 2, '#ff4b5c', 40, 12], [0, 2.0, -4.6, '#1ed760', 14, 9], [0, 7.2, -6.6, '#ffd9a0', 22, 10]] };
  sp.rigs.estreno = { ...nightBase, bg: '#0a0a14', grade: { temp: 0.06, sat: 1.12, vig: 1.15 }, bloom: 0.55, key: { p: [0, 5, 13], t: [0, 7, -8], c: '#dfe8ff', i: 900, angle: 0.32, pen: 0.6 },
    pts: [[0, 4.3, -1, '#ffcf8f', 16, 9], [0, 7.2, -6.4, '#dfe8ff', 26, 12], [-3.5, 4.2, 2, '#ffcf8f', 10, 8], [3.5, 4.2, 2, '#ffcf8f', 10, 8]] };
  /* paradas: las pantallas (las 7 experiencias) → la fachada (línea de tiempo) → el ecualizador (semanas y podcast) */
  const P = (o, at, hold = 0) => ({ ...o, at, hold });
  const eqView = { p: [0, 1.9, 0.6], t: [0, 1.3, -5.2], fov: 56 };
  sp.cams.universo = [
    P({ p: [0, 13, 19], t: [0, 4, -6], fov: 58 }, 0, 0.08),
    P({ p: [-1.5, 7.6, 9.5], t: [-8.5, 6.6, 1] }, 0.19, 0.1),
    P({ p: [1.8, 5.6, 5.8], t: [8.5, 5.8, 2] }, 0.34, 0.1),
    P({ p: [0.6, 3.4, 2.6], t: [-2.4, 6.8, -8], fov: 56 }, 0.56, 0.2),
    P(eqView, 0.87, 0.26)
  ];
  /* el estreno: la función al aire libre */
  sp.cams.estreno = [P(eqView, 0, 0.04), P({ p: [0, 1.7, 4.4], t: [0, 6.6, -8], fov: 50 }, 0.3, 0.3), P({ p: [0.6, 2.2, 3.0], t: [0, 7.2, -8], fov: 54 }, 0.78, 0.44)];
  sp.hotspots.universo = [
    { id: 'pieza:0', p: [-8.4, 6.6, 1], label: 'Modo Directora', range: [0.12, 0.26] },
    { id: 'pieza:1', p: [8.4, 5.8, 2], label: 'El otro lado de Ricardo', range: [0.27, 0.42] },
    { id: 'pieza:2', p: [0, 2.6, -5.2], label: 'Miradas distintas', range: [0.72, 1] }
  ];
  sp.hotspots.estreno = [{ id: 'estreno', p: [0, 7.25, -7.9], label: 'Video resumen del evento', range: [0.15, 1] }];
  sp.projMat = projMat;

  hook(sp, 'enter', (id) => {
    uni.visible = id === 'universo' || id === 'estreno' || id === 'equipo';
    line.visible = id === 'universo'; eq.visible = id === 'universo'; screening.visible = id === 'estreno';
  });
  hook(sp, 'update', (time, l, t, id) => {
    if (!uni.visible) return;
    /* el feed salta de un video al siguiente cada 2,6 s */
    feeds.forEach((tx, k) => { const step = (time + k * 1.3) / 2.6, i = Math.floor(step), f = smooth((step - i) / 0.25); tx.offset.y = (4 - ((i + f) % 5)) / 5; });
    if (eq.visible) bars.forEach((b, i) => { const h = 0.2 + 2.1 * Math.abs(Math.sin(time * 2.3 + i * 0.42) * Math.sin(time * 1.1 + i * 0.13)); b.scale.y = h; b.position.y = h / 2; });
    if (line.visible) tl.material.color.setScalar(0.92 + 0.08 * Math.sin(time * 1.7));
    ND.forEach((n, i) => { dm.position.set(n.x + Math.sin(time * 0.3 + n.r) * 0.6, (n.y + time * n.s) % 15 + 0.5, n.z); dm.rotation.set(Math.sin(time * n.w + n.r) * 0.8, time * 0.3 * n.w + n.r, Math.cos(time * n.w) * 0.5); dm.updateMatrix(); notes.setMatrixAt(i, dm.matrix); });
    notes.instanceMatrix.needsUpdate = true;
  });
}

export function dress(S) {
  if (S.cuarto) dressRoom(S.cuarto);
  if (S.calle) dressCity(S.calle);
}
