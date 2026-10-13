import { test, expect } from '@playwright/test';
const bi = (text: string) => ({ en: text, hi: `हिंदी ${text}` });
const approved = (id: string) => ({
  id, revision: 1, status: 'approved', reviewedBy: 'E2E fixture only', reviewedAt: '2026-10-13T10:00:00Z', asOfDate: '2026-10-13', difficulty: 'MODERATE', tiers: [1, 2],
  source: { title: 'TEST SOURCE — NOT NEWS', url: 'https://example.org/fixture' },
  question: { kind: 'GA', topic: bi('TEST'), subtopic: bi('TEST'), stem: bi(`TEST FIXTURE ${id} — which option?`), options: [bi('One'), bi('Two'), bi('Three'), bi('Four')], answer: 1, method: bi('Test method'), hack: bi('Test hint'), trap: bi('Test trap') },
});
const bundle = (questions = [approved('fixture-one')]) => ({ schemaVersion: 1, publishedAt: '2026-10-13T11:00:00Z', questions, withdrawnIds: [] });
const inbox = {
  schemaVersion: 1, checkedAt: '2026-10-13T11:00:00Z',
  sources: [{ id: 'test', name: 'TEST SOURCE', ok: true, checkedAt: '2026-10-13T11:00:00Z', lastSuccessAt: '2026-10-13T11:00:00Z', count: 1, error: null }],
  items: [{ id: 'test-source-item', title: 'TEST HEADLINE — not production news', url: 'https://example.org/fixture', sourceId: 'test', sourceName: 'TEST SOURCE', publishedAt: null, sourceDateText: '', firstSeenAt: '2026-10-13T11:00:00Z', lastSeenAt: '2026-10-13T11:00:00Z' }],
};

