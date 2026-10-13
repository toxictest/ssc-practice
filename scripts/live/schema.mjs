/** Shared, non-AI publication contract. Validation is not factual verification. */
export function validHttps(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && u.hostname.includes('.') && !['localhost', '127.0.0.1'].includes(u.hostname); } catch { return false; }
}
export function recordErrors(r) {
  const errors = [];
  if (!r || typeof r !== 'object') return ['Record must be an object'];
  if (typeof r.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,99}$/.test(r.id)) errors.push('id must be 3–100 letters, numbers, _ or -');
  if (!Number.isSafeInteger(r.revision) || r.revision < 1) errors.push('revision must be a positive integer');
  if (!['draft', 'approved', 'withdrawn'].includes(r.status)) errors.push('status must be draft, approved or withdrawn');
  if (r.status !== 'approved') return errors;
  if (typeof r.reviewedBy !== 'string' || !r.reviewedBy.trim() || r.reviewedBy.length > 120) errors.push('reviewedBy is required (max 120 characters)');
  if (!validDate(r.reviewedAt)) errors.push('reviewedAt must be a valid timestamp with timezone');
  if (!validHttps(r.source?.url)) errors.push('An HTTPS source URL is required');
  if (typeof r.source?.title !== 'string' || !r.source.title.trim() || r.source.title.length > 500) errors.push('Source title is required (max 500 characters)');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.asOfDate || '') || !Number.isFinite(Date.parse(r.asOfDate))) errors.push('asOfDate must be YYYY-MM-DD');
  if (!['EASY', 'MODERATE', 'HARD'].includes(r.difficulty)) errors.push('Invalid difficulty');
  if (!Array.isArray(r.tiers) || !r.tiers.length || r.tiers.some(t => t !== 1 && t !== 2)) errors.push('tiers must contain 1 and/or 2');
  const q = r.question;
  if (q?.data !== undefined && (typeof q.data !== 'string' || q.data.length > 10000)) errors.push('Optional question data must be a string (max 10000)');
  if (!q || !['QUANT', 'REASONING', 'ENGLISH', 'GA'].includes(q.kind)) errors.push('Invalid question category');
  const bi = (value, label) => {
    for (const lang of ['en', 'hi']) if (typeof value?.[lang] !== 'string' || !value[lang].trim() || value[lang].length > 5000) errors.push(`${label}.${lang} is required (max 5000 characters)`);
  };
  for (const key of ['topic', 'subtopic', 'stem', 'method', 'hack', 'trap']) bi(q?.[key], key);
  if (!Array.isArray(q?.options) || q.options.length !== 4) errors.push('Exactly four options required');
  else {
    q.options.forEach((o, i) => bi(o, `options[${i}]`));
    for (const lang of ['en', 'hi']) if (new Set(q.options.map(o => typeof o?.[lang] === 'string' ? o[lang].trim().toLowerCase() : '')).size !== 4) errors.push(`Duplicate ${lang} options`);
  }
  if (!Number.isInteger(q?.answer) || q.answer < 0 || q.answer > 3) errors.push('answer must be 0–3');
  return errors;
}
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(value) && Number.isFinite(Date.parse(value));
}
