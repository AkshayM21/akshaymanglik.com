import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Single source of truth for draft visibility.
 *
 * In a production build (`astro build` / Vercel), `import.meta.env.PROD` is
 * `true`, so posts with `draft: true` are hidden everywhere. During local
 * development (`astro dev`), `PROD` is `false`, so drafts remain visible for
 * preview. Use this predicate on every surface that lists or generates posts
 * (index, RSS, [...slug]) so behavior is identical across all of them.
 */
export const isVisible = (post: CollectionEntry<'blog'>): boolean =>
  import.meta.env.PROD ? !post.data.draft : true;

/** Convenience: visible, date-sorted (newest first) blog posts. */
export async function getVisiblePosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', isVisible);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Slugs of posts that should be excluded from production output (drafts).
 * Used by the sitemap `filter` in astro.config.mjs, which only sees URLs, so we
 * resolve the draft set here and match by URL path. Empty in dev (nothing
 * hidden), so the sitemap mirrors the visible pages in every environment.
 */
export async function getDraftSlugs(): Promise<string[]> {
  if (!import.meta.env.PROD) return [];
  const drafts = await getCollection('blog', (post) => post.data.draft === true);
  return drafts.map((post) => post.slug);
}
