// Erzeugt sämtliche Töne des Films als WAV-Dateien in public/audio/.
// Alles wird hier rechnerisch synthetisiert – keine fremden Aufnahmen, keine Lizenzen,
// keine externen Dienste. Aufruf: npm run audio
//
// Die Nachrichtentöne sind bewusst EIGENE Klänge, die wie ein typischer Messenger
// wirken. Die Originaltöne von WhatsApp sind geschützt und werden nicht verwendet.

import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 48000;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');
mkdirSync(OUT, {recursive: true});

// --if-missing: nur erzeugen, wenn noch keine Töne vorhanden sind (Aufruf vor dem Rendern)
if (process.argv.includes('--if-missing') && existsSync(join(OUT, 'msg_in.wav')) && existsSync(join(OUT, 'music_riser.wav'))) {
  process.exit(0);
}

// ───────────────────────── Grundbausteine ─────────────────────────

const TAU = Math.PI * 2;
const n = (sec) => Math.round(sec * SR);
const stereo = (sec) => ({L: new Float32Array(n(sec)), R: new Float32Array(n(sec))});
const dB = (v) => Math.pow(10, v / 20);

/** Reproduzierbarer Zufall. */
const rng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Zustandsvariables Filter (Tiefpass/Bandpass/Hochpass), Grenzfrequenz pro Sample änderbar. */
const svf = () => {
  let ic1 = 0;
  let ic2 = 0;
  return (x, fc, q = 0.707) => {
    const g = Math.tan(Math.PI * Math.min(fc, SR * 0.45) / SR);
    const k = 1 / q;
    const a1 = 1 / (1 + g * (g + k));
    const a2 = g * a1;
    const a3 = g * a2;
    const v3 = x - ic2;
    const v1 = a1 * ic1 + a2 * v3;
    const v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1;
    ic2 = 2 * v2 - ic2;
    return {lp: v2, bp: v1, hp: x - k * v1 - v2};
  };
};

/** Bandbegrenzter Sägezahn (PolyBLEP). */
const sawOsc = (phase0 = 0) => {
  let p = phase0 % 1;
  return (freq) => {
    const dt = freq / SR;
    let v = 2 * p - 1;
    if (p < dt) {
      const t = p / dt;
      v -= t + t - t * t - 1;
    } else if (p > 1 - dt) {
      const t = (p - 1) / dt;
      v -= t * t + t + t + 1;
    }
    p += dt;
    if (p >= 1) p -= 1;
    return v;
  };
};

const add = (buf, start, sample, pan = 0) => {
  if (start < 0 || start >= buf.L.length) return;
  const l = Math.cos(((pan + 1) * Math.PI) / 4);
  const r = Math.sin(((pan + 1) * Math.PI) / 4);
  buf.L[start] += sample * l * Math.SQRT2 * 0.7071;
  buf.R[start] += sample * r * Math.SQRT2 * 0.7071;
};

/** Hall nach Freeverb-Art. `circular` = Hallfahne läuft über das Schleifenende in den Anfang. */
const reverb = (buf, {room = 0.6, damp = 0.4, wet = 0.25, dry = 1, circular = false} = {}) => {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => Math.round((d * SR) / 44100));
  const alls = [556, 441, 341, 225].map((d) => Math.round((d * SR) / 44100));
  const spread = 23;
  const fb = room * 0.28 + 0.7;
  const dmp = damp * 0.4;
  const len = buf.L.length;
  const outL = new Float32Array(len);
  const outR = new Float32Array(len);

  const channel = (extra, out) => {
    const cb = combs.map((d) => ({b: new Float32Array(d + extra), i: 0, s: 0}));
    const ab = alls.map((d) => ({b: new Float32Array(d + extra), i: 0}));
    const passes = circular ? 2 : 1;
    for (let pass = 0; pass < passes; pass++) {
      for (let i = 0; i < len; i++) {
        const x = (buf.L[i] + buf.R[i]) * 0.015;
        let acc = 0;
        for (const c of cb) {
          const y = c.b[c.i];
          c.s = y * (1 - dmp) + c.s * dmp;
          c.b[c.i] = x + c.s * fb;
          c.i = (c.i + 1) % c.b.length;
          acc += y;
        }
        for (const a of ab) {
          const bo = a.b[a.i];
          const o = -acc + bo;
          a.b[a.i] = acc + bo * 0.5;
          a.i = (a.i + 1) % a.b.length;
          acc = o;
        }
        if (pass === passes - 1) out[i] = acc;
      }
    }
  };
  channel(0, outL);
  channel(spread, outR);
  for (let i = 0; i < len; i++) {
    buf.L[i] = buf.L[i] * dry + outL[i] * wet * 3;
    buf.R[i] = buf.R[i] * dry + outR[i] * wet * 3;
  }
  return buf;
};

