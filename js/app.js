import { products, categories } from '../data/products.js';
import { createStore } from './store.js';
import { formatCurrency as money, totals, validateDiscount, FREE_SHIPPING_THRESHOLD, EXPRESS_SHIPPING, STANDARD_SHIPPING } from './pricing.js';
import { browseProducts } from './catalog.js';
import { productArt, categoryArt, heroArt, makerArt } from './art.js';

const store = createStore({ storage: safeStorage(), events: window });
const main = document.getElementById('main');
const live = document.getElementById('live');
const toastBox = document.getElementById('toasts');
const bySlug = new Map(products.map(p => [p.slug, p]));
const byId = new Map(products.map(p => [p.id, p]));
const colors = [...new Set(products.flatMap(p => p.variants.map(v => v.color)))];
let checkoutMethod = 'standard';
let quietHash = false;

function safeStorage() { try { const k = '__hw'; localStorage.setItem(k, k); localStorage.removeItem(k); return localStorage; } catch { return null; } }
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const variantLabel = v => [v.color, v.size].filter(Boolean).join(' / ');
const inStock = p => p.variants.some(v => v.stock > 0);
const icon = name => `<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><use href="#i-${name}"/></svg>`;

function announce(text) { live.textContent = ''; setTimeout(() => { live.textContent = text; }, 30); }
function toast(text, action) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${esc(text)}</span>`;
  if (action) {
    const b = document.createElement(action.href ? 'a' : 'button');
    b.className = 'toast-action';
    b.textContent = action.label;
    if (action.href) b.href = action.href; else b.type = 'button';
    b.addEventListener('click', () => { action.onClick?.(); el.remove(); });
    el.append(b);
  }
  toastBox.append(el);
  announce(text);
  setTimeout(() => el.classList.add('out'), 4200);
  setTimeout(() => el.remove(), 4700);
}

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(query) };
}

/* ---------- shared pieces ---------- */
function priceHtml(p) {
  return `<span class="price">${money(p.price_cents)}</span>${p.compare_at_cents ? ` <s class="compare" aria-label="was ${money(p.compare_at_cents)}">${money(p.compare_at_cents)}</s>` : ''}`;
}
function card(p) {
  const saved = store.getState().wishlist.includes(p.id);
  const tag = p.tags.includes('last of the run') ? 'Last of the run' : p.tags.includes('made to order') ? 'Made to order' : p.tags.includes('new') ? 'New' : '';
  return `<li class="card">
    <a class="card-link" href="#/p/${p.slug}">
      <div class="card-art">${productArt(p)}${tag ? `<span class="tag">${tag}</span>` : ''}${inStock(p) ? '' : '<span class="tag tag-out">Sold out</span>'}</div>
      <span class="card-name">${esc(p.name)}</span>
      <span class="card-blurb">${esc(p.blurb)}</span>
      <span class="card-price">${priceHtml(p)}</span>
    </a>
    <button class="heart" type="button" data-wish="${p.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove' : 'Save'} ${esc(p.name)} ${saved ? 'from' : 'to'} wishlist">${icon(saved ? 'heart-fill' : 'heart')}</button>
    <span class="swatches" aria-label="Colors: ${esc([...new Set(p.variants.map(v => v.color))].join(', '))}">${[...new Set(p.variants.map(v => v.color))].map(c => `<i style="background:${p.art.palettes[c].body}"></i>`).join('')}</span>
  </li>`;
}
const grid = list => `<ul class="grid" role="list">${list.map(card).join('')}</ul>`;
const pageHead = (title, sub = '') => `<header class="page-head"><h1 tabindex="-1">${title}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;

/* ---------- views ---------- */
function viewHome() {
  const fresh = products.filter(p => p.tags.includes('new'));
  return { title: 'Halloway & Co. | Waxed canvas and leather goods', html: `
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Larkin Falls workshop · since the old sail loft</p>
      <h1 tabindex="-1">Canvas and leather, cut and stitched to be used hard.</h1>
      <p class="deck">Totes, packs, aprons and small goods made one at a time from waxed cotton duck and vegetable-tanned leather. They get better the more you carry them.</p>
      <div class="hero-actions"><a class="btn btn-primary" href="#/shop">Shop everything</a><a class="btn btn-ghost" href="#/shop?cat=bags">See the bags</a></div>
      <p class="perk">${icon('truck')} Free shipping on orders of ${money(FREE_SHIPPING_THRESHOLD)} and up</p>
    </div>
    <div class="hero-art">${heroArt()}<span class="stamp" aria-hidden="true">Concept demo · example products</span></div>
  </section>
  <section class="section" aria-labelledby="cat-h">
    <div class="section-head"><h2 id="cat-h">Shop by category</h2></div>
    <ul class="cats" role="list">${categories.map(c => `<li><a href="#/shop?cat=${c.slug}"><span class="cat-art">${categoryArt(c)}</span><span class="cat-name">${esc(c.name)}</span><span class="cat-note">${esc(c.note)}</span></a></li>`).join('')}</ul>
  </section>
  <section class="section" aria-labelledby="new-h">
    <div class="section-head"><h2 id="new-h">New this season</h2><a href="#/shop?sort=newest">See all ${icon('arrow')}</a></div>
    <ul class="rail" role="list">${fresh.map(card).join('')}</ul>
  </section>
  <section class="maker" aria-labelledby="maker-h">
    <div class="maker-art">${makerArt()}</div>
    <div class="maker-copy">
      <p class="eyebrow">The workshop</p>
      <h2 id="maker-h">Ruth Halloway spent twelve years cutting sails. Now it's bags.</h2>
      <p>Same heavy needles, same waxed thread, same habit of putting a second row of stitches wherever something pulls. Every piece leaves the bench with a small leather tag and gets rewaxed for free if you send it back.</p>
      <a class="text-link" href="#/about">About this demo ${icon('arrow')}</a>
    </div>
  </section>` };
}

