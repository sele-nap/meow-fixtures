import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Locale, randomName, randomText } from './catIpsum';
import { randomCatId, renderJpeg, renderPng } from './catPixel';
import { createRng, defaultRng, RNG } from './rng';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CatFixture {
  index: number;
  id: string;
  name: string;
  text: string;
  pngBuffer: Buffer;
  jpegBuffer: Buffer;
}

export interface GenerateOptions {
  count: number;
  formats: string[];
  output: string;
  seed?: number;
  prefix?: string;
  locale: Locale;
  scale: number;
  dryRun: boolean;
}

export const ALL_FORMATS = [
  'png',
  'jpeg',
  'json',
  'csv',
  'txt',
  'pdf',
  'sql',
  'md',
  'types',
] as const;
export type Format = (typeof ALL_FORMATS)[number];

// ── Data building ────────────────────────────────────────────────────────────

async function buildCats(
  options: GenerateOptions,
  rng: RNG,
): Promise<CatFixture[]> {
  const { count, locale, scale } = options;
  console.log(`Generating ${count} cat(s)...`);
  const cats: CatFixture[] = [];
  for (let i = 0; i < count; i++) {
    const catId = randomCatId(rng);
    cats.push({
      index: i + 1,
      id: catId,
      name: randomName(locale, rng),
      text: randomText(locale, rng, 4),
      pngBuffer: await renderPng(catId, scale),
      jpegBuffer: await renderJpeg(catId, scale),
    });
    process.stdout.write(`\r  ${i + 1}/${count}`);
  }
  console.log();
  return cats;
}

function catFilename(cat: CatFixture, ext: string, prefix?: string): string {
  const p = prefix ? `${prefix}_` : '';
  return `${p}cat_${String(cat.index).padStart(3, '0')}_${cat.name}.${ext}`;
}

// ── Main entry ───────────────────────────────────────────────────────────────

export async function generate(options: GenerateOptions): Promise<void> {
  const { formats, output, seed, prefix, dryRun } = options;
  const rng: RNG = seed !== undefined ? createRng(seed) : defaultRng;

  if (dryRun) {
    printDryRun(options);
    return;
  }

  fs.mkdirSync(output, { recursive: true });
  const cats = await buildCats(options, rng);
  const imagesDir = path.join(output, 'images');
  fs.mkdirSync(imagesDir, { recursive: true });

  for (const cat of cats) {
    if (formats.includes('png')) {
      fs.writeFileSync(
        path.join(imagesDir, catFilename(cat, 'png', prefix)),
        cat.pngBuffer,
      );
    }
    if (formats.includes('jpeg')) {
      fs.writeFileSync(
        path.join(imagesDir, catFilename(cat, 'jpeg', prefix)),
        cat.jpegBuffer,
      );
    }
  }

  if (formats.includes('json')) writeJson(cats, output, prefix);
  if (formats.includes('csv')) writeCsv(cats, output, prefix);
  if (formats.includes('txt')) writeTxt(cats, output, prefix);
  if (formats.includes('sql')) writeSql(cats, output, prefix);
  if (formats.includes('md')) writeMd(cats, output, prefix);
  if (formats.includes('types')) writeTypes(cats, output, prefix);
  if (formats.includes('pdf')) await writePdf(cats, output, prefix);

  printSummary(cats, formats, output);
}

// ── Dry run ───────────────────────────────────────────────────────────────────

function printDryRun(options: GenerateOptions): void {
  const { count, formats, output, seed, prefix, locale, scale } = options;
  console.log('\n[Dry run] — no files will be written\n');
  console.log(`  count   : ${count}`);
  console.log(`  formats : ${formats.join(', ')}`);
  console.log(`  output  : ${output}`);
  console.log(`  locale  : ${locale}`);
  console.log(`  scale   : ${scale}x`);
  if (seed !== undefined) console.log(`  seed    : ${seed}`);
  if (prefix) console.log(`  prefix  : ${prefix}`);
  console.log('\nFiles that would be generated:');
  const fileFormats = formats.filter((f) => !['png', 'jpeg'].includes(f));
  fileFormats.forEach((f) => console.log(`  ${output}/cats.${f}`));
  if (formats.includes('png') || formats.includes('jpeg')) {
    const exts = ['png', 'jpeg'].filter((f) => formats.includes(f));
    console.log(`  ${output}/images/  (${count} × [${exts.join(', ')}])`);
  }
}

