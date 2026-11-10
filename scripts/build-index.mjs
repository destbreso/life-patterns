// The index of every pattern in patterns/, one entry each, from what its file says (scripts/patterns.mjs) and what it
// was found to do when run (index/behaviour.json, by scripts/classify.mjs, taken only while the file is the one that
// was run), written to index/patterns.json. `--check` writes nothing and fails when the index on disk is not what the
// files give, which is what CI runs.
//
//   node scripts/build-index.mjs [--check]

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { readPattern } from "./patterns.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const SETS = readdirSync(join(ROOT, "patterns"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const BEHAVIOUR = join(ROOT, "index", "behaviour.json");
const ran = existsSync(BEHAVIOUR) ? JSON.parse(readFileSync(BEHAVIOUR, "utf8")) : {};

const entries = [];
for (const set of SETS) {
  const dir = join(ROOT, "patterns", set);
  const files = readdirSync(dir).filter((f) => /\.(rle|cells)$/.test(f));
  const rle = new Set(files.filter((f) => f.endsWith(".rle")).map((f) => basename(f, ".rle")));
  for (const file of files.sort()) {
    const ext = extname(file).slice(1);
    const base = basename(file, `.${ext}`);
    // (a pattern given in both forms is indexed once, by its RLE)
    if (ext === "cells" && rle.has(base)) continue;
    const text = readFileSync(join(dir, file), "utf8");
    const p = readPattern(text, ext);
    const id = `${set}/${base}`;
    const hash = createHash("sha1").update(text).digest("hex").slice(0, 12);
    const does = ran[id]?.hash === hash ? ran[id].does : undefined;
    const wiki = p.notes.find((n) => /conwaylife\.com\/wiki/.test(n));
    const about = p.notes.find((n) => !/^(https?:\/\/|www\.)/.test(n));
    entries.push({
      id,
      file: `patterns/${set}/${file}`,
      // (some files give their own file name as their name)
      name: (p.name ?? base).replace(/\.(rle|cells)$/i, ""),
      ...(p.author ? { author: p.author } : {}),
      ...(about ? { about } : {}),
      rule: p.rule,
      width: p.width,
      height: p.height,
      cells: p.cells,
      ...(/_synth$/.test(base) ? { synthesis: true } : {}),
      ...(wiki ? { wiki: wiki.startsWith("http") ? wiki : `https://${wiki}` } : {}),
      ...(does ? { does } : {}),
    });
  }
}

const out = JSON.stringify({ count: entries.length, sets: SETS, patterns: entries }, null, 0).replace(/\},\{/g, "},\n{") + "\n";
const target = join(ROOT, "index", "patterns.json");
if (process.argv.includes("--check")) {
  const now = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (now !== out) {
    console.error("index/patterns.json is not what the files in patterns/ give: run `npm run index` and commit it.");
    process.exit(1);
  }
  console.log(`index up to date: ${entries.length} patterns`);
} else {
  writeFileSync(target, out);
  console.log(`index/patterns.json: ${entries.length} patterns in ${SETS.length} sets (${SETS.join(", ")})`);
}
