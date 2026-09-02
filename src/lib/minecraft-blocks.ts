import type { Palette, RGB } from '@/lib/palettes';

export type MinecraftBlock = {
  id: string;
  name: string;
  color: RGB;
  // 真实命名空间 id(如 minecraft:white_wool),供 .schematic 等导出格式使用
  namespacedId: string;
  // 该方块在 Java 版引入的版本,供版本筛选(1.9+/1.12+/1.17+/latest)
  since: string;
};

export type MinecraftMaterial = MinecraftBlock & {
  count: number;
};

// 颜色取值口径:羊毛/陶瓦用 Minecraft 地图色板(地图画玩家公认的标准色),
// 混凝土/中性方块沿用站点原有的纹理平均色,保证与既有转换结果兼容。
export const MINECRAFT_BLOCKS: MinecraftBlock[] = [
  { id: 'black-concrete', name: 'Black Concrete', color: { r: 8, g: 10, b: 15 }, namespacedId: 'minecraft:black_concrete', since: '1.12' },
  { id: 'gray-concrete', name: 'Gray Concrete', color: { r: 55, g: 58, b: 62 }, namespacedId: 'minecraft:gray_concrete', since: '1.12' },
  { id: 'light-gray-concrete', name: 'Light Gray Concrete', color: { r: 125, g: 125, b: 115 }, namespacedId: 'minecraft:light_gray_concrete', since: '1.12' },
  { id: 'white-concrete', name: 'White Concrete', color: { r: 207, g: 213, b: 214 }, namespacedId: 'minecraft:white_concrete', since: '1.12' },
  { id: 'red-concrete', name: 'Red Concrete', color: { r: 142, g: 32, b: 32 }, namespacedId: 'minecraft:red_concrete', since: '1.12' },
  { id: 'orange-concrete', name: 'Orange Concrete', color: { r: 224, g: 97, b: 1 }, namespacedId: 'minecraft:orange_concrete', since: '1.12' },
  { id: 'yellow-concrete', name: 'Yellow Concrete', color: { r: 241, g: 175, b: 21 }, namespacedId: 'minecraft:yellow_concrete', since: '1.12' },
  { id: 'lime-concrete', name: 'Lime Concrete', color: { r: 94, g: 168, b: 24 }, namespacedId: 'minecraft:lime_concrete', since: '1.12' },
  { id: 'green-concrete', name: 'Green Concrete', color: { r: 73, g: 91, b: 36 }, namespacedId: 'minecraft:green_concrete', since: '1.12' },
  { id: 'cyan-concrete', name: 'Cyan Concrete', color: { r: 21, g: 119, b: 136 }, namespacedId: 'minecraft:cyan_concrete', since: '1.12' },
  { id: 'light-blue-concrete', name: 'Light Blue Concrete', color: { r: 35, g: 137, b: 198 }, namespacedId: 'minecraft:light_blue_concrete', since: '1.12' },
  { id: 'blue-concrete', name: 'Blue Concrete', color: { r: 44, g: 46, b: 143 }, namespacedId: 'minecraft:blue_concrete', since: '1.12' },
  { id: 'purple-concrete', name: 'Purple Concrete', color: { r: 100, g: 32, b: 156 }, namespacedId: 'minecraft:purple_concrete', since: '1.12' },
  { id: 'magenta-concrete', name: 'Magenta Concrete', color: { r: 169, g: 48, b: 159 }, namespacedId: 'minecraft:magenta_concrete', since: '1.12' },
  { id: 'pink-concrete', name: 'Pink Concrete', color: { r: 213, g: 101, b: 142 }, namespacedId: 'minecraft:pink_concrete', since: '1.12' },
  { id: 'brown-concrete', name: 'Brown Concrete', color: { r: 96, g: 59, b: 31 }, namespacedId: 'minecraft:brown_concrete', since: '1.12' },
  { id: 'black-wool', name: 'Black Wool', color: { r: 20, g: 21, b: 25 }, namespacedId: 'minecraft:black_wool', since: '1.2' },
  { id: 'gray-wool', name: 'Gray Wool', color: { r: 62, g: 68, b: 71 }, namespacedId: 'minecraft:gray_wool', since: '1.2' },
  { id: 'light-gray-wool', name: 'Light Gray Wool', color: { r: 142, g: 142, b: 134 }, namespacedId: 'minecraft:light_gray_wool', since: '1.2' },
  { id: 'white-wool', name: 'White Wool', color: { r: 233, g: 236, b: 236 }, namespacedId: 'minecraft:white_wool', since: '1.2' },
  { id: 'red-wool', name: 'Red Wool', color: { r: 161, g: 39, b: 34 }, namespacedId: 'minecraft:red_wool', since: '1.2' },
  { id: 'orange-wool', name: 'Orange Wool', color: { r: 240, g: 118, b: 19 }, namespacedId: 'minecraft:orange_wool', since: '1.2' },
  { id: 'yellow-wool', name: 'Yellow Wool', color: { r: 248, g: 198, b: 39 }, namespacedId: 'minecraft:yellow_wool', since: '1.2' },
  { id: 'lime-wool', name: 'Lime Wool', color: { r: 112, g: 185, b: 25 }, namespacedId: 'minecraft:lime_wool', since: '1.2' },
  { id: 'green-wool', name: 'Green Wool', color: { r: 84, g: 109, b: 27 }, namespacedId: 'minecraft:green_wool', since: '1.2' },
  { id: 'cyan-wool', name: 'Cyan Wool', color: { r: 21, g: 137, b: 145 }, namespacedId: 'minecraft:cyan_wool', since: '1.2' },
  { id: 'light-blue-wool', name: 'Light Blue Wool', color: { r: 58, g: 175, b: 217 }, namespacedId: 'minecraft:light_blue_wool', since: '1.2' },
  { id: 'blue-wool', name: 'Blue Wool', color: { r: 53, g: 57, b: 157 }, namespacedId: 'minecraft:blue_wool', since: '1.2' },
  { id: 'purple-wool', name: 'Purple Wool', color: { r: 121, g: 42, b: 172 }, namespacedId: 'minecraft:purple_wool', since: '1.2' },
  { id: 'magenta-wool', name: 'Magenta Wool', color: { r: 189, g: 68, b: 184 }, namespacedId: 'minecraft:magenta_wool', since: '1.2' },
  { id: 'pink-wool', name: 'Pink Wool', color: { r: 237, g: 141, b: 172 }, namespacedId: 'minecraft:pink_wool', since: '1.2' },
  { id: 'brown-wool', name: 'Brown Wool', color: { r: 114, g: 71, b: 40 }, namespacedId: 'minecraft:brown_wool', since: '1.2' },
  { id: 'black-terracotta', name: 'Black Terracotta', color: { r: 35, g: 36, b: 40 }, namespacedId: 'minecraft:black_terracotta', since: '1.6' },
  { id: 'gray-terracotta', name: 'Gray Terracotta', color: { r: 79, g: 80, b: 85 }, namespacedId: 'minecraft:gray_terracotta', since: '1.6' },
  { id: 'light-gray-terracotta', name: 'Light Gray Terracotta', color: { r: 134, g: 134, b: 130 }, namespacedId: 'minecraft:light_gray_terracotta', since: '1.6' },
  { id: 'white-terracotta', name: 'White Terracotta', color: { r: 209, g: 177, b: 161 }, namespacedId: 'minecraft:white_terracotta', since: '1.6' },
  { id: 'red-terracotta', name: 'Red Terracotta', color: { r: 155, g: 49, b: 27 }, namespacedId: 'minecraft:red_terracotta', since: '1.6' },
  { id: 'orange-terracotta', name: 'Orange Terracotta', color: { r: 160, g: 83, b: 37 }, namespacedId: 'minecraft:orange_terracotta', since: '1.6' },
  { id: 'yellow-terracotta', name: 'Yellow Terracotta', color: { r: 185, g: 133, b: 41 }, namespacedId: 'minecraft:yellow_terracotta', since: '1.6' },
  { id: 'lime-terracotta', name: 'Lime Terracotta', color: { r: 106, g: 133, b: 38 }, namespacedId: 'minecraft:lime_terracotta', since: '1.6' },
  { id: 'green-terracotta', name: 'Green Terracotta', color: { r: 72, g: 87, b: 32 }, namespacedId: 'minecraft:green_terracotta', since: '1.6' },
  { id: 'cyan-terracotta', name: 'Cyan Terracotta', color: { r: 42, g: 107, b: 113 }, namespacedId: 'minecraft:cyan_terracotta', since: '1.6' },
  { id: 'light-blue-terracotta', name: 'Light Blue Terracotta', color: { r: 112, g: 109, b: 146 }, namespacedId: 'minecraft:light_blue_terracotta', since: '1.6' },
  { id: 'blue-terracotta', name: 'Blue Terracotta', color: { r: 68, g: 77, b: 142 }, namespacedId: 'minecraft:blue_terracotta', since: '1.6' },
  { id: 'purple-terracotta', name: 'Purple Terracotta', color: { r: 118, g: 68, b: 134 }, namespacedId: 'minecraft:purple_terracotta', since: '1.6' },
  { id: 'magenta-terracotta', name: 'Magenta Terracotta', color: { r: 149, g: 88, b: 121 }, namespacedId: 'minecraft:magenta_terracotta', since: '1.6' },
  { id: 'pink-terracotta', name: 'Pink Terracotta', color: { r: 163, g: 96, b: 126 }, namespacedId: 'minecraft:pink_terracotta', since: '1.6' },
  { id: 'brown-terracotta', name: 'Brown Terracotta', color: { r: 87, g: 53, b: 29 }, namespacedId: 'minecraft:brown_terracotta', since: '1.6' },
  { id: 'oak-planks', name: 'Oak Planks', color: { r: 166, g: 124, b: 82 }, namespacedId: 'minecraft:oak_planks', since: '1.0' },
  { id: 'sandstone', name: 'Sandstone', color: { r: 216, g: 194, b: 138 }, namespacedId: 'minecraft:sandstone', since: '1.2' },
  { id: 'stone', name: 'Stone', color: { r: 125, g: 125, b: 125 }, namespacedId: 'minecraft:stone', since: '1.0' },
  { id: 'deepslate', name: 'Deepslate', color: { r: 74, g: 74, b: 74 }, namespacedId: 'minecraft:deepslate', since: '1.17' },
];

