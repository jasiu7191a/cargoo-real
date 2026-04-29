// ============================================================
// CARGOO MARKETPLACE — Global Search Data
// ~3000 products via curated base + combinatoric expansion
// ============================================================

// ── CATEGORIES ──────────────────────────────────────────────────
const MOCK_CATEGORIES = [
    { id: 1,  name: 'Sneakers',         slug: 'sneakers' },
    { id: 2,  name: 'Apparel',          slug: 'apparel' },
    { id: 3,  name: 'Accessories',      slug: 'accessories' },
    { id: 4,  name: 'Handbags',         slug: 'handbags' },
    { id: 5,  name: 'Watches',          slug: 'watches' },
    { id: 6,  name: 'Electronics',      slug: 'electronics' },
    { id: 7,  name: 'Collectibles',     slug: 'collectibles' },
    { id: 8,  name: 'Trading Cards',    slug: 'trading-cards' },
    { id: 9,  name: 'Health & Beauty',  slug: 'health-beauty' },
    { id: 10, name: 'Fragrance',        slug: 'fragrance' },
    { id: 11, name: 'Home Appliances',  slug: 'home-appliances' },
    { id: 12, name: 'Jewellery',        slug: 'jewellery' },
    { id: 13, name: 'Gaming',           slug: 'gaming' },
    { id: 14, name: 'Sports',           slug: 'sports' },
    { id: 15, name: 'Sunglasses',       slug: 'sunglasses' }
];

// ── BRANDS ──────────────────────────────────────────────────────
const MOCK_BRANDS = [
    { id: 1,  name: 'Nike',                    slug: 'nike',            keywords: ['swoosh','just do it'] },
    { id: 2,  name: 'Jordan',                  slug: 'jordan',          keywords: ['jumpman','aj'] },
    { id: 3,  name: 'adidas',                  slug: 'adidas',          keywords: ['three stripes','trefoil'] },
    { id: 4,  name: 'Yeezy',                   slug: 'yeezy',           keywords: ['kanye','boost'] },
    { id: 5,  name: 'New Balance',             slug: 'new-balance',     keywords: ['nb','newbalance'] },
    { id: 6,  name: 'ASICS',                   slug: 'asics',           keywords: ['gel','tiger'] },
    { id: 7,  name: 'Supreme',                 slug: 'supreme',         keywords: ['bogo','box logo'] },
    { id: 8,  name: 'Stussy',                  slug: 'stussy',          keywords: ['8 ball','world tour'] },
    { id: 9,  name: 'Fear of God',             slug: 'fear-of-god',     keywords: ['fog','essentials','jerry lorenzo'] },
    { id: 10, name: 'BAPE',                    slug: 'bape',            keywords: ['a bathing ape','shark','camo'] },
    { id: 11, name: 'Stone Island',            slug: 'stone-island',    keywords: ['stoney','badge','compass'] },
    { id: 12, name: 'Moncler',                 slug: 'moncler',         keywords: ['puffer','down','luxury jacket'] },
    { id: 13, name: 'Louis Vuitton',           slug: 'louis-vuitton',   keywords: ['lv','monogram','vuitton'] },
    { id: 14, name: 'Gucci',                   slug: 'gucci',           keywords: ['gg','marmont','guccio'] },
    { id: 15, name: 'Dior',                    slug: 'dior',            keywords: ['oblique','saddle','christian dior'] },
    { id: 16, name: 'Prada',                   slug: 'prada',           keywords: ['triangle','nylon','miuccia'] },
    { id: 17, name: 'Rolex',                   slug: 'rolex',           keywords: ['crown','oyster','perpetual'] },
    { id: 18, name: 'Omega',                   slug: 'omega',           keywords: ['speedmaster','seamaster','speedy'] },
    { id: 19, name: 'Apple',                   slug: 'apple',           keywords: ['mac','ios','iphone'] },
    { id: 20, name: 'Sony',                    slug: 'sony',            keywords: ['playstation','ps5','ps4'] },
    { id: 21, name: 'Nintendo',                slug: 'nintendo',        keywords: ['switch','mario','zelda'] },
    { id: 22, name: 'Pokémon',                 slug: 'pokemon',         keywords: ['pikachu','tcg','cards'] },
    { id: 23, name: 'Panini',                  slug: 'panini',          keywords: ['prizm','nba','nfl'] },
    { id: 24, name: 'Patek Philippe',          slug: 'patek-philippe',  keywords: ['nautilus','calatrava','patek'] },
    { id: 25, name: 'Dyson',                   slug: 'dyson',           keywords: ['airwrap','supersonic','vacuum'] },
    { id: 26, name: 'La Mer',                  slug: 'la-mer',          keywords: ['creme','moisturizer','seaweed'] },
    { id: 27, name: 'Maison Francis Kurkdjian',slug: 'mfk',             keywords: ['baccarat','br540','kurkdjian'] },
    { id: 28, name: 'Creed',                   slug: 'creed',           keywords: ['aventus','royal oud','viking'] },
    { id: 29, name: 'Balenciaga',              slug: 'balenciaga',      keywords: ['demna','speed runner','triple s'] },
    { id: 30, name: 'Bottega Veneta',          slug: 'bottega-veneta',  keywords: ['cassette','intrecciato','matthieu blazy'] },
    { id: 31, name: 'KAWS',                    slug: 'kaws',            keywords: ['companion','flayed','holiday'] },
    { id: 32, name: 'Salomon',                 slug: 'salomon',         keywords: ['xt-6','xt6','trail','gorpcore'] },
    { id: 33, name: 'Off-White',               slug: 'off-white',       keywords: ['virgil','abloh','quotation'] },
    { id: 34, name: 'Chanel',                  slug: 'chanel',          keywords: ['no5','coco','gabrielle'] },
    { id: 35, name: 'Hermès',                  slug: 'hermes',          keywords: ['birkin','kelly','h belt'] },
    { id: 36, name: 'Audemars Piguet',         slug: 'audemars-piguet', keywords: ['royal oak','ap','offshore'] },
    { id: 37, name: 'Cartier',                 slug: 'cartier',         keywords: ['santos','tank','love bracelet'] },
    { id: 38, name: 'Tag Heuer',               slug: 'tag-heuer',       keywords: ['monaco','carrera','aquaracer'] },
    { id: 39, name: 'Valentino',               slug: 'valentino',       keywords: ['rockstud','vlogo','valentino garavani'] },
    { id: 40, name: 'Versace',                 slug: 'versace',         keywords: ['medusa','baroque','gianni'] },
    { id: 41, name: 'Tom Ford',                slug: 'tom-ford',        keywords: ['tobacco vanille','black orchid','oud wood'] },
    { id: 42, name: 'Diptyque',                slug: 'diptyque',        keywords: ['do son','philosykos','oleo sacrum'] },
    { id: 43, name: 'Samsung',                 slug: 'samsung',         keywords: ['galaxy','s24','fold'] },
    { id: 44, name: 'Lego',                    slug: 'lego',            keywords: ['brick','sets','technic'] },
    { id: 45, name: 'Funko',                   slug: 'funko',           keywords: ['pop','vinyl','figurine'] },
    { id: 46, name: 'Ralph Lauren',            slug: 'ralph-lauren',    keywords: ['polo','purple label','rrl'] },
    { id: 47, name: 'Arc\'teryx',              slug: 'arcteryx',        keywords: ['arc teryx','beta','atom'] },
    { id: 48, name: 'Canada Goose',            slug: 'canada-goose',    keywords: ['expedition','parka','chilliwack'] },
    { id: 49, name: 'Loro Piana',              slug: 'loro-piana',         keywords: ['cashmere','vicuna','storm system'] },
    { id: 50, name: 'Brunello Cucinelli',      slug: 'brunello-cucinelli',  keywords: ['cashmere','solomeo','italian luxury'] },
    { id: 51, name: 'Razer',                   slug: 'razer',               keywords: ['blackwidow','deathadder','rgb'] },
    { id: 52, name: 'SteelSeries',             slug: 'steelseries',         keywords: ['arctis','apex','rival'] },
    { id: 53, name: 'HyperX',                  slug: 'hyperx',              keywords: ['cloud','pulsefire','alloy'] },
    { id: 54, name: 'Xbox',                    slug: 'xbox',                keywords: ['microsoft','series x','elite controller'] },
    { id: 55, name: 'Corsair',                 slug: 'corsair',             keywords: ['k100','icue','void'] },
    { id: 56, name: 'Elgato',                  slug: 'elgato',              keywords: ['stream deck','capture card','key light'] },
    { id: 57, name: 'Byredo',                  slug: 'byredo',              keywords: ['gypsy water','mojave ghost','rose of no mans land'] },
    { id: 58, name: 'Yves Saint Laurent',      slug: 'ysl',                 keywords: ['ysl','black opium','libre','mon paris'] },
    { id: 59, name: 'Jo Malone',               slug: 'jo-malone',           keywords: ['wood sage','peony blush','lime basil'] },
    { id: 60, name: 'Acqua di Parma',          slug: 'acqua-di-parma',      keywords: ['colonia','blu mediterraneo'] },
    { id: 61, name: 'Giorgio Armani',          slug: 'armani',              keywords: ['code','acqua di gio','si'] },
    { id: 62, name: 'Maison Margiela',         slug: 'maison-margiela',     keywords: ['replica','jazz club','fireplace','memory of'] },
    { id: 63, name: 'Puma',                    slug: 'puma',                keywords: ['future','king','ultra'] },
    { id: 64, name: 'Brooks',                  slug: 'brooks',              keywords: ['ghost','adrenaline','levitate'] },
    { id: 65, name: 'Sennheiser',              slug: 'sennheiser',          keywords: ['momentum','hd 660','ie 900'] },
    { id: 66, name: 'Bang & Olufsen',          slug: 'bang-olufsen',        keywords: ['beoplay','beosound','beovision'] },
    { id: 67, name: 'Beats',                   slug: 'beats',               keywords: ['studio','powerbeats','flex','solo'] },
    { id: 68, name: 'Tiffany & Co.',           slug: 'tiffany',             keywords: ['tiffany t','return to tiffany','atlas'] },
    { id: 69, name: 'Van Cleef & Arpels',      slug: 'van-cleef',           keywords: ['alhambra','perlee','sweet alhambra'] },
    { id: 70, name: 'Bulgari',                 slug: 'bulgari',             keywords: ['serpenti','b.zero1','bvlgari'] },
    { id: 71, name: 'Messika',                 slug: 'messika',             keywords: ['move','lucky move','joy'] },
    { id: 72, name: 'Foreo',                   slug: 'foreo',               keywords: ['luna','bear','ufo'] },
    { id: 73, name: "Paula's Choice",          slug: 'paulas-choice',       keywords: ['bha','aha','skin perfecting'] },
    { id: 74, name: 'Drunk Elephant',          slug: 'drunk-elephant',      keywords: ['c-firma','babyfacial','tla-luma'] },
    { id: 75, name: 'SkinCeuticals',           slug: 'skinceuticals',       keywords: ['c e ferulic','triple lipid','phloretin cf'] },
    { id: 76, name: 'Tatcha',                  slug: 'tatcha',              keywords: ['water cream','rice wash','essence'] },
    { id: 77, name: 'Sulwhasoo',               slug: 'sulwhasoo',           keywords: ['first care','timetreasure','ginseng'] },
    { id: 78, name: 'Sisley',                  slug: 'sisley',              keywords: ['black rose','phyto-rouge','hydra-global'] },
    { id: 79, name: 'Estée Lauder',            slug: 'estee-lauder',        keywords: ['advanced night repair','double wear','re-nutriv'] },
];

// ── ID GENERATION ────────────────────────────────────────────
let _gid = 1000;
const genId   = () => ++_gid;
const genCode = () => `PRD-${String(_gid).padStart(6,'0')}`;
const rand    = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ── BRAND / CATEGORY LOOKUPS ────────────────────────────────â”€
const brandBySlug = {};
MOCK_BRANDS.forEach(b => { brandBySlug[b.slug] = b; b.type = 'brand'; });

const catBySlug = {};
MOCK_CATEGORIES.forEach(c => { catBySlug[c.slug] = c; c.type = 'category'; });

// ── PRODUCT BUILDER ──────────────────────────────────────────
function makeProduct(name, brandSlug, catSlug, aliases, keywords, description, image, sku) {
    const b = brandBySlug[brandSlug] || MOCK_BRANDS[0];
    const c = catBySlug[catSlug]     || MOCK_CATEGORIES[0];
    const id = genId();
    return {
        id, code: genCode(),
        sku: sku || null,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: b.name, brandId: b.id, brandSlug: b.slug,
        category: c.name, categoryId: c.id, categorySlug: c.slug,
        aliases: aliases || [],
        keywords: keywords || [],
        featured: Math.random() > 0.65,
        trendingScore: rand(60, 99),
        image: image || undefined,
        description: description || `${name} — verified authentic and available for import via Cargoo.`
    };
}

