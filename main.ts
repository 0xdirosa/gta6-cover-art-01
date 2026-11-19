// VICE PANELS v2 — a gta6-cover-art-01 entry (Node 22, standard library only).
// The program hands the app in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json with the vendored
// make.fun library, so the judge reads the app's source and screenshots.
// The app itself is plain static files a desktop browser loads offline
// (app/index.html and its ES modules, no library, no network request).
// It makes multi-panel Vice City style covers from the user's own photos:
// six layouts (incl. an angled 5-panel grid and a 3x3 nine-panel grid),
// six colour grades (incl. a Heatwave gradient-map, a Poster Ink comic
// halftone shader and a split-tone grade), six original sample photos,
// a neon-script or gradient-block title with halftone dots, per-panel
// zoom/pan/crop, and one-click PNG export in all three post sizes.
// A striped retro sun replaces the old painted sun blob.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Refuse to hand in a broken entry: the gate allows at most 4 screenshots.
const shotDir = join(here, 'screenshots');
const shots = existsSync(shotDir) ? readdirSync(shotDir).filter((f) => !f.startsWith('.')) : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shotDir)) cpSync(shotDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
