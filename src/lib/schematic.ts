// 经典 MCEdit .schematic 导出:大端 NBT + gzip。
// 面向扁平 2D 网格(垂直壁画 / 平铺地图画两种朝向),一格一方块。
//
// 遗留数字 id 是 1.13 扁平化前的方块编号(wool=35、terracotta=159、
// concrete=236 + 16 色 data 值),现代 WorldEdit 会自动换算成命名方块;
// 扁平化后新增、没有遗留编号的方块(目前只有 deepslate)走 MCEdit 的
// AddBlocks 半字节扩展 + SchematicaMapping 名称映射,WorldEdit 同样支持。

import { gzip } from '@/lib/gzip';
import { MINECRAFT_BLOCKS } from '@/lib/minecraft-blocks';
import {
  TAG_COMPOUND,
  writeRootCompound,
  type NbtWriter,
} from '@/lib/nbt';

export type SchematicOrientation = 'vertical' | 'flat';

export type SchematicOptions = {
  columns: number;
  rows: number;
  blockIds: string[];
  orientation?: SchematicOrientation;
};

// 16 色在 wool/terracotta/concrete 家族中共享的 data 值序
const COLOR_DATA: Record<string, number> = {
  white: 0,
  orange: 1,
  magenta: 2,
  'light-blue': 3,
  yellow: 4,
  lime: 5,
  pink: 6,
  gray: 7,
  'light-gray': 8,
  cyan: 9,
  purple: 10,
  blue: 11,
  brown: 12,
  green: 13,
  red: 14,
  black: 15,
};

const FAMILY_LEGACY_IDS: Record<string, number> = {
  wool: 35,
  terracotta: 159,
  concrete: 236,
};

// 自带固定遗留编号的中性方块
const NEUTRAL_LEGACY: Record<string, number> = {
  stone: 1,
  'oak-planks': 5,
  sandstone: 24,
};

// 扁平化后新增、需要 AddBlocks 扩展的方块:分配 >255 的编号,
// 并写入 SchematicaMapping 让读取端还原成真实命名方块。
const EXTENDED_LEGACY: Record<string, number> = {
  deepslate: 256,
};

const KNOWN_BLOCK_IDS = new Set(MINECRAFT_BLOCKS.map((block) => block.id));

const BLOCK_BY_ID = new Map(MINECRAFT_BLOCKS.map((block) => [block.id, block]));

type LegacyId = { id: number; data: number };

function legacyIdFor(blockId: string): LegacyId | null {
  const neutral = NEUTRAL_LEGACY[blockId];
  if (neutral !== undefined) return { id: neutral, data: 0 };

  const family = blockId.split('-').pop();
  const familyBase = family ? FAMILY_LEGACY_IDS[family] : undefined;
  if (familyBase !== undefined && family) {
    const color = blockId.slice(0, blockId.length - family.length - 1);
    const data = COLOR_DATA[color];
    if (data !== undefined) return { id: familyBase, data };
  }

  const extended = EXTENDED_LEGACY[blockId];
  if (extended !== undefined) return { id: extended, data: 0 };

  return null;
}

export function buildMinecraftSchematic(options: SchematicOptions): Uint8Array {
  const { columns, rows, blockIds, orientation = 'vertical' } = options;

  if (!Number.isInteger(columns) || columns <= 0) {
    throw new Error(`Invalid schematic columns: ${columns}`);
  }
  if (!Number.isInteger(rows) || rows <= 0) {
    throw new Error(`Invalid schematic rows: ${rows}`);
  }
  if (blockIds.length !== columns * rows) {
    throw new Error(
      `blockIds length ${blockIds.length} does not match ${columns}x${rows} grid`,
    );
  }

  const width = columns;
  const height = orientation === 'vertical' ? rows : 1;
  const length = orientation === 'vertical' ? 1 : rows;
  const total = width * height * length;

  const blocks = new Uint8Array(total);
  const data = new Uint8Array(total);
  const addBlocks = new Uint8Array(Math.ceil(total / 2));
  let usesExtendedIds = false;
  const extendedNames = new Map<string, number>();

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const blockId = blockIds[row * columns + column];
      if (!KNOWN_BLOCK_IDS.has(blockId)) {
        throw new Error(`Unknown Minecraft block id: ${blockId}`);
      }
      const legacy = legacyIdFor(blockId);
      if (!legacy) {
        throw new Error(`Block has no legacy id mapping: ${blockId}`);
      }

      // vertical: X=列、Y 自底向上、Z=1(墙面/壁画)
      // flat: X=列、Z=行、Y=1(平铺/地图画,z 与地图南向一致,不镜像)
      const x = column;
      const y = orientation === 'vertical' ? rows - 1 - row : 0;
      const z = orientation === 'vertical' ? 0 : row;
      const index = (y * length + z) * width + x;

      blocks[index] = legacy.id & 0xff;
      data[index] = legacy.data;
      if (legacy.id > 0xff) {
        const nibble = (legacy.id >> 8) & 0xf;
        if (index % 2 === 0) {
          addBlocks[index >> 1] |= nibble;
        } else {
          addBlocks[index >> 1] |= nibble << 4;
        }
        usesExtendedIds = true;
        extendedNames.set(
          BLOCK_BY_ID.get(blockId)?.namespacedId ?? blockId,
          legacy.id,
        );
      }
    }
  }

  const nbt = writeRootCompound((writer: NbtWriter) => {
    writer.tagHeader(8, 'Materials');
    writer.string('Alpha');

    writer.tagHeader(2, 'Width');
    writer.short(width);
    writer.tagHeader(2, 'Height');
    writer.short(height);
    writer.tagHeader(2, 'Length');
    writer.short(length);

    writer.tagHeader(11, 'Origin');
    writer.intArray([0, 0, 0]);

    writer.tagHeader(7, 'Blocks');
    writer.byteArray(blocks);
    writer.tagHeader(7, 'Data');
    writer.byteArray(data);

    if (usesExtendedIds) {
      writer.tagHeader(7, 'AddBlocks');
      writer.byteArray(addBlocks);
    }

    writer.tagHeader(9, 'Entities');
    writer.listHeader(TAG_COMPOUND, 0);
    writer.tagHeader(9, 'TileEntities');
    writer.listHeader(TAG_COMPOUND, 0);

    if (extendedNames.size > 0) {
      writer.beginCompound('SchematicaMapping');
      for (const [name, id] of extendedNames) {
        writer.tagHeader(3, name);
        writer.int(id);
      }
      writer.endCompound();
    }
  });

  return gzip(nbt);
}
