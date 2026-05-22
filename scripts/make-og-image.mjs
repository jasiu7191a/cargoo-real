import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";

const SRC = "C:/Users/jasiu/OneDrive/Pulpit/Cargoo/ChatGPT Image 19 mar 2026, 15_03_18.png";
const OUT_JPG = "public/assets/images/og-image.jpg";
const OUT_SQUARE = "public/assets/images/og-image-square.jpg";

const src = readFileSync(SRC);

const meta = await sharp(src).metadata();
const bgPixel = await sharp(src).extract({ left: 0, top: 0, width: 4, height: 4 }).raw().toBuffer();
const bg = { r: bgPixel[0], g: bgPixel[1], b: bgPixel[2] };
console.log("Source:", meta.width, "x", meta.height, "| bg:", bg);

const innerSize = 600;
const resized = await sharp(src)
  .resize(innerSize, innerSize, { fit: "contain", background: bg })
  .toBuffer();

await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: bg,
  },
})
  .composite([{ input: resized, gravity: "center" }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(OUT_JPG);

await sharp(src).resize(1024, 1024).jpeg({ quality: 92, mozjpeg: true }).toFile(OUT_SQUARE);

console.log("wrote", OUT_JPG, "and", OUT_SQUARE);