/** Macht aus einem etwas zu langen Stück eine nahtlose Schleife (Überblendung Ende→Anfang). */
const makeLoop = (buf, lenSec, xfadeSec) => {
  const len = n(lenSec);
  const xf = n(xfadeSec);
  const out = stereo(lenSec);
  for (const ch of ['L', 'R']) {
    for (let i = 0; i < len; i++) out[ch][i] = buf[ch][i];
    for (let i = 0; i < xf; i++) {
      const t = i / xf;
      out[ch][i] = buf[ch][i] * Math.sin((t * Math.PI) / 2) + buf[ch][len + i] * Math.cos((t * Math.PI) / 2);
    }
  }
  return out;
};

const peak = (buf) => {
  let p = 0;
  for (let i = 0; i < buf.L.length; i++) p = Math.max(p, Math.abs(buf.L[i]), Math.abs(buf.R[i]));
  return p;
};

/** Kurzes Ein-/Ausblenden gegen Knackser. */
const edges = (buf, inSec = 0.003, outSec = 0.02) => {
  const a = n(inSec);
  const b = n(outSec);
  const len = buf.L.length;
  for (let i = 0; i < a; i++) {
    buf.L[i] *= i / a;
    buf.R[i] *= i / a;
  }
  for (let i = 0; i < b; i++) {
    buf.L[len - 1 - i] *= i / b;
    buf.R[len - 1 - i] *= i / b;
  }
  return buf;
};

const write = (name, buf, peakDb = -3) => {
  const g = dB(peakDb) / Math.max(1e-9, peak(buf));
  const len = buf.L.length;
  const data = Buffer.alloc(44 + len * 4);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + len * 4, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(len * 4, 40);
  const rand = rng(99);
  for (let i = 0; i < len; i++) {
    // leichtes Dither, damit leise Ausklänge nicht körnig werden
    const d = (rand() - rand()) / 65536;
    data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round((buf.L[i] * g + d) * 32767))), 44 + i * 4);
    data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round((buf.R[i] * g + d) * 32767))), 46 + i * 4);
  }
  writeFileSync(join(OUT, name), data);
  console.log(`  ${name.padEnd(22)} ${(len / SR).toFixed(2).padStart(6)} s`);
};

/** Gedämpfter Sinus („Ping“), an eine Stelle im Puffer gemischt. */
const ping = (buf, at, freq, decay, amp, pan = 0, attack = 0.001) => {
  const start = n(at);
  const len = n(decay * 7);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t / decay) * Math.min(1, t / attack);
    add(buf, start + i, Math.sin(TAU * freq * t) * env * amp, pan);
  }
};

/** Gefiltertes Rauschen mit Abklingen. */
const burst = (buf, at, fc, q, decay, amp, rand, pan = 0, mode = 'bp', attack = 0.0008) => {
  const start = n(at);
  const len = n(decay * 7);
  const f = svf();
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.exp(-t / decay) * Math.min(1, t / attack);
    add(buf, start + i, f(rand() * 2 - 1, fc, q)[mode] * env * amp, pan);
  }
};

// ───────────────────────── Nachrichtentöne ─────────────────────────

