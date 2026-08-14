import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/jpg-to-pixel-art';
const faqs = [
  {
    question: 'Is JPG the best format to convert to pixel art?',
    answer:
      'JPG works well for photos because the file already stores smooth color gradients. Pick a smaller block size (4-8) to keep detail, and enable dithering to recover shading in dark areas.',
  },
  {
    question: 'Do JPG compression artifacts affect the pixel art result?',
    answer:
      'Heavily compressed JPGs can show blocky noise that becomes extra color speckles after conversion. Use a block size of 8 or higher, or a limited palette like 8-bit (PICO-8), to smooth those artifacts away.',
  },
  {
    question: 'Can I convert a JPG without uploading it?',
    answer:
      'Yes. The conversion runs entirely in your browser — the image is decoded locally with Canvas and never leaves your device.',
  },
];

export const metadata: Metadata = {
  title: 'JPG to Pixel Art — Free Online Converter',
  description:
    'Turn any JPG photo into crisp pixel art online. Pick a block size and palette, add dithering, and download a sharp PNG — free, no signup, nothing uploaded.',
  alternates: { canonical: pageUrl },
  keywords: ['jpg to pixel art', 'jpeg to pixel art'],
  openGraph: {
    title: 'JPG to Pixel Art — Free Online Converter',
    description:
      'Convert JPG photos to pixel art in your browser. Free, private, no signup — no upload, no watermark.',
    url: pageUrl,
    images: [{ url: '/hero-portrait-v2.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-portrait-v2.jpg'] },
};

export default function JpgToPixelArtPage() {
  return (
    <PixelLanding
      eyebrow="/ jpg to pixel art"
      title="JPG to pixel art"
      description="Drop a JPG photo and get crisp pixel art in seconds. Choose a block size and palette, add dithering, and download a sharp PNG — all in your browser."
      defaultPixelSize={8}
      defaultPaletteId="retro"
      facts={['JPG input', 'PNG output', 'no upload']}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">tips</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          Getting clean pixel art from a JPG photo
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          JPG photos are the classic input for pixel art because they already
          contain smooth gradients. Start with a block size of 8 for bold
          silhouettes, or 4 if you want to keep facial features and small
          details. High-contrast subjects with one clear focal point convert
          best — busy backgrounds turn into noisy blocks that dilute the pixel
          look. If the result feels muddy, try the 8-bit (PICO-8) palette with
          dithering on: the 16-color limit forces clean color bands and the
          error diffusion recovers shading that plain quantization would lose.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">when to use</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          JPG vs PNG vs WebP for pixel art
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Every format converts, but they behave differently. JPG is the best
          match for photos: it compresses color smoothly, and small artifacts
          disappear once you downsample to blocks. If your source is a logo or
          sprite with transparency, use the{' '}
          <a
            href="/png-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            PNG converter
          </a>{' '}
          instead — it preserves the alpha channel. For modern web images, the{' '}
          <a
            href="/webp-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            WebP converter
          </a>{' '}
          handles the same workflow. And if your goal is a Minecraft block
          build, use the{' '}
          <a
            href="/minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            Minecraft build planner
          </a>{' '}
          for material counts and blueprints.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'blocks',
            title: 'Match the block size to the subject',
            body: 'Portraits keep shape at 8-16 blocks; logos and icons read best at 24-32.',
          },
          {
            label: 'palette',
            title: 'Full color keeps realism',
            body: 'Use full color for photo-real pixel art, or 8-bit / Game Boy palettes for a retro look.',
          },
          {
            label: 'export',
            title: 'Download a sharp PNG',
            body: 'Output is scaled with nearest-neighbor so block edges stay crisp at any download size.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael JPG to Pixel Art',
          description:
            'Free online JPG to pixel art converter with block size, palettes, and dithering — runs locally in your browser.',
          url: pageUrl,
          featureList: [
            'Local JPG conversion',
            'Block size and palette controls',
            'Floyd-Steinberg dithering',
            'Sharp PNG export',
          ],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'JPG to Pixel Art', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
