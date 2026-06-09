import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import { randomCatId, renderPng, renderJpeg } from './catPixel'
import { randomName, randomText } from './catIpsum'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CatFixture {
  index: number
  id: string
  name: string
  text: string
  pngBuffer: Buffer
  jpegBuffer: Buffer
}

export interface GenerateOptions {
  count: number
  formats: string[]
  output: string
}

export const ALL_FORMATS = ['png', 'jpeg', 'json', 'csv', 'txt', 'pdf'] as const
export type Format = typeof ALL_FORMATS[number]

// ── Construction des données ──────────────────────────────────────────────────

async function buildCats(count: number): Promise<CatFixture[]> {
  console.log(`Generating ${count} cat(s)...`)
  const cats: CatFixture[] = []
  for (let i = 0; i < count; i++) {
    const catId = randomCatId()
    cats.push({
      index: i + 1,
      id: catId,
      name: randomName(),
      text: randomText(4),
      pngBuffer: await renderPng(catId),
      jpegBuffer: await renderJpeg(catId),
    })
    process.stdout.write(`\r  ${i + 1}/${count}`)
  }
  console.log()
  return cats
}

function catFilename(cat: CatFixture, ext: string): string {
  return `cat_${String(cat.index).padStart(3, '0')}_${cat.name}.${ext}`
}

// ── Entrée principale ─────────────────────────────────────────────────────────

export async function generate(options: GenerateOptions): Promise<void> {
  const { count, formats, output } = options
  fs.mkdirSync(output, { recursive: true })

  const cats = await buildCats(count)
  const imagesDir = path.join(output, 'images')
  fs.mkdirSync(imagesDir, { recursive: true })

  for (const cat of cats) {
    if (formats.includes('png')) {
      fs.writeFileSync(path.join(imagesDir, catFilename(cat, 'png')), cat.pngBuffer)
    }
    if (formats.includes('jpeg')) {
      fs.writeFileSync(path.join(imagesDir, catFilename(cat, 'jpeg')), cat.jpegBuffer)
    }
  }

  if (formats.includes('json')) writeJson(cats, output)
  if (formats.includes('csv'))  writeCsv(cats, output)
  if (formats.includes('txt'))  writeTxt(cats, output)
  if (formats.includes('pdf'))  await writePdf(cats, output)

  printSummary(cats, formats, output)
}

// ── JSON ──────────────────────────────────────────────────────────────────────

function writeJson(cats: CatFixture[], output: string): void {
  const data = cats.map(cat => ({
    index: cat.index,
    id: cat.id,
    name: cat.name,
    text: cat.text,
    images: {
      png: {
        path: `images/${catFilename(cat, 'png')}`,
        base64: cat.pngBuffer.toString('base64'),
      },
      jpeg: {
        path: `images/${catFilename(cat, 'jpeg')}`,
        base64: cat.jpegBuffer.toString('base64'),
      },
    },
  }))
  fs.writeFileSync(path.join(output, 'cats.json'), JSON.stringify(data, null, 2))
}

// ── CSV ───────────────────────────────────────────────────────────────────────

function writeCsv(cats: CatFixture[], output: string): void {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const header = ['index', 'id', 'name', 'text', 'png_path', 'jpeg_path', 'png_base64', 'jpeg_base64']
  const rows = cats.map(cat =>
    [
      cat.index,
      cat.id,
      cat.name,
      cat.text,
      `images/${catFilename(cat, 'png')}`,
      `images/${catFilename(cat, 'jpeg')}`,
      cat.pngBuffer.toString('base64'),
      cat.jpegBuffer.toString('base64'),
    ].map(v => esc(String(v))).join(',')
  )
  fs.writeFileSync(path.join(output, 'cats.csv'), [header.join(','), ...rows].join('\n'))
}

// ── TXT ───────────────────────────────────────────────────────────────────────

function writeTxt(cats: CatFixture[], output: string): void {
  const border = '═'.repeat(60)
  const content = cats.map(cat => [
    border,
    `  ${cat.name.toUpperCase()}  (id: ${cat.id})`,
    border,
    '',
    cat.text,
    '',
  ].join('\n')).join('\n')
  fs.writeFileSync(path.join(output, 'cats.txt'), content)
}

// ── PDF ───────────────────────────────────────────────────────────────────────

async function writePdf(cats: CatFixture[], output: string): Promise<void> {
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const out = fs.createWriteStream(path.join(output, 'cats.pdf'))
  doc.pipe(out)

  const pageWidth = (doc.page.width as number) - 100
  const imgSize = 120

  cats.forEach((cat, i) => {
    if (i > 0) doc.addPage()

    doc.roundedRect(50, 50, pageWidth, 44, 6).fill('#f5f5f5')

    doc
      .fillColor('#333333')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(cat.name, 60, 60, { width: pageWidth - imgSize - 20 })

    doc
      .fillColor('#999999')
      .fontSize(9)
      .font('Helvetica')
      .text(`id: ${cat.id}`, 60, 84)

    doc.image(cat.pngBuffer, 50 + pageWidth - imgSize, 50, { width: imgSize })

    doc.fillColor('#222222').fontSize(11).font('Helvetica').moveDown(4)

    cat.text.split('\n\n').forEach((para, pi, arr) => {
      doc.text(para, 50, undefined, { width: pageWidth, align: 'justify' })
      if (pi < arr.length - 1) doc.moveDown(0.8)
    })

    doc
      .fillColor('#bbbbbb')
      .fontSize(8)
      .text(`${i + 1} / ${cats.length}`, 50, (doc.page.height as number) - 40, {
        align: 'center',
        width: pageWidth,
      })
  })

  doc.end()
  await new Promise<void>((resolve, reject) => {
    out.on('finish', resolve)
    out.on('error', reject)
  })
}

// ── Résumé ────────────────────────────────────────────────────────────────────

function printSummary(cats: CatFixture[], formats: string[], output: string): void {
  console.log(`\nDone! Fichiers dans : ${output}`)
  const fileFormats = formats.filter(f => !['png', 'jpeg'].includes(f))
  fileFormats.forEach(f => console.log(`  cats.${f}`))
  if (formats.includes('png') || formats.includes('jpeg')) {
    console.log(`  images/  (${cats.length} fichier(s))`)
  }
}
