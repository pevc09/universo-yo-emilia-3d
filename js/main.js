// Universo Yo, Emilia — el scroll mueve la cámara por los espacios del corto.
import { createStage, loadFonts, SCENES, cutBetween } from './stage.js';
import { WEEKS, EPISODES, OBJECTS, CAST, MARKERS, STEPS, CROSS } from './data.js';
import { hooks, $, $$, esc, toast, openPanel, closePanel, ptop, openObject, shareImage, userNotes, getWeek, setWeek } from './legacy.js';

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;
const NOTE = ['#f4d873', '#f1b4a3', '#bdd8b4', '#b8d0e8', '#d9c9ec', '#f4d873', '#ff8a52', '#f1b4a3'];
const loaderStep = (pct, msg) => { $('#loaderBar').style.width = pct + '%'; if (msg) $('#loaderLine').textContent = msg; };
const smooth = u => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };

/* ---------- la pista de scroll: cada escena ocupa su parte ---------- */
const VH = small ? 135 : 160;
SCENES.forEach(s => { $('#' + s.id).style.height = s.w * VH + 'vh'; });
const beats = SCENES.map(s => $$('#' + s.id + ' .beat').map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b })));

/* ---------- navegación ---------- */
$('#escaleta').innerHTML = SCENES.map((s, i) => `<a href="#${s.id}" data-goto="${s.id}" style="--c:${NOTE[i]}"><span>${s.nav}</span><i></i></a>`).join('');
$('#sceneList').innerHTML = SCENES.map((s, i) => `<li><a href="#${s.id}" data-goto="${s.id}"><span class="thumb" style="background-image:url(videos/${s.id}.jpg)"><video muted loop playsinline preload="none" data-src="videos/${s.id}.mp4"></video></span><span><small>ESC. ${i + 1} · ${s.slug}</small><b>${s.nav}</b></span></a></li>`).join('');
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
function goTo(id, at = 0.1) {
  const s = SCENES.find(x => x.id === id); if (!s) return;
  const y = (s.a + (s.b - s.a) * at) * maxScroll();
  closeMenu();
  if (reduce || Math.abs(scrollY - y) > innerHeight * 6) { jump = true; scrollTo(0, y); } else gsap.to(window, { scrollTo: y, duration: 1.4, ease: 'power2.inOut' });
}
let jump = false;
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

