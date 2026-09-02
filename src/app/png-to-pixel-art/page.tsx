import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/png-to-pixel-art';
const faqs = [
  {
    question: 'Does the PNG converter keep transparency?',
    answer:
      'Yes. Transparent areas stay transparent in the pixel art output, because conversion preserves the alpha channel — ideal for logos, sprites, and stickers.',
  },
  {
    question: 'What is the best block size for a PNG logo?',
    answer:
      '24 to 32 blocks wide keeps a logo readable at a glance. For detailed sprites, try 48 blocks and the full-color palette so small color differences survive.',
  },
  {
    question: 'Why choose PNG over JPG for pixel art?',
    answer:
      'PNG is lossless and supports transparency, so edges stay clean and you can export a pixel PNG with a transparent background. JPG is better for smooth photo gradients. See the JPG converter for photo workflows.',
  },
];

export const metadata: Metadata = {
  title: 'PNG to Pixel Art — Free Online Converter',
  description:
    'Turn any PNG into pixel art online, keeping transparency for logos and sprites. Pick a block size and palette, add dithering, and export a crisp PNG — free, no signup.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'PNG to Pixel Art — Free Online Converter',
    description:
      'Convert PNG images to pixel art in your browser — transparency preserved. Free, private, no upload.',
    url: pageUrl,
    images: [{ url: '/hero-portrait-v2.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-portrait-v2.jpg'] },
};

export default function PngToPixelArtPage() {
  return (
    <PixelLanding
      eyebrow="/ png to pixel art"
      title="PNG to pixel art"
      description="Drop a PNG and get pixel art with transparency intact. Fine-tune block size and palette for logos, sprites, and stickers — 100% in your browser."
      defaultPixelSize={4}
      defaultPaletteId="full"
      facts={['PNG input', 'alpha preserved', 'PNG output']}
      howTo={{
        name: 'How to convert a PNG to pixel art',
        steps: [
          { name: 'Drop your PNG', text: 'Load a PNG from your device — logos, sprites, and stickers are ideal sources. The conversion is fully local.' },
          { name: 'Choose a fine grid', text: 'Simple graphics read best at low block sizes; start at 4 and adjust until the silhouette is clean.' },
          { name: 'Snap to a palette', text: 'Map colors onto PICO-8 or Game Boy palettes for game-ready sprites, or keep full color for detailed logos.' },
          { name: 'Export your pixel art', text: 'Download a crisp PNG with transparency intact, ready to use as a sprite, sticker, or icon.' },
        ],
      }}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">tips</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          Pixel art from PNGs: transparency is the superpower
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          A PNG can carry an alpha channel, and Pixvael respects it all the way
          through the pipeline: transparent edges are weighted correctly during
          downsampling, so you never get dirty gray halos, and the exported
          pixel PNG keeps a transparent background. That makes PNG the right
          input for logos, game sprites, and stickers you want to drop onto any
          background. Use a small block size (4-8) for detailed artwork, and the
          full-color palette to preserve brand colors exactly.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">when to use</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          Logos and sprites vs photo pixel art
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Start with a PNG whenever the source has transparency or flat color
          areas — a logo, an icon, a game sprite sheet. Photos usually arrive as
          JPG or WebP; the{' '}
          <a
            href="/jpg-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            JPG converter
          </a>{' '}
          and{' '}
          <a
            href="/webp-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            WebP converter
          </a>{' '}
          cover those. If your PNG pixel art is destined for a Minecraft build,
          jump to the{' '}
          <a
            href="/minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            build planner
          </a>{' '}
          to map it to blocks and count materials.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'alpha',
            title: 'Transparent stays transparent',
            body: 'The output PNG keeps a transparent background — no white fill, no halos.',
          },
          {
            label: 'edges',
            title: 'Clean edges for logos',
            body: 'Alpha-weighted downsampling keeps crisp, unpolluted edges on cut-out artwork.',
          },
          {
            label: 'export',
            title: 'Sprite-ready output',
            body: 'Small block sizes produce sprite-sheet-friendly results at any width you choose.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael PNG to Pixel Art',
          description:
            'Free online PNG to pixel art converter that preserves transparency — runs locally in your browser.',
          url: pageUrl,
          featureList: [
            'Alpha channel preserved',
            'Block size and palette controls',
            'Transparent PNG export',
          ],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'PNG to Pixel Art', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
