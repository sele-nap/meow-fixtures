import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { test } from 'node:test';
import { randomCatId, renderPng } from './catPixel';
import { createRng } from './rng';

test('randomCatId is deterministic for a given seed', () => {
  assert.equal(randomCatId(createRng(42)), randomCatId(createRng(42)));
});

test('randomCatId returns a 10-character lowercase hex string', () => {
  const id = randomCatId(createRng(1));
  assert.match(id, /^[0-9a-f]{10}$/);
});

test('renderPng returns a valid PNG buffer', async () => {
  const id = randomCatId(createRng(1));
  const buffer = await renderPng(id, 1);
  assert.ok(Buffer.isBuffer(buffer));
  // PNG signature
  assert.deepEqual(
    buffer.subarray(0, 8),
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
});

test('renderPng scale increases the output dimensions', async () => {
  const id = randomCatId(createRng(2));
  const small = await renderPng(id, 1);
  const big = await renderPng(id, 2);
  assert.ok(big.length > small.length);
});
