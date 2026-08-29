import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/picture-to-pixel-art';
const faqs = [
  {
    question: 'What kind of picture converts to pixel art best?',
    answer:
      'Pictures with one clear subject, simple backgrounds, and strong contrast convert best. Faces, logos, pets, and simple character art hold their shape better than busy scenes.',
  },
  {
    question: 'How does the pixel art conversion work?',
    answer:
      'Each block of pixels is averaged into one color (downsampling), optionally mapped to a limited palette like PICO-8 or Game Boy, and dithered with Floyd-Steinberg error diffusion to keep gradients smooth.',
  },
  {
    question: 'Can I use the pixel art I make commercially?',
    answer:
      'Yes. Conversions run locally and exports are yours to use — for avatars, sprites, perler patterns, posters, or anything else. No account, no watermark, no usage restrictions.',
  },
];

export const metadata: Metadata = {
  title: 'Picture to Pixel Art — Free Online Converter',
  description:
    'Turn any picture into pixel art online. See how downsampling, palettes, and dithering shape the result, then download a crisp PNG — free, private, no upload.',
  alternates: { canonical: pageUrl },
  keywords: ['picture to pixel art', 'convert picture to pixel art'],
  openGraph: {
    title: 'Picture to Pixel Art — Free Online Converter',
    description:
      'Convert pictures to pixel art in your browser. Free, private, no signup — no upload, no watermark.',
    url: pageUrl,
    images: [{ url: '/hero-portrait-v2.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-portrait-v2.jpg'] },
};

export default function PictureToPixelArtPage() {
  return (
    <PixelLanding
      eyebrow="/ picture to pixel art"
      title="Picture to pixel art"
      description="Turn any picture into pixel art in seconds. Tune the block size, palette, and dithering to control the look, then export a crisp PNG — all locally in your browser."
      defaultPixelSize={8}
      defaultPaletteId="full"
      facts={['any image', 'instant preview', 'PNG export']}
      howTo={{
        name: 'How to turn a picture into pixel art',
        steps: [
          { name: 'Load your picture', text: 'Any picture works — screenshots, illustrations, photos. It is processed locally and never uploaded.' },
          { name: 'Tune the block size', text: 'Smaller blocks preserve detail, larger blocks read as bold pixel art. Adjust until the subject is clear.' },
          { name: 'Control the look with palette and dithering', text: 'Choose full color, PICO-8, or Game Boy, then toggle dithering to fake extra shades.' },
          { name: 'Export the PNG', text: 'Save a crisp, hard-edged PNG that scales without blur.' },
        ],
      }}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">how it works</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          How a picture becomes pixel art
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          Pixel art conversion is really three steps. First, downsampling folds
          each block of pixels into one average color — the block size you pick
          decides how chunky the result is. Second, palette quantization maps
          those colors onto a fixed set: full color keeps the original look, the
          8-bit (PICO-8) 16-color palette forces a retro game feel, and Game Boy
          green squeezes everything into four handheld shades. Third, optional
          Floyd-Steinberg dithering spreads the quantization error into
          neighboring blocks, which is what keeps smooth gradients from turning
          into harsh color bands.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">when to use</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          Every source, one converter
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Whether your source is a JPG, PNG, or WebP, the same pipeline applies
          — format-specific notes live on the{' '}
          <a
            href="/jpg-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            JPG
          </a>
          ,{' '}
          <a
            href="/png-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            PNG
          </a>{' '}
          (transparency preserved), and{' '}
          <a
            href="/webp-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            WebP
          </a>{' '}
          pages. Photos deserve the subject-based guidance on the{' '}
          <a
            href="/photo-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            photo converter
          </a>
          . And if your picture is heading into Minecraft, the{' '}
          <a
            href="/minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            build planner
          </a>{' '}
          maps it to blocks with material counts and blueprints. New to the
          tool overall? The general{' '}
          <a
            href="/image-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            image to pixel art
          </a>{' '}
          guide explains every control from first principles.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'blocks',
            title: 'Size controls the look',
            body: 'Small blocks keep detail; large blocks make bold, readable pixel art.',
          },
          {
            label: 'palette',
            title: 'Color decides the era',
            body: 'Full color for realism, PICO-8 for 8-bit, Game Boy greens for handheld nostalgia.',
          },
          {
            label: 'privacy',
            title: 'Nothing is uploaded',
            body: 'Decoding and conversion run on your device — the picture never leaves your machine.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Picture to Pixel Art',
          description:
            'Free online picture to pixel art converter — downsampling, palettes, and dithering, all local in your browser.',
          url: pageUrl,
          featureList: [
            'Local image conversion',
            'Block size and palette controls',
            'Floyd-Steinberg dithering',
            'Sharp PNG export',
          ],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Picture to Pixel Art', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
