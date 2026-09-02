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
      'It turns an image into a Minecraft-ready build plan: every cell is mapped to the nearest block color, so what you preview is what you build. You get an editable block map, a reference PNG, a material list counting each block type, and a .schematic file you can paste in game with WorldEdit.',
  },
  {
    question: 'Which Minecraft versions are supported?',
    answer:
      'Java Edition 1.9 through 1.21+. The palette filter matches your world: wool and terracotta cover 1.9+, concrete joins at 1.12+, and deepslate at 1.17+. Older filters simply shift colors toward wool and terracotta, so every generated block stays buildable.',
  },
  {
    question: 'How many blocks will I need?',
    answer:
      'Multiply width by height: a 32 × 32 build is 1,024 blocks, 64 × 64 is 4,096, and 128 × 128 is 16,384. The material list totals each block type before you gather anything, so survival runs start with exact numbers.',
  },
  {
    question: 'Can I edit the generated art?',
    answer:
      'Yes — right on this page. Paint replaces any cell with any palette block, pick samples an existing cell, restore returns the generated color, and every edit is undoable. Edits and build progress save in your browser, and the whole project can be saved to a file to continue later.',
  },
  {
    question: 'Can I use the export with Litematica or on Bedrock?',
    answer:
      'The .schematic file pastes directly with WorldEdit on Java Edition, and Litematica users can convert it through Litematica\u2019s schematic converter. On Bedrock, build from the blueprint PNG and material list — the grid and counts are identical. Native .litematic and Bedrock exports are on the roadmap.',
  },
  {
    question: 'Does the source image leave my device?',
    answer:
      'No. Decoding, block mapping, editing, and every export — including the .schematic — run inside your browser. Nothing uploads, which is also why re-generating at a new width is instant.',
  },
];

