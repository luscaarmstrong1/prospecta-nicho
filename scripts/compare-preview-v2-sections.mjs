import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const artifactsDir = path.resolve("artifacts/preview-v2");
const referenceDir = path.join(artifactsDir, "reference");
const sectionsDir = path.join(artifactsDir, "sections");

const sections = [
  ["hero", "ChatGPT Image 18_09_2026, 09_45_28 (1).png"],
  ["sample", "ChatGPT Image 18_09_2026, 09_45_29 (2).png"],
  ["segments", "ChatGPT Image 18_09_2026, 09_45_30 (3).png"],
  ["plans", "ChatGPT Image 18_09_2026, 09_45_30 (4).png"],
  ["testimonials", "ChatGPT Image 18_09_2026, 09_45_31 (5).png"],
  ["footer", "ChatGPT Image 18_09_2026, 09_45_31 (6).png"],
];

await mkdir(sectionsDir, { recursive: true });

const report = {};

for (const [name, referenceFile] of sections) {
  const referencePath = path.join(referenceDir, referenceFile);
  const currentPath = path.join(sectionsDir, `${name}-current.png`);
  await Promise.all([access(referencePath), access(currentPath)]);

  const [referenceMetadata, currentMetadata] = await Promise.all([
    sharp(referencePath).metadata(),
    sharp(currentPath).metadata(),
  ]);
  const width = referenceMetadata.width;
  const height = referenceMetadata.height;
  const currentWidth = currentMetadata.width;
  const currentHeight = currentMetadata.height;
  if (!width || !height || !currentWidth || !currentHeight) {
    throw new Error(`${name} has invalid image dimensions.`);
  }

  const referenceOutput = path.join(sectionsDir, `${name}-reference.png`);
  const normalizedCurrentOutput = path.join(sectionsDir, `${name}-current-normalized.png`);
  const sideBySideOutput = path.join(sectionsDir, `${name}-side-by-side.png`);
  const overlayOutput = path.join(sectionsDir, `${name}-overlay.png`);
  const diffOutput = path.join(sectionsDir, `${name}-diff.png`);

  const [referencePng, currentPng] = await Promise.all([
    sharp(referencePath).resize(width, height, { fit: "fill" }).removeAlpha().png().toBuffer(),
    sharp(currentPath).resize(width, height, { fit: "fill" }).removeAlpha().png().toBuffer(),
  ]);
  const [referenceRaw, currentRaw] = await Promise.all([
    sharp(referencePng).raw().toBuffer(),
    sharp(currentPng).raw().toBuffer(),
  ]);

  const diff = Buffer.alloc(referenceRaw.length);
  let absoluteError = 0;
  let changedPixels = 0;
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    let pixelDelta = 0;
    for (let channel = 0; channel < 3; channel += 1) {
      const index = pixel * 3 + channel;
      const delta = Math.abs(referenceRaw[index] - currentRaw[index]);
      absoluteError += delta;
      pixelDelta = Math.max(pixelDelta, delta);
      diff[index] = Math.min(255, delta * 3);
    }
    if (pixelDelta > 16) changedPixels += 1;
  }

  await Promise.all([
    sharp(referencePng).toFile(referenceOutput),
    sharp(currentPng).toFile(normalizedCurrentOutput),
    sharp(diff, { raw: { width, height, channels: 3 } }).png().toFile(diffOutput),
    sharp(referencePng)
      .composite([{ input: currentPng, left: 0, top: 0, blend: "over", opacity: 0.5 }])
      .png()
      .toFile(overlayOutput),
    sharp({ create: { width: width * 2, height, channels: 3, background: "#ffffff" } })
      .composite([
        { input: referencePng, left: 0, top: 0 },
        { input: currentPng, left: width, top: 0 },
      ])
      .png()
      .toFile(sideBySideOutput),
  ]);

  const referenceAspectRatio = width / height;
  const currentAspectRatio = currentWidth / currentHeight;
  const totalChannels = width * height * 3;
  report[name] = {
    reference: { width, height, aspectRatio: Number(referenceAspectRatio.toFixed(4)) },
    current: { width: currentWidth, height: currentHeight, aspectRatio: Number(currentAspectRatio.toFixed(4)) },
    aspectRatioDelta: Number(Math.abs(referenceAspectRatio - currentAspectRatio).toFixed(4)),
    meanAbsoluteError: Number((absoluteError / totalChannels).toFixed(3)),
    similarity: Number((1 - absoluteError / totalChannels / 255).toFixed(4)),
    changedPixelRatio: Number((changedPixels / (width * height)).toFixed(4)),
    sideBySide: path.relative(process.cwd(), sideBySideOutput),
    overlay: path.relative(process.cwd(), overlayOutput),
    diff: path.relative(process.cwd(), diffOutput),
  };
}

const metricsPath = path.join(sectionsDir, "section-metrics.json");
await writeFile(metricsPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
