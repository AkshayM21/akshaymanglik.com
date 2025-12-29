# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dereferenced** is a personal blog by Akshay Manglik, built with Astro and deployed to Vercel. The design uses a "soft neobrutalism" aesthetic with Distill-style features like sidenotes and math rendering.

## Build & Development

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Generate newsletter markdown for a post
npm run newsletter <slug>
```

## Architecture

### Project Structure

```
src/
├── components/
│   ├── global/         # Header, Footer, Card
│   ├── blog/           # PostCard, TOC
│   ├── mdx/            # Sidenote, Footnote, Callout, Figure
│   ├── newsletter/     # NewsletterCard, InlineSubscribe
│   └── comments/       # Remark42
├── layouts/            # BaseLayout, BlogLayout
├── pages/
│   ├── api/            # Newsletter subscribe, webhooks
│   ├── dereferenced/   # Blog index + [...slug].astro
│   ├── og/             # OG image generation (about, dereferenced, [slug])
│   ├── about.astro
│   ├── index.astro     # Redirects to /about
│   └── rss.xml.ts
├── content/blog/       # MDX posts
└── styles/global.css   # Design tokens + component styles
```

### Content Collection

Blog posts live in `src/content/blog/` as MDX files with frontmatter:

```yaml
---
title: "Post Title"
description: "A brief description"
pubDate: 2025-01-15
category: "Machine Learning"
tags: ["tag1", "tag2"]
draft: false  # Optional, hides from index if true
---
```

### MDX Components

Import and use in blog posts:

```mdx
import Callout from '@/components/mdx/Callout.astro';
import Sidenote from '@/components/mdx/Sidenote.astro';
import Footnote from '@/components/mdx/Footnote.astro';
import Figure from '@/components/mdx/Figure.astro';

<Callout type="note">
Important information here.
</Callout>

Text with a sidenote<Sidenote id="sn1">This appears in the margin on desktop.</Sidenote>

Text with a footnote<Footnote id="1">This shows on hover and in the footnotes section.</Footnote>

