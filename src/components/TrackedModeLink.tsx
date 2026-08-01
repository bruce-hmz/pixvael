'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { PIXVAEL_EVENTS, trackEvent } from '@/lib/analytics';

type Props = {
  href: string;
  fromStep: string;
  toStep: string;
  switchLocation: string;
  className?: string;
  children: ReactNode;
};

export function TrackedModeLink({
  href,
  fromStep,
  toStep,
  switchLocation,
  className,
  children,
}: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackEvent(PIXVAEL_EVENTS.modeSwitched, {
          from_step: fromStep,
          to_step: toStep,
          switch_location: switchLocation,
        })
      }
    >
      {children}
    </Link>
  );
}
