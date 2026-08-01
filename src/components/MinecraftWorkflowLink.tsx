'use client';

import Link from 'next/link';
import { PIXVAEL_EVENTS, trackEvent } from '@/lib/analytics';

type Props = {
  href: string;
  step: string;
  title: string;
  body: string;
  fromStep: string;
  toStep: string;
  active: boolean;
};

export function MinecraftWorkflowLink({
  href,
  step,
  title,
  body,
  fromStep,
  toStep,
  active,
}: Props) {
  return (
    <Link
      href={href}
      aria-current={active ? 'step' : undefined}
      onClick={() => {
        if (active) return;
        trackEvent(PIXVAEL_EVENTS.modeSwitched, {
          from_step: fromStep,
          to_step: toStep,
          switch_location: 'landing_workflow',
        });
      }}
      className={`group grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 border p-3 transition-colors ${
        active
          ? 'border-[var(--pixel-gold)] bg-[rgba(255,157,0,0.08)]'
          : 'border-[var(--line)] bg-black/25 hover:border-[var(--pixel-lime)] hover:bg-black/35'
      }`}
    >
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--pixel-gold)]">
        {step}
      </span>
      <span className="font-mono text-sm text-[var(--paper)]">
        {title}
        {active ? ' · current' : ''}
      </span>
      <span className="col-start-2 text-xs leading-5 text-[var(--paper-muted)] transition-colors group-hover:text-[var(--paper)]">
        {body}
      </span>
    </Link>
  );
}
