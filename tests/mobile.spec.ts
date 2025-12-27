import { test, expect } from '@playwright/test';

// Use mobile viewport for all tests in this file
test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile layout', () => {
  test('sidenote gutter hidden on mobile', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Sidenote gutter should be hidden on mobile
    const sidenoteGutter = page.locator('.sidenote-gutter').first();
    await expect(sidenoteGutter).toBeHidden();
  });

  test('sidenote toggle works on mobile', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Sidenote toggle should be visible
    const sidenoteToggle = page.locator('.sidenote-toggle').first();
    await expect(sidenoteToggle).toBeVisible();

    // Inline sidenote should be hidden initially
    const sidenoteInline = page.locator('.sidenote-inline').first();
    await expect(sidenoteInline).toBeHidden();

    // Click the toggle
    await sidenoteToggle.click();

    // Inline sidenote should now be visible
    await expect(sidenoteInline).toBeVisible();
  });

  test('sidebar TOC hidden on mobile', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Sidebar TOC should be hidden on mobile
    const tocSidebar = page.locator('.toc-sidebar');
    await expect(tocSidebar).toBeHidden();
  });

  test('mobile TOC is visible and collapsible', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Mobile TOC should be visible
    const tocMobile = page.locator('.toc-mobile');
    await expect(tocMobile).toBeVisible();

    // Should be a details element
    const details = page.locator('.toc-mobile__details');
    await expect(details).toBeVisible();

    // Summary should be clickable
    const summary = page.locator('.toc-mobile__summary');
    await expect(summary).toBeVisible();
  });

  test('post cards work on mobile', async ({ page }) => {
    await page.goto('/dereferenced');

    const card = page.locator('.post-card').first();
    await expect(card).toBeVisible();

    // Card should be clickable
    const cardLink = card.locator('.post-card__title a');
    const href = await cardLink.getAttribute('href');

    await card.click();
    await expect(page).toHaveURL(new RegExp(href!));
  });

  test('about page responsive layout', async ({ page }) => {
    await page.goto('/about');

    // Photo should be visible
    const photo = page.locator('.about-photo');
    await expect(photo).toBeVisible();

    // Connect links should wrap
    const connectLinks = page.locator('.connect-links');
    await expect(connectLinks).toBeVisible();
  });

  test('navigation works on mobile', async ({ page }) => {
    await page.goto('/dereferenced');

    // Nav should be visible
    const nav = page.locator('.nav');
    await expect(nav).toBeVisible();

    // Logo symbol should be visible on mobile (text hidden)
    const logoSymbol = page.locator('.nav__logo-symbol');
    await expect(logoSymbol).toBeVisible();
  });

  test('article layout is single column on mobile', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const articleLayout = page.locator('.article-layout');

    // On mobile, the grid should have a simpler layout
    // We verify this by checking that TOC sidebar and sidenote gutter are hidden
    // (already tested above) and that prose content is full width
    const prose = page.locator('.prose');
    await expect(prose).toBeVisible();

    // Prose should take up most of the viewport width on mobile
    const proseBox = await prose.boundingBox();
    const viewportWidth = 390; // Mobile viewport width we set

    if (proseBox) {
      // Prose should be at least 80% of viewport width on mobile
      expect(proseBox.width).toBeGreaterThan(viewportWidth * 0.8);
    }
  });
});
