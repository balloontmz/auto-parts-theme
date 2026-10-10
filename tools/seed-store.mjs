#!/usr/bin/env node
/**
 * Auto Parts store seeder
 * ------------------------------------------------------------------
 * 一次性初始化开发店铺的真实汽配内容：
 *   1. 创建适配库 metafield 定义（fitment_make/model/year/json/universal）
 *   2. 删除店铺自带示例数据（snowboard / gift card 等假数据）
 *   3. 创建 18 个真实汽车配件商品（真实品牌、SKU、AUD 价格、图片、适配数据）
 *   4. 创建 6 个分类集合（Brake System / Engine & Filtration / ...）
 *   5. 重建主导航（mega menu 分类）与页脚菜单
 *   6. 创建 About / Contact / FAQ / Shipping & Returns 页面
 *
 * 用法：
 *   node tools/seed-store.mjs --shop auto-parts-pxpjvqd4.myshopify.com --token shpat_xxx
 *
 * Custom App Token 获取（Dev Store 后台）：
 *   Settings → Apps and sales channels → Develop apps → Create an app
 *   → Configure Admin API scopes 勾选：
 *     Products / Custom data / Navigation / Pages / Content and files / Publications
 *   → Install app → API credentials → Reveal token once（只显示一次）
 */

const API = '2025-01';

/* ---------------------------- 数据 ---------------------------- */

const IMG = (n) => `https://image-search-mcp-cn-beijing.oss-cn-beijing.aliyuncs.com/image-search-mcp/images-ppt/${n}`;

const DEFINITIONS = [
  { name: 'Fitment make', namespace: 'custom', key: 'fitment_make', type: 'list.single_line_text_field', description: '适配厂牌列表（如 Toyota）' },
  { name: 'Fitment model', namespace: 'custom', key: 'fitment_model', type: 'list.single_line_text_field', description: '适配车型列表（如 Hilux）' },
  { name: 'Fitment year', namespace: 'custom', key: 'fitment_year', type: 'list.single_line_text_field', description: '适配年份列表（4位数字）' },
  { name: 'Fitment detail', namespace: 'custom', key: 'fitment_json', type: 'json', description: '适配区间明细 [{make,model,year_from,year_to}]' },
  { name: 'Universal fit', namespace: 'custom', key: 'fitment_universal', type: 'boolean', description: '全车通用件（油液/灯泡等）' },
];

const yrs = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
const fit = (make, model, a, b) => ({
  make: [make],
  model: [model],
  year: yrs(a, b),
  json: [{ make, model, year_from: a, year_to: b }],
});
const fit2 = (m1, mo1, a1, b1, m2, mo2, a2, b2) => ({
  make: [...new Set([m1, m2])],
  model: [mo1, mo2],
  year: [...new Set([...yrs(a1, b1), ...yrs(a2, b2)])],
  json: [
    { make: m1, model: mo1, year_from: a1, year_to: b1 },
    { make: m2, model: mo2, year_from: a2, year_to: b2 },
  ],
});
const universal = { universal: true };

