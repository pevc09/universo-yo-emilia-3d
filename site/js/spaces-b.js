// Espacios II: el cineclub, el cuarto de Emilia (con el mural) y la sala de Casa Melón.
import * as THREE from 'three';
import { T, rep, mat, glow, box, cyl, sph, quad, room, chair, rectTable, plant, blob, canvasTex, signTex, paperTex, noteTex, wrap, seed, rnd, pick } from './kit.js';

/* =====================================================================
   INT. CINECLUB — noche
   ===================================================================== */
export function cineclub() {
  const g = new THREE.Group(); seed(44);
  const W = 9, H = 4.2, D = 13;
  const wall = mat(rep(T.fabric('#3a1418'), 10, 5), { rough: 1 });
  room(g, { w: W, h: H, d: D, floor: mat(rep(T.fabric('#241316', 'rgba(255,255,255,.05)'), 12, 16), { rough: 1 }), wall, ceil: mat('#0e0b0c', { rough: 1 }) });
  /* Pantalla */
  const title = signTex(['Yo, Emilia'], { w: 1024, h: 576, bg: '#15121c', fg: '#f6efe2', size: 170, sub: 'CINECLUB · FUNCIÓN DE HOY', subSize: 30 });
  const screenMat = new THREE.MeshBasicMaterial({ map: title }); screenMat.color.setScalar(1.0);
  box(g, 6.5, 3.7, 0.08, mat('#060606', { rough: 1 }), 0, 2.35, -D / 2 + 0.05);
  const screen = quad(g, 6.2, 3.49, screenMat, 0, 2.35, -D / 2 + 0.1);
  const curtain = mat(rep(T.fabric('#5a1a22'), 3, 1), { rough: 1 });
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) cyl(g, 0.12, 0.12, 3.9, curtain, s * (3.35 + i * 0.19), 2.1, -D / 2 + 0.25 + (i % 2) * 0.08, 10);
  /* Butacas en gradería */
  const rows = [-2.6, -1.3, 0.0, 1.3, 2.6, 3.9], perRow = 9, total = rows.length * perRow;
  const seatM = mat(rep(T.fabric('#7a1f2b'), 1, 1), { rough: 0.95 }), armM = mat('#1a1012', { rough: 0.6 });
  const mk = (geo, m) => { const im = new THREE.InstancedMesh(geo, m, total); im.castShadow = im.receiveShadow = true; g.add(im); return im; };
  const seats = mk(new THREE.BoxGeometry(0.52, 0.12, 0.5), seatM), backs = mk(new THREE.BoxGeometry(0.52, 0.66, 0.1), seatM), arms = mk(new THREE.BoxGeometry(0.06, 0.24, 0.5), armM);
  const m4 = new THREE.Matrix4(); let n = 0; const stepM = mat('#1a0f11', { rough: 1 });
  rows.forEach((z, r) => {
    const y0 = r * 0.16; if (r) box(g, W - 1.6, y0, 1.3, stepM, -0.6, y0 / 2, z);
    for (let i = 0; i < perRow; i++) {
      const x = -3.9 + i * 0.64;
      seats.setMatrixAt(n, m4.makeTranslation(x, y0 + 0.44, z)); backs.setMatrixAt(n, m4.makeTranslation(x, y0 + 0.78, z + 0.26)); arms.setMatrixAt(n, m4.makeTranslation(x + 0.32, y0 + 0.56, z)); n++;
    }
  });
  /* Proyector y haz de luz */
  box(g, 1.2, 0.08, 0.6, armM, 0, 2.9, D / 2 - 0.5); box(g, 0.5, 0.3, 0.6, mat('#2b2b30', { rough: 0.4, metal: 0.6 }), 0, 3.1, D / 2 - 0.5);
  cyl(g, 0.07, 0.09, 0.2, mat('#111', { metal: 0.8, rough: 0.2 }), 0, 3.1, D / 2 - 0.85, 14).rotation.x = Math.PI / 2;
  sph(g, 0.05, glow('#e9f1ff', 4), 0, 3.1, D / 2 - 0.96, 10).castShadow = false;
  const beamTex = canvasTex(64, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.0)'); gr.addColorStop(0.15, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,.02)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
  const len = D - 1.1;
  const beamGeo = new THREE.CylinderGeometry(0.05, 4.38, len, 4, 1, true); beamGeo.rotateY(Math.PI / 4);
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, opacity: 0.012, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  beam.scale.set(1, 1, 0.5625); beam.position.set(0, 2.72, D / 2 - 0.95 - len / 2); beam.rotation.x = Math.PI / 2 + 0.063; g.add(beam);
  const DN = 260, dp = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) { const u = rnd(); dp[i * 3] = rnd(-1, 1) * (0.1 + u * 2.6); dp[i * 3 + 1] = 3.05 - u * 0.7 + rnd(-1, 1) * (0.05 + u * 1.4); dp[i * 3 + 2] = D / 2 - 1 - u * len; }
  const dustG = new THREE.BufferGeometry(); dustG.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: '#dfe6ff', size: 0.011, transparent: true, opacity: 0.22, depthWrite: false })); g.add(dust);
  /* Apliques, salida y afiches */
  for (const s of [-1, 1]) for (const z of [-3, 0.5, 4]) { box(g, 0.06, 0.34, 0.16, armM, s * (W / 2 - 0.04), 2.3, z); quad(g, 0.5, 1.0, glow('#ff9a55', 0.9, { transparent: true, opacity: 0.5 }), s * (W / 2 - 0.02), 2.5, z, s < 0 ? 'x+' : 'x-'); }
  quad(g, 0.7, 0.24, glow(signTex('SALIDA', { w: 256, h: 96, bg: '#0a2a14', fg: '#7dffae', font: '"Courier Prime", monospace', size: 56 }), 1.6), 3.4, 2.75, D / 2 - 0.02, 'z-');
  box(g, 0.95, 2.1, 0.05, armM, 3.4, 1.05, D / 2 - 0.03);
  /* El folleto de la convocatoria, en una butaca de la primera fila */
  const folleto = canvasTex(384, 512, (x, w, h) => {
    x.fillStyle = '#ff8a52'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b1410'; x.font = '26px "Courier Prime", monospace'; x.fillText('CINECLUB · CONVOCATORIA', 28, 56);
    x.font = '74px "Permanent Marker", cursive'; x.fillText('Casa', 28, 180); x.fillText('Melón', 28, 258);
    x.font = 'italic 30px "Newsreader", serif'; wrap(x, 'y Entretenimiento\nPremio de producción total o parcial para tu piloto de serie.', 28, 320, w - 56, 38);
    x.font = '24px "Courier Prime", monospace'; x.fillText('CIERRE: 31 DE JULIO', 28, h - 30);
  });
  quad(g, 0.19, 0.26, mat(folleto, { rough: 0.8 }), -0.7, 0.505, -2.6, 'y+', 0.35);

  return {
    group: g, screen, screenMat,
    rigs: {
      universo: {
        bg: '#060405', fog: ['#0a0607', 8, 30], exposure: 1.05, env: 0.12, grade: { temp: -0.02, sat: 1.0, vig: 1.2 }, bloom: 0.45,
        hemi: ['#4a3038', '#120a0a', 0.34],
        key: { p: [0, 2.6, -5.9], t: [0, 0.4, 2.5], c: '#cfdcff', i: 75, angle: 1.05, pen: 1 },
        pts: [[-4.1, 2.4, 0.5, '#ff9550', 0.5, 6], [4.1, 2.4, 0.5, '#ff9550', 0.5, 6], [0, 3.1, 5.6, '#dfe8ff', 0.35, 4], [3.4, 2.6, 6.0, '#6dffa5', 0.2, 3]]
      }
    },
    cams: { universo: [{ p: [3.3, 2.75, 5.6], t: [0, 2.3, -6.4] }, { p: [1.6, 2.2, 3.2], t: [0, 2.3, -6.4] }, { p: [0.05, 1.5, 0.45], t: [0, 2.35, -6.4], fov: 46 }, { p: [-1.5, 1.2, -1.35], t: [-0.2, 1.7, -6.4] }] },
    hotspots: { universo: [
      { id: 'trailer', p: [0, 2.35, -D / 2 + 0.2], label: 'Ver el tráiler', range: [0.2, 0.8] },
      { id: 'universo', p: [-0.7, 0.6, -2.6], label: 'El folleto de la convocatoria', range: [0.62, 1] }
    ] },
    update(time, lights) {
      const a = dustG.attributes.position;
      for (let i = 0; i < DN; i += 3) a.setY(i, a.getY(i) + Math.sin(time * 0.6 + i) * 0.0006);
      a.needsUpdate = true;
      if (lights) lights.key.intensity *= 0.9 + 0.1 * Math.sin(time * 2.3) * Math.sin(time * 7.1);
      beam.material.opacity = 0.011 + 0.003 * Math.sin(time * 5.3);
    }
  };
}

