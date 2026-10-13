import type { Lang } from "../engine";
import type { RunConfig } from "./scores";
export const PREFERENCES_KEY = "ssc-cgl-preferences-v1";
export interface Preferences { lang: Lang; muted: boolean; config: RunConfig }
export const DEFAULT_PREFERENCES: Preferences = {
  lang: "EN", muted: false, config: { kind: "MIXED", diff: "MODERATE", tier: 1 },
};
export function loadPreferences(): Preferences {
  try {
    const p = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "null");
    if (!p || typeof p !== "object") return DEFAULT_PREFERENCES;
    return {
      lang: p.lang === "HI" ? "HI" : "EN",
      muted: p.muted === true,
      config: {
        kind: ["MIXED", "QUANT", "REASONING", "ENGLISH", "GA"].includes(p.config?.kind) ? p.config.kind : "MIXED",
        diff: ["EASY", "MODERATE", "HARD"].includes(p.config?.diff) ? p.config.diff : "MODERATE",
        tier: p.config?.tier === 2 ? 2 : 1,
      },
    };
  } catch { return DEFAULT_PREFERENCES; }
}
export function savePreferences(p: Preferences) {
  try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(p)); } catch { /* private mode */ }
}
