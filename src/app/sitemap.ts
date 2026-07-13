import type { MetadataRoute } from 'next';

const ROUTES = [
  '',
  '/minecraft-pixel-art',
  '/image-to-minecraft-pixel-art',
  '/minecraft-pixel-art-maker',
  '/minecraft-pixel-art-converter',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pixvael.com';
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${base}${r}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: r === '' ? 1 : 0.8,
  }));
}
