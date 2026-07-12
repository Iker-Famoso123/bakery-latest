import type { APIRoute } from 'astro';
import { getPosts, getProducts, safe } from '../lib/api';

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://reposteriafamoso.com/').replace(/\/$/, '');

  const [posts, products] = await Promise.all([
    safe(getPosts(1, 500), { items: [], total: 0, page: 1, limit: 500 }),
    safe(getProducts(), []),
  ]);

  const paths = [
    '/',
    '/blog',
    '/menu',
    '/nosotros',
    ...posts.items.map((p) => `/blog/${p.slug}`),
    ...products.map((p) => `/menu/${p.slug}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${base}${path}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
