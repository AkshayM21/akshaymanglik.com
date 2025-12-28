import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('SEO verification', () => {
  test('blog post has OG meta tags', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    // OG title
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute(
      'content',
      /The Geometry of Attention/
    );

    // OG description
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toHaveAttribute('content', /.+/);

    // OG image
    const ogImage = page.locator('meta[property="og:image"]');
    const imageUrl = await ogImage.getAttribute('content');
    expect(imageUrl).toContain('/og/geometry-of-attention.png');

    // OG type
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
  });

  test('blog post has Twitter meta tags', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const twitterCard = page.locator('meta[property="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');

    const twitterTitle = page.locator('meta[property="twitter:title"]');
    await expect(twitterTitle).toHaveAttribute(
      'content',
      /The Geometry of Attention/
    );
  });

  test('pages have canonical URLs', async ({ page }) => {
    await page.goto('/dereferenced/geometry-of-attention');

    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute('href');
    expect(href).toContain('/dereferenced/geometry-of-attention');
  });

  test('RSS feed is accessible and valid XML', async ({ request }) => {
    const response = await request.get('/rss.xml');
    expect(response.ok()).toBe(true);

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('xml');

    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<rss');
    expect(body).toContain('<channel>');
    expect(body).toContain('<item>');
  });

  test('RSS feed contains blog posts', async ({ request }) => {
    const response = await request.get('/rss.xml');
    const body = await response.text();

    expect(body).toContain('The Geometry of Attention');
    expect(body).toContain('Understanding GRPO');
    expect(body).toContain('/dereferenced/');
  });

  test('sitemap is valid XML', async () => {
    // Read sitemap directly from build output (Astro preview server doesn't serve .xml reliably)
    const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap-index.xml');
    const body = fs.readFileSync(sitemapPath, 'utf-8');

    expect(body).toContain('<?xml');
    expect(body).toContain('sitemap');
  });

  test('about page has meta description', async ({ page }) => {
    await page.goto('/about');

    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(20);
  });
});
