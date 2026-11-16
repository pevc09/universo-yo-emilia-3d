// Escenario: renderer, luces compartidas, cámara sobre rieles y corrección de color.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { calle, cafeteria, restaurante } from './spaces-a.js';
import { cineclub, cuarto, melon } from './spaces-b.js';
import { CAST, CHAPTERS, SEED_NOTES } from './data.js';

/* Las escenas en orden de scroll. `w` es cuánto scroll ocupa cada una. */
export const SCENES = [
  { id: 'inicio', space: 'calle', w: 1.3, slug: 'EXT. CALLE DE LIMA – NOCHE', nav: 'Inicio' },
  { id: 'historia', space: 'cafeteria', w: 1.7, slug: 'INT. CAFETERÍA – DÍA', nav: 'La historia' },
  { id: 'personajes', space: 'restaurante', w: 1.6, slug: 'INT. RESTAURANTE – TARDE', nav: 'Personajes' },
  { id: 'universo', space: 'cineclub', w: 1.7, slug: 'INT. CINECLUB – NOCHE', nav: 'Universo transmedia' },
  { id: 'archivo', space: 'cuarto', w: 2.6, slug: 'INT. CUARTO DE EMILIA – NOCHE', nav: 'El archivo de Emilia' },
  { id: 'mural', space: 'cuarto', w: 2.0, slug: 'INT. CUARTO DE EMILIA – EL MURAL', nav: 'El mural' },
  { id: 'estreno', space: 'melon', w: 1.7, slug: 'INT. CASA MELÓN – SALA DEL JURADO', nav: 'El estreno' },
  { id: 'equipo', space: 'calle', w: 1.4, slug: 'EXT. LIMA – AMANECER', nav: 'Equipo y contacto' }
];
{ let a = 0; const tot = SCENES.reduce((s, x) => s + x.w, 0); SCENES.forEach(s => { s.a = a / tot; a += s.w; s.b = a / tot; }); }
/* ¿Hay corte (fundido a negro) entre dos escenas vecinas? Solo si cambia el espacio o la luz. */
export const cutBetween = (i, j) => { const A = SCENES[i], B = SCENES[j]; return !A || !B || A.space !== B.space || A.space === 'calle'; };

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, temp: { value: 0 }, sat: { value: 1 }, vig: { value: 1 }, time: { value: 0 }, grain: { value: 0.05 }, fade: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float temp, sat, vig, time, grain, fade; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      c.rgb *= vec3(1.0 + temp, 1.0 + temp * 0.15, 1.0 - temp);
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      c.rgb = mix(vec3(l), c.rgb, sat);
      float d = length((vUv - 0.5) * vec2(1.0, 0.82)) * vig;
      c.rgb *= mix(0.22, 1.0, smoothstep(0.92, 0.28, d));
      float n = fract(sin(dot(vUv * vec2(1920.0, 1080.0) + mod(time, 10.0) * 61.0, vec2(12.9898, 78.233))) * 43758.5453);
      c.rgb += (n - 0.5) * grain * (0.25 + l);
      gl_FragColor = vec4(max(c.rgb, 0.0) * fade, 1.0);
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

  const spaces = { calle: calle(), cafeteria: cafeteria(), restaurante: restaurante(CAST), cineclub: cineclub(), cuarto: cuarto({ CHAPTERS, SEED_NOTES }), melon: melon() };
  for (const s of Object.values(spaces)) { s.group.visible = false; scene.add(s.group); }

  /* Post */
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr); composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  let gtao = null;
  if (ao) { gtao = new GTAOPass(scene, camera, width, height); gtao.updateGtaoMaterial({ radius: 0.32, thickness: 1, scale: 1.15, samples: 12 }); gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 4, rings: 2, samples: 12 }); gtao.blendIntensity = 0.9; composer.addPass(gtao); }
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.7, 0.92); composer.addPass(bloom);
  const grade = new ShaderPass(GradeShader); composer.addPass(grade);
  composer.addPass(new OutputPass());

  /* Rieles de cámara por escena */
  const rails = {};
  for (const sc of SCENES) {
    const K = spaces[sc.space].cams[sc.id];
    rails[sc.id] = {
      pos: new THREE.CatmullRomCurve3(K.map(k => new THREE.Vector3(...k.p)), false, 'catmullrom', 0.35),
      tgt: new THREE.CatmullRomCurve3(K.map(k => new THREE.Vector3(...k.t)), false, 'catmullrom', 0.35),
      fov: K.map(k => k.fov || 55)
    };
  }

  let cur = { id: null, scene: null, space: null, rig: null };
  const col = new THREE.Color();
  function show(id) {
    if (cur.id === id) return;
    const sc = SCENES.find(s => s.id === id), sp = spaces[sc.space], r = sp.rigs[id] || Object.values(sp.rigs)[0];
    for (const s of Object.values(spaces)) s.group.visible = s === sp;
    sp.enter && sp.enter(id);
    scene.background.set(r.bg); scene.fog.color.set(r.fog[0]); scene.fog.near = r.fog[1]; scene.fog.far = r.fog[2];
    renderer.toneMappingExposure = r.exposure; scene.environmentIntensity = r.env;
    hemi.color.set(r.hemi[0]); hemi.groundColor.set(r.hemi[1]); hemi.intensity = r.hemi[2];
    key.position.set(...r.key.p); key.target.position.set(...r.key.t); key.color.set(r.key.c); key.intensity = r.key.i; key.angle = r.key.angle; key.penumbra = r.key.pen;
    pts.forEach((p, i) => { const d = r.pts[i]; if (!d) { p.intensity = 0; return; } p.position.set(d[0], d[1], d[2]); p.color.set(d[3]); p.intensity = d[4]; p.distance = d[5]; });
    grade.uniforms.temp.value = r.grade.temp; grade.uniforms.sat.value = r.grade.sat; grade.uniforms.vig.value = r.grade.vig; bloom.strength = r.bloom;
    renderer.shadowMap.needsUpdate = true;
    cur = { id, scene: sc, space: sp, rig: r };
  }

  const P = new THREE.Vector3(), Q = new THREE.Vector3(), R = new THREE.Vector3(), U = new THREE.Vector3();
  /* Coloca la cámara en el punto t (0..1) del riel de la escena. `look` añade un paralaje leve. */
  function view(id, t, look = { x: 0, y: 0 }) {
    const rl = rails[id]; t = Math.min(1, Math.max(0, t));
    rl.pos.getPoint(t, P); rl.tgt.getPoint(t, Q);
    const f = t * (rl.fov.length - 1), i = Math.min(rl.fov.length - 2, Math.floor(f)), u = f - i, e = u * u * (3 - 2 * u);
    let fov = rl.fov[i] + (rl.fov[i + 1] - rl.fov[i]) * e;
    if (camera.aspect < 1) fov = Math.min(88, fov * (1.18 + (1 - camera.aspect) * 0.55));
    R.subVectors(Q, P).normalize(); U.set(0, 1, 0); R.cross(U).normalize();
    camera.position.copy(P).addScaledVector(R, look.x * 0.07); camera.position.y += look.y * 0.04;
    Q.addScaledVector(R, look.x * 0.35); Q.y += look.y * 0.22;
    camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(Q);
  }

  function render(time, fade = 1) {
    if (!cur.space) return;
    key.intensity = cur.rig.key.i;
    cur.space.update(time, lights);
    grade.uniforms.time.value = time; grade.uniforms.fade.value = fade;
    composer.render();
  }
  function resize(w, h, d = dpr) {
    renderer.setPixelRatio(d); renderer.setSize(w, h, !video); composer.setPixelRatio(d); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  /* Proyecta un punto del mundo a píxeles de pantalla; null si queda detrás de cámara */
  const V = new THREE.Vector3();
  function project(p, w, h) {
    V.set(p[0], p[1], p[2]).project(camera);
    if (V.z > 1 || V.z < -1) return null;
    return { x: (V.x * 0.5 + 0.5) * w, y: (-V.y * 0.5 + 0.5) * h };
  }
  function setScreenVideo(el) {
    const t = new THREE.VideoTexture(el); t.colorSpace = THREE.SRGBColorSpace;
    spaces.cineclub.screenMat.map = t; spaces.cineclub.screenMat.needsUpdate = true;
  }
  /* Compila materiales de todos los espacios antes de empezar (evita tirones al cambiar de escena) */
  function warmup() { const keep = cur.id; for (const sc of SCENES) { show(sc.id); view(sc.id, 0.5); composer.render(); } cur.id = null; if (keep) show(keep); }

  return { renderer, scene, camera, composer, spaces, lights, show, view, render, resize, project, setScreenVideo, warmup, get current() { return cur; }, shadowsDirty() { renderer.shadowMap.needsUpdate = true; }, reapply() { const id = cur.id; cur.id = null; show(id); } };
}

export async function loadFonts() {
  const fs = ['700 40px "Caveat"', '500 40px "Caveat"', '40px "Permanent Marker"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '600 40px "Newsreader"', 'italic 400 30px "Newsreader"', '600 20px "Instrument Sans"', '400 20px "Instrument Sans"'];
  try { await Promise.all(fs.map(f => document.fonts.load(f))); } catch (e) {}
}