const PRODUCTS = [
  // ---- Brake System ----
  {
    title: 'TRW Front Brake Pad Set — Toyota Hilux KUN26 (2005–2015)',
    vendor: 'TRW', type: 'Brake Pads', sku: 'TRW-HPK-1042', price: '89.00',
    img: IMG('a70f4128b89f.jpg'),
    body: '<p>Genuine TRW front brake pad set for the Toyota Hilux KUN26 workmate and SR5. Ceramic friction compound for low dust and quiet braking, with anti-squeal shims fitted.</p><ul><li>Position: Front axle</li><li>OEM reference: 04465-0K270</li><li>Wear sensor: Not required</li></ul>',
    tags: 'brake,hilux,utoyota-replacement',
    f: fit('Toyota', 'Hilux', 2005, 2015),
  },
  {
    title: 'RDA Slotted Brake Rotor Pair — Ford Ranger PX (2011–2021)',
    vendor: 'RDA', type: 'Brake Rotors', sku: 'RDA-DR835S-PR', price: '189.00',
    img: IMG('cee3b13959b8.jpg'),
    body: '<p>RDA slotted disc brake rotor pair, directionally slotted to deglaze pads and expel gas under heavy braking. Powder-coated hubs resist corrosion.</p><ul><li>Position: Front axle (pair)</li><li>Diameter: 320mm</li><li>Slots improve wet performance</li></ul>',
    tags: 'brake,ranger',
    f: fit('Ford', 'Ranger', 2011, 2021),
  },
  // ---- Engine & Filtration ----
  {
    title: 'RycO Oil Filter Z417 — Ford Ranger / Everest 2.2L 3.2L (2011–2024)',
    vendor: 'Ryco', type: 'Oil Filters', sku: 'RYCO-Z417', price: '18.50',
    img: IMG('afc02a8fb4e1.jpg'),
    body: '<p>Ryco Z417 spin-on oil filter with synthetic media rated to capture 5-micron particles. Anti-drainback valve keeps the engine protected at cold start.</p><ul><li>Thread: M20 x 1.5</li><li>Replace every 10,000 km</li></ul>',
    tags: 'filtration,ranger,everest',
    f: fit2('Ford', 'Ranger', 2011, 2024, 'Ford', 'Everest', 2015, 2024),
  },
  {
    title: 'MANN Air Filter — Toyota Landcruiser 200 Series (2007–2021)',
    vendor: 'MANN Filter', type: 'Air Filters', sku: 'MANN-C30122', price: '42.00',
    img: IMG('3352b8e9d6e0.png'),
    body: '<p>OEM-quality MANN pleated air filter for the 200 Series Landcruiser V8 petrol and diesel. High dust-holding capacity for dusty Outback conditions.</p>',
    tags: 'filtration,landcruiser',
    f: fit('Toyota', 'Landcruiser', 2007, 2021),
  },
  {
    title: 'NGK Iridium Spark Plug Set of 4 — Mazda 3 / CX-5 2.0L (2012–2024)',
    vendor: 'NGK', type: 'Spark Plugs', sku: 'NGK-ILK7-SET4', price: '96.00',
    img: IMG('66d236e71464.jpg'),
    body: '<p>Set of 4 NGK Iridium IX plugs, the upgrade choice for Skyactiv-G engines. 0.6mm iridium centre electrode for smoother idle and better fuel economy.</p><ul><li>Gap: 0.7mm (pre-set)</li><li>Replace every 100,000 km</li></ul>',
    tags: 'ignition,mazda',
    f: fit2('Mazda', 'Mazda 3', 2012, 2024, 'Mazda', 'CX-5', 2012, 2024),
  },
  {
    title: 'Ryco Cabin Filter — Toyota RAV4 (2013–2024)',
    vendor: 'Ryco', type: 'Cabin Filters', sku: 'RYCO-RCA427P', price: '35.00',
    img: IMG('89edd88b043b.jpg'),
    body: '<p>Ryco cabin air filter with activated carbon layer — blocks dust, pollen and exhaust odours before they enter the cabin. 15-minute DIY swap behind the glovebox.</p>',
    tags: 'filtration,rav4',
    f: fit('Toyota', 'RAV4', 2013, 2024),
  },
  // ---- Suspension & Steering ----
  {
    title: 'KYB Rear Shock Absorber — Isuzu D-Max (2012–2020)',
    vendor: 'KYB', type: 'Shock Absorbers', sku: 'KYB-349195', price: '128.00',
    img: IMG('24f5792e97f5.jpg'),
    body: '<p>KYB Excel-G twin-tube rear shock, gas-charged and matched to OEM valving. Sold individually; replace in pairs for even handling.</p>',
    tags: 'suspension,dmax',
    f: fit('Isuzu', 'D-Max', 2012, 2020),
  },
  {
    title: 'Bilstein Heavy Duty Front Strut — Toyota Prado 150 (2009–2023)',
    vendor: 'Bilstein', type: 'Struts', sku: 'BIL-24-227779', price: '285.00',
    img: IMG('5e407ffe2619.jpg'),
    body: '<p>Bilstein B6 Heavy Duty front strut, tuned for constant loads, bull bars and towing. Monotube design keeps damping consistent at highway temperatures.</p>',
    tags: 'suspension,prado',
    f: fit('Toyota', 'Prado', 2009, 2023),
  },
  {
    title: 'Whiteline Sway Bar Link Kit — Mitsubishi Triton MQ/MR (2015–2024)',
    vendor: 'Whiteline', type: 'Sway Bar Links', sku: 'WHT-KLC175', price: '64.00',
    img: IMG('6a0b8624b92a.png'),
    body: '<p>Whiteline heavy-duty sway bar link pair with greasable ball joints. Fixes clunks over driveways and restores roll control on Triton MQ/MR.</p>',
    tags: 'suspension,triton',
    f: fit('Mitsubishi', 'Triton', 2015, 2024),
  },
  // ---- Electrical & Lighting ----
  {
    title: 'Narva LED Headlight Conversion Kit H4 (Pair)',
    vendor: 'Narva', type: 'Lighting', sku: 'NAR-71720H4', price: '79.00',
    img: IMG('936ff9eda3bc.jpg'),
    body: '<p>Narva 9-32V LED headlight conversion kit with compact driver cans — fits most H4 housings without drilling. 6000K crisp white beam, ADR-compliant pattern.</p>',
    tags: 'lighting,universal',
    f: universal,
  },
  {
    title: 'Century N70ZZ 12V Battery — Hilux / Prado / Navara',
    vendor: 'Century', type: 'Batteries', sku: 'CNT-N70ZZ', price: '215.00',
    img: IMG('8cbc76053714.jpg'),
    body: '<p>Century N70ZZ heavy-duty calcium battery, 750 CCA. Built for Australian heat and start-stop reliability on diesel 4WDs. 36-month warranty.</p>',
    tags: 'electrical,battery',
    f: fit2('Toyota', 'Hilux', 2005, 2024, 'Toyota', 'Prado', 2003, 2023),
  },
  {
    title: 'Bosch Alternator 12V 80A — Toyota Corolla ZRE152 (2007–2013)',
    vendor: 'Bosch', type: 'Alternators', sku: 'BSN-0986081440', price: '465.00',
    img: IMG('c218d453e85b.png'),
    body: '<p>Remanufactured Bosch alternator, 12V 80A, load-tested and sealed. Supplied with a 24-month warranty and matched pulley.</p>',
    tags: 'electrical,corolla',
    f: fit('Toyota', 'Corolla', 2007, 2013),
  },
  // ---- Drivetrain & Cooling ----
  {
    title: 'Exedy Clutch Kit — Nissan Navara D40 (2005–2015)',
    vendor: 'Exedy', type: 'Clutch Kits', sku: 'EXY-TYK2003', price: '589.00',
    img: IMG('0a7836fc9bbf.jpg'),
    body: '<p>Genuine Exedy 3-piece clutch kit: pressure plate, organic disc and release bearing. OEM specification for the YD25 2.5L diesel.</p>',
    tags: 'drivetrain,navara',
    f: fit('Nissan', 'Navara', 2005, 2015),
  },
  {
    title: 'Dayco Timing Belt Kit — Mazda BT-50 (2006–2011)',
    vendor: 'Dayco', type: 'Timing Kits', sku: 'DYC-KTB924', price: '189.00',
    img: IMG('37d1165b6438.jpeg'),
    body: '<p>Complete Dayco timing belt kit with water pump, tensioner and idler pulleys. Replace every 100,000 km — belt failure on the P5AT/B3000 engines bends valves.</p>',
    tags: 'engine,bt50',
    f: fit('Mazda', 'BT-50', 2006, 2011),
  },
  {
    title: 'Natrad Alloy Radiator — Toyota Hilux GUN (2015–2024)',
    vendor: 'Natrad', type: 'Radiators', sku: 'NAT-CTR018', price: '389.00',
    img: IMG('180638de0a21.jpg'),
    body: '<p>Natrad high-flow aluminium radiator with plastic tanks, pressure-tested and ready to bolt in. Keeps GUN-series turbo diesels cool when towing.</p>',
    tags: 'cooling,hilux',
    f: fit('Toyota', 'Hilux', 2015, 2024),
  },
  // ---- Servicing & Fluids ----
  {
    title: 'Penrite Full Synthetic 10W-40 Engine Oil 5L',
    vendor: 'Penrite', type: 'Engine Oil', sku: 'PEN-HPR5-5L', price: '89.00',
    img: IMG('1b4719378de3.png'),
    body: '<p>Penrite FULL ZINC+ 10W-40 semi-full synthetic petrol and diesel oil. API SP / ACEA A3/B4, suits most petrol 4WDs and light commercials. Australian made.</p>',
    tags: 'fluids,oil,universal',
    f: universal,
  },
  {
    title: 'Penrite EDS 10W-40 Full Synthetic 1L',
    vendor: 'Penrite', type: 'Engine Oil', sku: 'PEN-EDS10-1L', price: '29.00',
    img: IMG('91c2f42aa206.png'),
    body: '<p>Penrite EDS 10 full synthetic 1L top-up bottle — API SP, ACEA A3/B4, JASO MA2. Full zinc protection for turbo engines.</p>',
    tags: 'fluids,oil,universal',
    f: universal,
  },
  {
    title: 'Valvoline DOT 4 LV Brake Fluid 500ml',
    vendor: 'Valvoline', type: 'Brake Fluid', sku: 'VAL-BF4LV-500', price: '15.00',
    img: IMG('8e666e9d30c0.jpg'),
    body: '<p>Valvoline DOT 4 LV low-viscosity brake fluid for vehicles with electronic stability and ABS systems. Wet boiling point 170°C; flush every 2 years.</p>',
    tags: 'fluids,brake,universal',
    f: universal,
  },
];

