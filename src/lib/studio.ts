// 已迁移到新版"工作室"设计的页面。逐页迁移:页面自身加 data-theme="studio",
// Header/Footer 按这里的列表切换成新样式。
export const STUDIO_PATHS = new Set(['/image-to-pixel-art']);

export function isStudioPath(pathname: string | null | undefined) {
  if (!pathname) return false;
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return STUDIO_PATHS.has(normalized);
}

// Logo 的 2×2 四色块,同时是栏目颜色:图片工具 / 教程 / 调色板 / Minecraft
export const BRAND_PIXELS = ['#3346f0', '#ff5b3a', '#ffc527', '#22b35e'] as const;