function shopState(params) {
  return {
    query: params.get('q') ?? '', category: params.get('cat') ?? '', sort: params.get('sort') ?? 'featured',
    min: Number(params.get('min') ?? 0) * 100 || 0, max: params.get('max') ? Number(params.get('max')) * 100 : Infinity,
    inStock: params.get('stock') === '1', color: params.get('color') ?? '',
  };
}
function viewShop(params) {
  const s = shopState(params);
  const cat = categories.find(c => c.slug === s.category);
  const filterCount = [s.min > 0, s.max !== Infinity, s.inStock, s.color].filter(Boolean).length;
  return { title: `${cat ? cat.name : 'Shop'} | Halloway & Co.`, after: bindShop, html: `
  ${pageHead(cat ? esc(cat.name) : 'Shop everything', cat ? esc(cat.note) : 'Fourteen things for carrying, working and coming home.')}
  <form class="shop-bar" id="shop-form" role="search" onsubmit="return false">
    <label class="search"><span class="sr-only">Search products</span>${icon('search')}<input id="q" type="search" name="q" value="${esc(s.query)}" placeholder="Search canvas, leather, brass..." autocomplete="off" enterkeyhint="search"></label>
    <div class="chips" role="group" aria-label="Category">
      <button type="button" class="chip" data-cat="" aria-pressed="${!s.category}">All</button>
      ${categories.map(c => `<button type="button" class="chip" data-cat="${c.slug}" aria-pressed="${s.category === c.slug}">${esc(c.name)}</button>`).join('')}
    </div>
    <div class="shop-tools">
      <button type="button" class="btn btn-small btn-ghost" id="open-filters" aria-expanded="false" aria-controls="filters">${icon('sliders')} Filters${filterCount ? ` <span class="count">${filterCount}</span>` : ''}</button>
      <label class="sort"><span>Sort</span><select name="sort" id="sort">
        ${[['featured', 'Featured'], ['newest', 'Newest'], ['price-asc', 'Price, low to high'], ['price-desc', 'Price, high to low']].map(([v, l]) => `<option value="${v}"${s.sort === v ? ' selected' : ''}>${l}</option>`).join('')}
      </select></label>
    </div>
    <div class="filters" id="filters" hidden>
      <div class="sheet" role="group" aria-labelledby="filters-h">
        <div class="sheet-head"><h2 id="filters-h">Filters</h2><button type="button" class="icon-btn" id="close-filters" aria-label="Close filters">${icon('close')}</button></div>
        <fieldset><legend>Price</legend><div class="range">
          <label>Min $<input type="number" inputmode="numeric" name="min" min="0" step="1" value="${s.min ? s.min / 100 : ''}" placeholder="0"></label>
          <label>Max $<input type="number" inputmode="numeric" name="max" min="0" step="1" value="${s.max !== Infinity ? s.max / 100 : ''}" placeholder="200"></label>
        </div></fieldset>
        <fieldset><legend>Color</legend><div class="color-opts">
          <label class="color-opt"><input type="radio" name="color" value=""${!s.color ? ' checked' : ''}><span>Any</span></label>
          ${colors.map(c => `<label class="color-opt"><input type="radio" name="color" value="${esc(c)}"${s.color === c ? ' checked' : ''}><span><i style="background:${products.find(p => p.art.palettes[c]).art.palettes[c].body}"></i>${esc(c)}</span></label>`).join('')}
        </div></fieldset>
        <label class="switch"><input type="checkbox" name="stock" value="1"${s.inStock ? ' checked' : ''}><span>In stock only</span></label>
        <div class="sheet-actions"><button type="button" class="btn btn-ghost" id="clear-filters">Clear</button><button type="button" class="btn btn-primary" id="apply-filters">Show results</button></div>
      </div>
    </div>
  </form>
  <p class="result-count" id="result-count" aria-live="polite"></p>
  <div id="results"></div>` };
}
function bindShop() {
  const form = document.getElementById('shop-form');
  const filters = document.getElementById('filters');
  const openBtn = document.getElementById('open-filters');
  const readParams = () => {
    const fd = new FormData(form);
    const p = new URLSearchParams(parseHash().params);
    for (const key of ['q', 'sort', 'min', 'max', 'color', 'stock']) {
      const v = String(fd.get(key) ?? '').trim();
      if (v && !(key === 'sort' && v === 'featured')) p.set(key, v); else p.delete(key);
    }
    return p;
  };
  const renderResults = params => {
    const s = shopState(params);
    const list = browseProducts(products, s);
    document.getElementById('results').innerHTML = list.length ? grid(list)
      : `<div class="empty">${icon('search')}<h2>Nothing matches that yet</h2><p>Try a different word, or clear the filters.</p><a class="btn btn-ghost" href="#/shop">Clear search and filters</a></div>`;
    document.getElementById('result-count').textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'}`;
  };
  const push = (params, rerender = false) => {
    const q = params.toString();
    const hash = `#/shop${q ? `?${q}` : ''}`;
    if (rerender) { location.hash = hash; return; }
    quietHash = true; history.replaceState(null, '', hash); quietHash = false;
    renderResults(params);
  };
  renderResults(parseHash().params);
  let t;
  form.q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => push(readParams()), 120); });
  form.sort.addEventListener('change', () => push(readParams()));
  form.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
    const p = readParams(); if (b.dataset.cat) p.set('cat', b.dataset.cat); else p.delete('cat'); push(p, true);
  }));
  const close = () => { filters.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('sheet-open'); openBtn.focus(); };
  openBtn.addEventListener('click', () => { filters.hidden = false; openBtn.setAttribute('aria-expanded', 'true'); document.body.classList.add('sheet-open'); filters.querySelector('input').focus(); });
  document.getElementById('close-filters').addEventListener('click', close);
  filters.addEventListener('click', e => { if (e.target === filters) close(); });
  filters.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.getElementById('apply-filters').addEventListener('click', () => { document.body.classList.remove('sheet-open'); push(readParams(), true); });
  document.getElementById('clear-filters').addEventListener('click', () => {
    const p = new URLSearchParams(parseHash().params); ['min', 'max', 'color', 'stock'].forEach(k => p.delete(k));
    document.body.classList.remove('sheet-open'); push(p, true);
  });
}

