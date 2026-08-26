import type { MetadataRoute } from 'next';

const ROUTES = [
  '',
  '/image-to-pixel-art',
  '/minecraft-pixel-art',
  '/image-to-minecraft-pixel-art',
  '/minecraft-pixel-art-generator',
  '/minecraft-pixel-art-maker',
  '/minecraft-pixel-art-converter',
  '/jpg-to-pixel-art',
  '/png-to-pixel-art',
  '/webp-to-pixel-art',
  '/photo-to-pixel-art',
  '/picture-to-pixel-art',
  '/pixel-art-converter',
];

// 站点级最后更新日期。每次内容更新后手动 bump。
// 之前用 new Date() 让 lastmod 每次 build 都变 → Google 学会忽略该字段;
// 改成固定日期让 Google 能正确判断页面新鲜度。
const LAST_UPDATED = '2026-08-26';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pixvael.com';
  const lastModified = new Date(LAST_UPDATED);
  return ROUTES.map((r) => ({
    url: `${base}${r}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: r === '' ? 1 : 0.8,
  }));
}