/** Eingehende Nachricht bei geöffnetem Chat: kurzer, weicher, aufsteigender „Plopp“. */
const msgIn = () => {
  const buf = stereo(0.45);
  const len = n(0.2);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 640 + 560 * (1 - Math.exp(-t / 0.016));
    ph += (TAU * f) / SR;
    const env = Math.exp(-t / 0.042) * Math.min(1, t / 0.0018);
    add(buf, i, (Math.sin(ph) + 0.2 * Math.sin(2 * ph) + 0.06 * Math.sin(3 * ph)) * env);
  }
  burst(buf, 0, 2600, 1.2, 0.004, 0.25, rng(1));
  return edges(reverb(buf, {room: 0.2, damp: 0.6, wet: 0.1}));
};

/** Gesendete Nachricht: leises Wischen, dann ein heller, kurzer Ton. */
const msgOut = () => {
  const buf = stereo(0.45);
  const rand = rng(2);
  const f = svf();
  const len = n(0.085);
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const env = Math.sin(Math.PI * t) ** 1.5;
    add(buf, i, f(rand() * 2 - 1, 1100 + 2800 * t * t, 1.6).bp * env * 0.5);
  }
  const start = n(0.062);
  let ph = 0;
  for (let i = 0; i < n(0.16); i++) {
    const t = i / SR;
    const fr = 900 + 520 * (1 - Math.exp(-t / 0.012));
    ph += (TAU * fr) / SR;
    const env = Math.exp(-t / 0.03) * Math.min(1, t / 0.002);
    add(buf, start + i, (Math.sin(ph) + 0.15 * Math.sin(2 * ph)) * env * 0.8);
  }
  return edges(reverb(buf, {room: 0.2, damp: 0.6, wet: 0.08}));
};

/** Tippen auf der Bildschirmtastatur: leise, unregelmäßige Tastenklicks. */
const typing = ({seconds = 10, seed = 3, rate = 6.4, bright = 1, low = 1} = {}) => {
  const buf = stereo(seconds);
  const rand = rng(seed);
  let t = 0.03;
  while (t < seconds - 0.1) {
    const amp = 0.55 + 0.45 * rand();
    const pan = (rand() - 0.5) * 0.5;
    burst(buf, t, (2100 + 1500 * rand()) * bright, 1.4, 0.0035, amp * 0.7, rand, pan);
    ping(buf, t, (150 + 50 * rand()) * low, 0.011, amp * 0.5, pan, 0.0008);
    const gap = (0.6 + 0.9 * rand()) / rate;
    t += rand() < 0.1 ? gap * 2.4 : gap;
  }
  return edges(buf);
};

/** Smartphone vibriert auf der Tischplatte. */
const vibrate = () => {
  const buf = stereo(1.4);
  const rand = rng(4);
  const f = svf();
  const lp = svf();
  for (const [from, to] of [[0.02, 0.5], [0.72, 1.2]]) {
    for (let i = n(from); i < n(to); i++) {
      const t = i / SR;
      const env = Math.min(1, (t - from) / 0.02, (to - t) / 0.05);
      const car = Math.sin(TAU * 168 * t);
      const buzz = Math.tanh(car * 3) * 0.5;
      const rattle = f(rand() * 2 - 1, 950, 0.9).bp * Math.max(0, car) ** 2 * 1.4;
      add(buf, i, lp(buzz + rattle, 1900).lp * env);
    }
  }
  return edges(reverb(buf, {room: 0.25, damp: 0.5, wet: 0.12}));
};

// ───────────────────────── Geräusche der Ersatzsequenzen ─────────────────────────

/** Jemand zieht an einer verschlossenen Tür: Schlag ins Schloss, kurzes Nachklappern. */
const doorRattle = () => {
  const buf = stereo(1.1);
  const rand = rng(5);
  const hits = [[0.0, 1], [0.062, 0.5], [0.118, 0.34], [0.165, 0.2], [0.21, 0.1]];
  for (const [at, amp] of hits) {
    ping(buf, at, 96, 0.07, amp * 0.9);
    ping(buf, at, 318, 0.05, amp * 0.5);
    ping(buf, at, 472, 0.035, amp * 0.34);
    ping(buf, at, 1280, 0.02, amp * 0.16);
    burst(buf, at, 2600, 0.9, 0.022, amp * 0.5, rand);
  }
  // Glas zittert im Rahmen
  const f = svf();
  for (let i = 0; i < n(0.34); i++) {
    const t = i / SR;
    const env = Math.exp(-t / 0.09) * (0.5 + 0.5 * Math.sin(TAU * 41 * t));
    add(buf, i, f(rand() * 2 - 1, 4700, 3).bp * env * 0.1);
  }
  return edges(reverb(buf, {room: 0.35, damp: 0.5, wet: 0.14}));
};

