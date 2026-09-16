import { MINECRAFT_CANONICAL_BLOCKS, type MinecraftBlock } from '@/lib/minecraft-blocks';

const TAG_END = 0;
const TAG_INT = 3;
const TAG_STRING = 8;
const TAG_LIST = 9;
const TAG_COMPOUND = 10;

class LittleEndianNbtWriter {
  private bytes: number[] = [];

  private pushByte(value: number) {
    this.bytes.push(value & 0xff);
  }

  private pushInt32(value: number) {
    const view = new DataView(new ArrayBuffer(4));
    view.setInt32(0, value, true);
    for (let index = 0; index < 4; index += 1) this.pushByte(view.getUint8(index));
  }

  private pushString(value: string) {
    const bytes = new TextEncoder().encode(value);
    if (bytes.length > 0xffff) throw new Error('Bedrock NBT string is too long.');
    this.pushByte(bytes.length);
    this.pushByte(bytes.length >> 8);
    this.bytes.push(...bytes);
  }

  tag(type: number, name: string) {
    this.pushByte(type);
    this.pushString(name);
  }

  int(value: number) {
    this.pushInt32(value);
  }

  string(value: string) {
    this.pushString(value);
  }

  listHeader(itemType: number, length: number) {
    this.pushByte(itemType);
    this.pushInt32(length);
  }

  intArray(values: number[]) {
    this.pushInt32(values.length);
    for (const value of values) this.pushInt32(value);
  }

  list(itemType: number, values: number[]) {
    this.listHeader(itemType, values.length);
    for (const value of values) this.int(value);
  }

  endCompound() {
    this.pushByte(TAG_END);
  }

  toUint8Array() {
    return Uint8Array.from(this.bytes);
  }
}

export type McstructureOptions = {
  columns: number;
  rows: number;
  blockIds: string[];
  /** Number of blocks deep along Y. Flat builds use the default depth of 1. */
  depth?: number;
  /** Bedrock block version integer. Defaults to 1.21.60 (18168865). */
  version?: number;
  orientation?: 'vertical' | 'flat';
};

const BLOCK_BY_ID = new Map(MINECRAFT_CANONICAL_BLOCKS.map((block) => [block.id, block]));

type BedrockBlock = { name: string; states: Record<string, string> };

const BEDROCK_BLOCKS: Record<string, BedrockBlock> = {
  'black-concrete': { name: 'minecraft:black_concrete', states: {} },
  'gray-concrete': { name: 'minecraft:gray_concrete', states: {} },
  'light-gray-concrete': { name: 'minecraft:light_gray_concrete', states: {} },
  'white-concrete': { name: 'minecraft:white_concrete', states: {} },
  'red-concrete': { name: 'minecraft:red_concrete', states: {} },
  'orange-concrete': { name: 'minecraft:orange_concrete', states: {} },
  'yellow-concrete': { name: 'minecraft:yellow_concrete', states: {} },
  'lime-concrete': { name: 'minecraft:lime_concrete', states: {} },
  'green-concrete': { name: 'minecraft:green_concrete', states: {} },
  'cyan-concrete': { name: 'minecraft:cyan_concrete', states: {} },
  'light-blue-concrete': { name: 'minecraft:light_blue_concrete', states: {} },
  'blue-concrete': { name: 'minecraft:blue_concrete', states: {} },
  'purple-concrete': { name: 'minecraft:purple_concrete', states: {} },
  'magenta-concrete': { name: 'minecraft:magenta_concrete', states: {} },
  'pink-concrete': { name: 'minecraft:pink_concrete', states: {} },
  'brown-concrete': { name: 'minecraft:brown_concrete', states: {} },
  'black-wool': { name: 'minecraft:black_wool', states: {} },
  'gray-wool': { name: 'minecraft:gray_wool', states: {} },
  'light-gray-wool': { name: 'minecraft:light_gray_wool', states: {} },
  'white-wool': { name: 'minecraft:white_wool', states: {} },
  'red-wool': { name: 'minecraft:red_wool', states: {} },
  'orange-wool': { name: 'minecraft:orange_wool', states: {} },
  'yellow-wool': { name: 'minecraft:yellow_wool', states: {} },
  'lime-wool': { name: 'minecraft:lime_wool', states: {} },
  'green-wool': { name: 'minecraft:green_wool', states: {} },
  'cyan-wool': { name: 'minecraft:cyan_wool', states: {} },
  'light-blue-wool': { name: 'minecraft:light_blue_wool', states: {} },
  'blue-wool': { name: 'minecraft:blue_wool', states: {} },
  'purple-wool': { name: 'minecraft:purple_wool', states: {} },
  'magenta-wool': { name: 'minecraft:magenta_wool', states: {} },
  'pink-wool': { name: 'minecraft:pink_wool', states: {} },
  'brown-wool': { name: 'minecraft:brown_wool', states: {} },
  'black-terracotta': { name: 'minecraft:black_terracotta', states: {} },
  'gray-terracotta': { name: 'minecraft:gray_terracotta', states: {} },
  'light-gray-terracotta': { name: 'minecraft:light_gray_terracotta', states: {} },
  'white-terracotta': { name: 'minecraft:white_terracotta', states: {} },
  'red-terracotta': { name: 'minecraft:red_terracotta', states: {} },
  'orange-terracotta': { name: 'minecraft:orange_terracotta', states: {} },
  'yellow-terracotta': { name: 'minecraft:yellow_terracotta', states: {} },
  'lime-terracotta': { name: 'minecraft:lime_terracotta', states: {} },
  'green-terracotta': { name: 'minecraft:green_terracotta', states: {} },
  'cyan-terracotta': { name: 'minecraft:cyan_terracotta', states: {} },
  'light-blue-terracotta': { name: 'minecraft:light_blue_terracotta', states: {} },
  'blue-terracotta': { name: 'minecraft:blue_terracotta', states: {} },
  'purple-terracotta': { name: 'minecraft:purple_terracotta', states: {} },
  'magenta-terracotta': { name: 'minecraft:magenta_terracotta', states: {} },
  'pink-terracotta': { name: 'minecraft:pink_terracotta', states: {} },
  'brown-terracotta': { name: 'minecraft:brown_terracotta', states: {} },
  'oak-planks': { name: 'minecraft:oak_planks', states: {} },
  sandstone: { name: 'minecraft:sandstone', states: {} },
  stone: { name: 'minecraft:stone', states: {} },
  deepslate: { name: 'minecraft:deepslate', states: { pillar_axis: 'y' } },
  dirt: { name: 'minecraft:dirt', states: {} },
  glass: { name: 'minecraft:glass', states: {} },
  air: { name: 'minecraft:air', states: {} },
};

