import { byId, img } from '../data';

function loadImage(src) {
  return new Promise((resolve) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function fontsReady() {
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }
}

// Builds a shareable "seating chart" postcard of the final arrangement.
export async function renderSeatingCard({ seating, seats, playerName }) {
  await fontsReady();
  const W = 1600;
  const H = 1180;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // paper
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#ffcf9a');
  grad.addColorStop(0.45, '#ffb3a0');
  grad.addColorStop(1, '#c9a6e8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // title
  ctx.fillStyle = '#18221f';
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EAT, SLEEP… EN-DRIVE  ·  ROAD TRIP SEATING CHART', W / 2, 62);
  ctx.font = '800 64px "Bricolage Grotesque", sans-serif';
  const who = (playerName || 'Our').trim();
  ctx.fillText(`${who}${who.toLowerCase().endsWith('s') ? '’' : '’s'} road trip crew`, W / 2, 132);

  // car frame
  const cx = 60;
  const cy = 170;
  const cw = W - 120;
  const ch = Math.round(cw * (9 / 16));
  ctx.save();
  ctx.fillStyle = '#18221f';
  roundRect(ctx, cx + 10, cy + 14, cw, ch, 36);
  ctx.fill();
  roundRect(ctx, cx, cy, cw, ch, 36);
  ctx.clip();
  const car = await loadImage(img.carTop);
  if (car) ctx.drawImage(car, cx, cy, cw, ch);
  else {
    ctx.fillStyle = '#333';
    ctx.fillRect(cx, cy, cw, ch);
  }
  ctx.restore();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#18221f';
  roundRect(ctx, cx, cy, cw, ch, 36);
  ctx.stroke();

  // enchins on seats
  const flowers = await Promise.all(
    seats.map((s) => (seating[s.id] ? loadImage(img.flower(seating[s.id])) : Promise.resolve(null))),
  );
  seats.forEach((seat, i) => {
    const e = byId(seating[seat.id]);
    const px = cx + (seat.x / 100) * cw;
    const py = cy + (seat.y / 100) * ch;
    const r = 100;
    if (e) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, r * 0.95, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#18221f';
      ctx.stroke();
      ctx.restore();
      const f = flowers[i];
      if (f) {
        const s = r * 1.75;
        ctx.drawImage(f, px - s / 2, py - s / 2, s, s * (f.height / f.width));
      }
    }
    // label
    const label = seat.id === 'seat1' ? `DRIVER · ${e?.name?.toUpperCase() || ''}` : `${seat.label.toUpperCase()} · ${e?.name?.toUpperCase() || ''}`;
    ctx.font = '700 18px "Space Mono", monospace';
    const tw = ctx.measureText(label).width + 30;
    const lx = px - tw / 2;
    const ly = py + r - 6;
    ctx.fillStyle = seat.id === 'seat1' ? '#d52e45' : '#fffdf7';
    roundRect(ctx, lx, ly, tw, 38, 19);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#18221f';
    ctx.stroke();
    ctx.fillStyle = seat.id === 'seat1' ? '#fffdf7' : '#18221f';
    ctx.textAlign = 'center';
    ctx.fillText(label, px, ly + 26);
  });

  // footer
  const driver = byId(seating.seat1);
  ctx.fillStyle = '#18221f';
  ctx.font = '800 44px "Bricolage Grotesque", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(driver ? `${driver.name} called shotgun on the steering wheel.` : 'Road trip ready.', W / 2, cy + ch + 90);
  ctx.font = '700 20px "Space Mono", monospace';
  ctx.fillText('MISSION 2 · STOP 01 · WAITING SHED', W / 2, cy + ch + 130);

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), 'image/png');
    } catch {
      resolve(null);
    }
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadUrl(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Mobile-friendly save: uses the native share sheet when available (lets people
// "Save Image" to their camera roll), otherwise downloads the file.
export async function saveImage({ blob, url, filename }) {
  try {
    let b = blob;
    if (!b && url) {
      const res = await fetch(url);
      b = await res.blob();
    }
    if (b) {
      const file = new File([b], filename, { type: b.type || 'image/png' });
      const coarse = window.matchMedia?.('(pointer: coarse)').matches;
      if (coarse && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Eat, Sleep… EN-Drive' });
        return true;
      }
      downloadBlob(b, filename);
      return true;
    }
  } catch (err) {
    if (err?.name === 'AbortError') return false; // user closed the share sheet
  }
  if (url) {
    downloadUrl(url, filename);
    return true;
  }
  return false;
}

/* =====================================================================
   INSTAX-STYLE PHOTO CARDS
   ===================================================================== */

const INK = '#18221f';
const CREAM = '#fffdf7';

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts?.load('700 60px "Caveat"'),
      document.fonts?.load('800 60px "Bricolage Grotesque"'),
      document.fonts?.load('700 20px "Space Mono"'),
      document.fonts?.load('600 20px "DM Sans"'),
    ]);
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }
}

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const m = (c) => Math.round(c + (255 - c) * amt);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

