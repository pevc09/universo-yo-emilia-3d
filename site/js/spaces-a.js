// Espacios I: la calle de Lima, la cafetería y el restaurante.
import * as THREE from 'three';
import { T, rep, mat, glow, box, cyl, sph, quad, room, chair, roundTable, rectTable, cup, pendant, plant, blob, canvasTex, signTex, paperTex, wrap, seed, rnd, pick, shade } from './kit.js';

/* =====================================================================
   EXT. CALLE DE LIMA — noche (inicio) y amanecer (créditos)
   ===================================================================== */
export function calle() {
  const g = new THREE.Group(); seed(11);
  quad(g, 70, 110, mat(rep(T.asphalt(), 8, 14), { rough: 0.3 }), 0, 0, -15, 'y+');
  const side = mat(rep(T.concrete('#50535a'), 2, 24), { rough: 0.75 });
  box(g, 4, 0.16, 70, side, -6.5, 0.08, -5); box(g, 4, 0.16, 70, side, 6.5, 0.08, -5);
  const paint = mat('#c8c6bc', { rough: 0.5 });
  for (let i = 0; i < 8; i++) box(g, 0.5, 0.012, 2.6, paint, -3.5 + i, 0.006, 4.2, 0, false);
  for (let i = 0; i < 7; i++) box(g, 0.14, 0.012, 1.6, paint, 0, 0.006, 22 - i * 3.6 - (i > 4 ? 4 : 0), 0, false);

  const facades = [];
  const bld = (x, z, w, h, d, cols, rows, wall, lit, ei = 1.1) => {
    const f = T.facade(cols, rows, wall, lit); const m = mat(f.map, { rough: 0.92, emissiveMap: f.emissiveMap, ei }); m.userData.ei = ei; facades.push(m);
    return box(g, w, h, d, m, x, h / 2, z);
  };
  bld(-12.5, 12, 8, 12, 10, 4, 6, '#2c2a33', 0.4); bld(-12.5, 1, 8, 16, 11, 4, 8, '#33303a', 0.35); bld(-12.5, -10, 8, 10, 10, 4, 5, '#28303a', 0.45);
  bld(12.5, 13, 8, 14, 10, 4, 7, '#302c30', 0.4); bld(12.5, 2, 8, 11, 11, 4, 5, '#2a2f38', 0.5); bld(12.5, -9.5, 8, 17, 10, 4, 8, '#34303a', 0.3);
  for (let i = 0; i < 16; i++) { const h = rnd(14, 34); bld(rnd(-48, 48), rnd(-34, -70), rnd(7, 13), h, 8, 4, Math.round(h / 2.2), pick(['#1c1f2c', '#22202c', '#1a2230']), rnd(0.15, 0.4), 0.8); }

  /* El café al fondo de la calle */
  const cafe = new THREE.Group(); g.add(cafe);
  bld(0, -13, 17, 10, 10, 6, 4, '#3a3038', 0.3);
  box(cafe, 17, 3.5, 0.25, mat(rep(T.wood('#3b2a20'), 4, 1), { rough: 0.6 }), 0, 1.75, -7.92);
  const inside = canvasTex(1024, 512, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffcf8a'); gr.addColorStop(1, '#c9703a'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { const cx = 110 + i * 200; const r = x.createRadialGradient(cx, 120, 4, cx, 120, 150); r.addColorStop(0, 'rgba(255,246,214,.95)'); r.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = r; x.fillRect(cx - 150, 0, 300, 300); }
    x.fillStyle = 'rgba(60,30,18,.75)';
    for (let i = 0; i < 4; i++) { const bx = 80 + i * 250; x.fillRect(bx, 350, 150, 12); x.fillRect(bx + 68, 360, 14, 152); x.fillRect(bx - 50, 330, 44, 182); x.fillRect(bx + 158, 330, 44, 182); }
    x.fillStyle = 'rgba(40,20,12,.9)'; x.fillRect(0, 0, w, 14); x.fillRect(0, h - 14, w, 14); x.fillRect(w / 2 - 7, 0, 14, h);
  });
  quad(cafe, 5.6, 2.3, glow(inside, 1.05), -2.3, 1.75, -7.78);
  box(cafe, 1.15, 2.4, 0.08, mat(rep(T.wood('#4a3324'), 1, 1), { rough: 0.5 }), 2.5, 1.2, -7.8);
  quad(cafe, 0.7, 1.2, glow('#ffc078', 1.0), 2.5, 1.55, -7.75);
  const awn = canvasTex(256, 64, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f3e6cf' : '#e8794a'; x.fillRect(i * 32, 0, 32, h); } });
  const aw = box(cafe, 7.4, 0.06, 1.7, mat(awn, { rough: 0.9 }), -1.6, 3.15, -7.05); aw.rotation.x = 0.28;
  const neon = signTex('Café Pasaje', { w: 1024, h: 256, bg: null, fg: '#ffd9a8', size: 150 });
  const neonM = glow(neon, 1.6, { transparent: true, depthWrite: false }); quad(cafe, 3.6, 0.9, neonM, -1.6, 4.25, -7.76);
  plant(cafe, -5.6, -7.3, 1.2); plant(cafe, 1.3, -7.3, 1.0);

  /* Postes de luz */
  const pole = mat('#17181c', { rough: 0.5, metal: 0.6 });
  for (const [x, z] of [[-4.6, 7], [4.6, -2], [-4.6, -11], [4.6, 16]]) {
    cyl(g, 0.07, 0.09, 5.2, pole, x, 2.6, z, 10); box(g, 1.1, 0.07, 0.07, pole, x - Math.sign(x) * 0.5, 5.15, z);
    sph(g, 0.16, glow('#ffd49a', 2), x - Math.sign(x) * 1.0, 5.05, z, 10).castShadow = false;
  }
  /* Panel publicitario con el afiche del corto */
  const afiche = canvasTex(512, 768, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2e2840'); gr.addColorStop(0.6, '#7a4e4a'); gr.addColorStop(1, '#e09a62'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f6efe2'; x.textAlign = 'center'; x.font = '112px "Permanent Marker", cursive'; x.fillText('Yo,', w / 2, 300); x.fillText('Emilia', w / 2, 410);
    x.font = 'italic 30px "Newsreader", serif'; wrap(x, 'El rechazo no es el final de la historia.', w / 2, 500, 400, 38, 'center');
    x.font = '22px "Courier Prime", monospace'; x.fillText('UN CORTOMETRAJE · LIMA 2026', w / 2, 700);
  });
  const mupi = new THREE.Group(); g.userData.mupi = mupi; mupi.position.set(5.0, 0.16, 5.5); mupi.rotation.y = -Math.PI / 2 + 0.25; g.add(mupi);
  box(mupi, 1.4, 2.1, 0.16, pole, 0, 1.35, 0); quad(mupi, 1.24, 1.86, glow(afiche, 0.9), 0, 1.38, 0.085); box(mupi, 0.12, 0.3, 0.12, pole, 0, 0.15, 0);

  /* Cielos */
  const dome = (stops) => { const m = new THREE.Mesh(new THREE.SphereGeometry(140, 24, 16), new THREE.MeshBasicMaterial({ map: T.sky(stops), side: THREE.BackSide, fog: false, depthWrite: false })); m.rotation.y = Math.PI; g.add(m); return m; };
  const skyNight = dome([[0, '#070a18'], [0.42, '#141a3a'], [0.52, '#3a2f5a'], [0.6, '#7d4a52'], [1, '#1a1420']]);
  const skyDawn = dome([[0, '#5c6ea8'], [0.38, '#c9a9b8'], [0.5, '#ffc893'], [0.58, '#ffe2b0'], [1, '#d9b08c']]);
  skyDawn.visible = false;

  /* Garúa limeña */
  const N = 900, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = rnd(-12, 12); pos[i * 3 + 1] = rnd(0, 9); pos[i * 3 + 2] = rnd(-10, 18); }
  const rainG = new THREE.BufferGeometry(); rainG.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const rain = new THREE.Points(rainG, new THREE.PointsMaterial({ color: '#cfd8ff', size: 0.03, transparent: true, opacity: 0.5, depthWrite: false }));
  g.add(rain);

  return {
    group: g,
    rigs: {
      inicio: {
        bg: '#0b1024', fog: ['#141a36', 14, 85], exposure: 1.05, env: 0.25, grade: { temp: -0.04, sat: 1.05, vig: 1.1 }, bloom: 0.42,
        hemi: ['#4a5c96', '#1c1612', 0.5],
        key: { p: [-2, 8, 1], t: [-2, 0, -7], c: '#ffb878', i: 90, angle: 0.75, pen: 0.9 },
        pts: [[-3.6, 5, 7, '#ffcc8c', 22, 16], [3.6, 5, -2, '#ffcc8c', 22, 16], [-2.2, 1.9, -6.6, '#ffae62', 7, 9], [4.2, 1.5, 5.3, '#ffd9b8', 1.6, 6]]
      },
      equipo: {
        bg: '#f0bb90', fog: ['#f2c7a2', 30, 150], exposure: 1.0, env: 0.5, grade: { temp: 0.1, sat: 1.05, vig: 0.7 }, bloom: 0.18,
        hemi: ['#ffe1bd', '#6a5850', 1.1],
        key: { p: [16, 14, 12], t: [0, 0, -6], c: '#ffc48e', i: 1300, angle: 0.8, pen: 0.6 },
        pts: [[-3.6, 5, 7, '#ffcc8c', 4, 10], [3.6, 5, -2, '#ffcc8c', 4, 10], [-2.2, 1.9, -6.6, '#ffae62', 8, 8], [4.2, 1.5, 5.3, '#ffd9b8', 2, 5]]
      }
    },
    cams: {
      inicio: [{ p: [0.8, 1.7, 17], t: [0, 3.4, -8] }, { p: [0.3, 1.66, 9], t: [-0.6, 2.8, -8] }, { p: [-0.5, 1.62, 0.5], t: [-1.5, 2.0, -8] }, { p: [-1.5, 1.58, -4.4], t: [-2.2, 1.65, -8] }],
      equipo: [{ p: [-1.2, 1.7, -2.5], t: [-0.5, 3.2, -8] }, { p: [-0.4, 3.6, 5], t: [0, 6.5, -14] }, { p: [0.4, 9.5, 13], t: [0, 12, -40] }, { p: [0.6, 13, 17], t: [0, 17, -60] }]
    },
    hotspots: {},
    enter(sceneId) { const dawn = sceneId === 'equipo'; skyDawn.visible = dawn; skyNight.visible = !dawn; rain.visible = !dawn; facades.forEach(m => { m.emissiveIntensity = m.userData.ei * (dawn ? 0.3 : 1); }); },
    update(time) {
      if (!rain.visible) return;
      const a = rainG.attributes.position;
      for (let i = 0; i < N; i++) { let y = a.getY(i) - 0.09; if (y < 0) y = 9; a.setY(i, y); }
      a.needsUpdate = true;
      neonM.color.setScalar(1.6 * (Math.sin(time * 37) > 0.96 ? 0.55 : 1));
    }
  };
}

