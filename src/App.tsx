import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KIND_LABEL, PATTERN_SYNC, localizeQuestion, timeForTier } from "./engine";
import type { Lang, Question } from "./engine";
import InkParticles from "./game/InkParticles";
import type { ParticleHandle } from "./game/InkParticles";
import { fx, setMuted } from "./game/fx";
import Sprint from "./game/Sprint";
import { GameOverScreen, PauseOverlay, StartScreen } from "./game/Screens";
import { isRecord, loadHistory, loadScores, saveScore } from "./game/scores";
import type { RunConfig, ScoreEntry } from "./game/scores";

import { loadPreferences, savePreferences } from "./game/preferences";
import TrainingPanel from "./components/TrainingPanel";
import { ignoreGameShortcut } from "./utils/keyboard";
import LiveUpdates from "./live/LiveUpdates";
import { nextPracticeQuestion } from "./live/select";
import type { LivePracticeQuestion } from "./live/types";

type Phase = "menu" | "playing" | "reveal" | "paused" | "over" | "sprint";

const OPTION_KEYS = ["A", "B", "C", "D"];

export default function App() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [cfg, setCfg] = useState<RunConfig>(() => loadPreferences().config);
  const [raw, setRaw] = useState<LivePracticeQuestion | null>(null);
  const [lang, setLang] = useState<Lang>(() => loadPreferences().lang);
  const q: Question | null = raw ? localizeQuestion(raw, lang) : null;
  const L = (en: string, hi: string) => (lang === "HI" ? hi : en);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [asked, setAsked] = useState(0);
  const [hits, setHits] = useState(0);
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScores());
  const [record, setRecord] = useState(false);
  const [secsLeft, setSecsLeft] = useState(32);
  const [floatScore, setFloatScore] = useState<{ id: number; text: string } | null>(null);
  const [muted, setMutedUI] = useState(() => loadPreferences().muted);
  const answeredRef = useRef(false);
  const finishedRef = useRef(false);
  const resumePhase = useRef<"playing" | "reveal">("playing");
  const pause = useCallback(() => {
    if (phase !== "playing" && phase !== "reveal") return;
    resumePhase.current = phase;
    setPhase("paused");
  }, [phase]);
  const resume = useCallback(() => setPhase(resumePhase.current), []);

  useEffect(() => { setMuted(muted); savePreferences({ config: cfg, lang, muted }); }, [cfg, lang, muted]);
  useEffect(() => {
    const hide = () => { if (document.hidden && phase === "playing") pause(); };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [phase, pause]);

  const timeRef = useRef(0);
  const totalRef = useRef(32);
  const barH = useRef<HTMLDivElement | null>(null);
  const barV = useRef<HTMLDivElement | null>(null);
  const shakeRef = useRef<HTMLDivElement | null>(null);
  const inkRef = useRef<ParticleHandle | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timeoutRef = useRef<() => void>(() => {});

  /* ------------------------------ flow ------------------------------ */
  const nextQuestion = useCallback(() => {
    const nq = nextPracticeQuestion(cfg.kind, cfg.diff, cfg.tier);
    totalRef.current = timeForTier(cfg.tier, cfg.diff);
    timeRef.current = totalRef.current;
    setSecsLeft(totalRef.current);
    answeredRef.current = false;
    setPicked(null);
    setRaw(nq);
    setPhase("playing");
  }, [cfg]);

  const finishRun = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const entry: ScoreEntry = {
      score,
      correct: hits,
      asked,
      best,
      kind: cfg.kind,
      diff: cfg.diff,
      tier: cfg.tier,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    };
    const wasRecord = isRecord(entry, loadHistory());
    setScores(saveScore(entry));
    setRecord(wasRecord);
    setPhase("over");
    fx.over();
  }, [score, hits, asked, best, cfg, scores]);

  const advance = useCallback(() => {
    if (lives <= 0) finishRun();
    else nextQuestion();
  }, [lives, finishRun, nextQuestion]);

  const startRun = useCallback(() => {
    finishedRef.current = false;
    setScore(0);
    setStreak(0);
    setBest(0);
    setLives(3);
    setAsked(0);
    setHits(0);
    setRecord(false);
    setFloatScore(null);
    fx.start();
    nextQuestion();
  }, [nextQuestion]);

  const doShake = (cls: string) => {
    const el = shakeRef.current;
    if (!el) return;
    el.classList.remove("shake-soft", "shake-hard");
    void el.offsetWidth;
    el.classList.add(cls);
  };

  const answer = useCallback(
    (idx: number | null) => {
      if (phase !== "playing" || !q || answeredRef.current) return;
      answeredRef.current = true;
      const right = idx !== null && idx === q.answer;
      const el = optionRefs.current[idx ?? q.answer] ?? null;
      const rect = el?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width * 0.78 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

      inkRef.current?.burst(cx, cy, right ? "#146B4F" : "#B3261E", right ? 34 : 20);
      setPicked(idx);
      setAsked((a) => a + 1);

      if (right) {
        const ns = streak + 1;
        const mult = ns >= 10 ? 4 : ns >= 6 ? 3 : ns >= 3 ? 2 : 1;
        const base = (cfg.tier === 1 ? 100 : 150) * (cfg.diff === "EASY" ? 1 : cfg.diff === "MODERATE" ? 1.5 : 2);
        const bonus = Math.round(70 * (timeRef.current / totalRef.current));
        const pts = Math.round((base + bonus) * mult);
        setStreak(ns);
        setBest((b) => Math.max(b, ns));
        setScore((s) => s + pts);
        setHits((h) => h + 1);
        setFloatScore({ id: Date.now(), text: `+${pts}${mult > 1 ? `  ×${mult}` : ""}` });
        fx.correct();
        fx.stamp();
        doShake("shake-soft");
        inkRef.current?.burst(cx, cy, "#E1662B", 12);
      } else {
        setStreak(0);
        setLives((l) => Math.max(0, l - 1));
        fx.wrong();
        doShake("shake-hard");
      }
      setPhase("reveal");
    },
    [phase, q, streak, cfg]
  );

  timeoutRef.current = () => {
    if (phase === "playing") answer(null);
  };

  /* ----------------------------- timer ----------------------------- */
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    let last = performance.now();
    let shown = Math.ceil(timeRef.current);
    const loop = (t: number) => {
      const dt = Math.max(0, (t - last) / 1000);
      last = t;
      timeRef.current = Math.max(0, timeRef.current - dt);
      const pct = (timeRef.current / totalRef.current) * 100;
      const color = pct < 22 ? "#B3261E" : pct < 45 ? "#E1662B" : "#14213B";
      if (barH.current) {
        barH.current.style.width = pct + "%";
        barH.current.style.backgroundColor = color;
      }
      if (barV.current) {
        barV.current.style.height = pct + "%";
        barV.current.style.backgroundColor = color;
      }
      const s = Math.ceil(timeRef.current);
      if (s !== shown) {
        shown = s;
        setSecsLeft(s);
        if (s <= 5 && s > 0) fx.tickLast();
      }
      if (timeRef.current <= 0) {
        timeoutRef.current();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, q?.id]);

  /* ------------------- ambient dust on static screens ------------------- */
  useEffect(() => {
    if (phase !== "menu" && phase !== "over") return;
    const t = window.setTimeout(() => inkRef.current?.rain("#F2EADB", 30), 220);
    const id = window.setInterval(() => inkRef.current?.rain("#E1662B", 9), 2800);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(id);
    };
  }, [phase]);

  /* --------------------------- keyboard --------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "sprint" || ignoreGameShortcut(e)) return;
      const k = e.key.toLowerCase();
      if (phase === "menu") {
        if (k === "enter" || k === " ") {
          e.preventDefault();
          startRun();
        } else if (k === "s") {
          setPhase("sprint");
        }
        return;
      }
      if (phase === "over") {
        if (k === "r" || k === "enter") startRun();
        else if (k === "escape") setPhase("menu");
        return;
      }
      if (phase === "paused") {
        if (k === "p" || k === "escape" || k === "enter") resume();
        return;
      }
      if (k === "p" || k === "escape") {
        pause();
        return;
      }
      if (k === "m") {
        setMutedUI((v) => {
          setMuted(!v);
          return !v;
        });
        return;
      }
      if (phase === "playing") {
        const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
        if (k in map) {
          e.preventDefault();
          answer(map[k]);
        }
        return;
      }
      if (phase === "reveal" && (k === " " || k === "enter" || k === "arrowright")) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, startRun, answer, advance, pause, resume]);

  const toggleMute = () => {
    const v = !muted;
    setMutedUI(v);
    setMuted(v);
    if (!v) fx.select();
  };

  /* ------------------------------ sprint ------------------------------ */
  if (phase === "sprint") {
    return <Sprint onExit={() => { setScores(loadScores()); setPhase("menu"); }} />;
  }

  /* ------------------------------ menu ------------------------------ */
  if (phase === "menu") {
    return (
      <>
        <InkParticles ref={inkRef} className="fixed inset-0 z-[60] pointer-events-none" />
        <StartScreen
          cfg={cfg}
          setCfg={setCfg}
          onStart={startRun}
          onSprint={() => setPhase("sprint")}
          scores={scores}
          tools={<><TrainingPanel lang={lang} setLang={setLang} muted={muted} toggleMute={toggleMute} refresh={() => setScores(loadScores())} /><LiveUpdates /></>}
        />
      </>
    );
  }

  if (phase === "over") {
    return (
      <>
        <InkParticles ref={inkRef} className="fixed inset-0 z-[60] pointer-events-none" />
        <GameOverScreen
          scores={scores}
          score={score}
          correct={hits}
          asked={asked}
          best={best}
          cfg={cfg}
          record={record}
          onRestart={startRun}
          onMenu={() => setPhase("menu")}
        />
      </>
    );
  }

  const accuracy = asked ? Math.round((hits / asked) * 100) : 0;
  const right = q ? picked === q.answer : false;

  /* ---------------------------- game ---------------------------- */
  return (
    <div className="min-h-screen paper-surface relative text-ink">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.17] mix-blend-multiply"
        style={{ backgroundImage: "url('images/paper.webp')", backgroundSize: "cover" }}
        aria-hidden="true"
      />
      <InkParticles ref={inkRef} className="fixed inset-0 z-[60] pointer-events-none" />

      <p className="sr-only" role="status" aria-live="polite">{phase === "reveal" && q ? `${right ? L("Correct", "सही") : L("Incorrect", "गलत")}. ${L("Correct answer", "सही उत्तर")}: ${q.options[q.answer]}` : ""}</p>
      <div ref={shakeRef} inert={phase === "paused"}>
        {/* ---------------- mobile status bar ---------------- */}
        <div className="lg:hidden sticky top-0 z-40 bg-paper border-b-2 border-ink/70 px-4 pt-2.5 pb-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="smallcaps text-ink/50 text-[8.5px]">Net score</div>
              <div className="tabular text-[22px] font-semibold leading-none">
                {score.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="smallcaps text-ink/50 text-[8.5px]">Streak</div>
                <div className="tabular text-[16px] font-semibold leading-none">
                  {streak}
                  {streak >= 3 && <span className="text-marigold-deep"> ×{streak >= 10 ? 4 : streak >= 6 ? 3 : 2}</span>}
                </div>
              </div>
              <div>
                <div className="smallcaps text-ink/50 text-[8.5px]">Lives</div>
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${i < lives ? "bg-stamp" : "bg-ink/15"}`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={pause}
                className="border border-ink/35 px-2.5 py-1.5 smallcaps text-[9px] text-ink"
              >
                Pause
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="tabular text-[10px] text-ink/60 w-9">{secsLeft}s</div>
            <div className="flex-1 h-1.5 bg-ink/12">
              <div ref={barH} className="h-full bg-ink" style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        <div className="flex">
          {/* ---------------- desktop rail ---------------- */}
          <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen w-[330px] shrink-0 flex-col border-r-4 border-ink/25 px-8 py-7">
            <div className="flex items-start justify-between">
              <div>
                <div className="smallcaps text-ink text-[10px] leading-relaxed">
                  SSC CGL
                  <br />
                  Rapid Fire Drill
                </div>
                <div className="tabular text-[9.5px] text-ink/50 mt-2">
                  TIER {cfg.tier} · {cfg.diff}
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="w-8 h-8 border border-ink/30 text-ink/70 hover:border-ink hover:text-ink transition-colors"
                >
                  <span className="text-[11px]">{muted ? "✕" : "♪"}</span>
                </button>
                <button
                  onClick={pause}
                  aria-label="Pause"
                  className="w-8 h-8 border border-ink/30 text-ink/70 hover:border-ink hover:text-ink transition-colors"
                >
                  <span className="text-[11px]">❚❚</span>
                </button>
              </div>
            </div>

            <div className="mt-9">
              <div className="smallcaps text-ink/50 text-[9px]">Net score</div>
              <div className="relative">
                <div className="font-display font-black tabular text-[clamp(3.4rem,5vw,4.6rem)] leading-[0.9] mt-1">
                  {score.toLocaleString("en-IN")}
                </div>
                {floatScore && (
                  <div
                    key={floatScore.id}
                    className="float-up absolute right-2 top-3 tabular text-marigold-deep font-semibold text-[19px]"
                  >
                    {floatScore.text}
                  </div>
                )}
              </div>
              <div className="mt-2 h-px bg-ink/20" />
            </div>

            {/* vertical ink timer */}
            <div className="mt-8 flex-1 flex gap-5 min-h-[180px]">
              <div className="relative w-[14px] bg-ink/12 overflow-hidden">
                <div
                  ref={barV}
                  className="absolute bottom-0 left-0 w-full bg-ink"
                  style={{ height: "100%" }}
                />
                {[20, 40, 60, 80].map((p) => (
                  <div
                    key={p}
                    className="absolute left-0 w-full h-px bg-paper/70"
                    style={{ bottom: `${p}%` }}
                  />
                ))}
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <div className="smallcaps text-ink/50 text-[9px]">Time left</div>
                  <div className="tabular text-[34px] font-semibold leading-none mt-1">{secsLeft}s</div>
                  <div className="tabular text-[9.5px] text-ink/45 mt-1">
                    OF {totalRef.current}s PER ITEM
                  </div>
                </div>
                <div>
                  <div className="smallcaps text-ink/50 text-[9px]">Question</div>
                  <div className="tabular text-[17px] font-semibold">
                    {String(asked + (phase === "reveal" ? 0 : 1)).padStart(2, "0")}
                  </div>
                  <div className="mt-3 smallcaps text-ink/50 text-[9px]">Accuracy</div>
                  <div className="tabular text-[17px] font-semibold">{accuracy}%</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-ink/20">
              <div className="flex items-center justify-between">
                <div className="smallcaps text-ink/50 text-[9px]">Streak</div>
                <div className="tabular text-[15px] font-semibold">
                  {streak}
                  {streak >= 3 && (
                    <span className="text-marigold-deep">
                      {" "}
                      ×{streak >= 10 ? 4 : streak >= 6 ? 3 : 2}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <div className="smallcaps text-ink/50 text-[9px]">Lives remaining</div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full ${i < lives ? "bg-stamp" : "bg-ink/15"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 tabular text-[9px] text-ink/40 leading-relaxed">
                1–4 / A–D TO ANSWER · SPACE FOR NEXT
                <br />
                P PAUSE · M MUTE
              </div>
            </div>
          </aside>

          {/* ---------------- question stage ---------------- */}
          <main className="flex-1 min-w-0 px-5 sm:px-8 lg:px-14 py-6 lg:py-10">
            {/* Eduquity delivery header: answered counter at the top of the screen */}
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 border-b-2 border-ink/25 pb-2 mb-6">
              <div className="smallcaps text-ink/50 text-[9px]">
                {lang === "HI" ? "अब तक किए गए प्रश्न" : "Questions answered"}
                <span className="tabular text-ink ml-2 text-[11px]">
                  {String(asked).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="smallcaps text-ink/45 text-[9px]">
                  {lang === "HI" ? "सटीकता" : "Accuracy"}
                  <span className="tabular text-ink ml-2 text-[11px]">{accuracy}%</span>
                </div>
                <div className="smallcaps text-marigold-deep text-[8.5px]">
                  {PATTERN_SYNC}
                </div>
              </div>
            </div>
            {q && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 26, rotate: 0.35 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, y: -18, rotate: -0.3 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="relative max-w-[880px]"
                >
                  {/* ghost numeral */}
                  <div
                    className="pointer-events-none absolute -left-3 lg:-left-14 -top-6 lg:-top-10 font-display font-black text-ink/[0.07] leading-none select-none"
                    style={{ fontSize: "clamp(7rem,16vw,13rem)" }}
                    aria-hidden="true"
                  >
                    {String(asked + (phase === "reveal" ? 0 : 1)).padStart(2, "0")}
                  </div>

                  {/* stamp */}
                  {phase === "reveal" && (
                    <div
                      key={picked === null ? "timeout" : right ? "ok" : "no"}
                      className={`stamp-drop absolute right-0 top-1 z-20 select-none pointer-events-none ${
                        right ? "text-verify" : "text-stamp"
                      }`}
                    >
                      <div
                        className="border-[4px] px-4 lg:px-6 py-1.5 lg:py-2.5 rotate-[1deg] opacity-90"
                        style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.4)" }}
                      >
                        <div className="font-display font-black text-[clamp(1.15rem,3.4vw,1.9rem)] leading-none tracking-[0.05em]">
                          {right ? "CORRECT" : picked === null ? "TIME UP" : "WRONG"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* tag */}
                  <div className="relative z-10">
                    <div
                      className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-ink/25 pb-2 ${
                        phase === "reveal" ? "pr-[112px] sm:pr-[190px]" : ""
                      }`}
                    >
                      <span className="smallcaps text-marigold-deep">
                        {lang === "HI" ? KIND_LABEL[q.kind].hi : KIND_LABEL[q.kind].en}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-ink/30" />
                      <span className="smallcaps text-ink/60">{q.topic}</span>
                      <span className="w-1 h-1 rounded-full bg-ink/30" />
                      <span className="smallcaps text-ink/45">{q.subtopic}</span>
                    </div>

                    {/* Eduquity delivery: language toggle sits JUST ABOVE the question */}
                    <div className="flex items-center justify-between gap-3 mt-5">
                      <div className="smallcaps text-ink/45 text-[8.5px]">
                        {lang === "HI" ? "प्रश्न की भाषा बदलिए" : "View this question in"}
                      </div>
                      <div className="flex border border-ink/35">
                        {(["EN", "HI"] as Lang[]).map((l) => (
                          <button
                            key={l}
                            onClick={() => setLang(l)}
                            aria-label={l === "EN" ? "Show question in English" : "प्रश्न हिंदी में देखें"}
                            className={`px-3.5 py-1.5 smallcaps text-[9.5px] transition-colors duration-150 ${
                              lang === l
                                ? "bg-ink text-paper"
                                : "text-ink/65 hover:bg-marigold/30 hover:text-ink"
                            }`}
                          >
                            {l === "EN" ? "English" : "हिंदी"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <h2
                      className={`font-display text-[clamp(1.22rem,2.7vw,1.95rem)] leading-[1.5] mt-3 whitespace-pre-line ${
                        phase === "reveal" ? "pr-[92px] sm:pr-[150px]" : ""
                      }`}
                    >
                      {q.stem}
                    </h2>

                    {q.data && (
                      <pre className="mt-5 tabular text-[11px] sm:text-[12px] leading-[1.7] bg-ink text-paper/95 px-4 py-3.5 overflow-x-auto border-l-4 border-marigold">
                        {q.data}
                      </pre>
                    )}

                    {/* options */}
                    <div className="mt-7 border-t border-ink/20">
                      {q.options.map((opt, i) => {
                        const isAnswer = i === q.answer;
                        const isPicked = i === picked;
                        const revealed = phase === "reveal";
                        return (
                          <button
                            key={i}
                            ref={(el) => {
                              optionRefs.current[i] = el;
                            }}
                            onClick={() => answer(i)}
                            disabled={revealed}
                            className={`group grid grid-cols-[3.25rem_1fr] w-full text-left border-b border-ink/20 transition-colors duration-150 ${
                              revealed && isAnswer
                                ? "bg-verify/15"
                                : revealed && isPicked
                                  ? "bg-stamp/12"
                                  : revealed
                                    ? "opacity-55"
                                    : "hover:bg-marigold/20 active:bg-marigold/35"
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center font-display font-bold text-[15px] border-r ${
                                revealed && isAnswer
                                  ? "border-verify text-verify"
                                  : revealed && isPicked
                                    ? "border-stamp text-stamp"
                                    : "border-ink/12 text-ink/55 group-hover:text-marigold-deep"
                              }`}
                            >
                              ({OPTION_KEYS[i]})
                            </span>
                            <span
                              className={`py-3.5 px-4 text-[15px] sm:text-[16.5px] leading-snug transition-transform duration-150 ${
                                revealed ? "" : "group-hover:translate-x-1.5"
                              }`}
                            >
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* reveal docket */}
                  <AnimatePresence>
                    {phase === "reveal" && (
                      <motion.div
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.32, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-8 border-t-4 border-ink"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
                          <div className="smallcaps text-ink">
                            {L("Solution docket", "समाधान विवरण")}
                          </div>
                          <div className="tabular text-[10px] text-ink/55">
                            {L("CORRECT ANSWER", "सही उत्तर")} · ({OPTION_KEYS[q.answer]}){" "}
                            {q.options[q.answer]}
                          </div>
                        </div>

                        {raw?.liveSource && <div className="live-provenance">Owner-reviewed live question · as of {raw.liveSource.asOfDate} · revision {raw.liveSource.revision}<br /><a href={raw.liveSource.source.url} target="_blank" rel="noopener noreferrer">Source: {raw.liveSource.source.title} ↗</a></div>}
                        <div className="mt-4 grid lg:grid-cols-[1.15fr_0.85fr] gap-4">
                          <div className="border border-ink/25 bg-paper/60 px-5 py-4">
                            <div className="smallcaps text-ink/55 text-[9px]">
                              01 · {L("Textbook method", "पाठ्यपुस्तक विधि")}
                            </div>
                            <p className="mt-2 text-[14.5px] leading-[1.65] text-ink/90">{q.method}</p>
                          </div>

                          <div className="bg-marigold text-ink px-5 py-4 border-2 border-ink/70 shadow-[5px_5px_0_0_rgba(20,33,59,0.75)]">
                            <div className="smallcaps text-ink/75 text-[9px]">
                              02 · {L("calculation shortcut", "गणना का आसान तरीका")}
                            </div>
                            <p className="mt-2 text-[14.5px] leading-[1.6] font-medium">{q.hack}</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-ink text-paper/92 px-5 py-4 flex flex-wrap gap-x-6 gap-y-2 items-start">
                          <div className="smallcaps text-marigold text-[9px] pt-0.5">
                            03 · {L("Speed drill tip", "स्पीड ड्रिल टिप")}
                          </div>
                          <p className="flex-1 min-w-[240px] text-[13.5px] leading-[1.65]">{q.trap}</p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button
                            onClick={advance}
                            className="bg-ink text-paper px-8 py-4 hover:bg-marigold hover:text-ink transition-colors border-2 border-ink"
                          >
                            <span className="smallcaps text-[12px]">
                              {lives <= 0
                                ? L("See result sheet", "परिणाम पत्र देखें")
                                : L("Next question", "अगला प्रश्न")}
                            </span>
                          </button>
                          <div className="tabular text-[10px] text-ink/55 leading-relaxed">
                            PRESS SPACE OR ENTER
                            <br />
                            {lives <= 0
                              ? "NO LIVES LEFT — RUN ENDS AFTER THIS ITEM"
                              : `${lives} ${lives === 1 ? "LIFE" : "LIVES"} REMAINING`}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      {phase === "paused" && (
        <PauseOverlay
          onResume={resume}
          onMenu={() => setPhase("menu")}
          score={score}
          asked={asked}
        />
      )}
    </div>
  );
}


