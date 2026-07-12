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
    images: [{ url: '/hero-character.jpg', width: 1200, height: 800 }],
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
      facts={['block painter', '20 materials', 'local export']}
      faqs={faqs}
    >
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
