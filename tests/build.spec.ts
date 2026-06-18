import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// In server mode (with API routes), static files are in dist/client
// In static mode, they're directly in dist
const baseDistDir = path.join(__dirname, '../dist');
const distDir = fs.existsSync(path.join(baseDistDir, 'client'))
  ? path.join(baseDistDir, 'client')
  : baseDistDir;
const blogDir = path.join(__dirname, '../src/content/blog');

/**
 * Split posts into published vs draft by reading frontmatter, mirroring the
 * production visibility rule (draft: true is hidden from the prod build).
 * Keeps this test correct as posts are published/drafted instead of
 * hardcoding specific slugs.
 */
function readPosts() {
  const files = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    : [];
  const published: string[] = [];
  const drafts: string[] = [];
  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, '');
    const { data } = matter(fs.readFileSync(path.join(blogDir, file), 'utf-8'));
    (data.draft === true ? drafts : published).push(slug);
  }
  return { published, drafts };
}

test.describe('Build verification', () => {
  test('dist directory exists after build', () => {
    expect(fs.existsSync(distDir)).toBe(true);
  });

  test('core pages exist in dist', () => {
    for (const page of ['index.html', 'dereferenced/index.html']) {
      expect(fs.existsSync(path.join(distDir, page)), `Missing: ${page}`).toBe(true);
    }
  });

  test('published posts are built and drafts are excluded', () => {
    const { published, drafts } = readPosts();
    for (const slug of published) {
      const p = `dereferenced/${slug}/index.html`;
      expect(fs.existsSync(path.join(distDir, p)), `Missing published post: ${p}`).toBe(true);
    }
    for (const slug of drafts) {
      const p = `dereferenced/${slug}/index.html`;
      expect(fs.existsSync(path.join(distDir, p)), `Draft leaked into build: ${p}`).toBe(false);
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

  test('OG images exist for the site and every published post', () => {
    for (const img of ['og/index.png', 'og/dereferenced.png']) {
      expect(fs.existsSync(path.join(distDir, img)), `Missing OG image: ${img}`).toBe(true);
    }
    const { published } = readPosts();
    for (const slug of published) {
      const img = `og/${slug}.png`;
      expect(fs.existsSync(path.join(distDir, img)), `Missing OG image: ${img}`).toBe(true);
    }
  });
});