function viewProduct(slug) {
  const p = bySlug.get(slug);
  if (!p) return viewNotFound();
  const colorsOf = [...new Set(p.variants.map(v => v.color))];
  const sizesOf = [...new Set(p.variants.map(v => v.size).filter(Boolean))];
  const first = p.variants.find(v => v.stock > 0) ?? p.variants[0];
  const related = products.filter(x => x.category === p.category && x.id !== p.id).concat(products.filter(x => x.category !== p.category)).slice(0, 4);
  const views = ['Front', 'Close-up of the details', 'In use, for scale'];
  return { title: `${p.name} | Halloway & Co.`, after: () => bindProduct(p, first), html: `
  <nav class="crumbs" aria-label="Breadcrumb"><a href="#/shop">Shop</a> <span aria-hidden="true">/</span> <a href="#/shop?cat=${categories.find(c => c.name === p.category).slug}">${esc(p.category)}</a></nav>
  <article class="pdp">
    <div class="gallery" aria-roledescription="carousel" aria-label="${esc(p.name)} pictures">
      <div class="gallery-track" id="track" tabindex="0" aria-label="Pictures. Use the left and right arrow keys to move.">
        ${views.map((v, i) => `<figure class="slide" id="slide-${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of 3: ${v}"><div class="slide-art" data-view="${i}">${productArt(p, first, i)}</div><figcaption class="sr-only">Illustration: ${v}</figcaption></figure>`).join('')}
      </div>
      <div class="dots" role="group" aria-label="Choose picture">${views.map((v, i) => `<button type="button" class="dot" data-go="${i}" aria-label="Picture ${i + 1}: ${v}" aria-current="${i === 0}"></button>`).join('')}</div>
      <div class="thumbs">${views.map((v, i) => `<button type="button" class="thumb" data-go="${i}" aria-label="Show picture ${i + 1}: ${v}" aria-current="${i === 0}"><span data-view="${i}">${productArt(p, first, i)}</span></button>`).join('')}</div>
      <p class="art-note">Illustrations, not photos. Example product.</p>
    </div>
    <div class="buy">
      <p class="eyebrow">${esc(p.category)}</p>
      <h1 tabindex="-1">${esc(p.name)}</h1>
      <p class="pdp-price">${priceHtml(p)}${p.compare_at_cents ? ' <span class="note">Last of the run</span>' : ''}</p>
      <p class="pdp-blurb">${esc(p.blurb)}</p>
      <form id="buy-form" class="buy-form">
        <fieldset class="opts"><legend>Color: <b id="color-label">${esc(first.color)}</b></legend><div class="opt-row">
          ${colorsOf.map(c => { const out = p.variants.filter(v => v.color === c).every(v => v.stock <= 0); return `<label class="swatch-opt${out ? ' is-out' : ''}"><input type="radio" name="color" value="${esc(c)}"${c === first.color ? ' checked' : ''}${out ? ' aria-describedby="out-note"' : ''}><span class="sw" style="background:${p.art.palettes[c].body}"></span><span class="sr-only">${esc(c)}${out ? ', sold out' : ''}</span></label>`; }).join('')}
        </div></fieldset>
        ${sizesOf.length ? `<fieldset class="opts"><legend>Size: <b id="size-label">${esc(first.size)}</b></legend><div class="opt-row" id="size-row"></div></fieldset>` : ''}
        <p class="stock" id="stock" aria-live="polite"></p>
        <span id="out-note" class="sr-only">Sold out</span>
        <div class="buy-bar">
          <div class="stepper" role="group" aria-label="Quantity">
            <button type="button" class="step" data-step="-1" aria-label="Decrease quantity">${icon('minus')}</button>
            <input id="qty" name="qty" type="number" inputmode="numeric" min="1" value="1" aria-label="Quantity">
            <button type="button" class="step" data-step="1" aria-label="Increase quantity">${icon('plus')}</button>
          </div>
          <button class="btn btn-primary btn-wide" id="add" type="submit">Add to cart</button>
          <button class="icon-btn heart-lg" type="button" data-wish="${p.id}" aria-pressed="false" aria-label="Save to wishlist">${icon('heart')}</button>
        </div>
      </form>
      <ul class="perks" role="list"><li>${icon('truck')} Free shipping from ${money(FREE_SHIPPING_THRESHOLD)}</li><li>${icon('needle')} Free rewaxing, for life</li></ul>
      <div class="accordions">
        <details open><summary>Description</summary><p>${esc(p.description)}</p></details>
        <details><summary>Materials and care</summary><ul>${p.materials.map(m => `<li>${esc(m)}</li>`).join('')}</ul><p>${esc(p.care)}</p></details>
        <details><summary>Dimensions</summary><p>${esc(p.dimensions)}</p></details>
        <details><summary>Shipping and returns</summary><p>In this demo nothing ships. A real shop would set its own policy here, for example: standard shipping ${money(STANDARD_SHIPPING)}, free from ${money(FREE_SHIPPING_THRESHOLD)}, express ${money(EXPRESS_SHIPPING)}, returns within 30 days.</p></details>
      </div>
    </div>
  </article>
  <section class="section" aria-labelledby="rel-h"><div class="section-head"><h2 id="rel-h">You might also like</h2></div><ul class="rail" role="list">${related.map(card).join('')}</ul></section>` };
}
function bindProduct(p, first) {
  const form = document.getElementById('buy-form');
  const qty = document.getElementById('qty');
  const add = document.getElementById('add');
  const track = document.getElementById('track');
  let current = first;
  const inCart = v => store.getState().cart.find(l => l.productId === p.id && l.variantId === v.id)?.quantity ?? 0;
  const room = () => Math.max(0, current.stock - inCart(current));
  const redrawArt = () => document.querySelectorAll('[data-view]').forEach(el => { el.innerHTML = productArt(p, current, Number(el.dataset.view)); });
  const sizeRow = document.getElementById('size-row');
  const drawSizes = color => {
    if (!sizeRow) return;
    sizeRow.innerHTML = p.variants.filter(v => v.color === color).map(v => `<label class="size-opt"><input type="radio" name="size" value="${esc(v.size)}"${v.id === current.id ? ' checked' : ''}${v.stock <= 0 ? ' disabled' : ''}><span>${esc(v.size)}${v.stock <= 0 ? '<span class="sr-only">, sold out</span>' : ''}</span></label>`).join('');
  };
  const sync = () => {
    const r = room();
    const st = document.getElementById('stock');
    st.className = 'stock';
    if (current.stock <= 0) { st.textContent = `${variantLabel(current)} is sold out. Try another color.`; st.classList.add('out'); }
    else if (r <= 0) { st.textContent = `You have all ${current.stock} in your cart.`; st.classList.add('low'); }
    else if (current.stock <= 3) { st.textContent = `Only ${current.stock} left in ${variantLabel(current)}.`; st.classList.add('low'); }
    else st.textContent = p.tags.includes('made to order') ? 'Made to order. Leaves the bench in about a week.' : 'In stock. Ready to ship.';
    qty.max = Math.max(1, r);
    if (Number(qty.value) > r) qty.value = Math.max(1, r);
    add.disabled = r <= 0;
    add.textContent = current.stock <= 0 ? 'Sold out' : r <= 0 ? 'All in your cart' : '';
    if (add.textContent === '') add.innerHTML = `Add to cart<span class="add-price"> · ${money(p.price_cents * (Number(qty.value) || 1))}</span>`;
    document.getElementById('color-label').textContent = current.color;
    const sl = document.getElementById('size-label'); if (sl) sl.textContent = current.size;
  };
  drawSizes(current.color); sync(); syncHearts();
  form.addEventListener('change', e => {
    if (e.target.name === 'color') {
      const options = p.variants.filter(v => v.color === e.target.value);
      current = options.find(v => v.size === current.size && v.stock > 0) ?? options.find(v => v.stock > 0) ?? options[0];
      drawSizes(current.color); redrawArt();
    } else if (e.target.name === 'size') {
      current = p.variants.find(v => v.color === current.color && v.size === e.target.value);
    }
    sync();
  });
  qty.addEventListener('input', sync);
  form.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
    qty.value = Math.min(Math.max(1, room()), Math.max(1, (Number(qty.value) || 1) + Number(b.dataset.step))); sync();
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const n = store.add(p.id, current.id, Number(qty.value) || 1);
    if (n) { toast(`Added ${n} × ${p.name} (${variantLabel(current)}) to your cart.`, { label: 'View cart', href: '#/cart' }); qty.value = 1; }
    else toast('That one is not available in that quantity.');
    sync();
  });
  const go = i => track.scrollTo({ left: track.clientWidth * i, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(Number(b.dataset.go))));
  track.addEventListener('keydown', e => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(2, i + 1)); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, i - 1)); }
  });
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    document.querySelectorAll('.dot, .thumb').forEach(b => b.setAttribute('aria-current', String(Number(b.dataset.go) === i)));
  }, { passive: true });
}