const COLLECTIONS = [
  { title: 'Brake System', handle: 'brake-system', desc: '<p>Brake pads, rotors and fluid — everything to stop safely.</p>' },
  { title: 'Engine & Filtration', handle: 'engine-filtration', desc: '<p>Oil, air and cabin filters, spark plugs and ignition parts.</p>' },
  { title: 'Suspension & Steering', handle: 'suspension-steering', desc: '<p>Shocks, struts, sway bar links and steering components.</p>' },
  { title: 'Electrical & Lighting', handle: 'electrical-lighting', desc: '<p>Batteries, alternators, globes and LED upgrades.</p>' },
  { title: 'Drivetrain & Cooling', handle: 'drivetrain-cooling', desc: '<p>Clutch kits, timing belts and cooling system parts.</p>' },
  { title: 'Servicing & Fluids', handle: 'servicing-fluids', desc: '<p>Engine oils, brake fluids and consumables.</p>' },
];

const MAIN_MENU = {
  title: 'Main menu',
  items: [
    { title: 'Home', url: '/', type: 'FRONTPAGE' },
    {
      title: 'Shop by Category',
      type: 'HTTP',
      items: COLLECTIONS.map((c) => ({ title: c.title, url: `/collections/${c.handle}`, type: 'HTTP' })),
    },
    { title: 'All Parts', url: '/collections/all', type: 'HTTP' },
    { title: 'About', url: '/pages/about-us', type: 'HTTP' },
    { title: 'Contact', url: '/pages/contact', type: 'HTTP' },
    { title: 'FAQ', url: '/pages/faq', type: 'HTTP' },
  ],
};

