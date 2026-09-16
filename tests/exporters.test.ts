import assert from 'node:assert/strict';
import { afterEach, test } from 'vitest';
import { MINECRAFT_BLOCKS } from '../src/lib/minecraft-blocks.ts';
import { mapDisplayColor } from '../src/lib/minecraft-map-art.ts';
import { downloadZoneBlueprintPng } from '../src/lib/exporters.ts';

const originalDocument = globalThis.document;

function installCanvasMock() {
  const fills: string[] = [];
  const context = {
    fillStyle: '', fillRect: () => fills.push(context.fillStyle), strokeStyle: '', lineWidth: 1,
    strokeRect() {}, fillText() {}, beginPath() {}, moveTo() {}, lineTo() {},
    canvas: { toDataURL: () => 'data:image/png;base64,test' },
  } as unknown as CanvasRenderingContext2D;
  globalThis.document = {
    createElement: (tag: string) => tag === 'canvas'
      ? { width: 0, height: 0, getContext: () => context, toDataURL: () => 'data:image/png;base64,test' }
      : { download: '', href: '', style: {}, click() {}, remove() {} },
    body: { appendChild() {} },
  } as unknown as Document;
  return fills;
}

afterEach(() => { globalThis.document = originalDocument; });

test('zone blueprint uses map display colors for map art and block colors normally', () => {
  const ids = ['white-wool', 'black-wool', 'red-wool', 'gray-wool'];
  const blocks = ids.map((id, index) => ({ cell: { column: index, row: 0, index } as const, block: MINECRAFT_BLOCKS.find((entry) => entry.id === id)! }));
  const mapFills = installCanvasMock();
  downloadZoneBlueprintPng({ cells: blocks, startColumn: 0, startRow: 0, endColumn: 4, endRow: 1, activeSectionIndex: 0, mode: 'map_art' }, 'map.png');
  assert.deepEqual(mapFills.slice(1, 5), ids.map((id) => `rgb(${mapDisplayColor(id).r}, ${mapDisplayColor(id).g}, ${mapDisplayColor(id).b})`));
  const normalFills = installCanvasMock();
  downloadZoneBlueprintPng({ cells: blocks, startColumn: 0, startRow: 0, endColumn: 4, endRow: 1, activeSectionIndex: 0 }, 'normal.png');
  assert.deepEqual(normalFills.slice(1, 5), blocks.map(({ block }) => `rgb(${block.color.r}, ${block.color.g}, ${block.color.b})`));
});

test.each(['white-wool', 'black-wool', 'red-wool', 'gray-wool'] as const)('map zone draws %s with canonical display color', (id) => {
  const block = MINECRAFT_BLOCKS.find((entry) => entry.id === id)!;
  const fills = installCanvasMock();
  downloadZoneBlueprintPng({ cells: [{ cell: { column: 0, row: 0, index: 0 }, block }], startColumn: 0, startRow: 0, endColumn: 1, endRow: 1, activeSectionIndex: 0, mode: 'map_art' }, 'zone.png');
  const color = mapDisplayColor(id);
  assert.equal(fills[1], `rgb(${color.r}, ${color.g}, ${color.b})`);
});

test('normal zone keeps the canonical block color', () => {
  const block = MINECRAFT_BLOCKS.find((entry) => entry.id === 'red-wool')!;
  const fills = installCanvasMock();
  downloadZoneBlueprintPng({ cells: [{ cell: { column: 0, row: 0, index: 0 }, block }], startColumn: 0, startRow: 0, endColumn: 1, endRow: 1, activeSectionIndex: 0 }, 'zone.png');
  assert.equal(fills[1], `rgb(${block.color.r}, ${block.color.g}, ${block.color.b})`);
});
