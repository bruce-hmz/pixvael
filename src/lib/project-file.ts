// Pixvael 工程文件:把「源图 + 网格 + 手动编辑 + 完成进度」存成单个 JSON。
// 版本 1 保持向后兼容,并携带 Minecraft Map Art 的可恢复设置。

import { validateCropState, type CropState } from '@/lib/crop';
import {
  MINECRAFT_CANONICAL_BLOCKS,
  isMinecraftVersionId,
} from '@/lib/minecraft-blocks';

export const PROJECT_FILE_VERSION = 1;

export type PixvaelProject = {
  version: number;
  app: 'pixvael';
  savedAt: string;
  gridWidth: number;
  gridHeight: number;
  blockVersion: string;
  blockIds: string[];
  completedCells: number[];
  sourceImage: string;
  mode?: 'pixel_art' | 'map_art';
  edition?: 'java' | 'bedrock';
  mapGrid?: string;
  crop?: CropState;
  orientation?: 'vertical' | 'flat';
  exportFormat?: 'schematic' | 'litematic' | 'mcstructure' | 'png';
  dither?: boolean;
};

const KNOWN_BLOCK_IDS = new Set(MINECRAFT_CANONICAL_BLOCKS.map((block) => block.id));
const MAP_GRID_PATTERN = /^[1-4]x[1-4]$/;

export type ProjectInput = {
  gridWidth: number;
  gridHeight: number;
  blockVersion: string;
  blockIds: string[];
  completedCells: Iterable<number>;
  sourceImage: string;
  mode?: PixvaelProject['mode'];
  edition?: PixvaelProject['edition'];
  mapGrid?: string;
  crop?: CropState;
  orientation?: PixvaelProject['orientation'];
  exportFormat?: PixvaelProject['exportFormat'];
  dither?: boolean;
};

export type ProjectRestoreState = {
  mode: NonNullable<PixvaelProject['mode']>;
  orientation: NonNullable<PixvaelProject['orientation']>;
  dither: boolean;
  exportFormat: NonNullable<PixvaelProject['exportFormat']>;
  edition: NonNullable<PixvaelProject['edition']>;
  crop?: CropState;
  mapGrid?: string;
  gridWidth: number;
  gridHeight: number;
  blockIds: string[];
  completedCells: number[];
};

export function projectRestoreState(project: PixvaelProject): ProjectRestoreState {
  return {
    mode: project.mode ?? 'pixel_art',
    orientation: project.orientation ?? (project.mode === 'map_art' ? 'flat' : 'vertical'),
    dither: project.dither ?? false,
    exportFormat: project.exportFormat ?? (project.mode === 'map_art' ? 'litematic' : 'schematic'),
    edition: project.edition ?? (project.mode === 'map_art' ? 'java' : 'java'),
    crop: project.crop,
    mapGrid: project.mapGrid,
    gridWidth: project.gridWidth,
    gridHeight: project.gridHeight,
    blockIds: [...project.blockIds],
    completedCells: [...project.completedCells],
  };
}

function validateOptionalFields(project: Partial<PixvaelProject>) {
  if (project.mode !== undefined && project.mode !== 'pixel_art' && project.mode !== 'map_art') {
    throw new Error('Project file has an unknown Minecraft mode.');
  }
  if (project.edition !== undefined && project.edition !== 'java' && project.edition !== 'bedrock') {
    throw new Error('Project file has an unknown Minecraft edition.');
  }
  if (project.mapGrid !== undefined && (typeof project.mapGrid !== 'string' || !MAP_GRID_PATTERN.test(project.mapGrid))) {
    throw new Error('Project file has an invalid map grid.');
  }
  if (project.crop !== undefined) {
    try {
      validateCropState(project.crop);
    } catch {
      throw new Error('Project file has an invalid crop state.');
    }
  }
  if (
    project.orientation !== undefined &&
    project.orientation !== 'vertical' &&
    project.orientation !== 'flat'
  ) {
    throw new Error('Project file has an unknown build orientation.');
  }
  if (
    project.exportFormat !== undefined &&
    !['schematic', 'litematic', 'mcstructure', 'png'].includes(project.exportFormat)
  ) {
    throw new Error('Project file has an unknown export format.');
  }
  if (project.dither !== undefined && typeof project.dither !== 'boolean') {
    throw new Error('Project file has an invalid dither setting.');
  }
}

