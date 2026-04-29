/**
 * ProductMeta — deterministic synthetic metadata for the catalog.
 * Catalog data lacks price / eta / rating fields; we derive them from
 * the product code so numbers are stable across renders and between pages.
 */
(function () {
    const CAT_PRICE = {
        'Sneakers':        [85,  320],
        'Apparel':         [35,  220],
        'Accessories':     [25,  180],
        'Handbags':        [120, 650],
        'Watches':         [180, 1800],
        'Electronics':     [45,  620],
        'Collectibles':    [40,  480],
        'Trading Cards':   [15,  220],
        'Health & Beauty': [20,  110],
        'Fragrance':       [35,  190],
        'Home Appliances': [60,  450],
        'Jewellery':       [90,  850],
        'Gaming':          [35,  520],
        'Sports':          [30,  260],
        'Sunglasses':      [55,  320]
    };

    const ETA_BY_CAT = {
        'Electronics':  '2 weeks',
        'Gaming':       '2 weeks',
        'Home Appliances': '3 weeks',
        'Watches':      '3 weeks',
        'Handbags':     '3 weeks',
        'Jewellery':    '3 weeks'
    };
    const DEFAULT_ETA = '3 weeks';

    function hashCode(code) {
        let h = 0;
        const s = String(code || 'X');
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
        return Math.abs(h);
    }

    function get(product) {
        if (!product) return { price: 99, eta: DEFAULT_ETA, rating: 4.7, reviews: 12, isNew: false };
        const h = hashCode(product.code);
        const range = CAT_PRICE[product.category] || [30, 220];
        const span = range[1] - range[0];
        const price = Math.round((range[0] + (h % span)) / 5) * 5; // rounded to €5
        const eta = ETA_BY_CAT[product.category] || DEFAULT_ETA;
        const rating = (4.4 + ((h % 6) / 10)).toFixed(1); // 4.4 – 4.9
        const reviews = 12 + (h % 280);
        const isNew = !product.featured && (h % 11 === 0);
        return { price, eta, rating, reviews, isNew };
    }

    window.ProductMeta = { get };
})();
