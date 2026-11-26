import { products } from '../data/products.js';
import { clampQuantity, totals } from './pricing.js';

export const STORAGE_KEY = 'halloway-store-v1';
const emptyState = () => ({ cart: [], wishlist: [], code: '', orders: [] });
const asArray = value => Array.isArray(value) ? value : [];

export function createStore({ storage, events, catalog = products, now = () => new Date() } = {}) {
  const byId = new Map(catalog.map(product => [product.id, product]));
  const getVariant = (productId, variantId) => byId.get(productId)?.variants.find(variant => variant.id === variantId);
  const listeners = new Set();

  function parse(raw) {
    try {
      const value = JSON.parse(raw);
      if (!value || typeof value !== 'object') return emptyState();
      const cart = [];
      for (const item of asArray(value.cart)) {
        const variant = getVariant(item?.productId, item?.variantId);
        if (!variant) continue;
        const existing = cart.find(line => line.productId === item.productId && line.variantId === item.variantId);
        const quantity = clampQuantity(Number(item.quantity) + (existing?.quantity ?? 0), variant.stock);
        if (quantity && existing) existing.quantity = quantity;
        else if (quantity) cart.push({ productId: item.productId, variantId: item.variantId, quantity });
      }
      return {
        cart,
        wishlist: [...new Set(asArray(value.wishlist).filter(id => byId.has(id)))],
        code: typeof value.code === 'string' ? value.code : '',
        orders: asArray(value.orders).filter(order => typeof order?.id === 'string' &&
          Array.isArray(order.lines) && order.lines.every(line => typeof line?.name === 'string' &&
            typeof line.variant === 'string' && Number.isSafeInteger(line.price_cents) && Number.isSafeInteger(line.quantity)) &&
          ['subtotal', 'discount', 'shipping', 'tax', 'total'].every(key => Number.isSafeInteger(order.amounts?.[key]))),
      };
    } catch {
      return emptyState();
    }
  }

  let state;
  let raw;
  try { raw = storage?.getItem(STORAGE_KEY); } catch { /* Storage may be unavailable. */ }
  state = parse(raw);

  function refresh() {
    try {
      if (!storage) return;
      const latest = storage.getItem(STORAGE_KEY);
      if (latest !== raw) {
        raw = latest;
        state = parse(raw);
      }
    } catch { /* Keep the in-memory state. */ }
  }

  function publish(source) {
    for (const listener of listeners) listener(source);
  }

  function commit(next, source) {
    state = next;
    try {
      if (storage) {
        const serialized = JSON.stringify(state);
        storage.setItem(STORAGE_KEY, serialized);
        raw = serialized;
      }
    } catch { /* Keep the in-memory state. */ }
    publish(source);
  }

  events?.addEventListener('storage', event => {
    if (event.storageArea && event.storageArea !== storage) return;
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try { raw = storage ? storage.getItem(STORAGE_KEY) : event.newValue; }
    catch { raw = event.newValue; }
    state = parse(raw);
    publish('sync');
  });

  const findLine = (productId, variantId) => state.cart.find(line => line.productId === productId && line.variantId === variantId);
  const cartLines = () => state.cart.map(item => {
    const product = byId.get(item.productId);
    const variant = getVariant(item.productId, item.variantId);
    return { ...item, product, variant, price_cents: product.price_cents };
  });

  function setLine(productId, variantId, quantity) {
    const current = findLine(productId, variantId);
    const next = state.cart.filter(line => line !== current);
    if (quantity) next.splice(current ? state.cart.indexOf(current) : next.length, 0, { productId, variantId, quantity });
    commit({ ...state, cart: next, code: next.length ? state.code : '' }, 'cart');
  }

  return {
    getState: () => structuredClone(state),
    cartLines,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add(productId, variantId, quantity = 1) {
      refresh();
      const variant = getVariant(productId, variantId);
      if (!variant) return 0;
      const existing = findLine(productId, variantId)?.quantity ?? 0;
      const accepted = clampQuantity(quantity, variant.stock - existing);
      if (accepted) setLine(productId, variantId, existing + accepted);
      return accepted;
    },
    update(productId, variantId, quantity) {
      refresh();
      if (!findLine(productId, variantId)) return 0;
      const accepted = clampQuantity(quantity, getVariant(productId, variantId).stock);
      setLine(productId, variantId, accepted);
      return accepted;
    },
    remove(productId, variantId) {
      refresh();
      const line = findLine(productId, variantId);
      if (line) setLine(productId, variantId, 0);
      return line ? { ...line } : null;
    },
    toggleWishlist(productId) {
      refresh();
      if (!byId.has(productId)) return false;
      const save = !state.wishlist.includes(productId);
      const wishlist = save ? [...state.wishlist, productId] : state.wishlist.filter(id => id !== productId);
      commit({ ...state, wishlist }, 'wishlist');
      return save;
    },
    setCode(code) {
      refresh();
      commit({ ...state, code: String(code ?? '').trim().toUpperCase() }, 'discount');
    },
    placeOrder({ method = 'standard' } = {}) {
      refresh();
      const lines = cartLines();
      if (!lines.length) return null;
      const date = now();
      const sequence = 1042 + state.orders.length;
      const suffix = globalThis.crypto.randomUUID().slice(0, 4).toUpperCase();
      const order = {
        id: `HW-${sequence}-${suffix}`,
        created: date.toISOString(),
        method: method === 'express' ? 'express' : 'standard',
        lines: lines.map(({ product, variant, quantity, price_cents }) => ({
          name: product.name,
          variant: [variant.color, variant.size].filter(Boolean).join(' / '),
          quantity, price_cents,
        })),
        amounts: totals(lines, state.code, method),
      };
      commit({ ...state, orders: [...state.orders, order], cart: [], code: '' }, 'order');
      return structuredClone(order);
    },
  };
}
