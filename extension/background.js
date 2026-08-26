// Pixvael Chrome 插件 — 右键任意图片 → Convert to Pixel Art → 带图打开 pixvael.com
// 流程:contextMenus 拿 srcUrl → SW fetch 转 dataUrl → 新开 pixvael.com →
// executeScript 轮询页面 ready 标记 → postMessage 送图,官网 PixelConverter 接收并加载。
// 隐私:图片仅在本机浏览器内传递(SW → pixvael.com 标签页),不经过任何服务器。
// 与官网的契约:页面 documentElement.dataset.pixvaelImportReady === 'true' 表示可接收;
// 消息格式 { source: 'pixvael-extension', dataUrl: string }(见 PixelConverter.tsx 导入监听)。

const SITE_URL = 'https://pixvael.com/?utm_source=chrome-extension';
const READY_POLL_ATTEMPTS = 25; // 25 × 400ms = 10s,覆盖首页懒加载 chunk 与慢网络
const READY_POLL_INTERVAL_MS = 400;
const TAB_LOAD_TIMEOUT_MS = 15000;
const MAX_IMAGE_BYTES = 32 * 1024 * 1024; // 超大图不传输,站点照常打开让用户手动上传

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'pixvael-convert-image',
    title: 'Convert to Pixel Art with Pixvael',
    contexts: ['image'],
  });
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function waitForTabComplete(tabId) {
  return new Promise((resolve) => {
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError || (tab && tab.status === 'complete')) {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });
}

async function waitForImportReady(tabId) {
  for (let attempt = 0; attempt < READY_POLL_ATTEMPTS; attempt++) {
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId },
        func: () =>
          document.documentElement.dataset.pixvaelImportReady === 'true',
      });
      if (result && result.result === true) return true;
    } catch (error) {
      // 标签页尚不可注入(仍在跳转),继续轮询
    }
    await sleep(READY_POLL_INTERVAL_MS);
  }
  return false;
}

function deliverImage(tabId, dataUrl) {
  return chrome.scripting.executeScript({
    target: { tabId },
    func: (payload) => {
      window.postMessage({ source: 'pixvael-extension', dataUrl: payload }, '*');
    },
    args: [dataUrl],
  });
}

async function captureImage(srcUrl) {
  if (srcUrl.startsWith('data:')) return srcUrl;
  const response = await fetch(srcUrl, { credentials: 'include' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  if (blob.size > MAX_IMAGE_BYTES) throw new Error('image too large');
  return blobToDataUrl(blob);
}

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'pixvael-convert-image' || !info.srcUrl) return;
  const tab = await chrome.tabs.create({ url: SITE_URL, active: true });
  if (!tab || typeof tab.id !== 'number') return;

  let dataUrl;
  try {
    dataUrl = await captureImage(info.srcUrl);
  } catch (error) {
    return; // 抓取失败(防盗链/超大图):站点照常打开,用户手动上传即可
  }

  await Promise.race([waitForTabComplete(tab.id), sleep(TAB_LOAD_TIMEOUT_MS)]);
  if (!(await waitForImportReady(tab.id))) return;
  try {
    await deliverImage(tab.id, dataUrl);
  } catch (error) {
    // 注入失败时站点仍可手动使用,静默降级
  }
});
