document.addEventListener('DOMContentLoaded', () => {
    // Only run on brand page
    const container = document.getElementById('brandPageContainer');
    if (!container) return;

    // Extract slug from URL: ?slug=nike
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        render404("No brand specified over URL parameters.");
        return;
    }

    // Attempt to lookup brand
    if (!window.SearchAPI || typeof window.SearchAPI.getBrandBySlug !== 'function') {
        render404("Search API has not fully initialized. Please refresh.");
        return;
    }

    const brand = window.SearchAPI.getBrandBySlug(slug);
    if (!brand) {
        render404(`Brand "${slug}" was not found in our catalog.`);
        return;
    }

    // Lookup products assigned to this brand via normalized brandId
    const products = window.SearchAPI.getProductsByBrandId(brand.id);
    products.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));

    // Track standard Analytics hook
    console.log(`[Analytics] brand_page_view: ${brand.name} [ID: ${brand.code}]`);

    // Build Page Layout Structure
    renderBrandPage(brand, products);

    // Update Meta Title dynamically
    document.title = `${brand.name} - Cargoo Marketplace`;
});

function render404(msg) {
    const container = document.getElementById('brandPageContainer');
    container.innerHTML = `
        <div class="container text-center" style="padding: 15vh 0;">
            <i class="fa-solid fa-triangle-exclamation fa-4x text-muted" style="margin-bottom: 1.5rem; display: block;"></i>
            <h1 class="fade-up" style="font-size: 3rem; margin-bottom: 1rem;">Brand Not Found</h1>
            <p class="fade-up delay-1 text-muted" style="font-size: 1.2rem; margin-bottom: 2rem;">${msg}</p>
            <a href="index.html" class="btn btn-primary fade-up delay-2">Return Home</a>
        </div>
    `;
}

function renderBrandPage(brand, products) {
    const container = document.getElementById('brandPageContainer');
    
    // Header logic: Extract background overlay colors or fallback to default
    const productCountStr = products.length === 1 ? '1 Product' : `${products.length} Products`;

    let html = `
        <!-- BRAND HERO -->
        <section class="brand-hero" style="padding: 4rem 0 2rem 0; background: var(--clr-bg-surface); border-bottom: 1px solid var(--clr-border);">
            <div class="container" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.5rem;">
                ${brand.logo ? `<img src="${brand.logo}" alt="${brand.name}" style="height: 100px; width: 100px; object-fit: contain; border-radius:1rem; border: 1px solid var(--clr-border); background: #ffffff;">` : `<div style="height: 100px; width: 100px; display:flex; align-items:center; justify-content:center; background: var(--clr-bg-surface-elevated); border-radius:1rem; border: 1px solid var(--clr-border);"><i class="fa-solid fa-tag fa-2x"></i></div>`}
                
                <div>
                    <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; letter-spacing: -1px; margin-bottom: 0.5rem; line-height: 1;">${brand.name}</h1>
                    <p style="color: var(--clr-text-muted); font-size: 1.2rem; margin-bottom: 1rem;">Browse the official ${brand.name} collection shipped directly by Cargoo.</p>
                    <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid var(--clr-border); padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.9rem; font-weight: 600; color: var(--clr-orange);">
                        <i class="fa-solid fa-box"></i> ${productCountStr} available
                    </div>
                </div>
            </div>
        </section>

        <!-- BRAND PRODUCT GRID -->
        <section class="brand-products" style="padding: 4rem 0;">
            <div class="container">
    `;

    if (products.length === 0) {
        html += `
            <div class="empty-state text-center" style="padding: 4rem; background: var(--clr-bg-surface); border: 1px dashed var(--clr-border); border-radius: 1rem;">
                <h3 style="color: var(--clr-text-muted);"><i class="fa-solid fa-ghost" style="margin-right: 0.5rem;"></i> No products available for ${brand.name} right now.</h3>
            </div>
        `;
    } else {
        html += `<div class="grid-layout" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">`;
        
        products.forEach(p => {
            html += `
                <div class="product-card glass-panel" style="padding: 1rem; display: flex; flex-direction: column; height: 100%; position: relative; transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; border: 1px solid var(--clr-border);" onclick="window.location.href='product.html?id=${p.id}'" onmouseenter="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--clr-orange)'" onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='var(--clr-border)'">
                    
                    ${p.featured ? `<div style="position:absolute; top: 1.5rem; left: 1.5rem; background: var(--clr-orange); color: #fff; font-size: 0.75rem; font-weight: 800; padding: 0.25rem 0.75rem; border-radius: 1rem; z-index: 2; text-transform: uppercase;">Trending</div>` : ''}
                    
                    <div class="product-img-wrap" style="aspect-ratio: 1; background: #ffffff; border-radius: 0.5rem; overflow: hidden; margin-bottom: 1.25rem; display:flex; align-items:center; justify-content:center;">
                        ${window.ImageAdapter.renderImage(p, 'thumbnail')}
                    </div>
                    
                    <div style="flex-grow: 1;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: var(--clr-text-muted); text-transform: uppercase; margin-bottom: 0.25rem; letter-spacing: 1px;">
                            <a href="category.html?slug=${p.categorySlug}" style="color:inherit; text-decoration:none;" onmouseover="this.style.color='var(--clr-orange)'" onmouseout="this.style.color='inherit'">${p.category}</a>
                        </div>
                        <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; line-height: 1.3;">
                            ${p.name}
                        </h3>
                        <div style="font-family: monospace; font-size: 0.8rem; background: rgba(255,255,255,0.1); display: inline-block; padding: 0.2rem 0.5rem; border-radius: 0.25rem; color: #888; margin-bottom: 1.5rem;">
                            ${p.code}
                        </div>
                    </div>

                    <button class="btn btn-primary btn-block" style="margin-top: auto; padding: 0.75rem;" onclick="event.stopPropagation(); window.addToEstimate(${p.id}, 'product', this); console.log('[Analytics] brand_product_click: ${p.code}');">
                        Send us an estimate
                    </button>
                </div>
            `;
        });
        
        html += `</div>`;
    }

    html += `
            </div>
        </section>
    `;

    container.innerHTML = html;
}

