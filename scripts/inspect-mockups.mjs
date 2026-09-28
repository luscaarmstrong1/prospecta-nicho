import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// We can use sharp (already in package.json overrides / node_modules) or image-size
async function inspectImages() {
  const sharp = (await import("sharp")).default;
  const mockupsDir = "artifacts/preview-v2/mockups-drive";
  const files = fs.readdirSync(mockupsDir).filter(f => f.endsWith(".png") || f.endsWith(".webp"));

  console.log("=== MOCKUP DRIVE FILES ===");
  for (const f of files) {
    const full = path.join(mockupsDir, f);
    const meta = await sharp(full).metadata();
    console.log(`${f} -> ${meta.width}x${meta.height} (ratio ${(meta.width / meta.height).toFixed(3)})`);
  }
}

inspectImages().catch(console.error);
