// prerender.mjs
// Runs automatically after `vite build` (via the postbuild npm hook).
// For each known route, writes a dist/<path>/index.html with correct
// <title>, <meta>, OG tags, and JSON-LD already in <head> — so Google's
// first-pass crawl (before it runs JS) sees real metadata.
// Also regenerates dist/sitemap.xml from the live data files.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, 'dist');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `vite build` first');
  process.exit(1);
}

const { articlesData } = await import('./src/data/articlesData.js');
const { projectData } = await import('./src/data/projectData.js');

const BASE_URL = 'https://naveenkarthik.com';
const SITE_NAME = 'Naveen Karthik';
const TODAY = new Date().toISOString().slice(0, 10);

const template = readFileSync(join(DIST, 'index.html'), 'utf-8');

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml({ title, description, canonical, keywords = [], jsonLd }) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${canonical}`;

  let html = template;

  // Replace existing <title> and <meta description> from the template
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${esc(description)}" />`
  );

  const tags = [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    keywords.length ? `<meta name="keywords" content="${esc(keywords.join(', '))}" />` : '',
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(fullTitle)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '',
  ].filter(Boolean).join('\n    ');

  return html.replace('</head>', `    ${tags}\n  </head>`);
}

const sitemapEntries = [];
let count = 0;

function route(urlPath, opts, priority = '0.8', changefreq = 'monthly') {
  const segments = urlPath.replace(/^\//, '').split('/').filter(Boolean);
  const dir = segments.length ? join(DIST, ...segments) : DIST;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildHtml(opts), 'utf-8');
  sitemapEntries.push({ url: urlPath, priority, changefreq });
  count++;
}

// ── Static pages ──────────────────────────────────────────────────────────────

route('/', {
  title: `${SITE_NAME} | Frontend Developer`,
  description: 'Frontend-focused Full Stack Developer specializing in React, TypeScript, and Next.js. Building fast, data-intensive products at Tijori Finance. Based in Bangalore, India.',
  canonical: '/',
  keywords: ['Naveen Karthik', 'Frontend Developer', 'React', 'TypeScript', 'Next.js', 'Full Stack', 'Web Performance', 'Portfolio'],
}, '1.0', 'monthly');

route('/articles', {
  title: 'Articles',
  description: 'Deep dives on web performance, React, browser internals, JavaScript, and frontend architecture by Naveen Karthik.',
  canonical: '/articles',
  keywords: ['Articles', 'Web Performance', 'React', 'JavaScript', 'Browser Internals', 'Frontend Engineering'],
}, '0.9', 'weekly');

route('/projects', {
  title: 'Projects',
  description: 'A portfolio of frontend and full-stack projects by Naveen Karthik — React dashboards, performance tools, and web applications.',
  canonical: '/projects',
  keywords: ['Projects', 'React', 'Frontend', 'Portfolio', 'Web Development', 'Naveen Karthik'],
}, '0.9', 'monthly');

// ── Articles ──────────────────────────────────────────────────────────────────

for (const article of articlesData) {
  route(
    `/articles/${article.id}`,
    {
      title: article.title,
      description: article.excerpt,
      canonical: `/articles/${article.id}`,
      keywords: article.tags ?? [],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        author: { '@type': 'Person', name: SITE_NAME, url: BASE_URL },
        url: `${BASE_URL}/articles/${article.id}`,
        keywords: (article.tags ?? []).join(', '),
      },
    },
    '0.8',
    'yearly',
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────

for (const project of projectData) {
  route(
    `/projects/${project.id}`,
    {
      title: project.name,
      description: project.excerpt,
      canonical: `/projects/${project.id}`,
      keywords: project.tags ?? [],
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: project.name,
        description: project.excerpt,
        author: { '@type': 'Person', name: SITE_NAME, url: BASE_URL },
        url: `${BASE_URL}/projects/${project.id}`,
        applicationCategory: 'DeveloperApplication',
        keywords: (project.tags ?? []).join(', '),
      },
    },
    '0.8',
    'monthly',
  );
}

// ── Sitemap ───────────────────────────────────────────────────────────────────

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    ({ url, priority, changefreq }) =>
      `  <url>\n    <loc>${BASE_URL}${url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>`;

writeFileSync(join(DIST, 'sitemap.xml'), sitemap, 'utf-8');

console.log(`Pre-rendered ${count} routes + sitemap.xml (${sitemapEntries.length} URLs)`);
