# SSC CGL · Rapid Fire Drill

**Live:** https://toxictest.github.io/ssc-practice/ · **[Owner review desk](https://toxictest.github.io/ssc-practice/review.html)** · **[Verified deployment report](DEPLOYMENT.md)**

**Hindi + English aptitude practice. A paper-inspired interface, quick calculation sprints, and progress that stays on your device.**

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · Offline-ready · GitHub Pages-ready

> **New in 1.2.0:** “New questions implement” button, scheduled non-AI RSS research inbox, manual owner review/export, and additive approved-question imports. **[Read the Live Updates setup guide](LIVE-UPDATES.md).** The initial snapshot has 40 fetched headlines and **0 approved MCQs**; source collection is automatic, question authoring/approval is not.

![Rapid Fire Drill desktop preview](docs/desktop-preview.jpg)

> **Important:** Yeh independent practice app hai — SSC, TCS ya Eduquity ka official product nahi. Yeh official exam simulator, verified previous-year-paper database, ya live current-affairs feed nahi hai. “Tier” aur difficulty app ke practice settings hain, official exam-pattern compliance ka claim nahi.

## Contents

- [Quick start](#quick-start)
- [Features](#features)
- [GitHub par FREE host kaise karein](#github-par-free-host-kaise-karein)
- [Bina terminal ke hosting](#bina-terminal-ke-hosting)
- [Game rules and controls](#game-rules-and-controls)
- [Offline and installation](#offline-and-installation)
- [Progress, privacy and backup](#progress-privacy-and-backup)
- [Project structure](#project-structure)
- [Development and testing](#development-and-testing)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Limitations and future upgrades](#limitations-and-future-upgrades)
- [Rights and attribution](#rights-and-attribution)

## Quick start

**Recommended:** Node.js 22 LTS + npm + Git, plus Python 3.10+ for the new feed collector/tests. Minimum supported Node.js is 20.19; if using Node 22, use 22.12 or newer. CI uses Node 22.

ZIP extract karne ke baad **usi folder mein terminal kholiye jahan `package.json` hai**:

```bash
npm ci
npm run dev
```

Terminal mein dikhaya local URL browser mein open karein. Development ke liye account, API key, database ya `.env` file ki zarurat nahi.

Production build ko check karne ke liye:

```bash
npm run check
npm run preview
```

`check` = JavaScript unit tests + Python feed tests + approved-bank compilation + TypeScript check + production build + offline-cache generation. `preview` ka URL terminal mein milega.

**`index.html` ko double-click karke mat chalaiye.** React source ko Vite build chahiye; compiled site ko bhi HTTP/HTTPS server se serve karein, `file://` se nahi.

## Features

### Practice

- Quantitative Aptitude, Reasoning, English, General Awareness aur Mixed modes.
- Easy / Moderate / Hard difficulty; Tier-I / Tier-II practice settings.
- Drill questions, explanations aur traps ke liye English/Hindi toggle.
- Standard method, calculation shortcut aur common mistake notes.
- Three-life drill, speed bonuses, streak multipliers and score ledger.
- Separate 60-second mental-calculation sprint.
- Original paper/navy/orange visual design, responsive desktop/mobile layout.

### Preserved 1.1.0 upgrades

The additive 1.2.0 feature is documented separately in [LIVE-UPDATES.md](LIVE-UPDATES.md); the original practice engine, question bank, screens, scoring and stylesheet were not rewritten.

| Area | What changed |
| --- | --- |
| Gameplay | Answer lock prevents duplicate submissions; resuming a revealed question cannot score it again. |
| Pause | Remembers whether the previous screen was a question or its solution; drill auto-pauses on a hidden tab. |
| Sprint | Parent drill shortcuts no longer interrupt sprint; restart resets picked answer; pending next-question timeout is cleared on finish. |
| Timer | Sprint uses a wall-clock deadline; switching tabs does not extend the 60-second limit. Drill timer no longer caps elapsed frames at 60 ms. |
| Maths | Fixed the ending-in-5 square explanation, integer-zero trimming, and very long fraction-to-percentage answer display. |
| Preferences | Question language, sound, category, tier and difficulty persist in the browser. |
| Progress | Last 100 completed runs, aggregate accuracy, answered count, best streak, JSON export, confirmed reset. |
| Resilience | Score validation, original-ledger migration, blocked-storage memory fallback, app error boundary, safer audio initialization. |
| Accessibility | Pause-dialog focus containment, inert background, selected-control states, answer announcement, reduced-motion support and safer keyboard handling. |
| Performance | Three background photos converted to WebP: 613,028 → 333,210 bytes, about **45.6% smaller**. |
| Offline | Versioned, repository-scoped service-worker cache; update notice; install manifest and icons. |
| Deployment | Relative Vite asset paths, `.nojekyll`, automated Pages workflow, pull-request checks. |
| Maintenance | Locked dependencies, audit fixes, Dependabot, editor settings and regression tests. |
| Content honesty | Removed unsupported “official pattern synced”, guaranteed no-repeats and 100× improvement claims. |

See [CHANGELOG.md](CHANGELOG.md) and [validation notes](docs/VALIDATION.md).

## GitHub par FREE host kaise karein

**Recommended method: source repository + GitHub Actions.** Source update karne ke baad build/test/deploy automatically chalega.

GitHub Free par **public repositories** se GitHub Pages available hai; public-repository Actions usage is also documented as free. Private-repository Pages ke liye eligible paid plan chahiye. Current account/policy details ke liye official documentation dekhein. [2](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

### 0. Publish karne se pehle

- Confirm karein ki aapko original code, photos aur question content ko publicly redistribute karne ka right hai. Original ZIP mein license nahi tha; [rights notice](LICENSE-NOTICE.md) padhein.
- Public repository ka source sab dekh sakte hain. Credentials, personal files aur paid question-bank material upload na karein.
- Yeh app browser-only hai, isliye GitHub Pages fit hai. Server-side Node/PHP, passwords, payment processing aur database is hosting setup ka part nahi hain.

### 1. Empty public repository banaiye

GitHub → **New repository**:

- This deployment uses: `ssc-practice`
- Visibility: **Public**
- README / license / `.gitignore` auto-add options ko **unchecked** rakhein; files package mein already hain.

`package.json` ka `"private": true` npm publishing ko rokta hai — **GitHub repo visibility ko control nahi karta**.

### 2. Project upload karein

Extracted source folder mein terminal kholiye. Neeche is repository ka actual URL hai; apne fork ke liye URL badlein:

```bash
git init
git branch -M main
git add .
git commit -m "Upgrade SSC CGL practice app and add Pages deployment"
git remote add origin https://github.com/toxictest/ssc-practice.git
git push -u origin main
```

Agar repo ka naam alag rakha hai to remote URL mein woh naam use karein. Git identity configure nahi hai to commit se pehle apna `git config user.name` aur `git config user.email` set karein. Authentication apne normal GitHub browser/Git credential flow se karein; password/token source files mein kabhi na daalein.

### 3. Pages enable karein

Repository → **Settings → Pages → Build and deployment → Source → GitHub Actions**.

Is recommended method mein **Deploy from a branch select na karein**: raw `.tsx` source browser directly nahi chala sakta.

### 4. Workflow run karein

Repository → **Actions → Test and deploy GitHub Pages**.

- Pages enable hone ke baad workflow ko **Run workflow** se run karein.
- Agar first push par Pages configure nahi tha aur deployment fail hua, enable karne ke baad failed workflow ko **Re-run all jobs** karein.
- `build` job mein `npm ci`, unit tests, TypeScript, build aur desktop/mobile browser tests chalenge.
- Tests successful hone par `deploy` job site publish karega.
- Pull requests par tests/build hote hain, **deployment nahi**.

Workflow file: [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

**PAT / custom secret ki zarurat nahi:** workflow GitHub ka built-in token use karta hai. `pages: write` aur `id-token: write` permissions sirf deployment job ko diye gaye hain.

### 5. Website link

Project repository ka usual URL:

```text
https://toxictest.github.io/ssc-practice/
```

Actual published URL **Settings → Pages** aur successful `deploy` job mein milega. Pehli publication ko kuch minutes lag sakte hain.

**Repository naam change karna allowed hai.** `vite.config.ts` mein `base: "./"` hai, images/manifest relative hain, aur service-worker scope bhi relative hai. Tests intentionally `/rapid-fire-test/` subpath par run hote hain, sirf `/` root par nahi.

### 6. Future updates

```bash
npm run check
git add .
git commit -m "Update practice content"
git push
```

`main` push automatic deployment trigger karta hai. Workflow mein default branch `main` hai; agar aap `master` use karte hain, workflow ki branch filters **aur** `refs/heads/main` conditions dono update karein.

### Free hosting boundaries

- Default `github.io` address ke liye separate domain kharidna zaroori nahi.
- Custom domain optional hai; domain registration ka kharcha alag ho sakta hai.
- Pages is not unlimited hosting: published-site limit 1 GB, soft bandwidth limit 100 GB/month, aur deployment timeout 10 minutes hai.
- Primarily commercial SaaS, e-commerce ya sensitive transactions ke liye Pages ko free application hosting na samjhein.

Limits/policy source: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits). Workflow reference: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Bina terminal ke hosting

Agar sirf website jaldi publish karni hai, separately supplied **`ssc-cgl-static-site.zip`** use karein. Yeh production output hai, editable React source nahi.

1. Static ZIP ko **extract** karein. ZIP file ko as-is upload karna enough nahi hai.
2. Ek **separate empty public repository** banaiye.
3. **Add file → Upload files** se extracted **contents** upload karein: `index.html`, `assets/`, `images/`, `icons/`, `sw.js`, `manifest.webmanifest`, `favicon.svg`, `.nojekyll`.
4. `index.html` repo root mein ho, extra wrapper folder ke andar nahi.
5. Hidden `.nojekyll` upload mein miss ho jaye to **Add file → Create new file** se `.nojekyll` banaiye; content blank/comment ho sakta hai.
6. **Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save**.
7. Published URL ka wait karein.

**Is manual-static method mein source workflow copy na karein.** Source package ka workflow `package.json` expect karta hai. Source/Actions aur compiled/branch methods ko mix mat karein.

Next update ke liye source mein `npm run build` run karke **poore `dist/` contents** replace karein; `sw.js` aur hashed assets ko bhi saath update karein.

Source ko browser UI se upload karke Actions method bhi use kar sakte hain, lekin `.github/workflows/pages.yml` jaise hidden-folder files miss na hon. Git command-line method zyada reliable hai.

## Game rules and controls

### Main drill

- Start with **3 lives**. Wrong answer ya timeout par one life lost.
- Har question ke baad solution padhne ka time unlimited hai.
- Zero lives ke baad **See result sheet** se run finish/save karein.
- Mid-run refresh/abandon par incomplete run save nahi hota.
- Time is per question, not an official exam section limit.

| Difficulty | Tier-I | Tier-II |
| --- | ---: | ---: |
| Easy | 37 seconds | 86 seconds |
| Moderate | 32 seconds | 75 seconds |
| Hard | 29 seconds | 69 seconds |

**Correct-answer scoring:** tier base = 100 / 150; difficulty factor = 1 / 1.5 / 2. Speed bonus = rounded `70 × timeRemaining / totalTime`. Multiply base-plus-bonus by streak multiplier: ×1 initially, ×2 from streak 3, ×3 from streak 6, ×4 from streak 10. This is an arcade score, **not SSC marks**.

### Sprint

- One continuous **60-second** round; timer includes explanation/transition time.
- Correct answer = `10 + min(30, streak × 2)` points.
- Wrong answer resets streak. There are no lives in this mode.
- Countdown continues while a tab is hidden; returning after the deadline completes the round.
- Sprint question/tip text is primarily English with some bilingual interface labels.

### Keyboard

| Key | Action |
| --- | --- |
| Enter / Space | Start from menu when a native control is not focused |
| S | Start sprint from menu |
| 1–4 / A–D | Answer current item |
| Space / Enter / → | Next drill item after reveal |
| P / Esc | Pause/resume drill |
| M | Toggle sound in active drill |
| R / Enter | Restart from result screen |
| Esc | Exit sprint, or return to menu from drill results |

Focused inputs/selects keep their normal behavior; Enter/Space on buttons activate that button, not an unrelated global action. Holding a key will not repeatedly answer. On touch devices, use the visible buttons; default sound and language are in the practice desk on the home screen.

## Offline and installation

- Offline cache is generated by `scripts/build-offline.mjs` **after a production build**.
- On HTTPS (or localhost), load the complete site online once and let its assets finish downloading. Only then can a later offline reload work.
- The cache contains this app's built HTML, JavaScript, CSS, photos, manifest and icons.
- Explicit live-data checks are network-only. Offline checks report failure and retain installed live/original questions; they never claim a cached news snapshot is fresh.
- Google Fonts are external and **not guaranteed offline**; system serif/sans/Devanagari fallbacks remain available.
- Browser menu → **Install app / Add to Home Screen** where supported. On iPhone, use Safari → Share → Add to Home Screen. Exact labels and install availability vary by browser.
- A waiting service-worker update offers **Reload now / Later**. Finish the active run before reloading.
- Each repository path has its own cache namespace; updates clean only that site's old offline caches.
- Service workers are disabled during `npm run dev`. Test offline behavior using the production preview, not the dev server.
- Browser storage eviction, private browsing or disabled service workers can remove/prevent offline availability. This is not an unlimited-storage guarantee.

## Progress, privacy and backup

### What is saved?

| Browser key | Purpose |
| --- | --- |
| `ssc-cgl-preferences-v1` | Language, sound, mode, difficulty and tier |
| `ssc-cgl-history-v1` | Up to the last 100 completed runs |
| `ssc-cgl-rapidfire-ledger-v1` | Original top-eight ledger, read as a migration fallback |

- Dashboard statistics and top-eight ledger are computed from the retained runs. They are **not lifetime analytics** after the 100-run limit.
- A “new personal record” compares retained runs with the **same category, tier and difficulty**. Sprint is compared only with sprint. Ties and zero-score runs do not create new records.
- Original version stored only eight best runs; migration cannot reconstruct previously discarded sessions.
- **Export progress** downloads a versioned JSON file. Export is for a personal record/analysis; **in-app import is not implemented**.
- **Reset saved scores** asks for confirmation, removes only score keys, and keeps preferences/unrelated site storage.
- Storage errors fall back to memory where possible. Memory-only progress disappears when the page closes.

### Privacy boundaries

No login, analytics SDK, tracking pixel, application backend API, cloud score sync or server database is included. The new update button fetches public JSON from your own deployed site; GitHub Actions fetches external source feeds server-side. Scores stay in local storage unless you export/share them. Local storage is not encrypted or tamper-proof; do not use this leaderboard for prizes or competitive verification.

GitHub Pages still receives normal site requests, and Google Fonts receives font requests while online. To avoid the font third-party request, remove the Google Fonts links from `index.html` and use system fonts, or self-host appropriately licensed fonts.

Local storage is origin-wide, not path-isolated: two copies of this app on the same `username.github.io` origin use the same score/preference keys. Change the keys if you need independent data for multiple deployments. Offline caches, in contrast, are path-scoped.

## Project structure

```text
ssc-cgl-rapid-fire/
├── .github/
│   ├── workflows/pages.yml       # Test, build and publish
│   └── dependabot.yml            # Dependency update PRs
├── public/
│   ├── images/                   # Optimized WebP backgrounds
│   ├── icons/                    # Install/home-screen icons
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── .nojekyll
├── src/
│   ├── App.tsx                   # Main drill state, timer, scoring
│   ├── engine.ts                 # Quant generators + question API
│   ├── gen-verbal.ts             # Reasoning, English, GA banks/generators
│   ├── kit.ts                    # Bilingual types/builders/formatting
│   ├── components/               # Practice desk, error boundary, offline UI
│   ├── game/
│   │   ├── Screens.tsx           # Menu, ledger, pause and result views
│   │   ├── Sprint.tsx            # Sprint UI/timer
│   │   ├── sprint.ts             # Calculation generators
│   │   ├── scores.ts             # Validated local history
│   │   ├── preferences.ts        # Validated saved settings
│   │   ├── fx.ts                 # Browser-generated sound
│   │   └── InkParticles.tsx      # Canvas effects
│   ├── utils/keyboard.ts
│   └── index.css
├── scripts/
│   ├── build-offline.mjs          # Generate revisioned service worker
│   └── serve-test.mjs             # Local repository-subpath test server
├── tests/                         # Vitest unit/generator tests
├── e2e/                           # Playwright browser regressions
├── docs/                          # Screenshots and validation notes
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tsconfig.json
├── CHANGELOG.md
└── LICENSE-NOTICE.md
```

Additional 1.2.0 files: `content/live-sources.json`, `content/live-questions.json`, `src/live/`, `scripts/live/`, `public/live/`, `public/review.html`, and `.github/workflows/collect-live.yml`. See [the data-flow guide](LIVE-UPDATES.md#6-data-and-security-model).

`dist/` is generated and git-ignored. Do not edit built/minified files as your source of truth. `scripts/serve-test.mjs` is a local testing convenience, not a hardened production server; GitHub Pages serves the deployed files.

## Development and testing

| Command | Use |
| --- | --- |
| `npm ci` | Install exactly from committed lockfile |
| `npm run dev` | Local hot-reloading development |
| `npm run typecheck` | Strict source TypeScript check |
| `npm test` | 28 unit/regression/publisher tests |
| `npm run test:feeds` | 6 Python RSS/Atom safety/parsing tests |
| `npm run live:refresh` | Collect headlines + compile approved questions |
| `npm run test:watch` | Watch unit tests during development |
| `npm run build` | Typecheck, production build, offline cache |
| `npm run preview` | Serve production output locally |
| `npm run check` | JS + Python tests + production build |
| `npm run test:e2e` | Desktop and mobile-emulated Chromium checks |
| `npm audit` | Current dependency advisory scan |

First browser-test setup:

```bash
npm ci
npx playwright install --with-deps chromium
npm run check
npm run test:e2e
```

On Linux, installing browser system dependencies may require elevated permissions. E2E uses port **4173**. Stop another app using that port before running the tests. The Playwright config starts its own `/rapid-fire-test/` static server and shuts it down after the run.

**Validation on 13 October 2026 (1.2.0):** 28 JavaScript tests, 6 Python feed tests and 30 Chromium checks passed, including mobile emulation, repo-subpath hosting and offline reload. Unit checks exercise 3,000 generated drill items plus 2,000 sprint items. Build and TypeScript passed; `npm audit` reported zero known vulnerabilities at that time. These are test results, **not a complete security, accessibility or content-certification audit**. See [docs/VALIDATION.md](docs/VALIDATION.md).

## Customization

### Branding and appearance

- Title/description/font links: `index.html`.
- App name/install colors/icons: `public/manifest.webmanifest`, `public/icons/`, `public/favicon.svg`.
- Palette/fonts: `src/index.css` under `@theme`.
- Menu/result copy: `src/game/Screens.tsx`.
- Replace photos in `public/images/`; preserve filenames or update references.

### Questions and scoring

- Add quantitative generators in `src/engine.ts` and register them in `quantGens`.
- Edit reasoning/English/GA content in `src/gen-verbal.ts`.
- Use `B(english, hindi)` to keep both language versions aligned.
- Supply one correct answer and plausible distractors through `mk()` / `buildOptions()`.
- Update methods, shortcuts and traps **together** when changing an answer.
- Add a regression test for every formula fix. Seeded structural tests do not prove all facts or all solutions correct.
- Timer defaults: `timeForTier()` in `src/engine.ts`; sprint length: `SPRINT_SECONDS` in `src/game/Sprint.tsx`.
- Point calculation: `src/App.tsx` and `src/game/Sprint.tsx`.

### Custom domain

Configure the domain in repository **Settings → Pages**, add the required DNS records with your domain provider, then enable HTTPS when available. If using the source/Actions method, include the configured domain in `public/CNAME` so builds retain it. No `CNAME` is supplied because no domain was provided. After moving origins, old local-storage scores do not automatically move to the new domain.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Blank site / module MIME errors | Did you publish raw source instead of `dist/`? Use Actions, or the compiled static package. |
| Homepage 404 | Pages enabled? Correct branch/workflow? Successful deployment? `index.html` at publish root? |
| Images/assets missing | Upload **all** output folders, not only `index.html`; keep `base: "./"`; use the URL with trailing `/`. |
| Workflow not visible | `.github/workflows/pages.yml` must be committed at exactly that path, not inside an extra project folder. |
| Deployment permission error | Select GitHub Actions in Pages settings. Check repository/organization Actions policies and the `github-pages` environment protections. |
| Push rejected | Check your own repository permissions/authentication and remote URL. Do not paste tokens into files. |
| `npm ci` fails | Correct folder? Supported Node version? Keep `package.json` and lockfile together. Intentional dependency changes should use `npm install`, then commit both files. |
| Browser test won't launch | Run `npx playwright install --with-deps chromium`; check port 4173. |
| Old version still visible | Finish active run, accept update/reload. If necessary unregister **this site's** worker in browser developer tools and reload. Clearing site data also deletes scores. |
| Offline doesn't work | Test production build on HTTPS/localhost; complete the first online load; verify browser permits service workers/cache. |
| Hindi font looks different offline | Expected fallback behavior; optional Google Fonts may not be cached. |
| Score not saved | Run must finish; check browser storage/private mode; no cloud sync exists. |
| No sound | Check Sound setting and OS/browser audio policies. Audio may need a user gesture. |

## Limitations and future upgrades

**Not implemented:** accounts, cloud synchronization, live/competitive leaderboard, backend admin panel, score import, authenticated APIs, complete official mock exams, AI/automatic MCQ authoring or approval, full Hindi sprint translation, exhaustive question-bank verification, or mid-run recovery after reload.

Other boundaries:

- Generated templates and bank questions can repeat. Randomization is not a guarantee of unique content.
- Tier/difficulty affect the timer, scoring and some generator parameters; not every bank question has a separate tier-specific variation.
- The original historical/current-affairs bank stays bundled and can become stale. The new add-on collects source headlines on a schedule; approved live MCQs update only after owner publication and a button import. See [LIVE-UPDATES.md](LIVE-UPDATES.md).
- The UI is not completely translated: drill questions have language views, but much of the shell and sprint content remains English.
- Desktop/mobile-emulated Chromium was tested; Safari, Firefox, real phones and every assistive technology were not comprehensively audited.
- PWA installation and offline behavior depend on the browser and available storage.

Suggested next phases:

1. **Content quality:** source citations and review dates per factual question, more formula-level tests, teacher review.
2. **Learning:** saved wrong-answer notebook, topic-specific practice and spaced repetition.
3. **Exam mode:** verified official structure, section timers and real marking scheme after checking the current official notification.
4. **Accessibility/localization:** full Hindi shell/sprint, screen-reader and contrast audit, real-device browser testing.
5. **Optional backend:** accounts and sync only if genuinely needed; this requires separate infrastructure, security rules and privacy decisions.

## Rights and attribution

The supplied archive was downloaded and extracted as source; it was **not a Git repository**, so there was no original commit history to clone. The original archive did not contain a license or asset-credit inventory. No MIT or other open-source license has been assumed on the owner's behalf.

Before public hosting, confirm redistribution rights for original code, imagery and question content. See [LICENSE-NOTICE.md](LICENSE-NOTICE.md). Dependencies retain their respective licenses. This repository contains no affiliation or endorsement claim about SSC, TCS or Eduquity.

---

**Deployment status:** GitHub Pages and the collector-to-publication pipeline were configured and verified successfully on 13 October 2026. See [DEPLOYMENT.md](DEPLOYMENT.md) for live links, run records and token-cleanup instructions.
