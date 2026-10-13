import { useState } from 'react';
import { validDate, validHttps } from '../../scripts/live/schema.mjs';
import { fetchLiveJSON, importBundle, liveStoragePersistent, loadLiveQuestions, parseBundle } from './store';
import type { ResearchSnapshot } from './types';
import './live.css';
export default function LiveUpdates() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(() => loadLiveQuestions().length);
  const [message, setMessage] = useState('Original questions stay available. New MCQs require source verification and owner approval.');
  const [research, setResearch] = useState<ResearchSnapshot | null>(null);
  const update = async () => {
    if (busy) return;
    setOpen(true); setBusy(true); setMessage('Checking the latest published question bank and collected source headlines…');
    const [bankResult, researchResult] = await Promise.allSettled([fetchLiveJSON('questions.json'), fetchLiveJSON('research.json')]);
    const notes: string[] = [];
    if (bankResult.status === 'fulfilled') {
      try {
        const bank = parseBundle(bankResult.value); const result = importBundle(bank); setCount(result.total);
        notes.push(`${result.added} new, ${result.revised} corrected, ${result.withdrawn} withdrawn. ${result.total} approved live questions installed.`);
        if (!result.total) notes.push('No approved MCQs are published yet. Headlines below are research material, not questions.');
        notes.push(`Question bundle published: ${new Date(bank.publishedAt).toLocaleString()}.`);
      } catch (error) { notes.push(error instanceof Error ? error.message : 'Question update failed.'); }
    } else notes.push('Question update unavailable/offline. Installed and original questions are unchanged.');
    if (researchResult.status === 'fulfilled') {
      const value = researchResult.value as ResearchSnapshot;
      if (value && value.schemaVersion === 1 && validDate(value.checkedAt) && Array.isArray(value.items) && Array.isArray(value.sources)) {
        const items = value.items.filter(i => i && typeof i.title === 'string' && typeof i.sourceName === 'string' && validHttps(i.url)).slice(0, 2000);
        const sources = value.sources.filter(s => s && typeof s.name === 'string' && typeof s.ok === 'boolean');
        setResearch({ ...value, items, sources });
      } else { setResearch(null); notes.push('Research feed format is invalid.'); }
    } else { setResearch(null); notes.push('Headlines could not be refreshed. Try again when online.'); }
    if (!liveStoragePersistent()) notes.push('Browser storage is blocked: live questions last only for this tab session.');
    setMessage(notes.join(' ')); setBusy(false);
  };
  const stale = research && Date.now() - Date.parse(research.checkedAt) > 12 * 60 * 60 * 1000;
  return <section className="live-updates" aria-labelledby="live-title">
    <div className="live-row"><div><div className="smallcaps text-marigold-deep">Non-AI · Source-backed updates</div><h2 id="live-title">Fresh practice. Same original game.</h2><p>{count} approved live questions installed · old question bank preserved</p></div>
      <button className="desk-button live-primary" onClick={() => void update()} disabled={busy} aria-expanded={open} aria-controls="live-details">{busy ? 'Checking updates…' : 'New questions implement'}</button>
    </div>
    <p role="status" className="live-message">{message}</p>
    {open && <div id="live-details">
      <p className="live-note">This button imports the latest owner-approved release. The scheduled server-side collector checks selected feeds every 6 hours; it does not search the entire internet or turn news into MCQs. With enough matching approved items, 3 out of 4 question slots prefer the live bank, unseen versions first. Otherwise original questions fill the gaps.</p>
      <div className="live-row"><a href={`${import.meta.env.BASE_URL}review.html`} target="_blank" rel="noopener noreferrer">Owner: review sources &amp; prepare MCQs ↗</a><button className="desk-button" onClick={() => setOpen(false)}>Hide update details</button></div>
      {research && <>
        <h3>Research inbox — not approved questions</h3>
        <p>Collector checked: {new Date(research.checkedAt).toLocaleString()}. {stale && <strong>Snapshot is over 12 hours old; check the updater workflow.</strong>}</p>
        <ul className="live-sources">{research.sources.map(s => <li key={s.id}>{s.name}: <strong>{s.ok ? `${s.count} feed items fetched` : 'Unavailable — previous headlines retained'}</strong></li>)}</ul>
        <p className="live-note">Source publication dates are shown when supplied. “First collected” is not the news publication date. Displaying a headline does not verify its facts or exam relevance.</p>
        <ol className="live-headlines">{research.items.slice(0, 20).map(item => <li key={item.id}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a><small>{item.sourceName} · {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : item.sourceDateText ? `Source date (timezone unspecified): ${item.sourceDateText}` : 'Publication date not provided'} · First collected: {new Date(item.firstSeenAt).toLocaleDateString()}</small></li>)}</ol>
        {!research.items.length && <p>No source headlines have been collected yet.</p>}
        {research.items.length > 20 && <p>Showing 20 of {research.items.length} retained headlines. The owner review page has the full inbox.</p>}
      </>}
    </div>}
  </section>;
}
