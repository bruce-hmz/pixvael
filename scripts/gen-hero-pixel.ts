// 构建时预生成 hero 像素化图:复用 src/lib/pixelize,保证与原运行时 canvas 像素化效果一致。
// BeforeAfter 改为静态 img 后不再运行时 canvas 绘制,消除 LCP 的 JS 绘制链路。
//
// 运行: npx tsx scripts/gen-hero-pixel.ts

// Node 无 ImageData 全局,而 lib/pixelize 内部用了 new ImageData()。
// 这里 polyfill 一个最小实现(像素化函数运行时才用到,所以放在 import 前)。
class ImageDataPolyfill {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, width: number, height?: number) {
    this.data = data;
    this.width = width;
    this.height = height ?? data.length / 4 / width;
  }
}
(globalThis as unknown as { ImageData: unknown }).ImageData = ImageDataPolyfill;

import sharp from 'sharp';
import { pixelize } from '../src/lib/pixelize';
import { getPalette } from '../src/lib/palettes';
import { statSync } from 'node:fs';

// 与 BeforeAfter 的 HERO_WIDTH/HEIGHT、HERO_PIXEL_SIZE 保持一致
const W = 1120;
const H = 630;
const PIXEL_SIZE = 12;

const cases = [
  { src: 'public/hero-portrait-v2.jpg', dest: 'public/hero-portrait-v2-pixel.avif' },
  { src: 'public/hero-cat.webp', dest: 'public/hero-cat-pixel.avif' },
  { src: 'public/hero-character.webp', dest: 'public/hero-character-pixel.avif' },
  { src: 'public/hero-minecraft.webp', dest: 'public/hero-minecraft-pixel.avif' },
];

async function generate(c: { src: string; dest: string }) {
  // crop 到 16:9 + 近似 drawHeroImage 的 brightness/saturate 滤镜(contrast/渐变很轻微,省略)
  const raw = await sharp(c.src)
    .resize({ width: W, height: H, fit: 'cover', position: 'center' })
    .modulate({ brightness: 1.02, saturation: 1.12 })
    .raw()
    .toBuffer();
  const source = new ImageDataPolyfill(new Uint8ClampedArray(raw), W, H);
  const result = pixelize(source, {
    pixelSize: PIXEL_SIZE,
    palette: getPalette('full'),
    dither: false,
  });
  await sharp(Buffer.from(result.data), {
    raw: { width: result.width, height: result.height, channels: 4 },
  })
    .avif({ quality: 60 })
    .toFile(c.dest);
  const k = (statSync(c.dest).size / 1024).toFixed(0);
  console.log(`${c.dest}: ${result.width}x${result.height}  ${k}K`);
}

(async () => {
  for (const c of cases) {
    await generate(c);
  }
})();
