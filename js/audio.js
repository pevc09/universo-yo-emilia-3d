// Sonido ambiente por escena, sintetizado en el navegador (Web Audio): no hay archivos de audio.
// Cada ambiente es una mezcla de ruido filtrado, tonos y eventos al azar (tazas, teclas, pájaros…).
let ctx = null, master = null, on = false, cur = null;
const amb = {};
const R = (a, b) => a + Math.random() * (b - a);

function noiseBuffer(kind) {
  const n = ctx.sampleRate * 4, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  let last = 0, b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else if (kind === 'pink') { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
    else d[i] = w;
  }
  return b;
}
const bufs = {};
const buf = k => bufs[k] || (bufs[k] = noiseBuffer(k));

/* Capa continua de ruido filtrado */
function bed(out, kind, type, freq, q, gain, lfo = 0) {
  const s = ctx.createBufferSource(); s.buffer = buf(kind); s.loop = true; s.loopStart = R(0, 1);
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.value = gain; s.connect(f).connect(g).connect(out); s.start();
  if (lfo) { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = lfo; og.gain.value = gain * 0.45; o.connect(og).connect(g.gain); o.start(); }
  return g;
}
/* Acorde sostenido muy suave */
function pad(out, freqs, gain, type = 'sine') {
  for (const fr of freqs) for (const det of [-4, 5]) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = fr; o.detune.value = det; g.gain.value = gain / freqs.length;
    const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = R(0.05, 0.16); lg.gain.value = g.gain.value * 0.6; l.connect(lg).connect(g.gain); l.start();
    o.connect(g).connect(out); o.start();
  }
}
/* Golpe corto: tono con caída (tazas, notas, pings) */
function ping(out, freq, dur, gain, type = 'sine', slide = 0) {
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
}
/* Soplo corto de ruido (teclas, proyector, aplausos, papel) */
function puff(out, kind, type, freq, q, dur, gain, attack = 0.004) {
  const t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = buf(kind); s.loop = true; s.loopStart = R(0, 3);
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(out); s.start(t, R(0, 3)); s.stop(t + dur + 0.05);
}
/* Repite una acción a intervalos al azar mientras el ambiente esté activo */
function every(a, min, max, fn) { const loop = () => { if (a.live && on) fn(); a.timers.push(setTimeout(loop, R(min, max) * 1000)); }; a.timers.push(setTimeout(loop, R(min, max) * 1000)); }

const murmur = (o, g) => { bed(o, 'pink', 'bandpass', 420, 0.9, g, 0.23); bed(o, 'pink', 'bandpass', 900, 1.2, g * 0.55, 0.31); bed(o, 'brown', 'lowpass', 180, 0.5, g * 0.9); };
const cityBed = (o, g) => { bed(o, 'brown', 'lowpass', 220, 0.4, g, 0.07); bed(o, 'pink', 'bandpass', 1400, 0.4, g * 0.12, 0.11); };
const carPass = o => { const t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = buf('pink'); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(900, t + 2.2); f.frequency.linearRampToValueAtTime(260, t + 5); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 2.2); g.gain.linearRampToValueAtTime(0.0001, t + 5); s.connect(f).connect(g).connect(o); s.start(t); s.stop(t + 5.2); };
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

