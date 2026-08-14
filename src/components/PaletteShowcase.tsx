'use client';

// 同一张源图 × 三个 palette（Full Color / Retro 8-bit / Game Boy）实时像素化并排渲染。
// 复用 BeforeAfter 的 pixelize + getPalette 链路,让用户直观对比调色板差异。
// dynamic import 进首页,不进首屏关键路径。

import { useEffect, useRef, useState } from 'react';
import { pixelize } from '@/lib/pixelize';
import { getPalette } from '@/lib/palettes';

const CASES = [
  { src: '/hero-portrait-v2.avif', label: 'Portrait' },
  { src: '/hero-cat.webp', label: 'Pet' },
  { src: '/hero-character.webp', label: 'Game' },
];

// 每个 palette 的展示配置。受限 palette（retro/gameboy）开 dither 找回层次,
// full 不需要(保留原色)。跟首页 FAQ "What does dithering do?" 的描述一致。
const VARIANTS: { id: string; name: string; caption: string; dither: boolean }[] =
  [
    {
      id: 'full',
      name: 'Full Color',
      caption: 'Every original hue, only downscaled.',
      dither: false,
    },
    {
      id: 'retro',
      name: 'Retro 8-bit',
      caption: '16 PICO-8 colors with dithering.',
      dither: true,
    },
    {
      id: 'gameboy',
      name: 'Game Boy',
      caption: 'Four classic greens with dithering.',
      dither: true,
    },
  ];

const CANVAS_W = 480;
const CANVAS_H = 270;
const PIXEL_SIZE = 10;

// 把源图按 canvas 比例 cover-crop 后画到 ctx,返回像素数据供三个 palette 共享。
// 复用 BeforeAfter.drawHeroImage 的 cover-crop 逻辑,但不加滤镜/叠色(这里要真实展示 palette 效果)。
function drawSource(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
): ImageData {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = CANVAS_W / CANVAS_H;
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
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    CANVAS_W,
    CANVAS_H,
  );
  return ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
}

export function PaletteShowcase() {
  // 三个独立 ref（stable）。不要把 ref 放进数组再作为 effect/useCallback 的依赖,
  // 否则数组每次 render 重建会触发渲染循环 → canvas 闪烁。
  const fullRef = useRef<HTMLCanvasElement>(null);
  const retroRef = useRef<HTMLCanvasElement>(null);
  const gameboyRef = useRef<HTMLCanvasElement>(null);
  const [activeCase, setActiveCase] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      // 用一个离屏 canvas 先把源图画到固定尺寸,再取像素数据共享给三个 palette。
      const offscreen = document.createElement('canvas');
      offscreen.width = CANVAS_W;
      offscreen.height = CANVAS_H;
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) {
        setIsLoading(false);
        setError('Unable to render this image.');
        return;
      }
      const sourceData = drawSource(offCtx, image);
      // 同一份 sourceData 跑三个 palette,避免重复 decode/getImageData。
      const canvasRefs = [fullRef, retroRef, gameboyRef];
      VARIANTS.forEach((variant, i) => {
        const canvas = canvasRefs[i].current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const result = pixelize(sourceData, {
          pixelSize: PIXEL_SIZE,
          palette: getPalette(variant.id),
          dither: variant.dither,
        });

        canvas.width = result.width;
        canvas.height = result.height;
        ctx.imageSmoothingEnabled = false;
        ctx.putImageData(result, 0, 0);
      });
      setIsLoading(false);
    };
    image.onerror = () => {
      if (cancelled) return;
      setIsLoading(false);
      setError(`Unable to load ${CASES[activeCase].label.toLowerCase()}.`);
    };
    image.src = CASES[activeCase].src;

    return () => {
      cancelled = true;
    };
    // fullRef/retroRef/gameboyRef 是 stable ref 对象,exhaustive-deps 豁免;
    // 只有切 tab（activeCase）才重渲染。
  }, [activeCase]);

  // render 内组合三个 ref 供 JSX 映射用。数组本身不进任何 effect 依赖。
  const canvasRefs = [fullRef, retroRef, gameboyRef];

  return (
    <div className="pixel-panel overflow-hidden">
      {/* 三 palette 并排:md 以上三列,移动端单列纵向 */}
      <div className="grid gap-3 p-4 md:grid-cols-3">
        {VARIANTS.map((variant, i) => (
          <figure key={variant.id} className="min-w-0">
            <div className="relative aspect-[16/9] overflow-hidden border border-[var(--line)] bg-[#050711]">
              {/* canvas 实际尺寸是缩小后的像素网格(pixelSize 10 → 48×27),
                  用 CSS 拉满容器并保留硬边。 */}
              <canvas
                ref={canvasRefs[i]}
                className={`size-full ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ imageRendering: 'pixelated' }}
                role="img"
                aria-label={`${variant.name} pixel art of ${CASES[activeCase].label.toLowerCase()}`}
              />
              {isLoading && (
                <div
                  className="absolute inset-0 animate-pulse bg-[var(--line)]/20"
                  aria-hidden="true"
                />
              )}
            </div>
            <figcaption className="mt-3 px-1">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--pixel-lime)]">
                {variant.name}
              </p>
              <p className="mt-1 text-sm leading-5 text-[var(--paper-muted)]">
                {variant.caption}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* 图源切换 tabs:抄 BeforeAfter 的 button + aria-pressed 模式 */}
      <div
        className="grid grid-cols-3 gap-2 border-t border-[var(--line)] bg-black/30 p-2"
        role="group"
        aria-label="Switch source image for palette comparison"
      >
        {CASES.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={index === activeCase}
            aria-label={`Show ${item.label.toLowerCase()} across palettes`}
            onClick={() => {
              // 切 tab 时同步重置加载态(事件处理器内 setState 合法;
              // 不能放 effect 体内,否则触发 react-hooks/set-state-in-effect)
              setActiveCase(index);
              setIsLoading(true);
              setError(null);
            }}
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
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="border-t border-[var(--pixel-rose)] bg-black/90 px-4 py-2 font-mono text-xs text-[var(--paper)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
