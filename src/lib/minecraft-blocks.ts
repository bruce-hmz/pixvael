import type { Palette, RGB } from '@/lib/palettes';

export type MinecraftBlock = {
  id: string;
  name: string;
  color: RGB;
};

export type MinecraftMaterial = MinecraftBlock & {
  count: number;
};

export const MINECRAFT_BLOCKS: MinecraftBlock[] = [
  { id: 'black-concrete', name: 'Black Concrete', color: { r: 8, g: 10, b: 15 } },
  { id: 'gray-concrete', name: 'Gray Concrete', color: { r: 55, g: 58, b: 62 } },
  { id: 'light-gray-concrete', name: 'Light Gray Concrete', color: { r: 125, g: 125, b: 115 } },
  { id: 'white-concrete', name: 'White Concrete', color: { r: 207, g: 213, b: 214 } },
  { id: 'red-concrete', name: 'Red Concrete', color: { r: 142, g: 32, b: 32 } },
  { id: 'orange-concrete', name: 'Orange Concrete', color: { r: 224, g: 97, b: 1 } },
  { id: 'yellow-concrete', name: 'Yellow Concrete', color: { r: 241, g: 175, b: 21 } },
  { id: 'lime-concrete', name: 'Lime Concrete', color: { r: 94, g: 168, b: 24 } },
  { id: 'green-concrete', name: 'Green Concrete', color: { r: 73, g: 91, b: 36 } },
  { id: 'cyan-concrete', name: 'Cyan Concrete', color: { r: 21, g: 119, b: 136 } },
  { id: 'light-blue-concrete', name: 'Light Blue Concrete', color: { r: 35, g: 137, b: 198 } },
  { id: 'blue-concrete', name: 'Blue Concrete', color: { r: 44, g: 46, b: 143 } },
  { id: 'purple-concrete', name: 'Purple Concrete', color: { r: 100, g: 32, b: 156 } },
  { id: 'magenta-concrete', name: 'Magenta Concrete', color: { r: 169, g: 48, b: 159 } },
  { id: 'pink-concrete', name: 'Pink Concrete', color: { r: 213, g: 101, b: 142 } },
  { id: 'brown-concrete', name: 'Brown Concrete', color: { r: 96, g: 59, b: 31 } },
  { id: 'oak-planks', name: 'Oak Planks', color: { r: 166, g: 124, b: 82 } },
  { id: 'sandstone', name: 'Sandstone', color: { r: 216, g: 194, b: 138 } },
  { id: 'stone', name: 'Stone', color: { r: 125, g: 125, b: 125 } },
  { id: 'deepslate', name: 'Deepslate', color: { r: 74, g: 74, b: 74 } },
];

export const MINECRAFT_PALETTE: Palette = {
  id: 'minecraft',
  name: 'Minecraft blocks',
  colors: MINECRAFT_BLOCKS.map((block) => block.color),
};

function colorKey({ r, g, b }: RGB) {
  return `${r},${g},${b}`;
}

const BLOCK_BY_COLOR = new Map(
  MINECRAFT_BLOCKS.map((block) => [colorKey(block.color), block]),
);

export function countMinecraftMaterials(image: ImageData): MinecraftMaterial[] {
  const counts = new Map<string, number>();

  for (let index = 0; index < image.data.length; index += 4) {
    if (image.data[index + 3] < 128) continue;
    const key = `${image.data[index]},${image.data[index + 1]},${image.data[index + 2]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => {
      const block = BLOCK_BY_COLOR.get(key);
      if (!block) {
        throw new Error(`Unknown Minecraft palette color: ${key}`);
      }
      return { ...block, count };
    })
    .sort((a, b) => b.count - a.count);
}
