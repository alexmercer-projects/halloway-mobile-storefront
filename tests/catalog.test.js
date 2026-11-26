import { test } from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../data/products.js';
import { browseProducts, filterProducts, searchProducts, sortProducts } from '../js/catalog.js';

const names = list => list.map(p => p.name);

test('empty search returns every product', () => {
  assert.equal(searchProducts(products, '  ').length, products.length);
});

test('search matches names, materials and tags, all words required', () => {
  assert.ok(names(searchProducts(products, 'tote')).includes('The Mill Tote'));
  assert.ok(searchProducts(products, 'brass').length >= 5);
  assert.ok(names(searchProducts(products, 'made to order')).includes('The Rivet Belt'));
  assert.deepEqual(names(searchProducts(products, 'beeswax jar')), ['The Beeswax Candle']);
  assert.equal(searchProducts(products, 'zzzz').length, 0);
});

test('category filter uses the slug', () => {
  const bags = filterProducts(products, { category: 'bags' });
  assert.ok(bags.length >= 3);
  assert.ok(bags.every(p => p.category === 'Bags'));
});

test('price range is inclusive and in cents', () => {
  const list = filterProducts(products, { min: 3000, max: 6600 });
  assert.ok(list.length > 0);
  assert.ok(list.every(p => p.price_cents >= 3000 && p.price_cents <= 6600));
  assert.ok(names(list).includes('The Rivet Belt'));
});

test('color filter with in-stock needs a variant that is both', () => {
  const charcoalInStock = filterProducts(products, { color: 'Charcoal', inStock: true });
  assert.ok(!names(charcoalInStock).includes('The Mill Tote'), 'charcoal tote is sold out');
  assert.ok(names(filterProducts(products, { color: 'Charcoal' })).includes('The Mill Tote'));
});

test('sorting by price both ways and by newest', () => {
  const up = sortProducts(products, 'price-asc').map(p => p.price_cents);
  assert.deepEqual(up, [...up].sort((a, b) => a - b));
  const down = sortProducts(products, 'price-desc').map(p => p.price_cents);
  assert.deepEqual(down, [...down].sort((a, b) => b - a));
  const newest = sortProducts(products, 'newest').map(p => p.added);
  assert.deepEqual(newest, [...newest].sort().reverse());
  assert.deepEqual(sortProducts(products), products);
});

test('browse combines search, filter and sort without mutating the catalog', () => {
  const before = names(products);
  const list = browseProducts(products, { query: 'leather', category: 'small-leather-goods', sort: 'price-asc' });
  assert.ok(list.length >= 2);
  assert.ok(list.every(p => p.category === 'Small leather goods'));
  assert.ok(list[0].price_cents <= list.at(-1).price_cents);
  assert.deepEqual(names(products), before);
});
