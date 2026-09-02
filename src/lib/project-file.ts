// Pixvael 工程文件:把「源图 + 网格 + 手动编辑 + 完成进度」存成单个 JSON,
// 下次打开继续做。纯 serialize/parse + 严格校验,DOM 无关。

import {
  MINECRAFT_BLOCKS,
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
};

const KNOWN_BLOCK_IDS = new Set(MINECRAFT_BLOCKS.map((block) => block.id));

export function serializeProject(input: {
  gridWidth: number;
  gridHeight: number;
  blockVersion: string;
  blockIds: string[];
  completedCells: Iterable<number>;
  sourceImage: string;
}): string {
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
  };
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

  // 用局部变量承接,typeof 检查后 TS 才能收窄 Partial 字段
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
  };
}
