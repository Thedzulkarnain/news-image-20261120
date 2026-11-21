import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, "art.png");
const outDir = "/output";
const dest = join(outDir, "entry.png");

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

mkdirSync(outDir, { recursive: true });

const original = readFileSync(src);
if (original.length === 0) throw new Error("art.png is empty");
if (!original.subarray(0, 8).equals(PNG_SIG)) throw new Error("art.png is not a PNG");

copyFileSync(src, dest);

const copied = readFileSync(dest);
if (copied.length !== original.length) throw new Error("size mismatch after copy");
if (copied.length === 0) throw new Error("entry.png is empty");
if (!copied.subarray(0, 8).equals(PNG_SIG)) throw new Error("entry.png is not a PNG");
if (!copied.equals(original)) throw new Error("entry.png is not byte-identical to art.png");
// IHDR: bytes 16-19 width, 20-23 height, big-endian
const width = copied.readUInt32BE(16);
const height = copied.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}

console.log(`wrote ${dest} (${copied.length} bytes)`);
