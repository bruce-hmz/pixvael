// URL 查询参数解析工具(带参跳转:跨工具流转时用 ?width= 传递网格宽度)

// 从 ?width= 解析 Minecraft 网格宽度(16-128 整数,典型值 24/32/48/64)。
// 非法/缺失返回 undefined,由调用方回落到默认值。
export function parseGridWidthParam(
  value: string | string[] | undefined,
): number | undefined {
  if (Array.isArray(value)) value = value[0];
  if (!value) return undefined;
  const width = Number(value);
  if (!Number.isInteger(width) || width < 16 || width > 128) {
    return undefined;
  }
  return width;
}
