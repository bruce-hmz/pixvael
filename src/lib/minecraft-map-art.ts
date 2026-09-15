import { MINECRAFT_BLOCKS, type MinecraftBlock } from '@/lib/minecraft-blocks';

export type MapGridSize = { columns: 1 | 2 | 3 | 4; rows: 1 | 2 | 3 | 4 };

export type MapGeometry = {
  canvasWidth: number;
  canvasHeight: number;
  artworkWidth: number;
  artworkHeight: number;
  footprintWidth: number;
  footprintHeight: number;
  artworkPixels: number;
  totalPositions: number;
};

export type JavaMapPaletteEntry = {
  block: MinecraftBlock;
  flatColor: { r: number; g: number; b: number };
};

export const MAP_ART_MODE = 'FLAT_MAP_ART' as const;

const MAP_BASE_COLORS: Record<string, { r: number; g: number; b: number }> = {
  'white-wool': { r: 220, g: 220, b: 220 },
  'orange-wool': { r: 186, g: 109, b: 44 },
  'magenta-wool': { r: 153, g: 65, b: 186 },
  'light-blue-wool': { r: 88, g: 132, b: 186 },
  'yellow-wool': { r: 197, g: 197, b: 44 },
  'lime-wool': { r: 109, g: 176, b: 21 },
  'pink-wool': { r: 208, g: 109, b: 142 },
  'gray-wool': { r: 65, g: 65, b: 65 },
  'light-gray-wool': { r: 132, g: 132, b: 132 },
  'cyan-wool': { r: 65, g: 109, b: 132 },
  'purple-wool': { r: 109, g: 54, b: 153 },
  'blue-wool': { r: 44, g: 65, b: 153 },
  'brown-wool': { r: 88, g: 65, b: 44 },
  'green-wool': { r: 88, g: 109, b: 44 },
  'red-wool': { r: 132, g: 44, b: 44 },
  'black-wool': { r: 21, g: 21, b: 21 },
  'white-terracotta': { r: 180, g: 152, b: 138 },
  'orange-terracotta': { r: 137, g: 70, b: 31 },
  'magenta-terracotta': { r: 128, g: 75, b: 93 },
  'light-blue-terracotta': { r: 96, g: 93, b: 119 },
  'yellow-terracotta': { r: 160, g: 114, b: 31 },
  'lime-terracotta': { r: 88, g: 100, b: 45 },
  'pink-terracotta': { r: 138, g: 66, b: 67 },
  'gray-terracotta': { r: 49, g: 35, b: 30 },
  'light-gray-terracotta': { r: 116, g: 92, b: 84 },
  'cyan-terracotta': { r: 75, g: 79, b: 79 },
  'purple-terracotta': { r: 105, g: 62, b: 75 },
  'blue-terracotta': { r: 65, g: 53, b: 79 },
  'brown-terracotta': { r: 65, g: 43, b: 30 },
  'green-terracotta': { r: 65, g: 70, b: 36 },
  'red-terracotta': { r: 122, g: 51, b: 39 },
  'black-terracotta': { r: 31, g: 18, b: 13 },
};


export function mapGeometry(size: MapGridSize): MapGeometry {
  const { columns, rows } = size;
  if (![1, 2, 3, 4].includes(columns) || ![1, 2, 3, 4].includes(rows)) {
    throw new Error('Map size must be between 1x1 and 4x4.');
  }

  const artworkWidth = columns * 128;
  const artworkHeight = rows * 128;
  const footprintHeight = artworkHeight;
  const artworkPixels = artworkWidth * artworkHeight;

  return {
    canvasWidth: artworkWidth,
    canvasHeight: artworkHeight,
    artworkWidth,
    artworkHeight,
    footprintWidth: artworkWidth,
    footprintHeight,
    artworkPixels,
    totalPositions: artworkPixels,
  };
}

export const JAVA_MAP_BLOCKS = MINECRAFT_BLOCKS.filter(
  (block) => Object.hasOwn(MAP_BASE_COLORS, block.id),
);

export const JAVA_MAP_PALETTE: JavaMapPaletteEntry[] = JAVA_MAP_BLOCKS.map(
  (block) => ({ block, flatColor: MAP_BASE_COLORS[block.id] }),
);

export function javaMapColor(block: MinecraftBlock): { r: number; g: number; b: number } {
  const base = MAP_BASE_COLORS[block.id];
  if (!base) {
    throw new Error(`Block is not part of the Java map palette: ${block.id}`);
  }
  return base;
}

export function javaMapPaletteColors() {
  return JAVA_MAP_PALETTE.map(({ flatColor }) => flatColor);
}

export function nearestJavaMapBlock(
  r: number,
  g: number,
  b: number,
): { block: MinecraftBlock; color: { r: number; g: number; b: number } } {
  let best:
    | { block: MinecraftBlock; color: { r: number; g: number; b: number }; distance: number }
    | undefined;

  for (const { block, flatColor } of JAVA_MAP_PALETTE) {
    const distance = (r - flatColor.r) ** 2 + (g - flatColor.g) ** 2 + (b - flatColor.b) ** 2;
    if (!best || distance < best.distance) {
      best = { block, color: flatColor, distance };
    }
  }

  if (!best) throw new Error('Java map palette is empty.');
  return best;
}

export function mapBlockIdsFromImage(image: ImageData): string[] {
  const blockIds = new Array<string>(image.width * image.height);
  for (let index = 0; index < blockIds.length; index += 1) {
    const offset = index * 4;
    if (image.data[offset + 3] < 128) {
      blockIds[index] = 'air';
      continue;
    }
    blockIds[index] = nearestJavaMapBlock(
      image.data[offset],
      image.data[offset + 1],
      image.data[offset + 2],
    ).block.id;
  }
  return blockIds;
}

/** Convert source pixels to the exact flat map display colors used by the exporter. */
export function mapImageFromBlockIds(source: ImageData, blockIds: string[]): ImageData {
  if (blockIds.length !== source.width * source.height) {
    throw new Error('Map artwork data does not match image dimensions.');
  }
  const byId = new Map(JAVA_MAP_PALETTE.map(({ block, flatColor }) => [block.id, flatColor]));
  const data = new Uint8ClampedArray(source.data);
  blockIds.forEach((id, index) => {
    const offset = index * 4;
    const color = id === 'air' ? { r: 0, g: 0, b: 0 } : byId.get(id);
    if (!color) throw new Error(`Unknown Java map block id: ${id}`);
    data[offset] = color.r;
    data[offset + 1] = color.g;
    data[offset + 2] = color.b;
    data[offset + 3] = id === 'air' ? 0 : 255;
  });
  return new ImageData(data, source.width, source.height);
}

export function mapDisplayColor(blockId: string) {
  if (blockId === 'air') return { r: 0, g: 0, b: 0 };
  const entry = JAVA_MAP_PALETTE.find(({ block }) => block.id === blockId);
  if (!entry) throw new Error(`Unknown Java map block id: ${blockId}`);
  return entry.flatColor;
}

export function mapExportBlockIds(
  artworkBlockIds: string[],
  artworkWidth: number,
): string[] {
  if (!Number.isInteger(artworkWidth) || artworkWidth <= 0) {
    throw new Error('Map artwork width must be a positive integer.');
  }
  if (artworkBlockIds.length === 0 || artworkBlockIds.length % artworkWidth !== 0) {
    throw new Error('Map artwork data does not match its width.');
  }
  return [...artworkBlockIds];
}
