// Draws a multi-panel Vice City style cover onto a canvas. v3.
// Own design: seven panel layouts (incl. a Character Hero with one big
// character panel and a 3x3 nine-panel grid), seven colour grades (incl. a
// gradient-map Heatwave, a Poster Ink comic shader and a split-tone grade),
// a striped retro sun, halftone title dots and a condensed poster-block
// title with auto-fit, and a bold gradient caption. No Rockstar art, logo
// or font. Panels never repeat a photo while enough distinct photos are
// loaded: with nine photos every nine-panel cover shows nine different
// shots.

export const GRADES = {
  sunset: { name: 'Vice Sunset', filter: 'saturate(1.25) contrast(1.06)', top: 'rgba(255,122,26,0.10)', mid: 'rgba(255,45,120,0.28)', low: 'rgba(120,10,90,0.42)', sun: '#ffd166', sunCore: '#fff3c4', frame: '#ff5da2' },
  neon: { name: 'Neon Nights', filter: 'saturate(1.35) contrast(1.08)', top: 'rgba(0,220,255,0.12)', mid: 'rgba(255,45,150,0.30)', low: 'rgba(20,0,80,0.45)', sun: '#ff2d78', sunCore: '#ffb3d1', frame: '#00e5ff' },
  gold: { name: 'Golden Coast', filter: 'saturate(1.3) contrast(1.07)', top: 'rgba(255,190,60,0.14)', mid: 'rgba(255,120,30,0.26)', low: 'rgba(90,30,0,0.40)', sun: '#ffdf8a', sunCore: '#fff8dd', frame: '#ffb347' },
  noir: { name: 'Noir Teal', filter: 'saturate(1.2) contrast(1.1)', top: 'rgba(0,180,170,0.14)', mid: 'rgba(0,90,110,0.30)', low: 'rgba(255,45,120,0.30)', sun: '#7ef0e0', sunCore: '#e6fff9', frame: '#2de1c2' },
  heat: { name: 'Heatwave', filter: 'saturate(1.5) contrast(1.16) brightness(1.03)', top: 'rgba(255,90,0,0.10)', mid: 'rgba(255,45,90,0.30)', low: 'rgba(120,0,40,0.46)', sun: '#ffb347', sunCore: '#fff0c0', frame: '#ff6a00' },
  ink: { name: 'Poster Ink', filter: 'contrast(1.5) saturate(1.7) brightness(1.03)', top: 'rgba(255,255,255,0.04)', mid: 'rgba(0,0,0,0.10)', low: 'rgba(10,0,30,0.38)', sun: '#ffe66d', sunCore: '#fffbe0', frame: '#ffffff' },
  split: { name: 'Split Tone', filter: 'saturate(1.3) contrast(1.12)', top: 'rgba(0,220,200,0.16)', mid: 'rgba(120,40,140,0.22)', low: 'rgba(255,45,120,0.34)', sun: '#7ef0e0', sunCore: '#e6fff9', frame: '#00e5ff' },
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
    ctx.filter = grade.filter || 'saturate(1.25) contrast(1.06)';
    ctx.drawImage(photo, dx, dy, dw, dh);
    ctx.filter = 'none';
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
  // Poster Ink gets a comic halftone print over the photo.
  if (grade === GRADES.ink) {
    drawHalftoneDots(ctx, px, py, pw, ph, Math.max(7, pw * 0.02), 'rgba(0,0,0,0.16)');
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

function drawSun(ctx, w, h, grade, layout) {
  // Retro striped sun: a gradient disc with horizontal gaps cut out of its
  // lower half. Where it goes depends on the layout: the character portraits
  // are face-centred and can fill a whole panel, so a fixed corner kept
  // landing on a face (top-right covered the duo's faces, top-left covered
  // the neon queen's eye in the nine-panel). Each position below sits in
  // the corner of a panel that holds a scene photo in the sample set:
  // charhero/quad/angled5 use the bottom-right scene panel's top-right
  // corner, nine uses the skyline panel's top-right corner, hero/split use
  // the top-left corner of the wide top panel (face centred, corner is
  // sky). Trio has a face in every panel, so it gets no sun at all.
  const spots = {
    charhero: [0.89, 0.60],
    nine: [0.89, 0.39],
    quad: [0.89, 0.60],
    angled5: [0.89, 0.60],
    hero: [0.11, 0.10],
    split: [0.89, 0.10],
  };
  const spot = spots[layout];
  if (!spot) return;
  const cx = w * spot[0], cy = h * spot[1], r = h * 0.055;
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

// Condensed poster font: the heaviest system sans, squeezed sideways and
// sheared a touch, so the lettering reads as a poster block, not body text.
const POSTER_FONT = (size) => `900 ${Math.round(size)}px 'Arial Black', Impact, 'DejaVu Sans', system-ui, sans-serif`;
const POSTER_SQUEEZE = 0.82; // horizontal scale applied when drawing
const POSTER_SKEW = -0.06; // slight forward lean

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
    ctx.save();
    ctx.font = `700 ${Math.round(h * 0.028)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = h * 0.008;
    ctx.fillText(tag.split('').join('  '), w / 2, y - h * 0.075);
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
  // 'poster' is the condensed, sheared, neon-edged block; 'gradient' is the
  // same block drawn straight and clean. Both auto-fit to the same 92%.
  const squeeze = style === 'gradient' ? 0.9 : POSTER_SQUEEZE;
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
  // Order the photos so each panel's shape gets a photo that fits it:
  // the Character Hero's tall panel wants a portrait (a face), the Hero's
  // wide top panel wants a landscape shot — a portrait in a wide slot crops
  // to a nose-and-sunglasses close-up. The rest follow in load order.
  let ordered = loaded;
  if (loaded.length > 1) {
    let first = null;
    if (layout === 'charhero') first = loaded.find((p) => p.naturalWidth < p.naturalHeight);
    if (layout === 'hero') first = loaded.find((p) => p.naturalWidth >= p.naturalHeight);
    if (first) ordered = [first, ...loaded.filter((p) => p !== first)];
  }
  shapes.forEach((s, i) => {
    const px = s.x * w + gutter / 2;
    const py = s.y * h + gutter / 2;
    const pw = s.w * w - gutter;
    const ph = s.h * h - gutter;
    // Enough distinct photos: every panel shows a different one, so a
    // nine-panel cover never repeats a shot. Otherwise panels cycle.
    const pic = ordered.length ? ordered[i % ordered.length] : null;
    drawPhotoInPanel(ctx, pic, px, py, pw, ph, s.slant * w, (state.panels || [])[i], grade);
  });
  drawSun(ctx, w, h, grade, layout);
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
