import http from 'http';
import https from 'https';
import Jimp from 'jimp';

// ── HTTP helpers ──────────────────────────────────────────────────────────────

// How long to wait for a response before giving up on a request.
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Downloads a URL to a Buffer, following up to `maxRedirects` redirects.
 * Works with both http and https. Aborts after `REQUEST_TIMEOUT_MS` of
 * inactivity.
 */
function downloadBuffer(url: string, maxRedirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;

    const req = lib
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

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(
        new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms — ${url}`),
      );
    });
  });
}

// Number of times to retry a failed/timed-out fetch before giving up.
const MAX_FETCH_RETRIES = 2;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches a random cat photo from cataas.com and returns it as both
 * a JPEG buffer (original) and a PNG buffer (converted via jimp).
 *
 * Note: cataas.com returns a random photo on every request regardless of
 * query params, so this is never reproducible — even with a seeded RNG.
 *
 * Retries up to `MAX_FETCH_RETRIES` times on network errors or timeouts.
 *
 * @param size  Square dimension in pixels (default 300).
 */
export async function fetchCatPhoto(
  size = 300,
): Promise<{ pngBuffer: Buffer; jpegBuffer: Buffer }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_FETCH_RETRIES; attempt++) {
    try {
      // Cache-buster so every call gets a fresh random cat
      const url = `https://cataas.com/cat?width=${size}&height=${size}&_=${Date.now()}-${attempt}`;
      const downloaded = await downloadBuffer(url);

      // cataas.com doesn't always return a JPEG (sometimes PNG/GIF), so
      // re-encode via jimp to guarantee both buffers match their extensions.
      const img = await Jimp.read(downloaded);
      const pngBuffer = await img.getBufferAsync(Jimp.MIME_PNG);
      const jpegBuffer = await img.getBufferAsync(Jimp.MIME_JPEG);

      return { pngBuffer, jpegBuffer };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}