/* ---------- paneles propios de esta versión ---------- */
const week = () => getWeek();
const panels = {
  actos() {
    openPanel(ptop('La historia', 'En <i>tres actos</i>') + `<div class="act3">
      <div><span class="kicker">Planteamiento</span><p>Emilia, cineasta de 25 años, busca realizar su primer largometraje, <i>La ladrona de sueños</i>, junto a Ricardo, su amigo y socio productor. Sus postulaciones a fondos y convocatorias son rechazadas.</p></div>
      <div><span class="kicker">Desarrollo</span><p>Ricardo encuentra una marca dispuesta a financiar la película si se modifica la historia para hacerla más comercial. Emilia se niega y rompe su alianza profesional con él. Se queda sin financiamiento.</p></div>
      <div><span class="kicker">Desenlace</span><p>Emilia adapta su historia al formato de serie y postula a una convocatoria para realizar un piloto. Una semana después del pitch recibe el fallo: fue seleccionada.</p></div>
    </div><a class="goto" href="#archivo" data-go="archivo"><span>Mira lo que el corto no cuenta: el cuarto de Emilia</span><b>→</b></a>`);
  },
  cast(i) {
    const c = CAST[i];
    openPanel(ptop('Personaje', `${c.n}${c.age ? ` <i>${c.age}</i>` : ''}`) + `<div class="note n-y" style="transform:rotate(-1deg)">${c.q}</div>
      <p>${c.who}</p><p class="muted">${c.rel}</p>
      <div class="stack" style="gap:6px"><span class="kicker">Aparece en</span><div style="display:flex;flex-wrap:wrap;gap:6px">${c.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div></div>
      ${c.ep ? `<div class="stack" style="gap:6px"><span class="kicker">Para entenderlo, escucha</span><div><span class="chip accent">Miradas distintas · ${c.ep}</span></div></div>` : ''}
      <div><button class="btn dark" type="button" id="shareCast">Compartir ficha</button></div>`);
    $('#shareCast').addEventListener('click', () => shareImage({ kind: 'ficha', title: c.n, body: c.q, sub: c.age ? c.age + ' años · ' + c.sub : c.sub }));
  },
  crew() {
    const r = [['Actriz de Lucía', 'Cap. 1 · Casting de Lucía'], ['Elenco', 'Cap. 2 · El elenco y sus problemas'], ['Cámara e iluminación', 'Cap. 3 · Detrás de cámara'], ['Sonido', 'Cap. 4 · Que se escuche'], ['Edición', 'Cap. 5 · Lo que no viste']];
    openPanel(ptop('Modo Directora · TikTok', 'El equipo del <i>piloto</i>') + `<p class="small muted">Después del fallo, Emilia produce el piloto de <i>Ladrona de sueños</i>. Cada capítulo de la microserie presenta a una parte del equipo.</p><div class="stack" style="gap:8px">${r.map(x => `<div class="card" style="padding:12px 14px"><b>${x[0]}</b><br><span class="small muted">${x[1]}</span></div>`).join('')}</div>`);
  },
  trailer() {
    openPanel(ptop('Cineclub · función de hoy', 'El <i>tráiler</i>') + `<div class="film-frame"><video src="videos/montaje.mp4" controls muted loop playsinline autoplay poster="videos/archivo.jpg"></video></div>
      <p class="small muted">${week() === 0 ? 'El corto completo se publica después del estreno.' : 'Cortometraje completo disponible tras el estreno.'} Por ahora se proyecta el recorrido por los espacios de la historia.</p>
      <div class="stack" style="gap:8px"><span class="kicker">Marcadores de escena · abren el archivo</span><div class="markers">${MARKERS.map(m => `<button type="button" data-open="${m[2]}" data-go="archivo"><span class="t">${m[0]}</span>${m[1]}</button>`).join('')}</div><p class="small muted">Tiempos de ejemplo: los define edición.</p></div>`);
  },
  universo() {
    let cross = 0;
    const X = i => `<button type="button" class="xbtn" data-x="${i}">Cruce ${i + 1}</button>`;
    openPanel(ptop('Universo transmedia', 'El recorrido <i>completo</i>') + `<p class="small muted">Siete experiencias en el orden del viaje. Estás en la cuarta.</p>
      <div class="stack" style="gap:6px">${STEPS.map((s, i) => `<div class="card" style="padding:10px 14px;display:flex;gap:12px;align-items:baseline;${i === 3 ? 'border-color:var(--accent)' : ''}"><b style="font-family:var(--f-mono)">${i + 1}</b><span><b>${s[0]}</b><br><span class="small muted">${s[1]}</span></span></div>`).join('')}</div>
      <div class="stack" style="gap:10px"><span class="kicker">Línea de tiempo · antes, durante y después del corto</span>
        <div class="vtl" style="display:grid;gap:10px"><span class="kicker">Años antes</span><div class="card small"><b>El otro lado de Ricardo</b> · caps. 1–2: su primer corto y su primera concesión</div>
        <span class="kicker">Durante el corto</span><div class="card small"><b>Cortometraje <i>Yo, Emilia</i></b>: de la cafetería al fallo del jurado</div><div>${X(0)} ${X(1)}</div>
        <span class="kicker">Después del corto</span><div class="card small"><b>Modo Directora</b> · caps. 1–5: la producción del piloto</div><div>${X(2)}</div>
        <span class="kicker">Fuera de la ficción</span><div class="card small">El evento y <i>Miradas distintas</i></div></div>
        <div class="xinfo" id="xinfo"></div></div>`);
    const draw = () => { const c = CROSS[cross]; $('#xinfo').innerHTML = `<span class="kicker">Cruce ${cross + 1} · ${c[1]}</span><b style="font-family:var(--f-display);font-size:1.3rem">${c[0]}</b><p>${c[2]}</p>`; $$('#panel [data-x]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.x === cross)); };
    draw(); $('#panel').addEventListener('click', e => { const x = e.target.closest('[data-x]'); if (x) { cross = +x.dataset.x; draw(); } });
  },
  semanas() {
    openPanel(ptop('Calendario de estrenos', 'Cinco semanas, <i>una pregunta</i> cada una') + `<div class="weeks">${WEEKS.slice(1).map(w => `<div class="wk ${w.n === week() ? 'on' : ''}"><button type="button" data-wk="${w.n}"><span><b>Semana ${w.n}</b> · ${w.eje}</span><span class="small muted">${w.n < week() ? '✓ vista' : w.n === week() ? 'en estreno' : 'próximamente'}</span></button><div class="body">${w.rel.map(r => `<div class="r"><span><b>${r[1]}</b> <span class="muted">${r[2]}</span></span><span class="chip">${r[0]}</span></div>`).join('')}<div class="r"><span>Pregunta: <i>${w.q}</i></span></div><div class="r"><span>Nuevo en el cuarto: <b>${OBJECTS.find(o => o.id === w.obj).name}</b></span></div></div></div>`).join('')}</div>`);
    $('#panel').addEventListener('click', e => { const b = e.target.closest('[data-wk]'); if (b) { applyWeek(+b.dataset.wk); panels.semanas(); } });
  },
  podcast() {
    const ep = Math.max(1, Math.min(5, week() || 1));
    openPanel(ptop('Miradas distintas · Spotify', 'Tu pregunta para el <i>podcast</i>') + `<div class="card stack"><p class="small">Ep. ${ep} · <b>${EPISODES[ep - 1][0]}</b>: «${EPISODES[ep - 1][1]}»</p>
      <form class="stack" id="podForm"><b>${week() < 5 ? `Tu pregunta para el próximo invitado: ${EPISODES[Math.min(4, week())][0]}` : 'Tu pregunta para la próxima temporada'}</b>
      <label for="podName">Nombre</label><input type="text" id="podName" required maxlength="40"><label for="podQ">Tu pregunta</label><textarea id="podQ" required maxlength="240"></textarea><button class="btn dark" type="submit">Enviar pregunta</button></form></div>
      <div class="card stack"><span class="kicker">Producto innovador</span><p><b>El Pomodoro de Emilia.</b> Un temporizador físico: si lo retiras antes de tiempo, suena hasta que lo vuelves a colocar. Aquí lo pruebas con la sesión <i>Modo Emilia</i>.</p><div><button class="btn ghost" type="button" data-open="dias" data-go="archivo">Probar Modo Emilia</button></div></div>`);
    $('#podForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Pregunta recibida. Si la eligen, la responden en el episodio y te nombran.'); });
  },
  objetos() {
    openPanel(ptop('El archivo de Emilia', 'Los <i>nueve</i> objetos') + `<div class="stack" style="gap:8px">${OBJECTS.map(o => `<button type="button" class="objrow" ${o.week > week() ? 'disabled' : `data-open="${o.id}"`}><span><b>${o.name}</b><br><span class="small muted">${o.type}</span></span><span class="small muted">${o.week > week() ? 'semana ' + o.week : 'abrir'}</span></button>`).join('')}</div>`);
  },
  fallo() {
    openPanel(ptop('13 de agosto de 2026', 'Fallo final del <i>jurado</i>') + `<div class="mail"><span class="from">De: Convocatoria Casa Melón y Entretenimiento<br>Para: Emilia Cisneros</span><b style="font-family:var(--f-display);font-size:1.3rem">Fallo final del jurado</b>
      <p>Estimada Emilia:</p><p>Nos complace informarle que su proyecto <b>Ladrona de sueños</b> ha sido seleccionado para recibir el estímulo económico destinado a la realización del piloto de serie.</p><p>Felicitaciones.</p></div>
      <div class="note n-y" style="transform:rotate(-1deg)">Enviado. Sin pedirle permiso a nadie.</div>
      <p class="small muted">Emilia desayuna con Romina cuando llega el correo. Lo que pasa después se cuenta en <i>Modo Directora</i>.</p>
      <a class="goto" href="#universo" data-go="universo"><span>Cómo se produce el piloto: <i>Modo Directora</i> en TikTok</span><b>→</b></a>`);
  },
  estreno() {
    openPanel(ptop('El estreno', 'Así fue la <i>noche</i>') + `<p class="small muted">Evidencia del evento: proyección del corto, conversatorio y brindis.</p>
      <div class="gallery"><div class="big">Video resumen del evento</div><div>Foto · proyección</div><div>Foto · conversatorio</div><div>Foto · mural físico</div><div>Foto · brindis</div></div>
      <div class="card"><p class="quote">“Aquí va un testimonio breve de un asistente sobre el corto y el conversatorio.”</p><p class="small muted">Nombre · asistente</p></div>
      <div class="card"><p class="quote">“Aquí va un testimonio breve de un invitado del conversatorio.”</p><p class="small muted">Nombre · invitado</p></div>
      <a class="goto" href="#mural" data-go="mural"><span>Las notas del mural físico ya están en el cuarto de Emilia</span><b>→</b></a>`);
  },
  sello() { shareImage({ kind: 'sello', title: 'Así fue la noche del estreno', body: 'Aquí va tu foto del evento, con el sello.', sub: 'El estreno · Yo, Emilia' }); }
};

