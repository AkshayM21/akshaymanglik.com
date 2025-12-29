import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

export const GET: APIRoute = async () => {
  // Load fonts
  const fontsDir = path.join(process.cwd(), 'public/fonts');
  const ibmPlexRegular = fs.readFileSync(path.join(fontsDir, 'IBMPlexSans-Regular.ttf'));
  const ibmPlexMedium = fs.readFileSync(path.join(fontsDir, 'IBMPlexSans-Medium.ttf'));
  const ibmPlexSemiBold = fs.readFileSync(path.join(fontsDir, 'IBMPlexSans-SemiBold.ttf'));
  const literataSemiBold = fs.readFileSync(path.join(fontsDir, 'Literata-SemiBold.ttf'));

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
        padding: '32px',
        fontFamily: 'IBM Plex Sans, sans-serif',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              border: '1px solid #1A1A1A',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              padding: '32px',
              boxShadow: '3px 3px 0 #1A1A1A',
            },
            children: [
              // "dereferenced" header - matches nav__logo style
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    fontFamily: 'Literata, serif',
                    marginBottom: '4px',
                  },
                  children: 'dereferenced',
                },
              },
              // Subtitle
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '16px',
                    fontStyle: 'italic',
                    color: '#4A4A4A',
                    marginBottom: '24px',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                  },
                  children: 'Ideas, traced to source',
                },
              },
              // Post cards - exact match to PostCard component
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    flex: 1,
                  },
                  children: recentPosts.map((post) => {
                    const formattedDate = new Date(post.data.pubDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    });
                    return {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          // Exact PostCard styles from global.css
                          padding: '20px 24px',
                          border: '1px solid #1A1A1A',
                          borderRadius: '10px',
                          backgroundColor: '#FFFFFF',
                          // Show shadow (hover state) since it's a preview
                          boxShadow: '3px 3px 0 #1A1A1A',
                          transform: 'translate(-2px, -2px)',
                        },
                        children: [
                          // Meta - exact .post-card__meta styles
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '12px',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                                color: '#6B6B6B',
                                marginBottom: '4px',
                                fontFamily: 'IBM Plex Sans, sans-serif',
                              },
                              children: post.data.category
                                ? `${formattedDate} · ${post.data.category}`
                                : formattedDate,
                            },
                          },
                          // Title - exact .post-card__title styles
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#DC2626', // Accent color on hover
                                lineHeight: 1.35,
                                fontFamily: 'Literata, serif',
                                marginBottom: '8px',
                              },
                              children: post.data.title,
                            },
                          },
                          // Description - exact .post-card__excerpt styles
                          post.data.description && {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '14px',
                                lineHeight: 1.6,
                                color: '#4A4A4A',
                                fontFamily: 'IBM Plex Sans, sans-serif',
                              },
                              children: post.data.description,
                            },
                          },
                        ].filter(Boolean),
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
    fonts: [
      { name: 'IBM Plex Sans', data: ibmPlexRegular, weight: 400 },
      { name: 'IBM Plex Sans', data: ibmPlexMedium, weight: 500 },
      { name: 'IBM Plex Sans', data: ibmPlexSemiBold, weight: 600 },
      { name: 'Literata', data: literataSemiBold, weight: 600 },
    ],
  });
};
