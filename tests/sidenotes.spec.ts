import { test, expect } from '@playwright/test';

test.describe('Sidenotes', () => {
  test.describe('Desktop (1280px)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('sidenotes gutter visible and in column 3', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');

      // Wait for JS to teleport sidenotes to gutter
      await page.waitForSelector('.sidenote-gutter-item', { timeout: 5000 });

      const gutter = page.locator('.sidenotes-gutter');
      await expect(gutter).toBeVisible();

      const prose = page.locator('.prose');
      const gutterBox = await gutter.boundingBox();
      const proseBox = await prose.boundingBox();

      // Gutter should be to the right of prose
      if (gutterBox && proseBox) {
        expect(gutterBox.x).toBeGreaterThan(proseBox.x + proseBox.width - 50);
      }
    });

    test('sidenotes gutter items are present', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');

      // Wait for JS to teleport sidenotes
      await page.waitForSelector('.sidenote-gutter-item', { timeout: 5000 });

      const gutterItems = page.locator('.sidenote-gutter-item');
      const count = await gutterItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('sidenotes do not overflow card', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');

      // Wait for JS to teleport sidenotes
      await page.waitForSelector('.sidenote-gutter-item', { timeout: 5000 });

      const card = page.locator('.card--article');
      const cardBox = await card.boundingBox();
      const gutterItems = page.locator('.sidenote-gutter-item');

      for (let i = 0; i < await gutterItems.count(); i++) {
        const itemBox = await gutterItems.nth(i).boundingBox();
        if (itemBox && cardBox) {
          expect(itemBox.x + itemBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 10);
        }
      }
    });

    test('inline sidenote content hidden on desktop', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');
      const inlineContent = page.locator('.prose .sidenote-content').first();
      await expect(inlineContent).toBeHidden();
    });

    test('sidenote markers visible in prose', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');
      const marker = page.locator('.sidenote-number').first();
      await expect(marker).toBeVisible();
    });
  });

  test.describe('Mobile (390px)', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('sidenotes gutter hidden on mobile', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');
      const gutter = page.locator('.sidenotes-gutter');
      await expect(gutter).toBeHidden();
    });

    test('sidenote toggle shows content', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');

      const content = page.locator('.sidenote-content').first();
      await expect(content).toBeHidden();

      await page.locator('.sidenote-toggle').first().click();
      await expect(content).toBeVisible();
    });

    test('sidenote markers visible on mobile', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');
      const marker = page.locator('.sidenote-number').first();
      await expect(marker).toBeVisible();
    });
  });

  test.describe('Tablet (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('sidenotes gutter visible at 768px breakpoint', async ({ page }) => {
      await page.goto('/dereferenced/geometry-of-attention');

      // Wait for JS to teleport sidenotes to gutter
      await page.waitForSelector('.sidenote-gutter-item', { timeout: 5000 });

      const gutter = page.locator('.sidenotes-gutter');
      await expect(gutter).toBeVisible();
    });
  });
});
