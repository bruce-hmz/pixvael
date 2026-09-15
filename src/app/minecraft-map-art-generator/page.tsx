import type { Metadata } from 'next';
import { PixelLanding } from '@/components/PixelLanding';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildWebAppSchema,
} from '@/lib/structured-data';

const pageUrl = 'https://pixvael.com/minecraft-map-art-generator';

const faqs = [
  {
    question: 'What size map does this generator create?',
    answer:
      'The current release creates one Java map canvas at 128 × 128 pixels. Larger 2 × 1, 2 × 2, 3 × 3, and 4 × 4 map layouts are planned after the single-map workflow is stable.',
  },
  {
    question: 'How does the flat map export work?',
    answer:
      'The exported flat build is a 128 × 128 footprint using the same map display colors shown in the editor and preview.',
  },
  {
    question: 'Which Minecraft editions are supported?',
    answer:
      'Map Art output currently targets Java Edition and exports a native .litematic file, a .schematic fallback, a blueprint PNG, and a material CSV. Bedrock .mcstructure export remains available on the regular Minecraft pixel-art flow.',
  },
  {
    question: 'Does my image leave the browser?',
    answer:
      'No. Image decoding, cropping, conversion, editing, and export run locally in your browser. Pixvael telemetry records tool actions and dimensions, never the image itself.',
  },
];

export const metadata: Metadata = {
  title: {
    absolute: 'Minecraft Map Art Generator — Free 128×128 Java Tool',
  },
  description:
    'Create a 128×128 Java Minecraft map art build from any image. Crop, edit blocks, count materials, and export .litematic or .schematic files locally.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Minecraft Map Art Generator — Free 128×128 Java Tool',
    description:
      'Create a 128×128 Java Minecraft map art build from any image with native exports.',
    url: pageUrl,
    images: [{ url: '/hero-minecraft.jpg', width: 1024, height: 559 }],
  },
  twitter: { card: 'summary_large_image', images: ['/hero-minecraft.jpg'] },
};

export default function MinecraftMapArtGeneratorPage() {
  return (
    <PixelLanding
      eyebrow="/ minecraft map art generator"
      title="Minecraft map art generator"
      description="Turn one image into a 128 × 128 Java map art plan, crop the framing, edit any block, and export the flat build."
      mode="minecraft"
      minecraftTool="map-art"
      minecraftStep="generate"
      facts={['128 × 128 map canvas', 'Java .litematic', 'flat map colors']}
      howTo={{
        name: 'How to use the Minecraft map art generator',
        steps: [
          {
            name: 'Upload an image',
            text: 'Choose a JPG, PNG, or WebP. The image stays in your browser while Pixvael prepares the square map canvas.',
          },
          {
            name: 'Crop the framing',
            text: 'Use zoom and offsets to choose the square crop that reads best at 128 × 128 map pixels.',
          },
          {
            name: 'Tune the block plan',
            text: 'Inspect the flat Java map palette, paint individual cells when needed, and review material totals.',
          },
          {
            name: 'Export the build',
            text: 'Download a native .litematic, a .schematic fallback, the blueprint PNG, and the material CSV for your build session.',
          },
        ],
      }}
      faqs={faqs}
    >
      <section className="pixel-panel mt-16 p-6 sm:p-8">
        <p className="terminal-label">the map art contract</p>
        <h2 className="mt-4 text-3xl font-black text-[var(--paper)]">
          One map, one predictable build footprint
        </h2>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-[var(--paper-muted)]">
          This page is for flat Java Map Art: a square 128 × 128 map canvas,
          a Minecraft map palette, and a build footprint that is 128 blocks wide
          at 128 × 128 blocks using the flat map footprint.
          It stays separate from the{' '}
          <a
            href="/minecraft-pixel-art-generator"
            className="text-[var(--pixel-lime)] underline"
          >
            free-form Minecraft pixel-art generator
          </a>
          , where you choose the build width and can make vertical murals or
          Bedrock structures. Multi-map layouts are visible as a future path,
          but the current tool keeps 1 × 1 production quality first.
        </p>
      </section>
      <section className="pixel-panel mt-8 p-6 sm:p-8">
        <p className="terminal-label">native outputs</p>
        <h2 className="mt-4 text-2xl font-black text-[var(--paper)]">
          Build files that match the plan
        </h2>
        <p className="mt-4 max-w-4xl text-base leading-7 text-[var(--paper-muted)]">
          The shared pipeline keeps the crop, conversion, block editor,
          material list, blueprint, and export on the same source of truth. The
          Java .litematic carries the 128 × 128 flat footprint directly; the
          .schematic file gives WorldEdit users a compatible fallback. The
          palette is included in the CSV so gathering materials
          does not require a second calculation.
        </p>
      </section>
      <JsonLd data={buildFaqSchema(faqs)} />
      <JsonLd
        data={buildWebAppSchema({
          name: 'Pixvael Minecraft Map Art Generator',
          description:
            'Create a 128×128 Java Minecraft map art plan with crop controls, block editing, material totals, and native exports.',
          url: pageUrl,
          featureList: [
            '128×128 Java map canvas',
            'Square crop and framing controls',
            'Flat map footprint in materials and exports',
            'Native .litematic and .schematic export',
            'Blueprint PNG and materials CSV',
            'Local image processing',
          ],
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Minecraft Map Art Generator', url: pageUrl },
        ])}
      />
    </PixelLanding>
  );
}