/* =====================================================================
   INT. CUARTO DE EMILIA — noche. Su espacio propio: el escritorio y el mural.
   ===================================================================== */
export function cuarto({ CHAPTERS, SEED_NOTES }) {
  const g = new THREE.Group(); seed(55);
  const W = 5.2, H = 2.7, D = 4.6, BZ = -D / 2;
  const plaster = T.plaster('#e4d8c4');
  room(g, { w: W, h: H, d: D, floor: mat(rep(T.planks('#80593a', 8), 2.6, 2.3), { rough: 0.5 }), wall: mat(rep(plaster, 2.4, 1.3), { rough: 0.96 }), ceil: mat('#e6dccb', { rough: 1 }) });
  const trim = mat('#efe7d8', { rough: 0.6 });
  box(g, W, 0.09, 0.02, trim, 0, 0.045, BZ + 0.01); box(g, 0.02, 0.09, D, trim, -W / 2 + 0.01, 0.045, 0); box(g, 0.02, 0.09, D, trim, W / 2 - 0.01, 0.045, 0);
  const rugT = canvasTex(512, 384, (x, w, h) => { x.fillStyle = '#a5503a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e9c98a'; x.lineWidth = 10; x.strokeRect(26, 26, w - 52, h - 52); x.lineWidth = 3; x.strokeRect(50, 50, w - 100, h - 100); for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${rnd() < .5 ? 0 : 255},${rnd() < .5 ? 0 : 220},180,.06)`; x.fillRect(rnd(w), rnd(h), 2, 3); } });
  quad(g, 2.3, 1.6, mat(rugT, { rough: 1 }), 0.1, 0.008, -0.25, 'y+');

  const wood = mat(rep(T.wood('#7a5a3c'), 1, 1), { rough: 0.5 }), darkWood = mat(rep(T.wood('#3d2a1c'), 1, 1), { rough: 0.55 }), metal = mat('#1d1d20', { rough: 0.4, metal: 0.7 }), paper = mat('#f1ecdf', { rough: 0.9 });

  /* --- Escritorio --- */
  const dy = 0.76, dz = -1.92;
  box(g, 1.7, 0.04, 0.72, wood, 0.2, dy - 0.02, dz);
  for (const [x, z] of [[-0.6, -0.3], [-0.6, 0.3]]) box(g, 0.04, dy - 0.04, 0.04, metal, 0.2 + x, (dy - 0.04) / 2, dz + z);
  box(g, 0.42, dy - 0.06, 0.66, darkWood, 0.82, (dy - 0.06) / 2, dz); for (let i = 0; i < 3; i++) box(g, 0.14, 0.015, 0.02, metal, 0.82, 0.18 + i * 0.22, dz + 0.335);
  /* laptop con el guion abierto */
  const scr = canvasTex(640, 400, (x, w, h) => {
    x.fillStyle = '#2a2622'; x.fillRect(0, 0, w, h); x.fillStyle = '#f7f3ea'; x.fillRect(120, 22, 400, h);
    x.fillStyle = '#26221d'; x.font = '700 15px "Courier Prime", monospace'; x.textAlign = 'center'; x.fillText('LADRONA DE SUEÑOS', 320, 60); x.font = '13px "Courier Prime", monospace'; x.fillText('Episodio 1 · «El primer encargo»', 320, 80);
    x.textAlign = 'left'; x.fillText('1. INT. CUARTO DE LUCÍA – NOCHE', 150, 116);
    wrap(x, 'Una mesa cubierta de papeles con firmas que no son suyas. LUCÍA escribe a mano. Se detiene. Tacha una línea.', 150, 142, 340, 18);
    x.textAlign = 'center'; x.fillText('LUCÍA', 320, 226); x.fillText('«Prometo amarte en las buenas', 320, 246); x.fillText('y en las malas…»', 320, 264);
    x.textAlign = 'left'; wrap(x, 'Su ABUELA asoma desde la puerta, con una taza en cada mano.', 150, 300, 340, 18); x.fillRect(150, 350, 8, 16);
  });
  const lap = new THREE.Group(); lap.position.set(0.22, dy, dz - 0.03); lap.rotation.y = 0.06; g.add(lap);
  box(lap, 0.36, 0.016, 0.25, mat('#9a9da3', { rough: 0.35, metal: 0.8 }), 0, 0.008, 0);
  const lid = new THREE.Group(); lid.position.set(0, 0.016, -0.125); lid.rotation.x = -0.28; lap.add(lid);
  box(lid, 0.36, 0.24, 0.01, mat('#8d9096', { rough: 0.35, metal: 0.8 }), 0, 0.12, -0.006); quad(lid, 0.34, 0.215, glow(scr, 0.82), 0, 0.122, 0.001);
  /* lámpara de escritorio */
  cyl(g, 0.075, 0.085, 0.02, metal, -0.5, dy + 0.01, dz - 0.16, 20);
  const arm = box(g, 0.016, 0.42, 0.016, metal, -0.47, dy + 0.21, dz - 0.14); arm.rotation.z = -0.22;
  const shade = cyl(g, 0.035, 0.11, 0.13, mat('#c9703f', { rough: 0.5, side: THREE.DoubleSide }), -0.39, dy + 0.43, dz - 0.1, 22, true); shade.rotation.z = -0.5;
  sph(g, 0.032, glow('#ffd49a', 5), -0.375, dy + 0.4, dz - 0.1, 10).castShadow = false;
  /* taza con lápices, libros, la carpeta, el celular en visto, la primera página */
  cyl(g, 0.04, 0.035, 0.1, mat('#3f6b78', { rough: 0.4 }), -0.22, dy + 0.05, dz - 0.22, 16);
  for (let i = 0; i < 5; i++) { const p = cyl(g, 0.004, 0.004, 0.17, mat(pick(['#e8b53a', '#c8452e', '#2a5a8a', '#222'])), -0.22 + rnd(-0.02, 0.02), dy + 0.12, dz - 0.22 + rnd(-0.02, 0.02), 5); p.rotation.set(rnd(-0.2, 0.2), 0, rnd(-0.2, 0.2)); }
  [['#7a2f2a', 0.03], ['#2f4a5a', 0.022], ['#d9b25a', 0.026]].forEach(([c, h], i) => box(g, 0.2 - i * 0.012, h, 0.27 - i * 0.02, mat(c, { rough: 0.7 }), 0.83, dy + 0.02 + i * 0.027, dz - 0.15, 0.1 * i - 0.1));
  const carpeta = new THREE.Group(); carpeta.position.set(-0.14, dy, dz + 0.13); carpeta.rotation.y = 0.22; g.add(carpeta);
  box(carpeta, 0.25, 0.022, 0.33, mat('#c79f63', { rough: 0.85 }), 0, 0.011, 0);
  quad(carpeta, 0.17, 0.07, mat(signTex(['Ladrona de sueños'], { w: 512, h: 200, bg: '#f4efe3', fg: '#26221d', font: '"Caveat", cursive', size: 78 }), { rough: 0.9 }), 0, 0.0235, -0.05, 'y+');
  const chatT = canvasTex(256, 512, (x, w, h) => {
    x.fillStyle = '#0f1512'; x.fillRect(0, 0, w, h); x.fillStyle = '#e9efe9'; x.font = '600 24px "Instrument Sans", sans-serif'; x.fillText('Ricardo', 22, 44);
    x.fillStyle = '#1f6b52'; x.fillRect(60, 80, 176, 150); x.fillStyle = '#ff8a52'; x.fillRect(70, 90, 156, 96); x.fillStyle = '#e9efe9'; x.font = '15px "Instrument Sans", sans-serif'; x.fillText('Convocatoria', 74, 208);
    x.fillStyle = '#1f6b52'; x.fillRect(60, 246, 176, 54); x.fillStyle = '#e9efe9'; x.font = '17px "Instrument Sans", sans-serif'; x.fillText('Mira esto. ¿Postulamos?', 68, 270); x.fillStyle = '#7fd0ff'; x.font = '13px "Instrument Sans", sans-serif'; x.fillText('8:42 p. m. ✓✓ Visto', 108, 292);
  });
  const phone = new THREE.Group(); phone.position.set(0.56, dy, dz + 0.17); phone.rotation.y = -0.32; g.add(phone);
  box(phone, 0.076, 0.009, 0.158, mat('#0c0c0e', { rough: 0.25 }), 0, 0.0045, 0); quad(phone, 0.068, 0.146, glow(chatT, 1.0), 0, 0.0096, 0, 'y+');
  const pagina = quad(g, 0.21, 0.297, mat(paperTex(['1. INT. CUARTO DE LUCÍA – NOCHE', 'Una mesa cubierta de papeles con firmas que no son suyas. LUCÍA escribe a mano. Se detiene. Tacha una línea.', '          LUCÍA', '   «Prometo amarte en las buenas y en las malas…»', 'Su ABUELA asoma desde la puerta.'], { title: 'LADRONA DE SUEÑOS', size: 21 }), { rough: 0.9 }), 0.52, dy + 0.002, dz - 0.2, 'y+', -0.16);
  /* silla */
  const sil = new THREE.Group(); sil.position.set(0.12, 0, -1.2); sil.rotation.y = 0.35; g.add(sil);
  const fab = mat(rep(T.fabric('#3b4a52'), 1, 1), { rough: 0.95 });
  box(sil, 0.46, 0.07, 0.46, fab, 0, 0.48, 0); box(sil, 0.42, 0.46, 0.06, fab, 0, 0.82, 0.22); cyl(sil, 0.025, 0.025, 0.42, metal, 0, 0.24, 0, 10);
  box(sil, 0.56, 0.03, 0.05, metal, 0, 0.04, 0); box(sil, 0.05, 0.03, 0.56, metal, 0, 0.04, 0);

  /* --- El mural de corcho --- */
  const MX = 0.2, MY = 1.74, mz = BZ + 0.035;
  box(g, 2.0, 1.2, 0.03, darkWood, MX, MY, BZ + 0.016); quad(g, 1.9, 1.1, mat(rep(T.cork(), 1, 1), { rough: 1 }), MX, MY, BZ + 0.033);
  const pinM = [mat('#c8372d', { rough: 0.3 }), mat('#2c5fa8', { rough: 0.3 }), mat('#e8b53a', { rough: 0.3 })], shM = new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.28, depthWrite: false });
  const stick = (tex, x, y, w, h, rz = rnd(-0.07, 0.07), pin = true, z = mz) => {
    quad(g, w, h, shM, x + 0.007, y - 0.009, z + 0.001, 'z+', rz);
    const q = quad(g, w, h, mat(tex, { rough: 0.9 }), x, y, z + 0.003 + rnd(0.002), 'z+', rz);
    if (pin) sph(g, 0.009, pick(pinM), x, y + h / 2 - 0.022, z + 0.012, 8).castShadow = false;
    return q;
  };
  const COL = ['#f4d873', '#f1b4a3', '#bdd8b4', '#b8d0e8', '#f4d873', '#d9c9ec', '#f1b4a3', '#bdd8b4', '#b8d0e8', '#f4d873'];
  CHAPTERS.forEach((c, i) => stick(noteTex(c, COL[i], { size: c.length > 18 ? 62 : 72, sub: 'cap. ' + (i + 1) }), MX - 0.72 + (i % 5) * 0.26, MY + 0.3 - Math.floor(i / 5) * 0.27, 0.215, 0.215));
  stick(noteTex('Potenciar evolución de Lucía', '#f1b4a3', { size: 66 }), MX - 0.74, MY - 0.33, 0.2, 0.2, 0.14);
  stick(canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#f6f1e4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8452e'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 54); x.lineTo(w, 54); x.stroke(); x.fillStyle = '#26221d'; x.font = '700 60px "Caveat", cursive'; x.fillText('Piloto → 31 de julio', 26, 46); x.font = '500 46px "Caveat", cursive'; x.fillText('Acto 1 · Acto 2 · Acto 3', 26, 124); x.fillText('14 noches. Sin socio.', 26, 196); }), MX - 0.36, MY - 0.34, 0.36, 0.18, -0.04);
  stick(canvasTex(384, 256, (x, w, h) => { x.fillStyle = '#ff8a52'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b1410'; x.font = '50px "Permanent Marker", cursive'; x.fillText('Casa Melón', 22, 80); x.font = '24px "Courier Prime", monospace'; x.fillText('CONVOCATORIA', 24, 130); x.fillText('PILOTO DE SERIE', 24, 164); x.fillText('CIERRE 31/07', 24, 222); }), MX + 0.12, MY - 0.35, 0.3, 0.2, 0.05);
  const c0 = g.children.length;
  stick(canvasTex(384, 512, (x, w, h) => {
    x.fillStyle = '#f6f1e4'; x.fillRect(0, 0, w, h); x.fillStyle = '#26221d'; x.font = '700 30px "Courier Prime", monospace'; x.fillText('CASTING · LUCÍA', 24, 50);
    for (let i = 0; i < 4; i++) { const px = 24 + (i % 2) * 176, py = 76 + Math.floor(i / 2) * 212; x.fillStyle = ['#b79a7f', '#8792a1', '#a9b8a2', '#c99a8d'][i]; x.fillRect(px, py, 152, 150); x.fillStyle = 'rgba(30,20,14,.4)'; x.beginPath(); x.arc(px + 76, py + 60, 30, 0, 7); x.fill(); x.fillRect(px + 30, py + 100, 92, 50); x.fillStyle = '#c8452e'; x.font = '700 34px "Caveat", cursive'; x.fillText(['sonríe de más', '¡la mirada!', '¿es Lucía?', 'poco sueño'][i], px, py + 184); }
  }), MX + 0.74, MY + 0.16, 0.3, 0.4, 0.03);
  const castingParts = g.children.slice(c0);
  /* Calendario de julio */
  const calT = canvasTex(512, 660, (x, w, h) => {
    x.fillStyle = '#f7f3ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8452e'; x.fillRect(0, 0, w, 120); x.fillStyle = '#fff'; x.font = '700 62px "Newsreader", serif'; x.fillText('Julio 2026', 30, 82);
    x.fillStyle = '#26221d'; x.font = '26px "Courier Prime", monospace'; 'LMXJVSD'.split('').forEach((d, i) => x.fillText(d, 38 + i * 66, 166));
    for (let d = 1; d <= 31; d++) {
      const i = d + 1, cx = 30 + (i % 7) * 66, cy = 190 + Math.floor(i / 7) * 86; x.strokeStyle = '#d7cdbd'; x.lineWidth = 2; x.strokeRect(cx, cy, 60, 78); x.fillStyle = '#26221d'; x.font = '24px "Courier Prime", monospace'; x.fillText(d, cx + 6, cy + 26);
      if (d >= 18 && d <= 26) { x.strokeStyle = '#26221d'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx + 12, cy + 34); x.lineTo(cx + 48, cy + 70); x.moveTo(cx + 48, cy + 34); x.lineTo(cx + 12, cy + 70); x.stroke(); }
      if (d === 17 || d === 31) { x.strokeStyle = '#c8452e'; x.lineWidth = 5; x.beginPath(); x.ellipse(cx + 30, cy + 40, 30, 36, 0, 0, 7); x.stroke(); }
    }
    x.fillStyle = '#c8452e'; x.font = '700 40px "Caveat", cursive'; x.fillText('entrega →', 180, 640);
  });
  stick(calT, 1.78, 1.72, 0.44, 0.57, 0.01, true, BZ + 0.004);
  /* Notas del público, pegadas en la pared junto al corcho */
  const slots = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) slots.push([-2.3 + c * 0.335 + (r % 2) * 0.05, 2.18 - r * 0.36]);
  const pubMeshes = []; let pubN = 0;
  const NC = { 'n-y': '#f4d873', 'n-p': '#f1b4a3', 'n-g': '#bdd8b4', 'n-b': '#b8d0e8', 'n-l': '#d9c9ec', reply: '#fbf8f2' };
  function addPublicNote(n) {
    const i = pubN % slots.length; pubN++;
    if (pubMeshes[i]) pubMeshes[i].forEach(o => { g.remove(o); });
    const before = g.children.length; const t = n.t.length;
    const q = stick(noteTex(n.t, NC[n.c] || '#f4d873', { size: t > 80 ? 30 : t > 50 ? 36 : t > 28 ? 44 : 54, sub: '— ' + n.a, ink: n.reply ? '#b3442a' : '#2a241f' }), slots[i][0], slots[i][1], 0.3, 0.3, rnd(-0.09, 0.09), !n.reply, BZ + 0.004);
    pubMeshes[i] = g.children.slice(before); return q;
  }
  SEED_NOTES.forEach(addPublicNote);
  /* Guirnalda de luces */
  const bulbM = glow('#ffcf8f', 3.2); const pts = [];
  for (let i = 0; i <= 22; i++) { const u = i / 22, x = -2.5 + u * 5, y = 2.56 - 0.16 * Math.sin(Math.PI * u) - 0.03 * Math.sin(Math.PI * 6 * u) ** 2; pts.push(new THREE.Vector3(x, y, BZ + 0.05)); if (i % 1 === 0 && i > 0 && i < 22) { const b = sph(g, 0.017, bulbM, x, y - 0.02, BZ + 0.05, 8); b.castShadow = false; } }
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#1b1510' })));

  /* --- Pared de películas (muro izquierdo) --- */
  const poster = (t, s, c) => canvasTex(360, 512, (x, w, h) => {
    x.fillStyle = c; x.fillRect(0, 0, w, h); const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,240,220,.22)'; x.beginPath(); x.arc(w * 0.62, h * 0.36, 86, 0, 7); x.fill();
    x.fillStyle = '#fbf3e6'; x.font = '600 50px "Newsreader", serif'; x.textBaseline = 'top'; wrap(x, t, 26, h * 0.6, w - 52, 52); x.font = '18px "Courier Prime", monospace'; x.fillText(s.toUpperCase(), 26, h - 44);
  });
  [['La La Land', 'Damien Chazelle · 2016', '#5b6f8a'], ['Los Fabelman', 'Steven Spielberg · 2022', '#a7553d'], ['Saving Mr. Banks', 'John Lee Hancock · 2013', '#3e3a36'], ['Como en el cine', 'Gonzalo Ladines · 2015', '#6f7d5e']].forEach((p, i) => {
    const z = -1.18 + (i % 2) * 0.6, y = 1.98 - Math.floor(i / 2) * 0.8;
    const q = quad(g, 0.52, 0.74, mat(poster(...p), { rough: 0.7 }), -W / 2 + 0.006, y, z, 'x+', rnd(-0.02, 0.02)); q.position.x += i * 0.0006;
  });
  /* estante bajo: libros, cuaderno, claqueta */
  box(g, 0.32, 0.92, 1.3, darkWood, -W / 2 + 0.17, 0.46, 1.15);
  for (let r = 0; r < 2; r++) { let z = 0.56; while (z < 1.72) { const t = rnd(0.03, 0.06), hh = rnd(0.22, 0.33); box(g, 0.02, hh, t, mat(pick(['#7a2f2a', '#2f4a5a', '#d9b25a', '#3d5a3c', '#e6dccb', '#5a3a5a', '#c8643a']), { rough: 0.7 }), -W / 2 + 0.335, 0.1 + r * 0.42 + hh / 2, z + t / 2); z += t + 0.004; } }
  const cuad = new THREE.Group(); cuad.position.set(-W / 2 + 0.19, 0.92, 0.82); cuad.rotation.y = 0.3; g.add(cuad);
  box(cuad, 0.15, 0.022, 0.21, mat('#1c1c1e', { rough: 0.6 }), 0, 0.011, 0); box(cuad, 0.012, 0.024, 0.212, mat('#c8452e'), 0.045, 0.0115, 0);
  const clap = canvasTex(256, 200, (x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); for (let i = 0; i < 7; i++) { x.fillStyle = i % 2 ? '#111' : '#f4f1ea'; x.beginPath(); x.moveTo(i * 44 - 20, 0); x.lineTo(i * 44 + 24, 0); x.lineTo(i * 44 + 4, 44); x.lineTo(i * 44 - 40, 44); x.fill(); } x.fillStyle = '#f4f1ea'; x.font = '26px "Caveat", cursive'; x.fillText('LADRONA DE SUEÑOS', 14, 88); x.fillText('ESC 1   TOMA 3', 14, 130); x.fillText('DIR: Emilia', 14, 172); });
  const cl = box(g, 0.02, 0.22, 0.28, mat('#111'), -W / 2 + 0.1, 1.03, 1.42, 0.25); quad(g, 0.28, 0.22, mat(clap, { rough: 0.6 }), -W / 2 + 0.113, 1.03, 1.42, 'x+').rotation.y += 0.25;
  /* trípode con cámara */
  const tri = new THREE.Group(); tri.position.set(-2.0, 0, 0.05); tri.rotation.y = 0.9; g.add(tri);
  for (let i = 0; i < 3; i++) { const a = i * 2.094, l = cyl(tri, 0.012, 0.016, 1.42, metal, Math.cos(a) * 0.22, 0.68, Math.sin(a) * 0.22, 6); l.rotation.set(Math.sin(a) * 0.31, 0, -Math.cos(a) * 0.31); }
  box(tri, 0.07, 0.08, 0.07, metal, 0, 1.4, 0); box(tri, 0.13, 0.1, 0.19, mat('#141416', { rough: 0.45 }), 0, 1.5, 0); cyl(tri, 0.045, 0.05, 0.1, mat('#0a0a0b', { rough: 0.2, metal: 0.6 }), 0, 1.5, 0.14, 16).rotation.x = Math.PI / 2;

  /* --- Cama, velador y ventana (muro derecho) --- */
  box(g, 1.16, 0.26, 2.06, darkWood, 1.98, 0.13, 0.6); box(g, 1.1, 0.2, 2.0, mat('#efe8dc', { rough: 0.95 }), 1.98, 0.36, 0.6);
  box(g, 1.16, 0.12, 1.36, mat(rep(T.fabric('#b8693e'), 3, 3), { rough: 1 }), 1.98, 0.49, 0.92); box(g, 1.18, 0.05, 0.3, mat(rep(T.fabric('#e6d9c0'), 2, 1), { rough: 1 }), 1.98, 0.555, 0.34);
  const pil = box(g, 0.66, 0.13, 0.4, mat('#f7f2e8', { rough: 1 }), 1.98, 0.52, -0.18); pil.rotation.y = 0.06;
  box(g, 1.2, 0.95, 0.07, darkWood, 1.98, 0.6, -0.47);
  box(g, 0.46, 0.5, 0.42, wood, 2.3, 0.25, -0.95); box(g, 0.4, 0.015, 0.02, metal, 2.3, 0.36, -0.735);
  const vy = 0.5;
  const podT = canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#17131c'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8794a'; x.fillRect(38, 70, 180, 180); x.fillStyle = '#f6efe2'; x.font = '34px "Permanent Marker", cursive'; x.fillText('Miradas', 52, 150); x.fillText('distintas', 52, 190); x.font = '18px "Instrument Sans", sans-serif'; x.fillText('Ep. 4 · Augusto Cabada', 30, 300); x.fillText('❚❚ en pausa', 30, 334); x.fillRect(30, 370, 196, 4); x.fillStyle = '#e8794a'; x.fillRect(30, 370, 80, 4); });
  const ph2 = new THREE.Group(); ph2.position.set(2.24, vy, -0.88); ph2.rotation.y = 0.5; g.add(ph2);
  box(ph2, 0.076, 0.009, 0.158, mat('#0c0c0e', { rough: 0.25 }), 0, 0.0045, 0); quad(ph2, 0.068, 0.146, glow(podT, 1.0), 0, 0.0096, 0, 'y+');
  const aud = new THREE.Group(); aud.position.set(2.37, vy + 0.02, -1.02); aud.rotation.set(Math.PI / 2, 0, 0.4); g.add(aud);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.008, 8, 20, Math.PI), mat('#1b1b1e', { rough: 0.4 })); aud.add(band);
  cyl(aud, 0.035, 0.035, 0.03, mat('#2a2a2e', { rough: 0.5 }), -0.08, 0, 0, 14).rotation.z = Math.PI / 2; cyl(aud, 0.035, 0.035, 0.03, mat('#2a2a2e', { rough: 0.5 }), 0.08, 0, 0, 14).rotation.z = Math.PI / 2;
  cyl(g, 0.05, 0.06, 0.02, metal, 2.42, vy + 0.01, -0.8, 14); cyl(g, 0.008, 0.008, 0.2, metal, 2.42, vy + 0.11, -0.8, 6);
  const vsh = cyl(g, 0.05, 0.085, 0.12, glow('#ffb873', 1.5, { side: THREE.DoubleSide }), 2.42, vy + 0.25, -0.8, 18, true); vsh.castShadow = false;
  const city = T.cityNight();
  quad(g, 1.25, 1.15, glow(city, 1.25), W / 2 - 0.008, 1.62, 0.7, 'x-');
  const fr = mat('#efe7d8', { rough: 0.5 });
  box(g, 0.05, 0.05, 1.35, fr, W / 2 - 0.03, 2.22, 0.7); box(g, 0.07, 0.05, 1.45, fr, W / 2 - 0.045, 1.02, 0.7); box(g, 0.04, 1.2, 0.04, fr, W / 2 - 0.03, 1.62, 0.7); box(g, 0.04, 0.03, 1.25, fr, W / 2 - 0.03, 1.62, 0.7);
  const cur = mat(rep(T.fabric('#c9b596'), 2, 4), { rough: 1 });
  for (const z of [-0.08, 1.48]) for (let i = 0; i < 3; i++) cyl(g, 0.055, 0.055, 1.55, cur, W / 2 - 0.09, 1.55, z + (i - 1) * 0.1, 8);
  cyl(g, 0.012, 0.012, 1.9, metal, W / 2 - 0.09, 2.34, 0.7, 6).rotation.x = Math.PI / 2;
  box(g, 0.9, 2.05, 0.05, darkWood, -1.3, 1.025, D / 2 - 0.03);
  plant(g, 2.25, -1.95, 0.95);

  let wk = 5;
  return {
    group: g, addPublicNote,
    setWeek(w) { wk = w; castingParts.forEach(o => o.visible = w >= 1); pagina.visible = w >= 5; },
    rigs: {
      archivo: {
        bg: '#0b0806', fog: ['#140d08', 7, 18], exposure: 1.0, env: 0.18, grade: { temp: 0.12, sat: 1.08, vig: 1.0 }, bloom: 0.32,
        hemi: ['#ffd3a2', '#2a1a10', 0.26],
        key: { p: [0.5, 2.62, 0.9], t: [0.15, 1.1, -2.2], c: '#ffc78c', i: 13, angle: 1.0, pen: 1 },
        pts: [[-0.3, 1.1, -1.7, '#ffb463', 0.6, 3.5], [2.2, 1.6, 0.7, '#7a98e0', 1.1, 4.5], [0.2, 2.3, -1.7, '#ffcc88', 0.55, 5], [2.4, 0.9, -0.75, '#ff9a5c', 0.22, 3]]
      }
    },
    cams: {
      archivo: [{ p: [-0.9, 1.6, 2.1], t: [0.5, 1.25, -2.2], fov: 62 }, { p: [0.75, 1.5, 1.0], t: [-2.6, 1.5, -0.6] }, { p: [0.4, 1.42, -0.1], t: [0.15, 0.95, -1.95] }, { p: [-0.2, 1.4, -0.55], t: [2.3, 0.6, -0.8] }, { p: [0.2, 1.55, -0.15], t: [0.25, 1.62, -2.3] }],
      mural: [{ p: [0.2, 1.55, -0.15], t: [0.25, 1.62, -2.3] }, { p: [-1.5, 1.86, -0.95], t: [-1.78, 1.84, -2.3], fov: 44 }, { p: [-0.25, 1.82, -1.25], t: [-0.3, 1.82, -2.3], fov: 40 }, { p: [0.75, 1.78, -1.25], t: [0.8, 1.74, -2.3], fov: 40 }, { p: [0.2, 1.62, -0.5], t: [0.2, 1.7, -2.3] }]
    },
    hotspots: {
      archivo: [
        { id: 'pared', p: [-W / 2 + 0.05, 1.6, -0.88], range: [0.12, 0.45] },
        { id: 'cuaderno', p: [-W / 2 + 0.19, 1.0, 0.82], range: [0.12, 0.4] },
        { id: 'carpeta', p: [-0.14, dy + 0.06, dz + 0.13], range: [0.36, 0.72] },
        { id: 'chat', p: [0.56, dy + 0.05, dz + 0.17], range: [0.36, 0.72] },
        { id: 'pagina', p: [0.52, dy + 0.05, dz - 0.2], range: [0.36, 0.72] },
        { id: 'escucha', p: [2.26, vy + 0.1, -0.9], range: [0.58, 0.9] },
        { id: 'dias', p: [1.78, 1.72, BZ + 0.05], range: [0.6, 1] },
        { id: 'casting', p: [MX + 0.74, MY + 0.16, BZ + 0.06], range: [0.82, 1] },
        { id: 'mural', p: [MX - 0.2, MY + 0.02, BZ + 0.06], range: [0.82, 1] }
      ],
      mural: [
        { id: 'mural', p: [-1.78, 1.52, BZ + 0.06], label: 'Pega tu nota en el mural', range: [0.12, 0.42] },
        { id: 'casting', p: [MX + 0.74, MY + 0.16, BZ + 0.06], range: [0.6, 0.95] },
        { id: 'dias', p: [1.78, 1.72, BZ + 0.05], range: [0.8, 1] }
      ]
    },
    update(time) { bulbM.color.setRGB(1, 0.81, 0.56).multiplyScalar(3.0 + 0.25 * Math.sin(time * 1.3)); }
  };
}

/* =====================================================================
   INT. CASA MELÓN — sala del jurado
   ===================================================================== */
export function melon() {
  const g = new THREE.Group(); seed(66);
  const W = 8, H = 3.3, D = 10;
  const panelT = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#232a38'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#283042' : '#1f2533'; x.fillRect(i * 128 + 3, 3, 122, h - 6); } for (let i = 0; i < 6000; i++) { x.fillStyle = `rgba(255,255,255,${rnd(0.02, 0.05)})`; x.fillRect(rnd(w), rnd(h), 2, 2); } });
  room(g, { w: W, h: H, d: D, floor: mat(rep(T.concrete('#3b3d44'), 3, 4), { rough: 0.28 }), wall: mat(rep(panelT, 4, 1), { rough: 0.95 }), ceil: mat('#0f1116', { rough: 1 }) });
  const dark = mat(rep(T.wood('#2a2019'), 2, 1), { rough: 0.45 }), metal = mat('#17181c', { rough: 0.4, metal: 0.7 }), fab = mat(rep(T.fabric('#1c2030'), 2, 2), { rough: 1 });
  /* Rótulo retroiluminado */
  const logo = canvasTex(1024, 512, (x, w, h) => {
    x.fillStyle = '#ff8a52'; x.beginPath(); x.arc(170, 220, 96, 0, 7); x.fill(); x.fillStyle = '#ffc49a'; x.beginPath(); x.arc(170, 220, 60, 0, 7); x.fill(); x.fillStyle = '#ff8a52'; x.beginPath(); x.arc(170, 220, 24, 0, 7); x.fill();
    x.fillStyle = '#ffb07c'; x.font = '118px "Permanent Marker", cursive'; x.fillText('Yo, Emilia', 300, 256);
    x.fillStyle = '#ffd9bd'; x.font = '38px "Courier Prime", monospace'; x.fillText('NOCHE DE ESTRENO · LIMA, 2026', 76, 400);
  });
  box(g, 4.6, 1.9, 0.08, mat('#141820', { rough: 0.6 }), 0, 2.1, -D / 2 + 0.05);
  quad(g, 4.2, 2.1, glow(logo, 1.5, { transparent: true, depthWrite: false }), 0, 2.1, -D / 2 + 0.1);
  /* Mesa del jurado */
  box(g, 3.8, 0.05, 0.8, dark, 0, 0.78, -2.6); box(g, 3.7, 0.74, 0.04, fab, 0, 0.385, -2.22); box(g, 0.04, 0.74, 0.76, fab, -1.85, 0.385, -2.6); box(g, 0.04, 0.74, 0.76, fab, 1.85, 0.385, -2.6);
  const glass = mat('#dfeef0', { rough: 0.05, transparent: true, opacity: 0.3 });
  [-1.15, 0, 1.15].forEach((x, i) => {
    chair(g, x, -3.3, 0, fab, metal, { w: 0.5 });
    const plate = signTex([['DIRECCIÓN', 'PRODUCCIÓN', 'INVITADO'][i]], { w: 256, h: 80, bg: '#f1ece0', fg: '#1b1b1b', font: '"Courier Prime", monospace', size: 34 });
    const p = box(g, 0.24, 0.07, 0.02, mat('#f1ece0'), x, 0.845, -2.3); p.rotation.x = -0.3; quad(g, 0.24, 0.07, mat(plate, { rough: 0.8 }), x, 0.846, -2.288).rotation.x = -0.3;
    cyl(g, 0.03, 0.026, 0.11, glass, x + 0.32, 0.86, -2.55, 12); quad(g, 0.21, 0.297, mat('#f1ecdf', { rough: 0.9 }), x - 0.05, 0.807, -2.6, 'y+', rnd(-0.2, 0.2));
    cyl(g, 0.045, 0.055, 0.015, metal, x - 0.34, 0.812, -2.7, 14); cyl(g, 0.006, 0.006, 0.26, metal, x - 0.34, 0.94, -2.7, 6);
    const s = cyl(g, 0.03, 0.07, 0.07, mat('#20242e', { rough: 0.4, side: THREE.DoubleSide }), x - 0.34, 1.08, -2.68, 14, true); sph(g, 0.02, glow('#ffe1b0', 4), x - 0.34, 1.065, -2.68, 8).castShadow = false;
  });
  /* La marca en el piso donde se para Emilia */
  const tape = mat('#f1e3a8', { rough: 0.7 }); box(g, 0.5, 0.004, 0.05, tape, 0, 0.004, 1.2, 0.785, false); box(g, 0.5, 0.004, 0.05, tape, 0, 0.004, 1.2, -0.785, false);
  /* Pantalla con la portada del proyecto */
  const slide = canvasTex(1024, 576, (x, w, h) => {
    x.fillStyle = '#f4efe3'; x.fillRect(0, 0, w, h); x.fillStyle = '#6f6558'; x.font = '26px "Courier Prime", monospace'; x.textAlign = 'center'; x.fillText('VIDEO RESUMEN DEL EVENTO', w / 2, 120);
    x.fillStyle = '#221d19'; x.font = '600 110px "Newsreader", serif'; x.fillText('Así fue la noche', w / 2, 300); x.font = 'italic 40px "Newsreader", serif'; x.fillText('Proyección · conversatorio · brindis', w / 2, 370);
    x.fillStyle = '#b3442a'; x.font = '700 56px "Caveat", cursive'; x.fillText('El estreno de Yo, Emilia', w / 2, 470);
  });
  const sc = new THREE.Group(); sc.position.set(-3.0, 0, 0.3); sc.rotation.y = 1.0; g.add(sc);
  box(sc, 2.5, 1.45, 0.04, mat('#0b0b0c', { rough: 0.8 }), 0, 1.75, 0); quad(sc, 2.4, 1.35, glow(slide, 0.75), 0, 1.75, 0.022);
  cyl(sc, 0.025, 0.025, 1.1, metal, 0, 0.55, -0.02, 8); box(sc, 0.9, 0.03, 0.5, metal, 0, 0.015, 0);
  /* Sillas de espera y la carpeta */
  for (let i = 0; i < 4; i++) chair(g, W / 2 - 0.4, 1.2 + i * 0.62, -Math.PI / 2, fab, metal);
  box(g, 0.25, 0.022, 0.33, mat('#c79f63', { rough: 0.85 }), W / 2 - 0.42, 0.497, 1.2, 0.2);
  box(g, 0.95, 2.1, 0.05, dark, 2.2, 1.05, D / 2 - 0.03); plant(g, -3.5, 4.4, 1.5); plant(g, 3.5, -4.4, 1.4);
  for (const x of [-2.6, 2.6]) for (const z of [-2, 1.5]) { cyl(g, 0.09, 0.07, 0.14, metal, x, H - 0.07, z, 12); }

  return {
    group: g,
    rigs: {
      estreno: {
        bg: '#07080c', fog: ['#0b0d14', 8, 26], exposure: 1.05, env: 0.3, grade: { temp: 0.05, sat: 1.1, vig: 1.15 }, bloom: 0.42,
        hemi: ['#66729a', '#2a2020', 0.85],
        key: { p: [0.2, 3.25, 2.4], t: [0, 0, 1.0], c: '#ffe2bd', i: 42, angle: 0.62, pen: 0.8 },
        pts: [[0, 2.2, -4.2, '#ff8a4d', 5.5, 9], [-2.4, 1.7, 0.9, '#dfe8ff', 1.0, 5], [0, 1.5, -1.9, '#ffd6a0', 1.6, 5], [2.2, 2.4, 4.3, '#ffcfa0', 0.6, 5]]
      }
    },
    cams: { estreno: [{ p: [2.0, 1.62, 4.5], t: [-0.2, 1.4, -2.8] }, { p: [0.7, 1.58, 2.9], t: [0, 1.3, -3] }, { p: [0, 1.52, 1.25], t: [0, 1.55, -4.9], fov: 52 }, { p: [0.9, 1.5, 1.9], t: [-3.0, 1.7, 0.3], fov: 50 }] },
    hotspots: { estreno: [
      { id: 'fallo', p: [0, 0.95, -2.5], label: 'El fallo del jurado', range: [0.3, 0.75] },
      { id: 'estreno', p: [-3.0, 1.75, 0.35], label: 'La noche del estreno', range: [0.7, 1] }
    ] },
    update() {}
  };
}
