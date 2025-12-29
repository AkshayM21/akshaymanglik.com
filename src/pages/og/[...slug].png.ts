import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { ImageResponse } from '@vercel/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      title: post.data.title,
      description: post.data.description,
      category: post.data.category,
      pubDate: post.data.pubDate,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description, category, pubDate } = props;

  // Format date like "December 28, 2025"
  const formattedDate = new Date(pubDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Estimate reading time (rough estimate based on title/description length)
  // In a real scenario, we'd calculate from content
  const readingTime = '5 min read';

  // Build meta line: "December 28, 2025 · Machine Learning · 5 min read"
  const metaParts = [formattedDate];
  if (category) metaParts.push(category);
  metaParts.push(readingTime);
  const metaLine = metaParts.join(' · ');

  const html = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#FAF8F5',
        padding: '60px',
        fontFamily: 'Georgia, serif',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              border: '4px solid #1A1A1A',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              padding: '48px',
              boxShadow: '8px 8px 0 #1A1A1A',
            },
            children: [
              // "dereferenced" - black, lowercase, Literata style
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    letterSpacing: '0.02em',
                    marginBottom: '24px',
                  },
                  children: 'dereferenced',
                },
              },
              // Meta line: date · category · reading time
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '16px',
                    color: '#6B6B6B',
                    marginBottom: '16px',
                  },
                  children: metaLine,
                },
              },
              // Title
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '48px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    lineHeight: 1.2,
                    marginBottom: '16px',
                  },
                  children: title,
                },
              },
              // Description
              description && {
                type: 'div',
                props: {
                  style: {
                    fontSize: '20px',
                    color: '#4A4A4A',
                    lineHeight: 1.5,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  },
                  children: description,
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };

  return new ImageResponse(html as any, {
    width: 1200,
    height: 630,
  });
};
