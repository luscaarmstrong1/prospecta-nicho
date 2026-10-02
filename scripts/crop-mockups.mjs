import sharp from "sharp";
import fs from "node:fs";

const pages = [
  { slide: "slide_1080p_1.png", name: "solucoes" },
  { slide: "slide_1080p_2.png", name: "segmentos" },
  { slide: "slide_1080p_3.png", name: "planos" },
  { slide: "slide_1080p_4.png", name: "conteudo" },
  { slide: "slide_1080p_5.png", name: "sobre" },
];

async function cropMockups() {
  const dir = "artifacts/preview-v2/mockups-drive";
  const outDir = "artifacts/visual-diff/references";
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const item of pages) {
    const inputPath = `${dir}/${item.slide}`;
    const outputPath = `${outDir}/${item.name}_ref.png`;
    
    // In slide_1080p_* (1920x1080 modal), the central page design is at:
    // Left: 654px, Top: 118px, Width: 594px, Height: 884px (roughly 1:1.48 aspect ratio preview)
    // Let's extract the clean design area
    console.log(`Extracting clean mockup for ${item.name}...`);
    await sharp(inputPath)
      .extract({ left: 654, top: 118, width: 594, height: 884 })
      .toFile(outputPath);
  }
  console.log("All clean reference extractions completed!");
}

cropMockups().catch(console.error);