// 版本筛选档位:id 稳定存进工程文件,since 是该档位允许的最早引入版本。
export const MINECRAFT_VERSIONS = [
  { id: 'latest', label: 'Latest (1.21+)', since: '1.21' },
  { id: '1.17', label: '1.17+', since: '1.17' },
  { id: '1.12', label: '1.12+', since: '1.12' },
  { id: '1.9', label: '1.9+', since: '1.9' },
] as const;

export type MinecraftVersionId = (typeof MINECRAFT_VERSIONS)[number]['id'];

export function isMinecraftVersionId(value: string): value is MinecraftVersionId {
  return MINECRAFT_VERSIONS.some((version) => version.id === value);
}

// 逐段数值比较("1.12" > "1.9"),用于判断方块是否在该版本档位可用。
export function compareMinecraftVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const length = Math.max(partsA.length, partsB.length);
  for (let index = 0; index < length; index += 1) {
    const segmentA = partsA[index] ?? 0;
    const segmentB = partsB[index] ?? 0;
    if (segmentA !== segmentB) return segmentA - segmentB;
  }
  return 0;
}

export function blocksForVersion(versionId: string): MinecraftBlock[] {
  const version = MINECRAFT_VERSIONS.find((entry) => entry.id === versionId)
    ?? MINECRAFT_VERSIONS[0];
  return MINECRAFT_BLOCKS.filter(
    (block) => compareMinecraftVersions(block.since, version.since) <= 0,
  );
}

export const MINECRAFT_PALETTE: Palette = {
  id: 'minecraft',
  name: 'Minecraft blocks',
  colors: MINECRAFT_BLOCKS.map((block) => block.color),
};

export function paletteForVersion(versionId: string): Palette {
  return {
    id: MINECRAFT_PALETTE.id,
    name: MINECRAFT_PALETTE.name,
    colors: blocksForVersion(versionId).map((block) => block.color),
  };
}

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
