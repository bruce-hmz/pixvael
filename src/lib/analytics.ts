export const PIXVAEL_EVENTS = {
  uploadStarted: 'upload_started',
  gridReady: 'grid_ready',
  imageDownloaded: 'image_downloaded',
  blueprintExported: 'blueprint_exported',
  materialsExported: 'materials_exported',
  progressStarted: 'progress_started',
  buildResumed: 'build_resumed',
  makerEdited: 'maker_edited',
  modeSwitched: 'mode_switched',
} as const;

export type PixvaelEventName =
  (typeof PIXVAEL_EVENTS)[keyof typeof PIXVAEL_EVENTS];

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: PixvaelEventName,
      params: Record<string, string | number | boolean>,
    ) => void;
  }
}

export function buildAnalyticsParams(
  pagePath: string,
  params: AnalyticsParams = {},
) {
  const entries = Object.entries({ page_path: pagePath, ...params }).filter(
    ([, value]) => value !== undefined,
  ) as Array<[string, string | number | boolean]>;
  return Object.fromEntries(entries);
}

export function trackEvent(
  eventName: PixvaelEventName,
  params: AnalyticsParams = {},
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }

  window.gtag(
    'event',
    eventName,
    buildAnalyticsParams(window.location.pathname, params),
  );
  return true;
}
