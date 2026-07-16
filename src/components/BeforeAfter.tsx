'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pixelize } from '@/lib/pixelize';
import { getPalette } from '@/lib/palettes';

const MIN_SPLIT = 0;
const MAX_SPLIT = 100;
const EDGE_SNAP = 3;
const HERO_CASES = [
  {
    src: '/hero-portrait-v2.avif',
    label: 'editorial portrait',
    tabLabel: 'Portrait',
  },
  { src: '/hero-cat.webp', label: 'cat avatar', tabLabel: 'Pet' },
  { src: '/hero-character.webp', label: 'game character', tabLabel: 'Game' },
  { src: '/hero-minecraft.webp', label: 'minecraft scene', tabLabel: 'World' },
];
const HERO_WIDTH = 1120;
const HERO_HEIGHT = 630;
const HERO_PIXEL_SIZE = 12;

function clampSplit(value: number) {
  const clamped = Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, value));
  if (clamped <= EDGE_SNAP) return MIN_SPLIT;
  if (clamped >= MAX_SPLIT - EDGE_SNAP) return MAX_SPLIT;
  return clamped;
}

function drawHeroImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
) {
  const w = HERO_WIDTH;
  const h = HERO_HEIGHT;
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = w / h;
  const cropWidth =
    sourceRatio > targetRatio
      ? image.naturalHeight * targetRatio
      : image.naturalWidth;
  const cropHeight =
    sourceRatio > targetRatio
      ? image.naturalHeight
      : image.naturalWidth / targetRatio;
  const cropX = (image.naturalWidth - cropWidth) / 2;
  const cropY = (image.naturalHeight - cropHeight) / 2;
  ctx.clearRect(0, 0, w, h);
  ctx.filter = 'contrast(1.08) saturate(1.12) brightness(1.02)';
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    w,
    h,
  );
  ctx.filter = 'none';

  const sideLight = ctx.createLinearGradient(0, 0, w, 0);
  sideLight.addColorStop(0, 'rgba(255, 157, 0, 0.12)');
  sideLight.addColorStop(0.42, 'rgba(0, 255, 255, 0.02)');
  sideLight.addColorStop(1, 'rgba(255, 92, 122, 0.16)');
  ctx.fillStyle = sideLight;
  ctx.fillRect(0, 0, w, h);

  const focus = ctx.createRadialGradient(600, 218, 120, 600, 218, 610);
  focus.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
  focus.addColorStop(0.54, 'rgba(0, 0, 0, 0)');
  focus.addColorStop(1, 'rgba(0, 0, 0, 0.34)');
  ctx.fillStyle = focus;
  ctx.fillRect(0, 0, w, h);
}

