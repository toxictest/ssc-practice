import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { recordErrors } from './schema.mjs';
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const bank = await read('content/live-questions.json');
if (bank.schemaVersion !== 1 || !Array.isArray(bank.questions) || bank.questions.length > 5000) throw new Error('Invalid question-bank envelope / > 5000 records');
let previous = { questions: [] };
try { previous = await read('public/live/questions.json'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const old = new Map(previous.questions.map(q => [q.id, q]));
const oldWithdrawals = new Map((previous.withdrawals || []).map(q => [q.id, q.revision]));
const ids = new Set();
for (const record of bank.questions) {
  const errors = recordErrors(record);
  if (ids.has(record.id)) errors.push('Duplicate id');
  ids.add(record.id);
  const withdrawnRevision = oldWithdrawals.get(record.id);
  if (withdrawnRevision && record.status === 'approved' && record.revision <= withdrawnRevision) errors.push('Reapproval must increase the withdrawn revision');
  const prior = old.get(record.id);
  if (prior && record.status === 'draft') errors.push('Published records cannot become drafts. Use withdrawal instead.');
  if (prior && record.status === 'approved') {
    if (record.revision < prior.revision) errors.push('Revision rollback is not allowed');
    if (record.revision === prior.revision && JSON.stringify(record) !== JSON.stringify(prior)) errors.push('Increment revision when editing an already-published question');
  }
  if (errors.length) throw new Error(`${record.id || '(missing id)'}: ${errors.join('; ')}`);
}
// Removing a published item silently is not allowed; use a withdrawn tombstone.
for (const id of [...old.keys(), ...oldWithdrawals.keys()]) if (!ids.has(id)) throw new Error(`Published ${id} is missing. Keep it or mark it withdrawn.`);
const bundle = {
  schemaVersion: 1, publishedAt: new Date().toISOString(),
  questions: bank.questions.filter(q => q.status === 'approved'),
  withdrawnIds: bank.questions.filter(q => q.status === 'withdrawn').map(q => q.id),
  withdrawals: bank.questions.filter(q => q.status === 'withdrawn').map(({ id, revision }) => ({ id, revision })),
};
await mkdir('public/live', { recursive: true });
await writeFile('public/live/questions.json', JSON.stringify(bundle, null, 2) + '\n');
// The browser importer and standalone review page use exactly the publisher's validator.
await copyFile('scripts/live/schema.mjs', 'public/live/schema.mjs');
console.log(`Published ${bundle.questions.length} approved questions; ${bundle.withdrawnIds.length} withdrawn. Drafts stay out of practice.`);
