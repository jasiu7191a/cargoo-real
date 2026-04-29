// Search Logic and Query Adapter
// Uses Advanced Ranking Algorithm for Aliases and Keywords

const SearchAPI = {
    debounce: function (func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    query: async function(searchTerm) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = this._performSearch(searchTerm);
                resolve(results);
            }, 150); // Network delay simulation
        });
    },

    _performSearch: function(term) {
        const query = term.toLowerCase().trim();
        const catalog = window.SearchCatalog;

        if (!query) return null;

        // Advanced Scoring Algorithm Based on Requirements:
        // 1. exact title match (1000)
        // 2. exact alias match (900)
        // 3. startsWith title (800)
        // 4. startsWith alias (700)
        // 5. keyword match (600)
        // 6. contains title (500)
        // 7. contains alias (400)
        // 8. contains keyword (300)
        // + tie-breaker: trendingScore
        
        const scoreItem = (item) => {
            let maxScore = 0;
            const name = (item.name || item.text || '').toLowerCase();
            const aliases = (item.aliases || []).map(a => a.toLowerCase());
            const keywords = (item.keywords || []).map(k => k.toLowerCase());
            
            // Evaluator Helper
            const assign = (val) => { if(val > maxScore) maxScore = val; };

            // 1 & 3 & 8. Title checks
            if (name === query) assign(1000);
            else if (name.startsWith(query)) assign(800);
            else if (name.includes(query)) assign(500);

            // 2 & 4 & 9. Alias checks
            aliases.forEach(alias => {
                if (alias === query) assign(900);
                else if (alias.startsWith(query)) assign(700);
                else if (alias.includes(query)) assign(400);
            });

            // 5 & 10. Keyword checks
            keywords.forEach(kw => {
                if (kw === query) assign(600);
                else if (kw.includes(query)) assign(300);
            });
            
            // 6. Brand check
            if (item.brandSlug && item.brandSlug === query) assign(550);

            // 7. Category check
            if (item.categorySlug && item.categorySlug === query) assign(525);

            return maxScore;
        };

        const getResults = (dataList, limit = 4) => {
            return dataList
                .map(item => ({ item, score: scoreItem(item) }))
                .filter(res => res.score > 0)
                .sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    // Tie breaker
                    const tB = b.item.trendingScore || 0;
                    const tA = a.item.trendingScore || 0;
                    return tB - tA;
                })
                .map(res => res.item)
                .slice(0, limit);
        };

        return {
            products: getResults(catalog.products, 60), // Increased for standalone search page (was 12)
            brands: getResults(catalog.brands, 8),      // Increased for better variety (was 4)
            categories: getResults(catalog.categories, 4),
            suggestions: getResults(catalog.suggestions, 6)  // Up to 6 autocomplete suggestions
        };
    },

    getBrandBySlug: function(slug) {
        return window.SearchCatalog.brands.find(b => b.slug === slug);
    },

    getProductsByBrandId: function(brandId) {
        return window.SearchCatalog.products.filter(p => p.brandId === brandId);
    },

    getCategoryBySlug: function(slug) {
        return window.SearchCatalog.categories.find(c => c.slug === slug);
    },

    getProductById: function(id) {
        return window.SearchCatalog.products.find(p => p.id == id);
    },

    getRelatedProducts: function(product, limit = 4) {
        if (!product) return [];
        // Match same brand or category, exclude self
        return window.SearchCatalog.products
            .filter(p => p.id !== product.id && (p.brandId === product.brandId || p.categoryId === product.categoryId))
            .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
            .slice(0, limit);
    },

    getProductsByCategoryId: function(categoryId) {
        return window.SearchCatalog.products.filter(p => p.categoryId === categoryId);
    },

    getEmptyState: async function() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    trending: window.SearchCatalog.trending,
                    popularBrands: window.SearchCatalog.popularBrands,
                    suggestions: window.SearchCatalog.suggestions   // All 56 for the chip grid
                });
            }, 50);
        });
    }
};

window.SearchAPI = SearchAPI;
