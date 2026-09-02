import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/tutorials';

const tutorials = [
  {
    href: '/tutorials/how-to-make-pixel-art-in-minecraft',
    label: 'tutorial 01 · 8 min',
    title: 'How to Make Pixel Art in Minecraft',
    body: 'The beginner path: grid sizes, building by hand from a reference, converting an image with a generator, gathering materials in survival, and the mistakes every beginner makes once.',
    live: true,
  },
  {
    href: '/tutorials/minecraft-image-to-pixel-art-guide',
    label: 'tutorial 02 · 15 min',
    title: 'Minecraft Image to Pixel Art: Complete Guide',
    body: 'The full conversion pipeline — choosing and preparing the image, build size, block palettes and game versions, hand editing, and exporting blueprint, material list, and .schematic.',
    live: true,
  },
  {
    href: '/minecraft-pixel-art-generator',
    label: 'tutorial 03 · coming soon',
    title: 'Litematica, Bedrock & Block Count Guide',
    body: 'Deep dives on import formats (Litematica, Bedrock structure blocks), exact block-count planning, and map-art orientation — publishing as those exports ship.',
    live: false,
  },
];

export const metadata: Metadata = {
  title: 'Minecraft Pixel Art Tutorials — Step-by-Step Guides',
  description:
    'Free tutorials for Minecraft pixel art: a beginner build guide and a complete image-to-blocks conversion guide — sizes, palettes, editing, and schematic export.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Minecraft Pixel Art Tutorials — Step-by-Step Guides',
    description:
      'Learn Minecraft pixel art end to end: manual building, image conversion, palettes, and export.',
    url: pageUrl,
    images: [{ url: '/hero-minecraft.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-minecraft.jpg'] },
};

export default function TutorialsPage() {
  return (
    <div className="page-shell">
      <div className="mx-auto max-w-4xl">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 font-mono text-xs text-[var(--paper-muted)]"
        >
          <Link href="/" className="hover:text-[var(--pixel-lime)]">
            Pixvael
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--paper)]">Tutorials</span>
        </nav>

        <header className="mt-6">
          <p className="terminal-label">/ tutorials</p>
          <h1 className="crt-title mt-5 text-[clamp(2.4rem,5vw,4rem)]">
            Minecraft pixel art tutorials
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--paper)]">
            Written guides for every stage of the craft — choosing a grid
            size, converting an image into blocks, editing the result, and
            getting it built in your world. Every tutorial pairs with the{' '}
            <a
              href="/minecraft-pixel-art-generator"
              className="text-[var(--pixel-lime)] underline"
            >
              minecraft pixel art generator
            </a>
            , so you can read a step and try it immediately.
          </p>
        </header>

        <section className="mt-10 grid gap-4">
          {tutorials.map((tutorial) =>
            tutorial.live ? (
              <article className="pixel-panel-raised p-6" key={tutorial.href}>
                <p className="font-mono text-xs uppercase text-[var(--pixel-lime)]">
                  {tutorial.label}
                </p>
                <h2 className="mt-3 text-2xl font-black text-[var(--paper)]">
                  <a
                    href={tutorial.href}
                    className="hover:text-[var(--pixel-lime)]"
                  >
                    {tutorial.title}
                  </a>
                </h2>
                <p className="mt-3 leading-7 text-[var(--paper-muted)]">
                  {tutorial.body}
                </p>
                <a
                  href={tutorial.href}
                  className="mt-4 inline-block font-mono text-sm text-[var(--pixel-lime)] underline"
                >
                  Read the tutorial →
                </a>
              </article>
            ) : (
              <article
                className="pixel-panel p-6 opacity-80"
                key={tutorial.title}
                aria-label={`${tutorial.title} (coming soon)`}
              >
                <p className="font-mono text-xs uppercase text-[var(--paper-muted)]">
                  {tutorial.label}
                </p>
                <h2 className="mt-3 text-2xl font-black text-[var(--paper)]">
                  {tutorial.title}
                </h2>
                <p className="mt-3 leading-7 text-[var(--paper-muted)]">
                  {tutorial.body}
                </p>
              </article>
            ),
          )}
        </section>

        <section className="pixel-panel mt-10 p-6 sm:p-8">
          <p className="terminal-label">start here</p>
          <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
            New to all of it?
          </h2>
          <p className="mt-4 leading-7 text-[var(--paper-muted)]">
            Read tutorial 01 for the fundamentals, then convert your first
            image on the{' '}
            <a
              href="/minecraft-pixel-art-generator"
              className="text-[var(--pixel-lime)] underline"
            >
              minecraft pixel art generator
            </a>{' '}
            — upload, choose a width, and export the block plan. For
            non-Minecraft pixel art from the same photos, the{' '}
            <Link href="/" className="text-[var(--pixel-lime)] underline">
              pixel art converter
            </Link>{' '}
            runs the same engine with retro palettes.
          </p>
          <a href="/minecraft-pixel-art-generator#tool" className="pixel-button mt-5 text-sm">
            Open the generator
          </a>
        </section>
      </div>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Tutorials', url: pageUrl },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: tutorials
            .filter((tutorial) => tutorial.live)
            .map((tutorial, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: tutorial.title,
              url: `https://pixvael.com${tutorial.href}`,
            })),
        }}
      />
    </div>
  );
}
