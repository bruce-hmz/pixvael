# 像素画站 — 设计参照(imagetoascii.app)

> 参照站:https://imagetoascii.app/
> 同构关系:它是 "image to ASCII"，我们是 "image to pixel art"——同品类结构,不同转换目标,打法可直接复制。
> 核心原则:**画相关站,第一眼感官决定去留。视觉对比 > 文字解释。**

## 5 个关键借鉴

### 1. Hero:Before/After 视觉对比(第一眼感官的核心)
- 原图(before) + 转换后(after) 并排大图
- 用户秒懂"输入→输出",不需要读文字
- **我们必须做**:hero 区放 before/after 像素画对比,且是动图/可交互(拖滑块看像素大小变化)

### 2. 顶部即时工具(拖图即转)
- 工具在页面顶部,拖图即转,免登录/无水印/无导出限制
- 每个滑块即时更新预览("Every slider updates the preview instantly")
- 纯浏览器运行,图片不上传(隐私)—— **和我们"纯前端无 AI"卖点完全一致**
- **我们必须做**:工具置顶,即时预览,零摩擦(无登录/无水印)

### 3. 用途场景矩阵 = 长尾 landing page 结构 ⭐
imagetoascii 的 usecases(每个有示例图 + 独立内容):
- Social & avatars(头像)
- Wallpapers & lock screens(壁纸)
- Posters & prints(海报)
- Merch & apparel(T恤周边)
- READMEs & terminals(代码)
- Album & cover art(专辑封面)

**这就是长尾矩阵的天然结构**——按"用途"铺页面,每用途一个 landing page + before/after 示例图 + 工具预设参数。解决了我之前纠结的"长尾怎么铺"。

**对我们的用途矩阵**(对齐实测金矿):
- minecraft pixel art(8,100 金矿)⭐
- discord/steam avatars(头像)
- wallpapers(壁纸)
- perler bead patterns(拼豆图纸)
- sprites(游戏开发)
- posters/prints(印刷)

### 4. How it works + vs 对比 + FAQ(信息意图内容)
- **How it works**:解释像素化原理(亮度→色块映射)+ "纯前端隐私"卖点 → 吃 how/what 问句搜索
- **vs 对比页**:"ASCII vs pixel art" → 它做了对比页吃对比搜索。我们可做 "pixel art vs 8-bit" / "pixel art vs vector"
- **FAQ**:What is / How do I / Is it free / Do images upload → FAQ schema 吃问句搜索
- **这正是"工具+内容混合"的范本**——信息意图 SERP 要的"教程+对比+问答"全齐

### 5. 文案:简洁工具感,无营销废话
- "Free, private and no signup" 重复强调(不啰嗦,但反复出现)
- 直接、专业、工具感
- 不堆形容词,讲事实("runs in your browser, photo never leaves your device")

---

## 站点架构映射

```
Hero      → Before/After 大图对比 + 即时工具(拖图秒转)
↓
工具区    → 风格选项(通用/minecraft方块/8-bit/调色板) + 滑块(像素大小/调色板/对比度)即时预览
↓
用途矩阵  → minecraft / avatars / wallpapers / perler / sprites / posters
           (每页:before/after 示例图 + 工具预设 + 教程 = 长尾 landing pages)
↓
How it works → 像素化原理 + 纯前端隐私卖点
↓
对比内容  → pixel art vs ASCII / vs 8-bit / vs vector
↓
FAQ       → 问句内容 + FAQ schema
↓
CTA       → Drop an image, get pixel art
```

## 第一眼感官的 3 个具体做法(用户强调的重点)

1. **Before/After 大图对比**——视觉冲击,秒懂站点干什么
2. **即时预览**——拖图秒出结果,每个参数实时更新(不是"点转换等结果")
3. **大量示例图**——用途展示 + 匹配 SERP 图片包特征(image pack 是信息意图 SERP 的标配)

## 一个注意

imagetoascii 有 "Generate with AI" 选项(AI 生图再转 ASCII)。我们 **MVP 不做 AI**(Phase 2),但可借鉴它"AI 可选增强"的定位——核心纯前端,AI 是 bonus,不依赖网络。

## 技术栈推测(待确认)
- 静态站(SSG/SSR,SEO 友好)→ 我们用 Next.js
- HTML5 Canvas 纯前端转换 → 我们同样
- 图片资源用 .webp(性能)→ 我们跟进
- og.jpg 社交分享图 → 我们每页配 og 图
