import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const artifactsDir = path.resolve("artifacts/preview-v2");
const referencePath = path.join(
  artifactsDir,
  "reference",
  "f84a1562-94ac-43df-b6d2-1d6da1091d06 (2).png",
);
const currentPath = path.join(artifactsDir, "current.png");
const diffPath = path.join(artifactsDir, "diff.png");
const sideBySidePath = path.join(artifactsDir, "side-by-side.png");
const overlayPath = path.join(artifactsDir, "overlay.png");
const normalizedReferencePath = path.join(artifactsDir, "reference.png");
const metricsPath = path.join(artifactsDir, "comparison-metrics.json");

await mkdir(artifactsDir, { recursive: true });
await Promise.all([access(referencePath), access(currentPath)]);

const referenceMetadata = await sharp(referencePath).metadata();
const width = referenceMetadata.width;
const height = referenceMetadata.height;

if (!width || !height) throw new Error("Reference image does not have valid dimensions.");

const normalize = (input) =>
  sharp(input)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

const [reference, current] = await Promise.all([normalize(referencePath), normalize(currentPath)]);
const diff = Buffer.alloc(reference.data.length);
let absoluteError = 0;
let changedPixels = 0;

for (let pixel = 0; pixel < width * height; pixel += 1) {
  let pixelDelta = 0;
  for (let channel = 0; channel < 3; channel += 1) {
    const index = pixel * 3 + channel;
    const delta = Math.abs(reference.data[index] - current.data[index]);
    absoluteError += delta;
    pixelDelta = Math.max(pixelDelta, delta);
    diff[index] = Math.min(255, delta * 3);
  }
  if (pixelDelta > 16) changedPixels += 1;
}

await sharp(diff, { raw: { width, height, channels: 3 } }).png().toFile(diffPath);

const [referencePng, currentPng] = await Promise.all([
  sharp(referencePath).resize(width, height, { fit: "fill" }).png().toBuffer(),
  sharp(currentPath).resize(width, height, { fit: "fill" }).png().toBuffer(),
]);

await sharp(referencePng).png().toFile(normalizedReferencePath);

await sharp(referencePng)
  .composite([{ input: currentPng, left: 0, top: 0, blend: "over", opacity: 0.5 }])
  .png()
  .toFile(overlayPath);

await sharp({
  create: { width: width * 2, height, channels: 3, background: "#ffffff" },
})
  .composite([
    { input: referencePng, left: 0, top: 0 },
    { input: currentPng, left: width, top: 0 },
  ])
  .png()
  .toFile(sideBySidePath);

const totalChannels = width * height * 3;
const metrics = {
  reference: path.relative(process.cwd(), referencePath),
  current: path.relative(process.cwd(), currentPath),
  normalizedDimensions: `${width}x${height}`,
  meanAbsoluteError: Number((absoluteError / totalChannels).toFixed(3)),
  similarity: Number((1 - absoluteError / totalChannels / 255).toFixed(4)),
  changedPixelRatio: Number((changedPixels / (width * height)).toFixed(4)),
  diff: path.relative(process.cwd(), diffPath),
  sideBySide: path.relative(process.cwd(), sideBySidePath),
  overlay: path.relative(process.cwd(), overlayPath),
};

await writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
console.log(JSON.stringify(metrics, null, 2));
