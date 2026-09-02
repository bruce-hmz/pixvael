import type { Metadata } from 'next';
import { InfoGrid, PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/webp-to-pixel-art';
const faqs = [
  {
    question: 'Can I convert a WebP image to pixel art?',
    answer:
      'Yes. Drop a WebP file and it is decoded locally, then converted with the same block-size, palette, and dithering controls as any other format.',
  },
  {
    question: 'Is WebP better than JPG for pixel art?',
    answer:
      'For photos the result is very close — both store smooth gradients. WebP is smaller at the same quality, so it is common on the web. The converter handles both identically.',
  },
  {
    question: 'Does the WebP conversion upload my image?',
    answer:
      'No. WebP decoding and pixelation happen entirely in your browser with Canvas — the file never leaves your device.',
  },
];

export const metadata: Metadata = {
  title: 'WebP to Pixel Art — Free Online Converter',
  description:
    'Turn any WebP image into pixel art online. Choose block size, palette, and dithering, then download a sharp PNG — free, private, no upload.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'WebP to Pixel Art — Free Online Converter',
    description:
      'Convert WebP images to pixel art in your browser. Free, private, no signup — nothing uploaded.',
    url: pageUrl,
    images: [{ url: '/hero-portrait-v2.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-portrait-v2.jpg'] },
};

export default function WebpToPixelArtPage() {
  return (
    <PixelLanding
      eyebrow="/ webp to pixel art"
      title="WebP to pixel art"
      description="Drop a WebP image and get pixel art in seconds. Tune the block size and palette, add dithering, and export a crisp PNG — all locally in your browser."
      defaultPixelSize={8}
      defaultPaletteId="full"
      facts={['WebP input', 'PNG output', 'no upload']}
      howTo={{
        name: 'How to convert a WebP to pixel art',
        steps: [
          { name: 'Load the WebP file', text: 'Drop any WebP image in from your device. It decodes and converts entirely in your browser — no upload.' },
          { name: 'Set the block size', text: 'Pick a coarse grid for a chunky retro read or a finer grid to keep more detail from the original.' },
          { name: 'Choose a palette and dithering', text: 'Full color, 8-bit PICO-8, or four-color Game Boy; add Floyd-Steinberg dithering when gradients band.' },
          { name: 'Export as PNG', text: 'Save the result as a PNG that works anywhere WebP support is missing.' },
        ],
      }}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">tips</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          Pixel art from WebP: the web-native workflow
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          WebP is the most common format on the modern web — screenshots,
          hero images, and social media graphics are often WebP. Because it is
          decoded locally, you can convert anything you can drag in, including
          images grabbed straight from a web page. Start with block size 8 for
          bold pixel art or 4 to keep facial detail, and add dithering when the
          source has smooth gradients that would otherwise band.
        </p>
      </section>

      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">when to use</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          WebP for web graphics, PNG for transparency, JPG for photos
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          Reach for this WebP converter when your source came from the web —
          screenshots, downloaded art, browser-saved images. Use the{' '}
          <a
            href="/png-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            PNG converter
          </a>{' '}
          for logos and sprites with transparency, and the{' '}
          <a
            href="/jpg-to-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            JPG converter
          </a>{' '}
          for classic photo uploads. Building in Minecraft? The{' '}
          <a
            href="/minecraft-pixel-art"
            className="text-[var(--pixel-lime)] underline"
          >
            build planner
          </a>{' '}
          maps any of these to blocks with material counts.
        </p>
      </section>

      <InfoGrid
        items={[
          {
            label: 'source',
            title: 'Convert web-native images',
            body: 'Screenshots and downloaded WebP art convert instantly — no format juggling.',
          },
          {
            label: 'quality',
            title: 'Smooth gradients preserved',
            body: 'Dithering recovers shading in WebP photos, keeping the pixel look clean.',
          },
          {
            label: 'privacy',
            title: 'Nothing leaves your device',
            body: 'Local decoding means WebP files never reach a server.',
          },
        ]}
      />
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael WebP to Pixel Art',
          description:
            'Free online WebP to pixel art converter with block size, palettes, and dithering — runs locally in your browser.',
          url: pageUrl,
          featureList: [
            'Local WebP conversion',
            'Block size and palette controls',
            'Floyd-Steinberg dithering',
            'Sharp PNG export',
          ],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'WebP to Pixel Art', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
