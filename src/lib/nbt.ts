// 极简 Java NBT(命名二进制标签)写入器,大端序。
// 只覆盖 .schematic 导出需要的标签类型;纯函数式字节构建,node 与浏览器通用。

export const TAG_END = 0;
export const TAG_BYTE = 1;
export const TAG_SHORT = 2;
export const TAG_INT = 3;
export const TAG_LONG = 4;
export const TAG_FLOAT = 5;
export const TAG_DOUBLE = 6;
export const TAG_BYTE_ARRAY = 7;
export const TAG_STRING = 8;
export const TAG_LIST = 9;
export const TAG_COMPOUND = 10;
export const TAG_INT_ARRAY = 11;

// Java 修改版 UTF-8:按 UTF-16 码元逐个编码,NUL 编码为 C0 80,
// 增补字符以代理对形式各编 3 字节。ASCII 输入与标准 UTF-8 完全一致。
function encodeModifiedUtf8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const codeUnit = text.charCodeAt(index);
    if (codeUnit === 0x00) {
      bytes.push(0xc0, 0x80);
    } else if (codeUnit <= 0x7f) {
      bytes.push(codeUnit);
    } else if (codeUnit <= 0x7ff) {
      bytes.push(
        0xc0 | (codeUnit >> 6),
        0x80 | (codeUnit & 0x3f),
      );
    } else {
      bytes.push(
        0xe0 | (codeUnit >> 12),
        0x80 | ((codeUnit >> 6) & 0x3f),
        0x80 | (codeUnit & 0x3f),
      );
    }
  }
  return Uint8Array.from(bytes);
}

export class NbtWriter {
  private buffer = new Uint8Array(1024);
  private length = 0;

  private ensure(extra: number) {
    if (this.length + extra <= this.buffer.length) return;
    let capacity = this.buffer.length * 2;
    while (capacity < this.length + extra) capacity *= 2;
    const next = new Uint8Array(capacity);
    next.set(this.buffer.subarray(0, this.length));
    this.buffer = next;
  }

  private push(...values: number[]) {
    this.ensure(values.length);
    for (const value of values) {
      this.buffer[this.length] = value & 0xff;
      this.length += 1;
    }
  }

  private pushBytes(values: Uint8Array) {
    this.ensure(values.length);
    this.buffer.set(values, this.length);
    this.length += values.length;
  }

  private pushName(name: string) {
    const encoded = encodeModifiedUtf8(name);
    this.push(encoded.length >> 8, encoded.length & 0xff);
    this.pushBytes(encoded);
  }

  byte(value: number) {
    this.push(value);
  }

  short(value: number) {
    this.push((value >> 8) & 0xff, value & 0xff);
  }

  int(value: number) {
    this.push(
      (value >>> 24) & 0xff,
      (value >>> 16) & 0xff,
      (value >>> 8) & 0xff,
      value & 0xff,
    );
  }

  // TAG_Long 不需要:.schematic 输出不含 64 位整数字段,故不提供 long(),
  // 也避免在低 target 下引入 BigInt 字面量。

  float(value: number) {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, value, false);
    for (let index = 0; index < 4; index += 1) {
      this.push(view.getUint8(index));
    }
  }

  double(value: number) {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value, false);
    for (let index = 0; index < 8; index += 1) {
      this.push(view.getUint8(index));
    }
  }

  byteArray(values: Uint8Array) {
    this.int(values.length);
    this.pushBytes(values);
  }

  intArray(values: number[]) {
    this.int(values.length);
    for (const value of values) {
      this.int(value);
    }
  }

  string(value: string) {
    const encoded = encodeModifiedUtf8(value);
    this.push(encoded.length >> 8, encoded.length & 0xff);
    this.pushBytes(encoded);
  }

  /** 写入具名标签头(类型字节 + 名称),随后由调用方写 payload。 */
  tagHeader(type: number, name: string) {
    this.push(type);
    this.pushName(name);
  }

  /** 列表头:itemType + 数量,payload 紧随(无名称)。 */
  listHeader(itemType: number, length: number) {
    this.push(itemType);
    this.int(length);
  }

  beginCompound(name: string) {
    this.tagHeader(TAG_COMPOUND, name);
  }

  endCompound() {
    this.push(TAG_END);
  }

  toUint8Array(): Uint8Array {
    return this.buffer.slice(0, this.length);
  }
}

/** 写出标准根节点:命名 compound(名称通常为空串)。 */
export function writeRootCompound(
  write: (writer: NbtWriter) => void,
  rootName = '',
): Uint8Array {
  const writer = new NbtWriter();
  writer.beginCompound(rootName);
  write(writer);
  writer.endCompound();
  return writer.toUint8Array();
}
