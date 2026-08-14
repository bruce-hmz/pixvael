import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  blockIdsFromMinecraftImage,
  materialsFromBlockIds,
  minecraftImageFromBlockIds,
} from '../src/lib/minecraft-canvas.ts';
import { MINECRAFT_BLOCKS } from '../src/lib/minecraft-blocks.ts';

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

const red = MINECRAFT_BLOCKS.find((block) => block.id === 'red-concrete')!;
const white = MINECRAFT_BLOCKS.find((block) => block.id === 'white-concrete')!;

test('blockIdsFromMinecraftImage maps exact colors to block ids', () => {
  const image = new ImageData(
    new Uint8ClampedArray([
      red.color.r, red.color.g, red.color.b, 255,
      white.color.r, white.color.g, white.color.b, 255,
    ]),
    2,
    1,
  );
  assert.deepEqual(blockIdsFromMinecraftImage(image), ['red-concrete', 'white-concrete']);
});

test('blockIdsFromMinecraftImage falls back to the first block for unknown colors', () => {
  const image = new ImageData(
    new Uint8ClampedArray([1, 2, 3, 255, 4, 5, 6, 255]),
    2,
    1,
  );
  assert.deepEqual(blockIdsFromMinecraftImage(image), ['black-concrete', 'black-concrete']);
});

test('minecraftImageFromBlockIds rebuilds pixel colors and forces opaque alpha', () => {
  const source = new ImageData(new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 0]), 2, 1);
  const result = minecraftImageFromBlockIds(source, ['red-concrete', 'white-concrete']);
  const data = Array.from(result.data);
  assert.deepEqual(data.slice(0, 4), [red.color.r, red.color.g, red.color.b, 255]);
  assert.deepEqual(data.slice(4, 8), [white.color.r, white.color.g, white.color.b, 255]);
});

test('materialsFromBlockIds counts blocks, sorts by count descending, and ignores zero-count blocks', () => {
  const materials = materialsFromBlockIds([
    'red-concrete',
    'white-concrete',
    'red-concrete',
    'red-concrete',
  ]);
  assert.deepEqual(
    materials.map(({ id, count }) => ({ id, count })),
    [
      { id: 'red-concrete', count: 3 },
      { id: 'white-concrete', count: 1 },
    ],
  );
});
