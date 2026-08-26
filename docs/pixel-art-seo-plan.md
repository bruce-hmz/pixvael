# 像素画 SEO 作战计划（关键词实测版）

> 日期 2026-08-26 | 数据源：Google Ads Keyword Planner 实测（8 词，更新于 1 个月前）+ `image to pixel art` 第一页逐位拆解
> 前置文档：[pixel-art-seo-keywords.md](./pixel-art-seo-keywords.md)（完整关键词架构，层级 2-5 尚未实测）

---

## 一、GSC 提交清单（部署后立即做）

本轮 commit `26c4812` 新增 3 条 URL。到 Search Console → URL 检查 → 请求编入索引：

| 提交 URL | 目标词 | 月搜 | KD |
|---|---|---|---|
| `https://pixvael.com/image-to-pixel-art` | image to pixel art | 4,400 | 38 |
| `https://pixvael.com/minecraft-pixel-art-generator` | minecraft pixel art generator | 4,400 | **10** |
| `https://pixvael.com/pixel-art-converter` | pixel art converter | 3,600 | **9** |

sitemap 已含全部路由（lastmod 已 bump 至 2026-08-26），手动提交只为加速首波收录。

---

## 二、8 词实测数据与判定

| 词 | 月搜 | KD | CPC | 判定 | 承接页 |
|---|---|---|---|---|---|
| minecraft pixel art generator | 4,400 | **10** | $0.00 | 🎯 P0 已建页 | `/minecraft-pixel-art-generator` |
| pixel art converter | 3,600 | **9** | $1.85 | 🎯 P0 已建页 | `/pixel-art-converter` |
| image to pixel art | 4,400 | 38 | $1.17 | P1 中期主战场 | 首页 + `/image-to-pixel-art` |
| picture to pixel art | 3,600 | 25 | $1.17 | P1 页面已在 | `/picture-to-pixel-art` |
| photo to pixel art | 2,900 | 39 | $1.17 | P1 页面已在 | `/photo-to-pixel-art` |
| image to minecraft pixel art | 1,000 | 22 | $18.20 | P1 页面已在，商业意图强 | `/image-to-minecraft-pixel-art` |
| turn photo into pixel art | 320 | 37 | $0.89 | 不建页，短语已写进 photo 页正文 | `/photo-to-pixel-art` |
| pixel art maker | 27,100 | 86 | $1.06 | ❌ 放弃：KD 天花板 + 意图错位（要绘图工具非转换器） | 无，DR>30 再评估 |

**核心结论**：两个 KD≤10 的新页合计 +8,000/月可争量，比主词（4.4K@KD38）性价比高得多。低难度词先出排名 → 站点获得真实搜索信号 → 反哺主词战场。

---

## 三、主攻顺序

1. **P0（已落地，待收录出词）**：generator + converter 两个低难度页，目标 2-4 周内 GSC 见曝光
2. **P1（页面全就绪，吃权重红利）**：主词双承接（首页 + `/image-to-pixel-art`）靠外链推进；picture/photo/minecraft-image 三页不动
3. **外链是唯一未启动的杠杆**：进场门槛 ~50 引用域（见下方 SERP 情报），从免费导航站收录 + DR20-30 guest post（$50-100/条）起步

---

## 四、SERP 情报速记（image to pixel art 第一页）

- 整体难度 37.7（容易）；进场链接预算中值 ~50 引用域
- **Pos1 pixelartvillage.com**（DR10 / 域龄 19 个月 / 该词月带 8.8K 流量）：体验分垫底（第 27 百分位：人均 2 页、停留 50s、跳出 55%）→ 行为数据反超是主攻点，产品力已碾压，缺的是外链
- **Pos2/3/6 全是专营新站**（makebead DR13/5 个月、sprite-ai DR18、pixelartvillage.org DR28）→ 赛道对新站友好，无不可逾越的墙
- Pos4/5/7/8（Reddit / GitHub Pages / YouTube / Adobe）为权重占位，不打；GitHub 那位停留仅 24s

---

## 五、待办与复查节奏

- [ ] **部署后**：GSC 提交上表 3 条 URL
- [ ] **Chrome 插件上架**（壳已建，见 `extension/README.md` 提交清单）：截图 + YouTube 视频 → 提交商店 → 申请精选徽章；过审后官网页脚加商店链接（双向闭环）
- [ ] 外链建设启动：目标 ~50 引用域（Chrome Web Store 本身就是第 1 条权威域外链）
- [ ] **T+2~4 周**：GSC 查 3 个新页的展现/点击，回填第二节表格
- [ ] generator/converter 若顺利出词 → 验证「KD≤10 快速出词」路线成立 → 复制到层级 2/3 格式与风格变体页（清单见 [pixel-art-seo-keywords.md](./pixel-art-seo-keywords.md)）
- [ ] `pixel art maker`（27.1K@KD86）：DR>30 再评估，暂不投入
- [ ] `turn photo into pixel art`：已覆盖正文，GSC 观察自然排名即可

### Chrome 插件线（2026-08-26 立项）

- **定位**：产品形态外链（哥飞打法：与 GitHub 仓库/App 并列的高质量外链）；同时占位
  `pixel art converter chrome extension` 词——该词第 3 名 makebead、第 8 名 pixelartvillage.org，竞品已在用插件导流
- **已落地**：`extension/` 完整插件壳（右键图片 → Convert to Pixel Art → 带图打开官网，
  图片纯本地传递）+ 官网接收逻辑（PixelConverter 监听，GA4 `input_method=chrome_extension`）
- **下一步**：按 `extension/README.md` 清单截图/录屏 → 提交商店（1-3 个工作日审核）→ 精选徽章申请
- **注意**：不碰任何「自动发外链/自动评论」类插件形态（灌评论风险同 GitHub 小号，已砍）

---

## 六、已落地改动（commit 26c4812，2026-08-26）

| 改动 | 说明 |
|---|---|
| 新增 `/image-to-pixel-art` | 主词精确路径承接页，727 词，标题与首页差异化避蚕食 |
| 新增 `/minecraft-pixel-art-generator` | 765 词，Minecraft 引擎 convert 预设，接入簇群互链 + Footer 全站入口 |
| 新增 `/pixel-art-converter` | 582 词，链接辐射全部格式/变体页 |
| 互链 | 首页↔image-to、image-to-minecraft↔generator、image-to-pixel-art↔converter |
| 其他 | photo 页写入 turn 短语；sitemap 注册 3 路由；验证：24 测试 + lint + build 全绿，canonical/结构化数据从产物 HTML 核验 |
