# Halloway & Co.: a mobile storefront you can install (concept demo)

**Live demo:** https://alexmercerprojects.com/halloway-mobile-storefront/

A concept demo of a mobile-first shop for a small business. It installs to a phone's home screen like an app, keeps working offline, and remembers the cart between visits. Halloway & Co. is made up: a little workshop in a made-up mill town that sells waxed canvas bags, leather goods, aprons and a few things for the house. The products, prices, stock levels and discount codes are examples, and the checkout takes no payment.

## Who it's for

Small shops that want a store that feels like an app on a phone, without an app store: makers, boutiques, cafes selling merch, anyone moving off a marketplace onto their own site.

## Key features

- Catalog of 14 example products in 4 categories, with instant search, category chips, a filter sheet (price, color, in stock) and sorting
- Product pages with a swipeable three-picture gallery (arrow keys work too), color and size pickers that know which combinations are sold out, low-stock messages and a quantity stepper
- Cart with quantity edits, remove with undo, discount codes with clear error messages, a free-shipping progress bar and live totals for discount, shipping and estimated tax
- Wishlist that moves items to the cart
- A three-step demo checkout (address, shipping method, a payment step that is switched off) with inline validation and an error summary, then an order confirmation
- Cart, wishlist and demo orders saved in localStorage, synced across open tabs, and recovered safely if the stored data is broken
- Installable: web app manifest, regular and maskable icons, standalone display
- Works offline through a service worker that precaches the whole app
- Accessible: skip link, labeled controls, real radio groups for options, focus moved to the heading on each screen, live announcements for cart changes, visible focus, 44px touch targets and reduced-motion support
- No framework, no build step and no outside requests: plain ES modules, about 84 KB of JavaScript and data, around 27 KB gzipped
- 39 automated tests with Node's built-in test runner covering pricing, discounts, shipping, tax rounding, search and filters, the cart store, the product data and the offline file list

## How it's put together

| File | What it does |
|---|---|
| `index.html` | App shell, icon sprite, header, bottom tab bar |
| `js/app.js` | Hash router and the screens |
| `js/pricing.js` | Pure pricing rules: discounts, shipping, tax, totals (all in cents) |
| `js/catalog.js` | Search, filter and sort |
| `js/store.js` | Cart, wishlist and orders with localStorage persistence |
| `js/art.js` | The product illustrations, drawn as SVG and recolored per variant |
| `data/products.js` | The example catalog |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and install |

The router uses hash URLs (`#/p/the-mill-tote`), so it runs from any folder on a static host like GitHub Pages without server rewrites.

## Run it

```
python3 -m http.server 8765
```

Then open http://localhost:8765/. The service worker needs `localhost` or HTTPS.

Demo codes: `WELCOME10` (10% off), `MILL15` (15% off orders of $120 or more), `FREESHIP` (free standard shipping).

## Tests

```
node --test
```

Needs Node 20 or newer. No packages to install.

## Honesty note

This is a concept demo, not client work. Halloway & Co., Ruth Halloway, Larkin Falls and every product, price and stock count are made up. There are no reviews, ratings or sales figures anywhere. Contact details are placeholders (hello@example.com, (555) 0136). Checkout is a demo: there are no card fields and nothing is charged or shipped.

## Credits

Product pictures and icons are SVG illustrations drawn for this demo. Fonts: Gloock (Duarte Pinto), Hanken Grotesk (Alfredo Marco Pradil) and DM Mono (Colophon Foundry), all under the SIL Open Font License 1.1, bundled in `fonts/`. Code is MIT licensed.