export const metadata: Metadata = {
  title: {
    absolute: 'Minecraft Pixel Art Generator — Free Online Block Art Tool',
  },
  description:
    'Convert any image to Minecraft blocks free. Edit your pixel art, export .schematic files and build in-game. No sign-up.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Minecraft Pixel Art Generator — Free Online Block Art Tool',
    description:
      'Convert any image to Minecraft blocks free. Edit your pixel art, export .schematic files and build in-game. No sign-up.',
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
      description="Convert any image into Minecraft blocks, edit it cell by cell, then export a .schematic, blueprint, and material list — entirely in your browser."
      defaultPixelSize={12}
      defaultPaletteId="full"
      mode="minecraft"
      minecraftTool="generator"
      minecraftStep="generate"
      facts={['block editing', '.schematic export', 'no signup']}
      howTo={{
        name: 'How to use the Minecraft pixel art generator',
        steps: [
          { name: 'Upload your image', text: 'Pick any picture to generate from. Everything runs in your browser — the image never leaves your device.' },
          { name: 'Choose your blocks & size', text: 'Set the build width from 16 to 128 blocks and filter the palette to the blocks your Minecraft version can place.' },
          { name: 'Edit block by block', text: 'Paint, pick, and restore individual cells until the art reads right — every edit is undoable and saved locally.' },
          { name: 'Export .schematic and build', text: 'Download a WorldEdit-ready .schematic as a vertical mural or flat map art, plus the blueprint PNG and material list.' },
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
          every cell to the nearest color in a palette of more than fifty
          buildable blocks — sixteen wool shades, sixteen terracotta earth
          tones, sixteen concretes, plus stone, deepslate, sandstone, and oak
          planks. The output is the whole package at once: an editable block
          map you can preview with build lines, a PNG reference of the
          generated art, a material list that totals each block type, and a
          .schematic file your world can actually place. Nothing uploads on
          the way — decoding, editing, and export all run in your browser,
          which is also why regenerating at a new width is instant. Start at
          32 blocks wide for a first pass — small enough to stay gatherable,
          large enough to keep a face or logo legible — then adjust until the
          silhouette reads the way you want.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">after generation</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          The generated grid is step one
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Generation starts a pipeline, and the next stages are one click
          away. A block came out wrong? The editor on this page paints, picks,
          and restores individual cells. Torn between 24, 32, 48, and 64
          wide? The{' '}
          <a
            href="/minecraft-pixel-art-converter"
            className="text-[var(--pixel-lime)] underline"
          >
            size converter
          </a>{' '}
          shows all four side by side. Building something big? The{' '}
          <a
            href="/minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            build planner
          </a>{' '}
          tracks progress section by section, and the dedicated{' '}
          <a
            href="/minecraft-pixel-art-maker"
            className="text-[var(--pixel-lime)] underline"
          >
            maker
          </a>{' '}
          gives editing a page of its own. Prefer a speed-first framing of
          the same conversion? The{' '}
          <a
            href="/image-to-minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            image-to-Minecraft page
          </a>{' '}
          runs this identical pipeline.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">exports</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          Four ways out: .schematic, blueprint, materials, project file
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          The .schematic export carries the build itself into the game. Drop
          the file in your schematics folder and WorldEdit pastes it whole;
          Litematica users can convert it with Litematica&rsquo;s schematic
          converter. Choose a vertical orientation for murals and wall art,
          or flat orientation for map art laid on the ground — sized to the
          128 × 128 area a fully-zoomed map covers. The blueprint PNG keeps
          hand-building honest with grid lines and coordinates, the material
          CSV turns a survival run into a shopping list, and the project file
          saves your source image, edits, and build progress to continue on
          another day.
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

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">learn the craft</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          Minecraft pixel art tutorials
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <a
            href="/tutorials/how-to-make-pixel-art-in-minecraft"
            className="pixel-panel-raised block p-5 transition-colors hover:border-[var(--pixel-lime)]"
          >
            <p className="font-mono text-xs uppercase text-[var(--pixel-lime)]">
              8 min · beginner
            </p>
            <h3 className="mt-2 text-lg font-black text-[var(--paper)]">
              How to Make Pixel Art in Minecraft
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--paper-muted)]">
              Grid sizes, building by hand from a reference, gathering
              materials, and the mistakes every beginner makes.
            </p>
          </a>
          <a
            href="/tutorials/minecraft-image-to-pixel-art-guide"
            className="pixel-panel-raised block p-5 transition-colors hover:border-[var(--pixel-lime)]"
          >
            <p className="font-mono text-xs uppercase text-[var(--pixel-lime)]">
              15 min · complete guide
            </p>
            <h3 className="mt-2 text-lg font-black text-[var(--paper)]">
              Minecraft Image to Pixel Art: Complete Guide
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--paper-muted)]">
              Image prep, build size, block palettes and versions, editing,
              and every export — the full conversion walkthrough.
            </p>
          </a>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--paper-muted)]">
          More walkthroughs live in the{' '}
          <a
            href="/tutorials"
            className="text-[var(--pixel-lime)] underline"
          >
            tutorial directory
          </a>
          .
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'palette',
            title: 'Nearest block color',
            body: 'Every cell maps to the closest of 52 buildable blocks, filtered to the ones your Minecraft version can place.',
          },
          {
            label: 'editor',
            title: 'Fix any cell in place',
            body: 'Paint, pick, and restore blocks on the generated grid — undo included — without leaving the page.',
          },
          {
            label: 'export',
            title: '.schematic to WorldEdit',
            body: 'Vertical for murals, flat for map art — plus blueprint PNG, material CSV, and a project file to resume later.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Minecraft Pixel Art Generator',
          description:
            'Free Minecraft pixel art generator: convert any image to an editable block map, export .schematic, blueprint, and material list — runs locally in your browser.',
          url: pageUrl,
          featureList: [
            'Local image conversion',
            'Minecraft block palette with version filter',
            'Block editing with undo',
            'Schematic export',
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
