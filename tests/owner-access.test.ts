import { expect, it } from 'vitest';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const bi = (x: string) => ({ en: x, hi: x });
const record = { id: 'test-only-owner-record', revision: 1, status: 'approved', asOfDate: '2026-10-13', difficulty: 'MODERATE', tiers: [1], source: { url: 'https://example.org/test-fixture', title: 'TEST ONLY' }, question: { kind: 'GA', topic: bi('test'), subtopic: bi('test'), stem: bi('TEST ONLY question'), options: [bi('A'), bi('B'), bi('C'), bi('D')], answer: 1, method: bi('test'), hack: bi('test'), trap: bi('test') } };
async function trial(env: Record<string,string>, input: unknown = record) {
  const root = await mkdtemp(path.join(tmpdir(),'ssc-owner-access-'));
  try {
    for (const dir of ['scripts/live', 'content', 'public/live']) await mkdir(path.join(root,dir),{recursive:true});
    for (const file of ['apply-owner-question.mjs','compile.mjs','schema.mjs']) await copyFile(`scripts/live/${file}`,path.join(root,'scripts/live',file));
    await writeFile(path.join(root,'content/live-questions.json'),JSON.stringify({schemaVersion:1,questions:[]}));
    const run = spawnSync(process.execPath,['scripts/live/apply-owner-question.mjs'],{cwd:root,encoding:'utf8',env:{...process.env,GITHUB_REPOSITORY_OWNER:'toxictest',GITHUB_ACTOR:'toxictest',GITHUB_REF:'refs/heads/main',OWNER_CONFIRMED:'true',OWNER_RECORD_JSON:JSON.stringify(input),...env}});
    const bank = JSON.parse(await readFile(path.join(root,'content/live-questions.json'),'utf8'));
    return {run,bank};
  } finally { await rm(root,{recursive:true,force:true}); }
}
it('denies a non-owner even if that actor could dispatch a workflow',async()=>{
  const {run,bank}=await trial({GITHUB_ACTOR:'another-user'}); expect(run.status).not.toBe(0); expect(bank.questions).toHaveLength(0); expect(run.stderr).toContain('only the repository owner');
});
it('requires explicit confirmation and the main branch',async()=>{
  for (const env of [{OWNER_CONFIRMED:'false'},{GITHUB_REF:'refs/heads/other'}]) { const {run,bank}=await trial(env);expect(run.status).not.toBe(0);expect(bank.questions).toHaveLength(0); }
});
it('accepts a validated owner record and stamps the authenticated actor',async()=>{
  const {run,bank}=await trial({});expect(run.status).toBe(0);expect(bank.questions[0].reviewedBy).toBe('toxictest');expect(bank.questions[0].id).toBe(record.id);
});
it('invalid questions never alter the bank',async()=>{
  const {run,bank}=await trial({}, {...record,question:{...record.question,answer:99}});expect(run.status).not.toBe(0);expect(bank.questions).toHaveLength(0);
});
