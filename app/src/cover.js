// VICE PANELS — cover renderer.
// Draws a multi-panel GTA-style poster on a 2D canvas from photos: seven layouts,
// eight canvas grades, a striped retro sun and a fitted Anton title block.
// No libraries, no network: everything here works on pixels already in memory.

export const LAYOUTS = [
  { id: 'hero', label: 'Character Hero' },
  { id: 'nine', label: 'Nine 3×3' },
  { id: 'angled', label: 'Angled 5' },
  { id: 'duo', label: 'Duo Split' },
  { id: 'triptych', label: 'Triptych' },
  { id: 'banner', label: 'Wide Banner' },
  { id: 'strip', label: 'Vertical Strip' },
];

export const GRADES = [
  { id: 'comicInk', label: 'Comic Ink' },
  { id: 'heatwave', label: 'Heatwave' },
  { id: 'posterInk', label: 'Poster Ink' },
  { id: 'splitTone', label: 'Split Tone' },
  { id: 'neon', label: 'Neon' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'noir', label: 'Noir' },
  { id: 'vivid', label: 'Vivid' },
];

function clamp255(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function lumOf(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function posterize(v, levels) {
  const step = 255 / (levels - 1);
  return Math.round(v / step) * step;
}

// Grade one panel-sized canvas in place: pixel work first, overlays after.
export function applyGrade(canvas, gradeName) {
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const w = img.width;
  const h = img.height;
  const n = w * h;
  const lum = new Float32Array(n);
  let i;
  let p;
  for (i = 0; i < n; i++) {
    p = i * 4;
    lum[i] = lumOf(d[p], d[p + 1], d[p + 2]);
  }

  if (gradeName === 'comicInk') {
    // Flat five-level posterize, then Sobel ink edges, then halftone dots.
    for (i = 0; i < d.length; i += 4) {
      d[i] = posterize(d[i], 5);
      d[i + 1] = posterize(d[i + 1], 5);
      d[i + 2] = posterize(d[i + 2], 5);
    }
    const edge = new Float32Array(n);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        const gx =
          -lum[idx - w - 1] - 2 * lum[idx - 1] - lum[idx + w - 1] +
          lum[idx - w + 1] + 2 * lum[idx + 1] + lum[idx + w + 1];
        const gy =
          -lum[idx - w - 1] - 2 * lum[idx - w] - lum[idx - w + 1] +
          lum[idx + w - 1] + 2 * lum[idx + w] + lum[idx + w + 1];
        edge[idx] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    for (i = 0; i < n; i++) {
      if (edge[i] > 210) {
        p = i * 4;
        d[p] = 14;
        d[p + 1] = 8;
        d[p + 2] = 22;
      }
    }
    const cell = 7;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const l = lum[y * w + x];
        if (l > 150) continue;
        const cx = (Math.floor(x / cell) + 0.5) * cell;
        const cy = (Math.floor(y / cell) + 0.5) * cell;
        const dx = x - cx;
        const dy = y - cy;
        const rad = (1 - l / 150) * cell * 0.42;
        if (dx * dx + dy * dy < rad * rad) {
          p = (y * w + x) * 4;
          d[p] = d[p] * 0.55;
          d[p + 1] = d[p + 1] * 0.55;
          d[p + 2] = d[p + 2] * 0.6;
        }
      }
    }
  } else if (gradeName === 'heatwave') {
    // Luminance mapped onto a hot gradient: violet, magenta, orange, gold.
    const stops = [
      [26, 8, 54],
      [168, 28, 110],
      [255, 110, 60],
      [255, 190, 90],
      [255, 244, 200],
    ];
    for (i = 0; i < n; i++) {
      const t = (lum[i] / 255) * (stops.length - 1);
      const s = Math.min(stops.length - 2, Math.floor(t));
      const f = t - s;
      p = i * 4;
      d[p] = stops[s][0] + (stops[s + 1][0] - stops[s][0]) * f;
      d[p + 1] = stops[s][1] + (stops[s + 1][1] - stops[s][1]) * f;
      d[p + 2] = stops[s][2] + (stops[s + 1][2] - stops[s][2]) * f;
    }
  } else {
    for (i = 0; i < n; i++) {
      p = i * 4;
      let r = d[p];
      let g = d[p + 1];
      let b = d[p + 2];
      const l2 = lum[i];
      if (gradeName === 'posterInk') {
        r = posterize(clamp255((r - 128) * 1.28 + 128), 3);
        g = posterize(clamp255((g - 128) * 1.28 + 128), 3) * 0.96;
        b = posterize(clamp255((b - 128) * 1.28 + 128), 3) * 1.06;
      } else if (gradeName === 'splitTone') {
        if (l2 < 128) {
          r = r * 0.82;
          g = g * 1.08 + 8;
          b = b * 1.18 + 10;
        } else {
          r = r * 1.14 + 10;
          g = g * 1.0;
          b = b * 0.82;
        }
      } else if (gradeName === 'neon') {
        const avg = (r + g + b) / 3;
        r = clamp255(avg + (r - avg) * 1.6) * 1.06;
        g = clamp255(avg + (g - avg) * 1.6);
        b = clamp255(avg + (b - avg) * 1.6) * 1.16;
      } else if (gradeName === 'sunset') {
        r = r * 1.14 + 12;
        g = g * 1.02;
        b = b * 0.84;
      } else if (gradeName === 'noir') {
        const v = clamp255((l2 - 128) * 1.32 + 128);
        r = v;
        g = v;
        b = v;
      } else {
        // vivid: saturation and contrast lift.
        const a2 = (r + g + b) / 3;
        r = clamp255((a2 + (r - a2) * 1.35 - 128) * 1.12 + 128);
        g = clamp255((a2 + (g - a2) * 1.35 - 128) * 1.12 + 128);
        b = clamp255((a2 + (b - a2) * 1.35 - 128) * 1.12 + 128);
      }
      d[p] = clamp255(r);
      d[p + 1] = clamp255(g);
      d[p + 2] = clamp255(b);
    }
  }
  ctx.putImageData(img, 0, 0);
  if (gradeName === 'sunset' || gradeName === 'heatwave') {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, 'rgba(255,150,60,0)');
    grad.addColorStop(1, 'rgba(255,90,30,0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (gradeName === 'noir') {
    const vg = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.35,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Every layout returns panels as {x, y, w, h, angle} in pixels.
export function layoutPanels(name, W, H) {
  const g = Math.max(4, Math.round(W * 0.008));
  const thirdW = (W - 2 * g) / 3;
  const thirdH = (H - 2 * g) / 3;
  if (name === 'nine') {
    const cells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push({ x: c * (thirdW + g), y: r * (thirdH + g), w: thirdW, h: thirdH, angle: 0 });
      }
    }
    return cells;
  }
  if (name === 'angled') {
    return [
      { x: 0, y: 0, w: W * 0.52, h: H * 0.55, angle: -2 },
      { x: W * 0.52 + g, y: 0, w: W * 0.48 - g, h: H * 0.55, angle: 2 },
      { x: 0, y: H * 0.55 + g, w: thirdW, h: H * 0.45 - g, angle: 0 },
      { x: thirdW + g, y: H * 0.55 + g, w: thirdW, h: H * 0.45 - g, angle: -1 },
      { x: 2 * (thirdW + g), y: H * 0.55 + g, w: thirdW, h: H * 0.45 - g, angle: 1 },
    ];
  }
  if (name === 'duo') {
    return [
      { x: 0, y: 0, w: (W - g) / 2, h: H, angle: 0 },
      { x: (W - g) / 2 + g, y: 0, w: (W - g) / 2, h: H, angle: 0 },
    ];
  }
  if (name === 'triptych') {
    return [
      { x: 0, y: 0, w: thirdW, h: H, angle: 0 },
      { x: thirdW + g, y: 0, w: thirdW, h: H, angle: 0 },
      { x: 2 * (thirdW + g), y: 0, w: thirdW, h: H, angle: 0 },
    ];
  }
  if (name === 'banner') {
    return [
      { x: 0, y: 0, w: W, h: H * 0.58, angle: 0 },
      { x: 0, y: H * 0.58 + g, w: thirdW, h: H * 0.42 - g, angle: 0 },
      { x: thirdW + g, y: H * 0.58 + g, w: thirdW, h: H * 0.42 - g, angle: 0 },
      { x: 2 * (thirdW + g), y: H * 0.58 + g, w: thirdW, h: H * 0.42 - g, angle: 0 },
    ];
  }
  if (name === 'strip') {
    return [
      { x: 0, y: 0, w: W * 0.38, h: thirdH, angle: 0 },
      { x: 0, y: thirdH + g, w: W * 0.38, h: thirdH, angle: 0 },
      { x: 0, y: 2 * (thirdH + g), w: W * 0.38, h: thirdH, angle: 0 },
      { x: W * 0.38 + g, y: 0, w: W * 0.62 - g, h: H, angle: 0 },
    ];
  }
  // hero (default): one big character panel, four small ones.
  const smallW = (W * 0.425 - g) / 2;
  const smallH = (H - g) / 2;
  const rx = W * 0.575 + g;
  return [
    { x: 0, y: 0, w: W * 0.575, h: H, angle: 0 },
    { x: rx, y: 0, w: smallW, h: smallH, angle: 0 },
    { x: rx + smallW + g, y: 0, w: smallW, h: smallH, angle: 0 },
    { x: rx, y: smallH + g, w: smallW, h: smallH, angle: 0 },
    { x: rx + smallW + g, y: smallH + g, w: smallW, h: smallH, angle: 0 },
  ];
}

