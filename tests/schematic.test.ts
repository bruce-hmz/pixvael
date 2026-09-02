import assert from 'node:assert/strict';
import { test } from 'vitest';
import { gunzipSync } from 'node:zlib';
import { buildMinecraftSchematic } from '../src/lib/schematic.ts';

// 测试用迷你 NBT 读取器:只解析 schematic 用到的标签子集。
class NbtReader {
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {}

  private take(length: number): Uint8Array {
    const slice = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return slice;
  }

  private byte(): number {
    return this.bytes[this.offset++];
  }

  private short(): number {
    const value = (this.bytes[this.offset] << 8) | this.bytes[this.offset + 1];
    this.offset += 2;
    return value;
  }

  private int(): number {
    const view = new DataView(
      this.bytes.buffer,
      this.bytes.byteOffset + this.offset,
      4,
    );
    this.offset += 4;
    return view.getInt32(0, false);
  }

  private string(): string {
    const length = this.short();
    return new TextDecoder().decode(this.take(length));
  }

  private payload(type: number): unknown {
    switch (type) {
      case 1:
        return this.byte();
      case 2:
        return this.short();
      case 3:
        return this.int();
      case 7: {
        const length = this.int();
        return new Uint8Array(this.take(length));
      }
      case 8:
        return this.string();
      case 9: {
        const itemType = this.byte();
        const length = this.int();
        const items: unknown[] = [];
        for (let i = 0; i < length; i += 1) items.push(this.payload(itemType));
        return items;
      }
      case 10:
        return this.compoundPayload();
      case 11: {
        const length = this.int();
        const values: number[] = [];
        for (let i = 0; i < length; i += 1) values.push(this.int());
        return values;
      }
      default:
        throw new Error(`unsupported tag type in test reader: ${type}`);
    }
  }

  private compoundPayload(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (;;) {
      const type = this.byte();
      if (type === 0) return result;
      const name = this.string();
      result[name] = this.payload(type);
    }
  }

  readRoot(): Record<string, unknown> {
    const rootType = this.byte();
    assert.equal(rootType, 10);
    const rootName = this.string();
    assert.equal(rootName, '');
    return this.compoundPayload();
  }
}

function parseSchematic(schematic: Uint8Array): Record<string, unknown> {
  return new NbtReader(new Uint8Array(gunzipSync(schematic))).readRoot();
}

test('vertical schematic maps colors to legacy ids with y flipped', () => {
  // 图像第 0 行(顶部)落在 schematic 的最高 y(自底向上存储)
  const parsed = parseSchematic(
    buildMinecraftSchematic({
      columns: 2,
      rows: 2,
      blockIds: [
        'white-concrete', 'black-concrete',
        'black-concrete', 'white-concrete',
      ],
      orientation: 'vertical',
    }),
  );

  assert.equal(parsed.Materials, 'Alpha');
  assert.equal(parsed.Width, 2);
  assert.equal(parsed.Height, 2);
  assert.equal(parsed.Length, 1);
  assert.deepEqual(Array.from(parsed.Blocks as Uint8Array), [236, 236, 236, 236]);
  // row1(黑,白)存到 y=0,row0(白,黑)存到 y=1;索引 = (y*1+0)*2+x
  assert.deepEqual(Array.from(parsed.Data as Uint8Array), [15, 0, 0, 15]);
  assert.equal(parsed.AddBlocks, undefined);
  assert.equal(parsed.SchematicaMapping, undefined);
});

test('flat schematic lays rows onto z for map art', () => {
  const parsed = parseSchematic(
    buildMinecraftSchematic({
      columns: 2,
      rows: 2,
      blockIds: [
        'white-wool', 'black-wool',
        'black-wool', 'white-wool',
      ],
      orientation: 'flat',
    }),
  );

  assert.equal(parsed.Width, 2);
  assert.equal(parsed.Height, 1);
  assert.equal(parsed.Length, 2);
  // wool = 遗留 id 35 + data(white 0 / black 15)
  assert.deepEqual(Array.from(parsed.Blocks as Uint8Array), [35, 35, 35, 35]);
  assert.deepEqual(Array.from(parsed.Data as Uint8Array), [0, 15, 15, 0]);
});

test('terracotta and neutral blocks map to their legacy ids', () => {
  const parsed = parseSchematic(
    buildMinecraftSchematic({
      columns: 4,
      rows: 1,
      blockIds: ['white-terracotta', 'stone', 'oak-planks', 'sandstone'],
    }),
  );
  assert.deepEqual(Array.from(parsed.Blocks as Uint8Array), [159, 1, 5, 24]);
  assert.deepEqual(Array.from(parsed.Data as Uint8Array), [0, 0, 0, 0]);
});

test('deepslate goes through AddBlocks and SchematicaMapping', () => {
  const parsed = parseSchematic(
    buildMinecraftSchematic({
      columns: 2,
      rows: 1,
      blockIds: ['deepslate', 'white-concrete'],
    }),
  );

  assert.deepEqual(Array.from(parsed.Blocks as Uint8Array), [0, 236]);
  // 索引 0 为偶数 → 低半字节
  assert.deepEqual(Array.from(parsed.AddBlocks as Uint8Array), [1]);
  const mapping = parsed.SchematicaMapping as Record<string, unknown>;
  assert.equal(mapping['minecraft:deepslate'], 256);
});

test('grids that do not match blockIds fail fast', () => {
  assert.throws(
    () => buildMinecraftSchematic({ columns: 3, rows: 2, blockIds: ['stone'] }),
    /does not match/,
  );
  assert.throws(
    () =>
      buildMinecraftSchematic({ columns: 1, rows: 1, blockIds: ['not-a-block'] }),
    /Unknown Minecraft block id/,
  );
});
