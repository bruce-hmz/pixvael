import assert from 'node:assert/strict';
import { test } from 'vitest';
import { buildMcstructure } from '../src/lib/mcstructure.ts';

const TAG_END = 0;
const TAG_INT = 3;
const TAG_STRING = 8;
const TAG_LIST = 9;
const TAG_COMPOUND = 10;
const TAG_INT_ARRAY = 11;
type Value = number | string | Value[] | Record<string, Value>;

function parseMcstructure(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  const types = new Map<string, number>();
  const readU8 = () => view.getUint8(offset++);
  const readI16 = () => { const value = view.getUint16(offset, true); offset += 2; return value; };
  const readI32 = () => { const value = view.getInt32(offset, true); offset += 4; return value; };
  const readString = () => { const length = readI16(); const value = new TextDecoder().decode(bytes.subarray(offset, offset + length)); offset += length; return value; };
  const readPayload = (type: number, path: string): Value => {
    switch (type) {
      case TAG_INT: return readI32();
      case TAG_STRING: return readString();
      case TAG_INT_ARRAY: { const length = readI32(); return Array.from({ length }, () => readI32()); }
      case TAG_LIST: {
        const itemType = readU8(); const length = readI32();
        return Array.from({ length }, (_, index) => readPayload(itemType, `${path}[${index}]`));
      }
      case TAG_COMPOUND: {
        const result: Record<string, Value> = {};
        while (true) {
          const childType = readU8();
          if (childType === TAG_END) break;
          const name = readString();
          const childPath = path ? `${path}.${name}` : name;
          types.set(childPath, childType);
          result[name] = readPayload(childType, childPath);
        }
        return result;
      }
      default: throw new Error(`Unsupported Bedrock NBT tag ${type}`);
    }
  };
  assert.equal(readU8(), TAG_COMPOUND);
  assert.equal(readString(), '');
  return { root: readPayload(TAG_COMPOUND, '') as Record<string, Value>, types };
}

test('mcstructure writes Bedrock size, block indices, and default palette', () => {
  const bytes = buildMcstructure({ columns: 2, rows: 2, blockIds: ['stone', 'white-wool', 'white-wool', 'stone'] });
  const { root, types } = parseMcstructure(bytes);
  assert.equal(root.format_version, 1);
  assert.deepEqual(root.size, [2, 1, 2]);
  assert.deepEqual(root.structure_world_origin, [0, 0, 0]);
  assert.equal(types.get('structure_world_origin'), TAG_LIST);
  const structure = root.structure as Record<string, Value>;
  assert.deepEqual(structure.block_indices, [[1, 2, 2, 1], [-1, -1, -1, -1]]);
  const palette = structure.palette as Record<string, Value>;
  const defaultPalette = palette.default as Record<string, Value>;
  const entries = defaultPalette.block_palette as Array<Record<string, Value>>;
  assert.deepEqual(entries.map((entry) => entry.name), ['minecraft:air', 'minecraft:stone', 'minecraft:white_wool']);
  assert.deepEqual(entries.map((entry) => entry.version), [18168865, 18168865, 18168865]);
  assert.ok('block_position_data' in (defaultPalette));
  assert.equal(types.get('structure.palette.default.block_position_data'), TAG_COMPOUND);
  assert.equal('block_position_data' in root, false);
  assert.ok('entities' in structure);
  assert.equal('entities' in root, false);
});

test('mcstructure keeps asymmetric x/y/z order and encodes air as palette air', () => {
  const ids: string[] = [];
  for (let x = 0; x < 2; x += 1) {
    for (let y = 0; y < 3; y += 1) {
      for (let z = 0; z < 4; z += 1) {
        ids.push(x === 1 && y === 2 && z === 1 ? 'air' : ['stone', 'dirt', 'oak-planks', 'glass'][(x * 12 + y * 4 + z) % 4]);
      }
    }
  }
  const { root, types } = parseMcstructure(buildMcstructure({ columns: 2, rows: 4, depth: 3, blockIds: ids }));
  assert.deepEqual(root.size, [2, 3, 4]);
  const structure = root.structure as Record<string, Value>;
  const layers = structure.block_indices as Value[];
  assert.equal((layers[0] as Value[]).length, 24);
  assert.equal((layers[1] as Value[]).length, 24);
  assert.equal(types.get('structure.block_indices'), TAG_LIST);
  assert.deepEqual(layers[1], Array.from({ length: 24 }, () => -1));
  const palette = ((structure.palette as Record<string, Value>).default as Record<string, Value>).block_palette as Array<Record<string, Value>>;
  assert.deepEqual(palette.map((entry) => entry.name), ['minecraft:air', 'minecraft:stone', 'minecraft:dirt', 'minecraft:oak_planks', 'minecraft:glass']);
  assert.deepEqual(palette[3].states, {});
  const paletteIndex = new Map(palette.map((entry, index) => [entry.name, index]));
  assert.deepEqual(layers[0], ids.map((id) => paletteIndex.get({
    air: 'minecraft:air',
    stone: 'minecraft:stone',
    dirt: 'minecraft:dirt',
    'oak-planks': 'minecraft:oak_planks',
    glass: 'minecraft:glass',
  }[id])!));
});

test('mcstructure validates volume and block ids', () => {
  assert.throws(() => buildMcstructure({ columns: 2, rows: 2, blockIds: ['stone'] }), /exactly 4 blocks/);
  assert.throws(() => buildMcstructure({ columns: 1, rows: 1, blockIds: ['made-up'] }), /Unknown Minecraft block id/);
});

test('mcstructure writes explicit Bedrock oak and deepslate identities', () => {
  const { root } = parseMcstructure(buildMcstructure({ columns: 2, rows: 1, blockIds: ['oak-planks', 'deepslate'] }));
  const entries = (((root.structure as Record<string, Value>).palette as Record<string, Value>).default as Record<string, Value>).block_palette as Array<Record<string, Value>>;
  assert.deepEqual(entries.map((entry) => entry.name), ['minecraft:air', 'minecraft:oak_planks', 'minecraft:deepslate']);
  assert.deepEqual(entries[2].states, { pillar_axis: 'y' });
});
