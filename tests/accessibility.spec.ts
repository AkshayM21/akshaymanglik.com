import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('footnote links have proper aria attributes', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const footnoteRef = page.locator('.footnote-ref').first();
    await expect(footnoteRef).toBeVisible();

    // Should have role="doc-noteref"
    const role = await footnoteRef.getAttribute('role');
    expect(role).toBe('doc-noteref');

    // Should have aria-describedby
    const ariaDescribedby = await footnoteRef.getAttribute('aria-describedby');
    expect(ariaDescribedby).toBeTruthy();
  });

  test('TOC navigation has proper aria label', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Sidebar TOC should have aria-label
    const tocSidebar = page.locator('.toc-sidebar');
    const ariaLabel = await tocSidebar.getAttribute('aria-label');
    expect(ariaLabel).toBe('Table of contents');
  });

  test('footnotes section has proper role', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Wait for footnotes to be collected
    await page.waitForSelector('#footnotes-container .footnotes-list', { timeout: 5000 });

    const footnotesSection = page.locator('#footnotes-container');
    const role = await footnotesSection.getAttribute('role');
    expect(role).toBe('doc-endnotes');
  });

  test('sidenote has proper structure', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Sidenote wrapper should have data attribute for identification
    const sidenote = page.locator('.sidenote').first();
    await expect(sidenote).toBeAttached();

    // Should have the data-sidenote-id attribute
    const sidenoteId = await sidenote.getAttribute('data-sidenote-id');
    expect(sidenoteId).toBeTruthy();
  });

  test('TOC links are keyboard navigable', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Focus the first TOC link
    const firstTocLink = page.locator('.toc-sidebar__link').first();
    await firstTocLink.focus();

    // Should be focused
    await expect(firstTocLink).toBeFocused();

    // Press Enter to navigate
    const href = await firstTocLink.getAttribute('href');
    await page.keyboard.press('Enter');

    // URL should include the anchor
    await expect(page).toHaveURL(new RegExp(href!.replace('#', '')));
  });

  test('skip to content functionality', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Tab to first interactive element and check focus is visible
    await page.keyboard.press('Tab');

    // Should be able to tab through navigation
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');

    const aboutPhoto = page.locator('.about-photo');
    const altText = await aboutPhoto.getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText!.length).toBeGreaterThan(0);
  });

  test('links have discernible text', async ({ page }) => {
    await page.goto('/dereferenced');

    // All post card links should have text
    const cardLinks = page.locator('.post-card__title a');
    const count = await cardLinks.count();

    for (let i = 0; i < count; i++) {
      const link = cardLinks.nth(i);
      const text = await link.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('heading hierarchy is correct', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Should have an h1 (article title)
    const h1 = page.locator('.article__title');
    await expect(h1).toBeVisible();

    // h1 should come before h2s in the prose
    const h1BoundingBox = await h1.boundingBox();
    const firstH2 = page.locator('.prose h2').first();
    const h2BoundingBox = await firstH2.boundingBox();

    if (h1BoundingBox && h2BoundingBox) {
      expect(h1BoundingBox.y).toBeLessThan(h2BoundingBox.y);
    }
  });

  test('color contrast for text', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Check that text colors are readable (not too light)
    const proseText = page.locator('.prose p').first();
    const color = await proseText.evaluate(
      (el) => window.getComputedStyle(el).color
    );

    // Should be a dark color (rgb values should be reasonably low)
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      // Text should be dark enough (not too close to white)
      const brightness = (r + g + b) / 3;
      expect(brightness).toBeLessThan(200);
    }
  });
});
