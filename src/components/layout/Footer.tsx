'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isStudioPath } from '@/lib/studio';

const FOOTER_LINKS = [
  { href: '/image-to-pixel-art', label: 'Image to Pixel Art' },
  { href: '/minecraft-pixel-art-generator', label: 'Minecraft Generator' },
  { href: '/minecraft-map-art-generator', label: 'Map Art' },
  { href: '/minecraft-pixel-art#tool', label: 'Build Planner' },
  { href: '/tutorials', label: 'Tutorials' },
  { href: '/privacy', label: 'Privacy' },
];

function StudioFooter() {
  return (
    <footer className="border-t border-st-line bg-st-surface text-sm text-st-ink-2">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-7 gap-y-2 px-4 py-7 sm:px-8">
        <span className="font-pixel text-lg font-semibold text-st-ink">Pixvael</span>
        <nav aria-label="Pixvael tools" className="flex flex-wrap gap-x-5 gap-y-1">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-9 items-center hover:text-st-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="lg:ml-auto">Your images stay on your device.</span>
      </div>
    </footer>
  );
}

export function Footer() {
  const pathname = usePathname();
  if (isStudioPath(pathname)) return <StudioFooter />;

  return (
    <footer className="relative z-[10000] border-t border-[var(--line)] bg-[rgba(5,8,6,0.92)] text-[11px] text-[var(--paper-muted)] backdrop-blur sm:fixed sm:inset-x-0 sm:bottom-0">
      <div className="mx-auto flex h-[30px] max-w-[1180px] items-center justify-between gap-3 px-3 font-mono">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-[rgba(51,255,51,0.18)] px-2 py-1 text-[var(--pixel-lime)]">
            pixvael
          </span>
          <span className="hidden sm:inline">~/canvas</span>
          <span className="text-[var(--pixel-lime)]">● ready</span>
        </div>
        <nav
          className="flex items-center gap-3 md:gap-4"
          aria-label="Pixvael tools"
        >
          <Link
            href="/image-to-pixel-art"
            className="hover:text-[var(--pixel-lime)]"
          >
            Image converter
          </Link>
          <Link
            href="/minecraft-pixel-art#tool"
            className="hover:text-[var(--pixel-lime)]"
          >
            Build planner
          </Link>
          <Link
            href="/minecraft-pixel-art-generator"
            className="hover:text-[var(--pixel-lime)]"
          >
            Generator
          </Link>
          <Link
            href="/image-to-minecraft-pixel-art"
            className="hover:text-[var(--pixel-lime)]"
          >
            Image→MC
          </Link>
          <Link
            href="/minecraft-pixel-art-maker"
            className="hover:text-[var(--pixel-lime)]"
          >
            Maker
          </Link>
          <Link
            href="/minecraft-pixel-art-converter"
            className="hover:text-[var(--pixel-lime)]"
          >
            Converter
          </Link>
          <Link
            href="/tutorials"
            className="hover:text-[var(--pixel-lime)]"
          >
            Tutorials
          </Link>
          <Link
            href="/privacy"
            className="hidden md:inline hover:text-[var(--pixel-lime)]"
          >
            Privacy
          </Link>
          <span className="hidden md:inline">100%</span>
        </nav>
      </div>
    </footer>
  );
}
