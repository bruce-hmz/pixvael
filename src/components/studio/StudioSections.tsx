// 工作室设计的页面区块(服务端组件)。文案和结构化数据与旧版 PixelLanding 一致,只换样式。

import Link from 'next/link';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/JsonLd';
import type { FaqItem, InfoCard } from '@/components/PixelLanding';
import { BRAND_PIXELS } from '@/lib/studio';
import { buildHowToSchema, type HowTo } from '@/lib/structured-data';

const STEP_TEXT = ['#ffffff', '#17171a', '#17171a', '#17171a'];

export function StudioPage({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="studio"
      className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 text-st-ink sm:px-8 sm:pt-10"
    >
      {children}
    </div>
  );
}

export function StudioHero({
  title,
  description,
  facts,
  breadcrumbs = [],
  note,
}: {
  title: string;
  description: string;
  facts: string[];
  breadcrumbs?: { name: string; href: string }[];
  note?: string;
}) {
  return (
    <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
      <div className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-sm text-st-ink-3">
          <Link href="/" className="hover:text-st-ink">
            Home
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href}>
              {' / '}
              <Link href={crumb.href} className="hover:text-st-ink">
                {crumb.name}
              </Link>
            </span>
          ))}
        </nav>
        <h1 className="mt-2 text-[2rem] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[2.75rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-st-ink-2 sm:text-lg">
          {description}
        </p>
        {note && <p className="mt-3 max-w-[60ch] text-[13px] leading-snug text-st-ink-3">{note}</p>}
      </div>
      <ul className="hidden shrink-0 flex-wrap gap-2 sm:flex">
        {facts.map((fact) => (
          <li
            key={fact}
            className="flex items-center gap-1.5 rounded-full border border-st-line bg-st-surface px-3 py-1.5 text-sm text-st-ink-2"
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e7f45" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
            {fact}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StudioHowTo({ howTo }: { howTo: HowTo }) {
  return (
    <section className="mt-20">
      <h2 className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">{howTo.name}</h2>
      <ol className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
        {howTo.steps.map((step, i) => (
          <li className="flex gap-4" key={step.name}>
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center font-mono text-sm"
              style={{
                background: BRAND_PIXELS[i % BRAND_PIXELS.length],
                color: STEP_TEXT[i % STEP_TEXT.length],
              }}
            >
              {i + 1}
            </span>
            <span className="flex flex-col gap-1">
              <h3 className="text-[17px] font-semibold">{step.name}</h3>
              <p className="max-w-[60ch] text-base leading-relaxed text-st-ink-2">{step.text}</p>
            </span>
          </li>
        ))}
      </ol>
      <JsonLd data={buildHowToSchema(howTo)} />
    </section>
  );
}

export function StudioProse({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-16 max-w-[72ch]">
      <h2 className="text-[1.5rem] font-bold leading-tight tracking-[-0.015em]">{title}</h2>
      <div className="mt-3 text-base leading-[1.7] text-st-ink-2 [&_a]:text-st-accent-text [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-st-ink">
        {children}
      </div>
    </section>
  );
}

export function StudioInfoGrid({ items }: { items: InfoCard[] }) {
  return (
    <section className="mt-16 grid gap-4 md:grid-cols-3">
      {items.map((item, i) => (
        <article
          key={item.title}
          className="flex flex-col gap-2 rounded-2xl border border-st-line bg-st-surface p-5"
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-st-ink-3">
            <span
              aria-hidden="true"
              className="size-2"
              style={{ background: BRAND_PIXELS[i % BRAND_PIXELS.length] }}
            />
            {item.label}
          </p>
          <h2 className="text-lg font-semibold">{item.title}</h2>
          <p className="text-[15px] leading-relaxed text-st-ink-2">{item.body}</p>
        </article>
      ))}
    </section>
  );
}

export function StudioFaq({
  faqs,
  title = 'Quick answers',
}: {
  faqs: FaqItem[];
  title?: string;
}) {
  return (
    <section className="mt-20 max-w-[880px]">
      <h2 className="text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 text-base leading-relaxed text-st-ink-2">
        Practical notes about privacy, exporting, and getting cleaner pixel art
        from real photos.
      </p>
      <div className="mt-5 border-t border-st-line">
        {faqs.map((faq, i) => (
          <details key={faq.question} className="st-faq border-b border-st-line" open={i === 0}>
            <summary className="flex min-h-11 items-center justify-between gap-4 py-4 text-[17px] font-semibold">
              {faq.question}
              <svg className="st-chevron shrink-0 transition-transform" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p className="max-w-[64ch] pb-5 text-base leading-relaxed text-st-ink-2">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
