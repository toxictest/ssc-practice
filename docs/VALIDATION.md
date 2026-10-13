# Validation report

## Owner-access update — 13 October 2026

- 32 JavaScript tests, 6 Python tests and 30 browser checks passed locally.
- Added server-side denial tests for non-owner, wrong branch and unconfirmed publication; invalid records leave the bank unchanged.
- Browser checks confirm the legacy public review page has no question inputs/forms and its old authoring script is absent.
- Repository collaborator check returned only `toxictest` with admin/write access. This is a point-in-time access check, not a guarantee against later permission changes or credential compromise.
- Real identity enforcement is delegated to GitHub authentication plus server-side actor checks, not a client-side password.

**Remote deployment subsequently verified:** initial Pages publication, collector execution, collector-triggered redeployment and the public site were checked successfully. See [DEPLOYMENT.md](../DEPLOYMENT.md). Historical local-only notes below describe the state before this setup.

## 1.2.0 live add-on verification — 13 October 2026

- **28 JavaScript tests passed**, including the original 15 and 13 live-import/selection/publisher tests.
- **6 Python tests passed**, including RSS/Atom, unknown dates, allowlisted URLs, explicit failures, oversize XML and prohibited XML entities (including UTF-16 encoding).
- **30 browser checks passed**: original 20 plus desktop/mobile live import, rejected draft, owner manual review/export, and network-only offline update behavior.
- Strict source TypeScript and production build passed.
- Initial real source run: PIB 20, RBI 10, NASA 10 headlines. No source was reported healthy without a successful parse. Approved production MCQs: **0**.
- Compared all 19 original source files against the delivered 1.1.0 ZIP: only `src/App.tsx` changed; remaining 18 are byte-identical. Full hashes in `PRESERVATION.json`.
- Human-review fixtures used in tests are labelled test-only and are not in the production bank.
- The collector and deployment workflows have not been run on a remote GitHub account. Local tests do not certify GitHub repository policies, future upstream availability, factual accuracy or actual human reviewer identity.

## Historical 1.1.0 verification

**Checked:** 13 October 2026  
**Build:** SSC CGL Rapid Fire 1.1.0  
**Environment:** Linux, Node 20.20.2, npm 10.8.2; CI configuration uses Node 22.

## Passed checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed strict source TypeScript checks |
| `npm test` | 15 tests across 2 files passed |
| Drill generator sampling | 3,000 seeded draws covering 5 mode settings × 3 difficulties × 2 tiers |
| Sprint generator sampling | 2,000 seeded draws including ending-in-5 square explanation regression |
| `npm run build` | Vite production assets and generated service worker created successfully |
| `npm run test:e2e` | 20 checks passed: 10 scenarios each in desktop and Pixel 7-emulated Chromium |
| `npm audit` | Zero known advisories reported at the time of testing |

The original dependency tree reported five affected-package advisories (four high, one low). Removing the single-file plugin, updating Vite and refreshing vulnerable transitive dependencies resulted in zero reported advisories in the final scan. Advisory counts can change as databases update; this is not a guarantee of security.

## Browser scenarios

1. Menu renders, images/manifest resolve at a repository subpath, no menu runtime error, no horizontal overflow.
2. Language, audio and category persist across reload; Enter on a settings button does not start a game.
3. Pause/resume restores an answered question without enabling duplicate scoring; pause autofocus works.
4. A simulated hidden-tab visibility event automatically pauses the drill.
5. Sprint shortcuts do not trigger parent drill pause; Esc returns to menu.
6. Sprint wall-clock expiry, single save, restart answer state and home-stat refresh.
7. Drill question timeout reveals an unanswered item.
8. Completed drill saves valid counts and consumes three lives.
9. Malformed saved entries are filtered; export downloads; reset keeps unrelated storage.
10. Production offline reload and answer/reveal work after initial cache population.

Browser checks are served at `/rapid-fire-test/` to exercise GitHub-style repository paths. Optional Google Fonts requests are blocked during E2E so core functionality cannot silently depend on the font service. Screenshots were captured separately with fonts available.

The accelerated drill-timeout test checks one item; completed multi-item drill tests use normal browser time, avoiding clock-mocking interactions with exit animations. Sprint expiry tests use Playwright's browser clock. No gameplay logic is bypassed or changed for testing.

## Size observations

- Original background JPEG total: **613,028 bytes**.
- WebP background total: **333,210 bytes**.
- Reduction: **279,818 bytes / 45.6%**.
- Production JS at validation: about **493 kB uncompressed / 157 kB gzip**.
- Production CSS: about **38 kB uncompressed / 8 kB gzip**.
- No claim of a measured Lighthouse score or Core Web Vitals improvement is made.

## Not verified / known boundaries

- No actual remote GitHub repository, GitHub Actions run or GitHub Pages deployment was executed. Workflow steps follow GitHub's documented Pages artifact/deployment flow and require the owner to enable Pages.
- Structural generator tests check four distinct choices, valid answer indices, non-empty bilingual fields and absence of NaN/Infinity; they do **not** certify the full question bank's facts, grammar or mathematical explanations.
- Safari, Firefox, real Android/iOS devices, installation UI on each OS, service-worker multi-tab upgrade edge cases and broad assistive-technology coverage were not exhaustively tested.
- Storage export was tested as a download; no import/restore feature is included.
- No full accessibility audit, penetration test or asset-rights audit was performed.
- Scores are client-controlled local data and unsuitable for competitive or tamper-resistant rankings.

## Reproduce

```bash
npm ci
npx playwright install --with-deps chromium
npm run check
npm run test:e2e
npm audit
```

If port 4173 is in use, stop that process before running the browser suite. The workflow performs checks on pull requests and deploys only successful `main` runs.