function wrapLines(ctx, text, maxW) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

function fitFont(ctx, text, weight, family, start, maxW, min = 20) {
  let size = start;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > min) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawBackdrop(ctx, W, H, color) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, lighten(color, 0.55));
  g.addColorStop(0.5, '#ffe3cc');
  g.addColorStop(1, lighten(color, 0.3));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // dot grid
  ctx.fillStyle = 'rgba(24, 34, 31, 0.08)';
  for (let y = 20; y < H; y += 36) for (let x = 20 + ((y / 36) % 2) * 18; x < W; x += 36) {
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // confetti
  const colors = ['#e53946', '#f8cf63', '#8ed9b2', '#9b87f5', '#8ed8ef', '#f48fb1'];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 34; i++) {
    ctx.save();
    ctx.translate(rnd() * W, rnd() * H);
    ctx.rotate(rnd() * Math.PI);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.55;
    ctx.fillRect(-9, -4, 18, 8);
    ctx.restore();
  }
}

function drawHeader(ctx, W, y, kicker, title, sub) {
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = '700 24px "Space Mono", monospace';
  ctx.fillText(kicker, W / 2, y);
  const size = fitFont(ctx, title, 800, '"Bricolage Grotesque", sans-serif', 66, W - 120, 34);
  ctx.fillText(title, W / 2, y + size + 14);
  let end = y + size + 14;
  if (sub) {
    ctx.font = '600 30px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(24, 34, 31, 0.78)';
    const lines = wrapLines(ctx, sub, W - 180);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, end + 50 + i * 38));
    end += 50 + (lines.length - 1) * 38;
  }
  return end;
}

// Instax Wide film: landscape photo with a thick bottom border for the caption.
async function drawFilm(ctx, { x, y, w, rot, photo, caption, signature, tape = true }) {
  const pad = Math.round(w * 0.045);
  const iw = w - pad * 2;
  const ih = Math.round(iw * 0.6);
  const bottom = Math.round(w * 0.2);
  const h = pad + ih + bottom;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.translate(-w / 2, -h / 2);
  // shadow
  ctx.fillStyle = 'rgba(24, 34, 31, 0.28)';
  roundRect(ctx, 10, 16, w, h, 14);
  ctx.fill();
  // film body
  ctx.fillStyle = '#fbfaf5';
  roundRect(ctx, 0, 0, w, h, 14);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(24, 34, 31, 0.25)';
  ctx.stroke();
  // photo
  ctx.save();
  roundRect(ctx, pad, pad, iw, ih, 6);
  ctx.clip();
  ctx.fillStyle = '#222';
  ctx.fillRect(pad, pad, iw, ih);
  if (photo) {
    const s = Math.max(iw / photo.width, ih / photo.height);
    const dw = photo.width * s;
    const dh = photo.height * s;
    ctx.drawImage(photo, pad + (iw - dw) / 2, pad + (ih - dh) / 2, dw, dh);
  }
  // soft film glow
  const gl = ctx.createLinearGradient(pad, pad, pad + iw, pad + ih);
  gl.addColorStop(0, 'rgba(255, 220, 180, 0.18)');
  gl.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gl;
  ctx.fillRect(pad, pad, iw, ih);
  ctx.restore();
  // caption (handwritten)
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  const capSize = fitFont(ctx, caption, 700, '"Caveat", cursive', Math.round(w * 0.075), iw - 20, 30);
  const capY = pad + ih + bottom * 0.5 + capSize * 0.2;
  ctx.fillText(caption, w / 2, capY);
  if (signature) {
    ctx.font = `600 ${Math.round(w * 0.034)}px "Caveat", cursive`;
    ctx.fillStyle = 'rgba(24, 34, 31, 0.6)';
    ctx.textAlign = 'right';
    ctx.fillText(signature, w - pad - 6, pad + ih + bottom - 18);
  }
  // washi tape
  if (tape) {
    ctx.save();
    ctx.translate(w / 2, -4);
    ctx.rotate(-0.05);
    ctx.fillStyle = 'rgba(248, 207, 99, 0.85)';
    ctx.fillRect(-90, -20, 180, 42);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = -90; i < 90; i += 18) ctx.fillRect(i, -20, 8, 42);
    ctx.restore();
  }
  ctx.restore();
  return { h, bottomY: y + h };
}

