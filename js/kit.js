// Kit de construcción: texturas por canvas, materiales y piezas de utilería.
import * as THREE from 'three';

/* ---------- azar con semilla (los sets salen iguales en cada carga) ---------- */
let _s = 20260717;
export function seed(n) { _s = n >>> 0; }
export function rnd(a = 1, b) {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return b === undefined ? r * a : a + r * (b - a);
}
export const pick = arr => arr[Math.floor(rnd() * arr.length)];

/* ---------- canvas → textura ---------- */
export function canvasTex(w, h, draw, { srgb = true, repeat = null } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
export function rep(tex, rx, ry) {
  const t = tex.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; return t;
}
function speckle(x, w, h, n, colors, min = 1, max = 3, alpha = 0.25) {
  for (let i = 0; i < n; i++) {
    x.globalAlpha = rnd(alpha * 0.3, alpha); x.fillStyle = pick(colors);
    const s = rnd(min, max); x.fillRect(rnd(w), rnd(h), s, s);
  }
  x.globalAlpha = 1;
}

export const T = {
  plaster(color, dark = '#000', light = '#fff') {
    return canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = color; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        const cx = rnd(w), cy = rnd(h); const g = x.createRadialGradient(cx, cy, 0, cx, cy, rnd(60, 200));
        g.addColorStop(0, i % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.04)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(0, 0, w, h);
      }
      speckle(x, w, h, 5000, [dark, light], 1, 2, 0.07);
    });
  },
  planks(base = '#8a6a4b', n = 8, seam = 'rgba(20,12,6,.55)') {
    return canvasTex(1024, 1024, (x, w, h) => {
      const ph = h / n;
      for (let i = 0; i < n; i++) {
        const l = rnd(-9, 9);
        x.fillStyle = shade(base, l); x.fillRect(0, i * ph, w, ph);
        for (let k = 0; k < 90; k++) {
          x.globalAlpha = rnd(0.03, 0.12); x.strokeStyle = k % 3 ? '#2a1a0e' : '#e9cfa6'; x.lineWidth = rnd(0.5, 1.6);
          const y = i * ph + rnd(ph); x.beginPath(); x.moveTo(0, y);
          x.bezierCurveTo(w * 0.3, y + rnd(-5, 5), w * 0.6, y + rnd(-5, 5), w, y + rnd(-3, 3)); x.stroke();
        }
        x.globalAlpha = 1; x.fillStyle = seam; x.fillRect(0, i * ph, w, 2.5);
        const off = rnd(w); x.fillRect(off, i * ph, 2.5, ph); x.fillRect((off + w * 0.55) % w, i * ph, 2.5, ph);
      }
    });
  },
  wood(base = '#6c5440') {
    return canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (let k = 0; k < 260; k++) {
        x.globalAlpha = rnd(0.04, 0.16); x.strokeStyle = k % 3 ? '#1f130a' : '#f1d3a4'; x.lineWidth = rnd(0.5, 2.2);
        const y = rnd(h); x.beginPath(); x.moveTo(0, y);
        x.bezierCurveTo(w * 0.3, y + rnd(-8, 8), w * 0.6, y + rnd(-8, 8), w, y + rnd(-4, 4)); x.stroke();
      }
      x.globalAlpha = 1;
    });
  },
  tiles(a = '#d9dcd6', b = '#3d4a4a', n = 8) {
    return canvasTex(1024, 1024, (x, w, h) => {
      const s = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        x.fillStyle = shade((i + j) % 2 ? a : b, rnd(-4, 4)); x.fillRect(i * s, j * s, s, s);
      }
      x.strokeStyle = 'rgba(30,30,30,.5)'; x.lineWidth = 3;
      for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, h); x.moveTo(0, i * s); x.lineTo(w, i * s); x.stroke(); }
      speckle(x, w, h, 4000, ['#000', '#fff'], 1, 3, 0.06);
    });
  },
  cork() {
    return canvasTex(1024, 512, (x, w, h) => {
      x.fillStyle = '#b98a58'; x.fillRect(0, 0, w, h);
      speckle(x, w, h, 26000, ['#6e4a26', '#8a5f34', '#d9b07c', '#5a3a1c', '#c9995f'], 1, 5, 0.5);
    });
  },
  fabric(color = '#7d2c34', line = 'rgba(0,0,0,.18)') {
    return canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = color; x.fillRect(0, 0, w, h);
      x.strokeStyle = line; x.lineWidth = 1;
      for (let i = 0; i < w; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
      speckle(x, w, h, 3000, ['#000', '#fff'], 1, 2, 0.08);
    });
  },
  asphalt() {
    return canvasTex(1024, 1024, (x, w, h) => {
      x.fillStyle = '#1b1d22'; x.fillRect(0, 0, w, h);
      speckle(x, w, h, 30000, ['#0c0d10', '#2c3038', '#3a3f48', '#101114'], 1, 4, 0.5);
    });
  },
  concrete(color = '#5b5e63') {
    return canvasTex(512, 512, (x, w, h) => {
      x.fillStyle = color; x.fillRect(0, 0, w, h);
      speckle(x, w, h, 12000, ['#000', '#fff', '#333'], 1, 3, 0.1);
    });
  },
  /* Fachada con ventanas: devuelve mapa de color y mapa emisivo */
  facade(cols, rows, wall = '#2a2c36', lit = 0.4) {
    const cells = []; for (let i = 0; i < cols * rows; i++) cells.push(rnd() < lit ? pick(['#ffd58a', '#ffc46b', '#ffe6b8', '#9fd0ff', '#ffb070']) : null);
    const paint = emissive => (x, w, h) => {
      x.fillStyle = emissive ? '#000' : wall; x.fillRect(0, 0, w, h);
      if (!emissive) speckle(x, w, h, 4000, ['#000', '#fff'], 1, 3, 0.06);
      const cw = w / cols, ch = h / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const col = cells[r * cols + c];
        const px = c * cw + cw * 0.22, py = r * ch + ch * 0.2, pw = cw * 0.56, ph = ch * 0.55;
        if (emissive) { if (col) { x.fillStyle = col; x.fillRect(px, py, pw, ph); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(px, py + ph * 0.55, pw, ph * 0.45); x.fillRect(px + pw * 0.48, py, pw * 0.04, ph); } }
        else { x.fillStyle = col ? shade(col, -30) : '#11131a'; x.fillRect(px, py, pw, ph); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(px - 3, py + ph, pw + 6, 4); }
      }
    };
    return { map: canvasTex(512, 512, paint(false)), emissiveMap: canvasTex(512, 512, paint(true)) };
  },
  /* Ciudad nocturna vista por una ventana */
  cityNight(top = '#141a36', mid = '#3b2f55', low = '#e08a5a') {
    return canvasTex(512, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(0.6, mid); g.addColorStop(1, low);
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) {
        const bw = rnd(26, 70), bh = rnd(90, 300), bx = rnd(-20, w); x.fillStyle = `rgba(12,12,22,${rnd(0.75, 1)})`; x.fillRect(bx, h - bh, bw, bh);
        for (let k = 0; k < bh / 9; k++) if (rnd() < 0.35) { x.fillStyle = pick(['#ffd58a', '#ffe9c2', '#8fc3ff']); x.fillRect(bx + rnd(4, bw - 8), h - bh + rnd(6, bh - 8), 4, 5); }
      }
    });
  },
  sky(stops) {
    return canvasTex(16, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
  }
};