function summaryRows(t, method = 'standard') {
  return `<dl class="sum">
    <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
    ${t.discount ? `<div class="good"><dt>Discount (${esc(t.validation.code)})</dt><dd>−${money(t.discount)}</dd></div>` : ''}
    <div><dt>Shipping${method === 'express' ? ' (express)' : ''}</dt><dd>${t.shipping ? money(t.shipping) : 'Free'}</dd></div>
    <div><dt>Estimated tax <small>(demo rate 7.25%)</small></dt><dd>${money(t.tax)}</dd></div>
    <div class="total"><dt>Total</dt><dd>${money(t.total)}</dd></div>
  </dl>`;
}
function shipMeter(t) {
  if (t.validation.valid && t.validation.freeShipping) return `<p class="meter-text">${icon('truck')} Free shipping applied with FREESHIP.</p>`;
  const pct = Math.min(100, Math.round((t.discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  return `<div class="meter"><p class="meter-text">${icon('truck')} ${t.remaining ? `You're <b>${money(t.remaining)}</b> away from free shipping.` : 'You get free standard shipping.'}</p><div class="bar" role="progressbar" aria-label="Progress to free shipping" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div></div>`;
}
function viewCart() {
  const lines = store.cartLines();
  const st = store.getState();
  if (!lines.length) return { title: 'Your cart | Halloway & Co.', html: `${pageHead('Your cart')}<div class="empty">${icon('bag')}<h2>Your cart is empty</h2><p>The tote is a good place to start.</p><a class="btn btn-primary" href="#/shop">Browse the shop</a></div>` };
  const t = totals(lines, st.code);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  return { title: `Your cart (${count}) | Halloway & Co.`, after: bindCart, html: `
  ${pageHead('Your cart', `${count} ${count === 1 ? 'item' : 'items'}`)}
  <div class="cart-layout">
    <ul class="lines" role="list">${lines.map(l => `<li class="line">
      <a class="line-art" href="#/p/${l.product.slug}" tabindex="-1" aria-hidden="true">${productArt(l.product, l.variant)}</a>
      <div class="line-info"><a class="line-name" href="#/p/${l.product.slug}">${esc(l.product.name)}</a><span class="line-var">${esc(variantLabel(l.variant))}</span><span class="line-each">${money(l.price_cents)} each</span>
        <div class="line-ctl">
          <div class="stepper stepper-sm" role="group" aria-label="Quantity for ${esc(l.product.name)}">
            <button type="button" class="step" data-line="${l.productId}|${l.variantId}" data-d="-1" aria-label="Decrease quantity of ${esc(l.product.name)}"${l.quantity <= 1 ? ' disabled' : ''}>${icon('minus')}</button>
            <output aria-live="polite">${l.quantity}</output>
            <button type="button" class="step" data-line="${l.productId}|${l.variantId}" data-d="1" aria-label="Increase quantity of ${esc(l.product.name)}"${l.quantity >= l.variant.stock ? ' disabled' : ''}>${icon('plus')}</button>
          </div>
          <button type="button" class="text-btn" data-remove="${l.productId}|${l.variantId}">Remove<span class="sr-only"> ${esc(l.product.name)}</span></button>
        </div>
        ${l.quantity >= l.variant.stock ? `<span class="line-max">That's all we have in ${esc(variantLabel(l.variant))}.</span>` : ''}
      </div>
      <span class="line-total">${money(l.price_cents * l.quantity)}</span>
    </li>`).join('')}</ul>
    <aside class="summary" aria-labelledby="sum-h">
      <h2 id="sum-h">Order summary</h2>
      ${shipMeter(t)}
      <form class="code-form" id="code-form" novalidate>
        <label for="code">Discount code</label>
        <div class="code-row"><input id="code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(st.code)}" aria-describedby="code-msg code-hint"><button class="btn btn-ghost btn-small" type="submit">Apply</button></div>
        <p id="code-msg" class="code-msg ${st.code ? (t.validation.valid ? 'ok' : 'err') : ''}" aria-live="polite">${st.code ? esc(t.validation.message) : ''}</p>
        <p id="code-hint" class="hint">Demo codes: WELCOME10, MILL15 (orders $120+), FREESHIP</p>
      </form>
      ${summaryRows(t)}
      <a class="btn btn-primary btn-wide" href="#/checkout">Go to checkout</a>
      <p class="fine">Demo shop. Checkout takes no payment.</p>
    </aside>
  </div>` };
}
function bindCart() {
  main.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => {
    const [pid, vid] = b.dataset.line.split('|');
    const line = store.getState().cart.find(l => l.productId === pid && l.variantId === vid);
    store.update(pid, vid, line.quantity + Number(b.dataset.d));
    render({ keepFocus: `[data-line="${b.dataset.line}"][data-d="${b.dataset.d}"]` });
    announce(`Quantity updated. Total ${money(totals(store.cartLines(), store.getState().code).total)}.`);
  }));
  main.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
    const [pid, vid] = b.dataset.remove.split('|');
    const removed = store.remove(pid, vid);
    const code = store.getState().code;
    render();
    toast(`Removed ${byId.get(pid).name}.`, { label: 'Undo', onClick: () => { store.add(removed.productId, removed.variantId, removed.quantity); if (code) store.setCode(code); render(); } });
  }));
  document.getElementById('code-form').addEventListener('submit', e => {
    e.preventDefault();
    const code = e.target.code.value;
    const v = validateDiscount(code, totals(store.cartLines(), '').subtotal);
    store.setCode(v.valid ? v.code : code);
    render({ keepFocus: '#code' });
    announce(v.message);
  });
}

