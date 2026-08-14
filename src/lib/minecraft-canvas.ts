// Minecraft 工作区的 canvas 绘制与像素↔方块转换纯函数。
// 从 PixelConverter.tsx 拆出:所有函数不依赖组件 state,只依赖参数,
// 便于独立测试与复用。

import {
  MINECRAFT_BLOCKS,
  type MinecraftMaterial,
} from '@/lib/minecraft-blocks';

export type MinecraftGrid = {
  columns: number;
  rows: number;
};

export type MinecraftCell = {
  column: number;
  row: number;
  index: number;
};

export function rgbValue({ r, g, b }: { r: number; g: number; b: number }) {
  return `rgb(${r}, ${g}, ${b})`;
}

// 预索引:颜色→方块 / id→方块,把逐像素 find 从 O(n) 降到 O(1)。
// 行为与线性查找一致(找不到时回落第一个方块 black-concrete)。
const BLOCK_BY_RGB = new Map(
  MINECRAFT_BLOCKS.map((block) => [
    `${block.color.r},${block.color.g},${block.color.b}`,
    block,
  ]),
);
const BLOCK_BY_ID = new Map(MINECRAFT_BLOCKS.map((block) => [block.id, block]));

export function blockIdsFromMinecraftImage(image: ImageData): string[] {
  const blockIds: string[] = [];
  for (let offset = 0; offset < image.data.length; offset += 4) {
    const key = `${image.data[offset]},${image.data[offset + 1]},${image.data[offset + 2]}`;
    blockIds.push(BLOCK_BY_RGB.get(key)?.id ?? MINECRAFT_BLOCKS[0].id);
  }
  return blockIds;
}

export function minecraftImageFromBlockIds(
  source: ImageData,
  blockIds: string[],
): ImageData {
  const data = new Uint8ClampedArray(source.data);
  blockIds.forEach((blockId, index) => {
    const block = BLOCK_BY_ID.get(blockId) ?? MINECRAFT_BLOCKS[0];
    const offset = index * 4;
    data[offset] = block.color.r;
    data[offset + 1] = block.color.g;
    data[offset + 2] = block.color.b;
    data[offset + 3] = 255;
  });
  return new ImageData(data, source.width, source.height);
}

export function materialsFromBlockIds(blockIds: string[]): MinecraftMaterial[] {
  const counts = new Map<string, number>();
  blockIds.forEach((blockId) => {
    counts.set(blockId, (counts.get(blockId) ?? 0) + 1);
  });
  return MINECRAFT_BLOCKS.flatMap((block) => {
    const count = counts.get(block.id) ?? 0;
    return count > 0 ? [{ ...block, count }] : [];
  }).sort((a, b) => b.count - a.count);
}

export function drawMinecraftGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  columns: number,
  rows: number,
) {
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  ctx.save();
  for (let column = 0; column <= columns; column++) {
    const major = column % 8 === 0;
    const x = Math.round(column * cellWidth) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.strokeStyle = major ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.34)';
    ctx.lineWidth = major ? 1 : 0.5;
    ctx.stroke();
  }
  for (let row = 0; row <= rows; row++) {
    const major = row % 8 === 0;
    const y = Math.round(row * cellHeight) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.strokeStyle = major ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.34)';
    ctx.lineWidth = major ? 1 : 0.5;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawMinecraftProgress(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grid: MinecraftGrid,
  completedCells: Set<number>,
  hoveredCell: MinecraftCell | null,
) {
  const cellWidth = width / grid.columns;
  const cellHeight = height / grid.rows;

  ctx.save();
  for (const index of completedCells) {
    const column = index % grid.columns;
    const row = Math.floor(index / grid.columns);
    ctx.fillStyle = 'rgba(87, 255, 143, 0.46)';
    ctx.fillRect(column * cellWidth, row * cellHeight, cellWidth, cellHeight);
  }
  if (hoveredCell) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      hoveredCell.column * cellWidth + 1,
      hoveredCell.row * cellHeight + 1,
      Math.max(1, cellWidth - 2),
      Math.max(1, cellHeight - 2),
    );
  }
  ctx.restore();
}

export function drawSectionFocus(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grid: MinecraftGrid,
  sectionSize: number,
  sectionIndex: number,
) {
  const sectionColumns = Math.ceil(grid.columns / sectionSize);
  const sectionColumn = sectionIndex % sectionColumns;
  const sectionRow = Math.floor(sectionIndex / sectionColumns);
  const cellWidth = width / grid.columns;
  const cellHeight = height / grid.rows;
  const x = sectionColumn * sectionSize * cellWidth;
  const y = sectionRow * sectionSize * cellHeight;
  const focusWidth = Math.min(sectionSize, grid.columns - sectionColumn * sectionSize) * cellWidth;
  const focusHeight = Math.min(sectionSize, grid.rows - sectionRow * sectionSize) * cellHeight;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.fillRect(0, 0, width, y);
  ctx.fillRect(0, y + focusHeight, width, height - y - focusHeight);
  ctx.fillRect(0, y, x, focusHeight);
  ctx.fillRect(x + focusWidth, y, width - x - focusWidth, focusHeight);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, Math.max(1, focusWidth - 3), Math.max(1, focusHeight - 3));
  ctx.restore();
}
