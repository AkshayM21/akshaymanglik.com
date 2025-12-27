import { test, expect } from '@playwright/test';

test.describe('Visual layout - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('sidenote visible in gutter on desktop', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Sidenote gutter should be visible on desktop
    const sidenoteGutter = page.locator('.sidenote-gutter').first();
    await expect(sidenoteGutter).toBeVisible();

    // Should be positioned in the right column (grid-column: 3)
    const gridColumn = await sidenoteGutter.evaluate(
      (el) => window.getComputedStyle(el).gridColumn
    );
    expect(gridColumn).toContain('3');
  });

  test('TOC visible in sidebar on desktop', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Sidebar TOC should be visible
    const tocSidebar = page.locator('.toc-sidebar');
    await expect(tocSidebar).toBeVisible();

    // Should be sticky positioned
    const position = await tocSidebar.evaluate(
      (el) => window.getComputedStyle(el).position
    );
    expect(position).toBe('sticky');
  });

  test('footnotes section renders at bottom', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Wait for footnotes to be collected by JS
    await page.waitForSelector('#footnotes-container .footnotes-list', { timeout: 5000 });

    const footnotesSection = page.locator('#footnotes-container');
    await expect(footnotesSection).toBeVisible();

    // Should have footnote items
    const footnoteItems = page.locator('.footnote-item');
    const count = await footnoteItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('about page photo has shadow', async ({ page }) => {
    await page.goto('/about');

    const photo = page.locator('.about-photo');
    await expect(photo).toBeVisible();

    // Check for box-shadow
    const boxShadow = await photo.evaluate(
      (el) => window.getComputedStyle(el).boxShadow
    );
    expect(boxShadow).not.toBe('none');
  });

  test('about page connect links are horizontal', async ({ page }) => {
    await page.goto('/about');

    const connectLinks = page.locator('.connect-links');
    await expect(connectLinks).toBeVisible();

    // Should be flex display
    const display = await connectLinks.evaluate(
      (el) => window.getComputedStyle(el).display
    );
    expect(display).toBe('flex');
  });

  test('article uses CSS grid layout', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const articleLayout = page.locator('.article-layout');
    await expect(articleLayout).toBeVisible();

    const display = await articleLayout.evaluate(
      (el) => window.getComputedStyle(el).display
    );
    expect(display).toBe('grid');
  });

  test('post card is fully clickable', async ({ page }) => {
    await page.goto('/dereferenced');

    const card = page.locator('.post-card').first();
    const cardLink = card.locator('.post-card__title a');

    // Get the href before clicking
    const href = await cardLink.getAttribute('href');

    // Click anywhere on the card (not just the title)
    await card.click({ position: { x: 10, y: 10 } });

    // Should navigate to the post
    await expect(page).toHaveURL(new RegExp(href!));
  });
});
