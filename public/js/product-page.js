document.addEventListener('DOMContentLoaded', () => {
    // Only run on product page
    const container = document.getElementById('productPageContainer');
    if (!container) return;

    // Extract ID from URL: ?id=1501
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        render404("No product specified.");
        // Attempt to extract slug
        const slug = params.get('slug');
        if (slug) {
             const fallbackProd = window.SearchCatalog.products.find(p => p.slug === slug);
             if (fallbackProd) window.location.href = `product.html?id=${fallbackProd.id}`;
        }
        return;
    }

    // Attempt to lookup product
    if (!window.SearchAPI || typeof window.SearchAPI.getProductById !== 'function') {
        render404("Search API has not fully initialized. Please refresh.");
        return;
    }

    const product = window.SearchAPI.getProductById(id);
    if (!product) {
        render404(`Product ID "${id}" was not found in our catalog.`);
        return;
    }

    // Track standard Analytics hook
    console.log(`[Analytics] product_page_view: ${product.name} [ID: ${product.code}]`);

    // Lookup related products
    const relatedProducts = window.SearchAPI.getRelatedProducts(product, 4);

    // Build Page Layout Structure
    renderProductPage(product, relatedProducts);

    // Update Meta Title dynamically
    document.title = `${product.name} | ${product.brand} - Cargoo Marketplace`;
});

function render404(msg) {
    const container = document.getElementById('productPageContainer');
    container.innerHTML = `
        <div class="container text-center" style="padding: 15vh 0;">
            <i class="fa-solid fa-triangle-exclamation fa-4x text-muted" style="margin-bottom: 1.5rem; display: block;"></i>
            <h1 class="fade-up" style="font-size: 3rem; margin-bottom: 1rem;">Product Not Found</h1>
            <p class="fade-up delay-1 text-muted" style="font-size: 1.2rem; margin-bottom: 2rem;">${msg}</p>
            <a href="index.html" class="btn btn-primary fade-up delay-2">Return Home</a>
        </div>
    `;
}

