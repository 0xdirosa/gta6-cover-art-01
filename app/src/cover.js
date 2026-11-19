// Draws a multi-panel Vice City style cover onto a canvas. v5.
// Own design: seven panel layouts (incl. a Character Hero with one big
// character panel and a 3x3 nine-panel grid), eight colour grades (incl. a
// gradient-map Heatwave, a Poster Ink comic shader, a split-tone grade and a
// Comic Ink grade that turns ANY loaded photo into a comic illustration by
// posterizing it and inking its edges on canvas), a striped retro sun,
// halftone title dots and a condensed poster-block title in the bundled
// Anton font (SIL OFL, app/fonts/) with auto-fit, and a bold gradient
// caption. No Rockstar art, logo or font. Panels never repeat a photo
// while enough distinct photos are loaded: with thirteen photos every
// nine-panel cover shows nine different shots — and the sample order is
// character-led, so at least six of the nine panels are characters
// (five comic ink plus the beach couple) and a scene sits where the
// striped sun can live without covering a face.

export const GRADES = {
  sunset: { name: 'Vice Sunset', filter: 'saturate(1.25) contrast(1.06)', top: 'rgba(255,122,26,0.10)', mid: 'rgba(255,45,120,0.28)', low: 'rgba(120,10,90,0.42)', sun: '#ffd166', sunCore: '#fff3c4', frame: '#ff5da2' },
  neon: { name: 'Neon Nights', filter: 'saturate(1.35) contrast(1.08)', top: 'rgba(0,220,255,0.12)', mid: 'rgba(255,45,150,0.30)', low: 'rgba(20,0,80,0.45)', sun: '#ff2d78', sunCore: '#ffb3d1', frame: '#00e5ff' },
  gold: { name: 'Golden Coast', filter: 'saturate(1.3) contrast(1.07)', top: 'rgba(255,190,60,0.14)', mid: 'rgba(255,120,30,0.26)', low: 'rgba(90,30,0,0.40)', sun: '#ffdf8a', sunCore: '#fff8dd', frame: '#ffb347' },
  noir: { name: 'Noir Teal', filter: 'saturate(1.2) contrast(1.1)', top: 'rgba(0,180,170,0.14)', mid: 'rgba(0,90,110,0.30)', low: 'rgba(255,45,120,0.30)', sun: '#7ef0e0', sunCore: '#e6fff9', frame: '#2de1c2' },
  heat: { name: 'Heatwave', filter: 'saturate(1.5) contrast(1.16) brightness(1.03)', top: 'rgba(255,90,0,0.10)', mid: 'rgba(255,45,90,0.30)', low: 'rgba(120,0,40,0.46)', sun: '#ffb347', sunCore: '#fff0c0', frame: '#ff6a00' },
  ink: { name: 'Poster Ink', filter: 'contrast(1.5) saturate(1.7) brightness(1.03)', top: 'rgba(255,255,255,0.04)', mid: 'rgba(0,0,0,0.10)', low: 'rgba(10,0,30,0.38)', sun: '#ffe66d', sunCore: '#fffbe0', frame: '#ffffff' },
  split: { name: 'Split Tone', filter: 'saturate(1.3) contrast(1.12)', top: 'rgba(0,220,200,0.16)', mid: 'rgba(120,40,140,0.22)', low: 'rgba(255,45,120,0.34)', sun: '#7ef0e0', sunCore: '#e6fff9', frame: '#00e5ff' },
  comic: { name: 'Comic Ink', filter: 'saturate(1.6) contrast(1.25)', top: 'rgba(255,120,40,0.05)', mid: 'rgba(255,45,120,0.14)', low: 'rgba(40,0,90,0.25)', sun: '#ffb347', sunCore: '#fff0c0', frame: '#ff2d78', inkPass: true },
};

export const LAYOUTS = ['charhero', 'hero', 'trio', 'quad', 'split', 'angled5', 'nine'];

