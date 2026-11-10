# life-patterns

Game of Life patterns for any page or program to load: LifeWiki's pattern database as it is, the patterns made for [destbreso.com](https://destbreso.com), and one index of all of them, generated from the files.

## What is here

- `patterns/lifewiki/`: conwaylife.com's pattern database (`all.zip`, compiled on 2026-11-07), every RLE file exactly as it comes, and a `.cells` file only where a pattern has no RLE (13 of them). Its own `_README_.txt` is kept beside them.
- `patterns/lifewiki-oca/`: conwaylife.com's other download, about 75 patterns for other cellular automata (`oca.zip`): HighLife, Day & Night, Seeds, Maze, 2x2, Move, Life without Death and others, and a few for rules that are not Life-like (Brian's Brain, non-totalistic and MAP rules). 78 files.
- `patterns/destbreso/`: patterns made for destbreso.com.
- `index/patterns.json`: one entry a pattern, from what its file says: `id`, `file`, `name`, `author`, `about` (its first note), `rule`, `width`, `height`, `cells` (live cells), `synthesis` (a glider synthesis, not the pattern alone) and `wiki` (its LifeWiki page). The rule is written one way, `B3/S23` for Conway's whether a file says `B3/S23`, `b3/s23` or `23/3`; one that is not Life-like stays as its file writes it. 5,112 patterns today.

## Loading a pattern

Pin a tag or a commit and read through jsDelivr, so the files a page loads never change under it:

```text
https://cdn.jsdelivr.net/gh/destbreso/life-patterns@<tag>/index/patterns.json
https://cdn.jsdelivr.net/gh/destbreso/life-patterns@<tag>/<file>
```

`<file>` is the index entry's `file`, URI-encoded: a few names have a space or a plus in them.

## Adding a pattern

Put its RLE in `patterns/destbreso/`, with a `#N` line for its name, `#O` for who made it and when, and `#C` lines saying what it is; run `npm run index` and commit the file and the index together. CI (`npm run check`) fails when the index is not what the files give.

## Updating from LifeWiki

conwaylife.com does not serve its database to scripts, so it is downloaded by hand: open <https://conwaylife.com/patterns/all.zip> (and, for the other automata, the smaller zip LifeWiki's main page links beside it) in a browser, unzip each, then

```sh
npm run import:lifewiki -- <the unzipped all.zip>
npm run import:lifewiki -- <the unzipped oca.zip> lifewiki-oca
npm run index
```

The import copies every file as it is and removes those the database no longer has.

## Credits

Every pattern is the work of the people its file names, and LifeWiki's contributors gathered them; their files are kept unchanged, credits and links included, and the index carries each author and LifeWiki page as the file gives them.

## Limits

The index says what each file says about itself. It does not run the patterns yet: a period, a speed or a claim in a file's notes is the file's, not checked here.
