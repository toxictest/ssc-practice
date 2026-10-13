import { recordErrors, validDate } from '../../scripts/live/schema.mjs';
import type { LiveBundle, LiveRecord } from './types';
const KEY = 'ssc-cgl-approved-live-v1';
let memory: LiveRecord[] | null = null;
let latestPublished = '';
let persistent = true;
export function parseBundle(value: unknown): LiveBundle {
  const b = value as LiveBundle;
  if (!b || b.schemaVersion !== 1 || !validDate(b.publishedAt) || !Array.isArray(b.questions) || b.questions.length > 5000 || !Array.isArray(b.withdrawnIds) || b.withdrawnIds.length > 5000 || b.withdrawnIds.some(x => typeof x !== 'string' || x.length > 100)) throw new Error('Invalid published update format. Existing questions kept.');
  const ids = new Set<string>();
  for (const record of b.questions) {
    if (recordErrors(record).length || record.status !== 'approved' || ids.has(record.id) || b.withdrawnIds.includes(record.id)) throw new Error('Question validation failed. Existing questions kept.');
    ids.add(record.id);
  }
  return b;
}
export function loadLiveQuestions(): LiveRecord[] {
  if (memory) return memory;
  try {
    const data = localStorage.getItem(KEY);
    if (data) { const b = parseBundle(JSON.parse(data)); memory = b.questions; latestPublished = b.publishedAt; }
  } catch { /* invalid/blocked browser storage must never break base practice */ }
  return memory ??= [];
}
export function liveStoragePersistent() { return persistent; }
export function importBundle(bundle: LiveBundle) {
  const b = parseBundle(bundle);
  const old = loadLiveQuestions();
  if (latestPublished && Date.parse(b.publishedAt) < Date.parse(latestPublished)) throw new Error('Server returned an older update. Installed questions kept.');
  const merged = new Map(old.map(q => [q.id, q]));
  let added = 0, revised = 0, withdrawn = 0;
  for (const id of b.withdrawnIds) if (merged.delete(id)) withdrawn++;
  for (const record of b.questions) {
    const previous = merged.get(record.id);
    if (!previous) { added++; merged.set(record.id, record); }
    else if (record.revision > previous.revision) { revised++; merged.set(record.id, record); }
  }
  const questions = [...merged.values()];
  if (questions.length > 5000) throw new Error('Live-bank safety limit reached. Existing bank kept.');
  memory = questions; latestPublished = b.publishedAt;
  try { localStorage.setItem(KEY, JSON.stringify({ ...b, questions, withdrawnIds: [] })); persistent = true; }
  catch { persistent = false; }
  return { added, revised, withdrawn, total: questions.length };
}
export async function fetchLiveJSON(path: 'questions.json' | 'research.json') {
  // Cache-busting + SW network-only branch: never label an offline snapshot as a fresh update.
  const response = await fetch(`${import.meta.env.BASE_URL}live/${path}?check=${Date.now()}`, {
    cache: 'no-store', signal: AbortSignal.timeout(20_000), credentials: 'same-origin',
  });
  if (!response.ok) throw new Error(`Update server returned HTTP ${response.status}. Old practice is unchanged.`);
  const text = await response.text();
  if (text.length > 12_000_000) throw new Error('Update is too large. Old practice is unchanged.');
  try { return JSON.parse(text) as unknown; } catch { throw new Error('Update response is not valid JSON. Old practice is unchanged.'); }
}
