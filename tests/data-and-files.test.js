import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { products, categories, palettes } from '../data/products.js';

const root = resolve(import.meta.dirname, '..');
const read = p => readFileSync(join(root, p), 'utf8');

test('product ids and slugs are unique', () => {
  assert.equal(new Set(products.map(p => p.id)).size, products.length);
  assert.equal(new Set(products.map(p => p.slug)).size, products.length);
});

test('every product is in a known category and has the fields the pages need', () => {
  const cats = new Set(categories.map(c => c.name));
  for (const p of products) {
    assert.ok(cats.has(p.category), p.name);
    for (const key of ['name', 'blurb', 'description', 'care', 'dimensions']) assert.ok(p[key]?.length > 3, `${p.name} ${key}`);
    assert.ok(p.materials.length > 0, p.name);
  }
});

test('prices are whole cents and compare-at is higher when present', () => {
  for (const p of products) {
    assert.ok(Number.isSafeInteger(p.price_cents) && p.price_cents > 0, p.name);
    if (p.compare_at_cents) assert.ok(p.compare_at_cents > p.price_cents, p.name);
  }
});

test('every variant has stock, a unique id and a palette to draw with', () => {
  for (const p of products) {
    assert.equal(new Set(p.variants.map(v => v.id)).size, p.variants.length, p.name);
    for (const v of p.variants) {
      assert.ok(Number.isInteger(v.stock) && v.stock >= 0, `${p.name} ${v.id}`);
      assert.ok(p.art.palettes[v.color] && palettes[v.color], `${p.name} ${v.color}`);
    }
  }
});

test('the catalog has a sold-out variant and a low-stock variant to show those states', () => {
  const all = products.flatMap(p => p.variants);
  assert.ok(all.some(v => v.stock === 0));
  assert.ok(all.some(v => v.stock > 0 && v.stock <= 2));
});

function walk(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]);
}

test('no em dashes in any shipped text file', () => {
  const files = ['index.html', 'README.md', 'manifest.webmanifest', 'sw.js', ...walk('js'), ...walk('css'), ...walk('data')];
  for (const f of files) assert.ok(!read(f).includes('\u2014'), f);
});

test('every file the service worker precaches exists', () => {
  const list = [...read('sw.js').matchAll(/^\s+'([^']+)',?$/gm)].map(m => m[1]);
  assert.ok(list.length > 10);
  for (const f of list) if (f !== './') assert.ok(existsSync(join(root, f)), f);
  for (const f of walk('js')) assert.ok(list.includes(f), `${f} missing from precache`);
});

test('the manifest is installable and stays inside the subpath', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.equal(m.start_url, './');
  assert.equal(m.scope, './');
  assert.equal(m.display, 'standalone');
  assert.ok(m.icons.some(i => i.sizes === '192x192'));
  assert.ok(m.icons.some(i => i.sizes === '512x512' && !i.purpose));
  assert.ok(m.icons.some(i => i.purpose === 'maskable'));
  for (const i of m.icons) assert.ok(existsSync(join(root, i.src)), i.src);
});

test('the page is marked noindex, carries the demo bar and makes no outside requests', () => {
  const html = read('index.html');
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.match(html, /class="am-demo-bar"/);
  assert.match(html, /Checkout is a demo and takes no payment/);
  const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
  assert.ok(urls.every(u => !/^(https?:)?\/\//.test(u)), 'no absolute URLs');
  for (const f of [...walk('js'), ...walk('css')]) assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(read(f)), f);
});
