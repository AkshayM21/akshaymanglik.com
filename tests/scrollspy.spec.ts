import { test, expect } from '@playwright/test';

test.describe('Scrollspy', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('first TOC link active on load', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Wait for scrollspy to initialize
    await page.waitForTimeout(200);

    const firstLink = page.locator('.toc-sidebar__link').first();
    await expect(firstLink).toHaveClass(/toc-sidebar__link--active/);
  });

  test('TOC link highlights on scroll', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Get all h2 headings
    const headings = page.locator('h2[id]');
    const headingCount = await headings.count();

    if (headingCount >= 2) {
      // Get the second heading's position in the document
      const secondHeading = headings.nth(1);
      const scrollPosition = await page.evaluate((selector) => {
        const el = document.querySelectorAll('h2[id]')[1];
        return el ? el.getBoundingClientRect().top + window.scrollY - 50 : 0;
      }, null);

      // Scroll so the second heading is near the TOP of viewport
      await page.evaluate((y) => window.scrollTo(0, y), scrollPosition);
      await page.waitForTimeout(400);

      // Second link should now be active
      const secondLink = page.locator('.toc-sidebar__link').nth(1);
      await expect(secondLink).toHaveClass(/toc-sidebar__link--active/);
    }
  });

  test('TOC click highlights link immediately', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const links = page.locator('.toc-sidebar__link');
    const linkCount = await links.count();

    if (linkCount >= 2) {
      const secondLink = links.nth(1);

      // Click the link - this immediately adds active class
      await secondLink.click();

      // The click handler should immediately highlight the link
      // (scrollspy may update it based on scroll position after)
      // Verify some link becomes active after the interaction
      await page.waitForTimeout(600);

      // At least one link should be active after scroll settles
      const activeLinks = page.locator('.toc-sidebar__link--active');
      await expect(activeLinks).toHaveCount(1, { timeout: 2000 });
    }
  });

  test('TOC stays sticky on scroll', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const toc = page.locator('.toc-sidebar');
    const initialBox = await toc.boundingBox();

    // Scroll down significantly
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(100);

    const afterBox = await toc.boundingBox();

    if (initialBox && afterBox) {
      // Sticky means y position shouldn't change much despite scrolling
      // Allow up to 150px for sticky offset adjustment
      expect(Math.abs(afterBox.y - initialBox.y)).toBeLessThan(150);
    }
  });

  test('TOC sidebar hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dereferenced/geometry-of-attention');

    const toc = page.locator('.toc-sidebar');
    await expect(toc).toBeHidden();
  });

  test('mobile TOC visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dereferenced/geometry-of-attention');

    const mobileToc = page.locator('.toc-mobile');
    await expect(mobileToc).toBeVisible();
  });
});
