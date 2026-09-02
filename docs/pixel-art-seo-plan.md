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

---

## 七、GSC 首份数据快照（2026-08-26 导出，过去 3 个月）

**总量：4 次点击 / 约 880 展示 / 全站平均排名 60-90。** 数据小于信噪比，只做方向判断：

- **仅 3 个 URL 有曝光**：首页 468（排名 60.9）、`/minecraft-pixel-art` 366（64.9）、`/minecraft-pixel-art-maker` 45（**43.1，全站最好排名**）。jpg/png/webp/photo/picture/image-to-minecraft 等 6 个老内页 **0 曝光 → 首要疑点是收录问题，不是排名问题**，需逐条 URL 检查（16 条路由）。
- **Minecraft 主题占非品牌曝光 ~19%**（约 160 展示，散布在 50+ 个 minecraft 词上）→ 印证 generator 页决策，minecraft 簇是站点真实主题重心。
- **品牌错拼词**（pxelwa/picwel/pixval 等 ~25 展示，排名 4-25）来自 PH 发布的口碑流量，0 点击，SERP 呈现待优化（小问题）。
- **竞品名词** `minecraftart.netlify.app` ~7 展示 → 存在一个同赛道 netlify 工具，其用户在按名搜。

### 数据支持的新内页候选（按证据强度）

| 优先级 | 候选页 | 证据（3 个月曝光） | 说明 |
|---|---|---|---|
| P0 | `/photo-to-minecraft-pixel-art` | ~20（minecraft photo/picture to pixel art 簇） | photo 变体打法镜像进 minecraft 簇 |
| P1 | `/8-bit-image-converter` | 4（8/16 bit image converter） | 关键词文档层级 3 🟢，复古调色板现成 |
| P1 | `/png-to-minecraft-pixel-art` | ~11（png×minecraft 交叉簇） | png 是格式词主力（透明度需求） |
| P2 | how-to 教程页（how to turn image into minecraft pixel art） | 3-4 问句词 | 内容型，冲精选摘要 |
| P2 | `/pixel-art-upscaler`（功能+页） | 4（upscale/resize pixel art online） | 需先加导出倍率功能；`schematic` 导出词（2 曝光）记为产品信号 |

### 本源判断

4 点击/3 个月 + 排名 60-90 = **权重与收录是瓶颈，不是页面数量**。内页扩张只有在老页全部收录、外链进场后才产生杠杆；当前顺序：① 诊断收录 ② 部署+提交新页 ③ 外链。

### 收录诊断记录

- 2026-08-26：13 个页面全量验证 HTTP 200（含当日新部署的 3 页）。A 组 7 条零曝光老页确认状态为**「已发现 - 尚未编入索引」**（抓取预算问题，非内容质量），已批量请求编入索引（B 组 3 条新页待提交）。
- 2026-08-26 内链诊断：首页出站内链仅 2 条，页脚只链 Minecraft 簇 → **jpg/png/webp/photo/picture 5 个变体页构成内链孤岛**（仅互链，从首页不可达），是「已发现未编入」的直接成因。也解释了有曝光的 3 页恰好是首页 + hero 链接的 planner + 页脚全站链接的 maker。
- 2026-08-26 修复：首页新增「One engine, a converter page per source」链接段（jpg/png/webp/photo/picture/pixel-art-converter 六条首页直达内链），待部署。
- **复查节点（T+3~7 天）**：URL 检查看 A 组是否转为已收录；若「已抓取-尚未编入索引」反复出现，即为权重/质量信号，外线提级。
- **回填节点（T+2~4 周）**：拉 GSC 数据对比本节快照。

---

## 八、主词闭环改造（2026-09-02，Semrush 数据修正版）

### 关键词口径定案（Semrush 为准，SimilarWeb 只看相对量级）

| 关键词 | Semrush 月搜 | 意图 | 结论 |
|---|---|---|---|
| minecraft pixel art generator | 4,400 | 商务 | 主词坐实，`/minecraft-pixel-art-generator` 为工具主页 |
| image to minecraft pixel art | 1,000 | 信息 | 转换落地页（已有页升级，非新建） |
| minecraft pixel art editor | **20** | 不可用 | **废词砍掉**：不建独立 editor 页，编辑做成 generator 页内步骤 |

「KD 低 ≠ 有人搜」的活案例：editor 词 KD 28.2 看着容易，Semrush 实测月搜 20。SimilarWeb 口径系统性偏高（generator 18.5K vs Semrush 4.4K），单个数字不采信。

长尾接法（不单独建页，正文/FAQ 聚合到主词页）：`minecraft image to pixel art`（2.8K，比种子词高）、`convert image to pixel art minecraft`（720）、`high resolution`（570）、`turn image into`（180）；generator 侧 litematica / bedrock / mural / map / block count 用诚实文案接（.schematic 可经 Litematica 转换，原生 .litematic 与 Bedrock 在路线图）。

### 本轮落地（对应代码提交）

1. **转换落地页升级**：正文织入换语序长尾 + 高分辨率段落，FAQ 5 条，与教程②互链。
2. **教程层**：`/tutorials` hub + ① How to Make Pixel Art in Minecraft（8 分钟）+ ② Minecraft Image to Pixel Art: Complete Guide（15 分钟，对准 2.8K 词）；Article/FAQ/Breadcrumb schema 全 SSR；③ Litematica/Bedrock/Block Count 延后至功能补齐。
3. **产品闭环（generator 页内）**：调色板 20→52 块（+16 羊毛/16 陶瓦，含版本元数据）、版本筛选（1.9+/1.12+/1.17+/latest）、`.schematic` 导出（经典 MCEdit 格式，vertical mural / flat map art 两种朝向，deepslate 走 AddBlocks+SchematicaMapping）、工程文件保存/续作（源图+编辑+进度单 JSON）。
4. **TDH**：generator 标题 `Minecraft Pixel Art Generator — Free Online Block Art Tool`（title.absolute，不带品牌后缀）；**全站删 keywords meta**（哥飞：K 已死）；HowToSteps 步骤名升级 h3（全站 12 页统一 h2→h3 骨架）。
5. **内链权重集中主词页**：首页 MC 卡片/workflow 侧栏/maker 页均以精确锚文本链 generator；Footer 增 Tutorials 并取消 MC 链接的 `hidden md:inline`（移动端可见性，§七发现的缺口）；修 webp 自链。

### 验证

46 测试（nbt/gzip 用 node:zlib 解回验证、schematic 双朝向 golden、工程文件 round-trip、版本过滤）+ lint + build 全绿；21 路由全静态预渲染，产物 HTML 核验 h1/h3/JSON-LD/无 keywords/canonical 均在源码中。

### 站外待办

GSC 提交 `/tutorials` ×3 + 更新后的 generator/落地页 URL；V2EX 分享创造 + Product Hunt（docs/promotion.md 与 producthunt-launch.md 素材已备）；T+2~4 周 GSC 回填对比 §七快照。
