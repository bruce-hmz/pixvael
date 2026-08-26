# Pixvael Chrome 插件 — 打包与上架手册

> 用途:这是「产品外链」线的代码侧交付物。Chrome Web Store 详情页是一条权威域 dofollow 外链
> (官网链接填 pixvael.com),插件名埋主词与 `pixel art converter chrome extension` 词下的竞品
> (makebead、pixelartvillage)抢同一块流量。策略背景见 [../docs/pixel-art-seo-plan.md](../docs/pixel-art-seo-plan.md)。

## 功能与架构

右键任意网页图片 →「Convert to Pixel Art with Pixvael」→ 新开 pixvael.com 并自动载入该图:

```
contextMenus 拿 srcUrl → SW fetch 转 dataUrl → 新开 pixvael.com(?utm_source=chrome-extension)
  → executeScript 轮询 data-pixvael-import-ready 标记(最多 10s)
  → postMessage 送图 → 官网 PixelConverter 复用 handleFile 载入并打点(input_method=chrome_extension)
```

- 图片仅在本地浏览器内传递(SW → pixvael.com 标签页),不经过任何服务器——与官网隐私承诺一致。
- 抓取失败(防盗链/超大图 >32MB)时静默降级:站点照常打开,用户手动上传。
- 官网侧契约在 `src/components/PixelConverter.tsx` 的 extension 导入 useEffect 里,改动消息格式两边要同步。

## 本地测试

1. `chrome://extensions` → 开发者模式 →「加载已解压的扩展程序」→ 选 `extension/` 目录。
2. 任意网页右键一张图 → Convert to Pixel Art with Pixvael → 应新开 pixvael.com(本地 dev 需临时把
   `background.js` 里 `SITE_URL` 改成 `http://localhost:3000` 测完改回)且图片自动进转换器。
3. GA4 DebugView 应看到 `upload_started` 且 `input_method=chrome_extension`。

## 打包上架 zip

```bash
cd extension && zip -r ../pixvael-extension-v1.0.0.zip manifest.json background.js popup.html icons/
```

(排除本 README 与 `icons/generate.cjs`。图标重新生成:仓库根目录 `node extension/icons/generate.cjs`。)

## 商店详情页文案(直接粘贴)

| 字段 | 内容 |
|---|---|
| **Name** | Image to Pixel Art Converter — Pixvael |
| **Summary(≤132 字符)** | Right-click any image → Convert to Pixel Art with Pixvael. Free, private, no upload, no signup. |
| **Category** | Art & Design |
| **Language(默认)** | English(必需,精选徽章硬要求) |
| **Website** | https://pixvael.com ← 就是这条 dofollow 外链 |
| **Support** | 暂无邮箱就填 GitHub issues 或官网页 |

**Detailed description:**

```
Turn any image on the web into pixel art in one right-click.

HOW IT WORKS
1. Right-click any image on any website
2. Choose "Convert to Pixel Art with Pixvael"
3. The image opens in pixvael.com, ready to convert

FEATURES
• 100% free — no signup, no watermark, no export limit
• Private by design — the image is processed in your own browser and never uploaded to a server
• Grid size, palette (full color / retro 16 / Game Boy), and Floyd–Steinberg dithering controls
• Crisp hard-edged PNG export that scales without blur
• Works as a Minecraft pixel art / build planner front door, with material lists

NOTES
• Some sites block image downloads (hotlink protection); the converter still opens so you can upload manually.
• Not affiliated with Mojang or Microsoft.
```

## 提交清单(按《精选徽章指南》要求)

- [ ] 截图 1-5 张,1280×800,**必须与提交版本 UI 一致**(审核会核对):右键菜单特写、pixvael.com 转换器界面、调色板对比
- [ ] YouTube 演示视频:上传 `docs/producthunt-demo-voice.mp4` 到频道后把链接填入 Video 链接字段
- [ ] 英文设为默认语言
- [ ] 图标已生成(4 尺寸,来自 logo 源图)
- [ ] 隐私声明:选择「不收集任何用户数据」;单用途描述见下
- [ ] 权限审核说明(<all_urls>,见下)
- [ ] 一次性 $5 开发者注册费(账号没交过的话)
- [ ] 提交 → 审核 1-3 个工作日 → 过审后到「一站式支持窗口」申请精选徽章(信息真实 + 账号无违规)

**单用途描述(隐私页必填):**

> Converts images the user right-clicks into pixel art by opening them in the Pixvael web converter.

**权限说明(审核用):**

> "Read" host access for all sites is used only to fetch the exact image the user right-clicked, so it can be
> opened in pixvael.com's local converter. The image data is transferred within the user's browser (extension
> service worker → the pixvael.com tab) and is never sent to any other server. No browsing history, page
> content, or user activity is collected.

## 上线后(不在本仓库完成)

1. 拿到商店 URL 后,在官网页脚/首页加「Chrome extension」链接 → 完成双向内链闭环。
2. 提交精选徽章申请。
3. GA4 里按 `input_method=chrome_extension` 观察插件带来的转化流量。

## 版本约定

- `manifest.json` 的 version 从 1.0.0 起;官网契约或 UI 变更时 bump 小版本,重新截图再提交
  (截图与版本不一致会被拒审)。
