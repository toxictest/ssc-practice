/* =============================================================
   QUANTITATIVE APTITUDE generators (bilingual) + question API
   ============================================================= */
import {
  B, N, NL, gcd, mk, pick, ri, rup, shuffle, trim,
} from "./kit";
import type { Gen, Kind, Diff, RawQuestion, Tier } from "./kit";
import { englishGens, gaGens, reasoningGens } from "./gen-verbal";

export type { Bi, Diff, Kind, Lang, QView, RawQuestion, Tier } from "./kit";
export { KIND_LABEL, localizeQuestion } from "./kit";
export type Question = import("./kit").QView;

/* ------------------------------- QUANT ------------------------------- */
const qNetChange: Gen = (lvl) => {
  const a = ri(2 + lvl, 6 + lvl) * 5;
  const b = ri(2, 5 + lvl) * 5;
  const net = a - b - (a * b) / 100;
  return mk(
    "QUANT",
    B("Percentage", "प्रतिशत"),
    B("Successive percentage change", "क्रमिक प्रतिशत परिवर्तन"),
    B(
      `The price of an article is first increased by ${a}% and then decreased by ${b}%. What is the net percentage change?`,
      `किसी वस्तु की कीमत पहले ${a}% बढ़ाई गई, फिर ${b}% घटाई गई। शुद्ध प्रतिशत परिवर्तन क्या है?`
    ),
    N(`${trim(net)}%`),
    NL([`${trim(a - b)}%`, `${trim(a + b - (a * b) / 100)}%`, `${trim(-net)}%`, `${trim((a * b) / 100)}%`]),
    B(
      `Take CP = ₹100. After +${a}% it is ₹${trim(100 + a)}. Now -${b}%: ${trim(100 + a)} x ${trim(100 - b)} / 100 = ₹${trim(100 + net)}. Net change = ${trim(net)}%.`,
      `क्रय मूल्य = ₹100 मानिए। +${a}% के बाद ₹${trim(100 + a)}। अब -${b}%: ${trim(100 + a)} x ${trim(100 - b)} / 100 = ₹${trim(100 + net)}। शुद्ध परिवर्तन = ${trim(net)}%।`
    ),
    B(
      `One formula: net = a - b - (a x b)/100 = ${a} - ${b} - ${trim((a * b) / 100)} = ${trim(net)}%.`,
      `एक सूत्र: शुद्ध = a - b - (a x b)/100 = ${a} - ${b} - ${trim((a * b) / 100)} = ${trim(net)}%।`
    ),
    B(
      `Trap: writing ${a - b}% and forgetting the cross term -(a x b)/100.`,
      `सावधानी: ${a - b}% लिख देना और प्रसवर्ग पद -(a x b)/100 भूल जाना। दोनों प्रतिशत मूल मूल्य पर नहीं लगते।`
    )
  );
};

const qPercentDiff: Gen = (lvl) => {
  const p = ri(2 + lvl, 4 + lvl) * 5 + 15;
  const q = ri(1, 3) * 5;
  const num = ri(3, 12) * 40;
  const d = (num * (p - q)) / 100;
  return mk(
    "QUANT",
    B("Percentage", "प्रतिशत"),
    B("Statement to equation", "कथन से समीकरण"),
    B(
      `${p}% of a number exceeds ${q}% of the same number by ${d}. What is the number?`,
      `किसी संख्या का ${p}%, उसी संख्या के ${q}% से ${d} अधिक है। वह संख्या क्या है?`
    ),
    N(num),
    NL([num + 20, num - 20, Math.round((d * 100) / (p - q + 5)), num * 2]),
    B(
      `Let the number be x. (${p} - ${q})% of x = ${d} so x = ${d} x 100 / ${p - q} = ${num}.`,
      `संख्या = x मानिए। (${p} - ${q})% of x = ${d}, अतः x = ${d} x 100 / ${p - q} = ${num}।`
    ),
    B(
      `Read "exceeds by" as a straight percentage gap: x = gap x 100 / gap% = ${d} x 100 / ${p - q}. One division.`,
      `"इतना अधिक है" को सीधा प्रतिशत अंतर मानिए: x = अंतर x 100 / प्रतिशत अंतर = ${d} x 100 / ${p - q}। एक भाग।`
    ),
    B(
      `Trap: dividing 100 by ${p - q} first. Always do (difference x 100) / (percentage difference) in one step.`,
      `सावधानी: पहले 100 को ${p - q} से भाग देना। हमेशा (अंतर x 100) / (प्रतिशत अंतर) एक चरण में कीजिए।`
    )
  );
};

const qCpFromSp: Gen = (lvl) => {
  const g = pick([10, 12, 15, 20, 25, 30, 40, 50].slice(0, 6 + lvl));
  const cp = ri(3, 14) * 200;
  const sp = cp + (cp * g) / 100;
  const r = gcd(100, g);
  return mk(
    "QUANT",
    B("Profit & Loss", "लाभ एवं हानि"),
    B("Cost price from selling price", "विक्रय मूल्य से क्रय मूल्य"),
    B(
      `A shopkeeper sells an article for ${rup(sp)} and gains ${g}%. What is the cost price?`,
      `एक दुकानदार वस्तु ${rup(sp)} में बेचकर ${g}% लाभ कमाता है। क्रय मूल्य क्या है?`
    ),
    N(rup(cp)),
    NL([rup(sp - (sp * g) / 100), rup(Math.round(sp * (1 - g / 100))), rup(cp + 50), rup(sp - 100)]),
    B(
      `SP = CP x (100 + gain%)/100, so CP = ${rup(sp)} x 100 / ${100 + g} = ${rup(cp)}.`,
      `विक्रय मूल्य = क्रय मूल्य x (100 + लाभ%)/100, अतः क्रय मूल्य = ${rup(sp)} x 100 / ${100 + g} = ${rup(cp)}।`
    ),
    B(
      `Fraction route: ${g}% gain means CP : SP = ${100 / r} : ${(100 + g) / r}. Divide SP by ${(100 + g) / r}, multiply by ${100 / r}: ${rup(cp)}.`,
      `भिन्न विधि: ${g}% लाभ पर क्रय : विक्रय = ${100 / r} : ${(100 + g) / r}। विक्रय मूल्य को ${(100 + g) / r} से भाग देकर ${100 / r} से गुणा कीजिए: ${rup(cp)}।`
    ),
    B(
      `Trap: subtracting the gain % from SP (${rup(Math.round(sp * (1 - g / 100)))}). Gain % is always on CP.`,
      `सावधानी: विक्रय मूल्य से लाभ% घटा देना (${rup(Math.round(sp * (1 - g / 100)))})। लाभ% हमेशा क्रय मूल्य पर होता है।`
    )
  );
};

