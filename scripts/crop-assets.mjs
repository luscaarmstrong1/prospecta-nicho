import sharp from "sharp";
import fs from "node:fs";

const assetMap = [
  { slide: "slide_1080p_6.png", dest: "city-rio-hero.png" },
  { slide: "slide_1080p_7.png", dest: "network-lines-pattern.png" },
  { slide: "slide_1080p_8.png", dest: "earth-brazil-space.png" },
  { slide: "slide_1080p_9.png", dest: "city-sp-night.png" },
  { slide: "slide_1080p_10.png", dest: "office-meeting-team.png" },
  { slide: "slide_1080p_11.png", dest: "finance-accounting.png" },
  { slide: "slide_1080p_12.png", dest: "solar-energy.png" },
  { slide: "slide_1080p_13.png", dest: "industry-factory.png" },
  { slide: "slide_1080p_14.png", dest: "server-datacenter.png" },
  { slide: "slide_1080p_15.png", dest: "healthcare-hospital.png" },
];

async function cropAssets() {
  const dir = "artifacts/preview-v2/mockups-drive";
  const outDir = "public/preview-v2/assets";

  for (const item of assetMap) {
    const inputPath = `${dir}/${item.slide}`;
    const outputPath = `${outDir}/${item.dest}`;

    // In slide_1080p_* (1920x1080 modal), the central image is placed at roughly:
    // Left: 360px, Top: 120px, Width: 1200px, Height: 880px
    // Let's extract exactly the image area
    console.log(`Cropping ${item.slide} to ${item.dest}...`);
    await sharp(inputPath)
      .extract({ left: 358, top: 118, width: 1204, height: 884 })
      .toFile(outputPath);
  }
  console.log("All asset crops completed!");
}

cropAssets().catch(console.error);