/** Schritte auf nassem Asphalt, näherkommend. */
const footsteps = () => {
  const buf = stereo(3.0);
  const rand = rng(6);
  for (let s = 0; s < 5; s++) {
    const at = 0.05 + s * 0.52 + (rand() - 0.5) * 0.02;
    const amp = 0.5 + 0.1 * s;
    burst(buf, at, 260, 0.7, 0.04, amp, rand, -0.3 + s * 0.12, 'lp');
    ping(buf, at, 78, 0.05, amp * 0.6, -0.3 + s * 0.12);
    burst(buf, at + 0.085, 1700, 1, 0.028, amp * 0.3, rand, -0.3 + s * 0.12);
    burst(buf, at + 0.01, 5200, 1.2, 0.02, amp * 0.07, rand, -0.3 + s * 0.12);
  }
  return edges(reverb(buf, {room: 0.3, damp: 0.6, wet: 0.1}));
};

/** Schlüsselbund, Schlüssel ins Schloss, zweimal drehen, Tür geht auf. */
const keyLock = () => {
  const buf = stereo(2.4);
  const rand = rng(7);
  for (let i = 0; i < 9; i++) {
    const at = 0.02 + rand() * 0.5;
    const f0 = 2900 + rand() * 3600;
    const amp = 0.12 + 0.2 * rand();
    ping(buf, at, f0, 0.03 + 0.05 * rand(), amp, rand() - 0.5);
    ping(buf, at, f0 * 1.52, 0.02 + 0.03 * rand(), amp * 0.6, rand() - 0.5);
  }
  burst(buf, 0.66, 3600, 1.5, 0.03, 0.35, rand);
  for (const at of [0.95, 1.22]) {
    ping(buf, at, 1750, 0.006, 0.5);
    ping(buf, at, 170, 0.03, 0.6);
    burst(buf, at, 2400, 1, 0.012, 0.4, rand);
    ping(buf, at + 0.05, 112, 0.07, 0.8);
    ping(buf, at + 0.05, 430, 0.035, 0.35);
  }
  // Tür schwingt auf: leiser Luftzug
  const f = svf();
  for (let i = n(1.5); i < n(2.2); i++) {
    const t = (i - n(1.5)) / n(0.7);
    add(buf, i, f(rand() * 2 - 1, 380 + 240 * t, 0.8).lp * Math.sin(Math.PI * t) ** 2 * 0.3);
  }
  return edges(reverb(buf, {room: 0.35, damp: 0.5, wet: 0.14}));
};

/** Hallenlicht: Schütz, Starter der Leuchtstoffröhren, Brummen. */
const lightsOn = () => {
  const buf = stereo(3.4);
  const rand = rng(8);
  ping(buf, 0.02, 900, 0.006, 0.7);
  ping(buf, 0.02, 140, 0.04, 0.9);
  burst(buf, 0.02, 2000, 1, 0.015, 0.5, rand);
  for (const [at, amp] of [[0.2, 0.3], [0.37, 0.4], [0.46, 0.25], [0.71, 0.34], [0.86, 0.2]]) {
    ping(buf, at, 2400, 0.018, amp, rand() - 0.5);
    ping(buf, at, 5100, 0.012, amp * 0.5, rand() - 0.5);
  }
  for (let i = n(0.3); i < n(3.3); i++) {
    const t = i / SR;
    const env = Math.min(1, (t - 0.3) / 0.9, (3.3 - t) / 1.3) * 0.16;
    add(buf, i, (Math.sin(TAU * 100 * t) + 0.5 * Math.sin(TAU * 200 * t) + 0.2 * Math.sin(TAU * 300 * t)) * env);
  }
  return edges(reverb(buf, {room: 0.8, damp: 0.3, wet: 0.3}));
};