const qTwoArticles: Gen = () => {
  const p = pick([10, 15, 20, 25, 30]);
  const sp = ri(4, 20) * 250;
  const loss = (p * p) / 100;
  return mk(
    "QUANT",
    B("Profit & Loss", "लाभ एवं हानि"),
    B("Two articles sold at the same price", "समान मूल्य पर दो वस्तुओं की बिक्री"),
    B(
      `A shopkeeper sells two articles for ${rup(sp)} each. On one he gains ${p}% and on the other he loses ${p}%. What is the overall profit or loss percentage?`,
      `एक दुकानदार दो वस्तुएँ प्रत्येक ${rup(sp)} में बेचता है। एक पर ${p}% लाभ और दूसरी पर ${p}% हानि होती है। कुल लाभ या हानि प्रतिशत क्या है?`
    ),
    N(`Loss of ${trim(loss)}%`),
    NL(["No profit, no loss", `Loss of ${p}%`, `Profit of ${trim(loss)}%`, `Loss of ${trim(loss * 2)}%`]),
    B(
      `Same selling price with equal gain and loss % always gives a net loss of p²/100 = ${p}²/100 = ${trim(loss)}%.`,
      `समान विक्रय मूल्य पर बराबर लाभ-हानि % हमेशा p²/100 = ${p}²/100 = ${trim(loss)}% की शुद्ध हानि देती है।`
    ),
    B(`Stamp it: SAME PRICE + equal gain & loss = LOSS of p²/100 %. Two seconds.`, `याद रखिए: समान मूल्य + बराबर लाभ-हानि = p²/100 % हानि। दो सेकंड।`),
    B(
      `Trap: "no profit, no loss" — the symmetry is a lie, the loss is always heavier.`,
      `सावधानी: "न लाभ न हानि" — समानता छलावा है, हानि हमेशा अधिक होती है।`
    )
  );
};

const qSI: Gen = (lvl) => {
  const P = ri(2, 12 + lvl * 2) * 2500;
  const r = ri(4, 14);
  const t = ri(2, 5);
  const si = (P * r * t) / 100;
  return mk(
    "QUANT",
    B("Simple Interest", "साधारण ब्याज"),
    B("Direct SI computation", "सीधी साधारण ब्याज गणना"),
    B(
      `Find the simple interest on ${rup(P)} at ${r}% per annum for ${t} years.`,
      `${rup(P)} पर ${r}% वार्षिक दर से ${t} वर्षों का साधारण ब्याज ज्ञात कीजिए।`
    ),
    N(rup(si)),
    NL([rup(si + 500), rup(Math.round((P * r * (t + 1)) / 100)), rup(P - si), rup(Math.round(si * 1.5))]),
    B(`SI = P x r x t / 100 = ${rup(P)} x ${r} x ${t} / 100 = ${rup(si)}.`, `साधारण ब्याज = मूलधन x दर x समय / 100 = ${rup(P)} x ${r} x ${t} / 100 = ${rup(si)}।`),
    B(
      `10% blocks: 10% of ${rup(P)} = ${rup(P / 10)}; ${r}% = ${rup((P * r) / 100)} per year; x ${t} = ${rup(si)}.`,
      `10% के समूह: ${rup(P)} का 10% = ${rup(P / 10)}; ${r}% = ${rup((P * r) / 100)} प्रति वर्ष; x ${t} = ${rup(si)}।`
    ),
    B(
      `Trap: taking the rate for the whole period instead of per annum (${rup((P * r) / 100)}).`,
      `सावधानी: दर को पूरी अवधि का मान लेना (${rup((P * r) / 100)})। दर वार्षिक होती है।`
    )
  );
};

const qCIDiff: Gen = (lvl) => {
  const r = pick([10, 12, 15, 20]);
  const unit = 10000 / gcd(r * r, 10000);
  const P = unit * ri(6, 30 + lvl * 6);
  const d = (P * r * r) / 10000;
  return mk(
    "QUANT",
    B("Compound Interest", "चक्रवृद्धि ब्याज"),
    B("CI minus SI for two years", "दो वर्षों का चक्रवृद्धि - साधारण ब्याज अंतर"),
    B(
      `The difference between compound interest and simple interest on ${rup(P)} at ${r}% per annum for 2 years is:`,
      `${rup(P)} पर ${r}% वार्षिक दर से 2 वर्षों का चक्रवृद्धि ब्याज और साधारण ब्याज में अंतर क्या है?`
    ),
    N(rup(d)),
    NL([rup(d * 2), rup(Math.round((P * r) / 100)), rup(d + 10), rup(d / 2)]),
    B(
      `SI for 2 years = 2Pr/100 = ${rup((2 * P * r) / 100)}. CI for 2 years exceeds it by ${rup(d)}.`,
      `2 वर्ष का साधारण ब्याज = 2Pr/100 = ${rup((2 * P * r) / 100)}। चक्रवृद्धि ब्याज इससे ${rup(d)} अधिक है।`
    ),
    B(`Standard 2-year shortcut: difference = P(r/100)² = ${rup(P)} x (${r}/100)² = ${rup(d)}.`, `मानक सूत्र: अंतर = P(r/100)² = ${rup(P)} x (${r}/100)² = ${rup(d)}।`),
    B(
      `Trap: using P(r/100) for two years. The extra factor of r/100 is what the options are built on.`,
      `सावधानी: दो वर्षों के लिए P(r/100) लगाना। अतिरिक्त r/100 का गुणक ही विकल्पों का आधार है।`
    )
  );
};

