// Universo Yo, Emilia — el scroll mueve la cámara por los espacios del corto.
// Las siete secciones del sitio original se recorren en orden; cada una vive en el espacio que le corresponde.
import { createStage, loadFonts, SCENES, cutBetween } from './stage.js';
import { WEEKS, EPISODES, OBJECTS, CAST, MARKERS, STEPS, CROSS, SEED_NOTES } from './data.js';
import { hooks, $, $$, esc, toast, openPanel, closePanel, ptop, openObject, shareImage, userNotes, getWeek, setWeek } from './legacy.js';
import { sound } from './audio.js';

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia("(max-width: 760px)").matches;
const touch = matchMedia("(pointer: coarse)").matches, lowGPU = small || touch;
ScrollTrigger.config({ ignoreMobileResize: true });
/* alto del lienzo: en teléfonos se usa el alto grande (sin la barra del navegador) para que no salte al hacer scroll */
const probe = Object.assign(document.createElement("div"), { style: "position:fixed;left:-9px;top:0;width:1px;height:100lvh;pointer-events:none;visibility:hidden" }); document.body.appendChild(probe);
const viewH = () => touch ? Math.max(innerHeight, probe.offsetHeight || 0) : innerHeight;
const NOTE = ['#f4d873', '#f1b4a3', '#bdd8b4', '#b8d0e8', '#d9c9ec', '#ff8a52', '#f1b4a3'];
const loaderStep = (pct, msg) => { $('#loaderBar').style.width = pct + '%'; if (msg) $('#loaderLine').textContent = msg; };
const smooth = u => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
const week = () => getWeek();

/* ---------- la pista de scroll ---------- */
const VH = small ? 125 : 150;
SCENES.forEach(s => { $('#' + s.id).style.height = s.w * VH + 'vh'; });
const beats = SCENES.map(s => $$('#' + s.id + ' .beat').map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b })));
const SECS = SCENES.filter((s, i) => SCENES.findIndex(x => x.sec === s.sec) === i);

/* ---------- navegación ---------- */
$('#escaleta').innerHTML = SECS.map((s, i) => `<a href="#${s.id}" data-goto="${s.id}" data-sec="${s.sec}" style="--c:${NOTE[i]}"><span>${s.nav}</span><i></i></a>`).join('');
$('#sceneList').innerHTML = SCENES.map((s, i) => `<li><a href="#${s.id}" data-goto="${s.id}"><span class="thumb" style="background-image:url(videos/${s.id}.jpg)"><video muted loop playsinline preload="none" data-src="videos/${s.id}.mp4"></video></span><span><small>${s.place}</small><b>${s.nav}</b></span></a></li>`).join('');
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
let jump = false;
function goTo(id, at = 0.1) {
  const s = SCENES.find(x => x.id === id); if (!s) return;
  const y = (s.a + (s.b - s.a) * at) * maxScroll();
  closeMenu();
  if (reduce || Math.abs(scrollY - y) > innerHeight * 6) { jump = true; scrollTo(0, y); } else gsap.to(window, { scrollTo: y, duration: 1.4, ease: 'power2.inOut' });
}
function openMenu() { $('#menu').hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); $('#menuClose').focus(); }
function closeMenu() { $('#menu').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }
$('#menuBtn').addEventListener('click', openMenu);
$('#menu').addEventListener('click', e => { if (e.target.id === 'menu' || e.target.closest('#menuClose')) closeMenu(); });
$('#sceneList').addEventListener('pointerover', e => {
  const v = e.target.closest('a')?.querySelector('video'); if (!v) return;
  if (!v.src) { v.src = v.dataset.src; v.addEventListener('loadeddata', () => v.classList.add('ready'), { once: true }); }
  v.play().catch(() => {});
});
$('#sceneList').addEventListener('pointerout', e => { const v = e.target.closest('a')?.querySelector('video'); if (v) v.pause(); });

