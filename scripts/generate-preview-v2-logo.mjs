import sharp from "sharp";

const source = "public/assets/brand/logo-selected.png";
const output = "public/preview-v2/assets/logo-official-transparent.png";
const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const alpha = new Uint8Array(info.width * info.height).fill(255);
const visited = new Uint8Array(info.width * info.height);
const queue = new Int32Array(info.width * info.height);
let head = 0;
let tail = 0;

function isBackground(index) {
  const offset = index * 3;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  return (red + green + blue) / 3 >= 190 && maximum - minimum <= 34;
}

function enqueue(index) {
  if (!visited[index] && isBackground(index)) {
    visited[index] = 1;
    queue[tail++] = index;
  }
}

for (let x = 0; x < info.width; x += 1) {
  enqueue(x);
  enqueue((info.height - 1) * info.width + x);
}
for (let y = 0; y < info.height; y += 1) {
  enqueue(y * info.width);
  enqueue(y * info.width + info.width - 1);
}

while (head < tail) {
  const index = queue[head++];
  alpha[index] = 0;
  const x = index % info.width;
  const y = Math.floor(index / info.width);
  if (x > 0) enqueue(index - 1);
  if (x + 1 < info.width) enqueue(index + 1);
  if (y > 0) enqueue(index - info.width);
  if (y + 1 < info.height) enqueue(index + info.width);
}

const rgba = Buffer.alloc(info.width * info.height * 4);
for (let index = 0; index < alpha.length; index += 1) {
  const sourceOffset = index * 3;
  const targetOffset = index * 4;
  const x = index % info.width;
  const red = data[sourceOffset];
  const green = data[sourceOffset + 1];
  const blue = data[sourceOffset + 2];
  const brightness = (red + green + blue) / 3;
  const isWordmark = x >= 300;
  const tealWordmark = isWordmark && green - red > 18 && green > 75 && brightness < 190;
  const navyWordmark = isWordmark && blue - red > 14 && brightness < 172;
  const darkWordmarkEdge = isWordmark && brightness < 92;
  const wordmarkContent = tealWordmark || navyWordmark || darkWordmarkEdge;
  rgba[targetOffset] = navyWordmark ? 244 : red;
  rgba[targetOffset + 1] = navyWordmark ? 250 : green;
  rgba[targetOffset + 2] = navyWordmark ? 252 : blue;
  rgba[targetOffset + 3] = isWordmark ? (wordmarkContent ? 255 : 0) : alpha[index];
}

await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(output);