const qTrain: Gen = (lvl) => {
  const v = pick([36, 54, 72, 90, 108]);
  const mps = v / 3.6;
  const t = ri(6, 18 + lvl * 4);
  const L = Math.round(mps * t);
  return mk(
    "QUANT",
    B("Time, Speed & Distance", "समय, चाल एवं दूरी"),
    B("Train crossing a pole", "खंभे को पार करती रेलगाड़ी"),
    B(
      `A train ${L} metres long crosses a pole in ${t} seconds. What is its speed in km/h?`,
      `${L} मीटर लंबी रेलगाड़ी एक खंभे को ${t} सेकंड में पार करती है। उसकी चाल किमी/घंटा में क्या है?`
    ),
    N(`${v} km/h`),
    NL([`${Math.round(v * 1.6)} km/h`, `${Math.round(v / 1.8)} km/h`, `${Math.round(v * 0.6)} km/h`, `${Math.round(v + 9)} km/h`]),
    B(
      `Speed = ${L}/${t} = ${trim(mps)} m/s. Convert: ${trim(mps)} x 18/5 = ${v} km/h.`,
      `चाल = ${L}/${t} = ${trim(mps)} मी/से। बदलिए: ${trim(mps)} x 18/5 = ${v} किमी/घंटा।`
    ),
    B(`m/s to km/h is always x 3.6: ${trim(mps)} x 3.6 = ${v}.`, `मी/से से किमी/घंटा हमेशा x 3.6: ${trim(mps)} x 3.6 = ${v}।`),
    B(
      `Trap: crossing a POLE means distance = train length only.`,
      `सावधानी: खंभे के मामले में दूरी = केवल रेलगाड़ी की लंबाई। लंबाई दो बार न जोड़िए।`
    )
  );
};

const qBoat: Gen = (lvl) => {
  const s = ri(2, 4 + lvl);
  const b = s + ri(4, 12);
  const down = b + s;
  const up = b - s;
  return mk(
    "QUANT",
    B("Boats & Streams", "नाव एवं धारा"),
    B("Speed of the stream", "धारा की चाल"),
    B(
      `A boat covers ${down} km/h downstream and ${up} km/h upstream. What is the speed of the stream?`,
      `एक नाव अनुप्रवाह में ${down} किमी/घंटा और उपरावाह में ${up} किमी/घंटा की चाल से चलती है। धारा की चाल क्या है?`
    ),
    N(`${s} km/h`),
    NL([`${b} km/h`, `${s + 2} km/h`, `${Math.round((down + up) / 4)} km/h`, `${Math.max(1, s - 1)} km/h`]),
    B(
      `Downstream = b + s = ${down}, upstream = b - s = ${up}. Subtracting: 2s = ${2 * s}, so s = ${s} km/h.`,
      `अनुप्रवाह = नाव + धारा = ${down}, उपरावाह = नाव - धारा = ${up}। घटाने पर 2s = ${2 * s}, अतः s = ${s} किमी/घंटा।`
    ),
    B(`Down - Up = 2 x stream, Down + Up = 2 x boat. Halve either — never solve two equations.`, `अंतर = 2 x धारा, योग = 2 x नाव। किसी एक का आधा लीजिए — दो समीकरण हल मत कीजिए।`),
    B(
      `Trap: answering the boat's still-water speed (${b} km/h). Read which one is asked.`,
      `सावधानी: नाव की स्थिर जल में चाल (${b} किमी/घंटा) दे देना। देखिए क्या पूछा है।`
    )
  );
};

const qWork: Gen = () => {
  const pairs: [number, number][] = [
    [3, 6], [4, 12], [6, 12], [10, 15], [5, 20], [8, 24], [9, 18], [12, 24], [15, 30], [20, 30], [12, 6], [7, 21], [6, 3], [25, 15],
  ];
  const pr = pick(pairs);
  const a = pr[0];
  const b = pr[1];
  const days = (a * b) / (a + b);
  const totalUnits = (a * b) / gcd(a, b);
  return mk(
    "QUANT",
    B("Time & Work", "समय एवं कार्य"),
    B("Combined work rate", "संयुक्त कार्य दर"),
    B(
      `A can finish a work in ${a} days and B in ${b} days. Working together they will finish it in:`,
      `A किसी कार्य को ${a} दिनों में तथा B ${b} दिनों में कर सकता है। दोनों मिलकर उसे कितने दिनों में करेंगे?`
    ),
    N(`${trim(days, 2)} days`),
    NL([`${trim(days / 2, 2)} days`, `${trim((a + b) / 2, 2)} days`, `${trim(days + 2, 2)} days`, `${trim(a + b, 2)} days`]),
    B(
      `One day work = 1/${a} + 1/${b} = ${(a + b) / (a * b)}. Time = ab/(a+b) = ${a} x ${b}/${a + b} = ${trim(days, 2)} days.`,
      `एक दिन का कार्य = 1/${a} + 1/${b} = ${(a + b) / (a * b)}। समय = ab/(a+b) = ${a} x ${b}/${a + b} = ${trim(days, 2)} दिन।`
    ),
    B(
      `Total work = LCM = ${totalUnits} units. A = ${totalUnits / a}/day, B = ${totalUnits / b}/day. ${totalUnits} / ${totalUnits / a + totalUnits / b} = ${trim(days, 2)} days.`,
      `कुल कार्य = लघुत्तम समापवर्त्य = ${totalUnits} इकाई। A = ${totalUnits / a}/दिन, B = ${totalUnits / b}/दिन। ${totalUnits} / ${totalUnits / a + totalUnits / b} = ${trim(days, 2)} दिन।`
    ),
    B(
      `Trap: adding the DAYS. Rates add, time never does.`,
      `सावधानी: दिनों को जोड़ लेना। दरें जुड़ती हैं, समय नहीं।`
    )
  );
};

