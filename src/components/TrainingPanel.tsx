import { useState } from "react";
import type { Lang } from "../engine";
import { clearScores, loadHistory, scoresAreSessionOnly } from "../game/scores";
export default function TrainingPanel({ lang, setLang, muted, toggleMute, refresh }: {
  lang: Lang; setLang: (lang: Lang) => void; muted: boolean; toggleMute: () => void; refresh: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");
  const history = loadHistory();
  const asked = history.reduce((n, s) => n + s.asked, 0);
  const hits = history.reduce((n, s) => n + s.correct, 0);
  const exportData = () => {
    const data = { app: "SSC CGL Rapid Fire", schemaVersion: 1, exportedAt: new Date().toISOString(), runs: history };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "ssc-cgl-progress.json";
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Progress exported. Keep this file as your personal record.");
  };
  return <section className="training-panel" aria-labelledby="training-title">
    <div className="training-heading"><div><div className="smallcaps text-marigold-deep">Your practice desk</div>
      <h2 id="training-title" className="font-display text-3xl font-bold mt-1">A little better, every run.</h2>
      <p className="text-sm text-ink/65 mt-2">Last 100 completed runs · saved in this browser, not a cloud account.</p></div>
      <div className="training-controls">
        <label className="smallcaps">Question language <select aria-label="Default question language" value={lang} onChange={e => setLang(e.target.value as Lang)}><option value="EN">English</option><option value="HI">हिंदी</option></select></label>
        <button className="desk-button" onClick={toggleMute} aria-pressed={muted}>Sound: {muted ? "off" : "on"}</button>
      </div>
    </div>
    <div className="training-stats">{[["Completed runs", history.length], ["Questions answered", asked], ["Accuracy", `${asked ? Math.round(hits / asked * 100) : 0}%`], ["Best streak", Math.max(0, ...history.map(s => s.best))]].map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <div className="training-controls">
      <button className="desk-button" disabled={!history.length} onClick={exportData}>Export progress ↓</button>
      <button className="desk-button" disabled={!history.length} onClick={() => setConfirmReset(true)}>Reset saved scores</button>
      {confirmReset && <div className="reset-confirm" role="group" aria-label="Confirm deletion"><span>Delete all saved runs? This cannot be undone.</span><button className="desk-button" onClick={() => { const ok = clearScores(); refresh(); setConfirmReset(false); setMessage(ok ? "Saved scores cleared. Preferences kept." : "Session scores cleared. Browser storage is blocked; stored data may remain."); }}>Yes, delete</button><button className="desk-button" onClick={() => setConfirmReset(false)}>Cancel</button></div>}
    </div>
    <p className="text-sm mt-3" role="status">{message || (scoresAreSessionOnly() ? "Storage is unavailable. Scores will only last for this session." : "No login. No analytics. No scores leave this device unless you export them.")}</p>
    <p className="text-xs text-ink/65 mt-3">Independent practice tool — not affiliated with SSC, TCS or Eduquity. Not an official mock exam. Current-affairs answers need periodic review; shortcuts are not guaranteed speed improvements.</p>
  </section>;
}
