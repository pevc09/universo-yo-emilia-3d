// Paneles de los objetos del archivo (lógica heredada de la primera versión del sitio).
import { WEEKS, EPISODES, OBJECTS, CHAPTERS, NOTE_COLORS, NIGHTS, SEED_NOTES } from './data.js';
export const hooks = { onNote() {}, go() {} };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem('ye_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('ye_' + k, JSON.stringify(v)); } catch (e) {} }
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let week = 2;
try { const w = store.get('week', 2); if (w >= 0 && w <= 5) week = w; } catch (e) {}
let userNotes = store.get('notes', []);
let reacts = store.get('reacts', {});

/* ---------------- toast ---------------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3200); }
/* ---------------- panel ---------------- */
let lastFocus = null;
function openPanel(html) {
  lastFocus = document.activeElement;
  $('#panel').innerHTML = html; $('#scrim').hidden = false; document.body.style.overflow = 'hidden';
  setTimeout(() => { const x = $('#panel .x'); if (x) x.focus(); }, 30);
}
function closePanel() { stopTimer(false); $('#scrim').hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
$('#scrim').addEventListener('click', e => { if (e.target.id === 'scrim' || e.target.closest('.x')) closePanel(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#scrim').hidden) closePanel(); });
const ptop = (kicker, title) => `<div class="panel-top"><span class="kicker">${kicker}</span><button class="x" type="button" aria-label="Cerrar">×</button></div><h3 id="panelTitle">${title}</h3>`;

function openObject(id) {
  const o = OBJECTS.find(x => x.id === id); if (!o) return;
  if (o.week > week) { toast(`«${o.name}» aparece en la semana ${o.week}. Cámbiala en el menú «Escenas» para verlo.`); return; }
  ({ mural: pMural, carpeta: pCarpeta, dias: pDias, escucha: pEscucha, casting: pCasting, pared: pPared, chat: pChat, cuaderno: pCuaderno, pagina: pPagina })[id](o);
}

/* mural */
function noteHTML(n) {
  const r = reacts[n.id] || {};
  const base = n.r || [0, 0];
  return `<div class="note ${n.reply ? 'reply' : n.c}">${esc(n.t)}<div class="meta"><span>${esc(n.a)}</span>${n.pending ? '<span class="chip" style="font-size:.7rem">En moderación · se publica en menos de 24 h</span>' : ''}
    ${n.reply ? '<span class="chip accent" style="font-size:.7rem">Emilia contesta</span>' : `<button class="react" type="button" data-r="${n.id}:0" aria-pressed="${!!r[0]}">♥ Me pasó ${base[0] + (r[0] ? 1 : 0)}</button><button class="react" type="button" data-r="${n.id}:1" aria-pressed="${!!r[1]}">Sigue ${base[1] + (r[1] ? 1 : 0)}</button>`}</div></div>`;
}
function pMural(o) {
  const w = WEEKS[week];
  const mine = userNotes.filter(n => n.week === week).slice().reverse();
  openPanel(ptop('Objeto · ' + o.type, 'El mural') + `
    <div class="qbox"><span class="kicker">Pregunta ${week === 0 ? 'del estreno' : 'de la semana ' + week}</span><p>${w.q}</p></div>
    <div class="wall">
      <div><span class="kicker">Las de Emilia · escaleta</span>
        <div class="emi" style="margin-top:6px">${CHAPTERS.map((c, i) => `<button type="button" class="${NOTE_COLORS[i]}" data-ch="${i}" aria-label="Capítulo ${i + 1}">Cap. ${i + 1}</button>`).join('')}</div>
        <button type="button" class="note n-p loose" aria-label="Nota suelta">Potenciar evolución de Lucía</button>
        <p class="small muted" style="margin-top:8px" id="chOut">Toca una nota para leer el título del capítulo.</p>
      </div>
      <div class="pub"><span class="kicker">Las del público</span><div class="pub" id="pubNotes">${[...mine, ...SEED_NOTES].map(noteHTML).join('')}</div></div>
    </div>
    <form class="card stack" id="noteForm">
      <span class="kicker">Pega tu nota</span>
      <label for="nText">Tu respuesta</label><textarea id="nText" maxlength="200" required placeholder="Escribe en menos de un minuto"></textarea><div class="count" id="nCount">0 / 200</div>
      <label for="nAlias">Nombre o alias (opcional)</label><input type="text" id="nAlias" maxlength="30" placeholder="Anónimo">
      <button class="btn" type="submit">Pegar nota</button>
      <p class="small muted">Sin crear cuenta. Las notas pasan por moderación: sin ataques personales ni nombres de terceros.</p>
    </form>`);
  $('#panel').addEventListener('click', muralClicks);
  $('#nText').addEventListener('input', e => $('#nCount').textContent = `${e.target.value.length} / 200`);
  $('#noteForm').addEventListener('submit', e => {
    e.preventDefault();
    const t = $('#nText').value.trim(); if (!t) return;
    const n = { id: 'u' + Date.now(), t, a: $('#nAlias').value.trim() || 'Anónimo', c: ['n-y', 'n-p', 'n-g', 'n-b', 'n-l'][userNotes.length % 5], r: [0, 0], pending: true, week };
    userNotes.push(n); store.set('notes', userNotes);
    $('#pubNotes').insertAdjacentHTML('afterbegin', noteHTML(n)); $('#nText').value = ''; $('#nCount').textContent = '0 / 200';
    hooks.onNote(n);
    shareImage({ kind: 'nota', title: WEEKS[week].q, body: t, sub: n.a });
  });
}
function muralClicks(e) {
  const ch = e.target.closest('[data-ch]');
  if (ch) { $('#chOut').innerHTML = `<b>Capítulo ${+ch.dataset.ch + 1}:</b> «${CHAPTERS[+ch.dataset.ch]}» <span class="muted">(título de ejemplo)</span>`; return; }
  const r = e.target.closest('[data-r]');
  if (r) { const [id, k] = r.dataset.r.split(':'); reacts[id] = reacts[id] || {}; reacts[id][k] = !reacts[id][k]; store.set('reacts', reacts);
    const n = [...userNotes, ...SEED_NOTES].find(x => x.id === id); r.closest('.note').outerHTML = noteHTML(n); }
}

/* carpeta */
function pCarpeta(o) {
  let pg = 0, ver = 'emilia';
  const pages = [
    () => `<div class="page" style="text-align:center;align-content:center"><span class="kicker" style="color:#6f6558">Convocatoria Casa Melón y Entretenimiento · Piloto de serie</span><b style="font-family:var(--f-display);font-size:2.2rem;line-height:1">Ladrona de sueños</b><span>Piloto de serie · 10 capítulos</span><span class="add">Dirección y producción: Emilia</span></div>`,
    () => `<div class="page"><span class="kicker" style="color:#6f6558">Logline y sinopsis</span>
      <div class="toggle" role="group" aria-label="Versión"><button type="button" data-v="emilia" aria-pressed="${ver === 'emilia'}">Versión de Emilia</button><button type="button" data-v="inv" aria-pressed="${ver === 'inv'}">Versión del inversionista</button></div>
      ${ver === 'emilia'
        ? `<p>En su barrio le dicen <i>la ladrona de sueños</i>: Lucía escribe por encargo los discursos, cartas y promesas que otros firman.</p><p>Cuando un encargo le pide escribir el sueño que ella nunca se atrevió a perseguir, debe decidir si se lo entrega a otro o lo firma con su nombre.</p><p><b>Personajes:</b> Lucía, su abuela, que le enseñó a escribir, y su mejor amiga.</p>`
        : `<p><s>Lucía escribe por encargo los discursos, cartas y promesas que otros firman.</s> <span class="add">Lucía es una carterista encantadora</span></p><p><s>Debe decidir si entrega su propio sueño o lo firma con su nombre.</s> <span class="add">Roba a un empresario y se enamora de él.</span></p><p><b>Personajes:</b> Lucía, <s>su abuela</s>, <s>su mejor amiga</s>, <span class="add">el empresario</span>.</p><p class="small" style="color:#6f6558">El conflicto deja de ser la autoría y pasa a ser el romance.</p>`}</div>`,
    () => `<div class="page"><span class="kicker" style="color:#6f6558">Lucía</span><p>Vive de escribir lo que otros firman y cree que eso no le cuesta nada. En diez capítulos descubre que cada encargo le roba un poco de su propia voz, hasta que se atreve a firmar.</p><p class="add">Su cambio necesita tiempo: por eso es serie y no película.</p></div>`,
    () => `<div class="page"><span class="kicker" style="color:#6f6558">Por qué es serie · escaleta</span><ol style="margin:0;padding-left:1.3em">${CHAPTERS.map(c => `<li>${c}</li>`).join('')}</ol><p class="small" style="color:#6f6558">Títulos de ejemplo. Son las diez notas del mural.</p></div>`,
    () => `<div class="page"><span class="kicker" style="color:#6f6558">Ficha de equipo</span><p><b>Dirección:</b> Emilia</p><p><b>Producción:</b> Emilia</p><p><b>Guion:</b> Emilia</p><p class="add">Una sola persona al frente. Sin socio.</p></div>`
  ];
  const names = ['Portada', 'Logline y sinopsis', 'Lucía', 'Por qué es serie', 'Ficha de equipo'];
  function draw() {
    $('#cWrap').innerHTML = pages[pg]() + `<div class="pager"><button class="btn ghost" type="button" data-p="-1" ${pg === 0 ? 'disabled' : ''}>← ${pg ? names[pg - 1] : ''}</button><span class="small muted">${pg + 1} de 5</span><button class="btn dark" type="button" data-p="1" ${pg === 4 ? 'disabled' : ''}>${pg < 4 ? names[pg + 1] : ''} →</button></div>`;
  }
  openPanel(ptop('Objeto · ' + o.type, 'La carpeta de <i>Ladrona de sueños</i>') + `<p class="small muted">La carpeta que Emilia lleva sobre las piernas en la sala de espera del pitch. Contenido de ejemplo: lo define guion.</p><div class="stack" id="cWrap"></div>`);
  draw();
  $('#cWrap').addEventListener('click', e => {
    const p = e.target.closest('[data-p]'); if (p && !p.disabled) { pg = Math.max(0, Math.min(4, pg + +p.dataset.p)); draw(); }
    const v = e.target.closest('[data-v]'); if (v) { ver = v.dataset.v; draw(); }
  });
}

/* 14 días + Modo Emilia */
let timer = null, remaining = 0, total = 0, leftTab = false, audio = null;
function beep() { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 880; o.type = 'square'; g.gain.value = .05; o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + .5); } catch (e) {} }
function fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function stopTimer(reset = true) { clearInterval(timer); timer = null; if (reset) { remaining = total; } }
function pDias(o) {
  let night = 8;
  openPanel(ptop('Objeto · ' + o.type, 'Catorce noches para <i>un piloto</i>') + `
    <div class="cal" id="cal">${NIGHTS.map((_, i) => `<button type="button" data-n="${i}" class="${i < night ? 'seen' : ''}" aria-pressed="${i === night}">${i + 1}</button>`).join('')}</div>
    <div class="card night" id="night"></div>
    <div class="timer" id="timerBox">
      <span class="kicker" style="color:color-mix(in srgb,var(--paper) 70%,transparent)">Tu turno · Modo Emilia</span>
      <div class="clock" id="clock">25:00</div>
      <p class="small" style="opacity:.85">25 minutos de foco para tu proyecto. Si sales de la pestaña antes de terminar, suena y el tiempo se detiene.</p>
      <div class="alert" id="tAlert" hidden></div>
      <div class="row"><button class="btn" type="button" id="tStart">Empezar mi noche 1</button><button class="btn ghost" type="button" id="tFast" style="color:var(--paper);border-color:var(--paper)">Versión demo: 25 s</button></div>
    </div>
    <p class="small muted">Valores ilustrativos: los definitivos los fija el área de guion.</p>`);
  function drawNight() {
    const n = NIGHTS[night];
    $('#night').innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><b style="font-family:var(--f-display);font-size:1.4rem">Noche ${night + 1}</b><span class="chip accent">${n[0]}</span></div><p>${n[1]}</p>
      <div class="stats"><div><span class="kicker">Páginas del piloto</span><br><b style="font-family:var(--f-mono)">${n[2]} / 28</b><div class="bar-p"><i style="width:${Math.min(100, n[2] / 31 * 100)}%"></i></div></div><div><span class="kicker">Notificaciones</span><br><span style="font-family:var(--f-mono);font-size:.9rem">atendidas ${n[3]} · <span style="color:var(--accent)">ignoradas ${n[4]}</span></span></div></div>
      <div class="note n-y" style="transform:rotate(-1deg)">${n[5]}</div>`;
    $$('#cal button').forEach((b, i) => { b.setAttribute('aria-pressed', i === night); b.classList.toggle('seen', i < night); });
  }
  drawNight();
  $('#cal').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b) { night = +b.dataset.n; drawNight(); } });
  total = remaining = 25 * 60; leftTab = false;
  const clock = () => $('#clock').textContent = fmt(remaining);
  $('#tFast').addEventListener('click', () => { stopTimer(false); total = remaining = total === 25 ? 1500 : 25; $('#tFast').textContent = total === 25 ? 'Versión real: 25 min' : 'Versión demo: 25 s'; $('#tStart').textContent = 'Empezar mi noche 1'; clock(); });
  $('#tStart').addEventListener('click', () => {
    if (timer) { stopTimer(false); $('#tStart').textContent = 'Seguir'; return; }
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    $('#tAlert').hidden = true; $('#tStart').textContent = 'Pausar';
    timer = setInterval(() => {
      remaining--; clock();
      if (remaining <= 0) { stopTimer(false); remaining = 0; clock(); $('#tStart').textContent = 'Empezar otra noche'; remaining = total;
        shareImage({ kind: 'noche', title: 'Noche 1 de mis 14', body: `${total === 25 ? '25 segundos' : '25 minutos'} de foco para mi proyecto`, sub: 'Modo Emilia' }); }
    }, 1000);
  });
  clock();
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden && timer) { stopTimer(false); leftTab = true; }
  else if (!document.hidden && leftTab) { leftTab = false; beep(); const a = $('#tAlert'); if (a) { a.hidden = false; a.textContent = 'Saliste de la pestaña: el tiempo se detuvo. Como el Pomodoro de Emilia, vuelve y continúa.'; $('#tStart').textContent = 'Seguir'; } }
});

/* escucha */
function pEscucha(o) {
  let tab = 'escribir';
  openPanel(ptop('Objeto · ' + o.type, 'Lo que Emilia escucha') + `<div class="toggle" role="group" aria-label="Pestaña" id="eTabs"><button type="button" data-t="escribir" aria-pressed="true">Para escribir</button><button type="button" data-t="dormir" aria-pressed="false">Para dormir</button></div><div id="eBody"></div>`);
  function draw() {
    $$('#eTabs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === tab));
    $('#eBody').innerHTML = tab === 'escribir'
      ? `<p class="small muted">Su playlist en Spotify, incrustada en la web. Lista de ejemplo: la arma el área de sonido.</p><div class="tracks">${[['Lluvia sobre el techo', 'ambiente', '3:10'], ['Piano para la noche 5', 'instrumental', '4:02'], ['Combi a las 11 p. m.', 'lo-fi', '2:48'], ['La escena que no sale', 'instrumental', '3:35'], ['Página 28', 'ambiente', '5:12']].map((t, i) => `<div><span class="i">${i + 1}</span><span>${t[0]} <span class="muted small">· ${t[1]}</span></span><span class="small muted">${t[2]}</span></div>`).join('')}</div>`
      : `<p class="small muted">El podcast con el que se duerme es el del proyecto. En pausa en su celular:</p><div class="tracks">${EPISODES.map((e, i) => `<div><span class="i">${i + 1}</span><span><b>${e[0]}</b> <span class="muted small">· ${e[1]}</span></span><span class="small ${i === 3 ? '' : 'muted'}">${i === 3 ? '❚❚ en pausa' : ''}</span></div>`).join('')}</div><a class="goto" href="#universo" data-go="universo"><span>Escuchar <i>Miradas distintas</i> y enviar tu pregunta</span><b>→</b></a>`;
  }
  draw();
  $('#eTabs').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; draw(); } });
}

/* conexiones y lado personal */
function pCasting(o) {
  const c = [['Aspirante 1', 'Lee bien, pero sonríe cuando Lucía no sonreiría.'], ['Aspirante 2', 'Tiene la mirada. Llamarla otra vez.'], ['Aspirante 3', 'Llegó tarde y se disculpó con un discurso. ¿Es Lucía?'], ['Aspirante 4', 'Demasiada ladrona, poco sueño.']];
  openPanel(ptop('Objeto · ' + o.type, 'La lista del casting') + `<p class="small muted">Apareció en el corcho después del fallo: Emilia ya está produciendo. Fotos del rodaje de la microserie.</p><div class="casting">${c.map(x => `<div class="cand"><div class="ph">${x[0]}</div><span class="margin">${x[1]}</span></div>`).join('')}</div><a class="goto" href="#universo" data-go="universo"><span>Mira el casting en <i>Modo Directora</i>, cap. 1 (TikTok)</span><b>→</b></a>`);
}
function pChat(o) {
  openPanel(ptop('Objeto · ' + o.type, 'El chat en visto') + `<div class="chat"><span class="kicker" style="text-align:center">Ricardo</span>
    <div class="bubble"><div class="flyer"><span class="kicker" style="color:#c9bfae">Cineclub · convocatoria</span><b>Casa Melón y Entretenimiento</b><span>Premio de producción total o parcial</span></div><small>8:41 p. m. ✓✓</small></div>
    <div class="bubble">Mira esto. ¿Postulamos?<small>8:42 p. m. ✓✓ · Visto</small></div></div>
    <p>No aporta información nueva: es la puerta a lo que pasó del otro lado del chat.</p>
    <a class="goto" href="#universo" data-go="universo"><span>Por qué Ricardo no contestó: <i>El otro lado de Ricardo</i>, cap. 3</span><b>→</b></a>`);
}
function pPared(o) {
  const p = [['La La Land', 'Damien Chazelle · 2016', '#5b6f8a', 'Elegir entre lo que amas y lo que te paga. La veo cuando dudo.'], ['Los Fabelman', 'Steven Spielberg · 2022', '#a7553d', 'Filmar a tu familia y descubrir lo que no querías ver. Así empecé yo.'], ['Saving Mr. Banks', 'John Lee Hancock · 2013', '#3e3a36', 'La escritora que no quería cambiar su historia. Ahora la entiendo demasiado.'], ['Como en el cine', 'Gonzalo Ladines · 2015', '#6f7d5e', 'Hacer una película con lo que tienes. Muy Lima, muy nosotros.']];
  openPanel(ptop('Objeto · ' + o.type, 'Su pared de películas') + `<p class="small muted">Toca un póster para leer la nota de Emilia.</p><div class="posters">${p.map((x, i) => `<button type="button" class="poster" style="background:${x[2]}" data-pi="${i}"><span>${x[1]}</span><b>${x[0]}</b></button>`).join('')}</div><div class="note n-y" id="pNote" style="transform:rotate(-1deg)">Las películas que volvería a ver mil veces.</div>`);
  $('#panel .posters').addEventListener('click', e => { const b = e.target.closest('[data-pi]'); if (b) $('#pNote').textContent = p[+b.dataset.pi][3]; });
}
function pCuaderno(o) {
  openPanel(ptop('Objeto · ' + o.type, 'El cuaderno de mesas ajenas') + `<div class="notebook">
    <p>Cafetería, mesa 4. Una pareja discute quién paga. Ganan los dos; pierde el mozo.</p>
    <p>Combi a Miraflores. Un señor ensaya una disculpa en voz baja desde la Arequipa. Se baja sin llamar.</p>
    <p>Cineclub, fila 2. Un chico se ríe un segundo antes que todos. Ya vio la película; vino a verla con alguien.</p>
    <p>Cafetería otra vez. La señora de la mesa 3 lee el periódico de ayer. Dice que así ya sabe cómo terminan las cosas.</p>
    <p>Paradero. Dos amigas planean un viaje que no van a hacer. Lo cuentan como si ya hubieran vuelto.</p>
  </div><p class="small muted">De aquí salen sus personajes. Apuntes de ejemplo: los escribe guion.</p>`);
}
function pPagina(o) {
  openPanel(ptop('Objeto · ' + o.type, 'La primera página del piloto') + `<div class="page script">
    <div style="text-align:center"><b>LADRONA DE SUEÑOS</b><br>Episodio 1 · «El primer encargo»</div>
    <p class="sl">1. INT. CUARTO DE LUCÍA – NOCHE</p>
    <p>Una mesa cubierta de papeles con firmas que no son suyas. LUCÍA escribe a mano. Se detiene. Tacha una línea.</p>
    <p class="ch">LUCÍA</p><p class="pa">(leyendo en voz baja)</p><p class="dl">«Prometo amarte en las buenas y en las malas…»</p>
    <p class="margin" style="text-align:right">muy obvio → que lo diga sin decirlo</p>
    <p>Su ABUELA asoma desde la puerta, con una taza en cada mano.</p>
    <p class="ch">ABUELA</p><p class="dl">¿Otra boda?</p>
    <p class="ch">LUCÍA</p><p class="dl">Otra boda. Esta paga el doble.</p>
    <p class="ch">ABUELA</p><p class="dl">¿Y la tuya cuándo la escribes?</p>
    <p>Lucía no contesta. Dobla la hoja en cuatro.</p>
    <p class="margin">cortar aquí. Que el silencio haga el trabajo.</p>
  </div><p class="small muted">Borrador de ejemplo. La página real la escribe el área de guion.</p>`);
}

/* ---------------- share image (1080×1920) ---------------- */
function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '', yy = y;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; } else line = t; }
  if (line) ctx.fillText(line, x, yy); return yy;
}
async function shareImage({ kind, title, body, sub }) {
  try { await document.fonts.ready; } catch (e) {}
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#2e2840'); g.addColorStop(.6, '#7a4e4a'); g.addColorStop(1, '#e09a62'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  x.fillStyle = '#f6efe2'; x.font = '64px "Permanent Marker", cursive'; x.fillText('Yo, Emilia', 90, 190);
  x.font = '30px "JetBrains Mono", monospace'; x.fillStyle = 'rgba(246,239,226,.75)';
  x.fillText(kind === 'nota' ? 'MI NOTA PARA EL MURAL DE EMILIA' : kind === 'noche' ? 'MODO EMILIA' : kind === 'sello' ? 'YO ESTUVE EN EL ESTRENO' : '¿SABÍAS ESTO DE EMILIA?', 90, 250);
  x.fillStyle = '#f6efe2'; x.font = '600 70px "Newsreader", Georgia, serif'; let yy = wrapText(x, title, 90, 420, 900, 84);
  x.save(); x.translate(540, yy + 430); x.rotate(-0.04);
  x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(-390, -300, 800, 640); x.fillStyle = kind === 'noche' ? '#bdd8b4' : '#f4d873'; x.fillRect(-400, -310, 800, 640);
  x.fillStyle = '#2a241f'; x.font = '700 64px "Caveat", cursive'; wrapText(x, body, -350, -200, 700, 76);
  x.font = '36px "Instrument Sans", sans-serif'; x.fillText('— ' + sub, -350, 290); x.restore();
  x.fillStyle = '#f6efe2'; x.font = '600 52px "Instrument Sans", sans-serif'; x.fillText('yoemilia.pe', 90, 1820);
  openPanel(ptop('Imagen para historias · 1080 × 1920', kind === 'nota' ? 'Tu nota ya está en el mural' : 'Lista para compartir') + `<div class="share"></div><p class="small muted">${kind === 'nota' ? 'Se publica tras la moderación, en menos de 24 horas. La imagen enlaza al mural, así que ya puedes compartirla.' : 'En la web real, este botón abre el menú para compartir en Instagram, TikTok o WhatsApp.'}</p>`);
  $('#panel .share').appendChild(c);
}
export { $, $$, esc, store, toast, openPanel, closePanel, ptop, openObject, shareImage, userNotes, noteHTML };
export const getWeek = () => week; export const setWeek = w => { week = w; store.set('week', w); };
