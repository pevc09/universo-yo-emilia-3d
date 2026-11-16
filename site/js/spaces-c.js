// Espacios III: vestuario cinematográfico. Rayos de luz, polvo en el aire, luces que cambian con el scroll,
// los paneles del universo transmedia en la calle y la sala convertida en noche de estreno.
import * as THREE from 'three';
import { mat, glow, box, cyl, sph, quad, chair, canvasTex, signTex, noteTex, wrap, rnd, seed, T } from './kit.js';

const smooth = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
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
/* Polvo suspendido en el aire */
function dust(g, c, s, n, size = 0.012, op = 0.5) {
  const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = c[0] + rnd(-s[0], s[0]); p[i * 3 + 1] = c[1] + rnd(-s[1], s[1]); p[i * 3 + 2] = c[2] + rnd(-s[2], s[2]); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffe6c2', size, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(pts);
  return (time) => { pts.position.y = Math.sin(time * 0.12) * 0.06; pts.position.x = Math.sin(time * 0.07) * 0.08; pts.rotation.y = Math.sin(time * 0.05) * 0.03; };
}
/* Encadena una función extra al update/enter de un espacio */
const hook = (sp, name, fn) => { const old = sp[name]; sp[name] = (...a) => { old && old(...a); fn(...a); }; };

function panelTex(title, sub, bg, a, b, draw) {
  return canvasTex(512, 768, (x, w, h) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h); draw(x, w, h);
    x.textAlign = 'left'; x.font = '74px "Permanent Marker", cursive';
    x.fillStyle = b; wrap(x, title, 44, 474, w - 70, 76); x.fillStyle = '#fff'; wrap(x, title, 40, 470, w - 70, 76);
    x.fillStyle = a; x.font = '700 27px "Courier Prime", monospace'; wrap(x, sub, 40, 690, w - 70, 34);
  });
}