const FOOTER_MENU = {
  title: 'Footer menu',
  items: [
    { title: 'About us', url: '/pages/about-us', type: 'HTTP' },
    { title: 'Contact', url: '/pages/contact', type: 'HTTP' },
    { title: 'FAQ', url: '/pages/faq', type: 'HTTP' },
    { title: 'Shipping & Returns', url: '/pages/shipping-returns', type: 'HTTP' },
  ],
};

const PAGES = [
  {
    handle: 'about-us',
    title: 'About Us',
    body: `<div class="ap-page">
      <p><strong>Australian owned and operated</strong>, we stock over 20,000 parts covering the makes Australians actually drive — Toyota, Ford, Mazda, Mitsubishi, Nissan, Isuzu and more.</p>
      <p>Every listing shows the exact years and models a part fits, so you can order with confidence. Can't find your part? <a href="/pages/contact">Talk to our parts specialists</a> — we answer within one business day.</p>
      <ul>
        <li>Fitment-checked catalogue — no guesswork</li>
        <li>Genuine and OEM-equivalent brands: TRW, Bosch, Ryco, KYB, NGK, Exedy, Penrite</li>
        <li>Fast dispatch Australia-wide from our Sydney warehouse</li>
      </ul>
    </div>`,
  },
  {
    handle: 'contact',
    title: 'Contact',
    templateSuffix: 'contact',
    body: `<div class="ap-page">
      <p><strong>Auto Parts</strong> — Sydney NSW, Australia</p>
      <p>Phone: 1300 000 000<br>Email: sales@autoparts.example<br>Hours: Mon–Fri 8:30–17:30 AEST</p>
      <p>Use the form below and our parts specialists will reply within one business day. For fitment questions, include your vehicle's year, make, model.</p>
    </div>`,
  },
  {
    handle: 'faq',
    title: 'FAQ',
    body: `<div class="ap-page">
      <h3>Do I need an account to order?</h3>
      <p>Yes — orders are for registered members. Registration is free and takes under a minute; dealers can share a referral link so their customers are tracked automatically.</p>
      <h3>How do I know a part fits my car?</h3>
      <p>Use the <strong>Select your vehicle</strong> picker at the top of the site. Every product page then shows a green "fits" or red "does not fit" confirmation against your exact year, make and model.</p>
      <h3>How fast is shipping?</h3>
      <p>Orders placed before 1pm AEST dispatch the same business day. Free shipping on orders over $199; express options available at checkout.</p>
      <h3>What payments do you accept?</h3>
      <p>Credit card, PayPal and direct bank deposit.</p>
      <h3>Returns</h3>
      <p>Unfitted parts in original packaging can be returned within 30 days — see <a href="/pages/shipping-returns">Shipping &amp; Returns</a>.</p>
    </div>`,
  },
  {
    handle: 'shipping-returns',
    title: 'Shipping & Returns',
    body: `<div class="ap-page">
      <h3>Shipping</h3>
      <ul><li>Free standard shipping Australia-wide on orders over $199</li><li>$14.95 flat rate under $199</li><li>Same-day dispatch on orders before 1pm AEST</li><li>Express post available at checkout</li></ul>
      <h3>Returns</h3>
      <ul><li>30 days on unfitted parts in original packaging</li><li>Electrical items are exchange-only once installed</li><li>Warranty claims are handled against the manufacturer's term (12–36 months by brand)</li></ul>
      <p>Start a return from your account's order page, or email sales@autoparts.example with your order number.</p>
    </div>`,
  },
];

