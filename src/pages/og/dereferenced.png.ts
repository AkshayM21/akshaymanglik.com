import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ImageResponse } from '@vercel/og';

export const prerender = true;

export const GET: APIRoute = async () => {
  // Get all published posts, sorted by date
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  // Get up to 2 most recent posts
  const recentPosts = sortedPosts.slice(0, 2);

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
              // "dereferenced" header
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '32px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    letterSpacing: '0.02em',
                    marginBottom: '8px',
                  },
                  children: 'dereferenced',
                },
              },
              // Subtitle
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '18px',
                    color: '#6B6B6B',
                    marginBottom: '32px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  },
                  children: 'Notes on machine learning, engineering, and more',
                },
              },
              // Recent posts container
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    flex: 1,
                  },
                  children: recentPosts.map((post) => {
                    const formattedDate = new Date(post.data.pubDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });
                    return {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '20px 24px',
                          border: '2px solid #1A1A1A',
                          borderRadius: '12px',
                          backgroundColor: '#FAF8F5',
                        },
                        children: [
                          // Date and category
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '14px',
                                color: '#6B6B6B',
                                marginBottom: '8px',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                              },
                              children: post.data.category
                                ? `${formattedDate} · ${post.data.category}`
                                : formattedDate,
                            },
                          },
                          // Title
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '24px',
                                fontWeight: 600,
                                color: '#1A1A1A',
                                lineHeight: 1.3,
                              },
                              children: post.data.title,
                            },
                          },
                        ],
                      },
                    };
                  }),
                },
              },
            ],
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
