#!/usr/bin/env node
'use strict';

// Data-integrity guard for dimai-dao-pwa.
// Run on every push so a broken/truncated DATA array can never ship silently.
// Usage: node validate.js

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('validate: index.html not found next to validate.js');
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

const m = html.match(/const DATA = (\[[\s\S]*?\]);/);
if (!m) {
  console.error('validate: DATA array not found in index.html');
  process.exit(1);
}

let DATA;
try {
  DATA = JSON.parse(m[1]);
} catch (e) {
  console.error('validate: DATA is not valid JSON ->', e.message);
  process.exit(1);
}

const REQUIRED = ['seq', 'name', 'hex', 'gl', 'upn', 'upa', 'lon', 'loa',
  'gs', 'tg', 'yg', 'composition', 'pinyin', 'jw', 'yuan', 'tuan',
  'yao', 'xiang_da', 'xiang_xiao'];

const errors = [];
const seqs = new Set();

if (!Array.isArray(DATA) || DATA.length !== 64) {
  errors.push(`Expected 64 entries, got ${Array.isArray(DATA) ? DATA.length : 'non-array'}`);
}

for (const d of DATA) {
  if (seqs.has(d.seq)) errors.push(`Duplicate seq ${d.seq}`);
  seqs.add(d.seq);

  for (const k of REQUIRED) {
    if (!(k in d) || d[k] === '' || d[k] == null) {
      errors.push(`#${d.seq} missing/empty field "${k}"`);
    }
  }
  if (d.gl && !/^[NY]{6}$/.test(d.gl)) {
    errors.push(`#${d.seq} invalid gl encoding: ${d.gl}`);
  }
  if (d.yao && d.xiang_xiao && d.yao.length !== d.xiang_xiao.length) {
    errors.push(`#${d.seq} yao(${d.yao.length}) vs xiang_xiao(${d.xiang_xiao.length}) length mismatch`);
  }
}

for (let i = 1; i <= 64; i++) {
  if (!seqs.has(i)) errors.push(`Missing seq ${i}`);
}

const hexes = new Set(DATA.map(d => d.hex));
if (hexes.size !== 64) {
  errors.push(`Expected 64 unique hex glyphs, got ${hexes.size}`);
}

if (errors.length) {
  console.error('DATA VALIDATION FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`OK: 64 hexagrams validated (${hexes.size} unique glyphs).`);