function renderProductPage(product, relatedProducts) {
    const container = document.getElementById('productPageContainer');
    const meta = (window.ProductMeta && window.ProductMeta.get(product)) || { price: 99, eta: '3 weeks', rating: 4.7, reviews: 42, isNew: false };

    const starsHtml = renderStars(meta.rating);

    const waMsg = encodeURIComponent(`Hi Cargoo, I'd like a quote for ${product.name} (${product.code}).`);

    let html = `
        <!-- BREADCRUMBS -->
        <div class="container" style="padding: 7rem 0 0 0;">
            <nav class="pdp-breadcrumb" aria-label="Breadcrumb" style="font-size: 0.85rem; font-weight: 600; color: var(--clr-text-muted); display:flex; align-items:center; gap: 0.5rem; flex-wrap:wrap;">
                <a href="index.html"><i class="fa-solid fa-house"></i> Home</a>
                <i class="fa-solid fa-chevron-right" style="font-size:0.6rem; opacity:0.5;"></i>
                <a href="category.html?slug=${product.categorySlug}">${product.category}</a>
                <i class="fa-solid fa-chevron-right" style="font-size:0.6rem; opacity:0.5;"></i>
                <a href="brand.html?slug=${product.brandSlug}">${product.brand}</a>
                <i class="fa-solid fa-chevron-right" style="font-size:0.6rem; opacity:0.5;"></i>
                <span style="color: #fff;">${product.name}</span>
            </nav>
        </div>

        <!-- PRODUCT DETAILS -->
        <section class="pdp-wrap">
            <div class="container">
                <div class="pdp-grid">
                    <div class="pdp-image">
                        ${product.featured ? `<div class="pc-badge">Trending</div>` : (meta.isNew ? `<div class="pc-badge badge-new">New</div>` : '')}
                        ${window.ImageAdapter.renderImage(product, 'detail')}
                    </div>

                    <div class="pdp-info">
                        <a href="brand.html?slug=${product.brandSlug}" class="pdp-brand-chip"><i class="fa-solid fa-tag"></i> ${product.brand}</a>
                        <h1 class="pdp-title">${product.name}</h1>

                        <div class="pdp-rating">
                            <span class="stars" aria-label="${meta.rating} out of 5">${starsHtml}</span>
                            <strong style="color:#fff;">${meta.rating}</strong>
                            <span>· ${meta.reviews} verified orders</span>
                        </div>

                        <div class="pdp-pricebox">
                            <div class="pdp-eta">
                                <strong>~ ${meta.eta}</strong>
                                to your door
                            </div>
                        </div>

                        <p class="pdp-description">${product.description || 'Factory-verified and sourced directly for import via Cargoo. Get a precise quote on WhatsApp in under 24 hours.'}</p>

                        <ul class="pdp-benefits">
                            <li><i class="fa-solid fa-microscope"></i> <span><strong style="color:#fff;">Photo QC before shipping</strong> — we send inspection photos of the exact unit you'll receive.</span></li>
                            <li><i class="fa-solid fa-shield-halved"></i> <span><strong style="color:#fff;">Escrow protected</strong> — your money is released only after you approve the QC report.</span></li>
                            <li><i class="fa-solid fa-file-circle-check"></i> <span><strong style="color:#fff;">EU customs cleared</strong> — all duties and VAT included in the quote, no bills at the door.</span></li>
                            <li><i class="fa-solid fa-rotate-left"></i> <span><strong style="color:#fff;">14-day reship or refund</strong> — if it arrives wrong, we fix it on our dime.</span></li>
                        </ul>

                        <div class="pdp-cta-row">
                            <button class="btn btn-primary btn-block btn-glow" onclick="window.addToEstimate(${product.id}, 'product', this); console.log('[Analytics] pdp_add_to_quote: ${product.code}');">
                                <i class="fa-solid fa-plus"></i> Add to Quote Cart
                            </button>
                            <a href="https://wa.me/48500685000?text=${waMsg}" target="_blank" rel="noopener" class="btn btn-secondary btn-block">
                                <i class="fa-brands fa-whatsapp"></i> Get quote on WhatsApp
                            </a>
                        </div>

                        <div class="pdp-trust-row">
                            <span><i class="fa-solid fa-lock"></i> Escrow protected</span>
                            <span><i class="fa-solid fa-truck-fast"></i> EU customs included</span>
                            <span><i class="fa-solid fa-comments"></i> 24h quote response</span>
                        </div>

                        ${product.keywords && product.keywords.length > 0 ? `
                        <div class="pdp-tags">
                            ${product.keywords.map(kw => `<span class="pdp-tag">${kw}</span>`).join('')}
                        </div>` : ''}

                        <div style="font-family: monospace; font-size: 0.75rem; margin-top: 1.5rem; color: #666;">
                            SKU: ${product.sku || product.code}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

    if (relatedProducts.length > 0) {
        html += `
        <section class="related-products" style="padding: 4rem 0; background: var(--clr-bg-surface); border-top: 1px solid var(--clr-border);">
            <div class="container">
                <div style="margin-bottom: 2rem;">
                    <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">More like this</h2>
                    <p style="color:var(--clr-text-muted);">Other popular items from ${product.brand} and ${product.category}.</p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem;">
                    ${relatedProducts.map(p => {
                        const m = (window.ProductMeta && window.ProductMeta.get(p)) || { price: 99, eta: '3 weeks', isNew: false };
                        return `
                        <div class="product-card-v2" onclick="window.location.href='product.html?id=${p.id}'">
                            ${p.featured ? `<div class="pc-badge">Trending</div>` : (m.isNew ? `<div class="pc-badge badge-new">New</div>` : '')}
                            <div class="pc-img">${window.ImageAdapter.renderImage(p, 'thumbnail')}</div>
                            <div class="pc-body">
                                <div class="pc-cat">${p.brand}</div>
                                <h3 class="pc-name">${p.name}</h3>
                                <div class="pc-meta">
                                    <span class="pc-eta"><i class="fa-solid fa-truck-fast"></i> ${m.eta}</span>
                                </div>
                            </div>
                            <button class="pc-cta" onclick="event.stopPropagation(); window.addToEstimate(${p.id}, 'product', this); console.log('[Analytics] related_product_click: ${p.code}');">
                                <i class="fa-solid fa-plus"></i> Add to quote
                            </button>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </section>`;
    }

    container.innerHTML = html;
}

function renderStars(rating) {
    const r = parseFloat(rating) || 0;
    const full = Math.floor(r);
    const half = (r - full) >= 0.5;
    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
    if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="fa-regular fa-star"></i>';
    return html;
}

