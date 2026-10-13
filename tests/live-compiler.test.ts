import { expect, it } from 'vitest';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const bi = (value: string) => ({ en: value, hi: value });
const item = { id: 'test-record', status: 'approved', revision: 1, reviewedBy: 'TEST ONLY', reviewedAt: '2026-10-13T10:00:00Z', asOfDate: '2026-10-13', source: { title: 'Test fixture', url: 'https://example.org/test' }, difficulty: 'MODERATE', tiers: [1], question: { kind: 'GA', topic: bi('test'), subtopic: bi('test'), stem: bi('test?'), options: [bi('A'),bi('B'),bi('C'),bi('D')], answer: 1, method: bi('test'), hack: bi('test'), trap: bi('test') } };
async function workspace(run: (root: string, publish: (questions: unknown[]) => Promise<ReturnType<typeof spawnSync>>) => Promise<void>) {
  const root = await mkdtemp(path.join(tmpdir(), 'ssc-live-compile-'));
  try {
    for (const dir of ['scripts/live','content','public/live']) await mkdir(path.join(root,dir), { recursive: true });
    for (const file of ['compile.mjs','schema.mjs']) await copyFile(`scripts/live/${file}`, path.join(root,'scripts/live',file));
    await run(root, async questions => {
      await writeFile(path.join(root,'content/live-questions.json'), JSON.stringify({ schemaVersion: 1, questions }));
      return spawnSync(process.execPath, ['scripts/live/compile.mjs'], { cwd: root, encoding: 'utf8' });
    });
  } finally { await rm(root, { recursive: true, force: true }); }
}
it('publisher excludes drafts but emits reviewed records', async () => {
  await workspace(async (root,publish) => {
    expect((await publish([item, { id: 'test-draft', status: 'draft', revision: 1 }])).status).toBe(0);
    const b=JSON.parse(await readFile(path.join(root,'public/live/questions.json'),'utf8'));
    expect(b.questions).toHaveLength(1); expect(b.questions[0].id).toBe(item.id);
  });
});
it('publisher blocks silent deletion, changed content without revision, and downgrade to draft', async () => {
  await workspace(async (_root,publish) => {
    expect((await publish([item])).status).toBe(0);
    expect((await publish([])).status).not.toBe(0);
    expect((await publish([{ ...item, reviewedBy: 'Changed reviewer' }])).status).not.toBe(0);
    expect((await publish([{ ...item, status: 'draft' }])).status).not.toBe(0);
    expect((await publish([{ ...item, revision: 2, reviewedBy: 'Changed reviewer' }])).status).toBe(0);
  });
});
it('publisher preserves withdrawals and requires a newer revision to restore one', async () => {
  await workspace(async (_root,publish) => {
    expect((await publish([item])).status).toBe(0);
    expect((await publish([{ ...item, status: 'withdrawn', revision: 2 }])).status).toBe(0);
    expect((await publish([])).status).not.toBe(0);
    expect((await publish([item])).status).not.toBe(0);
    expect((await publish([{ ...item, revision: 3 }])).status).toBe(0);
  });
});
