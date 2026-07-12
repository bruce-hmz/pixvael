# 像素画转换器 — SEO 关键词结构

> 用途:拿这份清单去 Google/Trends/Keyword Planner 验证「能不能做」。
> 优先级标注为推断(基于已验证的 SERP 格局),需你实测确认。
> 🟢 = 新站首选(低竞争长尾) 🟡 = 中等(支柱页,有量有竞争) 🔴 = 高竞争(大站占,观察)

---

## 一、站点信息架构(URL 结构)

```
/                            首页(品牌入口)
/image-to-pixel-art          核心支柱页(工具 + FAQ schema)
/{format}-to-pixel-art       格式变体(程序化):/jpg-to-pixel-art /png-to-pixel-art ...
/{style}-pixel-art           风格/平台页:/8-bit-pixel-art /game-boy-pixel-art /nes-pixel-art
/{use-case}                  用途页:/pixel-art-avatar /sprite-converter /minecraft-pixel-art
/blog/how-to-...             问句/教程内容(吃 FAQ 型搜索)
```

设计原则:一个 color-quantization 引擎,多页面落地。每页要有**真实差异化**(不同默认参数、示例图、导出格式),否则 Google 判薄内容惩罚。

---

## 二、关键词分层

### 层级 1:核心支柱词(站点主页面)

| 关键词 | 月搜(已知) | SERP 格局 | 优先级 |
|--------|-----------|----------|--------|
| image to pixel art | ~4,400 | Pos1-2 低 DA 新站(pixelartvillage、Pixel It) | 🟡 |
| pixel art converter | ~2,900 | Pos1-2 低 DA | 🟡 |
| photo to pixel art | 中 | 长尾,有空间 | 🟡 |
| picture to pixel art | 中 | 长尾 | 🟢 |
| pixelate image | 大 | Canva / Fotor 占 | 🔴 |
| pixel art generator | 大 | Adobe Firefly / Canva / Fotor 占 | 🔴 |

### 层级 2:格式变体矩阵(程序化主力,扩查询面)

`{format} to pixel art` —— 全部 🟢(分散,无强者独占):
- jpg to pixel art
- png to pixel art
- webp to pixel art
- gif to pixel art
- svg to pixel art
- bmp to pixel art

### 层级 3:风格 / 平台 intent 页(codex 指出:扩面 10-50 倍,新站机会)

**位深风格** 🟢:
- 8-bit pixel art converter
- 16-bit pixel art
- 32-bit pixel art

**复古平台**(注意:Game Boy 需求主战场在 app 端,web 量待验证):
- game boy pixel art converter 🟢(量存疑,重点验)
- NES pixel art converter 🟢
- SNES / GBA pixel art 🟢
- pico-8 pixel art 🟢

### 层级 4:用途 intent 页

- pixel art avatar maker 🟡(Discord/Steam 头像需求)
- pixel art logo generator 🟡
- minecraft pixel art converter 🟢(Minecraft 受众基数大,重点验)
- sprite to pixel art / sprite sheet converter 🟢(indie 游戏开发需求)
- pixel art perler pattern generator 🔴(拥挤,pixel-beads/makebead 等多站)
- pixel art cross stitch pattern 🔴(拥挤,pic2pat 13.7 万/月)

### 层级 5:问句 / FAQ(吃问句搜索,配 FAQ schema)

- how to convert image to pixel art 🟢
- how to pixelate an image 🟢
- best free pixel art converter 🟢
- how to make 8-bit art from a photo 🟢
- how to make pixel art in [style] 🟢

---

## 三、验证操作清单(你拿这个去搜)

**验证目标:层级 2(格式变体)和层级 3(风格/平台)到底有没有量。这俩是新站能切入的,它们的量决定 MVP 值不值。**

1. **裸搜 Google(每个词)**:记录前 3 名是【内容页 / 工具页 / 大站 / 小站】。
   - 前 3 都是低 DA 小站或内容页 = 🟢 可进
   - 前 3 是 Canva/Adobe/Fotor = 🔴 别碰
   - 出现 AI Overview = ⚠️ 点击会被吃

2. **Google Trends 比较量级趋势**:
   - `image to pixel art` vs `photo to pixel art` vs `8-bit pixel art` vs `game boy pixel art`
   - 看相对量级 + 是不是在涨(pixelartvillage 流量 23.7万→27.7万 在涨,品类健康)

3. **Google Keyword Planner(免费,需 Google Ads 账号)**:查精确 volume + KD(竞争度)。
   - 重点查层级 2、3 的词,确认 codex 说的"扩面 10-50 倍"是否成立

4. **反向验证头部站的长尾矩阵**:
   - 用 Ahrefs Free Site Explorer / Semrush 免费查 `pixelartvillage.com` 的 Top Organic Keywords
   - 看它 27.7 万流量到底靠哪些长尾词(反推哪些词真有量)

5. **关键判断阈值**(参考 codex 的 MVP 杀死标准):
   - 若层级 2+3 能凑出 **30+ 个有三位数月搜的词** → 长尾矩阵成立,MVP 值得做
   - 若只有个位数词有量 → 头部词撑不起,NO-GO
