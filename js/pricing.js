export const FREE_SHIPPING_THRESHOLD = 7500;
export const STANDARD_SHIPPING = 650;
export const EXPRESS_SHIPPING = 1400;

const rules = {
  WELCOME10: { percent: 10, message: 'WELCOME10 applied. 10% off.' },
  MILL15: { percent: 15, minimum: 12000, message: 'MILL15 applied. 15% off.' },
  FREESHIP: { freeShipping: true, message: 'FREESHIP applied. Standard shipping is free.' },
};
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatCurrency = cents => usd.format(cents / 100);

export function clampQuantity(quantity, stock) {
  const requested = Number(quantity);
  const available = Math.max(0, Math.floor(Number(stock) || 0));
  return Number.isFinite(requested) ? Math.max(0, Math.min(Math.floor(requested), available)) : 0;
}

export const lineTotal = line => line.price_cents * line.quantity;
export const subtotal = lines => lines.reduce((sum, line) => sum + lineTotal(line), 0);

export function validateDiscount(code, amount) {
  const normalized = String(code ?? '').trim().toUpperCase();
  if (!normalized) return { valid: false, code: '', message: 'Enter a discount code.' };
  if (normalized === 'MILL25' || normalized === 'WELCOME20') {
    return { valid: false, code: normalized, message: 'That demo code has expired.' };
  }
  const rule = Object.hasOwn(rules, normalized) ? rules[normalized] : null;
  if (!rule) return { valid: false, code: normalized, message: 'That code could not be found.' };
  if (amount < (rule.minimum ?? 0)) {
    return { valid: false, code: normalized, message: 'MILL15 applies to orders of $120 or more.' };
  }
  return { valid: true, code: normalized, ...rule };
}

const roundPercentage = (amount, numerator, denominator) =>
  Math.floor((amount * numerator + denominator / 2) / denominator);

export const discountAmount = (amount, discount) =>
  discount.valid && discount.percent ? roundPercentage(amount, discount.percent, 100) : 0;

export function shippingCost(amount, method = 'standard', freeShipping = false) {
  if (amount <= 0) return 0;
  if (method === 'express') return EXPRESS_SHIPPING;
  return freeShipping || amount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

export const estimatedTax = amount => roundPercentage(amount, 725, 10000);

export const freeShippingRemaining = (amount, freeShipping = false) =>
  freeShipping ? 0 : Math.max(0, FREE_SHIPPING_THRESHOLD - amount);

export function totals(lines, code, method = 'standard') {
  const itemSubtotal = subtotal(lines);
  const validation = validateDiscount(code, itemSubtotal);
  const discount = discountAmount(itemSubtotal, validation);
  const discountedSubtotal = itemSubtotal - discount;
  const freeShipping = validation.valid && validation.freeShipping;
  const shipping = shippingCost(discountedSubtotal, method, freeShipping);
  const tax = estimatedTax(discountedSubtotal);
  return {
    subtotal: itemSubtotal, validation, discount, discountedSubtotal, shipping, tax,
    total: discountedSubtotal + shipping + tax,
    remaining: freeShippingRemaining(discountedSubtotal, freeShipping),
  };
}
