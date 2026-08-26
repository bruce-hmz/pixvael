import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/image-to-pixel-art';
const faqs = [
  {
    question: 'How is converting an image to pixel art different from resizing it?',
    answer:
      'Resizing uses smooth interpolation, so a small image scales back up blurry. Pixel art rebuilds the image from a coarse grid of flat-colored blocks with hard edges, which stay crisp at any size — the defining trait of the style.',
  },
  {
    question: 'Which image formats can I convert?',
    answer:
      'Anything your browser can decode: JPG, PNG, WebP, and more. PNG transparency is preserved through the conversion, and format-specific tips live on the JPG, PNG, and WebP pages.',
  },
  {
    question: 'What makes a good source image?',
    answer:
      'One clear subject, a simple background, and strong lighting. Crop tight before converting so the subject fills the grid — detail that is not in the frame cannot survive pixelation.',
  },
];

export const metadata: Metadata = {
  title: 'Image to Pixel Art Converter — Free Online Tool',
  description:
    'Convert any image to pixel art online. Tune grid size, palette, and dithering, then export a crisp PNG — free, no signup, and the image never leaves your device.',
  alternates: { canonical: pageUrl },
  keywords: [
    'image to pixel art',
    'image to pixel art converter',
    'convert image to pixel art',
  ],
  openGraph: {
    title: 'Image to Pixel Art Converter — Free Online Tool',
    description:
      'Convert any image to pixel art in your browser. Free, private, no signup — your image never leaves your device.',
    url: pageUrl,
    images: [{ url: '/hero-portrait-v2.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-portrait-v2.jpg'] },
};

export default function ImageToPixelArtPage() {
  return (
    <PixelLanding
      eyebrow="/ image to pixel art"
      title="Image to pixel art"
      description="Convert any image to pixel art in your browser. Set the grid size, pick a palette, toggle dithering, and download a sharp PNG — no signup, no upload."
      defaultPixelSize={12}
      defaultPaletteId="full"
      facts={['any image format', 'local conversion', 'PNG export']}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">what happens</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          What converting an image to pixel art actually does
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          Pixel art is an image rebuilt from a coarse grid of flat-colored
          squares. Pixvael slices your source into blocks, averages each block
          down to a single color, and redraws the picture from those cells —
          the same discipline classic sprite artists followed by hand, applied
          automatically. Three controls shape the result. Grid size sets how
          coarse the art is: larger blocks read as bold and retro, smaller ones
          keep eyes, fur, and fine texture recognizable. The palette decides
          the color vocabulary, from full original color to a 16-color
          PICO-8-style set or the four Game Boy greens. Dithering scatters
          color changes between neighboring blocks so gradients and shading
          survive a limited palette instead of collapsing into bands. All of
          it runs on an HTML5 canvas in your browser — the file is never
          uploaded, which is also why the preview responds the moment you move
          a slider.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">starting points</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          One converter, a page per source
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          The tool on this page is the same engine that powers the{' '}
          <Link href="/" className="text-[var(--pixel-lime)] underline">
            Pixvael home converter
          </Link>
          , preset for general images — open any file and start from the
          default grid. Thinking in terms of the tool rather than the source?
          The{' '}
          <a
            href="/pixel-art-converter"
            className="text-[var(--pixel-lime)] underline"
          >
            pixel art converter
          </a>{' '}
          page frames the same engine around formats and export. If you know
          your source, the dedicated pages go deeper.
          Photos of people, pets, and scenery get subject-based grid-size
          recipes on the{' '}
          <a
            href="/photo-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            photo converter
          </a>
          ; screenshots and mixed sources are covered on the{' '}
          <a
            href="/picture-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            picture converter
          </a>
          ; and format quirks — JPG artifacts, PNG transparency, WebP — live on
          the{' '}
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
          pages. Builds destined for a block game start with the{' '}
          <a
            href="/image-to-minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            image-to-Minecraft flow
          </a>
          , which adds material lists and sectioned blueprints on top of the
          pixel art.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">workflow</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          Convert an image in three steps
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          First, drop in an image — drag it onto the canvas or pick a file;
          JPG, PNG, and WebP all work, and transparency carries through. Second,
          tune the look: adjust the grid size until the subject reads clearly,
          choose full color, retro 16, or Game Boy palette, and toggle
          dithering if gradients band. Third, export — the download is a sharp,
          hard-edged PNG that scales without blur, ready for a game engine, an
          avatar, or print.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'portraits',
            title: 'Faces survive at fine grids',
            body: 'Keep the grid fine enough that eyes and jawlines stay put, then let dithering restore the shading a limited palette would lose.',
          },
          {
            label: 'sprites',
            title: 'Limited palettes sell the style',
            body: 'Snapping to a 16-color retro set or four Game Boy greens is what makes converted art read as pixel art rather than a blurry photo.',
          },
          {
            label: 'builds',
            title: 'Coarse grids map to blocks',
            body: 'One block, one color at large grid sizes — the exact unit a Minecraft build needs, with a material list waiting downstream.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Image to Pixel Art',
          description:
            'Free online image to pixel art converter with grid size, palettes, and dithering — runs locally in your browser with no upload.',
          url: pageUrl,
          featureList: [
            'Local image conversion',
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
          { name: 'Image to Pixel Art', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