/* ---------------------------- API 客户端 ---------------------------- */

const args = process.argv.slice(2);
function argOf(name) {
  const i = args.indexOf(name);
  return i > -1 ? args[i + 1] : null;
}
const SHOP = argOf('--shop') || 'auto-parts-pxpjvqd4.myshopify.com';
const TOKEN = argOf('--token');
const DELETE_DEMO = args.includes('--delete-demo');
if (!TOKEN) {
  console.error('\n[!] 缺少 Admin API token。用法：');
  console.error(`    node tools/seed-store.mjs --shop ${SHOP} --token shpat_xxxxxxxxxxxxxxxx\n`);
  console.error('获取方法（店铺后台）：Settings → Apps and sales channels → Develop apps →');
  console.error('Create an app → Configure Admin API scopes（勾选 Products / Custom data / Navigation /');
  console.error('Pages / Content and files / Publications）→ Install app → Reveal token once。\n');
  process.exit(1);
}

const base = `https://${SHOP}/admin/api/${API}`;
const headers = {
  'X-Shopify-Access-Token': TOKEN,
  'Content-Type': 'application/json',
};

async function rest(method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* ignore */ }
  if (!res.ok) {
    const msg = json ? JSON.stringify(json).slice(0, 300) : text.slice(0, 300);
    throw new Error(`REST ${method} ${path} -> ${res.status}: ${msg}`);
  }
  return json;
}