/** Tischtelefon im Büro: zwei elektronische Ruftöne. */
const phoneRing = () => {
  const buf = stereo(3.2);
  const f = svf();
  for (const from of [0.05, 1.65]) {
    for (let i = n(from); i < n(from + 0.95); i++) {
      const t = i / SR - from;
      const tone = Math.floor(t / 0.045) % 2 === 0 ? 1318.5 : 1568;
      const env = Math.min(1, t / 0.008, (0.95 - t) / 0.03);
      const v = Math.tanh(Math.sin(TAU * tone * (i / SR)) * 2.2) * 0.6;
      add(buf, i, f(v, 2100, 0.8).bp * env);
    }
  }
  return edges(reverb(buf, {room: 0.45, damp: 0.5, wet: 0.2}));
};

/** Dämmerung draußen: Wind, feiner Regen, fernes Brummen (Schleife). */
const ambNight = () => {
  const len = 12;
  const raw = stereo(len + 2);
  const rand = rng(9);
  const wl = svf();
  const wr = svf();
  const hl = svf();
  const hr = svf();
  let bl = 0;
  let br = 0;
  for (let i = 0; i < raw.L.length; i++) {
    const t = i / SR;
    bl = bl * 0.985 + (rand() * 2 - 1) * 0.12;
    br = br * 0.985 + (rand() * 2 - 1) * 0.12;
    const gust = 0.55 + 0.3 * Math.sin((TAU * t) / 12 + 1) + 0.15 * Math.sin((TAU * t) / 4 + 2);
    const fc = 300 + 220 * Math.sin((TAU * t) / 6) + 90 * Math.sin((TAU * t) / 2.4 + 1);
    const rain = 0.016 * (0.7 + 0.3 * Math.sin((TAU * t) / 3));
    raw.L[i] = wl(bl, fc, 0.9).bp * gust + hl(rand() * 2 - 1, 5200, 0.7).hp * rain + Math.sin(TAU * 50 * t) * 0.006;
    raw.R[i] = wr(br, fc * 1.07, 0.9).bp * gust + hr(rand() * 2 - 1, 5600, 0.7).hp * rain + Math.sin(TAU * 100 * t) * 0.003;
  }
  return makeLoop(raw, len, 2);
};

/** Büro: Raumton, Lüftung (Schleife). */
const ambOffice = () => {
  const len = 8;
  const raw = stereo(len + 1.5);
  const rand = rng(10);
  const fl = svf();
  const fr = svf();
  const al = svf();
  for (let i = 0; i < raw.L.length; i++) {
    const t = i / SR;
    const hum = Math.sin(TAU * 60 * t) * 0.02 + Math.sin(TAU * 120 * t) * 0.012;
    const air = al(rand() * 2 - 1, 6500, 0.7).hp * 0.006;
    raw.L[i] = fl(rand() * 2 - 1, 420, 0.7).lp * 0.3 + hum + air;
    raw.R[i] = fr(rand() * 2 - 1, 460, 0.7).lp * 0.3 + hum - air;
  }
  return makeLoop(raw, len, 1.5);
};

/** Produktionshalle im Stillstand: großer, leerer Raum (Schleife). */
const ambHall = () => {
  const len = 12;
  const raw = stereo(len + 2);
  const rand = rng(11);
  const fl = svf();
  const fr = svf();
  for (let i = 0; i < raw.L.length; i++) {
    const t = i / SR;
    const hum = Math.sin(TAU * 50 * t) * 0.03 + Math.sin(TAU * 100 * t) * 0.02 + Math.sin(TAU * 150 * t) * 0.006;
    raw.L[i] = fl(rand() * 2 - 1, 240, 0.7).lp * 0.4 + hum;
    raw.R[i] = fr(rand() * 2 - 1, 260, 0.7).lp * 0.4 + hum;
  }
  // vereinzeltes Knacken von abkühlendem Metall
  for (const [at, f0, amp] of [[1.4, 2100, 0.2], [4.9, 1500, 0.14], [7.2, 2700, 0.1], [10.1, 1800, 0.16]]) {
    ping(raw, at, f0, 0.02, amp, rand() - 0.5);
    ping(raw, at, f0 * 2.3, 0.012, amp * 0.5, rand() - 0.5);
  }
  return makeLoop(reverb(raw, {room: 0.9, damp: 0.25, wet: 0.5}), len, 2);
};

