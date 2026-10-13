/* =============================================================
   BILINGUAL QUESTION KIT — shared types, helpers and builder
   Every question is authored in BOTH languages: the drill renders
   English or Hindi from the same generated values, exactly the way
   the Eduquity delivery platform serves a language toggle above
   each question.
   ============================================================= */

export type Lang = "EN" | "HI";
export type Kind = "QUANT" | "REASONING" | "ENGLISH" | "GA";
export type Diff = "EASY" | "MODERATE" | "HARD";
export type Tier = 1 | 2;

export interface Bi {
  en: string;
  hi: string;
}

export const B = (en: string, hi: string): Bi => ({ en, hi });
export const N = (v: string | number): Bi => ({ en: String(v), hi: String(v) });
export const NL = (a: (string | number)[]): Bi[] => a.map(N);

export interface RawQuestion {
  id: string;
  kind: Kind;
  topic: Bi;
  subtopic: Bi;
  stem: Bi;
  data?: string;
  options: Bi[];
  answer: number;
  method: Bi;
  hack: Bi;
  trap: Bi;
}

export interface QView {
  id: string;
  kind: Kind;
  topic: string;
  subtopic: string;
  stem: string;
  data?: string;
  options: string[];
  answer: number;
  method: string;
  hack: string;
  trap: string;
}

export function localizeQuestion(q: RawQuestion, lang: Lang): QView {
  const p = (b: Bi) => (lang === "HI" ? b.hi : b.en);
  return {
    id: q.id,
    kind: q.kind,
    topic: p(q.topic),
    subtopic: p(q.subtopic),
    stem: p(q.stem),
    data: q.data,
    options: q.options.map(p),
    answer: q.answer,
    method: p(q.method),
    hack: p(q.hack),
    trap: p(q.trap),
  };
}

export const KIND_LABEL: Record<Kind, Bi> = {
  QUANT: B("Quantitative Aptitude", "मात्रात्मक योग्यता"),
  REASONING: B("General Intelligence & Reasoning", "सामान्य बुद्धिमत्ता एवं तर्कशक्ति"),
  ENGLISH: B("English Comprehension", "अंग्रेज़ी गद्यांश"),
  GA: B("General Awareness", "सामान्य जागरूकता"),
};

/* ---------------------------- utils ---------------------------- */
export const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export function shuffle<T>(a: T[]): T[] {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
export const rup = (n: number) => "₹" + n.toLocaleString("en-IN");
export const trim = (n: number, d = 2) => {
  const s = n.toFixed(d);
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
};
export const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const posOf = (ch: string) => ch.charCodeAt(0) - 65;

let uidCounter = 0;
export const uid = () => "q" + Date.now().toString(36) + (uidCounter++).toString(36);

/* ------------------------- option builder ------------------------ */
function numericFiller(correct: Bi) {
  return (i: number): Bi => {
    const m = correct.en.match(/-?\d[\d,]*(\.\d+)?/);
    if (!m) return N("");
    const num = parseFloat(m[0].replace(/,/g, ""));
    if (!isFinite(num)) return N("");
    const step = Math.max(1, Math.round(Math.abs(num) * (0.05 + i * 0.035))) || 1;
    const sign = i % 2 === 0 ? 1 : -1;
    const v = num + sign * step;
    const en = correct.en.replace(/-?\d[\d,]*(\.\d+)?/, v.toLocaleString("en-IN"));
    const hi = correct.hi.replace(/-?\d[\d,]*(\.\d+)?/, v.toLocaleString("en-IN"));
    return B(en, hi);
  };
}

export function buildOptions(
  correct: Bi,
  wrong: Bi[],
  filler?: (i: number) => Bi
): { options: Bi[]; answer: number } {
  const set: Bi[] = [];
  for (const w of wrong) {
    const v = w.en.trim();
    if (v && v !== correct.en.trim() && !set.some((s) => s.en === v) && set.length < 3) {
      set.push(B(w.en.trim(), w.hi.trim()));
    }
  }
  const fill = filler ?? numericFiller(correct);
  let guard = 0;
  while (set.length < 3 && guard++ < 60) {
    const c = fill(guard);
    const v = (c.en ?? "").trim();
    if (v && v !== correct.en.trim() && !set.some((s) => s.en === v)) {
      set.push(B(v, (c.hi ?? v).trim()));
    }
  }
  while (set.length < 3) {
    const tag = "इनमें से कोई नहीं / None of these " + (set.length + 1);
    set.push(B(tag, tag));
  }
  const opts = shuffle([B(correct.en.trim(), correct.hi.trim()), ...set]);
  return {
    options: opts,
    answer: opts.findIndex((o) => o.en === correct.en.trim()),
  };
}

export function mk(
  kind: Kind,
  topic: Bi,
  subtopic: Bi,
  stem: Bi,
  correct: Bi,
  wrong: Bi[],
  method: Bi,
  hack: Bi,
  trap: Bi,
  data?: string
): RawQuestion {
  const { options, answer } = buildOptions(correct, wrong);
  return { id: uid(), kind, topic, subtopic, stem, data, options, answer, method, hack, trap };
}

export type Gen = (lvl: number, tier: Tier) => RawQuestion;
