import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countMinecraftMaterials,
  MINECRAFT_BLOCKS,
} from '../src/lib/minecraft-blocks.ts';

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

test('material counts are sorted and transparent cells are ignored', () => {
  const red = MINECRAFT_BLOCKS.find((block) => block.id === 'red-concrete')!;
  const white = MINECRAFT_BLOCKS.find((block) => block.id === 'white-concrete')!;
  const image = new ImageData(
    new Uint8ClampedArray([
      red.color.r, red.color.g, red.color.b, 255,
      white.color.r, white.color.g, white.color.b, 255,
      red.color.r, red.color.g, red.color.b, 255,
      white.color.r, white.color.g, white.color.b, 0,
    ]),
    2,
    2,
  );

  assert.deepEqual(
    countMinecraftMaterials(image).map(({ id, count }) => ({ id, count })),
    [
      { id: 'red-concrete', count: 2 },
      { id: 'white-concrete', count: 1 },
    ],
  );
});

test('unknown opaque colors fail fast', () => {
  const image = new ImageData(
    new Uint8ClampedArray([1, 2, 3, 255]),
    1,
    1,
  );
  assert.throws(() => countMinecraftMaterials(image), /Unknown Minecraft palette color/);
});
