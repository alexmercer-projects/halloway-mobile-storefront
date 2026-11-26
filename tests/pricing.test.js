import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampQuantity, discountAmount, estimatedTax, formatCurrency, freeShippingRemaining, shippingCost, subtotal, totals, validateDiscount } from '../js/pricing.js';

const line = (price_cents, quantity) => ({ price_cents, quantity });

test('subtotal adds price times quantity in cents', () => {
  assert.equal(subtotal([line(7800, 1), line(2400, 2)]), 12600);
  assert.equal(subtotal([]), 0);
});

test('currency formats cents as dollars', () => {
  assert.equal(formatCurrency(7800), '$78.00');
  assert.equal(formatCurrency(1343), '$13.43');
});

test('tax rounds half up to the cent at 7.25%', () => {
  assert.equal(estimatedTax(10000), 725);
  assert.equal(estimatedTax(18530), 1343); // 1343.425
  assert.equal(estimatedTax(200), 15); // 14.5 rounds up
  assert.equal(estimatedTax(0), 0);
});

test('WELCOME10 takes 10% off with no minimum', () => {
  const v = validateDiscount(' welcome10 ', 1800);
  assert.equal(v.valid, true);
  assert.equal(v.code, 'WELCOME10');
  assert.equal(discountAmount(1800, v), 180);
});

test('MILL15 needs $120 and takes 15% off', () => {
  const low = validateDiscount('MILL15', 11999);
  assert.equal(low.valid, false);
  assert.match(low.message, /\$120/);
  const ok = validateDiscount('MILL15', 12000);
  assert.equal(ok.valid, true);
  assert.equal(discountAmount(12000, ok), 1800);
});

test('FREESHIP removes standard shipping but not express', () => {
  const t = totals([line(2400, 1)], 'FREESHIP');
  assert.equal(t.shipping, 0);
  assert.equal(t.discount, 0);
  assert.equal(t.remaining, 0);
  assert.equal(totals([line(2400, 1)], 'FREESHIP', 'express').shipping, 1400);
});

test('unknown, expired and empty codes are rejected with a message', () => {
  assert.match(validateDiscount('NOPE', 5000).message, /could not be found/);
  assert.match(validateDiscount('WELCOME20', 5000).message, /expired/);
  assert.equal(validateDiscount('', 5000).valid, false);
  assert.equal(validateDiscount('__proto__', 5000).valid, false);
});

test('standard shipping is free from $75 after discounts', () => {
  assert.equal(shippingCost(7499), 650);
  assert.equal(shippingCost(7500), 0);
  assert.equal(shippingCost(0), 0);
  assert.equal(shippingCost(2000, 'express'), 1400);
  assert.equal(freeShippingRemaining(7000), 500);
  assert.equal(freeShippingRemaining(9000), 0);
});

test('a discount can push an order back under the free shipping line', () => {
  const t = totals([line(8000, 1)], 'WELCOME10');
  assert.equal(t.discountedSubtotal, 7200);
  assert.equal(t.shipping, 650);
  assert.equal(t.remaining, 300);
});

test('totals add up: discounted subtotal + shipping + tax', () => {
  const t = totals([line(7800, 1), line(9200, 1), line(2400, 2)], 'MILL15');
  assert.equal(t.subtotal, 21800);
  assert.equal(t.discount, 3270);
  assert.equal(t.shipping, 0);
  assert.equal(t.tax, 1343);
  assert.equal(t.total, 21800 - 3270 + 1343);
});

test('quantity clamps to stock and to whole numbers', () => {
  assert.equal(clampQuantity(5, 2), 2);
  assert.equal(clampQuantity(2.7, 9), 2);
  assert.equal(clampQuantity(-1, 9), 0);
  assert.equal(clampQuantity('abc', 9), 0);
  assert.equal(clampQuantity(3, 0), 0);
});
