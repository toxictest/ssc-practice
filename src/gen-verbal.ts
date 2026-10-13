/* =============================================================
   REASONING · ENGLISH · GENERAL AWARENESS generators (bilingual)
   ============================================================= */
import { B, N, NL, letters, mk, pick, posOf, ri, shuffle } from "./kit";
import type { Bi, Gen } from "./kit";

/* ============================ REASONING ============================ */
const rSeries: Gen = (lvl) => {
  const fam = ri(0, 4);
  let terms: number[] = [];
  let rule: Bi = N("");
  let hack: Bi = N("");
  if (fam === 0) {
    const a = ri(2, 12 + lvl * 4);
    const d = ri(2, 9 + lvl * 3);
    terms = [0, 1, 2, 3, 4, 5].map((i) => a + i * d);
    rule = B(
      `Constant difference: every term rises by ${d} (AP with first term ${a}). Next = ${terms[4]} + ${d} = ${terms[5]}.`,
      `नियमित अंतर: हर पद ${d} से बढ़ रहा है (पहला पद ${a})। अगला = ${terms[4]} + ${d} = ${terms[5]}।`
    );
    hack = B(
      `Read the first differences only. If all are ${d}, answer = last term + ${d} = ${terms[5]}.`,
      `सिर्फ़ पहले अंतर देखिए। सब ${d} के हैं तो उत्तर = अंतिम पद + ${d} = ${terms[5]}।`
    );
  } else if (fam === 1) {
    const a = ri(2, 6);
    const r = ri(2, 4);
    const c = ri(1, 6);
    terms = [a];
    for (let i = 0; i < 5; i++) terms.push(terms[terms.length - 1] * r + c);
    rule = B(
      `Multiply by ${r} and add ${c} each time. Next = ${terms[4]} x ${r} + ${c} = ${terms[5]}.`,
      `हर बार ${r} से गुणा कर ${c} जोड़िए। अगला = ${terms[4]} x ${r} + ${c} = ${terms[5]}।`
    );
    hack = B(
      `Test "x ${r} + ${c}" on the first step only: ${terms[0]} -> ${terms[1]}. Two hits means the rule is right.`,
      `सिर्फ़ पहले चरण पर "x ${r} + ${c}" आज़माइए: ${terms[0]} -> ${terms[1]}। दो बार सही तो नियम सही।`
    );
  } else if (fam === 2) {
    const c = ri(1, 8);
    terms = [1, 2, 3, 4, 5, 6].map((i) => i * i + c);
    rule = B(`Perfect squares plus ${c}: n² + ${c}. Next = ${terms[5]}.`, `पूर्ण वर्ग + ${c}: n² + ${c}। अगला = ${terms[5]}।`);
    hack = B(
      `Subtract ${c} from every term: ${terms.slice(0, 5).map((t) => t - c).join(", ")} — the squares appear instantly.`,
      `हर पद से ${c} घटाइए: ${terms.slice(0, 5).map((t) => t - c).join(", ")} — वर्ग तुरंत दिखेंगे। उत्तर ${terms[5]}।`
    );
  } else if (fam === 3) {
    const c = ri(1, 6);
    terms = [1, 2, 3, 4, 5, 6].map((i) => i * i * i + c);
    rule = B(`Perfect cubes plus ${c}: n³ + ${c}. Next = ${terms[5]}.`, `पूर्ण घन + ${c}: n³ + ${c}। अगला = ${terms[5]}।`);
    hack = B(
      `Judge by magnitude: values near 100-130 are a cube signature (8, 27, 64, 125). Subtract ${c}.`,
      `आकार से पहचानिए: 100-130 के आसपास के पद घन की पहचान हैं (8, 27, 64, 125)। ${c} घटाइए।`
    );
  } else {
    const a = ri(2, 6);
    const d1 = ri(2, 6);
    const step = ri(2, 5);
    terms = [a];
    let d = d1;
    const gaps: number[] = [];
    for (let i = 0; i < 5; i++) {
      gaps.push(d);
      terms.push(terms[terms.length - 1] + d);
      d += step;
    }
    rule = B(
      `The DIFFERENCES form an AP: ${gaps.join(", ")}, rising by ${step}. Next gap = ${gaps[4]}, so next term = ${terms[5]}.`,
      `अंतरों की श्रृंखला AP है: ${gaps.join(", ")}, हर बार ${step} की वृद्धि। अगला अंतर ${gaps[4]}, अतः अगला पद = ${terms[5]}।`
    );
    hack = B(
      `Write first differences, then second differences. A constant second difference of ${step} gives the next gap immediately.`,
      `पहले अंतर लिखिए, फिर दूसरे अंतर। दूसरा अंतर स्थिर (${step}) है तो अगला अंतर तुरंत मिलेगा। उत्तर ${terms[5]}।`
    );
  }
  const answer = terms[5];
  return mk(
    "REASONING",
    B("Reasoning · Number Series", "तर्क · संख्या श्रृंखला"),
    B("Next / missing term", "अगला / लुप्त पद"),
    B(
      `Find the next term in the series:\n\n${terms.slice(0, 5).join(",  ")},  ?`,
      `श्रृंखला का अगला पद ज्ञात कीजिए:\n\n${terms.slice(0, 5).join(",  ")},  ?`
    ),
    N(answer),
    NL([answer + 2, answer - 2, answer + 6, answer - 5]),
    rule,
    hack,
    B(
      `Trap: matching the TERMS instead of the DIFFERENCES, and picking the option that merely repeats the last visible increment.`,
      `सावधानी: पदों को नहीं, अंतरों को देखिए। जो विकल्प सिर्फ़ अंतिम अंतर को आगे बढ़ाता है, वही जाल है।`
    )
  );
};

const rLetterSeries: Gen = () => {
  const start = ri(0, 12);
  const step = ri(1, 4);
  const grow = ri(1, 3);
  const idx: number[] = [start];
  let s = step;
  for (let i = 0; i < 4; i++) {
    idx.push(idx[idx.length - 1] + s);
    s += grow;
  }
  const next = idx[4] + s;
  const seq = idx.map((i) => letters[i % 26]).join(", ");
  return mk(
    "REASONING",
    B("Reasoning · Alphabet Series", "तर्क · वर्णमाला श्रृंखला"),
    B("Letter series, growing gaps", "बढ़ते अंतर वाली अक्षर श्रृंखला"),
    B(`Find the next term in the series:\n\n${seq},  ?`, `श्रृंखला का अगला पद ज्ञात कीजिए:\n\n${seq},  ?`),
    N(letters[next % 26]),
    NL([
      letters[(next + 3) % 26],
      letters[(next + 6) % 26],
      letters[(next - 3 + 26) % 26],
      letters[(next + 10) % 26],
    ]),
    B(
      `Write A = 1 ... Z = 26. Positions ${idx.map((i) => i + 1).join(", ")}; gaps ${idx.slice(1).map((v, i) => v - idx[i]).join(", ")}, rising by ${grow}. Next gap ${s} gives position ${next + 1} = ${letters[next % 26]}.`,
      `A = 1 ... Z = 26 लिखिए। स्थान ${idx.map((i) => i + 1).join(", ")}; अंतर ${idx.slice(1).map((v, i) => v - idx[i]).join(", ")}, हर बार ${grow} की वृद्धि। अगला अंतर ${s} से स्थान ${next + 1} = ${letters[next % 26]}।`
    ),
    B(
      `Decode the first two letters only: ${letters[idx[0]]}(${idx[0] + 1}) -> ${letters[idx[1]]}(${idx[1] + 1}) is +${idx[1] - idx[0]}. Extend the gap chain in one line.`,
      `सिर्फ़ पहले दो अक्षरों से कोड निकालिए: ${letters[idx[0]]}(${idx[0] + 1}) -> ${letters[idx[1]]}(${idx[1] + 1}) अर्थात +${idx[1] - idx[0]}। अंतर श्रृंखला एक पंक्ति में बढ़ाइए।`
    ),
    B(
      `Trap: forgetting the Z -> A wrap. Reduce every position modulo 26 before converting.`,
      `सावधानी: Z के बाद A आता है। स्थान को 26 से भाग देकर शेषफल लीजिए।`
    )
  );
};

const rCoding: Gen = () => {
  const words = ["MONKEY", "PENCIL", "GARDEN", "MARKET", "SILVER", "CANDLE", "MIRROR", "FOREST", "ORANGE", "PURPLE"];
  const w = pick(words);
  const target = pick(words.filter((x) => x !== w));
  const k = ri(1, 6);
  const shift = (word: string) => word.split("").map((c) => letters[(posOf(c) + k) % 26]).join("");
  return mk(
    "REASONING",
    B("Reasoning · Coding-Decoding", "तर्क · कूट भाषा"),
    B("Letter shift coding", "अक्षर विस्थापन कूट"),
    B(
      `In a certain code language '${w}' is written as '${shift(w)}'. How will '${target}' be written in the same code?`,
      `किसी कूट भाषा में '${w}' को '${shift(w)}' लिखा जाता है। उसी कूट में '${target}' को कैसे लिखा जाएगा?`
    ),
    N(shift(target)),
    NL([
      shift(target.split("").reverse().join("")),
      target.split("").map((c) => letters[(posOf(c) + k + 2) % 26]).join(""),
      target.split("").map((c) => letters[(posOf(c) + k + 4) % 26]).join(""),
      target.split("").map((c) => letters[(posOf(c) - k + 26) % 26]).join(""),
    ]),
    B(
      `First letters: ${w[0]} -> ${shift(w)[0]} is +${k}. Apply the same +${k} to every letter: ${shift(target)}.`,
      `पहले अक्षर: ${w[0]} -> ${shift(w)[0]} अर्थात +${k}। यही +${k} हर अक्षर पर लगाने पर ${shift(target)}।`
    ),
    B(
      `Decode from one letter pair only: ${w[0]} -> ${shift(w)[0]} means +${k}. Check a second letter only if two options survive.`,
      `सिर्फ़ एक अक्षर युग्म से कोड निकालिए: +${k}। दो विकल्प बचें तभी दूसरा अक्षर जाँचिए।`
    ),
    B(
      `Trap: shifting backwards (-${k}) gives ${target.split("").map((c) => letters[(posOf(c) - k + 26) % 26]).join("")}, deliberately placed among the options.`,
      `सावधानी: उल्टी दिशा (-${k}) से ${target.split("").map((c) => letters[(posOf(c) - k + 26) % 26]).join("")} आता है, जो जान-बूझकर रखा गया है।`
    )
  );
};

