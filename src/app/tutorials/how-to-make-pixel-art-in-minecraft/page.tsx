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
  'https://pixvael.com/tutorials/how-to-make-pixel-art-in-minecraft';

const faqs = [
  {
    question: 'What is the easiest pixel art to build first in Minecraft?',
    answer:
      'A 16 × 16 or 24 × 24 sprite of one bold subject — a heart, a creeper face, a potion bottle. One color family, a dark outline, and a flat background teach counting, alignment, and contrast without overwhelming your first material run.',
  },
  {
    question: 'How many blocks do I need for Minecraft pixel art?',
    answer:
      'Multiply width by height for the total: a 32 × 32 piece is 1,024 blocks, a 64 × 64 piece is 4,096. Convert your image with a tool that outputs a material list so you gather exact counts per block type instead of guessing.',
  },
  {
    question: 'Can I make pixel art in Minecraft without mods?',
    answer:
      'Yes. Everything in this tutorial works in vanilla survival or creative. Mods like WorldEdit or Litematica only speed up placement once your design is finalized — they are conveniences, not requirements.',
  },
];

export const metadata: Metadata = {
  title: 'How to Make Pixel Art in Minecraft — Beginner Tutorial',
  description:
    'Learn pixel art in Minecraft from zero: pick a grid size, build from a reference by hand or convert an image with a generator, gather materials, and avoid the mistakes every beginner makes.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'How to Make Pixel Art in Minecraft — Beginner Tutorial',
    description:
      'Grid sizes, hand-building from a reference, image conversion, and material gathering — the complete beginner path.',
    url: pageUrl,
    images: [{ url: '/hero-minecraft.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-minecraft.jpg'] },
};

