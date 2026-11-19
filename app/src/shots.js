// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone. Extra query params:
// layout, grade, size (WxH), photo (pier|boulevard), caption, tagline.
// window.__shotReady is set once the scene is painted.
export async function runShot(shot, query, state, loadImage, redraw) {
  const photoName = query.get('photo') ?? 'pier';
  const other = photoName === 'pier' ? 'boulevard' : 'pier';
  state.layout = query.get('layout') ?? 'hero';
  state.grade = query.get('grade') ?? 'sunset';
  state.caption = query.get('caption') ?? 'VICE HEIST';
  state.tagline = query.get('tagline') ?? 'VICE CITY · 2026';
  const size = query.get('size');
  if (size) {
    const [w, h] = size.split('x').map(Number);
    if (w && h) { state.exportW = w; state.exportH = h; }
  }
  try {
    state.photos[0] = await loadImage(`samples/${photoName}.jpg`);
    state.photos[1] = await loadImage(`samples/${other}.jpg`);
    state.photos[2] = await loadImage(`samples/${photoName}.jpg`);
  } catch { /* a missing sample still leaves a graded cover */ }
  // Keep the controls in sync with the scene.
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('layout', state.layout);
  set('grade', state.grade);
  set('caption', state.caption);
  set('tagline', state.tagline);
  set('size', size || '1080x1080');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const [w, h] = (size || '1080x1080').split('x').map(Number);
    const canvas = document.getElementById('cover');
    canvas.width = w;
    canvas.height = h;
  }
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
