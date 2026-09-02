/// <reference lib="webworker" />

import { countMinecraftMaterials, MINECRAFT_PALETTE } from '@/lib/minecraft-blocks';
import { getPalette } from '@/lib/palettes';
import { pixelize } from '@/lib/pixelize';
import type {
  PixelizeWorkerRequest,
  PixelizeWorkerResponse,
} from '@/lib/pixelize-worker-types';

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<PixelizeWorkerRequest>) => {
  const {
    source,
    pixelSize,
    paletteId,
    paletteColors,
    dither,
    includeMinecraftMaterials,
  } = event.data;
  const palette =
    paletteColors && paletteColors.length > 0
      ? { id: paletteId, name: paletteId, colors: paletteColors }
      : paletteId === MINECRAFT_PALETTE.id
        ? MINECRAFT_PALETTE
        : getPalette(paletteId);
  const result = pixelize(source, { pixelSize, palette, dither });
  const response: PixelizeWorkerResponse = {
    result,
    materials: includeMinecraftMaterials
      ? countMinecraftMaterials(result)
      : [],
  };

  workerScope.postMessage(response, [result.data.buffer]);
};

export {};
