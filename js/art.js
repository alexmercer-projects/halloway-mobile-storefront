import { palettes } from '../data/products.js';

const brass = '#c49b57';
const stitch = (d, color = '#f1d6aa') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.2" stroke-dasharray="2.5 2.6" opacity=".72"/>`;
const rivets = (points, radius = 2.8) => points.map(([x, y]) =>
  `<circle cx="${x}" cy="${y}" r="${radius}" fill="${brass}" stroke="#6c5033" stroke-width=".7"/>`).join('');
const mark = (x, y, width = 29) => `<g transform="translate(${x} ${y})"><rect width="${width}" height="15" rx="2" fill="#dfbd8b" stroke="#754c33" stroke-width=".8"/><path d="M4 3H${width - 4}V12H4Z" fill="none" stroke="#9c704a" stroke-width=".55" stroke-dasharray="1 1"/><text x="${width / 2}" y="10" text-anchor="middle" font-family="serif" font-size="6" letter-spacing=".7" fill="#62452f">H&amp;CO.</text></g>`;

const shapes = {
  tote: ({ body, shade, light, strap }) => `
    <path d="M108 124V87C108 46 191 43 194 88L198 128" fill="none" stroke="${strap}" stroke-width="10"/>
    <path d="M54 112Q145 92 245 112L231 225Q229 240 212 242H91Q75 241 72 225Z" fill="${shade}"/>
    <path d="M54 112Q137 104 219 118L210 229Q209 240 198 242H90Q75 241 72 225Z" fill="${body}"/>
    <path d="M219 118L245 112 231 225Q228 239 211 242L207 242Z" fill="${shade}"/>
    <path d="M55 112Q145 93 245 112L219 119Q137 106 55 112Z" fill="#4d3a2d"/>
    <path d="M58 118Q138 111 217 124L216 129Q138 116 59 123Z" fill="${light}"/>
    <path d="M135 150Q166 149 194 154L188 210Q162 218 141 211Z" fill="${light}" opacity=".66"/>
    ${stitch('M138 154L144 208Q165 213 185 207L191 157 M62 125L78 222Q81 234 96 234H198Q205 233 207 224L215 127 M224 128L216 231')}
    <path d="M86 156L80 90C75 39 171 34 177 90L184 157" fill="none" stroke="${strap}" stroke-width="11" stroke-linecap="round"/>
    ${stitch('M86 150L82 90C78 43 169 39 175 90L182 150')}
    ${rivets([[86, 145], [87, 154], [182, 145], [184, 154]])}
    ${mark(151, 174)}
  `,
  backpack: ({ body, shade, light, strap }) => `
    <path d="M111 97C75 100 65 158 78 225M210 97C240 113 241 169 224 232" fill="none" stroke="${strap}" stroke-width="15" stroke-linecap="round"/>
    <path d="M132 78V59Q132 41 151 41H162Q180 41 180 58V82" fill="none" stroke="${strap}" stroke-width="9"/>
    <path d="M99 89Q97 69 120 66L196 68Q212 70 219 92L228 216Q225 243 198 245L107 243Q83 241 83 218Z" fill="${shade}"/>
    <path d="M103 79L192 77 209 101 211 217Q210 234 193 236H108Q91 234 92 214Z" fill="${body}"/>
    <path d="M99 75Q155 64 211 78L215 103Q152 112 97 103Z" fill="${light}"/>
    <path d="M94 93Q151 105 213 92V100Q154 113 94 102Z" fill="${shade}"/>
    <path d="M107 160Q151 152 196 160L195 217Q150 227 110 216Z" fill="${light}"/>
    <path d="M111 166Q153 159 192 166" fill="none" stroke="${shade}" stroke-width="4"/>
    <path d="M147 74H162V149H147Z" fill="${strap}"/>
    <rect x="144" y="110" width="21" height="23" rx="3" fill="none" stroke="${brass}" stroke-width="4"/>
    <path d="M154 110V126" stroke="${brass}" stroke-width="2"/>
    ${stitch('M101 109L98 211Q98 230 110 231H192Q203 230 205 214L205 107 M114 172L117 213Q151 221 190 213L192 173')}
    ${mark(148, 186)}`,
  wallet: ({ body, shade, light, strap }) => `
    <g transform="rotate(-12 150 149)">
      <rect x="65" y="87" width="170" height="121" rx="16" fill="${strap}"/>
      <rect x="63" y="81" width="166" height="119" rx="15" fill="${shade}"/>
      <path d="M78 81H217Q229 81 229 95V179Q228 193 215 193H77Q63 193 63 179V96Q63 81 78 81Z" fill="${body}"/>
      <path d="M78 82H215Q224 82 227 91H66Q69 83 78 82Z" fill="${light}"/>
      ${stitch('M81 91H212Q220 91 220 100V174Q220 184 210 184H82Q72 184 72 175V100Q72 91 81 91Z')}
      <path d="M83 190H203" stroke="${light}" opacity=".65"/>${mark(182, 158, 32)}
    </g>`,
  card: ({ body, shade, light, strap }) => `
    <g transform="rotate(-11 150 150)">
      <rect x="74" y="99" width="155" height="103" rx="11" fill="${shade}"/>
      <rect x="96" y="83" width="87" height="73" rx="6" fill="#eee2be"/>
      <rect x="125" y="96" width="86" height="68" rx="6" fill="#a3a28a"/>
      <path d="M74 130H119Q148 158 177 130H229V187Q229 199 217 199H86Q74 199 74 187Z" fill="${body}"/>
      <path d="M76 131H119Q148 158 177 131H226" fill="none" stroke="${light}" stroke-width="4"/>
      ${stitch('M81 138V185Q81 191 91 191H211Q222 191 222 184V139')}
      <path d="M115 96H160" stroke="${strap}" stroke-width="2" opacity=".5"/>${mark(178, 166)}
    </g>`,
  belt: ({ body, shade, light, strap }) => `
    <path d="M210 146C257 192 148 215 101 188C62 165 92 122 148 122C201 122 223 140 209 156C189 179 83 173 66 143C36 87 134 71 190 91"
      fill="none" stroke="${strap}" stroke-width="25" stroke-linecap="round"/>
    <path d="M210 137C257 183 148 206 101 179C62 156 92 113 148 113C201 113 223 131 209 147C189 170 83 164 66 134C36 78 134 62 190 82"
      fill="none" stroke="${body}" stroke-width="22" stroke-linecap="round"/>
    ${stitch('M202 79C120 49 35 83 73 133C99 164 188 162 208 144')}
    <g transform="rotate(17 219 87)">
      <rect x="187" y="68" width="46" height="38" rx="7" fill="none" stroke="#765334" stroke-width="8"/>
      <rect x="189" y="67" width="44" height="37" rx="7" fill="none" stroke="${brass}" stroke-width="6"/>
      <path d="M192 85H230" stroke="${brass}" stroke-width="3"/>
    </g>
    <path d="M157 185L224 179Q233 180 230 194L155 210" fill="${shade}"/>
    ${rivets([[177,196],[195,192],[212,188]], 2)}`,
  apron: ({ body, shade, light, strap }) => `
    <path d="M121 86L119 58Q119 40 144 39Q169 39 176 58L183 87M98 139L53 128Q39 123 34 133M205 139L244 126Q259 123 267 134"
      fill="none" stroke="${strap}" stroke-width="8" stroke-linecap="round"/>
    <path d="M116 73Q150 80 183 72Q190 124 217 136L226 230Q224 241 211 242H90Q76 240 75 230L81 142Q107 125 116 73Z" fill="${shade}"/>
    <path d="M121 76Q149 84 179 76Q187 125 210 139L219 229Q218 236 208 236H91Q83 235 82 229L88 145Q111 126 121 76Z" fill="${body}"/>
    ${stitch('M123 83Q150 90 177 83Q185 124 205 142L214 229H89L93 146Q112 129 123 83Z')}
    <path d="M101 168H198L201 215Q199 221 191 221H112Q104 220 103 213Z" fill="${light}"/>
    ${stitch('M105 173L108 212Q109 216 118 216H187Q195 216 195 211V173 M147 171V215 M157 171V215')}
    <path d="M150 176L149 150 151 145 153 151 155 174Z" fill="#d0ac62"/>
    <path d="M127 106H169L167 129H129Z" fill="${light}"/>${mark(134, 109)}
    ${rivets([[120, 79], [180, 79], [88, 145], [210, 145]])}`,
  roll: ({ body, shade, light, strap }) => `
    <g transform="rotate(-8 150 145)">
      <path d="M54 85Q63 72 82 76L238 89V204L75 217Q55 219 53 203Z" fill="${shade}"/>
      <path d="M57 78L235 86V202L71 209Q56 209 56 194Z" fill="${body}"/>
      <path d="M58 81L235 87 228 115 68 113Z" fill="${light}"/>
      <path d="M59 151L235 146V199L72 204Q60 202 59 195Z" fill="${light}"/>
      <path d="M82 149V123H91V149M109 149V118H115V149M133 149V128H142V149M159 149V119H164V149M183 149V123H190V149" fill="#5d554b"/>
      ${stitch('M64 155L65 194Q66 199 76 198L229 194V152 M80 155V196 M101 154V196 M123 154V196 M146 153V196 M168 152V195 M195 152V194')}
      <path d="M235 121Q253 120 255 134L267 170M235 133Q246 127 253 153L254 186" fill="none" stroke="${strap}" stroke-width="4" stroke-linecap="round"/>
      ${mark(194, 172)}
    </g>`,
  throw: ({ body, shade, light, strap }) => `
    <path d="M68 115L179 70 234 110 222 200 108 227 61 197Z" fill="${shade}"/>
    <path d="M68 116L177 71 234 110 122 151Z" fill="${light}"/>
    <path d="M68 116L122 151 108 227 61 195Z" fill="${body}"/>
    <path d="M122 151L234 110 221 199 108 227Z" fill="${body}"/>
    <path d="M114 186L230 150M112 196L229 161M66 153L115 184M65 163L113 196" stroke="${strap}" stroke-width="5" opacity=".76"/>
    <path d="M75 111L130 148 117 221M89 105L146 142 132 219M106 98L163 136 149 214M125 91L183 130 170 209M145 84L202 123 190 204M164 77L219 115 208 201" fill="none" stroke="#fff3d4" stroke-width="1.1" opacity=".41"/>
    <path d="M62 194L59 207M69 199L67 214M77 205L75 219M86 211L84 224M95 218L93 231M104 225L102 239M113 225L111 239M123 223L120 237M133 220L130 234M143 218L140 232M153 215L150 229M163 212L160 226M173 210L170 223M183 207L180 221M193 204L190 218M203 201L200 215M214 198L210 213M222 197L219 208" stroke="${shade}" stroke-width="2.1" stroke-linecap="round"/>
  `,
  mug: ({ body, shade, light }) => `
    <path d="M201 113H222C258 113 250 175 212 182H197" fill="none" stroke="${shade}" stroke-width="13"/>
    <path d="M203 110H218C251 110 247 170 210 179H197" fill="none" stroke="${light}" stroke-width="8"/>
    <path d="M80 105H209L200 193Q195 214 147 215Q96 214 90 194Z" fill="${body}"/>
    <path d="M171 106H209L200 193Q196 209 162 214Q178 202 180 175Z" fill="${shade}" opacity=".55"/>
    <path d="M90 121L99 187Q101 195 112 199" fill="none" stroke="${light}" stroke-width="5" opacity=".6"/>
    <ellipse cx="144.5" cy="105" rx="65" ry="19" fill="#413b31"/>
    <ellipse cx="144.5" cy="104" rx="58" ry="13" fill="#ede0bf"/>
    <ellipse cx="146" cy="109" rx="49" ry="7" fill="${shade}" opacity=".66"/>
    <g fill="#494135" opacity=".49"><circle cx="111" cy="135" r="1.4"/><circle cx="128" cy="156" r="1.1"/><circle cx="149" cy="139" r="1.5"/><circle cx="169" cy="184" r="1.5"/><circle cx="138" cy="200" r="1.2"/><circle cx="114" cy="186" r="1.3"/><circle cx="184" cy="130" r="1.1"/><circle cx="185" cy="161" r="1.6"/><circle cx="104" cy="166" r="1.1"/></g>
    <text x="145" y="174" text-anchor="middle" fill="#322b25" font-family="serif" font-size="16" letter-spacing="1.5">H&amp;CO.</text>`,
  candle: ({ body, shade, light }) => `
    <path d="M96 109Q96 98 109 97H190Q204 97 204 108V203Q202 220 151 223Q99 221 96 205Z" fill="${shade}"/>
    <path d="M101 115H188V203Q184 215 146 215Q105 215 102 205Z" fill="${body}"/>
    <path d="M106 121V199M111 123V202" stroke="${light}" stroke-width="3" opacity=".62"/>
    <ellipse cx="150" cy="107" rx="54" ry="15" fill="#695035"/>
    <ellipse cx="150" cy="107" rx="46" ry="10" fill="#dda963"/>
    <path d="M149 108L151 94" stroke="#3f3023" stroke-width="2"/>
    <path d="M149 97Q137 84 151 69Q152 78 158 85Q162 95 149 97Z" fill="#edb757"/>
    <path d="M150 95Q145 90 151 83Q157 90 150 95Z" fill="#f8dea2"/>
    <rect x="119" y="146" width="62" height="46" rx="2" fill="#e8d5a9"/>
    <path d="M124 151H176V187H124Z" fill="none" stroke="#ab875b"/>
    <text x="150" y="165" text-anchor="middle" fill="#544132" font-family="serif" font-size="10">H&amp;CO.</text>
    <text x="150" y="179" text-anchor="middle" fill="#544132" font-family="serif" font-size="6" letter-spacing="1">BEESWAX</text>`,
  bin: ({ body, shade, light, strap }) => `
    <path d="M64 112Q45 100 45 136Q46 170 72 167M227 115Q257 104 255 134Q250 156 227 159" fill="none" stroke="${strap}" stroke-width="8"/>
    <path d="M60 113H240L228 205Q224 226 151 231Q78 229 73 208Z" fill="${shade}"/>
    <path d="M64 114H221L210 208Q198 225 147 226Q89 225 78 209Z" fill="${body}"/>
    <ellipse cx="150" cy="115" rx="90" ry="27" fill="${light}"/>
    <ellipse cx="150" cy="114" rx="80" ry="20" fill="${shade}"/>
    <path d="M71 128Q151 155 230 128" fill="none" stroke="${strap}" stroke-width="3" opacity=".45"/>
    ${stitch('M72 136Q149 161 228 136 M85 205Q147 232 225 204')}${mark(130, 171, 34)}`,
  carryall: ({ body, shade, light, strap }) => `
    <path d="M101 139L105 87Q110 59 144 59Q178 59 183 86L190 128" fill="none" stroke="${strap}" stroke-width="10"/>
    <path d="M71 116Q150 101 226 116Q248 121 253 145L255 199Q239 221 204 223H88Q54 219 49 204L49 151Q50 126 71 116Z" fill="${shade}"/>
    <path d="M71 121Q142 109 211 119L222 205Q220 217 205 219H80Q59 214 58 203L57 151Q59 131 71 121Z" fill="${body}"/>
    <path d="M65 130Q146 113 229 126" fill="none" stroke="${light}" stroke-width="5"/>
    <path d="M76 117Q145 105 221 117" fill="none" stroke="${brass}" stroke-width="3" stroke-dasharray="1 1"/>
    <path d="M95 210L88 97Q86 63 127 63Q166 63 173 96L181 215" fill="none" stroke="${strap}" stroke-width="11"/>
    ${stitch('M94 202L91 97Q90 68 127 68Q163 68 170 97L180 207 M63 157L65 202Q67 211 84 214H203Q215 210 216 202')}
    ${rivets([[94,196],[180,196]])}${mark(113, 162)}`,
  pouch: ({ body, shade, light, strap }) => `
    <g transform="rotate(-9 150 148)">
      <path d="M61 103H237L229 188Q229 200 216 201H83Q71 201 70 191Z" fill="${shade}"/>
      <path d="M65 108H230L224 189Q222 195 213 195H84Q77 194 77 188Z" fill="${body}"/>
      <path d="M65 108H230V123H67Z" fill="${light}"/>
      <path d="M63 106H237" stroke="${strap}" stroke-width="8"/>
      <path d="M66 106H234" stroke="${brass}" stroke-width="2" stroke-dasharray="1 1"/>
      <path d="M228 106L251 127" stroke="${strap}" stroke-width="6" stroke-linecap="round"/>
      ${stitch('M73 119H223 M73 125L82 186Q83 190 91 190H210Q217 190 218 185L224 127')}
      ${mark(177, 163, 32)}
    </g>`,
  keys: ({ body, shade, light, strap }) => `
    <g transform="rotate(22 146 147)">
      <circle cx="147" cy="187" r="29" fill="none" stroke="#725735" stroke-width="8"/>
      <circle cx="146" cy="186" r="29" fill="none" stroke="${brass}" stroke-width="5"/>
      <path d="M131 91Q131 77 149 77Q166 77 166 91V160Q162 171 149 170Q132 169 131 160Z" fill="${strap}"/>
      <path d="M129 91Q129 76 146 76Q163 76 163 91V158Q161 166 146 166Q131 165 129 158Z" fill="${body}"/>
      <path d="M133 91Q133 80 146 80Q158 80 158 91V107H133Z" fill="${shade}"/>
      <path d="M130 108H161" stroke="${light}"/>
      ${stitch('M133 111V156Q134 162 146 162Q158 162 159 156V111')}
      ${rivets([[146, 151]], 5)}
    </g>`,
};

