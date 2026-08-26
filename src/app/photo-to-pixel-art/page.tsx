import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/photo-to-pixel-art';
const faqs = [
  {
    question: 'What is the best block size for a photo?',
    answer:
      'For a recognizable portrait or pet photo, start at 8 blocks across and raise it if the subject holds. Logos and simple shapes read well at 24-32, detailed scenes at 48-64.',
  },
  {
    question: 'What kind of photo converts best?',
    answer:
      'One clear subject, a simple background, and strong contrast convert most reliably. Faces, pets, and single objects keep their silhouette; busy scenes turn into noisy blocks.',
  },
  {
    question: 'Will pixel art from a photo look like a mosaic?',
    answer:
      'Not necessarily. With dithering enabled, a limited palette like 8-bit (PICO-8) recreates gradients with color mixing instead of harsh bands — the classic retro pixel-art look rather than a mosaic.',
  },
];

export const metadata: Metadata = {
  title: 'Photo to Pixel Art — Free Online Converter',
  description:
    'Turn any photo into pixel art online. Get the right block size for portraits, pets, and scenery, pick a palette, and download a crisp PNG — free, private, no upload.',
  alternates: { canonical: pageUrl },
  keywords: ['photo to pixel art', 'convert photo to pixel art'],
  openGraph: {
    title: 'Photo to Pixel Art — Free Online Converter',
    description:
      'Turn photos into pixel art in your browser. Free, private, no signup — your photo never leaves your device.',
    url: pageUrl,
    images: [{ url: '/hero-portrait-v2.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-portrait-v2.jpg'] },
};

export default function PhotoToPixelArtPage() {
  return (
    <PixelLanding
      eyebrow="/ photo to pixel art"
      title="Photo to pixel art"
      description="Drop a photo and turn it into pixel art in seconds. Pick the right block size for your subject, choose a palette, and export a sharp PNG — entirely in your browser."
      defaultPixelSize={8}
      defaultPaletteId="full"
      facts={['photo input', 'PNG output', 'no upload']}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">tips</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          Photo to pixel art by subject
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          The right settings depend on what is in the photo. Portraits keep
          their likeness at 8-16 blocks wide — start with the 8-bit (PICO-8)
          palette and dithering on, which recovers shading in the face without
          muddying the pixels. Pets convert well because fur reads as chunky
          texture; a block size of 8 hides messy fur detail while keeping the
          animal readable. Landscapes and skies need dithering most: smooth
          gradients band badly under plain quantization, and Floyd-Steinberg
          error diffusion is what keeps a sunset looking like a sunset.
          However you start, turning a photo into pixel art comes down to the
          same three dials — block size, palette, and dithering.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">workflow</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          From photo to finished pixel art in three steps
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          First, choose a photo with one clear subject and a simple background —
          it will always convert better than a busy scene. Second, set the block
          size by the detail you want: small blocks preserve features, large
          blocks read as bold pixel art. Third, pick a palette that fits the
          mood — full color for realism, retro 16-color for 8-bit charm, Game
          Boy greens for handheld nostalgia. JPG and WebP photos work
          identically; use the{' '}
          <a
            href="/jpg-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            JPG
          </a>{' '}
          or{' '}
          <a
            href="/webp-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            WebP
          </a>{' '}
          converters for format-specific tips, and the{' '}
          <a
            href="/minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            Minecraft planner
          </a>{' '}
          if the pixel art is destined for a block build.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'portrait',
            title: 'Faces read best at 8-16',
            body: 'A small block size keeps eyes and jawlines recognizable; dithering restores skin shading.',
          },
          {
            label: 'pet',
            title: 'Fur becomes texture',
            body: 'Furry subjects convert beautifully — blocky fur reads as intentional pixel texture.',
          },
          {
            label: 'scenery',
            title: 'Gradients need dithering',
            body: 'Skies and sunsets band without error diffusion; toggle dithering for smooth transitions.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Photo to Pixel Art',
          description:
            'Free online photo to pixel art converter with per-subject block size guidance, palettes, and dithering — runs locally in your browser.',
          url: pageUrl,
          featureList: [
            'Local photo conversion',
            'Subject-based block size guidance',
            'PICO-8 / Game Boy palettes',
            'Floyd-Steinberg dithering',
            'Sharp PNG export',
          ],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Photo to Pixel Art', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
