import assert from 'node:assert/strict';
import { test } from 'vitest';
import { NbtWriter, writeRootCompound } from '../src/lib/nbt.ts';

test('writes big-endian primitives', () => {
  const writer = new NbtWriter();
  writer.byte(0x12);
  writer.short(0x1234);
  writer.int(0x12345678);
  assert.deepEqual(Array.from(writer.toUint8Array()), [
    0x12,
    0x12, 0x34,
    0x12, 0x34, 0x56, 0x78,
  ]);
});

test('writes length-prefixed strings', () => {
  const writer = new NbtWriter();
  writer.string('Alpha');
  assert.deepEqual(Array.from(writer.toUint8Array()), [
    0x00, 0x05, 65, 108, 112, 104, 97,
  ]);
});

test('byte arrays carry an int length prefix', () => {
  const writer = new NbtWriter();
  writer.byteArray(new Uint8Array([1, 2, 3]));
  assert.deepEqual(Array.from(writer.toUint8Array()), [
    0x00, 0x00, 0x00, 0x03, 1, 2, 3,
  ]);
});

test('root compound writes named tags terminated by TAG_END', () => {
  const bytes = writeRootCompound((writer) => {
    writer.tagHeader(2, 'Width');
    writer.short(64);
  });
  // 10 (compound) + "" + 2 (short) + "Width" + payload + 0 (end)
  assert.deepEqual(Array.from(bytes), [
    10, 0x00, 0x00,
    2, 0x00, 0x05, 87, 105, 100, 116, 104,
    0x00, 0x40,
    0,
  ]);
});

test('buffer grows transparently beyond initial capacity', () => {
  const writer = new NbtWriter();
  const payload = new Uint8Array(5000).map((_, i) => i & 0xff);
  writer.byteArray(payload);
  const out = writer.toUint8Array();
  assert.equal(out.length, 4 + 5000);
  assert.deepEqual(out.subarray(4), payload);
});
