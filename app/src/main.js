// Wires the Vice Panels editor: photos, layout, grade, caption, export.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

// Nine original sample photos (generated for this entry): three character
// portraits first — the Character Hero panel always shows the first one —
// then the six scene shots, plus the two kit ones on a separate button.
export const NEW_SAMPLES = ['neon-queen', 'hawaii-keys', 'duo-skyline', 'sunset-boulevard', 'neon-boardwalk', 'skyline-night', 'beach-couple', 'classic-car', 'marina-dawn'];

const state = {
  layout: 'charhero',
  grade: 'heat',
  titleStyle: 'poster',
  caption: 'VICE HEIST',
  tagline: 'VICE CITY · 2026',
  capSize: 100,
  capY: 82,
  photos: [null, null, null, null, null, null, null, null, null],
  panels: Array.from({ length: 9 }, () => ({ zoom: 1, dx: 0, dy: 0 })),
};

function redraw() {
  drawCover(canvas, state);
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
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    state.photos[i] = await loadImage(URL.createObjectURL(file));
    status.textContent = `Photo ${i + 1} loaded.`;
    redraw();
  });
});

async function loadSamples(names) {
  const loaded = [];
  for (const name of names) {
    try { loaded.push(await loadImage(`samples/${name}.jpg`)); }
    catch { loaded.push(null); }
  }
  return loaded;
}

document.getElementById('sampleNew').addEventListener('click', async () => {
  state.photos = await loadSamples(NEW_SAMPLES);
  status.textContent = '9 sample photos loaded: 3 characters + 6 scenes.';
  redraw();
});
document.getElementById('sampleKit').addEventListener('click', async () => {
  const [pier, boulevard] = await loadSamples(['pier', 'boulevard']);
  state.photos = [pier, boulevard, null, null, null, null, null, null, null];
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
  await downloadCover(w, h);
  status.textContent = `Saved vice-panels-${w}x${h}.png`;
});

document.getElementById('exportAll').addEventListener('click', async () => {
  for (const [w, h] of SIZES) {
    await downloadCover(w, h);
    // Stagger the downloads so the browser keeps all three.
    await new Promise((r) => setTimeout(r, 350));
  }
  status.textContent = 'Saved all 3 sizes: 1080×1080, 1080×1350, 1920×1080.';
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, loadImage, redraw);
} else {
  // Default scene: the nine samples, characters first, so the first paint
  // already shows the Character Hero cover instead of empty panels.
  loadSamples(NEW_SAMPLES).then((photos) => { state.photos = photos; redraw(); });
  redraw();
}
