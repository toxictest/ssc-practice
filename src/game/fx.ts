/* Tiny WebAudio blip kit — no assets, no network. */
let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(v: boolean) {
  muted = v;
}
export function isMuted() {
  return muted;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  } catch { return null; }
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const fx = {
  select: () => tone(520, 0.05, "triangle", 0.05),
  tick: () => tone(880, 0.025, "square", 0.018),
  correct: () => {
    tone(660, 0.12, "triangle", 0.09);
    setTimeout(() => tone(990, 0.18, "triangle", 0.08), 90);
    setTimeout(() => tone(1320, 0.22, "sine", 0.06), 170);
  },
  wrong: () => {
    tone(180, 0.28, "sawtooth", 0.07, 90);
    setTimeout(() => tone(120, 0.3, "square", 0.045, 60), 80);
  },
  stamp: () => tone(150, 0.12, "square", 0.09, 55),
  tickLast: () => tone(1180, 0.06, "square", 0.05),
  over: () => {
    tone(420, 0.22, "triangle", 0.08, 220);
    setTimeout(() => tone(300, 0.3, "triangle", 0.07, 140), 180);
    setTimeout(() => tone(190, 0.5, "sine", 0.07, 90), 380);
  },
  start: () => {
    tone(300, 0.1, "square", 0.06, 600);
    setTimeout(() => tone(600, 0.12, "square", 0.06, 900), 110);
    setTimeout(() => tone(900, 0.18, "triangle", 0.07, 1200), 220);
  },
};
