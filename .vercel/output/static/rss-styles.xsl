<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> — RSS Feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&amp;family=Literata:opsz,wght@7..72,400;7..72,600&amp;display=swap" rel="stylesheet"/>
        <style>
          :root {
            --color-bg: #FAF8F5;
            --color-card: #FFFFFF;
            --color-border: #1A1A1A;
            --color-accent: #DC2626;
            --color-text: #1A1A1A;
            --color-muted: #6B6B6B;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'IBM Plex Sans', sans-serif;
            background: var(--color-bg);
            color: var(--color-text);
            padding: 2rem;
            line-height: 1.6;
          }
          .container {
            max-width: 680px;
            margin: 0 auto;
          }
          .card {
            background: var(--color-card);
            border: 1px solid var(--color-border);
            border-radius: 14px;
            box-shadow: 3px 3px 0 var(--color-border);
            padding: 2rem;
          }
          h1 {
            font-family: 'Literata', Georgia, serif;
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          .subtitle {
            color: var(--color-muted);
            margin-bottom: 2rem;
          }
          .notice {
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: 10px;
            padding: 1rem 1.25rem;
            margin-bottom: 2rem;
            font-size: 0.875rem;
          }
          .notice code {
            background: var(--color-card);
            padding: 0.1em 0.4em;
            border-radius: 4px;
            border: 1px solid #E5E5E5;
          }
          .posts { list-style: none; }
          .post {
            border-bottom: 1px solid #E5E5E5;
            padding: 1.25rem 0;
          }
          .post:last-child { border-bottom: none; }
          .post-title {
            font-family: 'Literata', Georgia, serif;
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }
          .post-title a {
            color: var(--color-text);
            text-decoration: none;
          }
          .post-title a:hover {
            color: var(--color-accent);
          }
          .post-date {
            font-size: 0.75rem;
            color: var(--color-muted);
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .post-description {
            font-size: 0.875rem;
            color: #4A4A4A;
            margin-top: 0.5rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="subtitle"><xsl:value-of select="/rss/channel/description"/></p>
            <div class="notice">
              This is an RSS feed. Copy the URL and add it to your RSS reader.
            </div>
            <ul class="posts">
              <xsl:for-each select="/rss/channel/item">
                <li class="post">
                  <div class="post-date">
                    <xsl:value-of select="pubDate"/>
                  </div>
                  <h2 class="post-title">
                    <a>
                      <xsl:attribute name="href">
                        <xsl:value-of select="link"/>
                      </xsl:attribute>
                      <xsl:value-of select="title"/>
                    </a>
                  </h2>
                  <p class="post-description">
                    <xsl:value-of select="description"/>
                  </p>
                </li>
              </xsl:for-each>
            </ul>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
