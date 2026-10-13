# Changelog

## 1.2.0 — 2026-10-13

### Additive non-AI live updates
- Added “New questions implement” and a source-research inbox below the existing practice desk.
- Added scheduled/manual RSS/Atom collector for configured PIB, RBI and NASA feeds, with URL allowlists, bounded responses, deduplication, honest date handling and source-health reporting.
- Added public local-only owner authoring/review/export page. Questions are written and verified manually; it cannot directly publish to the repository.
- Added cumulative draft/approved/withdrawn question-bank compiler; incomplete/draft questions cannot enter practice.
- Added duplicate-safe live-bank import, higher-revision correction and explicit withdrawal processing.
- Added up-to-75% live-bank selection preference for compatible approved records, unseen versions first; original engine fills gaps and every fourth slot.
- Added source/as-of metadata in revealed live-question explanations.
- Kept explicit live-data fetches out of offline-cache fallback; failed updates retain existing practice.
- Added collector → Pages workflow connection and Live Updates guide.
- Validated 28 JavaScript tests, 6 Python tests and 30 browser checks.

### Preservation
- 18 of 19 previously existing `src/` files are byte-identical to the delivered 1.1.0 archive. Only `App.tsx` connects the new module.
- Original question bank, procedural engine, sprint, score/history logic, screens and stylesheet are unchanged. See `docs/PRESERVATION.json`.

### Delivery state
- Initial real fetch: 40 source headlines; approved MCQ bank: 0. No test fixtures or unreviewed news were published as questions.
- No AI, unrestricted crawler, automatic question authoring, automatic fact verification, or remote GitHub deployment is included/claimed.

## 1.1.0 — 2026-10-13

### Added
- Private local history of up to 100 completed runs, summary statistics, JSON export and confirmed score reset.
- Persistent, validated language/sound/category/difficulty/tier preferences.
- Production offline cache, path-scoped cache cleanup, update notice, manifest, install icons and favicon.
- Error boundary; score input validation and blocked-storage session fallback.
- Pause focus containment, inert background, selected-control semantics and answer announcements.
- GitHub Actions test/build/Pages deployment and Dependabot configurations.
- 15 unit tests and 20 desktop/mobile-emulated browser checks.
- Hinglish setup/deployment README, screenshots, limitations and rights notice.

### Fixed
- Pause/resume no longer reopens an already answered question for another score.
- Synchronous answer guards prevent repeated submissions; finishing a drill cannot save it twice.
- Sprint shortcuts no longer enter the parent drill's pause state.
- Sprint restart clears picked answer and stale question-transition timeouts.
- Sprint duration uses wall-clock elapsed time, rather than clamped animation frames.
- Drill auto-pauses on hidden tabs and preserves the phase to resume.
- Parent score ledger refreshes after returning from sprint.
- Personal-record comparison separates category, difficulty and tier; ties do not count.
- Vedic square ending-in-5 explanation now computes tens × (tens + 1).
- Decimal trimming no longer removes zeros from integer values when zero decimal places are requested.
- Fraction-to-percentage correct answers round to two decimal places for display.
- Native controls, modifier combinations and held keys are not hijacked by game shortcuts.
- Optional WebAudio creation/resume errors do not break the game.
- Canvas particle positions use CSS viewport width on high-DPI displays; new particles respect reduced-motion preferences.

### Changed
- Preserved the original paper/navy/orange design and core question bank.
- Converted three JPEG backgrounds to WebP (45.6% total reduction).
- Removed single-file bundling; use normal hashed production assets and relative paths.
- Updated Vite and locked vulnerable transitive dependencies; removed the single-file plugin's dependency chain.
- Replaced unsupported official-pattern, no-repeat and 100×-improvement claims with independent-practice wording.

### Deliberately not claimed
- No official question-bank certification, exhaustive factual audit or full exam-pattern validation.
- No backend, account system, shared leaderboard, cloud synchronization or live-current-affairs feed.
- No GitHub repository creation or actual remote deployment was performed during this delivery.
- No open-source redistribution license was inferred for the original archive.
