import type { MinecraftMaterial } from '@/lib/minecraft-blocks';
import type { RGB } from '@/lib/palettes';

export type PixelizeWorkerRequest = {
  source: ImageData;
  pixelSize: number;
  paletteId: string;
  dither: boolean;
  includeMinecraftMaterials: boolean;
  // 版本筛选后的显式调色板颜色;存在时优先于 paletteId 注册表,
  // 让 Minecraft 模式按游戏版本过滤方块而不动全局注册表。
  paletteColors?: RGB[];
};

export type PixelizeWorkerResponse = {
  result: ImageData;
  materials: MinecraftMaterial[];
};
