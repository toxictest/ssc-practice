# Live Updates add-on · version 1.2.0

**Non-AI source collection + owner-reviewed questions + one-button import. Original practice bank retained.**

**Deployed:** https://toxictest.github.io/ssc-practice/ — [verified remote setup and workflow runs](DEPLOYMENT.md).

## Sabse pehle: kya automatic hai, kya nahi?

| Step | Behavior |
| --- | --- |
| Source collection | GitHub Actions fetches configured RSS/Atom feeds on a six-hour schedule, or when the repository owner manually runs the collector workflow. |
| Research inbox | Headline, original URL, source name and available publication date are published. Full articles are not scraped or republished. |
| MCQ creation | **Manual.** A reviewer reads the source and writes/checks the question, four options, answer and explanations. No AI, LLM, auto-summary or auto-translation is used. |
| Approval | The authenticated repository owner explicitly confirms review in GitHub; an owner-checked workflow validates and commits the record. |
| “New questions implement” | Checks the latest deployed release, imports approved records, applies corrections/withdrawals and shows source headlines. |
| Existing questions | Original generators and bundled bank remain available. |

**The button does not launch an unrestricted internet search.** It checks the latest snapshot published by the scheduled collector and owner-approved publisher. A static GitHub Pages site cannot securely hold a privileged token to trigger repository workflows for arbitrary visitors. The owner can trigger an immediate collection from **Actions → Collect live research → Run workflow**.

**Delivery state:** the real initial fetch collected **40 headlines across PIB, RBI and NASA**. The approved live MCQ bank deliberately contains **0 questions** until the owner reviews/publishes them. Test fixtures are not included in the production question bank. Headlines are never presented as approved questions.

## 1. What stayed unchanged?

Compared with the previously delivered 1.1.0 source ZIP:

- **18 of the 19 pre-existing `src/` files are byte-for-byte unchanged.**
- `src/engine.ts`, `src/gen-verbal.ts`, `src/kit.ts`: unchanged; no original questions deleted or rewritten.
- Sprint, scoring/history, preference storage, original screens and `src/index.css`: unchanged.
- Only `src/App.tsx` has limited integration edits: import the additive module, use its fallback question selector, render the new button/panel after the existing practice desk, and show source provenance for a live question after answering.
- New implementation lives in `src/live/`; its CSS is separate.
- Build scripts, documentation and deployment workflows received the additions needed to collect/publish live data.

Full file hashes: [docs/PRESERVATION.json](docs/PRESERVATION.json). This is an additive feature, not a redesign.

## 2. Enable the system on GitHub

Use the **source package**, not only the compiled static snapshot.

1. Create/push to your public repository on branch `main`, following [README.md](README.md).
2. Repository **Settings → Pages → Source: GitHub Actions**.
3. Ensure Actions are enabled and your repository policy allows the collector's scoped `contents: write` permission. This uses the built-in `GITHUB_TOKEN`; no PAT or browser secret is required.
4. If protected-branch rules forbid bot commits, configure an owner-approved policy for this workflow or collect locally and commit the data yourself. Do not disable protections blindly or embed a token in the app.
5. Open **Actions → Collect live research → Run workflow** for the first fresh collection.
6. The collector commits only `public/live/research.json`. Its completion triggers **Test and deploy GitHub Pages** through `workflow_run`.
7. The Pages workflow builds the owner-approved question bundle, runs the test suites and publishes the site.
8. Open the deployed app → **New questions implement**.

### Schedule

Workflow: `.github/workflows/collect-live.yml`

```yaml
schedule:
  - cron: '17 */6 * * *'
```

This requests collection at 00:17, 06:17, 12:17 and 18:17 **UTC** — approximately 05:47, 11:47, 17:47 and 23:47 IST. GitHub scheduled jobs are best-effort, can be delayed/disabled and are not a real-time service guarantee. Check Actions logs if the on-page timestamp becomes old.

A GitHub-token bot commit does not normally trigger another push workflow. The included `workflow_run` connection deliberately starts publication after the collector completes. The collector must succeed; a failed workflow does not start a successful deployment. An upstream feed outage is recorded in the snapshot without destroying older headlines.

**This repository is now deployed.** The source upload, initial deployment, manual collector run and collector-triggered publication were verified successfully. See [DEPLOYMENT.md](DEPLOYMENT.md). These instructions remain useful for forks/redeployment.

## 3. Owner-only review and publication

**The public authoring/export form has been removed.** `review.html` is now an access-information page, not an editor. Actual publishing happens inside GitHub after authentication as the repository owner.