export function dress(S) {
  seed(909);
  /* ============ CALLE: atardecer de la portada, noche de pantallas, amanecer ============ */
  {
    const sp = S.calle, g = sp.group;
    const dusk = new THREE.Mesh(new THREE.SphereGeometry(134, 24, 16), new THREE.MeshBasicMaterial({ map: T.sky([[0, '#3f4664'], [0.3, '#7d6f80'], [0.44, '#d99a6c'], [0.52, '#ffc27a'], [0.58, '#f09a58'], [1, '#6a4a44']]), side: THREE.BackSide, fog: false, depthWrite: false, transparent: true }));
    dusk.rotation.y = Math.PI; g.add(dusk);
    /* el afiche real del corto en el panel de la vereda */
    const poster = new THREE.TextureLoader().load('img/portada.webp'); poster.colorSpace = THREE.SRGBColorSpace; poster.repeat.set(0.745, 1); poster.offset.set(0.13, 0);
    if (g.userData.mupi) quad(g.userData.mupi, 1.24, 1.86, glow(poster, 1.0), 0, 1.38, 0.09);
    /* tres pantallas, una por pieza del universo */
    const mk = (x, z, tex) => { const p = new THREE.Group(); p.position.set(x, 0.16, z); p.rotation.y = x < 0 ? Math.PI / 2 - 0.25 : -Math.PI / 2 + 0.25; g.add(p); const fr = mat('#15161a', { rough: 0.5, metal: 0.6 }); box(p, 1.4, 2.1, 0.16, fr, 0, 1.35, 0); quad(p, 1.24, 1.86, glow(tex, 1.15), 0, 1.38, 0.085); box(p, 0.12, 0.3, 0.12, fr, 0, 0.15, 0); };
    mk(4.75, 11.5, panelTex('El otro lado de Ricardo', 'MINISERIE · YOUTUBE SHORTS', '#1c0c0c', '#ff8a7a', '#ff3b30', (x, w) => { x.fillStyle = '#ff3b30'; x.beginPath(); x.roundRect(w / 2 - 110, 110, 220, 220, 50); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(w / 2 - 40, 165); x.lineTo(w / 2 + 62, 220); x.lineTo(w / 2 - 40, 275); x.fill(); }));
    mk(-4.75, 9, panelTex('Modo Directora', 'MICROSERIE · TIKTOK · 5 CAPS.', '#0c0c12', '#7ff5f0', '#fe2c55', (x, w) => { for (const [c, o] of [['#25f4ee', -8], ['#fe2c55', 8], ['#fff', 0]]) { x.strokeStyle = c; x.lineWidth = 26; x.beginPath(); x.arc(w / 2 - 30 + o, 250 + o, 62, 0.2, Math.PI * 1.6); x.moveTo(w / 2 + 32 + o, 250 + o); x.lineTo(w / 2 + 32 + o, 90 + o); x.arc(w / 2 + 92 + o, 100 + o, 60, Math.PI, Math.PI / 2, true); x.stroke(); } }));
    mk(-4.75, 2.6, panelTex('Miradas distintas', 'PODCAST · SPOTIFY · 5 EPISODIOS', '#0a1a10', '#8dffb8', '#1ed760', (x, w) => { x.fillStyle = '#1ed760'; x.beginPath(); x.arc(w / 2, 220, 120, 0, 7); x.fill(); x.strokeStyle = '#0a1a10'; x.lineCap = 'round'; [[70, 22], [58, 18], [46, 14]].forEach(([r, lw], i) => { x.lineWidth = lw; x.beginPath(); x.arc(w / 2, 300 + i * 34, r + 60 - i * 6, Math.PI * 1.22, Math.PI * 1.78); x.stroke(); }); }));

    const night = sp.rigs.inicio;
    sp.rigs.universo = { ...night, bg: '#070a18', fog: ['#101634', 12, 80], grade: { temp: -0.06, sat: 1.18, vig: 1.15 }, bloom: 0.62, hemi: ['#3a4a86', '#141018', 0.44],
      pts: [[-4.1, 1.5, 9, '#ff4f7a', 6, 8], [4.1, 1.5, 11.5, '#ff5a4a', 6, 8], [-4.1, 1.5, 2.6, '#3be07a', 6, 8], [4.2, 1.5, 5.3, '#ffd9b8', 3, 6]] };
    sp.rigs.inicio = { bg: '#c98a62', fog: ['#b98468', 22, 130], exposure: 1.0, env: 0.45, grade: { temp: 0.1, sat: 1.06, vig: 1.0 }, bloom: 0.38,
      hemi: ['#f2b98a', '#3a2c2a', 0.95], key: { p: [4, 11, 34], t: [0, 0, -6], c: '#ffab5e', i: 3600, angle: 0.7, pen: 0.8 },
      pts: [[-3.6, 5, 7, '#ffcc8c', 2, 16], [3.6, 5, -2, '#ffcc8c', 2, 16], [-2.2, 1.9, -6.6, '#ffae62', 4, 9], [4.2, 1.5, 5.3, '#ffd9b8', 1, 6]],
      from: 0.35, until: 0.95,
      to: { bg: '#1a1830', fog: ['#2a2440', 16, 95], hemi: ['#4a5c96', '#1c1612', 0.5], key: { c: '#ffb878', i: 420 }, grade: { temp: -0.02, sat: 1.08, vig: 1.1 }, bloom: 0.45,
        pts: [[0, 0, 0, '#ffcc8c', 22], [0, 0, 0, '#ffcc8c', 22], [0, 0, 0, '#ffae62', 7], [0, 0, 0, '#ffd9b8', 1.6]] } };
    sp.cams.universo = [{ p: [0.4, 1.7, 16.5], t: [4.75, 1.5, 11.5] }, { p: [1.0, 1.66, 13], t: [-4.75, 1.45, 9] }, { p: [-0.6, 1.66, 9.2], t: [4.9, 1.45, 5.6] }, { p: [0.8, 1.66, 5.6], t: [-4.75, 1.45, 2.6] }, { p: [0, 1.7, 1.5], t: [-1.5, 2.6, -8] }];
    sp.hotspots.universo = [{ id: 'pieza:1', p: [4.6, 1.6, 11.5], label: 'El otro lado de Ricardo', range: [0, 0.3] }, { id: 'pieza:0', p: [-4.6, 1.6, 9], label: 'Modo Directora', range: [0.15, 0.5] }, { id: 'pieza:2', p: [-4.6, 1.6, 2.6], label: 'Miradas distintas', range: [0.55, 0.9] }];
    hook(sp, 'enter', (id) => { dusk.visible = id === 'inicio'; });
    hook(sp, 'update', (time, l, t, id) => { if (id === 'inicio') dusk.material.opacity = 1 - 0.8 * smooth((t - 0.35) / 0.6); });
  }
  /* ============ CAFETERÍA: luz fría que entra en diagonal ============ */
  {
    const sp = S.cafeteria, g = sp.group, r = sp.rigs.historia;
    for (const z of [-2.6, 0.4, 3.4]) shaft(g, [-4.45, 1.9, z], [-0.6, 0.05, z + 0.9], 2.3, 1.7, '#dfeaff', 0.1);
    const d = dust(g, [-2, 1.5, 0.5], [2.4, 1.2, 4], 260, 0.012, 0.4); hook(sp, 'update', d);
    r.hemi[2] = 0.3; r.key.i = 40; r.key.pen = 0.6; r.grade = { temp: -0.14, sat: 0.84, vig: 1.05 }; sp.hotspots.historia = [];
  }
  /* ============ CINECLUB: ahora proyecta el corto ============ */
  {
    const sp = S.cineclub;
    sp.rigs.corto = sp.rigs.universo; sp.cams.corto = sp.cams.universo; delete sp.rigs.universo;
    sp.hotspots.corto = [{ id: 'trailer', p: [0, 2.35, -6.3], label: 'Reproducir el corto', range: [0.15, 0.95] }];
  }
  /* ============ RESTAURANTE: hora dorada por los arcos ============ */
  {
    const sp = S.restaurante, g = sp.group, r = sp.rigs.personajes;
    for (const x of [-3, 0, 3]) shaft(g, [x, 2.3, -4.45], [x + 1.1, 0.05, -0.4], 1.7, 2.2, '#ffb070', 0.13);
    const d = dust(g, [0.5, 1.5, -1], [4, 1.3, 3], 300, 0.013, 0.5); hook(sp, 'update', d);
    r.hemi[2] = 0.3; r.key.i = 52; r.key.pen = 0.55; r.grade = { temp: 0.14, sat: 1.1, vig: 1.05 };
  }
  /* ============ CUARTO: el atardecer de la portada que se vuelve noche ============ */
  {
    const sp = S.cuarto, g = sp.group, W = 5.2, dy = 0.76, dz = -1.92, BZ = -2.3;
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
    const d = dust(g, [0.6, 1.3, -0.4], [1.8, 1.0, 1.6], 320, 0.011, 0.6);
    /* utilería de la portada: libros, café, cámara y sus dos notas */
    ['CINE', 'DIRECCIÓN', 'GUION', 'AUDIOVISUAL'].forEach((t, i) => { const c = ['#3a3f45', '#4b4f55', '#30343a', '#55524c'][i]; box(g, 0.26, 0.04, 0.18, mat(c, { rough: 0.7 }), -0.5, dy + 0.02 + i * 0.041, dz + 0.2, 0.08 * (i % 2)); quad(g, 0.24, 0.032, mat(signTex([t], { w: 512, h: 64, bg: c, fg: '#e9e2d2', font: '"Instrument Sans", sans-serif', size: 40 }), { rough: 0.7 }), -0.5, dy + 0.02 + i * 0.041, dz + 0.292, 'z+'); });
    cyl(g, 0.04, 0.032, 0.11, mat('#2a2622', { rough: 0.6 }), 0.5, dy + 0.055, dz + 0.02, 18); cyl(g, 0.042, 0.042, 0.012, mat('#111', { rough: 0.4 }), 0.5, dy + 0.116, dz + 0.02, 18);
    box(g, 0.13, 0.085, 0.07, mat('#111214', { rough: 0.4 }), 0.98, dy + 0.045, dz + 0.22, -0.4); cyl(g, 0.034, 0.038, 0.07, mat('#0a0a0b', { rough: 0.2, metal: 0.6 }), 0.955, dy + 0.045, dz + 0.275, 16).rotation.set(Math.PI / 2, 0, 0.4);
    quad(g, 0.2, 0.2, mat(noteTex('Guion\nRodaje\nFestivales\nDistribución\nSueños', '#f4d873', { size: 54 }), { rough: 0.9 }), 0.78, 1.4, BZ + 0.04, 'z+', -0.05);
    quad(g, 0.3, 0.3, mat(noteTex('La historia también es una forma de existir.', '#f2e2b0', { size: 58 }), { rough: 0.9 }), 1.8, 1.17, BZ + 0.006, 'z+', 0.04);

    const nightPts = [[-0.3, 1.1, -1.7, '#ffb463', 1.5, 3.8], [2.2, 1.6, 0.7, '#7a98e0', 1.1, 4.5], [0.2, 2.3, -1.7, '#ffcc88', 1.5, 5], [2.4, 0.9, -0.75, '#ff9a5c', 0.3, 3]];
    const base = { bg: '#0b0806', fog: ['#140d08', 7, 18], exposure: 1.0, env: 0.2 };
    sp.rigs.mural = { ...base, grade: { temp: 0.12, sat: 1.1, vig: 1.1 }, bloom: 0.36, hemi: ['#ffd3a2', '#241610', 0.34], key: { p: [6.2, 2.9, 1.7], t: [-0.6, 0.6, -1.2], c: '#7f96d8', i: 110, angle: 0.42, pen: 0.4 }, pts: nightPts };
    sp.rigs.archivo = { ...base, bg: '#1a0f08', grade: { temp: 0.17, sat: 1.12, vig: 1.1 }, bloom: 0.46, hemi: ['#ffc890', '#2a1a12', 0.3], key: { p: [6.2, 2.4, 1.7], t: [-0.6, 0.9, -1.4], c: '#ffa24a', i: 520, angle: 0.42, pen: 0.4 },
      pts: [[-0.3, 1.1, -1.7, '#ffb463', 0.12, 3.8], [2.2, 1.6, 0.7, '#ffb070', 1.4, 4.5], [0.2, 2.3, -1.7, '#ffcc88', 0.08, 5], [2.4, 0.9, -0.75, '#ff9a5c', 0.08, 3]],
      from: 0.42, until: 0.92, to: { bg: '#0b0806', hemi: ['#ffd3a2', '#241610', 0.34], key: { p: [6.2, 2.9, 1.7], t: [-0.6, 0.6, -1.2], c: '#7f96d8', i: 110 }, grade: { temp: 0.12, sat: 1.1, vig: 1.1 }, bloom: 0.36, pts: nightPts } };
    hook(sp, 'update', (time, l, t, id) => { const k = id === 'mural' ? 1 : smooth((t - 0.42) / 0.5); sky.material.opacity = 1 - k; ray.opacity = 0.2 * (1 - k); d(time); });
  }
  /* ============ SALA: la noche del estreno ============ */
  {
    const sp = S.melon, g = sp.group, wood = mat('#3a2a1e', { rough: 0.5 });
    ['Foto · proyección', 'Foto · conversatorio', 'Foto · mural físico', 'Foto · brindis'].forEach((t, i) => {
      const z = -2.9 + i * 1.15, tex = canvasTex(384, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, ['#6b5346', '#4a4458', '#7a5a3a', '#5a3f3a'][i]); gr.addColorStop(1, '#1c1512'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#f1e6d2'; x.font = '22px "Courier Prime", monospace'; x.textAlign = 'center'; x.fillText(t, w / 2, h / 2 + 6); });
      box(g, 0.04, 0.7, 1.0, wood, 3.97, 1.75, z); quad(g, 0.9, 0.6, glow(tex, 0.95), 3.945, 1.75, z, 'x-');
    });
    /* mesa del brindis */
    box(g, 1.6, 0.74, 0.7, mat('#e9e2d2', { rough: 0.9 }), -2.7, 0.37, 3.6);
    const gl = mat('#f3ead2', { rough: 0.05, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 12; i++) { const x = -3.3 + (i % 6) * 0.22, z = 3.45 + Math.floor(i / 6) * 0.2; cyl(g, 0.028, 0.02, 0.11, gl, x, 0.86, z, 12); cyl(g, 0.004, 0.004, 0.06, gl, x, 0.775, z, 6); }
    for (const x of [-2.15, -2.0]) { cyl(g, 0.04, 0.04, 0.22, mat('#1f3a2a', { rough: 0.2 }), x, 0.85, 3.7, 14); cyl(g, 0.014, 0.02, 0.1, mat('#1f3a2a', { rough: 0.2 }), x, 1.01, 3.7, 10); }
    /* público y guirnaldas */
    const fab = mat('#2a2230', { rough: 1 }), leg = mat('#17181c', { rough: 0.4, metal: 0.7 });
    for (const z of [2.3, 3.2]) for (const x of [-2.4, -1.7, -1.0, 1.0, 1.7, 2.4]) chair(g, x, z, Math.PI + rnd(-0.1, 0.1), fab, leg);
    const bulb = glow('#ffcf8f', 3);
    for (const z of [-1.2, 0.8, 2.8]) for (let i = 0; i <= 16; i++) { const u = i / 16; sph(g, 0.022, bulb, -3.9 + u * 7.8, 3.05 - 0.22 * Math.sin(Math.PI * u), z, 8).castShadow = false; }
    sp.rigs.estreno = { bg: '#0a0706', fog: ['#150e0a', 8, 28], exposure: 1.05, env: 0.3, grade: { temp: 0.1, sat: 1.12, vig: 1.12 }, bloom: 0.55,
      hemi: ['#9a7a6a', '#2a1c18', 1.0], key: { p: [0.2, 3.25, 1.6], t: [0, 0, -1.6], c: '#ffd9a8', i: 120, angle: 0.9, pen: 0.9 },
      pts: [[0, 2.2, -4.2, '#ff9a55', 5.5, 9], [-2.4, 1.7, 0.9, '#dfe8ff', 1, 5], [0, 2.8, 0.8, '#ffc680', 2.6, 7], [2.8, 2.3, -1.2, '#ffd9b0', 4.5, 6]] };
    sp.cams.estreno = [{ p: [0.2, 1.62, 4.7], t: [0, 1.4, -2.8] }, { p: [0, 1.58, 3.0], t: [0, 1.35, -3] }, { p: [0, 1.52, 1.25], t: [0, 1.55, -4.9], fov: 52 }, { p: [0.2, 1.5, 0.5], t: [3.98, 1.75, -1.2], fov: 60 }];
    sp.hotspots.estreno = [{ id: 'estreno', p: [-3.0, 1.75, 0.35], label: 'Video resumen del evento', range: [0.1, 0.6] }, { id: 'estreno', p: [3.9, 1.75, -1.2], label: 'Las fotos de la noche', range: [0.72, 1] }];
  }
}
