import assert from 'node:assert/strict';
import test from 'node:test';
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
