// 零依赖 gzip 容器:DEFLATE 采用 stored(不压缩)块。
// 像素画网格的 NBT 载荷只有几十 KB,省掉压缩库换取可移植与可测性;
// 输出是合法 gzip,任何 gunzip 实现(含 node:zlib)都能解开。

const DEFLATE_MAX_BLOCK = 65535;

// 标准 CRC-32(IEEE 802.3,多项式 0xEDB88320),查表法。
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index += 1) {
    crc = CRC_TABLE[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function gzip(data: Uint8Array): Uint8Array {
  const blockCount = Math.max(1, Math.ceil(data.length / DEFLATE_MAX_BLOCK));
  // 10 字节头 + 每块 5 字节 stored 头 + 载荷 + 8 字节尾
  const output = new Uint8Array(
    10 + blockCount * 5 + data.length + 8,
  );
  let offset = 0;

  const write = (...values: number[]) => {
    for (const value of values) {
      output[offset] = value & 0xff;
      offset += 1;
    }
  };

  // gzip 头:magic(1f 8b)、deflate、无 flag、无 mtime、无扩展、未知 OS(0xff)
  write(0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff);

  for (let block = 0; block < blockCount; block += 1) {
    const start = block * DEFLATE_MAX_BLOCK;
    const size = Math.min(DEFLATE_MAX_BLOCK, data.length - start);
    const isFinal = block === blockCount - 1 ? 1 : 0;
    // BFINAL(1 bit) + BTYPE=00(stored),其余位为 0
    write(isFinal, size & 0xff, (size >> 8) & 0xff);
    write((size ^ 0xffff) & 0xff, ((size ^ 0xffff) >> 8) & 0xff);
    output.set(data.subarray(start, start + size), offset);
    offset += size;
  }

  const crc = crc32(data);
  const size = data.length >>> 0;
  write(
    crc & 0xff,
    (crc >>> 8) & 0xff,
    (crc >>> 16) & 0xff,
    (crc >>> 24) & 0xff,
    size & 0xff,
    (size >>> 8) & 0xff,
    (size >>> 16) & 0xff,
    (size >>> 24) & 0xff,
  );

  return output.subarray(0, offset);
}
