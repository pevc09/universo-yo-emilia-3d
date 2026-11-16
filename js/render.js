// Herramienta de render: previsualiza un encuadre o graba los clips de cada espacio a MP4.
//   render.html?shot=archivo&t=0.4      → encuadre fijo (para revisar luz y composición)
//   render.html?rec=all                 → graba un clip por escena + el montaje del cineclub
//   render.html?rec=cafeteria|montaje   → graba solo uno
import { createStage, loadFonts, SCENES, cutBetween } from './stage.js';

const q = new URLSearchParams(location.search), log = m => { document.getElementById('log').textContent = m; window.__status = m; };
const canvas = document.getElementById('c');
const W = +(q.get('w') || 1280), H = +(q.get('h') || 720), FPS = 30;
await loadFonts();
const stage = createStage(canvas, { width: W, height: H, dpr: 1, video: true, ao: q.get('ao') !== '0' });
stage.spaces.cuarto.setWeek(5);
window.stage = stage;
const ease = u => u * u * (3 - 2 * u);
const tick = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });

if (q.get('shot')) {
  const id = q.get('shot'); let t = +(q.get('t') || 0.5);
  stage.show(id);
  window.setT = v => { t = v; };
  window.__id = id; const loop = now => { stage.view(window.__id, t); stage.render(now / 1000, 1); requestAnimationFrame(loop); };
  requestAnimationFrame(loop); log(`${id} · t=${t}`);
  window.go = (id2, t2) => { stage.show(id2); t = t2; window.__id = id2; };
} else if (q.get('rec')) {
  const { Muxer, ArrayBufferTarget } = await import('https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.mjs');
  async function record(name, frames, bitrate, draw) {
    const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory' });
    let err = null;
    const enc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => { err = e; } });
    enc.configure({ codec: 'avc1.640028', width: W, height: H, bitrate, framerate: FPS, latencyMode: 'quality' });
    for (let i = 0; i < frames; i++) {
      draw(i, frames);
      const f = new VideoFrame(canvas, { timestamp: Math.round(i * 1e6 / FPS), duration: Math.round(1e6 / FPS) });
      enc.encode(f, { keyFrame: i % 60 === 0 }); f.close();
      while (enc.encodeQueueSize > 6) await tick();
      if (i % 10 === 0) { log(`${name}: ${i}/${frames}`); await tick(); }
      if (err) throw err;
    }
    await enc.flush(); muxer.finalize();
    const r = await fetch('/upload?name=' + name, { method: 'POST', body: muxer.target.buffer });
    log(`${name}: subido (${(muxer.target.buffer.byteLength / 1e6).toFixed(2)} MB) ${r.status}`);
  }
  const poster = async (name) => { const b = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.82)); await fetch('/upload?name=' + name, { method: 'POST', body: b }); };
  const fadeAt = (i, n, k = 12) => Math.min(1, i / k, (n - 1 - i) / k);
  const clip = async (sc) => {
    const n = FPS * 8; stage.show(sc.id);
    stage.view(sc.id, 0.45); stage.render(3, 1); await poster(sc.id + '.jpg');
    await record(sc.id + '.mp4', n, 2.4e6, (i) => { const u = i / (n - 1); stage.view(sc.id, 0.04 + 0.92 * ease(u)); stage.render(i / FPS, Math.max(0, fadeAt(i, n))); });
  };
  const montaje = async () => {
    const per = FPS * 3.2, order = SCENES, n = Math.round(per * order.length);
    await record('montaje.mp4', n, 2.6e6, (i) => {
      const k = Math.min(order.length - 1, Math.floor(i / per)), j = i - k * per, u = j / (per - 1), sc = order[k];
      stage.show(sc.id); stage.view(sc.id, 0.25 + 0.4 * u); stage.render(i / FPS, Math.max(0, Math.min(1, j / 8, (per - 1 - j) / 8)));
    });
  };
  try {
    const what = q.get('rec');
    if (what === 'all') { for (const sc of SCENES) await clip(sc); await montaje(); }
    else if (what === 'montaje') await montaje();
    else await clip(SCENES.find(s => s.id === what));
    log('LISTO');
  } catch (e) { log('ERROR ' + (e && e.message || e)); console.error(e); }
}

/* Hoja de contactos: render.html?sheet=1&ts=0.1,0.5  (o &only=archivo&ts=0,0.25,0.5,0.75,1) */
if (q.get('sheet')) {
  const ts = (q.get('ts') || '0.15,0.6').split(',').map(Number), only = q.get('only');
  const list = []; for (const sc of SCENES) if (!only || only === sc.id) for (const t of ts) list.push([sc.id, t]);
  const cols = +(q.get("cols") || 4), tw = Math.floor(1280 / cols), th = Math.round(tw * H / W);
  const out = document.createElement('canvas'); out.width = cols * tw; out.height = Math.ceil(list.length / cols) * th; out.style.cssText = 'position:fixed;inset:0;width:100vw;height:auto;z-index:5';
  document.body.appendChild(out); const x = out.getContext('2d');
  list.forEach(([id, t], i) => {
    stage.show(id); stage.view(id, t); stage.render(2 + i, 1);
    x.drawImage(canvas, (i % cols) * tw, Math.floor(i / cols) * th, tw, th);
    x.fillStyle = '#fff'; x.font = '12px monospace'; x.fillText(`${id} ${t}`, (i % cols) * tw + 6, Math.floor(i / cols) * th + 14);
  });
  const sb = await new Promise(r => out.toBlob(r, 'image/jpeg', 0.85)); await fetch('/upload?name=zz_sheet.jpg', { method: 'POST', body: sb });
  log('hoja lista');
}