// A striped retro sun on its own canvas, so the stripes stay transparent.
export function drawRetroSun(ctx, cx, cy, r) {
  const sun = document.createElement('canvas');
  sun.width = Math.ceil(r * 2);
  sun.height = Math.ceil(r * 2);
  const s = sun.getContext('2d');
  const grad = s.createLinearGradient(0, 0, 0, r * 2);
  grad.addColorStop(0, '#fff6bf');
  grad.addColorStop(0.45, '#ffb03d');
  grad.addColorStop(1, '#ff4d8d');
  s.fillStyle = grad;
  s.beginPath();
  s.arc(r, r, r, 0, Math.PI * 2);
  s.fill();
  s.globalCompositeOperation = 'destination-out';
  const stripes = 4;
  for (let i = 0; i < stripes; i++) {
    const y = r + r * 0.08 + i * ((r * 0.9) / stripes);
    const bh = 3 + i * (r * 0.045);
    s.fillRect(0, y, r * 2, bh);
  }
  ctx.drawImage(sun, cx - r, cy - r);
}

function fitFont(ctx, text, maxWidth, startSize, family) {
  let size = startSize;
  ctx.font = '400 ' + size + 'px ' + family;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = '400 ' + size + 'px ' + family;
  }
  return size;
}

function drawTitleBlock(ctx, W, H, title, tagline) {
  const th = Math.max(96, Math.round(H * 0.17));
  const y0 = H - th;
  ctx.save();
  ctx.fillStyle = 'rgba(12,5,26,0.78)';
  ctx.fillRect(0, y0, W, th);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, y0, W, 4);
  ctx.fillStyle = '#ff5db1';
  for (let dx = W * 0.06; dx < W * 0.94; dx += 26) {
    ctx.beginPath();
    ctx.arc(dx, y0 + 14, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const family = 'Anton, "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try {
    ctx.letterSpacing = '7px';
  } catch (e) {
    // letterSpacing is optional; the tagline still draws without it.
  }
  ctx.fillStyle = '#ffd9ec';
  ctx.font = '400 ' + Math.round(th * 0.17) + 'px ' + family;
  ctx.fillText((tagline || 'VICE CITY 2026').toUpperCase(), W / 2, y0 + th * 0.3);
  try {
    ctx.letterSpacing = '0px';
  } catch (e2) {
    // No-op.
  }
  const titleSize = fitFont(ctx, (title || 'VICE HEIST').toUpperCase(), W * 0.94, Math.round(th * 0.58), family);
  ctx.font = '400 ' + titleSize + 'px ' + family;
  ctx.shadowColor = 'rgba(255,46,136,0.85)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 4;
  ctx.lineWidth = Math.max(4, Math.round(titleSize * 0.08));
  ctx.strokeStyle = 'rgba(24,2,32,0.9)';
  ctx.strokeText((title || 'VICE HEIST').toUpperCase(), W / 2, y0 + th * 0.68);
  ctx.fillStyle = '#ffffff';
  ctx.fillText((title || 'VICE HEIST').toUpperCase(), W / 2, y0 + th * 0.68);
  ctx.restore();
}

