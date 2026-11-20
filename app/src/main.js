// VICE PANELS — editor wiring.
// Loads the 13 samples, orders them character-first, lets the person pick a
// layout and a grade, crop and position each panel, edit the caption, upload
// their own photos, and export the cover as a PNG in all three post sizes.
// A `?shot=` query sets up a fixed scene for a screenshot instead (shots.js).
import { drawCover, layoutPanels, LAYOUTS, GRADES } from './cover.js';
import { SHOT_DEFS, applyShot } from './shots.js';

// The thirteen samples this session made: five comic-ink characters, three
// photorealistic characters and five scenes. `char` is the dedup key: one
// character appears in one panel only, so a grid never repeats a face.
export const SAMPLE_DEFS = [
  { file: 'ink-queen.jpg', kind: 'ink', char: 'queen' },
  { file: 'ink-hawaii.jpg', kind: 'ink', char: 'hawaii' },
  { file: 'ink-duo.jpg', kind: 'ink', char: 'duo' },
  { file: 'ink-leather.jpg', kind: 'ink', char: 'leather' },
  { file: 'ink-blonde.jpg', kind: 'ink', char: 'blonde' },
  { file: 'neon-queen.jpg', kind: 'photo', char: 'neonqueen' },
  { file: 'hawaii-keys.jpg', kind: 'photo', char: 'hawaiikeys' },
  { file: 'beach-couple.jpg', kind: 'photo', char: 'beachcouple' },
  { file: 'sunset-boulevard.jpg', kind: 'scene', char: 'boulevard' },
  { file: 'pier-dusk.jpg', kind: 'scene', char: 'pier' },
  { file: 'classic-car.jpg', kind: 'scene', char: 'car' },
  { file: 'marina-dawn.jpg', kind: 'scene', char: 'marina' },
  { file: 'neon-boardwalk.jpg', kind: 'scene', char: 'boardwalk' },
];

export const SIZES = {
  square: { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  wide: { w: 1920, h: 1080, label: 'Wide 1920 × 1080' },
};

const state = {
  layout: 'hero',
  grade: 'comicInk',
  title: 'VICE HEIST',
  tagline: 'VICE CITY 2026',
  size: 'square',
  photos: [],
  views: {},
  selected: 0,
};

const preview = document.getElementById('preview');
const statusEl = document.getElementById('status');
const titleInput = document.getElementById('title');
const taglineInput = document.getElementById('tagline');
const zoomInput = document.getElementById('zoom');
const layoutRow = document.getElementById('layouts');
const gradeRow = document.getElementById('grades');
const sizeRow = document.getElementById('sizes');
const countEl = document.getElementById('sample-count');

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load ' + url));
    img.src = url;
  });
}

// Characters first (ink, then photo), scenes last: a grid reads character-led.
// A shot may pin an exact file order instead (state.fixedOrder).
function orderedPhotos() {
  if (state.fixedOrder && state.fixedOrder.length > 0) {
    const byFile = new Map(state.photos.map((p) => [p.file, p]));
    const out = [];
    for (const file of state.fixedOrder) {
      const photo = byFile.get(file);
      if (photo) out.push(photo);
    }
    for (const photo of state.photos) {
      if (!state.fixedOrder.includes(photo.file)) out.push(photo);
    }
    return out;
  }
  const chars = state.photos.filter((p) => p.kind !== 'scene');
  const scenes = state.photos.filter((p) => p.kind === 'scene');
  return chars.concat(scenes);
}

// One character per panel: drop any later panel that would repeat a face.
function assignPanels(count) {
  const ordered = orderedPhotos();
  const seen = new Set();
  const out = [];
  for (const photo of ordered) {
    if (out.length >= count) break;
    if (photo.char && seen.has(photo.char)) continue;
    seen.add(photo.char);
    out.push(photo);
  }
  let i = 0;
  while (out.length < count && ordered.length > 0) {
    out.push(ordered[i % ordered.length]);
    i++;
  }
  return out;
}

function panelCount() {
  return { hero: 5, nine: 9, angled: 5, duo: 2, triptych: 3, banner: 4, strip: 4 }[state.layout] || 5;
}

