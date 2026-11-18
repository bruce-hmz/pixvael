// 跨工具携带源图:上传后把缩小的源图存进 sessionStorage,
// 同一标签页里打开 Minecraft 系页面时自动恢复。
// 从 PixelConverter.tsx 拆出,供新版转换器(PixelStudio)共用。

export const SESSION_IMAGE_KEY = 'pixvael:source-image';
export const SESSION_IMAGE_ID_KEY = 'pixvael:source-image-id';

export function rememberImageForMinecraftMode(
  image: HTMLImageElement,
  sourceId: string,
) {
  const maxDimension = 1024;
  const scale = Math.min(
    1,
    maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const encodedImage = canvas.toDataURL('image/png');
  try {
    sessionStorage.setItem(SESSION_IMAGE_KEY, encodedImage);
    sessionStorage.setItem(SESSION_IMAGE_ID_KEY, sourceId);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return encodedImage;
    }
    throw error;
  }
  return encodedImage;
}
