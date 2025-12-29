import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = true;

export const GET: APIRoute = async () => {
  // Load fonts
  const fontsDir = path.join(process.cwd(), 'public/fonts');
  const ibmPlexRegular = fs.readFileSync(path.join(fontsDir, 'IBMPlexSans-Regular.ttf'));
  const ibmPlexSemiBold = fs.readFileSync(path.join(fontsDir, 'IBMPlexSans-SemiBold.ttf'));
  const literataSemiBold = fs.readFileSync(path.join(fontsDir, 'Literata-SemiBold.ttf'));

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
        padding: '32px',
        fontFamily: 'IBM Plex Sans, sans-serif',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              border: '1px solid #1A1A1A',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              padding: '40px',
              boxShadow: '3px 3px 0 #1A1A1A',
              gap: '40px',
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
                                top: '3px',
                                left: '3px',
                                width: '300px',
                                height: '300px',
                                backgroundColor: '#1A1A1A',
                                borderRadius: '10px',
                              },
                            },
                          },
                          // Image
                          {
                            type: 'img',
                            props: {
                              src: base64Image,
                              width: 300,
                              height: 300,
                              style: {
                                position: 'relative',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                border: '1px solid #1A1A1A',
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
                    // "dereferenced" logo
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '28px',
                          fontWeight: 600,
                          color: '#1A1A1A',
                          fontFamily: 'Literata, serif',
                          letterSpacing: '0.02em',
                          marginBottom: '20px',
                        },
                        children: 'dereferenced',
                      },
                    },
                    // Bio text
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '36px',
                          fontWeight: 400,
                          color: '#1A1A1A',
                          lineHeight: 1.3,
                          fontFamily: 'IBM Plex Sans, sans-serif',
                        },
                        children: "I'm Akshay Manglik, an Applied AI Engineer at Scale AI.",
                      },
                    },
                    // Second paragraph
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '26px',
                          fontWeight: 400,
                          color: '#4A4A4A',
                          lineHeight: 1.4,
                          marginTop: '16px',
                          fontFamily: 'IBM Plex Sans, sans-serif',
                        },
                        children: 'Columbia 2025 — CS, Economics, Math minor.',
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
    fonts: [
      { name: 'IBM Plex Sans', data: ibmPlexRegular, weight: 400 },
      { name: 'IBM Plex Sans', data: ibmPlexSemiBold, weight: 600 },
      { name: 'Literata', data: literataSemiBold, weight: 600 },
    ],
  });
};