const rAnalogy: Gen = () => {
  const fns: { f: (n: number) => number; rule: Bi; hack: Bi }[] = [
    { f: (n) => n * n + 1, rule: B("n : n² + 1", "n : n² + 1"), hack: B("Square and add one.", "वर्ग करके 1 जोड़िए।") },
    { f: (n) => n * n * n, rule: B("n : n³", "n : n³"), hack: B("Spot cubes by size: 8, 27, 64, 125, 216.", "आकार से घन पहचानिए: 8, 27, 64, 125, 216।") },
    { f: (n) => 2 * n + 3, rule: B("n : 2n + 3", "n : 2n + 3"), hack: B("Double, then add three.", "दोगुना करके तीन जोड़िए।") },
    { f: (n) => n * (n + 1), rule: B("n : n(n + 1)", "n : n(n + 1)"), hack: B("Number times its successor: 6 = 2x3, 12 = 3x4.", "संख्या × अगली संख्या: 6 = 2x3, 12 = 3x4।") },
    { f: (n) => n * n - 1, rule: B("n : n² − 1", "n : n² − 1"), hack: B("Square minus one; or (n−1)(n+1).", "वर्ग में से 1 घटाइए; या (n−1)(n+1)।") },
  ];
  const { f, rule, hack } = pick(fns);
  const a = ri(2, 8);
  const c = ri(2, 9);
  const d = f(c);
  return mk(
    "REASONING",
    B("Reasoning · Analogy", "तर्क · समानता"),
    B("Number analogy", "संख्या समानता"),
    B(`${a} : ${f(a)} :: ${c} : ?`, `${a} : ${f(a)} :: ${c} : ?`),
    N(d),
    NL([f(c) + 2, f(a) + 1, c * 2, f(c) - 3]),
    B(
      `The relation is ${rule.en}. Check on the first pair: f(${a}) = ${f(a)}. So f(${c}) = ${d}.`,
      `संबंध ${rule.hi} है। पहले युग्म पर जाँचिए: f(${a}) = ${f(a)}। अतः f(${c}) = ${d}।`
    ),
    B(hack.en + ` Answer = ${d}.`, hack.hi + ` उत्तर = ${d}।`),
    B(
      `Trap: matching the second pair to the first pair's NUMBERS instead of to the relation.`,
      `सावधानी: दूसरे युग्म को पहले युग्म की संख्याओं से नहीं, संबंध से जोड़िए।`
    )
  );
};

const rOddOne: Gen = () => {
  const mode = ri(0, 2);
  if (mode === 0) {
    const ps = shuffle([11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]).slice(0, 3);
    const composite = pick([21, 27, 33, 39, 51, 57, 63, 69, 77, 87, 91, 93]);
    const opts = shuffle([...ps, composite]);
    let factor = "";
    for (let i = 2; i <= composite / 2; i++) if (composite % i === 0 && !factor) factor = `${i} x ${composite / i}`;
    return mk(
      "REASONING",
      B("Reasoning · Classification", "तर्क · वर्गीकरण"),
      B("Odd one out — primes", "बेमेल — अभाज्य संख्या"),
      B(
        `Three of the following four numbers are alike in a certain way and one is different. Pick the odd one out.`,
        `निम्नलिखित चार में से तीन संख्याएँ किसी दृष्टि से समान हैं और एक भिन्न है। बेमेल ज्ञात कीजिए।`
      ),
      N(composite),
      opts.filter((o) => o !== composite).map((o) => N(o)),
      B(
        `${ps.join(", ")} are all PRIME; ${composite} = ${factor} is composite. So ${composite} is the odd one.`,
        `${ps.join(", ")} सभी अभाज्य हैं; ${composite} = ${factor} भाज्य है। अतः ${composite} बेमेल है।`
      ),
      B(
        `Do not factor every number. Test 2, 3, 5, 7 only — ${composite} fails instantly (digit sum ${String(composite).split("").reduce((s, d) => s + Number(d), 0)} is a multiple of 3).`,
        `हर संख्या न तोड़िए। सिर्फ़ 2, 3, 5, 7 से जाँचिए — ${composite} तुरंत असफल (अंक-योग ${String(composite).split("").reduce((s, d) => s + Number(d), 0)} तीन का गुणज)।`
      ),
      B(
        `Trap: picking the option that merely looks unusual. The rule must classify all four numbers.`,
        `सावधानी: दिखने में अलग लगने वाली संख्या उत्तर नहीं। नियम चारों पर लागू होना चाहिए।`
      )
    );
  }
  if (mode === 1) {
    const b = ri(3, 9);
    const ns = [1, 2, 4].map((i) => Math.pow(b, i));
    const other = pick([Math.pow(b, 3) + 1, Math.pow(b, 2) - 1, Math.pow(b, 3) - 1, Math.pow(b, 3) + b]);
    const opts = shuffle([...ns.map(String), String(other)]);
    return mk(
      "REASONING",
      B("Reasoning · Classification", "तर्क · वर्गीकरण"),
      B("Odd one out — powers", "बेमेल — घात"),
      B(
        `Three of the following four numbers are alike in a certain way and one is different. Pick the odd one out.`,
        `निम्नलिखित चार में से तीन संख्याएँ किसी दृष्टि से समान हैं और एक भिन्न है। बेमेल ज्ञात कीजिए।`
      ),
      N(other),
      opts.filter((o) => o !== String(other)).map((o) => N(o)),
      B(
        `${ns.join(", ")} are exact powers of ${b} (${b}, ${b * b}, ${b * b * b}); ${other} is not.`,
        `${ns.join(", ")} ${b} की सटीक घातें हैं (${b}, ${b * b}, ${b * b * b}); ${other} नहीं है।`
      ),
      B(
        `Take roots mentally. Numbers landing on ${b}, ${b * b}, ${b * b * b} form one family — the rest is the answer.`,
        `मन में घनमूल/वर्गमूल लीजिए। ${b}, ${b * b}, ${b * b * b} वाली संख्याएँ एक परिवार हैं — शेष उत्तर है।`
      ),
      B(
        `Trap: choosing the largest number. Classification is about PROPERTIES, never size.`,
        `सावधानी: सबसे बड़ी संख्या चुनना गलत। वर्गीकरण गुणधर्म का विषय है।`
      )
    );
  }
  const k = ri(3, 7);
  const ns = [1, 2, 3, 4].map((i) => k * i);
  const other = k * 4 + pick([1, 2, k - 1 > 1 ? k - 1 : 3]);
  const opts = shuffle([...ns.map(String), String(other)]);
  return mk(
    "REASONING",
    B("Reasoning · Classification", "तर्क · वर्गीकरण"),
    B("Odd one out — multiples", "बेमेल — गुणज"),
    B(
      `Three of the following four numbers are alike in a certain way and one is different. Pick the odd one out.`,
      `निम्नलिखित चार में से तीन संख्याएँ किसी दृष्टि से समान हैं और एक भिन्न है। बेमेल ज्ञात कीजिए।`
    ),
    N(other),
    opts.filter((o) => o !== String(other)).map((o) => N(o)),
    B(
      `${ns.join(", ")} are all multiples of ${k}; ${other} is not divisible by ${k}.`,
      `${ns.join(", ")} सभी ${k} के गुणज हैं; ${other}, ${k} से विभाज्य नहीं है।`
    ),
    B(`Divide each by ${k}; three of the four divide instantly.`, `हर संख्या को ${k} से भाग दीजिए; तीन तुरंत विभाज्य होंगी।`),
    B(
      `Trap: a WEAK relation covering only two numbers. A valid rule separates three from one.`,
      `सावधानी: कमज़ोर संबंध (सिर्फ़ दो पर लागू) नियम नहीं। सही नियम तीन और एक को अलग करता है।`
    )
  );
};

const rSyllogism: Gen = () => {
  const nouns: Bi[] = shuffle([
    B("Pens", "पेन"), B("Books", "पुस्तकें"), B("Chairs", "कुर्सियाँ"), B("Cups", "कप"),
    B("Bags", "बैग"), B("Coins", "सिक्के"), B("Flowers", "फूल"), B("Trees", "पेड़"),
    B("Cars", "कारें"), B("Lamps", "दीपक"), B("Boxes", "डिब्बे"), B("Cats", "बिल्लियाँ"),
    B("Roses", "गुलाब"), B("Tables", "मेज़ें"),
  ]);
  const A = nouns[0];
  const Bn = nouns[1];
  const C = nouns[2];
  const labels: Bi[] = [
    B("Only conclusion I follows", "केवल निष्कर्ष I अनुसरण करता है"),
    B("Only conclusion II follows", "केवल निष्कर्ष II अनुसरण करता है"),
    B("Both I and II follow", "दोनों I और II अनुसरण करते हैं"),
    B("Neither I nor II follows", "न तो I और न ही II अनुसरण करता है"),
  ];
  const all = (x: Bi, y: Bi) => B(`All ${x.en} are ${y.en}.`, `सभी ${x.hi}, ${y.hi} हैं।`);
  const some = (x: Bi, y: Bi) => B(`Some ${x.en} are ${y.en}.`, `कुछ ${x.hi}, ${y.hi} हैं।`);
  const no = (x: Bi, y: Bi) => B(`No ${x.en} is ${y.en}.`, `कोई ${x.hi}, ${y.hi} नहीं है।`);
  const someNot = (x: Bi, y: Bi) => B(`Some ${x.en} are not ${y.en}.`, `कुछ ${x.hi}, ${y.hi} नहीं हैं।`);

  const patterns: { s: [Bi, Bi]; c: [Bi, Bi]; ans: number }[] = [
    { s: [all(A, Bn), some(Bn, C)], c: [some(A, C), some(Bn, A)], ans: 1 },
    { s: [all(A, Bn), all(Bn, C)], c: [all(A, C), some(C, A)], ans: 2 },
    { s: [some(A, Bn), all(Bn, C)], c: [some(A, C), no(A, C)], ans: 0 },
    { s: [no(A, Bn), all(Bn, C)], c: [no(A, C), someNot(C, A)], ans: 1 },
    { s: [all(A, Bn), no(Bn, C)], c: [no(A, C), someNot(A, C)], ans: 2 },
    { s: [some(A, Bn), some(Bn, C)], c: [some(A, C), some(C, A)], ans: 3 },
    { s: [all(A, Bn), some(A, C)], c: [some(Bn, C), all(C, A)], ans: 0 },
    { s: [no(A, Bn), some(Bn, C)], c: [some(A, C), someNot(C, A)], ans: 1 },
  ];
  const p = pick(patterns);
  return mk(
    "REASONING",
    B("Reasoning · Syllogism", "तर्क · न्यायवाक्य"),
    B("Statements and conclusions", "कथन एवं निष्कर्ष"),
    B(
      `Taking the statements to be true even if they vary from commonly known facts, decide which conclusion logically follows.\n\nSTATEMENTS:\n${p.s[0].en}\n${p.s[1].en}\n\nCONCLUSIONS:\nI. ${p.c[0].en}\nII. ${p.c[1].en}`,
      `कथनों को सत्य मानते हुए (भले ही वे सामान्य तथ्यों से भिन्न हों) तय कीजिए कि कौन-सा निष्कर्ष तार्किक रूप से अनुसरण करता है।\n\nकथन:\n${p.s[0].hi}\n${p.s[1].hi}\n\nनिष्कर्ष:\nI. ${p.c[0].hi}\nII. ${p.c[1].hi}`
    ),
    labels[p.ans],
    shuffle([0, 1, 2, 3].filter((i) => i !== p.ans).map((i) => labels[i])),
    B(
      `Draw the minimum Venn diagram for "${p.s[0].en} ${p.s[1].en}" — the surviving conclusion is "${labels[p.ans].en}".`,
      `"${p.s[0].hi} ${p.s[1].hi}" का न्यूनतम वेन आरेख बनाइए — बचने वाला निष्कर्ष "${labels[p.ans].hi}" है।`
    ),
    B(
      `Use the 100/50 rule: "All" = 100% certain, "Some" = 50% possible. One counter-diagram kills a conclusion instantly.`,
      `100/50 नियम: "सभी" = 100% निश्चित, "कुछ" = 50% संभव। एक विपरीत आरेख से निष्कर्ष तुरंत असफल।`
    ),
    B(
      `Trap: "Some B are A" follows from "All A are B", but "Some A are C" never follows from "Some A are B".`,
      `सावधानी: "सभी A, B हैं" से "कुछ B, A हैं" सही है, पर "कुछ A, B हैं" से "कुछ A, C हैं" कभी नहीं।`
    )
  );
};

