export const categories = [
  { name: 'Bags', slug: 'bags', note: 'For the road', art: 'tote', color: 'Field Tan' },
  { name: 'Small leather goods', slug: 'small-leather-goods', note: 'For your pockets', art: 'wallet', color: 'Chestnut' },
  { name: 'Workshop', slug: 'workshop', note: 'For working hands', art: 'apron', color: 'Spruce' },
  { name: 'Home', slug: 'home', note: 'For slow mornings', art: 'mug', color: 'Clay' },
];

export const palettes = {
  'Field Tan': { body: '#ad7950', shade: '#7e5436', light: '#c99b6d', strap: '#674732' },
  Spruce: { body: '#526957', shade: '#364b40', light: '#788b6b', strap: '#493b2d' },
  Charcoal: { body: '#514f49', shade: '#353633', light: '#777773', strap: '#342d28' },
  Chestnut: { body: '#984f35', shade: '#703b29', light: '#b57150', strap: '#5d3527' },
  Natural: { body: '#d5bb92', shade: '#a68961', light: '#e4cda6', strap: '#8c6043' },
  Clay: { body: '#a75e48', shade: '#7f4837', light: '#c68166', strap: '#483d33' },
  Oat: { body: '#d5c5a5', shade: '#a69376', light: '#e6d9be', strap: '#715844' },
  Honey: { body: '#b77b42', shade: '#855330', light: '#cf9b58', strap: '#624532' },
};

function variants(colors, stocks, sizes = []) {
  const sizeOptions = sizes.length ? sizes : [null];
  return colors.flatMap((color, index) => sizeOptions.map((size, sizeIndex) => ({
    id: [color.toLowerCase().replaceAll(' ', '-'), size?.toLowerCase()].filter(Boolean).join('-'),
    color,
    ...(size ? { size } : {}),
    stock: stocks[index * sizeOptions.length + sizeIndex],
  })));
}

function product({ id, name, category, price, compare, blurb, description, materials, care, dimensions, colors, stocks, sizes, tags = [], shape, date }) {
  return {
    id: `hw-${id}`,
    slug: name.toLowerCase().replaceAll(/[^a-z0-9 ]/g, '').replaceAll(' ', '-'),
    name, category, price_cents: price,
    ...(compare ? { compare_at_cents: compare } : {}),
    blurb, description, materials, care, dimensions,
    variants: variants(colors, stocks, sizes),
    tags,
    art: { shape, palettes: Object.fromEntries(colors.map(color => [color, palettes[color]])) },
    added: date,
  };
}

