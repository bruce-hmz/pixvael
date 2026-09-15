import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  parseProject,
  projectRestoreState,
  serializeProject,
} from '../src/lib/project-file.ts';
import { DEFAULT_CROP } from '../src/lib/crop.ts';

const validInput = {
  gridWidth: 2,
  gridHeight: 2,
  blockVersion: '1.12',
  blockIds: [
    'white-concrete', 'black-concrete',
    'black-concrete', 'white-concrete',
  ],
  completedCells: [3, 0, 3],
  sourceImage: 'data:image/png;base64,aGVsbG8=',
};

// 直接 JSON 构造的夹具需要带 app 标记与版本号(serializeProject 平时会补上)
function projectJson(overrides: Record<string, unknown>): string {
  return JSON.stringify({
    app: 'pixvael',
    version: 1,
    ...validInput,
    ...overrides,
  });
}

test('project round-trips with deduped, sorted progress', () => {
  const json = serializeProject(validInput);
  const restored = parseProject(json);

  assert.equal(restored.app, 'pixvael');
  assert.equal(restored.version, 1);
  assert.equal(restored.gridWidth, 2);
  assert.equal(restored.gridHeight, 2);
  assert.equal(restored.blockVersion, '1.12');
  assert.deepEqual(restored.blockIds, validInput.blockIds);
  assert.deepEqual(restored.completedCells, [0, 3]);
  assert.equal(restored.sourceImage, validInput.sourceImage);
});

test('project round-trips Minecraft mode metadata and crop state', () => {
  const json = serializeProject({
    ...validInput,
    mode: 'map_art',
    edition: 'java',
    mapGrid: '1x1',
    crop: { ...DEFAULT_CROP, aspect: 'square', zoom: 1.25, offsetX: -0.1, offsetY: 0.2 },
    orientation: 'flat',
    exportFormat: 'litematic',
    dither: true,
  });
  const restored = parseProject(json);

  assert.equal(restored.mode, 'map_art');
  assert.equal(restored.edition, 'java');
  assert.equal(restored.mapGrid, '1x1');
  assert.deepEqual(restored.crop, {
    aspect: 'square',
    zoom: 1.25,
    offsetX: -0.1,
    offsetY: 0.2,
  });
  assert.equal(restored.orientation, 'flat');
  assert.equal(restored.exportFormat, 'litematic');
  assert.equal(restored.dither, true);
  assert.equal(restored.edition, 'java');
});

test('project restore helper maps every editor setting and payload', () => {
  const project = parseProject(serializeProject({
    ...validInput, mode: 'map_art', edition: 'java', mapGrid: '1x1',
    crop: { ...DEFAULT_CROP, aspect: 'square' }, orientation: 'flat',
    exportFormat: 'litematic', dither: true,
  }));
  const restored = projectRestoreState(project);
  assert.equal(restored.mode, 'map_art');
  assert.equal(restored.edition, 'java');
  assert.equal(restored.mapGrid, '1x1');
  assert.deepEqual(restored.blockIds, validInput.blockIds);
  assert.deepEqual(restored.completedCells, [0, 3]);
  assert.equal(restored.gridWidth, 2);
  assert.equal(restored.gridHeight, 2);
  assert.equal(restored.orientation, 'flat');
  assert.equal(restored.dither, true);
  assert.equal(restored.exportFormat, 'litematic');
  assert.deepEqual(restored.crop, { aspect: 'square', zoom: 1, offsetX: 0, offsetY: 0 });
});

test('rejects files that are not pixvael projects', () => {
  assert.throws(() => parseProject('{oops'), /invalid JSON/);
  assert.throws(() => parseProject('{"app":"other"}'), /missing app marker/);
  assert.throws(
    () => parseProject(projectJson({ version: 2 })),
    /Unsupported project file version/,
  );
});

test('rejects block data that does not match the grid', () => {
  assert.throws(
    () => parseProject(projectJson({ blockIds: ['stone'] })),
    /does not match the grid/,
  );
  assert.throws(
    () =>
      parseProject(
        projectJson({ blockIds: ['stone', 'stone', 'made-up-block', 'stone'] }),
      ),
    /unknown blocks/,
  );
});

test('rejects invalid versions, progress, and source images', () => {
  assert.throws(
    () => parseProject(projectJson({ blockVersion: '1.8' })),
    /unknown palette version/,
  );
  assert.throws(
    () => parseProject(projectJson({ completedCells: [99] })),
    /invalid build progress/,
  );
  assert.throws(
    () => parseProject(projectJson({ sourceImage: 'http://x' })),
    /no embedded source image/,
  );
});
