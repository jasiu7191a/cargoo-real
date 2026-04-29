document.addEventListener('DOMContentLoaded', () => {
    // Only run on search results page
    const container = document.getElementById('searchPageContainer');
    if (!container) return;

    // Extract query from URL: ?q=jordan
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (!query || query.trim() === '') {
        renderNoQuery();
        return;
    }

    // Initialize search
    if (!window.SearchAPI || typeof window.SearchAPI.query !== 'function') {
        renderError("Search system is initializing. Please wait a moment and refresh.");
        return;
    }

    performPageSearch(query);
});

async function performPageSearch(query) {
    const container = document.getElementById('searchPageContainer');
    const term = query.trim();

    // Tracking
    console.log(`[Analytics] search_page_view: ${term}`);

    // Update document title
    document.title = `Results for "${term}" | Cargoo`;

    // Fetch results using the API
    const results = await window.SearchAPI.query(term);
    
    renderResultsPage(term, results);
}

function renderNoQuery() {
    const container = document.getElementById('searchPageContainer');
    container.innerHTML = `
        <div class="container text-center" style="padding: 15vh 0;">
            <i class="fa-solid fa-magnifying-glass fa-4x text-muted" style="margin-bottom: 1.5rem; display: block;"></i>
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Looking for something?</h1>
            <p class="text-muted" style="font-size: 1.2rem; margin-bottom: 2rem;">Please enter a search term in the search bar above to explore our catalogue.</p>
            <a href="index.html" class="btn btn-primary">Return Home</a>
        </div>
    `;
}

function renderError(msg) {
    const container = document.getElementById('searchPageContainer');
    container.innerHTML = `
        <div class="container text-center" style="padding: 15vh 0;">
            <i class="fa-solid fa-circle-exclamation fa-4x" style="color: var(--clr-orange); margin-bottom: 1.5rem; display: block;"></i>
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Oops!</h1>
            <p class="text-muted" style="font-size: 1.2rem; margin-bottom: 2rem;">${msg}</p>
            <a href="search.html?q=${new URLSearchParams(window.location.search).get('q')}" class="btn btn-primary">Try Again</a>
        </div>
    `;
}

