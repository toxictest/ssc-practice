import { useState, useEffect, useRef, type ReactNode } from "react";
import type { Diff, Tier } from "../engine";
import type { RunConfig, ScoreEntry } from "./scores";

/* ------------------------------ backdrop ------------------------------ */
export function Backdrop({
  src,
  position = "center",
  opacity = 0.55,
}: {
  src: string;
  position?: string;
  opacity?: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {failed ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 20% 15%, #2b3a5c 0%, #16233d 55%, #0d1526 100%)",
          }}
        />
      ) : (
        <img
          src={src}
          alt=""
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position, opacity, filter: "saturate(0.85) contrast(1.05)" }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(13,21,38,0.96) 0%, rgba(13,21,38,0.86) 38%, rgba(20,33,59,0.62) 68%, rgba(20,33,59,0.42) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,234,217,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(242,234,217,0.5) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />
    </div>
  );
}

/* ------------------------------ segment ------------------------------ */
function Segment<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { v: T; l: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-6">
      <div className="smallcaps text-ink/55 mb-2">{label}</div>
      <div className="flex flex-wrap gap-px bg-ink/20 border border-ink/25">
        {options.map((o) => {
          const on = o.v === value;
          return (
            <button
              key={String(o.v)}
              onClick={() => onChange(o.v)}
              aria-pressed={on}
              className={`flex-1 min-w-[92px] px-3 py-2.5 text-left transition-colors duration-150 ${
                on ? "bg-ink text-paper" : "bg-paper/70 text-ink hover:bg-marigold/25"
              }`}
            >
              <div className="font-semibold text-[13px] leading-tight">{o.l}</div>
              {o.sub && (
                <div className={`tabular text-[10px] mt-0.5 ${on ? "text-paper/65" : "text-ink/50"}`}>
                  {o.sub}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------- high-score table ---------------------------- */
export function Ledger({ scores, compact = false }: { scores: ScoreEntry[]; compact?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b-2 border-ink/25 pb-1.5 mb-2">
        <div className="smallcaps text-ink/70">Speed Ledger · Personal Bests</div>
        <div className="tabular text-[10px] text-ink/50">LOCAL STORAGE</div>
      </div>
      {scores.length === 0 ? (
        <div className="border border-dashed border-ink/30 px-4 py-6 text-ink/60">
          <div className="font-display italic text-[17px] leading-snug">
            The ledger is blank. No run has been recorded on this device.
          </div>
          <div className="mt-1.5 text-[11px] smallcaps text-ink/45">
            Finish a run to set the first mark
          </div>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-ink/50">
              <th className="text-left smallcaps font-semibold py-1 w-8">#</th>
              <th className="text-right smallcaps font-semibold py-1 w-20">Score</th>
              <th className="text-right smallcaps font-semibold py-1 w-16">Acc</th>
              {!compact && (
                <th className="text-left smallcaps font-semibold py-1 pl-3">Set</th>
              )}
              <th className="text-right smallcaps font-semibold py-1">Date</th>
            </tr>
          </thead>
          <tbody className="tabular text-[12px]">
            {scores.slice(0, compact ? 5 : 8).map((s, i) => (
              <tr key={i} className="border-t border-ink/15">
                <td className={`py-1.5 font-semibold ${i === 0 ? "text-marigold-deep" : "text-ink/55"}`}>
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="text-right py-1.5 font-semibold text-ink">{s.score.toLocaleString("en-IN")}</td>
                <td className="text-right py-1.5 text-ink/70">
                  {s.asked ? Math.round((s.correct / s.asked) * 100) : 0}%
                </td>
                {!compact && (
                  <td className="py-1.5 pl-3 text-ink/70 truncate">
                    {s.kind} · T{s.tier} · {s.diff}
                  </td>
                )}
                <td className="text-right py-1.5 text-ink/55">{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* -------------------------------- start -------------------------------- */
export function StartScreen({
  cfg,
  setCfg,
  onStart,
  onSprint,
  scores,
  tools,
}: {
  tools: ReactNode;
  cfg: RunConfig;
  setCfg: (c: RunConfig) => void;
  onStart: () => void;
  onSprint: () => void;
  scores: ScoreEntry[];
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Backdrop src="images/desk.webp" position="35% 45%" opacity={0.5} />
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-paper/20">
          <div className="max-w-[1380px] mx-auto px-5 lg:px-10 py-3 flex items-center justify-between gap-4">
            <div className="smallcaps text-paper/75">
              Independent practice · SSC Combined Graduate Level
            </div>
            <div className="tabular text-[10px] text-paper/55 hidden sm:block">
              TIER-I & TIER-II PRACTICE · LIVE GENERATION
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-[1380px] mx-auto w-full px-5 lg:px-10 py-10 lg:py-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
          {/* masthead */}
          <div>
            <div className="inline-flex items-center gap-2 border border-marigold/70 px-2.5 py-1 mb-6">
              <span className="w-1.5 h-1.5 bg-marigold rounded-full" />
              <span className="smallcaps text-marigold">Bilingual Aptitude Trainer</span>
            </div>
            <h1 className="font-display text-paper leading-[0.8] tracking-[-0.02em]">
              <span className="block text-[clamp(3.2rem,11vw,8.4rem)] font-black">RAPID</span>
              <span className="block text-[clamp(3.2rem,11vw,8.4rem)] font-black">FIRE</span>
              <span className="inline-block mt-2 bg-marigold text-ink px-4 pb-1.5 pt-0.5 text-[clamp(2.6rem,8.5vw,6.2rem)] font-black italic">
                DRILL
              </span>
            </h1>
            <p className="mt-7 font-display text-paper/85 text-[clamp(1.05rem,2.1vw,1.5rem)] leading-[1.5] max-w-[30ch]">
              Every question is generated the moment you need it — numbers, contexts and
              category selections vary across runs. Some items come from a fixed question bank.
            </p>
            <p className="mt-3 text-paper/60 text-[13.5px] leading-relaxed max-w-[46ch]">
              Each item carries the <em className="text-paper not-italic font-semibold">standard textbook method</em>{" "}
              and a <em className="text-marigold not-italic font-semibold">calculation shortcut</em> — Vedic shortcuts,
              digital-root checks, unit-digit filtration and option elimination without full calculation.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onStart}
                className="group relative bg-marigold text-ink px-8 py-4 border-2 border-ink/80 shadow-[6px_6px_0_0_rgba(20,33,59,0.85)] hover:shadow-[2px_2px_0_0_rgba(20,33,59,0.85)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150"
              >
                <span className="smallcaps text-[13px]">Begin the drill</span>
                <span className="block tabular text-[10px] text-ink/70 mt-0.5">PRESS ENTER ↵</span>
              </button>
              <button
                onClick={onSprint}
                className="border-2 border-paper/45 text-paper px-7 py-4 hover:border-marigold hover:text-marigold transition-colors duration-150"
              >
                <span className="smallcaps text-[12px]">60-second sprint</span>
                <span className="block tabular text-[10px] text-paper/55 mt-0.5">PRESS S · RAW CALCULATION</span>
              </button>
              <div className="tabular text-[10.5px] text-paper/60 leading-relaxed basis-full">
                1–4 / A–D answer · SPACE next · P pause · M mute · R restart
                <br />
                <span className="text-marigold">हर प्रश्न के ऊपर हिंदी/English भाषा बदलने का विकल्प</span>
              </div>
            </div>

            <div className="mt-10 border-t border-paper/15 pt-4 grid grid-cols-3 gap-4 max-w-[430px]">
              {[
                ["40+", "GENERATOR RULES"],
                ["3s", "TARGET SOLVE TIME"],
                ["×4", "MAX STREAK MULTIPLIER"],
              ].map(([a, b]) => (
                <div key={b}>
                  <div className="font-display text-paper text-[28px] leading-none">{a}</div>
                  <div className="smallcaps text-paper/50 mt-1.5 text-[9.5px]">{b}</div>
                </div>
              ))}
            </div>
          </div>

          {/* config panel */}
          <div className="bg-paper border-2 border-ink/80 shadow-[10px_10px_0_0_rgba(13,21,38,0.55)]">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-ink/25">
              <div className="smallcaps text-ink">Configure the paper</div>
              <div className="tabular text-[10px] text-ink/50">FORM RF-01</div>
            </div>
            <div className="px-5 pt-5 pb-3">
              <Segment
                label="Question type"
                value={cfg.kind}
                onChange={(v) => setCfg({ ...cfg, kind: v })}
                options={[
                  { v: "MIXED" as const, l: "Mixed", sub: "ALL FOUR" },
                  { v: "QUANT" as const, l: "Quant", sub: "%·P&L·TSD" },
                  { v: "REASONING" as const, l: "Reasoning", sub: "SERIES·SYLLOGISM" },
                  { v: "ENGLISH" as const, l: "English", sub: "VOCAB·GRAMMAR" },
                  { v: "GA" as const, l: "General Awareness", sub: "BUNDLED GA BANK" },
                ]}
              />
              <Segment
                label="Difficulty"
                value={cfg.diff}
                onChange={(v) => setCfg({ ...cfg, diff: v })}
                options={[
                  { v: "EASY" as Diff, l: "Easy", sub: "FOUNDATION" },
                  { v: "MODERATE" as Diff, l: "Moderate", sub: "REGULAR PRACTICE" },
                  { v: "HARD" as Diff, l: "Hard", sub: "TIER-II DEEP" },
                ]}
              />
              <Segment
                label="Target tier"
                value={cfg.tier}
                onChange={(v) => setCfg({ ...cfg, tier: v })}
                options={[
                  { v: 1 as Tier, l: "Tier-I", sub: "32s · SPEED FOCUS" },
                  { v: 2 as Tier, l: "Tier-II", sub: "75s · ANALYTICAL" },
                ]}
              />
            </div>
            <div className="px-5 pb-5">
              <Ledger scores={scores} compact />
              <div className="mt-4 border-t border-ink/15 pt-3">
                <div className="smallcaps text-ink/45 text-[8.5px] leading-[1.9]">
                  Randomised practice · some questions may repeat
                  <br />
                  हिंदी + English · toggle sits above every question
                  <br />
                  Independent practice · not affiliated with SSC
                  <br />
                  GA bank is bundled · verify time-sensitive facts
                  <br />
                  New pattern sets: operator interchange, trigonometry,
                  <br />
                  sphere mensuration, pipes &amp; cisterns, DI tables
                </div>
              </div>
            </div>
          </div>
        </div>

        {tools}
        <div className="relative bg-ink border-t-2 border-marigold overflow-hidden">
          <div className="flex whitespace-nowrap marquee py-2.5">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0">
                {[
                  "UNIT DIGIT FILTRATION",
                  "DIGITAL ROOT CHECK",
                  "PERCENTAGE ↔ FRACTION",
                  "OPTION ELIMINATION",
                  "VEDIC BASE-100 MULTIPLICATION",
                  "SYLLOGISM 100/50 RULE",
                  "SQUARE & CUBE ROOT PROXIES",
                  "SPLIT-AND-MERGE ARITHMETIC",
                ].map((t) => (
                  <span key={t} className="smallcaps text-paper/70 px-6 text-[10px]">
                    {t} <span className="text-marigold">◆</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- pause -------------------------------- */
export function PauseOverlay({
  onResume,
  onMenu,
  score,
  asked,
}: {
  onResume: () => void;
  onMenu: () => void;
  score: number;
  asked: number;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !buttons?.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", trap); previous?.focus(); };
  }, []);
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pause-title" className="fixed inset-0 z-40 bg-ink/85 backdrop-blur-[3px] flex items-center justify-center px-5">
      <div className="bg-paper border-2 border-ink w-full max-w-[460px] shadow-[12px_12px_0_0_rgba(225,102,43,0.85)]">
        <div className="px-7 pt-8 pb-6">
          <div className="smallcaps text-marigold-deep">Drill suspended</div>
          <h2 id="pause-title" className="font-display text-[clamp(2.6rem,9vw,3.8rem)] font-black leading-[0.9] mt-2">
            PAUSED
          </h2>
          <div className="mt-5 border-y-2 border-ink/20 py-3 flex gap-8">
            <div>
              <div className="smallcaps text-ink/50 text-[9.5px]">Net score</div>
              <div className="tabular text-[22px] font-semibold">{score.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="smallcaps text-ink/50 text-[9.5px]">Attempted</div>
              <div className="tabular text-[22px] font-semibold">{asked}</div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={onResume}
              className="bg-ink text-paper px-6 py-3.5 hover:bg-marigold hover:text-ink transition-colors"
            >
              <span className="smallcaps text-[12px]">Resume · P</span>
            </button>
            <button
              onClick={onMenu}
              className="border-2 border-ink/35 px-6 py-3 hover:border-ink hover:bg-ink/5 transition-colors"
            >
              <span className="smallcaps text-[12px] text-ink">Abandon run · Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ game over ------------------------------ */
export function GameOverScreen({
  scores,
  score,
  correct,
  asked,
  best,
  cfg,
  record,
  onRestart,
  onMenu,
}: {
  scores: ScoreEntry[];
  score: number;
  correct: number;
  asked: number;
  best: number;
  cfg: RunConfig;
  record: boolean;
  onRestart: () => void;
  onMenu: () => void;
}) {
  const acc = asked ? Math.round((correct / asked) * 100) : 0;
  const qualified = acc >= 60 && asked >= 5;
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Backdrop src="images/result.webp" position="50% 60%" opacity={0.38} />
      <div className="relative z-10 min-h-screen max-w-[1180px] mx-auto px-5 lg:px-10 py-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="smallcaps text-marigold">Result sheet · Rapid fire drill</div>
            <h2 className="font-display text-paper font-black leading-[0.85] text-[clamp(3rem,10vw,6.4rem)] mt-2">
              RUN
              <br />
              COMPLETE
            </h2>
          </div>
          <div className={`stamp-drop select-none ${qualified ? "" : ""}`}>
            <div
              className={`border-[5px] px-7 py-3 -rotate-[8deg] ${
                qualified ? "border-verify text-verify" : "border-stamp text-stamp"
              }`}
              style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35)" }}
            >
              <div className="font-display font-black text-[clamp(1.7rem,5vw,2.6rem)] leading-none tracking-[0.06em]">
                {qualified ? "QUALIFIED" : "DISQUALIFIED"}
              </div>
              <div className="smallcaps text-[8.5px] mt-1 opacity-80">
                {qualified ? "ACCURACY ABOVE CUT-OFF" : "ACCURACY BELOW CUT-OFF"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
          <div className="bg-paper border-2 border-ink/80">
            <div className="px-6 py-5 border-b-2 border-ink/20 flex items-baseline justify-between">
              <div className="smallcaps text-ink/60">Performance summary</div>
              <div className="tabular text-[10px] text-ink/50">
                {cfg.kind} · TIER {cfg.tier} · {cfg.diff}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {[
                ["NET SCORE", score.toLocaleString("en-IN")],
                ["ACCURACY", `${acc}%`],
                ["ATTEMPTED", String(asked)],
                ["BEST STREAK", String(best)],
              ].map(([l, v], i) => (
                <div
                  key={l}
                  className={`px-6 py-6 ${i < 3 ? "border-r border-ink/15" : ""} ${i < 2 ? "border-b sm:border-b-0 border-ink/15" : ""}`}
                >
                  <div className="smallcaps text-ink/50 text-[9px]">{l}</div>
                  <div className="font-display text-[clamp(1.9rem,5vw,2.5rem)] font-black leading-none mt-1.5 tabular">
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 border-t border-ink/15">
              <div className="h-3 w-full bg-ink/12">
                <div
                  className="h-full bg-marigold transition-[width] duration-700"
                  style={{ width: `${Math.min(100, acc)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between tabular text-[10px] text-ink/55">
                <span>0%</span>
                <span>CUT-OFF MARK 60%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-ink/15 flex flex-wrap gap-3">
              <button
                onClick={onRestart}
                className="bg-marigold text-ink px-7 py-3.5 border-2 border-ink/80 shadow-[5px_5px_0_0_rgba(20,33,59,0.85)] hover:shadow-[1px_1px_0_0_rgba(20,33,59,0.85)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                <span className="smallcaps text-[12px]">Run it again · R</span>
              </button>
              <button
                onClick={onMenu}
                className="border-2 border-ink/35 px-7 py-3.5 hover:border-ink hover:bg-ink/5 transition-colors"
              >
                <span className="smallcaps text-[12px] text-ink">Change the paper</span>
              </button>
            </div>
          </div>

          <div>
            <div className="bg-paper/95 border-2 border-ink/80 px-6 py-5">
              {record && (
                <div className="mb-4 inline-flex items-center gap-2 bg-ink text-paper px-3 py-1.5">
                  <span className="w-1.5 h-1.5 bg-marigold rounded-full" />
                  <span className="smallcaps text-[9.5px]">New personal record</span>
                </div>
              )}
              <Ledger scores={scores} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
