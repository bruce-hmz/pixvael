import assert from 'node:assert/strict';
import { test } from 'vitest';
import { gunzipSync } from 'node:zlib';
import { crc32, gzip } from '../src/lib/gzip.ts';

test('crc32 matches the standard test vector', () => {
  // "123456789" → 0xCBF43926
  assert.equal(
    crc32(new Uint8Array([49, 50, 51, 52, 53, 54, 55, 56, 57])),
    0xcbf43926,
  );
});

test('small payload round-trips through node:zlib', () => {
  const data = new Uint8Array([1, 2, 3, 4, 5]);
  const packed = gzip(data);
  assert.equal(packed[0], 0x1f);
  assert.equal(packed[1], 0x8b);
  assert.equal(packed[2], 0x08);
  assert.deepEqual(new Uint8Array(gunzipSync(packed)), data);
});

test('payloads beyond one stored block split correctly', () => {
  const data = new Uint8Array(70000).map((_, i) => (i * 7) & 0xff);
  const packed = gzip(data);
  const restored = new Uint8Array(gunzipSync(packed));
  assert.equal(restored.length, 70000);
  assert.deepEqual(restored, data);
});

test('empty payload is still a valid gzip stream', () => {
  const restored = new Uint8Array(gunzipSync(gzip(new Uint8Array(0))));
  assert.equal(restored.length, 0);
});
