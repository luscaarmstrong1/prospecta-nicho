import sharp from "sharp";
import fs from "fs";

const imagesToOptimize = [
  {
    input: "public/assets/prospecta-web/service-section-bg-final.png",
    outputWebp: "public/assets/prospecta-web/service-section-bg-final.webp",
    quality: 86,
  },
  {
    input: "public/assets/prospecta-web/final-cta-bg.png",
    outputWebp: "public/assets/prospecta-web/final-cta-bg.webp",
    quality: 86,
  },
  {
    input: "public/preview-v2/assets/segment-comercios-v2.png",
    outputWebp: "public/preview-v2/assets/segment-comercios-v2.webp",
    quality: 86,
  },
  {
    input: "public/preview-v2/assets/office-meeting-team.png",
    outputWebp: "public/preview-v2/assets/office-meeting-team.webp",
    quality: 86,
  },
  {
    input: "public/preview-v2/assets/earth-brazil-space.png",
    outputWebp: "public/preview-v2/assets/earth-brazil-space.webp",
    quality: 86,
  },
  {
    input: "public/preview-v2/assets/industry-factory.png",
    outputWebp: "public/preview-v2/assets/industry-factory.webp",
    quality: 86,
  },
  {
    input: "public/preview-v2/assets/solar-energy.png",
    outputWebp: "public/preview-v2/assets/solar-energy.webp",
    quality: 86,
  },
  {
    input: "public/preview-v2/assets/finance-accounting.png",
    outputWebp: "public/preview-v2/assets/finance-accounting.webp",
    quality: 86,
  },
  {
    input: "public/preview-v2/assets/healthcare-hospital.png",
    outputWebp: "public/preview-v2/assets/healthcare-hospital.webp",
    quality: 86,
  },
  {
    input: "public/preview-v2/assets/server-datacenter.png",
    outputWebp: "public/preview-v2/assets/server-datacenter.webp",
    quality: 86,
  },
  {
    input: "public/assets/brand/logo-pn-final-dark.png",
    outputWebp: "public/assets/brand/logo-pn-final-dark.webp",
    quality: 90,
  },
  {
    input: "public/assets/brand/logo-pn-final-light.png",
    outputWebp: "public/assets/brand/logo-pn-final-light.webp",
    quality: 90,
  },
];

async function main() {
  for (const item of imagesToOptimize) {
    if (!fs.existsSync(item.input)) {
      console.warn(`File not found: ${item.input}`);
      continue;
    }
    const inputStat = fs.statSync(item.input);
    console.log(`Optimizing: ${item.input} (${Math.round(inputStat.size / 1024)} KB)...`);
    await sharp(item.input)
      .webp({ quality: item.quality, effort: 6 })
      .toFile(item.outputWebp);
    const outputStat = fs.statSync(item.outputWebp);
    console.log(
      ` -> Generated ${item.outputWebp} (${Math.round(outputStat.size / 1024)} KB) [${Math.round(
        (1 - outputStat.size / inputStat.size) * 100
      )}% reduction]`
    );
  }
}

main().catch(console.error);