// ───────────────────────── Musik (Spuren, 60/120 BPM, d-Moll) ─────────────────────────

/** Frequenz so runden, dass sie in eine Schleife der Länge `loop` Sekunden passt (kein Knacken am Übergang). */
const fit = (freq, loop) => Math.round(freq * loop) / loop;

/** Tiefer, langsam atmender Grundton. */
const musicDrone = () => {
  const len = 16;
  const buf = stereo(len);
  const rand = rng(20);
  const voices = [
    {f: 73.42, amp: 1.0, cut: [150, 190]},
    {f: 110.0, amp: 0.55, cut: [170, 240]},
    {f: 146.83, amp: 0.5, cut: [200, 330]},
    {f: 174.61, amp: 0.2, cut: [220, 380]},
  ];
  for (const [vi, v] of voices.entries()) {
    const oscs = [-5, 0, 6].map((cents, k) => ({
      osc: sawOsc(rand()),
      f: fit(v.f * Math.pow(2, cents / 1200), len),
      pan: (k - 1) * 0.6,
    }));
    const fl = svf();
    const fr = svf();
    const phase = rand() * TAU;
    for (let i = 0; i < buf.L.length; i++) {
      const t = i / SR;
      let l = 0;
      let r = 0;
      for (const o of oscs) {
        const s = o.osc(o.f);
        l += s * (0.5 - o.pan * 0.4);
        r += s * (0.5 + o.pan * 0.4);
      }
      const cut = v.cut[0] + v.cut[1] * (0.5 + 0.5 * Math.sin((TAU * t) / 16 + phase));
      const breathe = 0.74 + 0.26 * Math.sin((TAU * t) / 8 + phase * 1.7 + vi);
      buf.L[i] += fl(l, cut, 0.8).lp * v.amp * breathe;
      buf.R[i] += fr(r, cut * 1.04, 0.8).lp * v.amp * breathe;
    }
  }
  const sub = fit(36.71, len);
  for (let i = 0; i < buf.L.length; i++) {
    const s = Math.sin(TAU * sub * (i / SR)) * 0.5;
    buf.L[i] += s;
    buf.R[i] += s;
  }
  return reverb(buf, {room: 0.85, damp: 0.5, wet: 0.35, circular: true});
};

/** Weicher, tiefer Puls auf jedem Schlag (60 BPM). */
const musicPulse = () => {
  const len = 8;
  const buf = stereo(len);
  const accents = [1, 0.5, 0.78, 0.5, 1, 0.5, 0.78, 0.6];
  accents.forEach((amp, beat) => {
    const start = n(beat);
    let ph = 0;
    for (let i = 0; i < n(0.9); i++) {
      const t = i / SR;
      const f = 44 + 22 * Math.exp(-t / 0.05);
      ph += (TAU * f) / SR;
      const env = Math.exp(-t / 0.26) * Math.min(1, t / 0.012);
      add(buf, (start + i) % buf.L.length, (Math.sin(ph) + 0.32 * Math.sin(2 * ph) + 0.08 * Math.sin(3 * ph)) * env * amp);
    }
  });
  return reverb(buf, {room: 0.5, damp: 0.7, wet: 0.14, circular: true});
};

