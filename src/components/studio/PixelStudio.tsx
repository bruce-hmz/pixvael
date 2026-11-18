'use client';

// 新版像素画转换器(工作室设计,2026-11)。
// 引擎沿用 workers/pixelize.worker.ts、lib/palettes、lib/exporters 和原有埋点事件;
// 只换界面:工具在第一屏、默认对比视图、示例图、调色板实时预览、导出尺寸可选。
// Minecraft 模式仍在 PixelConverter.tsx 里,这里只做 pixel 模式。

import { useCallback, useEffect, useRef, useState } from 'react';
import { PIXVAEL_EVENTS, trackEvent } from '@/lib/analytics';
import { downloadCanvasPng } from '@/lib/exporters';
import { PALETTES, getPalette, type Palette } from '@/lib/palettes';
import { pixelize } from '@/lib/pixelize';
import type {
  PixelizeWorkerRequest,
  PixelizeWorkerResponse,
} from '@/lib/pixelize-worker-types';
import { rememberImageForMinecraftMode } from '@/lib/session-image';

const MAX_DIM = 1280; // 最大处理边长,防止大图爆内存(与 PixelConverter 一致)
const PREVIEW_MAX_COLUMNS = 160; // 调色板小预览的最大列数
const MAX_EXPORT_DIM = 4096;
const BLOCK_PRESETS = [4, 8, 12, 16, 24, 32] as const;
const RAINBOW = ['#e4572e', '#f3a712', '#f6e27f', '#76b041', '#17bebb', '#2e86ab', '#5d4e8c', '#c2185b'];

type View = 'pixel' | 'compare' | 'original';
type ExportSize = 'grid' | 'source' | 'double';

type Sample = { id: string; label: string; sources: string[]; thumb: string };

const SAMPLES: Sample[] = [
  {
    id: 'portrait',
    label: 'Portrait',
    sources: ['/hero-portrait-v2-960.avif', '/hero-portrait-v2.jpg'],
    thumb: '/hero-portrait-v2-640.avif',
  },
  {
    id: 'cat',
    label: 'Cat',
    sources: ['/hero-cat.webp', '/hero-cat.jpg'],
    thumb: '/hero-cat.webp',
  },
  {
    id: 'hero',
    label: 'Game hero',
    sources: ['/hero-character.webp', '/hero-character.jpg'],
    thumb: '/hero-character.webp',
  },
];

const VIEW_OPTIONS: { value: View; label: string }[] = [
  { value: 'pixel', label: 'Pixel art' },
  { value: 'compare', label: 'Compare' },
  { value: 'original', label: 'Original' },
];

const EXPORT_OPTIONS: { value: ExportSize; label: string }[] = [
  { value: 'grid', label: '1 px/block' },
  { value: 'source', label: 'Full size' },
  { value: 'double', label: '2×' },
];

type Source = {
  canvas: HTMLCanvasElement;
  id: string;
  kind: 'sample' | 'upload';
  label: string;
};

type GridResult = { canvas: HTMLCanvasElement; sourceId: string };

type PixelStudioProps = {
  defaultPixelSize?: number;
  defaultPaletteId?: string;
};

