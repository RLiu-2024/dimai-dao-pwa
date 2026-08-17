// Dependency-free PNG icon generator for dimai-dao-pwa.
// Draws the 乾 (Qián) hexagram — six solid gold bars — on the app's dark background.
const zlib = require('zlib');
const fs = require('fs');

function crc32(buf) {
  if (!crc32.table) {
    crc32.table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      crc32.table[n] = c >>> 0;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crc32.table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// Background #16130F, gold #C9A24B
function makeIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    buf[i * 4] = 22; buf[i * 4 + 1] = 19; buf[i * 4 + 2] = 15; buf[i * 4 + 3] = 255;
  }
  const barW = Math.round(size * 0.5);
  const barH = Math.max(2, Math.round(size * 0.05));
  const gap = Math.round(size * 0.055);
  const stackH = 6 * barH + 5 * gap;
  const startY = Math.round((size - stackH) / 2);
  const x0 = Math.round((size - barW) / 2);
  for (let i = 0; i < 6; i++) {
    const y0 = startY + i * (barH + gap);
    for (let y = y0; y < y0 + barH; y++) {
      for (let x = x0; x < x0 + barW; x++) {
        const o = (y * size + x) * 4;
        buf[o] = 201; buf[o + 1] = 162; buf[o + 2] = 75; buf[o + 3] = 255;
      }
    }
  }
  return encodePNG(size, size, buf);
}

fs.writeFileSync('icon-192.png', makeIcon(192));
fs.writeFileSync('icon-512.png', makeIcon(512));
fs.writeFileSync('icon-maskable-512.png', makeIcon(512));
fs.writeFileSync('apple-touch-icon.png', makeIcon(180));
console.log('Icons generated: icon-192, icon-512, icon-maskable-512, apple-touch-icon');
