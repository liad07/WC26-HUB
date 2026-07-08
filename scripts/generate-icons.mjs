import sharp from "sharp";
import toIco from "to-ico";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "assets", "icon-source.png");

async function writePng(buffer, path, size) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(
    path,
    await sharp(buffer).resize(size, size, { fit: "cover" }).png().toBuffer()
  );
}

async function writeMaskable(buffer, path, size) {
  const iconSize = Math.round(size * 0.72);
  const inset = Math.round((size - iconSize) / 2);
  const icon = await sharp(buffer).resize(iconSize, iconSize, { fit: "cover" }).png().toBuffer();
  const canvas = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 7, g: 10, b: 18, alpha: 1 },
    },
  })
    .composite([{ input: icon, left: inset, top: inset }])
    .png()
    .toBuffer();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, canvas);
}

async function main() {
  const buffer = await readFile(source);
  await writePng(buffer, join(root, "app", "icon.png"), 512);
  await writePng(buffer, join(root, "app", "apple-icon.png"), 180);
  await writePng(buffer, join(root, "public", "icons", "icon-192.png"), 192);
  await writePng(buffer, join(root, "public", "icons", "icon-512.png"), 512);
  await writeMaskable(buffer, join(root, "public", "icons", "maskable-512.png"), 512);
  const favicon16 = await sharp(buffer).resize(16, 16).png().toBuffer();
  const favicon32 = await sharp(buffer).resize(32, 32).png().toBuffer();
  const favicon48 = await sharp(buffer).resize(48, 48).png().toBuffer();
  await writeFile(join(root, "public", "favicon.ico"), await toIco([favicon16, favicon32, favicon48]));
  console.log("Icons generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
