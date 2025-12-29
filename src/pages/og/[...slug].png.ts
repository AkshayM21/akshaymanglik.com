import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

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

  // Load fonts
  const fontsDir = path.join(process.cwd(), 'public/fonts');
  const ibmPlexRegular = fs.readFileSync(path.join(fontsDir, 'IBMPlexSans-Regular.ttf'));
  const ibmPlexMedium = fs.readFileSync(path.join(fontsDir, 'IBMPlexSans-Medium.ttf'));
  const ibmPlexSemiBold = fs.readFileSync(path.join(fontsDir, 'IBMPlexSans-SemiBold.ttf'));
  const literataSemiBold = fs.readFileSync(path.join(fontsDir, 'Literata-SemiBold.ttf'));

  // Format date like "December 28, 2025"
  const formattedDate = new Date(pubDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build meta line: "December 28, 2025 · Machine Learning"
  const metaParts = [formattedDate];
  if (category) metaParts.push(category);
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
                    marginBottom: '24px',
                  },
                  children: 'dereferenced',
                },
              },
              // Title card - exact match to .title-card styles
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    // Exact title-card styles from global.css
                    backgroundColor: '#F3F0EB', // --color-newsletter-bg
                    border: '1px solid #1A1A1A',
                    borderRadius: '10px',
                    boxShadow: '3px 3px 0 #1A1A1A',
                    padding: '24px 28px',
                    flex: 1,
                    justifyContent: 'center',
                  },
                  children: [
                    // Meta - exact .article__meta styles
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '14px',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: '#6B6B6B',
                          marginBottom: '12px',
                          fontFamily: 'IBM Plex Sans, sans-serif',
                        },
                        children: metaLine,
                      },
                    },
                    // Title - exact .article__title styles
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '40px',
                          fontWeight: 600,
                          color: '#1A1A1A',
                          lineHeight: 1.2,
                          fontFamily: 'Literata, serif',
                          marginBottom: description ? '16px' : '0',
                        },
                        children: title,
                      },
                    },
                    // Description/subtitle - exact .article__subtitle styles
                    description && {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '18px',
                          color: '#4A4A4A',
                          lineHeight: 1.5,
                          fontFamily: 'IBM Plex Sans, sans-serif',
                        },
                        children: description,
                      },
                    },
                  ].filter(Boolean),
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
