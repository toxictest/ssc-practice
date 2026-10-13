import type { Diff, Tier } from "../engine";
export interface RunConfig {
  kind: "QUANT" | "REASONING" | "ENGLISH" | "GA" | "MIXED";
  diff: Diff;
  tier: Tier;
}
export interface ScoreEntry {
  score: number; correct: number; asked: number; best: number;
  kind: string; diff: string; tier: number; date: string;
}
export const SCORE_KEY = "ssc-cgl-rapidfire-ledger-v1";
export const HISTORY_KEY = "ssc-cgl-history-v1";
let memoryHistory: ScoreEntry[] = [];
let storageFailed = false;
export function validScore(value: unknown): value is ScoreEntry {
  if (!value || typeof value !== "object") return false;
  const x = value as ScoreEntry;
  return [x.score, x.correct, x.asked, x.best].every(n => Number.isSafeInteger(n) && n >= 0)
    && x.correct <= x.asked && x.best <= x.correct
    && ["QUANT", "REASONING", "ENGLISH", "GA", "MIXED", "SPRINT"].includes(x.kind)
    && (x.kind === "SPRINT" ? x.diff === "60s" : ["EASY", "MODERATE", "HARD"].includes(x.diff))
    && [1, 2].includes(x.tier) && typeof x.date === "string" && x.date.length <= 80;
}
export function loadHistory(): ScoreEntry[] {
  if (storageFailed) return [...memoryHistory];
  try {
    const raw = localStorage.getItem(HISTORY_KEY) ?? localStorage.getItem(SCORE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    memoryHistory = Array.isArray(parsed) ? parsed.filter(validScore).slice(-100) : [];
  } catch { /* blocked storage or corrupt data: keep current session */ }
  return [...memoryHistory];
}
export function loadScores(): ScoreEntry[] {
  return loadHistory().sort((a, b) => b.score - a.score).slice(0, 8);
}
export function saveScore(entry: ScoreEntry): ScoreEntry[] {
  if (!validScore(entry)) return loadScores();
  memoryHistory = [...loadHistory(), entry].slice(-100);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(memoryHistory));
    storageFailed = false;
  } catch { storageFailed = true; }
  return [...memoryHistory].sort((a, b) => b.score - a.score).slice(0, 8);
}
export function isRecord(entry: ScoreEntry, list: ScoreEntry[]): boolean {
  const comparable = list.filter(s => s.kind === entry.kind && s.diff === entry.diff && s.tier === entry.tier);
  return entry.score > 0 && (comparable.length === 0 || entry.score > Math.max(...comparable.map(s => s.score)));
}
export function clearScores(): boolean {
  memoryHistory = [];
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(SCORE_KEY);
    storageFailed = false;
    return true;
  } catch { storageFailed = true; return false; }
}
export function scoresAreSessionOnly() { return storageFailed; }