// Panel shapes: each is {x, y, w, h, slant} in fractions of the canvas.
// slant shifts the right edge of a panel sideways for a diagonal cut.
export function panelShapes(layout) {
  if (layout === 'charhero') return [
    { x: 0, y: 0, w: 0.56, h: 1, slant: 0 }, // the character panel: one big face
    { x: 0.56, y: 0, w: 0.22, h: 0.5, slant: 0 },
    { x: 0.78, y: 0, w: 0.22, h: 0.5, slant: 0 },
    { x: 0.56, y: 0.5, w: 0.22, h: 0.5, slant: 0 },
    { x: 0.78, y: 0.5, w: 0.22, h: 0.5, slant: 0 },
  ];
  if (layout === 'trio') return [
    { x: 0, y: 0, w: 1 / 3, h: 1, slant: 0 },
    { x: 1 / 3, y: 0, w: 1 / 3, h: 1, slant: 0 },
    { x: 2 / 3, y: 0, w: 1 / 3, h: 1, slant: 0 },
  ];
  if (layout === 'quad') return [
    { x: 0, y: 0, w: 0.5, h: 0.5, slant: 0 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5, slant: 0 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5, slant: 0 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5, slant: 0 },
  ];
  if (layout === 'split') return [
    { x: 0, y: 0, w: 0.62, h: 1, slant: -0.14 },
    { x: 0.48, y: 0, w: 0.52, h: 1, slant: -0.14 },
  ];
  if (layout === 'angled5') return [
    { x: 0, y: 0, w: 0.54, h: 1, slant: 0.07 }, // bottom edge leans right; the right column paints over the strip, leaving a diagonal seam
    { x: 0.54, y: 0, w: 0.23, h: 0.5, slant: 0 },
    { x: 0.77, y: 0, w: 0.23, h: 0.5, slant: 0 },
    { x: 0.54, y: 0.5, w: 0.23, h: 0.5, slant: 0 },
    { x: 0.77, y: 0.5, w: 0.23, h: 0.5, slant: 0 },
  ];
  if (layout === 'nine') {
    const out = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      out.push({ x: c / 3, y: r / 3, w: 1 / 3, h: 1 / 3, slant: 0 });
    }
    return out;
  }
  return [ // hero
    { x: 0, y: 0, w: 1, h: 0.62, slant: 0 },
    { x: 0, y: 0.62, w: 0.5, h: 0.38, slant: 0 },
    { x: 0.5, y: 0.62, w: 0.5, h: 0.38, slant: 0 },
  ];
}

function panelPath(ctx, px, py, pw, ph, slantPx) {
  // slantPx is already in pixels: the bottom edge shifts by that amount.
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + pw, py);
  ctx.lineTo(px + pw + slantPx, py + ph);
  ctx.lineTo(px, py + ph);
  ctx.closePath();
}

function drawHalftoneDots(ctx, px, py, pw, ph, spacing, color) {
  ctx.save();
  ctx.fillStyle = color;
  for (let y = py + spacing / 2; y < py + ph; y += spacing) {
    for (let x = px + spacing / 2; x < px + pw; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, spacing * 0.16), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// Comic Ink: turn any photo into a comic illustration on canvas. The photo
// is drawn into a small offscreen canvas, its colours are posterized to
// five flat levels per channel, and a Sobel edge pass inks every strong
// luminance edge black — flat colour + ink outline, the comic look — before
// the result is painted into the panel. The temp canvas is capped at 768px
// on its long side so the live preview stays fast; the halftone dots drawn
// over it hide the downscale.
function comicInkImage(photo, dx, dy, dw, dh) {
  const scale = Math.min(1, 768 / Math.max(dw, dh));
  const tw = Math.max(2, Math.round(dw * scale));
  const th = Math.max(2, Math.round(dh * scale));
  const tmp = document.createElement('canvas');
  tmp.width = tw;
  tmp.height = th;
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  tctx.drawImage(photo, 0, 0, tw, th);
  const img = tctx.getImageData(0, 0, tw, th);
  const d = img.data;
  const lum = new Float32Array(tw * th);
  for (let i = 0; i < tw * th; i++) {
    const o = i * 4;
    // Posterize: five flat levels per channel (0, 64, 128, 192, 255),
    // then lift the result a touch — a straight posterize of a photo
    // goes muddy-dark under the grade wash, and comic art stays bright.
    d[o] = Math.min(255, Math.round(d[o] / 64) * 64 * 1.05 + 10);
    d[o + 1] = Math.min(255, Math.round(d[o + 1] / 64) * 64 * 1.05 + 10);
    d[o + 2] = Math.min(255, Math.round(d[o + 2] / 64) * 64 * 1.05 + 10);
    lum[i] = 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
  }
  // Sobel edges on the posterized luminance: strong edges become ink.
  // The threshold sits high on purpose: the illustration samples already
  // carry halftone dots, and a low threshold inks every dot into speckle.
  const out = new Uint8ClampedArray(d);
  const at = (x, y) => lum[Math.min(th - 1, Math.max(0, y)) * tw + Math.min(tw - 1, Math.max(0, x))];
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const gx = -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)
        + at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1);
      const gy = -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)
        + at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
      if (Math.abs(gx) + Math.abs(gy) > 210) {
        const o = (y * tw + x) * 4;
        out[o] = 16; out[o + 1] = 4; out[o + 2] = 32; // deep violet-black ink
      }
    }
  }
  tctx.putImageData(new ImageData(out, tw, th), 0, 0);
  return { canvas: tmp, dx, dy, dw, dh };
}