const sceneItems = {
  tote: '<rect x="26" y="153" width="44" height="71" rx="4" fill="#768471" transform="rotate(-13 26 153)"/><path d="M30 162L66 154M32 168L66 160" stroke="#e6d7b7" opacity=".7"/>',
  backpack: '<path d="M52 186L83 178 103 207 72 215Z" fill="#eee0bc"/><path d="M57 187L70 209M68 183L83 207M78 181L93 205" stroke="#ac8e67" opacity=".7"/>',
  apron: '<path d="M245 190L248 147 252 139 255 147 252 190Z" fill="#ae8a52"/><path d="M261 217V176H268V217Z" fill="#777463"/>',
  mug: '<circle cx="150" cy="222" r="69" fill="#ac8a62" transform="translate(0 147) scale(1 .34)"/><path d="M20 230L88 219 94 236 26 247Z" fill="#e9dab7"/>',
  candle: '<path d="M222 193L265 208 257 230 214 215Z" fill="#b18557"/><path d="M218 210L257 224" stroke="#ebd3a1" stroke-width="6"/>',
};

let artId = 0;

function texture(id) {
  return `<defs><pattern id="${id}" width="19" height="17" patternUnits="userSpaceOnUse">
    <path d="M2 2h2m7 3h1m-8 7h1m7 3h2m4-8h1" stroke="#574535" stroke-opacity=".14" stroke-width=".7"/>
    <path d="M6 6h2m7 6h2m0-11h1m-10 15h1" stroke="#fff9e8" stroke-opacity=".27" stroke-width=".7"/>
  </pattern></defs>`;
}

