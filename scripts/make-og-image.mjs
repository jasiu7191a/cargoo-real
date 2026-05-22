import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const SRC = "C:/Users/jasiu/OneDrive/Pulpit/Cargoo/ChatGPT Image 19 mar 2026, 15_03_18.png";
const OUT_JPG = "public/assets/images/og-image.jpg";
const OUT_PNG = "public/assets/images/og-image.png";
const OUT_SQUARE = "public/assets/images/og-image-square.jpg";

const src = readFileSync(SRC);

const meta = await sharp(src).metadata();
const bgPixel = await sharp(src).extract({ left: 0, top: 0, width: 4, height: 4 }).raw().toBuffer();
const bg = { r: bgPixel[0], g: bgPixel[1], b: bgPixel[2] };
console.log("Source:", meta.width, "x", meta.height, "| bg:", bg);

// Trim transparent/uniform borders so the orange box fills more of the OG card,
// then scale to ~614 px (close to the 630 canvas height) using Lanczos3.
const trimmed = await sharp(src)
  .trim({ background: { r: bg.r, g: bg.g, b: bg.b, alpha: 1 }, threshold: 10 })
  .toBuffer();

const innerSize = 614;
const resized = await sharp(trimmed)
  .resize(innerSize, innerSize, {
    fit: "contain",
    background: bg,
    kernel: "lanczos3",
  })
  .toBuffer();

await sharp({
  create: { width: 1200, height: 630, channels: 3, background: bg },
})
  .composite([{ input: resized, gravity: "center" }])
  .jpeg({ quality: 96, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(OUT_JPG);

await sharp({
  create: { width: 1200, height: 630, channels: 3, background: bg },
})
  .composite([{ input: resized, gravity: "center" }])
  .png({ compressionLevel: 9, palette: false })
  .toFile(OUT_PNG);

await sharp(src)
  .resize(1024, 1024, { kernel: "lanczos3" })
  .jpeg({ quality: 96, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(OUT_SQUARE);

console.log("wrote", OUT_JPG, OUT_PNG, "and", OUT_SQUARE);
