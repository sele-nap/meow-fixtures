// Public programmatic API for meow-fixtures.
// Use this when you want to generate fixtures directly in your code
// without going through the CLI.
//
// Example:
//   import { generate } from 'meow-fixtures'
//   await generate({ count: 10, formats: ['json', 'sql'], output: './fixtures' })

export { ALL_FORMATS, generate } from './generator';
export type { CatFixture, Format, GenerateOptions } from './generator';

export {
  randomName,
  randomParagraph,
  randomSentence,
  randomText,
} from './catIpsum';

export { fetchCatPhoto } from './catPhoto';
export { randomCatId, renderPng } from './catPixel';

export { createRng, defaultRng } from './rng';
export type { RNG } from './rng';
