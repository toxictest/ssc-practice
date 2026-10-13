import { beforeEach, expect, it, vi } from 'vitest';
import { DEFAULT_PREFERENCES, loadPreferences, PREFERENCES_KEY, savePreferences } from '../src/game/preferences';
import type { ScoreEntry } from '../src/game/scores';
const entry: ScoreEntry = { score: 100, asked: 2, correct: 1, best: 1, kind: 'QUANT', diff: 'EASY', tier: 1, date: '2026-10-13' };
beforeEach(() => {
  vi.resetModules(); const data = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => data.set(k, v), removeItem: (k: string) => data.delete(k) });
});
it('validates preferences and persists user choices', () => {
  expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  localStorage.setItem(PREFERENCES_KEY, '{bad json'); expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ config: { tier: 99, kind: 'INVALID' } })); expect(loadPreferences().config).toEqual(DEFAULT_PREFERENCES.config);
  savePreferences({ ...DEFAULT_PREFERENCES, lang: 'HI', muted: true }); expect(loadPreferences().lang).toBe('HI'); expect(loadPreferences().muted).toBe(true);
});
it('rejects malformed score entries instead of crashing the UI', async () => {
  const s = await import('../src/game/scores');
  localStorage.setItem(s.HISTORY_KEY, JSON.stringify([null, {}, entry, { ...entry, score: -10 }, { ...entry, correct: 8 }]));
  expect(s.loadHistory()).toEqual([entry]);
});
it('migrates the original ledger and keeps at most 100 runs / 8 bests', async () => {
  const s = await import('../src/game/scores');
  localStorage.setItem(s.SCORE_KEY, JSON.stringify([entry])); expect(s.loadScores()).toEqual([entry]);
  for (let i = 1; i <= 110; i++) s.saveScore({ ...entry, score: i });
  expect(s.loadHistory()).toHaveLength(100); expect(s.loadScores()).toHaveLength(8); expect(s.loadScores()[0].score).toBe(110);
});
it('compares records only within the same mode, tier and difficulty; ties are not records', async () => {
  const s = await import('../src/game/scores');
  expect(s.isRecord(entry, [{ ...entry, kind: 'SPRINT', diff: '60s', score: 1000 }])).toBe(true);
  expect(s.isRecord(entry, [entry])).toBe(false); expect(s.isRecord({ ...entry, score: 0 }, [])).toBe(false);
});
it('retains multiple runs in memory when storage writes are blocked', async () => {
  const s = await import('../src/game/scores');
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  s.saveScore(entry); s.saveScore({ ...entry, score: 200 });
  expect(s.loadHistory()).toHaveLength(2); expect(s.scoresAreSessionOnly()).toBe(true);
});
it('deletes only game score data and keeps preferences / unrelated keys', async () => {
  const s = await import('../src/game/scores');
  localStorage.setItem('unrelated', 'keep'); savePreferences(DEFAULT_PREFERENCES); s.saveScore(entry);
  expect(s.clearScores()).toBe(true); expect(s.loadHistory()).toEqual([]);
  expect(localStorage.getItem('unrelated')).toBe('keep'); expect(localStorage.getItem(PREFERENCES_KEY)).not.toBeNull();
});
