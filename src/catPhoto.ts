import http from 'http';
import https from 'https';
import Jimp from 'jimp';
import { RNG, defaultRng } from './rng';

// ── HTTP helpers ──────────────────────────────────────────────────────────────

/**
 * Downloads a URL to a Buffer, following up to `maxRedirects` redirects.
 * Works with both http and https.
 */
function downloadBuffer(url: string, maxRedirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;

    lib
      .get(url, (res) => {
        // Follow redirects
        if (
          (res.statusCode === 301 ||
            res.statusCode === 302 ||
            res.statusCode === 307 ||
            res.statusCode === 308) &&
          res.headers.location
        ) {
          if (maxRedirects <= 0) {
            reject(new Error('Too many redirects'));
            return;
          }
          downloadBuffer(res.headers.location, maxRedirects - 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} — ${url}`));
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches a random cat photo from cataas.com and returns it as both
 * a JPEG buffer (original) and a PNG buffer (converted via jimp).
 *
 * @param size  Square dimension in pixels (default 300).
 * @param rng   RNG used as a cache-buster — pass a seeded RNG for reproducible photos.
 */
export async function fetchCatPhoto(
  size = 300,
  rng: RNG = defaultRng,
): Promise<{ pngBuffer: Buffer; jpegBuffer: Buffer }> {
  // Cache-buster so every call gets a fresh random cat (seeded so it's reproducible)
  const cacheBuster = Math.floor(rng() * 1e9);
  const url = `https://cataas.com/cat?width=${size}&height=${size}&_=${cacheBuster}`;

  const jpegBuffer = await downloadBuffer(url);

  // Convert to PNG using jimp so both formats are always available
  const img = await Jimp.read(jpegBuffer);
  const pngBuffer = await img.getBufferAsync(Jimp.MIME_PNG);

  return { pngBuffer, jpegBuffer };
}
