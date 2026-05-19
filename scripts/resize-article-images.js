/**
 * Generates responsive WebP variants for every article cover image.
 * Run: node scripts/resize-article-images.js
 *
 * Input:  public/articles/images/<slug>.webp  (original, 5504×3072)
 * Output: public/articles/images/<slug>-{width}w.webp  for each width below
 *
 * Width rationale (CSS px × device pixel ratio):
 *   320w  — 320px @1x  (small mobile)
 *   640w  — 320px @2x  / 640px @1x  (common Android @2x)
 *   800w  — 400px @2x  / 800px @1x
 *   1200w — 400px @3x  / 600px @2x   (iPhone Pro Max @3x)
 *   1536w — 768px @2x               (iPad @2x)
 *   1920w — 960px @2x  / 1920px @1x  (full-HD desktop)
 *
 * Sharpening: unsharp mask applied after resize to restore detail lost during
 * downscaling. sigma scales with output width — stronger at small sizes where
 * downscaling loses the most detail.
 *
 * Existing originals are preserved unchanged (used by the lightbox).
 * Already-generated variants are skipped unless --force is passed.
 */

import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join, basename, extname } from "path";

const IMAGES_DIR = new URL("../public/articles/images", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const WIDTHS = [320, 640, 800, 1200, 1536, 1920];
const FORCE = process.argv.includes("--force");

// Sharpening sigma per output width — stronger at small sizes where
// downscaling discards the most high-frequency detail.
function sharpenSigma(w) {
  if (w <= 640)  return 0.8;
  if (w <= 800)  return 0.6;
  if (w <= 1200) return 0.5;
  return 0.4;
}

// WebP quality per output width — larger images get slightly higher
// quality since the byte-cost increase is proportionally smaller.
function webpQuality(w) {
  if (w <= 640)  return 83;
  if (w <= 800)  return 84;
  if (w <= 1200) return 85;
  return 86;
}

const files = await readdir(IMAGES_DIR);
const originals = files.filter((f) => /\.webp$/.test(f) && !/-\d+w\.webp$/.test(f));

console.log(`Found ${originals.length} original WebP images. Generating ${WIDTHS.join(", ")}w variants...\n`);
console.log(`Total to generate: up to ${originals.length * WIDTHS.length} files\n`);

let skipped = 0;
let generated = 0;

for (const file of originals) {
  const srcPath = join(IMAGES_DIR, file);
  const slug = basename(file, extname(file));

  for (const w of WIDTHS) {
    const outName = `${slug}-${w}w.webp`;
    const outPath = join(IMAGES_DIR, outName);

    if (!FORCE) {
      try {
        await stat(outPath);
        skipped++;
        continue;
      } catch {
        // file doesn't exist — generate it
      }
    }

    await sharp(srcPath)
      .resize(w, null, { withoutEnlargement: true })
      .sharpen({ sigma: sharpenSigma(w) })
      .webp({ quality: webpQuality(w), effort: 4 })
      .toFile(outPath);

    const { size } = await stat(outPath);
    console.log(`  ✓  ${outName}  (${(size / 1024).toFixed(0)} KB)`);
    generated++;
  }
}

console.log(`\nDone. Generated: ${generated}, Skipped (already exist): ${skipped}`);
console.log("Pass --force to regenerate existing variants.");