export function productArt(product, variant = product.variants[0], view = 0) {
  const id = `grain-${++artId}`;
  const palette = product.art.palettes[variant.color];
  const shape = product.art.shape;
  const backdrops = { Spruce: '#d9ddd0', Charcoal: '#dedbd1', Clay: '#ead4c7', Oat: '#e7decb', Chestnut: '#ead7c4' };
  const background = backdrops[variant.color] ?? '#e9dcc8';
  const box = view === 1 ? '78 79 144 134' : '0 0 300 280';
  const proportions = view === 2 ? 'translate(42 51) scale(.72)' : '';
  const lowProfile = ['wallet', 'card', 'belt', 'pouch', 'mug', 'candle', 'keys'].includes(shape);
  const frontPosition = lowProfile ? 'translate(-12 -19) scale(1.08)' : 'translate(3 -2) scale(.98)';
  return `<svg class="product-art" viewBox="${box}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    ${texture(id)}
    <path d="M0 0H300V280H0Z" fill="${background}"/>
    <path d="M0 0H213L91 280H0Z" fill="#fff9eb" opacity=".26"/>
    <path d="M0 209Q161 200 300 214V280H0Z" fill="#54402a" opacity=".075"/>
    ${view === 2 ? `<path d="M0 218H300M0 228H300M0 250H300" stroke="#83694a" opacity=".23"/>${sceneItems[shape] ?? '<path d="M226 202L278 219 270 237 219 220Z" fill="#9d987d"/><path d="M229 210L272 225" stroke="#d8cbad"/>'}` : ''}
    <g transform="${proportions || (view === 0 ? frontPosition : '')}">
      <ellipse cx="153" cy="${lowProfile ? 215 : 242}" rx="${lowProfile ? 73 : 93}" ry="9" fill="#4e3927" opacity=".13"/>
      ${shapes[shape](palette)}
    </g>
    <path d="M0 0H300V280H0Z" fill="url(#${id})"/>
  </svg>`;
}

