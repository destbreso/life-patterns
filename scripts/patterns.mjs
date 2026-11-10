// Reading a pattern file, RLE or plaintext (.cells), for the index: what its header and comments say, its size and its
// live cells. No dependencies: a file is read as it is, never rewritten.

/** a rule as written in a file, the usual way round: "23/3" and "b3/s23" are both "B3/S23" */
export function normalizeRule(rule) {
  if (!rule) return "B3/S23";
  const [core, ...topology] = rule.trim().split(":");
  const tail = topology.length ? `:${topology.join(":")}` : "";
  const bs = /^b(\d*)\/s(\d*)$/i.exec(core);
  if (bs) return `B${bs[1]}/S${bs[2]}${tail}`;
  const sb = /^(\d*)\/(\d*)$/.exec(core);
  if (sb) return `B${sb[2]}/S${sb[1]}${tail}`;
  return core + tail;
}

/** the live cells of an RLE body (any state but dead counts as alive, as a two-state reading would) and the box they
 *  fill; whitespace inside the body is ignored, as RLE says */
function readRle(body) {
  let n = 0,
    run = "",
    x = 0,
    y = 0,
    w = 0,
    h = 0;
  for (const ch of body) {
    if (ch === " " || ch === "\t") continue;
    if (ch >= "0" && ch <= "9") {
      run += ch;
      continue;
    }
    if (ch === "!") break;
    const k = run ? Number(run) : 1;
    run = "";
    if (ch === "$") {
      y += k;
      x = 0;
      continue;
    }
    // (Golly's prefix letters for states above 24 come before the state's own letter: the pair is one cell)
    if (/[p-y]/.test(ch)) continue;
    if (ch !== "b" && ch !== "." && /[a-zA-Z]/.test(ch)) {
      n += k;
      w = Math.max(w, x + k);
      h = Math.max(h, y + 1);
    }
    x += k;
  }
  return { cells: n, width: w, height: h };
}

/** What a pattern file says about itself: name, author, notes, rule, size, live cells. */
export function readPattern(text, ext) {
  const lines = text.split(/\r?\n/);
  const notes = [];
  let name = null,
    author = null;
  if (ext === "cells") {
    let width = 0,
      height = 0,
      cells = 0;
    for (const l of lines) {
      if (l.startsWith("!")) {
        const m = /^!(Name|Author):\s*(.*)$/.exec(l);
        if (m) m[1] === "Name" ? (name = m[2].trim()) : (author = m[2].trim());
        else if (l.slice(1).trim()) notes.push(l.slice(1).trim());
        continue;
      }
      if (!l.trim() && !height) continue;
      height++;
      width = Math.max(width, l.trimEnd().length);
      cells += (l.match(/[O*]/g) ?? []).length;
    }
    return { name, author, notes, rule: "B3/S23", width, height, cells };
  }
  let header = null,
    body = "";
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    if (t.startsWith("#")) {
      const tag = t[1],
        rest = t.slice(2).trim();
      if (tag === "N") name = rest;
      else if (tag === "O") author = rest;
      else if ((tag === "C" || tag === "c") && rest) notes.push(rest);
      continue;
    }
    if (!header && /^x\s*=/.test(t)) {
      header = t;
      continue;
    }
    body += t;
    if (t.includes("!")) break;
  }
  const num = (k) => Number(new RegExp(`${k}\\s*=\\s*(\\d+)`).exec(header ?? "")?.[1] ?? 0);
  const rule = /rule\s*=\s*([^,\s]+)/i.exec(header ?? "")?.[1];
  const r = readRle(body);
  // (a header of 0 by 0, as some patterns for a bounded grid give, says nothing: the cells' box does)
  return { name, author, notes, rule: normalizeRule(rule), width: num("x") || r.width, height: num("y") || r.height, cells: r.cells };
}

/** A pattern file's live cells, from its corner: RLE (LifeHistory's odd states alive, its marks and history dead) or
 *  plaintext. */
export function cellsOf(text, ext) {
  const out = [];
  if (ext === "cells") {
    let y = 0;
    for (const l of text.split(/\r?\n/)) {
      if (l.startsWith("!")) continue;
      if (!l.trim() && !out.length && !y) continue;
      for (let x = 0; x < l.length; x++) if (l[x] === "O" || l[x] === "*") out.push([x, y]);
      y++;
    }
    return out;
  }
  const history = /rule\s*=\s*LifeHistory/i.test(text);
  let body = "";
  for (const l of text.split(/\r?\n/)) {
    const t = l.trim();
    if (!t || t.startsWith("#") || /^x\s*=/.test(t)) continue;
    body += t;
    if (t.includes("!")) break;
  }
  let x = 0,
    y = 0,
    run = "",
    prefix = 0;
  for (const ch of body) {
    if (ch === " " || ch === "\t") continue;
    if (ch >= "0" && ch <= "9") {
      run += ch;
      continue;
    }
    if (ch === "!") break;
    const k = run ? Number(run) : 1;
    run = "";
    if (/[p-y]/.test(ch)) {
      prefix = (ch.charCodeAt(0) - 111) * 24;
      run = String(k === 1 ? "" : k);
      continue;
    }
    if (ch === "$") {
      y += k;
      x = 0;
    } else if (ch === "b" || ch === ".") x += k;
    else {
      const state = ch === "o" ? 1 : /[A-X]/.test(ch) ? ch.charCodeAt(0) - 64 + prefix : 1;
      if (!history || state % 2 === 1) for (let i = 0; i < k; i++) out.push([x + i, y]);
      x += k;
    }
    prefix = 0;
  }
  return out;
}
