# Dereferenced

[![Tests](https://github.com/AkshayM21/akshaymanglik.com/actions/workflows/test.yml/badge.svg)](https://github.com/AkshayM21/akshaymanglik.com/actions/workflows/test.yml)

Personal blog by Akshay Manglik. Built with Astro.

Visit at [akshaymanglik.com](https://akshaymanglik.com)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Astro 5](https://astro.build) with MDX |
| Styling | Custom CSS (soft neobrutalism) |
| Fonts | [Literata](https://fonts.google.com/specimen/Literata) (display) + [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) (body) |
| Math | KaTeX via remark-math/rehype-katex |
| Code | Shiki syntax highlighting |
| Comments | [Remark42](https://remark42.com) (self-hosted) |
| Hosting | Vercel (static) + Railway (comments) |
| OG Images | [@vercel/og](https://vercel.com/docs/functions/og-image-generation) dynamic generation |

## Notable Features

- **Soft Neobrutalism Design**: Offset shadows, crisp borders, warm cream palette (#FAF8F5)
- **Distill-style Sidenotes**: Margin notes on desktop, toggleable on mobile
- **Footnote Tooltips**: Hover to preview, collected at article end
- **Logo Animation**: Transitions from "dereferenced" to `*` on scroll
- **Post Card Hover**: Pop-out effect with shadow animation
- **Table of Contents**: Auto-generated with scroll spy
- **RSS Feed**: Styled XML with custom XSL stylesheet
- **OG Images**: Auto-generated for each post with neobrutalist styling

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Generate newsletter preview
npm run newsletter <slug>
```

---

## Manual Setup Instructions

### 1. Vercel Deployment

1. Push code to GitHub
2. Connect repo to Vercel: https://vercel.com/new
3. Settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add domains in Vercel dashboard:
   - `akshaymanglik.com`
   - `blog.akshaymanglik.com`
   - `dereferenced.akshaymanglik.com`

### 2. DNS Configuration

At your domain registrar, add these records:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | blog | `cname.vercel-dns.com` |
| CNAME | dereferenced | `cname.vercel-dns.com` |
| CNAME | comments | `[railway-cname]` |

### 3. Remark42 on Railway

1. Create new project at https://railway.app
2. Deploy from Docker image: `umputun/remark42:latest`
3. Add environment variables:
   ```
   REMARK_URL=https://comments.akshaymanglik.com
   SECRET=<generate-with-openssl-rand-base64-32>
   SITE=dereferenced
   ```
4. Add 1GB persistent volume mounted at `/srv/var`
5. Generate domain in Railway settings
6. Add CNAME record pointing to Railway domain

### 4. OAuth Setup for Comments

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `https://comments.akshaymanglik.com/auth/google/callback`
4. Add to Railway env vars:
   ```
   AUTH_GOOGLE_CID=<client-id>
   AUTH_GOOGLE_CSEC=<client-secret>
   ```

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Authorization callback URL: `https://comments.akshaymanglik.com/auth/github/callback`
4. Add to Railway env vars:
   ```
   AUTH_GITHUB_CID=<client-id>
   AUTH_GITHUB_CSEC=<client-secret>
   ```

#### Twitter/X OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create project and app
3. Enable OAuth 2.0
4. Callback URL: `https://comments.akshaymanglik.com/auth/twitter/callback`
5. Add to Railway env vars:
   ```
   AUTH_TWITTER_CID=<client-id>
   AUTH_TWITTER_CSEC=<client-secret>
   ```

### 5. Admin Setup

After logging in with OAuth, find your user ID in the browser console or Remark42 logs, then add:

```
ADMIN_SHARED_ID=google_<your-numeric-id>
```

### 6. Environment Variables for Astro

Create `.env.local` (copy from `.env.example`):

```
PUBLIC_REMARK42_HOST=https://comments.akshaymanglik.com
PUBLIC_REMARK42_SITE_ID=dereferenced
```

### 7. Verification Checklist

- [ ] Site loads at akshaymanglik.com
- [ ] `/dereferenced` shows blog index
- [ ] `/blog/*` rewrites work
- [ ] Comments load on articles
- [ ] OAuth login works (all 3 providers)
- [ ] RSS feed validates at `/rss.xml`
- [ ] OG images generate at `/og/[slug].png`
- [ ] All tests pass (`npm test`)

---

## Project Structure

```
src/
├── components/
│   ├── global/         # Header, Footer, Card
│   ├── blog/           # PostCard, TOC
│   ├── mdx/            # Sidenote, Footnote, Callout, Figure
│   └── comments/       # Remark42
├── layouts/            # BaseLayout, BlogLayout
├── pages/
│   ├── dereferenced/   # Blog index + [...slug].astro
│   ├── og/             # OG image generation
│   ├── about.astro
│   └── rss.xml.ts
├── content/blog/       # MDX posts
└── styles/global.css   # Design tokens + component styles
```

## License

Content is copyright Akshay Manglik. Code is MIT.