document.addEventListener('click', e => {
  const a = e.target.closest('[data-goto], [data-go], [data-open], [data-panel]'); if (!a) return;
  if (a.dataset.goto) { e.preventDefault(); goTo(a.dataset.goto, a.dataset.goto === 'inicio' ? 0 : 0.1); return; }
  if (a.dataset.go) { e.preventDefault(); if (!a.dataset.open) closePanel(); goTo(a.dataset.go, a.dataset.open ? 0.55 : 0.1); }
  if (a.dataset.open) { e.preventDefault(); openObject(a.dataset.open); }
  if (a.dataset.panel) panels[a.dataset.panel]();
});
$('#contactForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('Demo: en la web real el mensaje llega al correo del proyecto.'); });
$('#castList').innerHTML = CAST.map((c, i) => `<li><button type="button" data-cast="${i}">${c.n}</button></li>`).join('');
$('#castList').addEventListener('click', e => { const b = e.target.closest('[data-cast]'); if (b) panels.cast(+b.dataset.cast); });

/* ---------- lo que cambia con la semana ---------- */
let stage = null, hotScene = null;
function renderWeek() {
  const w = WEEKS[week()], o = w.obj ? OBJECTS.find(x => x.id === w.obj) : null;
  $('#stripTitle').textContent = week() === 0 ? 'Esta semana en el universo: la noche del estreno' : `Esta semana en el universo: semana ${week()}, «${w.eje}»`;
  const rows = w.rel.map(r => `<li><b>${r[0]}</b>${r[1]} <i>${r[2]}</i></li>`).join('') + (o ? `<li><b>En el cuarto</b>Apareció «${o.name}»</li>` : '');
  $('#strip').innerHTML = rows; $('#releases').innerHTML = rows;
  $('#weekTitle').textContent = week() === 0 ? 'La noche del estreno' : `Semana ${week()}: ${w.eje}`;
  $('#qLabel').textContent = week() === 0 ? 'La pregunta del estreno' : `La pregunta de la semana ${week()}`;
  $('#qText').textContent = w.q;
  $('#objCount').textContent = `Ver los ${OBJECTS.filter(x => x.week <= week()).length} objetos abiertos (de 9)`;
  $('#weekSeg').innerHTML = WEEKS.map(x => `<button type="button" data-w="${x.n}" aria-pressed="${x.n === week()}">${x.n === 0 ? 'Estreno' : 'Semana ' + x.n}</button>`).join('');
  if (stage) { stage.spaces.cuarto.setWeek(week()); stage.shadowsDirty(); hotScene = null; }
}
function applyWeek(n) { setWeek(n); renderWeek(); const o = WEEKS[n].obj; toast(o ? `Semana ${n}: apareció «${OBJECTS.find(x => x.id === o).name}» en el cuarto` : 'Noche del estreno: el universo se abre'); }
$('#weekSeg').addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (b) applyWeek(+b.dataset.w); });
renderWeek();

