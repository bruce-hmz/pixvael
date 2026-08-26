import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/image-to-minecraft-pixel-art';
const faqs = [
  {
    question: 'How quickly can I convert an image to Minecraft blocks?',
    answer:
      'The conversion runs locally as soon as the image loads. Most images produce a block grid and material list in under a second on a modern device.',
  },
  {
    question: 'Which images convert most clearly?',
    answer:
      'Images with one clear subject, simple backgrounds, and strong contrast remain recognizable at practical Minecraft build sizes.',
  },
  {
    question: 'Does the source image leave my device?',
    answer:
      'No. Image decoding, color mapping, grid generation, and export all run inside your browser.',
  },
];

export const metadata: Metadata = {
  title: 'Image to Minecraft Pixel Art — Free Online Converter',
  description:
    'Turn a photo into Minecraft blocks in seconds. Pick a grid width and get an instant block map plus material CSV — free, no signup, nothing uploaded.',
  alternates: { canonical: 'https://pixvael.com/image-to-minecraft-pixel-art' },
  keywords: [
    'image to minecraft pixel art',
    'convert image to minecraft pixel art',
  ],
  openGraph: {
    title: 'Image to Minecraft Pixel Art — Free Online Converter',
    description:
      'Convert any image to Minecraft pixel art online. Free, private, no signup — runs in your browser.',
    url: 'https://pixvael.com/image-to-minecraft-pixel-art',
    images: [{ url: '/hero-minecraft.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-minecraft.jpg'] },
};

export default function ImageToMinecraftPixelArtPage() {
  return (
    <PixelLanding
      eyebrow="/ image to minecraft pixel art"
      title="Image to Minecraft pixel art"
      description="Drop an image and get a Minecraft block plan instantly. Choose the grid width, preview build lines, and export a material list entirely in your browser."
      defaultPixelSize={12}
      defaultPaletteId="full"
      mode="minecraft"
      minecraftStep="convert"
      facts={['image input', 'block mapping', 'materials CSV']}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">tips</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          Tips for the best result
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          High-contrast images with one clear subject convert best. Faces,
          logos, pets, and simple character art hold their shape better than
          busy scenes. If the result looks muddy, reduce the build width for a
          simpler silhouette or use a higher-contrast source image.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">when to use</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          When speed matters more than editing
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          This page is the fastest path from image to Minecraft blocks: drop a
          file, pick a width, and you get a block grid plus material CSV in
          under a second. It is the right tool when you want to see whether an
          image is worth building before you commit — try a pet photo, a logo,
          or a character portrait at 32 or 48 blocks wide, and the result tells
          you immediately if the silhouette holds up. The build planner
          embedded on this page keeps larger builds organized too: track
          progress across sections and come back later — your plan is saved in
          this browser. For a deeper guide to sizes, sections, and material
          mapping, see the{' '}
          <a href="/minecraft-pixel-art" className="text-[var(--pixel-lime)] underline">
            build planner guide
          </a>
          . To fix individual blocks after conversion, use the{' '}
          <a href="/minecraft-pixel-art-maker" className="text-[var(--pixel-lime)] underline">
            maker
          </a>
          . If you are torn between 24, 32, 48, and 64 blocks wide, the{' '}
          <a href="/minecraft-pixel-art-converter" className="text-[var(--pixel-lime)] underline">
            size converter
          </a>{' '}
          shows all four side by side. Prefer an art-first name for the same
          job? The{' '}
          <a href="/minecraft-pixel-art-generator" className="text-[var(--pixel-lime)] underline">
            Minecraft pixel art generator
          </a>{' '}
          runs this identical conversion.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'source',
            title: 'Use one clear subject',
            body: 'Simple backgrounds become cleaner blocks and make the main shape easier to rebuild.',
          },
          {
            label: 'contrast',
            title: 'Favor bold light and dark areas',
            body: 'Pixel conversion works best when the original image already has a readable silhouette.',
          },
          {
            label: 'export',
            title: 'Save a reference PNG',
            body: 'Download the final image and keep it open while you translate the design into blocks.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Image to Minecraft Pixel Art',
          description:
            'Fast local image-to-Minecraft conversion with block mapping and exports.',
          url: pageUrl,
          featureList: ['Local image conversion', 'Minecraft block palette', 'PNG and CSV export'],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Image to Minecraft Pixel Art', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
