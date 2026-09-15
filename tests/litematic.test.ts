import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { test } from 'vitest';
import { buildLitematic } from '../src/lib/litematic.ts';

const TAG_END = 0;
const TAG_BYTE = 1;
const TAG_SHORT = 2;
const TAG_INT = 3;
const TAG_LONG = 4;
const TAG_FLOAT = 5;
const TAG_DOUBLE = 6;
const TAG_BYTE_ARRAY = 7;
const TAG_STRING = 8;
const TAG_LIST = 9;
const TAG_COMPOUND = 10;
const TAG_INT_ARRAY = 11;
const TAG_LONG_ARRAY = 12;

type NbtValue = number | string | NbtValue[] | Record<string, NbtValue> | bigint[];

function parseNbt(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  const readU8 = () => view.getUint8(offset++);
  const readI8 = () => view.getInt8(offset++);
  const readI16 = () => { const value = view.getInt16(offset, false); offset += 2; return value; };
  const readI32 = () => { const value = view.getInt32(offset, false); offset += 4; return value; };
  const readF32 = () => { const value = view.getFloat32(offset, false); offset += 4; return value; };
  const readF64 = () => { const value = view.getFloat64(offset, false); offset += 8; return value; };
  const readString = () => {
    const length = readI16();
    const value = new TextDecoder().decode(bytes.subarray(offset, offset + length));
    offset += length;
    return value;
  };
  const readPayload = (type: number): NbtValue => {
    switch (type) {
      case TAG_BYTE: return readI8();
      case TAG_SHORT: return readI16();
      case TAG_INT: return readI32();
      case TAG_LONG: {
        const high = BigInt(view.getInt32(offset, false));
        const low = BigInt(view.getUint32(offset + 4, false));
        offset += 8;
        return Number((high << 32n) | low);
      }
      case TAG_FLOAT: return readF32();
      case TAG_DOUBLE: return readF64();
      case TAG_BYTE_ARRAY: {
        const length = readI32(); const values = Array.from(bytes.subarray(offset, offset + length)); offset += length; return values;
      }
      case TAG_STRING: return readString();
      case TAG_LIST: {
        const itemType = readU8(); const length = readI32();
        return Array.from({ length }, () => readPayload(itemType));
      }
      case TAG_COMPOUND: {
        const result: Record<string, NbtValue> = {};
        while (true) {
          const childType = readU8();
          if (childType === TAG_END) break;
          result[readString()] = readPayload(childType);
        }
        return result;
      }
      case TAG_INT_ARRAY: {
        const length = readI32(); return Array.from({ length }, () => readI32());
      }
      case TAG_LONG_ARRAY: {
        const length = readI32();
        return Array.from({ length }, () => {
          const high = BigInt(view.getInt32(offset, false));
          const low = BigInt(view.getUint32(offset + 4, false));
          offset += 8;
          return (high << 32n) | low;
        });
      }
      default: throw new Error(`Unsupported NBT tag ${type}`);
    }
  };

  const rootType = readU8();
  assert.equal(rootType, TAG_COMPOUND);
  const rootName = readString();
  assert.equal(rootName, '');
  return readPayload(rootType) as Record<string, NbtValue>;
}

function decodePackedWords(words: bigint[], bits: number, count: number) {
  const wordMask = (1n << 64n) - 1n;
  return Array.from({ length: count }, (_, index) => {
    const bitStart = index * bits;
    const wordIndex = Math.floor(bitStart / 64);
    const shift = BigInt(bitStart % 64);
    const mask = (1n << BigInt(bits)) - 1n;
    const value = (words[wordIndex] & wordMask) >> shift;
    if (shift + BigInt(bits) <= 64n) return Number(value & mask);
    const next = (words[wordIndex + 1] ?? 0n) & wordMask;
    const combined = value | (next << (64n - shift));
    return Number(combined & mask);
  });
}

test('litematic is gzip NBT with vector dimensions and a packed long array', () => {
  const ids = Array.from({ length: 40 }, (_, index) => ['stone', 'white-wool', 'black-wool'][index % 3]);
  const bytes = buildLitematic({
    columns: 40,
    rows: 1,
    blockIds: ids,
    dimensions: { width: 40, height: 1, length: 1 },
  });
  const root = parseNbt(gunzipSync(bytes));
  assert.equal(root.Version, 6);
  assert.equal(root.MinecraftDataVersion, 3465);
  const regions = root.Regions as Record<string, NbtValue>;
  const region = regions.Pixvael as Record<string, NbtValue>;
  assert.deepEqual(region.Size, { x: 40, y: 1, z: 1 });
  const palette = region.BlockStatePalette as Array<Record<string, NbtValue>>;
  assert.deepEqual(palette.map((entry) => entry.Name), [
    'minecraft:air',
    'minecraft:stone',
    'minecraft:white_wool',
    'minecraft:black_wool',
  ]);
  const words = region.BlockStates as bigint[];
  assert.equal(words.length, 2);
  assert.deepEqual(decodePackedWords(words, 2, ids.length), ids.map((id) => ['stone', 'white-wool', 'black-wool'].indexOf(id) + 1));
});

test('litematic rejects unknown block ids', () => {
  assert.throws(() => buildLitematic({ columns: 1, rows: 1, blockIds: ['made-up'] }), /Unknown Minecraft block id/);
});

test('litematic always reserves palette index zero for air and counts non-air blocks', () => {
  const root = parseNbt(gunzipSync(buildLitematic({
    columns: 5, rows: 1, blockIds: ['air', 'dirt', 'oak-planks', 'glass', 'stone'],
    dimensions: { width: 5, height: 1, length: 1 },
  })));
  const region = (root.Regions as Record<string, NbtValue>).Pixvael as Record<string, NbtValue>;
  assert.equal((region.BlockStatePalette as Array<Record<string, NbtValue>>)[0].Name, 'minecraft:air');
  const metadata = root.Metadata as Record<string, NbtValue>;
  assert.equal(metadata.TotalVolume, 5);
  assert.equal(metadata.TotalBlocks, 4);
  assert.equal(metadata.TotalVisibleBlocks, 4);
});

test('litematic keeps palette indices intact when a value crosses a long boundary', () => {
  const ids = [
    'black-concrete', 'gray-concrete', 'light-gray-concrete', 'white-concrete',
    'red-concrete', 'orange-concrete', 'yellow-concrete', 'lime-concrete',
    'green-concrete', 'cyan-concrete', 'light-blue-concrete', 'blue-concrete',
    'purple-concrete', 'magenta-concrete', 'pink-concrete', 'brown-concrete',
  ];
  const root = parseNbt(gunzipSync(buildLitematic({
    columns: ids.length,
    rows: 1,
    blockIds: ids,
    dimensions: { width: ids.length, height: 1, length: 1 },
  })));
  const region = (root.Regions as Record<string, NbtValue>).Pixvael as Record<string, NbtValue>;
  assert.deepEqual(decodePackedWords(region.BlockStates as bigint[], 5, ids.length), ids.map((_, index) => index + 1));
});