// A die-cut sticker: white outline + ink border around an item image.
function drawSticker(ctx, image, { cx, cy, maxW, maxH, rot = 0 }) {
  if (!image) return;
  const s = Math.min(maxW / image.width, maxH / image.height);
  const w = image.width * s;
  const h = image.height * s;
  const p = 18;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(24, 34, 31, 0.3)';
  roundRect(ctx, -w / 2 - p + 6, -h / 2 - p + 9, w + p * 2, h + p * 2, 26);
  ctx.fill();
  ctx.fillStyle = CREAM;
  roundRect(ctx, -w / 2 - p, -h / 2 - p, w + p * 2, h + p * 2, 26);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.drawImage(image, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawBadge(ctx, { cx, cy, r, color, top, big, rot = 0 }) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(24, 34, 31, 0.3)';
  ctx.beginPath();
  ctx.arc(5, 8, r, 0, Math.PI * 2);
  ctx.fill();
  // scalloped edge
  ctx.beginPath();
  const n = 18;
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r : r * 0.9;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = `700 ${Math.round(r * 0.2)}px "Space Mono", monospace`;
  ctx.fillText(top, 0, -r * 0.18);
  ctx.font = `800 ${Math.round(r * 0.42)}px "Bricolage Grotesque", sans-serif`;
  ctx.fillText(big, 0, r * 0.28);
  ctx.restore();
}

function drawFooter(ctx, W, H) {
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = '700 22px "Space Mono", monospace';
  ctx.fillText('EAT, SLEEP… EN-DRIVE  ·  #EMGP2026', W / 2, H - 40);
}

const CARD_W = 1200;

/**
 * Mini-game instax card.
 * kind: 'mg1' | 'mg2' | 'mg3'
 */
export async function renderInstaxCard({ kind, enchinId, playerName, picks = [] }) {
  await loadFonts();
  const e = byId(enchinId);
  const name = playerName || 'You';
  const W = CARD_W;
  const H = kind === 'mg3' ? 1560 : 1500;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  drawBackdrop(ctx, W, H, e.color);

  const cfg = {
    mg1: { kicker: 'MINI GAME 1', title: 'SEAT THE ENCHIN', sub: null, caption: `${e.name} took the wheel`, badge: ['DRIVER', '+3'] },
    mg2: { kicker: 'MINI GAME 2', title: 'ROAD TRIP QUIZ', sub: null, caption: `Looks like ${e.name} could be driving…`, badge: ['QUIZ', 'TOP'] },
    mg3: {
      kicker: 'MINI GAME 3',
      title: 'PICK YOUR AESTHETIC',
      sub: `${name}, your road-trip style is ready for a photo shoot.`,
      caption: `You really have that Team ${e.name} vibes.`,
      badge: ['TEAM', e.name.toUpperCase()],
    },
  }[kind];

  const headEnd = drawHeader(ctx, W, 92, 'EAT, SLEEP… EN-DRIVE  ·  MISSION 2', `${cfg.kicker} : ${cfg.title}`, cfg.sub);

  const crewIds = ['wonchu', 'noxstar', 'jakey', 'snowe', 'kishu', 'pu-ni'];
  const [photo, flower, crew, ...items] = await Promise.all([
    loadImage(img.driverPng(e.id)),
    loadImage(img.flower(e.id)),
    Promise.all(crewIds.map((id) => loadImage(img.flower(id)))),
    ...picks.map((p) => loadImage(img[p.kind](e.id))),
  ]);

  const filmW = 960;
  const filmY = Math.max(headEnd + 76, 250);
  const film = await drawFilm(ctx, {
    x: (W - filmW) / 2,
    y: filmY,
    w: filmW,
    rot: -0.035,
    photo,
    caption: cfg.caption,
    signature: `— ${name}`,
  });

  // stickers around the film
  if (flower) {
    const fw = 190;
    ctx.save();
    ctx.translate(W - 150, film.bottomY + 45);
    ctx.rotate(0.18);
    ctx.shadowColor = 'rgba(24,34,31,0.35)';
    ctx.shadowOffsetY = 8;
    ctx.drawImage(flower, -fw / 2, -fw / 2, fw, fw * (flower.height / flower.width));
    ctx.restore();
  }
  drawBadge(ctx, { cx: 150, cy: film.bottomY + 50, r: 100, color: e.color, top: cfg.badge[0], big: cfg.badge[1], rot: -0.2 });

  // item stickers (MG3): the picks that belong to the winning Enchin
  const spots = [
    { cx: 460, cy: film.bottomY + 110, maxW: 250, maxH: 140, rot: -0.08 },
    { cx: 800, cy: film.bottomY + 120, maxW: 290, maxH: 140, rot: 0.07 },
    { cx: 130, cy: filmY + 120, maxW: 150, maxH: 150, rot: -0.14 },
    { cx: W - 120, cy: filmY + 150, maxW: 150, maxH: 150, rot: 0.12 },
  ];
  items.forEach((im, i) => drawSticker(ctx, im, spots[i % spots.length]));

  if (kind !== 'mg3') {
    // name tag
    const tag = `${e.name.toUpperCase()} · ${e.team.toUpperCase()}`;
    ctx.font = '700 26px "Space Mono", monospace';
    const tw = ctx.measureText(tag).width + 50;
    const tx = W / 2 + 40 - tw / 2;
    const ty = film.bottomY + 80;
    ctx.save();
    ctx.translate(tx + tw / 2, ty + 28);
    ctx.rotate(0.03);
    ctx.fillStyle = 'rgba(24,34,31,0.3)';
    roundRect(ctx, -tw / 2 + 5, -28 + 7, tw, 56, 28);
    ctx.fill();
    ctx.fillStyle = e.color;
    roundRect(ctx, -tw / 2, -28, tw, 56, 28);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.fillText(tag, 0, 9);
    ctx.restore();
  }

  // the whole crew along the bottom
  const cy = H - 175;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(24, 34, 31, 0.7)';
  ctx.font = '700 20px "Space Mono", monospace';
  ctx.fillText('THE ROAD TRIP CREW', W / 2, cy - 72);
  const size = 108;
  const gap = 30;
  const total = crewIds.length * size + (crewIds.length - 1) * gap;
  crewIds.forEach((id, i) => {
    const f = crew[i];
    const x = (W - total) / 2 + i * (size + gap);
    const on = id === e.id;
    if (on) {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(x + size / 2, cy + 6, size * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = INK;
      ctx.stroke();
    }
    if (f) {
      ctx.globalAlpha = on ? 1 : 0.85;
      const s2 = on ? size * 1.08 : size * 0.9;
      ctx.drawImage(f, x + (size - s2) / 2, cy + 6 - s2 / 2, s2, s2 * (f.height / f.width));
      ctx.globalAlpha = 1;
    }
  });

  drawFooter(ctx, W, H);
  return canvas;
}

/** Final "chosen driver" card with the final standings. */
export async function renderFinalCard({ driverId, playerName, ranked }) {
  await loadFonts();
  const e = byId(driverId);
  const name = playerName || 'You';
  const W = CARD_W;
  const H = 1860;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  drawBackdrop(ctx, W, H, e.color);

  drawHeader(ctx, W, 92, 'EAT, SLEEP… EN-DRIVE  ·  MISSION 2 COMPLETE', 'MY CHOSEN ENCHIN DRIVER', `${name}'s road trip is officially in ${e.name}'s hands.`);

  const [photo, ...flowers] = await Promise.all([loadImage(img.driverPng(e.id)), ...ranked.map((r) => loadImage(img.flower(r.id)))]);

  const filmW = 940;
  const filmY = 300;
  const film = await drawFilm(ctx, {
    x: (W - filmW) / 2,
    y: filmY,
    w: filmW,
    rot: 0.03,
    photo,
    caption: `${e.name} is driving!`,
    signature: `— ${name}`,
  });
  drawBadge(ctx, { cx: W - 140, cy: filmY + 20, r: 118, color: e.color, top: 'DRIVER', big: '#1', rot: 0.2 });

  // standings panel
  const px = 110;
  const pw = W - 220;
  const py = film.bottomY + 70;
  const rowH = 86;
  const ph = 110 + ranked.length * rowH;
  ctx.fillStyle = INK;
  roundRect(ctx, px + 8, py + 12, pw, ph, 30);
  ctx.fill();
  ctx.fillStyle = CREAM;
  roundRect(ctx, px, py, pw, ph, 30);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.font = '700 24px "Space Mono", monospace';
  ctx.fillText('FINAL STANDINGS', px + 40, py + 62);
  const max = Math.max(1, ...ranked.map((r) => r.points));
  ranked.forEach((r, i) => {
    const en = byId(r.id);
    const y = py + 96 + i * rowH;
    if (i === 0) {
      ctx.fillStyle = lighten(en.color, 0.45);
      roundRect(ctx, px + 20, y, pw - 40, rowH - 10, 20);
      ctx.fill();
    }
    ctx.fillStyle = INK;
    ctx.font = '700 28px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(String(i + 1), px + 44, y + 50);
    const f = flowers[i];
    if (f) ctx.drawImage(f, px + 84, y + 4, 68, 68 * (f.height / f.width));
    ctx.font = '800 36px "Bricolage Grotesque", sans-serif';
    ctx.fillText(en.name, px + 170, y + 52);
    // bar
    const bx = px + 390;
    const bw = pw - 390 - 130;
    ctx.fillStyle = 'rgba(24,34,31,0.08)';
    roundRect(ctx, bx, y + 28, bw, 22, 11);
    ctx.fill();
    ctx.fillStyle = en.color;
    roundRect(ctx, bx, y + 28, Math.max(22, (bw * r.points) / max), 22, 11);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    roundRect(ctx, bx, y + 28, bw, 22, 11);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = 'right';
    ctx.font = '800 36px "Bricolage Grotesque", sans-serif';
    ctx.fillText(`${r.points}`, px + pw - 44, y + 52);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = '700 20px "Space Mono", monospace';
  ctx.fillText(`#Team${e.papa.replace(/[^A-Za-z]/g, '')}  #EMGP2026  #MAMA2026  #ENHYPEN  #ENGENE`, W / 2, H - 66);
  ctx.fillText('#ENHYPENMAMAGRANDPRIX2026  #ROADTOENHYPENDAESANG', W / 2, H - 36);
  return canvas;
}

/** Text for the X / Twitter post. */
export function shareText(driverId) {
  const e = byId(driverId);
  const team = `#Team${e.papa.replace(/[^A-Za-z]/g, '')}`;
  return `My Mission 2 chosen driver is ${e.name}! I guess I'm gonna be a part of ${team}\n\n#EMGP2026 #MAMA2026 #ENHYPEN #ENGENE #ENHYPENMAMAGRANDPRIX2026 #ROADTOENHYPENDAESANG`;
}

/**
 * Share to X. On phones with a share sheet, share the image + text (users can
 * pick X). Everywhere else: save the picture, then open the X composer with
 * the caption pre-filled so they can attach it.
 */
export async function shareToX({ blob, filename, text }) {
  const url = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (coarse && blob) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file], text })) {
        await navigator.share({ files: [file], text });
        return 'shared';
      }
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(text)}${url && !/localhost|127\.0\.0\.1/.test(url) ? `&url=${encodeURIComponent(url)}` : ''}`;
  const win = window.open(intent, '_blank', 'noopener,noreferrer');
  if (blob) downloadBlob(blob, filename);
  return win ? 'opened' : 'blocked';
}
