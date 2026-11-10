// Brings patterns/lifewiki/ up to date with conwaylife.com's pattern database: every RLE file as it is, and a .cells
// file only where there is no RLE of the same pattern, with the database's own _README_.txt (its compile date). Files
// the database no longer has are removed. The database is downloaded by hand from https://conwaylife.com/patterns/all.zip
// (the site does not serve it to scripts) and unzipped; this reads that folder.
//
//   node scripts/import-lifewiki.mjs <unzipped all.zip folder>

import { copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, basename } from "node:path";

const from = process.argv[2];
if (!from || !existsSync(join(from, "_README_.txt"))) {
  console.error("usage: node scripts/import-lifewiki.mjs <folder of the unzipped all.zip, with its _README_.txt>");
  process.exit(1);
}
const to = new URL("../patterns/lifewiki/", import.meta.url).pathname;
const files = readdirSync(from);
const rle = new Set(files.filter((f) => f.endsWith(".rle")).map((f) => basename(f, ".rle")));
const keep = new Set(["_README_.txt", ...files.filter((f) => f.endsWith(".rle") || (f.endsWith(".cells") && !rle.has(basename(f, ".cells"))))]);
for (const f of readdirSync(to)) if (!keep.has(f)) rmSync(join(to, f));
for (const f of keep) copyFileSync(join(from, f), join(to, f));
console.log(`patterns/lifewiki: ${keep.size - 1} files (${[...keep].filter((f) => f.endsWith(".rle")).length} RLE, ${[...keep].filter((f) => f.endsWith(".cells")).length} .cells with no RLE)`);
