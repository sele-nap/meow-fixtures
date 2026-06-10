import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { randomName, randomText } from './catIpsum';
import { fetchCatPhoto } from './catPhoto';
import { randomCatId, renderPng } from './catPixel';
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
  /** JPEG photo size in pixels — square (cataas.com). Default: 300. */
  size: number;
  /** PNG pixel art scale multiplier (1 = 10px/pixel). Default: 3. */
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

const IMAGE_FORMATS = ['png', 'jpeg'];

/** Returns the requested formats that produce a `cats.<ext>` data file (excludes images). */
function dataFileFormats(formats: string[]): string[] {
  return formats.filter((f) => !IMAGE_FORMATS.includes(f));
}

// ── Data building ────────────────────────────────────────────────────────────

async function buildCats(
  options: GenerateOptions,
  rng: RNG,
): Promise<CatFixture[]> {
  const { count, size, scale } = options;
  console.log(`Generating ${count} cat(s)…`);
  const cats: CatFixture[] = [];
  for (let i = 0; i < count; i++) {
    const catId = randomCatId(rng);
    // PNG  → pixel art generated from the cat ID pool
    // JPEG → real cat photo fetched from cataas.com
    const [pngBuffer, { jpegBuffer }] = await Promise.all([
      renderPng(catId, scale),
      fetchCatPhoto(size, rng),
    ]);
    cats.push({
      index: i + 1,
      id: catId,
      name: randomName(rng),
      text: randomText(rng, 4),
      pngBuffer,
      jpegBuffer,
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

// ── Jpg ──────────────────────────────────────────────────────────────────────

export interface GenerateJpgOptions {
  count: number;
  output: string;
  seed?: number;
  prefix?: string;
  /** JPEG photo size in pixels — square (cataas.com). Default: 300. */
  size: number;
  dryRun: boolean;
}

/** Fetches real cat photos (JPEG) from cataas.com and saves them to disk. */
export async function generateJpg(options: GenerateJpgOptions): Promise<void> {
  const { count, output, seed, prefix, size, dryRun } = options;
  const rng: RNG = seed !== undefined ? createRng(seed) : defaultRng;

  if (dryRun) {
    console.log('\n[Dry run] — no files will be written\n');
    console.log(`  count  : ${count}`);
    console.log(`  output : ${output}`);
    console.log(`  size   : ${size}×${size}px`);
    if (seed !== undefined) console.log(`  seed   : ${seed}`);
    if (prefix) console.log(`  prefix : ${prefix}`);
    console.log('\nFiles that would be generated:');
    console.log(`  ${output}/  (${count} × .jpg)`);
    return;
  }

  fs.mkdirSync(output, { recursive: true });

  console.log(`Fetching ${count} cat photo(s) from cataas.com…`);
  for (let i = 0; i < count; i++) {
    const name = randomName(rng);
    const { jpegBuffer } = await fetchCatPhoto(size, rng);
    const p = prefix ? `${prefix}_` : '';
    const filename = `${p}cat_${String(i + 1).padStart(3, '0')}_${name}.jpg`;
    fs.writeFileSync(path.join(output, filename), jpegBuffer);
    process.stdout.write(`\r  ${i + 1}/${count}`);
  }
  console.log();
  console.log(`\nDone! ${count} photo(s) written to: ${output}`);
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
  if (formats.includes('txt')) writeTxt(cats, output);
  if (formats.includes('sql')) writeSql(cats, output, prefix);
  if (formats.includes('md')) writeMd(cats, output, prefix);
  if (formats.includes('types')) writeTypes(cats, output, prefix);
  if (formats.includes('pdf')) await writePdf(cats, output, prefix);

  printSummary(cats, formats, output);
}

// ── Dry run ───────────────────────────────────────────────────────────────────

function printDryRun(options: GenerateOptions): void {
  const { count, formats, output, seed, prefix, size, scale } = options;
  console.log('\n[Dry run] — no files will be written\n');
  console.log(`  count   : ${count}`);
  console.log(`  formats : ${formats.join(', ')}`);
  console.log(`  output  : ${output}`);
  console.log(`  scale   : ${scale}x  (PNG pixel art)`);
  console.log(`  size    : ${size}×${size}px  (JPEG photo)`);
  if (seed !== undefined) console.log(`  seed    : ${seed}`);
  if (prefix) console.log(`  prefix  : ${prefix}`);
  console.log('\nFiles that would be generated:');
  dataFileFormats(formats).forEach((f) => console.log(`  ${output}/cats.${f}`));
  const imageExts = IMAGE_FORMATS.filter((f) => formats.includes(f));
  if (imageExts.length > 0) {
    console.log(`  ${output}/images/  (${count} × [${imageExts.join(', ')}])`);
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

function writeTxt(cats: CatFixture[], output: string): void {
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
  // bufferPages lets us go back and stamp page numbers once the full
  // document — including any auto-paginated overflow — has been laid out.
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
  const out = fs.createWriteStream(path.join(output, 'cats.pdf'));
  doc.pipe(out);

  const pageW = (doc.page.width as number) - 100; // 495 on A4
  const imgSize = 150;

  cats.forEach((cat, i) => {
    if (i > 0) doc.addPage();

    // ── Cat image — centered, on its own ────────────────────────────────────
    const imgX = ((doc.page.width as number) - imgSize) / 2;
    const imgY = doc.y;
    try {
      doc.image(cat.pngBuffer, imgX, imgY, {
        width: imgSize,
        height: imgSize,
        fit: [imgSize, imgSize],
      });
    } catch (_) {
      /* skip broken image */
    }
    doc.y = imgY + imgSize + 18;

    // ── Title ────────────────────────────────────────────────────────────────
    doc
      .fillColor('#222222')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(cat.name, { align: 'center' });
    doc
      .fillColor('#999999')
      .fontSize(9)
      .font('Helvetica')
      .text(`id: ${cat.id}`, { align: 'center' });
    doc.moveDown(0.8);

    // ── Divider ──────────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageW, doc.y)
      .strokeColor('#e5e5e5')
      .lineWidth(1)
      .stroke();
    doc.moveDown(1.2);

    // ── Body text — flows naturally below, never overlaps the image ────────
    doc.fillColor('#333333').fontSize(11).font('Helvetica');
    const paragraphs = cat.text.split('\n\n');
    paragraphs.forEach((para, pi) => {
      doc.text(para, { width: pageW, align: 'justify' });
      if (pi < paragraphs.length - 1) doc.moveDown(0.8);
    });
  });

  // ── Page numbers — stamped after layout, safely inside page bounds ───────
  const range = doc.bufferedPageRange();
  for (let p = range.start; p < range.start + range.count; p++) {
    doc.switchToPage(p);
    const bottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0; // avoid triggering an extra auto page
    doc
      .fillColor('#bbbbbb')
      .fontSize(8)
      .text(`${p + 1} / ${range.count}`, 50, (doc.page.height as number) - 40, {
        align: 'center',
        width: pageW,
        lineBreak: false,
      });
    doc.page.margins.bottom = bottomMargin;
  }

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
  dataFileFormats(formats).forEach((f) => {
    const ext = f === 'types' ? 'types.ts' : f;
    console.log(`  cats.${ext}`);
  });
  if (IMAGE_FORMATS.some((f) => formats.includes(f))) {
    console.log(`  images/  (${cats.length} file(s))`);
  }
}
