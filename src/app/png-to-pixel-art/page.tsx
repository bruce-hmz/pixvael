import type { Metadata } from 'next';
import { PixelLanding } from '@/components/PixelLanding';
import { StudioInfoGrid, StudioProse } from '@/components/studio/StudioSections';
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
      variant="studio"
      eyebrow="/ png to pixel art"
      breadcrumbs={[{ name: 'Image to Pixel Art', href: '/image-to-pixel-art' }]}
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
      <StudioProse title="Pixel art from PNGs: transparency is the superpower">
        <p>
          A PNG can carry an alpha channel, and Pixvael respects it all the way
          through the pipeline: transparent edges are weighted correctly during
          downsampling, so you never get dirty gray halos, and the exported
          pixel PNG keeps a transparent background. That makes PNG the right
          input for logos, game sprites, and stickers you want to drop onto any
          background. Use a small block size (4-8) for detailed artwork, and the
          full-color palette to preserve brand colors exactly.
        </p>
      </StudioProse>

      <StudioProse title="Logos and sprites vs photo pixel art">
        <p>
          Start with a PNG whenever the source has transparency or flat color
          areas — a logo, an icon, a game sprite sheet. Photos usually arrive as
          JPG or WebP; the{' '}
          <a
            href="/jpg-to-pixel-art"
           
          >
            JPG converter
          </a>{' '}
          and{' '}
          <a
            href="/webp-to-pixel-art"
           
          >
            WebP converter
          </a>{' '}
          cover those. If your PNG pixel art is destined for a Minecraft build,
          jump to the{' '}
          <a
            href="/minecraft-pixel-art"
           
          >
            build planner
          </a>{' '}
          to map it to blocks and count materials.
         For the full walkthrough of every
          control — grids, palettes, dithering, and export — start with the{' '}
          <a
            href="/image-to-pixel-art"
           
          >
            image to pixel art
          </a>{' '}
          guide.
        </p>
      </StudioProse>

      <StudioInfoGrid
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
          { name: 'Home', url: 'https://pixvael.com' },
          { name: 'Image to Pixel Art', url: 'https://pixvael.com/image-to-pixel-art' },
          { name: 'PNG to Pixel Art', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
