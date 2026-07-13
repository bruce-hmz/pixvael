import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/minecraft-pixel-art';

export const metadata: Metadata = {
  title: 'Minecraft Pixel Art — Convert Any Image to Minecraft Style',
  description:
    'Turn any photo into a Minecraft block plan in your browser. Set the grid width, count mapped materials, and download a PNG plus CSV — no signup or upload.',
  alternates: { canonical: 'https://pixvael.com/minecraft-pixel-art' },
  keywords: [
    'minecraft pixel art',
    'minecraft pixel art converter',
    'minecraft pixel art maker',
  ],
  openGraph: {
    title: 'Minecraft Pixel Art — Convert Any Image to Minecraft Style',
    description:
      'Turn any photo into a Minecraft block plan with a build grid, material counts, PNG guide, and CSV export.',
    url: 'https://pixvael.com/minecraft-pixel-art',
    images: [{ url: '/hero-minecraft.jpg', width: 1200, height: 800 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-minecraft.jpg'] },
};

const faqs = [
  {
    question: 'What size should Minecraft pixel art be?',
    answer:
      'Start around 48 blocks across. Use 16–32 blocks for simple logos and 64–128 blocks for detailed portraits or scenes.',
  },
  {
    question: 'Can I use the result in my Minecraft world?',
    answer:
      'The PNG is a flat image — use it as a reference to recreate the build block-by-block, or import it into a map-art tool.',
  },
];

export default function MinecraftPixelArtPage() {
  return (
    <>
      <PixelLanding
        eyebrow="/ minecraft pixel art"
        title="Minecraft pixel art"
        description="Turn any photo into a Minecraft build plan right in your browser. Set the grid width, map colors to common blocks, and download a PNG plus material list with no signup and nothing uploaded."
        defaultPixelSize={12}
        defaultPaletteId="full"
        mode="minecraft"
        facts={['48-block default', 'material counts', 'PNG + CSV']}
        faqs={faqs}
      >
        <InfoGrid
          items={[
            {
              label: 'scale',
              title: 'Choose buildable blocks',
              body: 'Set a width from 16 to 128 blocks and Pixvael calculates the matching height automatically.',
            },
            {
              label: 'palette',
              title: 'Use Minecraft materials',
              body: 'Colors map to common concrete, stone, wood, and sandstone blocks instead of an abstract RGB palette.',
            },
            {
              label: 'reference',
              title: 'Download a build guide',
              body: 'Use the PNG grid as a visual reference and the CSV material list to gather blocks before building.',
            },
          ]}
        />

        <section className="pixel-panel mt-16 p-6 sm:p-8">
          <p className="terminal-label">guide</p>
          <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
            How to make Minecraft pixel art
          </h2>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
            Minecraft pixel art is built from a grid of colored blocks. Pixvael
            averages each block of pixels into one color, producing a chunky
            block-by-block look. Narrower grids simplify the build; wider grids
            preserve more detail and increase the material count.
          </p>
        </section>

        <section className="pixel-panel mt-8 p-6 sm:p-8">
          <p className="terminal-label">when to use</p>
          <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
            When the build planner beats a one-shot converter
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
            Most Minecraft pixel art converters stop at one image and one grid
            size. The build planner here splits a large build into sections you
            tackle one at a time, tracks progress as you place blocks, and keeps
            a running material count per zone. That matters for big builds — a
            96-wide mural is hundreds of blocks and dozens of material types,
            and building it from a single flat PNG leads to mistakes and
            shortages. Use this planner for anything larger than a 32-wide logo:
            survival base facades, server spawn art, multi-panel walls, event
            banners. For a single quick conversion, use the{' '}
            <a
              href="/image-to-minecraft-pixel-art"
              className="text-[var(--pixel-lime)] underline"
            >
              image-to-Minecraft converter
            </a>
            ; to edit blocks after conversion, use the{' '}
            <a
              href="/minecraft-pixel-art-maker"
              className="text-[var(--pixel-lime)] underline"
            >
              maker
            </a>
            ; to compare four sizes at once, use the{' '}
            <a
              href="/minecraft-pixel-art-converter"
              className="text-[var(--pixel-lime)] underline"
            >
              size converter
            </a>
            .
          </p>
        </section>
      </PixelLanding>
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Minecraft Build Planner',
          description:
            'Interactive Minecraft pixel art build planner with sections, progress tracking, materials, and coordinate blueprints.',
          url: pageUrl,
          featureList: ['Section build mode', 'Progress tracking', 'Material counts', 'Coordinate blueprints'],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Minecraft Build Planner', url: pageUrl },
        ])}
      />
    </>
  );
}