<Figure src="/path/to/image.png" alt="Description" caption="Figure caption" fullWidth />
```

**Math**: Use `$inline$` or `$$display$$` syntax. KaTeX is configured automatically.

## Design System

### Colors

```css
--color-bg: #FAF8F5;           /* Warm cream background */
--color-card: #FFFFFF;         /* White cards */
--color-border: #1A1A1A;       /* Black borders */
--color-accent: #DC2626;       /* Crimson accent */
--color-accent-hover: #B91C1C; /* Darker crimson */
--color-text-primary: #1A1A1A;
--color-text-secondary: #4A4A4A;
--color-text-muted: #6B6B6B;
```

### Typography

- **Display**: Literata (headings)
- **Body**: IBM Plex Sans (prose)
- **Mono**: IBM Plex Mono (code)

### Key Visual Elements

- **Cards**: White background, 1px black border, 3px offset shadow, 14px radius
- **Callouts**: Cream background, no shadow (flat for hierarchy)
- **Post cards**: Hover effect with `translate(-2px, -2px)` + shadow pop-out
- **Logo**: "dereferenced" text with "Ideas, traced to source" tooltip on hover (desktop only)

## URL Structure

- `/dereferenced/` - Blog index
- `/dereferenced/<slug>/` - Individual posts
- `/blog/*` - Rewrites to `/dereferenced/*` (via vercel.json)
- `/about` - About page
- `/rss.xml` - RSS feed
- `/og/<slug>.png` - Generated OG images for posts
- `/og/about.png` - OG image for about page
- `/og/dereferenced.png` - OG image for blog index

## OG Image Generation

Dynamic OG images are generated using `@vercel/og` (Satori). Located in `src/pages/og/`:

| File | Purpose |
|------|---------|
| `[...slug].png.ts` | Blog post OG - shows "dereferenced", date, category, title, description |
| `about.png.ts` | About page OG - profile photo with bio text side-by-side |
| `dereferenced.png.ts` | Blog index OG - shows 2 most recent post titles as mini cards |

All OG images use neobrutalist styling with black borders, offset shadows, and the cream/white color palette.

## Comments (Remark42)

Comments use Remark42 self-hosted on Railway.app. Configure via environment variables:

```bash
PUBLIC_REMARK42_HOST=https://comments.yourdomain.com
PUBLIC_REMARK42_SITE_ID=dereferenced
```

The Remark42.astro component injects custom CSS to match the design system.

**Custom CSS Theme**: See [remark42-dereferenced](https://github.com/AkshayM21/remark42-dereferenced) for the custom CSS that styles Remark42 to match the blog's neobrutalist aesthetic.

## Newsletter (Kit + Firebase)

Newsletter signups use Kit (ConvertKit) for email delivery with Firebase Firestore as a backup database.

### Environment Variables

```bash
# Kit API (v4 key for subscriptions, v3 secret for webhooks)
KIT_API_KEY=kit_xxxxx
KIT_API_SECRET=xxxxx
KIT_WEBHOOK_SECRET=your-random-secret

# Firebase Service Account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Firestore Database (production mode, us-central1)
3. Go to Project Settings → Service Accounts → Generate new private key
4. Copy values from downloaded JSON to environment variables

### Kit Webhook Setup

After deploying, create the unsubscribe webhook:

```bash
curl -X POST https://api.convertkit.com/v3/automations/hooks \
  -H 'Content-Type: application/json' \
  -d '{
    "api_secret": "<KIT_API_SECRET>",
    "target_url": "https://yourdomain.com/api/webhooks/kit?secret=<KIT_WEBHOOK_SECRET>",
    "event": { "name": "subscriber.subscriber_unsubscribe" }
  }'
```

### API Routes

- `POST /api/subscribe` - Subscribe a new user (saves to Firebase + Kit)
- `POST /api/webhooks/kit?secret=xxx` - Webhook for Kit unsubscribe events

## Deployment

Deploy to Vercel with the Astro adapter (`output: 'hybrid'` for serverless API routes). The `vercel.json` handles:
- `/blog/*` → `/dereferenced/*` rewrites
- RSS feed headers
- Security headers

### DNS (to configure at registrar)

```
A     yourdomain.com        76.76.21.21 (or IP from Vercel dashboard)
CNAME blog.yourdomain.com   cname.vercel-dns.com
CNAME comments.yourdomain.com  <railway-cname>
```

## Article Layout Architecture

The blog layout uses a CSS Grid system for sidebar content:

```
┌─────────────────────────────────────────────────────┐
│  Header (full width)                                │
├──────────┬────────────────────────┬─────────────────┤
│   Left   │      Main Content      │   Right Gutter  │
│  Margin  │    (article text)      │  (TOC + notes)  │
│   (1fr)  │     (max 680px)        │   (180-260px)   │
└──────────┴────────────────────────┴─────────────────┘
```

- **Desktop (≥768px)**: Three-column grid with sticky TOC and sidenotes in gutter
- **Mobile (<768px)**: Single column with collapsible TOC and toggleable sidenotes
- **Footnotes**: Dynamically collected and rendered at article bottom via JS

## Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui
```

Tests use Playwright and cover:
- Build verification (pages, sitemap, RSS, OG images)
- Content rendering (MDX components, math, code highlighting)
- Navigation (routing, scroll behavior)
- SEO (meta tags, canonical URLs)

## CI/CD

GitHub Actions workflow (`.github/workflows/test.yml`) runs on push and PR:
- Builds the site
- Runs all Playwright tests
- Uploads test report artifacts

## Related Repositories

- [remark42-dereferenced](https://github.com/AkshayM21/remark42-dereferenced) — Custom CSS theme for Remark42 comments matching the blog's neobrutalist design

## Files Reference

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro + MDX + math plugins, hybrid output mode |
| `src/styles/global.css` | All design tokens and component styles |
| `src/layouts/BlogLayout.astro` | Article page with grid layout, TOC, footnotes |
| `src/components/mdx/Sidenote.astro` | Margin notes (gutter on desktop, toggle on mobile) |
| `src/components/mdx/Footnote.astro` | Footnotes with hover tooltips |
| `src/pages/og/*.ts` | OG image generation endpoints |
| `src/pages/api/subscribe.ts` | Newsletter subscribe API |
| `vercel.json` | Rewrites, redirects, headers |
| `.github/workflows/test.yml` | CI/CD test workflow |