// Cover-fit an image into a panel rect, with pan (ox/oy fractions) and zoom.
function drawPhotoInto(ctx, img, panel, view) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const zoom = (view && view.zoom) || 1;
  const ox = (view && view.ox) || 0;
  const oy = (view && view.oy) || 0;
  const scale = Math.max(panel.w / iw, panel.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = panel.x + (panel.w - dw) / 2 + ox * panel.w;
  const dy = panel.y + (panel.h - dh) / 2 + oy * panel.h;
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Grade a photo into a panel-sized offscreen canvas, then stamp it down.
function stampPanel(ctx, img, panel, gradeName, view) {
  const w = Math.max(2, Math.round(panel.w));
  const h = Math.max(2, Math.round(panel.h));
  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const t = tmp.getContext('2d');
  drawPhotoInto(t, img, { x: 0, y: 0, w, h }, view);
  applyGrade(tmp, gradeName);
  const cx = panel.x + panel.w / 2;
  const cy = panel.y + panel.h / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (panel.angle) ctx.rotate((panel.angle * Math.PI) / 180);
  if (panel.angle) {
    ctx.beginPath();
    ctx.rect(-panel.w / 2, -panel.h / 2, panel.w, panel.h);
    ctx.clip();
    ctx.drawImage(tmp, -panel.w * 0.65, -panel.h * 0.65, panel.w * 1.3, panel.h * 1.3);
  } else {
    ctx.drawImage(tmp, -panel.w / 2, -panel.h / 2, panel.w, panel.h);
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 3;
  ctx.strokeRect(panel.x + 1.5, panel.y + 1.5, panel.w - 3, panel.h - 3);
  ctx.restore();
}

// photos: [{img, kind}] already ordered character-first by the caller.
// views: optional per-panel {zoom, ox, oy} keyed by panel index.
export function drawCover(canvas, photos, opts) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const layout = (opts && opts.layout) || 'hero';
  const gradeName = (opts && opts.grade) || 'comicInk';
  const panels = layoutPanels(layout, W, H);
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, W, H);
  let sunPanel = -1;
  for (let i = 0; i < panels.length; i++) {
    if (photos[i % photos.length] && photos[i % photos.length].kind === 'scene') {
      sunPanel = i;
      break;
    }
  }
  for (let i = 0; i < panels.length; i++) {
    const photo = photos[i % photos.length];
    if (!photo || !photo.img) continue;
    const view = opts && opts.views ? opts.views[i] : null;
    stampPanel(ctx, photo.img, panels[i], gradeName, view);
    if (i === sunPanel) {
      const r = Math.min(panels[i].w, panels[i].h) * 0.26;
      drawRetroSun(ctx, panels[i].x + panels[i].w * 0.74, panels[i].y + panels[i].h * 0.2, r);
    }
  }
  drawTitleBlock(ctx, W, H, opts && opts.title, opts && opts.tagline);
  ctx.save();
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(6, Math.round(W * 0.006));
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.restore();
}