function draw() {
  const size = SIZES[state.size];
  if (preview.width !== size.w) preview.width = size.w;
  if (preview.height !== size.h) preview.height = size.h;
  const photos = assignPanels(panelCount());
  drawCover(preview, photos, {
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    tagline: state.tagline,
    views: state.views,
  });
  if (countEl) countEl.textContent = state.photos.length + ' photos loaded — every panel shows a different shot while enough are loaded.';
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function buildPicker(row, items, current, onPick) {
  row.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (item.id === current ? ' active' : '');
    b.textContent = item.label;
    b.addEventListener('click', () => {
      onPick(item.id);
      for (const el of row.querySelectorAll('.pick')) el.classList.remove('active');
      b.classList.add('active');
    });
    row.appendChild(b);
  }
}

function buildPickers() {
  buildPicker(layoutRow, LAYOUTS, state.layout, (id) => {
    state.layout = id;
    state.views = {};
    draw();
  });
  buildPicker(gradeRow, GRADES, state.grade, (id) => {
    state.grade = id;
    draw();
  });
  buildPicker(
    sizeRow,
    Object.keys(SIZES).map((id) => ({ id, label: SIZES[id].label })),
    state.size,
    (id) => {
      state.size = id;
      draw();
    },
  );
}

async function loadSamples() {
  const loaded = [];
  for (const def of SAMPLE_DEFS) {
    try {
      const img = await loadImage('samples/' + def.file);
      loaded.push({ img, kind: def.kind, char: def.char, file: def.file });
    } catch (e) {
      setStatus('Sample missing: ' + def.file);
    }
  }
  state.photos = loaded;
  state.views = {};
  state.fixedOrder = null;
  draw();
  fillSlots();
}

// The three upload slots mirror the first three photos of the loaded set,
// so each slot always shows a thumbnail and a file name; picking a file in
// a slot replaces that photo.
function fillSlots() {
  const slots = document.querySelectorAll('.slot');
  slots.forEach((slot, i) => {
    const photo = state.photos[i];
    const thumb = slot.querySelector('.thumb');
    const name = slot.querySelector('.fname');
    if (!photo) {
      thumb.hidden = true;
      name.textContent = 'Choose a photo…';
      slot.classList.remove('filled');
      return;
    }
    thumb.src = 'samples/' + photo.file;
    thumb.hidden = false;
    name.textContent = photo.file;
    slot.classList.add('filled');
  });
}

// Three upload slots: each replaces one of the first three photos and shows
// its thumbnail and file name; "Load 13 samples" restores the set.
function wireUploads() {
  const slots = document.querySelectorAll('.slot');
  slots.forEach((slot, i) => {
    const input = slot.querySelector('input[type=file]');
    const thumb = slot.querySelector('.thumb');
    const name = slot.querySelector('.fname');
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        state.photos[i] = { img, kind: 'photo', char: 'upload' + i, file: file.name };
        thumb.src = url;
        thumb.hidden = false;
        name.textContent = file.name;
        slot.classList.add('filled');
        draw();
      } catch (e) {
        setStatus('Could not read ' + file.name);
      }
    });
  });
  document.getElementById('load-samples').addEventListener('click', () => {
    loadSamples().then(() => {
      setStatus('13 samples loaded.');
    });
  });
}

function downloadPng(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

function renderOffscreen(sizeId) {
  const size = SIZES[sizeId];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, assignPanels(panelCount()), {
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    tagline: state.tagline,
    views: state.views,
  });
  return canvas;
}

function wireExport() {
  document.getElementById('export-one').addEventListener('click', () => {
    const size = SIZES[state.size];
    downloadPng(renderOffscreen(state.size), 'vice-heist-' + size.w + 'x' + size.h + '.png');
    setStatus('Saved vice-heist-' + size.w + 'x' + size.h + '.png');
  });
  document.getElementById('export-all').addEventListener('click', () => {
    for (const id of Object.keys(SIZES)) {
      const size = SIZES[id];
      downloadPng(renderOffscreen(id), 'vice-heist-' + size.w + 'x' + size.h + '.png');
    }
    setStatus('Saved all three sizes: 1080×1080, 1080×1350, 1920×1080.');
  });
}

