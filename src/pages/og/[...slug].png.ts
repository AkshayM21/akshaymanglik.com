import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { ImageResponse } from '@vercel/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { title: post.data.title, category: post.data.category },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, category } = props;

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
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#DC2626',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '16px',
                  },
                  children: 'DEREFERENCED',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '56px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    lineHeight: 1.2,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                  },
                  children: title,
                },
              },
              category && {
                type: 'div',
                props: {
                  style: {
                    fontSize: '18px',
                    color: '#6B6B6B',
                    marginTop: 'auto',
                  },
                  children: category,
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
