import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ReactDOM from 'react-dom';
import { BeforeAfter } from '@/components/BeforeAfter';
import { JsonLd } from '@/components/JsonLd';
import { FaqSection, InfoGrid } from '@/components/PixelLanding';
import { buildWebAppSchema, buildFaqSchema, buildOrganizationSchema } from '@/lib/structured-data';

// 首屏交互工具懒加载:PixelConverter 是 76KB/1991 行的 client 组件,在 hero 下方,
// 不在首屏视觉区。next/dynamic 把它代码分割到独立 chunk,移出首屏关键 JS 以改善 FCP/TBT
const PixelConverter = dynamic(
  () => import('@/components/PixelConverter').then((m) => m.PixelConverter),
  {
    loading: () => <div className="min-h-[480px] animate-pulse" aria-hidden="true" />,
  },
);

export const metadata: Metadata = {
  alternates: { canonical: 'https://pixvael.com' },
};

const faqs = [
  {
    question: 'Is the image to pixel art converter free?',
    answer:
      'Completely free — no signup, no watermark, no export limit, no hidden quota.',
  },
  {
    question: 'Do my images get uploaded to a server?',
    answer:
      'No. The conversion runs entirely in your browser on an HTML5 canvas, so your photo never leaves your device. Nothing is uploaded or stored.',
  },
  {
    question: 'What format can I export?',
    answer:
      'Download the result as a PNG. The pixel art you make is yours to use, personally or commercially, with no attribution required.',
  },
  {
    question: 'How do I choose the right block size?',
    answer:
      'Smaller blocks preserve fine detail like eyes and fur; larger blocks read as bolder, chunkier pixel art. For Minecraft rebuilds, match the block size to how many blocks wide you want the final build.',
  },
  {
    question: 'Which palette should I pick?',
    answer:
      'Full color keeps the original look, just downsampled. The retro PICO-8-style palette gives an 8-bit feel, while the Game Boy palette compresses everything into four classic green tones for handheld nostalgia.',
  },
  {
    question: 'What does dithering do?',
    answer:
      'Dithering scatters small color changes between blocks to fake extra shades, which helps smooth gradients and dark areas survive the pixelation. Toggle it on when a palette feels too flat.',
  },
  {
    question: 'Can I use the pixel art for games or commercial work?',
    answer:
      'Yes. The output PNG is a hard-edged image with no smoothing, so it scales crisply into game engines, websites, or print. You own everything you generate.',
  },
];

const showcaseCases = [
  {
    label: 'pet',
    title: 'Pet Photos to Pixel Art',
    body: 'Turn a favorite pet photo into a pixel profile. Tune the block size so fur and markings stay readable, then export a crisp avatar for social, forum, or wallpaper use.',
    image: '/hero-cat.webp',
  },
  {
    label: 'game',
    title: 'Game Character Pixel Art',
    body: 'Build retro-style heroes, enemies, and sprites from a reference image. Snap to a limited palette for an authentic 8-bit or 16-bit look that fits straight into a game.',
    image: '/hero-character.webp',
  },
  {
    label: 'minecraft',
    title: 'Image to Minecraft Pixel Art',
    body: 'Convert a scene into block-scale pixel art you can rebuild in a Minecraft world. Larger blocks read as chunks and are easier to place block by block.',
    image: '/hero-minecraft.webp',
  },
];

