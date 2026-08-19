import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const sizes = [192, 512];
const svgBuffer = readFileSync(join(process.cwd(), 'public', 'favicon.svg'));

async function generate() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(process.cwd(), 'public', `pwa-${size}x${size}.png`));
    console.log(`Generated pwa-${size}x${size}.png`);
  }
}

generate().catch(console.error);
