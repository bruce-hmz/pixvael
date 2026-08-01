'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PIXVAEL_EVENTS, trackEvent } from '@/lib/analytics';

export function Header() {
  const pathname = usePathname();
  const isMinecraftPage = pathname.includes('minecraft');
  const toolHref = isMinecraftPage ? `${pathname}#tool` : '/#tool';

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
            href="/#tool"
            aria-current={pathname === '/' ? 'page' : undefined}
            onClick={() => {
              if (isMinecraftPage) {
                trackEvent(PIXVAEL_EVENTS.modeSwitched, {
                  from_step: 'minecraft',
                  to_step: 'pixel',
                  switch_location: 'header_nav',
                });
              }
            }}
            className="hover:text-[var(--pixel-cyan)] aria-[current=page]:text-[var(--paper)]"
          >
            Tool
          </Link>
          <Link
            href="/minecraft-pixel-art"
            aria-current={isMinecraftPage ? 'page' : undefined}
            onClick={() => {
              if (!isMinecraftPage) {
                trackEvent(PIXVAEL_EVENTS.modeSwitched, {
                  from_step: 'pixel',
                  to_step: 'build',
                  switch_location: 'header_nav',
                });
              }
            }}
            className="hover:text-[var(--pixel-cyan)] aria-[current=page]:text-[var(--paper)]"
          >
            Minecraft mode
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
