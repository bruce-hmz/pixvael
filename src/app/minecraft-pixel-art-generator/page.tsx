import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/minecraft-pixel-art-generator';
const faqs = [
  {
    question: 'What does a Minecraft pixel art generator do?',
    answer:
      'It turns an image into a Minecraft-ready pixel grid: every cell is mapped to the nearest block color, so what you preview is what you build. You get the block map, a reference PNG, and a material list counting each block type.',
  },
  {
    question: 'How wide should generated pixel art be?',
    answer:
      '24-32 blocks wide keeps silhouettes readable and survival-gatherable; 48-64 preserves detail for portraits and logos at the cost of materials. Generate small first, then scale up once the shape works.',
  },
  {
    question: 'Can I edit the generated art?',
    answer:
      'Yes. Compare four widths side by side in the size converter, fix individual blocks in the maker, or track larger builds section by section in the build planner — the generated grid carries across all of them.',
  },
];

export const metadata: Metadata = {
  title: 'Minecraft Pixel Art Generator — Free Online Tool',
  description:
    'Generate Minecraft pixel art from any image. Pick a build width and get an instant block map plus material list — free, no signup, nothing uploaded.',
  alternates: { canonical: pageUrl },
  keywords: [
    'minecraft pixel art generator',
    'generate minecraft pixel art',
    'minecraft pixel art from image',
  ],
  openGraph: {
    title: 'Minecraft Pixel Art Generator — Free Online Tool',
    description:
      'Generate Minecraft pixel art from any image in your browser. Free, private, no signup.',
    url: pageUrl,
    images: [{ url: '/hero-minecraft.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-minecraft.jpg'] },
};

export default function MinecraftPixelArtGeneratorPage() {
  return (
    <PixelLanding
      eyebrow="/ minecraft pixel art generator"
      title="Minecraft pixel art generator"
      description="Generate Minecraft pixel art from any image. Set the build width, preview the block map, and export a material list — entirely in your browser."
      defaultPixelSize={12}
      defaultPaletteId="full"
      mode="minecraft"
      minecraftStep="convert"
      facts={['image input', 'block mapping', 'materials CSV']}
      howTo={{
        name: 'How to generate Minecraft pixel art',
        steps: [
          { name: 'Upload an image', text: 'Pick any picture to generate from. Everything runs in your browser — the image never leaves your device.' },
          { name: 'Set the build width', text: 'Choose the grid width for your build; wider grids keep more detail but need more blocks.' },
          { name: 'Review the generated block map', text: 'Check how your image maps onto Minecraft block colors and adjust the width if details are lost.' },
          { name: 'Export materials and blueprint', text: 'Download the material list and blueprint so you can build it block by block in game.' },
        ],
      }}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">how it generates</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          From image to block map in one pass
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          A Minecraft pixel art generator turns a picture into a build plan.
          Pixvael loads your image, scales it to the width you choose, and maps
          every cell to the nearest color in the Minecraft block palette — the
          same nearest-color judgment a builder makes by eye, applied instantly
          to every block. The output is three things at once: a block map you
          can preview with build lines, a PNG reference of the generated art,
          and a material list that totals each block type so you know what to
          gather before placing a single block. Nothing uploads on the way —
          decoding, generation, and export all run in your browser, which is
          also why regenerating at a new width is instant. Start at 32 blocks
          wide for a first pass — small enough to stay gatherable, large enough
          to keep a face or logo legible — then adjust until the silhouette
          reads the way you want.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">after generation</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          The generated grid is step one
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Generation starts a pipeline, and every handoff is one click away.
          Torn between 24, 32, 48, and 64 wide? The{' '}
          <a
            href="/minecraft-pixel-art-converter"
            className="text-[var(--pixel-lime)] underline"
          >
            size converter
          </a>{' '}
          shows all four side by side. A block came out wrong? The{' '}
          <a
            href="/minecraft-pixel-art-maker"
            className="text-[var(--pixel-lime)] underline"
          >
            maker
          </a>{' '}
          paints, picks, and restores individual cells. Building something
          big? The{' '}
          <a
            href="/minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            build planner
          </a>{' '}
          tracks progress section by section. And if you arrived here wanting
          the fastest image-to-blocks path with a speed-first framing, the{' '}
          <a
            href="/image-to-minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            image-to-Minecraft page
          </a>{' '}
          runs this same conversion.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">source images</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          What generates well
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          What generates well follows the same rules as what builds well. One
          clear subject — a pet, a portrait, a logo, a character — becomes
          readable art, while busy scenes dissolve into noise at any width.
          Strong contrast survives the block palette better than subtle
          gradients, and square-ish subjects fit build plots more naturally
          than wide panoramas. If the first generation looks muddy, drop the
          width and let the silhouette carry the piece — in Minecraft, chunky
          and readable beats detailed and murky every time.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'width',
            title: 'Small reads, large details',
            body: '24-32 blocks keeps art gatherable and legible; 48-64 trades materials for detail on portraits and logos.',
          },
          {
            label: 'palette',
            title: 'Nearest block color',
            body: 'Every cell maps to the closest Minecraft block color, so the preview is an honest preview of the build.',
          },
          {
            label: 'materials',
            title: 'Counted before you build',
            body: 'The material list totals each block type, so survival gathering starts with numbers instead of guesses.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Minecraft Pixel Art Generator',
          description:
            'Free Minecraft pixel art generator: turn any image into a block map with material counts — runs locally in your browser.',
          url: pageUrl,
          featureList: [
            'Local image generation',
            'Minecraft block palette mapping',
            'Material list export',
            'PNG reference export',
          ],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Minecraft Pixel Art Generator', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
