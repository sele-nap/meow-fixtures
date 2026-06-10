# meow-fixtures

Forget boring test data. Your fixtures now come with cats.

## Installation

```bash
npm install
```

## Scripts

```bash
# Development (no build required)
npm run dev generate

# Production
npm run build
npm run start generate
```

---

## Usage

### Generate all formats (default)

```bash
npm run dev generate
```

Generates 1 cat in all formats into `./output`.

### Options

| Option          | Alias | Default    | Description                                             |
| --------------- | ----- | ---------- | ------------------------------------------------------- |
| `--count`       | `-n`  | `1`\*      | Number of cats to generate                              |
| `--formats`     | `-f`  | `all`      | Comma-separated list of formats (or `all`)              |
| `--output`      | `-o`  | `./output` | Output directory                                        |
| `--seed`        | `-s`  | —          | Random seed for reproducible output                     |
| `--prefix`      | `-p`  | —          | Filename prefix (e.g. `auth` → `auth_cat_001_Luna`)     |
| `--scale`       |       | `3`        | PNG pixel art scale (1 = 10px/pixel, 3 = 30px/pixel)    |
| `--size`        |       | `300`      | JPEG photo size in pixels — square (e.g. `500×500`)     |
| `--dry-run`     |       | `false`    | Preview what would be generated without writing files   |
| `--concurrency` |       | `5`        | Number of cataas.com requests to have in flight at once |
| `--no-base64`   |       | `false`    | Omit base64 image data from json/csv/types output       |
| `--watch`       | `-w`  | `false`    | Re-generate on Enter keypress (Ctrl+C to exit)          |

\* `--count` defaults to `2` when `--formats` includes `pdf` (so the PDF has more
than a single page by default).

---

## Examples

### Count

```bash
npm run dev generate -- -n 5
npm run dev generate -- -n 100
```

### Formats

```bash
# Single format
npm run dev generate -- -f png
npm run dev generate -- -f jpeg
npm run dev generate -- -f json
npm run dev generate -- -f csv
npm run dev generate -- -f txt
npm run dev generate -- -f pdf
npm run dev generate -- -f sql
npm run dev generate -- -f md
npm run dev generate -- -f types

# Multiple formats
npm run dev generate -- -f png,jpeg
npm run dev generate -- -f json,csv,sql
npm run dev generate -- -f txt,pdf,md
npm run dev generate -- -f png,json,pdf
```

### Output directory

```bash
npm run dev generate -- -o ./my-fixtures
npm run dev generate -- -o ./tests/fixtures
```

### Seed — reproducible output

Same seed always produces the same cat IDs, names, ipsum text and pixel art (PNG).

```bash
npm run dev generate -- --seed 42
npm run dev generate -- --seed 1337
```

> **Note:** the real cat photo (`jpeg`) is fetched from cataas.com, which
> returns a random photo on every request — it is never reproducible, even
> with `--seed`.

### Prefix — namespaced filenames

```bash
npm run dev generate -- --prefix auth
# → auth_cat_001_Luna.png, auth_cat_002_Oreo.jpeg …

npm run dev generate -- --prefix product
npm run dev generate -- --prefix avatar
```

### Scale — PNG pixel art size

```bash
npm run dev generate -- -f png --scale 1   # 10px per pixel (tiny)
npm run dev generate -- -f png --scale 3   # 30px per pixel (default)
npm run dev generate -- -f png --scale 6   # 60px per pixel (large)
```

### Size — JPEG photo dimensions

```bash
npm run dev generate -- -f jpeg --size 100
npm run dev generate -- -f jpeg --size 300   # default
npm run dev generate -- -f jpeg --size 800
```

### Dry run — preview without writing

```bash
npm run dev generate -- --dry-run
npm run dev generate -- -n 20 -f json,csv --dry-run
```

### Watch mode — regenerate on Enter

```bash
npm run dev generate -- --watch
npm run dev generate -- -n 5 -f png,json --watch
# Press Enter to regenerate, Ctrl+C to exit
```

