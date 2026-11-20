# VICE PANELS — Make GTA 6 Cover Art

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/0xdirosa/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/0xdirosa/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline cover maker that turns any photo into a GTA 6-style poster:
**VICE PANELS** — "VICE HEIST", tagline "VICE CITY 2026".

## What it does

- **7 layouts** — Character Hero (default: one big character panel plus four
  small ones), Nine 3×3, Angled 5 (tilted panels), Duo Split, Triptych,
  Wide Banner, Vertical Strip. Every layout works at 1080×1080, 1080×1350
  and 1920×1080.
- **8 real canvas grades** — Comic Ink (posterize + Sobel edge ink +
  halftone dots, turns any photo into comic art), Heatwave (warm
  gradient-map), Poster Ink, Split Tone, Neon, Sunset, Noir, Vivid.
- **13 samples included** — five comic-ink illustrated characters, three
  photorealistic characters and five Vice City scenes, all generated for
  this entry. The Nine grid is character-led: characters fill the top rows,
  scenes fill the rest, and a face never repeats while enough photos exist.
- **Any photo works** — three upload slots with thumbnail and file name,
  drag a panel to pan it, scroll to zoom it. Comic Ink makes an ordinary
  phone photo look like cover art.
- **One-click export** — PNG in all three post sizes at once
  (1080×1080, 1080×1350, 1920×1080).
- **Scene-aware retro sun** — the striped sun only ever sits in the sky of
  the topmost scene panel. It never covers a face.
- **Fitted Anton title** — the bundled Anton font (SIL OFL, see
  `app/fonts/OFL.txt`) auto-fits the title at every size; the tagline sits
  on a dark scrim.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network, no dependencies — plain static files
(`app/index.html` plus its ES modules).

## Build the submission bundle

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` into the output directory and writes `dossier.json`, the
summary the judge reads.

## Screenshots

1. `1-cover.jpg` — Character Hero, Comic Ink, 1280×1280
2. `2-editor.jpg` — the editor with the Nine grid, 1280×720
3. `3-cover.jpg` — Nine, portrait, 1024×1280
4. `4-cover.jpg` — Character Hero, wide, 1280×720

## Try it on make.fun

Use referral code **`e1r32wxx`** when you sign up at
[make.fun](https://make.fun/bounty/gta6-cover-art-01).

## Credits

- Entry by [@mbethik](https://github.com/0xdirosa) — repo
  [0xdirosa/gta6-cover-art-01](https://github.com/0xdirosa/gta6-cover-art-01).
- Anton font: Copyright 2020 The Anton Project Authors, licensed under the
  SIL Open Font License 1.1 (`app/fonts/OFL.txt`).
- An unofficial fan-made cover maker. Not affiliated with Rockstar Games.
  No Rockstar artwork, logos or fonts are used.
