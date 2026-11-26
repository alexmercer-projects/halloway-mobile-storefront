import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, STORAGE_KEY } from '../js/store.js';

class FakeStorage {
  constructor(init = {}) { this.data = new Map(Object.entries(init)); }
  getItem(k) { return this.data.has(k) ? this.data.get(k) : null; }
  setItem(k, v) { this.data.set(k, String(v)); }
  removeItem(k) { this.data.delete(k); }
}
const fresh = () => createStore({ storage: new FakeStorage() });

test('adding the same variant twice merges into one line', () => {
  const s = fresh();
  s.add('hw-01', 'field-tan', 1);
  s.add('hw-01', 'field-tan', 2);
  assert.deepEqual(s.getState().cart, [{ productId: 'hw-01', variantId: 'field-tan', quantity: 3 }]);
});

test('different variants are separate lines', () => {
  const s = fresh();
  s.add('hw-04', 'spruce-m');
  s.add('hw-04', 'spruce-l');
  assert.equal(s.getState().cart.length, 2);
});

test('a sold-out variant cannot be added', () => {
  const s = fresh();
  assert.equal(s.add('hw-01', 'charcoal', 1), 0);
  assert.equal(s.getState().cart.length, 0);
});

test('adds stop at the stock left, counting what is already in the cart', () => {
  const s = fresh();
  assert.equal(s.add('hw-01', 'spruce', 5), 2);
  assert.equal(s.add('hw-01', 'spruce', 1), 0);
  assert.equal(s.getState().cart[0].quantity, 2);
});

test('update changes quantity, clamps to stock, and zero removes', () => {
  const s = fresh();
  s.add('hw-05', 'oat', 1);
  assert.equal(s.update('hw-05', 'oat', 4), 4);
  assert.equal(s.update('hw-05', 'oat', 999), 15);
  s.update('hw-05', 'oat', 0);
  assert.equal(s.getState().cart.length, 0);
});

test('remove returns the line so it can be undone', () => {
  const s = fresh();
  s.add('hw-03', 'chestnut', 2);
  const removed = s.remove('hw-03', 'chestnut');
  assert.deepEqual(removed, { productId: 'hw-03', variantId: 'chestnut', quantity: 2 });
  s.add(removed.productId, removed.variantId, removed.quantity);
  assert.equal(s.getState().cart[0].quantity, 2);
});

test('wishlist toggles on and off and ignores unknown ids', () => {
  const s = fresh();
  assert.equal(s.toggleWishlist('hw-02'), true);
  assert.deepEqual(s.getState().wishlist, ['hw-02']);
  assert.equal(s.toggleWishlist('hw-02'), false);
  assert.equal(s.toggleWishlist('nope'), false);
  assert.deepEqual(s.getState().wishlist, []);
});

test('state survives a reload through storage', () => {
  const storage = new FakeStorage();
  const a = createStore({ storage });
  a.add('hw-01', 'field-tan', 2);
  a.toggleWishlist('hw-11');
  a.setCode('welcome10');
  const b = createStore({ storage });
  assert.deepEqual(b.getState().cart, [{ productId: 'hw-01', variantId: 'field-tan', quantity: 2 }]);
  assert.deepEqual(b.getState().wishlist, ['hw-11']);
  assert.equal(b.getState().code, 'WELCOME10');
});

test('corrupt or tampered storage falls back safely', () => {
  assert.deepEqual(createStore({ storage: new FakeStorage({ [STORAGE_KEY]: '{not json' }) }).getState().cart, []);
  const tampered = JSON.stringify({ cart: [{ productId: 'hw-01', variantId: 'spruce', quantity: 50 }, { productId: 'ghost', variantId: 'x', quantity: 1 }], wishlist: ['hw-02', 'hw-02', 'ghost'], orders: [{ id: 1 }] });
  const s = createStore({ storage: new FakeStorage({ [STORAGE_KEY]: tampered }) });
  assert.deepEqual(s.getState().cart, [{ productId: 'hw-01', variantId: 'spruce', quantity: 2 }]);
  assert.deepEqual(s.getState().wishlist, ['hw-02']);
  assert.deepEqual(s.getState().orders, []);
});

test('works with no storage at all', () => {
  const s = createStore({ storage: null });
  assert.equal(s.add('hw-01', 'field-tan'), 1);
});

test('placing an order saves it with totals and clears the cart and code', () => {
  const s = createStore({ storage: new FakeStorage(), now: () => new Date('2026-11-25T18:00:00Z') });
  s.add('hw-01', 'field-tan', 1);
  s.add('hw-04', 'spruce-m', 1);
  s.add('hw-05', 'oat', 2);
  s.setCode('MILL15');
  const order = s.placeOrder({ method: 'standard' });
  assert.match(order.id, /^HW-1042-[0-9A-F]{4}$/);
  assert.equal(order.amounts.total, 21800 - 3270 + 1343);
  assert.equal(order.lines[1].variant, 'Spruce / M');
  assert.deepEqual(s.getState().cart, []);
  assert.equal(s.getState().code, '');
  assert.equal(s.getState().orders.length, 1);
  assert.equal(s.placeOrder(), null, 'empty cart places nothing');
});

test('a storage event from another tab reloads the state', () => {
  const storage = new FakeStorage();
  const events = new EventTarget();
  const s = createStore({ storage, events });
  const other = createStore({ storage });
  other.add('hw-12', 'honey', 3);
  let heard = '';
  s.subscribe(src => { heard = src; });
  const e = new Event('storage'); e.key = STORAGE_KEY; e.storageArea = storage;
  events.dispatchEvent(e);
  assert.equal(heard, 'sync');
  assert.equal(s.getState().cart[0].quantity, 3);
});
