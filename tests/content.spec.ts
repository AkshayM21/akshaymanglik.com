import { test, expect } from '@playwright/test';

test.describe('Content rendering', () => {
  test('blog post renders with correct title and meta', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Title renders
    const title = page.locator('.article__title');
    await expect(title).toContainText('The Geometry of Attention');

    // Meta info present
    const meta = page.locator('.article__meta');
    await expect(meta).toBeVisible();
    await expect(meta).toContainText('Machine Learning');
    await expect(meta).toContainText('min read');
  });

  test('Callout component renders', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const callout = page.locator('.callout');
    await expect(callout).toBeVisible();
    await expect(callout).toContainText('Note');
  });

  test('Sidenote component renders', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Sidenote toggle should be visible
    const sidenoteToggle = page.locator('.sidenote-toggle').first();
    await expect(sidenoteToggle).toBeVisible();

    // Sidenote gutter version exists (desktop)
    const sidenoteGutter = page.locator('.sidenote-gutter').first();
    await expect(sidenoteGutter).toBeAttached();
  });

  test('Math equations render with KaTeX', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // KaTeX generates .katex elements
    const math = page.locator('.katex');
    await expect(math.first()).toBeVisible();
  });

  test('code blocks have syntax highlighting', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Shiki generates styled pre/code
    const codeBlock = page.locator('pre code');
    await expect(codeBlock.first()).toBeVisible();

    // Check for language-specific class or style
    const preBlock = page.locator('pre').first();
    const style = await preBlock.getAttribute('style');
    // Shiki adds inline styles or classes
    expect(style).toBeTruthy();
  });

  test('TOC renders for posts with headings', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // Desktop sidebar TOC
    const toc = page.locator('.toc-sidebar');
    await expect(toc).toBeVisible();

    // Has links to headings
    const tocLinks = page.locator('.toc-sidebar__link');
    const count = await tocLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('prose links have correct styling', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const proseLink = page.locator('.prose a').first();
    const color = await proseLink.evaluate(
      (el) => window.getComputedStyle(el).color
    );

    // Should be crimson accent (#DC2626 = rgb(220, 38, 38))
    expect(color).toMatch(/rgb\(220,\s*38,\s*38\)/);
  });
});
