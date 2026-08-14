import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  buildAnalyticsParams,
  PIXVAEL_EVENTS,
  trackEvent,
} from '../src/lib/analytics.ts';

test('buildAnalyticsParams removes undefined values and includes the page path', () => {
  assert.deepEqual(
    buildAnalyticsParams('/minecraft-pixel-art', {
      product_mode: 'minecraft',
      grid_columns: 48,
      optional_value: undefined,
    }),
    {
      page_path: '/minecraft-pixel-art',
      product_mode: 'minecraft',
      grid_columns: 48,
    },
  );
});

test('trackEvent sends a GA4 event when gtag is available', () => {
  const calls: unknown[][] = [];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: { pathname: '/minecraft-pixel-art-maker' },
      gtag: (...args: unknown[]) => calls.push(args),
    },
  });

  try {
    assert.equal(
      trackEvent(PIXVAEL_EVENTS.makerEdited, {
        product_mode: 'minecraft',
        minecraft_tool: 'maker',
      }),
      true,
    );
    assert.deepEqual(calls, [
      [
        'event',
        'maker_edited',
        {
          page_path: '/minecraft-pixel-art-maker',
          product_mode: 'minecraft',
          minecraft_tool: 'maker',
        },
      ],
    ]);
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }
  }
});

test('trackEvent is a safe no-op during server rendering', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Reflect.deleteProperty(globalThis, 'window');

  try {
    assert.equal(trackEvent(PIXVAEL_EVENTS.gridReady), false);
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow);
    }
  }
});