// ── JSON ──────────────────────────────────────────────────────────────────────

function writeJson(cats: CatFixture[], output: string, prefix?: string): void {
  const data = cats.map((cat) => ({
    index: cat.index,
    id: cat.id,
    name: cat.name,
    text: cat.text,
    images: {
      png: {
        path: `images/${catFilename(cat, 'png', prefix)}`,
        base64: cat.pngBuffer.toString('base64'),
      },
      jpeg: {
        path: `images/${catFilename(cat, 'jpeg', prefix)}`,
        base64: cat.jpegBuffer.toString('base64'),
      },
    },
  }));
  fs.writeFileSync(
    path.join(output, 'cats.json'),
    JSON.stringify(data, null, 2),
  );
}

// ── CSV ───────────────────────────────────────────────────────────────────────

function writeCsv(cats: CatFixture[], output: string, prefix?: string): void {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const header = [
    'index',
    'id',
    'name',
    'text',
    'png_path',
    'jpeg_path',
    'png_base64',
    'jpeg_base64',
  ];
  const rows = cats.map((cat) =>
    [
      cat.index,
      cat.id,
      cat.name,
      cat.text,
      `images/${catFilename(cat, 'png', prefix)}`,
      `images/${catFilename(cat, 'jpeg', prefix)}`,
      cat.pngBuffer.toString('base64'),
      cat.jpegBuffer.toString('base64'),
    ]
      .map((v) => esc(String(v)))
      .join(','),
  );
  fs.writeFileSync(
    path.join(output, 'cats.csv'),
    [header.join(','), ...rows].join('\n'),
  );
}

// ── TXT ───────────────────────────────────────────────────────────────────────

function writeTxt(cats: CatFixture[], output: string, _prefix?: string): void {
  const border = '═'.repeat(60);
  const content = cats
    .map((cat) =>
      [
        border,
        `  ${cat.name.toUpperCase()}  (id: ${cat.id})`,
        border,
        '',
        cat.text,
        '',
      ].join('\n'),
    )
    .join('\n');
  fs.writeFileSync(path.join(output, 'cats.txt'), content);
}

// ── SQL ───────────────────────────────────────────────────────────────────────