const qAverageAdd: Gen = (lvl) => {
  const n = ri(8, 24 + lvl * 6);
  const A = ri(12, 40);
  const inc = ri(2, 8);
  const val = A + (n + 1) * inc;
  return mk(
    "QUANT",
    B("Average", "औसत"),
    B("Effect of adding a new value", "नई संख्या जोड़ने का प्रभाव"),
    B(
      `The average of ${n} numbers is ${A}. When a new number is added the average increases by ${inc}. What is the new number?`,
      `${n} संख्याओं का औसत ${A} है। एक नई संख्या जोड़ने पर औसत ${inc} बढ़ जाता है। वह नई संख्या क्या है?`
    ),
    N(val),
    NL([A + inc, val - inc * n, A * 2, val + n]),
    B(
      `Old total = ${n} x ${A} = ${n * A}. New total = ${n + 1} x ${A + inc} = ${(n + 1) * (A + inc)}. New number = ${val}.`,
      `पुराना योग = ${n} x ${A} = ${n * A}। नया योग = ${n + 1} x ${A + inc} = ${(n + 1) * (A + inc)}। नई संख्या = ${val}।`
    ),
    B(`Shortcut: new number = old average + (n + 1) x rise = ${A} + ${n + 1} x ${inc} = ${val}.`, `छोटा तरीका: नई संख्या = पुराना औसत + (n + 1) x वृद्धि = ${A} + ${n + 1} x ${inc} = ${val}।`),
    B(
      `Trap: using n instead of n + 1, which gives ${A + n * inc}.`,
      `सावधानी: n का उपयोग करना (n + 1 के बजाय), जिससे ${A + n * inc} आता है।`
    )
  );
};

const qHcfLcm: Gen = (lvl) => {
  const h = pick([4, 6, 8, 12, 15]);
  const p = pick([3, 5, 7, 11]);
  const q = pick([9, 13, 17, 19, 23].slice(0, 3 + lvl));
  const l = h * p * q;
  const a = h * p;
  const other = h * q;
  return mk(
    "QUANT",
    B("Number System", "संख्या पद्धति"),
    B("HCF-LCM product relation", "म.स. - ल.स. गुणनफल संबंध"),
    B(
      `The HCF and LCM of two numbers are ${h} and ${l}. If one number is ${a}, the other is:`,
      `दो संख्याओं का म.स. ${h} और ल.स. ${l} है। यदि एक संख्या ${a} हो, तो दूसरी संख्या क्या है?`
    ),
    N(other),
    NL([l / p, h * p * 2, other + h, Math.round(l / h)]),
    B(`Product of the numbers = HCF x LCM = ${h} x ${l} = ${h * l}. Other = ${h * l}/${a} = ${other}.`, `संख्याओं का गुणनफल = म.स. x ल.स. = ${h} x ${l} = ${h * l}। दूसरी संख्या = ${h * l}/${a} = ${other}।`),
    B(`Just divide: ${l} / ${p} = ${other}. Cancel ${h} first.`, `सीधा भाग: ${l} / ${p} = ${other}। पहले ${h} काटिए।`),
    B(
      `Trap: dividing LCM by the number alone (${Math.round(l / a)}). The relation holds only for TWO numbers.`,
      `सावधानी: केवल ल.स. को संख्या से भाग देना (${Math.round(l / a)})। यह संबंध केवल दो संख्याओं के लिए मान्य है।`
    )
  );
};

const qAlgebra: Gen = () => {
  const variant = ri(0, 1);
  if (variant === 0) {
    const k = ri(3, 9);
    const val = k * k - 2;
    return mk(
      "QUANT",
      B("Algebra", "बीजगणित"),
      B("x + 1/x identities", "x + 1/x सर्वसमिकाएँ"),
      B(`If x + 1/x = ${k}, then x² + 1/x² is:`, `यदि x + 1/x = ${k} हो, तो x² + 1/x² का मान क्या होगा?`),
      N(val),
      NL([k * k, val + 2, val - 2, k * 2]),
      B(`Square both sides: (x + 1/x)² = x² + 1/x² + 2, so x² + 1/x² = ${k}² - 2 = ${val}.`, `दोनों पक्षों का वर्ग: (x + 1/x)² = x² + 1/x² + 2, अतः x² + 1/x² = ${k}² - 2 = ${val}।`),
      B(`Identity bank: x² + 1/x² = k² - 2; x³ + 1/x³ = k³ - 3k.`, `सर्वसमिका: x² + 1/x² = k² - 2; x³ + 1/x³ = k³ - 3k।`),
      B(`Trap: forgetting the -2 and marking ${k * k}.`, `सावधानी: -2 भूल जाना और ${k * k} चुन लेना।`)
    );
  }
  const s = ri(6, 20);
  const ab = ri(6, 40);
  const val = s * s - 2 * ab;
  return mk(
    "QUANT",
    B("Algebra", "बीजगणित"),
    B("a² + b² from (a + b)²", "(a + b)² से a² + b²"),
    B(`If a + b = ${s} and ab = ${ab}, then a² + b² is:`, `यदि a + b = ${s} और ab = ${ab} हो, तो a² + b² का मान क्या होगा?`),
    N(val),
    NL([s * s, val + ab, val - ab, 2 * ab]),
    B(`(a + b)² = a² + b² + 2ab, so a² + b² = ${s}² - 2(${ab}) = ${val}.`, `(a + b)² = a² + b² + 2ab, अतः a² + b² = ${s}² - 2(${ab}) = ${val}।`),
    B(`Compute (a + b)² - 2ab = ${s * s} - ${2 * ab} = ${val}. Also: (a-b)² = (a+b)² - 4ab.`, `(a + b)² - 2ab = ${s * s} - ${2 * ab} = ${val}। याद रखिए: (a-b)² = (a+b)² - 4ab।`),
    B(`Trap: subtracting ONE ab instead of 2ab (${s * s - ab}).`, `सावधानी: 2ab के बजाय केवल एक ab घटाना (${s * s - ab})।`)
  );
};

