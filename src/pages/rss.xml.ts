import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getVisiblePosts } from '@/lib/posts';

export async function GET(context: APIContext) {
  // Already date-sorted (newest first); drafts hidden in prod, shown in dev.
  const sortedPosts = await getVisiblePosts();

  return rss({
    title: 'Dereferenced',
    description: 'Ideas, traced to source; by Akshay Manglik.',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/dereferenced/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
    stylesheet: '/rss-styles.xsl',
  });
}
