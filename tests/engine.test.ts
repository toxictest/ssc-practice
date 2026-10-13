import { afterEach, describe, expect, it, vi } from 'vitest';
import { B, buildOptions, localizeQuestion, trim } from '../src/kit';
import { makeQuestion, timeForTier } from '../src/engine';
import { makeSprintItem } from '../src/game/sprint';
function seed() { let s = 739391; vi.spyOn(Math, 'random').mockImplementation(() => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; }); }
afterEach(() => vi.restoreAllMocks());
describe('formatting and option construction', () => {
  it('preserves integer zeros and trims decimal zeros only', () => {
    expect(trim(100, 0)).toBe('100'); expect(trim(0, 0)).toBe('0');
    expect(trim(100)).toBe('100'); expect(trim(12.50)).toBe('12.5'); expect(trim(-10, 0)).toBe('-10');
  });
  it('deduplicates distractors and creates four options', () => {
    const result = buildOptions(B('100', '100'), [B('100', '100'), B('101', '101'), B('101', '101')]);
    expect(result.options).toHaveLength(4); expect(new Set(result.options.map(o => o.en)).size).toBe(4);
    expect(result.options[result.answer].en).toBe('100');
  });
  it('keeps the intended time limits', () => {
    expect(timeForTier(1, 'EASY')).toBe(37); expect(timeForTier(1, 'MODERATE')).toBe(32);
    expect(timeForTier(2, 'MODERATE')).toBe(75); expect(timeForTier(2, 'HARD')).toBe(69);
  });
});
describe('seeded procedural generator checks (not a factual content audit)', () => {
  for (const kind of ['QUANT', 'REASONING', 'ENGLISH', 'GA', 'MIXED'] as const) {
    it(`${kind}: 600 questions across both tiers and every difficulty`, () => {
      seed();
      const ids = new Set<string>();
      for (const tier of [1, 2] as const) for (const diff of ['EASY', 'MODERATE', 'HARD'] as const) {
        for (let i = 0; i < 100; i++) {
          const q = makeQuestion(kind, diff, tier);
          if (kind !== 'MIXED') expect(q.kind).toBe(kind);
          expect(ids.has(q.id)).toBe(false); ids.add(q.id);
          expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4);
          for (const lang of ['EN', 'HI'] as const) {
            const view = localizeQuestion(q, lang);
            expect(view.options).toHaveLength(4);
            expect(new Set(view.options).size, `${q.subtopic.en}: ${lang}: ${view.options}`).toBe(4);
            for (const text of [view.stem, view.method, view.hack, view.trap, ...view.options]) {
              expect(text.trim().length).toBeGreaterThan(0); expect(text).not.toMatch(/\b(NaN|Infinity|undefined)\b/);
            }
          }
        }
      }
    });
  }
  it('validates 2,000 sprint items and the ending-in-5 explanation regression', () => {
    seed(); let squares = 0;
    for (let i = 0; i < 2000; i++) {
      const q = makeSprintItem();
      expect(q.options).toHaveLength(4); expect(new Set(q.options).size).toBe(4);
      expect(q.options.filter(o => o === q.answer)).toHaveLength(1);
      if (q.kind === 'VEDIC SQUARE') {
        squares++; const n = Number(q.prompt.split('²')[0]);
        expect(Number(q.answer)).toBe(n * n); expect(q.tip).toContain(`→ ${n * n}.`);
      }
    }
    expect(squares).toBeGreaterThan(50);
  });
});
