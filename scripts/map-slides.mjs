import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function mapSlides() {
  const dir = "artifacts/preview-v2/mockups-drive";
  for (let i = 1; i <= 15; i++) {
    const f = `slide_1080p_${i}.png`;
    const full = path.join(dir, f);
    if (fs.existsSync(full)) {
      const meta = await sharp(full).metadata();
      console.log(`Slide ${i}: ${f} -> ${meta.width}x${meta.height}`);
    }
  }
}

mapSlides().catch(console.error);