const rBlood: Gen = () => {
  const names = shuffle(["Asha", "Ravi", "Meera", "Kabir", "Neha", "Arjun", "Sana", "Vikram", "Divya", "Rohan"]);
  const n1 = names[0];
  const n2 = names[1];
  const n3 = names[2];
  const patterns: { q: Bi; a: Bi; w: Bi[]; m: Bi; h: Bi; t: Bi }[] = [
    {
      q: B(
        `${n1} is the brother of ${n2}. ${n2} is the daughter of ${n3}. How is ${n1} related to ${n3}?`,
        `${n1}, ${n2} का भाई है। ${n2}, ${n3} की पुत्री है। ${n1}, ${n3} से कैसे संबंधित है?`
      ),
      a: B("Son", "पुत्र"),
      w: [B("Brother", "भाई"), B("Father", "पिता"), B("Nephew", "भतीजा")],
      m: B(
        `${n2} is ${n3}'s daughter and ${n1} is her brother, so ${n1} is ${n3}'s SON.`,
        `${n2}, ${n3} की पुत्री है और ${n1} उसका भाई है, अतः ${n1}, ${n3} का पुत्र है।`
      ),
      h: B("Draw a two-generation tree with gender marks as you read.", "पढ़ते समय दो पीढ़ी का वृक्ष बनाइए और लिंग चिह्नित कीजिए।"),
      t: B("'Brother of X' fixes the subject's gender, not X's.", "'X का भाई' वाक्य के कर्ता का लिंग तय करता है, X का नहीं।"),
    },
    {
      q: B(
        `${n1} is the mother of ${n2}. ${n2} is the sister of ${n3}. ${n3} is the father of a son. How is ${n1} related to that son?`,
        `${n1}, ${n2} की माता है। ${n2}, ${n3} की बहन है। ${n3} एक पुत्र का पिता है। ${n1} उस पुत्र से कैसे संबंधित है?`
      ),
      a: B("Grandmother", "दादी/नानी"),
      w: [B("Mother", "माता"), B("Aunt", "चाची"), B("Sister", "बहन")],
      m: B(
        `${n2} and ${n3} are siblings, children of ${n1}. ${n3}'s son is ${n1}'s grandson, so ${n1} is his GRANDMOTHER.`,
        `${n2} और ${n3} भाई-बहन हैं, दोनों ${n1} की संतानें। ${n3} का पुत्र ${n1} का पौत्र है, अतः ${n1} उसकी दादी/नानी है।`
      ),
      h: B("Mark only the link that matters: parent -> child -> grandchild.", "सिर्फ़ आवश्यक कड़ी बनाइए: माता-पिता -> संतान -> पौत्र।"),
      t: B("Stopping at 'mother' because the statement calls her a mother.", "कथन में 'माता' शब्द देखकर उत्तर 'माता' मत रखिए।"),
    },
    {
      q: B(
        `Pointing to a photograph, ${n1} said, "She is the daughter of my grandfather's only son." How is the girl related to ${n1}?`,
        `एक फ़ोटो की ओर इशारा करते हुए ${n1} ने कहा, "वह मेरे दादा के इकलौते पुत्र की पुत्री है।" फ़ोटो की लड़की ${n1} से कैसे संबंधित है?`
      ),
      a: B("Sister", "बहन"),
      w: [B("Cousin", "चचेरी बहन"), B("Niece", "भतीजी"), B("Aunt", "चाची")],
      m: B("Grandfather's only son = my father. His daughter = my SISTER.", "दादा का इकलौता पुत्र = मेरे पिता। उनकी पुत्री = मेरी बहन।"),
      h: B("Substitute literally: grandfather's only son -> father -> father's daughter -> sister.", "शाब्दिक प्रतिस्थापन: दादा का इकलौता पुत्र -> पिता -> पिता की पुत्री -> बहन।"),
      t: B("'Only son' collapses the whole sibling tree — no uncle, so 'cousin' is impossible.", "'इकलौता पुत्र' पूरी वंशावली समेट देता है — कोई चाचा नहीं, इसलिए 'चचेरी बहन' असंभव है।"),
    },
    {
      q: B(
        `${n1} is the brother of ${n2}'s mother. How is ${n1} related to ${n2}?`,
        `${n1}, ${n2} की माता का भाई है। ${n1}, ${n2} से कैसे संबंधित है?`
      ),
      a: B("Maternal uncle", "मामा"),
      w: [B("Brother", "भाई"), B("Father", "पिता"), B("Cousin", "चचेरा भाई")],
      m: B(`${n2}'s mother's brother is the maternal UNCLE (mama).`, `${n2} की माता का भाई मामा होता है।`),
      h: B("Convert the phrase straight to the relation — mother's brother = mama.", "वाक्यांश सीधे संबंध में बदलिए — माता का भाई = मामा।"),
      t: B("Paternal uncle needs the FATHER's brother.", "चाचा के लिए पिता का भाई चाहिए; यहाँ माता का भाई है।"),
    },
    {
      q: B(
        `${n1} is the father of ${n2}. ${n2} is the daughter of ${n3}. How is ${n1} related to ${n3}?`,
        `${n1}, ${n2} का पिता है। ${n2}, ${n3} की पुत्री है। ${n1}, ${n3} से कैसे संबंधित है?`
      ),
      a: B("Husband", "पति"),
      w: [B("Wife", "पत्नी"), B("Brother", "भाई"), B("Father", "पिता")],
      m: B(
        `${n2} is the child of both ${n1} and ${n3}; since ${n1} is the father, ${n3} is the mother — so ${n1} is her HUSBAND.`,
        `${n2} दोनों की संतान है; ${n1} पिता है, अतः ${n3} माता है — इसलिए ${n1} उसका पति है।`
      ),
      h: B("Both parents share the child; once one gender is fixed, the relation falls out.", "दोनों अभिभावकों की संतान एक है; एक लिंग तय होते ही संबंध मिल जाता है।"),
      t: B("Answering 'father' — the question asks the relation to ${n3}, not to ${n2}.".replace("${n3}", n3).replace("${n2}", n2), `'पिता' उत्तर नहीं — प्रश्न ${n3} से संबंध पूछ रहा है, ${n2} से नहीं।`),
    },
  ];
  const p = pick(patterns);
  return mk(
    "REASONING",
    B("Reasoning · Blood Relation", "तर्क · रक्त संबंध"),
    B("Relational decoding", "संबंध पहचान"),
    p.q, p.a, p.w, p.m, p.h, p.t
  );
};

const rDirection: Gen = () => {
  const triples: [number, number, number][] = [
    [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20],
  ];
  const t = pick(triples);
  const dx = t[0];
  const dy = t[1];
  const hyp = t[2];
  const ns = pick(["North", "South"]);
  const nsHi = ns === "North" ? "उत्तर" : "दक्षिण";
  const ew = ns === "North" ? "East" : "West";
  const ewHi = ns === "North" ? "पूर्व" : "पश्चिम";
  return mk(
    "REASONING",
    B("Reasoning · Direction Sense", "तर्क · दिशा ज्ञान"),
    B("Net displacement", "कुल विस्थापन"),
    B(
      `A man walks ${dy} km towards ${ns}, then turns right and walks ${dx} km, then turns right and walks ${Math.round(dy / 2)} km. How far is he from the starting point?`,
      `एक व्यक्ति ${nsHi} दिशा में ${dy} किमी चलता है, फिर दाएँ मुड़कर ${dx} किमी, फिर दाएँ मुड़कर ${Math.round(dy / 2)} किमी चलता है। वह प्रारंभिक बिंदु से कितनी दूर है?`
    ),
    N(`${hyp} km`),
    NL([`${dx + dy} km`, `${dx} km`, `${dy} km`, `${hyp + 2} km`]),
    B(
      `Net: ${dx} km ${ew} and ${dy - Math.round(dy / 2)} km ${ns}. Displacement = sqrt(${dx * dx} + ${(dy - Math.round(dy / 2)) * (dy - Math.round(dy / 2))}) = ${hyp} km.`,
      `शुद्ध विस्थापन: ${dx} किमी ${ewHi} और ${dy - Math.round(dy / 2)} किमी ${nsHi}। विस्थापन = √(${dx * dx} + ${(dy - Math.round(dy / 2)) * (dy - Math.round(dy / 2))}) = ${hyp} किमी।`
    ),
    B(
      `Never trace the whole path. Cancel opposite legs first — scan the options for a Pythagorean triple (3-4-5, 6-8-10, 5-12-13).`,
      `पूरा रास्ता न बनाइए। विपरीत चालें रद्द कीजिए — विकल्पों में पाइथागोरस त्रिक (3-4-5, 6-8-10, 5-12-13) देखिए।`
    ),
    B(
      `Trap: adding the distances walked (${dx + dy} km) instead of the straight-line displacement.`,
      `सावधानी: चली गई दूरी (${dx + dy} किमी) नहीं, सीधी रेखा में विस्थापन पूछा गया है।`
    )
  );
};

