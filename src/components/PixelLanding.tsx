import type { ReactNode } from 'react';
import { MinecraftWorkflowLink } from '@/components/MinecraftWorkflowLink';
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
  minecraftStep?: 'convert' | 'compare' | 'edit' | 'build';
  defaultMinecraftGridWidth?: number; // ?width= 带参跳转的初始网格宽度
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
  minecraftStep =
    minecraftTool === 'maker'
      ? 'edit'
      : minecraftTool === 'converter'
        ? 'compare'
        : 'build',
  defaultMinecraftGridWidth,
  facts = ['local canvas', 'PNG export', 'no signup'],
  children,
  faqs,
}: PixelLandingProps) {
  return (
    <div className="page-shell">
      <section className="rail-frame grid gap-8 px-4 py-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="contents lg:sticky lg:top-28 lg:block">
          <div className="order-1">
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

            {mode === 'minecraft' && (
              <label
                htmlFor="pixvael-image-input"
                className="pixel-button mt-6 cursor-pointer text-sm"
              >
                Choose a build image
              </label>
            )}

            <div className="mt-4 border-l-2 border-[var(--pixel-lime)] pl-3 text-xs leading-5 text-[var(--paper-muted)]">
              <p>
                Images stay on this device; analytics record tool actions, never
                image contents or file names.
                {mode === 'minecraft' && (
                  <>
                    {' '}
                    Independent; not affiliated with Mojang or Microsoft.
                  </>
                )}
              </p>
            </div>
          </div>

          {mode === 'minecraft' ? (
            <div className="pixel-panel order-3 mt-8 p-4 lg:order-none">
              <p className="font-mono text-xs uppercase text-[var(--pixel-lime)]">
                workflow
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--paper-muted)]">
                The Minecraft flow is linear. Start with one image, compare the
                size tradeoff, tighten the blocks if needed, then finish with a
                sectioned planner.
              </p>
              <div className="mt-4 grid gap-2">
                {[
                  {
                    href: '/image-to-minecraft-pixel-art',
                    step: '01',
                    title: 'Image to Minecraft',
                    body: 'Fast single-size block map and material list.',
                  },
                  {
                    href: '/minecraft-pixel-art-converter',
                    step: '02',
                    title: 'Compare sizes',
                    body: 'Check 24, 32, 48, and 64 blocks side by side.',
                  },
                  {
                    href: '/minecraft-pixel-art-maker',
                    step: '03',
                    title: 'Edit blocks',
                    body: 'Paint, pick, or restore individual cells.',
                  },
                  {
                    href: '/minecraft-pixel-art',
                    step: '04',
                    title: 'Build planner',
                    body: 'Track sections and progress on larger builds.',
                  },
                ].map((step) => (
                  <MinecraftWorkflowLink
                    key={step.href}
                    href={step.href}
                    step={step.step}
                    title={step.title}
                    body={step.body}
                    fromStep={minecraftStep}
                    toStep={
                      step.href === '/image-to-minecraft-pixel-art'
                        ? 'convert'
                        : step.href === '/minecraft-pixel-art-converter'
                          ? 'compare'
                          : step.href === '/minecraft-pixel-art-maker'
                            ? 'edit'
                            : 'build'
                    }
                    active={
                      (minecraftStep === 'convert' &&
                        step.href === '/image-to-minecraft-pixel-art') ||
                      (minecraftStep === 'compare' &&
                        step.href === '/minecraft-pixel-art-converter') ||
                      (minecraftStep === 'edit' &&
                        step.href === '/minecraft-pixel-art-maker') ||
                      (minecraftStep === 'build' &&
                        step.href === '/minecraft-pixel-art')
                    }
                  />
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--paper-muted)]">
                Your source image carries across these tools in this browser tab.
              </p>
            </div>
          ) : (
            <div className="pixel-panel order-3 mt-8 p-4 lg:order-none">
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
                      : '2. Choose block size, palette, and dithering.'}
                </p>
                <p>
                  {minecraftTool === 'maker'
                    ? '3. Export the edited PNG, blueprint, and updated material list.'
                    : minecraftTool === 'converter'
                      ? '3. Open the selected plan and export its blueprint and materials.'
                      : '3. Download a sharp pixel-art PNG.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="order-2 lg:contents">
          <PixelConverter
            defaultPixelSize={defaultPixelSize}
            defaultPaletteId={defaultPaletteId}
            mode={mode}
            minecraftTool={minecraftTool}
            defaultMinecraftGridWidth={defaultMinecraftGridWidth}
          />
        </div>
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
