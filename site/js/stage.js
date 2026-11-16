// Escenario: renderer, luces compartidas, cámara sobre rieles y corrección de color de cine.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { calle } from './spaces-a.js';
import { cuarto } from './spaces-b.js';
import { dress } from './spaces-c.js';
import { CHAPTERS, SEED_NOTES } from './data.js';

/* Las escenas en orden de scroll, agrupadas en las siete secciones del sitio (`sec`). `w` = cuánto scroll ocupa. */
export const SCENES = [
  { id: 'inicio', sec: 'inicio', space: 'cuarto', w: 2.0, place: 'El cuarto de Emilia, al atardecer', nav: 'Inicio' },
  { id: 'historia', sec: 'historia', space: 'cuarto', w: 1.5, place: 'Su escritorio', nav: 'La historia' },
  { id: 'personajes', sec: 'personajes', space: 'cuarto', w: 1.3, place: 'Las fotos de su pared', nav: 'Personajes' },
  { id: 'archivo', sec: 'archivo', space: 'cuarto', w: 2.5, place: 'Sus objetos, del atardecer a la noche', nav: 'El archivo de Emilia' },
  { id: 'mural', sec: 'archivo', space: 'cuarto', w: 1.5, place: 'El mural', nav: 'El mural' },
  { id: 'universo', sec: 'universo', space: 'calle', w: 2.8, place: 'Lima de noche', nav: 'Universo transmedia' },
  { id: 'estreno', sec: 'estreno', space: 'calle', w: 1.4, place: 'Función al aire libre', nav: 'El estreno' },
  { id: 'equipo', sec: 'equipo', space: 'calle', w: 1.2, place: 'Lima al amanecer', nav: 'Equipo y contacto', cut: true }
];
{ let a = 0; const tot = SCENES.reduce((s, x) => s + x.w, 0); SCENES.forEach(s => { s.a = a / tot; a += s.w; s.b = a / tot; }); }
/* ¿Hay corte (fundido a negro) entre dos escenas vecinas? Solo si cambia el espacio o la escena lo pide. */
export const cutBetween = (i, j) => { const A = SCENES[i], B = SCENES[j]; return !A || !B || A.space !== B.space || !!B.cut; };

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, temp: { value: 0 }, sat: { value: 1 }, vig: { value: 1 }, time: { value: 0 }, grain: { value: 0.06 }, fade: { value: 1 }, ca: { value: 0.012 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float temp, sat, vig, time, grain, fade, ca; varying vec2 vUv;
    void main(){
      vec2 q = vUv - 0.5; float r2 = dot(q, q);
      vec3 c = vec3(texture2D(tDiffuse, vUv + q * r2 * ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - q * r2 * ca).b);
      c *= vec3(1.0 + temp, 1.0 + temp * 0.15, 1.0 - temp);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      /* teñido de cine: sombras hacia el verde azulado, luces hacia el ámbar */
      c *= mix(vec3(0.86, 1.0, 1.1), vec3(1.1, 1.0, 0.86), smoothstep(0.02, 0.75, l));
      c = mix(vec3(l), c, sat);
      c = pow(max(c, 0.0), vec3(1.14)) * 1.12;
      float d = length(q * vec2(1.0, 0.82)) * vig;
      c *= mix(0.16, 1.0, smoothstep(0.95, 0.25, d));
      float n = fract(sin(dot(vUv * vec2(1920.0, 1080.0) + mod(time, 10.0) * 61.0, vec2(12.9898, 78.233))) * 43758.5453);
      c += (n - 0.5) * grain * (0.25 + l);
      gl_FragColor = vec4(max(c, 0.0) * fade, 1.0);
    }`
};

export function createStage(canvas, { width, height, dpr = 1, shadows = 2048, video = false, ao = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: video });
  renderer.setPixelRatio(dpr); renderer.setSize(width, height, !video);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#000'); scene.fog = new THREE.Fog('#000', 10, 60);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.05, 400);
  scene.add(camera);

  /* Juego de luces fijo: se reposiciona en cada espacio para no recompilar shaders */
  const hemi = new THREE.HemisphereLight('#fff', '#000', 1);
  const key = new THREE.SpotLight('#fff', 100, 0, 1, 0.8, 2);
  key.castShadow = true; key.shadow.mapSize.set(shadows, shadows); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.camera.near = 0.3; key.shadow.camera.far = 40;
  const pts = [0, 1, 2, 3].map(() => new THREE.PointLight('#fff', 0, 5, 2));
  scene.add(hemi, key, key.target, ...pts);
  const lights = { hemi, key, pts };

  const spaces = { calle: calle(), cuarto: cuarto({ CHAPTERS, SEED_NOTES }) };
  dress(spaces);
  for (const s of Object.values(spaces)) { s.group.visible = false; scene.add(s.group); }

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr); composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  if (ao) { const g = new GTAOPass(scene, camera, width, height); g.updateGtaoMaterial({ radius: 0.32, thickness: 1, scale: 1.15, samples: 12 }); g.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, rings: 2, samples: 12 }); g.blendIntensity = 0.9; composer.addPass(g); }
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.85, 0.9); composer.addPass(bloom);
  const grade = new ShaderPass(GradeShader); composer.addPass(grade);
  composer.addPass(new OutputPass());

  const rails = {};
  for (const sc of SCENES) {
    const K = spaces[sc.space].cams[sc.id];
    rails[sc.id] = {
      pos: new THREE.CatmullRomCurve3(K.map(k => new THREE.Vector3(...k.p)), false, 'catmullrom', 0.35),
      tgt: new THREE.CatmullRomCurve3(K.map(k => new THREE.Vector3(...k.t)), false, 'catmullrom', 0.35),
      fov: K.map(k => k.fov || 55),
      time: timeline(K)
    };
  }
  /* Paradas: cada punto de cámara puede tener `at` (cuándo llega, 0..1) y `hold` (cuánto scroll se queda quieta ahí).
     Devuelve, para un t de scroll, en qué punto del riel está la cámara. Entre paradas se mueve con aceleración suave. */
  function timeline(K) {
    const n = K.length, at = K.map((k, i) => k.at ?? i / (n - 1)), h = K.map(k => k.hold ?? 0);
    const st = at.map((a, i) => Math.max(0, a - h[i] / 2)), en = at.map((a, i) => Math.min(1, a + h[i] / 2));
    return t => {
      if (t <= en[0]) return 0;
      if (t >= st[n - 1]) return 1;
      for (let k = 0; k < n - 1; k++) {
        if (t >= st[k] && t <= en[k]) return k / (n - 1);
        if (t > en[k] && t < st[k + 1]) { const u = (t - en[k]) / (st[k + 1] - en[k]); return (k + u * u * (3 - 2 * u)) / (n - 1); }
      }
      return 1;
    };
  }

  /* Aplica un juego de luces. Si trae `to`, mezcla hacia ese segundo estado según u (0..1): la luz cambia con el scroll. */
  const c1 = new THREE.Color(), c2 = new THREE.Color();
  const N = (a, b, u) => (b === undefined ? a : a + (b - a) * u);
  const C = (target, a, b, u) => { c1.set(a); if (b !== undefined) c1.lerp(c2.set(b), u); target.copy(c1); };
  function applyRig(r, u) {
    const t = r.to || {}, k = r.key, kt = t.key || {}, g = r.grade, gt = t.grade || {};
    C(scene.background, r.bg, t.bg, u); C(scene.fog.color, r.fog[0], t.fog && t.fog[0], u); scene.fog.near = N(r.fog[1], t.fog && t.fog[1], u); scene.fog.far = N(r.fog[2], t.fog && t.fog[2], u);
    renderer.toneMappingExposure = N(r.exposure, t.exposure, u); scene.environmentIntensity = N(r.env, t.env, u);
    C(hemi.color, r.hemi[0], t.hemi && t.hemi[0], u); C(hemi.groundColor, r.hemi[1], t.hemi && t.hemi[1], u); hemi.intensity = N(r.hemi[2], t.hemi && t.hemi[2], u);
    for (let i = 0; i < 3; i++) { key.position.setComponent(i, N(k.p[i], kt.p && kt.p[i], u)); key.target.position.setComponent(i, N(k.t[i], kt.t && kt.t[i], u)); }
    C(key.color, k.c, kt.c, u); key.intensity = N(k.i, kt.i, u); key.angle = N(k.angle, kt.angle, u); key.penumbra = k.pen;
    pts.forEach((p, i) => { const d = r.pts[i], e = t.pts && t.pts[i]; if (!d) { p.intensity = 0; return; } p.position.set(d[0], d[1], d[2]); C(p.color, d[3], e && e[3], u); p.intensity = N(d[4], e && e[4], u); p.distance = d[5]; });
    grade.uniforms.temp.value = N(g.temp, gt.temp, u); grade.uniforms.sat.value = N(g.sat, gt.sat, u); grade.uniforms.vig.value = N(g.vig, gt.vig, u); bloom.strength = N(r.bloom, t.bloom, u);
  }

  let cur = { id: null, scene: null, space: null, rig: null }, lastT = 0;
  function show(id) {
    if (cur.id === id) return;
    const sc = SCENES.find(s => s.id === id), sp = spaces[sc.space], r = sp.rigs[id] || Object.values(sp.rigs)[0];
    for (const s of Object.values(spaces)) s.group.visible = s === sp;
    sp.enter && sp.enter(id);
    applyRig(r, 0);
    renderer.shadowMap.needsUpdate = true;
    cur = { id, scene: sc, space: sp, rig: r };
  }

  const P = new THREE.Vector3(), Q = new THREE.Vector3(), R = new THREE.Vector3(), U = new THREE.Vector3();
  const FP = new THREE.Vector3(), FQ = new THREE.Vector3();
  /* fx = { k: 0..1, pose: {p, t, fov}, shift }: acercamiento a un objeto elegido, mezclado con el riel según k */
  /* cámara amortiguada: sigue al riel con inercia para que no haya tirones; salta solo al cambiar de espacio */
  const sm = { pos: new THREE.Vector3(), tgt: new THREE.Vector3(), fov: 55, space: null };
  function view(id, t, look = { x: 0, y: 0 }, fx = null, dt = 0) {
    const rl = rails[id]; t = Math.min(1, Math.max(0, t)); lastT = t;
    const s = rl.time(t);
    rl.pos.getPoint(s, P); rl.tgt.getPoint(s, Q);
    const f = s * (rl.fov.length - 1), i = Math.min(rl.fov.length - 2, Math.floor(f)), u = f - i, e = u * u * (3 - 2 * u);
    let fov = rl.fov[i] + (rl.fov[i + 1] - rl.fov[i]) * e;
    const k = fx && fx.pose ? fx.k : 0;
    if (k > 0) { FP.set(...fx.pose.p); FQ.set(...fx.pose.t); P.lerp(FP, k); Q.lerp(FQ, k); fov += ((fx.pose.fov || 55) - fov) * k; }
    if (camera.aspect < 1) fov = Math.min(88, fov * (1.18 + (1 - camera.aspect) * 0.55));
    /* en vertical el texto ocupa la mitad de abajo: la cámara mira un poco más abajo para que el sujeto quede arriba */
    if (camera.aspect < 1) { const dist = P.distanceTo(Q); U.subVectors(P, Q).setY(0).normalize(); P.addScaledVector(U, Math.min(0.5, dist * 0.22)); Q.y -= Math.min(0.9, dist * 0.24) * (1 - k * 0.6); }
    R.subVectors(Q, P).normalize(); U.set(0, 1, 0); R.cross(U).normalize();
    /* con la ficha abierta a la derecha (escritorio), el objeto se corre a la izquierda para que se vea */
    if (k > 0 && fx.shift) Q.addScaledVector(R, P.distanceTo(Q) * fx.shift * k);
    P.addScaledVector(R, look.x * 0.07); P.y += look.y * 0.04;
    Q.addScaledVector(R, look.x * 0.35); Q.y += look.y * 0.22;
    const sc0 = SCENES.find(x => x.id === id), space = sc0.space;
    if (!dt || sm.space !== space || (sc0.cut && sm.id !== id)) { sm.pos.copy(P); sm.tgt.copy(Q); sm.fov = fov; sm.space = space; }
    else { const a = 1 - Math.exp(-dt * 4.2); sm.pos.lerp(P, a); sm.tgt.lerp(Q, a); sm.fov += (fov - sm.fov) * a; }
    sm.id = id;
    camera.position.copy(sm.pos);
    camera.fov = sm.fov; camera.updateProjectionMatrix(); camera.lookAt(sm.tgt);
  }

  function render(time, fade = 1) {
    if (!cur.space) return;
    const r = cur.rig;
    if (r.to) { const a = r.from ?? 0, b = r.until ?? 1, u = Math.min(1, Math.max(0, (lastT - a) / (b - a))); applyRig(r, u * u * (3 - 2 * u)); if (r.to.key) renderer.shadowMap.needsUpdate = true; }
    else key.intensity = r.key.i;
    cur.space.update(time, lights, lastT, cur.id);
    grade.uniforms.time.value = time; grade.uniforms.fade.value = fade;
    composer.render();
  }
  function resize(w, h, d = dpr) {
    renderer.setPixelRatio(d); renderer.setSize(w, h, !video); composer.setPixelRatio(d); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const V = new THREE.Vector3();
  function project(p, w, h) {
    V.set(p[0], p[1], p[2]).project(camera);
    if (V.z > 1 || V.z < -1) return null;
    return { x: (V.x * 0.5 + 0.5) * w, y: (-V.y * 0.5 + 0.5) * h };
  }
  function setScreenVideo(el) {
    const t = new THREE.VideoTexture(el); t.colorSpace = THREE.SRGBColorSpace;
    for (const m of [spaces.cuarto.lapScreen.material, spaces.calle.projMat]) { m.map = t; m.color.setScalar(1); m.needsUpdate = true; }
  }
  function warmup() { const keep = cur.id; for (const sc of SCENES) { show(sc.id); view(sc.id, 0.5); composer.render(); } cur.id = null; if (keep) show(keep); }

  return { renderer, scene, camera, composer, spaces, lights, show, view, render, resize, project, setScreenVideo, warmup, get current() { return cur; }, shadowsDirty() { renderer.shadowMap.needsUpdate = true; }, reapply() { const id = cur.id; cur.id = null; show(id); } };
}

export async function loadFonts() {
  const fs = ['700 40px "Caveat"', '500 40px "Caveat"', '40px "Permanent Marker"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '600 40px "Newsreader"', 'italic 400 30px "Newsreader"', '600 20px "Instrument Sans"', '400 20px "Instrument Sans"'];
  try { await Promise.all(fs.map(f => document.fonts.load(f))); } catch (e) {}
}
