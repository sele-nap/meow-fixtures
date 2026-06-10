import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRng, defaultRng } from './rng';

test('createRng is deterministic for a given seed', () => {
  const a = createRng(42);
  const b = createRng(42);
  const seqA = Array.from({ length: 5 }, () => a());
  const seqB = Array.from({ length: 5 }, () => b());
  assert.deepEqual(seqA, seqB);
});

test('createRng produces different sequences for different seeds', () => {
  const a = createRng(1);
  const b = createRng(2);
  assert.notEqual(a(), b());
});

test('createRng values are within [0, 1)', () => {
  const rng = createRng(7);
  for (let i = 0; i < 100; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1, `value ${v} out of range`);
  }
});

test('defaultRng returns a number within [0, 1)', () => {
  const v = defaultRng();
  assert.ok(v >= 0 && v < 1);
});
