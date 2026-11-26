// Renders the PNG app icons from the SVG sources with headless Chrome.
// Usage: node tools/make-icons.mjs   (needs google-chrome on PATH)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const jobs = [
  ['icon.svg', 'icon-192.png', 192], ['icon.svg', 'icon-512.png', 512],
  ['icon-maskable.svg', 'icon-maskable-512.png', 512], ['icon-maskable.svg', 'apple-touch-icon.png', 180],
];
const dir = mkdtempSync(join(tmpdir(), 'icons-'));
for (const [src, out, size] of jobs) {
  const svg = readFileSync(join(root, 'icons', src), 'utf8');
  const page = join(dir, `${out}.html`);
  writeFileSync(page, `<html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div></body></html>`);
  execFileSync('google-chrome', ['--headless=new', '--no-sandbox', '--hide-scrollbars', '--default-background-color=00000000',
    `--window-size=${size},${size}`, `--screenshot=${join(root, 'icons', out)}`, `file://${page}`], { stdio: 'ignore' });
  console.log('wrote icons/' + out);
}
