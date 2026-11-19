// Wires the Vice Panels editor: photos, layout, grade, caption, export.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

// The bundled poster font: Anton (SIL OFL, app/fonts/) — loaded from a
// local file, never the network. Canvas titles use it as soon as it is
// ready; until then the fallback keeps the preview working.
const fontReady = (document.fonts
  ? document.fonts.load('100px Anton').catch(() => null)
  : Promise.resolve(null));

// Thirteen original sample photos (generated for this entry): the five comic
// illustration characters first — the Character Hero panel always shows the
// first one — then the three photo characters, then the five scene shots,
// plus the two kit ones on a separate button. The nine-panel grid is
// character-led: at least six of its nine panels are characters, and a
// scene (sunset boulevard) sits in the middle-right panel, where the
// striped sun has sky to live in instead of a face.
export const NEW_SAMPLES = ['ink-queen', 'ink-hawaii', 'ink-duo', 'ink-leather', 'ink-blonde', 'neon-queen', 'hawaii-keys', 'sunset-boulevard', 'beach-couple', 'neon-boardwalk', 'skyline-night', 'classic-car', 'marina-dawn'];

const state = {
  layout: 'charhero',
  grade: 'comic',
  titleStyle: 'poster',
  caption: 'VICE HEIST',
  tagline: 'VICE CITY · 2026',
  capSize: 100,
  capY: 82,
  photos: Array(13).fill(null),
  photoNames: Array(13).fill(''),
  panels: Array.from({ length: 9 }, () => ({ zoom: 1, dx: 0, dy: 0 })),
};

function redraw() {
  drawCover(canvas, state);
  refreshSlots();
}

// The three upload slots always show what is actually loaded in them:
// a thumbnail and the file's name (a sample name or the uploaded file's
// name) — never "No file chosen" while a photo is in the slot. Slots 1–3
// show the first three loaded photos, which the sample buttons fill with
// the character portraits.
function refreshSlots() {
  for (let i = 0; i < 3; i++) {
    const img = document.getElementById(`thumb${i}`);
    const name = document.getElementById(`slotname${i}`);
    const photo = state.photos[i];
    if (img && name) {
      if (photo) {
        img.src = photo.currentSrc || photo.src;
        img.style.display = 'block';
        name.textContent = state.photoNames[i] || `Photo ${i + 1}`;
      } else {
        img.removeAttribute('src');
        img.style.display = 'none';
        name.textContent = 'No photo loaded yet';
      }
    }
  }
  const count = document.getElementById('loadedCount');
  if (count) {
    const n = state.photos.filter(Boolean).length;
    count.textContent = n
      ? `${n} photo${n === 1 ? '' : 's'} loaded — every panel shows a different shot while enough are loaded.`
      : 'No photos loaded yet — load the samples or your own photos.';
  }
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function bind(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', (e) => { fn(e.target); redraw(); });
  return el;
}

[0, 1, 2].forEach((i) => {
  const input = document.getElementById(`photo${i}`);
  const pick = document.querySelector(`.pick[data-for="photo${i}"]`);
  if (pick) pick.addEventListener('click', () => input.click());
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    state.photos[i] = await loadImage(URL.createObjectURL(file));
    state.photoNames[i] = file.name;
    status.textContent = `Photo ${i + 1} loaded: ${file.name}.`;
    redraw();
  });
});

async function loadSamples(names) {
  const loaded = [];
  const namesOut = [];
  for (const name of names) {
    try { loaded.push(await loadImage(`samples/${name}.jpg`)); namesOut.push(`${name}.jpg`); }
    catch { loaded.push(null); namesOut.push(''); }
  }
  return { loaded, namesOut };
}

document.getElementById('sampleNew').addEventListener('click', async () => {
  const { loaded, namesOut } = await loadSamples(NEW_SAMPLES);
  state.photos = loaded;
  state.photoNames = namesOut;
  status.textContent = '13 sample photos loaded: 8 characters (5 comic ink + 3 photo) + 5 scenes.';
  redraw();
});
document.getElementById('sampleKit').addEventListener('click', async () => {
  const { loaded, namesOut } = await loadSamples(['pier', 'boulevard']);
  state.photos = [...loaded, ...Array(11).fill(null)];
  state.photoNames = [...namesOut, ...Array(11).fill('')];
  status.textContent = 'Kit sample photos loaded.';
  redraw();
});

bind('layout', (el) => { state.layout = el.value; });
bind('grade', (el) => { state.grade = el.value; });
bind('titleStyle', (el) => { state.titleStyle = el.value; });
bind('caption', (el) => { state.caption = el.value; });
bind('tagline', (el) => { state.tagline = el.value; });
bind('capSize', (el) => { state.capSize = Number(el.value); });
bind('capY', (el) => { state.capY = Number(el.value); });

const panelSelect = document.getElementById('panel');
bind('zoom', (el) => { state.panels[Number(panelSelect.value)].zoom = Number(el.value) / 100; });
bind('panx', (el) => { state.panels[Number(panelSelect.value)].dx = Number(el.value); });
bind('pany', (el) => { state.panels[Number(panelSelect.value)].dy = Number(el.value); });
panelSelect.addEventListener('change', () => {
  const p = state.panels[Number(panelSelect.value)];
  document.getElementById('zoom').value = Math.round(p.zoom * 100);
  document.getElementById('panx').value = p.dx;
  document.getElementById('pany').value = p.dy;
});

const SIZES = [[1080, 1080], [1080, 1350], [1920, 1080]];

function downloadCover(w, h) {
  return new Promise((resolve) => {
    const off = document.createElement('canvas');
    drawCover(off, state, w, h);
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-panels-${w}x${h}.png`;
      a.click();
      resolve();
    }, 'image/png');
  });
}

document.getElementById('export').addEventListener('click', async () => {
  const [w, h] = document.getElementById('size').value.split('x').map(Number);
  await fontReady;
  await downloadCover(w, h);
  status.textContent = `Saved vice-panels-${w}x${h}.png`;
});

document.getElementById('exportAll').addEventListener('click', async () => {
  await fontReady;
  for (const [w, h] of SIZES) {
    await downloadCover(w, h);
    // Stagger the downloads so the browser keeps all three.
    await new Promise((r) => setTimeout(r, 350));
  }
  status.textContent = 'Saved all 3 sizes: 1080×1080, 1080×1350, 1920×1080.';
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, loadImage, redraw, fontReady);
} else {
  // Default scene: the thirteen samples, comic characters first, so the first
  // paint already shows the Character Hero cover instead of empty panels.
  // Wait for the font so the first paint already uses Anton, not the fallback.
  Promise.all([fontReady, loadSamples(NEW_SAMPLES)]).then(([, { loaded, namesOut }]) => {
    state.photos = loaded;
    state.photoNames = namesOut;
    redraw();
  });
  redraw();
}
