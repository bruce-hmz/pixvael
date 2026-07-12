'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTES, getPalette } from '@/lib/palettes';
import {
  MINECRAFT_BLOCKS,
  MINECRAFT_PALETTE,
  type MinecraftBlock,
  type MinecraftMaterial,
} from '@/lib/minecraft-blocks';
import type {
  PixelizeWorkerRequest,
  PixelizeWorkerResponse,
} from '@/lib/pixelize-worker-types';

const MAX_DIM = 1280; // 最大处理边长,防止大图爆内存
const SESSION_IMAGE_KEY = 'pixvael:source-image';
const SESSION_IMAGE_ID_KEY = 'pixvael:source-image-id';
const MINECRAFT_PROGRESS_PREFIX = 'pixvael:minecraft-progress';
const MINECRAFT_EDITS_PREFIX = 'pixvael:minecraft-edits';
const MINECRAFT_GRID_MIN = 16;
const MINECRAFT_GRID_MAX = 128;
const MINECRAFT_GRID_STEP = 8;
const CONVERTER_WIDTHS = [24, 32, 48, 64] as const;

type Props = {
  defaultPixelSize?: number;
  defaultPaletteId?: string;
  mode?: 'pixel' | 'minecraft';
  minecraftTool?: 'planner' | 'maker' | 'converter';
};

type MinecraftGrid = {
  columns: number;
  rows: number;
};

type MinecraftCell = {
  column: number;
  row: number;
  index: number;
};

type ConverterPreview = {
  width: number;
  height: number;
  totalBlocks: number;
  materialCount: number;
  imageUrl: string;
};

