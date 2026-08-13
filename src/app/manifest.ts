import type { MetadataRoute } from 'next';

// PWA Web App Manifest。favicon / icon / apple-icon 走 app 目录文件约定,
// 这里只管「添加到主屏 / 安装为应用」所需的元数据与启动图标(android-chrome)。
// theme_color / background_color 用站点深色背景,与 logo 深色底一致,避免白屏闪烁。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pixvael',
    short_name: 'Pixvael',
    description:
      'Free image to pixel art converter. Turn any photo into pixel art online — no signup, no upload.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0c',
    theme_color: '#0a0a0c',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
