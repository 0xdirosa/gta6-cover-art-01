// Draws a multi-panel Vice City style cover onto a canvas. v2.
// Own design: six panel layouts, six colour grades (incl. a gradient-map
// Heatwave, a Poster Ink comic shader and a split-tone grade), a striped
// retro sun, halftone title dots and a neon-script title style, and a bold
// gradient caption. No Rockstar art, logo or font.

export const GRADES = {
  sunset: { name: 'Vice Sunset', filter: 'saturate(1.25) contrast(1.06)', top: 'rgba(255,122,26,0.10)', mid: 'rgba(255,45,120,0.28)', low: 'rgba(120,10,90,0.42)', sun: '#ffd166', sunCore: '#fff3c4', frame: '#ff5da2' },
  neon: { name: 'Neon Nights', filter: 'saturate(1.35) contrast(1.08)', top: 'rgba(0,220,255,0.12)', mid: 'rgba(255,45,150,0.30)', low: 'rgba(20,0,80,0.45)', sun: '#ff2d78', sunCore: '#ffb3d1', frame: '#00e5ff' },
  gold: { name: 'Golden Coast', filter: 'saturate(1.3) contrast(1.07)', top: 'rgba(255,190,60,0.14)', mid: 'rgba(255,120,30,0.26)', low: 'rgba(90,30,0,0.40)', sun: '#ffdf8a', sunCore: '#fff8dd', frame: '#ffb347' },
  noir: { name: 'Noir Teal', filter: 'saturate(1.2) contrast(1.1)', top: 'rgba(0,180,170,0.14)', mid: 'rgba(0,90,110,0.30)', low: 'rgba(255,45,120,0.30)', sun: '#7ef0e0', sunCore: '#e6fff9', frame: '#2de1c2' },
  heat: { name: 'Heatwave', filter: 'saturate(1.5) contrast(1.16) brightness(1.03)', top: 'rgba(255,90,0,0.10)', mid: 'rgba(255,45,90,0.30)', low: 'rgba(120,0,40,0.46)', sun: '#ffb347', sunCore: '#fff0c0', frame: '#ff6a00' },
  ink: { name: 'Poster Ink', filter: 'contrast(1.5) saturate(1.7) brightness(1.03)', top: 'rgba(255,255,255,0.04)', mid: 'rgba(0,0,0,0.10)', low: 'rgba(10,0,30,0.38)', sun: '#ffe66d', sunCore: '#fffbe0', frame: '#ffffff' },
  split: { name: 'Split Tone', filter: 'saturate(1.3) contrast(1.12)', top: 'rgba(0,220,200,0.16)', mid: 'rgba(120,40,140,0.22)', low: 'rgba(255,45,120,0.34)', sun: '#7ef0e0', sunCore: '#e6fff9', frame: '#00e5ff' },
};

export const LAYOUTS = ['hero', 'trio', 'quad', 'split', 'angled5', 'nine'];

// Panel shapes: each is {x, y, w, h, slant} in fractions of the canvas.
// slant shifts the right edge of a panel sideways for a diagonal cut.
export function panelShapes(layout) {
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
    const dy = py + (ph - dh) / 2 + (adjust?.dy ?? 0) * ph / 100;
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

function drawSun(ctx, w, h, grade) {
  // Retro striped sun: a gradient disc with horizontal gaps cut out of its
  // lower half, tucked in the top corner so it never lands on a face.
  const cx = w * 0.89, cy = h * 0.10, r = h * 0.055;
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

function drawCaption(ctx, w, h, state, grade) {
  const text = (state.caption || '').trim().toUpperCase();
  const tag = (state.tagline || '').trim().toUpperCase();
  const y = (state.capY / 100) * h;
  const style = state.titleStyle || 'gradient';
  if (tag) {
    ctx.save();
    ctx.font = `700 ${Math.round(h * 0.028)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = h * 0.008;
    ctx.fillText(tag.split('').join('  '), w / 2, y - h * 0.075);
    ctx.restore();
  }
  if (!text) return;
  let size = h * 0.115 * (state.capSize / 100);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (style === 'neon') {
    // Neon script: slanted serif, white-hot core, pink neon glow.
    while (size > 14) {
      ctx.font = `italic 900 ${Math.round(size)}px Georgia, 'Times New Roman', serif`;
      if (ctx.measureText(text).width <= w * 0.94) break;
      size -= 4;
    }
    ctx.font = `italic 900 ${Math.round(size)}px Georgia, 'Times New Roman', serif`;
    ctx.shadowColor = '#ff2d78';
    ctx.shadowBlur = size * 0.45;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, w / 2, y);
    ctx.shadowBlur = size * 0.15;
    ctx.fillStyle = '#ffd7ea';
    ctx.fillText(text, w / 2, y);
    ctx.restore();
    drawTitleDots(ctx, w, y + size * 0.72, size, grade);
    return;
  }
  const grad = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.55, grade.sun);
  grad.addColorStop(1, '#ff2d78');
  while (size > 14) {
    ctx.font = `900 ${Math.round(size)}px system-ui, sans-serif`;
    if (ctx.measureText(text).width <= w * 0.94) break;
    size -= 4;
  }
  ctx.font = `900 ${Math.round(size)}px system-ui, sans-serif`;
  try { ctx.letterSpacing = '2px'; } catch { /* older canvas: ignore */ }
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, size * 0.10);
  ctx.strokeStyle = 'rgba(20,4,32,0.95)';
  ctx.shadowColor = 'rgba(255,45,120,0.55)';
  ctx.shadowBlur = size * 0.25;
  ctx.shadowOffsetY = size * 0.04;
  ctx.strokeText(text, w / 2, y);
  ctx.fillStyle = grad;
  ctx.fillText(text, w / 2, y);
  ctx.restore();
  drawTitleDots(ctx, w, y + size * 0.72, size, grade);
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
  const shapes = panelShapes(state.layout || 'hero');
  const gutter = Math.max(4, w * 0.008);
  shapes.forEach((s, i) => {
    const px = s.x * w + gutter / 2;
    const py = s.y * h + gutter / 2;
    const pw = s.w * w - gutter;
    const ph = s.h * h - gutter;
    // Panels cycle the loaded photos; with one photo every panel uses it.
    const loaded = (state.photos || []).filter(Boolean);
    const pic = loaded.length ? loaded[i % loaded.length] : null;
    drawPhotoInPanel(ctx, pic, px, py, pw, ph, s.slant * w, (state.panels || [])[i], grade);
  });
  drawSun(ctx, w, h, grade);
  // Neon outer frame.
  ctx.save();
  ctx.strokeStyle = grade.frame;
  ctx.lineWidth = Math.max(3, w * 0.006);
  ctx.globalAlpha = 0.9;
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
  ctx.restore();
  drawCaption(ctx, w, h, state, grade);
}