function renderResultsPage(query, results) {
    const container = document.getElementById('searchPageContainer');
    const productCount = (results.products || []).length;
    const resultsForText = `Results for "${query}"`;
    const resultsCountText = `${productCount} results found`;
    const backToHomeText = 'Back to Home';
    const heroTitle = 'Premium Discovery';
    const heroSubtitle = 'Explore verified premium products available for delivery to your doorstep.';

    let html = `
        <!-- SEARCH HERO -->
        <section class="search-hero" style="padding: 4rem 0 2rem 0; background: var(--clr-bg-surface); border-bottom: 1px solid var(--clr-border);">
            <div class="container">
                <div style="margin-bottom: 2rem;">
                    <a href="index.html" style="color: var(--clr-orange); text-decoration: none; font-size: 0.9rem; font-weight: 600;">
                        <i class="fa-solid fa-arrow-left"></i> ${backToHomeText}
                    </a>
                </div>
                <h1 style="font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; margin-bottom: 0.5rem;">${resultsForText}</h1>
                <p style="color: var(--clr-text-muted); font-size: 1.1rem;">${heroSubtitle}</p>
                <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.05); border: 1px solid var(--clr-border); padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.9rem; font-weight: 600; color: var(--clr-orange); margin-top: 1rem;">
                    <i class="fa-solid fa-box"></i> ${resultsCountText}
                </div>
            </div>
        </section>

        <!-- RESULTS SECTION -->
        <section class="search-body" style="padding: 4rem 0;">
            <div class="container">
    `;

    if (productCount === 0) {
        const noResultsTitle = "We couldn't find matches";
        const noResultsDesc = "Try adjusting your search terms or browse our popular departments below.";
        const searchAgainBtn = "Search Again";

        html += `
            <div class="empty-state text-center" style="padding: 5rem 2rem; background: rgba(255,255,255,0.02); border: 2px dashed var(--clr-border); border-radius: 2rem;">
                <div style="font-size: 4rem; color: var(--clr-text-muted); opacity: 0.3; margin-bottom: 1.5rem;">
                    <i class="fa-solid fa-magnifying-glass-chart"></i>
                </div>
                <h3 style="margin-bottom: 1rem;">${noResultsTitle}</h3>
                <p class="text-muted" style="margin-bottom: 2.5rem; max-width: 500px; margin-inline: auto;">
                    ${noResultsDesc}
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="window.location.href='index.html'" class="btn btn-outline">${backToHomeText}</button>
                    <button onclick="document.querySelector('.search-input').focus()" class="btn btn-primary">${searchAgainBtn}</button>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="grid-layout" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
        `;
        
        results.products.forEach(p => {
            html += `
                <div class="product-card glass-panel" 
                     style="padding: 1rem; display: flex; flex-direction: column; height: 100%; position: relative; transition: 0.3s; cursor: pointer; border: 1px solid var(--clr-border); border-radius: 1.5rem;" 
                     onclick="window.location.href='product.html?id=${p.id}'"
                     onmouseenter="this.style.transform='translateY(-8px)'; this.style.borderColor='var(--clr-orange)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.4)'" 
                     onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='var(--clr-border)'; this.style.boxShadow='none'">
                    
                    ${p.featured ? `<div style="position:absolute; top: 1.5rem; left: 1.5rem; background: var(--clr-orange); color: #fff; font-size: 0.7rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 2rem; z-index: 2; text-transform: uppercase; letter-spacing: 0.5px;">Trending</div>` : ''}
                    
                    <div class="product-img-wrap" style="aspect-ratio: 1; background: #ffffff; border-radius: 1rem; overflow: hidden; margin-bottom: 1.5rem; display:flex; align-items:center; justify-content:center; padding: 1.5rem;">
                        ${window.ImageAdapter.renderImage(p, 'thumbnail', 'search-page-img')}
                    </div>
                    
                    <div style="flex-grow: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.75rem; font-weight: 700; color: var(--clr-orange); text-transform: uppercase; letter-spacing: 1px;">${p.brand}</span>
                            <span style="width: 4px; height: 4px; background: var(--clr-text-muted); border-radius: 50%; opacity: 0.5;"></span>
                            <span style="font-size: 0.75rem; font-weight: 600; color: var(--clr-text-muted);">${p.category}</span>
                        </div>
                        <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 1rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3.1rem;">
                            ${p.name}
                        </h3>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="font-family: monospace; font-size: 0.75rem; color: var(--clr-text-muted); background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem; border-radius: 0.25rem;">
                            ${p.code}
                        </div>
                        <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.75rem; border-radius: 2rem;" onclick="event.stopPropagation(); window.addToEstimate(${p.id}, 'product', this);">
                            Select
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    }

    // Add Related Brands or Categories sidebar/bottom if needed
    if (results.brands && results.brands.length > 0) {
        html += `
            <div style="margin-top: 5rem;">
                <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 2rem;">Related Brands</h2>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${results.brands.map(b => `
                        <a href="brand.html?slug=${b.slug}" class="glass-panel" style="padding: 1rem 1.5rem; border-radius: 1rem; text-decoration: none; color: #fff; font-weight: 700; display: flex; align-items: center; gap: 1rem; border: 1px solid var(--clr-border); transition: 0.2s;" onmouseenter="this.style.borderColor='var(--clr-orange)'" onmouseleave="this.style.borderColor='var(--clr-border)'">
                            ${b.logo ? `<img src="${b.logo}" style="width: 30px; height: 30px; object-fit: contain;">` : `<i class="fa-solid fa-tag"></i>`}
                            ${b.name}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    html += `
            </div>
        </section>
    `;

    container.innerHTML = html;
}
