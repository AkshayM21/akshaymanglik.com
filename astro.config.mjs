import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * Resolve the slugs of draft posts straight from the filesystem. The sitemap
 * `filter` only sees URLs and cannot import `astro:content`, so we read blog
 * frontmatter here. This mirrors the `isVisible` predicate (src/lib/posts.ts)
 * used by the index/RSS/[...slug] surfaces, keeping drafts out of every
 * production output — including sitemap-0.xml.
 *
 * Computed once at config load. `astro dev` never emits a sitemap, so this
 * only ever affects production builds; pages/RSS/post-routes handle the
 * dev-vs-prod gating themselves via isVisible() (import.meta.env.PROD).
 */
function getDraftSlugs() {
  const blogDir = fileURLToPath(new URL('./src/content/blog', import.meta.url));
  let files = [];
  try {
    files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  } catch {
    return new Set();
  }
  const drafts = new Set();
  for (const file of files) {
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const { data } = matter(raw);
    if (data.draft === true) {
      drafts.add(file.replace(/\.mdx?$/, ''));
    }
  }
  return drafts;
}

const draftSlugs = getDraftSlugs();

// https://astro.build/config
export default defineConfig({
  site: 'https://akshaymanglik.com',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [
    mdx(),
    sitemap({
      // Exclude any draft post URL (/dereferenced/<slug>/) from the sitemap.
      filter: (page) => {
        for (const slug of draftSlugs) {
          if (page.endsWith(`/dereferenced/${slug}/`) || page.endsWith(`/dereferenced/${slug}`)) {
            return false;
          }
        }
        return true;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