export function BeforeAfter() {
  const beforeRef = useRef<HTMLCanvasElement>(null);
  const afterRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeCase, setActiveCase] = useState(0);
  const [isCaseLoading, setIsCaseLoading] = useState(true);
  const [caseError, setCaseError] = useState<string | null>(null);

  const updateSplit = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const nextSplit = ((clientX - rect.left) / rect.width) * 100;
    setSplit(clampSplit(nextSplit));
  }, []);

  const nudgeSplit = useCallback((amount: number) => {
    setSplit((current) => clampSplit(current + amount));
  }, []);

  useEffect(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!before || !after) return;

    const w = HERO_WIDTH;
    const h = HERO_HEIGHT;
    const needsCanvasSetup =
      before.width !== w ||
      before.height !== h ||
      after.width !== w ||
      after.height !== h;

    if (needsCanvasSetup) {
      before.width = w;
      before.height = h;
      after.width = w;
      after.height = h;
    }

    const ctx = before.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const aCtx = after.getContext('2d');
    if (!aCtx) return;

    if (needsCanvasSetup) {
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, w, h);
      aCtx.fillStyle = '#050711';
      aCtx.fillRect(0, 0, w, h);
    }

    let cancelled = false;
    setIsCaseLoading(true);
    setCaseError(null);
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      drawHeroImage(ctx, image);

      const sourceData = ctx.getImageData(0, 0, w, h);
      const result = pixelize(sourceData, {
        pixelSize: HERO_PIXEL_SIZE,
        palette: getPalette('full'),
        dither: false,
      });

      const tmp = document.createElement('canvas');
      tmp.width = result.width;
      tmp.height = result.height;
      tmp.getContext('2d')?.putImageData(result, 0, 0);
      aCtx.clearRect(0, 0, w, h);
      aCtx.imageSmoothingEnabled = false;
      aCtx.drawImage(tmp, 0, 0, w, h);
      setIsCaseLoading(false);
    };
    image.onerror = () => {
      if (cancelled) return;
      setIsCaseLoading(false);
      setCaseError(`Unable to load ${HERO_CASES[activeCase].label}.`);
    };
    image.src = HERO_CASES[activeCase].src;

    return () => {
      cancelled = true;
    };
  }, [activeCase]);

  return (
    <div className="pixel-panel relative w-full max-w-[358px] overflow-hidden sm:max-w-full">
      <div
        ref={frameRef}
        className={`relative aspect-[16/9] touch-none select-none overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-col-resize'
        }`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsDragging(true);
          updateSplit(event.clientX);
        }}
        onPointerMove={(event) => {
          if (isDragging) updateSplit(event.clientX);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          setIsDragging(false);
        }}
        onPointerCancel={() => setIsDragging(false)}
        style={{ '--split': `${split}%` } as React.CSSProperties}
      >
        <canvas
          ref={beforeRef}
          className="absolute inset-0 size-full"
          aria-hidden="true"
        />
        <canvas
          ref={afterRef}
          className="absolute inset-0 size-full"
          style={{
            clipPath: 'inset(0 0 0 var(--split))',
            imageRendering: 'pixelated',
          }}
          aria-hidden="true"
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between border-b border-[var(--line)] bg-black/55 px-4 py-3">
          <span
            className="font-mono text-sm text-[var(--pixel-lime)] transition-opacity"
            style={{ opacity: split < 8 ? 0 : 1 }}
          >
            Original
          </span>
          <span
            className="font-mono text-sm text-[var(--pixel-lime)] transition-opacity"
            style={{ opacity: split > 92 ? 0 : 1 }}
          >
            Pixel Art
          </span>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-[var(--pixel-lime)] shadow-[0_0_18px_rgba(51,255,51,0.8)]"
          style={{ left: 'var(--split)' }}
        />

        <div
          className={`absolute top-1/2 flex size-14 -translate-y-1/2 items-center justify-center border border-[var(--line-bright)] bg-[rgba(10,10,12,0.92)] font-mono text-xl text-[var(--pixel-lime)] shadow-[0_0_24px_rgba(51,255,51,0.34)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pixel-lime)] ${
            split === MIN_SPLIT
              ? 'translate-x-0'
              : split === MAX_SPLIT
                ? '-translate-x-full'
                : '-translate-x-1/2'
          } ${
            isDragging ? 'scale-105 cursor-grabbing' : 'cursor-grab'
          }`}
          role="slider"
          aria-label="Drag to compare source image and pixel art"
          aria-valuemin={MIN_SPLIT}
          aria-valuemax={MAX_SPLIT}
          aria-valuenow={Math.round(split)}
          aria-valuetext={`${Math.round(split)}% original visible`}
          tabIndex={0}
          style={{ left: 'var(--split)' }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              nudgeSplit(-4);
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              nudgeSplit(4);
            }
            if (event.key === 'Home') {
              event.preventDefault();
              setSplit(MIN_SPLIT);
            }
            if (event.key === 'End') {
              event.preventDefault();
              setSplit(MAX_SPLIT);
            }
          }}
        >
          &lt;&gt;
        </div>

        {caseError && (
          <p
            role="alert"
            className="absolute inset-x-4 bottom-4 border border-[var(--pixel-rose)] bg-black/90 px-3 py-2 font-mono text-xs text-[var(--paper)]"
          >
            {caseError}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--line)] bg-black/45 px-4 py-3 font-mono text-xs uppercase text-[var(--paper-muted)]">
        <span>{HERO_CASES[activeCase].label}</span>
        <span>{isCaseLoading ? 'rendering...' : `${HERO_PIXEL_SIZE}px blocks`}</span>
        <span>pixel.png</span>
      </div>
      <div
        className="grid grid-cols-4 gap-2 border-t border-[var(--line)] bg-black/30 p-2"
        role="group"
        aria-label="Preview examples"
      >
        {HERO_CASES.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={index === activeCase}
            aria-label={`Show ${item.label}`}
            onClick={() => setActiveCase(index)}
            className={`flex min-h-11 items-center justify-center gap-2 border px-2 font-mono text-[0.65rem] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pixel-lime)] sm:text-xs ${
              index === activeCase
                ? 'border-[var(--pixel-lime)] bg-[rgba(51,255,51,0.12)] text-[var(--paper)]'
                : 'border-[var(--line)] text-[var(--paper-muted)] hover:border-[var(--line-bright)] hover:text-[var(--paper)]'
            }`}
          >
            <span
              className={`size-1.5 shrink-0 ${
                index === activeCase
                  ? 'bg-[var(--pixel-lime)]'
                  : 'bg-[var(--line-bright)]'
              }`}
              aria-hidden="true"
            />
            {item.tabLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