export function shade(hex, pct) {
  const c = new THREE.Color(hex); const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + pct / 100))); return '#' + c.getHexString();
}

/* ---------- texto sobre canvas ---------- */
export function wrap(x, text, px, py, maxW, lh, align = 'left') {
  x.textAlign = align; let yy = py;
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (x.measureText(t).width > maxW && line) { x.fillText(line, px, yy); line = w; yy += lh; } else line = t;
    }
    x.fillText(line, px, yy); yy += lh;
  }
  return yy;
}
/* Nota adhesiva con letra a mano */
export function noteTex(text, color = '#f4d873', { font = 'Caveat', size = 58, sub = '', ink = '#2a241f', w = 384, h = 384 } = {}) {
  return canvasTex(w, h, (x) => {
    x.fillStyle = color; x.fillRect(0, 0, w, h);
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,.10)'); g.addColorStop(0.16, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,255,255,.08)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = ink; x.font = `700 ${size}px "${font}", cursive`; x.textBaseline = 'top';
    const end = wrap(x, text, w * 0.09, h * 0.12, w * 0.82, size * 1.02);
    if (sub) { x.font = `500 ${Math.round(size * 0.62)}px "${font}", cursive`; x.globalAlpha = 0.75; x.fillText(sub, w * 0.09, Math.min(h - size * 0.9, end + 6)); x.globalAlpha = 1; }
  });
}
/* Hoja de papel con texto mecanografiado */
export function paperTex(lines, { w = 512, h = 724, bg = '#f3eee2', ink = '#26221d', font = '"Courier Prime", "Courier New", monospace', size = 20, title = '', pad = 46 } = {}) {
  return canvasTex(w, h, (x) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h);
    x.fillStyle = ink; x.textBaseline = 'top'; let y = pad;
    if (title) { x.font = `700 ${Math.round(size * 1.35)}px ${font}`; y = wrap(x, title, pad, y, w - pad * 2, size * 1.7) + size * 0.6; }
    x.font = `${size}px ${font}`;
    for (const l of lines) y = wrap(x, l, pad, y, w - pad * 2, size * 1.45) + size * 0.35;
  });
}
/* Rótulo o pantalla: fondo + texto centrado */
export function signTex(lines, { w = 1024, h = 512, bg = '#101014', fg = '#fff', font = '"Permanent Marker", cursive', size = 150, sub = null, subFont = '"Courier Prime", monospace', subSize = 44, subColor = null } = {}) {
  return canvasTex(w, h, (x) => {
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); }
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `${size}px ${font}`;
    const arr = [].concat(lines); const total = arr.length * size * 1.05 + (sub ? subSize * 1.6 : 0); let y = h / 2 - total / 2 + size * 0.52;
    for (const l of arr) { x.fillText(l, w / 2, y); y += size * 1.05; }
    if (sub) { x.fillStyle = subColor || fg; x.font = `${subSize}px ${subFont}`; x.fillText(sub, w / 2, y - size * 0.2 + subSize * 0.4); }
  });
}

