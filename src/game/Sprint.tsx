import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { makeSprintItem } from "./sprint";
import type { SprintItem } from "./sprint";
import InkParticles from "./InkParticles";
import type { ParticleHandle } from "./InkParticles";
import { fx } from "./fx";
import { isRecord, loadHistory, saveScore } from "./scores";
import type { ScoreEntry } from "./scores";

import { ignoreGameShortcut } from "../utils/keyboard";

const KEYS = ["A", "B", "C", "D"];
const SPRINT_SECONDS = 60;

export default function Sprint({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<"run" | "done">("run");
  const [item, setItem] = useState<SprintItem>(() => makeSprintItem());
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [hits, setHits] = useState(0);
  const [asked, setAsked] = useState(0);
  const [secs, setSecs] = useState(SPRINT_SECONDS);
  const [record, setRecord] = useState(false);

  const barRef = useRef<HTMLDivElement | null>(null);
  const inkRef = useRef<ParticleHandle | null>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const deadlineRef = useRef(performance.now() + SPRINT_SECONDS * 1000);
  const answerLock = useRef(false);
  const finishRef = useRef<() => void>(() => {});
  const timeoutRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  const next = useCallback(() => {
    if (doneRef.current) return;
    answerLock.current = false;
    setPicked(null);
    setItem(makeSprintItem());
  }, []);

  const answer = useCallback(
    (idx: number | null) => {
      if (picked !== null || phase !== "run" || answerLock.current || doneRef.current) return;
      if (performance.now() >= deadlineRef.current) { finishRef.current(); return; }
      answerLock.current = true;
      const right = idx !== null && idx === item.options.indexOf(item.answer);
      const el = optRefs.current[idx ?? 0] ?? null;
      const rect = el?.getBoundingClientRect();
      inkRef.current?.burst(
        rect ? rect.left + rect.width * 0.8 : window.innerWidth / 2,
        rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
        right ? "#146B4F" : "#B3261E",
        right ? 22 : 12
      );
      setPicked(idx);
      setAsked((a) => a + 1);
      if (right) {
        const ns = streak + 1;
        setStreak(ns);
        setBest((b) => Math.max(b, ns));
        setScore((s) => s + 10 + Math.min(30, ns * 2));
        setHits((h) => h + 1);
        fx.correct();
      } else {
        setStreak(0);
        fx.wrong();
      }
      timeoutRef.current = window.setTimeout(next, right ? 620 : 1250);
    },
    [picked, phase, item, streak, next]
  );

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    const entry: ScoreEntry = {
      score,
      correct: hits,
      asked,
      best,
      kind: "SPRINT",
      diff: "60s",
      tier: 1,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    };
    const prev = loadHistory();
    setRecord(isRecord(entry, prev));
    saveScore(entry);
    setPhase("done");
    fx.over();
  }, [score, hits, asked, best]);

  finishRef.current = finish;
  const restart = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    doneRef.current = false;
    answerLock.current = false;
    setScore(0); setStreak(0); setBest(0); setHits(0); setAsked(0); setRecord(false);
    deadlineRef.current = performance.now() + SPRINT_SECONDS * 1000;
    setSecs(SPRINT_SECONDS); setPicked(null); setItem(makeSprintItem()); setPhase("run");
  }, []);

  /* Timer is wall-clock based: switching tabs does not extend a sprint. */
  useEffect(() => {
    if (phase !== "run") return;
    let raf = 0;
    let shown = SPRINT_SECONDS;
    const loop = (t: number) => {
      const remaining = Math.max(0, (deadlineRef.current - t) / 1000);
      if (barRef.current) {
        const pct = (remaining / SPRINT_SECONDS) * 100;
        barRef.current.style.width = pct + "%";
        barRef.current.style.backgroundColor = pct < 20 ? "#B3261E" : pct < 45 ? "#E1662B" : "#14213B";
      }
      const s = Math.ceil(remaining);
      if (s !== shown) {
        shown = s;
        setSecs(s);
        if (s <= 5 && s > 0) fx.tickLast();
      }
      if (remaining <= 0) {
        finishRef.current();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ignoreGameShortcut(e)) return;
      const k = e.key.toLowerCase();
      if (k === "escape") {
        onExit();
        return;
      }
      if (phase === "done") {
        if (k === "r" || k === "enter") {
          restart();
        }
        return;
      }
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      if (k in map) {
        e.preventDefault();
        answer(map[k]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer, onExit, restart]);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const correctIdx = item.options.indexOf(item.answer);

  return (
    <div className="min-h-screen paper-surface relative text-ink">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.17] mix-blend-multiply"
        style={{ backgroundImage: "url('images/paper.webp')", backgroundSize: "cover" }}
        aria-hidden="true"
      />
      <InkParticles ref={inkRef} className="fixed inset-0 z-[60] pointer-events-none" />

      <div className="relative">
        <header className="border-b-2 border-ink/70 px-5 lg:px-10 pt-4 pb-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="smallcaps text-marigold-deep">
                Magical calculation sprint · जादुई गणित अभ्यास
              </div>
              <h1 className="font-display font-black text-[clamp(1.9rem,5vw,2.9rem)] leading-none mt-1">
                60 SECONDS
              </h1>
            </div>
            <div className="flex items-end gap-7">
              <div>
                <div className="smallcaps text-ink/50 text-[9px]">Score</div>
                <div className="tabular text-[26px] font-semibold leading-none">
                  {score.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="smallcaps text-ink/50 text-[9px]">Streak</div>
                <div className="tabular text-[26px] font-semibold leading-none">
                  {streak}
                  {streak >= 3 && <span className="text-marigold-deep text-[16px]"> +{Math.min(30, streak * 2)}</span>}
                </div>
              </div>
              <div>
                <div className="smallcaps text-ink/50 text-[9px]">Time</div>
                <div className="tabular text-[26px] font-semibold leading-none">{secs}s</div>
              </div>
              <button
                onClick={onExit}
                className="border border-ink/35 px-3 py-2 smallcaps text-[9px] text-ink hover:border-ink hover:bg-ink/5"
              >
                Exit · Esc
              </button>
            </div>
          </div>
          <div className="mt-3 h-2.5 w-full bg-ink/12">
            <div ref={barRef} className="h-full bg-ink" style={{ width: "100%" }} />
          </div>
        </header>

        <main className="max-w-[880px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
          {phase === "run" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={item.prompt}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3">
                  <span className="smallcaps text-ink/60">{item.kind}</span>
                  <span className="flex-1 h-px bg-ink/25" />
                  <span className="tabular text-[10px] text-ink/50">
                    ITEM {String(asked + 1).padStart(3, "0")}
                  </span>
                </div>

                <h2 className="font-display font-black text-[clamp(2.1rem,7vw,4.2rem)] leading-[1.05] mt-5">
                  {item.prompt}
                </h2>

                <div className="mt-8 border-t border-ink/20">
                  {item.options.map((o, i) => {
                    const revealed = picked !== null;
                    const isRight = i === correctIdx;
                    const isPicked = i === picked;
                    return (
                      <button
                        key={i}
                        ref={(el) => {
                          optRefs.current[i] = el;
                        }}
                        onClick={() => answer(i)}
                        disabled={revealed}
                        className={`group grid grid-cols-[3.25rem_1fr] w-full text-left border-b border-ink/20 transition-colors duration-150 ${
                          revealed && isRight
                            ? "bg-verify/18"
                            : revealed && isPicked
                              ? "bg-stamp/15"
                              : revealed
                                ? "opacity-50"
                                : "hover:bg-marigold/25 active:bg-marigold/40"
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center font-display font-bold text-[15px] border-r ${
                            revealed && isRight
                              ? "border-verify text-verify"
                              : revealed && isPicked
                                ? "border-stamp text-stamp"
                                : "border-ink/12 text-ink/55"
                          }`}
                        >
                          ({KEYS[i]})
                        </span>
                        <span className="py-3.5 px-4 text-[18px] sm:text-[21px] tabular font-medium">{o}</span>
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {picked !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 bg-ink text-paper/92 px-5 py-3.5 flex flex-wrap gap-x-5 gap-y-1"
                    >
                      <div className="smallcaps text-marigold text-[9px] pt-0.5">
                        Magic method · जादुई तरीका
                      </div>
                      <p className="flex-1 min-w-[220px] text-[13px] leading-[1.6]">{item.tip}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="smallcaps text-marigold-deep">Sprint complete</div>
              <h2 className="font-display font-black text-[clamp(2.6rem,9vw,5rem)] leading-[0.92] mt-2">
                RAW SPEED
                <br />
                LOGGED
              </h2>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 border-y-2 border-ink/25">
                {[
                  ["SCORE", score.toLocaleString("en-IN")],
                  ["CORRECT", String(hits)],
                  ["ATTEMPTED", String(asked)],
                  ["BEST STREAK", String(best)],
                ].map(([l, v], i) => (
                  <div key={l} className={`py-5 ${i < 3 ? "sm:border-r border-ink/15" : ""}`}>
                    <div className="smallcaps text-ink/50 text-[9px]">{l}</div>
                    <div className="font-display font-black text-[30px] leading-none mt-1.5 tabular">{v}</div>
                  </div>
                ))}
              </div>
              {record && (
                <div className="mt-5 inline-flex items-center gap-2 bg-ink text-paper px-3 py-1.5">
                  <span className="w-1.5 h-1.5 bg-marigold rounded-full" />
                  <span className="smallcaps text-[9.5px]">New personal record</span>
                </div>
              )}
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={restart}
                  className="bg-marigold text-ink px-7 py-3.5 border-2 border-ink/80 shadow-[5px_5px_0_0_rgba(20,33,59,0.85)] hover:shadow-[1px_1px_0_0_rgba(20,33,59,0.85)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                >
                  <span className="smallcaps text-[12px]">Sprint again · R</span>
                </button>
                <button
                  onClick={onExit}
                  className="border-2 border-ink/35 px-7 py-3.5 hover:border-ink hover:bg-ink/5 transition-colors"
                >
                  <span className="smallcaps text-[12px] text-ink">Back to the paper</span>
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