const qClock: Gen = () => {
  const h = ri(1, 12);
  const m = pick([0, 10, 20, 30, 40, 50]);
  const raw = Math.abs(30 * h - 5.5 * m);
  const ang = Math.min(raw, 360 - raw);
  return mk(
    "QUANT",
    B("Geometry / Clocks", "ज्यामिति / घड़ी"),
    B("Angle between clock hands", "घड़ी की सुइयों के बीच कोण"),
    B(
      `What is the angle between the hour hand and the minute hand at ${h}:${m.toString().padStart(2, "0")}?`,
      `${h}:${m.toString().padStart(2, "0")} बजे घंटे और मिनट की सुइयों के बीच कोण कितना होगा?`
    ),
    N(`${trim(ang, 1)}°`),
    NL([`${trim(Math.abs(30 * h - 6 * m), 1)}°`, `${trim(ang + 15, 1)}°`, `${trim((ang + 30) % 360, 1)}°`, `${trim(180 - ang, 1)}°`]),
    B(
      `Hour hand 0.5°/min, minute hand 6°/min. Angle = |30H - 5.5M| = |${30 * h} - ${trim(5.5 * m, 1)}| = ${trim(raw, 1)}°, so the smaller angle is ${trim(ang, 1)}°.`,
      `घंटे की सुई 0.5°/मिनट, मिनट की सुई 6°/मिनट। कोण = |30H - 5.5M| = |${30 * h} - ${trim(5.5 * m, 1)}| = ${trim(raw, 1)}°, छोटा कोण ${trim(ang, 1)}°।`
    ),
    B(`Use |30H - 11M/2| directly — never draw the clock.`, `सीधे |30H - 11M/2| प्रयोग कीजिए — घड़ी बनाने की आवश्यकता नहीं।`),
    B(
      `Trap: using 6°/min for the hour hand (${trim(Math.abs(30 * h - 6 * m), 1)}°). The angle is never above 180°.`,
      `सावधानी: घंटे की सुई पर 6°/मिनट लगाना (${trim(Math.abs(30 * h - 6 * m), 1)}°)। कोण 180° से अधिक नहीं होता।`
    )
  );
};

const qDiscount: Gen = (lvl) => {
  const x = ri(3, 20 + lvl * 6) * 200;
  const a = pick([10, 20, 25, 30]);
  const b = pick([5, 10, 15, 20, 25]);
  const sp = x * ((100 - a) / 100) * ((100 - b) / 100);
  return mk(
    "QUANT",
    B("Profit & Loss", "लाभ एवं हानि"),
    B("Successive discounts", "क्रमिक छूट"),
    B(
      `The marked price is ${rup(x)}. Two successive discounts of ${a}% and ${b}% are allowed. What is the selling price?`,
      `अंकित मूल्य ${rup(x)} है। क्रमशः ${a}% और ${b}% की दो छूट दी जाती हैं। विक्रय मूल्य क्या होगा?`
    ),
    N(rup(sp)),
    NL([rup(x * (1 - (a + b) / 100)), rup(sp + x * 0.05), rup(x - sp), rup(sp * 1.1)]),
    B(
      `SP = ${rup(x)} x ${(100 - a) / 100} x ${(100 - b) / 100} = ${rup(sp)}.`,
      `विक्रय मूल्य = ${rup(x)} x ${(100 - a) / 100} x ${(100 - b) / 100} = ${rup(sp)}।`
    ),
    B(
      `Single equivalent discount = a + b - ab/100 = ${trim(a + b - (a * b) / 100)}%, so SP = ${rup(sp)}.`,
      `समकक्ष एकल छूट = a + b - ab/100 = ${trim(a + b - (a * b) / 100)}%, अतः विक्रय मूल्य = ${rup(sp)}।`
    ),
    B(
      `Trap: adding the discounts (${a + b}% gives ${rup(x * (1 - (a + b) / 100))}). Successive discounts multiply.`,
      `सावधानी: छूटों को जोड़ देना (${a + b}% से ${rup(x * (1 - (a + b) / 100))} आता है)। क्रमिक छूट गुणा होती हैं।`
    )
  );
};

const qMixture: Gen = (lvl) => {
  const p = pick([2, 3, 4]);
  const q = pick([1, 2, 3]);
  const r = q + ri(1, 3 + lvl);
  const u = ri(2, 12);
  const total = (p + q) * u;
  const add = (r - q) * u;
  return mk(
    "QUANT",
    B("Ratio & Mixture", "अनुपात एवं मिश्रण"),
    B("Water added to change the ratio", "अनुपात बदलने के लिए जल मिश्रण"),
    B(
      `A ${total}-litre mixture has milk and water in the ratio ${p}:${q}. How much water must be added to make it ${p}:${r}?`,
      `${total} लीटर मिश्रण में दूध और जल ${p}:${q} के अनुपात में हैं। अनुपात ${p}:${r} करने के लिए कितना जल मिलाना होगा?`
    ),
    N(`${add} litres`),
    NL([`${add + u} litres`, `${u} litres`, `${add - u > 0 ? add - u : add + 2 * u} litres`, `${total - add} litres`]),
    B(
      `Milk is fixed: ${p}u = ${p * u} L. For ratio ${p}:${r} water must be ${r}u = ${r * u} L. Added = ${r * u} - ${q * u} = ${add} L.`,
      `दूध स्थिर है: ${p}u = ${p * u} ली। ${p}:${r} अनुपात के लिए जल ${r}u = ${r * u} ली चाहिए। मिलाना है = ${r * u} - ${q * u} = ${add} ली।`
    ),
    B(`Work in UNITS: one unit = ${u} L; (${r} - ${q}) x ${u} = ${add} L.`, `इकाइयों में सोचिए: एक इकाई = ${u} ली; (${r} - ${q}) x ${u} = ${add} ली।`),
    B(
      `Trap: recomputing the total volume. Only WATER changes — fix the milk and compare units.`,
      `सावधानी: कुल आयतन दोबारा निकालना। केवल जल बदलता है — दूध स्थिर रखिए।`
    )
  );
};

