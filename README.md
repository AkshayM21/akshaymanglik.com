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
| Comments | [Remark42](https://remark42.com) (self-hosted) — [custom theme repo](https://github.com/AkshayM21/remark42-dereferenced) |
| Newsletter | [Kit](https://kit.com) (formerly ConvertKit) |
| Newsletter Backup | Firebase Firestore (stores subscribers for redundancy) |
| Hosting | Vercel (hybrid SSR) + Railway (comments) |
| OG Images | [@vercel/og](https://vercel.com/docs/functions/og-image-generation) dynamic generation |

## Notable Features

- **Soft Neobrutalism Design**: Offset shadows, crisp borders, warm cream palette (#FAF8F5)
- **Distill-style Sidenotes**: Margin notes on desktop, toggleable on mobile
- **Footnote Tooltips**: Hover to preview, collected at article end
- **Post Card Hover**: Pop-out effect with shadow animation
- **Table of Contents**: Auto-generated with scroll spy
- **RSS Feed**: Styled XML with custom XSL stylesheet
- **OG Images**: Auto-generated for each post, about page, and blog index with neobrutalist styling
- **Newsletter**: Embedded subscribe form with Kit integration

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

## Replicating This Blog

If you want to use this as a template for your own blog, follow these steps:

### 1. Clone and Configure

```bash
git clone https://github.com/AkshayM21/akshaymanglik.com.git my-blog
cd my-blog
npm install
```

Update these files with your own information:
- `astro.config.mjs`: Change `site` to your domain
- `src/pages/about.astro`: Your bio and photo
- `src/content/blog/`: Replace with your posts
- `public/assets/`: Replace profile photos and assets

### 2. Vercel Deployment

1. Push code to GitHub
2. Connect repo to Vercel: https://vercel.com/new
3. Settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add domains in Vercel dashboard:
   - `yourdomain.com`
   - `blog.yourdomain.com` (optional alias)

### 3. DNS Configuration

At your domain registrar, add these records:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` (or IP from Vercel dashboard) |
| CNAME | blog | `cname.vercel-dns.com` |
| CNAME | comments | `[railway-cname]` |

### 4. Remark42 Comments (Self-Hosted)

For the custom-themed Remark42 setup, see [remark42-dereferenced](https://github.com/AkshayM21/remark42-dereferenced).

**Railway Setup:**

1. Create new project at https://railway.app
2. Deploy from Docker image: `umputun/remark42:latest`
3. Add environment variables:
   ```
   REMARK_URL=https://comments.yourdomain.com
   SECRET=<generate-with-openssl-rand-base64-32>
   SITE=dereferenced
   ```
4. Add 1GB persistent volume mounted at `/srv/var`
5. Generate domain in Railway settings
6. Add CNAME record pointing to Railway domain

**Custom CSS Theme:**

Mount the custom CSS from the [remark42-dereferenced](https://github.com/AkshayM21/remark42-dereferenced) repo as a Docker volume to style comments to match the blog.

### 5. OAuth Setup for Comments

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `https://comments.yourdomain.com/auth/google/callback`
4. Add to Railway env vars:
   ```
   AUTH_GOOGLE_CID=<client-id>
   AUTH_GOOGLE_CSEC=<client-secret>
   ```

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Authorization callback URL: `https://comments.yourdomain.com/auth/github/callback`
4. Add to Railway env vars:
   ```
   AUTH_GITHUB_CID=<client-id>
   AUTH_GITHUB_CSEC=<client-secret>
   ```

#### Twitter/X OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create project and app
3. Enable OAuth 2.0
4. Callback URL: `https://comments.yourdomain.com/auth/twitter/callback`
5. Add to Railway env vars:
   ```
   AUTH_TWITTER_CID=<client-id>
   AUTH_TWITTER_CSEC=<client-secret>
   ```

### 6. Newsletter Setup (Kit)

1. Create account at [Kit](https://kit.com) (formerly ConvertKit)
2. Create a form for newsletter signups
3. Get your form ID from the form embed code
4. Add environment variables:
   ```
   KIT_API_KEY=<your-api-key>
   KIT_FORM_ID=<your-form-id>
   ```

**Optional: Firebase Backup**

For subscriber redundancy:
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Generate service account key (Project Settings > Service Accounts)
4. Add to environment:
   ```
   FIREBASE_SERVICE_ACCOUNT=<base64-encoded-service-account-json>
   ```

### 7. Admin Setup

After logging in with OAuth on Remark42, find your user ID in the browser console or Remark42 logs, then add:

```
ADMIN_SHARED_ID=google_<your-numeric-id>
```

### 8. Environment Variables for Astro

Create `.env.local` (copy from `.env.example`):

```
PUBLIC_REMARK42_HOST=https://comments.yourdomain.com
PUBLIC_REMARK42_SITE_ID=dereferenced
KIT_API_KEY=<your-kit-api-key>
KIT_FORM_ID=<your-kit-form-id>
```

### 9. Verification Checklist

- [ ] Site loads at yourdomain.com
- [ ] `/dereferenced` shows blog index
- [ ] `/blog/*` rewrites work
- [ ] Comments load on articles
- [ ] OAuth login works (all 3 providers)
- [ ] Newsletter signup works
- [ ] RSS feed validates at `/rss.xml`
- [ ] OG images generate at `/og/[slug].png`, `/og/about.png`, `/og/dereferenced.png`
- [ ] All tests pass (`npm test`)

---

## Project Structure

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
│   ├── api/            # Newsletter subscribe endpoint
│   ├── dereferenced/   # Blog index + [...slug].astro
│   ├── og/             # OG image generation (about, dereferenced, [slug])
│   ├── about.astro
│   ├── index.astro     # Redirects to /about
│   └── rss.xml.ts
├── content/blog/       # MDX posts
└── styles/global.css   # Design tokens + component styles
```

## Related Repositories

- [remark42-dereferenced](https://github.com/AkshayM21/remark42-dereferenced) — Custom CSS theme for Remark42 comments

## License

Content is copyright Akshay Manglik. Code is MIT.