/* ---------- arranque ---------- */
loaderStep(15, 'Cargando tipografías');
await loadFonts();
loaderStep(35, 'Montando los sets');
await new Promise(r => setTimeout(r, 30));
const canvas = $('#gl');
let dpr = Math.min(devicePixelRatio || 1, small ? 1.4 : 1.6);
const forceLite = new URLSearchParams(location.search).has('lite');
try { if (!forceLite) stage = createStage(canvas, { width: Math.max(2, innerWidth), height: Math.max(2, innerHeight), dpr, shadows: small ? 1024 : 2048, ao: !small }); }
catch (err) { console.warn('Sin WebGL: se muestra la versión sin 3D.', err); }

if (!stage) {
  document.body.classList.add('lite'); SCENES.forEach(s => $('#' + s.id).style.setProperty('--poster', `url(videos/${s.id}.jpg)`));
  $('#slug').textContent = 'UNIVERSO YO, EMILIA'; document.body.classList.remove('booting');
} else {
  window.__stage = stage;
  const cuarto = stage.spaces.cuarto; cuarto.setWeek(week());
  userNotes.forEach(n => cuarto.addPublicNote(n));
  hooks.onNote = n => { cuarto.addPublicNote(n); stage.shadowsDirty(); };
  loaderStep(70, 'Encendiendo las luces'); await new Promise(r => setTimeout(r, 30));
  stage.warmup();
  loaderStep(100, 'Acción');

  /* video del montaje en la pantalla del cineclub */
  const vid = $('#vidMontaje'); let vidReady = false;
  vid.addEventListener('loadeddata', () => { vidReady = true; stage.setScreenVideo(vid); }, { once: true });

  /* puntos sobre los objetos */
  const hotBox = $('#hotspots'); let hots = [];
  function buildHots(sc) {
    const defs = stage.spaces[sc.space].hotspots[sc.id] || [];
    hotBox.innerHTML = ''; hots = [];
    for (const d of defs) {
      const obj = OBJECTS.find(o => o.id === d.id);
      if (obj && obj.week > week()) continue;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'hot' + (obj && week() > 0 && WEEKS[week()].obj === d.id ? ' new' : '');
      b.innerHTML = `<i></i><span>${esc(d.label || (obj ? obj.name : d.id))}</span>`;
      b.addEventListener('click', () => { if (obj) openObject(d.id); else if (d.id.startsWith('cast:')) panels.cast(+d.id.slice(5)); else panels[d.id](); });
      hotBox.appendChild(b); hots.push({ d, b });
    }
  }

  /* encabezado de escena, tecleado como en un guion */
  let typer = null;
  function setSlug(i) {
    const s = SCENES[i]; $('#slugNum').textContent = `ESC. ${i + 1}`;
    clearInterval(typer); const el = $('#slug');
    if (reduce) { el.textContent = s.slug; return; }
    let k = 0; el.textContent = ''; typer = setInterval(() => { el.textContent = s.slug.slice(0, ++k); if (k >= s.slug.length) clearInterval(typer); }, 24);
  }

  /* scroll → progreso */
  let target = 0, p = 0;
  ScrollTrigger.create({ trigger: '#track', start: 'top top', end: 'bottom bottom', onUpdate: s => { target = s.progress; } });
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduce && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => { look.tx = (e.clientX / innerWidth) * 2 - 1; look.ty = -((e.clientY / innerHeight) * 2 - 1); });
  addEventListener('resize', () => { stage.resize(innerWidth, innerHeight, dpr); ScrollTrigger.refresh(); });

  let curI = -1, intro = { f: 0 }, slow = 0, frames = 0, sw = innerWidth, sh = innerHeight;
  const W = () => innerWidth, H = () => innerHeight;
  function frame(time, dt) {
    if (innerWidth !== sw || innerHeight !== sh) { sw = innerWidth; sh = innerHeight; if (sw > 0 && sh > 0) stage.resize(sw, sh, dpr); }
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
      curI = i; stage.show(sc.id); setSlug(i); buildHots(sc); hotScene = sc.id;
      $$('#escaleta a, #sceneList a').forEach(a => a.dataset.goto === sc.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
      try { history.replaceState(null, '', '#' + sc.id); } catch (err) {}
      if (i >= 2 && vid.preload !== 'auto') { vid.preload = 'auto'; vid.load(); }
      if (sc.id === 'universo') vid.play().catch(() => {}); else vid.pause();
    }
    if (hotScene !== sc.id) { buildHots(sc); hotScene = sc.id; }
    stage.view(sc.id, t, look); stage.render(time, fade);
    /* textos */
    beats.forEach((list, j) => list.forEach(b => b.el.classList.toggle('on', j === i && t >= b.a && t < b.b && fade > 0.55)));
    /* puntos */
    const busy = !$('#scrim').hidden || !$('#menu').hidden;
    for (const h of hots) {
      const q = !busy && fade > 0.7 && t >= h.d.range[0] && t <= h.d.range[1] ? stage.project(h.d.p, W(), H()) : null;
      const ok = q && q.x > 20 && q.x < W() - 20 && q.y > 70 && q.y < H() - 30;
      h.b.classList.toggle('on', !!ok); if (ok) h.b.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px)`;
    }
    /* si el equipo no da, baja la resolución */
    if (frames < 240) { frames++; if (frames > 40 && dt > 30) slow++; if (frames === 240 && slow > 90 && dpr > 0.8) { dpr = Math.max(0.8, dpr - 0.4); stage.resize(innerWidth, innerHeight, dpr); frames = 0; slow = 0; } }
  }
  gsap.ticker.add((time, dt) => frame(time, dt));
  window.__frame = (n = 3) => { ScrollTrigger.update(); target = scrollY / Math.max(1, maxScroll()); intro.f = 1; for (let i = 0; i < n; i++) frame(performance.now() / 1000, 1000); };

  /* entrada */
  const hash = location.hash.slice(1);
  if (hash && hash !== 'inicio' && SCENES.some(s => s.id === hash)) { const s = SCENES.find(x => x.id === hash); jump = true; scrollTo(0, (s.a + (s.b - s.a) * 0.1) * maxScroll()); }
  document.body.classList.remove('booting');
  gsap.to(intro, { f: 1, duration: reduce ? 0.01 : 2.2, ease: 'power2.out', delay: 0.2 });
}