function rgbValue({ r, g, b }: { r: number; g: number; b: number }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function palettePreviewColors(paletteId: string) {
  const palette = getPalette(paletteId);

  if (palette.colors.length > 0) {
    return palette.colors.slice(0, 8).map(rgbValue);
  }

  return [
    '#45d9ff',
    '#b8ff3d',
    '#ffd166',
    '#ff5c7a',
    '#8f7cff',
    '#f6f1df',
  ];
}

function drawMinecraftGrid(
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

function drawMinecraftProgress(
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

function drawSectionFocus(
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

function blockIdsFromMinecraftImage(image: ImageData) {
  const blockIds: string[] = [];
  for (let offset = 0; offset < image.data.length; offset += 4) {
    const block = MINECRAFT_BLOCKS.find(
      (candidate) =>
        candidate.color.r === image.data[offset] &&
        candidate.color.g === image.data[offset + 1] &&
        candidate.color.b === image.data[offset + 2],
    );
    blockIds.push(block?.id ?? MINECRAFT_BLOCKS[0].id);
  }
  return blockIds;
}

function minecraftImageFromBlockIds(
  source: ImageData,
  blockIds: string[],
) {
  const data = new Uint8ClampedArray(source.data);
  blockIds.forEach((blockId, index) => {
    const block =
      MINECRAFT_BLOCKS.find((candidate) => candidate.id === blockId) ??
      MINECRAFT_BLOCKS[0];
    const offset = index * 4;
    data[offset] = block.color.r;
    data[offset + 1] = block.color.g;
    data[offset + 2] = block.color.b;
    data[offset + 3] = 255;
  });
  return new ImageData(data, source.width, source.height);
}

function materialsFromBlockIds(blockIds: string[]): MinecraftMaterial[] {
  const counts = new Map<string, number>();
  blockIds.forEach((blockId) => {
    counts.set(blockId, (counts.get(blockId) ?? 0) + 1);
  });
  return MINECRAFT_BLOCKS.flatMap((block) => {
    const count = counts.get(block.id) ?? 0;
    return count > 0 ? [{ ...block, count }] : [];
  }).sort((a, b) => b.count - a.count);
}

function rememberImageForMinecraftMode(image: HTMLImageElement, sourceId: string) {
  const maxDimension = 1024;
  const scale = Math.min(
    1,
    maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const encodedImage = canvas.toDataURL('image/png');
  try {
    sessionStorage.setItem(SESSION_IMAGE_KEY, encodedImage);
    sessionStorage.setItem(SESSION_IMAGE_ID_KEY, sourceId);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return encodedImage;
    }
    throw error;
  }
  return encodedImage;
}

export function PixelConverter({
  defaultPixelSize = 8,
  defaultPaletteId = 'full',
  mode = 'pixel',
  minecraftTool = 'planner',
}: Props) {
  const isMinecraftMode = mode === 'minecraft';
  const isMinecraftMaker = isMinecraftMode && minecraftTool === 'maker';
  const isMinecraftConverter = isMinecraftMode && minecraftTool === 'converter';
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef(0); // 加载乱序保护
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null); // 完整输出(下载用)
  const minecraftPreviewBaseRef = useRef<HTMLCanvasElement | null>(null);
  const minecraftResultRef = useRef<ImageData | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [pixelSize, setPixelSize] = useState(defaultPixelSize);
  const [paletteId, setPaletteId] = useState(defaultPaletteId);
  const [dither, setDither] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetBlocksAcross, setTargetBlocksAcross] = useState(48);
  const [showGrid, setShowGrid] = useState(true);
  const [minecraftGrid, setMinecraftGrid] = useState<MinecraftGrid | null>(null);
  const [minecraftMaterials, setMinecraftMaterials] = useState<MinecraftMaterial[]>([]);
  const [isRestoredImage, setIsRestoredImage] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [sourceId, setSourceId] = useState('');
  const [hoveredCell, setHoveredCell] = useState<MinecraftCell | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<MinecraftBlock | null>(null);
  const [completedCells, setCompletedCells] = useState<Set<number>>(new Set());
  const [sectionSize, setSectionSize] = useState<8 | 16>(8);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [minecraftCellBlockIds, setMinecraftCellBlockIds] = useState<string[]>([]);
  const [originalMinecraftCellBlockIds, setOriginalMinecraftCellBlockIds] = useState<string[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState('white-concrete');
  const [makerTool, setMakerTool] = useState<'paint' | 'pick' | 'restore' | 'build'>('paint');
  const [editHistory, setEditHistory] = useState<string[][]>([]);
  const [editHistoryIndex, setEditHistoryIndex] = useState(-1);
  const [converterPreviews, setConverterPreviews] = useState<ConverterPreview[]>([]);

  const render = useCallback(() => {
    if (!image || !sourceCanvasRef.current || !previewCanvasRef.current) return;

    // 等比缩放到 MAX_DIM,限制内存
    const nw = image.naturalWidth;
    const nh = image.naturalHeight;
    const scale = Math.min(1, MAX_DIM / Math.max(nw, nh));
    const w = Math.max(1, Math.round(nw * scale));
    const h = Math.max(1, Math.round(nh * scale));

    const srcCanvas = sourceCanvasRef.current;
    srcCanvas.width = w;
    srcCanvas.height = h;
    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
    if (!srcCtx) return;
    srcCtx.drawImage(image, 0, 0, w, h);
    let workerSource: ImageData;
    let workerPixelSize = pixelSize;
    let workerPaletteId = paletteId;
    let workerDither = dither;
    let outputWidth = w;
    let outputHeight = h;

    if (isMinecraftMode) {
      const gridColumns = targetBlocksAcross;
      const gridRows = Math.max(
        1,
        Math.round((image.naturalHeight / image.naturalWidth) * gridColumns),
      );
      const gridCanvas = document.createElement('canvas');
      gridCanvas.width = gridColumns;
      gridCanvas.height = gridRows;
      const gridCtx = gridCanvas.getContext('2d', { willReadFrequently: true });
      if (!gridCtx) return;
      gridCtx.imageSmoothingEnabled = true;
      gridCtx.imageSmoothingQuality = 'high';
      gridCtx.drawImage(image, 0, 0, gridColumns, gridRows);
      workerSource = gridCtx.getImageData(0, 0, gridColumns, gridRows);
      workerPixelSize = 1;
      workerPaletteId = MINECRAFT_PALETTE.id;
      workerDither = false;

      const exportScale = Math.max(
        1,
        Math.min(16, Math.floor(2048 / gridColumns)),
      );
      outputWidth = gridColumns * exportScale;
      outputHeight = gridRows * exportScale;
    } else {
      workerSource = srcCtx.getImageData(0, 0, w, h);
    }

    const worker = new Worker(
      new URL('../workers/pixelize.worker.ts', import.meta.url),
      { type: 'module', name: 'pixvael-pixelizer' },
    );
    const request: PixelizeWorkerRequest = {
      source: workerSource,
      pixelSize: workerPixelSize,
      paletteId: workerPaletteId,
      dither: workerDither,
      includeMinecraftMaterials: isMinecraftMode,
    };

    worker.onmessage = (event: MessageEvent<PixelizeWorkerResponse>) => {
      let { result: resultData, materials } = event.data;
      const generatedBlockIds = isMinecraftMode
        ? blockIdsFromMinecraftImage(resultData)
        : [];
      let originalBlockIds = generatedBlockIds;
      let activeBlockIds = generatedBlockIds;
      if (isMinecraftMaker) {
        const editsKey = `${MINECRAFT_EDITS_PREFIX}:${sourceId}:${resultData.width}x${resultData.height}`;
        try {
          const storedEdits = localStorage.getItem(editsKey);
          if (storedEdits) {
            const parsedEdits: unknown = JSON.parse(storedEdits);
            const knownBlockIds = new Set(MINECRAFT_BLOCKS.map((block) => block.id));
            const isValidBlockList = (value: unknown): value is string[] =>
              Array.isArray(value) &&
              value.length === generatedBlockIds.length &&
              value.every(
                (blockId): blockId is string =>
                  typeof blockId === 'string' && knownBlockIds.has(blockId),
              );
            if (isValidBlockList(parsedEdits)) {
              activeBlockIds = parsedEdits;
              resultData = minecraftImageFromBlockIds(resultData, activeBlockIds);
              materials = materialsFromBlockIds(activeBlockIds);
            } else if (
              parsedEdits &&
              typeof parsedEdits === 'object' &&
              'original' in parsedEdits &&
              'edited' in parsedEdits &&
              isValidBlockList(parsedEdits.original) &&
              isValidBlockList(parsedEdits.edited)
            ) {
              originalBlockIds = parsedEdits.original;
              activeBlockIds = parsedEdits.edited;
              resultData = minecraftImageFromBlockIds(resultData, activeBlockIds);
              materials = materialsFromBlockIds(activeBlockIds);
            }
          }
        } catch {
          localStorage.removeItem(editsKey);
        }
      }
      const tmp = document.createElement('canvas');
      tmp.width = resultData.width;
      tmp.height = resultData.height;
      tmp.getContext('2d')?.putImageData(resultData, 0, 0);

      const full = document.createElement('canvas');
      full.width = outputWidth;
      full.height = outputHeight;
      const fullCtx = full.getContext('2d');
      const previewCanvas = previewCanvasRef.current;
      const previewCtx = previewCanvas?.getContext('2d');
      if (!fullCtx || !previewCanvas || !previewCtx) {
        worker.terminate();
        setIsRendering(false);
        return;
      }
      fullCtx.imageSmoothingEnabled = false;
      fullCtx.drawImage(tmp, 0, 0, outputWidth, outputHeight);
      fullCanvasRef.current = full;

      const minecraftPreviewScale = Math.max(
        4,
        Math.min(20, Math.floor(640 / resultData.width)),
      );
      const displayW = isMinecraftMode
        ? resultData.width * minecraftPreviewScale
        : Math.min(w, 640);
      const displayH = isMinecraftMode
        ? resultData.height * minecraftPreviewScale
        : Math.round(resultData.height * (displayW / resultData.width));
      previewCanvas.width = displayW;
      previewCanvas.height = displayH;
      previewCtx.imageSmoothingEnabled = false;
      previewCtx.drawImage(tmp, 0, 0, displayW, displayH);
      if (isMinecraftMode) {
        const nextGrid = { columns: resultData.width, rows: resultData.height };
        const previewBase = document.createElement('canvas');
        previewBase.width = displayW;
        previewBase.height = displayH;
        const previewBaseCtx = previewBase.getContext('2d');
        if (previewBaseCtx) {
          previewBaseCtx.imageSmoothingEnabled = false;
          previewBaseCtx.drawImage(tmp, 0, 0, displayW, displayH);
          minecraftPreviewBaseRef.current = previewBase;
        }
        minecraftResultRef.current = resultData;
        const progressKey = `${MINECRAFT_PROGRESS_PREFIX}:${sourceId}:${nextGrid.columns}x${nextGrid.rows}`;
        let restoredCells = new Set<number>();
        try {
          const storedProgress = localStorage.getItem(progressKey);
          if (storedProgress) {
            const parsedProgress: unknown = JSON.parse(storedProgress);
            if (Array.isArray(parsedProgress)) {
              restoredCells = new Set(
                parsedProgress.filter(
                  (index): index is number =>
                    Number.isInteger(index) && index >= 0 && index < resultData.width * resultData.height,
                ),
              );
            }
          }
        } catch {
          localStorage.removeItem(progressKey);
        }
        setMinecraftGrid(nextGrid);
        setMinecraftMaterials(materials);
        setMinecraftCellBlockIds(activeBlockIds);
        setOriginalMinecraftCellBlockIds(originalBlockIds);
        setEditHistory([activeBlockIds]);
        setEditHistoryIndex(0);
        setCompletedCells(restoredCells);
        setHoveredCell(null);
        setHoveredBlock(null);
        setActiveSectionIndex(0);
      }
      setError(null);
      setIsRendering(false);
      worker.terminate();
    };
    worker.onerror = () => {
      worker.terminate();
      setError('Could not render the image in the background worker.');
      setIsRendering(false);
    };
    worker.postMessage(request, [workerSource.data.buffer]);

    return () => worker.terminate();
  }, [
    image,
    pixelSize,
    paletteId,
    dither,
    isMinecraftMode,
    isMinecraftMaker,
    targetBlocksAcross,
    sourceId,
  ]);

  useEffect(() => {
    if (!image) return;

    let stopWorker: void | (() => void);
    const timeout = window.setTimeout(() => {
      setIsRendering(true);
      stopWorker = render();
    }, 80);

    return () => {
      window.clearTimeout(timeout);
      stopWorker?.();
    };
  }, [image, render]);

  useEffect(() => {
    if (!isMinecraftConverter || !image) return;
    let cancelled = false;
    const workers: Worker[] = [];
    const previews: ConverterPreview[] = [];
    const timeout = window.setTimeout(() => {
      for (const width of CONVERTER_WIDTHS) {
        const height = Math.max(
          1,
          Math.round((image.naturalHeight / image.naturalWidth) * width),
        );
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
        if (!sourceCtx) continue;
        sourceCtx.imageSmoothingEnabled = true;
        sourceCtx.imageSmoothingQuality = 'high';
        sourceCtx.drawImage(image, 0, 0, width, height);
        const source = sourceCtx.getImageData(0, 0, width, height);
        const worker = new Worker(
          new URL('../workers/pixelize.worker.ts', import.meta.url),
          { type: 'module', name: `pixvael-compare-${width}` },
        );
        workers.push(worker);
        worker.onmessage = (event: MessageEvent<PixelizeWorkerResponse>) => {
          if (cancelled) {
            worker.terminate();
            return;
          }
          const resultCanvas = document.createElement('canvas');
          resultCanvas.width = event.data.result.width;
          resultCanvas.height = event.data.result.height;
          resultCanvas
            .getContext('2d')
            ?.putImageData(event.data.result, 0, 0);
          previews.push({
            width: event.data.result.width,
            height: event.data.result.height,
            totalBlocks: event.data.result.width * event.data.result.height,
            materialCount: event.data.materials.length,
            imageUrl: resultCanvas.toDataURL('image/png'),
          });
          worker.terminate();
          if (previews.length === CONVERTER_WIDTHS.length) {
            setConverterPreviews(
              [...previews].sort((a, b) => a.width - b.width),
            );
          }
        };
        worker.onerror = () => {
          worker.terminate();
          if (!cancelled) {
            setError('Could not generate all comparison variants.');
          }
        };
        const request: PixelizeWorkerRequest = {
          source,
          pixelSize: 1,
          paletteId: MINECRAFT_PALETTE.id,
          dither: false,
          includeMinecraftMaterials: true,
        };
        worker.postMessage(request, [source.data.buffer]);
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      workers.forEach((worker) => worker.terminate());
    };
  }, [image, isMinecraftConverter]);

  useEffect(() => {
    if (!isMinecraftMode || !minecraftGrid) return;
    const previewCanvas = previewCanvasRef.current;
    const previewBase = minecraftPreviewBaseRef.current;
    const previewCtx = previewCanvas?.getContext('2d');
    if (!previewCanvas || !previewBase || !previewCtx) return;

    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.drawImage(previewBase, 0, 0);
    if (showGrid) {
      drawMinecraftGrid(
        previewCtx,
        previewCanvas.width,
        previewCanvas.height,
        minecraftGrid.columns,
        minecraftGrid.rows,
      );
    }
    drawMinecraftProgress(
      previewCtx,
      previewCanvas.width,
      previewCanvas.height,
      minecraftGrid,
      completedCells,
      hoveredCell,
    );
    drawSectionFocus(
      previewCtx,
      previewCanvas.width,
      previewCanvas.height,
      minecraftGrid,
      sectionSize,
      activeSectionIndex,
    );
  }, [
    activeSectionIndex,
    completedCells,
    hoveredCell,
    isMinecraftMode,
    minecraftCellBlockIds,
    minecraftGrid,
    sectionSize,
    showGrid,
  ]);

  useEffect(() => {
    if (!isMinecraftMode || !minecraftGrid || !sourceId) return;
    const progressKey = `${MINECRAFT_PROGRESS_PREFIX}:${sourceId}:${minecraftGrid.columns}x${minecraftGrid.rows}`;
    localStorage.setItem(progressKey, JSON.stringify(Array.from(completedCells)));
  }, [completedCells, isMinecraftMode, minecraftGrid, sourceId]);

  useEffect(() => {
    if (!isMinecraftMode || image) return;
    const rememberedImage = sessionStorage.getItem(SESSION_IMAGE_KEY);
    if (!rememberedImage) return;

    const token = ++tokenRef.current;
    const restoredImage = new Image();
    restoredImage.onload = () => {
      if (token !== tokenRef.current) return;
      setSourceId(
        sessionStorage.getItem(SESSION_IMAGE_ID_KEY) ??
          `${restoredImage.naturalWidth}x${restoredImage.naturalHeight}`,
      );
      setImage(restoredImage);
      setIsRestoredImage(true);
    };
    restoredImage.onerror = () => {
      if (token !== tokenRef.current) return;
      sessionStorage.removeItem(SESSION_IMAGE_KEY);
      setError('The previous session image could not be restored.');
    };
    restoredImage.src = rememberedImage;
  }, [image, isMinecraftMode]);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setIsRestoredImage(false);
    setConverterPreviews([]);
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file (JPG, PNG, or WebP).');
      return;
    }
    const token = ++tokenRef.current;
    const url = URL.createObjectURL(file);
    const nextSourceId = `${file.name}:${file.size}:${file.lastModified}`;
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (token !== tokenRef.current) return; // 忽略过期加载
      const normalizedSource = rememberImageForMinecraftMode(img, nextSourceId);
      setSourceId(nextSourceId);
      setCompletedCells(new Set());
      setHoveredCell(null);
      setHoveredBlock(null);
      if (!isMinecraftMode) {
        setImage(img);
        return;
      }
      if (!normalizedSource) {
        setImage(img);
        return;
      }
      const normalizedImage = new Image();
      normalizedImage.onload = () => {
        if (token !== tokenRef.current) return;
        setImage(normalizedImage);
      };
      normalizedImage.onerror = () => {
        if (token !== tokenRef.current) return;
        setImage(img);
      };
      normalizedImage.src = normalizedSource;
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (token !== tokenRef.current) return;
      setError('Could not load that image. It may be corrupted or too large.');
    };
    img.src = url;
  }, [isMinecraftMode]);

  const cellFromPointer = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!minecraftGrid || !previewCanvasRef.current) return null;
      const bounds = previewCanvasRef.current.getBoundingClientRect();
      const column = Math.min(
        minecraftGrid.columns - 1,
        Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * minecraftGrid.columns)),
      );
      const row = Math.min(
        minecraftGrid.rows - 1,
        Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * minecraftGrid.rows)),
      );
      return { column, row, index: row * minecraftGrid.columns + column };
    },
    [minecraftGrid],
  );

  const toggleCompletedCell = useCallback((cell: MinecraftCell | null) => {
    if (!cell) return;
    setCompletedCells((currentCells) => {
      const nextCells = new Set(currentCells);
      if (nextCells.has(cell.index)) nextCells.delete(cell.index);
      else nextCells.add(cell.index);
      return nextCells;
    });
  }, []);

  const selectMinecraftCell = useCallback(
    (cell: MinecraftCell | null) => {
      const result = minecraftResultRef.current;
      setHoveredCell(cell);
      if (!cell || !result) {
        setHoveredBlock(null);
        return;
      }
      const offset = cell.index * 4;
      setHoveredBlock(
        MINECRAFT_BLOCKS.find(
          (block) =>
            result.data[offset] === block.color.r &&
            result.data[offset + 1] === block.color.g &&
            result.data[offset + 2] === block.color.b,
        ) ?? null,
      );
    },
    [],
  );

  const inspectMinecraftCell = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      selectMinecraftCell(cellFromPointer(event));
    },
    [cellFromPointer, selectMinecraftCell],
  );

  const navigateMinecraftGrid = useCallback(
    (event: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (!minecraftGrid) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleCompletedCell(hoveredCell ?? { column: 0, row: 0, index: 0 });
        if (!hoveredCell) {
          selectMinecraftCell({ column: 0, row: 0, index: 0 });
        }
        return;
      }
      const movement = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[event.key];
      if (!movement) return;
      event.preventDefault();
      const current = hoveredCell ?? { column: 0, row: 0, index: 0 };
      const column = Math.min(
        minecraftGrid.columns - 1,
        Math.max(0, current.column + movement[0]),
      );
      const row = Math.min(
        minecraftGrid.rows - 1,
        Math.max(0, current.row + movement[1]),
      );
      selectMinecraftCell({
        column,
        row,
        index: row * minecraftGrid.columns + column,
      });
    },
    [hoveredCell, minecraftGrid, selectMinecraftCell, toggleCompletedCell],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDownload = useCallback(() => {
    if (!fullCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'pixvael-pixel-art.png';
    link.href = fullCanvasRef.current.toDataURL('image/png');
    link.click();
  }, []);

  const handleMaterialsDownload = useCallback(() => {
    if (!minecraftGrid || minecraftMaterials.length === 0) return;
    const rows = [
      'Block,Count',
      ...minecraftMaterials.map(
        (material) => `"${material.name.replaceAll('"', '""')}",${material.count}`,
      ),
      '',
      `Grid,${minecraftGrid.columns} x ${minecraftGrid.rows}`,
      `Total blocks,${minecraftMaterials.reduce(
        (sum, material) => sum + material.count,
        0,
      )}`,
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'pixvael-minecraft-materials.csv';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [minecraftGrid, minecraftMaterials]);

  const handleBlueprintDownload = useCallback(() => {
    const result = minecraftResultRef.current;
    if (!minecraftGrid || !result) return;
    const cellSize = 16;
    const leftMargin = 64;
    const topMargin = 96;
    const rightMargin = 24;
    const bottomMargin = 40;
    const canvas = document.createElement('canvas');
    canvas.width = leftMargin + minecraftGrid.columns * cellSize + rightMargin;
    canvas.height = topMargin + minecraftGrid.rows * cellSize + bottomMargin;
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
      `${minecraftGrid.columns} x ${minecraftGrid.rows} blocks / ${sectionSize} x ${sectionSize} sections`,
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
    for (let column = 0; column <= minecraftGrid.columns; column++) {
      const x = leftMargin + column * cellSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, topMargin);
      ctx.lineTo(x, topMargin + minecraftGrid.rows * cellSize);
      ctx.strokeStyle = column % sectionSize === 0 ? 'rgba(255,209,102,0.9)' : 'rgba(0,0,0,0.42)';
      ctx.lineWidth = column % sectionSize === 0 ? 2 : 1;
      ctx.stroke();
      if (column < minecraftGrid.columns && column % sectionSize === 0) {
        ctx.fillStyle = '#ffd166';
        ctx.fillText(String(column + 1), x + (cellSize * Math.min(sectionSize, minecraftGrid.columns - column)) / 2, topMargin - 14);
      }
    }
    for (let row = 0; row <= minecraftGrid.rows; row++) {
      const y = topMargin + row * cellSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(leftMargin + minecraftGrid.columns * cellSize, y);
      ctx.strokeStyle = row % sectionSize === 0 ? 'rgba(255,209,102,0.9)' : 'rgba(0,0,0,0.42)';
      ctx.lineWidth = row % sectionSize === 0 ? 2 : 1;
      ctx.stroke();
      if (row < minecraftGrid.rows && row % sectionSize === 0) {
        ctx.fillStyle = '#ffd166';
        ctx.fillText(String(row + 1), leftMargin - 22, y + (cellSize * Math.min(sectionSize, minecraftGrid.rows - row)) / 2);
      }
    }

    const link = document.createElement('a');
    link.download = 'pixvael-minecraft-blueprint.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [minecraftGrid, sectionSize]);

  const currentPalette = isMinecraftMode
    ? MINECRAFT_PALETTE
    : getPalette(paletteId);
  const currentPalettePreview = isMinecraftMode
    ? MINECRAFT_BLOCKS.slice(0, 8).map((block) => rgbValue(block.color))
    : palettePreviewColors(paletteId);
  const imageSize = image
    ? `${image.naturalWidth} x ${image.naturalHeight}`
    : 'waiting for image';
  const minecraftBlockTotal = minecraftMaterials.reduce(
    (sum, material) => sum + material.count,
    0,
  );
  const sectionColumnCount = minecraftGrid
    ? Math.ceil(minecraftGrid.columns / sectionSize)
    : 0;
  const sectionRowCount = minecraftGrid
    ? Math.ceil(minecraftGrid.rows / sectionSize)
    : 0;
  const sectionCount = sectionColumnCount * sectionRowCount;
  const activeSectionColumn = activeSectionIndex % Math.max(1, sectionColumnCount);
  const activeSectionRow = Math.floor(activeSectionIndex / Math.max(1, sectionColumnCount));
  const sectionStartColumn = activeSectionColumn * sectionSize;
  const sectionStartRow = activeSectionRow * sectionSize;
  const sectionEndColumn = minecraftGrid
    ? Math.min(sectionStartColumn + sectionSize, minecraftGrid.columns)
    : 0;
  const sectionEndRow = minecraftGrid
    ? Math.min(sectionStartRow + sectionSize, minecraftGrid.rows)
    : 0;
  const activeSectionCells: Array<{
    cell: MinecraftCell;
    block: MinecraftBlock;
  }> = [];
  if (minecraftGrid) {
    for (let row = sectionStartRow; row < sectionEndRow; row++) {
      for (let column = sectionStartColumn; column < sectionEndColumn; column++) {
        const index = row * minecraftGrid.columns + column;
        const block =
          MINECRAFT_BLOCKS.find(
            (candidate) => candidate.id === minecraftCellBlockIds[index],
          ) ?? MINECRAFT_BLOCKS[0];
        activeSectionCells.push({
          cell: { column, row, index },
          block,
        });
      }
    }
  }
  const activeSectionCompleted = activeSectionCells.filter(({ cell }) =>
    completedCells.has(cell.index),
  ).length;
  const activeSectionIsComplete =
    activeSectionCells.length > 0 &&
    activeSectionCompleted === activeSectionCells.length;
  const activeSectionMaterials = Array.from(
    activeSectionCells.reduce((counts, { block }) => {
      counts.set(block.id, (counts.get(block.id) ?? 0) + 1);
      return counts;
    }, new Map<string, number>()),
  )
    .map(([blockId, count]) => ({
      block: MINECRAFT_BLOCKS.find((block) => block.id === blockId) ?? MINECRAFT_BLOCKS[0],
      count,
    }))
    .sort((a, b) => b.count - a.count);
  const editedCellCount = minecraftCellBlockIds.reduce(
    (count, blockId, index) =>
      count + (blockId !== originalMinecraftCellBlockIds[index] ? 1 : 0),
    0,
  );

  function applyMinecraftCellIds(nextBlockIds: string[]) {
    const currentResult = minecraftResultRef.current;
    const previewBase = minecraftPreviewBaseRef.current;
    const fullCanvas = fullCanvasRef.current;
    if (!currentResult || !previewBase || !fullCanvas) return;
    const nextData = new Uint8ClampedArray(currentResult.data);
    const counts = new Map<string, number>();
    nextBlockIds.forEach((blockId, index) => {
      const block =
        MINECRAFT_BLOCKS.find((candidate) => candidate.id === blockId) ??
        MINECRAFT_BLOCKS[0];
      const offset = index * 4;
      nextData[offset] = block.color.r;
      nextData[offset + 1] = block.color.g;
      nextData[offset + 2] = block.color.b;
      nextData[offset + 3] = 255;
      counts.set(block.id, (counts.get(block.id) ?? 0) + 1);
    });
    const nextResult = new ImageData(
      nextData,
      currentResult.width,
      currentResult.height,
    );
    minecraftResultRef.current = nextResult;
    const tinyCanvas = document.createElement('canvas');
    tinyCanvas.width = nextResult.width;
    tinyCanvas.height = nextResult.height;
    tinyCanvas.getContext('2d')?.putImageData(nextResult, 0, 0);
    const previewBaseCtx = previewBase.getContext('2d');
    const fullCtx = fullCanvas.getContext('2d');
    if (previewBaseCtx) {
      previewBaseCtx.imageSmoothingEnabled = false;
      previewBaseCtx.clearRect(0, 0, previewBase.width, previewBase.height);
      previewBaseCtx.drawImage(
        tinyCanvas,
        0,
        0,
        previewBase.width,
        previewBase.height,
      );
    }
    if (fullCtx) {
      fullCtx.imageSmoothingEnabled = false;
      fullCtx.clearRect(0, 0, fullCanvas.width, fullCanvas.height);
      fullCtx.drawImage(tinyCanvas, 0, 0, fullCanvas.width, fullCanvas.height);
    }
    setMinecraftMaterials(
      MINECRAFT_BLOCKS.flatMap((block) => {
        const count = counts.get(block.id) ?? 0;
        return count > 0 ? [{ ...block, count }] : [];
      }).sort((a, b) => b.count - a.count),
    );
    setMinecraftCellBlockIds(nextBlockIds);
  }

  function persistMinecraftEdits(blockIds: string[]) {
    if (!minecraftGrid || !sourceId) return;
    const editsKey = `${MINECRAFT_EDITS_PREFIX}:${sourceId}:${minecraftGrid.columns}x${minecraftGrid.rows}`;
    try {
      localStorage.setItem(
        editsKey,
        JSON.stringify({
          original: originalMinecraftCellBlockIds,
          edited: blockIds,
        }),
      );
    } catch (storageError) {
      if (
        storageError instanceof DOMException &&
        storageError.name === 'QuotaExceededError'
      ) {
        setError('Browser storage is full. Edits will remain until this tab closes.');
        return;
      }
      throw storageError;
    }
  }

  function commitMinecraftEdit(nextBlockIds: string[]) {
    const nextHistory = [
      ...editHistory.slice(0, editHistoryIndex + 1),
      nextBlockIds,
    ].slice(-50);
    setEditHistory(nextHistory);
    setEditHistoryIndex(nextHistory.length - 1);
    applyMinecraftCellIds(nextBlockIds);
    persistMinecraftEdits(nextBlockIds);
  }

  function undoMinecraftEdit() {
    if (editHistoryIndex <= 0) return;
    const nextIndex = editHistoryIndex - 1;
    const previousBlockIds = editHistory[nextIndex];
    setEditHistoryIndex(nextIndex);
    applyMinecraftCellIds(previousBlockIds);
    persistMinecraftEdits(previousBlockIds);
  }

  function redoMinecraftEdit() {
    if (editHistoryIndex >= editHistory.length - 1) return;
    const nextIndex = editHistoryIndex + 1;
    const nextBlockIds = editHistory[nextIndex];
    setEditHistoryIndex(nextIndex);
    applyMinecraftCellIds(nextBlockIds);
    persistMinecraftEdits(nextBlockIds);
  }

  function resetMinecraftEdits() {
    if (originalMinecraftCellBlockIds.length === 0) return;
    commitMinecraftEdit([...originalMinecraftCellBlockIds]);
  }

  function editMakerCell(cell: MinecraftCell) {
    if (makerTool === 'build') {
      toggleCompletedCell(cell);
      return;
    }
    if (makerTool === 'pick') {
      setSelectedBlockId(minecraftCellBlockIds[cell.index]);
      setMakerTool('paint');
      return;
    }
    const nextBlockId =
      makerTool === 'restore'
        ? originalMinecraftCellBlockIds[cell.index]
        : selectedBlockId;
    if (!nextBlockId || nextBlockId === minecraftCellBlockIds[cell.index]) return;
    const nextBlockIds = [...minecraftCellBlockIds];
    nextBlockIds[cell.index] = nextBlockId;
    commitMinecraftEdit(nextBlockIds);
  }

  function toggleActiveSection() {
    setCompletedCells((currentCells) => {
      const nextCells = new Set(currentCells);
      for (const { cell } of activeSectionCells) {
        if (activeSectionIsComplete) nextCells.delete(cell.index);
        else nextCells.add(cell.index);
      }
      return nextCells;
    });
  }

  function goToNextIncompleteSection() {
    if (!minecraftGrid || sectionCount === 0) return;
    for (let step = 1; step <= sectionCount; step++) {
      const candidateIndex = (activeSectionIndex + step) % sectionCount;
      const candidateColumn = candidateIndex % sectionColumnCount;
      const candidateRow = Math.floor(candidateIndex / sectionColumnCount);
      let isComplete = true;
      for (
        let row = candidateRow * sectionSize;
        row < Math.min((candidateRow + 1) * sectionSize, minecraftGrid.rows);
        row++
      ) {
        for (
          let column = candidateColumn * sectionSize;
          column < Math.min((candidateColumn + 1) * sectionSize, minecraftGrid.columns);
          column++
        ) {
          if (!completedCells.has(row * minecraftGrid.columns + column)) {
            isComplete = false;
            break;
          }
        }
        if (!isComplete) break;
      }
      if (!isComplete) {
        setActiveSectionIndex(candidateIndex);
        return;
      }
    }
  }

  function downloadActiveSectionBlueprint() {
    if (!minecraftGrid || activeSectionCells.length === 0) return;
    const columns = sectionEndColumn - sectionStartColumn;
    const rows = sectionEndRow - sectionStartRow;
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
      `X ${sectionStartColumn + 1}-${sectionEndColumn} / Y ${sectionStartRow + 1}-${sectionEndRow}`,
      leftMargin,
      50,
    );
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const { cell, block } of activeSectionCells) {
      const localColumn = cell.column - sectionStartColumn;
      const localRow = cell.row - sectionStartRow;
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
    const link = document.createElement('a');
    link.download = `pixvael-zone-${activeSectionIndex + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="pixel-panel w-full" id="tool">
      <canvas ref={sourceCanvasRef} className="hidden" />

      <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-black/35 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="terminal-label">
            {isMinecraftMaker
              ? '/ minecraft block editor'
              : isMinecraftConverter
                ? '/ minecraft conversion lab'
              : isMinecraftMode
                ? '/ minecraft build planner'
                : '/ open tool'}
          </p>
          <h2 className="mt-2 text-2xl font-black text-[var(--paper)]">
            {isMinecraftMaker
              ? 'Generate a base, repaint blocks, export your design.'
              : isMinecraftConverter
                ? 'Compare four build sizes, then export the best plan.'
              : isMinecraftMode
              ? 'Set the build grid, count blocks, export a guide.'
              : 'Drop an image, tune the blocks, export PNG.'}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-right">
          <span className="status-chip">local canvas</span>
          <span className="status-chip">no upload</span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="m-4 border border-[var(--pixel-rose)] bg-[rgba(255,92,122,0.12)] p-3 font-mono text-sm text-[var(--paper)]"
        >
          {error}
        </p>
      )}

      {!image ? (
        <button
          type="button"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`checker-field m-4 flex min-h-[360px] w-[calc(100%-2rem)] cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 text-center transition-colors sm:p-10 ${
            isDragging
              ? 'border-[var(--pixel-lime)] bg-[rgba(184,255,61,0.1)]'
              : 'border-[var(--line-bright)] hover:border-[var(--pixel-lime)]'
          }`}
        >
          <span
            className="mb-7 grid size-24 grid-cols-4 gap-1"
            aria-hidden="true"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className={
                  i === 5 || i === 6 || i === 9 || i === 10
                    ? 'bg-[var(--pixel-lime)]'
                    : i % 3 === 0
                      ? 'bg-[var(--pixel-gold)]'
                      : 'bg-[rgba(246,241,223,0.2)]'
                }
              />
            ))}
          </span>
          <span className="font-pixel text-lg leading-relaxed text-[var(--paper)] sm:text-2xl">
            {isMinecraftMode ? 'Choose a build image' : 'Upload image'}
          </span>
          <span className="mt-4 max-w-md text-sm leading-6 text-[var(--paper-muted)] sm:text-base">
            {isMinecraftMode
              ? 'Drop a clear JPG, PNG, or WebP. Pixvael will map it to Minecraft blocks and build a material list locally.'
              : 'Drop a JPG, PNG, or WebP here. The conversion runs in your browser, so the source image stays on your machine.'}
          </span>
          <span className="pixel-button mt-7 text-sm">Choose file</span>
        </button>
      ) : (
        <div
          className={`grid gap-4 p-4 ${
            isMinecraftMode
              ? ''
              : 'lg:grid-cols-[minmax(0,1fr)_340px]'
          }`}
        >
          <div className="pixel-panel-raised overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-black/35 px-4 py-3">
              <p className="font-mono text-xs uppercase text-[var(--paper-muted)]">
                preview / {imageSize}
                {isRestoredImage ? ' / session restored' : ''}
              </p>
              <p
                className="font-mono text-xs text-[var(--pixel-lime)]"
                aria-live="polite"
              >
                {isRendering
                  ? 'rendering...'
                  : isMinecraftMode && minecraftGrid
                  ? `${minecraftGrid.columns} x ${minecraftGrid.rows} blocks`
                  : `${pixelSize}px blocks`}
              </p>
            </div>
            <div className="checker-field flex min-h-[360px] flex-col items-center justify-center gap-3 p-3 sm:p-5">
              <canvas
                ref={previewCanvasRef}
                className={`block h-auto max-w-full border border-black bg-black shadow-[0_0_0_1px_rgba(246,241,223,0.12)] ${
                  isMinecraftMode ? 'cursor-crosshair touch-none' : ''
                }`}
                style={{ imageRendering: 'pixelated' }}
                role={isMinecraftMode ? 'grid' : undefined}
                tabIndex={isMinecraftMode ? 0 : undefined}
                aria-label={
                  isMinecraftMode
                    ? 'Interactive Minecraft build grid. Use arrow keys to move and Enter or Space to mark a block complete.'
                    : undefined
                }
                aria-rowcount={isMinecraftMode ? minecraftGrid?.rows : undefined}
                aria-colcount={isMinecraftMode ? minecraftGrid?.columns : undefined}
                aria-describedby={isMinecraftMode ? 'minecraft-grid-status' : undefined}
                onPointerMove={
                  isMinecraftMode ? inspectMinecraftCell : undefined
                }
                onPointerLeave={
                  isMinecraftMode
                    ? () => {
                        setHoveredCell(null);
                        setHoveredBlock(null);
                      }
                    : undefined
                }
                onClick={
                  isMinecraftMode
                    ? (event) => toggleCompletedCell(cellFromPointer(event))
                    : undefined
                }
                onKeyDown={
                  isMinecraftMode ? navigateMinecraftGrid : undefined
                }
              />
              {isMinecraftMode && minecraftGrid && (
                <div className="grid w-full gap-2 border border-[var(--line)] bg-black/55 p-3 font-mono text-xs sm:grid-cols-[1fr_auto] sm:items-center">
                  <p
                    id="minecraft-grid-status"
                    className="text-[var(--paper)]"
                    aria-live="polite"
                  >
                    {hoveredCell && hoveredBlock ? (
                      <>
                        <span className="text-[var(--pixel-lime)]">
                          X {hoveredCell.column + 1} / Y {hoveredCell.row + 1}
                        </span>{' '}
                        · {hoveredBlock.name} ·{' '}
                        {completedCells.has(hoveredCell.index) ? 'complete' : 'not built'}
                      </>
                    ) : (
                      'Hover, tap, or use arrow keys to inspect. Click, Enter, or Space marks a block complete.'
                    )}
                  </p>
                  <p className="text-[var(--paper-muted)]">
                    {completedCells.size.toLocaleString()} /{' '}
                    {(minecraftGrid.columns * minecraftGrid.rows).toLocaleString()} complete
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="pixel-panel-raised flex flex-col gap-5 p-4">
            <div>
              <p className="terminal-label">controls</p>
              <p className="mt-2 text-sm leading-6 text-[var(--paper-muted)]">
                {isMinecraftMaker
                  ? 'Choose the canvas width, then use the block editor below to repaint individual cells.'
                  : isMinecraftConverter
                    ? 'Compare four generated sizes below, then fine-tune the selected grid and exports.'
                  : isMinecraftMode
                  ? 'Choose the build width. Height, block colors, and material counts update automatically.'
                  : 'Push the block size for chunkier art, then limit the palette for a stronger retro read.'}
              </p>
            </div>

            {isMinecraftMode ? (
              <>
                <label className="block">
                  <span className="flex items-center justify-between gap-4 font-mono text-sm text-[var(--paper)]">
                    <span>Build width</span>
                    <span className="text-[var(--pixel-lime)]">
                      {targetBlocksAcross} blocks
                    </span>
                  </span>
                  <input
                    type="range"
                    min={MINECRAFT_GRID_MIN}
                    max={MINECRAFT_GRID_MAX}
                    step={MINECRAFT_GRID_STEP}
                    value={targetBlocksAcross}
                    onChange={(event) =>
                      setTargetBlocksAcross(Number(event.target.value))
                    }
                    className="range-control mt-3 w-full"
                  />
                  <div className="mt-2 flex justify-between font-mono text-[0.65rem] text-[var(--paper-muted)]">
                    <span>16</span>
                    <span>64</span>
                    <span>128</span>
                  </div>
                </label>

                <div className="border border-[var(--line)] bg-black/25 p-3">
                  <p className="font-mono text-sm text-[var(--paper)]">
                    Minecraft block palette
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--paper-muted)]">
                    20 common concrete, stone, wood, and sandstone colors.
                  </p>
                  <div
                    className="mt-3 flex gap-1"
                    aria-label={currentPalette.name}
                  >
                    {currentPalettePreview.map((color) => (
                      <span
                        key={color}
                        className="h-7 flex-1 border border-black"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-3 border border-[var(--line)] bg-black/25 p-3">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(event) => setShowGrid(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--pixel-lime)]"
                  />
                  <span className="text-sm leading-6 text-[var(--paper-muted)]">
                    <span className="block font-mono text-[var(--paper)]">
                      Show build grid
                    </span>
                    Every eighth line is brighter for easier counting.
                  </span>
                </label>

                {minecraftGrid && (
                  <div className="border border-[var(--line)] bg-black/25 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span>
                        <span className="block font-mono text-sm text-[var(--paper)]">
                          Build section
                        </span>
                        <span className="mt-1 block text-xs text-[var(--paper-muted)]">
                          Zone {activeSectionIndex + 1} of {sectionCount} · X{' '}
                          {activeSectionColumn * sectionSize + 1}–
                          {Math.min((activeSectionColumn + 1) * sectionSize, minecraftGrid.columns)} · Y{' '}
                          {activeSectionRow * sectionSize + 1}–
                          {Math.min((activeSectionRow + 1) * sectionSize, minecraftGrid.rows)}
                        </span>
                      </span>
                      <div className="flex border border-[var(--line-bright)] font-mono text-xs">
                        {([8, 16] as const).map((size) => (
                          <button
                            key={size}
                            type="button"
                            aria-pressed={sectionSize === size}
                            onClick={() => {
                              setSectionSize(size);
                              setActiveSectionIndex(0);
                            }}
                            className={`min-h-9 px-3 ${
                              sectionSize === size
                                ? 'bg-[var(--pixel-lime)] text-black'
                                : 'text-[var(--paper-muted)] hover:text-[var(--paper)]'
                            }`}
                          >
                            {size}×{size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-[44px_1fr_44px] items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous build section"
                        disabled={activeSectionIndex === 0}
                        onClick={() => setActiveSectionIndex((index) => Math.max(0, index - 1))}
                        className="min-h-10 border border-[var(--line-bright)] font-mono text-[var(--paper)] hover:border-[var(--pixel-lime)] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        ←
                      </button>
                      <div className="h-2 overflow-hidden bg-black">
                        <div
                          className="h-full bg-[var(--pixel-gold)] transition-[width]"
                          style={{ width: `${sectionCount > 0 ? ((activeSectionIndex + 1) / sectionCount) * 100 : 0}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Next build section"
                        disabled={activeSectionIndex >= sectionCount - 1}
                        onClick={() =>
                          setActiveSectionIndex((index) => Math.min(sectionCount - 1, index + 1))
                        }
                        className="min-h-10 border border-[var(--line-bright)] font-mono text-[var(--paper)] hover:border-[var(--pixel-lime)] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        →
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 border border-[var(--line)] bg-black/25 p-3">
                  <span className="text-sm leading-5 text-[var(--paper-muted)]">
                    <span className="block font-mono text-[var(--paper)]">
                      Build progress
                    </span>
                    Saved locally for this image and grid size.
                  </span>
                  <button
                    type="button"
                    onClick={() => setCompletedCells(new Set())}
                    disabled={completedCells.size === 0}
                    className="shrink-0 border border-[var(--line-bright)] px-3 py-2 font-mono text-xs text-[var(--paper)] transition-colors hover:border-[var(--pixel-lime)] hover:text-[var(--pixel-lime)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="flex items-center justify-between gap-4 font-mono text-sm text-[var(--paper)]">
                    <span>Block size</span>
                    <span className="text-[var(--pixel-lime)]">{pixelSize}px</span>
                  </span>
                  <input
                    type="range"
                    min={2}
                    max={32}
                    value={pixelSize}
                    onChange={(e) => setPixelSize(Number(e.target.value))}
                    className="range-control mt-3 w-full"
                  />
                </label>

                <label className="block">
                  <span className="font-mono text-sm text-[var(--paper)]">
                    Palette
                  </span>
                  <select
                    value={paletteId}
                    onChange={(e) => setPaletteId(e.target.value)}
                    className="control-field mt-3 w-full px-3 py-3"
                  >
                    {PALETTES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div
                    className="mt-3 flex gap-1"
                    aria-label={currentPalette.name}
                  >
                    {currentPalettePreview.map((color) => (
                      <span
                        key={color}
                        className="h-7 flex-1 border border-black"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </label>

                <label className="flex items-start gap-3 border border-[var(--line)] bg-black/25 p-3">
                  <input
                    type="checkbox"
                    checked={dither}
                    onChange={(e) => setDither(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--pixel-lime)]"
                  />
                  <span className="text-sm leading-6 text-[var(--paper-muted)]">
                    <span className="block font-mono text-[var(--paper)]">
                      Floyd-Steinberg dithering
                    </span>
                    Best with limited palettes when flat color feels muddy.
                  </span>
                </label>
              </>
            )}

            <div className="mt-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isRendering}
                className="pixel-button text-sm disabled:cursor-wait disabled:opacity-50"
              >
                Download PNG
              </button>
              {isMinecraftMode && (
                <>
                  <button
                    type="button"
                    onClick={handleBlueprintDownload}
                    disabled={isRendering}
                    className="pixel-button pixel-button-amber text-sm disabled:cursor-wait disabled:opacity-50"
                  >
                    Download blueprint PNG
                  </button>
                  <button
                    type="button"
                    onClick={handleMaterialsDownload}
                    disabled={isRendering}
                    className="pixel-button pixel-button-secondary text-sm disabled:cursor-wait disabled:opacity-50"
                  >
                    Download materials CSV
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="pixel-button pixel-button-secondary text-sm"
              >
                New image
              </button>
            </div>
          </aside>
        </div>
      )}

      {image && isMinecraftConverter && (
        <section className="border-t border-[var(--line)] bg-black/30 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="terminal-label">conversion lab</p>
              <h3 className="mt-2 text-xl font-black text-[var(--paper)]">
                Compare build size before committing
              </h3>
            </div>
            <p className="font-mono text-xs text-[var(--paper-muted)]">
              Four variants · one source image
            </p>
          </div>
          {converterPreviews.length === 0 ? (
            <div className="mt-4 border border-[var(--line)] bg-black/30 p-8 text-center font-mono text-sm text-[var(--pixel-lime)]">
              Generating comparison variants...
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {converterPreviews.map((preview) => {
                const selected = targetBlocksAcross === preview.width;
                const label =
                  preview.width <= 24
                    ? 'Icon'
                    : preview.width <= 32
                      ? 'Compact'
                      : preview.width <= 48
                        ? 'Standard'
                        : 'Detailed';
                return (
                  <button
                    type="button"
                    key={preview.width}
                    aria-pressed={selected}
                    onClick={() => setTargetBlocksAcross(preview.width)}
                    className={`min-w-0 border p-3 text-left transition-colors ${
                      selected
                        ? 'border-[var(--pixel-gold)] bg-[rgba(255,157,0,0.08)]'
                        : 'border-[var(--line)] bg-black/30 hover:border-[var(--pixel-lime)]'
                    }`}
                  >
                    <span
                      className="block aspect-[4/3] w-full border border-black bg-black bg-contain bg-center bg-no-repeat [image-rendering:pixelated]"
                      style={{ backgroundImage: `url(${preview.imageUrl})` }}
                      role="img"
                      aria-label={`${label} ${preview.width} by ${preview.height} block preview`}
                    />
                    <span className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-[var(--paper)]">
                        {label}
                      </span>
                      <span className="font-mono text-xs text-[var(--pixel-lime)]">
                        {preview.width}×{preview.height}
                      </span>
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-[var(--paper-muted)]">
                      {preview.totalBlocks.toLocaleString()} blocks ·{' '}
                      {preview.materialCount} materials
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {image && isMinecraftMode && minecraftGrid && activeSectionCells.length > 0 && (
        <section className="border-t border-[var(--line)] bg-black/30 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="terminal-label">
                {isMinecraftMaker ? 'block editor' : 'section build mode'}
              </p>
              <h3 className="mt-2 text-xl font-black text-[var(--paper)]">
                Zone {activeSectionIndex + 1} · X {sectionStartColumn + 1}–{sectionEndColumn} · Y{' '}
                {sectionStartRow + 1}–{sectionEndRow}
              </h3>
            </div>
            <p className="font-mono text-sm text-[var(--pixel-lime)]">
              {activeSectionCompleted} / {activeSectionCells.length} built
            </p>
          </div>

          {isMinecraftMaker && (
            <div className="mt-4 border border-[var(--line)] bg-black/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-[var(--paper)]">
                    Editor tools
                  </p>
                  <p className="mt-1 text-xs text-[var(--paper-muted)]">
                    Paint replaces a block. Pick samples a cell. Restore returns it to the generated color.
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="text-[var(--pixel-lime)]">
                    {MINECRAFT_BLOCKS.find((block) => block.id === selectedBlockId)?.name}
                  </p>
                  <p className="mt-1 text-[var(--paper-muted)]">
                    {editedCellCount} edited · saved locally
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <div className="grid grid-cols-4 border-l border-t border-[var(--line-bright)]">
                  {(['paint', 'pick', 'restore', 'build'] as const).map((tool) => (
                    <button
                      type="button"
                      key={tool}
                      aria-pressed={makerTool === tool}
                      onClick={() => setMakerTool(tool)}
                      className={`min-h-10 border-b border-r border-[var(--line-bright)] px-3 font-mono text-xs capitalize ${
                        makerTool === tool
                          ? 'bg-[var(--pixel-lime)] text-black'
                          : 'text-[var(--paper-muted)] hover:text-[var(--paper)]'
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 border-l border-t border-[var(--line-bright)]">
                  <button
                    type="button"
                    onClick={undoMinecraftEdit}
                    disabled={editHistoryIndex <= 0}
                    className="min-h-10 border-b border-r border-[var(--line-bright)] px-3 font-mono text-xs text-[var(--paper)] disabled:opacity-35"
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={redoMinecraftEdit}
                    disabled={editHistoryIndex >= editHistory.length - 1}
                    className="min-h-10 border-b border-r border-[var(--line-bright)] px-3 font-mono text-xs text-[var(--paper)] disabled:opacity-35"
                  >
                    Redo
                  </button>
                  <button
                    type="button"
                    onClick={resetMinecraftEdits}
                    disabled={editedCellCount === 0}
                    className="min-h-10 border-b border-r border-[var(--line-bright)] px-3 font-mono text-xs text-[var(--paper)] disabled:opacity-35"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-10 gap-1 sm:[grid-template-columns:repeat(20,minmax(0,1fr))]" aria-label="Minecraft block paint palette">
                {MINECRAFT_BLOCKS.map((block) => (
                  <button
                    type="button"
                    key={block.id}
                    aria-label={`Paint with ${block.name}`}
                    aria-pressed={selectedBlockId === block.id}
                    title={block.name}
                    onClick={() => {
                      setSelectedBlockId(block.id);
                      setMakerTool('paint');
                    }}
                    className={`aspect-square min-h-7 border ${
                      selectedBlockId === block.id
                        ? 'border-white ring-2 ring-[var(--pixel-lime)]'
                        : 'border-black'
                    }`}
                    style={{ background: rgbValue(block.color) }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="overflow-x-auto border border-[var(--line)] bg-[#08090b] p-3">
              <div
                className="mx-auto grid w-max border-l border-t border-black"
                aria-label={`Zone ${activeSectionIndex + 1} enlarged build grid`}
                style={{
                  gridTemplateColumns: `repeat(${sectionEndColumn - sectionStartColumn}, 40px)`,
                }}
              >
                {activeSectionCells.map(({ cell, block }) => {
                  const isComplete = completedCells.has(cell.index);
                  return (
                    <button
                      type="button"
                      key={cell.index}
                      aria-label={`X ${cell.column + 1}, Y ${cell.row + 1}, ${block.name}, ${isComplete ? 'complete' : 'not built'}`}
                      aria-pressed={isComplete}
                      title={`X ${cell.column + 1} / Y ${cell.row + 1} · ${block.name}`}
                      onClick={() =>
                        isMinecraftMaker
                          ? editMakerCell(cell)
                          : toggleCompletedCell(cell)
                      }
                      className="relative size-10 border-b border-r border-black focus:z-10 focus:outline-2 focus:outline-white"
                      style={{ background: rgbValue(block.color) }}
                    >
                      {isComplete && (
                        <span className="absolute inset-0 grid place-items-center bg-[rgba(87,255,143,0.5)] font-mono text-sm font-black text-black">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="border border-[var(--line)] bg-black/35 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-sm text-[var(--paper)]">
                  Zone materials
                </p>
                <span className="font-mono text-xs text-[var(--paper-muted)]">
                  {activeSectionCells.length} blocks
                </span>
              </div>
              <div className="mt-3 grid max-h-64 overflow-y-auto border-l border-t border-[var(--line)]">
                {activeSectionMaterials.map(({ block, count }) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-3 border-b border-r border-[var(--line)] p-2"
                  >
                    <span
                      className="size-6 shrink-0 border border-black"
                      style={{ background: rgbValue(block.color) }}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs text-[var(--paper-muted)]">
                      {block.name}
                    </span>
                    <span className="font-mono text-sm text-[var(--paper)]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={toggleActiveSection}
                  className="pixel-button text-xs"
                >
                  {activeSectionIsComplete ? 'Undo section' : 'Complete section'}
                </button>
                <button
                  type="button"
                  onClick={goToNextIncompleteSection}
                  className="pixel-button pixel-button-secondary text-xs"
                >
                  Next unfinished zone
                </button>
                <button
                  type="button"
                  onClick={downloadActiveSectionBlueprint}
                  className="pixel-button pixel-button-secondary text-xs"
                >
                  Download this zone
                </button>
              </div>
            </aside>
          </div>
        </section>
      )}

      {image && isMinecraftMode && minecraftGrid && (
        <section className="border-t border-[var(--line)] bg-black/20 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="terminal-label">material list</p>
              <h3 className="mt-2 text-xl font-black text-[var(--paper)]">
                {minecraftGrid.columns} x {minecraftGrid.rows} grid
              </h3>
            </div>
            <p className="font-mono text-sm text-[var(--pixel-lime)]">
              {minecraftBlockTotal.toLocaleString()} blocks
            </p>
          </div>
          <div className="mt-4 grid border-l border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {minecraftMaterials.map((material) => (
              <div
                key={material.id}
                className="flex min-w-0 items-center gap-3 border-b border-r border-[var(--line)] p-3"
              >
                <span
                  className="size-7 shrink-0 border border-black"
                  style={{ background: rgbValue(material.color) }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs text-[var(--paper-muted)]">
                    {material.name}
                  </span>
                  <span className="mt-1 block font-mono text-sm text-[var(--paper)]">
                    {material.count.toLocaleString()}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {image ? (
        <div className="grid gap-3 border-t border-[var(--line)] bg-black/25 p-4 text-sm text-[var(--paper-muted)] md:grid-cols-3">
          <p>
            <span className="font-mono text-[var(--pixel-lime)]">01</span>{' '}
            {isMinecraftMode
              ? 'Grid dimensions update with build width.'
              : 'Grid preview updates instantly.'}
          </p>
          <p>
            <span className="font-mono text-[var(--pixel-lime)]">02</span>{' '}
            {isMinecraftMode
              ? 'PNG and material CSV are ready to export.'
              : 'PNG export keeps hard pixel edges.'}
          </p>
          <p>
            <span className="font-mono text-[var(--pixel-lime)]">03</span> Your
            photo never leaves the browser.
          </p>
        </div>
      ) : (
        <div className="border-t border-[var(--line)] bg-black/25 p-4">
          <div className="grid gap-3 text-sm text-[var(--paper-muted)] md:grid-cols-3">
            <p>
              <span className="font-mono text-[var(--pixel-lime)]">input</span>{' '}
              JPG, PNG, WebP
            </p>
            <p>
              <span className="font-mono text-[var(--pixel-lime)]">output</span>{' '}
              crisp PNG
            </p>
            <p>
              <span className="font-mono text-[var(--pixel-lime)]">privacy</span>{' '}
              local canvas only
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
