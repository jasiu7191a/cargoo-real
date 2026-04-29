/**
 * High-Performance Logic for the Products Page
 * Features: Infinite Scroll (Lazy Loading), Collapsible Filters, Real-time Filtering
 * Weekly Trending Rotation: Rankings rotate every Monday using a seeded PRNG.
 */

/**
 * =====================================================
 * WEEKLY SEED ENGINE
 * Uses ISO week number so rankings change every Monday.
 * Same week = same order for all visitors worldwide.
 * =====================================================
 */
function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(diff / oneWeek) + now.getFullYear() * 53;
}

/** Mulberry32 seeded PRNG — fast, high quality */
function makeSeededRandom(seed) {
    return function() {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/** Returns a seeded random float in [0,1) deterministically for a given product+week */
function weeklyRandForProduct(productId, weekSeed) {
    const combined = (Number(productId || 0) * 2654435761 ^ weekSeed * 1234567891) >>> 0;
    return makeSeededRandom(combined)();
}

const CURRENT_WEEK = getWeekNumber();
const WEEK_RAND = makeSeededRandom(CURRENT_WEEK * 999983);

// Pre-pick this week's featured family indices (which model families get the spotlight)
const WEEKLY_SPOTLIGHT_COUNT = 8; // How many families get the weekly boost
const WEEKLY_BOOST_MAX = 120;     // Max extra points a boosted product gets
// Which week of the year (for display)
const WEEK_OF_YEAR = getWeekNumber() % 52 || 52;

/**
 * =====================================================
 * LOCALE DETECTION
 * Detects current language from the URL path.
 * /cargoo-pl/ → pl, /cargoo-de/ → de, /cargoo-fr/ → fr, else → en
 * =====================================================
 */
function detectLocale() {
    const path = window.location.pathname;
    if (path.includes('/cargoo-pl/') || path.includes('\\cargoo-pl\\')) return 'pl';
    if (path.includes('/cargoo-de/') || path.includes('\\cargoo-de\\')) return 'de';
    if (path.includes('/cargoo-fr/') || path.includes('\\cargoo-fr\\')) return 'fr';
    return 'en';
}

const LOCALE = detectLocale();

/**
 * =====================================================
 * TRANSLATIONS
 * All user-visible strings for the weekly banner and badges.
 * =====================================================
 */
const TRANSLATIONS = {
    en: {
        weekLabel:        'Week',
        bannerTitle:      "This Week's Trending Picks",
        bannerSub:        'Rankings update every Monday',
        nextRotation:     'Next rotation:',
        autoUpdates:      'Auto-updates weekly',
        badgeThisWeek:    'This Week',
        badgeTrending:    'Trending',
        badgeNew:         'New',
        // Date locale for toLocaleDateString
        dateLocale:       'en-GB',
    },
    pl: {
        weekLabel:        'Tydzień',
        bannerTitle:      'Trendy tego tygodnia',
        bannerSub:        'Rankingi aktualizowane są w każdy poniedziałek',
        nextRotation:     'Następna zmiana:',
        autoUpdates:      'Aktualizowane co tydzień',
        badgeThisWeek:    'W tym tygodniu',
        badgeTrending:    'Popularny',
        badgeNew:         'Nowość',
        dateLocale:       'pl-PL',
    },
    de: {
        weekLabel:        'Woche',
        bannerTitle:      'Die Trends dieser Woche',
        bannerSub:        'Rankings werden jeden Montag aktualisiert',
        nextRotation:     'Nächste Aktualisierung:',
        autoUpdates:      'Wöchentlich aktualisiert',
        badgeThisWeek:    'Diese Woche',
        badgeTrending:    'Trending',
        badgeNew:         'Neu',
        dateLocale:       'de-DE',
    },
    fr: {
        weekLabel:        'Semaine',
        bannerTitle:      'Tendances de la semaine',
        bannerSub:        'Classements mis à jour chaque lundi',
        nextRotation:     'Prochaine mise à jour :',
        autoUpdates:      'Mis à jour chaque semaine',
        badgeThisWeek:    'Cette semaine',
        badgeTrending:    'Tendance',
        badgeNew:         'Nouveau',
        dateLocale:       'fr-FR',
    },
};

const T = TRANSLATIONS[LOCALE] || TRANSLATIONS.en;

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('productsGrid');
    const sidebarContainer = document.getElementById('productsSidebar');
    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    const sentinel = document.getElementById('scrollSentinel');
    const spinner = document.getElementById('loadMoreSpinner');
    
    if (!gridContainer || !sidebarContainer) return;

    // Filter & Pagination State
    const state = {
        selectedCategories: new Set(),
        selectedBrands: new Set(),
        collapsedGroups: new Set(), // Track which IDs are collapsed
        allProducts: window.SearchCatalog ? window.SearchCatalog.products : [],
        filteredProducts: [],
        visibleCount: 36, // Increased initial batch
        pageSize: 36      // Increased scroll batch for fewer triggers
    };

    /**
     * Initial Setup
     */
    /**
     * Extract a "base model family" key from a product name.
     * This groups colorways of the same shoe together for diversity control.
     */
    function getModelFamily(product) {
        const name = (product.name || '').toLowerCase();
        // Strip common suffixes: colorway names, gender, size info
        // Keep the core model identifier (first meaningful words)
        const familyPatterns = [
            /gel-kayano 14/,
            /gel-1130/,
            /gt-2160/,
            /gel-lyte/,
            /gel-nimbus/,
            /samba og/,
            /sambae/,
            /samba jane/,
            /samba /,
            /campus 00s/,
            /campus 00/,
            /gazelle indoor/,
            /gazelle bold/,
            /gazelle /,
            /salomon xt-6/,
            /salomon xt6/,
            /salomon acs/,
            /1906r/,
            /1906l/,
            /new balance 1906/,
            /new balance 9060/,
            /new balance 2002r/,
            /new balance 550/,
            /new balance 990/,
            /onitsuka tiger mexico 66/,
            /onitsuka tiger/,
            /dyson airwrap/,
            /dyson supersonic/,
            /dyson corrale/,
            /dyson /,
            /jordan 4 retro/,
            /air jordan 4/,
            /jordan 4/,
            /jordan 1 low/,
            /air jordan 1 low/,
            /jordan 1 high/,
            /air jordan 1 high/,
            /air jordan 1/,
            /jordan 3/,
            /jordan 11/,
            /jordan 12/,
            /jordan 6/,
            /dunk low/,
            /sb dunk low/,
            /dunk high/,
            /air force 1/,
            /air max 95/,
            /air max 90/,
            /air max 1/,
            /yeezy boost 350/,
            /yeezy 350/,
            /yeezy boost 700/,
            /yeezy 700/,
            /yeezy foam/,
            /yeezy slide/,
            /rolex daytona/,
            /rolex submariner/,
            /rolex gmt/,
            /rolex datejust/,
            /omega speedmaster/,
            /omega seamaster/,
            /patek nautilus/,
            /baccarat rouge/,
            /supreme box logo/,
            /bape shark/,
            /stone island/,
            /moncler maya/,
            /pokemon tcg/,
        ];
        for (const pat of familyPatterns) {
            if (pat.test(name)) return pat.source.replace(/\\\\/g, '');
        }
        // Fallback: brand + first 2 words of model
        const words = name.split(' ');
        return (product.brand || '') + '|' + words.slice(0, 3).join(' ');
    }

    /**
     * Diversity-aware sort: interleaves different product families.
     * Pass 1: best colorway of each family (rank order)
     * Pass 2: second-best colorway of each family
     * Pass 3: third-best colorway, etc.
     * Result: #1 Samba, #2 Gel-1130, #3 Samba 2nd colorway, #4 Gel-Kayano...
     */
    function diversitySort(products) {
        // First sort by raw trendingScore descending
        const sorted = [...products].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));

        const familyQueues = new Map(); // family key -> [product, product, ...]
        const familyOrder = []; // order families were first seen

        for (const p of sorted) {
            const fam = getModelFamily(p);
            if (!familyQueues.has(fam)) {
                familyQueues.set(fam, []);
                familyOrder.push(fam);
            }
            familyQueues.get(fam).push(p);
        }

        // Interleave: take one from each family in round-robin fashion
        const result = [];
        let maxDepth = 0;
        for (const q of familyQueues.values()) maxDepth = Math.max(maxDepth, q.length);

        for (let pass = 0; pass < maxDepth; pass++) {
            for (const fam of familyOrder) {
                const q = familyQueues.get(fam);
                if (q && pass < q.length) {
                    result.push(q[pass]);
                }
            }
        }

        return result;
    }

    /**
     * Apply weekly rotation boost.
     * Each week, a new set of product families gets a score boost,
     * pushing them higher in the trending rankings.
     * The picks are deterministic: same week = same boost for all visitors.
     */
    function applyWeeklyBoosts(products) {
        // 1. Collect all unique model families
        const familySet = [];
        const seenFamilies = new Set();
        for (const p of products) {
            const fam = getModelFamily(p);
            if (!seenFamilies.has(fam)) {
                seenFamilies.add(fam);
                familySet.push(fam);
            }
        }

        // 2. Use this week's seed to pick which families get spotlighted
        const shuffledFamilies = [...familySet];
        // Fisher-Yates with the week seed
        const weekRand = makeSeededRandom(CURRENT_WEEK * 314159);
        for (let i = shuffledFamilies.length - 1; i > 0; i--) {
            const j = Math.floor(weekRand() * (i + 1));
            [shuffledFamilies[i], shuffledFamilies[j]] = [shuffledFamilies[j], shuffledFamilies[i]];
        }
        const spotlightFamilies = new Set(shuffledFamilies.slice(0, WEEKLY_SPOTLIGHT_COUNT));

        // 3. Apply boosts and tag weekly picks
        for (const p of products) {
            const fam = getModelFamily(p);
            // Remove any previous weekly tag
            p._weeklyPick = false;
            if (spotlightFamilies.has(fam)) {
                // Give a graded boost: best colorway gets full boost, others get partial
                const familyBoost = WEEKLY_BOOST_MAX * (0.5 + weeklyRandForProduct(p.id, CURRENT_WEEK) * 0.5);
                p._weeklyScore = (p.trendingScore || 0) + Math.round(familyBoost);
                p._weeklyPick = true;
            } else {
                p._weeklyScore = p.trendingScore || 0;
            }
        }

        return spotlightFamilies;
    }

    function init() {
        // Step 1: Apply weekly boosts (modifies _weeklyScore and _weeklyPick on each product)
        const spotlightFamilies = applyWeeklyBoosts(state.allProducts);

        // Step 2: Temporarily swap trendingScore with _weeklyScore for sorting purposes
        state.allProducts.forEach(p => { p._origScore = p.trendingScore; p.trendingScore = p._weeklyScore || p.trendingScore; });

        // Step 3: Apply diversity-aware sort with the boosted scores
        state.allProducts = diversitySort(state.allProducts);

        // Step 4: Restore original scores (keep _weeklyPick flag for badge rendering)
        state.allProducts.forEach(p => { p.trendingScore = p._origScore; });

        state.filteredProducts = [...state.allProducts];

        // Pre-filter from URL param: products.html?category=Sneakers
        const urlParams = new URLSearchParams(window.location.search);
        const preCategory = urlParams.get('category');
        if (preCategory) {
            state.selectedCategories.add(preCategory);
            state.filteredProducts = state.allProducts.filter(p => p.category === preCategory);
        }

        renderFilters();
        renderWeeklyBanner();
        renderProductGrid(true); // Initial render
        setupInfiniteScroll();
        setupMobileControls();
    }

    /** Renders a subtle weekly picks banner above the grid */
    function renderWeeklyBanner() {
        const existingBanner = document.getElementById('weeklyPicksBanner');
        if (existingBanner) existingBanner.remove();

        // Count how many weekly picks are in the first page
        const weeklyCount = state.allProducts.filter(p => p._weeklyPick).length;
        if (weeklyCount === 0) return;

        // Calculate days until next Monday
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
        const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7 || 7;
        const nextReset = new Date(now);
        nextReset.setDate(now.getDate() + daysUntilMonday);
        const resetStr = nextReset.toLocaleDateString(T.dateLocale, { weekday: 'long', month: 'short', day: 'numeric' });

        const banner = document.createElement('div');
        banner.id = 'weeklyPicksBanner';
        banner.style.cssText = [
            'grid-column: 1 / -1',
            'display: flex',
            'align-items: center',
            'justify-content: space-between',
            'gap: 1rem',
            'padding: 1rem 1.5rem',
            'background: linear-gradient(135deg, rgba(255,85,0,0.12) 0%, rgba(255,140,0,0.08) 100%)',
            'border: 1px solid rgba(255,85,0,0.3)',
            'border-radius: 1rem',
            'margin-bottom: 0.5rem',
            'flex-wrap: wrap',
        ].join(';');

        banner.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:36px;height:36px;border-radius:50%;background:var(--clr-orange);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fa-solid fa-fire" style="color:#fff;font-size:0.9rem;"></i>
                </div>
                <div>
                    <div style="font-weight:800;font-size:0.95rem;color:#fff;">
                        ${T.weekLabel} ${WEEK_OF_YEAR} &mdash; ${T.bannerTitle}
                    </div>
                    <div style="font-size:0.78rem;color:#aaa;margin-top:2px;">
                        ${T.bannerSub} &bull; ${T.nextRotation} <strong style="color:var(--clr-orange);">${resetStr}</strong>
                    </div>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;background:rgba(255,85,0,0.15);padding:0.4rem 0.9rem;border-radius:2rem;border:1px solid rgba(255,85,0,0.25);">
                <i class="fa-solid fa-rotate" style="color:var(--clr-orange);font-size:0.8rem;"></i>
                <span style="font-size:0.8rem;font-weight:700;color:var(--clr-orange);">${T.autoUpdates}</span>
            </div>
        `;

        const grid = document.getElementById('productsGrid');
        if (grid) grid.before(banner);
    }

    /**
     * Extract unique attributes and their counts
     */
    function getFilterData() {
        const categories = {};
        const brands = {};

        state.allProducts.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
            if (p.brand) {
                brands[p.brand] = (brands[p.brand] || 0) + 1;
            }
        });

        return {
            categories: Object.entries(categories).sort((a, b) => b[1] - a[1]),
            brands: Object.entries(brands).sort((a, b) => b[1] - a[1])
        };
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function jsStringAttr(value) {
        return escapeHtml(JSON.stringify(String(value || '')));
    }

    /**
     * Render the sidebar filter groups
     */
    function renderFilters() {
        const data = getFilterData();
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3 class="filter-title" style="margin:0; display: block; color: #fff;">Filters</h3>
                
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <button class="btn-clear-filters" 
                            style="display: ${state.selectedCategories.size > 0 || state.selectedBrands.size > 0 ? 'block' : 'none'}; margin: 0;"
                            onclick="window.clearAllFilters()">
                        Clear All
                    </button>
                    <button class="qty-btn mobile-only" id="closeFilters" style="width:32px; height:32px;"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>

            <div class="filter-group ${state.collapsedGroups.has('cat-group') ? 'collapsed' : ''}" id="cat-group">
                <h4 class="filter-title" onclick="window.toggleFilterGroup('cat-group')">
                    Category <i class="fa-solid fa-chevron-down"></i>
                </h4>
                <div class="filter-options">
                    ${data.categories.map(([name, count]) => `
                        <div class="filter-option ${state.selectedCategories.has(name) ? 'active' : ''}" 
                             onclick="window.toggleFilter('category', ${jsStringAttr(name)})">
                            <span class="filter-name">${escapeHtml(name)}</span>
                            <span class="filter-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="filter-group ${state.collapsedGroups.has('brand-group') ? 'collapsed' : ''}" id="brand-group">
                <h4 class="filter-title" onclick="window.toggleFilterGroup('brand-group')">
                    Brand <i class="fa-solid fa-chevron-down"></i>
                </h4>
                <div class="filter-options">
                    ${data.brands.map(([name, count]) => `
                        <div class="filter-option ${state.selectedBrands.has(name) ? 'active' : ''}" 
                             onclick="window.toggleFilter('brand', ${jsStringAttr(name)})">
                            <span class="filter-name">${escapeHtml(name)}</span>
                            <span class="filter-count">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        sidebarContainer.innerHTML = html;

        // Re-attach mobile close listener after render
        const closeBtn = document.getElementById('closeFilters');
        if (closeBtn) closeBtn.onclick = () => sidebarContainer.classList.remove('active');
    }

    /**
     * Render the product grid (incremental)
     */
    function renderProductGrid(reset = false) {
        if (reset) {
            state.visibleCount = 24; // Reset to first page
            gridContainer.innerHTML = '';
        }

        const toShow = state.filteredProducts.slice(
            reset ? 0 : gridContainer.children.length, 
            state.visibleCount
        );

        // Add Active Filter Status
        if (reset) {
            const hasFilters = state.selectedCategories.size > 0 || state.selectedBrands.size > 0;
            const filterHeaderHtml = hasFilters ? `
                <div class="filter-status-header" style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.2); border-radius: 0.75rem; margin-bottom: 2rem;">
                    <div style="font-size: 0.9rem; font-weight: 600;">
                        <i class="fa-solid fa-filter" style="margin-right: 0.5rem; color: var(--clr-orange);"></i>
                        Showing ${state.filteredProducts.length} matching products
                    </div>
                </div>
            ` : '';
            gridContainer.innerHTML = filterHeaderHtml;
        }

        if (reset && toShow.length === 0) {
            gridContainer.innerHTML += `
                <div class="empty-state text-center" style="grid-column: 1 / -1; padding: 4rem; background: var(--clr-bg-surface); border: 1px dashed var(--clr-border); border-radius: 1rem;">
                    <h3 style="color: #fff; margin-bottom: 0.5rem;"><i class="fa-solid fa-magnifying-glass" style="margin-right: 0.5rem;"></i> No matches found</h3>
                    <p class="text-muted">Try adjusting your filters to see more products.</p>
                </div>
            `;
            return;
        }

        const batchHtml = toShow.map(p => {
            const meta = window.ProductMeta.get(p);
            // Badge logic: weekly picks get a special "This Week" badge (translated)
            let badge = '';
            if (p._weeklyPick) {
                badge = `<div class="pc-badge" style="background: linear-gradient(135deg, #ff5500 0%, #ff8c00 100%); display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-fire" style="font-size:0.65rem;"></i> ${T.badgeThisWeek}</div>`;
            } else if (p.featured) {
                badge = `<div class="pc-badge">${T.badgeTrending}</div>`;
            } else if (meta.isNew) {
                badge = `<div class="pc-badge badge-new">${T.badgeNew}</div>`;
            }
            return `
            <div class="product-card-v2" onclick="window.location.href='product.html?id=${p.id}'">
                ${badge}
                <div class="pc-img">
                    ${window.ImageAdapter.renderImage(p, 'thumbnail')}
                </div>
                <div class="pc-body">
                    <div class="pc-cat">${p.category}</div>
                    <h3 class="pc-name">${p.name}</h3>
                    <div class="pc-meta">
                        <span class="pc-eta"><i class="fa-solid fa-truck-fast"></i> ${meta.eta}</span>
                    </div>
                </div>
                <button class="pc-cta" onclick="event.stopPropagation(); window.addToEstimate(${p.id}, 'product', this);">
                    <i class="fa-solid fa-plus"></i> Add to quote
                </button>
            </div>`;
        }).join('');

        if (reset) {
            gridContainer.innerHTML = batchHtml;
        } else {
            gridContainer.insertAdjacentHTML('beforeend', batchHtml);
        }


        // Hide sentinel if all items loaded
        if (state.visibleCount >= state.filteredProducts.length) {
            sentinel.style.display = 'none';
        } else {
            sentinel.style.display = 'flex';
        }
    }

    /**
     * Infinite Scroll Setup
     */
    function setupInfiniteScroll() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && state.visibleCount < state.filteredProducts.length) {
                // Remove delay for faster "pop up"
                state.visibleCount += state.pageSize;
                renderProductGrid(false);
            }
        }, {
            rootMargin: '600px' // Load much earlier for smoother experience
        });

        observer.observe(sentinel);
    }

    /**
     * Mobile Menu Setup
     */
    function setupMobileControls() {
        if (mobileFilterBtn) {
            mobileFilterBtn.onclick = () => {
                sidebarContainer.classList.add('active');
            };
        }
    }

    /**
     * Filter Toggle UI Logic
     */
    window.toggleFilterGroup = (groupId) => {
        if (state.collapsedGroups.has(groupId)) {
            state.collapsedGroups.delete(groupId);
        } else {
            state.collapsedGroups.add(groupId);
        }
        renderFilters();
    };

    /**
     * Filter Data Logic
     */
    window.toggleFilter = (type, value) => {
        const targetSet = type === 'category' ? state.selectedCategories : state.selectedBrands;
        
        if (targetSet.has(value)) {
            targetSet.delete(value);
        } else {
            targetSet.add(value);
        }

        applyFilters();
    };

    function applyFilters() {
        state.filteredProducts = state.allProducts.filter(p => {
            const catMatch = state.selectedCategories.size === 0 || state.selectedCategories.has(p.category);
            const brandMatch = state.selectedBrands.size === 0 || state.selectedBrands.has(p.brand);
            return catMatch && brandMatch;
        });

        renderFilters();
        renderProductGrid(true); // Reset grid to top with filters
    }

    window.clearAllFilters = () => {
        state.selectedCategories.clear();
        state.selectedBrands.clear();
        applyFilters();
    };

    // Run
    init();

});
