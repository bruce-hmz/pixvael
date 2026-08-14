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
  title: 'Minecraft Pixel Art — Block Plan Builder',
  description:
    'Plan a Minecraft pixel art build block by block. Choose your grid, map materials to blocks, track progress across sections, and export blueprints — free, no signup or upload.',
  alternates: { canonical: 'https://pixvael.com/minecraft-pixel-art' },
  keywords: ['minecraft pixel art'],
  openGraph: {
    title: 'Minecraft Pixel Art — Block Plan Builder',
    description:
      'Turn any photo into a Minecraft block plan: build grid, material counts, section progress tracking, and PNG + CSV export — all in your browser.',
    url: 'https://pixvael.com/minecraft-pixel-art',
    images: [{ url: '/hero-minecraft.jpg', width: 1024, height: 559 }],
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
  {
    question: 'How do I download the Minecraft pixel art blueprint and material list?',
    answer:
      'Once your image is converted, export the pixel PNG to use as a visual build guide and the CSV material list to know exactly how many blocks of each color to gather. Both downloads are generated locally in your browser with no signup.',
  },
  {
    question: 'Can I generate Minecraft pixel art from a screenshot or video frame?',
    answer:
      'Yes. Any still image works — a game screenshot, a paused video frame, a photo, or a drawing. Images with one clear subject and clean, high-contrast edges convert into recognizable Minecraft pixel art most reliably.',
  },
  {
    question: 'Is this a good starting point for a Minecraft pixel art tutorial?',
    answer:
      'It is. Treat the planner as the first step of any Minecraft pixel art tutorial: load a reference image, pick a buildable width, read off the mapped materials, and follow the PNG grid block by block. The section progress tracker keeps larger tutorial builds organized.',
  },
  {
    question: 'What is the easiest build size for a first Minecraft pixel art?',
    answer:
      '24 to 32 blocks wide is the easiest starting point. It keeps the material list short and the silhouette readable, so a first build finishes quickly. Move up to 48 once you are comfortable, and use the size converter to compare 24, 32, 48, and 64 side by side before committing.',
  },
];

export default function MinecraftPixelArtPage() {
  return (
    <>
      <PixelLanding
        eyebrow="/ minecraft pixel art"
        title="Minecraft pixel art"
        description="Turn any image into a buildable Minecraft blueprint in your browser. Set the grid width, map colors to common blocks, then build by sections with saved local progress."
        defaultPixelSize={12}
        defaultPaletteId="full"
        mode="minecraft"
        minecraftStep="build"
        facts={['blueprint', 'materials', 'saved progress']}
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

        <section className="pixel-panel mt-8 p-6 sm:p-8">
          <p className="terminal-label">materials</p>
          <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
            Minecraft block types and color mapping
          </h2>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
            Every block in your generated art is one color, and that color is
            mapped to a family of common Minecraft blocks — concrete for clean
            saturated hues, stone for grays and neutrals, wood for warm browns,
            and sandstone for pale tans and creams. Together these four families
            cover most of the range a natural or man-made scene needs, which is
            why a converted photo still reads as the original once it is rebuilt
            in blocks.
          </p>
          <p className="mt-4 max-w-4xl leading-7 text-[var(--paper-muted)]">
            How well a source image maps depends on what is in it. Bold,
            high-contrast photos with a clear subject — a logo, a face, a pet, a
            character on a plain background — snap cleanly into block families
            because every region has an obvious nearest color. Busy scenes with
            many similar shades, soft gradients, or very subtle hue differences
            can collapse several distinct areas into the same block family, so
            the build looks flatter than the original. If the mapped result feels
            muddy, raise the build width so each block represents a smaller, more
            specific color, or preprocess the image to raise its contrast before
            converting.
          </p>
          <p className="mt-4 max-w-4xl leading-7 text-[var(--paper-muted)]">
            The material list reflects this mapping directly: each row is one
            block family and the count is how many cells fell into it. Use it to
            plan what to gather before you start building — concrete and stone
            usually dominate, with wood and sandstone filling in mid-tones and
            highlights.
          </p>
        </section>

        <section className="pixel-panel mt-8 p-6 sm:p-8">
          <p className="terminal-label">size</p>
          <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
            Choose the right build size: 16 to 128 blocks
          </h2>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
            Build width is the single most important decision for a Minecraft
            pixel art project, because it controls the tradeoff between
            recognizability and effort. Too few blocks and a face collapses into
            an unrecognizable blob; too many and the material list balloons past
            what you can reasonably gather and place. These four ranges cover
            almost every real build.
          </p>
          <ul className="mt-6 max-w-4xl space-y-3 leading-7 text-[var(--paper-muted)]">
            <li>
              <span className="font-mono text-[var(--pixel-lime)]">16–24</span>{' '}
              — icons, logos, emoji, and simple sprites. The silhouette is the
              whole point; expect only a few block families and a material list
              you can gather in minutes.
            </li>
            <li>
              <span className="font-mono text-[var(--pixel-lime)]">32–48</span>{' '}
              — the default range for portraits, avatars, and most first builds.
              Faces stay readable, eyes and markings survive, and the build
              finishes in a reasonable session.
            </li>
            <li>
              <span className="font-mono text-[var(--pixel-lime)]">64</span> —
              detailed portraits, character art, and scenes with multiple
              subjects. Fine features like fur, hair, and background elements
              come through, but the material count climbs into the hundreds.
            </li>
            <li>
              <span className="font-mono text-[var(--pixel-lime)]">96–128</span>{' '}
              — large murals, server spawn art, and multi-panel wall builds.
              Use the section planner here: a single flat PNG at this scale is
              easy to misread, and splitting it into zones with progress tracking
              is what makes the build finishable.
            </li>
          </ul>
          <p className="mt-6 max-w-4xl leading-7 text-[var(--paper-muted)]">
            Not sure which width to commit to? The{' '}
            <a
              href="/minecraft-pixel-art-converter"
              className="text-[var(--pixel-lime)] underline"
            >
              size converter
            </a>{' '}
            renders 24, 32, 48, and 64 side by side from the same image, each
            with its exact dimensions, block count, and material count, so you
            can see the detail-versus-effort tradeoff before you start placing
            blocks.
          </p>
        </section>

        <section className="pixel-panel mt-8 p-6 sm:p-8">
          <p className="terminal-label">how it works</p>
          <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
            How image-to-block mapping works
          </h2>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
            The conversion runs in three steps, all inside your browser. First,
            Pixvael slices the source image into a grid sized to your chosen
            build width — a 48-wide build means each cell covers roughly
            one forty-eighth of the image. Second, it averages every pixel inside
            each cell down to a single representative color, which is what turns
            a smooth photo into chunky blocks. Third, that average color is
            matched to the nearest Minecraft block family — concrete, stone, wood,
            or sandstone — so every cell maps to a block you can actually place
            in-game.
          </p>
          <p className="mt-4 max-w-4xl leading-7 text-[var(--paper-muted)]">
            Wider grids mean smaller cells and more faithful color, because each
            cell samples a smaller, more uniform patch of the original. Narrower
            grids average more of the image into each block, which simplifies the
            build but can blur fine detail like eyes or text. The material list,
            blueprint PNG, and section breakdown are all generated from that same
            final mapping, so what you export is exactly what you will rebuild by
            hand. Because the entire pipeline runs locally, the source image
            never leaves your device.
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
