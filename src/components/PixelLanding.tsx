import type { ReactNode } from 'react';
import { PixelConverter } from '@/components/PixelConverter';

export type FaqItem = {
  question: string;
  answer: string;
};

export type InfoCard = {
  label: string;
  title: string;
  body: string;
};

type PixelLandingProps = {
  eyebrow: string;
  title: string;
  description: string;
  defaultPixelSize?: number;
  defaultPaletteId?: string;
  mode?: 'pixel' | 'minecraft';
  minecraftTool?: 'planner' | 'maker' | 'converter';
  facts?: string[];
  children?: ReactNode;
  faqs?: FaqItem[];
};

export function PixelLanding({
  eyebrow,
  title,
  description,
  defaultPixelSize = 12,
  defaultPaletteId = 'full',
  mode = 'pixel',
  minecraftTool = 'planner',
  facts = ['local canvas', 'PNG export', 'no signup'],
  children,
  faqs,
}: PixelLandingProps) {
  return (
    <div className="page-shell">
      <section className="rail-frame grid gap-8 px-4 py-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="terminal-label">{eyebrow}</p>
          <h1 className="crt-title mt-5 max-w-3xl break-words text-[clamp(3.2rem,7vw,6rem)]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--paper)] sm:text-lg">
            {description}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <span className="status-chip" key={fact}>
                {fact}
              </span>
            ))}
          </div>

          <div className="pixel-panel mt-8 p-4">
            <p className="font-mono text-xs uppercase text-[var(--pixel-lime)]">
              workflow
            </p>
            <div className="mt-4 grid gap-3 text-sm text-[var(--paper-muted)]">
              <p>1. Upload a photo from your device.</p>
              <p>
                {minecraftTool === 'maker'
                  ? '2. Paint, pick, or restore individual Minecraft blocks.'
                  : minecraftTool === 'converter'
                    ? '2. Compare four grid sizes and choose the clearest result.'
                  : mode === 'minecraft'
                  ? '2. Set the build width and work through each section.'
                  : '2. Choose block size, palette, and dithering.'}
              </p>
              <p>
                {minecraftTool === 'maker'
                  ? '3. Export the edited PNG, blueprint, and updated material list.'
                  : minecraftTool === 'converter'
                    ? '3. Open the selected plan and export its blueprint and materials.'
                  : mode === 'minecraft'
                  ? '3. Save progress or export a coordinate blueprint and material CSV.'
                  : '3. Download a sharp pixel-art PNG.'}
              </p>
            </div>
          </div>
        </div>

        <PixelConverter
          defaultPixelSize={defaultPixelSize}
          defaultPaletteId={defaultPaletteId}
          mode={mode}
          minecraftTool={minecraftTool}
        />
      </section>

      {children}

      {faqs && <FaqSection faqs={faqs} />}
    </div>
  );
}

export function InfoGrid({ items }: { items: InfoCard[] }) {
  return (
    <section className="mt-16">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article className="pixel-panel-raised p-5" key={item.title}>
            <p className="font-mono text-xs uppercase text-[var(--pixel-lime)]">
              {item.label}
            </p>
            <h2 className="mt-4 text-xl font-black text-[var(--paper)]">
              {item.title}
            </h2>
            <p className="mt-3 leading-7 text-[var(--paper-muted)]">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FaqSection({
  faqs,
  faqTitle = 'Quick answers',
}: {
  faqs: FaqItem[];
  faqTitle?: string;
}) {
  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="terminal-label">faqs</p>
          <h2 className="mt-3 text-3xl font-black text-[var(--paper)]">
            {faqTitle}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[var(--paper-muted)]">
          Practical notes about privacy, exporting, and getting cleaner pixel
          art from real photos.
        </p>
      </div>
      <dl className="grid gap-4 md:grid-cols-3">
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
  );
}