export function categoryArt(category) {
  return productArt({ art: { shape: category.art, palettes } }, { color: category.color });
}

export function heroArt() {
  const id = `grain-${++artId}`;
  return `<svg viewBox="0 0 760 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    ${texture(id)}
    <defs>
      <linearGradient id="${id}-wall" x2="1" y2="1"><stop stop-color="#e9d8bb"/><stop offset="1" stop-color="#ba9877"/></linearGradient>
      <linearGradient id="${id}-bench" x2="0" y2="1"><stop stop-color="#b98e64"/><stop offset="1" stop-color="#906443"/></linearGradient>
    </defs>
    <path d="M0 0H760V520H0Z" fill="url(#${id}-wall)"/>
    <path d="M0 0H492L250 344H0Z" fill="#f8e7c5" opacity=".48"/>
    <path d="M91 0H105L0 188V164ZM277 0H289L65 348H46ZM405 0H418L208 350H190Z" fill="#a17e5b" opacity=".12"/>
    <path d="M0 352L760 333V520H0Z" fill="url(#${id}-bench)"/>
    <path d="M0 352L760 333M0 389L760 371M0 456L760 435M0 497L760 478" fill="none" stroke="#6b503a" stroke-width="2" opacity=".35"/>
    <path d="M30 376L221 373M98 417L302 411M423 491L662 485M543 403L755 397M606 352L705 349" stroke="#e0b284" opacity=".51"/>
    <path d="M153 411L402 367 568 429 320 492Z" fill="#bbad8f" opacity=".61"/>
    <path d="M173 425L400 383 539 431 311 480Z" fill="none" stroke="#e4d0aa" stroke-width="2" stroke-dasharray="3 5" opacity=".62"/>
    <ellipse cx="394" cy="420" rx="227" ry="34" fill="#4d3728" opacity=".22"/>
    <g transform="translate(251 -6) rotate(7 196 199) scale(1.50)">${shapes.backpack(palettes.Spruce)}</g>
    <g transform="translate(42 14) rotate(-8 178 226) scale(1.57)">${shapes.tote(palettes['Field Tan'])}</g>
    <g transform="translate(390 281) rotate(9 130 125) scale(.83)">${shapes.wallet(palettes.Chestnut)}</g>
    <g transform="translate(567 262) scale(.60)">${shapes.mug(palettes.Oat)}</g>
    <path d="M43 465L120 447 126 455 49 475Z" fill="#6b4933"/><path d="M43 465L34 472 49 475Z" fill="#d3b177"/>
    <path d="M0 0H760V520H0Z" fill="url(#${id})"/>
  </svg>`;
}

export function makerArt() {
  const id = `grain-${++artId}`;
  return `<svg viewBox="0 0 620 290" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    ${texture(id)}
    <path d="M0 0H620V290H0Z" fill="#b8ad90"/>
    <path d="M0 0H370L184 290H0Z" fill="#ead8af" opacity=".55"/>
    <path d="M0 80L620 66M0 174L620 151M0 264L620 247" stroke="#765d43" stroke-width="2" opacity=".36"/>
    <path d="M171 55L463 44 516 235 193 270Z" fill="#76806a" opacity=".65"/>
    <path d="M183 63L452 54 501 224 203 257Z" stroke="#ded0aa" stroke-dasharray="3 5" fill="none"/>
    <g transform="translate(94 10) rotate(10 160 140)">${shapes.roll(palettes['Field Tan'])}</g>
    <path d="M366 152L467 98 474 107 370 160Z" fill="#634c35"/>
    <path d="M414 189L483 160 489 169 423 199Z" fill="#523e2e"/>
    <path d="M423 199L409 204 414 190Z" fill="#ddba79"/>
    <path d="M0 0H620V290H0Z" fill="url(#${id})"/>
  </svg>`;
}
