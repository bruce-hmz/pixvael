'use client';

import { useCallback, useRef, useState } from 'react';

const MIN_SPLIT = 0;
const MAX_SPLIT = 100;
const EDGE_SNAP = 3;

// 首屏 case(portrait)原图用响应式 srcSet(640/960/1280/1600w),手机端按显示尺寸下载省字节;
// 其余 case 切换时才加载,单尺寸即可。pixelSrc 是构建时预生成的像素化图(见 scripts/gen-hero-pixel.ts)。
const HERO_CASES = [
  {
    src: '/hero-portrait-v2.avif',
    pixelSrc: '/hero-portrait-v2-pixel.avif',
    srcSet:
      '/hero-portrait-v2-640.avif 640w, /hero-portrait-v2-960.avif 960w, /hero-portrait-v2-1280.avif 1280w, /hero-portrait-v2.avif 1600w',
    label: 'editorial portrait',
    tabLabel: 'Portrait',
  },
  {
    src: '/hero-cat.webp',
    pixelSrc: '/hero-cat-pixel.avif',
    srcSet: '',
    label: 'cat avatar',
    tabLabel: 'Pet',
  },
  {
    src: '/hero-character.webp',
    pixelSrc: '/hero-character-pixel.avif',
    srcSet: '',
    label: 'game character',
    tabLabel: 'Game',
  },
  {
    src: '/hero-minecraft.webp',
    pixelSrc: '/hero-minecraft-pixel.avif',
    srcSet: '',
    label: 'minecraft scene',
    tabLabel: 'World',
  },
];
const HERO_PIXEL_SIZE = 12;

function clampSplit(value: number) {
  const clamped = Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, value));
  if (clamped <= EDGE_SNAP) return MIN_SPLIT;
  if (clamped >= MAX_SPLIT - EDGE_SNAP) return MAX_SPLIT;
  return clamped;
}

export function BeforeAfter() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeCase, setActiveCase] = useState(0);

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

  const active = HERO_CASES[activeCase];

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
        {/* before: 原图。SSR 静态 img = 首屏 LCP 元素,HTML 解析即显示。
            CSS filter 复刻原 canvas 的 contrast/saturate/brightness 调色 */}
        <img
          src={active.src}
          srcSet={active.srcSet || undefined}
          sizes={active.srcSet ? '(max-width: 640px) 360px, 1080px' : undefined}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 size-full object-cover"
          style={{ filter: 'contrast(1.08) saturate(1.12) brightness(1.02)' }}
        />
        {/* after: 构建时预生成的像素化图(94x53 放大到全幅,image-rendering pixelated 保留块状)。
            clipPath 右半跟随 split。无运行时 canvas/pixelize,彻底消除 LCP 的 JS 绘制链路 */}
        <img
          src={active.pixelSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 size-full object-cover"
          style={{
            clipPath: 'inset(0 0 0 var(--split))',
            imageRendering: 'pixelated',
          }}
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
      </div>
      <div className="flex items-center justify-between border-t border-[var(--line)] bg-black/45 px-4 py-3 font-mono text-xs uppercase text-[var(--paper-muted)]">
        <span>{active.label}</span>
        <span>{HERO_PIXEL_SIZE}px blocks</span>
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
