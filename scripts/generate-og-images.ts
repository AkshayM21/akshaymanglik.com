/**
 * Generate OG images using Playwright
 *
 * Usage: npx tsx scripts/generate-og-images.ts
 *
 * Uses the exact CSS from public/assets/profile-pics/test.html
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

// OG image dimensions (standard)
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Exact CSS from test.html
const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600;7..72,700&display=swap');

  :root {
    --color-bg: #FAF8F5;
    --color-card: #FFFFFF;
    --color-border: #1A1A1A;
    --color-accent: #DC2626;
    --color-text-primary: #1A1A1A;
    --color-text-secondary: #4A4A4A;
    --color-text-muted: #6B6B6B;
    --color-title-card-bg: #EDEBE8;

    --font-display: 'Literata', Georgia, serif;
    --font-body: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;

    --border: 1px solid var(--color-border);
    --shadow: 4px 4px 0 var(--color-border);
    --radius-md: 12px;
    --radius-lg: 16px;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }

  .og-container {
    width: ${OG_WIDTH}px;
    height: ${OG_HEIGHT}px;
    background: var(--color-bg);
    position: relative;
    overflow: hidden;
  }
`;

// Blog post data
interface PostData {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  category: string;
}

// Get blog posts from content directory
function getBlogPosts(): PostData[] {
  const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx'));

  const posts: PostData[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const { data } = matter(content);

    if (data.draft) continue;

    posts.push({
      slug: file.replace('.mdx', ''),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.pubDate),
      category: data.category,
    });
  }

  // Sort by date descending
  posts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return posts;
}

// Calculate read time
function calculateReadTime(slug: string): number {
  const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
  const content = fs.readFileSync(path.join(blogDir, `${slug}.mdx`), 'utf-8');
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Format date as "December 25, 2025"
function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format date as "December 2025"
function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// Article OG template - exact CSS from test.html
function renderArticleOG(post: PostData): string {
  const readTime = calculateReadTime(post.slug);
  const dateStr = formatDateLong(post.pubDate);

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    ${SHARED_STYLES}

    .og-article {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }

    .og-article__card {
      background: var(--color-title-card-bg);
      border: var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 56px 64px;
      max-width: 1000px;
      width: 100%;
    }

    .og-article__meta {
      font-family: var(--font-body);
      font-size: 16px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      margin-bottom: 16px;
    }

    .og-article__title {
      font-family: var(--font-display);
      font-size: 56px;
      font-weight: 700;
      line-height: 1.15;
      color: var(--color-text-primary);
      margin-bottom: 20px;
    }

    .og-article__subtitle {
      font-family: var(--font-body);
      font-size: 24px;
      line-height: 1.5;
      color: var(--color-text-secondary);
    }

    .og-article__branding {
      position: absolute;
      bottom: 32px;
      right: 60px;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text-muted);
    }
  </style>
</head>
<body>
  <div class="og-container og-article">
    <div class="og-article__card">
      <div class="og-article__meta">${dateStr} · ${post.category} · ${readTime} min read</div>
      <h1 class="og-article__title">${post.title}</h1>
      <p class="og-article__subtitle">${post.description}</p>
    </div>
    <div class="og-article__branding">dereferenced</div>
  </div>
</body>
</html>`;
}

// About OG template - exact CSS from test.html
function renderAboutOG(): string {
  const photoPath = path.join(process.cwd(), 'public', 'assets', 'profile-pics', 'pfp.jpeg');
  const photoBase64 = fs.readFileSync(photoPath).toString('base64');
  const photoDataUrl = `data:image/jpeg;base64,${photoBase64}`;

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    ${SHARED_STYLES}

    .og-about {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }

    .og-about__card {
      background: var(--color-card);
      border: var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 48px 56px;
      display: flex;
      gap: 40px;
      align-items: flex-start;
      max-width: 920px;
    }

    .og-about__photo {
      width: 180px;
      height: 180px;
      border: var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow);
      object-fit: cover;
      flex-shrink: 0;
    }

    .og-about__content {
      flex: 1;
    }

    .og-about__intro {
      font-family: var(--font-body);
      font-size: 26px;
      line-height: 1.5;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
    }

    .og-about__intro strong {
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .og-about__intro a {
      color: var(--color-accent);
      text-decoration: none;
    }

    .og-about__paragraph {
      font-family: var(--font-body);
      font-size: 22px;
      line-height: 1.6;
      color: var(--color-text-secondary);
      margin-bottom: 16px;
    }

    .og-about__branding {
      position: absolute;
      bottom: 32px;
      left: 60px;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text-muted);
    }
  </style>
</head>
<body>
  <div class="og-container og-about">
    <div class="og-about__card">
      <img src="${photoDataUrl}" alt="Akshay Manglik" class="og-about__photo">
      <div class="og-about__content">
        <p class="og-about__intro">
          I'm <strong>Akshay Manglik</strong>, an Applied AI Engineer at <a href="#">Scale AI</a> on the Enterprise ML team.
        </p>
        <p class="og-about__paragraph">
          I graduated from Columbia University in 2025 with a B.A. in Computer Science and Economics, and a minor in Mathematics.
        </p>
        <p class="og-about__paragraph">
          I'm interested in designing adaptive systems capable of learning and self-correcting over time, with minimal human intervention.
        </p>
      </div>
    </div>
    <div class="og-about__branding">dereferenced</div>
  </div>
</body>
</html>`;
}

// Blog list OG template - exact CSS from test.html
function renderBlogListOG(posts: PostData[]): string {
  const recentPosts = posts.slice(0, 2);

  const postCards = recentPosts.map(post => `
    <article class="og-blog-list__post">
      <div class="og-blog-list__meta">${formatDateShort(post.pubDate)} · ${post.category}</div>
      <h2 class="og-blog-list__title">${post.title}</h2>
      <p class="og-blog-list__excerpt">${post.description}</p>
    </article>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    ${SHARED_STYLES}

    .og-blog-list {
      display: flex;
      flex-direction: column;
    }

    .og-blog-list__wrapper {
      background: var(--color-card);
      border: var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      margin: 40px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .og-blog-list__nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 32px;
      border-bottom: var(--border);
    }

    .og-blog-list__logo {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .og-blog-list__links {
      display: flex;
      gap: 32px;
    }

    .og-blog-list__links span {
      font-family: var(--font-body);
      font-size: 18px;
      color: var(--color-text-secondary);
    }

    .og-blog-list__posts {
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
    }

    .og-blog-list__post {
      background: var(--color-card);
      border: var(--border);
      border-radius: var(--radius-md);
      padding: 24px 28px;
    }

    .og-blog-list__meta {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: var(--color-text-muted);
      margin-bottom: 6px;
    }

    .og-blog-list__title {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }

    .og-blog-list__excerpt {
      font-family: var(--font-body);
      font-size: 17px;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="og-container og-blog-list">
    <div class="og-blog-list__wrapper">
      <nav class="og-blog-list__nav">
        <div class="og-blog-list__logo">dereferenced</div>
        <div class="og-blog-list__links">
          <span>writing</span>
          <span>about</span>
        </div>
      </nav>
      <div class="og-blog-list__posts">
        ${postCards}
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('Generating OG images with Playwright...\n');

  // Ensure output directory exists
  const ogDir = path.join(process.cwd(), 'public', 'og');
  if (!fs.existsSync(ogDir)) {
    fs.mkdirSync(ogDir, { recursive: true });
  }

  // Get blog posts
  const posts = getBlogPosts();
  console.log(`Found ${posts.length} blog posts\n`);

  // Launch browser
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: OG_WIDTH, height: OG_HEIGHT });

  let generated = 0;

  // Generate article OG images
  for (const post of posts) {
    const html = renderArticleOG(post);
    await page.setContent(html, { waitUntil: 'networkidle' });

    const outputPath = path.join(ogDir, `${post.slug}.png`);
    await page.screenshot({ path: outputPath });

    console.log(`  ✓ ${post.slug}.png`);
    generated++;
  }

  // Generate about page OG
  const aboutHtml = renderAboutOG();
  await page.setContent(aboutHtml, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ogDir, 'index.png') });
  console.log(`  ✓ index.png (about page)`);
  generated++;

  // Generate blog list OG
  const blogListHtml = renderBlogListOG(posts);
  await page.setContent(blogListHtml, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ogDir, 'dereferenced.png') });
  console.log(`  ✓ dereferenced.png (blog list)`);
  generated++;

  await browser.close();

  console.log(`\nDone! Generated ${generated} OG images in public/og/`);
}

main().catch(console.error);