async function gql(query, variables) {
  const res = await fetch(`${base}/graphql.json`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(`GQL: ${JSON.stringify(json.errors).slice(0, 300)}`);
  return json.data;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------- 步骤 ---------------------------- */

async function createDefinitions() {
  console.log('== 1/6 metafield 定义 ==');
  for (const d of DEFINITIONS) {
    try {
      const data = await gql(
        `mutation($def: MetafieldDefinitionInput!) {
          metafieldDefinitionCreate(definition: $def) {
            createdDefinition { id name }
            userErrors { field message }
          }
        }`,
        {
          def: {
            name: d.name,
            namespace: d.namespace,
            key: d.key,
            description: d.description,
            type: d.type,
            ownerType: 'PRODUCT',
            pin: true,
            access: { storefront: 'PUBLIC_READ' },
          },
        },
      );
      const errs = data.metafieldDefinitionCreate.userErrors;
      if (errs.length) console.log(`  - ${d.key}: ${errs.map((e) => e.message).join('; ')}`);
      else console.log(`  + ${d.key} (${d.type})`);
    } catch (e) {
      console.log(`  ! ${d.key}: ${e.message}`);
    }
  }
}

async function deleteDemoProducts() {
  if (!DELETE_DEMO) return console.log('== 2/6 清理示例商品 ==（跳过：未加 --delete-demo）');
  const list = await rest('GET', '/products.json?limit=250&fields=id,title');
  const products = list.products || [];
  if (!products.length) return console.log('  (无商品)');
  for (const p of products) {
    await rest('DELETE', `/products/${p.id}.json`);
    console.log(`  - deleted: ${p.title}`);
  }
}

function metafieldsFor(p) {
  const mf = [];
  if (p.f.universal) {
    mf.push({ namespace: 'custom', key: 'fitment_universal', type: 'boolean', value: 'true' });
    return mf;
  }
  mf.push(
    { namespace: 'custom', key: 'fitment_make', type: 'list.single_line_text_field', value: JSON.stringify(p.f.make) },
    { namespace: 'custom', key: 'fitment_model', type: 'list.single_line_text_field', value: JSON.stringify(p.f.model) },
    { namespace: 'custom', key: 'fitment_year', type: 'list.single_line_text_field', value: JSON.stringify(p.f.year) },
    { namespace: 'custom', key: 'fitment_json', type: 'json', value: JSON.stringify(p.f.json) },
  );
  return mf;
}

async function createProducts() {
  console.log('== 3/6 创建商品 ==');
  const created = [];
  for (const p of PRODUCTS) {
    const payload = {
      product: {
        title: p.title,
        body_html: p.body,
        vendor: p.vendor,
        product_type: p.type,
        tags: p.tags,
        published: true,
        status: 'active',
        images: [{ src: p.img }],
        variants: [
          {
            sku: p.sku,
            price: p.price,
            option1: 'Default Title',
            inventory_management: null,
            requires_shipping: true,
          },
        ],
        metafields: metafieldsFor(p),
      },
    };
    try {
      const res = await rest('POST', '/products.json', payload);
      const prod = res.product;
      created.push({ id: prod.id, title: prod.title, type: p.type });
      console.log(`  + ${p.title}`);
    } catch (e) {
      console.log(`  ! ${p.title}: ${e.message}`);
    }
    await sleep(350);
  }
  return created;
}

async function createCollections(created) {
  console.log('== 4/6 创建分类集合 ==');
  for (const c of COLLECTIONS) {
    const collects = created
      .filter((p) => collectionOf(p.title) === c.handle)
      .map((p) => ({ product_id: p.id }));
    try {
      const res = await rest('POST', '/custom_collections.json', {
        custom_collection: { title: c.title, handle: c.handle, body_html: c.desc, published: true, collects },
      });
      console.log(`  + ${res.custom_collection.title} (${collects.length} 件商品)`);
    } catch (e) {
      console.log(`  ! ${c.title}: ${e.message}`);
    }
    await sleep(300);
  }
}

function collectionOf(title) {
  const t = title.toLowerCase();
  if (t.includes('brake pad') || t.includes('rotor')) return 'brake-system';
  if (t.includes('filter') || t.includes('spark plug')) return 'engine-filtration';
  if (t.includes('shock') || t.includes('strut') || t.includes('sway bar')) return 'suspension-steering';
  if (t.includes('headlight') || t.includes('battery') || t.includes('alternator')) return 'electrical-lighting';
  if (t.includes('clutch') || t.includes('timing') || t.includes('radiator')) return 'drivetrain-cooling';
  return 'servicing-fluids';
}

async function updateMenus() {
  console.log('== 5/6 导航菜单 ==');
  const data = await gql(`{ menus(first: 20) { nodes { id handle title items { id } } } }`);
  const menus = data.menus.nodes;
  for (const target of [
    { handle: 'main-menu', tree: MAIN_MENU },
    { handle: 'footer', tree: FOOTER_MENU },
  ]) {
    const menu = menus.find((m) => m.handle === target.handle || m.title === target.tree.title);
    if (!menu) {
      console.log(`  ! 找不到菜单 ${target.handle}，跳过`);
      continue;
    }
    const res = await gql(
      `mutation($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
        menuUpdate(id: $id, title: $title, items: $items) { menu { id } userErrors { field message } }
      }`,
      { id: menu.id, title: target.tree.title, items: target.tree.items },
    ).catch((e) => ({ err: e.message }));
    if (res.err) {
      console.log(`  ! ${target.handle}: ${res.err}`);
      continue;
    }
    const errs = res.menuUpdate?.userErrors || [];
    console.log(errs.length ? `  ! ${target.handle}: ${errs.map((e) => e.message).join('; ')}` : `  + ${target.handle} 已重建（${target.tree.items.length} 项）`);
  }
}

async function createPages() {
  console.log('== 6/6 页面 ==');
  for (const pg of PAGES) {
    try {
      const existing = await rest('GET', `/pages.json?handle=${pg.handle}`);
      if ((existing.pages || []).length) {
        console.log(`  = ${pg.title} 已存在，跳过`);
        continue;
      }
      await rest('POST', '/pages.json', {
        page: {
          title: pg.title,
          body_html: pg.body,
          handle: pg.handle,
          published: true,
          ...(pg.templateSuffix ? { template_suffix: pg.templateSuffix } : {}),
        },
      });
      console.log(`  + ${pg.title}`);
    } catch (e) {
      console.log(`  ! ${pg.title}: ${e.message}`);
    }
    await sleep(300);
  }
}

/* ---------------------------- main ---------------------------- */

(async () => {
  console.log(`\n店铺: ${SHOP}\n`);
  try {
    await createDefinitions();
    await deleteDemoProducts();
    const created = await createProducts();
    await createCollections(created);
    await updateMenus();
    await createPages();
    console.log(`\n完成：${created.length}/${PRODUCTS.length} 个商品、${COLLECTIONS.length} 个分类、${PAGES.length} 个页面。`);
    console.log('下一步：安装 Search & Discovery 应用，把 fitment_make / fitment_model / fitment_year 加为商品筛选。\n');
  } catch (e) {
    console.error(`\n[!] 失败：${e.message}`);
    console.error('请检查 token 是否有效、scope 是否勾齐（Products / Custom data / Navigation / Pages / Content and files / Publications）。\n');
    process.exit(1);
  }
})();