const rRanking: Gen = (lvl) => {
  const total = ri(25, 60 + lvl * 20);
  const x = ri(3, Math.floor(total / 2));
  const who = pick(["Amit", "Priya", "Suresh", "Anita", "Rahul"]);
  return mk(
    "REASONING",
    B("Reasoning · Ranking & Order", "तर्क · क्रम एवं रैंक"),
    B("Rank from the opposite end", "विपरीत छोर से रैंक"),
    B(
      `In a class of ${total} students, ${who} ranks ${x}th from the top. What is the rank from the bottom?`,
      `${total} विद्यार्थियों की कक्षा में ${who} की ऊपर से रैंक ${x} है। नीचे से उसकी रैंक क्या होगी?`
    ),
    N(`${total - x + 1}th`),
    NL([`${total - x}th`, `${x + 1}th`, `${total - x + 2}th`, `${x}th`]),
    B(
      `Rank from bottom = total - rank from top + 1 = ${total} - ${x} + 1 = ${total - x + 1}.`,
      `नीचे से रैंक = कुल - ऊपर से रैंक + 1 = ${total} - ${x} + 1 = ${total - x + 1}।`
    ),
    B(`Instant: ${total} + 1 - ${x} = ${total - x + 1}. One addition.`, `तुरंत: ${total} + 1 - ${x} = ${total - x + 1}। एक जोड़ में उत्तर।`),
    B(
      `Trap: forgetting the "+ 1" and marking ${total - x}th — the person is counted in both counts.`,
      `सावधानी: "+ 1" भूल जाने पर ${total - x}th आता है — व्यक्ति दोनों गणनाओं में आता है, इसलिए सुधार आवश्यक है।`
    )
  );
};

