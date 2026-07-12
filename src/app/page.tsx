import { BeforeAfter } from '@/components/BeforeAfter';
import { PixelConverter } from '@/components/PixelConverter';
import { JsonLd } from '@/components/JsonLd';
import { FaqSection, InfoGrid } from '@/components/PixelLanding';
import { buildWebAppSchema, buildFaqSchema } from '@/lib/structured-data';

const faqs = [
  {
    question: 'Is it free?',
    answer:
      'Completely free — no signup, no watermark, no export limit.',
  },
  {
    question: 'Do my images get uploaded?',
    answer:
      'No. The conversion runs entirely in your browser, so your photo never leaves your device.',
  },
  {
    question: 'What can I export?',
    answer:
      'Download the result as a PNG. The pixel art you make is yours to use, personally or commercially.',
  },
];

const showcaseCases = [
  {
    label: 'pet',
    title: 'Pet avatar',
    body: 'Turn a favorite pet into a pixel profile.',
    image: '/hero-cat.jpg',
  },
  {
    label: 'game',
    title: 'Game character',
    body: 'Create retro-style avatars and sprites.',
    image: '/hero-character.jpg',
  },
  {
    label: 'minecraft',
    title: 'Minecraft world',
    body: 'Convert scenes into block-inspired art.',
    image: '/hero-minecraft.jpg',
  },
];

export default function Home() {
  return (
    <div className="page-shell">
      <section className="rail-frame">
        <BeforeAfter />

        <div className="grid gap-8 border-b border-[var(--line)] px-4 py-12 sm:px-10 lg:grid-cols-[1fr_260px] lg:items-start">
          <div>
            <p className="terminal-label">/ image to pixel art</p>
            <h1 className="crt-title mt-5 max-w-[320px] break-words text-[3rem] leading-[1.03] sm:max-w-5xl sm:text-[clamp(3.2rem,6vw,5.6rem)]">
              <span className="block text-[var(--paper)] [text-shadow:none]">Turn any</span>
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
            title: 'Full color, retro, or Game Boy',
            body: 'Keep the original colors, snap to a PICO-8-style palette, or compress everything into classic green tones.',
          },
          {
            label: 'builds',
            title: 'Minecraft-scale blocks',
            body: 'Raise the block size for chunky references that are easier to rebuild block by block in a world.',
          },
          {
            label: 'export',
            title: 'Hard-edged PNG output',
            body: 'The preview and download keep image smoothing off, so the exported pixel grid stays crisp.',
          },
        ]}
      />

      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">how it works</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          A photo becomes a grid, then a palette decision.
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          Pixvael reads your photo through an HTML5 canvas, samples it in small
          blocks, averages each block into one color, then optionally maps that
          color to a limited palette with Floyd-Steinberg dithering. Because the
          whole conversion happens in the browser, the image stays local and the
          preview updates as you tune the controls.
        </p>
      </section>

      <FaqSection faqs={faqs} />

      <JsonLd data={buildWebAppSchema()} />
      <JsonLd data={buildFaqSchema(faqs)} />
    </div>
  );
}
