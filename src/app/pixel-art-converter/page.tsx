import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/pixel-art-converter';
const faqs = [
  {
    question: 'Will the converted PNG stay sharp when I scale it?',
    answer:
      'Yes. Export keeps hard pixel edges with no anti-aliasing, so enlarging never blurs — the art scales crisply into game engines, print, and avatars.',
  },
  {
    question: 'Can I convert images on a phone?',
    answer:
      'Yes. The converter runs in any modern mobile browser with nothing to install; controls and export work exactly as on desktop.',
  },
  {
    question: 'Do transparent PNGs stay transparent?',
    answer:
      'Yes. Alpha transparency carries through the conversion — transparent areas remain transparent in the exported pixel-art PNG.',
  },
];

export const metadata: Metadata = {
  title: 'Pixel Art Converter — Free Online Tool',
  description:
    'Convert images to pixel art online. Grid size, palettes, and dithering with crisp PNG export — free, no signup, and files never leave your device.',
  alternates: { canonical: pageUrl },
  keywords: [
    'pixel art converter',
    'convert image to pixel art',
    'online pixel art converter',
  ],
  openGraph: {
    title: 'Pixel Art Converter — Free Online Tool',
    description:
      'Convert any image to pixel art in your browser. Free, private, no signup.',
    url: pageUrl,
    images: [{ url: '/hero-portrait-v2.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-portrait-v2.jpg'] },
};

export default function PixelArtConverterPage() {
  return (
    <PixelLanding
      eyebrow="/ pixel art converter"
      title="Pixel art converter"
      description="Convert any image to pixel art right here. Set the grid, pick a palette, toggle dithering, and export a crisp PNG — free, private, no signup."
      defaultPixelSize={12}
      defaultPaletteId="full"
      facts={['JPG · PNG · WebP', 'local conversion', 'PNG export']}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">what it does</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          Three dials and one promise
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          A pixel art converter restyles a photograph or screenshot into
          grid-based art, and Pixvael gives you three dials to steer it. Grid
          size decides how many blocks wide the piece is — the single biggest
          lever between chunky-and-bold and nearly photographic. Palette
          constrains the colors: full color keeps the original hues, the retro
          16-color set snaps everything to a PICO-8-style vocabulary, and Game
          Boy mode compresses the image into four greens. Dithering trades
          spatial resolution for the illusion of extra shades, scattering
          block-to-block color changes so gradients survive a limited palette
          instead of banding. The promise is the export: hard edges and flat
          colors, no smoothing, every pixel a deliberate square — which is
          exactly what lets pixel art scale without turning to mush.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">formats and sources</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          Every format, one pipeline
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          JPG, PNG, and WebP convert through the same pipeline, and each{' '}
          <a
            href="/jpg-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            JPG
          </a>
          ,{' '}
          <a
            href="/png-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            PNG
          </a>
          , and{' '}
          <a
            href="/webp-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            WebP
          </a>{' '}
          page carries its format quirks. If you think in sources rather than
          formats, the{' '}
          <a
            href="/photo-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            photo converter
          </a>{' '}
          handles portraits and pets, the{' '}
          <a
            href="/picture-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            picture converter
          </a>{' '}
          covers screenshots and mixed sources, and the full walkthrough lives
          in the{' '}
          <a
            href="/image-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            image to pixel art guide
          </a>
          . Building for a block game instead? The{' '}
          <a
            href="/minecraft-pixel-art-generator"
            className="text-[var(--pixel-lime)] underline"
          >
            Minecraft pixel art generator
          </a>{' '}
          maps converted art onto real block colors with a material list.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">workflow</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          Converting takes three moves
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Load the image — drag it onto the canvas or browse for the file;
          nothing uploads. Tune the dials — adjust the grid until the subject
          reads, pick a palette to taste, toggle dithering if gradients band.
          Export — download the PNG and use it anywhere: game sprites,
          avatars, wallpapers, cross-stitch charts.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'grids',
            title: 'One dial, many looks',
            body: 'The same source at 8, 16, and 32 blocks wide produces three different pieces — coarse, balanced, and detailed art.',
          },
          {
            label: 'palettes',
            title: 'Color vocabulary is style',
            body: 'Full color for realism, sixteen retro colors for 8-bit authenticity, four greens for handheld nostalgia.',
          },
          {
            label: 'export',
            title: 'Hard edges, forever',
            body: 'The PNG ships without smoothing, so the art stays crisp from sprite sheet to billboard.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Pixel Art Converter',
          description:
            'Free online pixel art converter with grid size, palettes, and dithering — runs locally in your browser with no upload.',
          url: pageUrl,
          featureList: [
            'JPG, PNG, and WebP input',
            'Full color / PICO-8 / Game Boy palettes',
            'Floyd-Steinberg dithering',
            'PNG transparency preserved',
            'Sharp PNG export',
          ],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Pixel Art Converter', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