/* =====================================================================
   INT. CAFETERÍA — día. Luz fría y neutra: aquí empiezan los rechazos.
   ===================================================================== */
export function cafeteria() {
  const g = new THREE.Group(); seed(22);
  const W = 9, H = 3.3, D = 11;
  const upper = T.plaster('#d9dedb');
  const wallTex = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#d7dcd8'; x.fillRect(0, 0, w, h); x.fillStyle = '#5b6f6a'; x.fillRect(0, h * 0.62, w, h * 0.38);
    x.fillStyle = '#44544f'; x.fillRect(0, h * 0.62, w, 8);
    for (let i = 0; i < 8; i++) { x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 2; x.strokeRect(i * 64 + 6, h * 0.66, 52, h * 0.3); }
  });
  const wall = (rx) => mat(rep(wallTex, rx, 1), { rough: 0.9 });
  room(g, { w: W, h: H, d: D, floor: mat(rep(T.tiles('#d4d8d2', '#39474a', 4), 4.5, 5.5), { rough: 0.35 }), wall: wall(5), ceil: mat(upper, { rough: 1 }), walls: { left: wall(6), right: wall(6) } });

  /* Ventanales a la izquierda: día nublado de Lima */
  const day = canvasTex(256, 256, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4f7fb'); gr.addColorStop(1, '#c9d3dd'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(120,135,150,.5)'; for (let i = 0; i < 7; i++) x.fillRect(i * 40 - 6, h - rnd(40, 110), 34, 120);
  });
  const frame = mat('#27302f', { rough: 0.5 });
  for (const z of [-2.6, 0.4, 3.4]) {
    quad(g, 2.4, 1.9, glow(day, 1.1), -W / 2 + 0.01, 1.85, z, 'x+');
    box(g, 0.06, 1.98, 0.06, frame, -W / 2 + 0.04, 1.85, z); box(g, 0.06, 0.06, 2.48, frame, -W / 2 + 0.04, 1.85, z);
    box(g, 0.08, 0.08, 2.56, frame, -W / 2 + 0.04, 0.86, z); box(g, 0.08, 0.08, 2.56, frame, -W / 2 + 0.04, 2.84, z);
    box(g, 0.08, 2.06, 0.08, frame, -W / 2 + 0.04, 1.85, z - 1.24); box(g, 0.08, 2.06, 0.08, frame, -W / 2 + 0.04, 1.85, z + 1.24);
  }
  /* Barra al fondo */
  const dark = mat(rep(T.wood('#33261d'), 2, 1), { rough: 0.5 }), steel = mat('#aeb4b8', { rough: 0.25, metal: 0.9 }), white = mat('#f1efe9', { rough: 0.35 });
  box(g, 4.6, 1.02, 0.8, dark, 1.6, 0.51, -4.3); box(g, 4.8, 0.05, 0.95, mat('#d9d6cf', { rough: 0.2 }), 1.6, 1.05, -4.3);
  box(g, 0.75, 0.5, 0.5, steel, 2.9, 1.33, -4.35); box(g, 0.6, 0.08, 0.36, mat('#1d1f22', { rough: 0.3 }), 2.9, 1.62, -4.35); cyl(g, 0.03, 0.03, 0.2, steel, 2.7, 1.2, -4.08, 8); cyl(g, 0.03, 0.03, 0.2, steel, 3.1, 1.2, -4.08, 8);
  box(g, 1.3, 0.42, 0.5, mat('#cfe3ea', { rough: 0.05, transparent: true, opacity: 0.25 }), 0.5, 1.29, -4.3, 0, false);
  for (let i = 0; i < 5; i++) cyl(g, 0.09, 0.09, 0.05, mat(pick(['#c98f4e', '#a86a3a', '#e3c08a']), { rough: 0.7 }), 0.05 + i * 0.22, 1.12, -4.3, 14);
  for (let i = 0; i < 7; i++) cyl(g, 0.04, 0.035, 0.09, white, -0.3 + i * 0.14, 1.12, -4.52, 12);
  const menu = canvasTex(1024, 512, (x, w, h) => {
    x.fillStyle = '#1c2422'; x.fillRect(0, 0, w, h); x.fillStyle = '#e9efe6'; x.font = '64px "Permanent Marker", cursive'; x.fillText('Café Pasaje', 50, 90);
    x.font = '34px "Caveat", cursive';
    [['Pasado', '6'], ['Americano', '7'], ['Capuchino', '9'], ['Chocolate', '9'], ['Emoliente', '5']].forEach((r, i) => { x.fillText(r[0], 60, 170 + i * 58); x.fillText('S/ ' + r[1], 360, 170 + i * 58); });
    [['Pan con chicharrón', '14'], ['Triple', '12'], ['Empanada', '7'], ['Alfajor', '4'], ['Torta de chocolate', '10']].forEach((r, i) => { x.fillText(r[0], 520, 170 + i * 58); x.fillText('S/ ' + r[1], 900, 170 + i * 58); });
  });
  box(g, 3.3, 1.5, 0.05, frame, 1.6, 2.2, -D / 2 + 0.04); quad(g, 3.1, 1.34, mat(menu, { rough: 0.95 }), 1.6, 2.2, -D / 2 + 0.07);
  box(g, 2, 0.04, 0.24, dark, -2.4, 1.9, -D / 2 + 0.14); for (let i = 0; i < 9; i++) cyl(g, 0.045, 0.04, 0.11, white, -3.2 + i * 0.2, 1.98, -D / 2 + 0.14, 12);

  /* Mesas */
  const top = mat(rep(T.wood('#6f5a48'), 1, 1), { rough: 0.45 }), leg = mat('#1f2224', { rough: 0.4, metal: 0.7 }), seat = mat(rep(T.wood('#3d4a47'), 1, 1), { rough: 0.6 });
  const tables = [[-2.3, 0.4], [1.9, 1.7], [2.2, -1.4], [-2.3, -2.7], [-2.3, 3.4]];
  tables.forEach(([x, z], i) => {
    roundTable(g, x, z, 0.42, top, leg);
    chair(g, x - 0.72, z, Math.PI / 2 + rnd(-0.2, 0.2), seat, leg); chair(g, x + 0.72, z, -Math.PI / 2 + rnd(-0.2, 0.2), seat, leg);
    pendant(g, x, 2.25, z, H, mat('#2c3534', { rough: 0.5, side: THREE.DoubleSide }), '#fff3df', 0.2, 2.2);
  });
  /* La mesa de Emilia y Ricardo */
  const [hx, hz] = tables[0], ty = 0.762;
  cup(g, hx - 0.2, ty, hz + 0.12, white); cup(g, hx + 0.22, ty, hz - 0.1, white, '#3a2414');
  const carta = paperTex(['Estimada Emilia Cisneros:', 'Lamentamos informarle que su proyecto «La ladrona de sueños» no ha sido seleccionado en la presente convocatoria.', 'Recibimos un número muy alto de postulaciones.', 'Le deseamos éxitos en sus próximos proyectos.', '', 'Atentamente,', 'El comité evaluador'], { title: 'RESULTADO DE LA POSTULACIÓN', size: 19 });
  for (let i = 0; i < 4; i++) quad(g, 0.21, 0.297, mat(i === 3 ? carta : '#efeadf', { rough: 0.9 }), hx - 0.02 + rnd(-0.015, 0.015), ty + 0.002 + i * 0.0015, hz + 0.02, 'y+', 0.5 + rnd(-0.12, 0.12));
  box(g, 0.075, 0.008, 0.15, mat('#0e0f11', { rough: 0.2 }), hx + 0.16, ty + 0.004, hz + 0.24, 0.6);
  cyl(g, 0.005, 0.005, 0.14, mat('#1b3a8a'), hx - 0.25, ty + 0.006, hz - 0.14, 6).rotation.set(Math.PI / 2, 0, 0.7);
  blob(g, hx, 0.012, hz, 1.6, 1.6, 0.35);

  plant(g, 3.9, 4.6, 1.5); plant(g, -3.9, -4.9, 1.3);
  box(g, 1.05, 2.3, 0.06, dark, 2.6, 1.15, D / 2 - 0.03); quad(g, 0.7, 1.3, glow(day, 1.4), 2.6, 1.45, D / 2 - 0.07, 'z-');

  return {
    group: g,
    rigs: {
      historia: {
        bg: '#b4bcc2', fog: ['#b9c2c8', 30, 200], exposure: 0.9, env: 0.4, grade: { temp: -0.14, sat: 0.82, vig: 0.95 }, bloom: 0.12,
        hemi: ['#e6eef5', '#5a6060', 0.42],
        key: { p: [-4.1, 3.0, 2.2], t: [0.2, 0, 0.2], c: '#e9f1ff', i: 24, angle: 1.05, pen: 0.9 },
        pts: [[-2.3, 2.0, 0.4, '#fff1dc', 0.5, 4], [1.9, 2.0, 1.7, '#fff1dc', 0.5, 4], [1.6, 2.4, -3.6, '#ffe6c2', 1.6, 6], [-3.8, 1.8, -2.6, '#dfeaff', 1.2, 6]]
      }
    },
    cams: { historia: [{ p: [2.9, 1.66, 4.7], t: [-0.6, 1.2, -1.4] }, { p: [0.6, 1.5, 3.0], t: [-2.0, 0.9, 0.2] }, { p: [-1.25, 1.22, 1.25], t: [-2.32, 0.78, 0.42], fov: 40 }, { p: [-3.2, 1.35, 2.3], t: [1.4, 1.25, -4.0] }] },
    hotspots: { historia: [{ id: 'actos', p: [hx - 0.02, ty + 0.05, hz + 0.02], label: 'La carta de rechazo', range: [0.3, 0.8] }] },
    update() {}
  };
}

