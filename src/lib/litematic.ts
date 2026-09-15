import { gzip } from '@/lib/gzip';
import {
  MINECRAFT_CANONICAL_BLOCKS,
  type MinecraftBlock,
} from '@/lib/minecraft-blocks';
import {
  TAG_COMPOUND,
  TAG_INT,
  TAG_LIST,
  TAG_LONG_ARRAY,
  TAG_STRING,
  TAG_LONG,
  writeRootCompound,
  type NbtWriter,
} from '@/lib/nbt';

export type LitematicDimensions = {
  width: number;
  height: number;
  length: number;
};

export type LitematicOptions = {
  /** Legacy 2D input dimensions. Ignored when dimensions is supplied. */
  columns: number;
  rows: number;
  blockIds: string[];
  orientation?: 'vertical' | 'flat';
  /** Volume dimensions for x-fastest, y-next, z-outer blockIds. */
  dimensions?: LitematicDimensions;
  name?: string;
  minecraftDataVersion?: number;
};

const BLOCK_BY_ID = new Map(MINECRAFT_CANONICAL_BLOCKS.map((block) => [block.id, block]));

function bitsForPalette(size: number) {
  return Math.max(2, Math.ceil(Math.log2(Math.max(2, size))));
}

/**
 * Litematica stores palette indices as an LSB-first packed long array. Values
 * may straddle two 64-bit words, so this deliberately uses arithmetic rather
 * than a JavaScript BigInt dependency in the browser bundle.
 */
function packPaletteIndices(values: number[], bits: number) {
  const words: Array<{ high: number; low: number }> = [];
  let high = 0;
  let low = 0;
  let used = 0;

  for (const value of values) {
    for (let bit = 0; bit < bits; bit += 1) {
      if (used === 64) {
        words.push({ high, low });
        high = 0;
        low = 0;
        used = 0;
      }
      if ((value & (1 << bit)) !== 0) {
        if (used < 32) low |= 1 << used;
        else high |= 1 << (used - 32);
      }
      used += 1;
    }
  }

  if (used > 0) words.push({ high, low });
  return words;
}

function vectorCompound(writer: NbtWriter, name: string, vector: LitematicDimensions) {
  writer.beginCompound(name);
  writer.tagHeader(TAG_INT, 'x');
  writer.int(vector.width);
  writer.tagHeader(TAG_INT, 'y');
  writer.int(vector.height);
  writer.tagHeader(TAG_INT, 'z');
  writer.int(vector.length);
  writer.endCompound();
}

function validateDimensions(dimensions: LitematicDimensions) {
  if (
    !Number.isInteger(dimensions.width) || dimensions.width <= 0 ||
    !Number.isInteger(dimensions.height) || dimensions.height <= 0 ||
    !Number.isInteger(dimensions.length) || dimensions.length <= 0
  ) {
    throw new Error('Litematic dimensions must be positive integers.');
  }
}

function volumeOf(dimensions: LitematicDimensions) {
  return dimensions.width * dimensions.height * dimensions.length;
}

function volumeBlockIds(options: LitematicOptions, dimensions: LitematicDimensions) {
  const { blockIds, columns, rows, orientation = 'vertical' } = options;
  const volume = volumeOf(dimensions);
  if (blockIds.length !== volume) {
    throw new Error(`Litematic block data must contain exactly ${volume} blocks.`);
  }

  // A supplied volume is already in the native x-fastest/y/z order.
  if (options.dimensions) return [...blockIds];

  if (columns !== dimensions.width || rows !== (orientation === 'vertical' ? dimensions.height : dimensions.length)) {
    throw new Error('Litematic legacy dimensions do not match the orientation.');
  }

  const ids: string[] = [];
  for (let y = 0; y < dimensions.height; y += 1) {
    for (let z = 0; z < dimensions.length; z += 1) {
      for (let x = 0; x < dimensions.width; x += 1) {
        const sourceRow = orientation === 'vertical' ? dimensions.height - 1 - y : z;
        ids.push(blockIds[sourceRow * columns + x]);
      }
    }
  }
  return ids;
}

