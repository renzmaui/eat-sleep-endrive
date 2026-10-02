// Tiny Web Audio sound engine — every sound is synthesized, so there are no audio
// files to load or break. Browsers only allow audio after a user gesture, so the
// context is unlocked on the first tap/click/key press.

let ctx = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let noiseBuf = null;

const state = {
  sfx: true,
  music: true,
  track: null, // 'song' (mp3) | 'road' | 'story' | null
  volume: 0.8, // 0..1 master volume
  ducked: false,
};

/* ---------- the uploaded song (plays during stops + mini games 1–3) ---------- */
let song = null;
function getSong() {
  if (song || typeof Audio === 'undefined') return song;
  song = new Audio('audio/road-song.mp3');
  song.loop = true;
  song.preload = 'auto';
  song.volume = 0;
  return song;
}
function songVolume() {
  return Math.max(0, Math.min(1, state.volume * (state.ducked ? 0.25 : 0.7)));
}
function playSong() {
  const a = getSong();
  if (!a) return;
  a.volume = songVolume();
  const p = a.play();
  if (p && p.catch) p.catch(() => {});
}
function pauseSong() {
  if (song && !song.paused) song.pause();
}

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    return null;
  }
  master = ctx.createGain();
  master.gain.value = 0.9 * state.volume;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = state.sfx ? 0.55 : 0;
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(master);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

export function unlockAudio() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  if (state.music && state.track) startMusicLoop();
}

if (typeof window !== 'undefined') {
  const once = () => unlockAudio();
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
    window.addEventListener(ev, once, { passive: true }),
  );
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });
}

function ready() {
  const c = ensure();
  if (!c || c.state !== 'running' || !state.sfx) return null;
  return c;
}

function tone({ freq = 440, to, type = 'sine', dur = 0.15, vol = 0.3, delay = 0, attack = 0.005, bus }) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(bus || sfxBus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise({ dur = 0.2, vol = 0.2, delay = 0, freq = 1200, q = 0.8, type = 'bandpass', sweepTo, bus }) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(bus || sfxBus);
  src.start(t);
  src.stop(t + dur + 0.05);
}

const N = (semi) => 440 * Math.pow(2, (semi - 9) / 12); // semitone offset from C4

