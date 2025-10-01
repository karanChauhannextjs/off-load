import fs from 'node:fs/promises';
import express from 'express';
import axios from 'axios';

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const base = process.env.BASE || '/';
// SEO defaults
const seoDefaults = {
  siteName: 'Offload',
  twitterSite: '@offloadweb',
  defaultDescription: 'Check out this therapy tool.',
  defaultImage: '/vite.svg',
};

/**
 * Escapes HTML entities for safe insertion into tags
 * @param {string} value
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- Small string utils ----------
function stripHtmlTags(str) {
  return str.replace(/<[^>]*>/g, '');
}

// ---------- Generic SSR API helpers ----------
const API_TIMEOUT_MS = 2500;
const API_BASE = process.env.VITE_APP_API_URL || process.env.APP_API_URL || '';

async function fetchFromApi(path, options = {}) {
  if (!API_BASE) return null;
  try {
    const url = `${API_BASE}${path}`;
    const res = await axios.get(url, { timeout: API_TIMEOUT_MS, ...options });
    const data = res?.data;
    return typeof data?.result !== 'undefined' ? data.result : data ?? null;
  } catch (err) {
    console.log('SSR API error:', path, err?.message || err);
    return null;
  }
}

/**
 * Very small route meta resolver. Extend as needed.
 * @param {string} pathname full pathname like "/products/123"
 * @returns {{title:string, description:string, image?:string, imageAlt?:string, imageWidth?:number, imageHeight?:number, type?:string}}
 */
async function resolveRouteMeta(pathname) {
  // Normalize trailing slash handling
  const path = pathname.split('?')[0].split('#')[0];

  if (path.startsWith('/exercise/')) {
    const uuid = path.split('/')[2] || '';

    const exerciseData = await fetchFromApi(`/user/exercise/${uuid}`);
    const title = exerciseData?.name || '';
    const description = exerciseData?.intro
      ? stripHtmlTags(exerciseData.intro)
      : '';
    const image = exerciseData?.image || '';
    const imageWidth = exerciseData?.imageWidth || 1200;
    const imageHeight = exerciseData?.imageHeight || 630;

    return {
      title: title
        ? `${title} · ${seoDefaults.siteName}`
        : `Exercise · ${seoDefaults.siteName}`,
      description: description || 'Explore exercise details.',
      image: image || seoDefaults.defaultImage,
      imageAlt: title || 'Exercise image',
      imageWidth,
      imageHeight,
      type: 'website',
    };
  }

  // Fallback
  return {
    title: seoDefaults.siteName,
    description: seoDefaults.defaultDescription,
    image: seoDefaults.defaultImage,
    imageAlt: 'Site preview image',
    imageWidth: 1200,
    imageHeight: 630,
    type: 'website',
  };
}

/**
 * Build head tags string from meta and request context
 * @param {{title:string, description:string, image?:string, imageAlt?:string, imageWidth?:number, imageHeight?:number, type?:string}} meta
 * @param {{origin:string, url:string}} ctx
 */
function buildHead(meta, ctx) {
  const title = escapeHtml(meta.title || seoDefaults.siteName);
  const description = escapeHtml(
    meta.description || seoDefaults.defaultDescription,
  );
  const image = meta.image || seoDefaults.defaultImage;
  const absoluteImage = image?.startsWith('http')
    ? image
    : `${ctx.origin}${image}`;
  const type = meta.type || 'website';
  const canonical = `${ctx.origin}${ctx.url}`;
  const imageAlt = escapeHtml(meta.imageAlt || title);
  const imageWidth = meta.imageWidth || 1200;
  const imageHeight = meta.imageHeight || 630;

  return [
    `<title>${title}</title>`,
    `<meta name="description"  content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    // Open Graph
    `<meta property="og:site_name" content="${escapeHtml(seoDefaults.siteName)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:type" content="${escapeHtml(type)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    image ? `<meta property="og:image" content="${absoluteImage}" />` : '',
    image ? `<meta property="og:image:alt" content="${imageAlt}" />` : '',
    imageWidth
      ? `<meta property="og:image:width" content="${imageWidth}" />`
      : '',
    imageHeight
      ? `<meta property="og:image:height" content="${imageHeight}" />`
      : '',
    // Twitter
    `<meta name="twitter:card" content="summary_large_image" />`,
    seoDefaults.twitterSite
      ? `<meta name="twitter:site" content="${escapeHtml(seoDefaults.twitterSite)}" />`
      : '',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    image ? `<meta name="twitter:image" content="${absoluteImage}" />` : '',
    image ? `<meta name="twitter:image:alt" content="${imageAlt}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ');
}

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : '';

// Create http server
export const app = express();

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite;
if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

// Serve HTML (catch-all)
app.get(/.*/, async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');
    const fullUrl = req.originalUrl;
    const origin = `${req.protocol}://${req.get('host')}`;
    /** @type {string} */
    let template;
    /** @type {import('./src/entry-server.ts').render} */
    let render;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = templateHtml;
      render = (await import('./dist/server/entry-server.js')).render;
    }

    const rendered = await render(url);

    // Compute dynamic head tags based on route
    const routeMeta = await resolveRouteMeta(fullUrl);
    const head = buildHead(routeMeta, { origin, url: fullUrl });
    console.log(template, 'template');
    console.log(
      template.match('/(<!--app-head-->)([sS]*?)(<!--app-head-end-->)/'),
      'templatetemplatetemplate',
    );

    const headRegex = /(<!--app-head-->)([\s\S]*?)(<!--app-head-end-->)/;
    const match = template.match(headRegex);
    console.log(match, 'template match result');

    const html = template
      .replace(
        headRegex, // Use the same regex variable
        (match, start, oldContent, end) => {
          console.log('Replacing content...');
          console.log('Old content:', oldContent);
          console.log('New head:', head);
          return `${start}\n${rendered.head ?? ''}\n    ${head}\n    ${end}`;
        },
      )
      .replace(`<!--app-html-->`, rendered.html ?? '');
    console.log(html, 'htmlhtml');
    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

// app.listen is started from startServer.js for local/dev usage