export default function Home() {
  // 提前并行下载首屏 hero 图:BeforeAfter 是 client canvas,默认显示 hero-portrait-v2.avif。
  // 不 preload 的话浏览器要等 JS 执行完才发现要下载
  ReactDOM.preload('/hero-portrait-v2.avif', {
    as: 'image',
    fetchPriority: 'high',
    imageSrcSet:
      '/hero-portrait-v2-640.avif 640w, /hero-portrait-v2-960.avif 960w, /hero-portrait-v2-1280.avif 1280w, /hero-portrait-v2.avif 1600w',
    imageSizes: '(max-width: 640px) 360px, 1080px',
  });

  return (
    <div className="page-shell">
      <section className="rail-frame">
        <BeforeAfter />

        <div className="grid gap-8 border-b border-[var(--line)] px-4 py-12 sm:px-10 lg:grid-cols-[1fr_260px] lg:items-start">
          <div>
            <p className="terminal-label">/ image to pixel art</p>
            <h1 className="crt-title mt-5 max-w-[320px] break-words text-[3rem] leading-[1.03] sm:max-w-5xl sm:text-[clamp(3.2rem,6vw,5.6rem)]">
              <span className="block text-[var(--paper)] [text-shadow:none]">Turn any </span>
              <span className="block text-[var(--paper)] [text-shadow:none] sm:inline">image to </span>
              <span className="block text-[var(--pixel-lime)] sm:inline">pixel art</span>
            </h1>
            <p className="mt-8 max-w-[320px] text-base leading-7 text-[var(--paper)] sm:max-w-2xl sm:text-lg">
              Transform photos into crisp pixel art instantly. Customize block
              size, palette, and dithering, then export a sharp PNG. Everything
              runs in your browser with no signup and no upload.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:items-stretch">
            <a href="#tool" className="pixel-button text-sm">
              Upload Your Image
            </a>
            <a
              href="/minecraft-pixel-art"
              className="pixel-button pixel-button-secondary text-sm"
            >
              Minecraft mode
            </a>
            <p className="border border-[var(--line)] bg-black/25 px-3 py-2 font-mono text-xs text-[var(--paper-muted)]">
              <span className="text-[var(--pixel-lime)]">✓</span> Free&nbsp;&nbsp;
              <span className="text-[var(--pixel-lime)]">✓</span> Private&nbsp;&nbsp;
              <span className="text-[var(--pixel-lime)]">✓</span> Browser only
            </p>
          </div>
        </div>

        <div className="grid border-b border-[var(--line)] bg-black/20 md:grid-cols-3">
          {showcaseCases.map((item) => (
            <article
              key={item.label}
              className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] gap-4 border-t border-[var(--line)] px-4 py-4 sm:grid-cols-[104px_minmax(0,1fr)] sm:px-6 md:border-l md:first:border-l-0"
            >
              <div
                role="img"
                aria-label={`${item.title} pixel art example`}
                className="relative aspect-square overflow-hidden border border-[var(--line-bright)] bg-[#050711] bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/5" />
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:12px_12px]" />
              </div>
              <div className="min-w-0 self-center">
                <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--pixel-lime)]">
                  {item.label}
                </p>
                <h2 className="mt-2 break-words text-base font-black text-[var(--paper)]">
                  {item.title}
                </h2>
                <p className="mt-2 break-words text-sm leading-6 text-[var(--paper-muted)]">
                  {item.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <PixelConverter />
      </section>

      <InfoGrid
        items={[
          {
            label: 'styles',
            title: 'Pixel Art Palettes: Full Color, Retro, Game Boy',
            body: 'Keep the original colors for a clean downscaled look, snap to a PICO-8-style 16-color palette for NES vibes, or compress everything into the four classic Game Boy greens. Switch palettes live and watch the pixel art update instantly.',
          },
          {
            label: 'builds',
            title: 'Minecraft-Scale Pixel Blocks',
            body: 'Raise the block size to turn a photo into chunky references that map cleanly onto Minecraft blocks. Each block becomes one color, so you can rebuild the image block by block in survival or creative.',
          },
          {
            label: 'export',
            title: 'Crisp Pixel Art PNG Export',
            body: 'The preview and download keep image smoothing off, so every pixel stays a hard edge. Export a sharp PNG that scales without blur, ready for games, avatars, or print.',
          },
        ]}
      />

      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">how it works</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          How Image to Pixel Art Works
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          Pixvael reads your photo through an HTML5 canvas and slices it into a
          grid of small blocks. Each block is averaged down to one color, which
          is what turns a smooth photo into chunky pixel art. From there you
          decide the look: keep the full original color, snap every block to a
          limited palette like PICO-8 or Game Boy, or add Floyd-Steinberg
          dithering to fake extra shades. Because the whole image-to-pixel-art
          conversion runs in your browser, the photo never leaves your device
          and the preview updates the moment you move a slider.
        </p>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="pixel-panel-raised p-6">
          <p className="terminal-label">use cases</p>
          <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
            Why Make Pixel Art from a Photo?
          </h2>
          <p className="mt-3 leading-7 text-[var(--paper-muted)]">
            Pixel art turns an ordinary photo into something nostalgic, readable
            at a glance, and easy to reuse. Game developers drop converted
            sprites straight into engines; streamers and forum users set them as
            avatars; teachers use them in retro-computing and game-design
            lessons; and hobbyists rebuild them as Minecraft blueprints or
            cross-stitch patterns. Because the output is a hard-edged PNG, it
            scales without blur and stays crisp on any screen.
          </p>
        </div>
        <div className="pixel-panel-raised p-6">
          <p className="terminal-label">tips</p>
          <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
            Get Cleaner Pixel Art
          </h2>
          <p className="mt-3 leading-7 text-[var(--paper-muted)]">
            Start with a well-lit, high-contrast photo and crop tight on the
            subject. Match the block size to the detail you want to keep —
            smaller blocks preserve features, larger blocks read as bold pixel
            art. Pick a palette that fits the mood: full color for realism,
            retro 16-color for 8-bit charm, or Game Boy greens for classic
            handheld nostalgia. Toggle dithering on to recover shading in dark
            or smooth-gradient areas.
          </p>
        </div>
      </section>

      <FaqSection faqs={faqs} faqTitle="Image to Pixel Art FAQ" />

      <JsonLd data={buildOrganizationSchema()} />
      <JsonLd data={buildWebAppSchema()} />
      <JsonLd data={buildFaqSchema(faqs)} />
    </div>
  );
}
