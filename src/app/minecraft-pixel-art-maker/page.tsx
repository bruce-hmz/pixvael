import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/minecraft-pixel-art-maker';
const faqs = [
  {
    question: 'Can I edit individual Minecraft blocks?',
    answer:
      'Yes. Use Paint to replace a cell, Pick to sample its block, Restore to return the generated color, and Undo or Redo for recent edits.',
  },
  {
    question: 'Are my edits saved?',
    answer:
      'Edits are saved locally for the current image and grid size. They can be restored without uploading the source image or design.',
  },
  {
    question: 'Do material counts update after painting?',
    answer:
      'Yes. Section totals, the full material list, PNG output, CSV, and blueprints all use the edited block design.',
  },
];

export const metadata: Metadata = {
  title: 'Minecraft Pixel Art Maker — Free Online Tool',
  description:
    'Make and edit Minecraft pixel art from any photo. Paint individual blocks, replace colors, and export a build blueprint locally.',
  alternates: { canonical: 'https://pixvael.com/minecraft-pixel-art-maker' },
  keywords: ['minecraft pixel art maker', 'minecraft pixel art creator'],
  openGraph: {
    title: 'Minecraft Pixel Art Maker — Free Online Tool',
    description:
      'Make Minecraft pixel art from any photo. Free online maker — no signup, no watermark, runs in your browser.',
    url: 'https://pixvael.com/minecraft-pixel-art-maker',
    images: [{ url: '/hero-character.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-character.jpg'] },
};

export default function MinecraftPixelArtMakerPage() {
  return (
    <PixelLanding
      eyebrow="/ minecraft pixel art maker"
      title="Minecraft pixel art maker"
      description="Upload a photo, then edit the generated Minecraft art block by block. Paint with real block colors, pick or restore cells, and export the finished blueprint locally."
      defaultPixelSize={12}
      defaultPaletteId="full"
      mode="minecraft"
      minecraftTool="maker"
      minecraftStep="edit"
      facts={['block painter', '20 materials', 'local export']}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">when to use</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          When to edit blocks instead of starting over
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Generated Minecraft pixel art gets you most of the way there, but the
          last stretch — a misread eye, a block that should be sandstone instead
          of concrete, a stray color at an edge — is where a one-shot converter
          gives up. The maker is for that last stretch. After the automatic
          conversion, paint individual cells with real Minecraft block colors,
          pick a color from an existing cell, restore the generated color if you
          change your mind, and undo or redo any step. Every edit updates the
          material counts, the PNG, the CSV, and the blueprint, so what you see
          is exactly what you will build. Use the maker when a converted image
          is close but not right: fixing a face, swapping a few blocks for
          materials you actually have, or cleaning up an edge. For a no-edit
          conversion, use the{' '}
          <a href="/image-to-minecraft-pixel-art" className="text-[var(--pixel-lime)] underline">
            image-to-Minecraft converter
          </a>
          ; for large multi-section builds, the{' '}
          <a href="/minecraft-pixel-art" className="text-[var(--pixel-lime)] underline">
            build planner
          </a>
          ; to compare sizes first, the{' '}
          <a href="/minecraft-pixel-art-converter" className="text-[var(--pixel-lime)] underline">
            size converter
          </a>
          .
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'avatars',
            title: 'Turn faces into block portraits',
            body: 'Simple, high-contrast photos become readable avatars and profile icons with just a few slider changes.',
          },
          {
            label: 'walls',
            title: 'Plan larger fan builds',
            body: 'Use chunkier blocks to simplify characters, logos, or poster art before you rebuild them in-game.',
          },
          {
            label: 'tune',
            title: 'Edit every generated block',
            body: 'Paint, pick, or restore individual cells before exporting the finished design and material counts.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Minecraft Pixel Art Maker',
          description:
            'Editable Minecraft pixel art maker with block painting, picking, restore, undo, and export.',
          url: pageUrl,
          featureList: ['Block painter', 'Undo and redo', 'Local edit persistence', 'Blueprint export'],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Minecraft Pixel Art Maker', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
