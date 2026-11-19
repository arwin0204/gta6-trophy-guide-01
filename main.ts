// Vice Legends — GTA VI trophy guide, entry program (Node 22, standard library only).
// This program hands the guide in: it copies the static app/ and the screenshots/
// from beside this file into the output directory and writes dossier.json there,
// the summary the judge reads, built with the vendored make.fun library.
// The library must stay exactly as the kit ships it: the scorer rebuilds the
// dossier with its own copy and compares the two byte for byte.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');
if (!existsSync(join(appDir, 'index.html'))) {
  throw new Error('app/index.html is missing: the guide cannot be handed in without it.');
}
// The gate holds the guide to the official 55, so refuse a data file that is
// short, unreadable or malformed instead of handing in a broken entry.
const trophyData = JSON.parse(readFileSync(join(appDir, 'data', 'trophies.json'), 'utf8'));
const trophyList = Array.isArray(trophyData) ? trophyData : trophyData.trophies;
if (!Array.isArray(trophyList) || trophyList.length !== 55) {
  throw new Error(`app/data/trophies.json must hold 55 trophies, found ${Array.isArray(trophyList) ? trophyList.length : 'none'}.`);
}
for (const trophy of trophyList) {
  if (typeof trophy.name !== 'string' || !trophy.name.trim() || typeof trophy.guide !== 'string' || !trophy.guide.trim()) {
    throw new Error('Every trophy in app/data/trophies.json needs a name and a non-blank guide.');
  }
}
const shots = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => !f.startsWith('.')) : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}.`);
}

mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files:
// app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(`Vice Legends handed in: ${trophyList.length} trophies, app/ + ${shots.length} screenshots -> ${out}`);