function drawPhotoInPanel(ctx, photo, px, py, pw, ph, slant, adjust, grade) {
  ctx.save();
  panelPath(ctx, px, py, pw, ph, slant);
  ctx.clip();
  if (photo) {
    const zoom = (adjust?.zoom ?? 1) * Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight);
    const dw = photo.naturalWidth * zoom;
    const dh = photo.naturalHeight * zoom;
    const dx = px + (pw - dw) / 2 + (adjust?.dx ?? 0) * pw / 100;
    let dy = py + (ph - dh) / 2 + (adjust?.dy ?? 0) * ph / 100;
    // Heavy vertical crop (a tall photo in a wide panel): bias the crop
    // toward the top of the photo, where faces usually are, instead of
    // dead centre — otherwise a wide export crops a face to a nose.
    if (dh > ph * 1.4) dy -= (dh - ph) * 0.2;
    if (grade.inkPass) {
      const inked = comicInkImage(photo, dx, dy, dw, dh);
      ctx.drawImage(inked.canvas, inked.dx, inked.dy, inked.dw, inked.dh);
    } else {
      ctx.filter = grade.filter || 'saturate(1.25) contrast(1.06)';
      ctx.drawImage(photo, dx, dy, dw, dh);
      ctx.filter = 'none';
    }
  } else {
    ctx.fillStyle = '#3a1748';
    ctx.fillRect(px, py, pw, ph);
  }
  // Grade wash, stronger at the bottom of each panel.
  const wash = ctx.createLinearGradient(0, py, 0, py + ph);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(0.55, grade.mid);
  wash.addColorStop(1, grade.low);
  ctx.fillStyle = wash;
  ctx.fillRect(px + Math.min(0, slant), py, pw + Math.abs(slant), ph);
  // Poster Ink and Comic Ink get a comic halftone print over the photo.
  if (grade === GRADES.ink) {
    drawHalftoneDots(ctx, px, py, pw, ph, Math.max(7, pw * 0.02), 'rgba(0,0,0,0.16)');
  }
  if (grade.inkPass) {
    drawHalftoneDots(ctx, px, py, pw, ph, Math.max(8, pw * 0.02), 'rgba(0,0,0,0.12)');
  }
  ctx.restore();
  // White divider around the panel.
  ctx.save();
  panelPath(ctx, px, py, pw, ph, slant);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = Math.max(3, pw * 0.008);
  ctx.stroke();
  ctx.restore();
}

// Names of the sample photos that are scenes (sky, streets, sea), as
// opposed to character portraits. A panel counts as a scene panel only if
// its photo's file name is one of these: a user's own upload has an
// unknown name and is treated as a face until proven otherwise.
const SCENE_NAMES = new Set(['sunset-boulevard', 'neon-boardwalk', 'skyline-night', 'classic-car', 'marina-dawn', 'pier', 'boulevard']);

function drawSun(ctx, w, h, grade, shapes, ordered) {
  // Retro striped sun: a gradient disc with horizontal gaps cut out of its
  // lower half. Where it goes is decided from the photos actually on the
  // cover, never from a fixed corner: fixed corners kept landing on faces
  // once the sample order became character-led — the nine-panel's
  // top-right panel is a beach portrait now, and Character Hero's last
  // small panel is one too, so both old spots put the sun on a man's
  // face. The sun now sits in the top-right corner of the topmost scene
  // panel (rightmost on a tie), in sky, never on a face; a cover whose
  // panels are all portraits simply has no sun.
  const gutter = Math.max(4, w * 0.008);
  let best = null;
  shapes.forEach((s, i) => {
    const name = (ordered[i]?.name || '').replace(/\.(jpe?g|png)$/i, '');
    if (!SCENE_NAMES.has(name)) return;
    const score = s.y * 100 - s.x; // topmost wins, rightmost breaks ties
    if (!best || score < best.score) best = { s, score };
  });
  if (!best) return;
  const { s } = best;
  const px = s.x * w + gutter / 2, py = s.y * h + gutter / 2;
  const pw = s.w * w - gutter;
  const r = h * 0.055;
  const cx = px + pw - r * 1.3, cy = py + r * 1.4;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, grade.sunCore);
  g.addColorStop(1, grade.sun);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.globalCompositeOperation = 'destination-out';
  let y = cy + r * 0.05;
  let gap = r * 0.06;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, gap);
    y += gap + r * 0.13;
    gap *= 1.5;
  }
  ctx.restore();
}

