// Canvas 像素化核心算法:降采样 + 调色板量化 + Floyd-Steinberg 抖动
// 纯前端,图片不上传

import type { RGB, Palette } from './palettes';

export type PixelizeOptions = {
  pixelSize: number; // 像素块大小(降采样)
  palette: Palette; // 调色板(colors 空 = 不量化)
  dither: boolean; // 是否抖动
};

type RGBA = { r: number; g: number; b: number; a: number };

function colorDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

export function nearestColor(color: RGB, colors: RGB[]): RGB {
  let nearest = colors[0];
  let minDist = Infinity;
  for (const c of colors) {
    const d = colorDistance(color, c);
    if (d < minDist) {
      minDist = d;
      nearest = c;
    }
  }
  return nearest;
}

// 降采样:每个 pixelSize×pixelSize 块按 alpha 加权取色(premultiplied),保留边缘
function downsample(
  srcData: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  pixelSize: number
): { sampled: RGBA[]; dstW: number; dstH: number } {
  // ceil 保留右侧/底部不足一块的像素(配合 sx<srcW && sy<srcH 边界)
  const dstW = Math.max(1, Math.ceil(srcW / pixelSize));
  const dstH = Math.max(1, Math.ceil(srcH / pixelSize));
  const sampled: RGBA[] = [];

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let aSum = 0;
      let count = 0;
      for (let dy = 0; dy < pixelSize; dy++) {
        for (let dx = 0; dx < pixelSize; dx++) {
          const sx = x * pixelSize + dx;
          const sy = y * pixelSize + dy;
          if (sx < srcW && sy < srcH) {
            const idx = (sy * srcW + sx) * 4;
            const a = srcData[idx + 3];
            // premultiplied alpha:按 alpha 加权 RGB,正确处理透明边缘
            rSum += srcData[idx] * a;
            gSum += srcData[idx + 1] * a;
            bSum += srcData[idx + 2] * a;
            aSum += a;
            count++;
          }
        }
      }
      sampled.push({
        r: aSum > 0 ? Math.round(rSum / aSum) : 0,
        g: aSum > 0 ? Math.round(gSum / aSum) : 0,
        b: aSum > 0 ? Math.round(bSum / aSum) : 0,
        a: count > 0 ? Math.round(aSum / count) : 255,
      });
    }
  }
  return { sampled, dstW, dstH };
}

// Floyd-Steinberg 抖动量化(只对 RGB 误差扩散,alpha 不抖动)
function quantizeDither(
  sampled: RGBA[],
  dstW: number,
  dstH: number,
  colors: RGB[]
): RGB[] {
  const buffer = sampled.map((c) => ({ ...c }));
  const output: RGB[] = new Array(sampled.length);

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const idx = y * dstW + x;
      const old = buffer[idx];
      const newColor = nearestColor({ r: old.r, g: old.g, b: old.b }, colors);
      output[idx] = newColor;

      const err = {
        r: old.r - newColor.r,
        g: old.g - newColor.g,
        b: old.b - newColor.b,
      };

      if (x + 1 < dstW) {
        const i = idx + 1;
        buffer[i].r += (err.r * 7) / 16;
        buffer[i].g += (err.g * 7) / 16;
        buffer[i].b += (err.b * 7) / 16;
      }
      if (y + 1 < dstH) {
        if (x > 0) {
          const i = idx + dstW - 1;
          buffer[i].r += (err.r * 3) / 16;
          buffer[i].g += (err.g * 3) / 16;
          buffer[i].b += (err.b * 3) / 16;
        }
        const i2 = idx + dstW;
        buffer[i2].r += (err.r * 5) / 16;
        buffer[i2].g += (err.g * 5) / 16;
        buffer[i2].b += (err.b * 5) / 16;
        if (x + 1 < dstW) {
          const i3 = idx + dstW + 1;
          buffer[i3].r += (err.r * 1) / 16;
          buffer[i3].g += (err.g * 1) / 16;
          buffer[i3].b += (err.b * 1) / 16;
        }
      }
    }
  }
  return output;
}

// 核心:输入源 ImageData + 配置,输出降采样+量化后的 ImageData
export function pixelize(
  source: ImageData,
  options: PixelizeOptions
): ImageData {
  const { pixelSize, palette, dither } = options;

  // fail fast:校验 pixelSize
  if (!Number.isInteger(pixelSize) || pixelSize <= 0) {
    throw new Error(
      `pixelize: pixelSize must be a positive integer, got ${pixelSize}`
    );
  }

  const { sampled, dstW, dstH } = downsample(
    source.data,
    source.width,
    source.height,
    pixelSize
  );

  const usePalette = palette.colors.length > 0;
  let outputRGB: RGB[];

  if (usePalette && dither) {
    outputRGB = quantizeDither(sampled, dstW, dstH, palette.colors);
  } else if (usePalette) {
    outputRGB = sampled.map((c) =>
      nearestColor({ r: c.r, g: c.g, b: c.b }, palette.colors)
    );
  } else {
    outputRGB = sampled.map((c) => ({ r: c.r, g: c.g, b: c.b }));
  }

  const outData = new Uint8ClampedArray(dstW * dstH * 4);
  for (let i = 0; i < outputRGB.length; i++) {
    const c = outputRGB[i];
    outData[i * 4] = c.r;
    outData[i * 4 + 1] = c.g;
    outData[i * 4 + 2] = c.b;
    outData[i * 4 + 3] = sampled[i].a; // 保留原始平均 alpha,不强制 255
  }
  return new ImageData(outData, dstW, dstH);
}