export const sfx = {
  tap() {
    if (!ready()) return;
    tone({ freq: 880, to: 1100, type: 'triangle', dur: 0.07, vol: 0.18 });
  },
  hover() {
    if (!ready()) return;
    tone({ freq: 1400, type: 'sine', dur: 0.04, vol: 0.05 });
  },
  pick() {
    if (!ready()) return;
    tone({ freq: 520, to: 880, type: 'triangle', dur: 0.12, vol: 0.22 });
  },
  pop() {
    if (!ready()) return;
    tone({ freq: 300, to: 900, type: 'sine', dur: 0.1, vol: 0.3 });
    tone({ freq: 1200, type: 'triangle', dur: 0.06, vol: 0.08, delay: 0.05 });
  },
  drop() {
    if (!ready()) return;
    tone({ freq: 660, to: 330, type: 'sine', dur: 0.14, vol: 0.28 });
    noise({ dur: 0.08, vol: 0.08, freq: 400, type: 'lowpass' });
  },
  swap() {
    if (!ready()) return;
    tone({ freq: 500, to: 800, type: 'triangle', dur: 0.09, vol: 0.2 });
    tone({ freq: 800, to: 500, type: 'triangle', dur: 0.09, vol: 0.2, delay: 0.08 });
  },
  back() {
    if (!ready()) return;
    tone({ freq: 700, to: 420, type: 'triangle', dur: 0.1, vol: 0.16 });
  },
  error() {
    if (!ready()) return;
    tone({ freq: 220, type: 'square', dur: 0.09, vol: 0.08 });
    tone({ freq: 180, type: 'square', dur: 0.12, vol: 0.08, delay: 0.1 });
  },
  whoosh() {
    if (!ready()) return;
    noise({ dur: 0.45, vol: 0.18, freq: 300, sweepTo: 3000, q: 1.2 });
  },
  honk() {
    if (!ready()) return;
    [0, 0.2].forEach((d) => {
      tone({ freq: 392, type: 'sawtooth', dur: 0.16, vol: 0.09, delay: d });
      tone({ freq: 494, type: 'sawtooth', dur: 0.16, vol: 0.07, delay: d });
    });
  },
  engine() {
    const c = ready();
    if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator();
    const f = c.createBiquadFilter();
    const g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(55, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.9);
    o.frequency.exponentialRampToValueAtTime(90, t + 1.4);
    f.type = 'lowpass';
    f.frequency.value = 500;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    o.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    o.start(t);
    o.stop(t + 1.6);
  },
  success() {
    if (!ready()) return;
    [0, 4, 7, 12].forEach((s, i) => tone({ freq: N(s + 12), type: 'triangle', dur: 0.22, vol: 0.18, delay: i * 0.08 }));
  },
  fanfare() {
    if (!ready()) return;
    const seq = [0, 4, 7, 12, 7, 12, 16];
    seq.forEach((s, i) => tone({ freq: N(s + 12), type: 'square', dur: 0.18, vol: 0.06, delay: i * 0.11 }));
    seq.forEach((s, i) => tone({ freq: N(s), type: 'triangle', dur: 0.22, vol: 0.14, delay: i * 0.11 }));
    noise({ dur: 0.6, vol: 0.06, freq: 6000, type: 'highpass', delay: 0.66 });
  },
  lock() {
    if (!ready()) return;
    noise({ dur: 0.05, vol: 0.2, freq: 2500 });
    tone({ freq: 180, to: 90, type: 'square', dur: 0.08, vol: 0.12, delay: 0.03 });
    tone({ freq: N(19), type: 'triangle', dur: 0.3, vol: 0.14, delay: 0.1 });
  },
  blip() {
    if (!ready()) return;
    tone({ freq: 1500 + Math.random() * 300, type: 'square', dur: 0.025, vol: 0.025 });
  },
  sparkle() {
    if (!ready()) return;
    [24, 28, 31, 36].forEach((s, i) => tone({ freq: N(s), type: 'sine', dur: 0.25, vol: 0.08, delay: i * 0.05 }));
  },
  points() {
    if (!ready()) return;
    [0, 7].forEach((s, i) => tone({ freq: N(s + 19), type: 'triangle', dur: 0.12, vol: 0.12, delay: i * 0.07 }));
  },
  suspense() {
    if (!ready()) return;
    tone({ freq: N(-12), to: N(-5), type: 'sawtooth', dur: 1.4, vol: 0.05, attack: 0.6 });
    tone({ freq: N(-24), type: 'sine', dur: 1.6, vol: 0.12, attack: 0.4 });
  },
};

/* ------------------------------------------------------------------ */
/* Background music: synthwave road-trip / racing loops, scheduled ahead. */
/* ------------------------------------------------------------------ */

// Semitones relative to C4 (0 = C4, 9 = A4, 12 = C5 …)
const AM = [9, 12, 16];
const F = [5, 9, 12];
const C = [0, 4, 7];
const G = [7, 11, 14];
const E = [4, 8, 11];
const _ = null;

