import { test, expect } from '@playwright/test';
import * as crypto from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
const MOCK_TOKEN = '2|ojdmguzJinMdGFb4IW5FP355I03esbx8nSxjh4uma0a6b9b3';

test.describe('Hybrid App E2E Write-Path Smoke Tests', () => {

  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(token => {
      window.localStorage.setItem('e2e_bypass_token', token);
    }, MOCK_TOKEN);
    await page.goto(BASE_URL);
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