function viewWishlist() {
  const list = store.getState().wishlist.map(id => byId.get(id)).filter(Boolean);
  return { title: 'Wishlist | Halloway & Co.', after: () => main.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
    const p = byId.get(b.dataset.move); const v = p.variants.find(x => x.stock > 0);
    if (v && store.add(p.id, v.id, 1)) { store.toggleWishlist(p.id); render(); toast(`Moved ${p.name} (${variantLabel(v)}) to your cart.`, { label: 'View cart', href: '#/cart' }); }
    else toast(`${p.name} is sold out right now.`);
  })), html: `${pageHead('Wishlist', list.length ? 'Saved on this device.' : '')}
  ${list.length ? `<ul class="grid" role="list">${list.map(p => card(p).replace('</li>', `<button type="button" class="btn btn-ghost btn-small move" data-move="${p.id}"${inStock(p) ? '' : ' disabled'}>${inStock(p) ? 'Move to cart' : 'Sold out'}<span class="sr-only"> ${esc(p.name)}</span></button></li>`)).join('')}</ul>`
    : `<div class="empty">${icon('heart')}<h2>Nothing saved yet</h2><p>Tap the heart on anything you want to come back to.</p><a class="btn btn-primary" href="#/shop">Browse the shop</a></div>`}` };
}