const qAges: Gen = () => {
  const p = ri(2, 5);
  const q = ri(1, Math.max(1, p - 1));
  const k = ri(2, 9);
  const t = ri(2, 8);
  const A = p * k;
  const Bv = q * k;
  const g = gcd(A + t, Bv + t);
  const r = (A + t) / g;
  const s = (Bv + t) / g;
  return mk(
    "QUANT",
    B("Ratio & Proportion", "अनुपात एवं समानुपात"),
    B("Ages — present and future ratio", "आयु — वर्तमान एवं भावी अनुपात"),
    B(
      `The present ages of A and B are in the ratio ${p}:${q}. After ${t} years the ratio becomes ${r}:${s}. What is the present age of A?`,
      `A और B की वर्तमान आयु का अनुपात ${p}:${q} है। ${t} वर्ष बाद अनुपात ${r}:${s} हो जाता है। A की वर्तमान आयु क्या है?`
    ),
    N(`${A} years`),
    NL([`${Bv} years`, `${A + t} years`, `${A + k} years`, `${A + p} years`]),
    B(
      `Let ages be ${p}x and ${q}x. (${p}x + ${t})/(${q}x + ${t}) = ${r}/${s} gives x = ${k}, so A = ${A} years.`,
      `आयु ${p}x और ${q}x मानिए। (${p}x + ${t})/(${q}x + ${t}) = ${r}/${s} से x = ${k}, अतः A = ${A} वर्ष।`
    ),
    B(
      `Back-substitute the options: the correct pair must give ${A + t} : ${Bv + t} = ${r}:${s}.`,
      `विकल्पों को रखकर जाँचिए: सही जोड़ी पर ${A + t} : ${Bv + t} = ${r}:${s} आना चाहिए।`
    ),
    B(
      `Trap: applying ${r}:${s} to the PRESENT ages. Add ${t} years to both first.`,
      `सावधानी: ${r}:${s} को वर्तमान आयु पर लगाना। पहले दोनों में ${t} वर्ष जोड़िए।`
    )
  );
};

const qRemainder: Gen = (_lvl) => {
  const h = pick([4, 6, 7, 8, 9, 12]);
  const m = [ri(2, 5), ri(2, 5), ri(2, 5)];
  const r = ri(1, 3);
  const nums = m.map((x) => h * x + r);
  return mk(
    "QUANT",
    B("Number System", "संख्या पद्धति"),
    B("Greatest divisor with equal remainder", "समान शेषफल देने वाला महत्तम भाजक"),
    B(
      `Find the greatest number which divides ${nums.join(", ")} leaving the same remainder ${r} in each case.`,
      `वह महत्तम संख्या ज्ञात कीजिए जो ${nums.join(", ")} को भाग देने पर प्रत्येक में समान शेषफल ${r} दे।`
    ),
    N(h),
    NL([h * 2, h + r, gcd(nums[0], nums[1]), h - 1 > 1 ? h - 1 : h + 1]),
    B(
      `Subtract the common remainder: ${nums.map((x) => `${x} - ${r} = ${x - r}`).join(", ")}. Required number = HCF = ${h}.`,
      `समान शेषफल घटाइए: ${nums.map((x) => `${x} - ${r} = ${x - r}`).join(", ")}। आवश्यक संख्या = म.स. = ${h}।`
    ),
    B(`Remove the remainder FIRST, then take the HCF — visible instantly.`, `पहले शेषफल हटाइए, फिर म.स. लीजिए — तुरंत दिख जाएगा।`),
    B(
      `Trap: computing the HCF of the raw numbers without stripping the remainder.`,
      `सावधानी: शेषफल हटाए बिना मूल संख्याओं का म.स. निकालना।`
    )
  );
};

const qSquareTrick: Gen = (lvl) => {
  const x = ri(20, 60 + lvl * 30);
  const y = ri(2, 15);
  const val = (x + y) * (x - y);
  return mk(
    "QUANT",
    B("Simplification", "सरलीकरण"),
    B("Difference of squares", "वर्गों का अंतर"),
    B(`The value of ${x + y}² - ${x - y}² is:`, `${x + y}² - ${x - y}² का मान क्या होगा?`),
    N(val),
    NL([2 * y * y, val + 2 * x, x * x - y * y, val - 4 * x * y]),
    B(
      `(a² - b²) = (a - b)(a + b) = ${2 * y} x ${2 * x} = ${val}.`,
      `(a² - b²) = (a - b)(a + b) = ${2 * y} x ${2 * x} = ${val}।`
    ),
    B(`Never square the numbers. (a-b) = ${2 * y}, (a+b) = ${2 * x}; multiply. Also 4ab = ${val}.`, `संख्याओं का वर्ग मत कीजिए। (a-b) = ${2 * y}, (a+b) = ${2 * x}; गुणा कीजिए। 4ab भी ${val} है।`),
    B(`Trap: expanding both squares and subtracting — slow and error-prone.`, `सावधानी: दोनों वर्ग खोलकर घटाना — धीमा और त्रुटिपूर्ण।`)
  );
};