1. Read the original article from the research inbox; author and verify the bilingual MCQ yourself.
2. Sign in as `toxictest`, open **[Owner - Publish reviewed question](https://github.com/toxictest/ssc-practice/actions/workflows/owner-questions.yml)** and choose **Run workflow → main**.
3. Paste one complete reviewed record, confirm verification and run.
4. The workflow checks owner identity on the server, validates and merges the record, commits the bank, and triggers tested publication.
5. After deployment, press **New questions implement**.

Full instructions, safe template, correction/withdrawal procedure and security boundaries: **[OWNER-ACCESS.md](OWNER-ACCESS.md)**.

No AI writes or verifies the question. The publisher stamps the authenticated owner's GitHub username and submission time, but this is not automatic factual verification. No password or token is embedded in the public site.

The earlier public form only edited local drafts and could never directly change the shared website. Old downloaded or cached copies still cannot bypass GitHub permissions. Local draft keys from that version are not deleted automatically.

## 4. New-question preference and old practice

The additive adapter in `src/live/select.ts` works as follows:

1. Filter installed approved records to the selected category, difficulty and tier. Mixed accepts any question category.
2. For three out of each four selection slots, try the live bank.
3. Prefer unseen question **versions**, newest review timestamp first. Once all candidates have been served, rotate older live records by least recently served.
4. Avoid immediately repeating the same live record.
5. Reserve every fourth selection slot for the original generator/bank.
6. If no compatible live record exists, fall back to the original generator immediately.

This is **up to 75% live-bank preference**, not a guarantee of 75% newly authored questions forever. With only one approved item, incompatible filters or an exhausted unseen pool, more original/repeated practice is expected. GA/current-affairs records do not replace Quant or sprint questions.

“Seen” means served to the screen, not answered/mastered. Corrections with a new revision are treated as new versions. Your old score/history keys are untouched.

## 5. Sources and collection boundaries

Default configuration: `content/live-sources.json`.

| Source | Feed used | Why it is included |
| --- | --- | --- |
| Press Information Bureau | `https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3` | Government announcements; the tested feed supplied Hindi titles. No automatic translation is performed. |
| Reserve Bank of India | `https://www.rbi.org.in/pressreleases_rss.xml` | Economy/banking press releases; relevance still requires reviewer selection. |
| NASA | `https://www.nasa.gov/news-release/feed/` | Science/space material. It is not necessarily relevant to every SSC practice session. |

PIB publishes an RSS directory: [1](https://www.pib.gov.in/ViewRss.aspx?reg=1&lang=1). RBI explains its RSS headline/link feeds here: [2](https://rbi.org.in/Scripts/rss.aspx).

The collector reads feed metadata only: headline, source, original URL and dates. It does not scrape full articles, solve CAPTCHA, bypass logins/paywalls, or copy third-party question banks.

### Add another authorized feed

Add an entry to `content/live-sources.json`:

```json
{
  "id": "your-source-id",
  "name": "Your source label",
  "url": "https://publisher.example/rss.xml",
  "allowedHosts": ["publisher.example"],
  "enabled": true
}
```

The example host is a placeholder, not an enabled feed. Replace it with an actual RSS/Atom URL whose usage terms permit your use. `allowedHosts` must include the feed domain, permitted redirect destinations and article-link domains. Never put private/internal addresses or untrusted wildcard domains in the allowlist.

Run `npm run live:collect` locally, inspect the output and commit the configuration only after testing. Sources can block bots, change formats or stop publishing; availability is not guaranteed. Arbitrary HTML sites and every internet resource are **not** supported automatically.

### Limits and error behavior

- Up to 3 feeds fetched concurrently; one request per configured feed per run, 20-second timeout.
- Maximum 2 MB per XML response; DTD/entity declarations rejected.
- RSS and Atom supported; wrong-format/blocked/empty feeds reported as failures.
- At most 150 valid items from each feed per run; archive retains the latest **2,000 by first-collected time**. Older retained headlines can eventually age out of this bounded archive.
- URL-based deduplication strips common tracking parameters and preserves the original first-seen timestamp.
- Source publication date, raw date string and first/last collection times are separate fields.
- A missing or timezone-ambiguous source date is not invented or labelled as the current time.
- Failed sources retain old data and expose `ok: false`, error and last-success status. A fresh collector check is not proof that an old article is fresh.
- No keyword-based automatic fact verification or exam-relevance certification is claimed.

## 6. Data and security model

```text
Authorized RSS/Atom feeds
        ↓ scheduled Python fetch (no AI)
public/live/research.json ─────────→ on-page research inbox
        ↓ human reading + authoring
GitHub owner workflow → owner/branch/confirmation checks → validated commit
        ↓
content/live-questions.json
        ↓ validation / approved-only compiler
public/live/questions.json
        ↓ GitHub Pages deployment
New questions implement → local installed bank → additive practice adapter
```

### Files

| File | Purpose |
| --- | --- |
| `content/live-sources.json` | Owner-controlled feed allowlist |
| `content/live-questions.json` | Canonical cumulative bank: draft / approved / withdrawn records |
| `scripts/live/collect.py` | Standard-library RSS/Atom collection; no Python packages required |
| `scripts/live/schema.mjs` | Shared structural validator, used by compiler and browser |
| `scripts/live/compile.mjs` | Builds approved-only bundle and withdrawal metadata |
| `scripts/live/apply-owner-question.mjs` | Server-side owner check and single-record merge |
| `public/live/research.json` | Collected headline archive and source health |
| `public/live/questions.json` | Generated approved subset; do not hand-edit as the canonical source |
| `public/review.html` | Public access-information page only; no editor |
| `src/live/*` | Update button, validated importer, separate styles and practice selection adapter |
| `.github/workflows/collect-live.yml` | Scheduled/manual feed job and archive commit |

### Browser storage additions

- `ssc-cgl-approved-live-v1`: installed approved bank and latest publication timestamp.
- `ssc-cgl-live-seen-v1`: bounded record of served question versions.
- `ssc-live-review-bank-v1`: legacy local draft/export bank; unused by the new site.
- `ssc-live-review-form-v1`: legacy unfinished form; unused by the new site.

Original scores/preferences are neither overwritten nor cleared by importing questions. “Reset saved scores” still resets only scores, not the added live bank. These keys are origin-wide like the existing app; separate deployments on the same origin can share them unless you rename the keys.

### Validation is not fact-checking

The publisher/importer checks IDs, approved status, reviewer/date metadata, HTTPS source links, bilingual fields, four distinct options, a valid answer index, category/difficulty/tiers, bounded sizes and revisions. It cannot prove that an answer is factually correct or that the owner genuinely read a source. The owner workflow authenticates who submitted the record, not its truth. That responsibility stays with the owner/reviewer.

Only explicit withdrawals delete installed live records. Regular updates merge new records and higher revisions; duplicate checks do not grow the bank. Older server snapshots are rejected to prevent a stale cached release from rolling back newer installed data.

The service worker sends live-data checks to the network without offline fallback. Offline button clicks display a failure and retain old practice; they do not claim a stale cache is a fresh research result. Already installed approved questions still work offline with the original game.

## 7. Local commands

Requirements: the existing Node/npm setup plus **Python 3.10+** for collection/feed tests. CI uses Python 3.12. On Windows, if your command is `python` rather than `python3`, use that command directly or adjust the npm scripts.

```bash
npm ci
npm run live:collect       # Fetch headlines; makes no MCQs
npm run live:compile       # Validate owner bank; publish approved subset only
npm run live:refresh       # Both of the above
npm run check             # JS tests + Python feed tests + full production build
npm run test:e2e           # Browser regressions; install Playwright Chromium first
npm run dev
```

`npm run build` automatically runs the approved-question compiler, but does not fetch third-party feeds. This keeps normal builds reproducible/offline with the committed research snapshot. Test offline behavior with a production build/preview as before.

## 8. Verification and deployment limits

Validated locally:

- 28 Vitest tests: previous regressions plus approval/schema, additive imports, rollback prevention, new-first selection and publisher safeguards.
- 6 Python feed tests: RSS, Atom, dates, URL allowlists, malformed/oversized/XML entity input and visible source failures.
- 30 browser checks: all previous 20 plus desktop/mobile update/import/review/offline scenarios.
- Production build and source TypeScript passed.
- Preservation check confirms only `App.tsx` changed among the original 19 source files.

These tests use clearly labelled synthetic fixtures where approval/import must be exercised. **No synthetic test question is published to the real bank.** Real source fetches are tested separately; network success now does not guarantee future source availability.

Not implemented: all-internet crawling, instant per-visitor server-side research, auto-authored MCQs, automatic fact verification, cloud draft accounts, a separate password-based hosted admin application, automatic translation, or a real-time delivery SLA.

**Compiled static ZIP caveat:** it contains the current snapshot and button, but no scheduled job can run inside a ZIP or GitHub Pages' static runtime. Upload the source package and enable the workflows to keep research snapshots updating. To update a static-only deployment manually, run `npm run live:refresh && npm run build` locally and replace the full compiled output.