const TRACKS = {
  // Synthwave "outrun" cruise: four-on-the-floor, pumping bass, arps, engine pass-bys.
  road: {
    bpm: 112,
    chords: [AM, F, C, G, AM, F, C, E],
    melody: [
      [21, _, 19, _, 16, _, 19, 21, _, _, 24, _, 21, _, 19, _],
      [17, _, 16, _, 12, _, 16, 17, _, _, 21, _, 19, _, 16, _],
      [16, _, 14, _, 12, _, 14, 16, _, _, 19, _, 16, _, 14, _],
      [14, _, 12, _, 11, _, 14, _, 19, _, _, _, _, _, _, _],
      [24, _, _, _, 23, _, 21, _, 19, _, 21, _, _, _, _, _],
      [21, _, _, _, 19, _, 17, _, 16, _, 17, _, _, _, _, _],
      [19, _, _, _, 21, _, 19, _, 16, _, 14, _, 12, _, 14, _],
      [16, _, 20, _, 23, _, _, _, 20, _, _, _, 16, _, _, _],
    ],
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hats: 2, // every 8th
    bass: 'pump',
    arp: true,
    lead: 'saw',
    passBy: 8, // an engine pass-by every 8 bars
  },
  // Night drive: slower, dreamy, steady pulse like tires on the highway.
  story: {
    bpm: 88,
    chords: [AM, F, C, G],
    melody: [
      [21, _, _, _, _, _, 19, _, 16, _, _, _, _, _, _, _],
      [17, _, _, _, _, _, 16, _, 12, _, _, _, 14, _, _, _],
      [16, _, _, _, 19, _, _, _, 24, _, _, _, 23, _, 21, _],
      [19, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    ],
    kick: [0, 8],
    snare: [],
    hats: 4,
    bass: 'eighths',
    arp: false,
    lead: 'soft',
    passBy: 0,
  },
};

let timer = null;
let step = 0;
let nextTime = 0;

function scheduleStep(track, time) {
  const bars = track.chords.length;
  const bar = Math.floor(step / 16) % bars;
  const s = step % 16;
  const chord = track.chords[bar];
  const spb = 60 / track.bpm / 4;
  const bus = musicBus;
  const c = ctx;

  const voice = (semi, dur, type, vol, { cutoff, detune = 0, at = time, glideTo } = {}) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(N(semi), at);
    if (glideTo != null) o.frequency.exponentialRampToValueAtTime(N(glideTo), at + dur);
    o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    let out = o;
    if (cutoff) {
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = cutoff;
      f.Q.value = 2;
      o.connect(f);
      out = f;
    }
    out.connect(g);
    g.connect(bus);
    o.start(at);
    o.stop(at + dur + 0.05);
  };

  const kick = (vol = 0.42) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, time);
    o.frequency.exponentialRampToValueAtTime(42, time + 0.14);
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    o.connect(g);
    g.connect(bus);
    o.start(time);
    o.stop(time + 0.25);
  };

  const noiseHit = ({ vol, dur, freq, type = 'bandpass', q = 0.9, at = time, sweepTo, pan }) => {
    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, at);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, at + dur);
    f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f);
    f.connect(g);
    let out = g;
    if (pan && c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.setValueAtTime(pan[0], at);
      p.pan.linearRampToValueAtTime(pan[1], at + dur);
      g.connect(p);
      out = p;
    }
    out.connect(bus);
    src.start(at);
    src.stop(at + dur + 0.05);
  };

  // drums
  if (track.kick.includes(s)) kick(track.bpm < 100 ? 0.26 : 0.4);
  if (track.snare.includes(s)) {
    noiseHit({ vol: 0.12, dur: 0.16, freq: 1900, q: 0.7 });
    voice(-5, 0.08, 'triangle', 0.06);
  }
  if (track.hats && s % track.hats === 0) {
    const open = track.bpm > 100 && s % 4 === 2;
    noiseHit({ vol: open ? 0.035 : 0.022, dur: open ? 0.09 : 0.035, freq: 8000, type: 'highpass', q: 0.5 });
  }

  // bass: root in octave 2
  const root = chord[0] - 24;
  if (track.bass === 'pump' && s % 2 === 0) {
    voice(s % 4 === 2 ? root + 12 : root, spb * 1.7, 'sawtooth', 0.11, { cutoff: 520 });
  } else if (track.bass === 'eighths' && s % 2 === 0) {
    voice(root, spb * 1.8, 'sawtooth', 0.07, { cutoff: 360 });
  }

  // pad on each bar (two detuned saws per note, filtered)
  if (s === 0) {
    const len = spb * 16;
    chord.forEach((n) => {
      voice(n - 12, len, 'sawtooth', 0.018, { cutoff: track.bpm < 100 ? 900 : 1400, detune: -8 });
      voice(n - 12, len, 'sawtooth', 0.018, { cutoff: track.bpm < 100 ? 900 : 1400, detune: 9 });
    });
  }

  // arpeggio (16ths through the chord, an octave up)
  if (track.arp) {
    const pattern = [0, 1, 2, 1];
    const n = chord[pattern[s % 4]] + 12 + (s >= 8 ? 12 : 0);
    voice(n, spb * 0.9, 'square', 0.014, { cutoff: 2600 });
  }

  // lead melody
  const m = track.melody[bar % track.melody.length][s];
  if (m != null) {
    if (track.lead === 'saw') {
      voice(m, spb * 2.6, 'sawtooth', 0.045, { cutoff: 2400, detune: -5 });
      voice(m, spb * 2.6, 'triangle', 0.05, { detune: 6 });
    } else {
      voice(m, spb * 6, 'sine', 0.07);
      voice(m + 12, spb * 4, 'triangle', 0.015);
    }
  }

  // racing flavour: a car zooming past (stereo sweep + engine glide)
  if (track.passBy && bar === bars - 1 && s === 8 && Math.floor(step / (16 * bars)) % 2 === 0) {
    const d = spb * 8;
    noiseHit({ vol: 0.05, dur: d, freq: 300, sweepTo: 1600, q: 1.4, pan: [-0.9, 0.9] });
    voice(-27, d, 'sawtooth', 0.04, { cutoff: 700, glideTo: -17 });
  }
}

