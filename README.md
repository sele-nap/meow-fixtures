# meow-fixtures

Generate real cat photos + cat ipsum text as test fixtures in multiple formats.

## Installation

```bash
npm install
```

## Scripts

### Development (no build required)

```bash
npm run dev generate
```

### Production

```bash
npm run build
npm run start generate
```

---

## Usage

### Generate all formats (default)

```bash
npm run dev generate
```

Generates 10 cats in all formats into `./output`.

### Options

| Option      | Alias | Default    | Description                                           |
| ----------- | ----- | ---------- | ----------------------------------------------------- |
| `--count`   | `-n`  | `10`       | Number of cats to generate                            |
| `--formats` | `-f`  | `all`      | Comma-separated list of formats (or `all`)            |
| `--output`  | `-o`  | `./output` | Output directory                                      |
| `--seed`    | `-s`  | —          | Random seed for reproducible output                   |
| `--prefix`  | `-p`  | —          | Filename prefix (e.g. `auth` → `auth_cat_001_Luna`)   |
| `--scale`   |       | `3`        | PNG pixel art scale (1 = 10px/pixel, 3 = 30px/pixel)  |
| `--size`    |       | `300`      | JPEG photo size in pixels — square (e.g. `500×500`)   |
| `--dry-run` |       | `false`    | Preview what would be generated without writing files |
| `--watch`   | `-w`  | `false`    | Re-generate on Enter keypress (Ctrl+C to exit)        |

---

## Examples

### Choose the number of cats

```bash
npm run dev generate -- -n 5
npm run dev generate -- -n 100
```

### Choose a single format

```bash
npm run dev generate -- -f png
npm run dev generate -- -f jpeg
npm run dev generate -- -f json
npm run dev generate -- -f csv
npm run dev generate -- -f txt
npm run dev generate -- -f pdf
```

### Choose multiple formats

```bash
npm run dev generate -- -f png,jpeg
npm run dev generate -- -f json,csv
npm run dev generate -- -f txt,pdf
npm run dev generate -- -f png,json,pdf
```

### Choose output directory

```bash
npm run dev generate -- -o ./my-fixtures
npm run dev generate -- -o ./tests/fixtures
```

### Combine options

```bash
npm run dev generate -- -n 20 -f json,csv -o ./fixtures
npm run dev generate -- -n 50 -f png,jpeg -o ./assets/cats
npm run dev generate -- -n 5 -f pdf -o ./docs
```

---

## Output structure

```
output/
  cats.json
  cats.csv
  cats.txt
  cats.pdf
  images/
    cat_001_Luna.png
    cat_001_Luna.jpeg
    cat_002_Mochi.png
    cat_002_Mochi.jpeg
    ...
```

### Format details

| Format  | Content                                                 |
| ------- | ------------------------------------------------------- |
| `png`   | Pixel art cat from the Moon-Cat collection (25 343 IDs) |
| `jpeg`  | Real cat photo fetched from cataas.com                  |
| `json`  | Array of cats with name, text, image path and base64    |
| `csv`   | One cat per row with name, text, image path and base64  |
| `txt`   | Plain text with cat name and cat ipsum paragraphs       |
| `pdf`   | Laid out pages with cat image and cat ipsum text        |
| `sql`   | `CREATE TABLE` + `INSERT` statements                    |
| `md`    | Markdown table + detail sections for each cat           |
| `types` | TypeScript `Cat[]` const with full type definitions     |