// ── VARIANT GENERATOR ────────────────────────────────────────
// Takes a base product definition and multiplies it by color/size variants
function variants(base, variantList) {
    return variantList.map(v => {
        const fullName = `${base.n} ${v.label}`;
        return makeProduct(
            fullName,
            base.bs, base.cs,
            [...(base.a || []), ...(v.a || []), v.label.toLowerCase().replace(/['"]/g, '')],
            [...(base.k || []), ...(v.k || [])],
            v.d || base.d || `${fullName} — premium quality sourced directly from verified suppliers.`,
            base.i,
            v.sku || null
        );
    });
}

// ── COLORWAY PALETTES ────────────────────────────────────────
const SNEAKER_COLORS = [
    { label: 'Black White',     a: ['black white'],   k: ['monochrome'] },
    { label: 'Triple White',    a: ['all white'],     k: ['clean'] },
    { label: 'Triple Black',    a: ['all black'],     k: ['stealth'] },
    { label: 'Volt Green',      a: ['volt'],          k: ['neon','bright'] },
    { label: 'Royal Blue',      a: ['royal'],         k: ['blue'] },
    { label: 'University Red',  a: ['university red'],k: ['red'] },
    { label: 'Bred',            a: ['bred'],          k: ['black red'] },
    { label: 'Shadow Grey',     a: ['shadow'],        k: ['grey','neutral'] },
    { label: 'Sail Cream',      a: ['sail','cream'],  k: ['cream','off white'] },
    { label: 'Infrared',        a: ['infrared'],      k: ['neon','pink'] },
    { label: 'Wheat Brown',     a: ['wheat'],         k: ['brown','earth'] },
    { label: 'Midnight Navy',   a: ['navy'],          k: ['dark blue'] },
    { label: 'Olive Green',     a: ['olive'],         k: ['army','green'] },
    { label: 'Cardinal Red',    a: ['cardinal'],      k: ['dark red'] },
    { label: 'Stone Taupe',     a: ['taupe'],         k: ['neutral','tan'] },
    { label: 'Forest Green',    a: ['forest'],        k: ['dark green'] },
    { label: 'Pine Green',      a: ['pine green'],    k: ['green'] },
    { label: 'Hyper Crimson',   a: ['crimson'],       k: ['orange red'] },
    { label: 'Gym Blue',        a: ['gym blue'],      k: ['blue white'] },
    { label: 'Cool Grey',       a: ['cool grey'],     k: ['grey'] },
];

// ── JORDAN 1 HIGH OG — Official Colorways & Retail SKUs ─────────
const JORDAN_1_HIGH_CW = [
    { label: "'Chicago Lost & Found'",  sku: 'DZ5485-612', a: ['chicago','lost found','rustic'],          k: ['og','1985','chicago'] },
    { label: "'Royal Blue'",            sku: '555088-007', a: ['royal blue'],                              k: ['blue','og'] },
    { label: "'Bred Toe'",              sku: '555088-610', a: ['bred toe','black red'],                    k: ['bred'] },
    { label: "'Shadow 2.0'",            sku: '575441-035', a: ['shadow'],                                  k: ['grey'] },
    { label: "'Shattered Backboard'",   sku: '575441-026', a: ['shattered backboard','orange'],            k: ['orange'] },
    { label: "'Dark Mocha'",            sku: '555088-105', a: ['dark mocha','mocha'],                      k: ['brown','mocha'] },
    { label: "'Pine Green'",            sku: '555088-030', a: ['pine green'],                              k: ['green'] },
    { label: "'University Blue'",       sku: '555088-134', a: ['university blue','unc'],                   k: ['blue','carolina'] },
    { label: "'Hyper Royal'",           sku: '575441-004', a: ['hyper royal'],                             k: ['blue'] },
    { label: "'Court Purple'",          sku: '555088-500', a: ['court purple'],                            k: ['purple'] },
    { label: "'Georgetown'",            sku: '554724-030', a: ['georgetown'],                              k: ['grey blue'] },
    { label: "'Lightning'",             sku: '555088-701', a: ['lightning','yellow'],                      k: ['yellow'] },
];

// ── JORDAN 1 LOW OG — Official Colorways & Retail SKUs ──────────
const JORDAN_1_LOW_CW = [
    { label: "'White Black'",           sku: 'CZ0790-101', a: ['white black'],                             k: ['clean'] },
    { label: "'University Blue'",       sku: 'CZ0790-104', a: ['university blue low','unc low'],           k: ['blue'] },
    { label: "'Bred Toe'",              sku: 'AV3918-101', a: ['bred toe low'],                            k: ['bred'] },
    { label: "'Shadow'",                sku: '553558-035', a: ['shadow low'],                              k: ['grey'] },
    { label: "'Dark Mocha'",            sku: 'CZ0790-102', a: ['dark mocha low'],                          k: ['brown'] },
    { label: "'Celeste'",               sku: 'DD9315-100', a: ['celeste'],                                 k: ['teal'] },
    { label: "'Neutral Grey'",          sku: '553558-023', a: ['neutral grey low'],                        k: ['grey'] },
    { label: "'Panda'",                 sku: '553558-132', a: ['panda low'],                               k: ['panda'] },
    { label: "'Black Gym Red'",         sku: '553558-066', a: ['black gym red'],                           k: ['black red'] },
    { label: "'Light Smoke Grey'",      sku: '553558-003', a: ['light smoke grey'],                        k: ['grey'] },
    { label: "'Gorge Green'",           sku: 'DV1299-300', a: ['gorge green low'],                         k: ['green'] },
    { label: "'Aquatone'",              sku: 'DV1309-104', a: ['aquatone','teal green'],                   k: ['teal'] },
];

// ── NIKE DUNK LOW — Official Colorways & Retail SKUs ────────────
const DUNK_LOW_CW = [
    { label: "'Panda'",                 sku: 'DD1391-100', a: ['panda','white black dunk'],                k: ['panda','clean'] },
    { label: "'Triple Black'",          sku: 'DD1503-002', a: ['triple black dunk'],                       k: ['all black'] },
    { label: "'University Red'",        sku: 'DD1391-600', a: ['university red dunk'],                     k: ['red'] },
    { label: "'Syracuse'",              sku: 'DD1391-800', a: ['syracuse','orange white dunk'],             k: ['orange'] },
    { label: "'Reverse Panda'",         sku: 'DV0831-101', a: ['reverse panda'],                           k: ['reverse','black white'] },
    { label: "'Valerian Blue'",         sku: 'DD1391-400', a: ['valerian blue'],                           k: ['blue'] },
    { label: "'Chlorophyll'",           sku: 'DD1503-300', a: ['chlorophyll','olive dunk'],                 k: ['green'] },
    { label: "'Dusty Olive'",           sku: 'DH5360-004', a: ['dusty olive'],                             k: ['olive'] },
    { label: "'Photon Dust'",           sku: 'DV0833-001', a: ['photon dust','grey dunk'],                 k: ['grey'] },
    { label: "'Sesame'",                sku: 'FB7160-200', a: ['sesame','cream brown dunk'],               k: ['cream','earth'] },
    { label: "'Fog'",                   sku: 'DH7913-102', a: ['fog dunk'],                                k: ['grey brown'] },
    { label: "'Mineral Slate'",         sku: 'DX3722-001', a: ['mineral slate'],                           k: ['dark grey'] },
];

// ── NIKE DUNK HIGH — Official Colorways & Retail SKUs ───────────
const DUNK_HIGH_CW = [
    { label: "'Varsity Green'",         sku: 'CZ8149-100', a: ['varsity green high'],                      k: ['green'] },
    { label: "'Pro Gold'",              sku: 'CU7544-700', a: ['pro gold','yellow high dunk'],              k: ['yellow'] },
    { label: "'Triple Black'",          sku: 'DD1399-001', a: ['triple black high dunk'],                   k: ['all black'] },
    { label: "'White Black'",           sku: 'DD1399-105', a: ['white black high dunk'],                    k: ['clean'] },
    { label: "'Plum'",                  sku: 'DD1399-500', a: ['plum high','purple high dunk'],             k: ['purple'] },
    { label: "'Dark Driftwood'",        sku: 'DD1869-100', a: ['dark driftwood'],                          k: ['brown'] },
    { label: "'University Blue'",       sku: 'DD1399-104', a: ['university blue high dunk'],                k: ['blue'] },
    { label: "'Peach Cream'",           sku: 'DV0829-100', a: ['peach cream'],                             k: ['pink','cream'] },
    { label: "'Pine Green'",            sku: 'DD1400-300', a: ['pine green high dunk'],                     k: ['green'] },
    { label: "'Championship Navy'",     sku: 'CU7544-400', a: ['championship navy'],                       k: ['navy'] },
    { label: "'Gorge Green'",           sku: 'DD1399-300', a: ['gorge green high dunk'],                    k: ['green'] },
    { label: "'Midnight Navy'",         sku: 'DD1399-103', a: ['midnight navy high dunk'],                  k: ['navy'] },
];

// ── NIKE AIR FORCE 1 LOW — Official Colorways & Retail SKUs ─────
const AF1_LOW_CW = [
    { label: "'White'",                 sku: 'CW2288-111', a: ['triple white af1','all white af1'],        k: ['clean','classic'] },
    { label: "'Black'",                 sku: 'CW2288-001', a: ['triple black af1'],                        k: ['all black'] },
    { label: "'Wheat'",                 sku: 'DD8959-200', a: ['wheat af1'],                               k: ['brown','earth'] },
    { label: "'University Gold'",       sku: 'CZ0270-100', a: ['university gold af1'],                     k: ['gold'] },
    { label: "'Shadow Grey'",           sku: 'CI0919-001', a: ['shadow grey af1'],                         k: ['grey'] },
    { label: "'Just Do It'",            sku: 'DX2660-001', a: ['just do it af1'],                          k: ['jdi'] },
    { label: "'Toasty'",               sku: 'DC8870-200', a: ['toasty af1','hemp'],                        k: ['earth'] },
    { label: "'Pearl White'",           sku: 'DM0970-100', a: ['pearl white af1'],                         k: ['pearl','white'] },
    { label: "'Gorge Green'",           sku: 'DV3808-300', a: ['gorge green af1'],                         k: ['green'] },
    { label: "'Volt'",                  sku: 'DH7561-101', a: ['volt af1','neon yellow af1'],              k: ['neon','bright'] },
    { label: "'Summit White'",          sku: 'DC2911-100', a: ['summit white af1','since 82'],             k: ['white'] },
    { label: "'Fossil Stone'",          sku: 'CI1173-200', a: ['fossil stone','tan af1'],                  k: ['tan'] },
];

// ── NIKE AIR FORCE 1 HIGH — Official Colorways & Retail SKUs ────
const AF1_HIGH_CW = [
    { label: "'White'",                 sku: 'DD9615-101', a: ['triple white af1 high'],                   k: ['clean','classic'] },
    { label: "'Black White'",           sku: 'DD9615-001', a: ['black white af1 high'],                    k: ['panda'] },
    { label: "'Wheat'",                 sku: 'DD9628-200', a: ['wheat af1 high'],                          k: ['brown'] },
    { label: "'University Red'",        sku: 'DD9615-600', a: ['university red af1 high'],                  k: ['red'] },
    { label: "'Summit White'",          sku: 'DD9615-102', a: ['summit white high af1'],                   k: ['white'] },
    { label: "'Dark Obsidian'",         sku: 'DC2111-001', a: ['dark obsidian af1 high'],                  k: ['navy'] },
    { label: "'Midnight Navy'",         sku: 'DD9615-400', a: ['midnight navy high af1'],                  k: ['navy'] },
    { label: "'Team Gold'",             sku: 'DD9615-700', a: ['team gold af1 high'],                      k: ['gold'] },
];

// ── ADIDAS YEEZY BOOST 350 V2 — Official Colorways & Retail SKUs
const YEEZY_350_V2_CW = [
    { label: '"Zebra"',                 sku: 'CP9654',     a: ['zebra yeezy','white black red yeezy'],     k: ['white','striped'] },
    { label: '"Cream White"',           sku: 'CP9366',     a: ['cream white yeezy','triple white yeezy'],  k: ['cream'] },
    { label: '"Beluga 2.0"',            sku: 'AH2203',     a: ['beluga yeezy','grey orange yeezy'],        k: ['grey','orange'] },
    { label: '"Static Non-Reflective"', sku: 'EF2905',     a: ['static yeezy'],                            k: ['grey'] },
    { label: '"Black Non-Reflective"',  sku: 'FU9006',     a: ['black yeezy'],                             k: ['all black'] },
    { label: '"Bone"',                  sku: 'HQ6316',     a: ['bone yeezy','off white yeezy'],            k: ['cream','off white'] },
    { label: '"Natural"',               sku: 'FZ5246',     a: ['natural yeezy','tan yeezy'],               k: ['earth','tan'] },
    { label: '"Carbon"',                sku: 'HQ7045',     a: ['carbon blue yeezy'],                       k: ['blue grey'] },
    { label: '"Ash Blue"',              sku: 'GY7657',     a: ['ash blue yeezy'],                          k: ['blue grey'] },
    { label: '"Slate"',                 sku: 'HQ2060',     a: ['slate yeezy'],                             k: ['grey'] },
    { label: '"Sand Taupe"',            sku: 'FX9088',     a: ['sand taupe yeezy'],                        k: ['tan'] },
    { label: '"Sulfur"',                sku: 'FU9161',     a: ['sulfur yeezy','yellow yeezy'],             k: ['yellow'] },
];

const APPAREL_COLORS = [
    { label: 'Black',           a: ['black'],         k: ['dark'] },
    { label: 'White',           a: ['white'],         k: ['light'] },
    { label: 'Ash Grey',        a: ['ash','grey'],    k: ['neutral'] },
    { label: 'Heather Grey',    a: ['heather'],       k: ['neutral'] },
    { label: 'Navy',            a: ['navy'],          k: ['blue','dark'] },
    { label: 'Cream',           a: ['cream','off white'], k: ['light','neutral'] },
    { label: 'Forest Green',    a: ['forest'],        k: ['green'] },
    { label: 'Burgundy',        a: ['burgundy','wine'], k: ['red','dark'] },
    { label: 'Olive',           a: ['olive'],         k: ['army','earth'] },
    { label: 'Camel',           a: ['camel','tan'],   k: ['brown'] },
    { label: 'Cardinal Red',    a: ['cardinal'],      k: ['red'] },
    { label: 'Sky Blue',        a: ['sky blue','light blue'], k: ['blue','light'] },
];

const HANDBAG_COLORS = [
    { label: 'Black',           a: ['black'],         k: ['classic'] },
    { label: 'Beige',           a: ['beige'],         k: ['neutral'] },
    { label: 'Caramel Brown',   a: ['caramel','brown'], k: ['warm'] },
    { label: 'Navy Blue',       a: ['navy'],          k: ['blue'] },
    { label: 'Bordeaux Red',    a: ['bordeaux'],      k: ['red','dark'] },
    { label: 'Rose Pink',       a: ['rose','pink'],   k: ['pink'] },
    { label: 'Mint Green',      a: ['mint'],          k: ['green','light'] },
    { label: 'White',           a: ['white'],         k: ['clean'] },
];

const WATCH_STRAPS = [
    { label: 'Oyster Bracelet', a: ['oyster bracelet'], k: ['steel'] },
    { label: 'Jubilee Bracelet',a: ['jubilee'],       k: ['dressy','steel'] },
    { label: 'Rubber Strap',    a: ['rubber'],        k: ['sport'] },
    { label: 'Leather Strap',   a: ['leather'],       k: ['classic'] },
];

const WATCH_DIALS = [
    { label: 'Black Dial',      a: ['black'],         k: ['dark'] },
    { label: 'Blue Dial',       a: ['blue'],          k: ['sunburst'] },
    { label: 'White Dial',      a: ['white'],         k: ['clean'] },
    { label: 'Silver Dial',     a: ['silver'],        k: ['grey'] },
    { label: 'Green Dial',      a: ['green'],         k: ['green'] },
    { label: 'Champagne Dial',  a: ['champagne'],     k: ['gold'] },
];

const FRAGRANCE_SIZES = [
    { label: '30ml',   a: ['30ml'],  k: ['travel'] },
    { label: '50ml',   a: ['50ml'],  k: ['small'] },
    { label: '100ml',  a: ['100ml'], k: ['regular'] },
    { label: '200ml',  a: ['200ml'], k: ['large'] },
];

const ELECTRONICS_COLORS = [
    { label: 'Space Grey',  a: ['grey'],    k: ['dark'] },
    { label: 'Silver',      a: ['silver'],  k: ['light'] },
    { label: 'Midnight',    a: ['midnight'],k: ['black'] },
    { label: 'Starlight',   a: ['starlight'],k: ['cream'] },
    { label: 'Blue',        a: ['blue'],    k: ['color'] },
];

// ────────────────────────────────────────────────────────────â”€
// SECTION 1 — JORDAN (Base: ~14 hero models Ă— colors)
// ────────────────────────────────────────────────────────────â”€
const jordanBase = [
    { n:'Air Jordan 1 Retro High OG', bs:'jordan', cs:'sneakers', d:"The shoe that started it all—a bold design with heritage leather panels referencing MJ's historic 1984 NBA ban.", a:['aj1 high','jordan 1 high'], k:['high top','og'] },
    { n:'Air Jordan 1 Retro Low OG',  bs:'jordan', cs:'sneakers', d:"The low-cut derivative of the legendary 1 silhouette—perfect for those who prefer a sleek everyday profile.", a:['aj1 low','jordan 1 low'], k:['low','casual'] },
    { n:'Travis Scott x Air Jordan 1 Low', bs:'jordan', cs:'sneakers', d:"Cactus Jack's low-top statement piece featuring a reverse swoosh and premium suede detailing.", a:['ts jordan 1 low','travis low'], k:['collab','reverse swoosh'] },
    { n:'Air Jordan 3 Retro',         bs:'jordan', cs:'sneakers', d:"Tinker Hatfield's first Jordan design—introducing visible Air, elephant print detail, and the Jumpman logo.", a:['jordan 3','aj3'], k:['elephant print'] },
    { n:'Air Jordan 4 Retro',         bs:'jordan', cs:'sneakers', d:"An aerodynamic caged take on athlete design with visible Air cushioning and premium high-abrasion rubber.", a:['jordan 4','aj4'], k:['cage','plastic wings'] },
    { n:'Air Jordan 5 Retro',         bs:'jordan', cs:'sneakers', d:"Inspired by WWII fighter jets—features a translucent midsole and 3M reflective tongue.", a:['jordan 5','aj5'], k:['reflective','clear sole'] },
    { n:'Air Jordan 6 Retro',         bs:'jordan', cs:'sneakers', d:"Built for MJ's first championship run—includes a modified lace garage with sculpted tongue.", a:['jordan 6','aj6'], k:['championship'] },
    { n:'Air Jordan 11 Retro',        bs:'jordan', cs:'sneakers', d:"The tuxedo of sneakers—patent leather mudguard and carbon fiber shank plate define this elite silhouette.", a:['jordan 11','aj11'], k:['patent leather','concord'] },
    { n:'Air Jordan 12 Retro',        bs:'jordan', cs:'sneakers', d:"Inspired by the rising sun flag of Japan and designed for MJ's second three-peat.", a:['jordan 12','aj12'], k:['flu game'] },
    { n:'Air Jordan 13 Retro',        bs:'jordan', cs:'sneakers', d:"Panther-inspired silhouette with 13 circle studs on the sole representing Michael's number.", a:['jordan 13','aj13'], k:['hologram eye'] },
    { n:'Nike SB x Air Jordan 4',     bs:'jordan', cs:'sneakers', d:"A skate-functional collab delivering durable construction with pine green overlays.", a:['sb jordan 4','skate jordan'], k:['sb dunk','skate','collab'] },
    { n:'Off-White x Air Jordan 1 High', bs:'jordan', cs:'sneakers', d:"Virgil Abloh's deconstructed reimagining—orange tag, quotation marks, and exposed foam insole.", a:['ow jordan 1','off white jordan 1'], k:['virgil','deconstructed'] },
    { n:'Union LA x Air Jordan 1 High', bs:'jordan', cs:'sneakers', d:"Union's bespoke vintage-wash colorblock takes a grail 1985 narrative approach.", a:['union jordan 1','union la 1'], k:['vintage','collab'] },
    { n:'Air Jordan 1 Mid',           bs:'jordan', cs:'sneakers', d:"A more accessible Mid-cut that stays true to the heritage silhouette with excellent colorway variety.", a:['jordan 1 mid','aj1 mid'], k:['mid','heritage'] },
];
const jordanProducts = jordanBase.flatMap((b, i) => {
    if (i === 0) return variants(b, JORDAN_1_HIGH_CW);  // Air Jordan 1 Retro High OG
    if (i === 1) return variants(b, JORDAN_1_LOW_CW);   // Air Jordan 1 Retro Low OG
    return variants(b, SNEAKER_COLORS.slice(0, 12));
});

// ────────────────────────────────────────────────────────────â”€
// SECTION 2 — NIKE (14 base models Ă— colors)
// ────────────────────────────────────────────────────────────â”€
const nikeBase = [
    { n:'Nike Dunk Low Retro',        bs:'nike', cs:'sneakers', d:"The low-cut Dunk sees a roaring comeback—simple blocking, premium leather, and endless colorway options.", a:['dunk low','dunks'], k:['low','casual'] },
    { n:'Nike Dunk High Retro',       bs:'nike', cs:'sneakers', d:"Tall and bold—the Dunk High provides ankle support and iconic stacked colorblocking.", a:['dunk high'], k:['high','bold'] },
    { n:'Nike Air Force 1 Low',       bs:'nike', cs:'sneakers', d:"The all-white legend—crisp full-grain leather sits on a bulbous sole unit that defined an era.", a:['af1 low','air force 1'], k:['classic','white'] },
    { n:'Nike Air Force 1 High',      bs:'nike', cs:'sneakers', d:"The high-cut evolution of an icon—padded ankle collar with heritage triple-layer build.", a:['af1 high'], k:['high','padded'] },
    { n:'Nike Air Max 1',             bs:'nike', cs:'sneakers', d:"Tinker's window to the sole—the first visible Air unit revolutionized cushioning in 1987.", a:['air max 1','am1'], k:['visible air','runner'] },
    { n:'Nike Air Max 90',            bs:'nike', cs:'sneakers', d:"The Infrared classic—a waffle sole and toe box that spawned thousands of colorways.", a:['air max 90','am90'], k:['infrared','runner'] },
    { n:'Nike Air Max 95',            bs:'nike', cs:'sneakers', d:"Inspired by the human body—gradient paneling and dual Air units define this running legend.", a:['air max 95','am95'], k:['neon','gradient'] },
    { n:'Nike Air Max 97',            bs:'nike', cs:'sneakers', d:"Japanese bullet train silhouette with full-length Air cushioning and ripple overlay.", a:['air max 97','am97'], k:['silver','bullet train'] },
    { n:'Nike Air Max 270',           bs:'nike', cs:'sneakers', d:"The tallest Air heel unit ever—a lifestyle sneaker built around next-level bounce.", a:['air max 270','270'], k:['tall heel','bounce'] },
    { n:'Nike Air Zoom Pegasus 40',   bs:'nike', cs:'sneakers', d:"Trusty daily trainer with ZoomX foam inserts—elite runners and weekend joggers alike choose this.", a:['pegasus 40','peg 40'], k:['running','trainer'] },
    { n:'Nike React Element 87',      bs:'nike', cs:'sneakers', d:"A sheer upper concept paired with React foam—a designer-adjacent silhouette from a sportswear lens.", a:['react 87','element 87'], k:['translucent','foam'] },
    { n:'Nike Blazer Mid 77',         bs:'nike', cs:'sneakers', d:"The vintage basketball shoe that became a fashion staple—stacked heel tab, flat laces, herringbone sole.", a:['blazer 77','blazer mid'], k:['vintage','canvas'] },
    { n:'Nike Air Presto',            bs:'nike', cs:'sneakers', d:"T-shirt for the foot—engineered mesh upper in a sock-like construction for all-day comfort.", a:['presto','air presto'], k:['mesh','stretchy'] },
    { n:'Nike Kobe 6 Protro',         bs:'nike', cs:'sneakers', d:"Re-engineered for modern performance—the ultra-low cut and premium cushioning remain untouched.", a:['kobe 6','kb6'], k:['basketball','low cut'] },
];
const nikeProducts = nikeBase.flatMap((b, i) => {
    if (i === 0) return variants(b, DUNK_LOW_CW);       // Nike Dunk Low Retro
    if (i === 1) return variants(b, DUNK_HIGH_CW);      // Nike Dunk High Retro
    if (i === 2) return variants(b, AF1_LOW_CW);        // Nike Air Force 1 Low
    if (i === 3) return variants(b, AF1_HIGH_CW);       // Nike Air Force 1 High
    return variants(b, SNEAKER_COLORS.slice(0, 12));
});

// ────────────────────────────────────────────────────────────â”€
// SECTION 3 — ADIDAS / YEEZY (combined, 12 base)
// ────────────────────────────────────────────────────────────â”€
const adidasBase = [
    { n:'adidas Samba OG',            bs:'adidas', cs:'sneakers', d:"From indoor soccer fields to the global runway—T-toe leather, gum sole, and impossibly clean lines.", a:['samba','samba og'], k:['terrace','gum sole'] },
    { n:'adidas Gazelle Indoor',      bs:'adidas', cs:'sneakers', d:"A svelte suede upper riding on a gum sole—Borg-era terrace culture distilled into one silhouette.", a:['gazelle','gazelle indoor'], k:['suede','thin sole'] },
    { n:'adidas Campus 00s',          bs:'adidas', cs:'sneakers', d:"Skate-influenced chunky derivation of the 80s campus shoe—currently the most-spotted silhouette in Europe.", a:['campus 00s','campus'], k:['chunky','skate'] },
    { n:'adidas Superstar',           bs:'adidas', cs:'sneakers', d:"The shell-toe original since 1969—Run-DMC immortalized it, and streetwear never let it die.", a:['superstar','shell toe'], k:['shell toe','classic'] },
    { n:'adidas Stan Smith',          bs:'adidas', cs:'sneakers', d:"Minimalist tennis heritage with leather upper and serrated three-stripe detailing.", a:['stan smith','stan'], k:['tennis','minimal','leather'] },
    { n:'adidas Forum Low',           bs:'adidas', cs:'sneakers', d:"80s basketball nostalgia—a distinctive ankle strap and bold blocking define this collab magnet.", a:['forum low','forum'], k:['ankle strap','retro'] },
    { n:'adidas NMD R1',              bs:'adidas', cs:'sneakers', d:"Boost-cushioned running-inspired silhouette with modular plug detail—streetwear staple of the 2010s.", a:['nmd r1','nmd'], k:['boost','plug'] },
    { n:'adidas Ultra Boost',         bs:'adidas', cs:'sneakers', d:"The Primeknit sock-knit upper wraps a massive heel Boost cage—pioneering comfort meets performance.", a:['ultra boost','ultraboost'], k:['boost','primeknit'] },
    { n:'adidas Yeezy Boost 350 V2',  bs:'yeezy', cs:'sneakers', d:"Kanye's breakthrough Boost silhouette—SPLY-350 stripe across Primeknit with full-length cushioning.", a:['yeezy 350 v2','350 v2'], k:['boost','primeknit','knit'] },
    { n:'adidas Yeezy Boost 700',     bs:'yeezy', cs:'sneakers', d:"Thick suede, mesh, and leather panels layered over a sculpted boost unit—the dad sneaker that started a genre.", a:['yeezy 700'], k:['dad shoe','boost'] },
    { n:'adidas Yeezy Slide',         bs:'yeezy', cs:'sneakers', d:"Injected EVA foam in a one-piece mold—the slide that blurred the line between utility and hype.", a:['yeezy slide'], k:['foam','slip on'] },
    { n:'adidas Yeezy Foam RNR',      bs:'yeezy', cs:'sneakers', d:"Algae-based foam mold—cutting-edge material meets alien design for the ultimate casual shoe.", a:['foam runner','foam rnnr'], k:['foam','eco'] },
];
const adidasProducts = adidasBase.flatMap((b, i) => {
    if (i === 8) return variants(b, YEEZY_350_V2_CW);  // adidas Yeezy Boost 350 V2
    return variants(b, SNEAKER_COLORS.slice(0, 12));
});

// ────────────────────────────────────────────────────────────â”€
// SECTION 4 — NEW BALANCE (8 base Ă— colors)
// ────────────────────────────────────────────────────────────â”€
const nbBase = [
    { n:'New Balance 550',     bs:'new-balance', cs:'sneakers', d:"70s basketball heritage with chunky retro silhouette—ALD brought it back and fashion world went crazy.", a:['nb 550','550'], k:['hoops','retro'] },
    { n:'New Balance 990v3',   bs:'new-balance', cs:'sneakers', d:"Made in USA premium suede and mesh—the 990 series is the benchmark for understated luxury runners.", a:['nb 990v3','990v3'], k:['made in usa','premium'] },
    { n:'New Balance 990v5',   bs:'new-balance', cs:'sneakers', d:"The latest iteration of the legendary 990 series—refined silhouette with updated ENCAP cushioning.", a:['nb 990v5','990v5'], k:['made in usa','encap'] },
    { n:'New Balance 2002R',   bs:'new-balance', cs:'sneakers', d:"Deconstructed suede overlays with jagged raw edges channel a Protection Pack aesthetic.", a:['nb 2002r','2002r'], k:['protection pack','suede'] },
    { n:'New Balance 1906R',   bs:'new-balance', cs:'sneakers', d:"A Y2K-coded asymmetric midsole with N-ergy cushioning—a premium lifestyle runner with a heavy foot.", a:['nb 1906r','1906r'], k:['y2k','asymmetric'] },
    { n:'New Balance 9060',    bs:'new-balance', cs:'sneakers', d:"Extra-chunky DNA distilled from the 860 and 1060—a highly coveted silhouette born for collabs.", a:['nb 9060','9060'], k:['chunky','collab'] },
    { n:'New Balance 574',     bs:'new-balance', cs:'sneakers', d:"The legendary everyman runner—ENCAP midsole and padded collar define three decades of classic style.", a:['nb 574','574'], k:['classic','everyday'] },
    { n:'New Balance 327',     bs:'new-balance', cs:'sneakers', d:"Wild '70s runner profile with oversized N logo and ripple rubber—a modernised retro sensation.", a:['nb 327','327'], k:['ripple','vintage'] },
];
const nbProducts = nbBase.flatMap(b => variants(b, SNEAKER_COLORS.slice(0,10)));

// ────────────────────────────────────────────────────────────â”€
// SECTION 5 — SUPREME APPAREL (8 base Ă— apparel colors)
// ────────────────────────────────────────────────────────────â”€
const supremeBase = [
    { n:'Supreme Box Logo Hoodie',       bs:'supreme', cs:'apparel', d:"The most recognizable hoodie in streetwear—heavyweight crossgrain fleece with embroidered Box Logo.", a:['bogo hoodie','supreme hoodie','box logo hoodie'], k:['box logo','hype','fleece'] },
    { n:'Supreme Box Logo Crewneck',     bs:'supreme', cs:'apparel', d:"The crewneck variant of the BOGO grail—same premium fleece, same coveted embroidered logo.", a:['bogo crewneck','supreme crewneck'], k:['box logo','crewneck'] },
    { n:'Supreme Box Logo Tee',          bs:'supreme', cs:'apparel', d:"Beefy cotton jersey with a clean printedBox Logo—the most wearable Supreme item in any lineup.", a:['bogo tee','supreme tee'], k:['box logo','tshirt'] },
    { n:'Supreme The North Face Nuptse Jacket', bs:'supreme', cs:'apparel', d:"The most iconic puffer collab ever—Supreme branding on TNF's flagship Nuptse quilt.", a:['supreme tnf','tnf nuptse collab'], k:['puffer','collab','north face'] },
    { n:'Supreme GORE-TEX Jacket',       bs:'supreme', cs:'apparel', d:"Waterproof shell with GORE-TEX lining and aggressive Supreme branding—built for any weather.", a:['supreme gore tex','gore tex jacket supreme'], k:['gore-tex','waterproof','shell'] },
    { n:'Supreme Sweatpant',             bs:'supreme', cs:'apparel', d:"French terry fleece joggers with SUPREME embroidery—the go-to loungewear for collectors.", a:['supreme sweats','box logo sweats'], k:['joggers','fleece'] },
    { n:'Supreme Bandana Box Logo Tee',  bs:'supreme', cs:'apparel', d:"A paisley bandana print underneath the classic Box Logo—limited and highly coveted each season.", a:['bandana tee','supreme bandana'], k:['bandana','tshirt'] },
    { n:'Supreme Logo Beanie',           bs:'supreme', cs:'accessories', d:"A thick ribbed-knit beanie with embroidered Supreme wordmark—every hypebeast's winter staple.", a:['supreme beanie'], k:['beanie','winter','knit'] },
];
const supremeProducts = supremeBase.flatMap(b => variants(b, APPAREL_COLORS.slice(0,10)));

// ────────────────────────────────────────────────────────────â”€
// SECTION 6 — FEAR OF GOD / ESSENTIALS (6 base Ă— apparel)
// ────────────────────────────────────────────────────────────â”€
const fogBase = [
    { n:'Fear of God Essentials Hoodie',      bs:'fear-of-god', cs:'apparel', d:"Drop-shoulder heavyweight fleece in an oversize silhouette—the benchmark of quiet luxury streetwear.", a:['essentials hoodie','fog hoodie'], k:['oversized','basics','fleece'] },
    { n:'Fear of God Essentials Sweatpant',   bs:'fear-of-god', cs:'apparel', d:"Tapered fleece joggers with elongated drawcords—the perfect companion to the Essentials hoodie.", a:['essentials sweats','fog pants'], k:['joggers','tapered','basics'] },
    { n:'Fear of God Essentials Tee',         bs:'fear-of-god', cs:'apparel', d:"Heavyweight jersey tee with dropped shoulders and a clean rubber patch at the chest.", a:['essentials tee','fog tee'], k:['tshirt','heavyweight','basics'] },
    { n:'Fear of God Essentials Shorts',      bs:'fear-of-god', cs:'apparel', d:"Midweight fleece shorts with an elongated hem and ribbed cuffs—summer essentials, redefined.", a:['essentials shorts','fog shorts'], k:['shorts','fleece'] },
    { n:'Fear of God Essentials Crewneck',    bs:'fear-of-god', cs:'apparel', d:"Structured crewneck with a subtle chest logo—minimal, elevated, and perfectly balanced in weight.", a:['essentials crew','fog crewneck'], k:['crewneck','fleece'] },
    { n:'Fear of God Essentials Jacket',      bs:'fear-of-god', cs:'apparel', d:"A nylon shell coach jacket with Essentials branding—windproof and effortlessly lifestyle-ready.", a:['essentials jacket','fog jacket'], k:['jacket','nylon','windproof'] },
];
const fogProducts = fogBase.flatMap(b => variants(b, APPAREL_COLORS.slice(0,10)));

// ────────────────────────────────────────────────────────────â”€
// SECTION 7 — STUSSY / BAPE / STONE ISLAND / MONCLER (6 each Ă— 6 colors)
// ────────────────────────────────────────────────────────────â”€
const stussyBase = [
    { n:'Stussy 8 Ball Hoodie',          bs:'stussy', cs:'apparel', d:"The 8 Ball graphic anchors this pillar of streetwear culture—a heavyweight zip-up in the Stussy legacy.", a:['stussy 8 ball','8 ball hoodie'], k:['8 ball','zip up'] },
    { n:'Stussy Tribe Crewneck',         bs:'stussy', cs:'apparel', d:"Old English script sits across the chest on a premium ringspun crewneck—raw cultural DNA.", a:['stussy tribe crew'], k:['crewneck','tribe'] },
    { n:'Stussy World Tour Tee',         bs:'stussy', cs:'apparel', d:"Globe-spanning city list graphic—the T-shirt that defined a generation of surf-to-skate culture.", a:['stussy world tour tee'], k:['tshirt','world tour'] },
    { n:'Stussy x Nike Fleece Crewneck', bs:'stussy', cs:'apparel', d:"A premium Stussy x Nike collaboration on cozy fleece—dual branding with heritage joint credibility.", a:['stussy nike crew','stussy swoosh'], k:['collab','fleece','nike'] },
    { n:'Stussy International Tee',      bs:'stussy', cs:'apparel', d:"A clean international script tee distilling three decades of Shawn's surfboard script into a modern cut.", a:['stussy international tee'], k:['tshirt','script'] },
    { n:'Stussy Logo Cap',               bs:'stussy', cs:'accessories', d:"Six-panel twill cap with embroidered Stussy interlocking S—the cleanest lid in streetwear.", a:['stussy cap','stussy hat'], k:['cap','hat','accessories'] },
];
const stussyProducts = stussyBase.flatMap(b => variants(b, APPAREL_COLORS.slice(0,6)));

const bapeBase = [
    { n:'BAPE Shark Full Zip Hoodie',    bs:'bape', cs:'apparel', d:"The defining garment of Y2K streetwear—full-zip shark face hood and 1st CAMO all over.", a:['bape shark hoodie','ape shark'], k:['shark','camo','zip hoodie'] },
    { n:'BAPE College Tee',              bs:'bape', cs:'apparel', d:"American collegiate typography meets Tokyo hype—a bold tee for fans of maximum graphic impact.", a:['bape college tee'], k:['tshirt','graphic'] },
    { n:'BAPESTA',                       bs:'bape', cs:'sneakers', d:"The AF1-inspired Bapesta with a star swoosh—camouflage and patent leather collide in a Tokyo icon.", a:['bapesta','ape sta'], k:['star swoosh','patent'] },
    { n:'BAPE Camo Jacket',              bs:'bape', cs:'apparel', d:"The BAPE First Camo print jacket—a full statement piece in the house's most recognizable print.", a:['bape camo jacket'], k:['camo','jacket'] },
    { n:'BAPE Camo Shorts',              bs:'bape', cs:'apparel', d:"Low-key summer staple featuring the iconic 1st CAMO print with dual front pockets.", a:['bape camo shorts'], k:['shorts','camo'] },
    { n:'BAPE Knit Beanie',              bs:'bape', cs:'accessories', d:"A snug ribbed-knit beanie stitched with the iconic BAPE head graphic on the front.", a:['bape beanie'], k:['beanie','winter'] },
];
const bapeProducts = bapeBase.flatMap(b => variants(b, APPAREL_COLORS.slice(0,6)));

const stoneIslandBase = [
    { n:'Stone Island Crinkle Reps NY Down Jacket', bs:'stone-island', cs:'apparel', d:"Garment-dyed crinkle nylon with detachable compass badge—the puffer that redefined outerwear credibility.", a:['stone island puffer','si puffer'], k:['badge','puffer','outerwear'] },
    { n:'Stone Island Ghost Hoodie',     bs:'stone-island', cs:'apparel', d:"The badge is deliberately hidden under the kangaroo pocket—a stealth-mode piece for true enthusiasts.", a:['stone island ghost hoodie','si ghost'], k:['badge','ghost','hoodie'] },
    { n:'Stone Island Sweatpants',       bs:'stone-island', cs:'apparel', d:"Fleece-lined joggers with the iconic woven badge at the thigh—understated but instantly readable.", a:['stone island sweats','si joggers'], k:['badge','joggers','fleece'] },
    { n:'Stone Island Logo Patch Tee',   bs:'stone-island', cs:'apparel', d:"A clean-cut tee with the four-panel embroidered Stone Island patch on the left sleeve.", a:['stone island tee','si patch tee'], k:['badge','tshirt'] },
    { n:'Stone Island Goggle Jacket',    bs:'stone-island', cs:'apparel', d:"An archival silhouette with integrated goggle lens in the chest pocket—extremely collectible.", a:['stone island goggle','si goggles'], k:['goggle','outerwear','archival'] },
    { n:'Stone Island Compass Badge Cap',bs:'stone-island', cs:'accessories', d:"Six-panel cap with the magnetic compass rose badge as the centrepiece—minimal and unmistakable.", a:['stone island cap','si cap'], k:['cap','badge'] },
];
const stoneIslandProducts = stoneIslandBase.flatMap(b => variants(b, APPAREL_COLORS.slice(0,6)));

const monclerBase = [
    { n:'Moncler Maya Short Down Jacket', bs:'moncler', cs:'apparel', d:"The staple luxury puffer—high-shine lacquer nylon quilting with responsibly sourced goose down.", a:['moncler maya','moncler short puffer'], k:['puffer','luxury','quilted'] },
    { n:'Moncler Acorus Down Jacket',   bs:'moncler', cs:'apparel', d:"Matte seam-sealed nylon shell with a streamlined silhouette—a more understated Moncler take.", a:['moncler acorus'], k:['puffer','matte','quilted'] },
    { n:'Moncler Grenoble Down Jacket', bs:'moncler', cs:'apparel', d:"Moncler's technical ski division—waterproof, breathable, and ready for both slope and street.", a:['moncler grenoble'], k:['ski','technical','waterproof'] },
    { n:'Moncler Genius x Rick Owens Down Jacket', bs:'moncler', cs:'apparel', d:"Rick Owen's dystopian silhouette on Moncler construction—a cult collector's edition puffer.", a:['moncler rick owens','genius rick'], k:['collab','rick owens','avant garde'] },
    { n:'Moncler Poldo Dog Couture Vest', bs:'moncler', cs:'apparel', d:"An iconic Moncler collaboration taking its signature nylon quilting to a canine couture audience.", a:['moncler dog vest'], k:['vest','collab'] },
    { n:'Moncler Logo Hoodie',           bs:'moncler', cs:'apparel', d:"Premium French terry hoodie with raised Moncler logo in tonal stitching—refined casual wear.", a:['moncler hoodie'], k:['hoodie','logo'] },
];
const monclerProducts = monclerBase.flatMap(b => variants(b, APPAREL_COLORS.slice(0,6)));

// ────────────────────────────────────────────────────────────â”€
// SECTION 8 — LUXURY HANDBAGS (6 brands Ă— 6 items Ă— 5 colors)
// ────────────────────────────────────────────────────────────â”€
const lvBags = [
    { n:'Louis Vuitton Neverfull MM',        bs:'louis-vuitton', cs:'handbags', d:"Iconic flexible tote with monogram canvas and a cinching side lace—timelessly functional." },
    { n:'Louis Vuitton Keepall 55',          bs:'louis-vuitton', cs:'handbags', d:"The seminal luxury weekend bag—structured monogram canvas with golden brass hardware." },
    { n:'Louis Vuitton Speedy 30',           bs:'louis-vuitton', cs:'handbags', d:"The doctor-bag silhouette in LV's iconic canvas—a global bestseller for good reason." },
    { n:'Louis Vuitton Pochette Accessoires',bs:'louis-vuitton', cs:'handbags', d:"The go-to clutch companion that converts into a cross-body via gold chain." },
    { n:'Louis Vuitton OnTheGo MM',          bs:'louis-vuitton', cs:'handbags', d:"A reversible tote in Monogram and Giant Monogram—two bags in one luxurious design." },
    { n:'Louis Vuitton Twist MM Bag',        bs:'louis-vuitton', cs:'handbags', d:"The LV-twist lock closure is the modern LV hardware statement—structured and compact." },
].flatMap(b => variants({...b, a:[], k:['leather','luxury','monogram']}, HANDBAG_COLORS.slice(0,5)));

const gucciBags = [
    { n:'Gucci GG Marmont Matelassé',   bs:'gucci', cs:'handbags', d:"Soft chevron-quilted leather with a Double-G hardware closure—an iconic crossbody for any occasion." },
    { n:'Gucci Ophidia GG Shoulder Bag',bs:'gucci', cs:'handbags', d:"GG Supreme canvas with suede lining and a vintage-inspired red-green web strap." },
    { n:'Gucci Horsebit 1955 Shoulder Bag',bs:'gucci', cs:'handbags', d:"Equestrian heritage meets modern sensibility—this Horsebit detail is unmistakably Gucci." },
    { n:'Gucci Dionysus Small Shoulder Bag',bs:'gucci', cs:'handbags', d:"Tiger-head closure and antique gold finish define this bold structured crossbody." },
    { n:'Gucci Jackie 1961 Small Bag',  bs:'gucci', cs:'handbags', d:"Revived from the 1960s—a circular piston closure, suede lining, and understated Gucci branding." },
    { n:'Gucci Bamboo 1947 Small Top Handle',bs:'gucci', cs:'handbags', d:"A bamboo-carved handle on structured leather—a true archival Gucci icon." },
].flatMap(b => variants({...b, a:[], k:['leather','luxury','gg']}, HANDBAG_COLORS.slice(0,5)));

const hermesBags = [
    { n:'Hermès Birkin 25',  bs:'hermes', cs:'handbags', d:"The world's most exclusive bag—hand-stitched Togo leather with palladium hardware and a double flap." },
    { n:'Hermès Birkin 30',  bs:'hermes', cs:'handbags', d:"The 30cm Birkin strikes the perfect balance between form and function—utterly timeless." },
    { n:'Hermès Kelly 25',   bs:'hermes', cs:'handbags', d:"Structured Sellier silhouette with a signature Kelly clasp—the refined companion to the Birkin." },
    { n:'Hermès Kelly 28',   bs:'hermes', cs:'handbags', d:"The 28cm Kelly in both Sellier and Retourné constructions—one of fashion's defining artefacts." },
    { n:'Hermès Constance 24',bs:'hermes', cs:'handbags', d:"Clean lines and an iconic H clasp—the Constance distills Hermès heritage into understated elegance." },
    { n:'Hermès Picotin 18', bs:'hermes', cs:'handbags', d:"A casual bucket silhouette in Togo leather—one of Hermès' most accessible-yet-luxurious styles." },
].flatMap(b => variants({...b, a:[], k:['hermes','birkin','kelly','luxury']}, HANDBAG_COLORS.slice(0,5)));

// ────────────────────────────────────────────────────────────â”€
// SECTION 9 — ROLEX (6 references Ă— dial/strap combos)
// ────────────────────────────────────────────────────────────â”€
const rolexBase = [
    { n:'Rolex Submariner Date', bs:'rolex', cs:'watches', d:"The definitive luxury diver—40mm Oystersteel case, Cerachrom bezel, and Chromalight indices.", a:['rolex sub','sub date'], k:['diver','steel','ceramic'] },
    { n:'Rolex GMT-Master II',   bs:'rolex', cs:'watches', d:"The globetrotter's grail—24hr hand and bidirectional Cerachrom bezel for tracking dual time zones.", a:['rolex gmt','gmt2'], k:['gmt','bi-color','travel'] },
    { n:'Rolex Cosmograph Daytona', bs:'rolex', cs:'watches', d:"Racing chronograph legend—the most in-demand watch on the planet, period.", a:['rolex daytona','daytona chrono'], k:['chronograph','racing','tachymeter'] },
    { n:'Rolex Datejust 41',    bs:'rolex', cs:'watches', d:"The classic Rolex dress watch—Jubilee bracelet, fluted bezel, and Rolesor two-tone options.", a:['rolex datejust','dj41'], k:['dress watch','jubilee','fluted'] },
    { n:'Rolex Day-Date 40',    bs:'rolex', cs:'watches', d:"The President's watch—exclusively in precious metals with a day-of-week disc and President bracelet.", a:['rolex day date','president'], k:['gold','president bracelet','luxury'] },
    { n:'Rolex Oyster Perpetual 41',bs:'rolex', cs:'watches', d:"Rolex distilled to its essence—no date, no complications, just the core caliber and colourful dial options.", a:['rolex op41','oyster perpetual'], k:['simple','entry rolex','colourful'] },
];
const rolexProducts = rolexBase.flatMap(b => variants(b, [...WATCH_DIALS.slice(0,4), ...WATCH_STRAPS.slice(0,2)]));

// ────────────────────────────────────────────────────────────â”€
// SECTION 10 — OMEGA / PATEK / AUDEMARS / CARTIER / TAG (4 each Ă— dials)
// ────────────────────────────────────────────────────────────â”€
const omegaBase = [
    { n:'Omega Speedmaster Moonwatch', bs:'omega', cs:'watches', d:"The watch that went to the moon—manual-wind Calibre 3861 in a Hesalite case.", a:['moonwatch','speedmaster moonwatch'], k:['chronograph','space','nasa'] },
    { n:'Omega Seamaster Diver 300M', bs:'omega', cs:'watches', d:"James Bond's watch of choice—ceramic bezel, co-axial escapement, and impressive 300m water resistance.", a:['seamaster','seam 300m'], k:['diver','james bond','300m'] },
    { n:'Omega Aqua Terra',           bs:'omega', cs:'watches', d:"Elegant horizontal 'teak concept' dial pattern with Master Co-Axial precision—dressed-up sports watch.", a:['aqua terra','omega at'], k:['dress sport','teak'] },
    { n:'Omega Constellation',        bs:'omega', cs:'watches', d:"The pie-pan dial and claws case—Omega's prestige dress watch with co-axial movement.", a:['constellation','omega constellation'], k:['dress','claws'] },
];
const omegaProducts = omegaBase.flatMap(b => variants(b, WATCH_DIALS.slice(0,4)));

const patekBase = [
    { n:'Patek Philippe Nautilus 5711', bs:'patek-philippe', cs:'watches', d:"The steel sports watch grail—Gerald Genta's porthole design with integrated bracelet.", a:['nautilus','5711'], k:['steel sports','genta','luxury'] },
    { n:'Patek Philippe Aquanaut 5167', bs:'patek-philippe', cs:'watches', d:"The sporty younger sibling to the Nautilus—embossed tropical dial and rubber strap.", a:['aquanaut','5167'], k:['rubber','tropical', 'sports'] },
    { n:'Patek Philippe Calatrava 5227', bs:'patek-philippe', cs:'watches', d:"The quintessential dress watch—minimalist dial, officer's caseback, and leather strap.", a:['calatrava','5227'], k:['dress','minimalist'] },
    { n:'Patek Philippe Grand Complications', bs:'patek-philippe', cs:'watches', d:"The most complex Patek wristwatch—perpetual calendar, minute repeater, and split-second chronograph.", a:['grand complication patek'], k:['complication','perpetual','minute repeater'] },
];
const patekProducts = patekBase.flatMap(b => variants(b, WATCH_DIALS.slice(0,4)));

const apBase = [
    { n:'Audemars Piguet Royal Oak 15500', bs:'audemars-piguet', cs:'watches', d:"The original luxury sports watch—thin integrated bracelet, eight-screw bezel, and tapisserie dial.", a:['royal oak','ap royal oak','15500'], k:['steel sports','genta','tapisserie'] },
    { n:'Audemars Piguet Royal Oak Offshore', bs:'audemars-piguet', cs:'watches', d:"The bold Royal Oak on steroids—larger case, prominent crown guards, and rubber strap options.", a:['royal oak offshore','roo'], k:['sports','chronograph','beefy'] },
    { n:'Audemars Piguet Royal Oak Perpetual Calendar', bs:'audemars-piguet', cs:'watches', d:"A perpetual calendar complication housed in the iconic Royal Oak case—horological perfection.", a:['ap perpetual','royal oak perpetual'], k:['perpetual','complication'] },
];
const apProducts = apBase.flatMap(b => variants(b, WATCH_DIALS.slice(0,4)));

const cartierBase = [
    { n:'Cartier Santos',  bs:'cartier', cs:'watches', d:"The world's first pilot watch—exposed screws and square bezel give the Santos unmistakable identity.", a:['santos cartier','cartier santos'], k:['pilot','square','screws'] },
    { n:'Cartier Tank Must', bs:'cartier', cs:'watches', d:"An architectural rectangle informed by the shape of a tank—timeless elegance in a minimalist form.", a:['cartier tank','tank must'], k:['rectangular','minimalist','dress'] },
    { n:'Cartier Ballon Bleu', bs:'cartier', cs:'watches', d:"A sapphire cabochon-set crown tucked inside a rounded guard—the crown jewel of Cartier's watches.", a:['ballon bleu','cartier ballon'], k:['round','sapphire crown'] },
    { n:'Cartier Love Bracelet', bs:'cartier', cs:'jewellery', d:"Locked with a screwdriver—the Love bracelet symbolises devotion in 18k gold or platinum.", a:['love bracelet','cartier love'], k:['gold','bracelet','love'] },
];
const cartierProducts = cartierBase.flatMap(b => variants(b, WATCH_DIALS.slice(0,3)));

const tagBase = [
    { n:'TAG Heuer Monaco Calibre 11', bs:'tag-heuer', cs:'watches', d:"Steve McQueen's square chronograph—the first automatic waterproof chronograph in a distinctive square case.", a:['tag monaco','heuer monaco','steve mcqueen watch'], k:['chronograph','square','racing'] },
    { n:'TAG Heuer Carrera Calibre Heuer 01', bs:'tag-heuer', cs:'watches', d:"A skeletonized open-work dial inspired by Jack Heuer's love of racing—the ultimate sports chrono.", a:['tag carrera','heuer carrera'], k:['chronograph','racing','skeletonized'] },
    { n:'TAG Heuer Aquaracer Professional 300', bs:'tag-heuer', cs:'watches', d:"300m water resistance with unidirectional bezel—the diver for serious enthusiasts at accessible price.", a:['tag aquaracer','aquaracer 300'], k:['diver','300m'] },
];
const tagProducts = tagBase.flatMap(b => variants(b, WATCH_DIALS.slice(0,3)));

// ────────────────────────────────────────────────────────────â”€
// SECTION 11 — APPLE ELECTRONICS (6 product lines Ă— 4 colors)
// ────────────────────────────────────────────────────────────â”€
const appleBase = [
    { n:'Apple AirPods Pro 2nd Generation', bs:'apple', cs:'electronics', d:"Best-in-class active noise cancellation with Adaptive Transparency and Personalized Spatial Audio.", a:['airpods pro 2','airpods pro2'], k:['earbuds','anc','noise cancelling'] },
    { n:'Apple AirPods Max',               bs:'apple', cs:'electronics', d:"Apple's over-ear headphones with computational audio, transparent mode, and premium aluminum build.", a:['airpods max'], k:['over ear','headphones','spatial audio'] },
    { n:'Apple Vision Pro',                bs:'apple', cs:'electronics', d:"Spatial computing device—a revolutionary wearable with ultra-high-res micro-OLED displays.", a:['vision pro','apple vr'], k:['spatial computing','vr','ar'] },
    { n:'Apple Watch Ultra 2',             bs:'apple', cs:'electronics', d:"For extreme athletes—titanium case, dual-frequency GPS, and 60h battery with 87m water resistance.", a:['apple watch ultra 2','watch ultra'], k:['smartwatch','titanium','gps'] },
    { n:'Apple iPhone 15 Pro',             bs:'apple', cs:'electronics', d:"Titanium build, A17 Pro chip, 48MP Fusion camera, and the new Action Button—the peak iPhone.", a:['iphone 15 pro','iphone15pro'], k:['smartphone','titanium','camera'] },
    { n:'Apple MacBook Pro 14-inch M3',    bs:'apple', cs:'electronics', d:"M3 chip with up to 96GB of unified memory—a staggering leap in creator and developer performance.", a:['macbook pro m3','m3 mbp'], k:['laptop','m3','creator'] },
];
const appleProducts = appleBase.flatMap(b => variants(b, ELECTRONICS_COLORS.slice(0,4)));

// ────────────────────────────────────────────────────────────â”€
// SECTION 12 — SONY / NINTENDO / SAMSUNG (6 total Ă— variants)
// ────────────────────────────────────────────────────────────â”€
const gamingElec = [
    makeProduct('Sony PlayStation 5 Disc Edition',    'sony','electronics',   ['ps5 disc','ps5 disk'],  ['gaming','console','4k'],   'Next-gen gaming—ultra-fast SSD, ray tracing, haptic triggers, and 4K Blu-ray.'),
    makeProduct('Sony PlayStation 5 Digital Edition', 'sony','electronics',   ['ps5 digital'],          ['gaming','console'],        'Sleek disc-free PS5 delivering full next-gen power in a lighter, more affordable form.'),
    makeProduct('Sony DualSense Controller',          'sony','electronics',   ['ps5 controller','dualsense'],['gaming','accessories'],'Adaptive triggers and haptic feedback bring games to life in your hands.'),
    makeProduct('Sony WH-1000XM5',                   'sony','electronics',   ['sony xm5','headphones sony'],['headphones','anc','audio'],'Industry-leading noise cancellation with 30-hour battery and exceptionally comfortable fit.'),
    makeProduct('Nintendo Switch OLED White',         'nintendo','electronics',['switch oled white','white switch'],['gaming','handheld','portable'],'7-inch OLED screen with vivid colours—the best handheld gaming device on the market.'),
    makeProduct('Nintendo Switch OLED Neon',          'nintendo','electronics',['switch oled neon','neon switch'],['gaming','handheld'],           'Same brilliant OLED screen with iconic red-blue Joy-Cons—boldly retro, fully modern.'),
    makeProduct('Nintendo Switch Lite Yellow',        'nintendo','electronics',['switch lite yellow'],   ['handheld only','portable'],         'A compact dedicated handheld—lightweight and built exclusively for on-the-go gaming.'),
    makeProduct('Samsung Galaxy S24 Ultra',           'samsung','electronics',['s24 ultra','galaxy s24 ultra'],['smartphone','s-pen','camera'], 'Titanium frame, built-in S Pen, and the best camera system Samsung has ever shipped.'),
    makeProduct('Samsung Galaxy Z Fold 5',            'samsung','electronics',['galaxy fold 5','fold 5'],['foldable','phone','tablet'],        'Folds open to a 7.6-inch tablet display—the most ambitious smartphone design on the market.'),
    makeProduct('Samsung Galaxy Watch 6 Classic',     'samsung','electronics',['galaxy watch 6','samsung watch'],['smartwatch','bezel'],        'Rotating bezel, health sensors, and a premium look that bridges smartwatch and fashion.'),
];

// ────────────────────────────────────────────────────────────â”€
// SECTION 13 — DYSON (6 products Ă— colors)
// ────────────────────────────────────────────────────────────â”€
const dysonBase = [
    { n:'Dyson Airwrap Multi-styler Complete', bs:'dyson', cs:'home-appliances', d:"Coanda effect styling without extreme heat—curl, wave, smooth, and dry all in one.", a:['dyson airwrap','airwrap multistyler'], k:['hair styling','coanda'] },
    { n:'Dyson Supersonic Hair Dryer',         bs:'dyson', cs:'home-appliances', d:"High-velocity jet of air engineered for professional-quality results that protect natural shine.", a:['dyson supersonic','dyson dryer'], k:['hair dryer','fast dry'] },
    { n:'Dyson Corrale Hair Straightener',     bs:'dyson', cs:'home-appliances', d:"Flexing plates gather more hair for a single pass—cordless freedom and less heat damage.", a:['dyson corrale','dyson straightener'], k:['straightener','cordless'] },
    { n:'Dyson V15 Detect Absolute',           bs:'dyson', cs:'home-appliances', d:"Laser illuminates floor dust, piezo sensor counts particles—the most intelligent cordless vacuum.", a:['dyson v15','v15 detect'], k:['vacuum','cordless','laser'] },
    { n:'Dyson V12 Detect Slim',               bs:'dyson', cs:'home-appliances', d:"Laser Detect technology with anti-tangle hair screw tool—slim, light, and devastatingly powerful.", a:['dyson v12','v12 slim'], k:['vacuum','slim','cordless'] },
    { n:'Dyson 360 Vis Nav Robot Vacuum',      bs:'dyson', cs:'home-appliances', d:"Dyson's most powerful robot vacuum—edge-to-edge 360° vision camera and full-width brush bar.", a:['dyson 360','dyson robot vacuum'], k:['robot vacuum','autonomous'] },
];
const dysonColors = [
    { label: 'Nickel Copper',   a: ['nickel copper'],   k: [] },
    { label: 'Black Nickel',    a: ['black nickel'],    k: [] },
    { label: 'Blue Blush',      a: ['blue blush'],      k: [] },
    { label: 'Vinca Blue Rose', a: ['vinca blue rose'], k: [] },
];
const dysonProducts = dysonBase.flatMap(b => variants(b, dysonColors));

// ────────────────────────────────────────────────────────────â”€
// SECTION 14 — FRAGRANCES (7 brands Ă— sizes)
// ────────────────────────────────────────────────────────────â”€
const fragranceItems = [
    makeProduct('Maison Francis Kurkdjian Baccarat Rouge 540 EDP', 'mfk','fragrance', ['baccarat rouge','br540','mfk br540'], ['jasmine','saffron','cedar'], 'Luminous amber jasmine saffron—BR540 is the most discussed fragrance of the last decade.'),
    makeProduct('Maison Francis Kurkdjian Baccarat Rouge 540 Extrait', 'mfk','fragrance', ['baccarat rouge extrait','br540 extrait'], ['intense','amber'], 'The extrait concentration cranks the amber-saffron core to maximum intensity—longer and denser.'),
    makeProduct('Maison Francis Kurkdjian Grand Soir', 'mfk','fragrance', ['mfk grand soir'], ['vanilla','amber'], 'A powdery vanilla amber for evening—Grand Soir lingers with an almost edible sensuality.'),
    makeProduct('Maison Francis Kurkdjian Aqua Vitae', 'mfk','fragrance', ['mfk aqua vitae'], ['citrus','white flowers'], 'Effervescent white flowers over a fruity citrus base—the ideal fresh signature fragrance.'),

    makeProduct('Creed Aventus EDP 100ml',   'creed','fragrance', ['creed aventus 100ml'],['pineapple','birch','musk'], 'The undisputed king of masculine fragrance: fresh pineapple, smoky birch tar, and musk.'),
    makeProduct('Creed Aventus EDP 50ml',    'creed','fragrance', ['creed aventus 50ml'], ['pineapple','birch'],       'A 50ml flacon of Creed\'s most celebrated masculine scent—ideal compact travel size.'),
    makeProduct('Creed Royal Oud',           'creed','fragrance', ['royal oud creed'],   ['oud','cedar','spice'],     'A rich aromatic dry-down of rare Pakistani oud and deep Amazonian rosewood.'),
    makeProduct('Creed Viking',              'creed','fragrance', ['creed viking'],      ['citrus','spice','musk'],   'An invigorating icy citrus spice that embodies modern masculine energy.'),
    makeProduct('Creed Silver Mountain Water','creed','fragrance',['creed smw','silver mountain water'],['green tea','bergamot'],'Fresh, aquatic, and effortlessly wearable—an enduring classic from Creed\'s lineup.'),

    makeProduct('Chanel No.5 EDP 50ml',     'chanel','fragrance', ['chanel no5','no 5'], ['aldehydes','jasmine','rose'], 'The world\'s most iconic fragrance—an aldehydic floral rooted in Grasse jasmine and May rose.'),
    makeProduct('Chanel No.5 EDP 100ml',    'chanel','fragrance', ['chanel no5 100'],   ['aldehydes','jasmine'],       'The classic 100ml flacon of Chanel No.5—the founding masterpiece, timeless and luminous.'),
    makeProduct('Chanel BLEU DE CHANEL EDP','chanel','fragrance', ['bleu de chanel'],   ['aromatic','woody'],          'An aromatic woody fragrance capturing the spirit of a man who defies convention.'),
    makeProduct('Chanel COCO MADEMOISELLE EDP','chanel','fragrance',['coco mademoiselle'],['patchouli','rose','mandarin'],'A fresh, free, and resolutely feminine fragrance celebrating the essence of feminine modernity.'),
    makeProduct('Chanel Chance EDP',        'chanel','fragrance', ['chance chanel'],    ['floral','fresh'],             'A surprise in the world of Chanel—an unexpected fresh floral that defies classification.'),

    makeProduct('Tom Ford Black Orchid',    'tom-ford','fragrance', ['tom ford black orchid'],['black truffle','orchid'],'A luxurious and sensual fragrance of rare black orchid with rich dark accords.'),
    makeProduct('Tom Ford Tobacco Vanille', 'tom-ford','fragrance', ['tobacco vanille'],['tobacco','vanilla','cocoa'], 'Rich tobacco absolute meets sweet vanilla—a deeply warming autumnal masterpiece.'),
    makeProduct('Tom Ford Oud Wood',        'tom-ford','fragrance', ['tom ford oud'],   ['oud','sandalwood','cardamom'],'Smoky exotic oud blended with cardamom and sandalwood for a refined eastern allure.'),

    makeProduct('Diptyque Baies Candle 190g', 'diptyque','collectibles', ['diptyque baies','baies candle'],['currant','rose','candle'],'Diffuses a scent reminiscent of currants blending with Bulgarian rose—Diptyque\'s iconic design.'),
    makeProduct('Diptyque Do Son EDP 50ml',   'diptyque','fragrance', ['do son diptyque'],['tuberose','rose','musk'],'Tuberose and jasmine in a salty, breeze-drenched accord—a meditation on the coast of Vietnam.'),
];

// extend fragrance items with size variants
const fragranceSizeExt = [
    { base:'Maison Francis Kurkdjian Baccarat Rouge 540 EDP', brand:'mfk' },
    { base:'Creed Aventus EDP', brand:'creed' },
    { base:'Chanel No.5 EDP', brand:'chanel' },
    { base:'Tom Ford Black Orchid', brand:'tom-ford' },
].flatMap(({base, brand}) => FRAGRANCE_SIZES.map(s =>
    makeProduct(`${base} ${s.label}`, brand, 'fragrance', s.a, s.k)
));

// ────────────────────────────────────────────────────────────â”€
// SECTION 15 — HEALTH & BEAUTY (extended)
// ────────────────────────────────────────────────────────────â”€
const beautyItems = [
    makeProduct('La Mer Crème de la Mer 60ml',      'la-mer','health-beauty', ['creme de la mer','la mer moisturizer'],['moisturizer','healing','luxury'], 'The legendary healing cream born from the sea—uses Miracle Broth to plump and soothe.'),
    makeProduct('La Mer Crème de la Mer 250ml',     'la-mer','health-beauty', ['la mer 250ml'],    ['moisturizer','luxury','large'],  'The full-size crĂ¨me for power-users—restore luminosity and visibly reduce fine lines.'),
    makeProduct('La Mer The Eye Concentrate',       'la-mer','health-beauty', ['la mer eye','la mer eye cream'],['eye cream','puffiness'], 'Targets dark circles and crow\'s feet using Miracle Broth in a gel-cream texture.'),
    makeProduct('La Mer The Serum Essence',         'la-mer','health-beauty', ['la mer serum'],    ['serum','brightening'],           'A lightweight weightless serum that boosts glow and prepares skin for further treatment.'),
    makeProduct('La Mer Soft Moisture Lotion',      'la-mer','health-beauty', ['la mer lotion'],   ['lotion','hydrating'],            'Feather-light emulsion delivering sustained sea-sourced hydration.'),
    makeProduct('La Mer The Brightening Essence Intense','la-mer','health-beauty',['la mer brightening'],['brightening','vitamin c'],'High-power liquid brightener with Brightening Miracle Broth—dramatically illuminates.'),
];

// ────────────────────────────────────────────────────────────â”€
// SECTION 16 — TRADING CARDS (Pokémon + Panini)
// ────────────────────────────────────────────────────────────â”€
const pokemonSets = [
    'Evolving Skies','Brilliant Stars','Fusion Strike','Lost Origin','Crown Zenith',
    'Scarlet & Violet Base','Paldea Evolved','Obsidian Flames','Paradox Rift','Twilight Masquerade',
    '151', 'Hidden Fates','Shining Fates','Champions Path','Sword & Shield Base'
].flatMap(set => [
    makeProduct(`Pokémon TCG ${set} Booster Box`,    'pokemon','trading-cards', [`${set.toLowerCase()} box`,`pokemon ${set.toLowerCase()}`],['cards','tcg','booster'],  `A factory-sealed 36-pack ${set} booster box—chase rare V, VMAX, ex, and secret rare cards.`),
    makeProduct(`Pokémon TCG ${set} Elite Trainer Box`,'pokemon','trading-cards',[`${set.toLowerCase()} etb`],        ['etb','trainer box'],         `Elite Trainer Box for the ${set} expansion—includes sleeves, dice, and 8 booster packs.`),
]);

const paniniSets = [
    {set:'2023-24 Panini Prizm Basketball',   brand:'panini', cat:'trading-cards', k:['nba','prizm','basketball']},
    {set:'2023 Panini Prizm Football',        brand:'panini', cat:'trading-cards', k:['nfl','prizm','football']},
    {set:'2024 Panini National Treasures NBA',brand:'panini', cat:'trading-cards', k:['nba','national treasures','rpa']},
    {set:'2023-24 Panini Select Basketball',  brand:'panini', cat:'trading-cards', k:['nba','select','basketball']},
    {set:'2024 Topps Chrome Baseball',        brand:'panini', cat:'trading-cards', k:['mlb','topps','baseball']},
    {set:'2024 Panini Mosaic Football',       brand:'panini', cat:'trading-cards', k:['nfl','mosaic','football']},
].flatMap(({set,brand,cat,k}) => [
    makeProduct(`${set} Hobby Box`,     brand, cat, [`${set.toLowerCase()} hobby`], [...k,'hobby','sealed'],   `A sealed hobby box—the primary way to pull the hottest autographs and premium parallels.`),
    makeProduct(`${set} Mega Box`,      brand, cat, [`${set.toLowerCase()} mega`],  [...k,'mega','retail'],    `A retail mega box offering exclusive colour parallels at an accessible entry point.`),
    makeProduct(`${set} Blaster Box`,   brand, cat, [`${set.toLowerCase()} blaster`],[...k,'blaster','retail'],'A compact blaster box—perfect casual entry into this set with guaranteed hits.'),
]);

// ────────────────────────────────────────────────────────────â”€
// SECTION 17 — COLLECTIBLES (KAWS, Lego, Funko)
// ────────────────────────────────────────────────────────────â”€
const kawsItems = [
    makeProduct('KAWS Companion Open Edition', 'kaws','collectibles', ['kaws companion'],['vinyl','art toy','figure'],'The iconic crossed-out eyes Companion figure standing proud—a cornerstone of contemporary art culture.'),
    makeProduct('KAWS Companion Flayed Black', 'kaws','collectibles', ['kaws flayed','flayed companion'],['anatomy','art toy'], 'Anatomical cross-section revealing the Companion\'s inner universe across a perfectly matte black surface.'),
    makeProduct('KAWS Holiday Japan Brown',    'kaws','collectibles', ['kaws holiday brown'],['japan','holiday','sleeping'],'A relaxed reclining figure from the iconic Holiday series—premium Japanese vinyl casting.'),
    makeProduct('KAWS BFF Pink',              'kaws','collectibles', ['kaws bff','kaws pink'],            ['bff','pink'],           'The adorable BFF companion figure in a candy-pink colourway—incredibly popular among collectors.'),
    makeProduct('Bearbrick x KAWS 1000%',     'kaws','collectibles', ['kaws bearbrick 1000','kaws tension'],['bearbrick','1000%'],  'KAWS\'s signature meets Medicom\'s Bearbrick in a monumental 70cm vinyl collectible.'),
    makeProduct('KAWS Dissected Companion',   'kaws','collectibles', ['kaws dissected'],['dissected','grey'],                'A grey Companion with torso and head opened to reveal the bear-like inner figure—dark and poetic.'),
];

const legoSets = [
    {name:'LEGO Technic Bugatti Chiron', a:['lego bugatti','technic chiron'], k:['technic','supercar','1:8 scale']},
    {name:'LEGO Creator Expert Eiffel Tower', a:['lego eiffel tower'], k:['creator','landmark','10307']},
    {name:'LEGO Icons Orchid Botanical', a:['lego orchid'], k:['botanical','flowers','10311']},
    {name:'LEGO Star Wars Millennium Falcon UCS', a:['lego millennium falcon','ucs falcon'], k:['star wars','ucs','75192']},
    {name:'LEGO Ideas NASA Apollo Saturn V', a:['lego saturn v','lego nasa'], k:['space','ideas','nasa']},
    {name:'LEGO Icons Optimus Prime', a:['lego optimus','lego transformers'], k:['transformers','optimus','icons']},
    {name:'LEGO Art The Sith Mosaic', a:['lego sith art','lego darth vader mosaic'], k:['star wars','mosaic','art']},
    {name:'LEGO Technic Lamborghini Sián', a:['lego lamborghini sian'], k:['technic','supercar']},
    {name:'LEGO Icons Lou Romano Street Jazz Club', a:['lego jazz club'], k:['icons','modular','jazz']},
    {name:'LEGO Harry Potter Hogwarts Castle', a:['lego hogwarts'], k:['harry potter','castle','71043']},
].map(({name,a,k}) => makeProduct(name, 'lego', 'collectibles', a, k, `${name} — a meticulous LEGO masterpiece delivering hours of building satisfaction.`));

const funkoItems = [
    'Spider-Man No Way Home','Batman Dark Knight','The Mandalorian','Naruto Shippuden',
    'Dragon Ball Z Goku','Star Wars Luke Skywalker','Avengers Iron Man','Harry Potter',
    'Stranger Things Eleven','Breaking Bad Walter White'
].map(c => makeProduct(
    `Funko Pop! ${c} Special Edition`,
    'funko', 'collectibles',
    [`funko ${c.toLowerCase()}`, `pop ${c.toLowerCase()}`],
    ['vinyl','figure','pop'],
    `Limited Special Edition Funko Pop! of ${c} — detailed sculpt with metallic or chrome finish.`
));

// ────────────────────────────────────────────────────────────â”€
// SECTION 18 — LUXURY FASHION EXTRAS (Valentino, Versace, Loro Piana, Balenciaga)
// ────────────────────────────────────────────────────────────â”€
const luxuryFashion = [
    makeProduct('Valentino Garavani Rockstud Stiletto',  'valentino','sneakers',  ['rockstud heels','valentino stiletto'],['heels','studs'],     'Pyramid metal studs transform a killer heel into a wearable piece of art.'),
    makeProduct('Valentino VLTN Logo Hoodie',            'valentino','apparel',   ['valentino vlogo hoodie'],['logo','oversized'],                'A crisp VLTN logo hoodie—clean design in premium French terry cotton.'),
    makeProduct('Versace Medusa Head T-Shirt',           'versace','apparel',     ['versace medusa tee'],   ['medusa','graphic'],                 'Front-and-center Medusa print on heavyweight cotton—unmistakably Versace.'),
    makeProduct('Versace Baroque Shirt',                 'versace','apparel',     ['versace baroque shirt'],['baroque print','dress shirt'],      'Full-scale baroque print silk shirt—loud, proud, and undeniably luxurious.'),
    makeProduct('Balenciaga Triple S Sneaker',           'balenciaga','sneakers', ['triple s bal','balenciaga triple s'],['dad shoe','chunky'],   'Three layered soles and an oversized mesh upper—the shoe that defined the chunky aesthetic era.'),
    makeProduct('Balenciaga Speed Runner Sock Sneaker',  'balenciaga','sneakers', ['balenciaga speed','speed sock'],['sock sneaker','knit'],       'Full-knit sock upper on a sculptural rubber sole—speed meets avant-garde streetwear.'),
    makeProduct('Balenciaga Defender Sneaker',           'balenciaga','sneakers', ['balenciaga defender'],  ['chunky','tire tread'],              'A brutalist tire-tread midsole—the most extreme sneaker silhouette in Balenciaga\'s arsenal.'),
    makeProduct('Loro Piana Baby Cashmere Scarf',        'loro-piana','accessories',['loro piana scarf'],   ['cashmere','scarf','baby fiber'],   'Baby cashmere fibre—the softest natural fibre in the world—in an essential Loro Piana scarf.'),
    makeProduct('Loro Piana Icer Walk Lace-Up Boot',     'loro-piana','accessories',['loro piana boots','lp boots'],['boots','luxury'],          'Loro Piana\'s finest waterproof suede walking boot with extreme Storm System® protection.'),
    makeProduct('Brunello Cucinelli Cashmere Rollneck',  'brunello-cucinelli','apparel',['bc rollneck','cucinelli cashmere turtleneck'],['cashmere','luxury','turtleneck'],'Undyed cashmere yarns spun in Solomeo—a peak-luxury turtleneck that commands silence.'),
];

const luxuryFashionVariants = luxuryFashion.flatMap(p => {
    // generate a couple of colorway clones to boost count
    return APPAREL_COLORS.slice(0,4).map(clr => makeProduct(
        `${p.name} ${clr.label}`,
        p.brandSlug, p.categorySlug,
        [...p.aliases, clr.label.toLowerCase()],
        [...p.keywords, ...clr.k],
        p.description
    ));
});

// ────────────────────────────────────────────────────────────â”€
// SECTION 19 — ARC'TERYX / CANADA GOOSE / RALPH LAUREN (outerwear)
// ────────────────────────────────────────────────────────────â”€
const outerwearBase = [
    { n:"Arc'teryx Beta AR Jacket",     bs:'arcteryx', cs:'apparel', d:"GORE-TEX Pro 3L shell rated for extreme alpine conditions—waterproof, breathable, incredibly light.", a:["arc teryx beta ar","arcteryx shell"], k:['gore-tex','alpine','technical'] },
    { n:"Arc'teryx Atom LT Hoody",      bs:'arcteryx', cs:'apparel', d:"Coreloft insulation with an elastic-stretch hem—packable midlayer for multi-sport versatility.", a:["arcteryx atom lt"], k:['insulated','midlayer','packable'] },
    { n:"Arc'teryx Veilance Mionn IS Coat", bs:'arcteryx', cs:'apparel', d:"The convergence of performance and luxury—a beautifully tailored technical wool/PrimaLoft coat.", a:["veilance coat","arcteryx veilance"], k:['luxury technical','wool','smart'] },
    { n:'Canada Goose Expedition Parka', bs:'canada-goose', cs:'apparel', d:"Tested at -30°C—the expedition parka defined cold-weather luxury with Arctic Duck down.", a:['canada goose expedition','cg expedition'], k:['arctic down','parka','cold weather'] },
    { n:'Canada Goose Chilliwack Bomber', bs:'canada-goose', cs:'apparel', d:"A heritage bomber silhouette with fill power 625 down—a balance between warmth and urban style.", a:['canada goose chilliwack','cg bomber'], k:['bomber','down','winter'] },
    { n:"Canada Goose Freestyle Crew Vest", bs:'canada-goose', cs:'apparel', d:"A down vest staple—iconic patch on the chest and classic puffer quilting in a packable form.", a:['canada goose vest','cg vest'], k:['vest','down','packable'] },
    { n:'Ralph Lauren Polo Bear Knit Sweater', bs:'ralph-lauren', cs:'apparel', d:"The beloved Polo Bear on a crisp merino wool sweater—whimsy meets prep heritage.", a:['polo bear sweater','rl polo bear'], k:['polo bear','sweater','merino'] },
    { n:'Ralph Lauren Purple Label Blazer', bs:'ralph-lauren', cs:'apparel', d:"Canvassed Italian wool craftsmanship—the most elevated sportcoat in the Ralph Lauren portfolio.", a:['rrl blazer','rl purple label'], k:['blazer','italian wool','canvassed'] },
];
const outerwearProducts = outerwearBase.flatMap(b => variants(b, APPAREL_COLORS.slice(0,6)));

// ────────────────────────────────────────────────────────────â”€
// SECTION 20 — SUNGLASSES / ACCESSORIES EXTRA
// ────────────────────────────────────────────────────────────â”€
const sunglassNames = [
    {name:'Prada Linea Rossa Impavid Sunglasses',    bs:'prada','a':['prada spr 50z']},
    {name:'Gucci GG0714S Rectangle Sunglasses',      bs:'gucci','a':['gucci rectangle glasses']},
    {name:'Dior B27 S1F Sunglasses',                 bs:'dior','a':['dior b27 shades']},
    {name:'Tom Ford FT0513 Snowdon Sunglasses',      bs:'tom-ford','a':['tom ford snowdon']},
    {name:'Oliver Peoples Greg Norman Sunglasses',   bs:'ralph-lauren','a':['oliver peoples greg']},
    {name:'Versace VE2232 Medusa Sunglasses',        bs:'versace','a':['versace medusa sunglasses']},
];
const sunglassColors = [
    {label:'Black',      a:['black'],      k:['classic']},
    {label:'Tort',       a:['tortoise'],   k:['brown']},
    {label:'Gold',       a:['gold'],       k:['metallic']},
    {label:'Silver',     a:['silver'],     k:['metallic']},
    {label:'Crystal',    a:['crystal'],    k:['clear']},
];
const sunglassProducts = sunglassNames.flatMap(s =>
    sunglassColors.map(c => makeProduct(`${s.name} ${c.label}`, s.bs, 'sunglasses', [...(s.a||[]),c.label.toLowerCase()], ['eyewear','sunglasses',...c.k], `${s.name} in ${c.label} — crafted for style, UV protection, and all-day wearable luxury.`))
);

// ────────────────────────────────────────────────────────────â”€
// SECTION 21 — ASICS / SALOMON / EXTRA RUNNERS
// ────────────────────────────────────────────────────────────â”€
const runnerBase = [
    { n:'ASICS Gel-Kayano 14',   bs:'asics', cs:'sneakers', d:"A 90s running silhouette with GEL cushioning and layered mesh—the Y2K runner trend crystallised.", a:['kayano 14','asics kayano'], k:['gel','runner','y2k'] },
    { n:'ASICS Gel-1130',        bs:'asics', cs:'sneakers', d:"Asymmetric mesh paneling over two-density GEL cushioning—a retro runner for the contemporary scene.", a:['gel 1130','asics 1130'], k:['gel','runner','asymmetric'] },
    { n:'ASICS Gel-Nimbus 25',   bs:'asics', cs:'sneakers', d:"The flagship running shoe—FF BLAST PLUS ECO cushioning and 3D SPACE CONSTRUCTION for long run support.", a:['gel nimbus 25','nimbus 25'], k:['running','cushioned','ergonomic'] },
    { n:'ASICS Gel-Lyte III',    bs:'asics', cs:'sneakers', d:"Split tongue heritage and Hazel construction make this a beloved collab canvas since 1990.", a:['gel lyte 3','asics gl3'], k:['split tongue','collab','heritage'] },
    { n:'Salomon XT-6',          bs:'salomon', cs:'sneakers', d:"The gorpcore icon—trail construction with aggressive Contagrip outsole and woven midfoot cage.", a:['salomon xt6'], k:['trail','gorpcore','woven cage'] },
    { n:'Salomon XT-4',          bs:'salomon', cs:'sneakers', d:"Lighter, more agile sibling to the XT-6—trail DNA in a sleeker silhouette.", a:['salomon xt4'], k:['trail','lightweight','gorpcore'] },
    { n:'Salomon ACS Pro Advanced',bs:'salomon', cs:'sneakers', d:"Anti-Crush System technology with metallic overlays—Y2K futurism meets functional trail shoe.", a:['salomon acs pro'], k:['y2k','metallic','trail'] },
];
const runnerProducts = runnerBase.flatMap(b => variants(b, SNEAKER_COLORS.slice(0,8)));

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// WAVE 2 — Additional Product Sections
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// ── W2 SEC 1: MORE JORDAN MODELS (8 new + 12 colorways = 96) ──
const jordanWave2Base = [
    { n:'Air Jordan 6 Rings',       bs:'jordan', cs:'sneakers', d:'A hybrid celebrating six championship rings—elements of the 3, 4, 5, 6, 7, and 8 in one show-stopping shoe.', a:['aj rings','jordan 6 rings'], k:['rings','championship','hybrid'] },
    { n:'Air Jordan 7 Retro',       bs:'jordan', cs:'sneakers', d:'Pan-African gold accents and a Huarache-style inner sleeve—designed for the 1992 Dream Team Olympics.', a:['jordan 7','aj7'], k:['olympic','dream team','gold'] },
    { n:'Air Jordan 9 Retro',       bs:'jordan', cs:'sneakers', d:'Text from MJ\'s most famous quotes circles the perimeter midsole on this unique sculptural design.', a:['jordan 9','aj9'], k:['text midsole','unique'] },
    { n:'Air Jordan 14 Retro',      bs:'jordan', cs:'sneakers', d:'Ferrari-inspired air vents and last dance energy—the shoe worn when MJ won his sixth title.', a:['jordan 14','aj14'], k:['ferrari','last dance','vent'] },
    { n:'Air Jordan 36',            bs:'jordan', cs:'sneakers', d:'The most performance-forward Jordan yet—FastFit lacing, full Zoom Air, and a modern athletic silhouette.', a:['jordan 36','aj 36'], k:['performance','basketball','modern'] },
    { n:'Air Jordan Luka 2',        bs:'jordan', cs:'sneakers', d:'Luka Dončić\'s signature shoe—wide toe box and cushioning designed for his unique court footwork.', a:['luka 2','jordan luka'], k:['basketball','performance','luka'] },
    { n:'Jordan x Union LA',        bs:'jordan', cs:'sneakers', d:'LA archive store Union\'s bespoke take on classic Jordan silhouettes with vintage wash and patchwork.', a:['union la jordan','jordan union'], k:['collab','vintage','union'] },
    { n:'Jordan x Dior Air Jordan 1', bs:'jordan', cs:'sneakers', d:'The most expensive Jordan ever released—Kim Jones\' Dior collaboration with pre-distressed overlays.', a:['dior jordan 1','jordan dior'], k:['luxury','dior','collab'] },
];
const jordanWave2 = jordanWave2Base.flatMap(b => variants(b, SNEAKER_COLORS.slice(0,12)));

// ── W2 SEC 2: MORE NIKE MODELS (8 new + 12 colors = 96) ──────
const nikeWave2Base = [
    { n:'Nike Air Max SNDR',        bs:'nike', cs:'sneakers', d:'Successor to the AM1—sculptural chassis with visible forefoot and heel Air plus a radically angled outsole.', a:['air max sndr','sndr'], k:['air max','modern'] },
    { n:'Nike ISPA Universal',      bs:'nike', cs:'sneakers', d:'Zero-waste ISPA innovation: modular parts that can be disassembled for recycling without any tools.', a:['ispa universal'], k:['sustainable','modular','ispa'] },
    { n:'Nike ACG Lowcate',         bs:'nike', cs:'sneakers', d:'Woven upper and a multi-directional outsole designed for all-terrain urban adventure.', a:['acg lowcate'], k:['acg','terrain','woven'] },
    { n:'Nike Free RN 5.0',         bs:'nike', cs:'sneakers', d:'Flex-groove sole for natural motion—the barefoot-inspired runner that adapts to your stride.', a:['free run 5','free rn 5'], k:['running','barefoot','flex'] },
    { n:'Nike React Infinity Run 4', bs:'nike', cs:'sneakers', d:'React foam wide base designed for injury prevention—the everyday training workhorse.', a:['react infinity 4','infinity run 4'], k:['running','react','trainer'] },
    { n:'Nike ZoomX Vaporfly NEXT% 3', bs:'nike', cs:'sneakers', d:'Carbon fibre plate in a ZoomX foam stack—the race-day weapon used by world-record marathon runners.', a:['vaporfly 3','vaporfly next 3'], k:['running','race','carbon plate'] },
    { n:'Nike Killshot 2 Leather',  bs:'nike', cs:'sneakers', d:'A simple cupsole tennis shoe from 1983—virtually unchanged and enduringly popular with minimalists.', a:['killshot 2'], k:['tennis','minimal','heritage'] },
    { n:'Nike Cortez',              bs:'nike', cs:'sneakers', d:'Nike\'s first-ever shoe—Bill Bowerman\'s cushioned running shoe with a heritage swoosh and waffle sole.', a:['cortez','nike cortez'], k:['heritage','1972','waffle'] },
];
const nikeWave2 = nikeWave2Base.flatMap(b => variants(b, SNEAKER_COLORS.slice(0,12)));

// ── W2 SEC 3: HIGH-FASHION SNEAKERS (Gucci, Dior, Prada, Valentino — 6 Ă— 8 colors) ──
const hfSneakerBase = [
    { n:'Gucci Ace Sneaker',           bs:'gucci', cs:'sneakers', d:'Iconic green-red-green web tape on white leather—a timeless Gucci casual with wide appeal.', a:['gucci ace','ace sneaker gucci'], k:['web tape','luxury sneaker'] },
    { n:'Gucci Rhyton Sneaker',        bs:'gucci', cs:'sneakers', d:'A chunky luxury dad sneaker bearing the Gucci California print—bold fashion statement.', a:['gucci rhyton'], k:['chunky','dad shoe'] },
    { n:'Dior B22 Sneaker',            bs:'dior', cs:'sneakers', d:'Mesh and calfskin leather upper over a bold layered chunky midsole—Dior\'s contemporary runner.', a:['dior b22'], k:['chunky','runner','mesh'] },
    { n:'Dior B27 Low Sneaker',        bs:'dior', cs:'sneakers', d:'A clean low-top in smooth calfskin marked by the iconic "CD" logo hardware clip.', a:['dior b27 low'], k:['low','cd logo','calfskin'] },
    { n:'Prada Cloudbust Thunder',     bs:'prada', cs:'sneakers', d:'Bold technical knit upper with an ultra-thick sole—Prada\'s most striking casual silhouette.', a:['prada cloudbust'], k:['knit','chunky','technical'] },
    { n:'Prada Monolith Loafer',       bs:'prada', cs:'sneakers', d:'Platform lug sole beneath a smooth brushed leather loafer—Prada luxury with a streetwear attitude.', a:['prada monolith loafer'], k:['loafer','platform','leather'] },
];
const hfSneakerProducts = hfSneakerBase.flatMap(b => variants(b, SNEAKER_COLORS.slice(0,8)));

// ── W2 SEC 4: DENIM & JEANS (5 brands Ă— 6 washes = 30) ──────
const denimBrands = ['supreme','fear-of-god','bape','stone-island','ralph-lauren'];
const denimWashes = [
    {label:'Washed Black',   a:['black washed'],   k:['dark']},
    {label:'Raw Indigo',     a:['raw denim'],       k:['stiff','dark']},
    {label:'Light Wash',     a:['light wash'],      k:['faded']},
    {label:'Medium Wash',    a:['medium wash'],     k:['classic']},
    {label:'Stone Wash',     a:['stone wash'],      k:['vintage']},
    {label:'Distressed',     a:['ripped'],          k:['distressed','holes']},
];
const denimProducts = denimBrands.flatMap(brand => {
    const brandName = (brandBySlug[brand]||MOCK_BRANDS[0]).name;
    return denimWashes.map(w => makeProduct(
        `${brandName} Denim Jeans ${w.label}`,
        brand, 'apparel',
        [...w.a, `${brand} jeans`],
        [...w.k, 'denim','jeans'],
        `Premium ${brandName} denim in ${w.label} finish—crafted from Japanese selvedge cotton with branded hardware.`
    ));
});

// ── W2 SEC 5: MORE HANDBAGS (Chanel, Valentino, Versace — 5 Ă— 6 colors) ──
const moreHBBase = [
    { n:'Chanel Classic Flap Bag',    bs:'chanel', cs:'handbags', d:'The quilted lambskin with interlocking CC turn-lock is fashion\'s most recognisable handbag design.', a:['chanel flap','chanel classic bag'], k:['quilted','cc clasp','lambskin'] },
    { n:'Chanel 19 Bag',              bs:'chanel', cs:'handbags', d:'Karl Lagerfeld\'s last iconic creation—mixed-material quilting with multi-chain stack strap.', a:['chanel 19'], k:['quilted','chain strap'] },
    { n:'Chanel Boy Bag',             bs:'chanel', cs:'handbags', d:'Structured rectangular silhouette inspired by Chanel \'s jersey boxy jackets and masculine tailoring.', a:['chanel boy','boy bag'], k:['structured','rectangular'] },
    { n:'Valentino Roman Stud Bag',   bs:'valentino', cs:'handbags', d:'The Roman Stud pyramid hardware on lambskin leather—the bag that launched a thousand red-carpet editorials.', a:['valentino roman stud','roman stud bag'], k:['studs','lambskin'] },
    { n:'Versace La Medusa Bag',      bs:'versace', cs:'handbags', d:'Classic Medusa hardware medallion on a softly structured quilted leather crossbody.', a:['versace medusa bag','la medusa'], k:['medusa','quilted','crossbody'] },
];
const moreHBProducts = moreHBBase.flatMap(b => variants({...b, a:b.a, k:b.k}, HANDBAG_COLORS.slice(0,6)));

// ── W2 SEC 6: SKINCARE TOOLS & DEVICES (6 brands Ă— 4 models) ──
const skincareTools = [
    makeProduct('Foreo Luna 4 Face Cleansing', 'foreo','health-beauty', ['foreo luna 4','luna cleansing'], ['facial','silicone','T-sonic'], 'T-Sonic pulsation silicone cleansing brush—removes 99.5% of dirt and oil in 60 seconds.'),
    makeProduct('Foreo Bear Pro Microcurrent', 'foreo','health-beauty', ['foreo bear pro'], ['microcurrent','anti ageing'], 'FDA-cleared microcurrent device that lifts, firms, and contours facial muscles non-invasively.'),
    makeProduct('NuFACE Trinity Facial Toning','foreo','health-beauty', ['nuface trinity'], ['microcurrent','lifting'], 'The world\'s #1 microcurrent device—5 minutes a day delivers clinically proven anti-ageing results.'),
    makeProduct('CurrentBody LED Light Therapy Mask','foreo','health-beauty', ['current body led mask','led face mask'], ['led','red light','anti ageing'], 'Clinically proven red and near-infrared light therapy for a visibly smoother, younger complexion.'),
    makeProduct('PMD Clean Pro Rose Quartz', 'foreo','health-beauty', ['pmd clean pro'], ['rose quartz','sonic','cleansing'], 'A luxurious sonic cleansing brush with a rose quartz gemstone for an elevated skincare ritual.'),
    makeProduct('Dermalogica Pro Bright Peel Kit','la-mer','health-beauty', ['dermalogica peel'],['peel','brightening','professional'], 'A professional-grade at-home peel kit delivering immediate brightening and resurfacing results.'),
];

// ── W2 SEC 7: CHANEL / DIOR ACCESSORIES ──────────────────────
const chanelAccessories = [
    ['Chanel No.5 Lip Colour Shine', 'chanel','health-beauty', ['chanel lip no5'],['lipstick','iconic'],'The iconic No.5 capsule in a shine lip colour—luxury beauty refined to its most wearable form.'],
    ['Chanel Les Beiges Healthy Glow Foundation','chanel','health-beauty', ['chanel beige foundation'],['foundation','glow'],'A cushiony, weightless foundation with a natural skin-like veil and all-day wear formula.'],
    ['Dior Rouge Dior Lipstick','dior','health-beauty', ['dior rouge','dior lipstick'],['lipstick','luxury'],'Couture colour and long-lasting comfort in Dior\'s signature refillable lip case.'],
    ['Dior Forever Skin Glow Foundation','dior','health-beauty', ['dior forever glow'],['foundation','glow','longwear'],'24h wear cushion foundation with a radiant finish engineered for perfect skin photography.'],
    ['Prada Beauty Monochrome Lip','prada','health-beauty', ['prada beauty lipstick'],['lipstick','monochrome'],'Prada\'s debut beauty—matte soft-satin lipstick with the triangle logo on a refillable bullet.'],
].map(([name,brand,cat,aliases,keywords,desc]) => makeProduct(name,brand,cat,aliases,keywords,desc));

// ── W2 SEC 8: GAMING PERIPHERALS (10 items direct) ──────────
const gamingPeripherals = [
    makeProduct('Razer BlackWidow V4 Pro Keyboard','razer','gaming', ['razer blackwidow', 'mechanical keyboard'], ['gaming','mechanical','rgb'], 'Razer\'s flagship mechanical gaming keyboard with Green clicky switches and chroma RGB lighting.'),
    makeProduct('Razer DeathAdder V3 Pro Mouse', 'razer','gaming', ['razer deathadder v3'], ['gaming','wireless','fps'], 'Ultra-lightweight wireless gaming mouse with 30k DPI Focus Pro sensor—the FPS champion\'s choice.'),
    makeProduct('SteelSeries Arctis Nova Pro Headset','steelseries','gaming', ['arctis nova pro'], ['gaming','headset','anc'], 'Dual-wireless connectivity, active noise cancellation, and ClearCast Gen3 microphone for elite comms.'),
    makeProduct('HyperX Cloud Alpha Wireless', 'hyperx','gaming', ['hyperx cloud alpha'], ['gaming','headset','300hr battery'], 'A 300-hour wireless battery life—the longest in gaming headsets and exceptional DTS audio.'),
    makeProduct('Sony PlayStation VR2', 'sony','gaming', ['psvr2','ps vr2'], ['vr','gaming','haptics'], '4K HDR eye-tracking VR headset with adaptive triggers in the new Sense controllers.'),
    makeProduct('Xbox Series X Console', 'xbox','gaming', ['xbox series x','microsoft xbox'], ['gaming','console','4k'], '12 teraflops of processing power, Xbox Velocity architecture—Microsoft\'s most powerful console ever.'),
    makeProduct('Xbox Elite Wireless Controller Series 2', 'xbox','gaming', ['xbox elite 2'], ['gaming','controller','pro'], 'Custom tension thumbsticks, hair trigger locks, and wraparound rubber grip—the serious gamer\'s pad.'),
    makeProduct('Corsair K100 RGB Keyboard', 'corsair','gaming', ['corsair k100'], ['gaming','mechanical','rgb'], 'OPX optical switches actuate at 1mm for industry-fastest response—a professional gaming keyboard.'),
    makeProduct('Elgato Stream Deck MK2', 'elgato','gaming', ['stream deck mk2'], ['streaming','content creation','lcd keys'], 'LCD key deck for live production—control OBS scenes, sounds, and apps from a tactile single board.'),
    makeProduct('ASUS ROG Ally Gaming Handheld', 'samsung','gaming', ['rog ally','asus rog handheld'], ['handheld','pc gaming','windows'], 'Windows 11 handheld gaming PC with AMD Ryzen Z1 Extreme chip—Steam, Xbox GamePass, all platforms at once.'),
];

// ── W2 SEC 9: SPORTS EQUIPMENT (8 items Ă— 4 colors) ──────────
const sportsBase = [
    { n:'Nike Mercurial Vapor 16 Elite FG', bs:'nike', cs:'sports', d:'The fastest football boot on the pitch—Aerotrak plate and ACC technology for wet/dry traction.', a:['vapor 16 elite','mercurial vapor'], k:['football boots','speed','acc'] },
    { n:'Nike Phantom GX Elite FG', bs:'nike', cs:'sports', d:'Gripknit upper applies textured micro-patterns for superior ball control in any weather.', a:['phantom gx elite'], k:['football boots','control'] },
    { n:'adidas Predator Elite FG', bs:'adidas', cs:'sports', d:'Control Zone rubber spines on the upper generate precision swerve on every set-piece strike.', a:['predator elite','adidas predator'], k:['football boots','accuracy','zones'] },
    { n:'adidas X Speedportal.1 FG', bs:'adidas', cs:'sports', d:'Speedskin lightweight upper and CarbonShell plate—engineered purely for maximum speed.', a:['speedportal 1'], k:['football boots','speed'] },
    { n:'Nike Tiempo Legend 10 Elite FG', bs:'nike', cs:'sports', d:'Full kangaroo leather upper with embedded ACC—the touch boot for purists and ball-playing defenders.', a:['tiempo legend 10','tiempo elite'], k:['leather','football boots','touch'] },
    { n:'Puma Future 7 Ultimate FG', bs:'puma', cs:'sports', d:'FUZIONFIT+ compression band hugs the midfoot while Twistlock plates deliver the ultimate multi-directional grip.', a:['puma future 7','puma future'], k:['football boots','grip'] },
    { n:'Nike Air Zoom Tempo NEXT%', bs:'nike', cs:'sports', d:'A tempo trainer combining React foam with a ZoomX forefoot bag—for long run days at sub-race pace.', a:['tempo next','air zoom tempo'], k:['running','trainer','carbon'] },
    { n:'adidas Adizero Adios Pro 3', bs:'adidas', cs:'sports', d:'Five EnergyRods inside a Lightstrike Pro base—the Adidas marathon racing shoe that breaks records.', a:['adizero adios pro 3'], k:['running','racing','marathon'] },
];
const sportsProducts = sportsBase.flatMap(b => variants(b, SNEAKER_COLORS.slice(0,4)));

// ── W2 SEC 10: MORE FRAGRANCES (extended brands) ──────────────
const moreFrag = [
    makeProduct('Byredo Gypsy Water EDP 50ml',   'byredo','fragrance', ['byredo gypsy water'], ['bergamot','woody','smoke'],'Bergamot, pepper, and a compelling smoky birch base—Byredo\'s most approachable and beloved signature.'),
    makeProduct('Byredo Bal d\'Afrique EDP 50ml', 'byredo','fragrance', ['byredo bal afrique'], ['neroli','marigold','musk'],  'A sun-drenched neroli and Casablanca lily opening that settles into deep African violet.'),
    makeProduct('Byredo Mojave Ghost EDP 50ml',   'byredo','fragrance', ['byredo mojave ghost'], ['sand','musk','sapodilla'],  'Ambrette and sandalwood on a matte white, almost transparent desert air accord.'),
    makeProduct('Dior Sauvage EDP 100ml',         'dior','fragrance',  ['sauvage edp 100'],    ['aromatic','pepper','ambroxan'],'Fresh fougère with a pepper and ambroxan punch—one of the best-selling masculine fragrances ever.'),
    makeProduct('Dior Sauvage Elixir 60ml',       'dior','fragrance',  ['sauvage elixir'],     ['spice','leather','civet'],  'The ultra-concentrated Elixir takes Sauvage\'s DNA in a darker, more animalistic direction.'),
    makeProduct('Dior Homme Intense EDP',         'dior','fragrance',  ['dior homme intense'], ['iris','amber','leather'],   'Deep iris and suede iris wood in an immensely sophisticated masculine floral.'),
    makeProduct('Yves Saint Laurent Black Opium EDP','ysl','fragrance',['ysl black opium'],['coffee','white flowers','vanilla'],'An addictive coffee and white floral that became one of the decade\'s most recognised feminine fragrances.'),
    makeProduct('Yves Saint Laurent Libre EDP',   'ysl','fragrance',['ysl libre'],    ['lavender','orange blossom'], 'French lavender and orange blossom in a radically modern, unapologetically feminine accord.'),
    makeProduct('Jo Malone London Wood Sage & Sea Salt', 'jo-malone','fragrance',['jo malone wood sage sea salt'],['marine','earthy','unisex'],'Windswept Atlantic ozone and earthy sage—one of the most universally flattering unisex colognes.'),
    makeProduct('Jo Malone London Peony & Blush Suede', 'jo-malone','fragrance',['jo malone peony blush'],['peony','rose','suede'],'Delicate peony and blush rose grounded in a warm suede base—an eternally romantic fragrance.'),
    makeProduct('Acqua di Parma Colonia',         'acqua-di-parma','fragrance',   ['acqua di parma colonia'],['citrus','classic','italian'],'The original Italian cologne since 1916—citrus, lavender, and vetiver in a perfected accord.'),
    makeProduct('Armani Code Parfum',             'armani','fragrance',['armani code'],  ['spice','leather','guaiac'],  'A dark, smoky reinterpretation of the classic Code with guaiac wood and black pepper.'),
    makeProduct('Maison Margiela Replica By the Fireplace','maison-margiela','fragrance',['replica fireplace','by the fireplace'],['chestnut','smoke','vanilla'],'Captures the warmth of a cosy fireside—chestnut cream, smoke, and vanilla woods.'),
    makeProduct('Maison Margiela Replica Jazz Club',  'maison-margiela','fragrance',['replica jazz club'],['tobacco','rum','vetiver'],'Inspired by an intimate New York jazz venue—tobacco petals, rum, and vetiver.'),
    makeProduct('Maison Margiela Replica Flower Market','maison-margiela','fragrance',['replica flower market'],['green','peony','rose'],'Fresh-cut stems and early morning dew at a Parisian flower stall—clean and refreshing.'),
];

// ── W2 SEC 11: TRAINER / LIFESTYLE EXTRAS ────────────────────
const trainerExtras = [
    { n:'Nike Trainer Essential',   bs:'nike',  cs:'sneakers', d:'A cross-training shoe with low-profile React foam and a wide, stable base for lifting days.', a:['nike trainer essential'], k:['training','gym','stable'] },
    { n:'Nike Metcon 9',            bs:'nike',  cs:'sneakers', d:'The most stable Nike Metcon yet—Hyperlift insert and a rubber crash rail for squat and rope.', a:['metcon 9','nike metcon 9'], k:['crossfit','training','stable'] },
    { n:'adidas Solarboost',        bs:'adidas',cs:'sneakers', d:'Boost heel panel with Stretchweb outsole—a versatile everyday running shoe for neutral runners.', a:['adidas solarboost'], k:['running','boost','neutral'] },
    { n:'adidas Ultraboost Light',  bs:'adidas', cs:'sneakers', d:'40% lighter Boost compound paired with a Linear Energy Push trusstic system.', a:['ultraboost light'], k:['running','lightweight','boost'] },
    { n:'New Balance Fresh Foam X 1080v13', bs:'new-balance', cs:'sneakers', d:'73% recycled Fresh Foam X—luxuriously soft long-run trainer for neutral foot types.', a:['nb 1080v13','fresh foam 1080'], k:['running','cushioned','trainer'] },
    { n:'ASICS Gel-Nimbus 26',      bs:'asics', cs:'sneakers', d:'FF Blast Plus ECO cushioning and a new wider toe box—ASICS\'s premier everyday running shoe reimagined.', a:['gel nimbus 26','nimbus 26'], k:['running','cushioned','neutral'] },
    { n:'ASICS Gel-Kayano 30',      bs:'asics', cs:'sneakers', d:'The 30th anniversary edition with 4D Guidance System and improved FF Blast+ foam for stability work.', a:['kayano 30','gel kayano 30'], k:['running','stability','support'] },
    { n:'Brooks Ghost 16',          bs:'brooks', cs:'sneakers', d:'DNA Loft v3 foam in a soft, balanced cushion approach—the daily workhorse for 40+ miles per week.', a:['brooks ghost 16'], k:['running','cushioned','neutral'] },
].flatMap(b => variants(b, SNEAKER_COLORS.slice(2,8)));

// ── W2 SEC 12: JEWELLERY ────────────────────────────────────â”€
const jewelleryItems = [
    ['Cartier Love Ring 18k White Gold',    'cartier','jewellery', ['cartier love ring white gold'],['gold','love','minimalist'],'The iconic screw motif on a smooth yellow gold band—Cartier devotion made wearable.'],
    ['Cartier Love Bracelet 18k Rose Gold', 'cartier','jewellery', ['cartier love bracelet rose gold'],['rose gold','love','bracelet'],'The world\'s most recognisable bracelet—interlocking oval in 18k rose gold.'],
    ['Tiffany T Wire Bracelet',             'tiffany','jewellery', ['tiffany t wire'],['minimalist','wire','bracelet'],'Ultra-thin sterling silver wire shaped into the iconic Tiffany T—pure, effortless minimalism.'],
    ['Van Cleef & Arpels Alhambra Necklace', 'van-cleef','jewellery', ['van cleef alhambra'],['clover','luxury','necklace'],'Four-leaf clover motif in mother-of-pearl on yellow gold—the epitome of lucky charm jewellery.'],
    ['Bulgari Serpenti Viper Ring',         'bulgari','jewellery',  ['bulgari serpenti ring'],['snake','luxury','ring'],'Spiralled snake silhouette ring set with pavé diamonds—ancient mythology meets modern luxury.'],
    ['Messika Move Uno Diamond Bracelet',   'messika','jewellery',  ['messika move uno'],['diamond','bracelet','floating'],'A floating solitaire sliding diamond set in 18k gold—kinetic, modern, and captivating.'],
].map(([name,brand,cat,aliases,keywords,desc]) => makeProduct(name,brand,cat,aliases,keywords,desc));
// Add color variants
const jewelleryVariants = jewelleryItems.flatMap(p =>
    [{label:'Yellow Gold',a:['yellow gold'],k:['gold']},{label:'White Gold',a:['white gold'],k:['platinum']},{label:'Rose Gold',a:['rose gold'],k:['pink gold']}]
    .map(c => makeProduct(`${p.name} ${c.label}`, p.brandSlug, p.categorySlug, [...p.aliases,...c.a], [...p.keywords,...c.k], p.description))
);

// ── W2 SEC 13: LEGO WAVE 2 ──────────────────────────────────â”€
const legoWave2 = [
    'LEGO Icons Grand Piano',
    'LEGO Minecraft The Fortress',
    'LEGO Creator Expert Big Ben',
    'LEGO Star Wars AT-AT',
    'LEGO Technic Porsche 911 RSR',
    'LEGO City Space Rocket',
    'LEGO Icons Flower Bouquet',
    'LEGO Art Marilyn Monroe',
    'LEGO Technic Ferrari Daytona SP3',
    'LEGO Icons Titanic',
    'LEGO Harry Potter Diagon Alley',
    'LEGO Icons Colosseum',
].map(n => makeProduct(n, 'lego', 'collectibles', [n.toLowerCase()], ['lego','set','building'], `${n} — LEGO at its most ambitious, a challenging and deeply satisfying build experience.`));

// ── W2 SEC 14: FUNKO WAVE 2 ──────────────────────────────────
const funkoWave2 = [
    'Funko Pop! Deadpool with Chimichanga',
    'Funko Pop! Groot Holding Groot',
    'Funko Pop! Anakin Skywalker Darth Vader',
    'Funko Pop! Joker Heath Ledger',
    'Funko Pop! Michael Jackson Thriller',
    'Funko Pop! Shrek & Donkey 2-Pack',
    'Funko Pop! Morgan Freeman Million Dollar Baby',
    'Funko Pop! Kakashi Hatake',
    'Funko Pop! Itachi Uchiha GITD',
    'Funko Pop! Son Goku Ultra Instinct',
    'Funko Pop! Saitama One Punch Man',
    'Funko Pop! Luffy Gear 5',
].map(c => makeProduct(
    `${c} Special Edition`, 'funko','collectibles',
    [c.toLowerCase().replace(/funko pop! /g,'')],
    ['vinyl','pop','limited edition'],
    `${c} Limited Special Edition—premium chrome or holographic variant with display stand included.`
));

// ── W2 SEC 15: POKĂ‰MON SINGLES & ACCESSORIES ────────────────â”€
const pokemonSingles = [
    'Charizard ex Secret Rare',
    'Pikachu VMAX Rainbow Rare',
    'Umbreon VMAX Alternate Art',
    'Lugia V Alternate Art',
    'Rayquaza ex Secret Rare',
    'Mew ex Special Illustration',
    'Gardevoir ex Special Illustration',
    'Chien-Pao ex Special Illustration',
    'Iron Valiant ex Special Illustration',
    'Roaring Moon ex Alternate Art',
].map(card => makeProduct(
    `Pokémon ${card}`,
    'pokemon','trading-cards',
    [card.toLowerCase(), `pokemon ${card.toLowerCase()}`],
    ['single card','tcg','graded','rare'],
    `A single ${card}—highly sought-after in PSA/BGS graded condition. Ideal for investment or display.`
));

// ── W2 SEC 16: MORE PANINI SINGLES ──────────────────────────â”€
const paniniSingles = [
    {p:'Panini Prizm Victor Wembanyama Rookie RC PSA 10', k:['wembanyama','rookie','psa 10']},
    {p:'Panini Prizm Chet Holmgren Gold Prizm /10', k:['chet holmgren','gold prizm','rookie']},
    {p:'Panini National Treasures Patrick Mahomes Auto /25', k:['mahomes','auto','national treasures']},
    {p:'Panini Prizm Jalen Brunson Silver Prizm', k:['brunson','silver prizm']},
    {p:'Panini Select Jayson Tatum Gold Prizm /10', k:['tatum','gold prizm']},
    {p:'Panini Flawless LeBron James Diamond Auto /25', k:['lebron','flawless','diamond auto']},
    {p:'Panini Prizm Justin Jefferson Gold Prizm /10', k:['jefferson','gold prizm','wr']},
    {p:'Topps Chrome Mike Trout 1st Bowman Chrome', k:['trout','bowman','rookie']},
].map(({p,k}) => makeProduct(p,'panini','trading-cards',[p.toLowerCase()],[...k,'single card','sports'],`${p} — premium single card in excellent condition, verified authentic with cert of authenticity.`));

// ── W2 SEC 17: TECH ACCESSORIES (cables, cases, stands) ──────
const techAccs = [
    makeProduct('Apple MagSafe Charger 15W',        'apple','electronics', ['magsafe charger'],['charging','wireless','apple watch'],'Magnetic alignment for perfect wireless charging every time—15W Qi2 certified.'),
    makeProduct('Apple AirTag 4-Pack',               'apple','electronics', ['airtag 4 pack'],  ['tracking','bluetooth'],            'Find anything—precision Find My network with ultra-wideband chip and replaceable battery.'),
    makeProduct('Apple Leather Case iPhone 15 Pro',  'apple','accessories', ['iphone 15 pro case'], ['case','leather','protection'],  'Buttery full-grain leather lined with soft microfibre—minimal bulk, maximum tactile quality.'),
    makeProduct('Samsung Galaxy Buds 3 Pro',          'samsung','electronics',['galaxy buds 3 pro'],['earbuds','anc','samsung'],      'Adaptive ANC, Seamless 360-degree Spatial Audio, and 360-degree voice pickup microphones.'),
    makeProduct('Beats Studio Pro Wireless',          'beats','electronics', ['beats studio pro'],['headphones','anc','beats'],       'Lossless audio over USB-C, ANC, and 40-hour battery in a beautifully sculpted over-ear.'),
    makeProduct('Sennheiser Momentum 4 Wireless',     'sennheiser','electronics',  ['sennheiser momentum 4','momentum 4'],['headphones','60hr battery'],'Audiophile-grade ANC with 60-hour battery—premium German sound engineering.'),
    makeProduct('Sony WH-1000XM5 Headphones',         'sony','electronics',  ['xm5 headphones'],['headphones','anc','sony'],         'Industry-leading ANC, 30hr battery, and eight microphones for crystal-clear calls.'),
    makeProduct('Bang & Olufsen Beoplay H95',          'bang-olufsen','electronics',  ['b&o beoplay h95','beoplay h95 headphones'],['headphones','premium','danish'],'Danish handcrafted over-ear with 38hr battery, ANC, and full-grain lambskin earpads.'),
];

// ── W2 SEC 18: BEAUTY SERUMS & TREATMENTS ────────────────────
const beautySerums = [
    makeProduct('The Ordinary Hyaluronic Acid 2% + B5', 'la-mer','health-beauty',['the ordinary ha 2','ha serum'],['hydrating','hyaluronic','serum'],'High-concentrate hyaluronic acid paired with B5—extreme multi-depth hydration for all skin types.'),
    makeProduct('Paula\'s Choice 2% BHA Liquid Exfoliant','la-mer','health-beauty',["paula's choice bha","bha exfoliant"],['exfoliant','bha','pores'],'A cult-status exfoliant that unclogs pores, smooths wrinkles, and evens skin tone noticeably.'),
    makeProduct('Drunk Elephant C-Firma Fresh Day Serum','drunk-elephant','health-beauty',['drunk elephant c firma','vitamin c serum'],['vitamin c','brightening','antioxidant'],'A potent vitamin C, ferulic acid, and vitamin E serum that firms and brightens dramatically.'),
    makeProduct('SkinCeuticals C E Ferulic Serum',      'skinceuticals','health-beauty',['skinceuticals c e ferulic','ferulic serum'],['vitamin c','vitamin e','ferulic'],'The gold-standard antioxidant formula—protects against environmental damage and reduces the look of fine lines.'),
    makeProduct('Tatcha The Water Cream Moisturizer',   'tatcha','health-beauty',['tatcha water cream'],['moisturizer','japanese','lightweight'],'Oil-free Japanese hadasei-3 complex moisturizer that refines pores and provides all-day hydration.'),
    makeProduct('Sulwhasoo First Care Activating Serum','sulwhasoo','health-beauty',['sulwhasoo first care'],['korean','activating','first care'],'Korean luxury skincare\'s most refined first care serum—5 wild ginseng herbs in perfect balance.'),
    makeProduct('Sisley Black Rose Cream Mask',         'sisley','health-beauty',['sisley black rose mask'],['mask','anti ageing','paris'],'Iconic Parisian anti-ageing mask with black rose extract and hyaluronic acid for intense overnight revival.'),
    makeProduct('Estée Lauder Advanced Night Repair',   'la-mer','health-beauty',['advanced night repair','anr serum'],['night repair','retinol','anti ageing'],'The world\'s number one serum—chronolux power signal technology that works with the skin\'s natural repair cycle.'),
];

// ────────────────────────────────────────────────────────────â”€
// ASSEMBLE ALL PRODUCTS
// ────────────────────────────────────────────────────────────â”€
// -- WAVE 3: SUGGESTION FILLER (Ensuring 100% coverage for curated suggestions) --
const travisJordanFiller = [
    { n:'Travis Scott x Air Jordan 1 Low OG Canary', bs:'jordan', cs:'sneakers', d:'The Canary Island-inspired colorway featuring bold yellow overlays and blue accents.', a:['jordan 1 travis canary','travis canary'], k:['elkins','yellow'] },
    { n:'Travis Scott x Air Jordan 1 Low OG Olive', bs:'jordan', cs:'sneakers', d:'Deep olive tones paired with premium white leather and the signature reverse swoosh.', a:['jordan 1 travis olive'], k:['olive'] },
    { n:'Travis Scott x Air Jordan 1 Low OG Black Phantom', bs:'jordan', cs:'sneakers', d:'Triple black aesthetic with contrast white stitching and Bee embroidery.', a:['travis phantom'], k:['all black'] },
    { n:'Travis Scott x Air Jordan 1 High OG Fragment', bs:'jordan', cs:'sneakers', d:'The legendary three-way collaboration between Nike, Travis Scott, and Fragment Design.', a:['travis fragment high'], k:['military blue'] },
    { n:'Travis Scott x Air Jordan 1 Low OG Reverse Mocha', bs:'jordan', cs:'sneakers', d:'Iconic reverse swoosh on a mocha and sail palette—one of the most sought-after lows.', a:['reverse mocha'], k:['brown','sail'] },
    { n:'Travis Scott x Air Jordan 1 High OG Mocha', bs:'jordan', cs:'sneakers', d:'The original high-top that started the reverse swoosh craze.', a:['travis mocha high'], k:['dark mocha'] },
];

const monclerFiller = [
    { n:'Moncler Maya 70 Edition Puffer Jacket', bs:'moncler', cs:'fashion', d:'Special 70th-anniversary edition of the iconic Maya jacket in a high-gloss finish.', a:['moncler maya 70'], k:['puffer','anniversary'] },
    { n:'Moncler Maya Jacket Black', bs:'moncler', cs:'fashion', d:'The classic black Maya puffer jacket—the ultimate symbol of luxury outerwear.', a:['black moncler maya'], k:['classic'] },
    { n:'Moncler Maya Jacket Navy', bs:'moncler', cs:'fashion', d:'Deep navy gloss finish Maya jacket with detachable hood and signature sleeve pocket.', a:['navy moncler maya'], k:['blue'] },
    { n:'Moncler Maya Jacket Red', bs:'moncler', cs:'fashion', d:'Bold scarlet Maya puffer jacket for those who want to stand out on the slopes or the street.', a:['red moncler maya'], k:['red'] },
    { n:'Moncler Maya Jacket White', bs:'moncler', cs:'fashion', d:'Ice white Maya puffer jacket with premium down fill and water-resistant finish.', a:['white moncler maya'], k:['white'] },
];

const kawsFiller = [
    { n:'KAWS Companion 2020 Figure Brown', bs:'kaws', cs:'collectibles', d:'Celebrating 20 years of KAWS with this brown vinyl Companion figure.', a:['kaws 2020 brown'], k:['anniversary'] },
    { n:'KAWS Companion 2020 Figure Grey', bs:'kaws', cs:'collectibles', d:'The 20th-anniversary Companion in a sleek grey colorway.', a:['kaws 2020 grey'], k:['grey'] },
    { n:'KAWS Companion 2020 Figure Black', bs:'kaws', cs:'collectibles', d:'All-black 20th-anniversary Companion figure—a minimalist masterpiece.', a:['kaws 2020 black'], k:['black'] },
    { n:'KAWS Time Off Figure Blue', bs:'kaws', cs:'collectibles', d:'Companion taking a break in a vibrant blue vinyl finish.', a:['kaws time off blue'], k:['blue'] },
    { n:'KAWS Time Off Figure Black', bs:'kaws', cs:'collectibles', d:'The reclining Time Off figure in deep matte black.', a:['kaws time off black'], k:['black'] },
    { n:'KAWS What Party Figure White', bs:'kaws', cs:'collectibles', d:'Chum figure in a classic white pose—Michelin man vibes with a KAWS twist.', a:['kaws what party'], k:['white','chum'] },
];

const rolexFiller = [
    { n:'Rolex GMT-Master II Batgirl', bs:'rolex', cs:'watches', d:'Blue and black ceramic bezel on a Jubilee bracelet—the modern icon.', a:['rolex batgirl','126710blnr'], k:['batman','jubilee'] },
    { n:'Rolex GMT-Master II Sprite', bs:'rolex', cs:'watches', d:'The unique left-handed GMT with a green and black bezel.', a:['rolex sprite','lefty rolex'], k:['green bezel'] },
    { n:'Rolex Submariner Starbucks', bs:'rolex', cs:'watches', d:'Green ceramic bezel on a black dial—the successor to the Kermit.', a:['rolex starbucks','green sub'], k:['green ceramic'] },
    { n:'Rolex Day-Date 40 Olive Green', bs:'rolex', cs:'watches', d:'Solid 18ct Rose Gold with an olive green dial and Roman numerals.', a:['rolex day date olive'], k:['rose gold','presidential'] },
    { n:'Rolex Sky-Dweller Blue Dial', bs:'rolex', cs:'watches', d:'The most complicated Rolex movement in a stunning blue sunray dial.', a:['rolex sky dweller blue'], k:['annual calendar'] },
];

const appleFiller = [
    { n:'Apple iPhone 15 Pro Max Natural Titanium', bs:'apple', cs:'electronics', d:'The flagship iPhone in the stunning new 5-grade titanium finish.', a:['iphone 15 pro max titanium'], k:['titanium'] },
    { n:'Apple iPhone 15 Pro Max Blue Titanium', bs:'apple', cs:'electronics', d:'Deep blue titanium finish with 5x optical zoom camera system.', a:['iphone 15 pro max blue'], k:['blue'] },
    { n:'Apple iPhone 15 Pro Max White Titanium', bs:'apple', cs:'electronics', d:'Classic white titanium aesthetic with the ultra-powerful A17 Pro chip.', a:['iphone 15 pro max white'], k:['white'] },
    { n:'Apple MacBook Pro 14 M3 Max Space Black', bs:'apple', cs:'electronics', d:'Professional power in the new, fingerprint-resistant Space Black finish.', a:['macbook pro m3 max'], k:['black','m3'] },
    { n:'Apple MacBook Air 13 M3 Midnight', bs:'apple', cs:'electronics', d:'Supercharged by M3, the world’s most popular laptop is better than ever.', a:['macbook air m3 midnight'], k:['midnight'] },
];

const supremeFiller = [
    { n:'Supreme Box Logo Crewneck Black', bs:'supreme', cs:'fashion', d:'The quintessential Supreme piece in iconic heavyweight cross-grain fleece.', a:['supreme crewneck black'], k:['black','bogo'] },
    { n:'Supreme Box Logo Crewneck Heather Grey', bs:'supreme', cs:'fashion', d:'Classic heather grey crewneck with the legendary red box logo embroidery.', a:['supreme crewneck grey'], k:['grey','bogo'] },
    { n:'Supreme Box Logo Crewneck Navy', bs:'supreme', cs:'fashion', d:'Deep navy blue crewneck featuring the unmistakable Supreme box logo.', a:['supreme crewneck navy'], k:['navy','bogo'] },
    { n:'Supreme Box Logo Crewneck Cardinal', bs:'supreme', cs:'fashion', d:'Rich cardinal red crewneck — a bold statement piece for any collection.', a:['supreme crewneck red'], k:['red','bogo'] },
];

const dysonFiller = [
    { n:'Dyson Airwrap Multi-styler Ceramic Pink', bs:'dyson', cs:'home-appliances', d:'The viral hair styler in a limited edition ceramic pink colorway.', a:['pink dyson airwrap'], k:['pink'] },
    { n:'Dyson Airwrap Multi-styler Prussian Blue', bs:'dyson', cs:'home-appliances', d:'Elegant Prussian Blue and Copper edition for luxury hair styling.', a:['blue dyson airwrap'], k:['blue'] },
    { n:'Dyson Airwrap Multi-styler Bright Nickel', bs:'dyson', cs:'home-appliances', d:'Classic bright nickel and copper finish for the ultimate drying and styling experience.', a:['nickel dyson airwrap'], k:['nickel'] },
];

const baccaratFiller = [
    { n:'Maison Francis Kurkdjian Baccarat Rouge 540 Extrait 70ml', bs:'mfk', cs:'fragrance', d:'The most concentrated version of the legendary BR540 fragrance.', a:['br540 extrait 70ml'], k:['extrait'] },
    { n:'Maison Francis Kurkdjian Baccarat Rouge 540 EDP 70ml', bs:'mfk', cs:'fragrance', d:'The signature scent that changed the fragrance industry forever.', a:['br540 edp 70ml'], k:['edp'] },
    { n:'Maison Francis Kurkdjian Baccarat Rouge 540 EDP 200ml', bs:'mfk', cs:'fragrance', d:'The largest size available for the true connoisseur of Baccarat Rouge.', a:['br540 edp large'], k:['200ml'] },
];

const suggestionFiller = [
    ...travisJordanFiller,
    ...monclerFiller,
    ...kawsFiller,
    ...rolexFiller,
    ...appleFiller,
    ...supremeFiller,
    ...dysonFiller,
    ...baccaratFiller
].map(p => makeProduct(p.n, p.bs, p.cs, p.a, p.k, p.d));

const MOCK_PRODUCTS = [
    ...jordanProducts,
    ...nikeProducts,
    ...adidasProducts,
    ...nbProducts,
    ...runnerProducts,
    ...supremeProducts,
    ...fogProducts,
    ...stussyProducts,
    ...bapeProducts,
    ...stoneIslandProducts,
    ...monclerProducts,
    ...lvBags,
    ...gucciBags,
    ...hermesBags,
    ...rolexProducts,
    ...omegaProducts,
    ...patekProducts,
    ...apProducts,
    ...cartierProducts,
    ...tagProducts,
    ...appleProducts,
    ...gamingElec,
    ...dysonProducts,
    ...fragranceItems,
    ...fragranceSizeExt,
    ...beautyItems,
    ...pokemonSets,
    ...paniniSets,
    ...kawsItems,
    ...legoSets,
    ...funkoItems,
    ...luxuryFashion,
    ...luxuryFashionVariants,
    ...outerwearProducts,
    ...sunglassProducts,
    // Wave 2
    ...jordanWave2,
    ...nikeWave2,
    ...hfSneakerProducts,
    ...denimProducts,
    ...moreHBProducts,
    ...skincareTools,
    ...chanelAccessories,
    ...gamingPeripherals,
    ...sportsProducts,
    ...moreFrag,
    ...trainerExtras,
    ...jewelleryItems,
    ...jewelleryVariants,
    ...legoWave2,
    ...funkoWave2,
    ...pokemonSingles,
    ...paniniSingles,
    ...techAccs,
    ...beautySerums,
    ...suggestionFiller,
];

// ── SUGGESTIONS ──────────────────────────────────────────────
// Apply image-backed SKU assignments before trending is calculated.
// The id map keeps translated locale catalogues aligned with the root catalogue.
const PRODUCT_IMAGE_SKUS_BY_ID = window.ProductImageSkusById || {};
const PRODUCT_IMAGE_SKUS_BY_NAME = window.ProductImageSkusByName || {};
const PRODUCT_NAME_OVERRIDES_BY_ID = window.ProductNameOverridesById || {};
MOCK_PRODUCTS.forEach(p => {
    const imageSku = PRODUCT_IMAGE_SKUS_BY_ID[p.id] || PRODUCT_IMAGE_SKUS_BY_NAME[p.name];
    if (imageSku) p.sku = imageSku;
    const imageName = PRODUCT_NAME_OVERRIDES_BY_ID[p.id];
    if (imageName && imageName !== p.name) {
        const previousName = p.name;
        p.name = imageName;
        p.slug = imageName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        p.aliases = Array.from(new Set([...(p.aliases || []), previousName.toLowerCase(), imageName.toLowerCase()]));
    }
});
const STOCKX_EXPANDED_NIKE_JORDAN_PRODUCTS = window.StockxExpandedNikeJordanProducts || [];
const STOCKX_EXPANDED_JORDAN_PRODUCTS = window.StockxExpandedJordanProducts || [];
const STOCKX_EXPANDED_ADIDAS_PRODUCTS = window.StockxExpandedAdidasProducts || [];
const STOCKX_EXPANDED_SUPREME_PRODUCTS = window.StockxExpandedSupremeProducts || [];
const STOCKX_EXPANDED_NEW_BALANCE_PRODUCTS = window.StockxExpandedNewBalanceProducts || [];
const STOCKX_EXPANDED_FEAR_OF_GOD_PRODUCTS = window.StockxExpandedFearOfGodProducts || [];
const STOCKX_EXPANDED_GUCCI_PRODUCTS = window.StockxExpandedGucciProducts || [];
const STOCKX_EXPANDED_YEEZY_PRODUCTS = window.StockxExpandedYeezyProducts || [];
const STOCKX_EXPANDED_ASICS_PRODUCTS = window.StockxExpandedAsicsProducts || [];
const STOCKX_EXPANDED_BAPE_PRODUCTS = window.StockxExpandedBapeProducts || [];
const STOCKX_EXPANDED_STONE_ISLAND_PRODUCTS = window.StockxExpandedStoneIslandProducts || [];
const STOCKX_EXPANDED_MONCLER_PRODUCTS = window.StockxExpandedMonclerProducts || [];
const STOCKX_EXPANDED_ROLEX_PRODUCTS = window.StockxExpandedRolexProducts || [];
const STOCKX_EXPANDED_POKEMON_PRODUCTS = window.StockxExpandedPokemonProducts || [];
const STOCKX_EXPANDED_STUSSY_PRODUCTS = window.StockxExpandedStussyProducts || [];
const STOCKX_EXPANDED_APPLE_PRODUCTS = window.StockxExpandedAppleProducts || [];
const STOCKX_EXPANDED_LOUIS_VUITTON_PRODUCTS = window.StockxExpandedLouisVuittonProducts || [];
const STOCKX_EXPANDED_HERMES_PRODUCTS = window.StockxExpandedHermesProducts || [];
const STOCKX_EXPANDED_DYSON_PRODUCTS = window.StockxExpandedDysonProducts || [];
const STOCKX_TRENDING_MARKETPLACE_PRODUCTS = window.StockxTrendingMarketplaceProducts || [];
const INTERNET_TRENDING_FRAGRANCE_PRODUCTS = window.InternetTrendingFragranceProducts || [];
const STOCKX_EXPANDED_PRODUCTS = [...STOCKX_EXPANDED_NIKE_JORDAN_PRODUCTS, ...STOCKX_EXPANDED_JORDAN_PRODUCTS, ...STOCKX_EXPANDED_ADIDAS_PRODUCTS, ...STOCKX_EXPANDED_SUPREME_PRODUCTS, ...STOCKX_EXPANDED_NEW_BALANCE_PRODUCTS, ...STOCKX_EXPANDED_FEAR_OF_GOD_PRODUCTS, ...STOCKX_EXPANDED_GUCCI_PRODUCTS, ...STOCKX_EXPANDED_YEEZY_PRODUCTS, ...STOCKX_EXPANDED_ASICS_PRODUCTS, ...STOCKX_EXPANDED_BAPE_PRODUCTS, ...STOCKX_EXPANDED_STONE_ISLAND_PRODUCTS, ...STOCKX_EXPANDED_MONCLER_PRODUCTS, ...STOCKX_EXPANDED_ROLEX_PRODUCTS, ...STOCKX_EXPANDED_POKEMON_PRODUCTS, ...STOCKX_EXPANDED_STUSSY_PRODUCTS, ...STOCKX_EXPANDED_APPLE_PRODUCTS, ...STOCKX_EXPANDED_LOUIS_VUITTON_PRODUCTS, ...STOCKX_EXPANDED_HERMES_PRODUCTS, ...STOCKX_EXPANDED_DYSON_PRODUCTS, ...STOCKX_TRENDING_MARKETPLACE_PRODUCTS, ...INTERNET_TRENDING_FRAGRANCE_PRODUCTS];
let PRODUCT_IMAGE_NEXT_BRAND_ID = MOCK_BRANDS.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0) + 1;
STOCKX_EXPANDED_PRODUCTS.forEach(item => {
    if (!item || !item.brandSlug || brandBySlug[item.brandSlug]) return;
    const brandName = item.brand || item.brandSlug.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
    const brand = { id: PRODUCT_IMAGE_NEXT_BRAND_ID++, name: brandName, slug: item.brandSlug, keywords: item.keywords || [] };
    brand.type = 'brand';
    MOCK_BRANDS.push(brand);
    brandBySlug[brand.slug] = brand;
});
STOCKX_EXPANDED_PRODUCTS.forEach(item => {
    if (!item || !item.id || !item.name || !item.sku || !item.imageUrl) return;
    if (MOCK_PRODUCTS.some(p => p.id === item.id)) return;
    const p = makeProduct(
        item.name,
        item.brandSlug || (item.brand === 'Jordan' ? 'jordan' : 'nike'),
        item.categorySlug || 'sneakers',
        item.aliases || [],
        item.keywords || ['stockx', 'sneakers'],
        item.description || (item.name + ' sourced from StockX product data.'),
        item.imageUrl,
        item.sku
    );
    p.id = item.id;
    p.code = 'PRD-' + String(p.id).padStart(6, '0');
    p.stockxUrl = item.stockxUrl;
    p.skuSource = item.skuSource;
    p.featured = true;
    p.trendingScore = item.trendingScore !== undefined ? item.trendingScore : 100;
    MOCK_PRODUCTS.push(p);
});
const PRODUCT_IMAGE_HIDDEN_IDS = new Set(window.ProductImageHiddenProductIds || []);
const PRODUCT_IMAGE_REQUIRE_STOCKX_BRANDS = new Set(window.ProductImageRequireStockxBrands || []);
const PRODUCT_IMAGE_SEEN_URLS = new Set();
const PRODUCT_IMAGE_SEEN_SKUS = new Set();
const PRODUCT_IMAGE_VISIBLE_PRODUCTS = [];
MOCK_PRODUCTS.forEach(p => {
    if (PRODUCT_IMAGE_HIDDEN_IDS.has(p.id)) return;
    const imageUrlById = window.ProductImagesById && window.ProductImagesById[p.id];
    const imageUrlBySku = p.sku && window.ProductImages && window.ProductImages[p.sku];
    const directImageUrl = p.image || '';
    const imageUrl = imageUrlById || imageUrlBySku || directImageUrl;
    const isGenericImage = !imageUrl || /placeholder|placeholders|product-placeholder|stockx-assets|unsplash|picsum|dummy|via\.placeholder/i.test(imageUrl);
    if (isGenericImage) return;
    if (imageUrlById || imageUrlBySku) p.image = imageUrl;
    if (PRODUCT_IMAGE_REQUIRE_STOCKX_BRANDS.has(p.brand) && !imageUrlById) return;
    if (PRODUCT_IMAGE_REQUIRE_STOCKX_BRANDS.has(p.brand) && !p.sku) return;
    if (PRODUCT_IMAGE_REQUIRE_STOCKX_BRANDS.has(p.brand) && p.sku) {
        const skuKey = String(p.sku || '').toLowerCase();
        if (PRODUCT_IMAGE_SEEN_SKUS.has(skuKey)) return;
        PRODUCT_IMAGE_SEEN_SKUS.add(skuKey);
    }
    if (imageUrl) {
        if (PRODUCT_IMAGE_SEEN_URLS.has(imageUrl)) return;
        PRODUCT_IMAGE_SEEN_URLS.add(imageUrl);
    }
    PRODUCT_IMAGE_VISIBLE_PRODUCTS.push(p);
});
MOCK_PRODUCTS.splice(0, MOCK_PRODUCTS.length, ...PRODUCT_IMAGE_VISIBLE_PRODUCTS);
const PRODUCT_NAME_SEEN_KEYS = new Set();
const PRODUCT_NAME_VISIBLE_PRODUCTS = [];
MOCK_PRODUCTS.forEach(p => {
    const nameKey = [p.brand || '', p.name || ''].join('|').toLowerCase();
    if (PRODUCT_NAME_SEEN_KEYS.has(nameKey)) return;
    PRODUCT_NAME_SEEN_KEYS.add(nameKey);
    PRODUCT_NAME_VISIBLE_PRODUCTS.push(p);
});
MOCK_PRODUCTS.splice(0, MOCK_PRODUCTS.length, ...PRODUCT_NAME_VISIBLE_PRODUCTS);

// -- SUGGESTIONS -- (56 curated entries, every query maps to real catalogue products)
const MOCK_SUGGESTIONS = [
    // SNEAKERS
    { id:  1, text: 'Air Jordan 1 High OG',       query: 'Air Jordan 1 Retro High OG',    aliases: ['jordan 1','aj1 high'],           keywords: ['sneakers','jordan'] },
    { id:  2, text: 'Travis Scott Jordan 1',       query: 'Travis Scott x Air Jordan 1',   aliases: ['ts aj1','travis scott jordan'],   keywords: ['sneakers','collab'] },
    { id:  3, text: 'Nike Dunk Low',               query: 'Nike Dunk Low Retro',            aliases: ['dunk low','panda dunks'],         keywords: ['sneakers','nike'] },
    { id:  4, text: 'Nike Air Force 1',            query: 'Nike Air Force 1 Low',           aliases: ['af1','air force one'],            keywords: ['sneakers','classic'] },
    { id:  5, text: 'Yeezy Boost 350 V2',          query: 'adidas Yeezy Boost 350 V2',      aliases: ['yeezy 350','350 v2'],             keywords: ['sneakers','kanye'] },
    { id:  6, text: 'adidas Samba OG',             query: 'adidas Samba OG',                aliases: ['sambas','samba og'],              keywords: ['sneakers','terrace'] },
    { id:  7, text: 'New Balance 550',             query: 'New Balance 550',                aliases: ['nb550','nb 550'],                 keywords: ['sneakers','retro'] },
    { id:  8, text: 'Salomon XT-6',               query: 'Salomon XT-6',                   aliases: ['salomon xt6','gorpcore'],         keywords: ['sneakers','trail'] },
    { id:  9, text: 'ASICS Gel-Kayano 14',        query: 'ASICS Gel-Kayano 14',            aliases: ['kayano 14','asics kayano'],       keywords: ['sneakers','runner'] },
    { id: 10, text: 'Nike Air Max 90',             query: 'Nike Air Max 90',                aliases: ['am90','air max 90'],              keywords: ['sneakers','classic'] },
    { id: 11, text: 'Off-White Jordan 1',          query: 'Off-White x Air Jordan 1',       aliases: ['ow jordan 1','virgil jordan'],    keywords: ['sneakers','collab'] },
    { id: 12, text: 'Jordan 4 Military Blue',      query: 'Air Jordan 4 Military Blue',     aliases: ['jordan 4 military','aj4 blue'],   keywords: ['sneakers','jordan'] },
    { id: 13, text: 'Balenciaga Triple S',         query: 'Balenciaga Triple S Sneaker',    aliases: ['triple s bal'],                  keywords: ['sneakers','luxury'] },
    { id: 14, text: 'Dior B22 Sneaker',            query: 'Dior B22 Sneaker',               aliases: ['dior b22','dior runner'],         keywords: ['sneakers','luxury'] },
    // WATCHES
    { id: 15, text: 'Rolex Submariner',            query: 'Rolex Submariner Date',          aliases: ['rolex sub','submariner'],         keywords: ['watches','luxury'] },
    { id: 16, text: 'Rolex Daytona Panda',         query: 'Rolex Cosmograph Daytona',       aliases: ['rolex daytona','panda daytona'],  keywords: ['watches','chronograph'] },
    { id: 17, text: 'Rolex GMT-Master Pepsi',      query: 'Rolex GMT-Master II',            aliases: ['rolex pepsi','gmt pepsi'],        keywords: ['watches','travel'] },
    { id: 18, text: 'Patek Philippe Nautilus',     query: 'Patek Philippe Nautilus',        aliases: ['patek nautilus','5711'],          keywords: ['watches','grail'] },
    { id: 19, text: 'Audemars Piguet Royal Oak',   query: 'Audemars Piguet Royal Oak',      aliases: ['ap royal oak','royal oak'],       keywords: ['watches','sports'] },
    { id: 20, text: 'Omega Speedmaster',           query: 'Omega Speedmaster Moonwatch',    aliases: ['moonwatch','speedmaster'],        keywords: ['watches','nasa'] },
    { id: 21, text: 'Cartier Santos Watch',        query: 'Cartier Santos',                 aliases: ['santos cartier'],                 keywords: ['watches','dress'] },
    // ELECTRONICS
    { id: 22, text: 'PlayStation 5',               query: 'Sony PlayStation 5',             aliases: ['ps5','playstation 5'],            keywords: ['gaming','console'] },
    { id: 23, text: 'Apple AirPods Max',           query: 'Apple AirPods Max',              aliases: ['airpods max'],                    keywords: ['audio','apple'] },
    { id: 24, text: 'iPhone 15 Pro',               query: 'Apple iPhone 15 Pro',            aliases: ['iphone 15 pro','iphone15'],       keywords: ['smartphone','apple'] },
    { id: 25, text: 'Apple Vision Pro',            query: 'Apple Vision Pro',               aliases: ['vision pro','apple vr'],          keywords: ['spatial','apple'] },
    { id: 26, text: 'Samsung Galaxy S24 Ultra',    query: 'Samsung Galaxy S24 Ultra',       aliases: ['s24 ultra','galaxy s24'],         keywords: ['smartphone','samsung'] },
    { id: 27, text: 'Xbox Series X',               query: 'Xbox Series X Console',          aliases: ['xbox series x'],                  keywords: ['gaming','console'] },
    { id: 28, text: 'Dyson Airwrap Styler',        query: 'Dyson Airwrap Multi-styler',     aliases: ['dyson airwrap'],                  keywords: ['hair','dyson'] },
    { id: 29, text: 'Sony WH-1000XM5',             query: 'Sony WH-1000XM5 Headphones',     aliases: ['xm5','sony xm5'],                keywords: ['audio','headphones'] },
    // STREETWEAR
    { id: 30, text: 'Supreme Box Logo Hoodie',     query: 'Supreme Box Logo Hoodie',        aliases: ['bogo hoodie','supreme bogo'],     keywords: ['streetwear','hoodie'] },
    { id: 31, text: 'Fear of God Essentials',      query: 'Fear of God Essentials Hoodie',  aliases: ['essentials hoodie','fog hoodie'], keywords: ['streetwear','basics'] },
    { id: 32, text: 'Stone Island Jacket',         query: 'Stone Island Crinkle Reps NY',   aliases: ['stone island puffer'],           keywords: ['streetwear','jacket'] },
    { id: 33, text: 'Moncler Maya Puffer',         query: 'Moncler Maya Short Down Jacket', aliases: ['moncler maya'],                   keywords: ['luxury','outerwear'] },
    { id: 34, text: 'BAPE Shark Hoodie',           query: 'BAPE Shark Full Zip Hoodie',     aliases: ['bape shark hoodie'],              keywords: ['streetwear','bape'] },
    { id: 35, text: 'Canada Goose Expedition Parka', query: 'Canada Goose Expedition Parka', aliases: ['canada goose parka'],           keywords: ['outerwear','winter'] },
    // HANDBAGS
    { id: 36, text: 'Hermes Birkin Bag',           query: 'Hermes Birkin',                  aliases: ['birkin','hermes birkin'],         keywords: ['bags','luxury'] },
    { id: 37, text: 'Louis Vuitton Neverfull',     query: 'Louis Vuitton Neverfull MM',     aliases: ['lv neverfull','neverfull mm'],    keywords: ['bags','lv'] },
    { id: 38, text: 'Chanel Classic Flap',         query: 'Chanel Classic Flap Bag',        aliases: ['chanel flap','cc bag'],           keywords: ['bags','chanel'] },
    { id: 39, text: 'Gucci Marmont Bag',           query: 'Gucci GG Marmont',               aliases: ['gucci marmont','gg marmont'],     keywords: ['bags','gucci'] },
    { id: 40, text: 'Cartier Love Bracelet',       query: 'Cartier Love Bracelet',          aliases: ['cartier love','love bracelet'],   keywords: ['jewellery','gold'] },
    { id: 41, text: 'Van Cleef Alhambra Necklace', query: 'Van Cleef Arpels Alhambra',      aliases: ['van cleef alhambra'],             keywords: ['jewellery','clover'] },
    // FRAGRANCE
    { id: 42, text: 'Baccarat Rouge 540',          query: 'Baccarat Rouge 540',             aliases: ['br540','baccarat rouge'],         keywords: ['fragrance','mfk'] },
    { id: 43, text: 'Creed Aventus',               query: 'Creed Aventus',                  aliases: ['aventus creed'],                  keywords: ['fragrance','masculine'] },
    { id: 44, text: 'Chanel No.5',                 query: 'Chanel No.5 EDP',               aliases: ['chanel no 5','no5'],              keywords: ['fragrance','iconic'] },
    { id: 45, text: 'Tom Ford Black Orchid',       query: 'Tom Ford Black Orchid',          aliases: ['black orchid tom ford'],          keywords: ['fragrance','luxury'] },
    { id: 46, text: 'Dior Sauvage',               query: 'Dior Sauvage EDP',              aliases: ['sauvage dior'],                   keywords: ['fragrance','masculine'] },
    { id: 47, text: 'Byredo Gypsy Water',          query: 'Byredo Gypsy Water',             aliases: ['gypsy water byredo'],             keywords: ['fragrance','byredo'] },
    { id: 48, text: 'La Mer Face Cream',           query: 'La Mer Creme de la Mer',         aliases: ['creme de la mer','la mer cream'], keywords: ['skincare','luxury'] },
    { id: 49, text: 'Dyson Supersonic Dryer',      query: 'Dyson Supersonic Hair Dryer',    aliases: ['dyson supersonic','dyson dryer'], keywords: ['hair','beauty'] },
    // COLLECTIBLES
    { id: 50, text: 'Pokemon Evolving Skies Box',  query: 'Pokemon TCG Evolving Skies',    aliases: ['evolving skies box'],             keywords: ['trading cards','pokemon'] },
    { id: 51, text: 'Panini Prizm Basketball Box', query: 'Panini Prizm Basketball',        aliases: ['prizm basketball','prizm box'],   keywords: ['trading cards','nba'] },
    { id: 52, text: 'KAWS Companion Figure',       query: 'KAWS Companion',                 aliases: ['kaws figure','kaws companion'],   keywords: ['collectibles','art toy'] },
    { id: 53, text: 'LEGO Technic Bugatti',        query: 'LEGO Technic Bugatti',           aliases: ['lego bugatti','technic car'],     keywords: ['collectibles','lego'] },
    { id: 54, text: 'Funko Pop Spider-Man',        query: 'Funko Pop Spider-Man',           aliases: ['spiderman funko'],                keywords: ['collectibles','funko'] },
    { id: 55, text: 'Wembanyama Rookie Card',      query: 'Panini Prizm Victor Wembanyama', aliases: ['wembanyama rookie','wemby'],      keywords: ['trading cards','rookie'] },
    { id: 56, text: 'MacBook Pro M3',              query: 'Apple MacBook Pro 14-inch M3',   aliases: ['macbook pro m3','m3 laptop'],     keywords: ['electronics','apple'] },
];

// Boost visibility for products with verified real product photos
const REAL_IMAGE_SKUS = new Set(Object.keys(window.ProductImages || {}));
MOCK_PRODUCTS.forEach(p => {
    if ((window.ProductImagesById && window.ProductImagesById[p.id]) || (p.sku && REAL_IMAGE_SKUS.has(p.sku))) {
        p.featured = true;
    }
});

const MOCK_TRENDING_PRODUCTS = MOCK_PRODUCTS
    .filter(p => p.trendingScore >= 95)
    .sort((a,b) => b.trendingScore - a.trendingScore)
    .slice(0, 12);

const MOCK_POPULAR_BRANDS = MOCK_BRANDS.filter(b =>
    ['Nike','Jordan','Rolex','Supreme','Apple','Dyson','Yeezy','Pokémon'].includes(b.name)
);

// ── EXPORT ──────────────────────────────────────────────────â”€
window.SearchCatalog = {
    products:      MOCK_PRODUCTS,
    brands:        MOCK_BRANDS,
    categories:    MOCK_CATEGORIES,
    suggestions:   MOCK_SUGGESTIONS,
    trending:      MOCK_TRENDING_PRODUCTS,
    popularBrands: MOCK_POPULAR_BRANDS
};

// ── DEV VALIDATION ────────────────────────────────────────â”€
// Open browser console to see live count on page load
console.log(`[Cargoo] Catalogue loaded: ${MOCK_PRODUCTS.length} products across ${MOCK_BRANDS.length} brands and ${MOCK_CATEGORIES.length} categories`);
if (MOCK_PRODUCTS.length < 1500) console.warn('[Cargoo] WARNING: Product count below expected threshold');

// Validate no orphan brandId=1 (Nike fallback) for non-Nike products
const orphans = MOCK_PRODUCTS.filter(p => p.brandId === 1 && !['Nike'].includes(p.brand));
if (orphans.length > 0) console.warn('[Cargoo] Brand mapping orphans:', orphans.map(p=>p.name));

