import { expect, test } from '@playwright/test';

test.describe('today ritual smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/today');
    await expect(page.getByTestId('today-screen')).toBeVisible();
    await expect(page.getByTestId('today-screen')).toHaveAttribute('aria-busy', 'false');
  });

  test('happy path ritual: reflect -> pray -> complete', async ({ page }) => {
    const reflectionTextarea = page.getByTestId('today-reflection-textarea');
    const reflectionSubmit = page.getByTestId('today-reflection-submit');
    const prayerSubmit = page.getByTestId('today-prayer-submit');
    const completionState = page.getByTestId('today-completion-state');

    await expect(reflectionTextarea).toBeVisible();
    await reflectionTextarea.fill('Hari ini aku memilih berjalan dalam damai.');
    await reflectionSubmit.click();

    await expect(prayerSubmit).toBeVisible();
    await prayerSubmit.click();

    await expect(completionState).toBeVisible();
    await expect(page.getByRole('status')).toBeVisible();
  });

  test('same-day persistence smoke: progress survives reload', async ({ page }) => {
    const reflectionTextarea = page.getByTestId('today-reflection-textarea');
    const reflectionSubmit = page.getByTestId('today-reflection-submit');

    await reflectionTextarea.fill('Aku menyerahkan beban hari ini.');
    await reflectionSubmit.click();
    await expect(page.getByTestId('today-reflection-sealed')).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('today-screen')).toHaveAttribute('aria-busy', 'false');
    await expect(page.getByTestId('today-reflection-sealed')).toBeVisible();
    await expect(page.getByTestId('today-prayer-submit')).toBeVisible();
  });

  test('fallback usability smoke: page stays usable without external payload', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/today');
    await expect(page.getByTestId('today-screen')).toHaveAttribute('aria-busy', 'false');

    const reflectionTextarea = page.getByTestId('today-reflection-textarea');
    await expect(reflectionTextarea).toBeVisible();
    await reflectionTextarea.fill('Tes fallback usability.');
    await expect(page.getByTestId('today-reflection-submit')).toBeEnabled();
  });
});
