// Canvas 像素化核心算法:降采样 + 调色板量化 + Floyd-Steinberg 抖动
// 纯前端,图片不上传

import type { RGB, Palette } from './palettes';

export type PixelizeOptions = {
  pixelSize: number; // 像素块大小(降采样)
  palette: Palette; // 调色板(colors 空 = 不量化)
  dither: boolean; // 是否抖动
};

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

// 降采样中间表示:Float64Array,每像素 4 通道 (r,g,b,a) 连续。
// 用 float64 而非 float32:JS number 就是 float64,误差扩散/平均的精度与
// 原来的对象数组完全一致(行为不变),同时消除每像素一个 JS 对象的分配与
// GC 压力(大图 + 小 pixelSize 时这是真实瓶颈)。
const CHANNELS = 4;

// 降采样:每个 pixelSize×pixelSize 块按 alpha 加权取色(premultiplied),保留边缘
function downsample(
  srcData: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  pixelSize: number
): { sampled: Float64Array; dstW: number; dstH: number } {
  // ceil 保留右侧/底部不足一块的像素(配合 sx<srcW && sy<srcH 边界)
  const dstW = Math.max(1, Math.ceil(srcW / pixelSize));
  const dstH = Math.max(1, Math.ceil(srcH / pixelSize));
  const sampled = new Float64Array(dstW * dstH * CHANNELS);

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
      const out = (y * dstW + x) * CHANNELS;
      sampled[out] = aSum > 0 ? Math.round(rSum / aSum) : 0;
      sampled[out + 1] = aSum > 0 ? Math.round(gSum / aSum) : 0;
      sampled[out + 2] = aSum > 0 ? Math.round(bSum / aSum) : 0;
      sampled[out + 3] = count > 0 ? Math.round(aSum / count) : 255;
    }
  }
  return { sampled, dstW, dstH };
}

// Floyd-Steinberg 抖动量化(只对 RGB 误差扩散,alpha 不抖动)
function quantizeDither(
  sampled: Float64Array,
  dstW: number,
  dstH: number,
  colors: RGB[]
): RGB[] {
  // 误差累积会产生小数和越界值,但最近色比较对任意值都成立,
  // 最终写入 Uint8ClampedArray 时自动钳位——用"不钳位中间态 + 写回时钳位"
  // 绕开经典的溢出问题。
  const buffer = sampled.slice();
  const output: RGB[] = new Array(sampled.length / CHANNELS);

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const idx = y * dstW + x;
      const old = {
        r: buffer[idx * CHANNELS],
        g: buffer[idx * CHANNELS + 1],
        b: buffer[idx * CHANNELS + 2],
      };
      const newColor = nearestColor(old, colors);
      output[idx] = newColor;

      const err = {
        r: old.r - newColor.r,
        g: old.g - newColor.g,
        b: old.b - newColor.b,
      };

      if (x + 1 < dstW) {
        const i = (idx + 1) * CHANNELS;
        buffer[i] += (err.r * 7) / 16;
        buffer[i + 1] += (err.g * 7) / 16;
        buffer[i + 2] += (err.b * 7) / 16;
      }
      if (y + 1 < dstH) {
        if (x > 0) {
          const i = (idx + dstW - 1) * CHANNELS;
          buffer[i] += (err.r * 3) / 16;
          buffer[i + 1] += (err.g * 3) / 16;
          buffer[i + 2] += (err.b * 3) / 16;
        }
        const i2 = (idx + dstW) * CHANNELS;
        buffer[i2] += (err.r * 5) / 16;
        buffer[i2 + 1] += (err.g * 5) / 16;
        buffer[i2 + 2] += (err.b * 5) / 16;
        if (x + 1 < dstW) {
          const i3 = (idx + dstW + 1) * CHANNELS;
          buffer[i3] += (err.r * 1) / 16;
          buffer[i3 + 1] += (err.g * 1) / 16;
          buffer[i3 + 2] += (err.b * 1) / 16;
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
    outputRGB = new Array(dstW * dstH);
    for (let i = 0; i < outputRGB.length; i++) {
      outputRGB[i] = nearestColor(
        {
          r: sampled[i * CHANNELS],
          g: sampled[i * CHANNELS + 1],
          b: sampled[i * CHANNELS + 2],
        },
        palette.colors
      );
    }
  } else {
    outputRGB = new Array(dstW * dstH);
    for (let i = 0; i < outputRGB.length; i++) {
      outputRGB[i] = {
        r: sampled[i * CHANNELS],
        g: sampled[i * CHANNELS + 1],
        b: sampled[i * CHANNELS + 2],
      };
    }
  }

  const outData = new Uint8ClampedArray(dstW * dstH * 4);
  for (let i = 0; i < outputRGB.length; i++) {
    const c = outputRGB[i];
    outData[i * 4] = c.r;
    outData[i * 4 + 1] = c.g;
    outData[i * 4 + 2] = c.b;
    outData[i * 4 + 3] = sampled[i * CHANNELS + 3]; // 保留原始平均 alpha,不强制 255
  }
  return new ImageData(outData, dstW, dstH);
}