function drawTitleDots(ctx, w, y, size, grade) {
  // Halftone dot strip under the title, in the grade's frame colour.
  const spacing = Math.max(10, size * 0.22);
  const count = Math.floor((w * 0.6) / spacing);
  const x0 = w / 2 - (count * spacing) / 2;
  ctx.save();
  ctx.fillStyle = grade.frame;
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(x0 + i * spacing + spacing / 2, y, Math.max(2, size * 0.035), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Condensed poster font: Anton, bundled under app/fonts/ under the SIL Open
// Font License (see app/fonts/OFL.txt) — the rules name the SIL OFL as a
// shippable font license, and the kit's own house apps letter in Anton.
// Anton ships a single weight, so the size is used as-is; Arial Black and
// Impact stay as the fallback if the bundled file ever fails to load.
const POSTER_FONT = (size) => `${Math.round(size)}px Anton, 'Arial Black', Impact, 'DejaVu Sans', system-ui, sans-serif`;
const POSTER_SQUEEZE = 0.92; // Anton is already condensed; only a light squeeze
const POSTER_SKEW = -0.04; // slight forward lean

// Shrink the title until it fits inside maxWidth (already accounting for the
// squeeze), so it can never touch the cover edges. Returns the fitted size
// and the final on-canvas width.
function fitTitle(ctx, text, fontFor, startSize, maxWidth, squeeze) {
  let size = startSize;
  let width = Infinity;
  while (size > 14) {
    ctx.font = fontFor(Math.round(size));
    width = ctx.measureText(text).width * squeeze;
    if (width <= maxWidth) break;
    size -= 2;
  }
  ctx.font = fontFor(Math.round(size));
  width = ctx.measureText(text).width * squeeze;
  return { size, width };
}

function drawCaption(ctx, w, h, state, grade) {
  const text = (state.caption || '').trim().toUpperCase();
  const tag = (state.tagline || '').trim().toUpperCase();
  const y = (state.capY / 100) * h;
  // v2's 'neon' (Georgia italic) is retired: it now maps to the poster block.
  const style = (state.titleStyle || 'poster') === 'neon' ? 'poster' : state.titleStyle;
  if (tag) {
    // The tagline sits on its own dark scrim band, so the letters never
    // print directly across a face or a busy photo: the band reads as a
    // designed caption bar, and the text stays legible over any panel.
    ctx.save();
    const fontSize = Math.round(h * 0.028);
    ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    const letterspaced = tag.split('').join('  ');
    const tw = ctx.measureText(letterspaced).width;
    const ty = y - h * 0.075;
    const padX = Math.max(10, w * 0.02);
    const padY = fontSize * 0.45;
    ctx.fillStyle = 'rgba(20,4,32,0.55)';
    const bx = w / 2 - tw / 2 - padX;
    const by = ty - fontSize * 0.72 - padY;
    const bw = tw + padX * 2;
    const bh = fontSize * 1.15 + padY * 2;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, bh / 2); ctx.fill(); }
    else ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = h * 0.008;
    ctx.fillText(letterspaced, w / 2, ty);
    ctx.restore();
  }
  if (!text) return null;
  // Auto-fit: at least 4% of the cover width stays clear on each side.
  const maxWidth = w * 0.92;
  const startSize = h * 0.115 * (state.capSize / 100);
  const grad = ctx.createLinearGradient(0, y - startSize / 2, 0, y + startSize / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.55, grade.sun);
  grad.addColorStop(1, '#ff2d78');
  // 'poster' is the condensed Anton block, sheared, neon-edged; 'gradient'
  // is the same block drawn straight and clean. Both auto-fit to the same 92%.
  const squeeze = style === 'gradient' ? 0.96 : POSTER_SQUEEZE;
  const skew = style === 'gradient' ? 0 : POSTER_SKEW;
  const { size, width } = fitTitle(ctx, text, POSTER_FONT, startSize, maxWidth, squeeze);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Draw squeezed + sheared around the title centre.
  ctx.translate(w / 2, y);
  ctx.transform(squeeze, 0, skew, 1, 0, 0);
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, size * 0.10);
  ctx.strokeStyle = 'rgba(20,4,32,0.95)';
  ctx.shadowColor = 'rgba(255,45,120,0.55)';
  ctx.shadowBlur = style === 'gradient' ? 0 : size * 0.12; // thin neon glow, not a haze
  ctx.shadowOffsetY = size * 0.04;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = grad;
  ctx.fillText(text, 0, 0);
  ctx.restore();
  drawTitleDots(ctx, w, y + size * 0.72, size, grade);
  return { size, width, maxWidth };
}

