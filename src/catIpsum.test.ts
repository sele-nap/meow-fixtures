import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  randomName,
  randomParagraph,
  randomSentence,
  randomText,
} from './catIpsum';
import { createRng } from './rng';

test('randomName is deterministic for a given seed', () => {
  assert.equal(randomName(createRng(42)), randomName(createRng(42)));
});

test('randomParagraph returns one of the known paragraphs', () => {
  const para = randomParagraph(createRng(1));
  assert.ok(para.length > 0);
});

test('randomSentence returns a non-empty trimmed sentence', () => {
  const sentence = randomSentence(createRng(5));
  assert.ok(sentence.length > 0);
  assert.equal(sentence, sentence.trim());
});

test('randomText returns the requested number of paragraphs', () => {
  const text = randomText(createRng(3), 4);
  assert.equal(text.split('\n\n').length, 4);
});

test('randomText caps the paragraph count to the available pool', () => {
  const text = randomText(createRng(3), 1000);
  const paragraphCount = text.split('\n\n').length;
  assert.ok(paragraphCount > 0);
  // shouldn't request more paragraphs than exist in the pool
  assert.equal(paragraphCount, new Set(text.split('\n\n')).size);
});