const qDI: Gen = (_lvl) => {
  const years = [2021, 2022, 2023, 2024, 2025];
  let base = ri(180, 320);
  const vals = years.map((y, i) => {
    base += i === 0 ? 0 : ri(10, 45) - (Math.random() < 0.22 ? ri(20, 45) : 0);
    return { y, v: base };
  });
  const table = "YEAR   SALES (in thousand units)\n" + vals.map((d) => `${d.y}    ${d.v}`).join("\n");
  const kind = ri(0, 2);
  if (kind === 0) {
    const inc = ((vals[4].v - vals[1].v) / vals[1].v) * 100;
    return mk(
      "QUANT",
      B("Data Interpretation", "आँकड़ा व्याख्या"),
      B("Percentage change from a table", "तालिका से प्रतिशत परिवर्तन"),
      B(
        `Study the table and find the percentage increase in sales from ${vals[1].y} to ${vals[4].y}.`,
        `तालिका का अध्ययन कर ${vals[1].y} से ${vals[4].y} के बीच बिक्री में प्रतिशत वृद्धि ज्ञात कीजिए।`
      ),
      N(`${trim(inc, 2)}%`),
      NL([`${trim(inc + 5, 2)}%`, `${trim(inc - 5, 2)}%`, `${trim((vals[4].v / vals[1].v) * 100, 2)}%`, `${trim(vals[4].v - vals[1].v, 2)}%`]),
      B(
        `Change = ${vals[4].v} - ${vals[1].v} = ${vals[4].v - vals[1].v}. Percentage = (${vals[4].v - vals[1].v}/${vals[1].v}) x 100 = ${trim(inc, 2)}%.`,
        `परिवर्तन = ${vals[4].v} - ${vals[1].v} = ${vals[4].v - vals[1].v}। प्रतिशत = (${vals[4].v - vals[1].v}/${vals[1].v}) x 100 = ${trim(inc, 2)}%।`
      ),
      B(
        `Approximate first: ${vals[4].v - vals[1].v} out of ${vals[1].v} is roughly ${Math.round(inc)}%. Only one option lives there.`,
        `पहले अनुमान लगाइए: ${vals[1].v} में से ${vals[4].v - vals[1].v} लगभग ${Math.round(inc)}% है। वहीं एक विकल्प होगा।`
      ),
      B(
        `Trap: using ${vals[4].v} as the base. Percentage increase is always on the EARLIER value.`,
        `सावधानी: ${vals[4].v} को आधार बनाना। वृद्धि प्रतिशत हमेशा पूर्ववर्ती मान पर होती है।`,
        ),
      table
    );
  }
  if (kind === 1) {
    const avg = vals.reduce((s, d) => s + d.v, 0) / vals.length;
    return mk(
      "QUANT",
      B("Data Interpretation", "आँकड़ा व्याख्या"),
      B("Average from a table", "तालिका से औसत"),
      B(
        `What is the average annual sales (in thousand units) over the five years shown?`,
        `दर्शाए गए पाँच वर्षों की औसत वार्षिक बिक्री (हज़ार इकाइयों में) क्या है?`
      ),
      N(trim(avg, 2)),
      NL([trim(avg + 12, 2), trim(avg - 12, 2), trim(avg * 1.2, 2), vals[2].v]),
      B(
        `Total = ${vals.reduce((s, d) => s + d.v, 0)}; average = total/5 = ${trim(avg, 2)}.`,
        `कुल = ${vals.reduce((s, d) => s + d.v, 0)}; औसत = कुल/5 = ${trim(avg, 2)}।`
      ),
      B(
        `Assume an average of ${vals[2].v}, then add the mean deviation: ${trim(avg, 2)}. Deviations are small two-digit numbers.`,
        `${vals[2].v} को मान्य औसत मानकर विचलनों का औसत जोड़िए: ${trim(avg, 2)}। विचलन छोटी द्विअंक संख्याएँ हैं।`
      ),
      B(
        `Trap: averaging the year-on-year increases instead of the absolute values.`,
        `सावधानी: वार्षिक वृद्धि का औसत निकालना, वास्तविक मानों का नहीं।`
      ),
      table
    );
  }
  const g = gcd(vals[0].v, vals[3].v);
  return mk(
    "QUANT",
    B("Data Interpretation", "आँकड़ा व्याख्या"),
    B("Ratio from a table", "तालिका से अनुपात"),
    B(
      `What is the ratio of sales in ${vals[0].y} to the sales in ${vals[3].y}?`,
      `${vals[0].y} की बिक्री और ${vals[3].y} की बिक्री का अनुपात क्या है?`
    ),
    N(`${vals[0].v / g} : ${vals[3].v / g}`),
    NL([
      `${vals[1].v / gcd(vals[1].v, vals[3].v)} : ${vals[3].v / gcd(vals[1].v, vals[3].v)}`,
      `1 : ${trim(vals[3].v / vals[0].v, 2)}`,
      `${vals[0].v} : ${vals[3].v}`,
      `${vals[3].v / g} : ${vals[0].v / g}`,
    ]),
    B(
      `Ratio = ${vals[0].v} : ${vals[3].v}. Dividing both by the HCF ${g} gives ${vals[0].v / g} : ${vals[3].v / g}.`,
      `अनुपात = ${vals[0].v} : ${vals[3].v}। दोनों को म.स. ${g} से भाग देने पर ${vals[0].v / g} : ${vals[3].v / g}।`
    ),
    B(`Cancel obvious common factors first — one look is enough.`, `पहले स्पष्ट उभयनिष्ठ गुणन काटिए — एक नज़र पर्याप्त है।`),
    B(
      `Trap: writing the raw numbers when the options are in reduced form.`,
      `सावधानी: विकल्प सरल रूप में हों तो मूल संख्याएँ न लिखिए।`
    ),
    table
  );
};

/* ------------------------- latest-pattern additions ------------------------- */
const qTrig: Gen = () => {
  const table: [string, number, number][] = [
    ["sin 30°", 0.5, 1], ["cos 60°", 0.5, 1], ["tan 45°", 1, 1],
    ["sin 45°", 0.707, 3], ["cos 45°", 0.707, 3], ["tan 60°", 1.732, 3],
    ["sin 60°", 0.866, 3], ["cos 30°", 0.866, 3], ["tan 30°", 0.577, 3],
    ["sin 90°", 1, 1], ["cos 0°", 1, 1], ["tan 0°", 0, 1],
  ];
  const item = pick(table);
  const label = item[0];
  const val = item[2] === 1 ? String(item[1]) : item[1].toFixed(3);
  return mk(
    "QUANT",
    B("Trigonometry", "त्रिकोणमिति"),
    B("Standard trigonometric values", "मानक त्रिकोणमितीय मान"),
    B(`The value of ${label} is:`, `${label} का मान क्या है?`),
    N(val),
    NL([item[2] === 1 ? String(item[1] * 2) : (item[1] + 0.173).toFixed(3), item[2] === 1 ? String(Math.max(0, item[1] - 0.5)) : (item[1] - 0.173).toFixed(3), item[2] === 1 ? "2" : (item[1] / 2).toFixed(3)]),
    B(
      `From the standard table: sin 0° = 0, sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2, sin 90° = 1 (and cos is the reverse).`,
      `मानक तालिका से: sin 0° = 0, sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2, sin 90° = 1 (और cos क्रम उल्टा है)।`
    ),
    B(
      `Memorise one row only: 0, 1/2, 1/√2, √3/2, 1. cos reads it backwards, tan = sin/cos.`,
      `सिर्फ़ एक पंक्ति याद रखिए: 0, 1/2, 1/√2, √3/2, 1। cos उसे उल्टा पढ़ता है, tan = sin/cos।`
    ),
    B(
      `Trap: swapping sin and cos values — they are the same set read in opposite directions.`,
      `सावधानी: sin और cos के मान आपस में बदल जाना — दोनों एक ही श्रृंखला विपरीत दिशा से हैं।`
    )
  );
};