const rMirrorClock: Gen = () => {
  const h = ri(1, 12);
  const m = pick([0, 10, 15, 20, 30, 40, 45, 50]);
  const total = (11 * 60 - (h * 60 + m) + 1440) % 1440;
  const ah = Math.floor(total / 60) === 0 ? 12 : Math.floor(total / 60);
  const am = total % 60;
  const shown = `${h}:${m.toString().padStart(2, "0")}`;
  const wrong = (() => {
    const t = (12 * 60 - (h * 60 + m) + 1440) % 1440;
    return `${Math.floor(t / 60) === 0 ? 12 : Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  })();
  return mk(
    "REASONING",
    B("Reasoning · Clock & Mirror", "तर्क · घड़ी एवं दर्पण"),
    B("Time in a mirror", "दर्पण में दिखा समय"),
    B(
      `A clock seen in a mirror shows the time as ${shown}. What is the actual time?`,
      `दर्पण में देखी गई घड़ी ${shown} समय दिखा रही है। वास्तविक समय क्या है?`
    ),
    N(`${ah}:${am.toString().padStart(2, "0")}`),
    NL([
      `${h}:${String((60 - m) % 60).padStart(2, "0")}`,
      `${am.toString().padStart(2, "0")}:${ah}`,
      shown,
      `${ah + 1 > 12 ? 1 : ah + 1}:${am.toString().padStart(2, "0")}`,
    ]),
    B(
      `Mirror time = 11:60 - shown time. 11:60 - ${shown} = ${ah}:${am.toString().padStart(2, "0")}.`,
      `दर्पण का समय = 11:60 - दिखा समय। 11:60 - ${shown} = ${ah}:${am.toString().padStart(2, "0")}।`
    ),
    B(
      `Use 11:60 - h:m: hour = 12 - h (unless h = 12), minute = 60 - m. Never visualise the reflection.`,
      `11:60 - h:m प्रयोग कीजिए: घंटे = 12 - h (यदि h = 12 न हो), मिनट = 60 - m। प्रतिबिंब कल्पना मत कीजिए।`
    ),
    B(
      `Trap: doing 12:00 - ${shown} = ${wrong}. The correct base is 11:60.`,
      `सावधानी: 12:00 - ${shown} = ${wrong} करना गलत है। सही आधार 11:60 है।`
    )
  );
};

const rDictionary: Gen = () => {
  const pool = [
    "zebra", "yacht", "xenon", "writer", "window", "velvet", "urban", "tunnel", "silver", "rocket",
    "quartz", "piano", "orange", "needle", "marble", "liquid", "kernel", "jungle", "irony", "hollow",
  ];
  const words = shuffle(pool).slice(0, 4).map((w) => w[0].toUpperCase() + w.slice(1));
  const sorted = [...words].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const askFirst = ri(0, 1) === 0;
  return mk(
    "REASONING",
    B("Reasoning · Dictionary Order", "तर्क · शब्दकोश क्रम"),
    B("Alphabetical arrangement", "वर्णानुक्रम व्यवस्था"),
    B(
      `If the following words are arranged in dictionary order, which word will come ${askFirst ? "FIRST" : "LAST"}?\n\n${shuffle(words).join(",  ")}`,
      `यदि निम्नलिखित शब्दों को शब्दकोश क्रम में रखा जाए, तो कौन-सा शब्द ${askFirst ? "सबसे पहले" : "सबसे अंत में"} आएगा?\n\n${shuffle(words).join(",  ")}`
    ),
    N(askFirst ? sorted[0] : sorted[3]),
    shuffle(words.filter((w) => w !== (askFirst ? sorted[0] : sorted[3]))).map((w) => N(w)),
    B(
      `Dictionary order: ${sorted.join(" -> ")}. So the ${askFirst ? "first" : "last"} word is ${askFirst ? sorted[0] : sorted[3]}.`,
      `शब्दकोश क्रम: ${sorted.join(" -> ")}। अतः ${askFirst ? "पहला" : "अंतिम"} शब्द ${askFirst ? sorted[0] : sorted[3]} है।`
    ),
    B(
      `Compare only the first DIFFERING letter of each pair; build one order chain: ${sorted.join(" < ")}.`,
      `हर युग्म के पहले भिन्न अक्षर की ही तुलना कीजिए; एक क्रम श्रृंखला बनाइए: ${sorted.join(" < ")}।`
    ),
    B(
      `Trap: comparing shared first letters by word length. Length is irrelevant in dictionary order.`,
      `सावधानी: समान पहले अक्षर वाले शब्दों की लंबाई से तुलना न कीजिए — शब्दकोश क्रम में लंबाई मायने नहीं रखती।`
    )
  );
};

const rOperator: Gen = () => {
  const a = ri(2, 12);
  const b = ri(2, 12);
  const c = ri(2, 9);
  const val = a + b * c;
  return mk(
    "REASONING",
    B("Reasoning · Mathematical Operations", "तर्क · गणितीय संक्रियाएँ"),
    B("Interchange of signs / operator replacement", "चिह्न परिवर्तन / संक्रिया प्रतिस्थापन"),
    B(
      `If '+' means 'x', 'x' means '-', '-' means '/' and '/' means '+', then the value of ${a} + ${b} x ${c} is:`,
      `यदि '+' का अर्थ 'x', 'x' का अर्थ '-', '-' का अर्थ '/' और '/' का अर्थ '+' हो, तो ${a} + ${b} x ${c} का मान क्या होगा?`
    ),
    N(val),
    NL([a * b - c, a + b - c, val + 5, val - 5]),
    B(
      `Replace the signs first: ${a} + ${b} x ${c} becomes ${a} x ${b} - ${c}. Then ${a} x ${b} = ${a * b}, and ${a * b} - ${c} = ${val}.`,
      `पहले चिह्न बदलिए: ${a} + ${b} x ${c} -> ${a} x ${b} - ${c}। फिर ${a} x ${b} = ${a * b}, और ${a * b} - ${c} = ${val}।`
    ),
    B(
      `Write the NEW symbol above every old symbol first, then apply BODMAS. Sign-interchange items are pure substitution — zero calculation.`,
      `हर पुराने चिह्न के ऊपर नया चिह्न लिखिए, फिर BODMAS लगाइए। यह विशुद्ध प्रतिस्थापन है — गणना न्यूनतम।`
    ),
    B(
      `Trap: computing with the ORIGINAL signs. The whole mark is in the substitution step.`,
      `सावधानी: मूल चिह्नों से गणना कर लेना। पूरा अंक प्रतिस्थापन चरण में है।`
    )
  );
};

export const reasoningGens: Gen[] = [
  rSeries, rLetterSeries, rCoding, rAnalogy, rOddOne, rSyllogism,
  rBlood, rDirection, rRanking, rMirrorClock, rDictionary, rOperator,
];

/* ============================== ENGLISH ============================== */
const SYN: [string, string, string[]][] = [
  ["ABANDON", "forsake", ["cherish", "retain", "uphold"]],
  ["CANDID", "frank", ["deceitful", "reserved", "vague"]],
  ["LUCID", "clear", ["obscure", "murky", "complex"]],
  ["MITIGATE", "lessen", ["aggravate", "prolong", "neglect"]],
  ["PRUDENT", "cautious", ["reckless", "hasty", "naive"]],
  ["VIGILANT", "watchful", ["careless", "drowsy", "heedless"]],
  ["BENEVOLENT", "kind", ["cruel", "stingy", "hostile"]],
  ["ARDUOUS", "difficult", ["effortless", "trivial", "gentle"]],
  ["TRANQUIL", "calm", ["turbulent", "noisy", "restless"]],
  ["ELOQUENT", "fluent", ["inarticulate", "halting", "mute"]],
  ["FRUGAL", "thrifty", ["lavish", "wasteful", "extravagant"]],
  ["GENUINE", "authentic", ["counterfeit", "spurious", "artificial"]],
  ["HAUGHTY", "arrogant", ["humble", "modest", "meek"]],
  ["IMPETUOUS", "rash", ["deliberate", "cautious", "patient"]],
  ["LENIENT", "tolerant", ["strict", "severe", "harsh"]],
  ["MUNDANE", "ordinary", ["extraordinary", "exotic", "rare"]],
  ["NOVICE", "beginner", ["veteran", "expert", "adept"]],
  ["PLACATE", "pacify", ["provoke", "incite", "irritate"]],
  ["SCARCITY", "shortage", ["abundance", "surplus", "plenty"]],
  ["TENACIOUS", "persistent", ["yielding", "feeble", "wavering"]],
];
const ANT: [string, string, string[]][] = [
  ["ABUNDANT", "scarce", ["plentiful", "ample", "copious"]],
  ["BENIGN", "harmful", ["gentle", "kindly", "mild"]],
  ["COMPLIANT", "stubborn", ["obedient", "docile", "yielding"]],
  ["DILIGENT", "lazy", ["industrious", "assiduous", "earnest"]],
  ["EXPAND", "contract", ["enlarge", "extend", "swell"]],
  ["FLOURISH", "decline", ["thrive", "prosper", "bloom"]],
  ["HUMBLE", "arrogant", ["modest", "meek", "submissive"]],
  ["OPAQUE", "transparent", ["cloudy", "murky", "obscure"]],
  ["PROFOUND", "superficial", ["deep", "penetrating", "insightful"]],
  ["RIGID", "flexible", ["stiff", "strict", "inflexible"]],
  ["TIMID", "bold", ["shy", "fearful", "meek"]],
  ["VAGUE", "clear", ["hazy", "ambiguous", "doubtful"]],
];
const IDIOMS: [string, string, string[]][] = [
  ["To beat around the bush", "to avoid coming to the point", ["to search desperately", "to act violently", "to waste resources"]],
  ["A blessing in disguise", "an apparent misfortune that turns out well", ["a hidden treasure", "an unexpected gift", "a secret reward"]],
  ["To let the cat out of the bag", "to reveal a secret", ["to free an animal", "to create confusion", "to escape quietly"]],
  ["To turn a deaf ear", "to deliberately ignore", ["to listen carefully", "to become deaf", "to eavesdrop"]],
  ["To smell a rat", "to suspect something wrong", ["to find a clue", "to detect a foul odour", "to catch a criminal"]],
  ["To make a mountain out of a molehill", "to exaggerate a trivial matter", ["to achieve the impossible", "to climb slowly", "to build something grand"]],
  ["To burn the midnight oil", "to work late into the night", ["to waste fuel", "to celebrate all night", "to destroy evidence"]],
  ["To add fuel to the fire", "to make a bad situation worse", ["to ignite progress", "to start a quarrel", "to provide warmth"]],
  ["To keep one's fingers crossed", "to hope for a good outcome", ["to pray loudly", "to hide one's hands", "to make a promise"]],
  ["A wild goose chase", "a futile pursuit", ["a long journey", "a hunting trip", "a pointless expense"]],
  ["To bite the dust", "to be defeated or die", ["to eat humbly", "to work in fields", "to taste failure early"]],
  ["To pull one's socks up", "to make an effort to improve", ["to dress formally", "to run away quickly", "to prepare for bed"]],
];
const ONEWORD: [string, string, string[]][] = [
  ["One who is indifferent to pleasure or pain", "Stoic", ["Hedonist", "Cynic", "Sceptic"]],
  ["A person who loves and collects books", "Bibliophile", ["Bibliographer", "Philatelist", "Numismatist"]],
  ["A person who speaks many languages", "Polyglot", ["Linguist", "Orator", "Translator"]],
  ["An excessive fear of heights", "Acrophobia", ["Claustrophobia", "Agoraphobia", "Hydrophobia"]],
  ["A speech delivered without preparation", "Extempore", ["Elegy", "Epilogue", "Monologue"]],
  ["One who does not believe in the existence of God", "Atheist", ["Agnostic", "Theist", "Apostate"]],
  ["A word or phrase that reads the same backwards", "Palindrome", ["Homonym", "Synonym", "Acronym"]],
  ["Animals that live both on land and in water", "Amphibians", ["Aquatic", "Reptiles", "Arboreal"]],
  ["One who is newly engaged in an activity", "Novice", ["Veteran", "Adept", "Savant"]],
  ["A place where coins are manufactured", "Mint", ["Foundry", "Kiln", "Tannery"]],
  ["A person who writes the life of another", "Biographer", ["Autobiographer", "Historiographer", "Calligrapher"]],
];
const FILL: [string, string, string[]][] = [
  ["She has been working here ______ 2019.", "since", ["from", "for", "by"]],
  ["He is afraid ______ dogs.", "of", ["from", "with", "to"]],
  ["The book consists ______ ten chapters.", "of", ["in", "with", "from"]],
  ["I congratulated him ______ his success.", "on", ["for", "at", "with"]],
  ["He died ______ cholera.", "of", ["from", "by", "with"]],
  ["She is senior ______ me.", "to", ["than", "from", "over"]],
  ["He is quite good ______ mathematics.", "at", ["in", "on", "with"]],
  ["The train arrived ______ time.", "on", ["at", "in", "by"]],
  ["He insisted ______ paying the bill.", "on", ["for", "at", "in"]],
  ["She is allergic ______ dust.", "to", ["with", "from", "of"]],
  ["He has been absent ______ three days.", "for", ["since", "from", "by"]],
];
const SPELL: [string, string[]][] = [
  ["accommodation", ["acommodation", "accomodation", "acomodation"]],
  ["maintenance", ["maintainance", "maintenence", "maintenece"]],
  ["occurrence", ["occurence", "ocurrence", "occureence"]],
  ["entrepreneur", ["enterpreneur", "entreprenuer", "enterprenuer"]],
  ["liaison", ["liasion", "liaision", "liason"]],
  ["millennium", ["millenium", "milennium", "millenneum"]],
  ["conscientious", ["consciencious", "conscentious", "conscienscious"]],
  ["embezzlement", ["embazzlement", "embezlement", "embeclement"]],
];
const ERRORS: [string[], number, string][] = [
  [["Each of the boys", "have submitted", "their assignment", "on time"], 1, "'Each of' is singular and needs 'has submitted'."],
  [["One of my friends", "are going", "to Delhi", "next week"], 1, "'One of + plural noun' takes a singular verb: 'is going'."],
  [["The number of students", "in the class", "have increased", "this year"], 2, "'The number of' is singular — it takes 'has increased'."],
  [["He is one of the best", "player", "in the", "country"], 1, "'One of the best' must be followed by the plural 'players'."],
  [["Neither of the two boys", "were present", "in the", "assembly"], 1, "'Neither of' is singular and takes 'was present'."],
  [["She as well as her sisters", "were invited", "to the", "ceremony"], 1, "With 'as well as' the verb agrees with the first subject: 'was invited'."],
  [["I would rather", "to die", "than", "beg"], 1, "'Would rather' takes the bare infinitive: 'die'."],
  [["He insisted", "to go", "with me", "to the market"], 1, "'Insist' takes 'on + gerund': 'on going'."],
];
const ACTIVE: [string, string, string[]][] = [
  ["Change into passive voice: The committee has approved the plan.", "The plan has been approved by the committee.", ["The plan was approved by the committee.", "The plan had been approved by the committee.", "The plan is approved by the committee."]],
  ["Change into passive voice: Someone stole my bicycle last night.", "My bicycle was stolen last night.", ["My bicycle is stolen last night.", "My bicycle has been stolen last night.", "My bicycle had stolen last night."]],
  ["Change into passive voice: Do not touch the exhibits.", "Let the exhibits not be touched.", ["The exhibits should not touch.", "Do not let the exhibits touch.", "The exhibits are not touched."]],
  ["Change into passive voice: Who broke the window?", "By whom was the window broken?", ["Who was the window broken by?", "Whom broke the window?", "By whom has the window broken?"]],
  ["Change into passive voice: They will finish the work tomorrow.", "The work will be finished by them tomorrow.", ["The work will finish tomorrow.", "The work would be finished tomorrow.", "The work is to be finished tomorrow."]],
  ["Change into active voice: The letter was written by Ravi.", "Ravi wrote the letter.", ["Ravi has written the letter.", "Ravi writes the letter.", "Ravi was writing the letter."]],
];
const IMPROVE: [string, string, string[]][] = [
  ["He is senior than me.", "to me", ["from me", "over me", "No improvement"]],
  ["I prefer coffee than tea.", "to tea", ["over tea", "from tea", "No improvement"]],
  ["She has been working here since five years.", "for five years", ["from five years", "by five years", "No improvement"]],
  ["One should keep his promise.", "one's promise", ["their promise", "the promise", "No improvement"]],
  ["He was accused for stealing the money.", "of stealing", ["to steal", "with stealing", "No improvement"]],
];

const eSynonym: Gen = () => {
  const [w, s, wrong] = pick(SYN);
  return mk(
    "ENGLISH",
    B("English · Vocabulary", "अंग्रेज़ी · शब्द-भंडार"),
    B("Synonym", "पर्यायवाची"),
    B(
      `Select the word MOST SIMILAR in meaning to the word given below.\n\n${w}`,
      `दिए गए शब्द का सबसे समानार्थी शब्द चुनिए।\n\n${w}`
    ),
    N(s),
    wrong.map((x) => N(x)),
    B(`"${w}" carries the sense of "${s}".`, `"${w}" का अर्थ "${s}" है — यही विकल्प उसका पर्यायवाची है।`),
    B(
      `Strike out the option with the OPPOSITE emotional charge first — one elimination, two seconds.`,
      `पहले विपरीत भाव वाले विकल्प काटिए — एक कटौती, दो सेकंड।`
    ),
    B(
      `Trap: options related to the same SUBJECT but not synonyms. Similar field is not similar meaning.`,
      `सावधानी: उसी विषय से जुड़े पर समानार्थी न होने वाले विकल्प। समान क्षेत्र का अर्थ समान अर्थ नहीं।`
    )
  );
};

const eAntonym: Gen = () => {
  const [w, s, wrong] = pick(ANT);
  return mk(
    "ENGLISH",
    B("English · Vocabulary", "अंग्रेज़ी · शब्द-भंडार"),
    B("Antonym", "विलोम शब्द"),
    B(
      `Select the word MOST OPPOSITE in meaning to the word given below.\n\n${w}`,
      `दिए गए शब्द का सबसे विपरीतार्थी शब्द चुनिए।\n\n${w}`
    ),
    N(s),
    wrong.map((x) => N(x)),
    B(`"${w}" means "${s}" — the direct opposite is "${s === "clear" ? "vague" : "the option on the other pole"}".`, `"${w}" का अर्थ "${s}" है — इसका विलोम विकल्प ही सही उत्तर है।`),
    B(`Fix the polarity of the root word first, then hunt for the ONLY option on the opposite pole.`, `पहले मूल शब्द का धन/ऋण भाव तय कीजिए, फिर विपरीत ध्रुव का एकमात्र विकल्प चुनिए।`),
    B(`Trap: near-synonyms of the word planted among the options.`, `सावधानी: उसी शब्द के लगभग-पर्यायवाची विकल्पों में रखे गए हैं।`)
  );
};

const eIdiom: Gen = () => {
  const [p, m, wrong] = pick(IDIOMS);
  return mk(
    "ENGLISH",
    B("English · Idioms & Phrases", "अंग्रेज़ी · मुहावरे एवं वाक्यांश"),
    B("Idiomatic meaning", "मुहावरे का अर्थ"),
    B(`Select the option that best expresses the meaning of the given idiom.\n\n"${p}"`, `दिए गए मुहावरे का सर्वोत्तम अर्थ चुनिए।\n\n"${p}"`),
    N(m),
    wrong.map((x) => N(x)),
    B(`"${p}" is used figuratively to mean "${m}".`, `"${p}" का आशय "${m}" है।`),
    B(`Ask "what SITUATION is this phrase said in?" — match the situation, not the words.`, `पूछिए "यह वाक्यांश किस स्थिति में कहा जाता है?" — शब्द नहीं, स्थिति मिलाइए।`),
    B(`Trap: distractors built from the literal words inside the idiom.`, `सावधानी: मुहावरे के शाब्दिक शब्दों से बने विकल्प।`)
  );
};

const eOneWord: Gen = () => {
  const [p, m, wrong] = pick(ONEWORD);
  return mk(
    "ENGLISH",
    B("English · One Word Substitution", "अंग्रेज़ी · एक शब्द प्रतिस्थापन"),
    B("Definition to word", "परिभाषा के लिए शब्द"),
    B(`Select the one-word substitution for the given description.\n\n${p}`, `दी गई परिभाषा के लिए एक शब्द चुनिए।\n\n${p}`),
    N(m),
    wrong.map((x) => N(x)),
    B(`"${p}" is substituted by the single word "${m}".`, `"${p}" के लिए एक शब्द "${m}" है।`),
    B(`Read the KEY noun of the definition, match it to the word root, then pick.`, `परिभाषा के मुख्य संज्ञा शब्द को पहचानिए, उसे शब्द-मूल से जोड़िए, फिर चुनिए।`),
    B(`Trap: near-meaning words covering only PART of the definition.`, `सावधानी: परिभाषा के केवल एक भाग को छूने वाले निकट अर्थ वाले शब्द।`)
  );
};

const eFill: Gen = () => {
  const [s, a, wrong] = pick(FILL);
  return mk(
    "ENGLISH",
    B("English · Grammar", "अंग्रेज़ी · व्याकरण"),
    B("Preposition / collocation", "सम्बंधबोधक / प्रयोग"),
    B(`Fill in the blank with the most appropriate option.\n\n${s}`, `रिक्त स्थान के लिए सर्वाधिक उपयुक्त विकल्प चुनिए।\n\n${s}`),
    N(a),
    wrong.map((x) => N(x)),
    B(`The standard collocation takes the preposition "${a}".`, `मानक प्रयोग में यहाँ "${a}" सम्बंधबोधक लगता है।`),
    B(`Fixed prepositions are a memory bank — say the phrase aloud in your head; the right one rings true.`, `स्थिर प्रयोग याद रखने की वस्तु हैं — वाक्यांश मन में बोलिए, सही विकल्प सही लगेगा।`),
    B(`Trap: the preposition that feels logical in regional usage. English collocations are arbitrary.`, `सावधानी: अपनी क्षेत्रीय भाषा में सही लगने वाला सम्बंधबोधक। अंग्रेज़ी के प्रयोग मनमाने होते हैं।`)
  );
};

const eSpell: Gen = () => {
  const [correct, wrong] = pick(SPELL);
  return mk(
    "ENGLISH",
    B("English · Spelling", "अंग्रेज़ी · वर्तनी"),
    B("Correctly spelt word", "सही वर्तनी"),
    B(`Select the correctly spelt word from the given options.`, `दिए गए विकल्पों में से सही वर्तनी वाला शब्द चुनिए।`),
    N(correct),
    wrong.map((x) => N(x)),
    B(`"${correct}" is the standard spelling.`, `"${correct}" मानक वर्तनी है।`),
    B(`Read each option once, left to right — the misspelt one will look "off" immediately.`, `हर विकल्प एक बार बाएँ से दाएँ पढ़िए — गलत वर्तनी तुरंत अस्वाभाविक लगेगी।`),
    B(`Trap: phonetic spellings of the word. Never pick the option that matches pronunciation.`, `सावधानी: उच्चारण के अनुसार बनी वर्तनी। जो विकल्प बोलने जैसा लगे, वही गलत है।`)
  );
};

const eError: Gen = () => {
  const [parts, idx, expl] = pick(ERRORS);
  const opts = parts.map((p, i) => `(${i + 1}) ${p}`);
  return mk(
    "ENGLISH",
    B("English · Error Spotting", "अंग्रेज़ी · त्रुटि पहचान"),
    B("Subject-verb agreement", "कर्ता-क्रिया समन्वय"),
    B(
      `Identify the segment that contains the error. If there is no error, select "No error".\n\n${opts.join("  ")}`,
      `त्रुटि वाला खंड पहचानिए। यदि कोई त्रुटि न हो तो "No error" चुनिए।\n\n${opts.join("  ")}`
    ),
    N(opts[idx]),
    opts.filter((_, i) => i !== idx).map((o) => N(o)),
    B(expl, expl),
    B(`Scan ONLY the verb and its subject first. "Each / One of / Neither of / The number of" -> singular verb kills most items.`, `पहले सिर्फ़ क्रिया और उसका कर्ता देखिए। "Each / One of / Neither of / The number of" के बाद एकवचन क्रिया लगती है — अधिकांश प्रश्न यहीं हल होते हैं।`),
    B(`Trap: the neighbouring segment reads naturally, so it distracts. Test agreement before anything else.`, `सावधानी: आसन्न खंड सहज लगता है, इसलिए ध्यान भटकता है। पहले कर्ता-क्रिया समन्वय जाँचिए।`)
  );
};

const eActive: Gen = () => {
  const [q, a, wrong] = pick(ACTIVE);
  return mk(
    "ENGLISH",
    B("English · Voice", "अंग्रेज़ी · वाच्य"),
    B("Active-passive transformation", "कर्तृवाच्य-कर्मवाच्य"),
    B(q, q.replace("Change into passive voice:", "कर्मवाच्य में बदलिए:").replace("Change into active voice:", "कर्तृवाच्य में बदलिए:")),
    N(a),
    wrong.map((x) => N(x)),
    B(`In the passive the object becomes the subject, the verb becomes "be + V3" and the agent follows "by".`, `कर्मवाच्य में कर्म कर्ता बनता है, क्रिया "be + V3" होती है और कर्ता "by" के बाद आता है।`),
    B(`Match the TENSE fingerprint first ("has approved" -> "has been"), then check the words.`, `पहले काल की पहचान मिलाइए ("has approved" -> "has been"), फिर शब्द देखिए।`),
    B(`Trap: options that keep the tense but swap subject and object.`, `सावधानी: काल सही पर कर्ता-कर्म बदले हुए विकल्प।`)
  );
};

const eImprove: Gen = () => {
  const [q, a, wrong] = pick(IMPROVE);
  return mk(
    "ENGLISH",
    B("English · Sentence Improvement", "अंग्रेज़ी · वाक्य सुधार"),
    B("Error correction in a phrase", "वाक्यांश में सुधार"),
    B(`Select the option that improves the underlined part of the sentence. If no improvement is needed, select "No improvement".\n\n${q}`, `वाक्य के रेखांकित भाग को सुधारने वाला विकल्प चुनिए। यदि सुधार की आवश्यकता न हो तो "No improvement" चुनिए।\n\n${q}`),
    N(a),
    wrong.map((x) => N(x)),
    B(`Replacing the fragment with "${a}" restores correct usage.`, `"${a}" से बदलने पर वाक्य शुद्ध हो जाता है।`),
    B(`Read ONLY the underlined fragment and ask which rule it breaks — comparison adjectives (senior, junior, superior) always take "to".`, `सिर्फ़ रेखांकित भाग पढ़िए और पूछिए कौन-सा नियम टूटा है — तुलनात्मक विशेषणों (senior, junior, superior) के बाद "to" लगता है, "than" नहीं।`),
    B(`Trap: over-picking "No improvement". If a standard rule clearly applies, an improvement is required.`, `सावधानी: "No improvement" का अंधानुकरण। स्पष्ट नियम लागू हो तो सुधार अनिवार्य है।`)
  );
};

export const englishGens: Gen[] = [eSynonym, eAntonym, eIdiom, eOneWord, eFill, eSpell, eError, eActive, eImprove];

/* ================================ GA ================================ */
type GAItem = { topic: Bi; sub: Bi; q: Bi; a: string; w: string[]; m: Bi; h: Bi; t: Bi };

const GA_BANK: GAItem[] = [
  {
    topic: B("Indian Polity", "भारतीय राजव्यवस्था"), sub: B("Constitution — Articles", "संविधान — अनुच्छेद"),
    q: B("Which Article of the Indian Constitution is called the 'heart and soul' of the Constitution by Dr. B. R. Ambedkar?", "भारतीय संविधान का कौन-सा अनुच्छेद डॉ. भीमराव अंबेडकर द्वारा संविधान का 'हृदय और आत्मा' कहा गया है?"),
    a: "Article 32", w: ["Article 21", "Article 19", "Article 226"],
    m: B("Article 32 (Right to Constitutional Remedies) lets a citizen move the Supreme Court directly for enforcement of Fundamental Rights.", "अनुच्छेद 32 (संवैधानिक उपचार का अधिकार) नागरिक को मौलिक अधिकारों के लिए सीधे उच्चतम न्यायालय जाने का अधिकार देता है।"),
    h: B("Article map: 32 = Remedies, 21 = Life & Liberty, 19 = Six Freedoms, 226 = High Court writ.", "अनुच्छेद सूची: 32 = उपचार, 21 = जीवन एवं स्वतंत्रता, 19 = छह स्वतंत्रताएँ, 226 = उच्च न्यायालय का रिट।"),
    t: B("Article 21 is the automatic distractor — the phrase belongs only to Article 32.", "अनुच्छेद 21 सबसे सामान्य जाल है — यह वाक्यांश केवल अनुच्छेद 32 से जुड़ा है।"),
  },
  {
    topic: B("Indian Polity", "भारतीय राजव्यवस्था"), sub: B("Constitutional Offices", "संवैधानिक पद"),
    q: B("Under which Article is the Comptroller and Auditor General (CAG) of India appointed?", "भारत के नियंत्रक एवं महालेखा परीक्षक (CAG) की नियुक्ति किस अनुच्छेद के अंतर्गत होती है?"),
    a: "Article 148", w: ["Article 144", "Article 156", "Article 324"],
    m: B("Article 148 provides for the CAG, the guardian of the public purse who audits Union and State expenditure.", "अनुच्छेद 148 CAG का प्रावधान है, जो सार्वजनिक धन का संरक्षक है और केंद्र-राज्य के व्यय का लेखा-परीक्षण करता है।"),
    h: B("148-151 = CAG block. Read it as '1-4-8 = Audit'. 324 = Election Commission, 156 = Governor.", "148-151 = CAG खंड। '1-4-8 = लेखा-परीक्षण' याद रखिए। 324 = चुनाव आयोग, 156 = राज्यपाल।"),
    t: B("Article 144 is numerically close and is planted deliberately.", "अनुच्छेद 144 संख्या में निकट है और जान-बूझकर रखा जाता है।"),
  },
  {
    topic: B("Indian Polity", "भारतीय राजव्यवस्था"), sub: B("Emergency Provisions", "आपातकालीन प्रावधान"),
    q: B("President's Rule in a State is imposed under which Article?", "राज्य में राष्ट्रपति शासन किस अनुच्छेद के अंतर्गत लगाया जाता है?"),
    a: "Article 356", w: ["Article 352", "Article 360", "Article 365"],
    m: B("Article 356 empowers the President to impose President's Rule on failure of constitutional machinery in a State.", "अनुच्छेद 356 राज्य में संवैधानिक तंत्र के विफल होने पर राष्ट्रपति शासन लगाने का अधिकार देता है।"),
    h: B("352 / 356 / 360 = National / State / Financial — ascending order 2-6-0.", "352 / 356 / 360 = राष्ट्रीय / राज्य / वित्तीय — बढ़ते क्रम में 2-6-0।"),
    t: B("Article 360 is Financial Emergency and has never been invoked.", "अनुच्छेद 360 वित्तीय आपातकाल है और आज तक लागू नहीं हुआ।"),
  },
  {
    topic: B("History", "इतिहास"), sub: B("Modern India", "आधुनिक भारत"),
    q: B("The Jallianwala Bagh massacre took place in Amritsar on which date?", "जलियाँवाला बाग हत्याकांड अमृतसर में किस तिथि को हुआ था?"),
    a: "13 April 1919", w: ["13 April 1920", "6 April 1919", "26 January 1919"],
    m: B("On 13 April 1919 (Baisakhi day) General Dyer ordered firing on a peaceful gathering at Jallianwala Bagh.", "13 अप्रैल 1919 (बैसाखी) को जनरल डायर ने जलियाँवाला बाग में शांतिपूर्ण सभा पर गोली चलवाई थी।"),
    h: B("Anchor years: 1919 = Jallianwala Bagh + Rowlatt Act; 1920 = Non-Cooperation; 1942 = Quit India.", "वर्ष याद रखिए: 1919 = जलियाँवाला बाग + रॉलेट एक्ट; 1920 = असहयोग; 1942 = भारत छोड़ो।"),
    t: B("Baisakhi is the festival day and pulls candidates to a wrong date.", "बैसाखी का दिन होने के कारण उम्मीदवार गलत तिथि चुन लेते हैं।"),
  },
  {
    topic: B("History", "इतिहास"), sub: B("Medieval India", "मध्यकालीन भारत"),
    q: B("In the First Battle of Panipat (1526), Babur defeated which ruler?", "पानीपत के प्रथम युद्ध (1526) में बाबर ने किस शासक को पराजित किया?"),
    a: "Ibrahim Lodi", w: ["Rana Sanga", "Hemu", "Sher Shah Suri"],
    m: B("In 1526 Babur defeated Ibrahim Lodi at Panipat and founded the Mughal Empire.", "1526 में बाबर ने पानीपत में इब्राहिम लोदी को हराकर मुगल साम्राज्य की स्थापना की।"),
    h: B("Three Panipats: 1526 – Ibrahim Lodi, 1556 – Hemu, 1761 – Marathas.", "तीन पानीपत: 1526 – इब्राहिम लोदी, 1556 – हेमू, 1761 – मराठे।"),
    t: B("Rana Sanga was defeated at Khanwa (1527) — one battle apart.", "राणा सांगा खानवा (1527) में हारे थे — बस एक युद्ध दूर।"),
  },
  {
    topic: B("Geography", "भूगोल"), sub: B("Physical India", "भारत का भौतिक भूगोल"),
    q: B("Which Indian state has the longest coastline?", "भारत में सबसे लंबी तटरेखा किस राज्य की है?"),
    a: "Gujarat", w: ["Tamil Nadu", "Andhra Pradesh", "Maharashtra"],
    m: B("Gujarat has the longest coastline (about 1,600 km), followed by Andhra Pradesh and Tamil Nadu.", "गुजरात की तटरेखा सबसे लंबी (लगभग 1600 किमी) है, उसके बाद आंध्र प्रदेश और तमिलनाडु।"),
    h: B("Ranking 1-4: Gujarat -> Andhra Pradesh -> Tamil Nadu -> Maharashtra.", "क्रम 1-4: गुजरात -> आंध्र प्रदेश -> तमिलनाडु -> महाराष्ट्र।"),
    t: B("Port count is not coastline length.", "बंदरगाहों की संख्या तटरेखा की लंबाई नहीं है।"),
  },
  {
    topic: B("Geography", "भूगोल"), sub: B("Rivers & Dams", "नदियाँ एवं बाँध"),
    q: B("The Bhakra Nangal Dam is constructed on which river?", "भाखड़ा नांगल परियोजना किस नदी पर बनी है?"),
    a: "Sutlej", w: ["Beas", "Ravi", "Yamuna"],
    m: B("The Bhakra Nangal project is on the Sutlej; the Gobind Sagar reservoir is formed by the Bhakra dam.", "भाखड़ा नांगल परियोजना सतलुज नदी पर है; भाखड़ा बाँध से गोविंद सागर जलाशय बना है।"),
    h: B("Punjab rivers and dams: Bhakra = Sutlej, Pong = Beas, Ranjit Sagar = Ravi.", "पंजाब की नदियाँ और बाँध: भाखड़ा = सतलुज, पोंग = ब्यास, रंजीत सागर = रावी।"),
    t: B("'Land of five rivers' tempts any of the five to be picked.", "'पाँच नदियों की भूमि' के कारण कोई भी नदी चुन ली जाती है।"),
  },
  {
    topic: B("Economy", "अर्थव्यवस्था"), sub: B("Monetary System", "मुद्रा प्रणाली"),
    q: B("In which year was the Reserve Bank of India nationalised?", "भारतीय रिज़र्व बैंक का राष्ट्रीयकरण किस वर्ष हुआ?"),
    a: "1949", w: ["1935", "1947", "1969"],
    m: B("The RBI was established on 1 April 1935 and nationalised on 1 January 1949. 1969 is when fourteen major banks were nationalised.", "RBI की स्थापना 1 अप्रैल 1935 को और राष्ट्रीयकरण 1 जनवरी 1949 को हुआ। 1969 में चौदह प्रमुख वाणिज्यिक बैंकों का राष्ट्रीयकरण हुआ।"),
    h: B("Two dates: RBI 1935 (birth) -> 1949 (nationalisation). Commercial banks = 1969.", "दो तिथियाँ: RBI 1935 (स्थापना) -> 1949 (राष्ट्रीयकरण)। वाणिज्यिक बैंक = 1969।"),
    t: B("1935 is the founding year and the most mis-selected answer.", "1935 स्थापना वर्ष है और सबसे अधिक गलत चुना गया विकल्प है।"),
  },
  {
    topic: B("Economy", "अर्थव्यवस्था"), sub: B("Indirect Taxation", "अप्रत्यक्ष कर"),
    q: B("The Goods and Services Tax (GST) came into effect in India on:", "भारत में वस्तु एवं सेवा कर (GST) कब लागू हुआ?"),
    a: "1 July 2017", w: ["1 April 2017", "1 January 2017", "15 August 2016"],
    m: B("GST was rolled out on 1 July 2017 through the 101st Constitutional Amendment Act, 2016.", "GST 101वें संविधान संशोधन अधिनियम, 2016 के तहत 1 जुलाई 2017 को लागू हुआ।"),
    h: B("Amendment 101 -> Act 2016 -> rollout 1 July 2017.", "संशोधन 101 -> अधिनियम 2016 -> लागू 1 जुलाई 2017।"),
    t: B("1 April is the financial year start and the reflex answer.", "1 अप्रैल वित्तीय वर्ष का आरंभ है, इसलिए सहज उत्तर बन जाता है।"),
  },
  {
    topic: B("Science", "विज्ञान"), sub: B("Biology", "जीव विज्ञान"),
    q: B("Deficiency of Vitamin C in the human body causes:", "मानव शरीर में विटामिन C की कमी से कौन-सा रोग होता है?"),
    a: "Scurvy", w: ["Rickets", "Beriberi", "Night blindness"],
    m: B("Vitamin C (ascorbic acid) deficiency causes scurvy — bleeding gums and weak connective tissue.", "विटामिन C (एस्कॉर्बिक अम्ल) की कमी से स्कर्वी होता है — मसूड़ों से रक्तस्राव और कमज़ोर ऊतक।"),
    h: B("Vitamin triad: A -> night blindness, B1 -> beriberi, C -> scurvy, D -> rickets.", "विटामिन त्रिक: A -> रतौंधी, B1 -> बेरीबेरी, C -> स्कर्वी, D -> रिकेट्स।"),
    t: B("All four are deficiency diseases — classify by VITAMIN, not by familiarity.", "चारों कमी के रोग हैं — विटामिन के आधार पर वर्गीकरण कीजिए।"),
  },
  {
    topic: B("Science", "विज्ञान"), sub: B("Physics", "भौतिक विज्ञान"),
    q: B("The speed of sound is maximum in which of the following media?", "निम्नलिखित में से किस माध्यम में ध्वनि की गति अधिकतम होती है?"),
    a: "Solids", w: ["Liquids", "Gases", "Vacuum"],
    m: B("Sound travels fastest in solids, slower in liquids, slowest in gases, and cannot travel through a vacuum.", "ध्वनि ठोस में सबसे तेज़, द्रव में कम, गैस में सबसे कम चलती है और निर्वात में नहीं चलती।"),
    h: B("Speed order: Solid > Liquid > Gas >>> Vacuum.", "गति क्रम: ठोस > द्रव > गैस >>> निर्वात।"),
    t: B("Vacuum is an impossibility, not a speed.", "निर्वात में गति शून्य नहीं, असंभव है।"),
  },
  {
    topic: B("Awards & Honours", "पुरस्कार एवं सम्मान"), sub: B("Civilian Awards", "नागरिक पुरस्कार"),
    q: B("Which is the highest civilian award of India?", "भारत का सर्वोच्च नागरिक पुरस्कार कौन-सा है?"),
    a: "Bharat Ratna", w: ["Padma Vibhushan", "Padma Bhushan", "Padma Shri"],
    m: B("The Bharat Ratna, instituted in 1954, is the highest civilian award, followed by Padma Vibhushan, Padma Bhushan and Padma Shri.", "1954 में स्थापित भारत रत्न सर्वोच्च नागरिक पुरस्कार है, उसके बाद पद्म विभूषण, पद्म भूषण और पद्म श्री।"),
    h: B("Order: Bharat Ratna -> Padma Vibhushan -> Padma Bhushan -> Padma Shri.", "क्रम: भारत रत्न -> पद्म विभूषण -> पद्म भूषण -> पद्म श्री।"),
    t: B("Padma Vibhushan tops the PADMA trio but sits below the Bharat Ratna.", "पद्म विभूषण पद्म श्रेणी में सर्वोच्च है, पर भारत रत्न से नीचे।"),
  },
  {
    topic: B("Sports", "खेल"), sub: B("National Sports Awards", "राष्ट्रीय खेल पुरस्कार"),
    q: B("Which award is the highest sporting honour of India?", "भारत का सर्वोच्च खेल सम्मान कौन-सा है?"),
    a: "Major Dhyan Chand Khel Ratna Award", w: ["Arjuna Award", "Dronacharya Award", "Dhyan Chand Award"],
    m: B("The Khel Ratna (renamed Major Dhyan Chand Khel Ratna in 2021) is the highest sporting honour; Arjuna is for performers and Dronacharya for coaches.", "खेल रत्न (2021 में मेजर ध्यानचंद खेल रत्न) सर्वोच्च खेल सम्मान है; अर्जुन उत्कृष्ट खिलाड़ियों के लिए और द्रोणाचार्य प्रशिक्षकों के लिए है।"),
    h: B("Dhyan Chand -> Khel Ratna, Dronacharya -> coach, Arjuna -> performer.", "ध्यानचंद -> खेल रत्न, द्रोणाचार्य -> प्रशिक्षक, अर्जुन -> खिलाड़ी।"),
    t: B("Dronacharya is strictly for COACHES.", "द्रोणाचार्य पुरस्कार केवल प्रशिक्षकों के लिए है।"),
  },
  {
    topic: B("Polity", "राजव्यवस्था"), sub: B("Parliament", "संसद"),
    q: B("The Fundamental Duties were added to the Constitution by which amendment?", "मूल कर्तव्य संविधान में किस संशोधन द्वारा जोड़े गए?"),
    a: "42nd Amendment, 1976", w: ["44th Amendment, 1978", "52nd Amendment, 1985", "73rd Amendment, 1992"],
    m: B("The 42nd Amendment (1976), on the Swaran Singh Committee's recommendation, inserted Part IVA and Article 51A.", "स्वर्ण सिंह समिति की सिफ़ारिश पर 42वें संशोधन (1976) द्वारा भाग IV-क और अनुच्छेद 51-क जोड़े गए।"),
    h: B("Anchors: 42 = Fundamental Duties (1976), 44 = property right removed (1978), 73 = Panchayati Raj (1992).", "सूत्र: 42 = मूल कर्तव्य (1976), 44 = संपत्ति का अधिकार हटा (1978), 73 = पंचायती राज (1992)।"),
    t: B("The 44th Amendment is close in number and unrelated.", "44वाँ संशोधन संख्या में निकट है पर संबंधित नहीं।"),
  },
  {
    topic: B("History", "इतिहास"), sub: B("Freedom Struggle", "स्वतंत्रता संग्राम"),
    q: B("The Quit India Movement was launched in which year?", "भारत छोड़ो आंदोलन किस वर्ष प्रारंभ हुआ?"),
    a: "1942", w: ["1930", "1920", "1947"],
    m: B("The Quit India resolution was passed on 8 August 1942 in Bombay; Gandhi gave the slogan 'Do or Die'.", "8 अगस्त 1942 को बंबई में भारत छोड़ो प्रस्ताव पारित हुआ; गांधीजी ने 'करो या मरो' का नारा दिया।"),
    h: B("Ladder: 1905 Bengal Partition -> 1920 Non-Cooperation -> 1930 Civil Disobedience -> 1942 Quit India.", "श्रृंखला: 1905 बंगाल विभाजन -> 1920 असहयोग -> 1930 सविनय अवज्ञा -> 1942 भारत छोड़ो।"),
    t: B("1930 (Dandi March) is the standard distractor.", "1930 (दांडी मार्च) सबसे सामान्य जाल है।"),
  },
  {
    topic: B("Current Affairs", "समसामयिकी"), sub: B("Sports · 2026", "खेल · 2026"),
    q: B("The 2026 Asian Games are being hosted in which city/region?", "2026 एशियाई खेल किस शहर/क्षेत्र में आयोजित हो रहे हैं?"),
    a: "Aichi-Nagoya, Japan", w: ["Hangzhou, China", "Doha, Qatar", "Jakarta, Indonesia"],
    m: B("The 20th Asian Games are in Aichi-Nagoya, Japan; India's first gold came in Women's T20 Cricket.", "20वें एशियाई खेल जापान के आइची-नागोया में हो रहे हैं; भारत का पहला स्वर्ण महिला T20 क्रिकेट में आया।"),
    h: B("Host rotation: Japan 2026 follows China 2022 (Hangzhou).", "मेजबान क्रम: जापान 2026, चीन 2022 (हांगझू) के बाद।"),
    t: B("Hangzhou 2022 is the previous edition and stays in memory.", "हांगझू 2022 पिछला संस्करण है और स्मृति में बना रहता है।"),
  },
  {
    topic: B("Current Affairs", "समसामयिकी"), sub: B("Science · 2025", "विज्ञान · 2025"),
    q: B("The Nobel Prize in Chemistry 2025 was awarded for the development of:", "रसायन विज्ञान का नोबेल पुरस्कार 2025 किसके विकास के लिए दिया गया?"),
    a: "Metal-organic frameworks (MOFs)", w: ["Quantum tunnelling in semiconductors", "CRISPR gene editing", "mRNA vaccine technology"],
    m: B("Susumu Kitagawa, Richard Robson and Omar M. Yaghi shared the 2025 Chemistry Nobel for metal-organic frameworks — porous materials that capture and store gases.", "सुसुमु कितागावा, रिचर्ड रॉबसन और ओमर एम. यागी को धातु-कार्बनिक ढाँचों (MOFs) के लिए 2025 का रसायन नोबेल मिला — ये छिद्रयुक्त पदार्थ गैसों को संग्रहित करते हैं।"),
    h: B("Nobel questions are about the DISCOVERY, not the names: Chemistry 2025 = MOFs.", "नोबेल प्रश्न खोज के बारे में होते हैं, नामों के नहीं: रसायन 2025 = MOFs।"),
    t: B("CRISPR (2020) and mRNA (2023) are recycled distractors.", "CRISPR (2020) और mRNA (2023) बार-बार लौटने वाले जाल हैं।"),
  },
  {
    topic: B("Geography", "भूगोल"), sub: B("Climatology", "जलवायु विज्ञान"),
    q: B("The Tropic of Cancer passes through how many Indian states?", "कर्क रेखा भारत के कितने राज्यों से गुजरती है?"),
    a: "8", w: ["6", "7", "9"],
    m: B("The Tropic of Cancer (23°30' N) passes through Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura and Mizoram.", "कर्क रेखा (23°30' उत्तर) गुजरात, राजस्थान, मध्य प्रदेश, छत्तीसगढ़, झारखंड, पश्चिम बंगाल, त्रिपुरा और मिज़ोरम से गुजरती है।"),
    h: B("West to east: Gu-Ra-Ma-Ch-Ja-We-Tri-Mi — eight states, eight syllables.", "पश्चिम से पूर्व: Gu-Ra-Ma-Ch-Ja-We-Tri-Mi — आठ राज्य, आठ अक्षर।"),
    t: B("Odisha and Bihar are near the line but not on it.", "ओडिशा और बिहार रेखा के निकट हैं पर उस पर नहीं।"),
  },
  {
    topic: B("Science", "विज्ञान"), sub: B("Space Technology", "अंतरिक्ष प्रौद्योगिकी"),
    q: B("The headquarters of ISRO is located in:", "इसरो का मुख्यालय कहाँ स्थित है?"),
    a: "Bengaluru", w: ["Thiruvananthapuram", "Hyderabad", "Sriharikota"],
    m: B("ISRO is headquartered in Bengaluru; VSSC is at Thiruvananthapuram, SDSC SHAR at Sriharikota and NRSC at Hyderabad.", "इसरो का मुख्यालय बेंगलुरु में है; VSSC तिरुवनंतपुरम, SDSC SHAR श्रीहरिकोटा और NRSC हैदराबाद में हैं।"),
    h: B("One city, one centre: Bengaluru = HQ, Sriharikota = launch, Thiruvananthapuram = rocket design, Hyderabad = remote sensing.", "एक शहर, एक केंद्र: बेंगलुरु = मुख्यालय, श्रीहरिकोटा = प्रक्षेपण, तिरुवनंतपुरम = रॉकेट डिज़ाइन, हैदराबाद = रिमोट सेंसिंग।"),
    t: B("Sriharikota is the most visible name, not the headquarters.", "श्रीहरिकोटा सबसे चर्चित नाम है, मुख्यालय नहीं।"),
  },
];

export const gaGens: Gen[] = GA_BANK.map(
  (item) => () =>
    mk("GA", item.topic, item.sub, item.q, N(item.a), item.w.map((w) => N(w)), item.m, item.h, item.t)
);


