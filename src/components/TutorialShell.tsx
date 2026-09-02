import Link from 'next/link';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/structured-data';

// 教程页共享外壳:面包屑导航、文首高亮 CTA、文末强 CTA、BreadcrumbList schema。
// 正文 sections 由各教程页传入 children,保持手写内容与结构化数据同源。
export function TutorialShell({
  eyebrow,
  title,
  description,
  readingTime,
  updated,
  pageUrl,
  ctaHref,
  ctaLabel,
  ctaNote,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  readingTime: string;
  updated: string;
  pageUrl: string;
  ctaHref: string;
  ctaLabel: string;
  ctaNote: string;
  children: ReactNode;
}) {
  return (
    <div className="page-shell">
      <article className="mx-auto max-w-3xl">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--paper-muted)]"
        >
          <Link href="/" className="hover:text-[var(--pixel-lime)]">
            Pixvael
          </Link>
          <span aria-hidden>/</span>
          <Link href="/tutorials" className="hover:text-[var(--pixel-lime)]">
            Tutorials
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--paper)]">{title}</span>
        </nav>

        <header className="mt-6">
          <p className="terminal-label">{eyebrow}</p>
          <h1 className="crt-title mt-5 text-[clamp(2.2rem,5vw,3.6rem)]">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[var(--paper)]">
            {description}
          </p>
          <p className="mt-4 font-mono text-xs text-[var(--paper-muted)]">
            {readingTime} · updated {updated} · Pixvael
          </p>
        </header>

        <div className="pixel-panel mt-8 border-[var(--pixel-lime)] p-5">
          <p className="font-mono text-xs uppercase text-[var(--pixel-lime)]">
            try it while you read
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--paper-muted)]">
            {ctaNote}
          </p>
          <Link href={ctaHref} className="pixel-button mt-4 text-sm">
            {ctaLabel}
          </Link>
        </div>

        <div className="mt-4">{children}</div>

        <div className="pixel-panel-raised mt-12 p-6 text-center">
          <h2 className="text-2xl font-black text-[var(--paper)]">
            Ready to build it?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--paper-muted)]">
            {ctaNote}
          </p>
          <Link href={ctaHref} className="pixel-button mt-5 text-sm">
            {ctaLabel}
          </Link>
        </div>
      </article>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Pixvael', url: 'https://pixvael.com' },
          { name: 'Tutorials', url: 'https://pixvael.com/tutorials' },
          { name: title, url: pageUrl },
        ])}
      />
    </div>
  );
}

// 教程正文小节:h2 + 段落,统一样式,保证服务端渲染的标题层级。
export function TutorialSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="pixel-panel mt-8 p-6 sm:p-8">
      <h2 className="text-2xl font-black text-[var(--paper)]">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-[var(--paper-muted)]">
        {children}
      </div>
    </section>
  );
}

export function TutorialLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className="text-[var(--pixel-lime)] underline">
      {children}
    </a>
  );
}