/** Treibendes, gedämpftes Achtelmotiv (120 BPM). */
const musicOstinato = () => {
  const len = 8;
  const dry = stereo(len);
  const rand = rng(21);
  const D3 = 146.83;
  const st = (semi) => D3 * Math.pow(2, semi / 12);
  // d-Moll: D, F(+3), E(+2), C(-2), A(-5), B♭(-4)
  const pattern = [0, 0, -5, 0, 0, 3, 0, -5, 0, 0, -5, 0, 2, 3, 2, -2, 0, 0, -5, 0, 0, 3, 0, -5, 0, 0, -5, 0, 0, -4, -5, -5];
  pattern.forEach((semi, idx) => {
    const start = n(idx * 0.25);
    const f0 = st(semi);
    const o1 = sawOsc(rand());
    const o2 = sawOsc(rand());
    const flt = svf();
    const accent = idx % 4 === 0 ? 1 : idx % 2 === 0 ? 0.72 : 0.56;
    const pan = idx % 2 === 0 ? -0.22 : 0.22;
    for (let i = 0; i < n(0.3); i++) {
      const t = i / SR;
      const env = Math.exp(-t / 0.075) * Math.min(1, t / 0.003);
      const cut = 260 + 1500 * accent * Math.exp(-t / 0.045);
      const s = flt(o1(f0 * 1.003) + o2(f0 * 0.997), cut, 1.3).lp * env * accent * 0.5;
      add(dry, (start + i) % dry.L.length, s, pan);
    }
  });
  // punktiertes Achtel-Echo, läuft über das Schleifenende
  const buf = stereo(len);
  const d = n(0.375);
  for (const ch of ['L', 'R']) {
    const line = new Float32Array(d);
    let p = 0;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < dry[ch].length; i++) {
        const echo = line[p];
        line[p] = dry[ch === 'L' ? 'R' : 'L'][i] * 0.5 + echo * 0.36;
        p = (p + 1) % d;
        if (pass === 1) buf[ch][i] = dry[ch][i] + echo * 0.55;
      }
    }
  }
  return reverb(buf, {room: 0.55, damp: 0.6, wet: 0.16, circular: true});
};

/** Uhrticken, zweimal pro Sekunde. */
const musicTick = () => {
  const len = 4;
  const buf = stereo(len);
  const rand = rng(22);
  for (let k = 0; k < 8; k++) {
    const tock = k % 2 === 1;
    const at = k * 0.5;
    burst(buf, at, tock ? 2300 : 3300, 2.2, 0.006, tock ? 0.7 : 1, rand, tock ? 0.12 : -0.12);
    ping(buf, at, tock ? 1480 : 2080, 0.009, tock ? 0.35 : 0.5, tock ? 0.12 : -0.12, 0.0005);
  }
  return reverb(buf, {room: 0.4, damp: 0.4, wet: 0.16, circular: true});
};

/** Hohe, liegende Spannungsfläche mit leichter Reibung (a–b♭). */
const musicStrings = () => {
  const len = 16;
  const buf = stereo(len);
  const rand = rng(23);
  const notes = [
    {f: 440.0, amp: 1, swell: 0},
    {f: 587.33, amp: 0.8, swell: 1.4},
    {f: 698.46, amp: 0.5, swell: 2.6},
    {f: 466.16, amp: 0.42, swell: 4.1}, // die Reibung
    {f: 293.66, amp: 0.6, swell: 5.2},
  ];
  for (const note of notes) {
    const oscs = [-9, -4, 0, 5, 10].map((cents) => ({
      osc: sawOsc(rand()),
      f: fit(note.f * Math.pow(2, cents / 1200), len),
      pan: rand() * 2 - 1,
      vibRate: fit(4.6 + rand() * 1.2, len),
      vibPhase: rand() * TAU,
    }));
    const fl = svf();
    const fr = svf();
    const hl = svf();
    const hr = svf();
    const tremRate = fit(5.5 + rand() * 1.5, len);
    for (let i = 0; i < buf.L.length; i++) {
      const t = i / SR;
      let l = 0;
      let r = 0;
      for (const o of oscs) {
        const vib = 1 + 0.0028 * Math.sin(TAU * o.vibRate * t + o.vibPhase);
        const s = o.osc(o.f * vib);
        l += s * (0.5 - o.pan * 0.35);
        r += s * (0.5 + o.pan * 0.35);
      }
      const swell = 0.62 + 0.38 * Math.sin((TAU * t) / 16 + note.swell);
      const trem = 0.86 + 0.14 * Math.sin(TAU * tremRate * t + note.swell);
      const g = note.amp * swell * trem * 0.2;
      buf.L[i] += hl(fl(l, 2100, 0.7).lp, 260, 0.7).hp * g;
      buf.R[i] += hr(fr(r, 2300, 0.7).lp, 260, 0.7).hp * g;
    }
  }
  return reverb(buf, {room: 0.92, damp: 0.35, wet: 0.5, dry: 0.7, circular: true});
};

