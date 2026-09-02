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
    question: 'How high resolution can the conversion go?',
    answer:
      'Up to 128 blocks wide. Detail improves noticeably from 48 toward 96-128, at the cost of materials — a 128 × 128 build is over 16,000 blocks, so read the material list first.',
  },
  {
    question: 'Is there a full walkthrough of the workflow?',
    answer:
      'Yes — the Minecraft image to pixel art guide covers image prep, build size, block choice, conversion, editing, and export end to end, with the tool one click away at each step.',
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
      howTo={{
        name: 'How to turn an image into Minecraft pixel art',
        steps: [
          { name: 'Drop in your image', text: 'Load any image from your device; it is mapped to Minecraft blocks locally, with no upload.' },
          { name: 'Choose the grid width', text: 'Set how many blocks wide the build should be — 32 is a good default for a wall build.' },
          { name: 'Preview the block map', text: 'Check build lines and block colors against common Minecraft blocks before committing.' },
          { name: 'Export the plan', text: 'Download the blueprint PNG and the materials CSV so you know exactly which blocks to gather.' },
        ],
      }}
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

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">under the hood</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          What Minecraft image to pixel art conversion actually does
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Builders phrase this job in every order — “image to Minecraft
          pixel art”, “Minecraft image to pixel art”, “convert an image to
          pixel art in Minecraft” — but under the hood it is one pipeline.
          Your picture is scaled to the width you choose, then every cell is
          matched to the nearest color in a buildable palette of more than
          fifty blocks: sixteen wool shades, sixteen terracotta earth tones,
          sixteen concretes, plus stone, deepslate, sandstone, and oak
          planks. The preview you see is the literal block map — the same
          grid that becomes the blueprint PNG and the material CSV — so what
          you approve on screen is what you gather and place in game.
        </p>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Want the whole journey written out step by step — image prep, size
          choice, palette filtering, editing, and export? Read the{' '}
          <a
            href="/tutorials/minecraft-image-to-pixel-art-guide"
            className="text-[var(--pixel-lime)] underline"
          >
            Minecraft image to pixel art guide
          </a>
          , then come back and run the conversion here.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">resolution</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          How much detail survives at high resolution
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Grid widths run from 16 to 128 blocks. At 32–48 wide a face or logo
          stays recognizable and the material list stays survivable; push
          toward high resolution — 96 or 128 blocks wide — and shading,
          outlines, and fine detail start to survive the conversion too. The
          trade is literal: a 128 × 128 grid is 16,384 blocks, so check the
          material CSV before you commit to gathering that in survival. Start
          small, confirm the silhouette reads, then re-convert at a higher
          width — and feed the converter a source image with at least as many
          pixels across as the blocks you plan to build, or it will be
          inventing detail your picture never had.
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
