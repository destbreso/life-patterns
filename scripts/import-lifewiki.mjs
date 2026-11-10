// Brings a set of patterns/ up to date with one of conwaylife.com's downloads: every RLE file as it is, and a .cells
// file only where there is no RLE of the same pattern, with the download's own _README_.txt when it has one (the
// database's gives its compile date). Files the download no longer has are removed. The downloads are made by hand (the
// site does not serve them to scripts) and unzipped; this reads that folder.
//
//   node scripts/import-lifewiki.mjs <unzipped all.zip folder>                 (patterns/lifewiki)
//   node scripts/import-lifewiki.mjs <unzipped oca.zip folder> lifewiki-oca    (patterns/lifewiki-oca)

import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, basename } from "node:path";

const [from, set = "lifewiki"] = process.argv.slice(2);
if (!from || !existsSync(from) || !/^[a-z0-9-]+$/.test(set)) {
  console.error("usage: node scripts/import-lifewiki.mjs <folder of an unzipped download> [set]");
  process.exit(1);
}
const to = new URL(`../patterns/${set}/`, import.meta.url).pathname;
mkdirSync(to, { recursive: true });
const files = readdirSync(from);
const rle = new Set(files.filter((f) => f.endsWith(".rle")).map((f) => basename(f, ".rle")));
const keep = new Set([...(files.includes("_README_.txt") ? ["_README_.txt"] : []), ...files.filter((f) => f.endsWith(".rle") || (f.endsWith(".cells") && !rle.has(basename(f, ".cells"))))]);
for (const f of readdirSync(to)) if (!keep.has(f)) rmSync(join(to, f));
for (const f of keep) copyFileSync(join(from, f), join(to, f));
console.log(`patterns/${set}: ${[...keep].filter((f) => f !== "_README_.txt").length} files (${[...keep].filter((f) => f.endsWith(".rle")).length} RLE, ${[...keep].filter((f) => f.endsWith(".cells")).length} .cells with no RLE)`);