/* ---------- materiales ---------- */
export function mat(colorOrTex, o = {}) {
  const p = { roughness: o.rough ?? 0.8, metalness: o.metal ?? 0 };
  if (colorOrTex && colorOrTex.isTexture) p.map = colorOrTex; else p.color = colorOrTex ?? '#888';
  if (o.color) p.color = o.color;
  if (o.emissive) { p.emissive = o.emissive; p.emissiveIntensity = o.ei ?? 1; }
  if (o.emissiveMap) { p.emissiveMap = o.emissiveMap; p.emissive = o.emissive || '#ffffff'; p.emissiveIntensity = o.ei ?? 1; }
  if (o.transparent) { p.transparent = true; p.opacity = o.opacity ?? 0.4; p.depthWrite = false; }
  if (o.side) p.side = o.side;
  return new THREE.MeshStandardMaterial(p);
}
/* Superficie que emite luz (pantallas, ventanas, focos): no recibe luces */
export function glow(colorOrTex, intensity = 1, o = {}) {
  const m = new THREE.MeshBasicMaterial({ toneMapped: true, ...(colorOrTex && colorOrTex.isTexture ? { map: colorOrTex } : { color: colorOrTex }), ...o });
  m.color.multiplyScalar(intensity); return m;
}

/* ---------- primitivas ---------- */
const GEO = { box: new THREE.BoxGeometry(1, 1, 1), plane: new THREE.PlaneGeometry(1, 1) };
export function box(g, w, h, d, m, x = 0, y = 0, z = 0, ry = 0, sh = true) {
  const o = new THREE.Mesh(GEO.box, m); o.scale.set(w, h, d); o.position.set(x, y, z); o.rotation.y = ry;
  o.castShadow = sh; o.receiveShadow = true; g.add(o); return o;
}
export function cyl(g, rt, rb, h, m, x = 0, y = 0, z = 0, seg = 24, open = false) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m); o.position.set(x, y, z);
  o.castShadow = true; o.receiveShadow = true; g.add(o); return o;
}
export function sph(g, r, m, x = 0, y = 0, z = 0, seg = 16) {
  const o = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o;
}
/* plano vertical mirando a una dirección: 'z+' 'z-' 'x+' 'x-' 'y+' 'y-' */
export function quad(g, w, h, m, x, y, z, face = 'z+', rz = 0, sh = false) {
  const o = new THREE.Mesh(GEO.plane, m); o.scale.set(w, h, 1); o.position.set(x, y, z);
  if (face === 'z-') o.rotation.y = Math.PI; else if (face === 'x+') o.rotation.y = Math.PI / 2; else if (face === 'x-') o.rotation.y = -Math.PI / 2;
  else if (face === 'y+') o.rotation.x = -Math.PI / 2; else if (face === 'y-') o.rotation.x = Math.PI / 2;
  if (rz) { if (face.startsWith('y')) o.rotation.z = rz; else o.rotateZ(rz); }
  o.receiveShadow = true; o.castShadow = sh; g.add(o); return o;
}