/** Draws the whole cover for `state` onto `canvas` at W x H pixels. */
export function drawCover(canvas, state, W, H) {
  const w = W || canvas.width, h = H || canvas.height;
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d');
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);
  const layout = state.layout || 'charhero';
  const shapes = panelShapes(layout);
  const gutter = Math.max(4, w * 0.008);
  const loaded = (state.photos || []).filter(Boolean);
  // Order the photos for a layout so no character or shot repeats while
// enough distinct photos are loaded, and each panel's shape gets a photo
// that fits it. Two samples of the same character (the photo and the comic
// version — neon-queen and ink-queen, hawaii-keys and ink-hawaii) share one
// character key, so a cover never shows the same face twice: the key is the
// file name with its ink/neon prefix and keys/skyline suffix stripped, and
// a user's own upload keys on its full file name. The Character Hero's big
// panel wants a portrait (a face); its last small panel wants a landscape
// shot. The items returned carry their file names too, so drawSun can tell
// a scene panel from a character panel — only a scene panel ever gets the
// sun. The Hero's wide top panel wants a landscape shot — a portrait in
// a wide slot crops to a nose-and-sunglasses close-up.
function orderPhotos(photos, names, layout) {
  const n = panelShapes(layout).length;
  const baseOf = (i) => (names?.[i] || '').replace(/\.jpe?g$/i, '').replace(/\.png$/i, '');
  const keyOf = (i) => {
    const base = baseOf(i);
    if (!base) return `photo${i}`;
    return base.replace(/^(ink|neon)-/, '').replace(/-(keys|skyline)$/, '');
  };
  const items = photos
    .map((p, i) => (p ? { p, name: baseOf(i), key: keyOf(i), portrait: p.naturalWidth < p.naturalHeight } : null))
    .filter(Boolean);
  const all = items;
  const used = new Set();
  const take = (pred) => {
    const it = items.find((x) => !used.has(x.key) && pred(x));
    if (!it) return null;
    used.add(it.key);
    return it;
  };
  const out = [];
  if (layout === 'charhero') {
    const big = take((x) => x.portrait);
    if (big) out.push(big);
    while (out.length < n - 1) {
      const p = take((x) => x.portrait);
      if (!p) break;
      out.push(p);
    }
    const scene = take((x) => !x.portrait);
    if (scene) out.push(scene);
  } else {
    if (layout === 'hero') {
      const first = take((x) => !x.portrait);
      if (first) out.push(first);
    }
  }
  while (out.length < n) {
    const p = take(() => true);
    if (!p) break;
    out.push(p);
  }
  while (out.length < n) out.push(all[out.length % all.length]);
  return out;
}
  const ordered = orderPhotos(state.photos, state.photoNames, layout);
  shapes.forEach((s, i) => {
    const px = s.x * w + gutter / 2;
    const py = s.y * h + gutter / 2;
    const pw = s.w * w - gutter;
    const ph = s.h * h - gutter;
    // Enough distinct photos: every panel shows a different one, so a
    // nine-panel cover never repeats a shot. Otherwise panels cycle.
    const pic = ordered.length ? ordered[i % ordered.length]?.p : null;
    drawPhotoInPanel(ctx, pic, px, py, pw, ph, s.slant * w, (state.panels || [])[i], grade);
  });
  drawSun(ctx, w, h, grade, shapes, ordered);
  // Neon outer frame.
  ctx.save();
  ctx.strokeStyle = grade.frame;
  ctx.lineWidth = Math.max(3, w * 0.006);
  ctx.globalAlpha = 0.9;
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
  ctx.restore();
  const metrics = drawCaption(ctx, w, h, state, grade);
  // Expose the auto-fit result on the canvas for verification (and for the
  // screenshot harness to read): the title never exceeds 92% of the width.
  if (metrics) {
    canvas.dataset.titleSize = String(Math.round(metrics.size));
    canvas.dataset.titleWidth = String(Math.round(metrics.width));
    canvas.dataset.titleMax = String(Math.round(metrics.maxWidth));
  }
}