// Drag a panel to pan its photo; the wheel zooms the panel under the cursor.
function wireCrop() {
  let drag = null;
  function panelIndexAt(clientX, clientY) {
    const rect = preview.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * preview.width;
    const y = ((clientY - rect.top) / rect.height) * preview.height;
    const panels = layoutPanels(state.layout, preview.width, preview.height);
    for (let i = 0; i < panels.length; i++) {
      const p = panels[i];
      if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return i;
    }
    return 0;
  }
  preview.addEventListener('pointerdown', (e) => {
    const idx = panelIndexAt(e.clientX, e.clientY);
    state.selected = idx;
    const rect = preview.getBoundingClientRect();
    drag = {
      idx,
      startX: e.clientX,
      startY: e.clientY,
      rect,
      base: JSON.parse(JSON.stringify(state.views[idx] || { zoom: 1, ox: 0, oy: 0 })),
    };
    preview.setPointerCapture(e.pointerId);
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.startX) / drag.rect.width;
    const dy = (e.clientY - drag.startY) / drag.rect.height;
    const panels = layoutPanels(state.layout, preview.width, preview.height);
    const p = panels[drag.idx];
    const v = {
      zoom: drag.base.zoom,
      ox: drag.base.ox + (dx * preview.width) / p.w,
      oy: drag.base.oy + (dy * preview.height) / p.h,
    };
    state.views[drag.idx] = v;
    if (zoomInput) zoomInput.value = String(Math.round(v.zoom * 100));
    draw();
  });
  preview.addEventListener('pointerup', () => {
    drag = null;
  });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const idx = panelIndexAt(e.clientX, e.clientY);
    state.selected = idx;
    const v = state.views[idx] || { zoom: 1, ox: 0, oy: 0 };
    v.zoom = Math.min(2.5, Math.max(1, v.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
    state.views[idx] = v;
    if (zoomInput) zoomInput.value = String(Math.round(v.zoom * 100));
    const zoomVal = document.getElementById('zoom-val');
    if (zoomVal) zoomVal.textContent = Math.round(v.zoom * 100) + '%';
    draw();
  }, { passive: false });
  if (zoomInput) {
    zoomInput.addEventListener('input', () => {
      const v = state.views[state.selected] || { zoom: 1, ox: 0, oy: 0 };
      v.zoom = Number(zoomInput.value) / 100;
      state.views[state.selected] = v;
      const zoomVal = document.getElementById('zoom-val');
      if (zoomVal) zoomVal.textContent = zoomInput.value + '%';
      draw();
    });
  }
  document.getElementById('reset-crop').addEventListener('click', () => {
    state.views = {};
    if (zoomInput) zoomInput.value = '100';
    draw();
    setStatus('Crop reset.');
  });
}

function wireText() {
  titleInput.addEventListener('input', () => {
    state.title = titleInput.value || 'VICE HEIST';
    draw();
  });
  taglineInput.addEventListener('input', () => {
    state.tagline = taglineInput.value || 'VICE CITY 2026';
    draw();
  });
}

async function boot() {
  buildPickers();
  wireUploads();
  wireExport();
  wireCrop();
  wireText();
  await document.fonts.ready;
  try {
    await document.fonts.load('80px Anton');
  } catch (e) {
    // Anton falls back to Arial Black; the cover still draws.
  }
  await loadSamples();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot && SHOT_DEFS[shot]) {
    applyShot(shot, state, draw);
    buildPickers();
    draw();
    // Do not signal readiness until the slot thumbnails have finished
    // loading, or the editor screenshot could catch one half-drawn.
    const thumbs = Array.from(document.querySelectorAll('.slot .thumb')).filter((t) => !t.hidden);
    const thumbsReady = Promise.all(thumbs.map((t) => (t.complete ? Promise.resolve() : new Promise((res) => {
      t.onload = res;
      t.onerror = res;
    }))));
    thumbsReady.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
    })));
  }
  draw();
}

boot();