function startMusicLoop() {
  if (state.track === 'song') {
    if (state.music) playSong();
    return;
  }
  const c = ensure();
  if (!c || c.state !== 'running' || !state.track || !state.music) return;
  musicBus.gain.cancelScheduledValues(c.currentTime);
  musicBus.gain.setTargetAtTime(0.5, c.currentTime, 0.4);
  if (timer) return;
  step = 0;
  nextTime = c.currentTime + 0.1;
  timer = window.setInterval(() => {
    const track = TRACKS[state.track];
    if (!track || !ctx) return;
    const spb = 60 / track.bpm / 4;
    while (nextTime < ctx.currentTime + 0.25) {
      scheduleStep(track, nextTime);
      nextTime += spb;
      step++;
    }
  }, 60);
}

function stopMusicLoop() {
  pauseSong();
  if (ctx && musicBus) musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
}

export function setTrack(name) {
  if (state.track === name) return;
  state.track = name;
  stopMusicLoop();
  if (name && state.music) window.setTimeout(startMusicLoop, name === 'song' ? 0 : 250);
}

export function setVolume(v) {
  state.volume = Math.max(0, Math.min(1, Number(v)));
  if (ctx && master) master.gain.setTargetAtTime(0.9 * state.volume, ctx.currentTime, 0.03);
  if (song) song.volume = songVolume();
}

export function setMusicEnabled(on) {
  state.music = !!on;
  if (on) startMusicLoop();
  else stopMusicLoop();
}

export function setSfxEnabled(on) {
  state.sfx = !!on;
  const c = ensure();
  if (c && sfxBus) sfxBus.gain.setTargetAtTime(on ? 0.55 : 0, c.currentTime, 0.02);
}

// Duck the music (e.g. during cutscenes).
export function duckMusic(on) {
  state.ducked = !!on;
  if (song) song.volume = songVolume();
  if (!ctx || !musicBus || !state.music) return;
  musicBus.gain.setTargetAtTime(on ? 0.15 : 0.5, ctx.currentTime, 0.3);
}
