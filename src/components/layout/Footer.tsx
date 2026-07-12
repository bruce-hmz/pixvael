import Link from 'next/link';

export function Footer() {
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
          className="flex items-center gap-4"
          aria-label="Pixvael tools"
        >
          <Link
            href="/#tool"
            className="hover:text-[var(--pixel-lime)]"
          >
            Pixel tool
          </Link>
          <Link
            href="/minecraft-pixel-art#tool"
            className="hover:text-[var(--pixel-lime)]"
          >
            Build planner
          </Link>
          <span className="hidden md:inline">100%</span>
        </nav>
      </div>
    </footer>
  );
}
