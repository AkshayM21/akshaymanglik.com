#!/usr/bin/env npx ts-node

/**
 * Newsletter Generator for Dereferenced
 *
 * Generates a markdown preview of a blog post for copying into Kit.
 *
 * Usage: npm run newsletter <slug>
 * Example: npm run newsletter geometry-of-attention
 */

import * as fs from 'fs';
import * as path from 'path';

const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const SITE_URL = 'https://akshaymanglik.com';

function extractFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Could not parse frontmatter');
  }

  const frontmatterRaw = match[1];
  const body = match[2];

  const frontmatter: Record<string, any> = {};
  for (const line of frontmatterRaw.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

function extractFirstParagraph(body: string): string {
  // Remove imports
  const withoutImports = body.replace(/^import\s+.*\n/gm, '');

  // Find first real paragraph (non-empty, not starting with # or <)
  const lines = withoutImports.split('\n\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('<') && !trimmed.startsWith('```')) {
      // Clean up markdown links and inline components
      return trimmed
        .replace(/<[^>]+>/g, '') // Remove JSX/components
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .trim();
    }
  }
  return '';
}

function generateNewsletter(slug: string): void {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Post not found at ${filePath}`);
    console.error(`Available posts:`);
    const posts = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));
    posts.forEach(p => console.error(`  - ${p.replace('.mdx', '')}`));
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = extractFrontmatter(content);
  const excerpt = extractFirstParagraph(body);
  const postUrl = `${SITE_URL}/dereferenced/${slug}/`;

  const newsletter = `
# ${frontmatter.title}

${excerpt}

**[Read the full post →](${postUrl})**

---

*You're receiving this because you subscribed to Dereferenced, a blog about technology, economics, and philosophy.*

*[Unsubscribe](#) | [View in browser](${postUrl})*
`.trim();

  console.log('\n' + '='.repeat(60));
  console.log('NEWSLETTER PREVIEW');
  console.log('='.repeat(60) + '\n');
  console.log(newsletter);
  console.log('\n' + '='.repeat(60));
  console.log('Copy the above markdown into Kit.');
  console.log('='.repeat(60) + '\n');
}

// Main
const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run newsletter <slug>');
  console.error('Example: npm run newsletter geometry-of-attention');
  process.exit(1);
}

generateNewsletter(slug);
