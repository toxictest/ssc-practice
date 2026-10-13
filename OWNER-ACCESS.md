# Owner-only question management

**Repository:** `toxictest/ssc-practice`  
**Authorized publishing account:** `toxictest`

The public authoring form has been removed. `review.html` is now only an explanatory access page with a link to GitHub; it has no editable question fields, approval/export buttons, embedded token or publishing endpoint.

The previous form could create only a visitor's local drafts. It never had permission to overwrite the shared website. The new flow makes that boundary explicit and puts publishing inside GitHub's authenticated interface.

## Edit / publish a question

1. Sign in to GitHub as **toxictest**.
2. Open **[Owner - Publish reviewed question](https://github.com/toxictest/ssc-practice/actions/workflows/owner-questions.yml)**.
3. Click **Run workflow** and leave the branch as **main**.
4. Paste **one question record**, not the entire bank, into `record_json`.
5. Confirm that you verified its source, correct answer, distractors, both language versions and publication rights.
6. Run the workflow. A successful run validates the record, merges it into the existing bank, commits the approved bundle and triggers the normal test/build/Pages deployment.
7. Once the Pages workflow succeeds, use **New questions implement** in the app.

GitHub supplies the workflow token. Never paste a personal token into any question field or source file.

### Template — not a real question

Fill all placeholders from a verified source. The template starts with `status: "draft"` and an invalid date so it cannot accidentally publish as-is. Change the status to `approved` only after you have completed your review. `reviewedBy` and `reviewedAt` are filled by the server-side workflow from the authenticated owner and current timestamp.

```json
{
  "id": "ca-replace-with-stable-id",
  "revision": 1,
  "status": "draft",
  "asOfDate": "YYYY-MM-DD",
  "source": {
    "url": "https://replace-with-a-real-source.example/article",
    "title": "REPLACE with the original source title"
  },
  "difficulty": "MODERATE",
  "tiers": [1, 2],
  "question": {
    "kind": "GA",
    "topic": {"en": "REPLACE", "hi": "बदलें"},
    "subtopic": {"en": "REPLACE", "hi": "बदलें"},
    "stem": {"en": "REPLACE with a dated, verified question", "hi": "सत्यापित प्रश्न लिखें"},
    "options": [
      {"en": "REPLACE option A", "hi": "विकल्प A लिखें"},
      {"en": "REPLACE option B", "hi": "विकल्प B लिखें"},
      {"en": "REPLACE option C", "hi": "विकल्प C लिखें"},
      {"en": "REPLACE option D", "hi": "विकल्प D लिखें"}
    ],
    "answer": 0,
    "method": {"en": "REPLACE with verified explanation", "hi": "सत्यापित व्याख्या लिखें"},
    "hack": {"en": "REPLACE with recall/solve tip", "hi": "याद रखने या हल करने का तरीका लिखें"},
    "trap": {"en": "REPLACE with common mistake", "hi": "सामान्य गलती लिखें"}
  }
}
```

`answer` is zero-based: **0=A, 1=B, 2=C, 3=D**. Difficulty must be `EASY`, `MODERATE` or `HARD`. Category must be `GA`, `QUANT`, `REASONING` or `ENGLISH`. Validation checks structure, not truth; human verification remains necessary.

## Correct an existing question

Use the same stable ID, increase `revision` beyond the existing revision and submit the complete corrected approved record. Existing records remain in the bank; the workflow does not replace the whole bank with your single input.

## Withdraw a question

Submit an existing ID with a higher revision:

```json
{
  "id": "REPLACE-WITH-EXISTING-ID",
  "revision": 2,
  "status": "withdrawn"
}
```

Increase the revision further if the existing revision is already 2 or higher. Unknown IDs cannot be withdrawn. This creates an explicit withdrawal, applied to visitors' installed live bank when they next update.

## Where is access actually enforced?

1. **GitHub authentication and repository permissions:** visitors have no write permission to the original repository. GitHub requires write permission to dispatch a manual workflow.
2. **Workflow job guard:** the publishing job runs only when `github.actor == github.repository_owner`, on `main`. A non-owner collaborator cannot use this workflow to publish even if they are later granted the ability to dispatch it.
3. **Server-side script guard:** `apply-owner-question.mjs` independently checks the authenticated actor/owner, branch and explicit confirmation before reading or writing the bank.
4. **Validated commit/deployment:** only valid records are committed; normal automated tests still gate deployment.

At the repository-access check for this change, **toxictest was the only account listed with write/admin access**. No additional collaborators were removed or granted access.

This does **not** override GitHub repository administration: if the owner later grants someone direct write/admin access, that person may edit repository files outside this workflow. Keep write access restricted if owner-only editing is required. A public fork or proposed pull request does not alter the original live site until an authorized owner accepts it.

## Important credential security

**Revoke the personal token previously shared in chat at https://github.com/settings/tokens.** Anyone holding a valid owner token can act with its permissions; an owner-name check cannot distinguish the account owner from someone using stolen owner credentials. Enable 2FA on the GitHub account as well.

The workflows use GitHub's built-in `GITHUB_TOKEN`; revoking the shared personal token will not stop normal collection or deployment.

## Public content and old caches

- Practice questions, published JSON and repository source remain public by design. Read access is different from permission to modify the shared bank.
- Users can change their own browser-local data or download a copy, but those changes do not publish to the original website.
- An old cached/downloaded authoring page cannot be erased from every device. It still has no authenticated publishing capability.
- On the new deployment, the public authoring script `live/review.mjs` is removed and the service-worker revision changes. Reload/accept the app update if your browser still shows an old page.
- Old local draft storage is not deleted; no visitor's local data is silently wiped.
