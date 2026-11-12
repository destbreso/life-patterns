# life-patterns

Game of Life patterns for any page or program to load: LifeWiki's pattern database as it is, the patterns made for [destbreso.com](https://destbreso.com), and one index of all of them, generated from the files.

## What is here

- `patterns/lifewiki/`: conwaylife.com's pattern database (`all.zip`, compiled on 2026-11-07), every RLE file exactly as it comes, and a `.cells` file only where a pattern has no RLE (13 of them). Its own `_README_.txt` is kept beside them.
- `patterns/lifewiki-oca/`: conwaylife.com's other download, about 75 patterns for other cellular automata (`oca.zip`): HighLife, Day & Night, Seeds, Maze, 2x2, Move, Life without Death and others, and a few for rules that are not Life-like (Brian's Brain, non-totalistic and MAP rules). 78 files.
- `patterns/destbreso/`: patterns made for destbreso.com, the site's prompt among them, with a gallery in its README.
- `renders/destbreso/`: their pictures, a GIF, a still PNG and an avatar for each (not read by the index).
- `index/patterns.json`: one entry a pattern, from what its file says: `id`, `file`, `name`, `author`, `about` (its first note), `rule`, `width`, `height`, `cells` (live cells), `synthesis` (a glider synthesis, not the pattern alone) and `wiki` (its LifeWiki page). The rule is written one way, `B3/S23` for Conway's whether a file says `B3/S23`, `b3/s23` or `23/3`; one that is not Life-like stays as its file writes it. 5,112 patterns today.
- `does`, in the same entries: what the pattern does, found by running it (`scripts/classify.mjs`, kept by file in `index/behaviour.json` with the file's hash, so a changed file is run again): `still`, `oscillator` with its `period`, `ship` with its `period` and how far it moves (`dx`, `dy`), `gun` with its `period` and the cells it adds each period, `dies` with the generation, or `evolving` when it is still changing at the end of its run; `from` is the generation it settled into that. 4,456 patterns have it today: 2,399 oscillators, 767 still lifes, 333 ships, 224 guns, 58 that die and 675 still changing.

## Loading a pattern

Pin a tag or a commit and read through jsDelivr, so the files a page loads never change under it:

```text
https://cdn.jsdelivr.net/gh/destbreso/life-patterns@<tag>/index/patterns.json
https://cdn.jsdelivr.net/gh/destbreso/life-patterns@<tag>/<file>
```

`<file>` is the index entry's `file`, URI-encoded: a few names have a space or a plus in them.

## Adding a pattern

Put its RLE in `patterns/destbreso/`, with a `#N` line for its name, `#O` for who made it and when, and `#C` lines saying what it is; run `npm run index` (it runs the new pattern too) and commit the file and the index together. CI (`npm run check`) fails when the index is not what the files give, and runs a spread of 40 patterns again to see each still does what the index says.

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

## How a pattern is run

A pattern is run alone on an open plane in its own rule (`scripts/behaviour.mjs`, a plain engine for any Life-like rule, no dependencies), for 2,048 generations when it has up to 200 cells, 1,024 up to 1,000 and 400 up to 5,000, and stops early once its live cells pass 20,000. It is a still life, an oscillator or a ship when a generation's shape comes back, in place or moved; a gun when, over the second half of its run, its population climbs by the same amount every period. On a spread of 303 patterns of up to 100 cells the answers agree with destbreso.com's own analysis (`lib/sim/life/analyze.ts`), the only difference being a name: what settles into a still life after a while is called that here, where the site called it an oscillator of period 1.

## Limits

- Not run: syntheses (recipes of colliding gliders, not patterns), patterns of more than 5,000 cells, and rules the engine does not run (more states, not totalistic, a bounded grid).
- A run has an end: a pattern that settles later, an oscillator of a longer period than its run shows twice, or a gun of a period above 400 is `evolving`, not wrong but not known.
- A pattern that sends out gliders and settles is `evolving` too: its gliders keep the board changing (the R-pentomino is one).
- The rest of an entry is what its file says about itself: a claim in its notes is the file's, not checked here.
