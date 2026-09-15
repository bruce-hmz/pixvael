import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  javaMapColor,
  mapBlockIdsFromImage,
  mapExportBlockIds,
  mapGeometry,
  nearestJavaMapBlock,
  mapImageFromBlockIds,
} from '../src/lib/minecraft-map-art.ts';
import { MINECRAFT_BLOCKS } from '../src/lib/minecraft-blocks.ts';
import { materialsFromBlockIds } from '../src/lib/minecraft-canvas.ts';

Object.defineProperty(globalThis, 'ImageData', { configurable: true, value: class {
  constructor(public data: Uint8ClampedArray, public width: number, public height: number) {}
} });

test('1x1 flat map geometry has no primer footprint', () => {
  assert.deepEqual(mapGeometry({ columns: 1, rows: 1 }), {
    canvasWidth: 128,
    canvasHeight: 128,
    artworkWidth: 128,
    artworkHeight: 128,
    footprintWidth: 128,
    footprintHeight: 128,
    artworkPixels: 16_384,
    totalPositions: 16_384,
  });
});

test('Java map palette uses the canonical flat wool color', () => {
  const whiteWool = MINECRAFT_BLOCKS.find((block) => block.id === 'white-wool');
  assert.ok(whiteWool);
  assert.deepEqual(javaMapColor(whiteWool), { r: 220, g: 220, b: 220 });
  const nearest = nearestJavaMapBlock(220, 220, 220);
  assert.equal(nearest.block.id, 'white-wool');
  assert.deepEqual(nearest.color, { r: 220, g: 220, b: 220 });
});

test('map image conversion returns one block id per map pixel', () => {
  const image = {
    width: 2,
    height: 1,
    data: new Uint8ClampedArray([220, 220, 220, 255, 21, 21, 21, 255]),
  } as ImageData;
  assert.deepEqual(mapBlockIdsFromImage(image), ['white-wool', 'black-wool']);
});

test('transparent map pixels become air and air stays transparent in display', () => {
  const image = { width: 2, height: 1, data: new Uint8ClampedArray([220, 220, 220, 255, 0, 0, 0, 0]) } as ImageData;
  const ids = mapBlockIdsFromImage(image);
  assert.deepEqual(ids, ['white-wool', 'air']);
  assert.deepEqual(Array.from(mapImageFromBlockIds(image, ids).data), [220, 220, 220, 255, 0, 0, 0, 0]);
});

test('flat map colors stay identical through conversion, display, and materials', () => {
  const image = {
    width: 4,
    height: 1,
    data: new Uint8ClampedArray([
      220, 220, 220, 255,
      21, 21, 21, 255,
      132, 44, 44, 255,
      65, 65, 65, 255,
    ]),
  } as ImageData;
  const ids = mapBlockIdsFromImage(image);
  assert.deepEqual(ids, ['white-wool', 'black-wool', 'red-wool', 'gray-wool']);
  assert.deepEqual(Array.from(mapImageFromBlockIds(image, ids).data), Array.from(image.data));
  assert.deepEqual(materialsFromBlockIds([...ids, 'air']).map(({ id, count }) => ({ id, count })).sort((a, b) => a.id.localeCompare(b.id)), [
    { id: 'black-wool', count: 1 },
    { id: 'gray-wool', count: 1 },
    { id: 'red-wool', count: 1 },
    { id: 'white-wool', count: 1 },
  ]);
});

test('map export preserves artwork order in flat mode', () => {
  const artwork = ['white-wool', 'black-wool', 'red-wool', 'blue-wool'];
  assert.deepEqual(mapExportBlockIds(artwork, 2), artwork);
  assert.throws(() => mapExportBlockIds(['stone'], 2), /does not match/);
});
