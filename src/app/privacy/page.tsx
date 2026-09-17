import type { Metadata } from 'next';
import Link from 'next/link';

const pageUrl = 'https://pixvael.com/privacy';
const LAST_UPDATED = 'September 17, 2026';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Pixvael privacy policy: images are converted entirely in your browser and never uploaded to a server. No accounts, no signup. Anonymous, aggregate analytics via Google Analytics 4.',
  alternates: { canonical: pageUrl },
};

const sections = [
  {
    label: '01 · the short version',
    title: 'The short version',
    body: (
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-[var(--paper-muted)]">
        <li>
          Your images are converted <strong className="text-[var(--paper)]">entirely in your
          own browser</strong>. They are never uploaded to, stored on, or seen by our servers.
        </li>
        <li>The Pixvael Chrome extension passes images around only inside your own browser.</li>
        <li>We collect no personal information. There are no accounts and no signup.</li>
        <li>
          We use anonymous, aggregate analytics (Google Analytics 4) to learn which pages are
          useful — never who you are or what your images contain.
        </li>
      </ul>
    ),
  },
  {
    label: '02 · images',
    title: 'Images you convert',
    body: (
      <p className="mt-4 leading-7 text-[var(--paper-muted)]">
        Pixvael is a local tool. When you drop, paste, or pick an image, the conversion runs in
        your browser using your device&apos;s own resources. The image and the pixel-art result
        never leave your device — there is no upload step, no server-side processing, and no
        copy kept after you close the tab. What you make is yours alone.
      </p>
    ),
  },
  {
    label: '03 · chrome extension',
    title: 'Chrome extension',
    body: (
      <p className="mt-4 leading-7 text-[var(--paper-muted)]">
        When you right-click an image and choose &quot;Convert to Pixel Art with Pixvael&quot;,
        the extension fetches that image and hands it to the pixvael.com tab it just opened —
        a transfer that happens entirely inside your own browser, from the extension&apos;s
        background worker to the page. The image is never sent to any server, and no browsing
        history, page content, or user activity is collected by the extension.
      </p>
    ),
  },
  {
    label: '04 · analytics',
    title: 'Anonymous analytics',
    body: (
      <p className="mt-4 leading-7 text-[var(--paper-muted)]">
        We use Google Analytics 4 to understand aggregate usage of the site — which pages are
        viewed, how long visits last, approximate region, and browser/device type. This data is
        anonymous and aggregate: it cannot identify you and contains nothing about the images
        you convert. Google processes this data on our behalf under its own privacy terms. You
        can opt out with Google&apos;s official browser add-on or your browser&apos;s tracking
        controls.
      </p>
    ),
  },
  {
    label: '05 · storage on your device',
    title: 'What stays in your browser',
    body: (
      <p className="mt-4 leading-7 text-[var(--paper-muted)]">
        To make the tool work smoothly, Pixvael keeps a few things in your browser&apos;s own
        local storage: your converter settings (grid size, palette, dithering), your
        Minecraft build-planner progress, and — briefly — the image carried between tabs during
        a conversion. This data stays on your device, is never transmitted to us, and
        disappears when you clear your browser storage. A service worker caches site assets so
        pages keep working offline; it stores no personal data.
      </p>
    ),
  },
  {
    label: '06 · what we never do',
    title: 'What we never do',
    body: (
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-[var(--paper-muted)]">
        <li>We never sell or share your data with third parties.</li>
        <li>We never run third-party ads or trackers beyond anonymous analytics.</li>
        <li>We never require an account, email address, or payment.</li>
        <li>We never knowingly collect data from children under 13.</li>
      </ul>
    ),
  },
  {
    label: '07 · changes & contact',
    title: 'Changes and contact',
    body: (
      <div className="mt-4 space-y-4 leading-7 text-[var(--paper-muted)]">
        <p>
          If this policy changes, the updated date below will change with it. Material changes
          will be reflected on this page before they take effect.
        </p>
        <p>
          Questions? Reach us through the Support tab on our Chrome Web Store listing — or just
          use the tool; it works without telling us anything about you.
        </p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
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
          <span className="text-[var(--paper)]">Privacy</span>
        </nav>

        <header className="mt-6">
          <p className="terminal-label">/ privacy</p>
          <h1 className="crt-title mt-5 text-[clamp(2.4rem,5vw,4rem)]">Privacy policy</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--paper)]">
            Pixvael is built to need as little of your data as possible — the conversion happens
            on your device, so privacy is the default, not a promise.
          </p>
          <p className="mt-3 font-mono text-xs uppercase text-[var(--paper-muted)]">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <section className="mt-10 grid gap-4">
          {sections.map((section) => (
            <article className="pixel-panel-raised p-6 sm:p-8" key={section.label}>
              <p className="font-mono text-xs uppercase text-[var(--pixel-lime)]">
                {section.label}
              </p>
              <h2 className="mt-3 text-2xl font-black text-[var(--paper)]">{section.title}</h2>
              {section.body}
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
