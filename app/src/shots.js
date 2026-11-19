// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone. Extra query params:
// layout, grade, titleStyle, size (WxH), photos (comma-separated sample
// names, default the six new samples), caption, tagline.
// window.__shotReady is set once the scene is painted.
export async function runShot(shot, query, state, loadImage, redraw) {
  const names = (query.get('photos') || 'sunset-boulevard,neon-boardwalk,skyline-night,beach-couple,classic-car,marina-dawn')
    .split(',').map((s) => s.trim()).filter(Boolean);
  state.layout = query.get('layout') ?? 'angled5';
  state.grade = query.get('grade') ?? 'heat';
  state.titleStyle = query.get('titleStyle') ?? 'neon';
  state.caption = query.get('caption') ?? 'VICE HEIST';
  state.tagline = query.get('tagline') ?? 'VICE CITY · 2026';
  const size = query.get('size');
  if (size) {
    const [w, h] = size.split('x').map(Number);
    if (w && h) { state.exportW = w; state.exportH = h; }
  }
  const loaded = [];
  for (const name of names) {
    try { loaded.push(await loadImage(`samples/${name}.jpg`)); }
    catch { loaded.push(null); }
  }
  state.photos = loaded;
  // Keep the controls in sync with the scene.
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('layout', state.layout);
  set('grade', state.grade);
  set('titleStyle', state.titleStyle);
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
