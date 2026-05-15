import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, 'public', 'articles', 'images');

// Usage: node convert-to-webp.mjs [--all | filename1.png filename2.png ...]
//   --all  converts every .png in the images directory
//   specific filenames convert just those

const args = process.argv.slice(2);

let files;
if (args.includes('--all')) {
  files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.png')).map(f => path.join(IMAGES_DIR, f));
} else if (args.length > 0) {
  files = args.map(f => {
    const name = f.replace(/\.png$/i, '') + '.png';
    return path.join(IMAGES_DIR, name);
  });
} else {
  console.log('Usage: node convert-to-webp.mjs [--all | filename1.png ...]');
  process.exit(0);
}

let converted = 0;
let skipped = 0;

for (const pngPath of files) {
  const webpPath = pngPath.replace(/\.png$/i, '.webp');
  const name = path.basename(pngPath, '.png');

  if (!fs.existsSync(pngPath)) {
    console.log(`SKIP ${name}.png (not found)`);
    skipped++;
    continue;
  }

  process.stdout.write(`${name}.png → ${name}.webp ... `);
  await sharp(pngPath)
    .webp({ quality: 90 })
    .toFile(webpPath);
  console.log('done');
  converted++;
}

console.log(`\nConverted: ${converted} | Skipped: ${skipped}`);
