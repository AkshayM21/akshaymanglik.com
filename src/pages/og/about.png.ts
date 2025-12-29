import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

export const GET: APIRoute = async () => {
  // Load the profile image
  const imagePath = path.join(process.cwd(), 'public/assets/profile-pics/pfp.jpeg');
  const imageData = fs.readFileSync(imagePath);
  const base64Image = `data:image/jpeg;base64,${imageData.toString('base64')}`;

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
              flexDirection: 'row',
              flex: 1,
              border: '4px solid #1A1A1A',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              padding: '48px',
              boxShadow: '8px 8px 0 #1A1A1A',
              gap: '48px',
              alignItems: 'center',
            },
            children: [
              // Profile photo with shadow (LEFT)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexShrink: 0,
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          position: 'relative',
                        },
                        children: [
                          // Shadow layer
                          {
                            type: 'div',
                            props: {
                              style: {
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                width: '220px',
                                height: '220px',
                                backgroundColor: '#1A1A1A',
                                borderRadius: '16px',
                              },
                            },
                          },
                          // Image
                          {
                            type: 'img',
                            props: {
                              src: base64Image,
                              width: 220,
                              height: 220,
                              style: {
                                position: 'relative',
                                objectFit: 'cover',
                                borderRadius: '16px',
                                border: '3px solid #1A1A1A',
                              },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              // Text content (RIGHT)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center',
                  },
                  children: [
                    // "dereferenced" - black, lowercase, Literata style
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '20px',
                          fontWeight: 600,
                          color: '#1A1A1A',
                          letterSpacing: '0.02em',
                          marginBottom: '24px',
                        },
                        children: 'dereferenced',
                      },
                    },
                    // Bio text
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '28px',
                          fontWeight: 400,
                          color: '#1A1A1A',
                          lineHeight: 1.4,
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        },
                        children: "I'm Akshay Manglik, an Applied AI Engineer at Scale AI.",
                      },
                    },
                    // Second paragraph
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '22px',
                          fontWeight: 400,
                          color: '#4A4A4A',
                          lineHeight: 1.5,
                          marginTop: '16px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        },
                        children: 'I graduated from Columbia University in 2025 with a B.A. in Computer Science and Economics, and a minor in Mathematics.',
                      },
                    },
                  ],
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
