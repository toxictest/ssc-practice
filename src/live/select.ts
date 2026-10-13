import { makeQuestion } from '../engine';
import { shuffle, uid } from '../kit';
import type { Diff, Kind, Tier } from '../kit';
import type { LivePracticeQuestion, LiveRecord } from './types';
import { loadLiveQuestions } from './store';
const SEEN_KEY = 'ssc-cgl-live-seen-v1';
let seen: Record<string, number> | null = null;
let slot = 0;
let previousId = '';
function seenMap() {
  if (seen) return seen;
  try {
    const data = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') as Record<string, unknown>;
    if (data && typeof data === 'object' && !Array.isArray(data)) seen = Object.fromEntries(Object.entries(data).filter(([key, value]) => key.length <= 120 && Number.isFinite(value)).slice(-10000)) as Record<string, number>;
  } catch { /* session fallback */ }
  return seen ??= {};
}
export function chooseLive(pool: LiveRecord[], visited: Record<string, number>, lastId: string): LiveRecord | undefined {
  const candidates = pool.filter(r => r.id !== lastId);
  return candidates.sort((a, b) => {
    const av = visited[`${a.id}@${a.revision}`] ?? 0, bv = visited[`${b.id}@${b.revision}`] ?? 0;
    if (!av && bv) return -1; if (av && !bv) return 1;
    return av && bv ? av - bv : Date.parse(b.reviewedAt) - Date.parse(a.reviewedAt);
  })[0];
}
/** Additive adapter: original engine remains byte-for-byte unchanged. */
export function nextPracticeQuestion(kind: Kind | 'MIXED', diff: Diff, tier: Tier): LivePracticeQuestion {
  slot++;
  const compatible = loadLiveQuestions().filter(r => (kind === 'MIXED' || r.question.kind === kind) && r.difficulty === diff && r.tiers.includes(tier));
  const record = slot % 4 !== 0 ? chooseLive(compatible, seenMap(), previousId) : undefined;
  if (!record) { previousId = ''; return makeQuestion(kind, diff, tier); }
  previousId = record.id;
  const visited = seenMap(); visited[`${record.id}@${record.revision}`] = Date.now();
  // Keep a bounded record of recently served versions. This is selection history, not mastery tracking.
  seen = Object.fromEntries(Object.entries(visited).sort((a,b) => a[1]-b[1]).slice(-10000));
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch { /* session fallback */ }
  const q = record.question;
  const correct = q.options[q.answer];
  const options = shuffle(q.options);
  return { ...q, options, answer: options.indexOf(correct), id: `live-${record.id}-${uid()}`, liveSource: { id: record.id, revision: record.revision, asOfDate: record.asOfDate, reviewedAt: record.reviewedAt, source: record.source } };
}
