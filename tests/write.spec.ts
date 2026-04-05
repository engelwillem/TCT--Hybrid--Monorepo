import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
const MOCK_TOKEN = '2|ojdmguzJinMdGFb4IW5FP355I03esbx8nSxjh4uma0a6b9b3';
const baseOrigin = new URL(BASE_URL).origin;
const baseHostname = new URL(BASE_URL).hostname;

async function clearClientAuthState(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function loginWithPassword(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  options: { remember?: boolean } = {}
) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  if (options.remember) {
    const rememberCheckbox = page.locator('#remember');
    if (!(await rememberCheckbox.isChecked())) {
      await rememberCheckbox.check();
    }
  }

  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/renungan|\/today/, { timeout: 20000 });
}

test.describe('Hybrid App E2E Write-Path Smoke Tests', () => {
  const seededEmail = process.env.E2E_AUTH_EMAIL;
  const seededPassword = process.env.E2E_AUTH_PASSWORD;

  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(token => {
      window.localStorage.setItem('e2e_bypass_token', token);
    }, MOCK_TOKEN);
    await page.goto(BASE_URL);
  });

  test('Password Login Flow', async ({ page, context }) => {
    test.skip(!seededEmail || !seededPassword, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD to run password-login write-path.');

    await context.clearCookies();
    await page.goto(BASE_URL);
    await clearClientAuthState(page);
    await loginWithPassword(page, seededEmail!, seededPassword!);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Remembered Login Survives Without Client Storage', async ({ page, context }) => {
    test.skip(!seededEmail || !seededPassword, 'Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD to run remembered-session E2E.');

    await context.clearCookies();
    await page.goto(BASE_URL);
    await clearClientAuthState(page);
    await loginWithPassword(page, seededEmail!, seededPassword!, { remember: true });

    const cookies = await context.cookies(baseOrigin);
    expect(cookies.some((cookie) => cookie.name === 'tct_app_session')).toBeTruthy();

    await clearClientAuthState(page);
    await page.goto(`${BASE_URL}/profile`);

    await expect(page.locator('button:has-text("Simpan Perubahan")')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[type="email"]')).toHaveCount(0);
  });

  test('Forced Expired Session Falls Back To Login', async ({ page, context }) => {
    await context.clearCookies();
    await context.addCookies([
      {
        name: 'tct_app_session',
        value: '9|expiredsessiontoken',
        domain: baseHostname,
        path: '/',
        httpOnly: true,
        secure: baseOrigin.startsWith('https://'),
        sameSite: 'Lax',
      },
    ]);

    await page.goto(BASE_URL);
    await clearClientAuthState(page);
    await page.goto(`${BASE_URL}/profile`);

    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);

    const cookies = await context.cookies(baseOrigin);
    expect(cookies.some((cookie) => cookie.name === 'tct_app_session')).toBeFalsy();
  });

  test('Profile Update Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    
    // Buka accordion Informasi Personal jika tertutup
    const infoPersonalBtn = page.locator('button:has(h3:has-text("Informasi Personal"))');
    await expect(infoPersonalBtn).toBeVisible({ timeout: 15000 });
    // Expand
    if (await infoPersonalBtn.getAttribute('aria-expanded') === 'false') {
        await infoPersonalBtn.click();
    }
    
    // .nth(1) adalah input Nama Lengkap
    const nameInput = page.locator('input').nth(1);
    await expect(nameInput).toBeVisible({ timeout: 15000 });
    
    // Ganti nama
    const newName = `Admin Update ${crypto.randomUUID().slice(0, 5)}`;
    await nameInput.fill(newName);
    
    // Submit
    const submitBtn = page.locator('button:has-text("Simpan Perubahan")');
    await submitBtn.click();
    
    // Tunggu toast success
    await expect(page.locator('text=Profil berhasil disimpan')).toBeVisible({ timeout: 15000 });
  });

  test('Community Create Post Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/community`);
    
    const composerInput = page.locator('textarea');
    await expect(composerInput).toBeVisible({ timeout: 15000 });
    
    const postContent = `E2E Automated Post: ${crypto.randomUUID()}`;
    await composerInput.fill(postContent);
    
    const publishBtn = page.locator('button:has-text("Bagikan")').first();
    await expect(publishBtn).toBeEnabled();
    await publishBtn.click();
    
    // No toast for handlePost, but the card should immediately render
    await expect(page.locator(`text=${postContent}`).first()).toBeVisible({ timeout: 15000 });
  });

  test('Community Comment Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/community`);
    
    // Create a dummy post first JUST in case feed is completely empty on fresh seed!
    const composerInput = page.locator('textarea');
    await expect(composerInput).toBeVisible({ timeout: 15000 });
    const seedPost = `Seed Post for Comments ${Date.now()}`;
    await composerInput.fill(seedPost);
    await page.locator('button:has-text("Bagikan")').first().click();
    await expect(page.locator(`text=${seedPost}`).first()).toBeVisible({ timeout: 15000 });

    const firstCommentBtn = page.locator('button:has-text("Komentar")').first();
    await expect(firstCommentBtn).toBeVisible({ timeout: 15000 });
    await firstCommentBtn.click();
    
    const commentInput = page.locator('textarea[placeholder="Tuliskan pemikiranmu..."]');
    await expect(commentInput).toBeVisible({ timeout: 10000 });
    
    const commentContent = `E2E Comment: ${Date.now()}`;
    await commentInput.fill(commentContent);
    
    const sendBtn = page.locator('button:has-text("Kirim")').first();
    await sendBtn.click();
    
    await expect(page.locator(`text="${commentContent}"`).first()).toBeVisible({ timeout: 15000 });
  });

  test('Community Bookmark Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/community`);

    const composerInput = page.locator('textarea');
    await expect(composerInput).toBeVisible({ timeout: 15000 });
    const seedPost = `Seed Post for Bookmark ${Date.now()}`;
    await composerInput.fill(seedPost);
    await page.locator('button:has-text("Bagikan")').first().click();
    await expect(page.locator(`text=${seedPost}`).first()).toBeVisible({ timeout: 15000 });

    const bookmarkBtn = page.locator('button[aria-label="Bookmark"]').first();
    await expect(bookmarkBtn).toBeVisible({ timeout: 10000 });
    await bookmarkBtn.click();

    await expect(page.locator('text=Disimpan ke Bookmarks')).toBeVisible({ timeout: 15000 });
    await page.getByRole('tab', { name: /Bookmarks/i }).click();
    await expect(page.locator(`text=${seedPost}`).first()).toBeVisible({ timeout: 15000 });
  });

  test('Profile Two-Factor Setup Flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile#profile-2fa`);

    const twoFactorCard = page.locator('button:has-text("Enable")').first();
    await expect(twoFactorCard).toBeVisible({ timeout: 15000 });
    await twoFactorCard.click();

    const passwordInput = page.locator('input[placeholder="Masukkan password Anda"]').first();
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill('password123');

    await page.locator('button:has-text("Generate QR Code")').click();

    await expect(page.locator('text=Simpan Recovery Codes')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[placeholder="Masukkan 6 Digit OTP"]')).toBeVisible({ timeout: 10000 });
  });

  test('Community Share Button Parity', async ({ page }) => {
    await page.goto(`${BASE_URL}/community`);

    // Ensure there is at least a post to share
    const composerInput = page.locator('textarea');
    await expect(composerInput).toBeVisible({ timeout: 15000 });
    const seedPost = `Seed Post for Sharing ${Date.now()}`;
    await composerInput.fill(seedPost);
    await page.locator('button:has-text("Bagikan")').first().click();
    await expect(page.locator(`text=${seedPost}`).first()).toBeVisible({ timeout: 15000 });
    
    // Find the first share button within a post card (ignore composer)
    const shareBtn = page.locator('button:has-text("Bagikan")').nth(1); 
    await shareBtn.click();
    
    // Karena test di Headless, Share API memicu fallback ke Clipboard (toast)
    await expect(page.locator('body')).toContainText(/Tautan disalin ke papan klip|dibagikan/, { timeout: 10000 });
  });

});
