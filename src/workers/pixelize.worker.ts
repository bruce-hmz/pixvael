/// <reference lib="webworker" />

import { countMinecraftMaterials, MINECRAFT_PALETTE } from '@/lib/minecraft-blocks';
import { getPalette } from '@/lib/palettes';
import { pixelize } from '@/lib/pixelize';
import { mapBlockIdsFromImage, mapImageFromBlockIds } from '@/lib/minecraft-map-art';
import { materialsFromBlockIds } from '@/lib/minecraft-canvas';
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
    mode,
  } = event.data;
  const palette =
    paletteColors && paletteColors.length > 0
      ? { id: paletteId, name: paletteId, colors: paletteColors }
      : paletteId === MINECRAFT_PALETTE.id
        ? MINECRAFT_PALETTE
        : getPalette(paletteId);
  const result = pixelize(source, { pixelSize, palette, dither });
  const mapBlockIds = mode === 'map_art' ? mapBlockIdsFromImage(result) : null;
  const displayResult = mapBlockIds
    ? mapImageFromBlockIds(result, mapBlockIds)
    : result;
  const response: PixelizeWorkerResponse = {
    result: displayResult,
    materials: includeMinecraftMaterials
      ? mapBlockIds
        ? materialsFromBlockIds(mapBlockIds)
        : countMinecraftMaterials(result)
      : [],
    ...(mapBlockIds ? { blockIds: mapBlockIds } : {}),
  };

  workerScope.postMessage(response, [displayResult.data.buffer]);
};

export {};
