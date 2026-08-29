import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/minecraft-pixel-art-converter';
const faqs = [
  {
    question: 'Which Minecraft pixel art size should I choose?',
    answer:
      'Use 24 blocks for icons, 32 for compact builds, 48 for a balanced default, and 64 when portraits or scenes need more detail.',
  },
  {
    question: 'What does the comparison show?',
    answer:
      'Each variant shows its exact dimensions, total block count, material count, and a visual preview generated from the same source image.',
  },
  {
    question: 'Does selecting a variant change the export?',
    answer:
      'Yes. Selecting a card updates the main planner, material counts, PNG, CSV, and coordinate blueprint to that grid size.',
  },
];

export const metadata: Metadata = {
  title: 'Minecraft Pixel Art Converter — Free Online',
  description:
    'Compare four Minecraft pixel art sizes side by side, then export the best build grid, blueprint, and material list.',
  alternates: {
    canonical: 'https://pixvael.com/minecraft-pixel-art-converter',
  },
  keywords: [
    'minecraft pixel art converter',
    'minecraft photo to pixel art',
  ],
  openGraph: {
    title: 'Minecraft Pixel Art Converter — Free Online',
    description:
      'Free Minecraft pixel art converter. Turn any photo into Minecraft-style pixel art in your browser — no signup, nothing uploaded.',
    url: 'https://pixvael.com/minecraft-pixel-art-converter',
    images: [{ url: '/hero-minecraft.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-minecraft.jpg'] },
};

export default function MinecraftPixelArtConverterPage() {
  return (
    <PixelLanding
      eyebrow="/ minecraft pixel art converter"
      title="Minecraft pixel art converter"
      description="Compare compact, standard, and detailed Minecraft conversions side by side. See exact dimensions and material complexity before choosing a plan to export."
      defaultPixelSize={12}
      defaultPaletteId="full"
      mode="minecraft"
      minecraftTool="converter"
      minecraftStep="compare"
      facts={['4 live variants', 'size comparison', 'private export']}
      howTo={{
        name: 'How to compare Minecraft conversion sizes',
        steps: [
          { name: 'Load your source image', text: 'Bring in the image you want to build. It stays in this browser tab while you compare.' },
          { name: 'Compare four grid widths', text: 'See 24, 32, 48, and 64 blocks side by side with exact dimensions and material complexity.' },
          { name: 'Pick the clearest size', text: 'Balance detail against build effort — compact grids are fast to build, detailed grids keep more of the image.' },
          { name: 'Open and export the plan', text: 'Export the blueprint PNG and materials CSV for the size you chose.' },
        ],
      }}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">comparison</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          Minecraft pixel art vs regular pixel art
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          Both simplify a photo into a grid, but Minecraft pixel art favors
          a fixed block grid and a palette tied to buildable materials. Regular
          pixel art can preserve unrestricted colors. Use a narrower grid for a
          simpler build or increase the width when faces need more detail.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">when to use</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          When you are unsure which size to build
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Picking a build width blind is the most common reason a Minecraft
          pixel art project stalls: too small and the face is unrecognizable,
          too large and the material list becomes unmanageable. The size
          converter solves that by rendering four widths — 24, 32, 48, and 64
          blocks — from the same image at the same time, each with its exact
          dimensions, total block count, and material count. You see the
          tradeoff between detail and build effort before you commit. Once a
          variant looks right, select it and the main planner, exports, and
          material list all switch to that size. Use this converter when you are
          deciding the scope of a build: a 24-wide icon, a 32-wide logo, a
          48-wide portrait, or a 64-wide scene. For a single fast conversion at
          one size, use the{' '}
          <a href="/image-to-minecraft-pixel-art" className="text-[var(--pixel-lime)] underline">
            image-to-Minecraft converter
          </a>
          ; to edit blocks, the{' '}
          <a href="/minecraft-pixel-art-maker" className="text-[var(--pixel-lime)] underline">
            maker
          </a>
          ; for large sectioned builds, the{' '}
          <a href="/minecraft-pixel-art" className="text-[var(--pixel-lime)] underline">
            build planner
          </a>
          .
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'blocks',
            title: 'Start chunky',
            body: 'A 32–48 block width keeps the output practical while preserving a recognizable silhouette.',
          },
          {
            label: 'detail',
            title: 'Lower size for portraits',
            body: 'If a face or pet loses too much shape, raise the build width until the silhouette returns.',
          },
          {
            label: 'materials',
            title: 'Count before building',
            body: 'The material list shows exactly how many blocks of each mapped color the design needs.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Minecraft Pixel Art Converter',
          description:
            'Side-by-side Minecraft conversion comparison for choosing a practical build size.',
          url: pageUrl,
          featureList: ['Four live variants', 'Block and material comparison', 'Blueprint export'],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Minecraft Pixel Art Converter', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