/* ---------- habitación: piso, techo y cuatro muros hacia adentro ---------- */
export function room(g, { w, h, d, floor, wall, ceil, walls = {} }) {
  quad(g, w, d, floor, 0, 0, 0, 'y+');
  quad(g, w, d, ceil, 0, h, 0, 'y-');
  quad(g, w, h, walls.back || wall, 0, h / 2, -d / 2, 'z+');
  quad(g, w, h, walls.front || wall, 0, h / 2, d / 2, 'z-');
  quad(g, d, h, walls.left || wall, -w / 2, h / 2, 0, 'x+');
  quad(g, d, h, walls.right || wall, w / 2, h / 2, 0, 'x-');
}

/* ---------- utilería ---------- */
export function chair(g, x, z, ry, mSeat, mLeg, o = {}) {
  const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
  const sw = o.w ?? 0.44, sh = o.seat ?? 0.46;
  box(c, sw, 0.05, sw, mSeat, 0, sh, 0);
  box(c, sw, 0.46, 0.04, mSeat, 0, sh + 0.34, -sw / 2 + 0.02);
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(c, 0.035, sh, 0.035, mLeg, lx * (sw / 2 - 0.03), sh / 2, lz * (sw / 2 - 0.03));
  box(c, 0.035, 0.5, 0.035, mLeg, -(sw / 2 - 0.03), sh + 0.25, -sw / 2 + 0.03); box(c, 0.035, 0.5, 0.035, mLeg, (sw / 2 - 0.03), sh + 0.25, -sw / 2 + 0.03);
  return c;
}
export function roundTable(g, x, z, r, mTop, mLeg, h = 0.74) {
  cyl(g, r, r, 0.04, mTop, x, h, z, 40); cyl(g, 0.04, 0.04, h, mLeg, x, h / 2, z, 12); cyl(g, r * 0.55, r * 0.6, 0.03, mLeg, x, 0.015, z, 24);
}
export function rectTable(g, x, z, w, d, mTop, mLeg, h = 0.74, ry = 0) {
  const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = ry; g.add(t);
  box(t, w, 0.045, d, mTop, 0, h, 0);
  for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(t, 0.05, h, 0.05, mLeg, lx * (w / 2 - 0.06), h / 2, lz * (d / 2 - 0.06));
  return t;
}
export function cup(g, x, y, z, m, liquid = '#2b1a10') {
  cyl(g, 0.075, 0.075, 0.008, m, x, y + 0.004, z, 24);
  cyl(g, 0.042, 0.032, 0.06, m, x, y + 0.038, z, 20);
  cyl(g, 0.036, 0.036, 0.004, mat(liquid, { rough: 0.2 }), x, y + 0.066, z, 20);
}
/* Lámpara colgante con pantalla; devuelve el foco emisor */
export function pendant(g, x, y, z, ceilY, shadeMat, bulbColor = '#ffd9a0', r = 0.2, bulbPower = 3) {
  box(g, 0.012, ceilY - y, 0.012, mat('#111'), x, (ceilY + y) / 2, z, 0, false);
  const s = cyl(g, r * 0.35, r, r * 0.9, shadeMat, x, y, z, 28, true); s.material.side = THREE.DoubleSide;
  return sph(g, r * 0.28, glow(bulbColor, bulbPower), x, y - r * 0.2, z, 12);
}
export function plant(g, x, z, h = 1.1, potMat = mat('#7a5a44'), leaf = '#2f5a3a') {
  cyl(g, 0.2, 0.15, 0.36, potMat, x, 0.18, z, 18);
  const lm = mat(leaf, { rough: 0.9 });
  for (let i = 0; i < 9; i++) {
    const a = rnd(Math.PI * 2), r = rnd(0.05, 0.22), y = rnd(0.5, h);
    const s = sph(g, rnd(0.1, 0.2), lm, x + Math.cos(a) * r, y, z + Math.sin(a) * r, 8); s.scale.y = rnd(1.1, 1.8);
  }
}
/* Sombra de contacto falsa bajo objetos pequeños */
let _blob;
export function blob(g, x, y, z, sx, sz, opacity = 0.45) {
  _blob = _blob || canvasTex(128, 128, (c, w, h) => { const r = c.createRadialGradient(64, 64, 4, 64, 64, 62); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h); });
  const o = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: _blob, transparent: true, opacity, depthWrite: false }));
  o.rotation.x = -Math.PI / 2; o.scale.set(sx, sz, 1); o.position.set(x, y, z); g.add(o); return o;
}
