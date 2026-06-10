#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import yargs from 'yargs';
import {
  ALL_FORMATS,
  DEFAULT_CONCURRENCY,
  generate,
  generateJpg,
  GenerateJpgOptions,
  GenerateOptions,
} from './generator';

// ── .meowrc.json ──────────────────────────────────────────────────────────────

function loadRcFile(): Partial<GenerateOptions> & { formats?: string } {
  const rcPath = path.join(process.cwd(), '.meowrc.json');
  if (!fs.existsSync(rcPath)) return {};
  try {
    const rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
    console.log(`[meow-fixtures] Using config from .meowrc.json`);
    return rc;
  } catch {
    console.warn('[meow-fixtures] Could not parse .meowrc.json — ignoring');
    return {};
  }
}

const rc = loadRcFile();

// ── CLI ───────────────────────────────────────────────────────────────────────

yargs(process.argv.slice(2))
  .scriptName('meow-fixtures')
  .usage('$0 <cmd> [args]')

  .command(
    'generate',
    'Generate test fixtures with pixel art cats and cat ipsum text',
    (y) =>
      y
        .option('count', {
          alias: 'n',
          type: 'number',
          default: rc.count ?? 1,
          describe: 'Number of cats to generate',
        })
        .option('formats', {
          alias: 'f',
          type: 'string',
          default: rc.formats ?? 'all',
          describe: `Comma-separated list of formats: ${ALL_FORMATS.join(', ')} — or "all"`,
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          default: rc.output ?? './output',
          describe: 'Output directory',
        })
        .option('seed', {
          alias: 's',
          type: 'number',
          default: rc.seed,
          describe:
            'Random seed for reproducible output (same seed = same cats)',
        })
        .option('prefix', {
          alias: 'p',
          type: 'string',
          default: rc.prefix,
          describe: 'Prefix for output filenames (e.g. "auth", "product")',
        })
        .option('scale', {
          type: 'number',
          default: rc.scale ?? 3,
          describe: 'PNG pixel art scale (1 = 10px/pixel, 3 = 30px/pixel…)',
        })
        .option('size', {
          type: 'number',
          default: rc.size ?? 300,
          describe: 'JPEG photo size in pixels — square (e.g. 300 = 300×300)',
        })
        .option('dry-run', {
          type: 'boolean',
          default: rc.dryRun ?? false,
          describe: 'Preview what would be generated without writing any files',
        })
        .option('concurrency', {
          type: 'number',
          default: rc.concurrency ?? DEFAULT_CONCURRENCY,
          describe: 'Number of cataas.com requests to have in flight at once',
        })
        .option('base64', {
          type: 'boolean',
          default: rc.includeBase64 ?? true,
          describe: 'Include base64-encoded images in json/csv/types output',
        })
        .option('watch', {
          alias: 'w',
          type: 'boolean',
          default: false,
          describe: 'Re-generate on Enter keypress (Ctrl+C to exit)',
        }),
    async (argv) => {
      const formatsRaw = argv.formats as string;
      const formats =
        formatsRaw === 'all'
          ? [...ALL_FORMATS]
          : formatsRaw.split(',').map((f) => f.trim().toLowerCase());

      const options: GenerateOptions = {
        count: argv.count,
        formats,
        output: argv.output,
        seed: argv.seed,
        prefix: argv.prefix,
        scale: argv.scale,
        size: argv.size,
        dryRun: argv['dry-run'],
        concurrency: argv.concurrency,
        includeBase64: argv.base64,
      };

      await generate(options);

      if (argv.watch) {
        await watchMode(options);
      }
    },
  )

  .command(
    'jpg',
    'Download real cat photos (JPEG) from cataas.com',
    (y) =>
      y
        .option('count', {
          alias: 'n',
          type: 'number',
          default: rc.count ?? 1,
          describe: 'Number of photos to download',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          default: rc.output ?? './output',
          describe: 'Output directory',
        })
        .option('seed', {
          alias: 's',
          type: 'number',
          default: rc.seed,
          describe: 'Random seed for reproducible filenames (cat names)',
        })
        .option('prefix', {
          alias: 'p',
          type: 'string',
          default: rc.prefix,
          describe: 'Prefix for output filenames (e.g. "auth", "product")',
        })
        .option('size', {
          type: 'number',
          default: rc.size ?? 300,
          describe: 'Photo size in pixels — square (e.g. 300 = 300×300)',
        })
        .option('dry-run', {
          type: 'boolean',
          default: rc.dryRun ?? false,
          describe: 'Preview what would be downloaded without writing files',
        })
        .option('concurrency', {
          type: 'number',
          default: rc.concurrency ?? DEFAULT_CONCURRENCY,
          describe: 'Number of cataas.com requests to have in flight at once',
        }),
    async (argv) => {
      const options: GenerateJpgOptions = {
        count: argv.count,
        output: argv.output,
        seed: argv.seed,
        prefix: argv.prefix,
        size: argv.size,
        dryRun: argv['dry-run'],
        concurrency: argv.concurrency,
      };

      await generateJpg(options);
    },
  )

  .demandCommand(1, 'Please specify a command.')
  .help()
  .parse();

// ── Watch mode ────────────────────────────────────────────────────────────────

async function watchMode(options: GenerateOptions): Promise<void> {
  if (!process.stdin.isTTY) {
    console.warn(
      '[meow-fixtures] --watch requires an interactive terminal — ignoring',
    );
    return;
  }

  const rl = readline.createInterface({ input: process.stdin });
  process.stdin.setRawMode(true);

  console.log('\n[Watch mode] Press Enter to regenerate — Ctrl+C to exit\n');

  process.stdin.on('data', async (key: Buffer) => {
    // Ctrl+C
    if (key[0] === 3) {
      console.log('\nBye! 🐱');
      rl.close();
      process.exit(0);
    }
    // Enter
    if (key[0] === 13) {
      console.log('\nRegenerating...');
      await generate(options);
    }
  });
}
