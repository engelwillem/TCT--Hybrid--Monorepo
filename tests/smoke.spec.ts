import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

test.describe('Hybrid App E2E Read-Path Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Tangkap error console dan unhandled exceptions
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Browser Error]: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      console.error(`[Unhandled Exception]: ${error.message}`);
    });
  });

  test('Public Landing Page Load', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBeLessThan(400);

    // Pastikan page merender (tidak blank screen)
    await expect(page.locator('body')).toBeVisible();
    
    // Pastikan hydration tidak crash (cek adanya elemen hero/landing)
    await expect(page.getByRole('heading', { name: /Renungan harian/i })).toBeVisible();
  });

  test('Login Page Available', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/login`);
    expect(response?.status()).toBeLessThan(400);
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Protected Route: Profile Forbidden / Loading State', async ({ page }) => {
    // Tanpa login, biasanya akan ter-redirect ke login atau menampilkan status auth wait
    const response = await page.goto(`${BASE_URL}/profile`);
    expect(response?.status()).toBeLessThan(400);
    
    // Harus ada indikator login/redirect ke login jika auth dilarang
    // atau jika belum redirect, minimal ada form otentikasi UI (Bukan Blank Screen 404)
    await expect(page.locator('body')).toBeVisible();
    const isLogin = await page.locator('input[type="email"]').count() > 0;
    const isAuthWait = await page.locator('text=Memuat profil').count() > 0;
    const isRedirectMsg = await page.locator('text=Mengalihkan').count() > 0;
    const isPleaseLogin = await page.locator('text=Silakan masuk').count() > 0;
    const isProfileForm = await page.locator('text=Simpan Perubahan').count() > 0;
    const isProfileTitle = await page.getByRole('heading', { name: 'Profile' }).count() > 0;
    
    expect(isLogin || isAuthWait || isRedirectMsg || isPleaseLogin || isProfileForm || isProfileTitle).toBeTruthy();
  });

  test('Community Feed Data Logic Check (No Infinite Load)', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/community`);
    expect(response?.status()).toBeLessThan(400);
    
    // Tunggu sampai kata "Memperbarui Feed..." hilang (max 10s)
    await expect(page.locator('text=Memperbarui Feed...')).toBeHidden({ timeout: 10000 });
    
    // Setelah hilang, harus ada card postingan, state "Silakan Masuk Kembali", "Gagal Memperbarui", atau "Belum ada diskusi"
    const hasPost = await page.locator('article').count() > 0;
    const hasCards = await page.locator('.rounded-\\[32px\\]').count() > 0; // Komponen Card
    expect(hasPost || hasCards).toBeTruthy();
  });
  
  test('Today Feed Loading Ecosystem', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/today`);
    expect(response?.status()).toBeLessThan(400);
    
    // Loader harus hilang
    await expect(page.locator('.animate-spin').first()).toBeHidden({ timeout: 10000 });
    
    // Harus menampilkan sesuatu (Verse card, hari ini, atau request login)
    await expect(page.locator('body')).toBeVisible();
  });

  test('Versehub Engine Load (No Infinite Spine)', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/versehub/id/kej-1`);
    expect(response?.status()).toBeLessThan(400);
    
    // Pastikan tidak tersangkut skeleton bab terus menerus
    await expect(page.locator('text=Menyiapkan Ruang Doa...')).toBeHidden({ timeout: 20000 });
    await expect(page.locator('body')).toContainText(/Kejadian|Koleksi Kitab|Ayat tidak ditemukan|Terjadi kesalahan|Alkitab/);
  });
  
  test('Channels Catalog / Class Loading', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/channels`);
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('heading', { name: 'Channels' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body')).toContainText(/Sabbath School|Channel Lainnya|Belum ada channel aktif/);
  });

});
