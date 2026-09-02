import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import {
  TutorialLink,
  TutorialSection,
  TutorialShell,
} from '@/components/TutorialShell';
import {
  buildArticleSchema,
  buildFaqSchema,
} from '@/lib/structured-data';

const pageUrl =
  'https://pixvael.com/tutorials/minecraft-image-to-pixel-art-guide';

const faqs = [
  {
    question: 'What image formats can I convert to Minecraft pixel art?',
    answer:
      'Anything your browser can open: JPG, PNG, WebP, and GIF frames all work. PNG is best for logos and sprites because transparent areas can be excluded from the build; photos convert well from JPG at any quality.',
  },
  {
    question: 'Can I use the exported schematic on Bedrock?',
    answer:
      'The .schematic file targets Java Edition tooling such as WorldEdit and Litematica. Bedrock players should build from the blueprint PNG and material list — the grid, coordinates, and block counts are identical — or wait for native Bedrock export support.',
  },
  {
    question: 'How do I continue a piece tomorrow?',
    answer:
      'The generator can save your whole project — source image, grid width, every manual edit, and your build progress — to a file you reopen later. Progress is also tracked per section in the browser you started in.',
  },
];

export const metadata: Metadata = {
  title: 'Minecraft Image to Pixel Art: Complete Guide',
  description:
    'Convert an image into Minecraft pixel art step by step: pick and prepare the picture, choose build size and block palette, run the conversion, edit blocks by hand, then export blueprint, materials, and .schematic.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Minecraft Image to Pixel Art: Complete Guide',
    description:
      'The complete conversion workflow — image prep, palette choice, editing, and export — for Minecraft pixel art.',
    url: pageUrl,
    images: [{ url: '/hero-minecraft.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-minecraft.jpg'] },
};

