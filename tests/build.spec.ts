import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

test.describe('Build verification', () => {
  test('dist directory exists after build', () => {
    expect(fs.existsSync(distDir)).toBe(true);
  });

  test('expected pages exist in dist', () => {
    const expectedPages = [
      'index.html',
      'about/index.html',
      'dereferenced/index.html',
      'dereferenced/geometry-of-attention/index.html',
      'dereferenced/understanding-grpo/index.html',
    ];

    for (const page of expectedPages) {
      const pagePath = path.join(distDir, page);
      expect(fs.existsSync(pagePath), `Missing: ${page}`).toBe(true);
    }
  });

  test('sitemap-index.xml exists', () => {
    const sitemapPath = path.join(distDir, 'sitemap-index.xml');
    expect(fs.existsSync(sitemapPath)).toBe(true);
  });

  test('RSS feed exists', () => {
    const rssPath = path.join(distDir, 'rss.xml');
    expect(fs.existsSync(rssPath)).toBe(true);
  });

  test('OG images exist for posts', () => {
    const ogImages = [
      'og/geometry-of-attention.png',
      'og/understanding-grpo.png',
    ];

    for (const img of ogImages) {
      const imgPath = path.join(distDir, img);
      expect(fs.existsSync(imgPath), `Missing OG image: ${img}`).toBe(true);
    }
  });
});