test.describe('live update contract', () => {
  test.use({ serviceWorkers: 'block' });
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); await page.route('https://fonts.**/*', r => r.abort()); });

  test('zero-approved bank shows real collected headlines without pretending they are questions', async ({ page }) => {
    // Test the empty-bank UI without assuming the owner's production bank stays empty.
    await page.route('**/live/questions.json?*', route => route.fulfill({ json: bundle([]) }));
    await page.goto('./'); await page.getByRole('button', { name: 'New questions implement' }).click();
    await expect(page.locator('.live-message')).toContainText('No approved MCQs are published yet');
    await expect(page.getByRole('heading', { name: 'Research inbox — not approved questions' })).toBeVisible();
    await expect(page.locator('.live-headlines li').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Begin the drill/ })).toBeVisible();
  });

  test('approved import is additive, duplicate-safe, persistent and usable in practice with source attribution', async ({ page }) => {
    await page.route('**/live/questions.json?*', route => route.fulfill({ json: bundle([approved('fixture-one'), approved('fixture-two'), approved('fixture-three')]) }));
    await page.route('**/live/research.json?*', route => route.fulfill({ json: inbox }));
    await page.goto('./'); await page.getByRole('button', { name: 'New questions implement' }).click();
    await expect(page.locator('.live-message')).toContainText('3 new');
    await page.getByRole('button', { name: 'New questions implement' }).click();
    await expect(page.locator('.live-message')).toContainText('0 new');
    await page.reload(); await expect(page.locator('.live-updates')).toContainText('3 approved live questions installed');
    await page.getByRole('button', { name: /^General Awareness/ }).click();
    await page.getByRole('button', { name: /Begin the drill/ }).click();
    await expect(page.locator('main h2')).toContainText('TEST FIXTURE');
    await page.getByRole('button', { name: /\([ABCD]\) Two$/ }).click();
    await expect(page.locator('.live-provenance')).toContainText('TEST SOURCE — NOT NEWS');
    expect(await page.locator('.live-provenance a').getAttribute('href')).toBe('https://example.org/fixture');
    // With enough compatible records, the fourth slot must still use the original bank.
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: 'Next question', exact: true }).click();
      const option = page.locator('main button').filter({ hasText: /^\s*\([ABCD]\)/ }).first();
      await expect(option).toBeEnabled(); await page.getByRole('button', { name: /\([ABCD]\) Two$/ }).click();
    }
    const next = page.getByRole('button', { name: 'Next question', exact: true });
    await next.click(); await expect(page.locator('main h2')).not.toContainText('TEST FIXTURE');
  });

  test('draft or invalid bank cannot enter practice; existing approved questions survive failed import', async ({ page }) => {
    let approvedPhase = true;
    await page.route('**/live/questions.json?*', route => route.fulfill({ json: approvedPhase ? bundle() : bundle([{ ...approved('draft-one'), status: 'draft' }]) }));
    await page.route('**/live/research.json?*', route => route.fulfill({ json: inbox }));
    await page.goto('./'); await page.getByRole('button', { name: 'New questions implement' }).click();
    await expect(page.locator('.live-message')).toContainText('1 new');
    approvedPhase = false; await page.getByRole('button', { name: 'New questions implement' }).click();
    await expect(page.locator('.live-message')).toContainText('validation failed');
    await expect(page.locator('.live-updates')).toContainText('1 approved live questions installed');
  });

  test('owner authors manually, drafts stay unpublished, approval requires confirmation, export does not publish', async ({ page }) => {
    await page.route('**/live/questions.json?*', route => route.fulfill({ json: bundle([]) }));
    await page.route('**/live/research.json?*', route => route.fulfill({ json: inbox }));
    await page.goto('review.html');
    await expect(page.getByText('TEST HEADLINE — not production news', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Prepare a question from this source' }).click();
    await expect(page.locator('[name="stem_en"]')).toHaveValue('');
    await expect(page.locator('[name="sourceUrl"]')).toHaveValue('https://example.org/fixture');
    await page.getByRole('button', { name: 'Save as draft only' }).click();
    await expect(page.locator('#bank-info')).toContainText('1 drafts');
    for (const key of ['topic', 'subtopic', 'stem', 'method', 'hack', 'trap', 'option0', 'option1', 'option2', 'option3']) {
      await page.locator(`[name="${key}_en"]`).fill(`TEST ${key}`);
      await page.locator(`[name="${key}_hi"]`).fill(`परीक्षण ${key}`);
    }
    await page.locator('[name="asOfDate"]').fill('2026-10-13');
    await page.locator('[name="reviewedBy"]').fill('Test-only reviewer');
    await page.locator('[name="answer"]').selectOption('1');
    await page.getByRole('button', { name: 'Approve & add to export bank' }).click();
    await expect(page.locator('#status')).toContainText('confirm source/answer verification');
    await page.locator('#verified').check(); await page.getByRole('button', { name: 'Approve & add to export bank' }).click();
    await expect(page.locator('#bank-info')).toContainText('1 approved');
    const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download full bank JSON' }).click();
    expect((await event).suggestedFilename()).toBe('live-questions.json');
    await page.reload(); await expect(page.locator('[name="stem_en"]')).toHaveValue('TEST stem');
    await expect(page.locator('#verified')).not.toBeChecked();
    await page.goto('./'); await expect(page.locator('.live-updates')).toContainText('0 approved live questions installed');
  });
});

test.describe('production service worker live-data freshness', () => {
  test('offline update reports failure rather than importing a cached snapshot', async ({ page, context }) => {
    await page.goto('./'); await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await context.setOffline(true);
    await page.getByRole('button', { name: 'New questions implement' }).click();
    await expect(page.locator('.live-message')).toContainText('Question update unavailable/offline');
    await page.getByRole('button', { name: /Begin the drill/ }).click(); await page.keyboard.press('1');
    await expect(page.getByRole('button', { name: 'Next question', exact: true })).toBeVisible();
    await context.setOffline(false);
  });
});
