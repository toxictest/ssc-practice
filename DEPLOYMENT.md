# Verified GitHub deployment

**Completed:** 13 October 2026  
**Repository visibility:** Public, with the owner's explicit approval.

## Live links

- **Practice website:** https://toxictest.github.io/ssc-practice/
- **Owner review/export desk:** https://toxictest.github.io/ssc-practice/review.html
- **Source repository:** https://github.com/toxictest/ssc-practice
- **Actions:** https://github.com/toxictest/ssc-practice/actions

## What was configured and verified

- Uploaded the source project, assets, tests, documentation and both workflows to `main`.
- Configured GitHub Pages with `build_type: workflow` and HTTPS enforced.
- The initial test/build/deployment workflow completed successfully: [initial deployment](https://github.com/toxictest/ssc-practice/actions/runs/38391986500).
- Manually ran the scheduled research collector successfully: [collector run](https://github.com/toxictest/ssc-practice/actions/runs/38392270791).
- Confirmed the collector committed its research archive and automatically triggered another successful Pages build/deployment: [collector-triggered publication](https://github.com/toxictest/ssc-practice/actions/runs/38392302610).
- Verified the newly collected JSON was actually served at the public Pages URL, not only stored in the repository.
- Browser-checked the public website: update button, original game answer/reveal, owner review inbox; no runtime page errors observed in that check.
- Remote test workflow passed the JavaScript unit/publisher tests, Python feed tests, TypeScript/production build and desktop/mobile browser checks.
- Adjusted the empty-bank UI regression to use a test fixture, so adding real approved questions later does not break that test.

## Snapshot at verification

| Item | Result |
| --- | --- |
| Research checked | 2026-10-13 11:44:18 UTC / 17:14:18 IST |
| Retained source headlines | 43 |
| Source health | PIB, RBI and NASA all fetched/parsed successfully in this run |
| Approved live MCQs | 0 — owner review/publication is still required |
| Original question bank | Preserved and playable |

Counts and source availability can change after future scheduled runs. Collection is not automatic question authoring or fact verification.

## Automatic operation

The collector workflow is active and configured for `17 */6 * * *` UTC, approximately 05:47 / 11:47 / 17:47 / 23:47 IST. GitHub schedules are best-effort; check Actions if a run is delayed or disabled.

To fetch immediately as the owner:

1. Open **Actions → Collect live research**.
2. Choose **Run workflow → main**.
3. Wait for the collector and the subsequent Pages publication to succeed.
4. In the website, press **New questions implement**.

To add actual MCQs, use the owner review/export process in [LIVE-UPDATES.md](LIVE-UPDATES.md), then commit the complete reviewed bank to `content/live-questions.json`. News headlines do not automatically become questions.

## Credential cleanup

The personal access token supplied during setup was used only for authorized GitHub API setup requests. It was not put in application source, Git configuration, workflow files, repository secrets or the deployed website.

**Revoke that shared personal token now at https://github.com/settings/tokens.** Normal deployments and scheduled collection use GitHub's built-in workflow `GITHUB_TOKEN`, so they do not need the shared personal token to remain valid. Never add a personal token to the browser app or a public JSON file.