/* Un ambiente por escena. `o` es su salida; `a` guarda sus temporizadores. */
const BUILD = {
  inicio(o, a) { cityBed(o, 0.5); bed(o, 'white', 'highpass', 5200, 0.5, 0.012, 0.09); pad(o, [110, 164.81, 220, 277.18], 0.05); every(a, 7, 15, () => carPass(o)); every(a, 9, 20, () => ping(o, R(380, 430), 0.5, 0.012, 'triangle')); },
  historia(o, a) { murmur(o, 0.2); every(a, 1.6, 5, () => ping(o, R(2400, 3600), 0.18, 0.03)); every(a, 9, 18, () => puff(o, 'white', 'bandpass', 3800, 0.6, 2.2, 0.03, 0.4)); every(a, 4, 9, () => puff(o, 'pink', 'bandpass', 700, 2, 0.12, 0.05)); },
  corto(o, a) { bed(o, 'brown', 'lowpass', 120, 0.5, 0.35); pad(o, [73.42, 110, 146.83, 174.61], 0.07, 'triangle'); a.timers.push(setInterval(() => { if (a.live && on) puff(o, 'white', 'bandpass', 2200, 3, 0.022, 0.035, 0.002); }, 1000 / 12)); every(a, 6, 12, () => ping(o, SCALE[Math.floor(R(0, 4))] / 2, 2.4, 0.03)); },
  personajes(o, a) { murmur(o, 0.14); pad(o, [130.81, 164.81, 196, 246.94], 0.045); every(a, 1.2, 4, () => { ping(o, R(3000, 4600), 0.12, 0.025); if (Math.random() < 0.4) setTimeout(() => on && ping(o, R(3200, 4800), 0.1, 0.02), 90); }); every(a, 8, 16, () => ping(o, R(1500, 1900), 0.9, 0.012)); },
  archivo(o, a) { bed(o, 'brown', 'lowpass', 160, 0.5, 0.22); bed(o, 'pink', 'highpass', 2600, 0.3, 0.012, 0.13); pad(o, [174.61, 220, 261.63, 329.63], 0.06); a.timers.push(setInterval(() => { if (a.live && on) ping(o, 1800, 0.03, 0.012, 'square'); }, 1000)); every(a, 3, 8, () => { const n = Math.floor(R(4, 14)); for (let i = 0; i < n; i++) setTimeout(() => a.live && on && puff(o, 'white', 'bandpass', R(1800, 3200), 2.5, 0.03, 0.035, 0.002), i * R(70, 150)); }); },
  mural(o, a) { bed(o, 'brown', 'lowpass', 150, 0.5, 0.18); pad(o, [196, 246.94, 293.66, 392], 0.05); every(a, 1.4, 3.6, () => ping(o, SCALE[Math.floor(R(0, SCALE.length))], 1.6, 0.05)); every(a, 2.5, 6, () => puff(o, 'pink', 'bandpass', R(2500, 4500), 1.2, R(0.25, 0.6), 0.03, 0.08)); },
  universo(o, a) { cityBed(o, 0.4); const hum = ctx.createOscillator(), hg = ctx.createGain(); hum.type = 'sawtooth'; hum.frequency.value = 100; hg.gain.value = 0.006; const hf = ctx.createBiquadFilter(); hf.type = 'bandpass'; hf.frequency.value = 2400; hf.Q.value = 3; hum.connect(hf).connect(hg).connect(o); hum.start(); pad(o, [98, 146.83, 196, 233.08], 0.045, 'triangle'); every(a, 2.5, 7, () => { const f = [880, 1174.66, 1318.5][Math.floor(R(0, 3))]; ping(o, f, 0.16, 0.035); setTimeout(() => on && ping(o, f * 1.335, 0.22, 0.035), 130); }); every(a, 8, 16, () => carPass(o)); },
  estreno(o, a) { murmur(o, 0.22); pad(o, [146.83, 185, 220, 293.66], 0.04); every(a, 6, 13, () => { const n = Math.floor(R(60, 140)); for (let i = 0; i < n; i++) setTimeout(() => a.live && on && puff(o, 'white', 'bandpass', R(900, 2600), 1.5, 0.03, R(0.02, 0.05), 0.002), i * R(12, 30)); }); every(a, 2, 6, () => { ping(o, R(2800, 3400), 0.5, 0.03); setTimeout(() => on && ping(o, R(3000, 3800), 0.45, 0.025), 60); }); },
  equipo(o, a) { bed(o, 'pink', 'bandpass', 600, 0.4, 0.05, 0.08); pad(o, [130.81, 196, 261.63, 329.63, 392], 0.075); every(a, 1.2, 4, () => { const base = R(2600, 4200), n = Math.floor(R(2, 6)); for (let i = 0; i < n; i++) setTimeout(() => a.live && on && ping(o, base * R(0.9, 1.15), 0.09, 0.022, 'sine', R(1.2, 1.5)), i * R(90, 140)); }); }
};

function get(id) {
  if (amb[id]) return amb[id];
  const a = { g: ctx.createGain(), timers: [], live: false }; a.g.gain.value = 0; a.g.connect(master);
  (BUILD[id] || BUILD.inicio)(a.g, a); return (amb[id] = a);
}
function fade(a, v, s = 1.6) { const t = ctx.currentTime; a.g.gain.cancelScheduledValues(t); a.g.gain.setValueAtTime(a.g.gain.value, t); a.g.gain.linearRampToValueAtTime(v, t + s); }

export const sound = {
  get on() { return on; },
  /* Debe llamarse desde un gesto del usuario (clic), por las reglas de autoplay del navegador */
  enable(id) {
    try {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.9; const c = ctx.createDynamicsCompressor(); master.connect(c).connect(ctx.destination); }
      ctx.resume(); on = true; cur = null; this.scene(id);
    } catch (e) { on = false; }
    return on;
  },
  disable() { on = false; if (ctx) { Object.values(amb).forEach(a => { a.live = false; fade(a, 0, 0.4); }); cur = null; } },
  scene(id) {
    if (!on || !ctx || cur === id) return;
    if (cur && amb[cur]) { amb[cur].live = false; fade(amb[cur], 0); }
    const a = get(id); a.live = true; fade(a, 1, 2.2); cur = id;
  }
};