function toSourceCanvas(image: HTMLImageElement) {
  const nw = image.naturalWidth;
  const nh = image.naturalHeight;
  if (!nw || !nh) return null;
  const scale = Math.min(1, MAX_DIM / Math.max(nw, nh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(nw * scale));
  canvas.height = Math.max(1, Math.round(nh * scale));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function swatchColors(palette: Palette) {
  if (palette.colors.length === 0) return RAINBOW;
  const colors =
    palette.colors.length > 8
      ? palette.colors.filter((_, index) => index % 2 === 0)
      : palette.colors;
  return colors.map((c) => `rgb(${c.r}, ${c.g}, ${c.b})`);
}

function paletteCount(palette: Palette) {
  return palette.colors.length === 0 ? 'all colors' : `${palette.colors.length} colors`;
}

function exportScale(size: ExportSize, pixelSize: number, cols: number, rows: number) {
  const wanted = size === 'grid' ? 1 : size === 'source' ? pixelSize : pixelSize * 2;
  const cap = Math.max(1, Math.floor(MAX_EXPORT_DIM / Math.max(cols, rows, 1)));
  return Math.max(1, Math.min(wanted, cap));
}

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cols: number,
  rows: number,
  dpr: number,
) {
  const cellW = width / cols;
  const cellH = height / rows;
  if (cellW < 6 * dpr) return; // 太密就不画,画了只是一片灰
  ctx.save();
  ctx.strokeStyle = 'rgba(23, 23, 26, 0.28)';
  ctx.lineWidth = Math.max(1, Math.round(dpr));
  ctx.beginPath();
  for (let i = 1; i < cols; i += 1) {
    const x = Math.round(i * cellW) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let j = 1; j < rows; j += 1) {
    const y = Math.round(j * cellH) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawCompareHandle(ctx: CanvasRenderingContext2D, x: number, height: number, dpr: number) {
  const y = height / 2;
  const r = 16 * dpr;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - dpr, 0, 2 * dpr, height);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8 * dpr;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#17171a';
  ctx.beginPath();
  ctx.moveTo(x - 9 * dpr, y);
  ctx.lineTo(x - 3 * dpr, y - 5 * dpr);
  ctx.lineTo(x - 3 * dpr, y + 5 * dpr);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 9 * dpr, y);
  ctx.lineTo(x + 3 * dpr, y - 5 * dpr);
  ctx.lineTo(x + 3 * dpr, y + 5 * dpr);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  stretch = false,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  stretch?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`gap-0.5 rounded-[10px] bg-st-sunken p-[3px] ${stretch ? 'grid grid-cols-3' : 'flex'}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`min-h-9 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors ${
              active
                ? 'bg-st-surface text-st-ink shadow-[0_1px_2px_rgba(23,23,26,0.14)] dark:bg-[#3a3a40]'
                : 'text-st-ink-2 hover:text-st-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center gap-3 rounded-lg py-1 text-left text-st-ink"
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-[13px] leading-snug text-st-ink-3">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-st-accent' : 'bg-st-track'
        }`}
      >
        <span
          className={`absolute top-[3px] size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-[left] ${
            checked ? 'left-[19px]' : 'left-[3px]'
          }`}
        />
      </span>
    </button>
  );
}

export function PixelStudio({
  defaultPixelSize = 12,
  defaultPaletteId = 'full',
}: PixelStudioProps) {
  const [source, setSource] = useState<Source | null>(null);
  const [grid, setGrid] = useState<GridResult | null>(null);
  const [pixelSize, setPixelSize] = useState(defaultPixelSize);
  const [paletteId, setPaletteId] = useState(() => getPalette(defaultPaletteId).id);
  const [dither, setDither] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [view, setView] = useState<View>('compare');
  const [split, setSplit] = useState(50);
  const [exportSize, setExportSize] = useState<ExportSize>('source');
  const [isRendering, setIsRendering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });

  const wellRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadTokenRef = useRef(0);
  const renderTokenRef = useRef(0);
  const trackedGridRef = useRef('');
  const paletteCanvasRefs = useRef(new Map<string, HTMLCanvasElement>());

  const currentGrid = grid && source && grid.sourceId === source.id ? grid.canvas : null;
  const cols = currentGrid?.width ?? 0;
  const rows = currentGrid?.height ?? 0;

  const loadSample = useCallback((sample: Sample) => {
    const token = ++loadTokenRef.current;
    const tryLoad = (index: number) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (token !== loadTokenRef.current) return;
        const canvas = toSourceCanvas(image);
        if (!canvas) return;
        setSource({ canvas, id: `sample:${sample.id}`, kind: 'sample', label: sample.label });
        setError(null);
      };
      image.onerror = () => {
        if (token !== loadTokenRef.current) return;
        if (index + 1 < sample.sources.length) {
          tryLoad(index + 1);
        } else {
          setError('The sample could not be loaded. Upload your own image instead.');
        }
      };
      image.src = sample.sources[index];
    };
    tryLoad(0);
  }, []);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, or WebP).');
      return;
    }
    setError(null);
    trackEvent(PIXVAEL_EVENTS.uploadStarted, {
      product_mode: 'pixel',
      file_type: file.type.slice('image/'.length) || 'unknown',
      file_size_kb: Math.max(1, Math.round(file.size / 1024)),
      input_method: 'file_or_drop',
    });
    const token = ++loadTokenRef.current;
    const url = URL.createObjectURL(file);
    const sourceId = `${file.name}:${file.size}:${file.lastModified}`;
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      if (token !== loadTokenRef.current) return;
      try {
        // 同一标签页里打开 Minecraft 工具时带上这张图;存不下也不影响转换
        rememberImageForMinecraftMode(image, sourceId);
      } catch {
        /* sessionStorage 不可用 */
      }
      const canvas = toSourceCanvas(image);
      if (!canvas) {
        setError('Could not read that image.');
        return;
      }
      setSource({ canvas, id: sourceId, kind: 'upload', label: file.name });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      if (token !== loadTokenRef.current) return;
      setError('Could not load that image. It may be corrupted or too large.');
    };
    image.src = url;
  }, []);

  // 首次打开就放一张示例图,用户不用先找图就能看到效果
  useEffect(() => {
    loadSample(SAMPLES[0]);
  }, [loadSample]);

  // 预览区尺寸
  useEffect(() => {
    const well = wellRef.current;
    if (!well || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      setStage({ width: well.clientWidth, height: well.clientHeight });
    });
    observer.observe(well);
    return () => observer.disconnect();
  }, []);

  // 像素化:后台 worker,参数变化 60ms 后重算,过期结果丢弃
  useEffect(() => {
    if (!source) return;
    const token = ++renderTokenRef.current;
    let worker: Worker | null = null;

    const accept = (result: ImageData) => {
      if (token !== renderTokenRef.current) return;
      const canvas = document.createElement('canvas');
      canvas.width = result.width;
      canvas.height = result.height;
      canvas.getContext('2d')?.putImageData(result, 0, 0);
      setGrid({ canvas, sourceId: source.id });
      setIsRendering(false);
      if (source.kind === 'upload' && trackedGridRef.current !== source.id) {
        trackedGridRef.current = source.id;
        trackEvent(PIXVAEL_EVENTS.gridReady, {
          product_mode: 'pixel',
          source_width: source.canvas.width,
          source_height: source.canvas.height,
          grid_columns: result.width,
          grid_rows: result.height,
        });
      }
    };

    const timer = window.setTimeout(() => {
      const ctx = source.canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      const data = ctx.getImageData(0, 0, source.canvas.width, source.canvas.height);
      setIsRendering(true);
      try {
        worker = new Worker(new URL('../../workers/pixelize.worker.ts', import.meta.url), {
          type: 'module',
          name: 'pixvael-pixelizer',
        });
      } catch {
        // 不支持模块 worker 的浏览器:在主线程算
        accept(pixelize(data, { pixelSize, palette: getPalette(paletteId), dither }));
        return;
      }
      worker.onmessage = (event: MessageEvent<PixelizeWorkerResponse>) => {
        worker?.terminate();
        worker = null;
        accept(event.data.result);
      };
      worker.onerror = () => {
        worker?.terminate();
        worker = null;
        if (token !== renderTokenRef.current) return;
        setError('Could not render the image in the background worker.');
        setIsRendering(false);
      };
      const request: PixelizeWorkerRequest = {
        source: data,
        pixelSize,
        paletteId,
        dither,
        includeMinecraftMaterials: false,
      };
      worker.postMessage(request, [data.data.buffer]);
    }, 60);

    return () => {
      window.clearTimeout(timer);
      worker?.terminate();
    };
  }, [source, pixelSize, paletteId, dither]);

  // 画预览:像素画 / 对比 / 原图
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas || !source || stage.width === 0) return;
    const pad = stage.width < 640 ? 12 : 24;
    const maxW = Math.max(120, stage.width - pad * 2);
    const maxH = Math.max(120, stage.height - pad * 2);
    const aspect = source.canvas.width / source.canvas.height;
    let w = maxW;
    let h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    w = Math.floor(w);
    h = Math.floor(h);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 新图还在算的时候先显示原图,不显示上一张图的结果
    if (view === 'original' || !currentGrid) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source.canvas, 0, 0, W, H);
      return;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(currentGrid, 0, 0, W, H);
    if (showGrid) drawGridLines(ctx, W, H, currentGrid.width, currentGrid.height, dpr);

    if (view === 'compare') {
      const x = Math.round((W * split) / 100);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, x, H);
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(source.canvas, 0, 0, W, H);
      ctx.restore();
      drawCompareHandle(ctx, x, H, dpr);
    }
  }, [source, currentGrid, stage, view, split, showGrid]);

  // 每种调色板的小预览(主线程,缩到最多 160 列;换调色板本身不触发重算)
  useEffect(() => {
    if (!source || cols === 0 || rows === 0) return;
    const timer = window.setTimeout(() => {
      const previewCols = Math.min(cols, PREVIEW_MAX_COLUMNS);
      const previewRows = Math.max(1, Math.round((rows * previewCols) / cols));
      const small = document.createElement('canvas');
      small.width = previewCols;
      small.height = previewRows;
      const smallCtx = small.getContext('2d', { willReadFrequently: true });
      if (!smallCtx) return;
      smallCtx.imageSmoothingEnabled = true;
      smallCtx.imageSmoothingQuality = 'high';
      smallCtx.drawImage(source.canvas, 0, 0, previewCols, previewRows);
      const base = smallCtx.getImageData(0, 0, previewCols, previewRows);
      for (const palette of PALETTES) {
        const target = paletteCanvasRefs.current.get(palette.id);
        if (!target) continue;
        const copy = new ImageData(new Uint8ClampedArray(base.data), previewCols, previewRows);
        const result = pixelize(copy, { pixelSize: 1, palette, dither });
        target.width = result.width;
        target.height = result.height;
        target.getContext('2d')?.putImageData(result, 0, 0);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [source, cols, rows, dither]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  const handleDownload = useCallback(() => {
    if (!currentGrid || !source) return;
    const scale = exportScale(exportSize, pixelSize, cols, rows);
    const out = document.createElement('canvas');
    out.width = cols * scale;
    out.height = rows * scale;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(currentGrid, 0, 0, out.width, out.height);
    downloadCanvasPng(out, 'pixvael-pixel-art.png');
    trackEvent(PIXVAEL_EVENTS.imageDownloaded, {
      product_mode: 'pixel',
      export_type: 'png',
      export_size: exportSize,
      pixel_size: pixelSize,
      palette: paletteId,
      grid_columns: cols,
      grid_rows: rows,
      source_kind: source.kind,
    });
  }, [cols, currentGrid, exportSize, paletteId, pixelSize, rows, source]);

  const scale = exportScale(exportSize, pixelSize, cols, rows);
  const statusText = !source
    ? 'Loading sample…'
    : isRendering || !currentGrid
      ? 'Rendering…'
      : `${cols} × ${rows}`;
  const showBlocksSuffix = Boolean(source && currentGrid && !isRendering);
  const activePalette = getPalette(paletteId);

  return (
    <div id="tool" className="scroll-mt-4">
      <div className="overflow-clip rounded-2xl border border-st-line bg-st-surface shadow-[0_1px_2px_rgba(23,23,26,0.04),0_10px_30px_rgba(23,23,26,0.06)]">
        <div className="flex flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col border-st-line lg:border-r">
            <div className="flex items-center gap-3 border-b border-st-line px-3 py-2.5 sm:px-4">
              <Segmented label="Preview mode" options={VIEW_OPTIONS} value={view} onChange={setView} />
              <p className="ml-auto whitespace-nowrap font-mono text-[13px] text-st-ink-3" aria-live="polite">
                {statusText}
                {showBlocksSuffix && <span className="hidden sm:inline"> blocks</span>}
              </p>
            </div>

            <div
              ref={wellRef}
              className="st-well relative flex h-[280px] items-center justify-center sm:h-[440px] lg:h-auto lg:min-h-[540px] lg:flex-1"
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                setIsDragging(false);
              }}
              onDrop={handleDrop}
            >
              <div
                className={`st-compare-wrap relative leading-[0] shadow-[0_1px_2px_rgba(23,23,26,0.08),0_14px_36px_rgba(23,23,26,0.16)] ${
                  source ? '' : 'invisible'
                }`}
              >
                <canvas
                  ref={previewRef}
                  role="img"
                  aria-label={
                    source
                      ? `${view === 'original' ? 'Original' : 'Pixel art'} preview of ${source.label}`
                      : 'Pixel art preview'
                  }
                  className="block"
                  style={{ imageRendering: 'pixelated' }}
                />
                {view === 'compare' && source && (
                  <>
                    <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-[rgba(23,23,26,0.72)] px-2 py-1.5 text-xs font-semibold leading-none text-white">
                      Original
                    </span>
                    <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-[rgba(51,70,240,0.92)] px-2 py-1.5 text-xs font-semibold leading-none text-white">
                      Pixel art
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={split}
                      onChange={(event) => setSplit(Number(event.target.value))}
                      aria-label="Drag to compare the original and the pixel art"
                      className="st-compare absolute inset-0 m-0 h-full w-full"
                    />
                  </>
                )}
              </div>

              {!source && !error && (
                <p className="absolute text-sm text-st-ink-3">Loading a sample…</p>
              )}

              {isDragging && (
                <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-xl border-2 border-dashed border-st-accent bg-st-surface/85 text-base font-semibold text-st-ink">
                  Drop to convert
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="absolute inset-x-4 bottom-4 mx-auto max-w-md rounded-lg bg-st-invert px-4 py-2.5 text-center text-sm leading-snug text-st-on-invert"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 border-t border-st-line px-3 py-3 sm:px-4">
              <span className="text-[13px] font-medium text-st-ink-3">Try a sample</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLES.map((sample) => {
                  const active = source?.id === `sample:${sample.id}`;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => loadSample(sample)}
                      className={`flex min-h-11 items-center gap-2 rounded-[10px] border-[1.5px] bg-st-surface py-1 pl-1 pr-3 text-sm text-st-ink transition-colors ${
                        active ? 'border-st-accent' : 'border-st-line hover:border-st-line-strong'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- 小缩略图,不需要 next/image 的包装 */}
                      <img
                        src={sample.thumb}
                        alt=""
                        width={52}
                        height={34}
                        loading="lazy"
                        decoding="async"
                        className="h-[34px] w-[52px] rounded-md object-cover"
                      />
                      {sample.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex w-full items-center gap-3 sm:ml-auto sm:w-auto">
                <span className="hidden text-[13px] text-st-ink-3 2xl:inline">
                  or drop a file on the canvas
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-st-invert px-4 text-sm font-semibold text-st-on-invert transition-opacity hover:opacity-90 sm:flex-none"
                >
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V4" />
                    <path d="M7 9l5-5 5 5" />
                    <path d="M4 20h16" />
                  </svg>
                  Upload your image
                </button>
              </div>
              {source?.kind === 'upload' && (
                <p className="w-full truncate text-[13px] text-st-ink-3">
                  Converting <span className="text-st-ink">{source.label}</span> on this device
                </p>
              )}
            </div>
          </div>

          <aside
            aria-label="Converter settings"
            className="flex w-full shrink-0 flex-col gap-7 border-t border-st-line p-4 sm:p-5 lg:w-[340px] lg:border-t-0"
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between">
                <label htmlFor="st-block-size" className="text-sm font-semibold">
                  Block size
                </label>
                <span className="font-mono text-[13px] text-st-accent-text">{pixelSize} px</span>
              </div>
              <input
                id="st-block-size"
                type="range"
                min={2}
                max={32}
                step={1}
                value={pixelSize}
                onChange={(event) => setPixelSize(Number(event.target.value))}
                className="st-range h-6 w-full"
              />
              <div className="grid grid-cols-6 gap-1.5">
                {BLOCK_PRESETS.map((size) => {
                  const active = pixelSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={active}
                      aria-label={`${size} pixel blocks`}
                      onClick={() => setPixelSize(size)}
                      className={`min-h-10 rounded-lg border font-mono text-[13px] transition-colors ${
                        active
                          ? 'border-st-accent bg-st-accent-tint text-st-accent-text'
                          : 'border-st-line text-st-ink hover:border-st-line-strong'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2.5 flex w-full items-baseline justify-between text-sm font-semibold">
                Palette
              </legend>
              {PALETTES.map((palette) => {
                const active = palette.id === paletteId;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPaletteId(palette.id)}
                    className={`flex min-h-11 items-center gap-3 rounded-[10px] border-[1.5px] p-2 text-left transition-colors ${
                      active
                        ? 'border-st-accent bg-st-accent-tint/60'
                        : 'border-st-line hover:border-st-line-strong'
                    }`}
                  >
                    <span className="flex h-5 w-24 shrink-0 overflow-hidden rounded" aria-hidden="true">
                      {swatchColors(palette).map((color, index) => (
                        <span key={`${color}-${index}`} className="flex-1" style={{ background: color }} />
                      ))}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-st-ink">{palette.name}</span>
                    <span className="font-mono text-xs text-st-ink-3">{paletteCount(palette)}</span>
                  </button>
                );
              })}
            </fieldset>

            <div className="flex flex-col gap-1">
              <span className="mb-1 text-sm font-semibold">Effects</span>
              <Toggle
                checked={dither}
                onChange={setDither}
                title="Dithering"
                description="Floyd-Steinberg. Smoother shading with small palettes."
              />
              <Toggle
                checked={showGrid}
                onChange={setShowGrid}
                title="Show block grid"
                description="Preview only. Handy for bead and cross-stitch plans."
              />
            </div>

            <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-auto flex flex-col gap-3 border-t border-st-line bg-st-surface p-4 sm:-mx-5 sm:-mb-5 sm:p-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Export size</span>
                <Segmented
                  label="Export size"
                  options={EXPORT_OPTIONS}
                  value={exportSize}
                  onChange={setExportSize}
                  stretch
                />
              </div>
              <div className="st-px-wrap">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!currentGrid || isRendering}
                  className="st-px flex h-[52px] w-full items-center justify-center gap-2.5 bg-st-accent text-base font-semibold text-white transition-colors hover:bg-st-accent-hover disabled:cursor-wait disabled:opacity-60"
                >
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v12" />
                    <path d="M7 11l5 5 5-5" />
                    <path d="M4 20h16" />
                  </svg>
                  Download PNG
                </button>
              </div>
              <p className="text-center font-mono text-xs text-st-ink-3">
                {cols > 0 ? `${cols * scale} × ${rows * scale} px PNG · ${activePalette.name}` : 'PNG'}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <input
        ref={fileInputRef}
        id="pixvael-image-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) loadFile(file);
        }}
      />

      <section aria-labelledby="palette-previews-title" className="mt-16">
        <h2 id="palette-previews-title" className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-st-ink">
          Your picture in every palette
        </h2>
        <p className="mt-2 max-w-[64ch] text-base leading-relaxed text-st-ink-2">
          Live previews of the image above. Pick one and the converter switches to it.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {PALETTES.map((palette) => {
            const active = palette.id === paletteId;
            return (
              <button
                key={palette.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setPaletteId(palette.id);
                  document.getElementById('tool')?.scrollIntoView({ block: 'start' });
                }}
                className={`flex flex-col overflow-hidden rounded-xl border-[1.5px] bg-st-surface text-left transition-colors ${
                  active ? 'border-st-accent' : 'border-st-line hover:border-st-line-strong'
                }`}
              >
                <span className="st-well flex h-40 items-center justify-center p-3">
                  <canvas
                    ref={(element) => {
                      if (element) paletteCanvasRefs.current.set(palette.id, element);
                      else paletteCanvasRefs.current.delete(palette.id);
                    }}
                    aria-hidden="true"
                    className="block h-full w-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </span>
                <span className="flex items-baseline justify-between gap-3 px-3 py-2.5">
                  <span className="text-sm font-semibold text-st-ink">{palette.name}</span>
                  <span className="font-mono text-xs text-st-ink-3">{paletteCount(palette)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
