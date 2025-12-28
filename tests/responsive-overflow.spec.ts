import { test, expect } from '@playwright/test';

// Test viewports: every 100px from 320 to 1920, plus standard breakpoints
const viewports = [
  // Standard breakpoints
  { width: 320, height: 568, name: 'iPhone SE' },
  { width: 375, height: 667, name: 'iPhone 8' },
  { width: 390, height: 844, name: 'iPhone 14' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1024, height: 768, name: 'iPad Landscape' },
  { width: 1280, height: 800, name: 'Desktop' },
  { width: 1440, height: 900, name: 'Desktop Large' },
  { width: 1920, height: 1080, name: 'Full HD' },
  // Every 100px from 320 to 1920
  ...Array.from({ length: 17 }, (_, i) => ({
    width: 320 + i * 100,
    height: 800,
    name: `${320 + i * 100}px`,
  })),
];

// Remove duplicates by width
const uniqueViewports = viewports.filter(
  (v, i, arr) => arr.findIndex((x) => x.width === v.width) === i
);

test.describe('Responsive overflow protection', () => {
  for (const viewport of uniqueViewports) {
    test(`no horizontal overflow at ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/dereferenced/geometry-of-attention');

      // Check no horizontal scrollbar (document width should equal viewport width)
      const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewWidth = await page.evaluate(() => window.innerWidth);

      expect(docWidth).toBeLessThanOrEqual(viewWidth + 1); // +1 for rounding
    });

    test(`card doesn't exceed viewport at ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/dereferenced/geometry-of-attention');

      const card = page.locator('.card--article');
      const cardBox = await card.boundingBox();

      if (cardBox) {
        // Card should not extend beyond viewport
        expect(cardBox.x).toBeGreaterThanOrEqual(0);
        expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(viewport.width + 1);
      }
    });
  }

  test('sidenotes stay within card on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dereferenced/geometry-of-attention');

    // Wait for JS to teleport sidenotes
    await page.waitForSelector('.sidenote-gutter-item', { timeout: 5000 });

    const card = page.locator('.card--article');
    const cardBox = await card.boundingBox();
    const gutterItems = page.locator('.sidenote-gutter-item');
    const count = await gutterItems.count();

    for (let i = 0; i < count; i++) {
      const item = gutterItems.nth(i);
      const itemBox = await item.boundingBox();

      if (itemBox && cardBox) {
        // Sidenote should be within card boundaries
        expect(itemBox.x + itemBox.width).toBeLessThanOrEqual(
          cardBox.x + cardBox.width + 5
        );
      }
    }
  });

  test('code blocks have horizontal scroll when needed', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dereferenced/geometry-of-attention');

    const codeBlocks = page.locator('.prose pre');
    const count = await codeBlocks.count();

    for (let i = 0; i < count; i++) {
      const pre = codeBlocks.nth(i);
      const isVisible = await pre.isVisible();

      if (isVisible) {
        // Code block should have overflow-x: auto (can scroll)
        const overflow = await pre.evaluate((el) =>
          window.getComputedStyle(el).overflowX
        );
        expect(overflow).toBe('auto');
      }
    }
  });

  test('title card stays within viewport on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dereferenced/geometry-of-attention');

    // Check that the document doesn't have horizontal overflow
    const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewWidth = await page.evaluate(() => window.innerWidth);

    expect(docWidth).toBeLessThanOrEqual(viewWidth + 1);
  });

  test('newsletter card stays within viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dereferenced');

    const newsletter = page.locator('.newsletter-card');
    const newsletterBox = await newsletter.boundingBox();

    if (newsletterBox) {
      expect(newsletterBox.x).toBeGreaterThanOrEqual(0);
      expect(newsletterBox.x + newsletterBox.width).toBeLessThanOrEqual(390 + 1);
    }
  });
});