function writeBlockPalette(
  writer: LittleEndianNbtWriter,
  blocks: MinecraftBlock[],
  version: number,
) {
  writer.tag(TAG_COMPOUND, 'palette');
  writer.tag(TAG_COMPOUND, 'default');
  writer.tag(TAG_LIST, 'block_palette');
  writer.listHeader(TAG_COMPOUND, blocks.length);
  for (const block of blocks) {
    writer.tag(TAG_STRING, 'name');
    const bedrock = BEDROCK_BLOCKS[block.id];
    if (!bedrock) throw new Error(`No safe Bedrock mapping for Minecraft block id: ${block.id}`);
    writer.string(bedrock.name);
    writer.tag(TAG_COMPOUND, 'states');
    for (const [key, value] of Object.entries(bedrock.states)) {
      writer.tag(TAG_STRING, key);
      writer.string(String(value));
    }
    writer.endCompound();
    writer.tag(TAG_INT, 'version');
    writer.int(version);
    writer.endCompound();
  }
  writer.tag(TAG_COMPOUND, 'block_position_data');
  writer.endCompound();
  writer.endCompound();
  writer.endCompound();
}

export function buildMcstructure({
  columns,
  rows,
  blockIds,
  depth = 1,
  version = 18168865,
  orientation,
}: McstructureOptions): Uint8Array {
  if (
    !Number.isInteger(columns) || columns <= 0 ||
    !Number.isInteger(rows) || rows <= 0 ||
    !Number.isInteger(depth) || depth <= 0
  ) {
    throw new Error('mcstructure dimensions must be positive integers.');
  }

  const volume = columns * depth * rows;
  if (blockIds.length !== volume) {
    throw new Error(`mcstructure block data must contain exactly ${volume} blocks.`);
  }

  const blocks = blockIds.map((id) => {
    const block = BLOCK_BY_ID.get(id);
    if (!block) throw new Error(`Unknown Minecraft block id: ${id}`);
    return block;
  });
  const palette = [
    BLOCK_BY_ID.get('air')!,
    ...new Map(blocks.filter((block) => block.id !== 'air').map((block) => [block.id, block])).values(),
  ];
  const paletteIndex = new Map(palette.map((block, index) => [block.id, index]));
  // blockIds are already native Bedrock order: flatten=((x*sizeY+y)*sizeZ+z).
  const indices = orientation === undefined
    ? blocks.map((block) => paletteIndex.get(block.id)!)
    : Array.from({ length: volume }, (_, index) => {
        const height = orientation === 'vertical' ? rows : depth;
        const length = orientation === 'vertical' ? depth : rows;
        const column = Math.floor(index / (height * length));
        const inner = index % (height * length);
        const y = Math.floor(inner / length);
        const z = inner % length;
        const sourceRow = orientation === 'vertical' ? rows - 1 - y : z;
        const sourceLayer = orientation === 'vertical' ? z : y;
        return paletteIndex.get(blocks[sourceLayer * columns * rows + sourceRow * columns + column].id)!;
      });

  const writer = new LittleEndianNbtWriter();
  writer.tag(TAG_COMPOUND, '');

  writer.tag(TAG_INT, 'format_version');
  writer.int(1);
  writer.tag(TAG_LIST, 'size');
  writer.listHeader(TAG_INT, 3);
  writer.int(columns);
  writer.int(orientation === 'vertical' ? rows : depth);
  writer.int(orientation === 'vertical' ? depth : rows);
  writer.tag(TAG_LIST, 'structure_world_origin');
  writer.list(TAG_INT, [0, 0, 0]);

  writer.tag(TAG_COMPOUND, 'structure');
  writer.tag(TAG_LIST, 'block_indices');
  writer.listHeader(TAG_LIST, 2);
  writer.listHeader(TAG_INT, indices.length);
  for (const index of indices) writer.int(index);
  writer.listHeader(TAG_INT, indices.length);
  for (let index = 0; index < indices.length; index += 1) writer.int(-1);
  writeBlockPalette(writer, palette, version);
  writer.tag(TAG_LIST, 'entities');
  writer.listHeader(TAG_COMPOUND, 0);
  writer.endCompound();
  writer.endCompound();
  return writer.toUint8Array();
}

export { LittleEndianNbtWriter };