function writePaletteEntry(writer: NbtWriter, block: MinecraftBlock) {
  writer.tagHeader(TAG_STRING, 'Name');
  writer.string(block.namespacedId);
}

export function buildLitematic(options: LitematicOptions): Uint8Array {
  const orientation = options.orientation ?? 'vertical';
  const dimensions = options.dimensions ?? {
    width: options.columns,
    height: orientation === 'vertical' ? options.rows : 1,
    length: orientation === 'vertical' ? 1 : options.rows,
  };
  validateDimensions(dimensions);

  const orderedIds = volumeBlockIds(options, dimensions);
  const blocks = orderedIds.map((id) => {
    const block = BLOCK_BY_ID.get(id);
    if (!block) throw new Error(`Unknown Minecraft block id: ${id}`);
    return block;
  });
  const air = BLOCK_BY_ID.get('air')!;
  const palette = [
    air,
    ...new Map(blocks.filter((block) => block.id !== 'air').map((block) => [block.id, block])).values(),
  ];
  const paletteIndex = new Map(palette.map((block, index) => [block.id, index]));
  const indices = blocks.map((block) => paletteIndex.get(block.id)!);
  const bits = bitsForPalette(palette.length);
  const packed = packPaletteIndices(indices, bits);
  const name = options.name ?? 'Pixvael Minecraft Build';
  const dataVersion = options.minecraftDataVersion ?? 3465;
  const volume = volumeOf(dimensions);

  const nbt = writeRootCompound((writer) => {
    writer.tagHeader(TAG_INT, 'Version');
    writer.int(6);
    writer.tagHeader(TAG_INT, 'MinecraftDataVersion');
    writer.int(dataVersion);

    writer.beginCompound('Metadata');
    writer.tagHeader(TAG_STRING, 'Name');
    writer.string(name);
    writer.tagHeader(TAG_STRING, 'Author');
    writer.string('Pixvael');
    writer.tagHeader(TAG_STRING, 'Description');
    writer.string('Generated by Pixvael');
    writer.tagHeader(TAG_INT, 'RegionCount');
    writer.int(1);
    writer.tagHeader(TAG_INT, 'TotalVolume');
    writer.int(volume);
    writer.tagHeader(TAG_INT, 'TotalBlocks');
    writer.int(blocks.filter((block) => block.id !== 'air').length);
    writer.tagHeader(TAG_INT, 'TotalVisibleBlocks');
    writer.int(blocks.filter((block) => block.id !== 'air').length);
    writer.tagHeader(TAG_LONG, 'TimeCreated');
    writer.long(Date.now());
    writer.tagHeader(TAG_LONG, 'TimeModified');
    writer.long(Date.now());
    vectorCompound(writer, 'EnclosingSize', dimensions);
    writer.endCompound();

    writer.beginCompound('Regions');
    writer.beginCompound('Pixvael');
    vectorCompound(writer, 'Position', { width: 0, height: 0, length: 0 });
    vectorCompound(writer, 'Size', dimensions);

    writer.tagHeader(TAG_LIST, 'BlockStatePalette');
    writer.listHeader(TAG_COMPOUND, palette.length);
    for (const block of palette) {
      writePaletteEntry(writer, block);
      writer.endCompound();
    }

    writer.tagHeader(TAG_LONG_ARRAY, 'BlockStates');
    writer.longPartsArray(packed);
    writer.tagHeader(TAG_LIST, 'TileEntities');
    writer.listHeader(TAG_COMPOUND, 0);
    writer.tagHeader(TAG_LIST, 'Entities');
    writer.listHeader(TAG_COMPOUND, 0);
    writer.tagHeader(TAG_LIST, 'PendingBlockTicks');
    writer.listHeader(TAG_COMPOUND, 0);
    writer.tagHeader(TAG_LIST, 'PendingFluidTicks');
    writer.listHeader(TAG_COMPOUND, 0);
    writer.endCompound();
    writer.endCompound();
  });

  return gzip(nbt);
}

export { bitsForPalette, packPaletteIndices };
