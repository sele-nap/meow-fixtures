#!/usr/bin/env node

import readline from 'readline'
import yargs from 'yargs'
import { generate, ALL_FORMATS, GenerateOptions } from './generator'

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
          default: 10,
          describe: 'Number of cats to generate',
        })
        .option('formats', {
          alias: 'f',
          type: 'string',
          default: 'all',
          describe: `Comma-separated list of formats: ${ALL_FORMATS.join(', ')} — or "all"`,
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          default: './output',
          describe: 'Output directory',
        })
        .option('seed', {
          alias: 's',
          type: 'number',
          describe: 'Random seed for reproducible output (same seed = same cats)',
        })
        .option('prefix', {
          alias: 'p',
          type: 'string',
          describe: 'Prefix for output filenames (e.g. "auth", "product")',
        })
        .option('locale', {
          alias: 'l',
          type: 'string',
          default: 'en',
          choices: ['en', 'fr'],
          describe: 'Language for cat names and ipsum text',
        })
        .option('scale', {
          type: 'number',
          default: 1,
          describe: 'Image scale multiplier (1 = 10px/pixel, 2 = 20px/pixel, etc.)',
        })
        .option('dry-run', {
          type: 'boolean',
          default: false,
          describe: 'Preview what would be generated without writing any files',
        })
        .option('watch', {
          alias: 'w',
          type: 'boolean',
          default: false,
          describe: 'Re-generate on Enter keypress (Ctrl+C to exit)',
        }),
    async (argv) => {
      const formats =
        argv.formats === 'all'
          ? [...ALL_FORMATS]
          : argv.formats.split(',').map((f) => f.trim().toLowerCase())

      const options: GenerateOptions = {
        count:  argv.count,
        formats,
        output: argv.output,
        seed:   argv.seed,
        prefix: argv.prefix,
        locale: argv.locale as 'en' | 'fr',
        scale:  argv.scale,
        dryRun: argv['dry-run'],
      }

      await generate(options)

      if (argv.watch) {
        await watchMode(options)
      }
    }
  )

  .demandCommand(1, 'Please specify a command.')
  .help()
  .parse()

// ── Watch mode ────────────────────────────────────────────────────────────────

async function watchMode(options: GenerateOptions): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin })
  process.stdin.setRawMode(true)

  console.log('\n[Watch mode] Press Enter to regenerate — Ctrl+C to exit\n')

  process.stdin.on('data', async (key: Buffer) => {
    // Ctrl+C
    if (key[0] === 3) {
      console.log('\nBye! 🐱')
      rl.close()
      process.exit(0)
    }
    // Enter
    if (key[0] === 13) {
      console.log('\nRegenerating...')
      // If no seed was set, each regen is random; if seed was set, output is identical
      await generate(options)
    }
  })
}
