'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PIXVAEL_EVENTS, trackEvent } from '@/lib/analytics';
import { BRAND_PIXELS, isStudioPath } from '@/lib/studio';

function trackMinecraftNav(isMinecraftPage: boolean) {
  if (!isMinecraftPage) {
    trackEvent(PIXVAEL_EVENTS.modeSwitched, {
      from_step: 'pixel',
      to_step: 'build',
      switch_location: 'header_nav',
    });
  }
}

function StudioHeader({ pathname }: { pathname: string }) {
  const isMinecraftPage = pathname.includes('minecraft');
  const links = [
    { href: '/image-to-pixel-art', label: 'Image to Pixel Art', short: 'Pixel art', current: pathname === '/image-to-pixel-art' },
    { href: '/minecraft-pixel-art', label: 'Minecraft', short: 'Minecraft', current: isMinecraftPage },
    { href: '/tutorials', label: 'Tutorials', short: null, current: pathname.startsWith('/tutorials') },
  ];

  return (
    <header className="border-b border-st-line bg-st-surface text-st-ink">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[10001] -translate-y-20 rounded-lg bg-st-invert px-4 py-3 text-sm font-semibold text-st-on-invert transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-16 max-w-[1280px] items-center gap-x-4 px-4 py-2.5 sm:gap-x-8 sm:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5 text-st-ink"
          aria-label="Pixvael home"
        >
          <span className="grid w-[22px] grid-cols-2 gap-[2px]" aria-hidden="true">
            {BRAND_PIXELS.map((color) => (
              <span key={color} className="h-[10px]" style={{ background: color }} />
            ))}
          </span>
          <span className="font-pixel text-[22px] font-semibold leading-none">
            Pixvael
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-0.5 text-[15px] font-medium sm:gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.current ? 'page' : undefined}
              onClick={
                link.href === '/minecraft-pixel-art'
                  ? () => trackMinecraftNav(isMinecraftPage)
                  : undefined
              }
              className={`min-h-11 items-center whitespace-nowrap rounded-lg px-2.5 text-st-ink-2 transition-colors hover:text-st-ink aria-[current=page]:bg-st-accent-tint aria-[current=page]:text-st-accent-text sm:px-3 ${
                link.short ? 'flex' : 'hidden sm:flex'
              }`}
            >
              {link.short && link.short !== link.label ? (
                <>
                  <span className="sm:hidden">{link.short}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </nav>

        <span className="ml-auto hidden items-center gap-2 text-sm text-st-ink-2 md:flex">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Runs in your browser
        </span>
      </div>
    </header>
  );
}

export function Header() {
  const pathname = usePathname();
  const isMinecraftPage = pathname.includes('minecraft');
  const toolHref = isMinecraftPage ? `${pathname}#tool` : '/#tool';

  if (isStudioPath(pathname)) return <StudioHeader pathname={pathname} />;

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(0,255,255,0.15)] bg-[rgba(10,10,12,0.72)] backdrop-blur">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[10001] -translate-y-20 bg-[var(--pixel-lime)] px-4 py-3 font-mono text-sm font-bold text-black transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-3 text-[var(--paper)]"
          aria-label="Pixvael home"
        >
          <span className="grid size-7 grid-cols-2 gap-1" aria-hidden="true">
            <span className="bg-[var(--pixel-lime)]" />
            <span className="bg-[var(--pixel-cyan)]" />
            <span className="bg-[var(--pixel-gold)]" />
            <span className="bg-[var(--pixel-lime)]" />
          </span>
          <span className="font-pixel text-2xl leading-none text-[var(--paper)] drop-shadow-[0_0_6px_rgba(51,255,51,0.7)]">
            Pixvael
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[var(--pixel-lime)] md:flex">
          <Link
            href="/image-to-pixel-art"
            aria-current={pathname === '/image-to-pixel-art' ? 'page' : undefined}
            className="hover:text-[var(--pixel-cyan)] aria-[current=page]:text-[var(--paper)]"
          >
            Image to Pixel Art
          </Link>
          <Link
            href="/minecraft-pixel-art"
            aria-current={isMinecraftPage ? 'page' : undefined}
            onClick={() => trackMinecraftNav(isMinecraftPage)}
            className="hover:text-[var(--pixel-cyan)] aria-[current=page]:text-[var(--paper)]"
          >
            Minecraft Pixel Art
          </Link>
        </nav>

        <Link
          href={toolHref}
          className="pixel-button pixel-button-amber px-3 text-xs sm:text-sm"
        >
          <span className="sm:hidden">Upload</span>
          <span className="hidden sm:inline">
            {isMinecraftPage ? 'Open planner' : 'Open tool'}
          </span>
        </Link>
      </div>
    </header>
  );
}
