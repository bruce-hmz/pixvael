// 从 logo 源图生成 Chrome Web Store 所需的多尺寸图标。
// 用法:在仓库根目录执行 node extension/icons/generate.cjs(依赖根 node_modules 的 sharp)。
// logo 更新后重跑一次即可。
const sharp = require('sharp');
const path = require('path');

const source = path.resolve(__dirname, '../../logo/pixvael-favicon-512.png');
const sizes = [16, 32, 48, 128];

(async () => {
  for (const size of sizes) {
    await sharp(source)
      .resize(size, size, {
        fit: 'contain',
        // 与站点深色底色一致,避免透明边缘在浅色工具栏上发糊
        background: { r: 5, g: 7, b: 17, alpha: 1 },
      })
      .png()
      .toFile(path.join(__dirname, `icon${size}.png`));
    console.log(`icon${size}.png ok`);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
