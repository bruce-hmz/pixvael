import assert from 'node:assert/strict';
import { test } from 'vitest';
import { nearestColor, pixelize } from '../src/lib/pixelize.ts';
import type { Palette } from '../src/lib/palettes.ts';

Object.defineProperty(globalThis, 'ImageData', {
  configurable: true,
  value: class ImageDataPolyfill {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  },
});

const fullColor: Palette = { id: 'full', name: 'Full color', colors: [] };
const blackAndWhite: Palette = {
  id: 'bw',
  name: 'Black and white',
  colors: [
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
  ],
};

test('nearestColor returns the closest palette entry', () => {
  assert.deepEqual(
    nearestColor({ r: 230, g: 220, b: 240 }, blackAndWhite.colors),
    { r: 255, g: 255, b: 255 },
  );
});

test('pixelize averages a block and preserves average alpha', () => {
  const source = new ImageData(
    new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
      255, 255, 255, 127,
    ]),
    2,
    2,
  );
  const result = pixelize(source, {
    pixelSize: 2,
    palette: fullColor,
    dither: false,
  });

  assert.equal(result.width, 1);
  assert.equal(result.height, 1);
  assert.deepEqual(Array.from(result.data), [109, 109, 109, 223]);
});

test('pixelize keeps partial blocks at the right and bottom edges', () => {
  const source = new ImageData(new Uint8ClampedArray(3 * 3 * 4).fill(255), 3, 3);
  const result = pixelize(source, {
    pixelSize: 2,
    palette: fullColor,
    dither: false,
  });

  assert.equal(result.width, 2);
  assert.equal(result.height, 2);
});

test('pixelize maps sampled colors to a limited palette', () => {
  const source = new ImageData(
    new Uint8ClampedArray([240, 240, 240, 255]),
    1,
    1,
  );
  const result = pixelize(source, {
    pixelSize: 1,
    palette: blackAndWhite,
    dither: false,
  });

  assert.deepEqual(Array.from(result.data), [255, 255, 255, 255]);
});

test('pixelize rejects invalid block sizes', () => {
  const source = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1);
  assert.throws(
    () => pixelize(source, { pixelSize: 0, palette: fullColor, dither: false }),
    /positive integer/,
  );
});

// --- dither (Floyd-Steinberg) 路径 ---

// 手算可验证的精确用例:2×1 图,灰 127 两个像素,黑白色板。
// idx0: nearest(127)=黑(0), 误差 127, 按 7/16 扩散给右侧 → 182.56
// idx1: nearest(182.56)=白(255)
// 预期输出 [黑, 白], alpha 保持 255
test('pixelize dither spreads error to the right neighbor (7/16)', () => {
  const source = new ImageData(
    new Uint8ClampedArray([
      127, 127, 127, 255,
      127, 127, 127, 255,
    ]),
    2,
    1,
  );
  const result = pixelize(source, {
    pixelSize: 1,
    palette: blackAndWhite,
    dither: true,
  });

  assert.equal(result.width, 2);
  assert.equal(result.height, 1);
  assert.deepEqual(Array.from(result.data), [
    0, 0, 0, 255,
    255, 255, 255, 255,
  ]);
});

test('pixelize dither output is confined to the palette', () => {
  // 8×1 水平灰阶渐变,抖动后每个像素必须收敛到黑白两色
  const gray = Array.from({ length: 8 }, (_, i) => {
    const v = Math.round((i / 7) * 255);
    return [v, v, v, 255];
  }).flat();
  const source = new ImageData(new Uint8ClampedArray(gray), 8, 1);
  const result = pixelize(source, {
    pixelSize: 1,
    palette: blackAndWhite,
    dither: true,
  });

  const data = Array.from(result.data);
  for (let i = 0; i < data.length; i += 4) {
    assert.equal(data[i], data[i + 1]);
    assert.equal(data[i], data[i + 2]);
    assert.ok(data[i] === 0 || data[i] === 255, `got ${data[i]}`);
  }
});

test('pixelize dither changes the result vs no dither (error diffusion active)', () => {
  const gray = Array.from({ length: 8 }, (_, i) => {
    const v = Math.round((i / 7) * 255);
    return [v, v, v, 255];
  }).flat();
  const source = new ImageData(new Uint8ClampedArray(gray), 8, 1);

  const plain = pixelize(source, {
    pixelSize: 1,
    palette: blackAndWhite,
    dither: false,
  });
  const dithered = pixelize(source, {
    pixelSize: 1,
    palette: blackAndWhite,
    dither: true,
  });

  assert.notDeepEqual(
    Array.from(dithered.data),
    Array.from(plain.data),
    'dithering must alter the output for a gradient input',
  );
});

test('pixelize dither preserves average alpha (alpha is not dithered)', () => {
  const source = new ImageData(
    new Uint8ClampedArray([
      150, 150, 150, 100,
      150, 150, 150, 200,
    ]),
    2,
    1,
  );
  const result = pixelize(source, {
    pixelSize: 1,
    palette: blackAndWhite,
    dither: true,
  });

  const data = Array.from(result.data);
  // alpha 保持各像素原始值,不被误差扩散触碰
  assert.equal(data[3], 100);
  assert.equal(data[7], 200);
  // RGB 收敛到调色板
  assert.ok(data[0] === 0 || data[0] === 255);
  assert.ok(data[4] === 0 || data[4] === 255);
});

test('pixelize dither works with a real 4-color palette', () => {
  const gameBoy: Palette = {
    id: 'gameboy',
    name: 'Game Boy',
    colors: [
      { r: 15, g: 56, b: 15 },
      { r: 48, g: 98, b: 48 },
      { r: 139, g: 172, b: 15 },
      { r: 155, g: 188, b: 15 },
    ],
  };
  // 4×4 的渐变(暗绿→亮绿),4 色调色板 + 抖动
  const gradient: number[] = [];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const v = Math.round(((y * 4 + x) / 15) * 255);
      gradient.push(0, v, 0, 255);
    }
  }
  const source = new ImageData(new Uint8ClampedArray(gradient), 4, 4);
  const result = pixelize(source, {
    pixelSize: 1,
    palette: gameBoy,
    dither: true,
  });

  const paletteKeys = new Set(
    gameBoy.colors.map((c) => `${c.r},${c.g},${c.b}`),
  );
  const data = Array.from(result.data);
  const used = new Set<string>();
  for (let i = 0; i < data.length; i += 4) {
    used.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
    assert.equal(data[i + 3], 255, 'opaque input stays opaque');
  }
  for (const key of used) {
    assert.ok(paletteKeys.has(key), `color ${key} not in palette`);
  }
});