function writeSql(cats: CatFixture[], output: string, prefix?: string): void {
  const esc = (v: string) => v.replace(/'/g, "''");
  const lines = [
    'CREATE TABLE IF NOT EXISTS cats (',
    '  id         VARCHAR(10)  NOT NULL,',
    '  name       VARCHAR(50)  NOT NULL,',
    '  text       TEXT         NOT NULL,',
    '  png_path   VARCHAR(255),',
    '  jpeg_path  VARCHAR(255),',
    '  PRIMARY KEY (id)',
    ');',
    '',
    'INSERT INTO cats (id, name, text, png_path, jpeg_path) VALUES',
    cats
      .map((cat, i) => {
        const comma = i < cats.length - 1 ? ',' : ';';
        return (
          `  ('${esc(cat.id)}', '${esc(cat.name)}', '${esc(cat.text)}', ` +
          `'images/${esc(catFilename(cat, 'png', prefix))}', ` +
          `'images/${esc(catFilename(cat, 'jpeg', prefix))}')${comma}`
        );
      })
      .join('\n'),
  ];
  fs.writeFileSync(path.join(output, 'cats.sql'), lines.join('\n'));
}

// ── Markdown ──────────────────────────────────────────────────────────────────

function writeMd(cats: CatFixture[], output: string, prefix?: string): void {
  const header = [
    '# Cat Fixtures',
    '',
    `_${cats.length} cats generated_`,
    '',
    '---',
    '',
  ];
  const tableHeader = [
    '| # | Name | ID | Preview |',
    '|---|------|----|---------|',
  ];
  const rows = cats.map((cat) => {
    const imgPath = `images/${catFilename(cat, 'png', prefix)}`;
    return `| ${cat.index} | **${cat.name}** | \`${cat.id}\` | ![${cat.name}](${imgPath}) |`;
  });
  const details = ['', '---', '', '## Details', ''];
  const catDetails = cats.flatMap((cat) => [
    `### ${cat.index}. ${cat.name}`,
    '',
    `**ID:** \`${cat.id}\``,
    '',
    cat.text
      .split('\n\n')
      .map((p) => p)
      .join('\n\n'),
    '',
  ]);
  const content = [
    ...header,
    ...tableHeader,
    ...rows,
    ...details,
    ...catDetails,
  ];
  fs.writeFileSync(path.join(output, 'cats.md'), content.join('\n'));
}

// ── TypeScript types ──────────────────────────────────────────────────────────

function writeTypes(cats: CatFixture[], output: string, prefix?: string): void {
  const lines = [
    '// Auto-generated — do not edit manually',
    '',
    'export interface CatImage {',
    '  path: string',
    '  base64: string',
    '}',
    '',
    'export interface Cat {',
    '  index: number',
    '  id: string',
    '  name: string',
    '  text: string',
    '  images: { png: CatImage; jpeg: CatImage }',
    '}',
    '',
    'export const cats: Cat[] = [',
    ...cats.map((cat, i) => {
      const comma = i < cats.length - 1 ? ',' : '';
      return [
        '  {',
        `    index: ${cat.index},`,
        `    id: '${cat.id}',`,
        `    name: '${cat.name}',`,
        `    text: \`${cat.text.replace(/`/g, '\\`')}\`,`,
        '    images: {',
        `      png:  { path: 'images/${catFilename(cat, 'png', prefix)}',  base64: '${cat.pngBuffer.toString('base64')}' },`,
        `      jpeg: { path: 'images/${catFilename(cat, 'jpeg', prefix)}', base64: '${cat.jpegBuffer.toString('base64')}' },`,
        '    },',
        `  }${comma}`,
      ].join('\n');
    }),
    ']',
  ];
  fs.writeFileSync(path.join(output, 'cats.types.ts'), lines.join('\n'));
}

// ── PDF ───────────────────────────────────────────────────────────────────────

async function writePdf(
  cats: CatFixture[],
  output: string,
  _prefix?: string,
): Promise<void> {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const out = fs.createWriteStream(path.join(output, 'cats.pdf'));
  doc.pipe(out);

  const pageWidth = (doc.page.width as number) - 100;
  const imgSize = 120;

  cats.forEach((cat, i) => {
    if (i > 0) doc.addPage();

    doc.roundedRect(50, 50, pageWidth, 44, 6).fill('#f5f5f5');
    doc
      .fillColor('#333333')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(cat.name, 60, 60, { width: pageWidth - imgSize - 20 });
    doc
      .fillColor('#999999')
      .fontSize(9)
      .font('Helvetica')
      .text(`id: ${cat.id}`, 60, 84);
    doc.image(cat.pngBuffer, 50 + pageWidth - imgSize, 50, { width: imgSize });
    doc.fillColor('#222222').fontSize(11).font('Helvetica').moveDown(4);

    cat.text.split('\n\n').forEach((para, pi, arr) => {
      doc.text(para, 50, undefined, { width: pageWidth, align: 'justify' });
      if (pi < arr.length - 1) doc.moveDown(0.8);
    });

    doc
      .fillColor('#bbbbbb')
      .fontSize(8)
      .text(`${i + 1} / ${cats.length}`, 50, (doc.page.height as number) - 40, {
        align: 'center',
        width: pageWidth,
      });
  });

  doc.end();
  await new Promise<void>((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────

function printSummary(
  cats: CatFixture[],
  formats: string[],
  output: string,
): void {
  console.log(`\nDone! Files written to: ${output}`);
  const fileFormats = formats.filter((f) => !['png', 'jpeg'].includes(f));
  fileFormats.forEach((f) => {
    const ext = f === 'types' ? 'types.ts' : f;
    console.log(`  cats.${ext}`);
  });
  if (formats.includes('png') || formats.includes('jpeg')) {
    console.log(`  images/  (${cats.length} file(s))`);
  }
}
