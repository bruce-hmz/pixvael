import type { MinecraftMaterial } from '@/lib/minecraft-blocks';

export type PixelizeWorkerRequest = {
  source: ImageData;
  pixelSize: number;
  paletteId: string;
  dither: boolean;
  includeMinecraftMaterials: boolean;
};

export type PixelizeWorkerResponse = {
  result: ImageData;
  materials: MinecraftMaterial[];
};