/* ---------- paneles ---------- */
const panels = {
  cast(i) {
    const c = CAST[i];
    openPanel(ptop('Personaje', `${c.n}${c.age ? ` <i>${c.age}</i>` : ''}`) + `<div class="note n-y" style="transform:rotate(-1deg)">${c.q}</div>
      <p>${c.who}</p><p class="muted">${c.rel}</p>
      <div class="stack" style="gap:6px"><span class="kicker">Aparece en</span><div style="display:flex;flex-wrap:wrap;gap:6px">${c.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div></div>
      ${c.ep ? `<div class="stack" style="gap:6px"><span class="kicker">Para entenderlo, escucha</span><div><span class="chip accent">Miradas distintas · ${c.ep}</span></div></div>` : ''}
      <div><button class="btn dark" type="button" id="shareCast">Compartir ficha ↗</button></div>`);
    $('#shareCast').addEventListener('click', () => shareImage({ kind: 'ficha', title: c.n, body: c.q, sub: c.age ? c.age + ' años · ' + c.sub : c.sub }));
  },
  trailer() {
    openPanel(ptop('La historia', week() === 0 ? 'El <i>tráiler</i>' : 'El <i>cortometraje</i>') + `<div class="film-frame"><video src="videos/montaje.mp4" controls muted loop playsinline autoplay poster="videos/archivo.jpg"></video></div>
      <p class="small muted">${week() === 0 ? 'Tráiler · el corto completo se publica tras el estreno.' : 'En la web real aquí se reproduce el cortometraje completo sin salir de la página.'} Por ahora se proyecta el recorrido por los espacios de la historia.</p>
      <div class="stack" style="gap:8px"><span class="kicker">Marcadores de escena · abren el archivo</span><div class="markers">${MARKERS.map(m => `<button type="button" data-open="${m[2]}" data-go="archivo"><span class="t">${m[0]}</span>${m[1]}</button>`).join('')}</div></div>`);
  },
  pieza(k) {
    const P = [['Modo Directora', 'Microserie · TikTok · 5 capítulos de 45 s', 'La producción del piloto de <i>Ladrona de sueños</i>, contada por Emilia.'], ['El otro lado de Ricardo', 'Miniserie · YouTube Shorts', 'La misma historia vista desde Ricardo: lo que cedió, lo que perdió y lo que retoma.'], ['Miradas distintas', 'Podcast · Spotify · 5 episodios', 'Cineastas reales conversan sobre cómo se saca adelante una película.']][k];
    openPanel(ptop(P[1], P[0]) + `<p>${P[2]}</p><div class="stack" style="gap:8px">${WEEKS.slice(1).map(w => `<div class="card" style="padding:11px 14px;${w.n === week() ? 'border-color:var(--accent)' : ''}"><span class="kicker">Semana ${w.n} · ${w.n < week() ? 'ya estrenado' : w.n === week() ? 'en estreno' : 'próximamente'}</span><br><b>${w.rel[k][1]}</b> <span class="muted">${w.rel[k][2]}</span></div>`).join('')}</div>`);
  },
  podcast() {
    const ep = Math.max(1, Math.min(5, week() || 1));
    openPanel(ptop('Miradas distintas · Spotify', 'Tu pregunta para el <i>podcast</i>') + `<div class="card stack"><p class="small">Ep. ${ep} · <b>${EPISODES[ep - 1][0]}</b>: «${EPISODES[ep - 1][1]}»</p>
      <form class="stack" id="podForm"><b>${week() < 5 ? `Tu pregunta para el próximo invitado: ${EPISODES[Math.min(4, week())][0]}` : 'Tu pregunta para la próxima temporada'}</b>
      <label for="podName">Nombre</label><input type="text" id="podName" required maxlength="40"><label for="podQ">Tu pregunta</label><textarea id="podQ" required maxlength="240"></textarea><button class="btn dark" type="submit">Enviar pregunta</button></form></div>
      <div class="card stack"><span class="kicker">Producto innovador</span><p><b>El Pomodoro de Emilia.</b> Un temporizador físico: si lo retiras antes de tiempo, suena hasta que lo vuelves a colocar. En la web lo pruebas con la sesión <i>Modo Emilia</i>.</p><div><button class="btn ghost" type="button" data-open="dias" data-go="archivo">Probar Modo Emilia</button></div></div>`);
    $('#podForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Pregunta recibida. Si la eligen, la responden en el episodio y te nombran.'); });
  },
  estreno() {
    openPanel(ptop('06 · El estreno', 'Así fue la <i>noche</i>') + `<p class="small muted">Evidencia del evento: proyección del corto, conversatorio y brindis.</p>
      <div class="gallery"><div class="big">Video resumen del evento</div><div>Foto · proyección</div><div>Foto · conversatorio</div><div>Foto · mural físico</div><div>Foto · brindis</div></div>
      <a class="goto" href="#mural" data-go="mural"><span>Las notas del mural físico ya están en el cuarto de Emilia</span><b>→</b></a>`);
  },
  /* en el celular, la línea de tiempo y el calendario se abren en una hoja aparte */
  linea() {
    const X = i => `<button type="button" class="xbtn" data-px="${i}">Cruce ${i + 1}</button>`;
    openPanel(ptop('Universo transmedia', 'Antes, durante y <i>después</i> del corto') + `<div class="vtl" style="display:grid;gap:10px">
      <span class="kicker">Años antes</span><div class="card small"><b>El otro lado de Ricardo</b> · caps. 1–2: su primer corto y su primera concesión</div>
      <span class="kicker">Durante el corto</span><div class="card small"><b>Cortometraje <i>Yo, Emilia</i></b>: de la cafetería al fallo del jurado</div><div>${X(0)} ${X(1)}</div>
      <span class="kicker">Después del corto</span><div class="card small"><b>Modo Directora</b> · caps. 1–5: la producción del piloto</div><div>${X(2)}</div>
      <span class="kicker">Fuera de la ficción</span><div class="card small">El evento y <i>Miradas distintas</i></div></div><div class="xinfo" id="pxinfo"></div>`);
    let k = 0; const draw = () => { const c = CROSS[k]; $('#pxinfo').innerHTML = `<span class="kicker">Cruce ${k + 1} · ${c[1]}</span><b style="font-family:var(--f-display);font-size:1.25rem">${c[0]}</b><p>${c[2]}</p>`; $$('#panel [data-px]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.px === k)); };
    draw(); $('#panel').addEventListener('click', e => { const b = e.target.closest('[data-px]'); if (b) { k = +b.dataset.px; draw(); } });
  },
  semanas() {
    const n = week();
    openPanel(ptop('Calendario de estrenos', 'Cinco semanas, <i>una pregunta</i> cada una') + `<div class="weeks">${WEEKS.slice(1).map(x => `<div class="wk ${x.n === n ? 'on' : ''}"><button type="button" data-pwk="${x.n}"><span><b>Semana ${x.n}</b> · ${x.eje}</span><span class="small muted">${x.n < n ? '✓ vista' : x.n === n ? 'en estreno' : 'próximamente'}</span></button>${x.n === n ? `<div class="body">${x.rel.map(r => `<div class="r"><span><b>${r[1]}</b> <span class="muted">${r[2]}</span></span><span class="chip">${r[0]}</span></div>`).join('')}<div class="r"><span>Pregunta: <i>${x.q}</i></span></div></div>` : ''}</div>`).join('')}</div>`);
    $('#panel').addEventListener('click', e => { const b = e.target.closest('[data-pwk]'); if (b) { applyWeek(+b.dataset.pwk); panels.semanas(); } });
  },
  sello() { shareImage({ kind: 'sello', title: 'Así fue la noche del estreno', body: 'Aquí va tu foto del evento, con el sello.', sub: 'El estreno · Yo, Emilia' }); }
};

document.addEventListener('click', e => {
  const a = e.target.closest('[data-goto], [data-go], [data-open], [data-panel], [data-cast], [data-w], [data-x], [data-wk]'); if (!a) return;
  const d = a.dataset;
  if (d.goto) { e.preventDefault(); goTo(d.goto, d.goto === 'inicio' ? 0 : 0.1); return; }
  if (d.go) { e.preventDefault(); if (!d.open) closePanel(); goTo(d.go, d.open ? (d.go === 'mural' ? 0.2 : 0.55) : 0.1); }
  if (d.open) { e.preventDefault(); if (d.go) openObject(d.open); else focusThen(d.open, () => openObject(d.open)); }
  if (d.panel) focusThen(d.panel, () => panels[d.panel]());
  if (d.cast) focusThen('cast:' + d.cast, () => panels.cast(+d.cast));
  if (d.w) applyWeek(+d.w);
  if (d.wk) applyWeek(+d.wk);
  if (d.x) { cross = +d.x; drawCross(); }
});
$('#contactForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Demo: en la web real el mensaje llega al correo del proyecto.'); });
let podT = null;
$('#podPlay').addEventListener('click', () => { const b = $('#podPlay'); if (podT) { clearInterval(podT); podT = null; b.textContent = '▶'; return; } let s = 45; b.textContent = '❚❚'; podT = setInterval(() => { s--; $('#podTime').textContent = `0:${String(s).padStart(2, '0')}`; if (s <= 0) { clearInterval(podT); podT = null; b.textContent = '▶'; $('#podTime').textContent = '0:45'; } }, 1000); toast('Demo: en la web real suena el adelanto del episodio.'); });

