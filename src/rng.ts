// Seeded pseudo-random number generator (LCG algorithm).
// Same seed always produces the same sequence of random values,
// making generated fixtures fully reproducible.

export type RNG = () => number;

export function createRng(seed: number): RNG {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 0xffffffff;
  };
}

// Default unseeded RNG (Math.random) used when no seed is provided.
export const defaultRng: RNG = () => Math.random();
