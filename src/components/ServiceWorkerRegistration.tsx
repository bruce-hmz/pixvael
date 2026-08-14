'use client';

import { useEffect } from 'react';

// PWA service worker 注册:仅生产环境注册(开发环境 SW 会干扰热更新与缓存调试)。
// sw.js 由 public/ 直接提供,注册成功后站点获得离线可用 + 静态资源缓存。
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    // load 后再注册,避免与首屏渲染争抢主线程
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // 注册失败静默(如不支持的环境),不阻塞站点功能
      });
    });
  }, []);

  return null;
}