const fields = [
  ['email', 'Email', 'email', 'email', 'For the order receipt (not sent in this demo)'],
  ['name', 'Full name', 'text', 'name'],
  ['address', 'Street address', 'text', 'street-address'],
  ['city', 'City', 'text', 'address-level2'],
  ['state', 'State', 'text', 'address-level1'],
  ['zip', 'ZIP code', 'text', 'postal-code'],
];
function validate(name, value) {
  value = value.trim();
  if (!value) { const l = fields.find(f => f[0] === name)[1]; return `Enter your ${name === 'zip' ? l : l.toLowerCase()}.`; }
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter an email like name@example.com.';
  if (name === 'zip' && !/^\d{5}(-\d{4})?$/.test(value)) return 'Enter a 5-digit ZIP code.';
  if (name === 'state' && value.length < 2) return 'Enter a state.';
  return '';
}
function viewCheckout() {
  const lines = store.cartLines();
  if (!lines.length) return { title: 'Checkout | Halloway & Co.', html: `${pageHead('Checkout')}<div class="empty">${icon('bag')}<h2>Your cart is empty</h2><p>Add something first, then come back here.</p><a class="btn btn-primary" href="#/shop">Browse the shop</a></div>` };
  const t = totals(lines, store.getState().code, checkoutMethod);
  return { title: 'Checkout | Halloway & Co.', after: bindCheckout, html: `
  ${pageHead('Checkout')}
  <div class="demo-banner" role="note">${icon('info')}<p><b>Demo checkout.</b> No payment is taken and nothing is shipped. What you type stays in this page and isn't saved or sent anywhere.</p></div>
  <div class="checkout-layout">
    <form id="checkout" class="checkout" novalidate>
      <div id="error-summary" class="error-summary" tabindex="-1" hidden></div>
      <fieldset class="step-box"><legend><span class="step-n">1</span> Contact and shipping address</legend>
        <div class="field-grid">${fields.map(([n, l, type, ac, hint]) => `<div class="field field-${n}"><label for="f-${n}">${l}</label><input id="f-${n}" name="${n}" type="${type}" autocomplete="${ac}" required aria-describedby="${hint ? `h-${n} ` : ''}e-${n}"${n === 'zip' ? ' inputmode="numeric"' : ''}>${hint ? `<p class="hint" id="h-${n}">${hint}</p>` : ''}<p class="field-err" id="e-${n}"></p></div>`).join('')}</div>
      </fieldset>
      <fieldset class="step-box"><legend><span class="step-n">2</span> Shipping method</legend>
        <label class="ship-opt"><input type="radio" name="method" value="standard"${checkoutMethod === 'standard' ? ' checked' : ''}><span><b>Standard</b><small>5 to 7 business days</small></span><span class="ship-price">${totals(lines, store.getState().code, 'standard').shipping ? money(STANDARD_SHIPPING) : 'Free'}</span></label>
        <label class="ship-opt"><input type="radio" name="method" value="express"${checkoutMethod === 'express' ? ' checked' : ''}><span><b>Express</b><small>2 business days</small></span><span class="ship-price">${money(EXPRESS_SHIPPING)}</span></label>
      </fieldset>
      <fieldset class="step-box"><legend><span class="step-n">3</span> Payment</legend>
        <div class="mock-card" aria-hidden="true"><span class="chip-ic"></span><span class="mc-num">•••• •••• •••• ••••</span><span class="mc-row"><span>DEMO ONLY</span><span>MM/YY</span></span></div>
        <p class="pay-off">${icon('lock')} Payments are turned off in this demo. There are no card fields, and nothing is charged.</p>
      </fieldset>
      <button class="btn btn-primary btn-wide btn-lg" type="submit">Place demo order · ${money(t.total)}</button>
      <p class="fine">Placing the order only saves a demo receipt on this device.</p>
    </form>
    <details class="summary co-summary" open>
      <summary><span>Order summary</span><b>${money(t.total)}</b></summary>
      <ul class="mini-lines" role="list">${lines.map(l => `<li><span class="mini-art">${productArt(l.product, l.variant)}<span class="mini-q">${l.quantity}</span></span><span class="mini-name">${esc(l.product.name)}<small>${esc(variantLabel(l.variant))}</small></span><span>${money(l.price_cents * l.quantity)}</span></li>`).join('')}</ul>
      ${summaryRows(t, checkoutMethod)}
      <a class="text-link" href="#/cart">Edit cart</a>
    </details>
  </div>` };
}
function bindCheckout() {
  const form = document.getElementById('checkout');
  if (matchMedia('(max-width: 899px)').matches) document.querySelector('.co-summary')?.removeAttribute('open');
  const show = (input, msg) => {
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    document.getElementById(`e-${input.name}`).textContent = msg;
  };
  fields.forEach(([n]) => form[n].addEventListener('blur', () => { if (form[n].value || form[n].getAttribute('aria-invalid') === 'true') show(form[n], validate(n, form[n].value)); }));
  form.querySelectorAll('[name="method"]').forEach(r => r.addEventListener('change', () => {
    const vals = Object.fromEntries(fields.map(([n]) => [n, form[n].value]));
    checkoutMethod = r.value; render({ keepFocus: `[name="method"][value="${r.value}"]` });
    const f = document.getElementById('checkout'); Object.entries(vals).forEach(([n, v]) => { f[n].value = v; });
    announce(`${r.value === 'express' ? 'Express' : 'Standard'} shipping selected.`);
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = fields.map(([n, l]) => [n, l, validate(n, form[n].value)]).filter(x => x[2]);
    fields.forEach(([n]) => show(form[n], validate(n, form[n].value)));
    const box = document.getElementById('error-summary');
    if (errors.length) {
      box.hidden = false;
      box.innerHTML = `<h2>Check ${errors.length === 1 ? 'one thing' : `${errors.length} things`} before placing the demo order</h2><ul>${errors.map(([n, , m]) => `<li><a href="#f-${n}" data-focus="f-${n}">${esc(m)}</a></li>`).join('')}</ul>`;
      box.querySelectorAll('[data-focus]').forEach(a => a.addEventListener('click', ev => { ev.preventDefault(); document.getElementById(a.dataset.focus).focus(); }));
      box.focus();
      return;
    }
    const order = store.placeOrder({ method: checkoutMethod });
    checkoutMethod = 'standard';
    if (order) location.hash = `#/order/${order.id}`;
  });
}

function viewOrder(id) {
  const o = store.getState().orders.find(x => x.id === id);
  if (!o) return viewNotFound('We could not find that demo order on this device.');
  const a = o.amounts;
  return { title: `Order ${o.id} | Halloway & Co.`, html: `
  <section class="confirm">
    <div class="confirm-mark" aria-hidden="true">${icon('check')}</div>
    <p class="eyebrow">Demo order ${esc(o.id)}</p>
    <h1 tabindex="-1">Thanks. Your demo order is in.</h1>
    <p class="deck">This was a demo, so no card was charged and nothing will ship. In a real shop this is where the receipt email and tracking would come from.</p>
    <div class="confirm-box">
      <ul class="mini-lines" role="list">${o.lines.map(l => `<li><span class="mini-name">${esc(l.name)}<small>${esc(l.variant)} · qty ${l.quantity}</small></span><span>${money(l.price_cents * l.quantity)}</span></li>`).join('')}</ul>
      ${summaryRows(a, o.method)}
      <p class="fine">Placed ${new Date(o.created).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} · ${o.method === 'express' ? 'Express' : 'Standard'} shipping</p>
    </div>
    <a class="btn btn-primary" href="#/shop">Keep browsing</a>
  </section>` };
}

function viewAbout() {
  return { title: 'About this demo | Halloway & Co.', html: `
  ${pageHead('About this demo')}
  <div class="prose">
    <p>Halloway &amp; Co. is a made-up workshop. I built this as a concept demo of a mobile storefront for a small shop: it installs like an app, works offline, and remembers your cart. The products, prices, stock and discount codes are examples, and the checkout takes no payment.</p>
    <h2>What's in it</h2>
    <ul>
      <li>Catalog with search, category chips, filters (price, color, in stock) and sorting</li>
      <li>Product pages with a swipeable gallery, color and size pickers that know what's sold out, and stock messages</li>
      <li>Cart with quantity edits, undo on remove, discount codes and live totals for shipping and tax</li>
      <li>Wishlist, a three-step demo checkout with inline validation, and an order confirmation</li>
      <li>Everything saved on the device with localStorage, synced across tabs</li>
      <li>Installable (web app manifest and icons) and works offline with a service worker</li>
      <li>Keyboard friendly, labeled controls, visible focus and reduced-motion support</li>
    </ul>
    <h2>Try the codes</h2>
    <p><code>WELCOME10</code> takes 10% off. <code>MILL15</code> takes 15% off orders of $120 or more. <code>FREESHIP</code> makes standard shipping free.</p>
    <p id="install-wrap" hidden><button class="btn btn-ghost" type="button" id="install-btn">${icon('download')} Install the app</button></p>
    <h2>Credits</h2>
    <p>Product pictures are illustrations I drew in SVG. Fonts: Gloock, Hanken Grotesk and DM Mono, all under the SIL Open Font License. Contact details shown anywhere are placeholders: hello@example.com, (555) 0136.</p>
    <p><button class="text-btn" type="button" id="reset-demo">Reset the demo</button> clears the cart, wishlist and demo orders on this device.</p>
  </div>`, after: () => {
    if (installEvent) document.getElementById('install-wrap').hidden = false;
    document.getElementById('install-btn').addEventListener('click', promptInstall);
    document.getElementById('reset-demo').addEventListener('click', () => { try { localStorage.removeItem('halloway-store-v1'); } catch {} location.hash = '#/'; location.reload(); });
  } };
}
function viewNotFound(msg = "That page isn't here. It may have moved, or the link is off by a letter.") {
  return { title: 'Not found | Halloway & Co.', html: `${pageHead('Not found')}<div class="empty"><p>${esc(msg)}</p><a class="btn btn-primary" href="#/">Back to the shop</a></div>` };
}

/* ---------- router ---------- */
function route() {
  const { parts, params } = parseHash();
  switch (parts[0]) {
    case undefined: return ['home', viewHome()];
    case 'shop': return ['shop', viewShop(params)];
    case 'p': return ['shop', viewProduct(parts[1])];
    case 'cart': return ['cart', viewCart()];
    case 'wishlist': return ['wishlist', viewWishlist()];
    case 'checkout': return ['cart', viewCheckout()];
    case 'order': return ['cart', viewOrder(decodeURIComponent(parts[1] ?? ''))];
    case 'about': return ['about', viewAbout()];
    default: return ['', viewNotFound()];
  }
}
let lastPath = null;
function render({ keepFocus } = {}) {
  const [tab, view] = route();
  const path = location.hash.split('?')[0];
  const fresh = path !== lastPath;
  lastPath = path;
  main.innerHTML = view.html;
  document.title = view.title;
  view.after?.();
  syncHearts(); syncBadges();
  document.querySelectorAll('[data-tab]').forEach(a => { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (keepFocus) { main.querySelector(keepFocus)?.focus(); return; }
  if (fresh) {
    window.scrollTo(0, 0);
    if (navigated) main.querySelector('h1')?.focus({ preventScroll: true });
  }
}
let navigated = false;
function syncBadges() {
  const n = store.getState().cart.reduce((s, l) => s + l.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach(b => { b.textContent = n; b.hidden = !n; });
  document.querySelectorAll('[data-cart-label]').forEach(a => a.setAttribute('aria-label', `Cart, ${n} ${n === 1 ? 'item' : 'items'}`));
  const w = store.getState().wishlist.length;
  document.querySelectorAll('[data-wish-count]').forEach(b => { b.textContent = w; b.hidden = !w; });
}
function syncHearts() {
  const saved = new Set(store.getState().wishlist);
  document.querySelectorAll('[data-wish]').forEach(b => {
    const on = saved.has(b.dataset.wish); const name = byId.get(b.dataset.wish).name;
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`);
    b.innerHTML = icon(on ? 'heart-fill' : 'heart');
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-wish]');
  if (!b) return;
  e.preventDefault();
  const on = store.toggleWishlist(b.dataset.wish);
  syncHearts(); syncBadges();
  announce(on ? `Saved ${byId.get(b.dataset.wish).name} to your wishlist.` : `Removed ${byId.get(b.dataset.wish).name} from your wishlist.`);
  if (parseHash().parts[0] === 'wishlist') render();
});
store.subscribe(source => { if (source === 'sync') render(); else syncBadges(); });
window.addEventListener('hashchange', () => { if (!quietHash) { navigated = true; render(); } });

/* ---------- PWA ---------- */
let installEvent = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); installEvent = e;
  document.querySelectorAll('[data-install]').forEach(b => { b.hidden = false; });
  const w = document.getElementById('install-wrap'); if (w) w.hidden = false;
});
async function promptInstall() {
  if (!installEvent) return;
  installEvent.prompt();
  await installEvent.userChoice.catch(() => null);
  installEvent = null;
  document.querySelectorAll('[data-install]').forEach(b => { b.hidden = true; });
}
document.querySelectorAll('[data-install]').forEach(b => b.addEventListener('click', promptInstall));
window.addEventListener('offline', () => toast("You're offline. The shop still works from what's saved."));
window.addEventListener('online', () => toast("You're back online."));
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
document.querySelector('[data-search]')?.addEventListener('click', e => {
  e.preventDefault();
  if (parseHash().parts[0] !== 'shop') { location.hash = '#/shop'; }
  setTimeout(() => document.getElementById('q')?.focus(), 30);
});

render();