/** Anschwellen (8 s) in einen weichen, tiefen Schlag, danach dunkles Ausklingen (8 s). */
const musicRiser = () => {
  const len = 16;
  const hit = 8;
  const buf = stereo(len);
  const rand = rng(24);
  const fl = svf();
  const fr = svf();
  const gl = [sawOsc(rand()), sawOsc(rand()), sawOsc(rand())];
  const gf = svf();
  for (let i = 0; i < n(hit); i++) {
    const t = i / SR;
    const p = t / hit;
    const env = Math.pow(p, 2.6) * Math.min(1, (hit - t) / 0.05);
    const fc = 260 * Math.pow(9, p);
    buf.L[i] += fl(rand() * 2 - 1, fc, 1.1).bp * env * 0.5;
    buf.R[i] += fr(rand() * 2 - 1, fc * 1.08, 1.1).bp * env * 0.5;
    // aufwärts gleitender Ton, eine Oktave in 8 Sekunden
    const f0 = 146.83 * Math.pow(2, p);
    const tone = gf((gl[0](f0) + gl[1](f0 * 1.006) + gl[2](f0 * 1.498)) / 3, 500 + 1400 * p, 0.9).lp * env * 0.55;
    buf.L[i] += tone;
    buf.R[i] += tone;
  }
  // weicher Schlag – kein Knall
  let ph = 0;
  const tl = svf();
  for (let i = 0; i < n(6.5); i++) {
    const t = i / SR;
    const f = 37 + 24 * Math.exp(-t / 0.12);
    ph += (TAU * f) / SR;
    const env = Math.exp(-t / 1.5) * Math.min(1, t / 0.018);
    const thud = tl(rand() * 2 - 1, 180, 0.7).lp * Math.exp(-t / 0.07) * 0.8;
    const s = (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) * env * 1.3 + thud;
    buf.L[n(hit) + i] += s;
    buf.R[n(hit) + i] += s;
  }
  // dunkler Nachklang
  const o1 = sawOsc(0.1);
  const o2 = sawOsc(0.6);
  const nl = svf();
  for (let i = n(hit); i < buf.L.length; i++) {
    const t = i / SR - hit;
    const env = Math.min(1, t / 0.4) * Math.pow(Math.max(0, 1 - t / 8), 1.6);
    const s = nl(o1(73.42) + o2(73.42 * 1.5 * 1.004), 240, 0.8).lp * env * 0.34;
    buf.L[i] += s;
    buf.R[i] += s;
  }
  return edges(reverb(buf, {room: 0.9, damp: 0.4, wet: 0.4}), 0.01, 1.2);
};

// ───────────────────────── Ausgabe ─────────────────────────

console.log('Erzeuge Töne in public/audio/ …');
write('msg_in.wav', msgIn(), -4);
write('msg_out.wav', msgOut(), -6);
write('typing.wav', typing(), -12);
write('pc_keys.wav', typing({seconds: 6, seed: 31, rate: 7.5, bright: 0.8, low: 1.5}), -10);
write('vibrate.wav', vibrate(), -6);
write('door_rattle.wav', doorRattle(), -4);
write('footsteps.wav', footsteps(), -8);
write('key_lock.wav', keyLock(), -6);
write('lights_on.wav', lightsOn(), -6);
write('phone_ring.wav', phoneRing(), -8);
write('amb_night.wav', ambNight(), -14);
write('amb_office.wav', ambOffice(), -20);
write('amb_hall.wav', ambHall(), -16);
write('music_drone.wav', musicDrone(), -6);
write('music_pulse.wav', musicPulse(), -6);
write('music_ostinato.wav', musicOstinato(), -6);
write('music_tick.wav', musicTick(), -10);
write('music_strings.wav', musicStrings(), -6);
write('music_riser.wav', musicRiser(), -4);
console.log('Fertig.');
