// 导出工具:像素 PNG / 材料 CSV / 完整蓝图 / 区块蓝图。
// 从 PixelConverter.tsx 拆出:只负责"状态 → 文件下载",埋点由调用方负责。

import type { MinecraftBlock, MinecraftMaterial } from '@/lib/minecraft-blocks';
import { rgbValue, type MinecraftCell, type MinecraftGrid } from '@/lib/minecraft-canvas';

function triggerDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = href;
  link.click();
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
  triggerDownload(canvas.toDataURL('image/png'), filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

// .schematic(MCEdit 经典格式,gzip NBT),供 WorldEdit/Litematica 导入
export function downloadSchematic(
  schematic: Uint8Array,
  filename: string,
) {
  downloadBlob(
    new Blob([schematic as BlobPart], { type: 'application/octet-stream' }),
    filename,
  );
}

// 工程文件:源图 + 网格 + 编辑 + 进度,单个 JSON
export function downloadProjectFile(json: string, filename: string) {
  downloadBlob(
    new Blob([json], { type: 'application/json' }),
    filename,
  );
}

export function downloadMaterialsCsv(
  materials: MinecraftMaterial[],
  grid: MinecraftGrid,
  filename: string,
) {
  const rows = [
    'Block,Count',
    ...materials.map(
      (material) => `"${material.name.replaceAll('"', '""')}",${material.count}`,
    ),
    '',
    `Grid,${grid.columns} x ${grid.rows}`,
    `Total blocks,${materials.reduce((sum, material) => sum + material.count, 0)}`,
  ];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

// 完整蓝图:深色底 + 标题 + 网格线(每 sectionSize 加粗)+ 行列坐标
export function downloadBlueprintPng(
  result: ImageData,
  grid: MinecraftGrid,
  sectionSize: number,
  filename: string,
) {
  const cellSize = 16;
  const leftMargin = 64;
  const topMargin = 96;
  const rightMargin = 24;
  const bottomMargin = 40;
  const canvas = document.createElement('canvas');
  canvas.width = leftMargin + grid.columns * cellSize + rightMargin;
  canvas.height = topMargin + grid.rows * cellSize + bottomMargin;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#08090b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f6f1df';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('PIXVAEL MINECRAFT BLUEPRINT', leftMargin, 32);
  ctx.fillStyle = '#b8ff3d';
  ctx.font = '14px monospace';
  ctx.fillText(
    `${grid.columns} x ${grid.rows} blocks / ${sectionSize} x ${sectionSize} sections`,
    leftMargin,
    58,
  );

  const imageCanvas = document.createElement('canvas');
  imageCanvas.width = result.width;
  imageCanvas.height = result.height;
  imageCanvas.getContext('2d')?.putImageData(result, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    imageCanvas,
    leftMargin,
    topMargin,
    result.width * cellSize,
    result.height * cellSize,
  );

  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let column = 0; column <= grid.columns; column++) {
    const x = leftMargin + column * cellSize + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, topMargin);
    ctx.lineTo(x, topMargin + grid.rows * cellSize);
    ctx.strokeStyle = column % sectionSize === 0 ? 'rgba(255,209,102,0.9)' : 'rgba(0,0,0,0.42)';
    ctx.lineWidth = column % sectionSize === 0 ? 2 : 1;
    ctx.stroke();
    if (column < grid.columns && column % sectionSize === 0) {
      ctx.fillStyle = '#ffd166';
      ctx.fillText(String(column + 1), x + (cellSize * Math.min(sectionSize, grid.columns - column)) / 2, topMargin - 14);
    }
  }
  for (let row = 0; row <= grid.rows; row++) {
    const y = topMargin + row * cellSize + 0.5;
    ctx.beginPath();
    ctx.moveTo(leftMargin, y);
    ctx.lineTo(leftMargin + grid.columns * cellSize, y);
    ctx.strokeStyle = row % sectionSize === 0 ? 'rgba(255,209,102,0.9)' : 'rgba(0,0,0,0.42)';
    ctx.lineWidth = row % sectionSize === 0 ? 2 : 1;
    ctx.stroke();
    if (row < grid.rows && row % sectionSize === 0) {
      ctx.fillStyle = '#ffd166';
      ctx.fillText(String(row + 1), leftMargin - 22, y + (cellSize * Math.min(sectionSize, grid.rows - row)) / 2);
    }
  }

  downloadCanvasPng(canvas, filename);
}

export type ZoneBlueprintInput = {
  cells: Array<{ cell: MinecraftCell; block: MinecraftBlock }>;
  startColumn: number;
  startRow: number;
  endColumn: number;
  endRow: number;
  activeSectionIndex: number;
};

// 区块蓝图:单区块放大 44px/格 + 每格标行列号
export function downloadZoneBlueprintPng(input: ZoneBlueprintInput, filename: string) {
  const { cells, startColumn, startRow, endColumn, endRow, activeSectionIndex } = input;
  const columns = endColumn - startColumn;
  const rows = endRow - startRow;
  const cellSize = 44;
  const leftMargin = 58;
  const topMargin = 82;
  const canvas = document.createElement('canvas');
  canvas.width = leftMargin + columns * cellSize + 24;
  canvas.height = topMargin + rows * cellSize + 30;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#08090b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f6f1df';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`PIXVAEL / ZONE ${activeSectionIndex + 1}`, leftMargin, 26);
  ctx.fillStyle = '#b8ff3d';
  ctx.font = '12px monospace';
  ctx.fillText(
    `X ${startColumn + 1}-${endColumn} / Y ${startRow + 1}-${endRow}`,
    leftMargin,
    50,
  );
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const { cell, block } of cells) {
    const localColumn = cell.column - startColumn;
    const localRow = cell.row - startRow;
    const x = leftMargin + localColumn * cellSize;
    const y = topMargin + localRow * cellSize;
    ctx.fillStyle = rgbValue(block.color);
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.strokeStyle = 'rgba(0,0,0,0.52)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
    ctx.fillStyle = '#ffd166';
    ctx.font = '10px monospace';
    if (localRow === 0) ctx.fillText(String(cell.column + 1), x + cellSize / 2, topMargin - 12);
    if (localColumn === 0) ctx.fillText(String(cell.row + 1), leftMargin - 18, y + cellSize / 2);
  }
  downloadCanvasPng(canvas, filename);
}
