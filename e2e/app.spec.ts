import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Google Fonts is optional; core functionality must not need it.
  await page.route('https://fonts.**/*', route => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('menu, repository-path assets and mobile layout load without runtime errors', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', err => errors.push(err.message));
  await page.goto('./');
  await expect(page.getByRole('button', { name: /Begin the drill/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A little better, every run.' })).toBeVisible();
  expect(await page.locator('img').first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  const manifest = await page.request.get('manifest.webmanifest'); expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).start_url).toBe('./');
  expect(errors).toEqual([]);
});

test('language, audio and configuration survive reload; controls do not start a run', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /^Quant / }).click();
  await page.getByRole('combobox', { name: 'Default question language' }).selectOption('HI');
  await page.getByRole('button', { name: 'Sound: on' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Sound: off' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Begin the drill/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('combobox')).toHaveValue('HI');
  await expect(page.getByRole('button', { name: 'Sound: off' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /^Quant / })).toHaveAttribute('aria-pressed', 'true');
});

test('pause/resume preserves an answered item and cannot score it again', async ({ page }) => {
  await page.goto('./'); await page.getByRole('button', { name: /Begin the drill/ }).click();
  await page.keyboard.press('1');
  const options = page.locator('main button').filter({ hasText: /^\s*\([ABCD]\)/ });
  await expect(options).toHaveCount(4);
  await expect(options.first()).toBeDisabled();
  await page.keyboard.press('p');
  await expect(page.getByRole('dialog', { name: 'PAUSED' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resume · P' })).toBeFocused();
  await page.getByRole('button', { name: 'Resume · P' }).click();
  await expect(options.first()).toBeDisabled();
  await page.keyboard.press('1');
  await expect(options.first()).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Next question', exact: true })).toBeVisible();
});

test('drill auto-pauses when hidden and resumes explicitly', async ({ page }) => {
  await page.goto('./'); await page.getByRole('button', { name: /Begin the drill/ }).click();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(page.getByRole('dialog', { name: 'PAUSED' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume · P' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('sprint shortcuts do not trigger the drill pause handler', async ({ page }) => {
  await page.goto('./'); await page.getByRole('button', { name: /60-second sprint/ }).click();
  await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: '60 SECONDS' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Begin the drill/ })).toBeVisible();
});

test('sprint ends on wall-clock time, saves once, and restarts with enabled answers', async ({ page }) => {
  await page.clock.install();
  await page.goto('./'); await page.getByRole('button', { name: /60-second sprint/ }).click();
  await page.keyboard.press('1');
  await page.clock.fastForward(61_000);
  await expect(page.getByText('Sprint complete', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ssc-cgl-history-v1') || '[]').length)).toBe(1);
  await page.getByRole('button', { name: /Sprint again/ }).click();
  const options = page.locator('main button').filter({ hasText: /^\s*\([ABCD]\)/ });
  await expect(options.first()).toBeEnabled();
  await page.keyboard.press('1');
  await expect(options.first()).toBeDisabled();
  await page.clock.fastForward(61_000);
  await page.getByRole('button', { name: 'Back to the paper' }).click();
  await expect(page.locator('.training-stats > div').first().locator('strong')).toHaveText('2');
});

test('drill timer expires and reveals an unanswered item', async ({ page }) => {
  await page.clock.install();
  await page.goto('./'); await page.getByRole('button', { name: /Begin the drill/ }).click();
  await page.clock.fastForward(40_000);
  await expect(page.getByText('TIME UP', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next question', exact: true })).toBeVisible();
});

test('completed drill is saved with valid counts', async ({ page }) => {
  await page.addInitScript(() => { let seed = 7459; Math.random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; }; });
  await page.goto('./'); await page.getByRole('button', { name: /Begin the drill/ }).click();
  const options = page.locator('main button').filter({ hasText: /^\s*\([ABCD]\)/ });
  let answered = 0;
  for (let i = 0; i < 30; i++) {
    await expect(options.first()).toBeEnabled();
    await page.keyboard.press('1'); answered++;
    await expect(options.first()).toBeDisabled();
    const result = page.getByRole('button', { name: 'See result sheet', exact: true });
    if (await result.count()) { await result.click(); break; }
    await page.getByRole('button', { name: 'Next question', exact: true }).click();
  }
  const runs = await page.evaluate(() => JSON.parse(localStorage.getItem('ssc-cgl-history-v1') || '[]'));
  expect(runs).toHaveLength(1); expect(runs[0].asked).toBe(answered);
  expect(runs[0].asked - runs[0].correct).toBe(3);
});

test('corrupted storage is safe; progress export and reset work', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => {
    localStorage.setItem('ssc-cgl-history-v1', JSON.stringify([null, {}, { score: 120, asked: 3, correct: 2, best: 2, kind: 'QUANT', diff: 'EASY', tier: 1, date: '13 Oct' }]));
    localStorage.setItem('unrelated', 'keep');
  });
  await page.reload();
  await expect(page.locator('.training-stats > div').first().locator('strong')).toHaveText('1');
  const downloadEvent = page.waitForEvent('download'); await page.getByRole('button', { name: /Export progress/ }).click();
  const download = await downloadEvent; expect(download.suggestedFilename()).toBe('ssc-cgl-progress.json');
  await page.getByRole('button', { name: 'Reset saved scores' }).click();
  await page.getByRole('button', { name: 'Yes, delete' }).click();
  await expect(page.locator('.training-stats > div').first().locator('strong')).toHaveText('0');
  expect(await page.evaluate(() => localStorage.getItem('unrelated'))).toBe('keep');
});

test('production cache supports offline reload and gameplay under a repository subpath', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: /Begin the drill/ })).toBeVisible();
  await page.getByRole('button', { name: /Begin the drill/ }).click();
  await page.keyboard.press('1');
  await expect(page.getByRole('button', { name: 'Next question', exact: true })).toBeVisible();
  await context.setOffline(false);
});
