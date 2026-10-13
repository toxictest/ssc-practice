import { useEffect, useState } from "react";
export default function OfflineStatus() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const online = () => setOffline(false), offline = () => setOffline(true);
    window.addEventListener("online", online); window.addEventListener("offline", offline);
    let disposed = false;
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(reg => {
        if (disposed) return;
        if (reg.waiting) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (!disposed && worker.state === "installed" && navigator.serviceWorker.controller) setWaiting(worker);
          });
        });
      }).catch(error => console.warn("Offline cache unavailable", error));
    }
    return () => { disposed = true; window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, []);
  const update = () => {
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    waiting?.postMessage({ type: "SKIP_WAITING" });
  };
  if (!offline && (!waiting || dismissed)) return null;
  return <aside className="offline-status" role="status">{offline ? "Offline · cached practice is available after the first successful online load." : <>An update is ready. Finish your run before reloading. <button onClick={update}>Reload now</button><button onClick={() => setDismissed(true)}>Later</button></>}</aside>;
}