### Combine options

```bash
npm run dev generate -- -n 20 -f json,csv -o ./fixtures
npm run dev generate -- -n 5 -f png,jpeg --scale 4 --size 500
npm run dev generate -- -n 10 -f pdf,md -o ./docs --seed 99
npm run dev generate -- -n 3 --prefix user -f json,types -o ./tests/fixtures
```

---

## Jpg — download real cat photos

Download standalone real cat photos (JPEG) from cataas.com, no fixtures generated.

```bash
npm run dev jpg
```

Downloads 1 photo into `./output`.

### Options

| Option          | Alias | Default    | Description                                             |
| --------------- | ----- | ---------- | ------------------------------------------------------- |
| `--count`       | `-n`  | `1`        | Number of photos to download                            |
| `--output`      | `-o`  | `./output` | Output directory                                        |
| `--seed`        | `-s`  | —          | Random seed for reproducible filenames (cat names)      |
| `--prefix`      | `-p`  | —          | Filename prefix (e.g. `auth` → `auth_cat_001_Luna.jpg`) |
| `--size`        |       | `300`      | Photo size in pixels — square (e.g. `500×500`)          |
| `--dry-run`     |       | `false`    | Preview what would be downloaded without writing files  |
| `--concurrency` |       | `5`        | Number of cataas.com requests to have in flight at once |

### Examples

```bash
npm run dev jpg -- -n 5
npm run dev jpg -- -n 20 -o ./my-photos
npm run dev jpg -- --size 800
npm run dev jpg -- --seed 42 --prefix avatar
npm run dev jpg -- --dry-run
```

---

## .meowrc.json — default config

Create a `.meowrc.json` at the root of your project to set your own defaults. CLI flags always override it.

```json
{
  "count": 5,
  "formats": "png,json",
  "output": "./tests/fixtures",
  "seed": 42,
  "prefix": "cat",
  "scale": 3,
  "size": 300,
  "concurrency": 5,
  "includeBase64": true
}
```

---

## Programmatic API

```ts
import { generate } from 'meow-fixtures';

await generate({
  count: 5,
  formats: ['json', 'png'],
  output: './fixtures',
  seed: 42,
  prefix: 'user',
  scale: 3,
  size: 300,
  dryRun: false,
});
```

You can also use individual utilities:

```ts
import {
  randomName,
  randomText,
  randomSentence,
  fetchCatPhoto,
  renderPng,
  createRng,
} from 'meow-fixtures';

const rng = createRng(42);
console.log(randomName(rng)); // 'Espresso'
console.log(randomSentence(rng)); // 'Knock glass off table. Watch it fall.'

const { pngBuffer, jpegBuffer } = await fetchCatPhoto(300);
const pixelArt = await renderPng('00d658d50b', 3);
```

---

## Output structure

```
output/
  cats.json
  cats.csv
  cats.txt
  cats.pdf
  cats.sql
  cats.md
  cats.types.ts
  images/
    cat_001_Luna.png       ← pixel art
    cat_001_Luna.jpeg      ← real photo
    cat_002_Oreo.png
    cat_002_Oreo.jpeg
    ...
```

### Format details

| Format  | Content                                                  |
| ------- | -------------------------------------------------------- |
| `png`   | Pixel art cat generated from a pool of 25 343 IDs        |
| `jpeg`  | Real cat photo fetched from cataas.com (not seedable)    |
| `json`  | Array of cats with name, text, image path and base64\*   |
| `csv`   | One cat per row with name, text, image path and base64\* |
| `txt`   | Plain text with cat name and cat ipsum paragraphs        |
| `pdf`   | Laid out pages with cat image and cat ipsum text         |
| `sql`   | `CREATE TABLE` + `INSERT` statements                     |
| `md`    | Markdown table + detail sections for each cat            |
| `types` | TypeScript `Cat[]` const with full type definitions      |

\* Use `--no-base64` to omit the base64 image data (`json`, `csv`, `types`) — useful for large
batches where you only need the file paths.
