import { recordErrors, validHttps } from './schema.mjs';
const $ = id => document.getElementById(id);
const form = $('question-form');
const fields = [['topic', 'Topic'], ['subtopic', 'Subtopic / event'], ['stem', 'Question stem'], ['option0', 'Option A'], ['option1', 'Option B'], ['option2', 'Option C'], ['option3', 'Option D'], ['method', 'Verified explanation'], ['hack', 'Recall / solve tip'], ['trap', 'Common mistake']];
const message = text => { $('status').textContent = text; };
const storageGet = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const storageSet = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { message('Browser storage is blocked. Download the bank before closing this tab.'); } };
let bank = storageGet('ssc-live-review-bank-v1');
if (!Array.isArray(bank) || bank.some(q => recordErrors(q).length)) bank = [];
let items = [];
const field = name => form.elements.namedItem(name);
const setField = (name, value) => { const el = field(name); if (el) el.value = value ?? ''; };
for (const [name, label] of fields) for (const lang of ['en', 'hi']) {
  const wrapper = document.createElement('label'); wrapper.textContent = `${label} · ${lang === 'en' ? 'English' : 'हिंदी'}`;
  const input = document.createElement(['stem', 'method', 'hack', 'trap'].includes(name) ? 'textarea' : 'input');
  input.name = `${name}_${lang}`; input.required = true; input.maxLength = 5000; input.lang = lang;
  wrapper.append(input); $('bilingual-fields').append(wrapper);
}
function persist() { storageSet('ssc-live-review-bank-v1', bank); renderBank(); }
function stashForm() { storageSet('ssc-live-review-form-v1', Object.fromEntries(new FormData(form))); }
function blank() {
  form.reset(); setField('asOfDate', new Date().toLocaleDateString('en-CA')); $('verified').checked = false; stashForm();
}
function loadRecord(r) {
  blank();
  for (const key of ['id', 'difficulty', 'asOfDate', 'reviewedBy']) setField(key, r[key]);
  setField('revision', r.status === 'approved' ? r.revision + 1 : r.revision);
  setField('sourceUrl', r.source?.url); setField('sourceTitle', r.source?.title);
  setField('kind', r.question?.kind || 'GA'); setField('tiers', r.tiers?.join(',') || '1,2');
  for (const [key] of fields) for (const lang of ['en', 'hi']) {
    const value = key.startsWith('option') ? r.question?.options?.[Number(key.slice(-1))]?.[lang] : r.question?.[key]?.[lang];
    setField(`${key}_${lang}`, value);
  }
  setField('answer', r.question?.answer); $('verified').checked = false;
  stashForm(); form.scrollIntoView({ behavior: 'smooth' });
}
function readForm(status) {
  const f = Object.fromEntries(new FormData(form));
  const bi = key => ({ en: f[`${key}_en`]?.trim() || '', hi: f[`${key}_hi`]?.trim() || '' });
  return { id: f.id.trim(), revision: Number(f.revision), status, reviewedBy: f.reviewedBy.trim(), reviewedAt: status === 'approved' ? new Date().toISOString() : '', asOfDate: f.asOfDate,
    source: { url: f.sourceUrl.trim(), title: f.sourceTitle.trim() }, difficulty: f.difficulty, tiers: f.tiers.split(',').map(Number),
    question: { kind: f.kind, topic: bi('topic'), subtopic: bi('subtopic'), stem: bi('stem'), options: [0,1,2,3].map(i => bi(`option${i}`)), answer: f.answer === '' ? -1 : Number(f.answer), method: bi('method'), hack: bi('hack'), trap: bi('trap') } };
}
function addRecord(status) {
  if (status === 'approved' && (!form.reportValidity() || !$('verified').checked)) { message('Complete all fields and confirm source/answer verification first.'); return; }
  const record = readForm(status); const errors = recordErrors(record);
  const previous = bank.find(q => q.id === record.id);
  if (previous?.status === 'approved' && record.revision <= previous.revision) errors.push('Increase the revision for an already-approved question.');
  if (previous?.status === 'approved' && status === 'draft') errors.push('Do not downgrade a published ID to draft. Use a new draft ID or withdraw the old question.');
  if (errors.length) { message(errors.join('\n')); return; }
  bank = [...bank.filter(q => q.id !== record.id), record]; persist();
  message(status === 'approved' ? 'Added to local export bank, NOT published. Download full JSON and commit it to content/live-questions.json.' : 'Draft saved locally. It will NOT be published as a practice question.');
}
function renderBank() {
  $('bank-info').textContent = `${bank.filter(q => q.status === 'approved').length} approved · ${bank.filter(q => q.status === 'draft').length} drafts · ${bank.filter(q => q.status === 'withdrawn').length} withdrawals in this local export bank.`;
  $('bank-list').replaceChildren();
  for (const q of bank) {
    const li = document.createElement('li'); const label = document.createElement('span'); label.textContent = `${q.id} · revision ${q.revision} · ${q.status}`; li.append(label);
    const actions = document.createElement('div'); actions.className = 'row';
    const edit = document.createElement('button'); edit.textContent = 'Edit'; edit.className = 'secondary'; edit.onclick = () => loadRecord(q); actions.append(edit);
    const withdraw = document.createElement('button'); withdraw.textContent = 'Withdraw'; withdraw.className = 'secondary';
    withdraw.onclick = () => { if (!confirm(`Withdraw ${q.id}? After publishing, this removes it from live practice on the next update.`)) return; q.status = 'withdrawn'; q.revision++; persist(); message('Withdrawal recorded locally. Download and publish the bank to apply it.'); };
    actions.append(withdraw); li.append(actions); $('bank-list').append(li);
  }
}
function renderInbox() {
  const search = $('search').value.trim().toLowerCase(); $('inbox').replaceChildren();
  for (const item of items.filter(i => `${i.title} ${i.sourceName}`.toLowerCase().includes(search)).slice(0,100)) {
    const li = document.createElement('li'); const a = document.createElement('a'); a.href = item.url; a.textContent = item.title; a.target = '_blank'; a.rel = 'noopener noreferrer';
    const meta = document.createElement('small'); meta.textContent = `${item.sourceName} · Source date: ${item.sourceDateText || item.publishedAt || 'not supplied'} · First collected: ${item.firstSeenAt}`;
    const button = document.createElement('button'); button.textContent = 'Prepare a question from this source'; button.className = 'secondary';
    button.onclick = () => {
      const id = `ca-${item.id}`; const existing = bank.find(q => q.id === id);
      if (existing) { loadRecord(existing); message('Existing record opened. Increase revision if correcting a published question.'); return; }
      if (field('stem_en').value && !confirm('Replace the current form? Save it as a draft first if needed.')) return;
      blank(); setField('id', id); setField('sourceUrl', item.url); setField('sourceTitle', item.title); stashForm(); form.scrollIntoView({ behavior: 'smooth' });
      message('Source reference copied. No question or answer was auto-generated. Read the article and author/verify the MCQ below.');
    };
    li.append(a, meta, button); $('inbox').append(li);
  }
}
async function load() {
  message('Checking published source data…'); $('refresh').disabled = true;
  try {
    const fetchJSON = async name => { const r = await fetch(`./live/${name}?check=${Date.now()}`, { cache: 'no-store', signal: AbortSignal.timeout(20000) }); if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`); return r.json(); };
    const results = await Promise.allSettled([fetchJSON('research.json'), fetchJSON('questions.json')]);
    const notes = [];
    if (results[0].status === 'fulfilled') {
      const r = results[0].value;
      if (r.schemaVersion !== 1 || !Array.isArray(r.items) || !Array.isArray(r.sources)) throw new Error('Invalid inbox');
      items = r.items.filter(i => i && typeof i.title === 'string' && validHttps(i.url));
      $('research-info').textContent = `Collector checked ${r.checkedAt}. ${r.sources.map(s => `${s.name}: ${s.ok ? 'OK' : 'FAILED, previous data retained'}`).join(' · ')}`; renderInbox();
    } else notes.push('Headlines unavailable. Old local drafts are retained.');
    if (results[1].status === 'fulfilled') {
      const b = results[1].value;
      if (b.schemaVersion !== 1 || !Array.isArray(b.questions) || b.questions.some(q => recordErrors(q).length || q.status !== 'approved') || !Array.isArray(b.withdrawnIds)) throw new Error('Invalid published bank');
      const merged = new Map(bank.map(q => [q.id, q]));
      for (const q of b.questions) if (!merged.has(q.id) || merged.get(q.id).revision < q.revision) merged.set(q.id, q);
      for (const id of b.withdrawnIds) {
        const revision = b.withdrawals?.find(w => w.id === id)?.revision || 1;
        if (!merged.has(id) || merged.get(id).revision <= revision) merged.set(id, { id, revision, status: 'withdrawn' });
      }
      bank = [...merged.values()]; persist();
    } else notes.push('Published bank unavailable. Before exporting, import the repository bank to preserve all existing entries.');
    message(notes.join(' ') || `Inbox loaded: ${items.length} headlines. No MCQs auto-generated. Local export bank is not the live website.`);
  } catch (error) { message(error.message || 'Could not load updates. Existing data retained.'); }
  finally { $('refresh').disabled = false; }
}
$('question-form').addEventListener('submit', e => { e.preventDefault(); addRecord('approved'); });
form.addEventListener('input', stashForm); form.addEventListener('change', stashForm);
$('draft').onclick = () => addRecord('draft'); $('clear-form').onclick = () => { if (confirm('Clear this form? Saved bank entries will remain.')) blank(); };
$('search').oninput = renderInbox; $('refresh').onclick = load;
$('download').onclick = () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ schemaVersion: 1, questions: bank }, null, 2) + '\n'], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'live-questions.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  message('Downloaded full local bank. Review it and commit to content/live-questions.json. Downloading does not publish anything.');
};
$('bank-file').onchange = async () => {
  const file = $('bank-file').files[0]; if (!file) return;
  try {
    if (file.size > 12_000_000) throw new Error('File too large');
    const data = JSON.parse(await file.text());
    if (data.schemaVersion !== 1 || !Array.isArray(data.questions) || data.questions.length > 5000 || data.questions.some(q => recordErrors(q).length) || new Set(data.questions.map(q => q.id)).size !== data.questions.length) throw new Error('Invalid bank or duplicate IDs');
    if (!confirm('Replace the local export bank with this file? Download a backup of local drafts first.')) return;
    bank = data.questions; persist(); message('Owner bank imported locally. No changes have been published.');
  } catch (error) { message(error.message || 'Import failed'); }
};
// Capture before blank() so a page reload does not erase the unsaved authoring form.
const savedDraft = storageGet('ssc-live-review-form-v1');
blank();
if (savedDraft && typeof savedDraft === 'object') {
  for (const [key,value] of Object.entries(savedDraft)) setField(key,value);
  stashForm();
}
$('verified').checked = false;
renderBank(); void load();
