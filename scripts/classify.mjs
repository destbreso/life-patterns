// What every pattern does, found by running it (scripts/behaviour.mjs), into index/behaviour.json: by file, the file's
// hash and what it does, so only a file that is new or changed is run again. Not run: syntheses (a recipe, not a
// pattern), patterns of more than 5,000 cells, and rules the engine does not run. A run is bounded by generations and
// by time; what is still changing at the end says so.
//
//   node scripts/classify.mjs              (new and changed files)
//   node scripts/classify.mjs --check 40   (runs 40 files again and fails if any answer differs: what CI runs)

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { behaviour } from "./behaviour.mjs";
import { cellsOf } from "./patterns.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const index = JSON.parse(readFileSync(join(ROOT, "index", "patterns.json"), "utf8"));
const target = join(ROOT, "index", "behaviour.json");
const known = existsSync(target) ? JSON.parse(readFileSync(target, "utf8")) : {};

const MAX_CELLS = 5000;
/** generations a pattern is run for, by its size: a small one longer, so long periods show */
const budget = (n) => (n <= 200 ? 2048 : n <= 1000 ? 1024 : 400);
const runnable = (rule) => /^B[1-8]*\/S[0-8]*$/.test(rule) || rule === "LifeHistory";

function classify(p, text) {
  if (p.synthesis || p.cells > MAX_CELLS || !runnable(p.rule)) return null;
  const ext = p.file.endsWith(".cells") ? "cells" : "rle";
  return behaviour(cellsOf(text, ext), p.rule === "LifeHistory" ? "B3/S23" : p.rule, { maxGen: budget(p.cells) });
}

const check = process.argv.indexOf("--check");
if (check >= 0) {
  // (a spread of files, the same each time: every k-th of those with an answer)
  const n = Number(process.argv[check + 1] ?? 40);
  const ids = Object.keys(known).filter((id) => known[id].does).sort();
  const step = Math.max(1, Math.floor(ids.length / n));
  let bad = 0;
  for (let i = 0; i < ids.length; i += step) {
    const p = index.patterns.find((e) => e.id === ids[i]);
    if (!p) continue;
    const got = JSON.stringify(classify(p, readFileSync(join(ROOT, p.file), "utf8")));
    if (got !== JSON.stringify(known[ids[i]].does)) (bad++, console.error(`${ids[i]}: the index says ${JSON.stringify(known[ids[i]].does)}, a run gives ${got}`));
  }
  if (bad) process.exit(1);
  console.log(`behaviour checked again on a spread of ${Math.ceil(ids.length / step)} patterns`);
  process.exit(0);
}

const out = {};
let ran = 0;
const t0 = Date.now();
for (const p of index.patterns) {
  const text = readFileSync(join(ROOT, p.file), "utf8");
  const hash = createHash("sha1").update(text).digest("hex").slice(0, 12);
  if (known[p.id]?.hash === hash) {
    out[p.id] = known[p.id];
    continue;
  }
  const does = classify(p, text);
  out[p.id] = { hash, ...(does ? { does } : {}) };
  ran++;
  if (ran % 250 === 0) console.log(`${ran} run, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
writeFileSync(target, JSON.stringify(out, null, 0).replace(/\},"/g, '},\n"') + "\n");
const kinds = {};
for (const v of Object.values(out)) if (v.does) kinds[v.does.kind] = (kinds[v.does.kind] ?? 0) + 1;
console.log(`index/behaviour.json: ${Object.keys(out).length} patterns, ${ran} run now (${((Date.now() - t0) / 1000).toFixed(0)} s): ${JSON.stringify(kinds)}`);
