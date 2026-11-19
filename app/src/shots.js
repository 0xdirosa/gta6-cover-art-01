// Fixed scenes for screenshots: ?shot=editor shows the page with sample
// photos loaded; ?shot=cover shows the cover alone. Extra query params:
// layout, grade, titleStyle, size (WxH), photos (comma-separated sample
// names, default the eleven v4 samples, comic characters first), caption,
// tagline. window.__shotReady is set once the scene is painted — after the
// bundled Anton font is loaded, so the title is measured in the real font.
export async function runShot(shot, query, state, loadImage, redraw, fontReady) {
  const names = (query.get('photos') || 'ink-queen,ink-hawaii,ink-duo,neon-queen,hawaii-keys,sunset-boulevard,neon-boardwalk,skyline-night,beach-couple,classic-car,marina-dawn')
    .split(',').map((s) => s.trim()).filter(Boolean);
  state.layout = query.get('layout') ?? 'charhero';
  state.grade = query.get('grade') ?? 'comic';
  state.titleStyle = query.get('titleStyle') ?? 'poster';
  state.caption = query.get('caption') ?? 'VICE HEIST';
  state.tagline = query.get('tagline') ?? 'VICE CITY · 2026';
  const size = query.get('size');
  if (size) {
    const [w, h] = size.split('x').map(Number);
    if (w && h) { state.exportW = w; state.exportH = h; }
  }
  const loaded = [];
  const namesOut = [];
  for (const name of names) {
    try { loaded.push(await loadImage(`samples/${name}.jpg`)); namesOut.push(`${name}.jpg`); }
    catch { loaded.push(null); namesOut.push(''); }
  }
  state.photos = loaded;
  state.photoNames = namesOut;
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
  if (fontReady) await fontReady;
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