export const products = [
  product({
    id: '01', name: 'The Mill Tote', category: 'Bags', price: 7800, shape: 'tote', date: '2026-03-16',
    blurb: 'Waxed canvas, open top, room for the day.',
    description: 'A stand-up tote cut from 18 oz waxed cotton duck. Two leather handles are set with solid brass rivets, and a shallow inside pocket keeps keys within reach.',
    materials: ['18 oz waxed cotton duck', 'Vegetable-tanned leather', 'Solid brass rivets'],
    care: 'Brush off dry dirt and spot clean with cool water. Rewax the canvas when it starts to look dry.',
    dimensions: '15 in wide × 13 in high × 5 in deep. 10 in handle drop.',
    colors: ['Field Tan', 'Spruce', 'Charcoal'], stocks: [12, 2, 0], tags: ['new'],
  }),
  product({
    id: '02', name: 'The Ridge Pack', category: 'Bags', price: 14800, shape: 'backpack', date: '2026-03-15',
    blurb: 'A roll-top pack for the walk out and back.',
    description: 'Heavy waxed canvas folds over into a roll-top held by a brass buckle. A padded cotton sleeve sits against your back, with an outside pocket for a folded map.',
    materials: ['18 oz waxed cotton duck', 'Cotton webbing', 'Solid brass buckle'],
    care: 'Wipe with a damp cloth and leave open to dry. Avoid machine washing.',
    dimensions: '12 in wide × 17 in high × 6 in deep when rolled. 19 L.',
    colors: ['Spruce', 'Field Tan', 'Charcoal'], stocks: [7, 6, 4], tags: ['new'],
  }),
  product({
    id: '03', name: 'The Fold Wallet', category: 'Small leather goods', price: 4800, shape: 'wallet', date: '2026-03-14',
    blurb: 'A slim bifold that softens with use.',
    description: 'Cut from 3 oz vegetable-tanned leather and saddle stitched by hand. Four card slots face a full-width bill pocket, with rounded corners that slip easily into a coat pocket.',
    materials: ['Vegetable-tanned leather', 'Waxed linen thread'],
    care: 'Wipe clean with a soft dry cloth. Use a small amount of neutral leather balm as needed.',
    dimensions: '4 in wide × 3.25 in high when folded.',
    colors: ['Chestnut', 'Charcoal', 'Natural'], stocks: [9, 8, 5], tags: ['new'],
  }),
  product({
    id: '04', name: 'The Shop Apron', category: 'Workshop', price: 9200, shape: 'apron', date: '2026-03-13',
    blurb: 'Cross-back straps and a place for your pencil.',
    description: 'A 14 oz waxed-canvas bib with cotton straps that cross between the shoulders. Two deep patch pockets and a narrow pencil slot are stitched with reinforced corners.',
    materials: ['14 oz waxed canvas', 'Cotton webbing', 'Solid brass sliders'],
    care: 'Brush off dust and spot clean with cold water. Hang by the straps to dry.',
    dimensions: 'Bib length in S, M and L is 29, 32 and 35 in. Cross-back straps adjust.',
    colors: ['Field Tan', 'Spruce', 'Charcoal'], sizes: ['S', 'M', 'L'], stocks: [4, 8, 5, 0, 5, 3, 3, 7, 5], tags: ['new'],
  }),
  product({
    id: '05', name: 'The Camp Mug', category: 'Home', price: 2400, shape: 'mug', date: '2026-03-12',
    blurb: 'A small enamel mug with a rolled dark rim.',
    description: 'Speckled enamel is fired over steel for a mug that feels at home by the kettle. The broad handle takes two fingers and the rolled rim is smooth against the lip.',
    materials: ['Enamel-coated steel'],
    care: 'Wash by hand with mild soap. Keep it out of the microwave.',
    dimensions: '3.5 in diameter × 3.25 in high. Holds 12 fl oz.',
    colors: ['Oat', 'Spruce', 'Clay'], stocks: [15, 11, 13], tags: ['new'],
  }),
  product({
    id: '06', name: 'The Canal Carryall', category: 'Bags', price: 11800, shape: 'carryall', date: '2026-02-11',
    blurb: 'A zip-top bag for a night away.',
    description: 'An 18 oz waxed-canvas shell wraps a boxy base with a cotton lining. The solid brass zipper opens wide to a flat pocket sewn into the side.',
    materials: ['18 oz waxed cotton duck', 'Cotton lining', 'Solid brass zipper'],
    care: 'Wipe the canvas clean, air dry, and store upright.',
    dimensions: '18 in wide × 11 in high × 8 in deep.',
    colors: ['Charcoal', 'Field Tan'], stocks: [5, 7],
  }),
  product({
    id: '07', name: 'The Slip Card Case', category: 'Small leather goods', price: 3000, shape: 'card', date: '2026-02-08',
    blurb: 'Three pockets cut from firm saddle leather.',
    description: 'Three pieces of 3 oz vegetable-tanned leather form a center pocket and two outer sleeves. Hand-burnished edges darken gradually where you handle them.',
    materials: ['Vegetable-tanned leather', 'Waxed linen thread'],
    care: 'Use a dry cloth to clean. Keep away from standing water.',
    dimensions: '4 in wide × 2.75 in high.',
    colors: ['Natural', 'Chestnut', 'Charcoal'], stocks: [11, 10, 6],
  }),
  product({
    id: '08', name: 'The Rivet Belt', category: 'Small leather goods', price: 6600, shape: 'belt', date: '2026-01-20',
    blurb: 'One strip of leather with a brass buckle.',
    description: 'A strip of 9 oz bridle leather is cut straight and finished with burnished edges. Two copper rivets hold a solid brass roller buckle in place.',
    materials: ['9 oz bridle leather', 'Copper rivets', 'Solid brass buckle'],
    care: 'Wipe dry after rain. Condition lightly with neutral balm.',
    dimensions: '1.25 in wide. S fits 28–31 in, M fits 32–35 in, L fits 36–39 in.',
    colors: ['Chestnut', 'Charcoal'], sizes: ['S', 'M', 'L'], stocks: [4, 9, 6, 5, 9, 5], tags: ['made to order'],
  }),
  product({
    id: '09', name: 'The Bench Roll', category: 'Workshop', price: 5600, shape: 'roll', date: '2026-03-11',
    blurb: 'Eight pockets for the tools you reach for.',
    description: 'Eight sleeves are stitched into a length of 14 oz waxed canvas. A folding flap covers tool ends, and a leather tie keeps the roll snug in a bag.',
    materials: ['14 oz waxed canvas', 'Vegetable-tanned leather', 'Cotton binding'],
    care: 'Sweep dust out of the pockets with a soft brush. Spot clean and air dry.',
    dimensions: '18 in wide × 12 in high laid flat.',
    colors: ['Field Tan', 'Spruce'], stocks: [9, 7], tags: ['new'],
  }),
  product({
    id: '10', name: 'The Bench Pouch', category: 'Workshop', price: 3200, compare: 4100, shape: 'pouch', date: '2026-01-11',
    blurb: 'A flat zip pouch for bits and offcuts.',
    description: 'A single piece of waxed canvas folds under a solid brass zipper. The unlined interior leaves room for a small rule and clipped-off lengths of pencil.',
    materials: ['14 oz waxed canvas', 'Solid brass zipper', 'Leather pull tab'],
    care: 'Turn inside out to shake out dust. Spot clean with a damp cloth.',
    dimensions: '9 in wide × 5 in high.',
    colors: ['Clay', 'Charcoal'], stocks: [4, 2], tags: ['last of the run'],
  }),
  product({
    id: '11', name: 'The Mill Throw', category: 'Home', price: 9800, shape: 'throw', date: '2026-02-16',
    blurb: 'A brushed wool throw with a short fringe.',
    description: 'Brushed wool is woven in a simple twill with two contrasting end stripes. The soft fringe is twisted by hand and the long edges are whipstitched.',
    materials: ['100% wool', 'Wool binding thread'],
    care: 'Air between uses and hand wash in cold water with wool soap. Dry flat.',
    dimensions: '50 in wide × 64 in long plus fringe.',
    colors: ['Oat', 'Spruce', 'Clay'], stocks: [7, 6, 4],
  }),
  product({
    id: '12', name: 'The Beeswax Candle', category: 'Home', price: 2800, shape: 'candle', date: '2026-02-07',
    blurb: 'Poured beeswax in a reusable amber jar.',
    description: 'Filtered beeswax is poured around a braided cotton wick. The amber glass jar carries a small paper label and a screw-top lid for storage.',
    materials: ['Filtered beeswax', 'Cotton wick', 'Amber glass jar'],
    care: 'Trim the wick to 0.25 in before lighting. Burn on a level, heat-safe surface.',
    dimensions: '2.75 in diameter × 3.25 in high. 6 oz of wax.',
    colors: ['Honey'], stocks: [17],
  }),
  product({
    id: '13', name: 'The Canvas Bin', category: 'Home', price: 4200, shape: 'bin', date: '2026-01-14',
    blurb: 'A soft-sided place for things that gather.',
    description: 'Two layers of heavy cotton duck meet at a rolled rim. Short stitched handles make the bin easy to take off a high shelf.',
    materials: ['18 oz cotton duck', 'Cotton webbing', 'Cotton thread'],
    care: 'Spot clean with cool water and dry upright. Reshape while damp.',
    dimensions: '10 in diameter × 9 in high.',
    colors: ['Natural', 'Spruce'], stocks: [10, 7],
  }),
  product({
    id: '14', name: 'The Key Loop', category: 'Small leather goods', price: 1800, shape: 'keys', date: '2026-01-06',
    blurb: 'A thumb-sized loop with a solid brass ring.',
    description: 'A short offcut of bridle leather is folded and fixed with one copper rivet. A split brass ring holds keys without adding much bulk.',
    materials: ['Bridle leather', 'Copper rivet', 'Solid brass split ring'],
    care: 'Wipe dry after getting wet and allow the leather to darken with use.',
    dimensions: '3.5 in long × 0.75 in wide including ring.',
    colors: ['Chestnut'], stocks: [18],
  }),
];

export default products;