/* ---------- contenido que depende de la semana (igual que en el sitio original) ---------- */
let stage = null, hotScene = null, cross = 0;
/* ---------- acercamiento al objeto elegido ----------
   Al tocar un objeto, la cámara vuela hacia él y luego se abre su ficha; al cerrarla, vuelve a la vista general. */
const fx = { k: 0, pose: null, shift: 0 };
function focusThen(id, open) {
  const pose = stage && stage.current.space && stage.current.space.focus && stage.current.space.focus[id];
  const obj = OBJECTS.find(o => o.id === id);
  if (!pose || (obj && obj.week > week())) { open(); return; }
  fx.pose = pose; fx.shift = innerWidth > 760 ? 0.3 : 0;
  document.body.classList.add('focusing');
  gsap.to(fx, { k: 1, duration: reduce ? 0 : 1.1, ease: 'power2.inOut', overwrite: true });
  gsap.delayedCall(reduce ? 0 : 0.8, open);
}
function releaseFocus() {
  document.body.classList.remove('focusing');
  if (fx.k > 0) gsap.to(fx, { k: 0, duration: reduce ? 0 : 1.0, ease: 'power2.inOut', overwrite: true, onComplete: () => { fx.pose = null; } });
}
new MutationObserver(() => { if ($('#scrim').hidden) releaseFocus(); }).observe($('#scrim'), { attributes: true, attributeFilter: ['hidden'] });
function drawCross() { const c = CROSS[cross]; $('#xinfo').innerHTML = `<span class="kicker">Cruce ${cross + 1} · ${c[1]}</span><b>${c[0]}</b><p>${c[2]}</p>`; $$('[data-x]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.x === cross)); }
function renderWeek() {
  const n = week(), w = WEEKS[n], o = w.obj ? OBJECTS.find(x => x.id === w.obj) : null;
  /* inicio */
  $('#liveQ').textContent = w.q; $('#qText').textContent = w.q; $('#qLabel').textContent = n === 0 ? 'Pregunta del estreno' : `Pregunta de la semana ${n}`;
  const notes = [...userNotes.filter(x => x.week === n).slice(-1), ...SEED_NOTES].slice(0, 3);
  $('#liveNotes').innerHTML = notes.map((x, i) => `<div class="note ${x.reply ? 'reply' : x.c}" style="transform:rotate(${[-1.5, 1.2, -0.6][i]}deg);${i === 1 ? 'margin-left:10%' : ''}">${esc(x.t)}</div>`).join('');
  $('#stripTitle').textContent = n === 0 ? 'Esta semana en el universo · noche del estreno' : `Esta semana en el universo · semana ${n} · ${w.eje}`;
  $('#strip').innerHTML = w.rel.map(r => `<div class="card rel"><span class="chip">${r[0]}</span><b>${r[1]}</b><span class="small">${r[2]}</span></div>`).join('') +
    `<a class="card rel newobj" href="#archivo" data-go="archivo" ${o ? `data-open="${o.id}"` : ''}><span class="chip">${o ? 'Nuevo en el cuarto' : 'Empieza aquí'}</span><b>${o ? o.name : 'El cuarto de Emilia'}</b><span class="small">${o ? 'Ábrelo en el archivo' : 'Cuatro objetos para empezar'}</span></a>`;
  /* historia */
  $('#playerCap').textContent = n === 0 ? 'Tráiler · el corto completo se publica tras el estreno' : 'Cortometraje completo';
  $('#markers').innerHTML = MARKERS.map(m => `<button type="button" data-open="${m[2]}" data-go="archivo"><span class="t">${m[0]}</span>${m[1]}</button>`).join('');
  /* archivo */
  const open = OBJECTS.filter(x => x.week <= n);
  $('#objCount').textContent = `En el cuarto · ${open.length} de 9 objetos`;
  $('#objList').innerHTML = OBJECTS.map(x => x.week <= n ? `<button type="button" data-open="${x.id}" class="${x.id === w.obj ? 'new' : ''}">${x.name}</button>` : `<button type="button" disabled>Semana ${x.week} · ?</button>`).join('');
  /* universo */
  $('#steps').innerHTML = STEPS.map((s, i) => `<div class="step ${i === 3 ? 'here' : ''}"><span class="num">${i + 1}</span><b>${s[0]}</b><span class="small">${s[1]}</span></div>`).join('');
  const X = i => `<button type="button" class="xbtn" data-x="${i}">Cruce ${i + 1}</button>`;
  $('#lanes').innerHTML = `<div></div><div class="ph">Años antes</div><div class="ph">Durante el corto</div><div class="ph">Después del corto</div>
    <div class="lane-name"><b>Cortometraje</b><span>Yo, Emilia</span></div><div class="lane-cell"></div><div class="lane-cell"><span class="seg-b main">De la cafetería al fallo del jurado</span></div><div class="lane-cell"></div>
    <div class="lane-name"><b>El otro lado de Ricardo</b><span>YouTube Shorts · 5 caps.</span></div><div class="lane-cell"><span class="seg-b">Caps. 1–2 · su primer corto</span></div><div class="lane-cell"><span class="seg-b">Caps. 3–4</span>${X(0)}${X(1)}</div><div class="lane-cell"><span class="seg-b">Cap. 5</span>${X(2)}</div>
    <div class="lane-name"><b>Modo Directora</b><span>TikTok · 5 caps.</span></div><div class="lane-cell"></div><div class="lane-cell"></div><div class="lane-cell"><span class="seg-b green">Caps. 1–5 · la producción del piloto</span></div>
    <div class="lane-name"><b>Fuera de la ficción</b><span>real</span></div><div class="lane-cell"></div><div class="lane-cell"><span class="seg-b out">Evento · estreno</span></div><div class="lane-cell"><span class="seg-b out">Miradas distintas</span></div>`;
  $('#vtl').innerHTML = `<span class="kicker">Años antes</span><div class="card small"><b>El otro lado de Ricardo</b> · caps. 1–2: su primer corto y su primera concesión</div>
    <span class="kicker">Durante el corto</span><div class="card small"><b>Cortometraje <i>Yo, Emilia</i></b>: de la cafetería al fallo del jurado</div><div>${X(0)} ${X(1)}</div>
    <span class="kicker">Después del corto</span><div class="card small"><b>Modo Directora</b> · caps. 1–5: la producción del piloto</div><div>${X(2)}</div>`;
  drawCross();
  $('#weeks').innerHTML = WEEKS.slice(1).map(x => `<div class="wk ${x.n === n ? 'on' : ''}"><button type="button" data-wk="${x.n}" aria-expanded="${x.n === n}"><span><b>Semana ${x.n}</b> · ${x.eje}</span><span class="small muted">${x.n < n ? '✓ vista' : x.n === n ? 'en estreno' : 'próximamente'}</span></button>${x.n === n ? `<div class="body">${x.rel.map(r => `<div class="r"><span><b>${r[1]}</b> <span class="muted">${r[2]}</span></span><span class="chip">${r[0]}</span></div>`).join('')}<div class="r"><span>Pregunta: <i>${x.q}</i></span></div></div>` : ''}</div>`).join('');
  const ep = Math.max(1, Math.min(5, n || 1));
  $('#podEp').innerHTML = `Ep. ${ep} · <b>${EPISODES[ep - 1][0]}</b>: «${EPISODES[ep - 1][1]}»`;
  $$('.weekseg').forEach(el => { el.innerHTML = WEEKS.map(x => `<button type="button" data-w="${x.n}" aria-pressed="${x.n === n}">${x.n === 0 ? 'Estreno' : 'Semana ' + x.n}</button>`).join(''); });
  if (stage) { stage.spaces.cuarto.setWeek(n); stage.shadowsDirty(); hotScene = null; }
}
function applyWeek(n) { setWeek(n); renderWeek(); const o = WEEKS[n].obj; toast(o ? `Semana ${n}: apareció «${OBJECTS.find(x => x.id === o).name}» en el cuarto` : 'Noche del estreno: el universo se abre'); }
$('#castList').innerHTML = CAST.map((c, i) => `<li><button type="button" data-cast="${i}">${c.n}${c.age ? ` <small>${c.age}</small>` : ''}<span>${c.sub}</span></button></li>`).join('');
$('#crew').innerHTML = [['Actriz de Lucía', 'Cap. 1 · Casting de Lucía'], ['Elenco', 'Cap. 2 · El elenco y sus problemas'], ['Cámara e iluminación', 'Cap. 3 · Detrás de cámara'], ['Sonido', 'Cap. 4 · Que se escuche'], ['Edición', 'Cap. 5 · Lo que no viste']].map(r => `<div class="card"><b>${r[0]}</b><span class="small muted">${r[1]}</span></div>`).join('');
renderWeek();

/* ---------- sonido ---------- */
let curId = 'inicio';
function setSound(v) {
  if (v) sound.enable(curId); else sound.disable();
  const b = $('#soundBtn'); b.setAttribute('aria-pressed', sound.on); b.textContent = sound.on ? 'Sonido: sí' : 'Sonido: no';
}
$('#soundBtn').addEventListener('click', () => setSound(!sound.on));

/* ---------- arranque ---------- */
loaderStep(15, 'Cargando tipografías');
await loadFonts();
loaderStep(35, 'Montando los sets');
await new Promise(r => setTimeout(r, 30));
const canvas = $('#gl'), teaser = $('#teaser');
let dpr = Math.min(devicePixelRatio || 1, lowGPU ? 1.25 : 1.6);
const forceLite = new URLSearchParams(location.search).has('lite');
try { if (!forceLite) stage = createStage(canvas, { width: Math.max(2, innerWidth), height: Math.max(2, viewH()), dpr, shadows: lowGPU ? 1024 : 2048, ao: !lowGPU }); }
catch (err) { console.warn('Sin WebGL: se muestra la versión sin 3D.', err); }

if (!stage) {
  document.body.classList.add('lite'); SCENES.forEach(s => $('#' + s.id).style.setProperty('--poster', `url(videos/${s.id}.jpg)`));
  document.body.classList.remove("booting");
} else {
  const cuarto = stage.spaces.cuarto; cuarto.setWeek(week());
  userNotes.forEach(n => cuarto.addPublicNote(n));
  hooks.onNote = n => { cuarto.addPublicNote(n); stage.shadowsDirty(); renderWeek(); };
  loaderStep(70, 'Encendiendo las luces'); await new Promise(r => setTimeout(r, 30));
  stage.warmup();
  loaderStep(100, 'Listo para rodar');

  const vid = $('#vidMontaje');
  vid.addEventListener('loadeddata', () => stage.setScreenVideo(vid), { once: true });

  /* puntos sobre los objetos (los que aún no aparecen se ven apagados, con su semana) */
  const hotBox = $('#hotspots'); let hots = [];
  function buildHots(sc) {
    const defs = stage.spaces[sc.space].hotspots[sc.id] || [];
    hotBox.innerHTML = ''; hots = [];
    for (const d of defs) {
      const obj = OBJECTS.find(o => o.id === d.id), locked = obj && obj.week > week();
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'hot' + (locked ? ' locked' : '') + (obj && week() > 0 && WEEKS[week()].obj === d.id ? ' new' : '');
      b.innerHTML = `<i></i><span>${esc(locked ? 'Semana ' + obj.week : d.label || (obj ? obj.name : d.id))}</span>`;
      b.addEventListener('click', () => focusThen(d.id, () => { if (obj) openObject(d.id); else { const [k, v] = d.id.split(':'); panels[k](v === undefined ? undefined : +v); } }));
      hotBox.appendChild(b); hots.push({ d, b });
    }
  }
  function setSlug() {}

  let target = 0, p = 0;
  ScrollTrigger.create({ trigger: '#track', start: 'top top', end: 'bottom bottom', onUpdate: s => { target = s.progress; } });
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduce && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => { look.tx = (e.clientX / innerWidth) * 2 - 1; look.ty = -((e.clientY / innerHeight) * 2 - 1); });

  let curI = -1, intro = { f: 0 }, slow = 0, frames = 0, sw = innerWidth, sh = viewH(), entered = false;
  function frame(time, dt) {
    /* en el teléfono, la barra del navegador cambia el alto al hacer scroll: solo se reajusta si cambia el ancho o mucho el alto */
    if (innerWidth !== sw || Math.abs(viewH() - sh) > (touch ? 160 : 0)) { sw = innerWidth; sh = viewH(); if (sw > 0 && sh > 0) { stage.resize(sw, sh, dpr); ScrollTrigger.refresh(); } }
    if (sw < 2 || sh < 2) return;
    const k = jump || reduce ? 1 : 1 - Math.exp(-dt / 1000 * 5.5); jump = false;
    p += (target - p) * k; if (Math.abs(target - p) < 1e-5) p = target;
    look.x += (look.tx - look.x) * 0.06; look.y += (look.ty - look.y) * 0.06;
    let i = SCENES.findIndex(s => p < s.b); if (i < 0) i = SCENES.length - 1;
    const sc = SCENES[i], t = (p - sc.a) / (sc.b - sc.a), e = 0.075;
    let fade = intro.f;
    if (i > 0 && cutBetween(i - 1, i)) fade = Math.min(fade, smooth(t / e));
    if (i < SCENES.length - 1 && cutBetween(i, i + 1)) fade = Math.min(fade, smooth((1 - t) / e));
    if (i !== curI) {
      curI = i; curId = sc.id; stage.show(sc.id); setSlug(i); buildHots(sc); hotScene = sc.id; sound.scene(sc.id);
      $$('#escaleta a').forEach(a => a.dataset.sec === sc.sec ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
      $$('#sceneList a').forEach(a => a.dataset.goto === sc.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
      try { history.replaceState(null, '', '#' + sc.id); } catch (err) {}
      if (i >= 1 && vid.preload !== 'auto') { vid.preload = 'auto'; vid.load(); }
      if (sc.id === "historia" || sc.id === "estreno") vid.play().catch(() => {}); else vid.pause();
    }
    if (hotScene !== sc.id) { buildHots(sc); hotScene = sc.id; }
    /* el teaser llena la pantalla al inicio y se disuelve hacia la calle */
    const tv = i === 0 ? 1 - smooth((t - 0.2) / 0.16) : 0;
    teaser.style.opacity = (tv * intro.f).toFixed(3); teaser.style.transform = `scale(${(1 + (i === 0 ? t : 1) * 0.5).toFixed(4)})`; teaser.style.visibility = tv > 0.001 ? 'visible' : 'hidden';
    if (tv > 0.001 && teaser.paused && entered) teaser.play().catch(() => {}); else if (tv <= 0.001 && !teaser.paused) teaser.pause();
    if (tv * intro.f < 0.999) { stage.view(sc.id, t, look, fx); stage.render(time, fade); }
    beats.forEach((list, j) => list.forEach(b => b.el.classList.toggle('on', entered && j === i && t >= b.a && t < b.b && fade > 0.55)));
    const busy = !$('#scrim').hidden || !$('#menu').hidden;
    for (const h of hots) {
      const q = !busy && fade > 0.7 && t >= h.d.range[0] && t <= h.d.range[1] ? stage.project(h.d.p, sw, sh) : null;
      const ok = q && q.x > 20 && q.x < sw - 20 && q.y > 80 && q.y < sh - 40;
      h.b.classList.toggle('on', !!ok); if (ok) h.b.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
    }
    if (frames < 240) { frames++; if (frames > 40 && dt > 30) slow++; if (frames === 240 && slow > 90 && dpr > 0.8) { dpr = Math.max(0.8, dpr - 0.4); stage.resize(sw, sh, dpr); frames = 0; slow = 0; } }
  }
  gsap.ticker.add((time, dt) => frame(time, dt));
  window.__frame = (n = 3) => { ScrollTrigger.update(); target = scrollY / Math.max(1, maxScroll()); intro.f = 1; entered = true; for (let i = 0; i < n; i++) frame(performance.now() / 1000, 1000); };

  /* entrada: el visitante elige si entra con sonido */
  const hash = location.hash.slice(1);
  if (hash && hash !== 'inicio' && SCENES.some(s => s.id === hash)) { const s = SCENES.find(x => x.id === hash); jump = true; scrollTo(0, (s.a + (s.b - s.a) * 0.1) * maxScroll()); }
  $('#loaderLine').textContent = 'Usa audífonos: cada espacio suena distinto'; $('#loaderGo').hidden = false;
  $('#loaderGo').addEventListener('click', e => {
    const b = e.target.closest('[data-enter]'); if (!b) return;
    setSound(b.dataset.enter === '1'); entered = true; document.body.classList.remove('booting');
    gsap.to(intro, { f: 1, duration: reduce ? 0.01 : 2.2, ease: 'power2.out', delay: 0.15 });
  });
}