const qSphere: Gen = () => {
  const r = pick([7, 14, 21]);
  const kind = ri(0, 1);
  const val = kind === 0 ? (4 * 22 * r * r) / (3 * 7) : (4 * 22 * r * r) / 7;
  return mk(
    "QUANT",
    B("Mensuration", "क्षेत्रमिति"),
    kind === 0 ? B("Volume of a sphere", "गोले का आयतन") : B("Surface area of a sphere", "गोले का पृष्ठीय क्षेत्रफल"),
    kind === 0
      ? B(`Find the volume of a sphere of radius ${r} cm. (Take π = 22/7)`, `${r} सेमी त्रिज्या वाले गोले का आयतन ज्ञात कीजिए। (π = 22/7 लीजिए)`)
      : B(`Find the surface area of a sphere of radius ${r} cm. (Take π = 22/7)`, `${r} सेमी त्रिज्या वाले गोले का पृष्ठीय क्षेत्रफल ज्ञात कीजिए। (π = 22/7 लीजिए)`),
    N(`${trim(val, 2)} ${kind === 0 ? "cm³" : "cm²"}`),
    NL([
      `${trim(val + 100, 2)} ${kind === 0 ? "cm³" : "cm²"}`,
      `${trim(val / 2, 2)} ${kind === 0 ? "cm³" : "cm²"}`,
      `${trim(val * 1.5, 2)} ${kind === 0 ? "cm³" : "cm²"}`,
    ]),
    kind === 0
      ? B(`V = 4/3 πr³ = 4/3 x 22/7 x ${r}³ = ${trim(val, 2)} cm³.`, `आयतन = 4/3 πr³ = 4/3 x 22/7 x ${r}³ = ${trim(val, 2)} घन सेमी।`)
      : B(`SA = 4πr² = 4 x 22/7 x ${r}² = ${trim(val, 2)} cm².`, `पृष्ठीय क्षेत्रफल = 4πr² = 4 x 22/7 x ${r}² = ${trim(val, 2)} वर्ग सेमी।`),
    B(
      `Radius ${r} is a multiple of 7, so 22/7 cancels — the arithmetic stays clean. Sphere: V = 4/3 πr³, SA = 4πr².`,
      `त्रिज्या ${r} सात का गुणज है, इसलिए 22/7 कट जाता है। गोला: आयतन = 4/3 πr³, पृष्ठीय क्षेत्रफल = 4πr²।`
    ),
    B(
      `Trap: confusing sphere with cylinder/cone formulas, and forgetting the 4/3 factor in volume.`,
      `सावधानी: गोले के सूत्र बेलन/शंकु से बदल जाना, और आयतन में 4/3 भूल जाना।`
    )
  );
};

const qPipes: Gen = () => {
  const pairs: [number, number][] = [[6, 12], [10, 15], [8, 24], [12, 18], [9, 18], [20, 30]];
  const pr = pick(pairs);
  const a = pr[0];
  const b = pr[1];
  const both = (a * b) / (a + b);
  return mk(
    "QUANT",
    B("Pipes & Cisterns", "नल एवं टंकी"),
    B("Two pipes filling a tank", "दो नलों द्वारा टंकी भरना"),
    B(
      `Pipe A can fill a tank in ${a} hours and pipe B in ${b} hours. If both are opened together, the tank will be filled in:`,
      `नल A किसी टंकी को ${a} घंटों में और नल B ${b} घंटों में भर सकता है। दोनों एक साथ खोलने पर टंकी कितने समय में भरेगी?`
    ),
    N(`${trim(both, 2)} hours`),
    NL([`${trim(both / 2, 2)} hours`, `${trim((a + b) / 2, 2)} hours`, `${trim(both + 2, 2)} hours`, `${trim(a + b, 2)} hours`]),
    B(
      `Part filled in 1 hour = 1/${a} + 1/${b} = ${(a + b) / (a * b)}. Time = ab/(a+b) = ${trim(both, 2)} hours.`,
      `एक घंटे में भाग = 1/${a} + 1/${b} = ${(a + b) / (a * b)}। समय = ab/(a+b) = ${trim(both, 2)} घंटे।`
    ),
    B(`Same as Time & Work — treat the tank as 1 unit of work and add the RATES.`, `समय एवं कार्य जैसा ही — टंकी को 1 इकाई कार्य मानकर दरें जोड़िए।`),
    B(
      `Trap: adding the hours. Also watch for an OUTLET pipe — its rate is subtracted, not added.`,
      `सावधानी: घंटे जोड़ देना। यदि कोई नल खाली कर रहा हो तो उसकी दर घटाई जाती है।`
    )
  );
};

const quantGens: Gen[] = [
  qNetChange, qPercentDiff, qCpFromSp, qTwoArticles, qSI, qCIDiff, qTrain, qBoat,
  qWork, qAverageAdd, qHcfLcm, qAlgebra, qClock, qDiscount, qMixture, qAges,
  qRemainder, qSquareTrick, qDI, qTrig, qSphere, qPipes,
];

/* ============================ PUBLIC API ============================ */
const ALL: Record<Kind, Gen[]> = {
  QUANT: quantGens,
  REASONING: reasoningGens,
  ENGLISH: englishGens,
  GA: gaGens,
};

const recent: string[] = [];

export function makeQuestion(kind: Kind | "MIXED", diff: Diff, _tier: Tier): RawQuestion {
  const lvl = diff === "EASY" ? 0 : diff === "MODERATE" ? 1 : 2;
  for (let attempt = 0; attempt < 14; attempt++) {
    const k: Kind = kind === "MIXED" ? (shuffle(["QUANT", "REASONING", "ENGLISH", "GA"] as Kind[])[0]) : kind;
    const gen = pick(ALL[k]);
    const q = gen(lvl, _tier);
    if (!recent.includes(q.subtopic.en) || attempt > 8) {
      recent.push(q.subtopic.en);
      if (recent.length > 14) recent.shift();
      return q;
    }
  }
  return pick(ALL.QUANT)(lvl, _tier);
}

export function timeForTier(tier: Tier, diff: Diff): number {
  const base = tier === 1 ? 32 : 75;
  const mul = diff === "EASY" ? 1.15 : diff === "MODERATE" ? 1 : 0.92;
  return Math.round(base * mul);
}

export const PATTERN_SYNC = "INDEPENDENT PRACTICE · NOT AN OFFICIAL EXAM";
