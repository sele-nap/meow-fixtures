#!/usr/bin/env node

import yargs from 'yargs'
import { generate, ALL_FORMATS } from './generator'

yargs(process.argv.slice(2))
  .scriptName('meow-fixtures')
  .usage('$0 <cmd> [args]')

  .command(
    'generate',
    'Génère des fichiers de test avec chats pixel art + cat ipsum',
    (y) =>
      y
        .option('count', {
          alias: 'n',
          type: 'number',
          default: 10,
          describe: 'Nombre de chats',
        })
        .option('formats', {
          alias: 'f',
          type: 'string',
          default: 'all',
          describe: `Formats séparés par virgule : ${ALL_FORMATS.join(', ')} — ou "all"`,
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          default: './output',
          describe: 'Dossier de sortie',
        }),
    async (argv) => {
      const formats =
        argv.formats === 'all'
          ? [...ALL_FORMATS]
          : argv.formats.split(',').map((f) => f.trim().toLowerCase())
      await generate({ count: argv.count, formats, output: argv.output })
    }
  )

  .demandCommand(1, 'Spécifie une commande.')
  .help()
  .parse()
