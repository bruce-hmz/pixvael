export type CropState = {
  aspect: 'source' | 'square' | number;
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export const DEFAULT_CROP: CropState = { aspect: 'source', zoom: 1, offsetX: 0, offsetY: 0 };

export function validateCropState(crop: CropState): CropState {
  if (!['source', 'square'].includes(String(crop.aspect)) &&
      (typeof crop.aspect !== 'number' || !Number.isFinite(crop.aspect) || crop.aspect <= 0)) {
    throw new Error(`Invalid crop aspect: ${String(crop.aspect)}`);
  }
  if (!Number.isFinite(crop.zoom) || crop.zoom < 1 || crop.zoom > 8) throw new Error(`Invalid crop zoom: ${crop.zoom}`);
  if (!Number.isFinite(crop.offsetX) || !Number.isFinite(crop.offsetY) || Math.abs(crop.offsetX) > 1 || Math.abs(crop.offsetY) > 1) {
    throw new Error('Invalid crop position.');
  }
  return { ...crop };
}

export function cropRect(sourceWidth: number, sourceHeight: number, crop: CropState): { x: number; y: number; width: number; height: number } {
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) throw new Error('Invalid source dimensions.');
  validateCropState(crop);
  const aspect = crop.aspect === 'source' ? sourceWidth / sourceHeight : crop.aspect === 'square' ? 1 : crop.aspect;
  let width = sourceWidth;
  let height = width / aspect;
  if (height > sourceHeight) { height = sourceHeight; width = height * aspect; }
  width /= crop.zoom; height /= crop.zoom;
  const x = (sourceWidth - width) / 2 + crop.offsetX * (sourceWidth - width) / 2;
  const y = (sourceHeight - height) / 2 + crop.offsetY * (sourceHeight - height) / 2;
  return { x: Math.max(0, Math.min(sourceWidth - width, x)), y: Math.max(0, Math.min(sourceHeight - height, y)), width, height };
}

export function cropFingerprint(crop: CropState): string { validateCropState(crop); return `${crop.aspect}:${crop.zoom}:${crop.offsetX}:${crop.offsetY}`; }
