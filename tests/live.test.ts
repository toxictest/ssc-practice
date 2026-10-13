import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordErrors } from '../scripts/live/schema.mjs';
import { chooseLive } from '../src/live/select';
import type { LiveBundle, LiveRecord } from '../src/live/types';
const bi = (text: string) => ({ en: text, hi: `हिंदी ${text}` });
const record = (id = 'qa-fixture', revision = 1): LiveRecord => ({
  id, revision, status: 'approved', reviewedBy: 'Automated test fixture — not published content', reviewedAt: '2026-10-13T10:00:00Z', asOfDate: '2026-10-13', source: { url: 'https://example.org/fixture', title: 'Test-only source' }, difficulty: 'MODERATE', tiers: [1, 2],
  question: { kind: 'GA', topic: bi('Fixture'), subtopic: bi('Fixture event'), stem: bi('Which fixture answer?'), options: [bi('A'), bi('B'), bi('C'), bi('D')], answer: 2, method: bi('Fixture explanation'), hack: bi('Fixture recall'), trap: bi('Fixture trap') },
});
const bundle = (questions: LiveRecord[], withdrawnIds: string[] = [], publishedAt = '2026-10-13T11:00:00Z'): LiveBundle => ({ schemaVersion: 1, publishedAt, questions, withdrawnIds });
beforeEach(() => {
  vi.resetModules(); const data = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) });
});
describe('live publication contract', () => {
  it('accepts a valid reviewed bilingual record and refuses missing review', () => {
    expect(recordErrors(record())).toEqual([]);
    expect(recordErrors({ ...record(), reviewedBy: '' })).not.toEqual([]);
    expect(recordErrors({ ...record(), reviewedBy: 42 })).not.toEqual([]);
  });
  it('rejects script sources, malformed data and duplicate distractors', () => {
    expect(recordErrors({ ...record(), source: { title: 'bad', url: 'javascript:alert(1)' } })).not.toEqual([]);
    const q = record(); q.question.options[1] = q.question.options[0]; expect(recordErrors(q)).not.toEqual([]);
    expect(recordErrors({ ...record(), question: { ...record().question, data: 42 } })).not.toEqual([]);
  });
  it('rejects draft records, duplicate IDs and malformed update envelopes from practice', async () => {
    const s = await import('../src/live/store');
    expect(() => s.parseBundle(bundle([{ ...record(), status: 'draft' } as unknown as LiveRecord]))).toThrow();
    expect(() => s.parseBundle(bundle([record(), record()]))).toThrow();
    expect(() => s.parseBundle({})).toThrow();
  });
  it('merges additions without removing old approved questions or duplicating repeated updates', async () => {
    const s = await import('../src/live/store'); s.importBundle(bundle([record('old-item')]));
    expect(s.importBundle(bundle([record('new-item')]))).toMatchObject({ added: 1, total: 2 });
    expect(s.importBundle(bundle([record('new-item')]))).toMatchObject({ added: 0, total: 2 });
  });
  it('supports explicit corrections and withdrawals', async () => {
    const s = await import('../src/live/store'); s.importBundle(bundle([record('old-item'), record('fix-item')]));
    expect(s.importBundle(bundle([record('fix-item', 2)], ['old-item']))).toMatchObject({ revised: 1, withdrawn: 1, total: 1 });
    expect(s.loadLiveQuestions()[0].revision).toBe(2);
  });
  it('rejects stale snapshots and keeps the installed bank', async () => {
    const s = await import('../src/live/store'); s.importBundle(bundle([record()]));
    expect(() => s.importBundle(bundle([], ['qa-fixture'], '2026-10-12T11:00:00Z'))).toThrow(/older/);
    expect(s.loadLiveQuestions()).toHaveLength(1);
  });
  it('has a session fallback when browser storage is blocked', async () => {
    const s = await import('../src/live/store'); vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    s.importBundle(bundle([record()])); expect(s.loadLiveQuestions()).toHaveLength(1); expect(s.liveStoragePersistent()).toBe(false);
  });
  it('prioritizes unseen/newer revisions and does not immediately repeat one record', () => {
    const old = record('old-item'), fresh = record('fresh-item');
    expect(chooseLive([old, fresh], { 'old-item@1': 123 }, '')?.id).toBe('fresh-item');
    expect(chooseLive([old], {}, old.id)).toBeUndefined();
    expect(chooseLive([record('old-item', 2), fresh], { 'old-item@1': 123, 'fresh-item@1': 999 }, '')?.revision).toBe(2);
  });
  it('offers three live slots then one original slot when enough compatible items exist', async () => {
    const s = await import('../src/live/store'); const selector = await import('../src/live/select');
    s.importBundle(bundle([record('item-one'), record('item-two'), record('item-three'), record('item-four')]));
    const results = Array.from({ length: 4 }, () => selector.nextPracticeQuestion('GA', 'MODERATE', 1));
    expect(results.slice(0,3).every(q => q.liveSource)).toBe(true); expect(results[3].liveSource).toBeUndefined();
    expect(new Set(results.slice(0,3).map(q => q.liveSource?.id)).size).toBe(3);
  });
  it('keeps the original engine for unsupported category/difficulty and empty live bank', async () => {
    const s = await import('../src/live/store'); const selector = await import('../src/live/select');
    expect(selector.nextPracticeQuestion('GA', 'MODERATE', 1).liveSource).toBeUndefined();
    s.importBundle(bundle([record()]));
    const q = selector.nextPracticeQuestion('QUANT', 'MODERATE', 1);
    expect(q.kind).toBe('QUANT'); expect(q.liveSource).toBeUndefined();
  });
});
