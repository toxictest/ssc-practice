/** Only run inside the authenticated owner workflow. Never shipped to the browser. */
import { readFile, writeFile } from 'node:fs/promises';
import { recordErrors } from './schema.mjs';
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const actor = process.env.GITHUB_ACTOR;
if (!owner || !actor || actor.toLowerCase() !== owner.toLowerCase()) throw new Error('Denied: only the repository owner may publish questions.');
if (process.env.GITHUB_REF !== 'refs/heads/main') throw new Error('Denied: publishing is only allowed from main.');
if (process.env.OWNER_CONFIRMED !== 'true') throw new Error('Owner review confirmation is required.');
const input = process.env.OWNER_RECORD_JSON || '';
if (!input || input.length > 60000) throw new Error('Provide one JSON record, at most 60,000 characters.');
let record;
try { record = JSON.parse(input); } catch { throw new Error('Question record is not valid JSON.'); }
if (!record || typeof record !== 'object' || !['approved', 'withdrawn'].includes(record.status)) throw new Error('Only approved questions or explicit withdrawals can be published.');
// The authenticated actor owns this declaration; the program does not fact-check the source.
record.reviewedBy = actor;
record.reviewedAt = new Date().toISOString();
const errors = recordErrors(record);
if (errors.length) throw new Error(errors.join('; '));
const path = 'content/live-questions.json';
const original = await readFile(path, 'utf8');
const bank = JSON.parse(original);
if (bank.schemaVersion !== 1 || !Array.isArray(bank.questions)) throw new Error('Existing canonical bank is invalid.');
const previous = bank.questions.find(q => q.id === record.id);
if (previous && record.revision <= previous.revision) throw new Error('Increase revision beyond the existing record before editing or withdrawing it.');
if (!previous && record.status === 'withdrawn') throw new Error('Cannot withdraw an unknown question ID.');
const next = { ...bank, questions: [...bank.questions.filter(q => q.id !== record.id), record] };
if (next.questions.length > 5000) throw new Error('Question-bank safety limit reached.');
await writeFile(path, JSON.stringify(next, null, 2) + '\n');
try { await import('./compile.mjs'); }
catch (error) { await writeFile(path, original); throw error; }
console.log(`Owner-reviewed record accepted: ${record.id} revision ${record.revision} (${record.status}).`);
