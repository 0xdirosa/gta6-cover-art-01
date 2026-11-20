// Fixed scenes for screenshots, driven by `?shot=`.
// `cover` hides the controls and paints one cover; `editor` shows the page
// with the editor open and a finished cover. window.__shotReady is set once
// the scene has painted, so a headless browser can wait on it.
export const SHOT_DEFS = {
  hero: {
    layout: 'hero',
    grade: 'comicInk',
    title: 'VICE HEIST',
    tagline: 'VICE CITY 2026',
    size: 'square',
    shotClass: 'shot-cover',
    order: [
      'ink-queen.jpg',
      'ink-hawaii.jpg',
      'neon-queen.jpg',
      'classic-car.jpg',
      'sunset-boulevard.jpg',
    ],
  },
  editor: {
    layout: 'nine',
    grade: 'comicInk',
    title: 'VICE HEIST',
    tagline: 'VICE CITY 2026',
    size: 'wide',
    shotClass: 'shot-editor',
    order: [
      'ink-queen.jpg',
      'ink-hawaii.jpg',
      'ink-duo.jpg',
      'ink-leather.jpg',
      'ink-blonde.jpg',
      'neon-queen.jpg',
      'hawaii-keys.jpg',
      'beach-couple.jpg',
      'sunset-boulevard.jpg',
    ],
  },
  nine: {
    layout: 'nine',
    grade: 'comicInk',
    title: 'VICE HEIST',
    tagline: 'VICE CITY 2026',
    size: 'portrait',
    shotClass: 'shot-cover',
    order: [
      'ink-queen.jpg',
      'ink-hawaii.jpg',
      'ink-duo.jpg',
      'ink-leather.jpg',
      'ink-blonde.jpg',
      'neon-queen.jpg',
      'hawaii-keys.jpg',
      'beach-couple.jpg',
      'sunset-boulevard.jpg',
    ],
  },
  wide: {
    layout: 'hero',
    grade: 'comicInk',
    title: 'VICE HEIST',
    tagline: 'VICE CITY 2026',
    size: 'wide',
    shotClass: 'shot-cover',
    order: [
      'ink-queen.jpg',
      'ink-hawaii.jpg',
      'neon-queen.jpg',
      'classic-car.jpg',
      'sunset-boulevard.jpg',
    ],
  },
};

// Reorders the loaded photos so the shot shows exactly the listed files in
// exactly this order, then applies the scene to the shared state.
export function applyShot(name, state, draw) {
  const def = SHOT_DEFS[name];
  if (!def) return false;
  state.layout = def.layout;
  state.grade = def.grade;
  state.title = def.title;
  state.tagline = def.tagline;
  state.size = def.size;
  state.views = {};
  state.fixedOrder = def.order.slice();
  const byFile = new Map(state.photos.map((p) => [p.file, p]));
  const ordered = [];
  for (const file of def.order) {
    const photo = byFile.get(file);
    if (photo) ordered.push(photo);
  }
  const rest = state.photos.filter((p) => !def.order.includes(p.file));
  state.photos = ordered.concat(rest);
  document.body.classList.add(def.shotClass);
  const title = document.getElementById('title');
  const tagline = document.getElementById('tagline');
  if (title) title.value = def.title;
  if (tagline) tagline.value = def.tagline;
  draw();
  return true;
}
