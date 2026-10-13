/* =============================================================
   RAPID CALCULATION SPRINT — micro-drill generator
   Percentage↔fraction, Vedic squares, unit digit, digital root,
   split-and-merge multiplication, cubes, roots and ratio shares.
   Every item is generated; nothing is stored.
   ============================================================= */

export interface SprintItem {
  prompt: string;
  answer: string;
  options: string[];
  tip: string;
  kind: string;
}

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
function shuffle<T>(a: T[]): T[] {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function make(
  kind: string,
  prompt: string,
  answer: string,
  wrong: string[],
  tip: string
): SprintItem {
  const set: string[] = [];
  for (const w of wrong) {
    const v = w.trim();
    if (v && v !== answer && !set.includes(v) && set.length < 3) set.push(v);
  }
  let guard = 0;
  while (set.length < 3 && guard++ < 40) {
    const n = parseFloat(answer.replace(/[^0-9.]/g, ""));
    if (!isFinite(n)) break;
    const step = Math.max(1, Math.round(n * (0.06 + guard * 0.04))) || 1;
    const v = String(n + (guard % 2 === 0 ? step : -step));
    if (v !== answer && !set.includes(v)) set.push(v);
  }
  while (set.length < 3) set.push("— " + (set.length + 1));
  const opts = shuffle([answer, ...set]);
  return { prompt, answer, options: opts, tip, kind };
}

const pctOf = (): SprintItem => {
  const p = pick([12.5, 25, 37.5, 62.5, 87.5, 16.5, 20, 30, 45, 60, 75, 80]);
  const n = ri(2, 40) * 20;
  const v = (p * n) / 100;
  return make(
    "PERCENTAGE",
    `${p}% of ${n} = ?`,
    String(v),
    [String(v + n * 0.05), String(v - n * 0.05), String(v * 2)],
    `Convert the percentage to a fraction first — ${p}% ≈ ${(p / 100).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}. Multiply the number by that fraction instead of dividing by 100.`
  );
};

const fracToPct = (): SprintItem => {
  const pairs: [number, number][] = [
    [1, 8], [3, 8], [5, 8], [7, 8], [1, 6], [5, 6], [1, 16], [3, 16], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [7, 10],
  ];
  const [a, b] = pick(pairs);
  const v = (a / b) * 100;
  return make(
    "FRACTION → PERCENT",
    `${a}/${b} expressed as a percentage is:`,
    `${Number(v.toFixed(2))}%`,
    [`${v + 5}%`, `${v - 5}%`, `${v / 2}%`],
    `Memorise the 1/8 family: 1/8 = 12.5%, 3/8 = 37.5%, 5/8 = 62.5%, 7/8 = 87.5%. One lookup, zero division.`
  );
};

const vedicSquare = (): SprintItem => {
  const n = pick([15, 25, 35, 45, 55, 65, 75, 85, 95]);
  const tens = Math.floor(n / 10);
  const head = tens * (tens + 1);
  const v = n * n;
  return make(
    "VEDIC SQUARE",
    `${n}² = ?`,
    String(v),
    [String(v + 20), String(v - 20), String(v + 100)],
    `Numbers ending in 5: write ${Math.floor(n / 10)} × ${Math.floor(n / 10) + 1} = ${Math.floor(head)} and append 25 → ${Math.floor(head)}25.`
  );
};

const cube = (): SprintItem => {
  const n = ri(6, 21);
  const v = n * n * n;
  return make(
    "CUBE",
    `${n}³ = ?`,
    String(v),
    [String(v + n * n), String(v - n * n), String(v + 50)],
    `Cubes of 1–20 are non-negotiable. Build ${n}³ as ${n}² × ${n} = ${n * n} × ${n} = ${v}, or use (a ± b)³ around a nearby round number.`
  );
};

const unitDigit = (): SprintItem => {
  const a = pick([2, 3, 4, 7, 8, 9]);
  const e = ri(12, 58);
  const cycle = [a % 10, (a * a) % 10, (a * a * a) % 10, (a * a * a * a) % 10];
  const v = cycle[(e - 1) % 4];
  return make(
    "UNIT DIGIT",
    `What is the unit digit of ${a}^${e}?`,
    String(v),
    shuffle(cycle.filter((x) => x !== v).map(String)).slice(0, 3),
    `Unit digits repeat in cycles of 4 (or 2). Divide the power by 4 and use the remainder: ${e} ÷ 4 leaves ${(e - 1) % 4 + 1} → the ${["1st", "2nd", "3rd", "4th"][(e - 1) % 4]} element of the cycle ${cycle.join("-")}.`
  );
};

const digitalRoot = (): SprintItem => {
  const n = ri(1200, 99999);
  const v = 1 + ((n - 1) % 9);
  return make(
    "DIGITAL ROOT",
    `Digital root of ${n} is:`,
    String(v),
    [String(v === 9 ? 1 : v + 1), String(v === 1 ? 9 : v - 1), String(v > 5 ? v - 4 : v + 4)],
    `Digital root = 1 + (n − 1) mod 9. Cast out the 9s as you add the digits — never carry out long addition.`
  );
};

const splitMerge = (): SprintItem => {
  const n = ri(21, 89);
  const mult = pick([5, 25, 125, 11, 99, 15]);
  const v = n * mult;
  return make(
    "SPLIT & MERGE",
    `${n} × ${mult} = ?`,
    String(v),
    [String(v + n), String(v - n), String(v + mult)],
    mult === 11
      ? `Multiply by 11 by splitting: ${n} → ${Math.floor(n / 10)}|${n % 10}, middle digit = sum = ${Math.floor(n / 10) + (n % 10)}.`
      : `Split the multiplier: ${n} × ${mult} = ${n} × ${mult / 2} × 2${mult % 10 === 5 ? " + half again" : ""}. Break it into a friendly factor and recombine — never do the long multiplication.`
  );
};

const rootBetween = (): SprintItem => {
  const root = ri(13, 44);
  const v = root * root;
  return make(
    "SQUARE ROOT",
    `√${v} = ?`,
    String(root),
    [String(root + 1), String(root - 1), String(root + 2)],
    `Anchor to known squares: ${root - 1}² = ${(root - 1) * (root - 1)}, ${root}² = ${v}, ${root + 1}² = ${(root + 1) * (root + 1)}. Land between two anchors, never divide.`
  );
};

const netChange = (): SprintItem => {
  const a = pick([10, 20, 25, 50]);
  const b = pick([10, 20, 25, 50]);
  const v = a - b - (a * b) / 100;
  return make(
    "NET CHANGE",
    `+${a}% followed by −${b}% gives a net change of:`,
    `${v}%`,
    [`${a - b}%`, `${a + b}%`, `${-v}%`],
    `Net = a − b − ab/100 = ${a} − ${b} − ${(a * b) / 100} = ${v}%. The cross term is the whole question.`
  );
};

const ratioShare = (): SprintItem => {
  const a = pick([2, 3, 4, 5, 7]);
  const b = pick([3, 5, 6, 8, 9].filter((x) => x !== a));
  const unit = ri(3, 18) * 10;
  const total = (a + b) * unit;
  const share = a * unit;
  return make(
    "RATIO SHARE",
    `₹${total} is divided in the ratio ${a}:${b}. The larger share is:`,
    `₹${Math.max(share, b * unit)}`,
    [`₹${Math.min(share, b * unit)}`, `₹${total / 2}`, `₹${Math.max(share, b * unit) + unit}`],
    `Total parts = ${a} + ${b} = ${a + b}; one part = ₹${unit}. Largest share = ${Math.max(a, b)} × ₹${unit} = ₹${Math.max(share, b * unit)}.`
  );
};

const speedTrick = (): SprintItem => {
  const n = pick([25, 50, 75, 125]);
  const m = ri(3, 19) * 4;
  const v = (n * m) / 100;
  return make(
    "FRACTION TRICK",
    `${n}% of ${m} = ?`,
    String(v),
    [String(v + 1), String(v - 1), String(v * 2)],
    `${n}% = ${n === 25 ? "1/4" : n === 50 ? "1/2" : n === 75 ? "3/4" : "5/4"}. Divide ${m} by the denominator and multiply by the numerator.`
  );
};

/* ---------------------- MAGICAL / VEDIC CALCULATION ---------------------- */
const vedic11 = (): SprintItem => {
  const d1 = ri(1, 8);
  const d2 = ri(0, 8 - d1);
  const n = d1 * 10 + d2;
  const mid = d1 + d2;
  const v = n * 11;
  return make(
    "MAGIC · EKADHIKENA",
    `${n} × 11 = ?`,
    String(v),
    [String(v + n), String(v - n), String(v + 11)],
    `Ekadhikena: write ${d1} | ${d1}+${d2}=${mid} | ${d2} → ${d1}${mid}${d2}. The middle digit is just the sum of the two digits.`
  );
};

const nikhilam = (): SprintItem => {
  const up = Math.random() > 0.5;
  const a = 100 + (up ? ri(1, 9) : -ri(1, 9));
  const b = 100 + (up ? ri(1, 9) : -ri(1, 9));
  const da = a - 100;
  const db = b - 100;
  const v = a * b;
  return make(
    "MAGIC · NIKHILAM",
    `${a} × ${b} = ?`,
    String(v),
    [String(v + 20), String(v - 20), String(v + 100)],
    `Nikhilam (base 100): cross-add ${a} ${db > 0 ? "+" : ""}${db} = ${a + db}. Deviations ${da} x ${db} = ${da * db} (2 digits). Answer = ${a + db} and ${da * db} = ${v}.`
  );
};

const squareNear50 = (): SprintItem => {
  const x = ri(-9, 9);
  const n = 50 + x;
  const v = n * n;
  const tail = String(x * x).padStart(2, "0");
  return make(
    "MAGIC · SQUARES NEAR 50",
    `${n}² = ?`,
    String(v),
    [String(v + 20), String(v - 20), String(v + 50)],
    `Base-50 method: 25 + (${x}) = ${25 + x}, then ${x}² = ${tail}. Join them → ${25 + x}${tail} = ${v}.`
  );
};

const byTwentyFive = (): SprintItem => {
  const n = ri(3, 40) * 4;
  const v = n * 25;
  return make(
    "MAGIC · ×25 TRICK",
    `${n} × 25 = ?`,
    String(v),
    [String(v + 25), String(v - 25), String(v / 2)],
    `Multiply by 25 = divide by 4 and add two zeros: ${n} / 4 = ${n / 4}, then append 00 → ${v}.`
  );
};

const byNine = (): SprintItem => {
  const n = ri(12, 89);
  const v = n * 9;
  return make(
    "MAGIC · ×9 TRICK",
    `${n} × 9 = ?`,
    String(v),
    [String(v + n), String(v - n), String(v + 9)],
    `Multiply by 9 = multiply by 10 and subtract the number: ${n}0 - ${n} = ${v}.`
  );
};

const fracMagic = (): SprintItem => {
  const pairs: [string, string][] = [
    ["12.5%", "1/8"], ["37.5%", "3/8"], ["62.5%", "5/8"], ["87.5%", "7/8"],
    ["16.66%", "1/6"], ["83.33%", "5/6"], ["14.28%", "1/7"], ["66.66%", "2/3"],
  ];
  const p = pick(pairs);
  return make(
    "MAGIC · % ↔ FRACTION",
    `${p[0]} expressed as a fraction is:`,
    p[1],
    shuffle(pairs.filter((x) => x[1] !== p[1]).map((x) => x[1])).slice(0, 3),
    `Burn the table into memory: 1/8 = 12.5%, 1/6 = 16.66%, 1/7 = 14.28%, 2/3 = 66.66%. Percentage questions become one-look questions.`
  );
};

const gens: (() => SprintItem)[] = [
  pctOf, fracToPct, vedicSquare, cube, unitDigit, digitalRoot,
  splitMerge, rootBetween, netChange, ratioShare, speedTrick,
  vedic11, nikhilam, squareNear50, byTwentyFive, byNine, fracMagic,
];

const recent: string[] = [];

export function makeSprintItem(): SprintItem {
  for (let i = 0; i < 10; i++) {
    const it = pick(gens)();
    if (!recent.includes(it.kind) || i > 5) {
      recent.push(it.kind);
      if (recent.length > 6) recent.shift();
      return it;
    }
  }
  return pctOf();
}
