# Nicholas Carlini's circuits

Logic built in the Game of Life from glider and lightweight spaceship streams, by Nicholas Carlini, in his series of five posts (2020 to 2022). He gave permission on 2026-11-25 for his constructions to be used in destbreso.com's simulator, credited with his name and a link to the post each comes from; these files are that simulator's copies.

| Part | Post | What it builds |
|---|---|---|
| 1 | [Digital Logic Gates on Conway's Game of Life](https://nicholas.carlini.com/writing/2020/digital-logic-game-of-life.html) (2020-04-01) | three collisions, NOT, AND, OR, the crossover, the rotator and the duplicator in their input states, and a 4-bit adder |
| 2 | [An Introduction to Circuit Design on Conway's Game of Life](https://nicholas.carlini.com/writing/2020/intro-to-circuits-game-of-life.html) (2020-06-01) | a clock, a rising-edge detector, a latch, a D flip-flop |
| 3 | [Improved Logic Gates on Conway's Game of Life](https://nicholas.carlini.com/writing/2021/improved-logic-gates-game-of-life.html) (2021-03-23) | a spaceship stream, three collisions, the gates again with lightweight spaceships (XOR among them), a compact D flip-flop, a 7-segment display |
| 4 | [A Simple CPU on the Game of Life](https://nicholas.carlini.com/writing/2021/unlimited-register-machine-game-of-life.html) (2021-12-30) | two gates of the CPU (an AND with a copy, a copy with a NOT); the CPU itself is shown in the post only as pictures |

## Where the files come from

Each post builds its demos with its own scripts. Those scripts, run in a sandbox, rebuilt every demo as the post starts it, and each board was checked against his own HashLife, a plain stepper and bgolly 5.0. The 4-bit adder (`p1-adder-4bit.rle`) and the 7-segment display (`p3-7seg-display.rle`) are his Golly macrocell files converted to RLE; each equals, cell for cell, the first frame of the animation at the top of its post, a replay of his Golly run. The cells are his, unchanged; the `#N`, `#O` and the first `#C` line of each file were written here, the other `#C` lines say which post, section and demo it is, and `#CXRLE Pos` keeps its place on his board.

## What was checked

Every one was run in destbreso.com's engine and its behaviour compared with what its post says: the gates' outputs for each of their inputs, the adder's sum (0110 + 0101 settles on 1011 at generation 195,453), the clock, the edge detector, the latch, and the display counting 0 to F. The D flip-flop of Part 2 stores the right bit at its first two clock edges and breaks from the third, a timing race in the board's layout (bgolly gives the same). The details are in destbreso.com's Game of Life roadmap.
