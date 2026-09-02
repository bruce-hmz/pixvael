import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  blocksForVersion,
  compareMinecraftVersions,
  countMinecraftMaterials,
  MINECRAFT_BLOCKS,
  paletteForVersion,
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

test('palette holds 52 uniquely-colored, uniquely-named blocks', () => {
  assert.equal(MINECRAFT_BLOCKS.length, 52);
  const colors = MINECRAFT_BLOCKS.map(
    (block) => `${block.color.r},${block.color.g},${block.color.b}`,
  );
  assert.equal(new Set(colors).size, colors.length);
  const ids = MINECRAFT_BLOCKS.map((block) => block.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(
    MINECRAFT_BLOCKS.every((block) => block.namespacedId.startsWith('minecraft:')),
  );
});

test('version filters match block introductions', () => {
  assert.equal(blocksForVersion('latest').length, 52);
  assert.equal(blocksForVersion('1.17').length, 52);
  // 1.12+:除 deepslate(1.17)外全部可用
  assert.equal(blocksForVersion('1.12').length, 51);
  assert.ok(!blocksForVersion('1.12').some((block) => block.id === 'deepslate'));
  // 1.9+:羊毛 + 陶瓦 + 木板/砂岩/石头,无混凝土、无深板岩
  const legacy = blocksForVersion('1.9');
  assert.equal(legacy.length, 35);
  assert.ok(legacy.some((block) => block.id === 'white-wool'));
  assert.ok(legacy.some((block) => block.id === 'white-terracotta'));
  assert.ok(legacy.every((block) => !block.id.endsWith('-concrete')));
  // 未知版本 id 回落 latest
  assert.equal(blocksForVersion('9.9').length, 52);
});

test('version palettes reuse the minecraft palette id', () => {
  assert.equal(paletteForVersion('1.9').id, 'minecraft');
  assert.equal(paletteForVersion('1.9').colors.length, 35);
});

test('compareMinecraftVersions compares numerically per segment', () => {
  assert.ok(compareMinecraftVersions('1.12', '1.9') > 0);
  assert.ok(compareMinecraftVersions('1.17', '1.21') < 0);
  assert.equal(compareMinecraftVersions('1.9', '1.9'), 0);
});