export default function MinecraftImageToPixelArtGuidePage() {
  return (
    <TutorialShell
      eyebrow="/ tutorial 02"
      title="Minecraft image to pixel art: the complete guide"
      description="Minecraft image to pixel art conversion is a five-stage pipeline: choose the picture, prepare it, pick a size and palette, convert, then edit and export. This guide walks every stage with the decisions explained — and every step has a tool one click away."
      readingTime="15 min read"
      updated="2026-09-02"
      pageUrl={pageUrl}
      ctaHref="/minecraft-pixel-art-generator#tool"
      ctaLabel="Open the Minecraft pixel art generator"
      ctaNote="The generator runs this exact pipeline in your browser: convert, edit block by block, then export blueprint PNG, material CSV, and a .schematic for WorldEdit."
    >
      <TutorialSection title="What you need before you start">
        <p>
          The short list: the{' '}
          <TutorialLink href="/minecraft-pixel-art-generator">
            minecraft pixel art generator
          </TutorialLink>{' '}
          opened in a browser, the image you want to build, and a rough
          idea of where the art will live in your world. That is all —
          conversion runs locally, no account, no upload. If you plan to
          place blocks with WorldEdit instead of by hand, have a copy of
          WorldEdit (single-player mods or server plugin both work) ready
          for the export stage.
        </p>
        <p>
          It also helps to know your target: a wall mural for a base
          interior, a freestanding billboard, or flat map art rendered on
          in-game maps. The choice changes exactly one setting later — the
          export orientation — so you can defer it until the end.
        </p>
      </TutorialSection>

      <TutorialSection title="Choosing the right image">
        <p>
          Conversion cannot add contrast your picture does not have. The
          images that convert cleanly share three traits: one clear subject
          (a face, a pet, a logo, an item sprite), a background that is
          flat or easily removed, and lighting that separates subject from
          background. Professional headshots, cartoon characters, and flat
          logos are the easy mode; group photos, night shots, and anything
          where the subject blends into the background will frustrate you
          at every grid size.
        </p>
        <p>
          Resolution matters less than you would think — the converter
          downsamples to your build width anyway — but detail below the
          block scale is wasted. A source image with at least as many
          pixels across as your planned block width gives the downsampler
          real information for every cell. Below that, the tool is
          inventing detail, and the result looks like a rumor of your
          picture.
        </p>
      </TutorialSection>

      <TutorialSection title="Preparing the image">
        <p>
          Two minutes of prep routinely saves an hour of in-game repainting.
          Crop tight to the subject — every block of empty background is a
          block you gather and place for nothing. If the background is
          busy, remove it and replace it with a flat color or transparency
          before converting; the generator skips fully transparent cells
          instead of filling them with an arbitrary block. Bump contrast
          and saturate slightly: block palettes are matte and slightly
          muted compared to screen colors, so a source that reads “a bit
          punchy” on screen converts to “correct” in blocks.
        </p>
        <p>
          For portraits, crop to the face and shoulders rather than the
          whole frame — at 48 blocks wide, a full-body shot gives the face
          maybe eight blocks, which is a skin tone smudge. For logos with
          text, check that every stroke is at least two blocks wide at your
          planned size, or the lettering will collapse.
        </p>
      </TutorialSection>

      <TutorialSection title="Picking the build size">
        <p>
          Width is the one number that changes everything; height follows
          the aspect ratio. The practical bands: 16–24 for icons and item
          sprites, 32–48 for faces and logos (the sweet spot for first
          builds), 64 for shaded portraits, and 96–128 for high resolution
          pieces where gradients survive. Multiply width by height for
          total blocks: the jump from 48 to 96 wide quadruples your
          material bill, not doubles it.
        </p>
        <p>
          The cheap way to decide is to try several. The{' '}
          <TutorialLink href="/minecraft-pixel-art-converter">
            size converter
          </TutorialLink>{' '}
          renders 24, 32, 48, and 64 side by side from the same image so
          you can see exactly where a face stops reading as a face. Convert
          small, confirm the silhouette, scale up — re-running the
          conversion is instant and free.
        </p>
      </TutorialSection>

      <TutorialSection title="Choosing your block palette and game version">
        <p>
          The generator maps each cell to the nearest color in a palette of
          52 buildable blocks: the 16 wool colors, 16 terracotta earth
          tones, and 16 concretes, plus stone, deepslate, sandstone, and
          oak planks. Those three 16-color families are the classic pixel
          art palette because they read as flat, matte color at a distance
          — unlike planks or gravel, which bring texture noise.
        </p>
        <p>
          Version matters because the families arrived in different
          updates. Wool and terracotta have existed since the earliest
          versions; concrete arrived in 1.12; deepslate in 1.17. The
          generator’s version filter (1.9+, 1.12+, 1.17+, or latest)
          removes blocks your world cannot make, so the preview never
          promises a block you cannot gather. On Java Edition 1.12 through
          the current 1.21+, every palette option is safe; on older
          worlds, drop to the 1.9+ filter and the art simply shifts toward
          wool and terracotta.
        </p>
      </TutorialSection>

      <TutorialSection title="Running the conversion">
        <p>
          With the picture prepared and size chosen, conversion is one
          click: drop the image into the generator, set the build width on
          the slider, and the block map appears — each cell already mapped
          to its nearest palette color. Toggle the build grid on to see the
          8-block guide lines you will mirror in game. The preview is
          honest: it is rendered from the same block list that feeds every
          export, not an artist’s impression.
        </p>
        <p>
          If the first pass looks muddy, change one variable at a time —
          width, then source contrast — and re-convert. Two or three
          iterations at small widths cost seconds and pin down whether the
          problem is the picture or the palette before you have a single
          block placed.
        </p>
      </TutorialSection>

      <TutorialSection title="Fixing the result by hand">
        <p>
          Automatic mapping gets you 95% of the way; the last 5% is taste.
          Eyes come out half a block off, an edge needs one dark cell to
          snap into focus, a highlight bleeds into the background. The{' '}
          <TutorialLink href="/minecraft-pixel-art-maker">
            maker tool
          </TutorialLink>{' '}
          exists for exactly this: paint replaces a cell with any palette
          block, pick samples an existing cell, restore puts back the
          generated color, and every edit is undoable and saved in your
          browser. The material list updates the moment you edit, so your
          gathering numbers stay true.
        </p>
      </TutorialSection>

      <TutorialSection title="Exporting: blueprint, materials, and .schematic">
        <p>
          Three exports cover three ways of building. The{' '}
          <strong className="text-[var(--paper)]">blueprint PNG</strong>{' '}
          prints the grid with section lines, row and column coordinates —
          build from it by hand exactly like the manual method in the{' '}
          <TutorialLink href="/tutorials/how-to-make-pixel-art-in-minecraft">
            beginner tutorial
          </TutorialLink>
          . The{' '}
          <strong className="text-[var(--paper)]">material CSV</strong>{' '}
          totals every block type so a survival run is a shopping list, not
          a guess. The{' '}
          <strong className="text-[var(--paper)]">.schematic file</strong>{' '}
          carries the build itself into the game: drop it in your
          schematics folder and WorldEdit pastes it whole, layer by layer,
          in seconds.
        </p>
        <p>
          The schematic comes in two orientations.{' '}
          <strong className="text-[var(--paper)]">Vertical</strong> stands
          the art up as a wall — murals, billboards, base interiors.{' '}
          <strong className="text-[var(--paper)]">Flat</strong> lays it on
          the ground for map art viewed from above, sized to the 128 × 128
          area a fully-zoomed map covers. Exporting the .schematic also
          embeds the palette mapping, so WorldEdit places real wool,
          concrete, and terracotta — not approximations.
        </p>
      </TutorialSection>

      <TutorialSection title="Building it in game">
        <p>
          By hand: work one blueprint section at a time (8 or 16 blocks
          square), mark section corners with temporary columns, and check
          the whole piece from at least 30 blocks back before buying into
          the expensive dyes. The{' '}
          <TutorialLink href="/minecraft-pixel-art">
            build planner
          </TutorialLink>{' '}
          tracks sections and marks cells complete as you go, and your
          progress survives closing the tab.
        </p>
        <p>
          With WorldEdit: copy the .schematic into your schematic folder,
          run{' '}
          <code className="font-mono text-[var(--pixel-lime)]">
            {'//schem load'}
          </code>{' '}
          with the file name, stand where the art’s bottom-left corner
          should land, and{' '}
          <code className="font-mono text-[var(--pixel-lime)]">
            {'//paste'}
          </code>
          . For survival servers that restrict WorldEdit, paste in creative
          on a copy of the world, then rebuild the material list by hand —
          the blueprint keeps you honest. Litematica users can convert the
          classic .schematic through Litematica’s schematic converter to
          get its ghost-block rendering and material verifier.
        </p>
      </TutorialSection>

      <section className="mt-12">
        <h2 className="text-2xl font-black text-[var(--paper)]">
          Frequently asked questions
        </h2>
        <dl className="mt-6 grid gap-4">
          {faqs.map((faq) => (
            <div className="pixel-panel-raised p-5" key={faq.question}>
              <dt className="font-mono text-sm text-[var(--paper)]">
                {faq.question}
              </dt>
              <dd className="mt-3 leading-7 text-[var(--paper-muted)]">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildArticleSchema({
          headline: 'Minecraft Image to Pixel Art: Complete Guide',
          description:
            'The complete Minecraft image to pixel art workflow: image prep, build size, block palette and versions, conversion, hand editing, and blueprint, CSV, and schematic export.',
          url: pageUrl,
          datePublished: '2026-09-02',
          dateModified: '2026-09-02',
        })}
      />
    </TutorialShell>
  );
}
