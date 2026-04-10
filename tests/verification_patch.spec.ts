import { test, expect } from '@playwright/test';

test.describe('Verification Patch', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Community Posts
    await page.route('**/api/community/posts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            posts: [
              {
                id: '1',
                type: 'user_post',
                text: 'Test Post from Member',
                created_at: '2026-04-10T00:00:00Z',
                author: {
                  id: 'member_1',
                  name: 'Member',
                  avatar_url: 'https://placehold.co/100x100?text=Member',
                },
                counts: { likes: 0, comments: 2, bookmarks: 0 },
                isLiked: false,
                isBookmarked: false,
              },
              {
                id: '2',
                type: 'user_post',
                text: 'Test Post from Another User',
                created_at: '2026-04-10T00:01:00Z',
                author: {
                  id: 'user_2',
                  name: 'Another User',
                  avatar_url: '/storage/avatars/2.png',
                },
                counts: { likes: 0, comments: 0, bookmarks: 0 },
                isLiked: false,
                isBookmarked: false,
              }
            ],
            archivePosts: []
          }
        })
      });
    });

    // Mock Comments
    await page.route('**/api/community/posts/1/comments', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            comments: [
              {
                id: 'c1',
                postId: '1',
                text: 'First comment',
                createdAt: '2m ago',
                author: {
                  id: 'user_3',
                  name: 'Commenter',
                  avatarUrl: 'https://placehold.co/100x100?text=C1'
                }
              }
            ]
          }
        })
      });
    });

    // Set up Auth Mock
    await page.addInitScript(() => {
      window.localStorage.setItem('e2e_bypass_token', 'bypass');
      window.localStorage.setItem('tct_app_auth_user', JSON.stringify({
        id: 'user_me',
        name: 'Me',
        email: 'me@example.com',
        avatarUrl: '/storage/avatars/me.png'
      }));
      // Set a transform for the current user
      window.localStorage.setItem('tct.profile.avatarTransform:me@example.com', JSON.stringify({
        x: 10,
        y: 10,
        scale: 1.5
      }));
    });

    await page.goto('http://127.0.0.1:9002/community');
  });

  test('Avatar mobile: user named Member and others should not have transform', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Wait for posts to load
    await page.waitForSelector('text=Test Post from Member');

    // Check Member avatar
    const memberAvatar = page.locator('div:has-text("Member") img').first();
    const memberStyle = await memberAvatar.getAttribute('style');
    expect(memberStyle || '').not.toContain('translate');
    expect(memberStyle || '').not.toContain('scale');

    // Check Another User avatar (relative URL)
    const anotherAvatar = page.locator('div:has-text("Another User") img').first();
    const anotherStyle = await anotherAvatar.getAttribute('style');
    expect(anotherStyle || '').not.toContain('translate');
    
    // Check URL validity (should be absolute or preserved relative)
    const memberSrc = await memberAvatar.getAttribute('src');
    expect(memberSrc).toContain('placehold.co');
  });

  test('Vertical scroll in rail: rail should have touch-action pan-y', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.click('button:has-text("Arsip")');
    
    const rail = page.locator('div[style*="touch-action: pan-y"]');
    await expect(rail).toBeVisible();
    
    // Verify touchAction style explicitly
    const touchAction = await rail.evaluate(el => el.style.touchAction);
    expect(touchAction).toBe('pan-y');
  });

  test('Scroll after CommentsSheet closed: body scroll should return to normal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    const initialOverflow = await page.evaluate(() => window.getComputedStyle(document.body).overflow);
    console.log('Initial overflow:', initialOverflow);
    
    // Open comments
    await page.click('button:has-text("2")');
    console.log('Clicked comment button');
    
    // Wait for ANY heading in the sheet
    await page.waitForSelector('h2, h3, [role="heading"]', { timeout: 10000 });
    const sheetTitleText = await page.innerText('h2, h3, [role="heading"]');
    console.log('Sheet title found:', sheetTitleText);
    
    const lockedOverflow = await page.evaluate(() => window.getComputedStyle(document.body).overflow);
    console.log('Locked overflow:', lockedOverflow);
    
    // Close via backdrop click (click near top)
    await page.mouse.click(195, 50); 
    console.log('Clicked backdrop');
    
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 10000 });
    console.log('Dialog closed');
    
    const restoredOverflow = await page.evaluate(() => window.getComputedStyle(document.body).overflow);
    console.log('Restored overflow:', restoredOverflow);
    expect(restoredOverflow).toBe(initialOverflow);
  });
});