export default function HowToMakePixelArtInMinecraftPage() {
  return (
    <TutorialShell
      eyebrow="/ tutorial 01"
      title="How to make pixel art in Minecraft"
      description="Pixel art in Minecraft is drawing with blocks: each block is one pixel, each color is one block type. This tutorial walks the full beginner path — choosing a size, building by hand from a reference, converting an image with a generator, and gathering materials without wasting a trip."
      readingTime="8 min read"
      updated="2026-09-02"
      pageUrl={pageUrl}
      ctaHref="/minecraft-pixel-art-generator#tool"
      ctaLabel="Open the Minecraft pixel art generator"
      ctaNote="Skip the graph paper: convert any image into a block-by-block plan with material counts in your browser, then build along with this tutorial."
    >
      <TutorialSection title="What pixel art means in Minecraft">
        <p>
          Every block you place is a pixel. A wall of wool and concrete
          becomes a picture the same way a grid of colored squares becomes a
          sprite — the only difference is that your canvas is a wall in your
          world and your palette is whatever blocks you can gather. Because
          blocks are chunky, Minecraft pixel art rewards bold shapes and
          strong contrast, and punishes fussy detail. That constraint is the
          fun of it.
        </p>
        <p>
          The palette that matters most has been stable for years: sixteen
          wool colors, sixteen terracotta earth tones, and sixteen concrete
          colors cover nearly every hue a picture needs, with stone,
          sandstone, and deepslate filling the grays. All of them exist from
          Minecraft 1.12 onward (wool and terracotta far earlier), so any
          reasonably current world can build whatever you design.
        </p>
      </TutorialSection>

      <TutorialSection title="Choose a subject and a grid size first">
        <p>
          Size decides everything downstream — detail, materials, and how
          long the build takes. A 16 × 16 grid reads as an icon: one bold
          subject, an outline, a flat background. At 32 × 32 faces and logos
          stay recognizable. By 64 × 64 you can shade and curve; at 96–128
          you are painting. Multiply width by height for the real cost: 32 ×
          32 is 1,024 blocks, 64 × 64 is 4,096, and 128 × 128 is 16,384.
        </p>
        <p>
          Pick a subject with one clear silhouette — a pet, a character
          portrait, a logo, an item sprite. If you squint at the reference
          and the shape dissolves, no grid size will save it. Start one size
          smaller than you think you want; you can always rebuild bigger,
          but over-gathering 4,000 blocks for a muddy result is the
          demoralizing way to learn that.
        </p>
      </TutorialSection>

      <TutorialSection title="Method 1 — build by hand from a reference">
        <p>
          The classic workflow needs no tools. Open your reference image in
          any editor that shows a grid, or print it onto graph paper, and
          rule it into sections of 8 × 8 cells. In game, clear a flat wall
          area and mark matching guide lines every 8 blocks with a cheap,
          visible block — cobblestone or dirt columns work. Now the picture
          is a stack of small copies instead of one huge one: count cells in
          a section, place those blocks in game, move to the next.
        </p>
        <p>
          Two habits keep hand-building accurate. First, build the outline
          of the whole subject before filling colors — a wrong outline
          propagates into every row after it. Second, step back often, at
          least 30 blocks away: pixel art is judged at a distance, and a
          line that looked straight at arm’s length will kink when you zoom
          out. Use the F3 debug screen to keep your rows level if your
          render distance makes the ends hard to see.
        </p>
      </TutorialSection>

      <TutorialSection title="Method 2 — convert an image with a generator">
        <p>
          Hand-copying a 64 × 64 portrait is an evening of counting. A{' '}
          <TutorialLink href="/minecraft-pixel-art-generator">
            minecraft pixel art generator
          </TutorialLink>{' '}
          does the counting in one pass: you upload an image, choose the
          build width, and it maps every cell to the nearest real block
          color and hands you three things — a preview that is the literal
          block map, a blueprint PNG with grid lines and coordinates, and a
          material list that counts every block type. Nothing uploads to a
          server; the conversion runs in your browser, which also means
          re-trying a different width costs nothing.
        </p>
        <p>
          A good generator workflow still ends in your judgment: convert at
          a small width first, check that the silhouette reads, then scale
          up. When a few cells come out the wrong color, you do not need to
          re-convert — the{' '}
          <TutorialLink href="/minecraft-pixel-art-maker">
            maker tool
          </TutorialLink>{' '}
          lets you repaint individual blocks, and the{' '}
          <TutorialLink href="/minecraft-pixel-art">
            build planner
          </TutorialLink>{' '}
          splits large grids into sections so you can track what is already
          placed. The full pipeline — including exporting a .schematic file
          that WorldEdit can paste for you — is covered in the{' '}
          <TutorialLink href="/tutorials/minecraft-image-to-pixel-art-guide">
            image to pixel art guide
          </TutorialLink>
          .
        </p>
      </TutorialSection>

      <TutorialSection title="Gathering materials: survival versus creative">
        <p>
          In creative mode, skip this section — inventory search is your
          dye farm. In survival, the material list from a generator is the
          difference between a fun build and three abandoned half-trips.
          Read the counts before you leave base: 400 white concrete is not
          “some white”, it is four stacks plus change, and dye demand for
          300 blocks of lime wool adds up fast.
        </p>
        <p>
          Know the quirks of each family. Concrete starts as concrete
          powder, which obeys gravity — place powder where it belongs and
          wet it with water to solidify it, rather than stacking powder in
          the air. Terracotta is smelted from clay found in river and lake
          beds, then dyed before smelting for the colored variants. Wool
          comes from sheep and dyes; a simple sheep farm and a flower or
          bone-meal dye source covers most small pieces. For anything above
          2,000 total blocks, consider a temporary villager trading setup or
          a raid farm for emeralds before you hand-mine it all.
        </p>
      </TutorialSection>

      <TutorialSection title="Beginner mistakes to avoid">
        <p>
          <strong className="text-[var(--paper)]">
            Starting too wide.
          </strong>{' '}
          A 128-wide first build is how pixel art projects die at 30%
          complete. Earn the width with two or three smaller pieces first.
        </p>
        <p>
          <strong className="text-[var(--paper)]">
            Low-contrast references.
          </strong>{' '}
          If the source image is all mid-tones, the block version will be a
          smudge. Darken outlines and brighten highlights in the source
          before converting — or pick a better source.
        </p>
        <p>
          <strong className="text-[var(--paper)]">
            Skipping the distance check.
          </strong>{' '}
          Colors that look distinct at your face merge at 40 blocks. Step
          back and squint before committing to the expensive dyes.
        </p>
        <p>
          <strong className="text-[var(--paper)]">
            Mixing matte and texture.
          </strong>{' '}
          Wool, terracotta, and concrete are the matte families — they read
          as flat color. Randomly swapping in planks or gravel gives the
          picture static. Use textured blocks only where you want texture.
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
          headline: 'How to Make Pixel Art in Minecraft',
          description:
            'The beginner path to Minecraft pixel art: grid sizes, hand-building from a reference, image conversion with a generator, material gathering, and common mistakes.',
          url: pageUrl,
          datePublished: '2026-09-02',
          dateModified: '2026-09-02',
        })}
      />
    </TutorialShell>
  );
}