export function serializeProject(input: ProjectInput): string {
  const project: PixvaelProject = {
    version: PROJECT_FILE_VERSION,
    app: 'pixvael',
    savedAt: new Date().toISOString(),
    gridWidth: input.gridWidth,
    gridHeight: input.gridHeight,
    blockVersion: input.blockVersion,
    blockIds: input.blockIds,
    completedCells: Array.from(new Set(input.completedCells)).sort(
      (a, b) => a - b,
    ),
    sourceImage: input.sourceImage,
    ...(input.mode === undefined ? {} : { mode: input.mode }),
    ...(input.edition === undefined ? {} : { edition: input.edition }),
    ...(input.mapGrid === undefined ? {} : { mapGrid: input.mapGrid }),
    ...(input.crop === undefined ? {} : { crop: input.crop }),
    ...(input.orientation === undefined ? {} : { orientation: input.orientation }),
    ...(input.exportFormat === undefined ? {} : { exportFormat: input.exportFormat }),
    ...(input.dither === undefined ? {} : { dither: input.dither }),
  };
  validateOptionalFields(project);
  return JSON.stringify(project, null, 2);
}

export function parseProject(json: string): PixvaelProject {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Not a Pixvael project file: invalid JSON.');
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as { app?: unknown }).app !== 'pixvael'
  ) {
    throw new Error('Not a Pixvael project file: missing app marker.');
  }
  const project = parsed as Partial<PixvaelProject>;

  if (project.version !== PROJECT_FILE_VERSION) {
    throw new Error(
      `Unsupported project file version: ${String(project.version)} (expected ${PROJECT_FILE_VERSION}).`,
    );
  }

  const gridWidth = project.gridWidth;
  const gridHeight = project.gridHeight;
  const blockIds = project.blockIds;
  const blockVersion = project.blockVersion;
  const completedCells = project.completedCells;
  const sourceImage = project.sourceImage;

  if (
    typeof gridWidth !== 'number' ||
    typeof gridHeight !== 'number' ||
    !Number.isInteger(gridWidth) ||
    !Number.isInteger(gridHeight) ||
    gridWidth <= 0 ||
    gridHeight <= 0
  ) {
    throw new Error('Project file has an invalid grid size.');
  }
  if (
    !Array.isArray(blockIds) ||
    blockIds.length !== gridWidth * gridHeight ||
    blockIds.some((id) => typeof id !== 'string' || !KNOWN_BLOCK_IDS.has(id))
  ) {
    throw new Error(
      'Project file block data does not match the grid or contains unknown blocks.',
    );
  }
  if (typeof blockVersion !== 'string' || !isMinecraftVersionId(blockVersion)) {
    throw new Error('Project file has an unknown palette version.');
  }
  if (
    !Array.isArray(completedCells) ||
    completedCells.some(
      (cell) =>
        !Number.isInteger(cell) || cell < 0 || cell >= gridWidth * gridHeight,
    )
  ) {
    throw new Error('Project file has invalid build progress data.');
  }
  if (typeof sourceImage !== 'string' || !sourceImage.startsWith('data:image/')) {
    throw new Error('Project file has no embedded source image.');
  }
  validateOptionalFields(project);

  return {
    version: PROJECT_FILE_VERSION,
    app: 'pixvael',
    savedAt:
      typeof project.savedAt === 'string'
        ? project.savedAt
        : new Date(0).toISOString(),
    gridWidth,
    gridHeight,
    blockVersion,
    blockIds,
    completedCells: Array.from(new Set(completedCells)).sort((a, b) => a - b),
    sourceImage,
    ...(project.mode === undefined ? {} : { mode: project.mode }),
    ...(project.edition === undefined ? {} : { edition: project.edition }),
    ...(project.mapGrid === undefined ? {} : { mapGrid: project.mapGrid }),
    ...(project.crop === undefined ? {} : { crop: project.crop }),
    ...(project.orientation === undefined ? {} : { orientation: project.orientation }),
    ...(project.exportFormat === undefined ? {} : { exportFormat: project.exportFormat }),
    ...(project.dither === undefined ? {} : { dither: project.dither }),
  };
}
