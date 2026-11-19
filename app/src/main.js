// Wires the Vice Panels editor: photos, layout, grade, caption, export.
// A `?shot=` query sets up a fixed scene for a screenshot (./shots.js).
import { drawCover } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');

const state = {
  layout: 'hero',
  grade: 'sunset',
  caption: 'VICE HEIST',
  tagline: 'VICE CITY · 2026',
  capSize: 100,
  capY: 82,
  photos: [null, null, null],
  panels: [{ zoom: 1, dx: 0, dy: 0 }, { zoom: 1, dx: 0, dy: 0 }, { zoom: 1, dx: 0, dy: 0 }, { zoom: 1, dx: 0, dy: 0 }],
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

document.getElementById('samplePier').addEventListener('click', async () => {
  state.photos[0] = await loadImage('samples/pier.jpg');
  state.photos[1] = await loadImage('samples/boulevard.jpg');
  status.textContent = 'Sample photos loaded.';
  redraw();
});
document.getElementById('sampleBoulevard').addEventListener('click', async () => {
  state.photos[0] = await loadImage('samples/boulevard.jpg');
  state.photos[1] = await loadImage('samples/pier.jpg');
  status.textContent = 'Sample photos loaded.';
  redraw();
});

bind('layout', (el) => { state.layout = el.value; });
bind('grade', (el) => { state.grade = el.value; });
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

document.getElementById('export').addEventListener('click', () => {
  const [w, h] = document.getElementById('size').value.split('x').map(Number);
  const off = document.createElement('canvas');
  drawCover(off, state, w, h);
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-panels-${w}x${h}.png`;
    a.click();
    status.textContent = `Saved vice-panels-${w}x${h}.png`;
  }, 'image/png');
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, loadImage, redraw);
} else {
  redraw();
}