/* =====================================================================
   INT. RESTAURANTE — tarde. Con Romina: lo personal, lejos de la industria.
   ===================================================================== */
export function restaurante(CAST) {
  const g = new THREE.Group(); seed(33);
  const W = 10, H = 3.4, D = 9;
  const wall = mat(rep(T.plaster('#c9a27f'), 3, 1.2), { rough: 0.95 });
  room(g, { w: W, h: H, d: D, floor: mat(rep(T.planks('#8a5f3c', 8), 3.4, 3), { rough: 0.5 }), wall, ceil: mat('#e8d9c4', { rough: 1 }), walls: { right: mat(rep(T.plaster('#566b5a'), 3, 1.2), { rough: 0.95 }) } });
  const wood = mat(rep(T.wood('#5a3b26'), 1, 1), { rough: 0.5 }), leg = mat('#2a1c14', { rough: 0.5 }), cloth = mat(rep(T.fabric('#c9963f'), 2, 2), { rough: 0.95 });
  /* Ventanas de arco con el atardecer */
  const dusk = canvasTex(256, 384, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffd9a0'); gr.addColorStop(0.55, '#ff9e62'); gr.addColorStop(1, '#c95f4a'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(90,40,40,.55)'; for (let i = 0; i < 6; i++) x.fillRect(i * 46 - 8, h - rnd(50, 150), 40, 160);
  });
  for (const x of [-3, 0, 3]) {
    quad(g, 1.7, 2.2, glow(dusk, 1.5), x, 1.75, -D / 2 + 0.01);
    const arc = new THREE.Mesh(new THREE.CircleGeometry(0.85, 24, 0, Math.PI), glow(dusk, 1.5)); arc.position.set(x, 2.85, -D / 2 + 0.01); g.add(arc);
    box(g, 0.06, 2.2, 0.06, leg, x, 1.75, -D / 2 + 0.04); box(g, 1.7, 0.06, 0.06, leg, x, 1.75, -D / 2 + 0.04); box(g, 1.9, 0.1, 0.2, wood, x, 0.62, -D / 2 + 0.1);
  }
  /* Bancas contra el muro izquierdo */
  for (const z of [-2.2, 0.4, 3.0]) {
    box(g, 0.55, 0.45, 2.0, cloth, -W / 2 + 0.3, 0.23, z); box(g, 0.14, 0.75, 2.0, cloth, -W / 2 + 0.08, 0.8, z);
    rectTable(g, -W / 2 + 1.15, z, 0.75, 1.1, wood, leg);
    chair(g, -W / 2 + 1.95, z - 0.25, -Math.PI / 2, wood, leg); chair(g, -W / 2 + 1.95, z + 0.3, -Math.PI / 2, wood, leg);
    pendant(g, -W / 2 + 1.15, 2.05, z, H, mat('#b5793a', { rough: 0.7, side: THREE.DoubleSide }), '#ffd08a', 0.26, 2.6);
  }
  /* La mesa de Emilia y Romina */
  const hx = 0.8, hz = 0.2, ty = 0.765;
  rectTable(g, hx, hz, 1.25, 0.8, wood, leg);
  chair(g, hx - 0.9, hz, Math.PI / 2 + 0.15, wood, leg); chair(g, hx + 0.9, hz, -Math.PI / 2 - 0.1, wood, leg);
  const china = mat('#f3efe6', { rough: 0.25 }), glass = mat('#dfeef0', { rough: 0.05, transparent: true, opacity: 0.3 });
  for (const s of [-1, 1]) {
    cyl(g, 0.13, 0.1, 0.014, china, hx + s * 0.34, ty + 0.008, hz, 28); cyl(g, 0.032, 0.026, 0.12, glass, hx + s * 0.2, ty + 0.06, hz - 0.2, 14);
    box(g, 0.012, 0.004, 0.17, mat('#c9ccd0', { metal: 0.9, rough: 0.3 }), hx + s * 0.5, ty + 0.003, hz + 0.02);
  }
  cyl(g, 0.04, 0.03, 0.12, mat('#7fa3a8', { rough: 0.3 }), hx, ty + 0.06, hz + 0.22, 14); sph(g, 0.05, mat('#e8794a'), hx, ty + 0.19, hz + 0.22, 10); sph(g, 0.04, mat('#f2c84b'), hx + 0.05, ty + 0.16, hz + 0.24, 10);
  cyl(g, 0.11, 0.08, 0.06, mat('#a57a4a', { rough: 0.9 }), hx - 0.02, ty + 0.03, hz - 0.2, 16);
  pendant(g, hx, 2.0, hz, H, mat('#b5793a', { rough: 0.7, side: THREE.DoubleSide }), '#ffd08a', 0.3, 2.8);
  blob(g, hx, 0.012, hz, 2.4, 1.8, 0.4);
  for (const [x, z] of [[-1.4, -2.4], [1.6, -2.6], [-1.2, 2.9], [1.8, 2.8]]) { rectTable(g, x, z, 0.8, 0.8, wood, leg); chair(g, x - 0.65, z, Math.PI / 2, wood, leg); chair(g, x + 0.65, z, -Math.PI / 2, wood, leg); }
  plant(g, 4.4, -3.9, 1.6); plant(g, 4.4, 3.9, 1.4); plant(g, -0.2, -4.0, 1.2); plant(g, -4.4, 4.1, 1.3);

  /* Los cuatro retratos en el muro verde */
  const zs = [-1.95, -0.65, 0.65, 1.95], hot = [];
  CAST.forEach((c, i) => {
    const cols = c.bg.match(/#[0-9a-f]{6}/gi);
    const tex = canvasTex(384, 512, (x, w, h) => {
      const gr = x.createLinearGradient(0, 0, w * 0.3, h); gr.addColorStop(0, cols[0]); gr.addColorStop(1, cols[1]); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(20,14,10,.42)'; x.beginPath(); x.arc(w / 2, h * 0.37, 74, 0, 7); x.fill(); x.beginPath(); x.ellipse(w / 2, h * 0.83, 150, 150, 0, Math.PI, 0); x.fill();
      x.fillStyle = '#fbf3e6'; x.font = '600 46px "Newsreader", serif'; x.textAlign = 'center'; x.fillText(c.n, w / 2, h - 58);
      x.font = 'italic 24px "Newsreader", serif'; x.fillText((c.age ? c.age + ' · ' : '') + c.sub, w / 2, h - 24);
    });
    box(g, 0.05, 1.22, 0.94, wood, W / 2 - 0.03, 1.72, zs[i]); quad(g, 0.8, 1.07, mat(tex, { rough: 0.6 }), W / 2 - 0.062, 1.72, zs[i], 'x-');
    hot.push({ id: 'cast:' + i, p: [W / 2 - 0.1, 1.72, zs[i]], label: c.n, range: [0.5, 1] });
  });
  box(g, 0.1, 0.9, 6.2, wood, W / 2 - 0.05, 0.45, 0);

  return {
    group: g,
    rigs: {
      personajes: {
        bg: '#3a2418', fog: ['#5a3a26', 10, 34], exposure: 1.0, env: 0.4, grade: { temp: 0.1, sat: 1.05, vig: 0.9 }, bloom: 0.35,
        hemi: ['#ffd7ac', '#5a3826', 0.42],
        key: { p: [1.6, 3.0, -4.2], t: [0.6, 0, 1.2], c: '#ffb070', i: 38, angle: 1.0, pen: 0.9 },
        pts: [[0.8, 1.85, 0.2, '#ffc880', 0.8, 5], [-3.85, 1.9, 0.4, '#ffc880', 0.7, 5], [3.6, 2.8, 0, '#ffe6c8', 2.2, 6], [-3.85, 1.9, -2.2, '#ffc880', 0.6, 5]]
      }
    },
    cams: { personajes: [{ p: [-3.0, 1.62, 4.0], t: [0.9, 0.95, 0] }, { p: [-0.7, 1.36, 1.9], t: [0.85, 0.82, 0.15] }, { p: [1.3, 1.5, 1.2], t: [4.9, 1.6, -0.4] }, { p: [2.3, 1.62, 0.25], t: [4.95, 1.7, -0.1], fov: 62 }] },
    hotspots: { personajes: hot },
    update() {}
  };
}
